// src/components/auth/ProtectedRoute.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { fetchUserProfile } from '../../store/authSlice';
import Loader from '../common/Loader';


  
  const ProtectedRoute = ({ children }) => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
    
    useEffect(() => {
      // If we have a token but no user data, fetch the profile once
      if (isAuthenticated && !user && !loading) {
        dispatch(fetchUserProfile());
      }
    }, [dispatch, isAuthenticated, user, loading]);
    
    if (loading) {
      return <Loader message="Authenticating..." />;
    }
    
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    return children;
  };

export default ProtectedRoute;