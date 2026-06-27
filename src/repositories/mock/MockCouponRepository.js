// Mock Coupon Repository
import { dbMock } from './dbMock';
import { parseISO, isAfter, isBefore } from 'date-fns';

export const MockCouponRepository = {
  getCouponsByVenue: async (venueId) => {
    await new Promise(r => setTimeout(r, 200));
    return dbMock.getTable('coupons').filter(c => c.venueId === venueId);
  },

  getAllCoupons: async () => {
    await new Promise(r => setTimeout(r, 200));
    return dbMock.getTable('coupons');
  },

  createCoupon: async (data) => {
    await new Promise(r => setTimeout(r, 300));
    const codeUpper = data.code.toUpperCase();
    const coupons = dbMock.getTable('coupons');
    if (coupons.some(c => c.code === codeUpper)) {
      throw new Error('A coupon with this code already exists.');
    }

    const newCoupon = {
      ...data,
      code: codeUpper,
      currentUsageCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const created = dbMock.insert('coupons', newCoupon);

    try {
      const { MockAuditLogRepository } = await import('./MockAuditLogRepository');
      await MockAuditLogRepository.log({
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
    await new Promise(r => setTimeout(r, 300));
    const oldValue = dbMock.getById('coupons', couponId) || {};
    if (data.code) {
      data.code = data.code.toUpperCase();
    }
    const updated = dbMock.update('coupons', couponId, data);

    try {
      const { MockAuditLogRepository } = await import('./MockAuditLogRepository');
      await MockAuditLogRepository.log({
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
    await new Promise(r => setTimeout(r, 200));
    const oldValue = dbMock.getById('coupons', couponId) || {};
    const updated = dbMock.update('coupons', couponId, { isActive });

    try {
      const { MockAuditLogRepository } = await import('./MockAuditLogRepository');
      await MockAuditLogRepository.log({
        action: 'Toggle Coupon Status',
        module: 'Finance & Coupons',
        entityType: 'Coupon',
        entityId: couponId,
        oldValue,
        newValue: { isActive }
      });
    } catch (e) {}

    return updated;
  },

  validateCoupon: async (code, bookingData) => {
    await new Promise(r => setTimeout(r, 400));
    const codeUpper = code.toUpperCase();
    const coupons = dbMock.getTable('coupons');
    const coupon = coupons.find(c => c.code === codeUpper);

    if (!coupon) {
      throw new Error('Invalid coupon code.');
    }

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

    // Sport checks
    if (coupon.applicableSports && coupon.applicableSports.length > 0) {
      if (!coupon.applicableSports.includes(bookingData.sport)) {
        throw new Error(`This coupon is not applicable for ${bookingData.sport}.`);
      }
    }

    // Venue checks
    if (coupon.applicableVenueIds && coupon.applicableVenueIds.length > 0) {
      if (!coupon.applicableVenueIds.includes(bookingData.venueId)) {
        throw new Error('This coupon is not applicable for this venue.');
      }
    }

    // Calculate discount
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
    const coupons = dbMock.getTable('coupons');
    const index = coupons.findIndex(c => c.id === couponId);
    if (index !== -1) {
      const coupon = coupons[index];
      coupon.currentUsageCount = (coupon.currentUsageCount || 0) + 1;
      coupons[index] = coupon;
      dbMock.saveTable('coupons', coupons);

      // Record coupon usage
      const usage = {
        id: 'usage-' + Math.random().toString(36).substring(2, 9),
        couponId,
        couponCode: coupon.code,
        customerId,
        bookingId,
        discountApplied,
        usedAt: new Date().toISOString()
      };
      dbMock.insert('couponUsages', usage);
      return usage;
    }
    return null;
  }
};
