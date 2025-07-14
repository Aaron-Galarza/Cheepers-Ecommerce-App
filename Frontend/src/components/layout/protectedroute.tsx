// src/components/layout/ProtectedRoute.tsx
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('adminToken'); // CAMBIO: sessionStorage -> localStorage
  const location = useLocation();

  useEffect(() => {
    console.log(`ProtectedRoute: Rendered for path: ${location.pathname}`);
    console.log(`ProtectedRoute: adminToken in localStorage: ${isAuthenticated ? 'Exists' : 'Does NOT exist'}`);
  }, [isAuthenticated, location.pathname]);

  if (!isAuthenticated) {
    console.log(`ProtectedRoute: Not authenticated. Redirecting to /admin/login from ${location.pathname}`);
    return <Navigate to="/admin/login" replace />;
  }

  console.log(`ProtectedRoute: Authenticated. Rendering children for ${location.pathname}`);
  return <>{children}</>;
};

export default ProtectedRoute;