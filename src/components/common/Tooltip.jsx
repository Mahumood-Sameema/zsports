// Tooltip Component
import React, { useState } from 'react';

export const Tooltip = ({ content, children, position = 'top' }) => {
  const [active, setActive] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowPositions = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-neutral-900 border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-neutral-900 border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-neutral-900 border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-neutral-900 border-y-transparent border-l-transparent',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      focus="true"
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
    >
      {children}
      {active && content && (
        <div className={`absolute z-40 whitespace-nowrap bg-neutral-900 text-white text-[11px] font-medium py-1 px-2.5 rounded shadow-lg transition-opacity duration-150 ${positions[position]}`}>
          {content}
          <div className={`absolute border-[4px] border-solid ${arrowPositions[position]}`} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
