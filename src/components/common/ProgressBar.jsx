// ProgressBar Component
import React from 'react';

export const ProgressBar = ({ value = 0, className = '', color = 'primary' }) => {
  const percentage = Math.min(100, Math.max(0, value));

  const colors = {
    primary: 'bg-primary',
    success: 'bg-accent-green',
    danger: 'bg-accent-red',
  };

  return (
    <div className={`w-full bg-neutral-100 rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-300 ${colors[color]}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default ProgressBar;
