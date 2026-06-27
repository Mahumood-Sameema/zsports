// Mock Review Repository
import { dbMock } from './dbMock';

export const MockReviewRepository = {
  getReviewsByVenue: async (venueId, limitNum = 20) => {
    await new Promise(r => setTimeout(r, 200));
    const reviews = dbMock.getTable('reviews');
    return reviews
      .filter(r => r.venueId === venueId && r.isVisible)
      .slice(0, limitNum)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getReviewsByCustomer: async (customerId) => {
    await new Promise(r => setTimeout(r, 200));
    return dbMock.getTable('reviews')
      .filter(r => r.customerId === customerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  createReview: async (reviewData) => {
    await new Promise(r => setTimeout(r, 400));
    const customer = dbMock.getById('users', reviewData.customerId);
    const newReview = {
      ...reviewData,
      customerName: customer ? customer.displayName : 'Anonymous',
      customerAvatarUrl: customer ? customer.avatarUrl : '',
      isVisible: true,
      isFlagged: false,
      flagReason: null,
      adminResponse: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const inserted = dbMock.insert('reviews', newReview);
    await MockReviewRepository.updateVenueRating(reviewData.venueId);
    return inserted;
  },

  updateReview: async (reviewId, data) => {
    await new Promise(r => setTimeout(r, 300));
    const updated = dbMock.update('reviews', reviewId, data);
    if (updated) {
      await MockReviewRepository.updateVenueRating(updated.venueId);
    }
    return updated;
  },

  deleteReview: async (reviewId) => {
    await new Promise(r => setTimeout(r, 200));
    const review = dbMock.getById('reviews', reviewId);
    if (review) {
      dbMock.delete('reviews', reviewId);
      await MockReviewRepository.updateVenueRating(review.venueId);
      return true;
    }
    return false;
  },

  flagReview: async (reviewId, reason) => {
    await new Promise(r => setTimeout(r, 200));
    return dbMock.update('reviews', reviewId, { isFlagged: true, flagReason: reason });
  },

  getAllReviews: async () => {
    await new Promise(r => setTimeout(r, 300));
    return dbMock.getTable('reviews').sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  updateVenueRating: async (venueId) => {
    const reviews = dbMock.getTable('reviews').filter(r => r.venueId === venueId && r.isVisible);
    if (reviews.length === 0) {
      dbMock.update('venues', venueId, { avgRating: 0, reviewCount: 0 });
      return;
    }

    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = parseFloat((sum / reviews.length).toFixed(1));

    dbMock.update('venues', venueId, {
      avgRating: avg,
      reviewCount: reviews.length
    });
  }
};
