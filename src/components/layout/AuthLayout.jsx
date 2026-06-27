// AuthLayout Component
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Trophy } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-900 select-none">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand logo container */}
        <Link to="/" className="inline-flex items-center gap-2 text-white hover:opacity-90">
          <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg">
            <Trophy size={22} className="fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">ZSports Booking</span>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10 border border-neutral-100">
          {/* Nested routes are rendered here */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
