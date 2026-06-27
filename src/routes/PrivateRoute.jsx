// PrivateRoute Router Guard
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import Spinner from '../components/common/Spinner';

export const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  // Redirect to correct portal based on destination path
  if (!currentUser) {
    const isAdminPath = location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard/admin');
    const redirectUrl = isAdminPath ? '/admin/login' : '/login';
    return <Navigate to={redirectUrl} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
