// src/components/auth/AuthCallback.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress, Paper, Alert } from '@mui/material';
import { handleAuthCallback, fetchUserProfile } from '../../store/authSlice';

const AuthCallback = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, error, loading } = useSelector((state) => state.auth);
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Get the token from the URL query parameter
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');
  
        if (token) {
          // Store the token in localStorage 
          localStorage.setItem('token', token);
          console.log('Token saved:', token); // Add this for debugging
          
          // Only fetch user profile if token exists
          await dispatch(fetchUserProfile()).unwrap();
          console.log('Profile fetched successfully'); // Add this for debugging
          
          // Navigate to dashboard
          navigate('/dashboard');
        } else {
          throw new Error('No token found in URL');
        }
      } catch (err) {
        console.error('Authentication error:', err);
      }
    };
  
    // Only run the auth handling if not already authenticated
    if (!isAuthenticated) {
      handleAuth();
    }
  }, [dispatch, navigate, location, isAuthenticated]);
  // If the user is already authenticated, this component might render briefly
  // before the useEffect redirect, so we don't want to show an error in that case
  const showError = error && !isAuthenticated;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 400,
          width: '100%',
        }}
      >
        {showError ? (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <>
            <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              Connecting to GitHub
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center">
              {message}
            </Typography>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default AuthCallback;