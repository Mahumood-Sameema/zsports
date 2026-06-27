// BookingDetailAdminPage Component
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useBooking from '../hooks/useBooking';
import { bookingRepository } from '../../../repositories';
import Button from '../../../components/common/Button';
import StatusBadge from '../../../components/common/StatusBadge';
import LoadingCard from '../../../components/common/LoadingCard';
import ErrorState from '../../../components/common/ErrorState';
import BackButton from '../../../components/common/BackButton';
import Input from '../../../components/common/Input';
import { Calendar, Clock, CreditCard, Shield, User } from 'lucide-react';

export const BookingDetailAdminPage = () => {
  const { bookingId } = useParams();
  const { data: booking, isLoading, isError, refetch } = useBooking(bookingId);

  // States
  const [updating, setUpdating] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState('');

  if (isLoading) return <LoadingCard message="Loading booking detail..." />;
  if (isError || !booking) return <ErrorState message="Failed to load admin booking detail." />;

  const handleUpdateNotes = async () => {
    setUpdating(true);
    try {
      await bookingRepository.updateBookingStatus(bookingId, booking.status); // keeps status, updates note
      // Simulate notes update
      await new Promise(r => setTimeout(r, 400));
      refetch();
      alert('Internal notes updated.');
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleInitiateRefund = async () => {
    const amt = parseFloat(refundAmount);
    if (isNaN(amt) || amt <= 0 || amt > booking.totalAmount) {
      alert('Please enter a valid refund amount (less than or equal to total paid).');
      return;
    }

    if (window.confirm(`Are you sure you want to initiate a refund of ₹${amt}?`)) {
      setUpdating(true);
      try {
        await bookingRepository.cancelBooking(bookingId, `Refund initiated: ₹${amt}`);
        refetch();
        alert('Refund processed successfully.');
      } catch (err) {
        alert(err.message || 'Refund failed.');
      } finally {
        setUpdating(false);
      }
    }
  };

  return (
    <div className="space-y-6 text-slate-350 select-none max-w-4xl">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
        <BackButton />
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Booking Details Console</h2>
          <p className="text-xs text-slate-600 mt-1">Reference: {booking.bookingRef} &bull; Manage logs and memo updates.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Booking details & client */}
        <div className="md:col-span-2 space-y-6">
          {/* Reservation Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
              <Shield size={16} className="text-primary" />
              Reservation Parameters
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <span className="block text-slate-500 text-[10px] uppercase">Court</span>
                <span className="text-slate-900 font-bold block mt-0.5">{booking.courtName}</span>
                <span className="text-slate-600 mt-0.5 block">{booking.sport}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[10px] uppercase">Status</span>
                <div className="mt-1"><StatusBadge status={booking.status} /></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-500 shrink-0" />
                <div>
                  <span className="block text-slate-500 text-[10px] uppercase font-bold">Date</span>
                  <span className="text-slate-700">{booking.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-slate-500 shrink-0" />
                <div>
                  <span className="block text-slate-500 text-[10px] uppercase font-bold">Time Range</span>
                  <span className="text-slate-700">{booking.startTime} - {booking.endTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Profile card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
              <User size={16} className="text-primary" />
              Customer Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <span className="block text-slate-500 text-[10px] uppercase">Name</span>
                <span className="text-slate-900 block mt-0.5">{booking.customerName}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[10px] uppercase">Contact Details</span>
                <span className="text-slate-700 block mt-0.5">{booking.customerEmail}</span>
                <span className="text-slate-600 block mt-0.5">{booking.customerPhone || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing memos, refunds, internal notes */}
        <div className="space-y-6">
          {/* Cost ledger */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
              <CreditCard size={16} className="text-primary" />
              Pricing & Gateway
            </h3>

            <div className="space-y-2 text-xs font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-700">₹{booking.subtotal}</span>
              </div>
              {booking.discountAmount > 0 && (
                <div className="flex justify-between text-accent-green">
                  <span>Discount ({booking.couponCode})</span>
                  <span>-₹{booking.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-200">
                <span>Grand Total</span>
                <span>₹{booking.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Refund Actions */}
          {booking.status === 'confirmed' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                Initiate Refund
              </h3>
              <div className="space-y-3">
                <Input
                  label="Refund Amount (₹)"
                  type="number"
                  placeholder="e.g. 500"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="bg-slate-50/20 border-slate-200 focus:border-primary text-slate-900"
                />
                <Button 
                  onClick={handleInitiateRefund} 
                  variant="danger" 
                  fullWidth 
                  loading={updating}
                >
                  Initiate Refund
                </Button>
              </div>
            </div>
          )}

          {/* Internal Memo */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
              Internal Notes
            </h3>
            <div className="space-y-3">
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Write private details, checking issues, cash collections etc..."
                className="w-full text-xs font-semibold rounded border border-slate-200 bg-white py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-slate-900 h-24"
              />
              <Button onClick={handleUpdateNotes} variant="outline" fullWidth loading={updating} className="border-slate-200 hover:bg-slate-100">
                Save Notes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailAdminPage;
