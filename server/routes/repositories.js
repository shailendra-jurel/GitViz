// GitViz/server/routes/repositories.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Get all repositories for the user
router.get('/', async (req, res) => {
  try {
    const { github_token } = req.user;
    
    if (!github_token) {
      return res.status(401).json({ error: 'GitHub token not found' });
    }
    
    // Fetch user's repositories
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `token ${github_token}`
      },
      params: {
        per_page: 100,
        sort: 'updated',
        direction: 'desc'
      }
    });
    
    // Format repository data
    const repositories = response.data.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      language: repo.language,
      visibility: repo.private ? 'private' : 'public',
      isArchived: repo.archived,
      defaultBranch: repo.default_branch,
      htmlUrl: repo.html_url,
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
      pushedAt: repo.pushed_at,
      owner: {
        id: repo.owner.id,
        login: repo.owner.login,
        avatarUrl: repo.owner.avatar_url,
        htmlUrl: repo.owner.html_url
      }
    }));
    
    res.json({ repositories });
  } catch (error) {
    console.error('Error fetching repositories:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'GitHub token expired or invalid' });
    }
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

// Save favorite repositories
router.post('/favorites', (req, res) => {
  try {
    const { repositories } = req.body;
    
    if (!Array.isArray(repositories)) {
      return res.status(400).json({ error: 'Repositories must be an array' });
    }
    
    // Store favorite repositories in session
    // Note: In a production app, you'd store these in a database
    req.session.favoriteRepositories = repositories.map(repo => repo.id);
    
    res.json({ success: true, repositories });
  } catch (error) {
    console.error('Error saving favorite repositories:', error);
    res.status(500).json({ error: 'Failed to save favorite repositories' });
  }
});

// Get repository details
router.get('/:owner/:repo', async (req, res) => {
  try {
    const { github_token } = req.user;
    const { owner, repo } = req.params;
    
    // Validation
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Repository owner and name are required' });
    }
    
    // Fetch repository details
    const repoResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `token ${github_token}`
      }
    });
    
    const repository = {
      id: repoResponse.data.id,
      name: repoResponse.data.name,
      fullName: repoResponse.data.full_name,
      description: repoResponse.data.description,
      language: repoResponse.data.language,
      visibility: repoResponse.data.private ? 'private' : 'public',
      isArchived: repoResponse.data.archived,
      defaultBranch: repoResponse.data.default_branch,
      htmlUrl: repoResponse.data.html_url,
      createdAt: repoResponse.data.created_at,
      updatedAt: repoResponse.data.updated_at,
      pushedAt: repoResponse.data.pushed_at,
      forksCount: repoResponse.data.forks_count,
      stargazersCount: repoResponse.data.stargazers_count,
      watchersCount: repoResponse.data.watchers_count,
      openIssuesCount: repoResponse.data.open_issues_count,
      owner: {
        id: repoResponse.data.owner.id,
        login: repoResponse.data.owner.login,
        avatarUrl: repoResponse.data.owner.avatar_url,
        htmlUrl: repoResponse.data.owner.html_url
      }
    };
    
    res.json(repository);
  } catch (error) {
    console.error('Error fetching repository details:', error.response?.data || error.message);
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Repository not found' });
    }
    res.status(500).json({ error: 'Failed to fetch repository details' });
  }
});

