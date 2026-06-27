// AdminAllBookingsPage Component
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import useBookings from '../hooks/useBookings';
import { venueRepository, bookingRepository } from '../../../repositories';
import { Download, Eye, CalendarCheck, CheckSquare, XCircle, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Button from '../../../components/common/Button';
import SearchInput from '../../../components/common/SearchInput';
import StatusBadge from '../../../components/common/StatusBadge';
import LoadingCard from '../../../components/common/LoadingCard';
import ErrorState from '../../../components/common/ErrorState';
import Pagination from '../../../components/common/Pagination';

export const AdminAllBookingsPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVenueId, setSelectedVenueId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Load venues managed by this admin
  const { data: venues = [], isLoading: venuesLoading } = useQuery({
    queryKey: ['admin-venues-for-bookings', currentUser?.uid],
    queryFn: () => venueRepository.getAllVenues(),
    enabled: !!currentUser?.uid
  });

  useEffect(() => {
    if (venues && venues.length > 0 && !selectedVenueId) {
      setSelectedVenueId(venues[0].id);
    }
  }, [venues, selectedVenueId]);

  // Load bookings
  const { data: bookings = [], isLoading: bookingsLoading, isError, refetch } = useBookings(
    selectedVenueId,
    'admin',
    { status: statusFilter, search }
  );

  const handleCheckIn = async (bookingId) => {
    try {
      await bookingRepository.checkIn(bookingId, currentUser.uid);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking? This will release the slots.')) {
      try {
        await bookingRepository.cancelBooking(bookingId, 'Cancelled by Admin');
        refetch();
      } catch (err) {
        alert(err.message || 'Failed to cancel booking.');
      }
    }
  };

  const handleNoShow = async (bookingId) => {
    try {
      await bookingRepository.updateBookingStatus(bookingId, 'no_show');
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Reference', 'Customer Name', 'Court', 'Sport', 'Date', 'Time', 'Amount', 'Status', 'Checked In'];
    const rows = bookings.map(b => [
      b.bookingRef,
      `"${b.customerName}"`,
      `"${b.courtName}"`,
      `"${b.sport}"`,
      b.date,
      `${b.startTime}-${b.endTime}`,
      b.totalAmount,
      b.status,
      b.checkedIn ? 'Yes' : 'No'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bookings_${selectedVenueId}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(bookings.length / pageSize);
  const paginatedBookings = bookings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (venuesLoading) return <LoadingCard message="Loading venues config..." />;

  return (
    <div className="space-y-6 text-slate-350 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Bookings Ledger</h2>
          <p className="text-xs text-slate-600 mt-1">Review reservations, manage check-ins, cancel schedules, and print sheets.</p>
        </div>
        
        {bookings.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download size={14} />}
            onClick={handleExportCSV}
            className="border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            Export CSV
          </Button>
        )}
      </div>

      {/* Selectors and Filters toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/20 p-4 border border-slate-200 rounded-xl">
        <div className="flex flex-wrap gap-4 items-center flex-1">
          {venues.length > 1 && (
            <select
              value={selectedVenueId}
              onChange={(e) => { setSelectedVenueId(e.target.value); setCurrentPage(1); }}
              className="text-xs font-bold rounded border border-slate-200 bg-white py-1.5 px-3 focus:outline-none focus:ring-primary text-slate-350"
            >
              {venues.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          )}

          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            onClear={() => setSearch('')}
            placeholder="Search by customer or ref..."
            className="max-w-xs bg-white border-slate-200 focus:border-primary text-slate-900"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="text-xs font-bold rounded border border-slate-200 bg-white py-1.5 px-3 focus:outline-none focus:ring-primary text-slate-350 shrink-0"
        >
          <option value="all">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No Show</option>
        </select>
      </div>

      {/* Table grid */}
      {!selectedVenueId ? (
        <p className="text-xs font-semibold text-slate-500 text-center py-6">Create a venue first to start listings.</p>
      ) : bookingsLoading ? (
        <LoadingCard message="Loading bookings..." />
      ) : isError ? (
        <ErrorState message="Failed to load bookings ledger." />
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/10 border border-dashed border-slate-200 rounded-xl text-slate-500 font-medium">
          <CalendarCheck size={36} className="text-slate-650 mb-3" />
          <p className="text-sm">No reservations found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/20">
            <table className="min-w-full divide-y divide-slate-200 text-xs text-slate-700">
              <thead className="bg-slate-100 font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="px-6 py-3.5 text-left">Ref</th>
                  <th className="px-6 py-3.5 text-left">Customer</th>
                  <th className="px-6 py-3.5 text-left">Court / Sport</th>
                  <th className="px-6 py-3.5 text-left">Date & Time</th>
                  <th className="px-6 py-3.5 text-left">Paid</th>
                  <th className="px-6 py-3.5 text-left">Status</th>
                  <th className="px-6 py-3.5 text-left">Checked In</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white/35 font-medium">
                {paginatedBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 uppercase tracking-wider">{b.bookingRef}</td>
                    <td className="px-6 py-4 truncate max-w-[130px]">
                      <p className="font-bold text-slate-900">{b.customerName}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{b.customerPhone}</p>
                    </td>
                    <td className="px-6 py-4 truncate max-w-[150px]">
                      <p className="text-slate-700">{b.courtName}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{b.sport}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-700">{b.date}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{b.startTime} - {b.endTime}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">₹{b.totalAmount}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-6 py-4">
                      {b.checkedIn ? (
                        <span className="text-[10px] bg-emerald-500/10 text-accent-green px-2 py-0.5 border border-emerald-500/20 rounded font-semibold uppercase">
                          Checked In
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 border border-slate-300 rounded font-semibold uppercase">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link to={`/dashboard/admin/bookings/${b.id}`}>
                          <Button variant="ghost" size="sm" className="!p-1.5 text-slate-600 hover:text-slate-900" aria-label="View Details">
                            <Eye size={13} />
                          </Button>
                        </Link>
                        {!b.checkedIn && b.status === 'confirmed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCheckIn(b.id)}
                            className="!p-1.5 text-accent-green hover:text-green-400"
                            aria-label="Check In"
                          >
                            <CheckSquare size={13} />
                          </Button>
                        )}
                        {b.status === 'confirmed' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancel(b.id)}
                              className="!p-1.5 text-accent-red hover:text-red-400"
                              aria-label="Cancel"
                            >
                              <XCircle size={13} />
                            </Button>
                            <button
                              onClick={() => handleNoShow(b.id)}
                              className="text-[10px] font-bold text-slate-500 hover:text-slate-350 uppercase ml-1"
                            >
                              No-Show
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </div>
  );
};

export default AdminAllBookingsPage;
