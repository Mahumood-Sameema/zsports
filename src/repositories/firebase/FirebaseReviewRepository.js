// Firebase Review Repository
import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const FirebaseReviewRepository = {
  getReviewsByVenue: async (venueId, limitNum = 20) => {
    const q = query(
      collection(db, 'reviews'), 
      where('venueId', '==', venueId), 
      where('isVisible', '==', true)
    );
    const snap = await getDocs(q);
    const results = [];
    snap.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limitNum);
  },

  getReviewsByCustomer: async (customerId) => {
    const q = query(collection(db, 'reviews'), where('customerId', '==', customerId));
    const snap = await getDocs(q);
    const results = [];
    snap.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  createReview: async (reviewData) => {
    const customerSnap = await getDoc(doc(db, 'users', reviewData.customerId));
    const customer = customerSnap.exists() ? customerSnap.data() : null;

    const docRef = await addDoc(collection(db, 'reviews'), {
      ...reviewData,
      customerName: customer ? customer.displayName : 'Anonymous',
      customerAvatarUrl: customer ? customer.avatarUrl : '',
      isVisible: true,
      isFlagged: false,
      flagReason: null,
      adminResponse: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await FirebaseReviewRepository.updateVenueRating(reviewData.venueId);
    const docSnap = await getDoc(docRef);
    return { id: docSnap.id, ...docSnap.data() };
  },

  updateReview: async (reviewId, data) => {
    const ref = doc(db, 'reviews', reviewId);
    await updateDoc(ref, {
      ...data,
      updatedAt: new Date().toISOString()
    });
    const docSnap = await getDoc(ref);
    await FirebaseReviewRepository.updateVenueRating(docSnap.data().venueId);
    return { id: docSnap.id, ...docSnap.data() };
  },

  deleteReview: async (reviewId) => {
    const ref = doc(db, 'reviews', reviewId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const venueId = snap.data().venueId;
      await deleteDoc(ref);
      await FirebaseReviewRepository.updateVenueRating(venueId);
      return true;
    }
    return false;
  },

  flagReview: async (reviewId, reason) => {
    const ref = doc(db, 'reviews', reviewId);
    await updateDoc(ref, { isFlagged: true, flagReason: reason, updatedAt: new Date().toISOString() });
    return true;
  },

  getAllReviews: async () => {
    const snap = await getDocs(collection(db, 'reviews'));
    const results = [];
    snap.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  updateVenueRating: async (venueId) => {
    const q = query(
      collection(db, 'reviews'), 
      where('venueId', '==', venueId), 
      where('isVisible', '==', true)
    );
    const snap = await getDocs(q);
    const reviews = [];
    snap.forEach(doc => {
      reviews.push(doc.data());
    });

    if (reviews.length === 0) {
      await updateDoc(doc(db, 'venues', venueId), { avgRating: 0, reviewCount: 0 });
      return;
    }

    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = parseFloat((sum / reviews.length).toFixed(1));

    await updateDoc(doc(db, 'venues', venueId), {
      avgRating: avg,
      reviewCount: reviews.length
    });
  }
};
