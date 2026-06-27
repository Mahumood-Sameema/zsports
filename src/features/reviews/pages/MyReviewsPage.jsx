// MyReviewsPage Component
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useAuth } from '../../auth/hooks/useAuth';
import { reviewRepository } from '../../../repositories';
import { Star, Edit3, Trash2, ShieldCheck, Flag, AlertTriangle, StarOff } from 'lucide-react';
import Button from '../../../components/common/Button';
import StarRating from '../../../components/common/StarRating';
import LoadingCard from '../../../components/common/LoadingCard';
import ErrorState from '../../../components/common/ErrorState';
import Modal from '../../../components/common/Modal';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import Input from '../../../components/common/Input';
import { format, parseISO } from 'date-fns';

const reviewEditSchema = zod.object({
  rating: zod.number().min(1, 'Please select a rating of at least 1 star').max(5),
  comment: zod.string().min(5, 'Review comment must be at least 5 characters long').max(500, 'Comment cannot exceed 500 characters'),
});

export const MyReviewsPage = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [editingReview, setEditingReview] = useState(null);
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  // Form for editing review
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: zodResolver(reviewEditSchema),
    defaultValues: { rating: 5, comment: '' }
  });

  const ratingValue = watch('rating');

  // Fetch reviews for current customer
  const { data: reviews = [], isLoading, isError } = useQuery({
    queryKey: ['my-reviews', currentUser?.uid],
    queryFn: () => reviewRepository.getReviewsByCustomer(currentUser.uid),
    enabled: !!currentUser?.uid
  });

  const handleOpenEdit = (rev) => {
    setEditingReview(rev);
    setValue('rating', rev.rating);
    setValue('comment', rev.comment || '');
  };

  const handleEditSubmit = async (data) => {
    if (!editingReview) return;
    try {
      await reviewRepository.updateReview(editingReview.id, {
        rating: data.rating,
        comment: data.comment,
        updatedAt: new Date().toISOString()
      });
      queryClient.invalidateQueries(['my-reviews', currentUser?.uid]);
      setEditingReview(null);
      reset();
    } catch (err) {
      alert(err.message || 'Failed to update review.');
    }
  };

  const handleDelete = async () => {
    if (!deletingReviewId) return;
    try {
      await reviewRepository.deleteReview(deletingReviewId);
      queryClient.invalidateQueries(['my-reviews', currentUser?.uid]);
      setDeletingReviewId(null);
    } catch (err) {
      alert(err.message || 'Failed to delete review.');
    }
  };

  if (isLoading) return <LoadingCard message="Loading your feedbacks..." />;
  if (isError) return <ErrorState message="Could not load your reviews ledger." />;

  return (
    <div className="space-y-6 select-none max-w-4xl mx-auto text-neutral-600 font-normal pb-12">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-5">
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">My Reviews</h2>
        <p className="text-xs text-neutral-500 mt-1">
          Manage ratings and comments you have posted for local turf arenas and court centers.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="h-12 w-12 bg-neutral-50 text-neutral-350 rounded-full flex items-center justify-center">
            <StarOff size={22} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-neutral-800">You haven't reviewed any matches yet</h3>
            <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
              Once you complete an upcoming match, you can submit a review to rate the facility.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reviews.map((rev) => (
            <div 
              key={rev.id} 
              className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs space-y-4 hover:border-neutral-300 transition-colors"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">{rev.venueName}</h3>
                  <p className="text-[10px] text-neutral-400 font-semibold uppercase mt-0.5">
                    Match Date: {rev.createdAt ? format(parseISO(rev.createdAt), 'MMMM dd, yyyy') : 'Recently'}
                  </p>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleOpenEdit(rev)}
                    className="!p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                    aria-label="Edit review"
                  >
                    <Edit3 size={14} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setDeletingReviewId(rev.id)}
                    className="!p-1.5 text-accent-red hover:bg-red-50"
                    aria-label="Delete review"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>

              {/* Review Content */}
              <div className="space-y-2">
                <StarRating rating={rev.rating} size="sm" />
                <p className="text-xs text-neutral-750 leading-relaxed font-medium">
                  {rev.comment}
                </p>
              </div>

              {/* System details (Flagged / Admin Response) */}
              {(rev.isFlagged || rev.adminResponse) && (
                <div className="bg-slate-50 p-3 rounded-lg border border-neutral-200 space-y-2">
                  {rev.isFlagged && (
                    <div className="flex items-center gap-2 text-2xs font-semibold text-accent-red">
                      <AlertTriangle size={12} className="shrink-0 animate-pulse" />
                      <span>Flagged by admin: {rev.flagReason || 'Pending inspection'}</span>
                    </div>
                  )}
                  {rev.adminResponse && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-2xs font-bold text-primary">
                        <ShieldCheck size={13} className="shrink-0" />
                        <span>Venue Official Response</span>
                      </div>
                      <p className="text-2xs text-neutral-500 leading-relaxed italic pl-5">
                        "{rev.adminResponse}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Review Modal */}
      <Modal 
        isOpen={!!editingReview} 
        onClose={() => { setEditingReview(null); reset(); }} 
        title="Edit Your Feedback"
      >
        {editingReview && (
          <form onSubmit={handleSubmit(handleEditSubmit)} className="space-y-5 text-neutral-600">
            {/* Interactive Stars */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                Court/Facility Rating
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setValue('rating', star)}
                    className="focus:outline-none transition-transform active:scale-125"
                  >
                    <Star 
                      size={24} 
                      className={`${
                        star <= ratingValue 
                          ? 'text-amber-400 fill-amber-400' 
                          : 'text-neutral-250 hover:text-amber-300'
                      }`} 
                    />
                  </button>
                ))}
              </div>
              {errors.rating && (
                <p className="text-xs text-accent-red font-semibold">{errors.rating.message}</p>
              )}
            </div>

            {/* Comment Area */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                Review Comments
              </label>
              <textarea
                rows={4}
                placeholder="Share your experience playing at this court..."
                className={`block w-full rounded border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                  errors.comment 
                    ? 'border-accent-red focus:ring-accent-red focus:border-accent-red' 
                    : 'border-neutral-200 focus:ring-primary focus:border-primary'
                }`}
                {...register('comment')}
              />
              <div className="flex justify-between items-center text-3xs text-neutral-450 mt-1">
                <span>Min 5, Max 500 characters</span>
                <span>{(watch('comment') || '').length}/500</span>
              </div>
              {errors.comment && (
                <p className="text-xs text-accent-red font-semibold">{errors.comment.message}</p>
              )}
            </div>

            {/* Modal actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => { setEditingReview(null); reset(); }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                loading={isSubmitting}
              >
                Save Review
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingReviewId}
        onConfirm={handleDelete}
        onCancel={() => setDeletingReviewId(null)}
        title="Delete Review"
        message="Are you sure you want to permanently delete this review? This will also update the venue average ratings metric."
        confirmLabel="Delete Review"
        danger
      />
    </div>
  );
};

export default MyReviewsPage;
