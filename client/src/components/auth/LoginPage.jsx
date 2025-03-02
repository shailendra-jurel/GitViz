// src/components/auth/LoginPage.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Divider,
  Alert
} from '@mui/material';
import { GitHub as GitHubIcon } from '@mui/icons-material';
import { loginWithGithub, clearError } from '../../store/authSlice';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, error, loading } = useSelector((state) => state.auth);
  
  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    
    // Clear any previous errors
    dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);
  
  const handleGithubLogin = () => {
    dispatch(loginWithGithub());
  };
  
  return (
    <Container maxWidth="sm">
      <Box 
        sx={{ 
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <GitHubIcon color="primary" sx={{ fontSize: 48 }} />
            <Typography component="h1" variant="h4" sx={{ mt: 2 }}>
              Welcome to GitViz
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Visualize your GitHub repositories, branches, and more
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2} direction="column">
            <Grid item>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                startIcon={<GitHubIcon />}
                onClick={handleGithubLogin}
                disabled={loading}
                sx={{ py: 1.5 }}
              >
                {loading ? 'Connecting...' : 'Sign in with GitHub'}
              </Button>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
            GitViz requires GitHub access to visualize your repositories.
            We only request read access to your public repositories.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;