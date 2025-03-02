import { createTheme } from '@mui/material/styles';

// Light Theme Configuration
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2D3748', // Dark blue-gray
      light: '#4A5568',
      dark: '#1A202C',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#38B2AC', // Teal
      light: '#4FD1C5',
      dark: '#319795',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F7FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A202C',
      secondary: '#4A5568',
    },
    error: {
      main: '#E53E3E',
    },
    warning: {
      main: '#DD6B20',
    },
    info: {
      main: '#3182CE',
    },
    success: {
      main: '#38A169',
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.125rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 400,
    },
    body1: {
      fontSize: '0.875rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#4A5568',
          },
        },
        containedSecondary: {
          '&:hover': {
            backgroundColor: '#4FD1C5',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E2E8F0',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

// Dark Theme Configuration
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4A5568', // Lighter blue-gray
      light: '#718096',
      dark: '#1A202C',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#4FD1C5', // Lighter teal
      light: '#5CE1E6',
      dark: '#319795',
      contrastText: '#1A202C',
    },
    background: {
      default: '#1A202C',
      paper: '#2D3748',
    },
    text: {
      primary: '#E2E8F0',
      secondary: '#A0AEC0',
    },
    error: {
      main: '#F56565',
    },
    warning: {
      main: '#ED8936',
    },
    info: {
      main: '#4299E1',
    },
    success: {
      main: '#48BB78',
    },
    divider: '#4A5568',
  },
  typography: {
    // Inherit most settings from light theme
    ...lightTheme.typography,
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    // Inherit most components from light theme, with dark mode adjustments
    ...lightTheme.components,
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(255, 255, 255, 0.1)',
          },
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#718096',
          },
        },
        containedSecondary: {
          '&:hover': {
            backgroundColor: '#5CE1E6',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(255, 255, 255, 0.08)',
          borderRadius: 12,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: '#2D3748',
          borderRight: '1px solid #4A5568',
        },
      },
    },
  },
});

export { lightTheme, darkTheme };