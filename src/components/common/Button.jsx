// Button Component
import React from 'react';
import Spinner from './Spinner';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  fullWidth = false,
  onClick,
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 rounded';

  const variants = {
    primary: 'bg-primary hover:bg-primary-dark text-white focus:ring-primary',
    secondary: 'bg-primary-light hover:bg-blue-100 text-primary focus:ring-primary',
    outline: 'border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 focus:ring-neutral-500',
    ghost: 'hover:bg-neutral-100 text-neutral-700 focus:ring-neutral-500',
    danger: 'bg-accent-red hover:bg-red-700 text-white focus:ring-accent-red',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const widthStyle = fullWidth ? 'w-full' : '';
  const opacityStyle = disabled || loading ? 'opacity-60 cursor-not-allowed active:scale-100' : 'cursor-pointer';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${widthStyle} ${opacityStyle} ${className}`}
      {...props}
    >
      {loading && <Spinner size="xs" variant={variant === 'primary' || variant === 'danger' ? 'white' : 'primary'} className="mr-2" />}
      {!loading && leftIcon && <span className="mr-2 inline-flex">{leftIcon}</span>}
      <span>{children}</span>
      {!loading && rightIcon && <span className="ml-2 inline-flex">{rightIcon}</span>}
    </button>
  );
};

export default Button;
