// Input Component (with ref forwarding for React Hook Form)
import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  error,
  helperText,
  leftIcon = null,
  rightIcon = null,
  type = 'text',
  placeholder = '',
  disabled = false,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  const errorBorder = error ? 'border-accent-red focus:ring-accent-red focus:border-accent-red' : 'border-neutral-200 focus:ring-primary focus:border-primary';
  const disabledBg = disabled ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed' : 'bg-white text-neutral-900';

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <div className="relative rounded shadow-sm">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          className={`block w-full rounded border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${errorBorder} ${disabledBg}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-accent-red font-medium">
          {error.message || error}
        </p>
      )}
      {!error && helperText && (
        <p className="mt-1 text-xs text-neutral-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
