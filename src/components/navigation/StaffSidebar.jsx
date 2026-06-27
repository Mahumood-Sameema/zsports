// StaffSidebar Component
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, CalendarRange, BookOpen, UserPlus, 
  Settings2, Search, Bell, LogOut, Trophy 
} from 'lucide-react';
import Avatar from '../common/Avatar';
import { useAuth } from '../../features/auth/hooks/useAuth';

export const StaffSidebar = ({ onClose }) => {
  const { currentUser, logout, userProfile } = useAuth();
  const navigate = useNavigate();
  
  // Scoped menu items
  const menuItems = [
    { label: 'Dashboard', path: '/dashboard/staff', icon: LayoutDashboard },
    { label: "Today's Schedule", path: '/dashboard/staff/schedule', icon: CalendarRange },
    { label: 'Manage Bookings', path: '/dashboard/staff/bookings', icon: BookOpen },
    { label: 'Walk-in Booking', path: '/dashboard/staff/walk-in', icon: UserPlus },
    { label: 'Slot Overrides', path: '/dashboard/staff/slots', icon: Settings2 },
    { label: 'Customer Lookup', path: '/dashboard/staff/lookup', icon: Search },
    { label: 'Notifications', path: '/dashboard/staff/notifications', icon: Bell },
  ];

  const activeStyle = 'bg-primary/20 text-primary font-semibold border-l-4 border-primary';
  const inactiveStyle = 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-l-4 border-transparent';

  return (
    <div className="flex flex-col h-full bg-white text-slate-700 border-r border-slate-200 select-none">
      {/* Brand logo */}
      <div className="flex h-16 items-center px-6 border-b border-slate-200 gap-2 shrink-0">
        <div className="h-8 w-8 bg-primary rounded flex items-center justify-center text-white">
          <Trophy size={16} className="fill-white" />
        </div>
        <span className="text-sm font-bold text-slate-900 tracking-tight">ZSports Ops</span>
      </div>

      {/* Staff profile brief card */}
      <div className="flex flex-col items-center py-6 px-4 border-b border-slate-200 shrink-0 bg-slate-50/20">
        <Avatar src={currentUser?.avatarUrl} name={currentUser?.displayName} size="lg" className="shadow-inner border border-slate-200" />
        <h3 className="mt-3 text-sm font-bold text-slate-900 truncate max-w-full text-center">
          {currentUser?.displayName}
        </h3>
        <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-accent-green border border-emerald-500/20 uppercase tracking-wide">
          Staff
        </span>
      </div>

      {/* Navigation menu items */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              end={item.path === '/dashboard/staff'}
              className={({ isActive }) => 
                `flex items-center gap-3 px-6 py-3 text-xs font-semibold tracking-wider uppercase transition-all ${
                  isActive ? activeStyle : inactiveStyle
                }`
              }
            >
              <Icon size={16} className="shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="p-4 border-t border-slate-200 shrink-0">
        <button
          onClick={async () => {
            try {
              await logout();
              navigate('/admin/login');
            } catch (err) {
              console.error(err);
            }
          }}
          className="flex w-full items-center gap-3 px-4 py-2.5 rounded text-xs font-bold text-accent-red hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={16} />
          <span>SIGN OUT</span>
        </button>
      </div>
    </div>
  );
};

export default StaffSidebar;
