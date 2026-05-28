import { createTheme } from '@mui/material/styles';

// A modern, dark, glassmorphism theme for our application
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#BB86FC', // A vibrant purple
    },
    secondary: {
      main: '#03DAC6', // A teal accent
    },
    background: {
      default: '#121212', // A deep, dark background
      paper: 'rgba(255, 255, 255, 0.08)', // Translucent paper for the glass effect
    },
    text: {
      primary: '#E0E0E0',
      secondary: '#BDBDBD',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    // The core of the glassmorphism effect
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        },
      },
    },
    // Glowing buttons
    MuiButton: {
        styleOverrides: {
            contained: {
                boxShadow: '0 0 10px rgba(187, 134, 252, 0.5)',
                '&:hover': {
                    boxShadow: '0 0 18px rgba(187, 134, 252, 0.8)',
                }
            },
            outlined: {
                 border: '1px solid rgba(187, 134, 252, 0.5)',
            }
        }
    },
    // Style for chart containers and other key elements
    MuiCard: {
        styleOverrides: {
            root: {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
            }
        }
    },
    MuiTableCell: {
        styleOverrides: {
            head: {
                color: '#BB86FC',
                fontWeight: 'bold',
            }
        }
    }
  },
});
