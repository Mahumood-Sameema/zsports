// NotFoundPage Component
import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowRight, Home } from 'lucide-react';
import Button from '../../../components/common/Button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 select-none text-neutral-600 font-normal">
      <div className="space-y-6 max-w-md mx-auto">
        {/* Visual indicators */}
        <div className="relative mx-auto h-24 w-24 bg-rose-50 text-accent-red rounded-full flex items-center justify-center border border-rose-100 shadow-sm">
          <HelpCircle size={48} className="animate-pulse" />
          <span className="absolute -bottom-1 -right-1 bg-primary text-white text-3xs font-extrabold px-1.5 py-0.5 rounded-full border border-white">
            404
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Court Not Found!</h1>
          <p className="text-xs text-neutral-500 leading-relaxed">
            The page, court layout, or reservation reference you are searching for does not exist or has been moved to another domain feature.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/">
            <Button variant="outline" size="sm" leftIcon={<Home size={14} />}>
              Back to Home
            </Button>
          </Link>
          <Link to="/venues">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight size={14} />}>
              Browse Venues
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
