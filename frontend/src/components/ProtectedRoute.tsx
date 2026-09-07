import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.accessToken) || localStorage.getItem('accessToken');
  const location = useLocation();

  if (!user && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

export default ProtectedRoute;
