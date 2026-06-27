// BookingCard Component
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Eye, RotateCcw, AlertTriangle } from 'lucide-react';
import SportBadge from '../../venues/components/SportBadge';
import StatusBadge from '../../../components/common/StatusBadge';
import Button from '../../../components/common/Button';
import { parseISO, differenceInHours } from 'date-fns';

export const BookingCard = ({ booking, onCancel = null }) => {
  const navigate = useNavigate();

  // Check if booking is eligible for cancellation (e.g. > 12 hours before)
  const isCancellable = () => {
    if (booking.status !== 'confirmed') return false;
    try {
      const start = parseISO(`${booking.date}T${booking.startTime}:00`);
      return differenceInHours(start, new Date()) >= 12;
    } catch {
      return false;
    }
  };

  const handleRebook = (e) => {
    e.preventDefault();
    sessionStorage.setItem('wizard_sport', booking.sport);
    sessionStorage.setItem('wizard_date', booking.date);
    // Redirects to public booking wizard with step 3 prefilled
    navigate('/book?step=3');
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-sm hover:shadow transition-all p-4 flex flex-col sm:flex-row justify-between gap-4 select-none">
      
      {/* Details Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <SportBadge sport={booking.sport} />
          <StatusBadge status={booking.status} />
          <span className="text-[10px] text-neutral-400 font-bold bg-slate-50 border border-neutral-100 px-2 py-0.5 rounded uppercase">
            REF: {booking.bookingRef}
          </span>
        </div>

        <h3 className="text-sm font-bold text-neutral-900">{booking.venueName}</h3>
        <p className="text-xs text-neutral-500 font-medium">{booking.courtName}</p>

        {/* Schedule */}
        <div className="flex items-center gap-4 text-xs text-neutral-500 pt-1">
          <span className="flex items-center gap-1">
            <Calendar size={13} className="text-neutral-400 shrink-0" />
            {booking.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={13} className="text-neutral-400 shrink-0" />
            {booking.startTime} - {booking.endTime}
          </span>
        </div>
      </div>

      {/* Pricing and Actions Section */}
      <div className="flex flex-row sm:flex-col justify-between sm:justify-end items-center sm:items-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-150">
        <div className="text-left sm:text-right">
          <span className="text-[10px] text-neutral-450 block font-semibold uppercase tracking-wider">Paid</span>
          <span className="text-sm font-extrabold text-neutral-850">₹{booking.totalAmount}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Detail Link */}
          <Link to={`/dashboard/customer/bookings/${booking.id}`}>
            <Button variant="outline" size="sm" leftIcon={<Eye size={14} />}>
              View Ticket
            </Button>
          </Link>

          {/* Cancellation */}
          {isCancellable() && onCancel && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<AlertTriangle size={14} />}
              onClick={() => onCancel(booking.id)}
              className="!text-accent-red border-red-100 hover:bg-red-50"
            >
              Cancel
            </Button>
          )}

          {/* Re-book */}
          {booking.status === 'completed' && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RotateCcw size={14} />}
              onClick={handleRebook}
            >
              Re-book
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
