// Spinner Component
import React from 'react';

export const Spinner = ({ size = 'md', variant = 'primary', className = '' }) => {
  const sizes = {
    xs: 'h-4 w-4 border-2',
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
    xl: 'h-16 w-16 border-4',
  };

  const variants = {
    primary: 'border-primary border-t-transparent',
    white: 'border-white border-t-transparent',
    neutral: 'border-neutral-500 border-t-transparent',
  };

  return (
    <div
      className={`animate-spin rounded-full border-solid ${sizes[size]} ${variants[variant]} ${className}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;
