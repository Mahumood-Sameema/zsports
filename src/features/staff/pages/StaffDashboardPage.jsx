// StaffDashboardPage Component
import React from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { bookingRepository, venueRepository, slotRepository } from '../../../repositories';
import { format, parseISO, isBefore, addHours } from 'date-fns';
import { 
  CalendarRange, CheckSquare, Clock, UserPlus, Search, 
  Settings2, Bell, AlertTriangle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Avatar from '../../../components/common/Avatar';
import Button from '../../../components/common/Button';
import LoadingCard from '../../../components/common/LoadingCard';
import ErrorState from '../../../components/common/ErrorState';

export const StaffDashboardPage = () => {
  const { currentUser } = useAuth();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const venueId = currentUser?.venueId || 'venue-1';

  // Fetch venue detail
  const { data: venue } = useQuery({
    queryKey: ['staff-assigned-venue', venueId],
    queryFn: () => venueRepository.getVenueById(venueId),
    enabled: !!venueId
  });

  // Fetch today's bookings
  const { data: bookings = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['staff-today-bookings', venueId, todayStr],
    queryFn: () => bookingRepository.getBookingsForDate(venueId, todayStr),
    enabled: !!venueId
  });

  const handleCheckIn = async (bookingId) => {
    try {
      await bookingRepository.checkIn(bookingId, currentUser.uid);
      refetch();
    } catch (err) {
      alert(err.message || 'Check-in failed.');
    }
  };

  const totalBookings = bookings.length;
  const checkedInCount = bookings.filter(b => b.checkedIn).length;
  const pendingCount = bookings.filter(b => !b.checkedIn && b.status === 'confirmed').length;

  // Filter bookings starting within the next 60 minutes
  const upcomingSoon = bookings.filter(b => {
    if (b.checkedIn || b.status !== 'confirmed') return false;
    try {
      const start = parseISO(`${todayStr}T${b.startTime}:00`);
      const limit = addHours(new Date(), 1);
      return isBefore(start, limit) && isBefore(new Date(), start);
    } catch {
      return false;
    }
  });

  if (isLoading) return <LoadingCard message="Loading operational dashboard..." />;
  if (isError) return <ErrorState message="Failed to load daily dashboard details." />;

  return (
    <div className="space-y-6 text-slate-350 select-none pb-12">
      {/* Welcome header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Welcome back, {currentUser?.displayName}!
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Venue: {venue?.name || 'Loading assigned venue...'} &bull; Today: {format(new Date(), 'EEEE, MMMM dd')}
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <Link to="/dashboard/staff/walk-in">
            <Button variant="primary" size="sm" leftIcon={<UserPlus size={14} />}>
              Walk-in Booking
            </Button>
          </Link>
          <Link to="/dashboard/staff/slots">
            <Button variant="outline" size="sm" leftIcon={<Settings2 size={14} />} className="border-slate-200 text-slate-700 hover:bg-slate-100">
              Overrides
            </Button>
          </Link>
        </div>
      </div>

      {/* Daily KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-1">
          <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Today's Bookings</span>
          <span className="text-xl font-extrabold text-slate-900 block">{totalBookings}</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-1">
          <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Checked In</span>
          <span className="text-xl font-extrabold text-accent-green block">{checkedInCount}</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-1">
          <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pending</span>
          <span className="text-xl font-extrabold text-accent-amber block">{pendingCount}</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-1">
          <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Available Slots</span>
          <span className="text-xl font-extrabold text-slate-600 block">45 remaining</span>
        </div>
      </div>

      {/* Main Grid: Arrivals schedule on left, Urgencies alerts on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Arrivals timeline */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <CalendarRange size={16} className="text-primary" />
            Daily Arrivals Timeline
          </h3>

          {bookings.length === 0 ? (
            <p className="text-xs font-semibold text-slate-500 py-6 text-center">No arrivals scheduled for today.</p>
          ) : (
            <div className="space-y-3.5 divide-y divide-slate-200">
              {bookings.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((b, idx) => (
                <div key={b.id} className="flex justify-between items-center pt-3.5 first:pt-0 gap-4 text-xs font-semibold select-none">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">{b.startTime} - {b.endTime}</span>
                    <h4 className="text-slate-900 font-bold">{b.customerName}</h4>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">{b.courtName} ({b.sport})</p>
                  </div>
                  
                  <div>
                    {b.checkedIn ? (
                      <span className="text-[9px] bg-emerald-500/15 text-accent-green border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        Checked In
                      </span>
                    ) : b.status === 'confirmed' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<CheckSquare size={13} />}
                        onClick={() => handleCheckIn(b.id)}
                      >
                        Check In
                      </Button>
                    ) : (
                      <span className="text-slate-500 capitalize">{b.status}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Urgencies (Next Hour) & Lookup shortcut */}
        <div className="space-y-6">
          
          {/* Upcoming in next 60m */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={16} className="text-accent-amber animate-pulse" />
              Starting within 60 mins
            </h3>

            {upcomingSoon.length === 0 ? (
              <p className="text-xs font-semibold text-slate-550 py-4 text-center">No bookings starting shortly.</p>
            ) : (
              <div className="space-y-3">
                {upcomingSoon.map((b) => (
                  <div key={b.id} className="p-3 border border-slate-200 bg-slate-50/20 rounded-lg flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">{b.customerName}</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">{b.courtName} &bull; {b.startTime}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCheckIn(b.id)}
                      className="border-slate-200 hover:bg-slate-100"
                    >
                      Check-In
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Lookup Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Quick Customer Search
            </h3>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Scan check-in references, customer phone numbers, or emails immediately.</p>
            <Link to="/dashboard/staff/customers" className="block">
              <Button variant="outline" size="sm" leftIcon={<Search size={14} />} fullWidth className="border-slate-200 text-slate-350 hover:bg-slate-100">
                Lookup Console
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboardPage;
