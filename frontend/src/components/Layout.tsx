import React from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  CloudUpload as UploadIcon,
  Search as SearchIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const drawerWidth = 280; // Slightly wider for elegance

const menuItems = [
  { text: 'Collections', icon: <DashboardIcon />, path: '/' },
  { text: 'Document Processing', icon: <UploadIcon />, path: '/upload' },
  { text: 'Archives & Search', icon: <SearchIcon />, path: '/search' },
  { text: 'Chat', icon: <ChatIcon />, path: '/chat' },
];

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* Top App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
        }}
      >
        <Toolbar>
           {/* Minimalist Header */}
          <Typography variant="h6" noWrap component="div" sx={{ color: 'text.primary', fontStyle: 'italic' }}>
            Orchestrator Control Panel
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: 'none', // Strict border removal
            border: 'none',
            bgcolor: '#1b263b',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: 'rgba(0,0,0,0.2)' }}>
           <Typography variant="h5" sx={{ color: '#c1a367', letterSpacing: '0.1em', mb: 0.5 }}>
             RAG
           </Typography>
           <Typography variant="caption" sx={{ color: '#8d99ae', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
             Enterprise Edition
           </Typography>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <List sx={{ mt: 2, px: 2 }}>
          {menuItems.map((item) => {
             const isSelected = location.pathname === item.path;
             return (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 1,
                    transition: 'all 0.2s',
                    py: 1.5,
                    border: isSelected ? '1px solid #c1a367' : '1px solid transparent',
                    backgroundColor: isSelected ? 'rgba(193, 163, 103, 0.1) !important' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255,255,255,0.2)'
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isSelected ? '#c1a367' : '#94a3b8', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                        fontFamily: isSelected ? '"Playfair Display", serif' : '"Lato", sans-serif',
                        fontSize: '0.95rem',
                        fontWeight: isSelected ? 600 : 400,
                        color: isSelected ? '#c1a367' : '#e2e8f0'
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        <Box sx={{ mt: 'auto', p: 3, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#5c677d', fontStyle: 'italic' }}>
                Est. 2026
            </Typography>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 4,
          minHeight: '100vh',
        }}
      >
        <Toolbar /> {/* Spacer for fixed AppBar */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;