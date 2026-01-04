import React, { useEffect, useState, useRef } from 'react';
import {
  Typography,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Paper,
  Stack,
  Divider,
  Slider,
  Avatar,
  CircularProgress,
  InputAdornment,
  Container,
  Fade
} from '@mui/material';
import { 
    Send as SendIcon,
    AutoAwesome as BotIcon,
    Person as PersonIcon,
    Settings as SettingsIcon,
    Tune as TuneIcon
} from '@mui/icons-material';
import api from '../api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Collection {
  name: string;
}

interface FilterOption {
  name: string;
  count: number;
}

const Chat: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [threshold, setThreshold] = useState<number>(0.5);
  const [topK, setTopK] = useState<number>(3);
  
  // Filter States
  const [availableDocTypes, setAvailableDocTypes] = useState<FilterOption[]>([]);
  const [selectedDocType, setSelectedDocType] = useState<string>('');

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

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

  useEffect(() => {
    if (!selectedCollection) {
        setAvailableDocTypes([]);
        return;
    }
    const fetchFilters = async () => {
        try {
            const response = await api.get<FilterOption[]>(`/collections/${selectedCollection}/filters`);
            setAvailableDocTypes(response.data);
        } catch (err) {
            console.error('Error fetching filters:', err);
        }
    };
    fetchFilters();
    setSelectedDocType('');
  }, [selectedCollection]);

  const handleSend = async () => {
    if (!selectedCollection || !input.trim()) return;

    const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: input
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      let response;
      if (selectedDocType) {
        response = await api.post('/search/filter', {
            collection_name: selectedCollection,
            query: userMessage.content,
            filter_key: "type",
            filter_value: selectedDocType,
            limit: topK,
            score_threshold: threshold,
            ask_ai: true
        });
      } else {
        response = await api.post('/search', {
            collection_name: selectedCollection,
            query: userMessage.content,
            limit: topK,
            score_threshold: threshold,
            ask_ai: true
        });
      }

      const aiAnswer = response.data.answer || "I couldn't generate an answer based on the provided context.";
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiAnswer
      };
      setMessages(prev => [...prev, botMessage]);

    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error while processing your request."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden', bgcolor: '#fff' }}>
        
        {/* Left Sidebar - Configuration (ChatGPT style sidebar) */}
        <Paper 
            elevation={0}
            sx={{ 
                width: 280, 
                borderRight: '1px solid #e0e0e0', 
                bgcolor: '#f9f9f9',
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                height: '100%'
            }}
        >
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TuneIcon fontSize="small" color="action" /> Configuration
                </Typography>
            </Box>
            
            <Box sx={{ p: 3, overflowY: 'auto', flexGrow: 1 }}>
                <Stack spacing={4}>
                    <FormControl fullWidth size="small">
                        <InputLabel id="collection-label">Collection</InputLabel>
                        <Select
                            labelId="collection-label"
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
                        {!selectedCollection && (
                             <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                                * Required
                             </Typography>
                        )}
                    </FormControl>

                    <FormControl fullWidth size="small" disabled={!selectedCollection || availableDocTypes.length === 0}>
                        <InputLabel>Document Type</InputLabel>
                        <Select
                            value={selectedDocType}
                            label="Document Type"
                            onChange={(e) => setSelectedDocType(e.target.value)}
                        >
                            <MenuItem value="">
                                <em>All Types</em>
                            </MenuItem>
                            {availableDocTypes.map((opt) => (
                            <MenuItem key={opt.name} value={opt.name}>
                                {opt.name} ({opt.count})
                            </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box>
                        <Typography gutterBottom variant="body2" color="text.secondary">Context Limit (Top K): {topK}</Typography>
                        <Slider
                            value={topK}
                            min={1}
                            max={20}
                            step={1}
                            onChange={(_, newValue) => setTopK(newValue as number)}
                            valueLabelDisplay="auto"
                            size="small"
                        />
                    </Box>

                    <Box>
                        <Typography gutterBottom variant="body2" color="text.secondary">Similarity Threshold: {threshold}</Typography>
                        <Slider
                            value={threshold}
                            min={0}
                            max={1}
                            step={0.05}
                            onChange={(_, newValue) => setThreshold(newValue as number)}
                            valueLabelDisplay="auto"
                            size="small"
                        />
                    </Box>
                </Stack>
            </Box>
            
            <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                    RAG Orchestrator v1.0
                </Typography>
            </Box>
        </Paper>

        {/* Main Chat Area */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
            
            {/* Messages Container */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', px: { xs: 2, md: 5 }, pt: 4, pb: 15 }}>
                <Container maxWidth="md">
                    {messages.length === 0 ? (
                        <Fade in={true} timeout={800}>
                            <Box sx={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                height: '60vh', 
                                opacity: 0.8 
                            }}>
                                <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', mb: 2 }}>
                                    <BotIcon fontSize="large" />
                                </Avatar>
                                <Typography variant="h4" fontWeight="bold" gutterBottom color="text.primary">
                                    How can I help you today?
                                </Typography>
                                <Typography variant="body1" color="text.secondary" align="center" sx={{ maxWidth: 500 }}>
                                    Select a collection from the sidebar and start asking questions about your documents.
                                </Typography>
                            </Box>
                        </Fade>
                    ) : (
                        <Stack spacing={4}>
                            {messages.map((msg) => (
                                <Box 
                                    key={msg.id} 
                                    sx={{ 
                                        display: 'flex', 
                                        gap: 2,
                                        flexDirection: 'row'
                                    }}
                                >
                                    <Avatar 
                                        sx={{ 
                                            width: 32, 
                                            height: 32, 
                                            bgcolor: msg.role === 'assistant' ? 'secondary.main' : 'transparent',
                                            color: msg.role === 'assistant' ? 'white' : 'text.disabled',
                                            mt: 0.5
                                        }}
                                    >
                                        {msg.role === 'assistant' ? <BotIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
                                    </Avatar>
                                    
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography 
                                            variant="subtitle2" 
                                            fontWeight={700} 
                                            sx={{ mb: 0.5, color: 'text.primary' }}
                                        >
                                            {msg.role === 'user' ? 'You' : 'Assistant'}
                                        </Typography>
                                        <Typography 
                                            variant="body1" 
                                            sx={{ 
                                                whiteSpace: 'pre-wrap', 
                                                lineHeight: 1.7,
                                                color: 'text.primary'
                                            }}
                                        >
                                            {msg.content}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                            
                            {loading && (
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Avatar 
                                        sx={{ 
                                            width: 32, 
                                            height: 32, 
                                            bgcolor: 'secondary.main',
                                            mt: 0.5
                                        }}
                                    >
                                        <CircularProgress size={16} sx={{ color: 'white' }} />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>Assistant</Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                            Thinking...
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                            <div ref={messagesEndRef} />
                        </Stack>
                    )}
                </Container>
            </Box>

            {/* Input Floating Bar */}
            <Box 
                sx={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    p: 3, 
                    background: 'linear-gradient(to top, #ffffff 80%, rgba(255,255,255,0) 100%)' 
                }}
            >
                <Container maxWidth="md">
                    <Paper 
                        elevation={4} 
                        sx={{ 
                            p: '2px 4px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            borderRadius: 8,
                            bgcolor: '#f4f4f4',
                            border: '1px solid transparent',
                            '&:hover': {
                                border: '1px solid #d0d0d0'
                            },
                            transition: 'all 0.2s'
                        }}
                    >
                         <TextField
                            fullWidth
                            placeholder={selectedCollection ? "Message RAG Assistant..." : "Please select a collection first..."}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
                            variant="standard"
                            disabled={!selectedCollection || loading}
                            InputProps={{
                                disableUnderline: true,
                                sx: { px: 3, py: 1.5 }
                            }}
                            sx={{ flex: 1 }}
                        />
                        <Box sx={{ p: 1 }}>
                            <IconButton 
                                onClick={handleSend} 
                                disabled={!input.trim() || loading || !selectedCollection}
                                sx={{ 
                                    bgcolor: input.trim() ? 'primary.main' : 'grey.300', 
                                    color: 'white',
                                    '&:hover': { bgcolor: 'primary.dark' },
                                    width: 40,
                                    height: 40
                                }}
                            >
                                {loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon fontSize="small" />}
                            </IconButton>
                        </Box>
                    </Paper>
                    <Typography variant="caption" display="block" align="center" color="text.secondary" sx={{ mt: 1 }}>
                        RAG Assistant can make mistakes. Consider checking important information.
                    </Typography>
                </Container>
            </Box>
        </Box>
    </Box>
  );
};

export default Chat;