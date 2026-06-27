// PublicLayout Component
import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from '../navigation/PublicNavbar';
import PublicFooter from '../navigation/PublicFooter';

export const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation header */}
      <PublicNavbar />

      {/* Main viewport area */}
      <main className="flex-grow bg-slate-50">
        <Outlet />
      </main>

      {/* Footer footer */}
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;
