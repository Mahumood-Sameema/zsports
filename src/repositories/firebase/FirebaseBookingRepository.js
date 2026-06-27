// Firebase Booking Repository
import { 
  collection, doc, getDoc, getDocs, query, where, 
  runTransaction, writeBatch, addDoc, updateDoc 
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { differenceInHours, parseISO } from 'date-fns';

const generateBookingRef = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let ref = '';
  for (let i = 0; i < 8; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
};

export const FirebaseBookingRepository = {
  getBookingById: async (bookingId) => {
    const docRef = doc(db, 'bookings', bookingId);
    const snap = await getDoc(docRef);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  getBookingsByCustomer: async (customerId, filters = {}) => {
    let q = query(collection(db, 'bookings'), where('customerId', '==', customerId));
    const snap = await getDocs(q);
    let results = [];
    snap.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });

    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'upcoming') {
        results = results.filter(b => b.status === 'confirmed');
      } else {
        results = results.filter(b => b.status === filters.status);
      }
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(b => 
        b.venueName.toLowerCase().includes(q) || 
        b.bookingRef.toLowerCase().includes(q)
      );
    }

    return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getBookingsByVenue: async (venueId, filters = {}) => {
    let q = query(collection(db, 'bookings'), where('venueId', '==', venueId));
    const snap = await getDocs(q);
    let results = [];
    snap.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });

    if (filters.status && filters.status !== 'all') {
      results = results.filter(b => b.status === filters.status);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(b => 
        b.customerName.toLowerCase().includes(q) || 
        b.bookingRef.toLowerCase().includes(q) ||
        b.courtName.toLowerCase().includes(q)
      );
    }

    if (filters.date) {
      results = results.filter(b => b.date === filters.date);
    }

    return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getBookingsForDate: async (venueId, date) => {
    const q = query(
      collection(db, 'bookings'),
      where('venueId', '==', venueId),
      where('date', '==', date)
    );
    const snap = await getDocs(q);
    const results = [];
    snap.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results;
  },

  createBooking: async (bookingData) => {
    const { slotIds, customerId, venueId, courtId } = bookingData;
    const bookingRef = generateBookingRef();
    const bookingId = 'book-' + Math.random().toString(36).substring(2, 9);
    
    await runTransaction(db, async (transaction) => {
      // 1. Verify all slots are available or held by this user
      const slotRefs = slotIds.map(id => doc(db, 'slots', id));
      const slotDocs = await Promise.all(slotRefs.map(ref => transaction.get(ref)));

      const unavailable = slotDocs.some(docSnap => {
        if (!docSnap.exists()) return true;
        const d = docSnap.data();
        return d.status !== 'available' && d.status !== 'on_hold';
      });

      if (unavailable) {
        throw new Error('Some slots are no longer available. Please retry.');
      }

      // 2. Write Booking
      const venueDoc = await transaction.get(doc(db, 'venues', venueId));
      const courtDoc = await transaction.get(doc(db, 'courts', courtId));
      const userDoc = await transaction.get(doc(db, 'users', customerId));

      const venueName = venueDoc.exists() ? venueDoc.data().name : '';
      const courtName = courtDoc.exists() ? courtDoc.data().name : '';
      const sport = courtDoc.exists() ? courtDoc.data().sport : '';
      
      const customerName = userDoc.exists() ? userDoc.data().displayName : bookingData.customerName;
      const customerEmail = userDoc.exists() ? userDoc.data().email : bookingData.customerEmail;
      const customerPhone = userDoc.exists() ? userDoc.data().phone : bookingData.customerPhone || '';

      const bookingDocRef = doc(db, 'bookings', bookingId);
      transaction.set(bookingDocRef, {
        bookingRef,
        customerId,
        customerName,
        customerEmail,
        customerPhone,
        venueId,
        venueName,
        courtId,
        courtName,
        sport,
        date: bookingData.date,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        slotIds,
        totalSlots: slotIds.length,
        subtotal: bookingData.subtotal,
        discountAmount: bookingData.discountAmount || 0,
        couponCode: bookingData.couponCode || null,
        totalAmount: bookingData.totalAmount,
        status: 'confirmed',
        paymentId: bookingData.paymentId || 'pay-gateway',
        paymentStatus: 'paid',
        paymentMethod: bookingData.paymentMethod || 'Razorpay',
        checkedIn: false,
        isWalkIn: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // 3. Write Payment
      const paymentDocRef = doc(collection(db, 'payments'));
      transaction.set(paymentDocRef, {
        bookingId,
        customerId,
        venueId,
        razorpayOrderId: bookingData.paymentDetails?.orderId || `order_${bookingRef}`,
        razorpayPaymentId: bookingData.paymentDetails?.paymentId || `pay_${bookingRef}`,
        razorpaySignature: bookingData.paymentDetails?.signature || `sig_${bookingRef}`,
        amount: bookingData.totalAmount,
        currency: 'INR',
        status: 'paid',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // 4. Update Slots
      slotRefs.forEach(ref => {
        transaction.update(ref, {
          status: 'booked',
          bookedByUserId: customerId,
          bookingId: bookingId,
          holdByUserId: null,
          holdExpiresAt: null,
          updatedAt: new Date().toISOString()
        });
      });

      // 5. Update Venue TotalBookings
      if (venueDoc.exists()) {
        transaction.update(doc(db, 'venues', venueId), {
          totalBookings: (venueDoc.data().totalBookings || 0) + 1
        });
      }

      // 6. Push Notification
      const notifDocRef = doc(collection(db, `users/${customerId}/notifications`));
      transaction.set(notifDocRef, {
        type: 'booking_confirmed',
        title: 'Booking Confirmed!',
        message: `Your booking for ${courtName} at ${venueName} on ${bookingData.date} has been confirmed. Ref: ${bookingRef}`,
        data: { bookingId, venueId },
        isRead: false,
        createdAt: new Date().toISOString()
      });
    });

    try {
      const { FirebaseAuditLogRepository } = await import('./FirebaseAuditLogRepository');
      await FirebaseAuditLogRepository.log({
        action: 'Create Booking',
        module: 'Bookings',
        entityType: 'Booking',
        entityId: bookingId,
        newValue: { bookingId, bookingRef }
      });
    } catch (e) {}

    return { id: bookingId, bookingRef };
  },

  createWalkInBooking: async (data) => {
    const { slotIds, venueId, courtId, customerName, customerPhone, customerEmail, paymentMethod, notes, staffId } = data;
    const bookingRef = generateBookingRef();
    const bookingId = 'book-' + Math.random().toString(36).substring(2, 9);

    await runTransaction(db, async (transaction) => {
      // Validate slots
      const slotRefs = slotIds.map(id => doc(db, 'slots', id));
      const slotDocs = await Promise.all(slotRefs.map(ref => transaction.get(ref)));

      const unavailable = slotDocs.some(docSnap => !docSnap.exists() || docSnap.data().status !== 'available');
      if (unavailable) {
        throw new Error('Some slots are no longer available.');
      }

      const venueDoc = await transaction.get(doc(db, 'venues', venueId));
      const courtDoc = await transaction.get(doc(db, 'courts', courtId));

      const venueName = venueDoc.exists() ? venueDoc.data().name : '';
      const courtName = courtDoc.exists() ? courtDoc.data().name : '';
      const sport = courtDoc.exists() ? courtDoc.data().sport : '';
      const subtotal = slotDocs.reduce((acc, docSnap) => acc + docSnap.data().price, 0);

      // Save Booking
      transaction.set(doc(db, 'bookings', bookingId), {
        bookingRef,
        customerId: 'walk-in',
        customerName,
        customerEmail: customerEmail || 'walkin@customer.com',
        customerPhone,
        venueId,
        venueName,
        courtId,
        courtName,
        sport,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        slotIds,
        totalSlots: slotIds.length,
        subtotal,
        discountAmount: 0,
        couponCode: null,
        totalAmount: subtotal,
        status: 'confirmed',
        paymentId: 'pay-walkin',
        paymentStatus: 'paid',
        paymentMethod,
        checkedIn: true,
        checkedInAt: new Date().toISOString(),
        checkedInBy: staffId || 'staff',
        isWalkIn: true,
        notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Update slots to booked
      slotRefs.forEach(ref => {
        transaction.update(ref, {
          status: 'booked',
          bookedByUserId: 'walk-in',
          bookingId: bookingId,
          updatedAt: new Date().toISOString()
        });
      });

      if (venueDoc.exists()) {
        transaction.update(doc(db, 'venues', venueId), {
          totalBookings: (venueDoc.data().totalBookings || 0) + 1
        });
      }
    });

    try {
      const { FirebaseAuditLogRepository } = await import('./FirebaseAuditLogRepository');
      await FirebaseAuditLogRepository.log({
        action: 'Create Walk-in Booking',
        module: 'Bookings',
        entityType: 'Booking',
        entityId: bookingId,
        newValue: { bookingId, bookingRef }
      });
    } catch (e) {}

    return { id: bookingId, bookingRef };
  },

  cancelBooking: async (bookingId, reason = '') => {
    const bookingRef = doc(db, 'bookings', bookingId);
    
    await runTransaction(db, async (transaction) => {
      const bookingDoc = await transaction.get(bookingRef);
      if (!bookingDoc.exists()) throw new Error('Booking not found');
      const booking = bookingDoc.data();

      // Read cancellation policy from the venue document
      const venueDoc = await transaction.get(doc(db, 'venues', booking.venueId));
      const venueData = venueDoc.exists() ? venueDoc.data() : null;
      const policy = venueData?.settings?.refundPolicy || {
        fullRefundHours: 24, partialRefundHours: 12, partialRefundPercent: 50
      };

      const bookingStart = parseISO(`${booking.date}T${booking.startTime}:00`);
      const hoursDiff = differenceInHours(bookingStart, new Date());

      let refundPercent = 0;
      if (hoursDiff >= policy.fullRefundHours) {
        refundPercent = 100;
      } else if (hoursDiff >= policy.partialRefundHours) {
        refundPercent = policy.partialRefundPercent;
      }

      const refundAmount = (booking.totalAmount * refundPercent) / 100;
      const refundStatus = refundAmount > 0 ? 'paid' : 'none';

      // Cancel booking
      transaction.update(bookingRef, {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: new Date().toISOString(),
        refundAmount,
        refundStatus,
        paymentStatus: refundAmount === booking.totalAmount ? 'refunded' : booking.paymentStatus,
        updatedAt: new Date().toISOString()
      });

      // Release slots
      booking.slotIds.forEach(id => {
        transaction.update(doc(db, 'slots', id), {
          status: 'available',
          bookedByUserId: null,
          bookingId: null,
          updatedAt: new Date().toISOString()
        });
      });

      // Send notification
      const notifDocRef = doc(collection(db, `users/${booking.customerId}/notifications`));
      transaction.set(notifDocRef, {
        type: 'booking_cancelled',
        title: 'Booking Cancelled',
        message: `Your booking ${booking.bookingRef} was cancelled. Refund: ₹${refundAmount}`,
        data: { bookingId, venueId: booking.venueId },
        isRead: false,
        createdAt: new Date().toISOString()
      });
    });

    try {
      const { FirebaseAuditLogRepository } = await import('./FirebaseAuditLogRepository');
      await FirebaseAuditLogRepository.log({
        action: 'Cancel Booking',
        module: 'Bookings',
        entityType: 'Booking',
        entityId: bookingId,
        newValue: { status: 'cancelled', reason }
      });
    } catch (e) {}

    return true;
  },

  checkIn: async (bookingId, staffId) => {
    const ref = doc(db, 'bookings', bookingId);
    let oldValue = {};
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) oldValue = snap.data();
    } catch (e) {}

    await updateDoc(ref, {
      checkedIn: true,
      checkedInAt: new Date().toISOString(),
      checkedInBy: staffId
    });

    try {
      const { FirebaseAuditLogRepository } = await import('./FirebaseAuditLogRepository');
      await FirebaseAuditLogRepository.log({
        action: 'Check In Customer',
        module: 'Bookings',
        entityType: 'Booking',
        entityId: bookingId,
        oldValue,
        newValue: { checkedIn: true, checkedInBy: staffId }
      });
    } catch (e) {}

    return true;
  },

  updateBookingStatus: async (bookingId, status) => {
    const ref = doc(db, 'bookings', bookingId);
    let oldValue = {};
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) oldValue = snap.data();
    } catch (e) {}

    await updateDoc(ref, { status });

    try {
      const { FirebaseAuditLogRepository } = await import('./FirebaseAuditLogRepository');
      await FirebaseAuditLogRepository.log({
        action: 'Update Booking Status',
        module: 'Bookings',
        entityType: 'Booking',
        entityId: bookingId,
        oldValue,
        newValue: { status }
      });
    } catch (e) {}

    return true;
  },

  getAllBookings: async () => {
    const snap = await getDocs(collection(db, 'bookings'));
    const results = [];
    snap.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getActiveBookingsCount: async (venueId) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const q = query(
      collection(db, 'bookings'),
      where('venueId', '==', venueId),
      where('status', '==', 'confirmed'),
      where('date', '>=', todayStr)
    );
    const snap = await getDocs(q);
    return snap.size;
  }
};
