// AuthContext Provider
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authRepository, roleRepository } from '../../../repositories';
import { errorLogger } from '../../../observability/errorLogger';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Bind subscription listener to AuthRepository
    const unsubscribe = authRepository.onAuthStateChanged(async (profile) => {
      try {
        if (profile) {
          setCurrentUser(profile);
          setUserProfile(profile);
          setRole(profile.role);

          // Fetch and cache role permissions dynamically
          try {
            const roleData = await roleRepository.getRole(profile.role);
            setPermissions(roleData ? roleData.permissions : []);
          } catch (e) {
            console.error('Failed to load role permissions on auth change:', e);
            setPermissions([]);
          }
        } else {
          setCurrentUser(null);
          setUserProfile(null);
          setRole(null);
          setPermissions([]);
        }
      } catch (err) {
        errorLogger.logError(err, 'Failed to handle Auth state changes.');
      } finally {
        setLoading(false);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const refreshPermissions = async () => {
    if (!role) return;
    try {
      const roleData = await roleRepository.getRole(role);
      if (roleData) {
        setPermissions(roleData.permissions || []);
      }
    } catch (e) {
      console.error('Failed to refresh permissions:', e);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const profile = await authRepository.loginWithEmail(email, password);
      if (profile) {
        setCurrentUser(profile);
        setUserProfile(profile);
        setRole(profile.role);

        try {
          const roleData = await roleRepository.getRole(profile.role);
          setPermissions(roleData ? roleData.permissions : []);
        } catch (e) {
          console.error('Failed to load role permissions on login:', e);
        }
      }
      return profile;
    } catch (err) {
      errorLogger.logError(err, `Login failure for: ${email}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const profile = await authRepository.loginWithGoogle();
      if (profile) {
        setCurrentUser(profile);
        setUserProfile(profile);
        setRole(profile.role);

        try {
          const roleData = await roleRepository.getRole(profile.role);
          setPermissions(roleData ? roleData.permissions : []);
        } catch (e) {
          console.error('Failed to load role permissions on google login:', e);
        }
      }
      return profile;
    } catch (err) {
      errorLogger.logError(err, 'Google Sign-in failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, displayName, phone = '') => {
    setLoading(true);
    try {
      const profile = await authRepository.registerWithEmail(email, password, displayName, phone);
      if (profile) {
        setCurrentUser(profile);
        setUserProfile(profile);
        setRole(profile.role);

        try {
          const roleData = await roleRepository.getRole(profile.role);
          setPermissions(roleData ? roleData.permissions : []);
        } catch (e) {
          console.error('Failed to load role permissions on registration:', e);
        }
      }
      return profile;
    } catch (err) {
      errorLogger.logError(err, `Registration failed for: ${email}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authRepository.logout();
    } catch (err) {
      errorLogger.logError(err, 'Sign out request failed.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      await authRepository.sendPasswordReset(email);
    } catch (err) {
      errorLogger.logError(err, `Password reset email trigger failed for: ${email}`);
      throw err;
    }
  };

  const updateProfile = async (updates) => {
    if (!currentUser) return null;
    try {
      const updated = await authRepository.updateUserProfile(currentUser.uid, updates);
      setUserProfile(updated);
      setCurrentUser(updated);
      if (updated.role && updated.role !== role) {
        setRole(updated.role);
        try {
          const roleData = await roleRepository.getRole(updated.role);
          setPermissions(roleData ? roleData.permissions : []);
        } catch (e) {
          console.error('Failed to load role permissions on profile update:', e);
        }
      }
      return updated;
    } catch (err) {
      errorLogger.logError(err, 'Profile update failed.');
      throw err;
    }
  };

  const value = {
    currentUser,
    userProfile,
    role,
    permissions,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    resetPassword,
    updateProfile,
    refreshPermissions
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
