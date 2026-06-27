// ErrorState Component
import React from 'react';
import { AlertCircle } from 'lucide-react';
import Button from './Button';

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'We encountered an error while loading this page. Please try again.',
  retryAction = null,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-rose-50/30 border border-rose-100 rounded-xl max-w-lg mx-auto shadow-sm my-6">
      <div className="flex items-center justify-center h-14 w-14 rounded-full bg-rose-100/50 text-accent-red mb-4">
        <AlertCircle size={28} />
      </div>
      <h3 className="text-base font-semibold text-neutral-900 mb-1">{title}</h3>
      <p className="text-sm text-neutral-500 max-w-sm mb-6 leading-relaxed">{message}</p>
      {retryAction && (
        <Button onClick={retryAction.onClick} variant="danger" size="md">
          {retryAction.label || 'Retry'}
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
