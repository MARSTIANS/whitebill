import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
import Home from './Home';
import ProtectedRoute from './ProtectedRoute';  // Import the protected route component

function App() {
  const [role, setRole] = useState(null); // State to store user role
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Store auth status

  // Simulating login persistence for demo purposes
  useEffect(() => {
    const savedRole = localStorage.getItem('role');
    if (savedRole) {
      setRole(savedRole);
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Login setRole={setRole} setIsAuthenticated={setIsAuthenticated} />} />
        
        {/* Protected route for authenticated users */}
        <Route
          path="/home/*"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              role={role}
              requiredRole="user" // minimum required role for general access
            >
              <Home role={role} />
            </ProtectedRoute>
          }
        />
        
        {/* Fallback to login page if route doesn't match */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
