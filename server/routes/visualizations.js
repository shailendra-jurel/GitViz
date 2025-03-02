// GitViz/server/routes/visualizations.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Helper for date formatting
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// Get time range based on filter
const getTimeRange = (filter) => {
  const now = new Date();
  let startDate = new Date();
  
  switch (filter) {
    case '1w':
      startDate.setDate(now.getDate() - 7);
      break;
    case '1m':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case '3m':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case '6m':
      startDate.setMonth(now.getMonth() - 6);
      break;
    case '1y':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(now.getMonth() - 3); // Default to 3 months
  }
  
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(now)
  };
};

// Get repository network graph data (commit history, branches, merges)
router.get('/:owner/:repo/network', async (req, res) => {
  try {
    const { github_token } = req.user;
    const { owner, repo } = req.params;
    const { timeRange = '3m' } = req.query;
    
    // Validation
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Repository owner and name are required' });
    }
    
    const { startDate, endDate } = getTimeRange(timeRange);
    
    // Fetch repository details to get default branch
    const repoResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `token ${github_token}`
      }
    });
    
    const defaultBranch = repoResponse.data.default_branch;
    
    // Fetch branches
    const branchesResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/branches`, {
      headers: {
        Authorization: `token ${github_token}`
      },
      params: {
        per_page: 100
      }
    });
    
    // Fetch commits (using since parameter to limit by time range)
    const commitsResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, {
      headers: {
        Authorization: `token ${github_token}`
      },
      params: {
        since: `${startDate}T00:00:00Z`,
        until: `${endDate}T23:59:59Z`,
        per_page: 100
      }
    });
    
    // Extract branch information
    const branches = branchesResponse.data.map(branch => ({
      name: branch.name,
      sha: branch.commit.sha,
      isDefault: branch.name === defaultBranch
    }));
    
    // Extract commit information
    const commits = commitsResponse.data.map(commit => ({
      sha: commit.sha,
      htmlUrl: commit.html_url,
      message: commit.commit.message,
      author: {
        name: commit.commit.author.name,
        email: commit.commit.author.email,
        date: commit.commit.author.date,
        login: commit.author ? commit.author.login : null,
        avatarUrl: commit.author ? commit.author.avatar_url : null
      },
      parents: commit.parents.map(parent => ({
        sha: parent.sha,
        url: parent.url,
        htmlUrl: parent.html_url
      }))
    }));
    
    // Fetch pull requests to identify merges
    const pullsResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
      headers: {
        Authorization: `token ${github_token}`
      },
      params: {
        state: 'closed',
        sort: 'updated',
        direction: 'desc',
        per_page: 100
      }
    });
    
    // Extract pull request information (merges)
    const merges = pullsResponse.data
      .filter(pr => pr.merged_at && new Date(pr.merged_at) >= new Date(startDate))
      .map(pr => ({
        id: pr.id,
        number: pr.number,
        title: pr.title,
        sourceBranch: pr.head.ref,
        targetBranch: pr.base.ref,
        mergedAt: pr.merged_at,
        mergeCommitSha: pr.merge_commit_sha,
        author: {
          login: pr.user.login,
          avatarUrl: pr.user.avatar_url
        }
      }));
    
    // Build graph nodes and edges
    const nodes = [];
    const edges = [];
    
    // Add commits as nodes
    commits.forEach(commit => {
      nodes.push({
        id: commit.sha,
        type: 'commit',
        data: commit
      });
      
      // Add edges between commits and their parents
      commit.parents.forEach(parent => {
        edges.push({
          source: parent.sha,
          target: commit.sha,
          type: 'commit'
        });
      });
    });
    
    // Add branches as nodes
    branches.forEach(branch => {
      // Only add if the branch head commit is in our nodes
      if (nodes.some(node => node.id === branch.sha)) {
        nodes.push({
          id: `branch-${branch.name}`,
          type: 'branch',
          data: branch
        });
        
        // Add edge from branch to its head commit
        edges.push({
          source: `branch-${branch.name}`,
          target: branch.sha,
          type: 'branch'
        });
      }
    });
    
    // Add merges as special edges
    merges.forEach(merge => {
      // Find corresponding merge commit
      const mergeCommit = commits.find(commit => commit.sha === merge.mergeCommitSha);
      
      if (mergeCommit) {
        edges.push({
          source: merge.sourceBranch,
          target: merge.targetBranch,
          type: 'merge',
          data: merge
        });
      }
    });
    
    res.json({
      repository: {
        name: repoResponse.data.name,
        fullName: repoResponse.data.full_name,
        defaultBranch
      },
      graph: {
        nodes,
        edges
      },
      timeRange: {
        startDate,
        endDate
      }
    });
  } catch (error) {
    console.error('Error generating network graph:', error.response?.data || error.message);
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Repository not found' });
    }
    res.status(500).json({ error: 'Failed to generate network graph' });
  }
});

// Get contributor activity visualization data
router.get('/:owner/:repo/contributor-activity', async (req, res) => {
  try {
    const { github_token } = req.user;
    const { owner, repo } = req.params;
    const { timeRange = '3m' } = req.query;
    
    // Validation
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Repository owner and name are required' });
    }
    
    const { startDate, endDate } = getTimeRange(timeRange);
    
    // Fetch contributors
    const contributorsResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contributors`, {
      headers: {
        Authorization: `token ${github_token}`
      },
      params: {
        per_page: 100
      }
    });
    
    // Fetch commits within the time range
    const commitsResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, {
      headers: {
        Authorization: `token ${github_token}`
      },
      params: {
        since: `${startDate}T00:00:00Z`,
        until: `${endDate}T23:59:59Z`,
        per_page: 100
      }
    });
    
    // Get all contributors
    const contributors = contributorsResponse.data.map(contributor => ({
      id: contributor.id,
      login: contributor.login,
      avatarUrl: contributor.avatar_url,
      contributions: contributor.contributions
    }));
    
    // Process commits by author
    const commitsByAuthor = {};
    const commitsByDate = {};
    
    commitsResponse.data.forEach(commit => {
      const author = commit.author ? commit.author.login : commit.commit.author.name;
      const date = commit.commit.author.date.split('T')[0]; // YYYY-MM-DD
      
      // Count by author
      if (!commitsByAuthor[author]) {
        commitsByAuthor[author] = {
          count: 0,
          additions: 0,
          deletions: 0,
          dates: {}
        };
      }
      
      commitsByAuthor[author].count++;
      
      // Count by date
      if (!commitsByDate[date]) {
        commitsByDate[date] = {
          count: 0,
          authors: {}
        };
      }
      
      commitsByDate[date].count++;
      
      // Count by author per date
      if (!commitsByDate[date].authors[author]) {
        commitsByDate[date].authors[author] = 0;
      }
      
      commitsByDate[date].authors[author]++;
      
      // Add date to author's dates
      if (!commitsByAuthor[author].dates[date]) {
        commitsByAuthor[author].dates[date] = 0;
      }
      
      commitsByAuthor[author].dates[date]++;
    });
    
    // Format data for time series
    const timeSeriesData = Object.keys(commitsByDate)
      .sort()
      .map(date => ({
        date,
        totalCommits: commitsByDate[date].count,
        byAuthor: commitsByDate[date].authors
      }));
    
    // Format data for contribution summary
    const contributionSummary = contributors
      .filter(contributor => commitsByAuthor[contributor.login])
      .map(contributor => ({
        id: contributor.id,
        login: contributor.login,
        avatarUrl: contributor.avatarUrl,
        totalCommits: commitsByAuthor[contributor.login]?.count || 0,
        totalContributions: contributor.contributions,
        commitsInTimeRange: commitsByAuthor[contributor.login]?.count || 0,
        activity: Object.keys(commitsByAuthor[contributor.login]?.dates || {})
          .sort()
          .map(date => ({
            date,
            commits: commitsByAuthor[contributor.login].dates[date]
          }))
      }))
      .sort((a, b) => b.commitsInTimeRange - a.commitsInTimeRange);
    
    res.json({
      timeRange: {
        startDate,
        endDate
      },
      contributionSummary,
      timeSeriesData
    });
  } catch (error) {
    console.error('Error generating contributor activity:', error.response?.data || error.message);
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Repository not found' });
    }
    res.status(500).json({ error: 'Failed to generate contributor activity' });
  }
});

