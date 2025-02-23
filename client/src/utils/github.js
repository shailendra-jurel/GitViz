// utils/github.js
const GITHUB_API_BASE = 'https://api.github.com';

export const fetchUserRepos = async (token) => {
  const response = await fetch(`${GITHUB_API_BASE}/user/repos`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

export const fetchRepoBranches = async (token, repoFullName) => {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${repoFullName}/branches`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};