// AdminSidebar Component
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, Landmark, Clock, CalendarCheck, 
  Users, Star, CreditCard, Tag, ShieldCheck, 
  Bell, Settings, LogOut, Trophy, Terminal 
} from 'lucide-react';
import Avatar from '../common/Avatar';
import { useAuth } from '../../features/auth/hooks/useAuth';

export const AdminSidebar = ({ onClose }) => {
  const { currentUser, logout, role } = useAuth();
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Core',
      items: [
        { label: 'Overview', path: '/dashboard/admin', icon: LayoutDashboard },
      ]
    },
    {
      title: 'Venue Management',
      items: [
        { label: 'Venues', path: '/dashboard/admin/venues', icon: Building2 },
        { label: 'Courts', path: '/dashboard/admin/courts', icon: Landmark },
        { label: 'Slots Builder', path: '/dashboard/admin/slots', icon: Clock },
      ]
    },
    {
      title: 'Bookings & Clients',
      items: [
        { label: 'All Bookings', path: '/dashboard/admin/bookings', icon: CalendarCheck },
        { label: 'Customers', path: '/dashboard/admin/customers', icon: Users },
        { label: 'Reviews', path: '/dashboard/admin/reviews', icon: Star },
      ]
    },
    {
      title: 'Finance & Reports',
      items: [
        { label: 'Payments', path: '/dashboard/admin/payments', icon: CreditCard },
        { label: 'Coupons', path: '/dashboard/admin/coupons', icon: Tag },
      ]
    },
    {
      title: 'Administration',
      items: [
        { label: 'System Settings', path: '/dashboard/admin/settings', icon: Settings },
        { label: 'Roles & Permissions', path: '/dashboard/admin/permissions', icon: ShieldCheck },
        { label: 'Audit Logs', path: '/dashboard/admin/audit-logs', icon: Terminal },
        { label: 'Staff Management', path: '/dashboard/admin/staff', icon: ShieldCheck },
        { label: 'Notifications', path: '/dashboard/admin/notifications', icon: Bell },
      ]
    }
  ];

  const activeStyle = 'bg-primary/20 text-primary border-l-4 border-primary font-semibold';
  const inactiveStyle = 'text-slate-600 hover:bg-slate-100/40 hover:text-slate-900 border-l-4 border-transparent';

  return (
    <div className="flex flex-col h-full bg-white text-slate-700 border-r border-slate-200 select-none">
      {/* Brand logo */}
      <div className="flex h-16 items-center px-6 border-b border-slate-200 gap-2 shrink-0">
        <div className="h-8 w-8 bg-primary rounded flex items-center justify-center text-white">
          <Trophy size={16} className="fill-white" />
        </div>
        <span className="text-sm font-bold text-slate-900 tracking-tight">ZSports Console</span>
      </div>

      {/* Admin Profile */}
      <div className="flex flex-col items-center py-5 px-4 border-b border-slate-200 bg-slate-50/30 shrink-0">
        <Avatar src={currentUser?.avatarUrl} name={currentUser?.displayName} size="md" className="border border-slate-200 shadow" />
        <h3 className="mt-2 text-xs font-bold text-slate-900 truncate max-w-full">
          {currentUser?.displayName}
        </h3>
        <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary text-white uppercase tracking-wide">
          {role}
        </span>
      </div>

      {/* Dynamic Nav groups */}
      <div className="flex-grow overflow-y-auto py-4 space-y-6">
        {sections.map((section, sidx) => (
          <div key={sidx} className="px-3">
            <span className="block px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 select-none">
              {section.title}
            </span>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    end={item.path === '/dashboard/admin'}
                    className={({ isActive }) => 
                      `flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                        isActive ? activeStyle : inactiveStyle
                      }`
                    }
                  >
                    <Icon size={14} className="shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sign Out */}
      <div className="p-3 border-t border-slate-200 shrink-0">
        <button
          onClick={async () => {
            try {
              await logout();
              navigate('/admin/login');
            } catch (err) {
              console.error(err);
            }
          }}
          className="flex w-full items-center gap-2.5 px-3 py-2 rounded text-xs font-bold text-accent-red hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={14} />
          <span>SIGN OUT</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
