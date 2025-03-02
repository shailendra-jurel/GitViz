// src/services/authService.js
import api from './api';

const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const authService = {
  // Redirect to GitHub OAuth page
  loginWithGithub: () => {
    window.location.href = `${API_URL}/auth/github`;
  },
  
  // Handle the callback after GitHub OAuth
  handleAuthCallback: async (code) => {
    const response = await api.post(`${API_URL}/auth/callback`, { code });
    return response.data;
  },
  
  // Get user profile
  getUserProfile: async (token) => {
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

    const response = await api.get(`${API_URL}/auth/user`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // Cache the user data
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },
  
  // Verify token
  verifyToken: async (token) => {
    const response = await api.get(`${API_URL}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },
  
  // Logout
  logout: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await api.post(`${API_URL}/auth/logout`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { success: true };
  }
};

export default authService;