import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  // user.role is expected to be "ADMIN", "DOCTOR", or "PATIENT"
  if (allowedRole && user.role !== allowedRole) {
    // Redirect to their respective dashboard if they try to access wrong role
    const roleRoutes = {
      'ADMIN': '/admin',
      'DOCTOR': '/doctor',
      'PATIENT': '/patient'
    };
    return <Navigate to={roleRoutes[user.role] || '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
