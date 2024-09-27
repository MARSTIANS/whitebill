import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated, role, requiredRole, children }) => {
  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If user role does not match the required role, redirect to login or error page
  if (requiredRole && role !== requiredRole && role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // If authenticated and role matches, render the children (protected components)
  return children;
};

export default ProtectedRoute;
