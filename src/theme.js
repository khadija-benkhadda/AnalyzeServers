
import { createTheme } from '@mui/material/styles';

// A custom theme for this app
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // A classic, professional blue
    },
    background: {
      default: '#f4f6f8', // A very light, clean grey
      paper: '#ffffff',   // Plain white for cards and surfaces
    },
    text: {
      primary: '#172b4d',   // Dark, high-contrast text
      secondary: '#6b778c', // Lighter grey for secondary info
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      color: '#172b4d',
    },
    h5: {
      fontWeight: 600,
      color: '#2a3eb1',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', // A more subtle shadow
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiTableHead: {
        styleOverrides: {
            root: {
                backgroundColor: '#f4f6f8',
            }
        }
    },
    MuiTableCell: {
        styleOverrides: {
            root: {
                borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
            }
        }
    }
  },
});

export default theme;
