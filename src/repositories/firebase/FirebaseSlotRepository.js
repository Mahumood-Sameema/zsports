// Firebase Slot Repository
import { 
  collection, doc, query, where, getDocs, getDoc, 
  runTransaction, writeBatch, Timestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { eachDayOfInterval, format, parse, parseISO } from 'date-fns';

export const FirebaseSlotRepository = {
  getAvailableSlots: async (courtId, dateStr) => {
    const q = query(
      collection(db, 'slots'), 
      where('courtId', '==', courtId), 
      where('date', '==', dateStr)
    );
    const snap = await getDocs(q);
    const results = [];
    snap.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results;
  },

  getSlotsForCalendar: async (courtId, startDateStr, endDateStr) => {
    const q = query(
      collection(db, 'slots'),
      where('courtId', '==', courtId),
      where('date', '>=', startDateStr),
      where('date', '<=', endDateStr)
    );
    const snap = await getDocs(q);
    const results = [];
    snap.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results;
  },

  holdSlot: async (slotId, userId, holdMinutes = 10) => {
    const slotRef = doc(db, 'slots', slotId);
    
    return await runTransaction(db, async (transaction) => {
      const slotDoc = await transaction.get(slotRef);
      if (!slotDoc.exists()) {
        throw new Error('Slot does not exist.');
      }
      
      const data = slotDoc.data();
      const now = new Date();

      // Check if slot is available OR expired hold
      const isExpiredHold = data.status === 'on_hold' && 
                            data.holdExpiresAt && 
                            data.holdExpiresAt.toDate() < now;

      if (data.status !== 'available' && !isExpiredHold) {
        throw new Error('This slot is no longer available.');
      }

      const holdExpiresAt = new Timestamp(
        Math.floor((Date.now() + holdMinutes * 60 * 1000) / 1000), 
        0
      );

      transaction.update(slotRef, {
        status: 'on_hold',
        holdByUserId: userId,
        holdExpiresAt: holdExpiresAt,
        updatedAt: new Date().toISOString()
      });

      return { id: slotId, ...data, status: 'on_hold', holdByUserId: userId };
    });
  },

  releaseHold: async (slotId) => {
    const slotRef = doc(db, 'slots', slotId);
    return await runTransaction(db, async (transaction) => {
      const slotDoc = await transaction.get(slotRef);
      if (slotDoc.exists() && slotDoc.data().status === 'on_hold') {
        transaction.update(slotRef, {
          status: 'available',
          holdByUserId: null,
          holdExpiresAt: null,
          updatedAt: new Date().toISOString()
        });
      }
      return true;
    });
  },

  blockSlot: async (slotId, reason = 'Maintenance') => {
    const slotRef = doc(db, 'slots', slotId);
    await runTransaction(db, async (transaction) => {
      transaction.update(slotRef, {
        status: 'blocked',
        notes: reason,
        updatedAt: new Date().toISOString()
      });
    });
    return true;
  },

  unblockSlot: async (slotId) => {
    const slotRef = doc(db, 'slots', slotId);
    await runTransaction(db, async (transaction) => {
      transaction.update(slotRef, {
        status: 'available',
        notes: null,
        updatedAt: new Date().toISOString()
      });
    });
    return true;
  },

  getFutureSlotsCount: async (venueId) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const q = query(
      collection(db, 'slots'),
      where('venueId', '==', venueId),
      where('date', '>=', todayStr)
    );
    const snap = await getDocs(q);
    return snap.size;
  },

  generateSlots: async (courtId, startDateStr, endDateStr) => {
    const courtDoc = await getDoc(doc(db, 'courts', courtId));
    if (!courtDoc.exists()) throw new Error('Court not found');
    const court = courtDoc.data();

    const venueDoc = await getDoc(doc(db, 'venues', court.venueId));
    if (!venueDoc.exists()) throw new Error('Venue not found');
    const venue = venueDoc.data();

    const start = parse(startDateStr, 'yyyy-MM-dd', new Date());
    const end = parse(endDateStr, 'yyyy-MM-dd', new Date());
    const days = eachDayOfInterval({ start, end });

    let addedCount = 0;
    const batch = writeBatch(db);

    for (const day of days) {
      const dateStr = format(day, 'yyyy-MM-dd');
      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
      const dayName = format(day, 'EEEE').toLowerCase();
      const hours = venue.openingHours[dayName];
      
      if (!hours || !hours.isOpen) continue;

      const openHour = parseInt(hours.open.split(':')[0]);
      const closeHour = parseInt(hours.close.split(':')[0]);
      const duration = court.slotDurationMinutes || 60;

      for (let hour = openHour; hour < closeHour; hour++) {
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
        const slotId = `slot-${courtId}-${dateStr}-${startTime.replace(':', '')}`;

        // Compute price
        let price = court.baseHourlyRate;
        const isPeak = startTime >= court.peakHours.start && startTime < court.peakHours.end;
        if (isWeekend) {
          price = court.weekendRate;
        } else if (isPeak) {
          price = court.peakHourlyRate;
        }

        const slotRef = doc(db, 'slots', slotId);
        
        batch.set(slotRef, {
          courtId,
          courtName: courtDoc.data().name || '',
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
        // Batch limit is 500
        if (addedCount % 450 === 0) {
          await batch.commit();
        }
      }
    }

    await batch.commit();
    return addedCount;
  }
};
