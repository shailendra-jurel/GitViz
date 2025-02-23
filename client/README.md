# GitHub Branch Viewer

A web application that allows users to authenticate via GitHub, select multiple repositories, and display repository branches in a visually appealing manner.

## Features

- GitHub OAuth authentication
- Multiple repository selection
- Branch visualization
- Pull request overview
- Search functionality
- Real-time updates

## Setup Instructions

1. Clone the repository
```bash
git clone <repository-url>
cd github-branch-viewer
```

2. Install dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Configure environment variables
Create `.env` file in the server directory:
```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
SESSION_SECRET=your_session_secret
```

4. Start the application
```bash
# Start server (from server directory)
npm run start

# Start client (from client directory)
npm run dev
```

5. Open http://localhost:5173 in your browser

## GitHub OAuth Setup

1. Go to GitHub Settings > Developer Settings > OAuth Apps
2. Create a new OAuth application
3. Set homepage URL to `http://localhost:5173`
4. Set authorization callback URL to `http://localhost:5000/auth/github/callback`
5. Copy Client ID and Client Secret to your `.env` file

## Technology Stack

- Frontend: React, Redux, Tailwind CSS
- Backend: Node.js, Express
- Authentication: GitHub OAuth
- State Management: Redux Toolkit
- UI Components: shadcn/ui