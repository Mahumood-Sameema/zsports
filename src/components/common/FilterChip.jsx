// FilterChip Component
import React from 'react';
import { X } from 'lucide-react';

export const FilterChip = ({
  label,
  selected = false,
  onClick,
  onRemove = null,
  className = '',
}) => {
  const activeStyle = selected 
    ? 'bg-primary border-primary text-white' 
    : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-colors select-none ${activeStyle} ${className}`}
    >
      <span>{label}</span>
      {onRemove && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={`ml-1.5 p-0.5 rounded-full inline-flex hover:bg-black/10 text-current transition-colors`}
        >
          <X size={10} strokeWidth={3} />
        </span>
      )}
    </button>
  );
};

export default FilterChip;
