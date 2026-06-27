// DashboardLayout Component
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import AdminSidebar from '../navigation/AdminSidebar';
import CustomerSidebar from '../navigation/CustomerSidebar';
import StaffSidebar from '../navigation/StaffSidebar';
import DashboardHeader from '../navigation/DashboardHeader';
import MobileBottomNav from '../navigation/MobileBottomNav';
import Drawer from '../common/Drawer';

export const DashboardLayout = () => {
  const { role, userProfile } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Helper to map route paths to screen titles
  const getHeaderTitle = () => {
    const path = location.pathname;
    if (path.includes('/venues')) return 'Venues Directory';
    if (path.includes('/courts')) return 'Court Configurations';
    if (path.includes('/slots')) return 'Schedules & Slots';
    if (path.includes('/bookings')) return 'Reservations Ledger';
    if (path.includes('/customers')) return 'Customer Records';
    if (path.includes('/reviews')) return 'Moderation Reviews';
    if (path.includes('/payments')) return 'Financial Transactions';
    if (path.includes('/coupons')) return 'Campaign Coupons';
    if (path.includes('/reports')) return 'Business Analytics';
    if (path.includes('/staff')) return 'Staff Allocation';
    if (path.includes('/settings')) return 'System Settings';
    if (path.includes('/profile')) return 'Account Profile';
    if (path.includes('/book')) return 'Court Reservation Wizard';
    if (path.includes('/notifications')) return 'Action Notifications';
    return 'Console Overview';
  };

  const renderSidebar = (onCloseHandler = null) => {
    const activeRole = role?.toLowerCase();
    if (activeRole === 'admin') {
      return <AdminSidebar onClose={onCloseHandler} />;
    }
    if (activeRole === 'staff') {
      return <StaffSidebar onClose={onCloseHandler} />;
    }
    return <CustomerSidebar onClose={onCloseHandler} />;
  };

  // Admin/Staff Portal uses a clean light background wrapper
  const isAdminOrStaff = ['admin', 'staff'].includes(role?.toLowerCase());
  const layoutBg = isAdminOrStaff ? 'bg-white text-slate-900' : 'bg-slate-50 text-neutral-900';

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${layoutBg}`}>
      {/* Desktop Sidebar (Left side, fixed width, hidden on mobile) */}
      <div className="hidden md:block w-60 shrink-0 h-full">
        {renderSidebar()}
      </div>

      {/* Main viewport (Header + Scrollable Body) */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden relative">
        <DashboardHeader 
          onMenuClick={() => setMobileSidebarOpen(true)} 
          title={getHeaderTitle()} 
        />
        
        {/* Rendered Dashboard Screen Content */}
        <main className="flex-grow overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer Sidebar overlay */}
      <Drawer
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        title="Menu Navigation"
        position="left"
      >
        <div className="h-full -mx-6 -my-6">
          {renderSidebar(() => setMobileSidebarOpen(false))}
        </div>
      </Drawer>

      {/* Mobile Bottom Shortcut keys */}
      <MobileBottomNav />
    </div>
  );
};

export default DashboardLayout;
