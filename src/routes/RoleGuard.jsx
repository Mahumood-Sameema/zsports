// RoleGuard Permissions Router Wrapper
import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../features/auth/hooks/usePermissions';
import { useAuth } from '../features/auth/hooks/useAuth';
import Spinner from '../components/common/Spinner';

export const RoleGuard = ({ children, requiredPermission }) => {
  const { hasPermission, role } = usePermissions();
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