// Get pull request visualization data
router.get('/:owner/:repo/pull-requests', async (req, res) => {
  try {
    const { github_token } = req.user;
    const { owner, repo } = req.params;
    const { timeRange = '3m', state = 'all' } = req.query;
    
    // Validation
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Repository owner and name are required' });
    }
    
    const { startDate, endDate } = getTimeRange(timeRange);
    
    // Fetch pull requests
    const pullsResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
      headers: {
        Authorization: `token ${github_token}`
      },
      params: {
        state,
        sort: 'created',
        direction: 'desc',
        per_page: 100
      }
    });
    
    // For closed and merged PRs, get additional historical data via search
    const closedPRQuery = `repo:${owner}/${repo} is:pr is:closed closed:${startDate}..${endDate}`;
    const mergedPRQuery = `repo:${owner}/${repo} is:pr is:merged merged:${startDate}..${endDate}`;
    
    const [closedPRsResponse, mergedPRsResponse] = await Promise.all([
      axios.get('https://api.github.com/search/issues', {
        headers: {
          Authorization: `token ${github_token}`,
          Accept: 'application/vnd.github.v3+json'
        },
        params: {
          q: closedPRQuery,
          per_page: 100
        }
      }),
      axios.get('https://api.github.com/search/issues', {
        headers: {
          Authorization: `token ${github_token}`,
          Accept: 'application/vnd.github.v3+json'
        },
        params: {
          q: mergedPRQuery,
          per_page: 100
        }
      })
    ]);
    
    // Process pull requests
    const prs = pullsResponse.data
      .filter(pr => {
        const createdAt = new Date(pr.created_at);
        return createdAt >= new Date(startDate) && createdAt <= new Date(endDate);
      })
      .map(pr => ({
        id: pr.id,
        number: pr.number,
        title: pr.title,
        state: pr.state,
        createdAt: pr.created_at,
        updatedAt: pr.updated_at,
        closedAt: pr.closed_at,
        mergedAt: pr.merged_at,
        user: {
          login: pr.user.login,
          avatarUrl: pr.user.avatar_url
        },
        base: pr.base.ref,
        head: pr.head.ref
      }));
    
    // Analyze PR statistics
    const prsByState = {
      open: prs.filter(pr => pr.state === 'open').length,
      closed: closedPRsResponse.data.total_count,
      merged: mergedPRsResponse.data.total_count
    };
    
    // Analyze PRs by author
    const prsByAuthor = {};
    prs.forEach(pr => {
      const author = pr.user.login;
      if (!prsByAuthor[author]) {
        prsByAuthor[author] = {
          author,
          avatarUrl: pr.user.avatarUrl,
          total: 0,
          open: 0,
          closed: 0,
          merged: 0
        };
      }
      
      prsByAuthor[author].total++;
      
      if (pr.state === 'open') {
        prsByAuthor[author].open++;
      } else if (pr.mergedAt) {
        prsByAuthor[author].merged++;
      } else if (pr.closedAt) {
        prsByAuthor[author].closed++;
      }
    });
    
    // Group PRs by date
    const prsByDate = {};
    prs.forEach(pr => {
      const createdDate = pr.createdAt.split('T')[0];
      
      if (!prsByDate[createdDate]) {
        prsByDate[createdDate] = {
          date: createdDate,
          total: 0,
          open: 0,
          closed: 0,
          merged: 0
        };
      }
      
      prsByDate[createdDate].total++;
      
      if (pr.state === 'open') {
        prsByDate[createdDate].open++;
      } else if (pr.mergedAt) {
        prsByDate[createdDate].merged++;
      } else if (pr.closedAt) {
        prsByDate[createdDate].closed++;
      }
    });
    
    // Format time series data
    const timeSeriesData = Object.values(prsByDate).sort((a, b) => a.date.localeCompare(b.date));
    
    res.json({
      timeRange: {
        startDate,
        endDate
      },
      summary: {
        total: prs.length,
        ...prsByState
      },
      byAuthor: Object.values(prsByAuthor).sort((a, b) => b.total - a.total),
      timeSeries: timeSeriesData,
      pullRequests: prs.slice(0, 50) // Limit to 50 PRs for performance
    });
  } catch (error) {
    console.error('Error generating pull request visualization:', error.response?.data || error.message);
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Repository not found' });
    }
    res.status(500).json({ error: 'Failed to generate pull request visualization' });
  }
});

