// usePermissions Hook
import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { role, userProfile, permissions = [] } = useAuth();
  
  const hasPermission = (permission) => {
    if (!role) return false;
    return permissions.includes(permission);
  };

  return { hasPermission, role, userProfile };
};

export default usePermissions;
