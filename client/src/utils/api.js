// src/utils/api.js
const API_BASE_URL = 'http://localhost:5000/api';

export const fetchUser = async () => {
  const response = await fetch(`${API_BASE_URL}/user`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
};

export const fetchRepos = async () => {
  const response = await fetch(`${API_BASE_URL}/repos`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch repositories');
  return response.json();
};

export const fetchBranches = async (owner, repo) => {
  const response = await fetch(`${API_BASE_URL}/repos/${owner}/${repo}/branches`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch branches');
  return response.json();
};

export const fetchPullRequests = async (owner, repo) => {
  const response = await fetch(`${API_BASE_URL}/repos/${owner}/${repo}/pulls`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch pull requests');
  return response.json();
};