// Get code frequency visualization
router.get('/:owner/:repo/code-frequency', async (req, res) => {
  try {
    const { github_token } = req.user;
    const { owner, repo } = req.params;
    
    // Validation
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Repository owner and name are required' });
    }
    
    // Fetch code frequency stats
    const statsResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/stats/code_frequency`, {
      headers: {
        Authorization: `token ${github_token}`
      }
    });
    
    // Format data for visualization
    // GitHub returns an array of weekly data: [timestamp, additions, deletions]
    const codeFrequency = statsResponse.data.map(week => ({
      week: new Date(week[0] * 1000).toISOString().split('T')[0], // Convert UNIX timestamp to YYYY-MM-DD
      additions: week[1],
      deletions: Math.abs(week[2]) // Convert negative to positive for easier visualization
    }));
    
    // Calculate cumulative changes
    let totalAdditions = 0;
    let totalDeletions = 0;
    
    const cumulativeChanges = codeFrequency.map(week => {
      totalAdditions += week.additions;
      totalDeletions += week.deletions;
      
      return {
        week: week.week,
        totalAdditions,
        totalDeletions
      };
    });
    
    res.json({
      weeklyData: codeFrequency,
      cumulativeData: cumulativeChanges,
      summary: {
        totalAdditions: cumulativeChanges[cumulativeChanges.length - 1]?.totalAdditions || 0,
        totalDeletions: cumulativeChanges[cumulativeChanges.length - 1]?.totalDeletions || 0
      }
    });
  } catch (error) {
    console.error('Error generating code frequency visualization:', error.response?.data || error.message);
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Repository not found' });
    } else if (error.response?.status === 202) {
      // GitHub is computing the stats
      return res.status(202).json({ message: 'GitHub is computing statistics. Please try again in a moment.' });
    }
    res.status(500).json({ error: 'Failed to generate code frequency visualization' });
  }
});

module.exports = router;