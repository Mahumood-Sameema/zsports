// CustomerSidebar Component
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Calendar, Search, Star, Heart, 
  Bell, User, CreditCard, LogOut, Trophy, Globe 
} from 'lucide-react';
import Avatar from '../common/Avatar';
import { useAuth } from '../../features/auth/hooks/useAuth';

export const CustomerSidebar = ({ onClose }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard/customer', icon: LayoutDashboard },
    { label: 'My Bookings', path: '/dashboard/customer/bookings', icon: Calendar },
    { label: 'Browse Venues', path: '/venues', icon: Search },
    { label: 'My Reviews', path: '/dashboard/customer/reviews', icon: Star },
    { label: 'Favorites', path: '/dashboard/customer/favorites', icon: Heart },
    { label: 'Notifications', path: '/dashboard/customer/notifications', icon: Bell },
    { label: 'Profile', path: '/dashboard/customer/profile', icon: User },
    { label: 'Payment Methods', path: '/dashboard/customer/payments', icon: CreditCard },
  ];

  const activeStyle = 'bg-primary-light text-primary font-semibold border-l-4 border-primary';
  const inactiveStyle = 'text-neutral-500 hover:bg-slate-50 hover:text-neutral-900 border-l-4 border-transparent';

  return (
    <div className="flex flex-col h-full bg-white border-r border-neutral-200 select-none">
      {/* Brand logo */}
      <div className="flex h-16 items-center px-6 border-b border-neutral-100 gap-2 shrink-0">
        <div className="h-8 w-8 bg-primary rounded flex items-center justify-center text-white">
          <Trophy size={16} className="fill-white" />
        </div>
        <span className="text-sm font-bold text-neutral-800 tracking-tight">ZSports Player</span>
      </div>

      {/* User profile brief card */}
      <div className="flex flex-col items-center py-6 px-4 border-b border-neutral-100 shrink-0 bg-slate-50/50">
        <Avatar src={currentUser?.avatarUrl} name={currentUser?.displayName} size="lg" className="shadow-sm" />
        <h3 className="mt-3 text-sm font-bold text-neutral-800 truncate max-w-full text-center">
          {currentUser?.displayName}
        </h3>
        <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-light text-primary border border-primary/20 uppercase tracking-wide">
          Player
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
              end={item.path === '/dashboard/customer'}
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

      {/* Website link + Logout */}
      <div className="p-4 border-t border-neutral-100 shrink-0 space-y-1">
        <NavLink
          to="/"
          onClick={onClose}
          className="flex w-full items-center gap-3 px-4 py-2.5 rounded text-xs font-bold text-neutral-600 hover:bg-slate-50 hover:text-primary transition-colors"
        >
          <Globe size={16} />
          <span>BROWSE WEBSITE</span>
        </NavLink>
        <button
          onClick={async () => {
            try {
              await logout();
              navigate('/login');
            } catch (err) {
              console.error(err);
            }
          }}
          className="flex w-full items-center gap-3 px-4 py-2.5 rounded text-xs font-bold text-accent-red hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
          <span>SIGN OUT</span>
        </button>
      </div>
    </div>
  );
};

export default CustomerSidebar;
