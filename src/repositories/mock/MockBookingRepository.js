// Mock Booking Repository
import { dbMock } from './dbMock';
import { differenceInHours, parseISO } from 'date-fns';

const generateBookingRef = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let ref = '';
  for (let i = 0; i < 8; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
};

export const MockBookingRepository = {
  getBookingById: async (bookingId) => {
    await new Promise(r => setTimeout(r, 200));
    return dbMock.getById('bookings', bookingId);
  },

  getBookingsByCustomer: async (customerId, filters = {}) => {
    await new Promise(r => setTimeout(r, 300));
    let bookings = dbMock.getTable('bookings').filter(b => b.customerId === customerId);

    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'upcoming') {
        bookings = bookings.filter(b => b.status === 'confirmed');
      } else {
        bookings = bookings.filter(b => b.status === filters.status);
      }
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      bookings = bookings.filter(b => 
        b.venueName.toLowerCase().includes(q) || 
        b.bookingRef.toLowerCase().includes(q)
      );
    }

    return bookings.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getBookingsByVenue: async (venueId, filters = {}) => {
    await new Promise(r => setTimeout(r, 300));
    let bookings = dbMock.getTable('bookings').filter(b => b.venueId === venueId);

    if (filters.status && filters.status !== 'all') {
      bookings = bookings.filter(b => b.status === filters.status);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      bookings = bookings.filter(b => 
        b.customerName.toLowerCase().includes(q) || 
        b.bookingRef.toLowerCase().includes(q) ||
        b.courtName.toLowerCase().includes(q)
      );
    }

    if (filters.date) {
      bookings = bookings.filter(b => b.date === filters.date);
    }

    return bookings.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getBookingsForDate: async (venueId, date) => {
    await new Promise(r => setTimeout(r, 250));
    return dbMock.getTable('bookings').filter(b => b.venueId === venueId && b.date === date);
  },

  createBooking: async (bookingData) => {
    await new Promise(r => setTimeout(r, 600));
    const slots = dbMock.getTable('slots');
    const { slotIds, customerId, venueId, courtId } = bookingData;

    // Verify all slots are available or held by this user
    const targetSlots = slots.filter(s => slotIds.includes(s.id));
    const unavailable = targetSlots.some(s => s.status !== 'available' && s.status !== 'on_hold');
    
    if (unavailable) {
      throw new Error('Some slots are no longer available. Please select another slot.');
    }

    const bookingId = 'book-' + Math.random().toString(36).substring(2, 9);
    const bookingRef = generateBookingRef();
    const venue = dbMock.getById('venues', venueId);
    const court = dbMock.getById('courts', courtId);
    const customer = dbMock.getById('users', customerId);

    // Update slots to booked
    const updatedSlots = slots.map(s => {
      if (slotIds.includes(s.id)) {
        return {
          ...s,
          status: 'booked',
          bookedByUserId: customerId,
          bookingId: bookingId,
          holdByUserId: null,
          holdExpiresAt: null,
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });
    dbMock.saveTable('slots', updatedSlots);

    // Create payment entry
    const paymentId = 'pay-' + Math.random().toString(36).substring(2, 9);
    const payment = {
      id: paymentId,
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
    };
    dbMock.insert('payments', payment);

    // Create booking document
    const newBooking = {
      id: bookingId,
      bookingRef,
      customerId,
      customerName: customer ? customer.displayName : bookingData.customerName,
      customerEmail: customer ? customer.email : bookingData.customerEmail,
      customerPhone: customer ? customer.phone : bookingData.customerPhone || '',
      venueId,
      venueName: venue ? venue.name : '',
      courtId,
      courtName: court ? court.name : '',
      sport: court ? court.sport : '',
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
      paymentId,
      paymentStatus: 'paid',
      paymentMethod: bookingData.paymentMethod || 'Razorpay',
      checkedIn: false,
      isWalkIn: false,
      notes: bookingData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const inserted = dbMock.insert('bookings', newBooking);

    // Increment venue counter
    if (venue) {
      dbMock.update('venues', venueId, { totalBookings: (venue.totalBookings || 0) + 1 });
    }

    // Send confirmation notification
    const notification = {
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      type: 'booking_confirmed',
      title: 'Booking Confirmed!',
      message: `Your booking for ${court.name} at ${venue.name} on ${bookingData.date} (${bookingData.startTime} - ${bookingData.endTime}) has been confirmed. Ref: ${bookingRef}`,
      data: { bookingId, venueId },
      isRead: false,
      createdAt: new Date().toISOString()
    };
    
    // Add notification
    const notifications = dbMock.getTable('notifications');
    notifications.push({ ...notification, userId: customerId });
    dbMock.saveTable('notifications', notifications);

    try {
      const { MockAuditLogRepository } = await import('./MockAuditLogRepository');
      await MockAuditLogRepository.log({
        action: 'Create Booking',
        module: 'Bookings',
        entityType: 'Booking',
        entityId: bookingId,
        newValue: inserted
      });
    } catch (e) {}

    return inserted;
  },

  createWalkInBooking: async (data) => {
    await new Promise(r => setTimeout(r, 500));
    const slots = dbMock.getTable('slots');
    const { slotIds, venueId, courtId, customerName, customerPhone, customerEmail, paymentMethod, notes } = data;

    // Verify slots
    const targetSlots = slots.filter(s => slotIds.includes(s.id));
    if (targetSlots.some(s => s.status !== 'available')) {
      throw new Error('Selected slots are not available');
    }

    const bookingId = 'book-' + Math.random().toString(36).substring(2, 9);
    const bookingRef = generateBookingRef();
    const venue = dbMock.getById('venues', venueId);
    const court = dbMock.getById('courts', courtId);

    // Calculate total price
    const subtotal = targetSlots.reduce((acc, curr) => acc + curr.price, 0);
    const totalAmount = subtotal;

    // Update slots status
    const updatedSlots = slots.map(s => {
      if (slotIds.includes(s.id)) {
        return {
          ...s,
          status: 'booked',
          bookedByUserId: 'walk-in',
          bookingId: bookingId,
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });
    dbMock.saveTable('slots', updatedSlots);

    const booking = {
      id: bookingId,
      bookingRef,
      customerId: 'walk-in',
      customerName,
      customerEmail: customerEmail || 'walkin@customer.com',
      customerPhone,
      venueId,
      venueName: venue ? venue.name : '',
      courtId,
      courtName: court ? court.name : '',
      sport: court ? court.sport : '',
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      slotIds,
      totalSlots: slotIds.length,
      subtotal,
      discountAmount: 0,
      couponCode: null,
      totalAmount,
      status: 'confirmed',
      paymentId: 'pay-walkin',
      paymentStatus: 'paid',
      paymentMethod,
      checkedIn: true, // Auto check-in for walkins
      checkedInAt: new Date().toISOString(),
      checkedInBy: data.staffId || 'user-staff',
      isWalkIn: true,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const inserted = dbMock.insert('bookings', booking);

    if (venue) {
      dbMock.update('venues', venueId, { totalBookings: (venue.totalBookings || 0) + 1 });
    }

    try {
      const { MockAuditLogRepository } = await import('./MockAuditLogRepository');
      await MockAuditLogRepository.log({
        action: 'Create Walk-in Booking',
        module: 'Bookings',
        entityType: 'Booking',
        entityId: bookingId,
        newValue: inserted
      });
    } catch (e) {}

    return inserted;
  },

  cancelBooking: async (bookingId, reason = '') => {
    await new Promise(r => setTimeout(r, 400));
    const booking = dbMock.getById('bookings', bookingId);
    if (!booking) throw new Error('Booking not found');

    const venue = dbMock.getById('venues', booking.venueId);
    const refundPolicy = venue?.settings?.refundPolicy || {
      fullRefundHours: 24,
      partialRefundHours: 12,
      partialRefundPercent: 50
    };

    // Calculate hours from now until booking start
    const bookingStart = parseISO(`${booking.date}T${booking.startTime}:00`);
    const now = new Date();
    const hoursDiff = differenceInHours(bookingStart, now);

    let refundPercent = 0;
    const policy = refundPolicy;

    if (hoursDiff >= policy.fullRefundHours) {
      refundPercent = 100;
    } else if (hoursDiff >= policy.partialRefundHours) {
      refundPercent = policy.partialRefundPercent;
    }

    const refundAmount = (booking.totalAmount * refundPercent) / 100;
    const refundStatus = refundAmount > 0 ? 'paid' : 'none';

    // Update booking status
    dbMock.update('bookings', bookingId, {
      status: 'cancelled',
      cancellationReason: reason,
      cancelledAt: new Date().toISOString(),
      refundAmount,
      refundStatus,
      paymentStatus: refundAmount === booking.totalAmount ? 'refunded' : booking.paymentStatus,
      updatedAt: new Date().toISOString()
    });

    // Release slots back to available
    const slots = dbMock.getTable('slots');
    const updatedSlots = slots.map(s => {
      if (booking.slotIds.includes(s.id)) {
        return {
          ...s,
          status: 'available',
          bookedByUserId: null,
          bookingId: null,
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });
    dbMock.saveTable('slots', updatedSlots);

    // Send refund / cancellation notification
    const notification = {
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `Your booking ${booking.bookingRef} has been cancelled. Refund of ₹${refundAmount} has been initiated.`,
      data: { bookingId, venueId: booking.venueId },
      isRead: false,
      createdAt: new Date().toISOString()
    };
    
    const notifications = dbMock.getTable('notifications');
    notifications.push({ ...notification, userId: booking.customerId });
    dbMock.saveTable('notifications', notifications);

    try {
      const { MockAuditLogRepository } = await import('./MockAuditLogRepository');
      await MockAuditLogRepository.log({
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
    await new Promise(r => setTimeout(r, 200));
    const oldValue = dbMock.getById('bookings', bookingId) || {};
    const updated = dbMock.update('bookings', bookingId, {
      checkedIn: true,
      checkedInAt: new Date().toISOString(),
      checkedInBy: staffId
    });

    try {
      const { MockAuditLogRepository } = await import('./MockAuditLogRepository');
      await MockAuditLogRepository.log({
        action: 'Check In Customer',
        module: 'Bookings',
        entityType: 'Booking',
        entityId: bookingId,
        oldValue,
        newValue: { checkedIn: true, checkedInBy: staffId }
      });
    } catch (e) {}

    return updated;
  },

  updateBookingStatus: async (bookingId, status) => {
    await new Promise(r => setTimeout(r, 200));
    const oldValue = dbMock.getById('bookings', bookingId) || {};
    const updated = dbMock.update('bookings', bookingId, { status });

    try {
      const { MockAuditLogRepository } = await import('./MockAuditLogRepository');
      await MockAuditLogRepository.log({
        action: 'Update Booking Status',
        module: 'Bookings',
        entityType: 'Booking',
        entityId: bookingId,
        oldValue,
        newValue: { status }
      });
    } catch (e) {}

    return updated;
  },

  getAllBookings: async () => {
    await new Promise(r => setTimeout(r, 300));
    return dbMock.getTable('bookings').sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getActiveBookingsCount: async (venueId) => {
    await new Promise(r => setTimeout(r, 150));
    const todayStr = new Date().toISOString().split('T')[0];
    const bookings = dbMock.getTable('bookings');
    return bookings.filter(b => b.venueId === venueId && b.status === 'confirmed' && b.date >= todayStr).length;
  }
};
