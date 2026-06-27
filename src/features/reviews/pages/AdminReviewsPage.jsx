// AdminReviewsPage Component
import React, { useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { reviewRepository } from '../../../repositories';
import { Flag, Eye, EyeOff, MessageSquare, ShieldCheck, CheckCircle2, Star } from 'lucide-react';
import Button from '../../../components/common/Button';
import StarRating from '../../../components/common/StarRating';
import LoadingCard from '../../../components/common/LoadingCard';
import ErrorState from '../../../components/common/ErrorState';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import { format, parseISO } from 'date-fns';

export const AdminReviewsPage = () => {
  const { currentUser } = useAuth();
  const [responseOpen, setResponseOpen] = useState(false);
  const [targetReview, setTargetReview] = useState(null);
  const [adminResponseText, setAdminResponseText] = useState('');

  // Fetch all reviews for moderation
  const { data: reviews = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-all-reviews'],
    queryFn: () => reviewRepository.getAllReviews()
  });

  const handleToggleVisibility = async (reviewId, currentVisibility) => {
    try {
      await reviewRepository.updateReview(reviewId, { isVisible: !currentVisibility });
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFlag = async (reviewId, currentFlagged) => {
    try {
      if (currentFlagged) {
        await reviewRepository.updateReview(reviewId, { isFlagged: false, flagReason: null });
      } else {
        const reason = window.prompt('Enter reason for flagging this review:');
        if (reason) {
          await reviewRepository.flagReview(reviewId, reason);
        }
      }
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenResponse = (rev) => {
    setTargetReview(rev);
    setAdminResponseText(rev.adminResponse || '');
    setResponseOpen(true);
  };

  const handleSaveResponse = async () => {
    if (!targetReview) return;
    try {
      await reviewRepository.updateReview(targetReview.id, { adminResponse: adminResponseText });
      setResponseOpen(false);
      refetch();
      alert('Your response has been published successfully.');
    } catch (err) {
      alert(err.message || 'Failed to post response.');
    }
  };

  return (
    <div className="space-y-6 text-slate-350 select-none pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Review Moderation Console</h2>
        <p className="text-xs text-slate-600 mt-1">Moderate client feedbacks, flag toxic comments, and post official responses.</p>
      </div>

      {isLoading ? (
        <LoadingCard message="Loading reviews list..." />
      ) : isError ? (
        <ErrorState message="Failed to load reviews ledger." />
      ) : reviews.length === 0 ? (
        <p className="text-xs font-semibold text-slate-500 text-center py-6">No reviews submitted yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/20">
          <table className="min-w-full divide-y divide-slate-200 text-xs text-slate-700">
            <thead className="bg-slate-100 font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-6 py-3.5 text-left">Customer</th>
                <th className="px-6 py-3.5 text-left">Rating</th>
                <th className="px-6 py-3.5 text-left">Comment Snippet</th>
                <th className="px-6 py-3.5 text-left">Flagged Status</th>
                <th className="px-6 py-3.5 text-left">Date</th>
                <th className="px-6 py-3.5 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white/35 font-medium">
              {reviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-white/60 transition-colors">
                  <td className="px-6 py-4 truncate max-w-[130px] font-bold text-slate-900">{rev.customerName}</td>
                  <td className="px-6 py-4 shrink-0"><StarRating rating={rev.rating} size="sm" /></td>
                  <td className="px-6 py-4 max-w-[240px]">
                    <p className="truncate text-slate-700">{rev.comment || <span className="text-slate-500 italic">No comment text</span>}</p>
                    {rev.adminResponse && (
                      <p className="text-[10px] text-primary mt-1 font-bold">Response: {rev.adminResponse}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {rev.isFlagged ? (
                      <span className="text-[10px] bg-red-500/10 text-accent-red px-2 py-0.5 border border-red-500/20 rounded font-semibold uppercase">
                        Yes: {rev.flagReason}
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 border border-slate-300 rounded font-semibold uppercase">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{format(parseISO(rev.createdAt), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Hide/Show */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleVisibility(rev.id, rev.isVisible)}
                        className={`!p-1.5 ${rev.isVisible ? 'text-slate-600 hover:text-slate-900' : 'text-slate-500 hover:text-slate-700 bg-slate-100/20'}`}
                        aria-label={rev.isVisible ? 'Hide review' : 'Show review'}
                      >
                        {rev.isVisible ? <Eye size={13} /> : <EyeOff size={13} />}
                      </Button>

                      {/* Reply */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenResponse(rev)}
                        className="!p-1.5 text-slate-600 hover:text-slate-900"
                        aria-label="Reply to Review"
                      >
                        <MessageSquare size={13} />
                      </Button>

                      {/* Flag */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleFlag(rev.id, rev.isFlagged)}
                        className={`!p-1.5 ${rev.isFlagged ? 'text-accent-red hover:text-red-400' : 'text-slate-500 hover:text-slate-350'}`}
                        aria-label="Flag Review"
                      >
                        <Flag size={13} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Response Modal */}
      <Modal isOpen={responseOpen} onClose={() => setResponseOpen(false)} title="Respond to Review">
        {targetReview && (
          <div className="space-y-4 text-neutral-600 select-none">
            <div className="p-3 bg-slate-50 rounded border border-neutral-200">
              <p className="text-[10px] font-bold text-neutral-400 uppercase">Customer Review</p>
              <p className="text-xs font-bold text-neutral-700 mt-1 flex items-center gap-1">
                {targetReview.customerName}
                <span className="inline-flex items-center gap-0.5 text-amber-500 font-bold ml-1">
                  <Star size={11} className="fill-current text-amber-500 shrink-0" />
                  {targetReview.rating}
                </span>
              </p>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed italic">"{targetReview.comment}"</p>
            </div>
            
            <Input
              label="Console Official Response"
              placeholder="Thank you for your feedback! We look forward to serving you again..."
              value={adminResponseText}
              onChange={(e) => setAdminResponseText(e.target.value)}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setResponseOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveResponse}>
                Post Response
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminReviewsPage;
