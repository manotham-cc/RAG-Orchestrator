import React, { useEffect, useState } from 'react';
import {
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  Paper,
  Stack,
  TextField,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, InsertDriveFile as FileIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import api from '../api';

interface Collection {
  name: string;
}

const steps = ['Parsing Document', 'Chunking Text', 'Embedding Vectors', 'Indexing Data'];

const Upload: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [docType, setDocType] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await api.get<Collection[]>('/collections');
        setCollections(response.data);
      } catch (err) {
        console.error('Error fetching collections:', err);
      }
    };
    fetchCollections();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedCollection) {
      setMessage({ type: 'error', text: 'Please select a collection and a file.' });
      return;
    }

    setUploading(true);
    setActiveStep(0);
    setProgressMessage('Starting upload...');
    setMessage(null);

    const formData = new FormData();
    formData.append('collection_name', selectedCollection);
    formData.append('file', file);
    if (docType.trim()) {
      formData.append('doc_type', docType.trim());
    }

    try {
      // Use fetch directly to handle streaming response
      const response = await fetch('http://localhost:8000/api/v1/documents/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
         throw new Error(`Upload failed with status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          
          // Process all complete lines
          buffer = lines.pop() || ''; // Keep the incomplete line in buffer

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const data = JSON.parse(line);
              
              if (data.status === 'progress') {
                setProgressMessage(data.message);
                if (data.step === 'parsing') setActiveStep(0);
                else if (data.step === 'chunking') setActiveStep(1);
                else if (data.step === 'embedding') setActiveStep(2);
                else if (data.step === 'upserting') setActiveStep(3);
              } else if (data.status === 'success') {
                setActiveStep(4);
                setMessage({ type: 'success', text: `Successfully processed ${data.filename}` });
                setFile(null);
                setDocType('');
              } else if (data.status === 'error') {
                 throw new Error(data.message);
              }
            } catch (e) {
              console.error('Error parsing JSON chunk', e);
            }
          }
        }
      }

    } catch (err: any) {
      console.error('Upload error:', err);
      setMessage({
        type: 'error',
        text: err.message || 'Failed to upload document.',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Document Processing
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Upload PDF, DOCX, or Image files to be parsed, chunked, and embedded into your vector database.
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        {/* Left Column: Configuration */}
        <Paper sx={{ p: 3, flex: 1, minHeight: 300 }}>
          <Typography variant="h6" gutterBottom>
            1. Select Target
          </Typography>
          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth>
                <InputLabel id="collection-select-label">Collection</InputLabel>
                <Select
                    labelId="collection-select-label"
                    value={selectedCollection}
                    label="Collection"
                    onChange={(e) => setSelectedCollection(e.target.value)}
                >
                    {collections.map((col) => (
                    <MenuItem key={col.name} value={col.name}>
                        {col.name}
                    </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <TextField
                fullWidth
                label="Document Type (Optional)"
                placeholder="e.g. Invoice, Manual, Contract"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                helperText="Used for filtering search results."
                sx={{ mt: 3 }}
            />
          </Box>
          <Box sx={{ mt: 4 }}>
              <Typography variant="body2" color="text.secondary">
                  Files will be processed using Docling for OCR and layout analysis, then embedded using BGE-M3 model.
              </Typography>
          </Box>
        </Paper>

        {/* Right Column: Upload Area */}
        <Paper 
            sx={{ 
                p: 3, 
                flex: 2, 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                border: '2px dashed #cbd5e1',
                bgcolor: 'grey.50'
            }}
        >
             <Typography variant="h6" gutterBottom>
                2. Upload File
            </Typography>
            
            <input
                accept="application/pdf,image/*,.docx,.pptx"
                style={{ display: 'none' }}
                id="raised-button-file"
                type="file"
                onChange={handleFileChange}
            />
            <label htmlFor="raised-button-file">
                <Button 
                    variant="outlined" 
                    component="span" 
                    startIcon={<CloudUploadIcon />}
                    size="large"
                    sx={{ mt: 2, px: 4, py: 2 }}
                    disabled={uploading}
                >
                    Choose File
                </Button>
            </label>

            {file && (
                <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1, p: 1, border: '1px solid #e2e8f0', borderRadius: 1, bgcolor: 'white' }}>
                    <FileIcon color="action" />
                    <Typography variant="body1">{file.name}</Typography>
                </Box>
            )}

            {uploading && (
                <Box sx={{ width: '100%', mt: 4 }}>
                    <Stepper activeStep={activeStep} alternativeLabel>
                        {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                        ))}
                    </Stepper>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2, gap: 2 }}>
                        <CircularProgress size={20} />
                        <Typography variant="body2" color="primary">{progressMessage}</Typography>
                    </Box>
                </Box>
            )}
             
             <Box sx={{ mt: 4, width: '100%' }}>
                {message && (
                    <Alert severity={message.type} sx={{ mb: 2 }}>
                    {message.text}
                    </Alert>
                )}
                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleUpload}
                    disabled={uploading || !file || !selectedCollection}
                    size="large"
                >
                    {uploading ? 'Processing...' : 'Start Processing'}
                </Button>
            </Box>

        </Paper>
      </Stack>
    </Box>
  );
};

export default Upload;