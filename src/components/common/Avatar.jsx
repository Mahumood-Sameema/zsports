// Avatar Component
import React from 'react';

export const Avatar = ({ src, name = 'User', size = 'md', className = '' }) => {
  const sizes = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-xl',
    xl: 'h-24 w-24 text-3xl',
  };

  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    const parts = fullName.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Generate deterministic color background based on name hash
  const getBgColor = (text) => {
    const colors = [
      'bg-blue-500 text-white',
      'bg-indigo-500 text-white',
      'bg-emerald-500 text-white',
      'bg-amber-500 text-white',
      'bg-rose-500 text-white',
      'bg-purple-500 text-white',
    ];
    let sum = 0;
    for (let i = 0; i < text.length; i++) {
      sum += text.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  return (
    <div className={`relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 select-none ${sizes[size]} ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      ) : (
        <div className={`flex h-full w-full items-center justify-center font-bold tracking-wider ${getBgColor(name)}`}>
          {getInitials(name)}
        </div>
      )}
    </div>
  );
};

export default Avatar;
