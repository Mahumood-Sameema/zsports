// StaffTodaySchedulePage Component
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { bookingRepository, venueRepository, courtRepository } from '../../../repositories';
import { format } from 'date-fns';
import { ClipboardList, Calendar, CheckSquare, Search } from 'lucide-react';
import Button from '../../../components/common/Button';
import SearchInput from '../../../components/common/SearchInput';
import StatusBadge from '../../../components/common/StatusBadge';
import LoadingCard from '../../../components/common/LoadingCard';
import ErrorState from '../../../components/common/ErrorState';

export const StaffTodaySchedulePage = () => {
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [courtFilter, setCourtFilter] = useState('all');
  const [search, setSearch] = useState('');

  // 1. Get staff profile to find assigned venueId
  const venueId = currentUser?.venueId || 'venue-1';

  // 2. Fetch courts list for filter options
  const { data: courts = [] } = useQuery({
    queryKey: ['staff-venue-courts', venueId],
    queryFn: () => courtRepository.getCourtsByVenue(venueId),
    enabled: !!venueId
  });

  // 3. Fetch bookings for this date and venue
  const { data: bookings = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['staff-schedule-bookings', venueId, selectedDate],
    queryFn: () => bookingRepository.getBookingsForDate(venueId, selectedDate),
    enabled: !!venueId && !!selectedDate
  });

  const handleCheckIn = async (bookingId) => {
    try {
      await bookingRepository.checkIn(bookingId, currentUser?.uid || 'user-staff');
      refetch();
    } catch (err) {
      alert(err.message || 'Check-in failed.');
    }
  };

  const filteredBookings = bookings.filter(b => {
    const q = search.toLowerCase();
    const searchMatch = b.customerName.toLowerCase().includes(q) || b.bookingRef.toLowerCase().includes(q);
    const courtMatch = courtFilter === 'all' || b.courtId === courtFilter;
    return searchMatch && courtMatch;
  });

  return (
    <div className="space-y-6 text-slate-350 select-none">
      {/* Top title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Today's Schedule</h2>
          <p className="text-xs text-slate-600 mt-1">Review lists of checking arrivals, cash walkins, and validation entries.</p>
        </div>
      </div>

      {/* Date picker and Court selector row */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-slate-50/20 p-4 border border-slate-200 rounded-xl">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-bold rounded border border-slate-200 bg-white py-1.5 px-3 focus:outline-none focus:ring-primary text-slate-350"
            />
          </div>

          <select
            value={courtFilter}
            onChange={(e) => setCourtFilter(e.target.value)}
            className="text-xs font-bold rounded border border-slate-200 bg-white py-1.5 px-3 focus:outline-none focus:ring-primary text-slate-350"
          >
            <option value="all">All Courts</option>
            {courts.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="Search by customer or ref..."
          className="max-w-xs bg-white border-slate-200 focus:border-primary text-slate-900"
        />
      </div>

      {/* Bookings Schedule List */}
      {isLoading ? (
        <LoadingCard message="Loading schedule list..." />
      ) : isError ? (
        <ErrorState message="Failed to load daily schedule details." />
      ) : filteredBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/10 border border-dashed border-slate-200 rounded-xl text-slate-500 font-medium">
          <ClipboardList size={36} className="text-slate-650 mb-3" />
          <p className="text-sm">No reservations scheduled for this selection.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/20">
          <table className="min-w-full divide-y divide-slate-200 text-xs text-slate-700">
            <thead className="bg-slate-100 font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-6 py-3.5 text-left">Time</th>
                <th className="px-6 py-3.5 text-left">Reference</th>
                <th className="px-6 py-3.5 text-left">Customer</th>
                <th className="px-6 py-3.5 text-left">Court / Sport</th>
                <th className="px-6 py-3.5 text-left">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white/35 font-medium">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-white/60 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {b.startTime} - {b.endTime}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider">
                    {b.bookingRef}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{b.customerName}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{b.customerPhone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-700">{b.courtName}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{b.sport}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {b.checkedIn ? (
                      <span className="text-[10px] bg-emerald-500/10 text-accent-green px-2.5 py-1 border border-emerald-500/20 rounded font-semibold uppercase">
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
                      <span className="text-[10px] text-slate-500">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StaffTodaySchedulePage;
