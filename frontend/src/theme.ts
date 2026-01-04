import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1b263b', // Deep Navy / Midnight Blue
      light: '#415a77',
      dark: '#0d1b2a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#c1a367', // Antique Gold / Bronze
      light: '#e0c388',
      dark: '#8f7645',
      contrastText: '#000000',
    },
    background: {
      default: '#fdfbf7', // Cream / Paper-like off-white
      paper: '#ffffff',
    },
    text: {
      primary: '#1b263b', // Dark Navy text instead of pure black
      secondary: '#5c677d',
    },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Playfair Display", "Times New Roman", serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Playfair Display", "Times New Roman", serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: '"Playfair Display", "Times New Roman", serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Playfair Display", "Times New Roman", serif',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    h5: {
      fontFamily: '"Playfair Display", "Times New Roman", serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Playfair Display", "Times New Roman", serif',
      fontWeight: 500,
      letterSpacing: '0.05em',
    },
    subtitle1: {
        fontFamily: '"Playfair Display", "Times New Roman", serif',
        fontStyle: 'italic',
    },
    button: {
      fontFamily: '"Lato", sans-serif',
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase', // Classic feel
    },
  },
  shape: {
    borderRadius: 2, // Sharp corners
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#415a77 #fdfbf7',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: '#415a77',
            border: '2px solid transparent',
            backgroundClip: 'content-box',
          },
          '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#1b263b',
          },
          '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
             backgroundColor: 'transparent',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: '1px solid transparent',
          padding: '8px 24px',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&:hover': {
            backgroundColor: '#2c3e50', // Slightly lighter navy
          },
        },
        outlined: {
          borderWidth: '1px',
          borderColor: '#1b263b',
          '&:hover': {
            borderWidth: '1px',
            backgroundColor: 'rgba(27, 38, 59, 0.04)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: 'none',
          border: '1px solid #e0e0e0', // Subtle border instead of shadow
        },
        elevation1: {
           boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
        }
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #e0e0e0',
          boxShadow: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
             borderColor: '#c1a367', // Gold border on hover
             boxShadow: '0 4px 12px rgba(27, 38, 59, 0.1)',
          }
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#1b263b',
          borderBottom: '1px solid #e0e0e0',
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
            backgroundColor: '#1b263b', // Navy sidebar
            color: '#fdfbf7',
            borderRight: 'none',
        }
      }
    },
    MuiChip: {
        styleOverrides: {
            root: {
                borderRadius: 4, // Less rounded chips
                fontWeight: 600,
            }
        }
    }
  },
});

export default theme;