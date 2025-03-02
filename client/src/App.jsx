// src/App.jsx
import React, { useMemo, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { 
  ThemeProvider, 
  CssBaseline, 
  createTheme,
  StyledEngineProvider
} from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { lightTheme, darkTheme } from './styles/theme';
import store from './store';
import Routes from './routes';

const App = () => {
  const [mode, setMode] = useState(() => {
    // Check for saved theme preference or use system preference
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) {
      return savedMode;
    }
    
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
  });
  
  // Update theme based on mode
  const theme = useMemo(() => {
    const selectedTheme = mode === 'dark' ? darkTheme : lightTheme;
    return createTheme(selectedTheme);
  }, [mode]);
  
  const toggleColorMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };
  
  return (
    <Provider store={store}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider 
            maxSnack={3} 
            autoHideDuration={3000}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
          >
            <BrowserRouter>
              <Routes toggleColorMode={toggleColorMode} />
            </BrowserRouter>
          </SnackbarProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </Provider>
  );
};

export default App;