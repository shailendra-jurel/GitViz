// import React from 'react';
// import { Provider } from 'react-redux';
// import { store } from './store/store';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import GitHubAuth from './components/GitHubAuth';
// import Home from './pages/Home';

// const App = () => {
//   return (
//     <Provider store={store}>
//       <Router>
//         <div className="flex flex-col h-screen">
//           <Navbar />
//           <Routes>
//             <Route path="/" element={<GitHubAuth />} />
//             <Route path="/home" element={<Home />} />
//           </Routes>
//         </div>
//       </Router>
//     </Provider>
//   );
// };

// export default App;

// src/App.jsx
import { BrowserRouter as Router, Routes, Route , Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Login from './components/Login';
import GithubBranchViewer from './components/GithubBranchViewer';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <GithubBranchViewer />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;