// Firebase Report Repository
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { eachDayOfInterval, format, parseISO } from 'date-fns';

export const FirebaseReportRepository = {
  getReportSummary: async (venueId, startDateStr, endDateStr) => {
    const q = query(
      collection(db, 'bookings'),
      where('venueId', '==', venueId)
    );

    const snap = await getDocs(q);
    const bookings = [];
    snap.forEach(doc => {
      const data = doc.data();
      if (data.date >= startDateStr && data.date <= endDateStr) {
        bookings.push(data);
      }
    });

    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

    const totalRevenue = bookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    const refunds = bookings
      .filter(b => b.status === 'cancelled')
      .reduce((sum, b) => sum + (b.refundAmount || 0), 0);

    const netRevenue = totalRevenue - refunds;

    const bookingsBySport = {};
    bookings.forEach(b => {
      bookingsBySport[b.sport] = (bookingsBySport[b.sport] || 0) + 1;
    });

    const customerIds = bookings.map(b => b.customerId);
    const uniqueCustomers = new Set(customerIds).size;
    const newCustomers = Math.round(uniqueCustomers * 0.3);
    const returningCustomers = uniqueCustomers - newCustomers;

    // Occupancy (rough calculation based on slots)
    const slotQuery = query(
      collection(db, 'slots'),
      where('venueId', '==', venueId)
    );
    const slotSnap = await getDocs(slotQuery);
    let totalSlots = 0;
    let bookedSlots = 0;
    slotSnap.forEach(doc => {
      const data = doc.data();
      if (data.date >= startDateStr && data.date <= endDateStr) {
        totalSlots++;
        if (data.status === 'booked') bookedSlots++;
      }
    });

    const occupancyRate = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

    return {
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      totalRevenue,
      netRevenue,
      occupancyRate,
      newCustomers,
      returningCustomers,
      bookingsBySport
    };
  },

  getDailyReports: async (venueId, startDateStr, endDateStr) => {
    const start = parseISO(startDateStr);
    const end = parseISO(endDateStr);
    const days = eachDayOfInterval({ start, end });

    const q = query(
      collection(db, 'bookings'),
      where('venueId', '==', venueId)
    );
    
    const snap = await getDocs(q);
    const bookings = [];
    snap.forEach(doc => {
      const data = doc.data();
      if (data.date >= startDateStr && data.date <= endDateStr) {
        bookings.push(data);
      }
    });

    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayBookings = bookings.filter(b => b.date === dateStr);

      const totalBookings = dayBookings.length;
      const confirmed = dayBookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length;
      const cancelled = dayBookings.filter(b => b.status === 'cancelled').length;

      const revenue = dayBookings
        .filter(b => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum, b) => sum + b.totalAmount, 0);

      const refunds = dayBookings
        .filter(b => b.status === 'cancelled')
        .reduce((sum, b) => sum + (b.refundAmount || 0), 0);

      const netRevenue = revenue - refunds;

      return {
        date: dateStr,
        totalBookings,
        confirmedBookings: confirmed,
        cancelledBookings: cancelled,
        revenue,
        netRevenue,
        occupancyRate: 0 // In prod, pull from pre-aggregated reports
      };
    });
  },

  getOccupancyData: async (venueId, courtId = null, startDateStr, endDateStr) => {
    const q = query(
      collection(db, 'slots'),
      where('venueId', '==', venueId)
    );
    const snap = await getDocs(q);
    let slots = [];
    snap.forEach(doc => {
      const data = doc.data();
      if (data.date >= startDateStr && data.date <= endDateStr) {
        slots.push(data);
      }
    });

    if (courtId) {
      slots = slots.filter(s => s.courtId === courtId);
    }

    const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

    return hours.map(hour => {
      const hourSlots = slots.filter(s => s.startTime === hour);
      const total = hourSlots.length;
      const booked = hourSlots.filter(s => s.status === 'booked').length;
      const rate = total > 0 ? Math.round((booked / total) * 100) : 0;
      
      return {
        hour,
        occupancy: rate
      };
    });
  },

  getTopCustomers: async (venueId, limitNum = 5) => {
    const q = query(
      collection(db, 'bookings'),
      where('venueId', '==', venueId)
    );
    const snap = await getDocs(q);
    const bookings = [];
    snap.forEach(doc => {
      const b = doc.data();
      if (b.status === 'confirmed' || b.status === 'completed') {
        bookings.push(b);
      }
    });

    const totals = {};
    bookings.forEach(b => {
      if (!totals[b.customerId]) {
        totals[b.customerId] = {
          name: b.customerName,
          email: b.customerEmail,
          bookingsCount: 0,
          totalSpent: 0
        };
      }
      totals[b.customerId].bookingsCount++;
      totals[b.customerId].totalSpent += b.totalAmount;
    });

    return Object.values(totals)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, limitNum);
  }
};
