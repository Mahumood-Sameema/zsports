// TabGroup Component
import React from 'react';

export const TabGroup = ({
  tabs = [],
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`border-b border-neutral-200 w-full overflow-x-auto scrollbar-none ${className}`}>
      <nav className="-mb-px flex space-x-6 min-w-max" aria-label="Tabs">
        {tabs.map((tab) => {
          const tabId = typeof tab === 'object' ? tab.id : tab;
          const tabLabel = typeof tab === 'object' ? tab.label : tab;
          const isSelected = tabId === activeTab;

          return (
            <button
              key={tabId}
              onClick={() => onChange(tabId)}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-all select-none ${
                isSelected
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-200'
              }`}
            >
              {tabLabel}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default TabGroup;
