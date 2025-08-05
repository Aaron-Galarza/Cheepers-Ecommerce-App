import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../../../services/authservice';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated(); // Usa el servicio de autenticación
  const location = useLocation();

  useEffect(() => {
    console.log(`ProtectedRoute: Rendered for path: ${location.pathname}`);
    console.log(`ProtectedRoute: adminToken status: ${isAuthenticated ? 'Authenticated' : 'Not Authenticated'}`);
  }, [isAuthenticated, location.pathname]);

  if (!isAuthenticated) {
    console.log(`ProtectedRoute: Not authenticated. Redirecting to /admin/login from ${location.pathname}`);
    // No necesitamos pasar el estado aquí directamente, ya que authService.logout()
    // ya guarda el motivo en sessionStorage.
    return <Navigate to="/admin/login" replace />;
  }

  console.log(`ProtectedRoute: Authenticated. Rendering children for ${location.pathname}`);
  return <>{children}</>;
};

export default ProtectedRoute;
