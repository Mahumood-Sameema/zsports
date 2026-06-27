// EmptyState Component
import React from 'react';
import Button from './Button';

export const EmptyState = ({
  icon: IconComponent = null,
  title = 'No records found',
  message = 'Try adjusting your search filters or check back later.',
  action = null,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-neutral-200 bg-white rounded-xl max-w-lg mx-auto shadow-sm my-6">
      {IconComponent && (
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-slate-50 text-neutral-400 mb-4 ring-8 ring-slate-50/50">
          <IconComponent size={28} />
        </div>
      )}
      <h3 className="text-base font-semibold text-neutral-900 mb-1">{title}</h3>
      <p className="text-sm text-neutral-500 max-w-sm mb-6 leading-relaxed">{message}</p>
      {action && (
        <Button onClick={action.onClick} variant="primary" size="md">
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
