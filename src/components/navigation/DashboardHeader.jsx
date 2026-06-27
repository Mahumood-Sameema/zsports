// DashboardHeader Component
import React, { useState } from 'react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import Avatar from '../common/Avatar';
import { Bell, Menu, LogOut, User, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const DashboardHeader = ({ onMenuClick, title = 'Dashboard' }) => {
  const { currentUser, logout, role } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  // Simple Notification mock counts
  const unreadCount = 3;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getProfilePath = () => {
    if (role === 'customer') return '/dashboard/customer/profile';
    if (role === 'admin') return '/dashboard/admin/settings';
    return '/';
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-neutral-200 bg-white px-4 md:px-6 shadow-sm select-none">
      {/* Mobile Menu Icon + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="text-neutral-500 hover:text-neutral-700 md:hidden p-1 rounded hover:bg-slate-50 focus:outline-none"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base font-bold text-neutral-800 md:text-lg leading-none">
          {title}
        </h1>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <Link 
          to={role === 'customer' ? '/dashboard/customer/notifications' : role === 'admin' ? '/dashboard/admin/notifications' : '/dashboard/staff/notifications'}
          className="relative text-neutral-500 hover:text-neutral-700 p-1.5 rounded-full hover:bg-slate-50 transition-colors"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-accent-red animate-pulse" />
          )}
        </Link>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-full"
          >
            <Avatar src={currentUser?.avatarUrl} name={currentUser?.displayName || 'User'} size="sm" />
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 mt-2 w-48 rounded bg-white py-1 shadow-lg ring-1 ring-black/5 border border-neutral-100 z-20">
                <div className="px-4 py-2 border-b border-neutral-100">
                  <p className="text-xs font-bold text-neutral-800 truncate">{currentUser?.displayName}</p>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold mt-0.5">{role}</p>
                </div>
                
                <Link
                  to={getProfilePath()}
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-neutral-700 hover:bg-slate-50"
                >
                  <User size={14} />
                  <span>My Profile</span>
                </Link>

                <hr className="border-neutral-100" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs text-accent-red hover:bg-red-50 font-semibold"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
