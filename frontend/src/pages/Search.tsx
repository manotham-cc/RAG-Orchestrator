import React, { useEffect, useState } from 'react';
import {
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Card,
  CardContent,
  Chip,
  Slider,
  Paper,
  Stack,
  Divider,
} from '@mui/material';
import { 
    Search as SearchIcon, 
    FilterList as FilterIcon
} from '@mui/icons-material';
import api from '../api';

interface SearchResult {
  id: string;
  score: number;
  payload: {
    text_chunk?: string;
    text?: string;
    file_path?: string;
    doc_type?: string;
    [key: string]: any;
  };
}

interface Collection {
  name: string;
}

interface FilterOption {
  name: string;
  count: number;
}

const Search: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [threshold, setThreshold] = useState<number>(0.5);
  const [topK, setTopK] = useState<number>(3);
  
  // Filter States
  const [availableDocTypes, setAvailableDocTypes] = useState<FilterOption[]>([]);
  const [selectedDocType, setSelectedDocType] = useState<string>('');

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

  // Fetch filters when collection changes
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
    setSelectedDocType(''); // Reset filter when collection changes
  }, [selectedCollection]);

  const handleSearch = async () => {
    if (!selectedCollection || !query.trim()) return;

    setLoading(true);
    try {
      let response;
      if (selectedDocType) {
        // Use Filtered Search
        response = await api.post('/search/filter', {
            collection_name: selectedCollection,
            query: query,
            filter_key: "type", // Matches payload key in helpers.py
            filter_value: selectedDocType,
            limit: topK,
            score_threshold: threshold,
            ask_ai: false
        });
      } else {
        // Use Standard Search
        response = await api.post('/search', {
            collection_name: selectedCollection,
            query: query,
            limit: topK,
            score_threshold: threshold,
            ask_ai: false
        });
      }
      setResults(response.data.results);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
            Semantic Search
        </Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ flexGrow: 1, overflow: 'hidden' }}>
            {/* Filters Sidebar (Left) */}
            <Paper sx={{ width: { xs: '100%', md: 300 }, p: 3, flexShrink: 0 }}>
                <Stack spacing={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FilterIcon color="primary" />
                        <Typography variant="h6">Filters</Typography>
                    </Box>
                    <Divider />
                    
                    <FormControl fullWidth size="small">
                        <InputLabel>Target Collection</InputLabel>
                        <Select
                            value={selectedCollection}
                            label="Target Collection"
                            onChange={(e) => setSelectedCollection(e.target.value)}
                        >
                            {collections.map((col) => (
                            <MenuItem key={col.name} value={col.name}>
                                {col.name}
                            </MenuItem>
                            ))}
                        </Select>
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
                        <Typography gutterBottom variant="body2">Max Results (Top K): {topK}</Typography>
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
                        <Typography gutterBottom variant="body2">Similarity Threshold: {threshold}</Typography>
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
            </Paper>

            {/* Main Search Area (Right) */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                 {/* Search Bar */}
                 <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        fullWidth
                        placeholder="Search for keywords..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        variant="outlined"
                        size="medium"
                        InputProps={{
                            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                        }}
                    />
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleSearch}
                        disabled={loading || !selectedCollection || !query}
                        sx={{ px: 4, height: 56 }}
                        startIcon={<SearchIcon />}
                        color='primary'
                    >
                        {loading ? '...' : 'Search'}
                    </Button>
                 </Paper>

                 {/* Results List - Scrollable */}
                 <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
                    <Stack spacing={2}>
                        {results.map((result) => (
                        <Card key={result.id} variant="outlined">
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {result.payload.doc_type && (
                                            <Chip label={result.payload.doc_type} size="small" color="primary" variant="outlined" />
                                        )}
                                        {result.payload.file_path && (
                                            <Chip label={result.payload.file_path} size="small" variant="outlined" />
                                        )}
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ bgcolor: 'grey.100', px: 1, borderRadius: 1 }}>
                                        Score: {result.score.toFixed(4)}
                                    </Typography>
                                </Box>
                                <Typography variant="body1" sx={{ mt: 1, lineHeight: 1.6 }}>
                                    {result.payload.text_chunk || result.payload.text || 'No text content'}
                                </Typography>
                            </CardContent>
                        </Card>
                        ))}
                        {results.length === 0 && !loading && (
                            <Box sx={{ textAlign: 'center', mt: 8, opacity: 0.6 }}>
                                <SearchIcon sx={{ fontSize: 60, color: 'grey.300' }} />
                                <Typography variant="h6" color="text.secondary">No results found</Typography>
                                <Typography variant="body2" color="text.secondary">Try selecting a collection and typing a query.</Typography>
                            </Box>
                        )}
                    </Stack>
                 </Box>
            </Box>
        </Stack>
    </Box>
  );
};

export default Search;