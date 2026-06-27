// LoadingCard Component
import React from 'react';
import Spinner from './Spinner';

export const LoadingCard = ({ message = 'Loading details...', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-neutral-200 shadow-sm ${className}`}>
      <Spinner size="md" className="mb-3" />
      <span className="text-sm font-medium text-neutral-500">{message}</span>
    </div>
  );
};

export default LoadingCard;
