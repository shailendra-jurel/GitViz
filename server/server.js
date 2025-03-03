// GitViz/server/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Set up allowed origins - expanded to be more flexible
const allowedOrigins = [
  'https://git-viz-eight.vercel.app',
  'https://git-viz-eight.vercel.app/',
  'https://git-viz.vercel.app',
  'https://gitviz.onrender.com',
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000'
];

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, postman or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked for origin: ${origin}`);
      callback(null, true); // In production, allow it anyway to debug
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session config
app.use(session({
  secret: process.env.SESSION_SECRET || 'git-viz-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Enhanced logging for GitHub callback URL
const callbackURL = process.env.GITHUB_CALLBACK_URL || 'https://gitviz.onrender.com/api/auth/github/callback';
console.log('Using GitHub callback URL:', callbackURL);

// Passport GitHub strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL || 'https://gitviz.onrender.com/api/auth/github/callback',
  scope: ['user', 'repo']
},
async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('GitHub authentication successful for user:', profile.username);
      // Store GitHub access token with the user profile using consistent naming
      const user = {
        id: profile.id,
        username: profile.username,
        displayName: profile.displayName || profile.username,
        avatarUrl: profile._json.avatar_url,
        githubToken: accessToken // This will be mapped to github_token in the JWT
      };
      
      return done(null, user);
    } catch (error) {
      console.error('GitHub authentication error:', error);
      return done(error, null);
    }
  }
));

// Serialize and deserialize user for sessions
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Verify JWT token middleware
const authenticateJWT = (req, res, next) => {
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
};

// Import routes
const authRoutes = require('./routes/auth');
const repositoryRoutes = require('./routes/repositories');
const visualizationRoutes = require('./routes/visualizations');

// Use routes - Fixed by correctly using the router objects as middleware
app.use('/api/auth', authRoutes);
app.use('/api/repositories', authenticateJWT, repositoryRoutes);
app.use('/api/visualizations', authenticateJWT, visualizationRoutes);

// Pre-flight options for CORS
app.options('*', cors());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug route to check environment variables
app.get('/api/debug/env', (req, res) => {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    clientUrl: process.env.CLIENT_URL,
    githubCallbackUrl: process.env.GITHUB_CALLBACK_URL,
    allowedOrigins
  });
});

// Only handle API routes - no static file serving for API server
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  // Redirect non-API requests to frontend
  res.redirect(process.env.CLIENT_URL || 'https://git-viz-eight.vercel.app');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Server error occurred', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`CLIENT_URL: ${process.env.CLIENT_URL}`);
});

module.exports = app;