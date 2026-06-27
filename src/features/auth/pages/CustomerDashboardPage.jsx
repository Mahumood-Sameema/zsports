// CustomerDashboardPage Component
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useBookings } from '../../bookings/hooks/useBookings';
import { notificationRepository } from '../../../repositories';
import { 
  Trophy, Calendar, CreditCard, Bell, ArrowRight, 
  MapPin, Clock, Search, ChevronRight, CheckCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Spinner from '../../../components/common/Spinner';
import Card from '../../../components/common/LoadingCard'; // loading placeholder
import { format, parseISO } from 'date-fns';

export const CustomerDashboardPage = () => {
  const { currentUser } = useAuth();
  const { data: bookings = [], isLoading: bookingsLoading } = useBookings(currentUser?.uid, 'customer');
  const [notifications, setNotifications] = useState([]);
  const [notifsLoading, setNotifsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = notificationRepository.subscribeToNotifications(
      currentUser.uid,
      (list) => {
        setNotifications(list.slice(0, 4)); // Show top 4 recent
        setNotifsLoading(false);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser?.uid]);

  if (bookingsLoading || notifsLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <Spinner size="lg" />
        <p className="mt-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          Loading player profile & stats...
        </p>
      </div>
    );
  }

  // Calculate statistics
  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(b => b.status === 'confirmed').length;
  const totalSpent = bookings.filter(b => b.status === 'confirmed' || b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalAmount, 0);

  // Get upcoming bookings sorted chronologically
  const upcomingBookings = bookings
    .filter(b => b.status === 'confirmed')
    .slice(0, 3); // top 3 upcoming

  return (
    <div className="space-y-8 select-none text-neutral-600 font-normal">
      {/* Greetings Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-neutral-100 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
            Welcome back, {currentUser?.displayName || 'Player'}!
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Track your matches, manage court times, and review notifications below.
          </p>
        </div>
        <Link to="/venues">
          <button className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold uppercase tracking-wider rounded inline-flex items-center gap-1.5 shadow-xs transition-colors">
            <Search size={14} /> Browse Venues
          </button>
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 bg-primary-light text-primary rounded-lg flex items-center justify-center">
            <Calendar size={20} />
          </div>
          <div>
            <span className="block text-2xs font-bold text-neutral-400 uppercase tracking-wider">Total Bookings</span>
            <span className="block text-xl font-black text-neutral-900 mt-0.5">{totalBookings}</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center border border-emerald-100">
            <Trophy size={20} />
          </div>
          <div>
            <span className="block text-2xs font-bold text-neutral-400 uppercase tracking-wider">Active Bookings</span>
            <span className="block text-xl font-black text-neutral-900 mt-0.5">{activeBookings}</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center border border-amber-100">
            <CreditCard size={20} />
          </div>
          <div>
            <span className="block text-2xs font-bold text-neutral-400 uppercase tracking-wider">Total Spent</span>
            <span className="block text-xl font-black text-neutral-900 mt-0.5">₹{totalSpent}</span>
          </div>
        </div>
      </div>

      {/* Main Content Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1: Upcoming Matches / Bookings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">Upcoming Bookings</h2>
            {bookings.length > 0 && (
              <Link 
                to="/dashboard/customer/bookings" 
                className="text-primary hover:underline text-xs font-semibold flex items-center gap-0.5"
              >
                View all <ChevronRight size={14} />
              </Link>
            )}
          </div>

          {upcomingBookings.length === 0 ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center flex flex-col items-center justify-center space-y-4 shadow-2xs">
              <div className="h-12 w-12 bg-slate-50 text-neutral-400 rounded-full flex items-center justify-center">
                <Calendar size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-neutral-800">No upcoming matches scheduled</h3>
                <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                  Your court calendar is clear! Book a local turf court or play area to get started.
                </p>
              </div>
              <Link to="/venues">
                <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-neutral-700 text-xs font-bold rounded uppercase tracking-wider transition-colors">
                  Browse Venues
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((b) => (
                <div 
                  key={b.id} 
                  className="bg-white border border-neutral-200 hover:border-neutral-300 transition-all rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="space-y-3">
                    {/* Booking header details */}
                    <div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-light text-primary uppercase tracking-wide">
                        {b.sport || 'Sports'}
                      </span>
                      <h3 className="text-sm font-bold text-neutral-900 mt-1">{b.courtName}</h3>
                      <p className="text-xs text-neutral-500 flex items-center gap-1.5 mt-0.5">
                        <MapPin size={12} className="text-neutral-450 shrink-0" /> {b.venueName}
                      </p>
                    </div>

                    {/* Date and slots */}
                    <div className="flex flex-wrap gap-4 text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-neutral-600 bg-slate-50 px-2 py-1 rounded">
                        <Calendar size={13} className="text-neutral-450 shrink-0" />
                        {format(parseISO(b.date), 'MMM dd, yyyy')}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-neutral-600 bg-slate-50 px-2 py-1 rounded">
                        <Clock size={13} className="text-neutral-450 shrink-0" />
                        {b.startTime} - {b.endTime}
                      </span>
                    </div>
                  </div>

                  {/* Right side operations */}
                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 border-t sm:border-t-0 border-neutral-100 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <span className="block text-2xs font-semibold text-neutral-400 uppercase tracking-wider">Ref ID</span>
                      <span className="block text-xs font-mono font-bold text-neutral-700">{b.bookingRef}</span>
                    </div>

                    <Link to={`/dashboard/customer/bookings/${b.id}`}>
                      <button className="px-3.5 py-1.5 bg-slate-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded inline-flex items-center gap-1 transition-colors">
                        View Ticket <ArrowRight size={13} />
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column 2: Recent Activity / Live Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">Recent Alerts</h2>
            <Link 
              to="/dashboard/customer/notifications" 
              className="text-primary hover:underline text-xs font-semibold flex items-center gap-0.5"
            >
              Inbox <ChevronRight size={14} />
            </Link>
          </div>

          {notifications.length === 0 ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-6 text-center text-neutral-400 flex flex-col items-center justify-center space-y-3">
              <Bell size={24} className="text-neutral-300" />
              <p className="text-xs">No active notifications.</p>
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-2xs divide-y divide-neutral-100">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-4 transition-colors flex items-start gap-3 text-xs leading-relaxed ${
                    n.isRead ? 'bg-white' : 'bg-primary-light/5'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${n.isRead ? 'bg-neutral-200' : 'bg-primary'}`} />
                  <div className="space-y-1 flex-1">
                    <h4 className="font-bold text-neutral-900 text-2xs leading-tight">{n.title}</h4>
                    <p className="text-neutral-500 text-2xs">{n.message}</p>
                    <span className="text-[9px] text-neutral-400 font-semibold block mt-1">
                      {format(parseISO(n.createdAt), 'MMM dd, hh:mm a')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick shortcuts / support card */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-amber-400">Need Assistance?</h3>
            <p className="text-2xs text-slate-300 leading-relaxed">
              Have issues checking in or need refunds? Check FAQs or get in touch with our live support.
            </p>
            <div className="flex gap-3 pt-1">
              <Link to="/faq" className="text-2xs font-bold text-white underline hover:text-slate-200">
                Read FAQs
              </Link>
              <Link to="/contact" className="text-2xs font-bold text-white underline hover:text-slate-200">
                Contact Form
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboardPage;
