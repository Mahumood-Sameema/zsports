// MobileBottomNav Component
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { 
  LayoutDashboard, Calendar, Search, User, 
  Building2, Users, ClipboardList 
} from 'lucide-react';

export const MobileBottomNav = () => {
  const { role } = useAuth();
  if (!role) return null;

  const config = {
    customer: [
      { label: 'Dash', path: '/dashboard/customer', icon: LayoutDashboard },
      { label: 'Bookings', path: '/dashboard/customer/bookings', icon: Calendar },
      { label: 'Venues', path: '/venues', icon: Building2 },
      { label: 'Profile', path: '/dashboard/customer/profile', icon: User },
    ],
    staff: [
      { label: 'Dash', path: '/dashboard/staff', icon: LayoutDashboard },
      { label: 'Today', path: '/dashboard/staff/schedule', icon: Calendar },
      { label: 'Walk-in', path: '/dashboard/staff/walk-in', icon: ClipboardList },
    ],
    admin: [
      { label: 'Dash', path: '/dashboard/admin', icon: LayoutDashboard },
      { label: 'Venues', path: '/dashboard/admin/venues', icon: Building2 },
      { label: 'Bookings', path: '/dashboard/admin/bookings', icon: Calendar },
      { label: 'Clients', path: '/dashboard/admin/customers', icon: Users },
    ]
  };

  const navItems = config[role.toLowerCase()] || [];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-neutral-200 flex items-center justify-around z-40 px-2 shadow-lg select-none">
      {navItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={idx}
            to={item.path}
            end={item.path.endsWith('/customer') || item.path.endsWith('/staff') || item.path.endsWith('/admin')}
            className={({ isActive }) => 
              `flex flex-col items-center justify-center flex-1 py-1 text-center transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-neutral-400 hover:text-neutral-600'
              }`
            }
          >
            <Icon size={20} />
            <span className="text-[10px] mt-1 font-semibold uppercase tracking-wider">{item.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
};

export default MobileBottomNav;
