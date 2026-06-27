// BookingDetailPage Component
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useBooking from '../hooks/useBooking';
import { reviewRepository } from '../../../repositories';
import { useAuth } from '../../auth/hooks/useAuth';
import QRCode from '../../../components/common/QRCode';
import Button from '../../../components/common/Button';
import StatusBadge from '../../../components/common/StatusBadge';
import LoadingCard from '../../../components/common/LoadingCard';
import ErrorState from '../../../components/common/ErrorState';
import BackButton from '../../../components/common/BackButton';
import Modal from '../../../components/common/Modal';
import StarRating from '../../../components/common/StarRating';
import Input from '../../../components/common/Input';
import { Calendar, Clock, MapPin, Printer, Navigation, Edit2 } from 'lucide-react';
import { parseISO, isAfter } from 'date-fns';

export const BookingDetailPage = () => {
  const { bookingId } = useParams();
  const { currentUser } = useAuth();
  const { data: booking, isLoading, isError, refetch } = useBooking(bookingId);

  // Review states
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [tags, setTags] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  if (isLoading) return <LoadingCard message="Loading booking details..." />;
  if (isError || !booking) return <ErrorState message="Failed to load booking details." />;

  // Verify if booking is completed to allow review
  const canReview = () => {
    if (booking.status !== 'completed' && booking.status !== 'confirmed') return false;
    try {
      const end = parseISO(`${booking.date}T${booking.endTime}:00`);
      return isAfter(new Date(), end);
    } catch {
      return false;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDirections = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.venueName)}`, '_blank');
  };

  const handleSubmitReview = async () => {
    setSubmittingReview(true);
    try {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
      await reviewRepository.createReview({
        bookingId: booking.id,
        customerId: currentUser.uid,
        venueId: booking.venueId,
        courtId: booking.courtId,
        rating,
        comment,
        tags: tagList
      });
      setReviewOpen(false);
      refetch();
      alert('Thank you for leaving a review!');
    } catch (err) {
      alert(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 select-none pb-12 print:p-0">
      
      {/* Back link */}
      <div className="flex items-center gap-3 print:hidden">
        <BackButton />
        <span className="text-xs font-bold text-neutral-500 uppercase">Booking Receipt</span>
      </div>

      {/* Main Ticket Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden divide-y divide-neutral-150">
        
        {/* Ticket Header QR */}
        <div className="p-6 flex flex-col items-center text-center bg-slate-50/50">
          <QRCode value={booking.bookingRef} size={140} className="shadow-sm border-neutral-100" />
          <h3 className="mt-4 text-sm font-extrabold text-neutral-900 tracking-tight uppercase">
            REF: {booking.bookingRef}
          </h3>
          <p className="text-[10px] text-neutral-500 font-semibold mt-0.5">PRESENT THIS CODE AT VENUE RECEPTION</p>
          
          <div className="mt-4">
            <StatusBadge status={booking.status} />
          </div>
        </div>

        {/* Game Details */}
        <div className="p-6 space-y-4">
          <div>
            <span className="text-[10px] text-neutral-450 uppercase tracking-wider block font-semibold">Venue / Facility</span>
            <span className="text-sm font-extrabold text-neutral-850 block mt-0.5">{booking.venueName}</span>
            <span className="text-xs text-neutral-500 mt-1 block">{booking.courtName} ({booking.sport})</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="text-primary shrink-0" size={16} />
              <div>
                <span className="text-[9px] text-neutral-450 uppercase tracking-wider block font-semibold">Date</span>
                <span className="text-xs font-bold text-neutral-800">{booking.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="text-primary shrink-0" size={16} />
              <div>
                <span className="text-[9px] text-neutral-450 uppercase tracking-wider block font-semibold">Time Slot</span>
                <span className="text-xs font-bold text-neutral-800">{booking.startTime} - {booking.endTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Summary */}
        <div className="p-6 space-y-3">
          <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Payment details</h4>
          <div className="space-y-2 text-xs font-semibold text-neutral-600">
            <div className="flex justify-between">
              <span>Subtotal ({booking.totalSlots} slot(s))</span>
              <span>₹{booking.subtotal}</span>
            </div>
            {booking.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Promo Discount ({booking.couponCode})</span>
                <span>-₹{booking.discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-100">
              <span>Amount Paid</span>
              <span>₹{booking.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-6 bg-slate-50 flex items-center justify-between gap-3 print:hidden">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<Printer size={14} />} onClick={handlePrint}>
              Print
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Navigation size={14} />} onClick={handleDirections}>
              Directions
            </Button>
          </div>

          {canReview() && (
            <Button variant="primary" size="sm" leftIcon={<Edit2 size={14} />} onClick={() => setReviewOpen(true)}>
              Write Review
            </Button>
          )}
        </div>
      </div>

      {/* Review Dialog modal */}
      <Modal isOpen={reviewOpen} onClose={() => setReviewOpen(false)} title="Write Review">
        <div className="space-y-4 select-none">
          <p className="text-xs text-neutral-500 font-medium leading-relaxed">
            Rate your experience playing at {booking.venueName} - {booking.courtName}. Your feedback helps other players.
          </p>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-neutral-700 uppercase">Rating</label>
            <StarRating rating={rating} max={5} interactive={true} onChange={(val) => setRating(val)} size="lg" />
          </div>

          <Input
            label="Feedback Comment"
            placeholder="Cleanliness, turf quality, lighting, staff help, etc..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <Input
            label="Tags (Comma separated)"
            placeholder="Excellent Turf, Good Amenities, Friendly Staff"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setReviewOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmitReview} loading={submittingReview}>
              Submit Review
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BookingDetailPage;
