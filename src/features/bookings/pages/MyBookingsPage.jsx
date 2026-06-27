// MyBookingsPage Component
import React, { useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import useBookings from '../hooks/useBookings';
import BookingCard from '../components/BookingCard';
import TabGroup from '../../../components/common/TabGroup';
import SearchInput from '../../../components/common/SearchInput';
import Pagination from '../../../components/common/Pagination';
import LoadingCard from '../../../components/common/LoadingCard';
import ErrorState from '../../../components/common/ErrorState';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { bookingRepository } from '../../../repositories';
import { Calendar } from 'lucide-react';

export const MyBookingsPage = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Dialog States
  const [cancelOpen, setCancelOpen] = useState(false);
  const [targetCancelId, setTargetCancelId] = useState('');

  const { data: bookings = [], isLoading, isError, refetch } = useBookings(
    currentUser?.uid,
    'customer',
    { status: activeTab, search }
  );

  const handleCancelClick = (bookingId) => {
    setTargetCancelId(bookingId);
    setCancelOpen(true);
  };

  const handleConfirmCancel = async () => {
    setCancelOpen(false);
    try {
      await bookingRepository.cancelBooking(targetCancelId, 'Requested by customer');
      refetch();
      alert('Your booking has been cancelled successfully.');
    } catch (err) {
      alert(err.message || 'Failed to cancel booking.');
    }
  };

  const totalPages = Math.ceil(bookings.length / pageSize);
  const paginatedBookings = bookings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 select-none max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">My Reservations</h2>
        <p className="text-xs text-neutral-500 mt-1">Review, rebook, and track your sports court bookings history.</p>
      </div>

      {/* Tabs / Filters toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 border border-neutral-200 rounded-xl shadow-sm justify-between">
        <TabGroup
          tabs={[
            { id: 'all', label: 'All Bookings' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' }
          ]}
          activeTab={activeTab}
          onChange={(tab) => { setActiveTab(tab); setCurrentPage(1); }}
          className="border-0"
        />

        <SearchInput
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          onClear={() => setSearch('')}
          placeholder="Search by venue or ref..."
          className="max-w-xs"
        />
      </div>

      {/* Booking List */}
      {isLoading ? (
        <LoadingCard message="Loading bookings..." />
      ) : isError ? (
        <ErrorState message="Failed to load your bookings." />
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-neutral-200 rounded-xl text-neutral-400 font-medium">
          <Calendar size={36} className="text-neutral-300 mb-3" />
          <p className="text-sm">No reservations found.</p>
          <p className="text-xs text-neutral-500 mt-0.5">Start a booking from the venues page.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedBookings.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onCancel={handleCancelClick}
            />
          ))}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}

      {/* Confirm cancel dialog */}
      <ConfirmDialog
        isOpen={cancelOpen}
        onCancel={() => setCancelOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? Refund calculations are based on the venue's cancellation policy thresholds."
        danger={true}
      />
    </div>
  );
};

export default MyBookingsPage;
