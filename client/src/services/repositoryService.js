// src/services/repositoryService.js
import api from './api';

// No need to redefine the API URL as it's configured in api.js
// Remove the line: const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const repositoryService = {
  // Get all repositories for the authenticated user
  getRepositories: async () => {
    const response = await api.get('/repositories');
    return response.data;
  },
  
  // Get repository details
  getRepositoryDetails: async (owner, repo) => {
    const response = await api.get(`/repositories/${owner}/${repo}`);
    return response.data;
  },
  
  // Get branches for a repository
  getBranches: async (owner, repo) => {
    const response = await api.get(`/repositories/${owner}/${repo}/branches`);
    return response.data;
  },
  
  // Get pull requests for a repository
  getPullRequests: async (owner, repo) => {
    const response = await api.get(`/repositories/${owner}/${repo}/pulls`, {
      params: {
        state: 'all'
      }
    });
    return response.data;
  },
  
  // Get contributors for a repository
  getContributors: async (owner, repo) => {
    const response = await api.get(`/repositories/${owner}/${repo}/contributors`);
    return response.data;
  },
  
  // Save favorite repositories
  saveFavoriteRepositories: async (repositories) => {
    const response = await api.post(`/repositories/favorites`, { repositories });
    return response.data;
  },
  
  // Get repository visualization data
  getRepositoryNetwork: async (owner, repo, timeRange = '3m') => {
    const response = await api.get(`/visualizations/${owner}/${repo}/network`, {
      params: { timeRange }
    });
    return response.data;
  },
  
  // Get contributor activity
  getContributorActivity: async (owner, repo, timeRange = '3m') => {
    const response = await api.get(`/visualizations/${owner}/${repo}/contributor-activity`, {
      params: { timeRange }
    });
    return response.data;
  },
  
  // Get pull request visualizations
  getPullRequestActivity: async (owner, repo, timeRange = '3m') => {
    const response = await api.get(`/visualizations/${owner}/${repo}/pull-requests`, {
      params: { timeRange }
    });
    return response.data;
  },
};

export default repositoryService;