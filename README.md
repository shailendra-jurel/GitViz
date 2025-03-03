GitViz: GitHub Repository Visualization Tool 🚀
GitViz is an elegant, interactive web application designed to transform how developers visualize and understand GitHub repositories. With a sleek Material UI interface, GitViz provides powerful insights into your repositories, branches, commits, and pull requests through intuitive visualizations and analytics.
Show Image
✨ Features
🔐 GitHub OAuth Integration

Seamless authentication with your GitHub account
Secure token-based authentication using JWT
Privacy-focused access to only requested repository data

📊 Repository Analytics

Interactive dashboard with repository statistics
Visual representation of commit frequency and trends
Language distribution analysis
Contributor activity metrics

🌳 Branch Visualization

Beautiful network graphs showing branch relationships
Branch comparison tools
Protected branch highlighting
Branch health indicators

🔄 Pull Request Insights

PR status overview with visual indicators
Time-to-merge analytics
Author contribution statistics
Merge history visualization

💻 Elegant UI/UX Experience

Clean, responsive Material UI design
Dark/light theme toggle
Intuitive navigation with branch filtering
Real-time data synchronization

🛠️ Technology Stack

Frontend: React, Material UI, Redux Toolkit, Chart.js, D3.js
Backend: Node.js, Express, Passport.js
Authentication: GitHub OAuth, JWT
Deployment: Vercel (frontend), Render (backend)

🚀 Getting Started
Prerequisites

Node.js (v16 or higher)
GitHub account
GitHub OAuth application credentials

Installation
1. Clone the repository  :- git clone https://github.com/shailendra-jurel/gitviz.git
cd gitviz
2. Install backend dependencies
cd server
npm install
3. Configure backend environment
Create a .env file in the server directoNODE_ENV=development
PORT=5000
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
CLIENT_URL=http://localhost:5173
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret
4. Install frontend dependencies
cd ../client
npm install
5. Configure frontend environment
Create a .env file in the client directoVITE_API_URL=http://localhost:5000/api
6. Start development servers
Backend:
cd ../server
npm run dev
Frontend:
cd ../client
npm run dev
7. Access the application
Open your browser and navigate to http://localhost:5173
🌐 Live Demo
Experience GitViz in action:

Frontend: https://git-viz-eight.vercel.app
Backend API: https://gitviz.onrender.com

📱 Screenshots
Dashboard View
Show Image
Interactive dashboard with repository metrics and activity feeds
Branch Network Visualization
Show Image
Visual representation of branch relationships and commit history
Pull Request Analytics
Show Image
Detailed analytics on pull request performance and team collaboration
🔍 Key Architectural Decisions
GitViz implements a modern, scalable architecture:

Separation of Concerns: Clean separation between frontend and backend services
RESTful API Design: Well-structured endpoints for data retrieval and manipulation
JWT Authentication: Secure, stateless authentication for API requests
Responsive Design: Mobile-first approach for all device compatibility
Data Visualization: Efficient rendering of complex repository structures

📚 API Documentation
GitViz provides a comprehensive API:

GET /api/repositories - List user repositories
GET /api/repositories/:owner/:repo - Get repository details
GET /api/repositories/:owner/:repo/branches - Get repository branches
GET /api/repositories/:owner/:repo/pulls - Get repository pull requests
GET /api/visualizations/:owner/:repo/network - Get repository network graph
GET /api/visualizations/:owner/:repo/contributor-activity - Get contributor metrics

🚧 Future Enhancements

Release train visualization
Commit impact analysis
Team performance dashboards
Issue tracking integration
Custom visualization templates

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
👥 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

Designed and developed with ❤️ by Shailendra Jurel. Connect with me on LinkedIn `linkedin.com/in/shailendra-jurel/`