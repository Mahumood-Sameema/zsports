// UnauthorizedPage Component
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import Button from '../../../components/common/Button';
import { useAuth } from '../hooks/useAuth';

export const UnauthorizedPage = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 select-none text-neutral-600 font-normal">
      <div className="space-y-6 max-w-md mx-auto">
        {/* Visual Shield Alert badge */}
        <div className="relative mx-auto h-24 w-24 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center border border-amber-100 shadow-sm animate-bounce">
          <ShieldAlert size={48} />
          <span className="absolute -bottom-1 -right-1 bg-neutral-900 text-white text-3xs font-extrabold px-1.5 py-0.5 rounded-full border border-white">
            403
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Access Denied!</h1>
          <p className="text-xs text-neutral-500 leading-relaxed font-semibold">
            You do not possess the required credentials or permission permissions to access this dashboard panel.
          </p>
          <p className="text-3xs text-neutral-400">
            If you believe this is a configuration error, please consult your operations administrator.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            leftIcon={<ArrowLeft size={14} />}
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>

          <Button 
            variant="danger" 
            size="sm" 
            leftIcon={<LogIn size={14} />}
            onClick={logout}
          >
            Sign Out & Switch Portal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
