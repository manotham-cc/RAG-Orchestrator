import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import api from '../api';

interface Collection {
  name: string;
  points_count: number;
  status: string;
}

const Collections: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [open, setOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = async () => {
    try {
      const response = await api.get<Collection[]>('/collections');
      setCollections(response.data);
    } catch (err) {
      console.error('Error fetching collections:', err);
      setError('Failed to load collections.');
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleCreate = async () => {
    if (!newCollectionName.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await api.post('/collections', {
        name: newCollectionName,
        vector_size: 1024,
        distance_mode: 'cosine',
      });
      setNewCollectionName('');
      setOpen(false);
      fetchCollections();
    } catch (err) {
      console.error('Error creating collection:', err);
      setError('Failed to create collection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Vector Collections
        </Typography>
        <Box>
          <Tooltip title="Refresh List">
            <IconButton onClick={fetchCollections} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
          >
            New Collection
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Points Count</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {collections.map((row) => (
              <TableRow
                key={row.name}
                sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'grey.50' } }}
              >
                <TableCell component="th" scope="row" sx={{ fontSize: '1rem' }}>
                  {row.name}
                </TableCell>
                <TableCell align="right">
                    <Chip label={row.points_count} size="small" variant="outlined" />
                </TableCell>
                <TableCell align="right">
                    <Chip 
                        label={row.status} 
                        color={row.status === 'green' ? 'success' : 'default'} 
                        size="small" 
                    />
                </TableCell>
                <TableCell align="right">
                    <Button size="small" variant="text" color="primary">Inspect</Button>
                </TableCell>
              </TableRow>
            ))}
            {collections.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No collections found. Create one to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Collection</DialogTitle>
        <DialogContent>
            <Box sx={{ mt: 1 }}>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Collection Name"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    helperText="Use lowercase alphanumeric characters and underscores."
                />
            </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading} variant="contained">
            {loading ? 'Creating...' : 'Create Collection'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Collections;