// Get branches for a repository
router.get('/:owner/:repo/branches', async (req, res) => {
  try {
    const { github_token } = req.user;
    const { owner, repo } = req.params;
    
    // Validation
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Repository owner and name are required' });
    }
    
    // Fetch branches
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/branches`, {
      headers: {
        Authorization: `token ${github_token}`
      },
      params: {
        per_page: 100
      }
    });
    
    const branches = response.data.map(branch => ({
      name: branch.name,
      protected: branch.protected,
      commit: {
        sha: branch.commit.sha,
        url: branch.commit.url
      }
    }));
    
    res.json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error.response?.data || error.message);
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Repository not found' });
    }
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
});

// Get pull requests for a repository
router.get('/:owner/:repo/pulls', async (req, res) => {
  try {
    const { github_token } = req.user;
    const { owner, repo } = req.params;
    const { state = 'all' } = req.query;
    
    // Validation
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Repository owner and name are required' });
    }
    
    // Fetch pull requests
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
      headers: {
        Authorization: `token ${github_token}`
      },
      params: {
        state,
        sort: 'updated',
        direction: 'desc',
        per_page: 100
      }
    });
    
    const pullRequests = response.data.map(pr => ({
      id: pr.id,
      number: pr.number,
      title: pr.title,
      state: pr.state,
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
      closedAt: pr.closed_at,
      mergedAt: pr.merged_at,
      draft: pr.draft,
      user: {
        id: pr.user.id,
        login: pr.user.login,
        avatarUrl: pr.user.avatar_url
      },
      htmlUrl: pr.html_url,
      diffUrl: pr.diff_url,
      base: {
        ref: pr.base.ref,
        sha: pr.base.sha
      },
      head: {
        ref: pr.head.ref,
        sha: pr.head.sha
      }
    }));
    
    res.json(pullRequests);
  } catch (error) {
    console.error('Error fetching pull requests:', error.response?.data || error.message);
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Repository not found' });
    }
    res.status(500).json({ error: 'Failed to fetch pull requests' });
  }
});

// Get commits for a repository
router.get('/:owner/:repo/commits', async (req, res) => {
  try {
    const { github_token } = req.user;
    const { owner, repo } = req.params;
    const { sha, path, since, until, per_page = 30 } = req.query;
    
    // Validation
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Repository owner and name are required' });
    }
    
    // Build params for GitHub API
    const params = { per_page: Math.min(per_page, 100) };
    if (sha) params.sha = sha;
    if (path) params.path = path;
    if (since) params.since = since;
    if (until) params.until = until;
    
    // Fetch commits
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, {
      headers: {
        Authorization: `token ${github_token}`
      },
      params
    });
    
    const commits = response.data.map(commit => ({
      sha: commit.sha,
      htmlUrl: commit.html_url,
      commit: {
        message: commit.commit.message,
        author: {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
          date: commit.commit.author.date
        },
        committer: {
          name: commit.commit.committer.name,
          email: commit.commit.committer.email,
          date: commit.commit.committer.date
        }
      },
      author: commit.author ? {
        id: commit.author.id,
        login: commit.author.login,
        avatarUrl: commit.author.avatar_url
      } : null,
      committer: commit.committer ? {
        id: commit.committer.id,
        login: commit.committer.login,
        avatarUrl: commit.committer.avatar_url
      } : null
    }));
    
    res.json(commits);
  } catch (error) {
    console.error('Error fetching commits:', error.response?.data || error.message);
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Repository not found' });
    }
    res.status(500).json({ error: 'Failed to fetch commits' });
  }
});

// Get contributors for a repository
router.get('/:owner/:repo/contributors', async (req, res) => {
  try {
    const { github_token } = req.user;
    const { owner, repo } = req.params;
    
    // Validation
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Repository owner and name are required' });
    }
    
    // Fetch contributors
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contributors`, {
      headers: {
        Authorization: `token ${github_token}`
      },
      params: {
        per_page: 100
      }
    });
    
    const contributors = response.data.map(contributor => ({
      id: contributor.id,
      login: contributor.login,
      avatarUrl: contributor.avatar_url,
      htmlUrl: contributor.html_url,
      contributions: contributor.contributions
    }));
    
    res.json(contributors);
  } catch (error) {
    console.error('Error fetching contributors:', error.response?.data || error.message);
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Repository not found' });
    }
    res.status(500).json({ error: 'Failed to fetch contributors' });
  }
});

module.exports = router;