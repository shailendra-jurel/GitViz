// src/services/authService.js
import api from './api';

// Get the base URL from the API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://gitviz.onrender.com/api';

const authService = {
  // Redirect to GitHub OAuth page
  loginWithGithub: () => {
    console.log('Redirecting to GitHub OAuth:', `${API_BASE_URL}/auth/github`);
    window.location.href = `${API_BASE_URL}/auth/github`;
  },
  
  // Handle the callback after GitHub OAuth
  handleAuthCallback: async (code) => {
    const response = await api.post(`/auth/callback`, { code });
    return response.data;
  },
  
  // Get user profile
  getUserProfile: async () => {
    // Check if we already have a user in localStorage to avoid unnecessary API calls
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        return JSON.parse(cachedUser);
      } catch (e) {
        // If parsing fails, proceed with API call
        console.log('Failed to parse cached user, fetching from API');
      }
    }

    const response = await api.get(`/auth/user`);
    
    // Cache the user data
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },
  
  // Verify token
  verifyToken: async () => {
    const response = await api.get(`/auth/verify`);
    return response.data;
  },
  
  // Logout
  logout: async () => {
    try {
      await api.post(`/auth/logout`, {});
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { success: true };
  }
};

export default authService;