// ServerErrorPage Component
import React from 'react';
import { ShieldX, RefreshCw } from 'lucide-react';
import Button from '../../../components/common/Button';

export const ServerErrorPage = () => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 select-none text-neutral-600 font-normal">
      <div className="space-y-6 max-w-md mx-auto">
        {/* Visual indicators */}
        <div className="h-24 w-24 bg-red-50 text-accent-red rounded-full flex items-center justify-center border border-red-100 shadow-sm mx-auto">
          <ShieldX size={48} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Database Connection Fault!</h1>
          <p className="text-xs text-neutral-500 leading-relaxed font-semibold">
            An unexpected error occurred during database communications. ZSports logs have registered this occurrence.
          </p>
          <p className="text-3xs text-neutral-400">
            Please verify network configurations or click below to trigger a retry.
          </p>
        </div>

        <div className="pt-2">
          <Button 
            variant="primary" 
            size="sm" 
            leftIcon={<RefreshCw size={14} />}
            onClick={handleReload}
          >
            Retry Connection
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServerErrorPage;
