// Badge Component
import React from 'react';

export const Badge = ({ children, variant = 'neutral', className = '' }) => {
  const colors = {
    primary: 'bg-primary-light text-primary',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${colors[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
