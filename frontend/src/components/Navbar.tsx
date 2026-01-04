import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            RAG SCB Orchestrator
          </Typography>
          <Button color="inherit" component={RouterLink} to="/">
            Collections
          </Button>
          <Button color="inherit" component={RouterLink} to="/upload">
            Upload
          </Button>
          <Button color="inherit" component={RouterLink} to="/search">
            Search
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
