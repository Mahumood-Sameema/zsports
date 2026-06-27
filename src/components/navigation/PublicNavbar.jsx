// PublicNavbar Component
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Trophy, Menu, X, ChevronDown, User, Calendar, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { motion, AnimatePresence } from 'framer-motion';

export const PublicNavbar = () => {
  const { currentUser, logout, role } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Venues', path: '/venues' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'FAQ', path: '/faq' },
  ];

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!role) return '/';
    return `/dashboard/${role.toLowerCase()}`;
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-neutral-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-neutral-900">
              <div className="h-9 w-9 bg-primary rounded-lg flex items-center justify-center text-white shadow">
                <Trophy size={18} className="fill-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">ZSports</span>
            </Link>
            
            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all ${
                      isActive
                        ? 'border-primary text-neutral-900 font-semibold'
                        : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex md:items-center md:gap-4">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Avatar src={currentUser.avatarUrl} name={currentUser.displayName} size="sm" />
                  <span className="text-sm font-semibold text-neutral-700 max-w-[120px] truncate">
                    {currentUser.displayName}
                  </span>
                  <ChevronDown size={14} className="text-neutral-500" />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 rounded bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none border border-neutral-100 z-20"
                      >
                        <Link
                          to={getDashboardPath()}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-700 hover:bg-slate-50"
                        >
                          <LayoutDashboard size={16} />
                          <span>Dashboard</span>
                        </Link>
                        {role === 'customer' && (
                          <>
                            <Link
                              to="/dashboard/customer/bookings"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-700 hover:bg-slate-50"
                            >
                              <Calendar size={16} />
                              <span>My Bookings</span>
                            </Link>
                            <Link
                              to="/dashboard/customer/profile"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-700 hover:bg-slate-50"
                            >
                              <User size={16} />
                              <span>My Profile</span>
                            </Link>
                          </>
                        )}
                        <hr className="my-1 border-neutral-100" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm text-accent-red hover:bg-red-50 font-semibold"
                        >
                          <LogOut size={16} />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="outline" size="sm">Sign In</Button>
                </Link>
                <Link to="/login?tab=register">
                  <Button variant="primary" size="sm">Register</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger Mobile Icon */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-neutral-500 hover:text-neutral-700 p-2 rounded focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-in Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-neutral-100 bg-white"
          >
            <div className="px-2 pt-2 pb-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded text-base font-semibold text-neutral-700 hover:bg-slate-50 hover:text-neutral-900"
                >
                  {link.label}
                </Link>
              ))}

              <hr className="my-2 border-neutral-100" />
              
              {currentUser ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <Avatar src={currentUser.avatarUrl} name={currentUser.displayName} size="sm" />
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">{currentUser.displayName}</p>
                      <p className="text-xs text-neutral-500 capitalize">{role}</p>
                    </div>
                  </div>
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded text-sm text-neutral-600 hover:bg-slate-50"
                  >
                    Dashboard
                  </Link>
                  {role === 'customer' && (
                    <>
                      <Link
                        to="/dashboard/customer/bookings"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded text-sm text-neutral-600 hover:bg-slate-50"
                      >
                        My Bookings
                      </Link>
                      <Link
                        to="/dashboard/customer/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded text-sm text-neutral-600 hover:bg-slate-50"
                      >
                        My Profile
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded text-sm font-semibold text-accent-red hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 p-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" fullWidth>Sign In</Button>
                  </Link>
                  <Link to="/login?tab=register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="sm" fullWidth>Register</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default PublicNavbar;
