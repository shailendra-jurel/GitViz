// src/services/repositoryService.js
import api from './api';

const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const repositoryService = {
  // Get all repositories for the authenticated user
  getRepositories: async (token) => {
    const response = await api.get(`${API_URL}/repositories`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },
  
  // Get repository details
  getRepositoryDetails: async (token, owner, repo) => {
    const response = await api.get(`${API_URL}/repositories/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },
  
  // Get branches for a repository
  getBranches: async (token, owner, repo) => {
    const response = await api.get(`${API_URL}/repositories/${owner}/${repo}/branches`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },
  
  // Get pull requests for a repository
  getPullRequests: async (token, owner, repo) => {
    const response = await api.get(`${API_URL}/repositories/${owner}/${repo}/pulls`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        state: 'all'
      }
    });
    return response.data;
  },
  
  // Get contributors for a repository
  getContributors: async (token, owner, repo) => {
    const response = await api.get(`${API_URL}/repositories/${owner}/${repo}/contributors`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },
  
  // Save favorite repositories
  saveFavoriteRepositories: async (token, repositories) => {
    const response = await api.post(`${API_URL}/repositories/favorites`, { repositories }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },
  
  // Get repository visualization data
  getRepositoryNetwork: async (token, owner, repo, timeRange = '3m') => {
    const response = await api.get(`${API_URL}/visualizations/${owner}/${repo}/network`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: { timeRange }
    });
    return response.data;
  },
  
  // Get contributor activity
  getContributorActivity: async (token, owner, repo, timeRange = '3m') => {
    const response = await api.get(`${API_URL}/visualizations/${owner}/${repo}/contributor-activity`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: { timeRange }
    });
    return response.data;
  },
  
  // Get pull request visualizations
  getPullRequestActivity: async (token, owner, repo, timeRange = '3m') => {
    const response = await api.get(`${API_URL}/visualizations/${owner}/${repo}/pull-requests`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: { timeRange }
    });
    return response.data;
  },
};

export default repositoryService;