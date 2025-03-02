// src/routes.jsx
import React from 'react';
import { Navigate, useRoutes } from 'react-router-dom';

// Layouts
import AppLayout from './components/layout/AppLayout';

// Pages
import LoginPage from './components/auth/LoginPage';
import AuthCallback from './components/auth/AuthCallback';
import Dashboard from './components/dashboard/Dashboard';
import RepositoryList from './components/repositories/RepositoryList';
import BranchView from './components/branches/BranchView';
import NotFound from './components/layout/NotFound';

// Route Protection
import ProtectedRoute from './components/auth/ProtectedRoute';

const Routes = () => {
  return useRoutes([
    {
      path: '/',
      element: <Navigate to="/dashboard" replace />,
    },
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/auth/callback',
      element: <AuthCallback />,
    },
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: 'dashboard',
          element: <Dashboard />,
        },
        {
          path: 'repositories',
          element: <RepositoryList />,
        },
        {
          path: 'repositories/:owner/:repo',
          element: <BranchView />,
        },
        {
          path: 'profile',
          element: <Dashboard />, // Placeholder for future profile page
        },
      ],
    },
    {
      path: '*',
      element: <NotFound />,
    },
  ]);
};

export default Routes;