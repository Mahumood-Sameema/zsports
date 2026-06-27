// HasPermission Component Guard
import React from 'react';
import { usePermissions } from '../hooks/usePermissions';

export const HasPermission = ({ permission, children, fallback = null }) => {
  const { hasPermission } = usePermissions();
  
  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  return fallback;
};

export default HasPermission;
