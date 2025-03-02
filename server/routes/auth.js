// GitViz/server/routes/auth.js
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const router = express.Router();

// GitHub OAuth login route
router.get('/github', passport.authenticate('github', { scope: ['user', 'repo'] }));

// GitHub OAuth callback route
router.get('/github/callback', 
  passport.authenticate('github', { 
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=auth_failed`,
    session: false // This ensures we don't create a session
  }),
  (req, res) => {
    try {
      // Generate JWT token
      const token = jwt.sign(
        { 
          id: req.user.id, 
          username: req.user.username,
          github_token: req.user.githubToken
        },
        process.env.JWT_SECRET || 'git-viz-jwt-secret',
        { expiresIn: '24h' }
      );
      
      // Redirect to frontend with token
      const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
      const redirectUrl = `${clientUrl}/auth/callback?token=${encodeURIComponent(token)}`;
      
      console.log('Auth successful, redirecting to:', redirectUrl);
      
      // Clear any session data to be safe
      req.logout(function(err) {
        if (err) { console.error('Logout error:', err); }
        res.redirect(redirectUrl);
      });
    } catch (error) {
      console.error('Token generation error:', error);
      const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
      res.redirect(`${clientUrl}/login?error=token_generation_failed`);
    }
  }
);

// Handle frontend OAuth flow with code
router.post('/callback', async (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'Authorization code is required' });
  }
  
  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      },
      {
        headers: {
          Accept: 'application/json'
        }
      }
    );
    
    const { access_token } = tokenResponse.data;
    
    if (!access_token) {
      return res.status(400).json({ error: 'Failed to obtain access token' });
    }
    
    // Get user profile
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${access_token}`
      }
    });
    
    const user = {
      id: userResponse.data.id,
      login: userResponse.data.login,
      avatarUrl: userResponse.data.avatar_url,
      name: userResponse.data.name || userResponse.data.login,
      github_token: access_token
    };
    
    // Create JWT token - use consistent property naming
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.login, // Ensure username is consistent
        github_token: access_token 
      },
      process.env.JWT_SECRET || 'git-viz-jwt-secret',
      { expiresIn: '1d' }
    );
    
    return res.json({ token, user });
  } catch (error) {
    console.error('OAuth error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to authenticate with GitHub' });
  }
});

// Verify token endpoint
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Bearer token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'git-viz-jwt-secret', (err, decoded) => {
    if (err) {
      console.error('Token verification error:', err.message);
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.json({ 
      valid: true, 
      user: {
        id: decoded.id,
        username: decoded.username || decoded.login
      }
    });
  });
});

// Get user data
router.get('/user', (req, res, next) => authenticateJWT(req, res, next), async (req, res) => {
  try {
    const { github_token } = req.user;
    
    if (!github_token) {
      console.error('GitHub token not found in user object:', req.user);
      return res.status(400).json({ error: 'GitHub token not found' });
    }
    
    console.log('Fetching GitHub user data');
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${github_token}`
      }
    });
    
    const userData = {
      id: userResponse.data.id,
      login: userResponse.data.login,
      name: userResponse.data.name || userResponse.data.login,
      avatarUrl: userResponse.data.avatar_url,
      htmlUrl: userResponse.data.html_url,
      email: userResponse.data.email
    };
    
    console.log('User data fetched successfully');
    res.json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      res.status(401).json({ error: 'GitHub token expired or invalid' });
    } else {
      res.status(500).json({ error: 'Failed to fetch user data' });
    }
  }
});

// Logout route
router.post('/logout', (req, res) => {
  if (req.logout) {
    req.logout(function(err) {
      if (err) {
        return res.status(500).json({ error: 'Logout failed', details: err.message });
      }
      res.json({ success: true });
    });
  } else {
    res.json({ success: true });
  }
});

// Middleware function to authenticate JWT token
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required' });
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Bearer token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'git-viz-jwt-secret', (err, user) => {
    if (err) {
      console.error('JWT verification error:', err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  });
}

module.exports = router;