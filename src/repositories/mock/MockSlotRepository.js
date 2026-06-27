// Mock Slot Repository
import { dbMock } from './dbMock';
import { addDays, format, parse, eachDayOfInterval, startOfDay } from 'date-fns';

export const MockSlotRepository = {
  getAvailableSlots: async (courtId, dateStr) => {
    await new Promise(r => setTimeout(r, 200));
    // Also clean up expired holds before fetching
    MockSlotRepository.cleanupExpiredHolds();

    const slots = dbMock.getTable('slots');
    return slots.filter(s => s.courtId === courtId && s.date === dateStr);
  },

  getSlotsForCalendar: async (courtId, startDateStr, endDateStr) => {
    await new Promise(r => setTimeout(r, 250));
    MockSlotRepository.cleanupExpiredHolds();
    
    const slots = dbMock.getTable('slots');
    return slots.filter(s => 
      s.courtId === courtId && 
      s.date >= startDateStr && 
      s.date <= endDateStr
    );
  },

  holdSlot: async (slotId, userId, holdMinutes = 10) => {
    // Transactional simulation
    MockSlotRepository.cleanupExpiredHolds();
    const slots = dbMock.getTable('slots');
    const index = slots.findIndex(s => s.id === slotId);

    if (index === -1) {
      throw new Error('Slot not found');
    }

    const slot = slots[index];
    if (slot.status !== 'available') {
      throw new Error('Slot is no longer available');
    }

    const holdExpiresAt = new Date(Date.now() + holdMinutes * 60 * 1000).toISOString();
    
    slot.status = 'on_hold';
    slot.holdByUserId = userId;
    slot.holdExpiresAt = holdExpiresAt;
    slot.updatedAt = new Date().toISOString();

    slots[index] = slot;
    dbMock.saveTable('slots', slots);
    return slot;
  },

  releaseHold: async (slotId) => {
    const slots = dbMock.getTable('slots');
    const index = slots.findIndex(s => s.id === slotId);
    if (index !== -1) {
      const slot = slots[index];
      if (slot.status === 'on_hold') {
        slot.status = 'available';
        slot.holdByUserId = null;
        slot.holdExpiresAt = null;
        slot.updatedAt = new Date().toISOString();
        slots[index] = slot;
        dbMock.saveTable('slots', slots);
      }
    }
    return true;
  },

  blockSlot: async (slotId, reason = 'Maintenance') => {
    await new Promise(r => setTimeout(r, 200));
    const slots = dbMock.getTable('slots');
    const index = slots.findIndex(s => s.id === slotId);
    if (index !== -1) {
      const slot = slots[index];
      slot.status = 'blocked';
      slot.notes = reason;
      slot.updatedAt = new Date().toISOString();
      slots[index] = slot;
      dbMock.saveTable('slots', slots);
      return slot;
    }
    throw new Error('Slot not found');
  },

  unblockSlot: async (slotId) => {
    await new Promise(r => setTimeout(r, 200));
    const slots = dbMock.getTable('slots');
    const index = slots.findIndex(s => s.id === slotId);
    if (index !== -1) {
      const slot = slots[index];
      if (slot.status === 'blocked') {
        slot.status = 'available';
        slot.notes = null;
        slot.updatedAt = new Date().toISOString();
        slots[index] = slot;
        dbMock.saveTable('slots', slots);
        return slot;
      }
    }
    throw new Error('Slot not found or not blocked');
  },

  getFutureSlotsCount: async (venueId) => {
    await new Promise(r => setTimeout(r, 150));
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const slots = dbMock.getTable('slots');
    return slots.filter(s => s.venueId === venueId && s.date >= todayStr).length;
  },

  generateSlots: async (courtId, startDateStr, endDateStr) => {
    await new Promise(r => setTimeout(r, 600));
    const court = dbMock.getById('courts', courtId);
    if (!court) throw new Error('Court not found');

    const venue = dbMock.getById('venues', court.venueId);
    if (!venue) throw new Error('Venue not found');

    const start = parse(startDateStr, 'yyyy-MM-dd', new Date());
    const end = parse(endDateStr, 'yyyy-MM-dd', new Date());
    const days = eachDayOfInterval({ start, end });

    const slots = dbMock.getTable('slots');
    let addedCount = 0;

    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
      const dayName = format(day, 'EEEE').toLowerCase();
      const hours = venue.openingHours[dayName];
      
      if (!hours || !hours.isOpen) return;

      const openHour = parseInt(hours.open.split(':')[0]);
      const closeHour = parseInt(hours.close.split(':')[0]);
      const duration = court.slotDurationMinutes || 60;
      
      for (let hour = openHour; hour < closeHour; hour++) {
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

        // Check if slot exists
        const exists = slots.some(s => s.courtId === courtId && s.date === dateStr && s.startTime === startTime);
        if (exists) return;

        // Pricing
        let price = court.baseHourlyRate;
        const isPeak = startTime >= court.peakHours.start && startTime < court.peakHours.end;
        if (isWeekend) {
          price = court.weekendRate;
        } else if (isPeak) {
          price = court.peakHourlyRate;
        }

        slots.push({
          id: `slot-${courtId}-${dateStr}-${startTime.replace(':', '')}`,
          courtId,
          courtName: court.name,
          venueId: court.venueId,
          venueName: venue.name,
          sportId: court.sport,
          date: dateStr,
          startTime,
          endTime,
          durationMinutes: duration,
          price,
          isPeakHour: isPeak,
          isWeekend,
          status: 'available',
          holdByUserId: null,
          holdExpiresAt: null,
          bookedByUserId: null,
          bookingId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        addedCount++;
      }
    });

    dbMock.saveTable('slots', slots);
    return addedCount;
  },

  cleanupExpiredHolds: () => {
    const slots = dbMock.getTable('slots');
    let changed = false;
    const now = new Date().toISOString();

    const updatedSlots = slots.map(s => {
      if (s.status === 'on_hold' && s.holdExpiresAt && s.holdExpiresAt < now) {
        changed = true;
        return {
          ...s,
          status: 'available',
          holdByUserId: null,
          holdExpiresAt: null,
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });

    if (changed) {
      dbMock.saveTable('slots', updatedSlots);
    }
  }
};
