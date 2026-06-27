// Firebase Coupon Repository
import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { parseISO, isAfter, isBefore } from 'date-fns';

export const FirebaseCouponRepository = {
  getCouponsByVenue: async (venueId) => {
    const q = query(collection(db, 'coupons'), where('venueId', '==', venueId));
    const snap = await getDocs(q);
    const results = [];
    snap.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results;
  },

  getAllCoupons: async () => {
    const snap = await getDocs(collection(db, 'coupons'));
    const results = [];
    snap.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results;
  },

  createCoupon: async (data) => {
    const codeUpper = data.code.toUpperCase();
    const q = query(collection(db, 'coupons'), where('code', '==', codeUpper));
    const snap = await getDocs(q);
    if (!snap.empty) {
      throw new Error('A coupon with this code already exists.');
    }

    const docRef = await addDoc(collection(db, 'coupons'), {
      ...data,
      code: codeUpper,
      currentUsageCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const docSnap = await getDoc(docRef);
    const created = { id: docSnap.id, ...docSnap.data() };

    try {
      const { FirebaseAuditLogRepository } = await import('./FirebaseAuditLogRepository');
      await FirebaseAuditLogRepository.log({
        action: 'Create Coupon',
        module: 'Finance & Coupons',
        entityType: 'Coupon',
        entityId: created.id,
        newValue: created
      });
    } catch (e) {}

    return created;
  },

  updateCoupon: async (couponId, data) => {
    const ref = doc(db, 'coupons', couponId);
    let oldValue = {};
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) oldValue = snap.data();
    } catch (e) {}

    if (data.code) {
      data.code = data.code.toUpperCase();
    }
    await updateDoc(ref, {
      ...data,
      updatedAt: new Date().toISOString()
    });
    const docSnap = await getDoc(ref);
    const updated = { id: docSnap.id, ...docSnap.data() };

    try {
      const { FirebaseAuditLogRepository } = await import('./FirebaseAuditLogRepository');
      await FirebaseAuditLogRepository.log({
        action: 'Update Coupon',
        module: 'Finance & Coupons',
        entityType: 'Coupon',
        entityId: couponId,
        oldValue,
        newValue: updated
      });
    } catch (e) {}

    return updated;
  },

  toggleCoupon: async (couponId, isActive) => {
    const ref = doc(db, 'coupons', couponId);
    let oldValue = {};
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) oldValue = snap.data();
    } catch (e) {}

    await updateDoc(ref, { isActive });

    try {
      const { FirebaseAuditLogRepository } = await import('./FirebaseAuditLogRepository');
      await FirebaseAuditLogRepository.log({
        action: 'Toggle Coupon Status',
        module: 'Finance & Coupons',
        entityType: 'Coupon',
        entityId: couponId,
        oldValue,
        newValue: { isActive }
      });
    } catch (e) {}

    return true;
  },

  validateCoupon: async (code, bookingData) => {
    const codeUpper = code.toUpperCase();
    const q = query(collection(db, 'coupons'), where('code', '==', codeUpper));
    const snap = await getDocs(q);

    if (snap.empty) {
      throw new Error('Invalid coupon code.');
    }

    const couponDoc = snap.docs[0];
    const coupon = couponDoc.data();
    coupon.id = couponDoc.id;

    if (!coupon.isActive) {
      throw new Error('This coupon is no longer active.');
    }

    const now = new Date();
    const validFrom = parseISO(coupon.validFrom);
    const validTo = parseISO(coupon.validTo);

    if (isBefore(now, validFrom)) {
      throw new Error('This coupon code is not yet valid.');
    }

    if (isAfter(now, validTo)) {
      throw new Error('This coupon code has expired.');
    }

    if (coupon.currentUsageCount >= coupon.totalUsageLimit) {
      throw new Error('This coupon usage limit has been reached.');
    }

    if (bookingData.subtotal < coupon.minimumBookingAmount) {
      throw new Error(`Minimum booking amount of ₹${coupon.minimumBookingAmount} is required to use this coupon.`);
    }

    // Sport constraints
    if (coupon.applicableSports && coupon.applicableSports.length > 0) {
      if (!coupon.applicableSports.includes(bookingData.sport)) {
        throw new Error(`This coupon is not applicable for ${bookingData.sport}.`);
      }
    }

    // Venue constraints
    if (coupon.applicableVenueIds && coupon.applicableVenueIds.length > 0) {
      if (!coupon.applicableVenueIds.includes(bookingData.venueId)) {
        throw new Error('This coupon is not applicable for this venue.');
      }
    }

    // Compute discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (bookingData.subtotal * coupon.discountValue) / 100;
      if (coupon.maximumDiscountAmount) {
        discountAmount = Math.min(discountAmount, coupon.maximumDiscountAmount);
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, bookingData.subtotal);
    }

    return {
      couponId: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount
    };
  },

  applyCoupon: async (couponId, bookingId, customerId, discountApplied) => {
    // Registered coupon usage inside bookingRepository transact
    return null;
  }
};
