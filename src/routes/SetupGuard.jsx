import React from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { systemSettingsRepository } from '../repositories';
import Spinner from '../components/common/Spinner';

export const SetupGuard = ({ children }) => {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['system-settings-global'],
    queryFn: () => systemSettingsRepository.getSettings(),
    staleTime: Infinity, // Global configuration stays stable
    retry: false
  });

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Verifying Platform State...</span>
        </div>
      </div>
    );
  }

  // Redirect to setup if settings doc is missing
  if (!settings) {
    return <Navigate to="/setup" replace />;
  }

  return children;
};

export default SetupGuard;
