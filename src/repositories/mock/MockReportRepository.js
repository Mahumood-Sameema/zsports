// Mock Report Repository
import { dbMock } from './dbMock';
import { eachDayOfInterval, format, parseISO } from 'date-fns';

export const MockReportRepository = {
  getReportSummary: async (venueId, startDateStr, endDateStr) => {
    await new Promise(r => setTimeout(r, 400));
    const bookings = dbMock.getTable('bookings').filter(b => 
      b.venueId === venueId && 
      b.date >= startDateStr && 
      b.date <= endDateStr
    );

    const payments = dbMock.getTable('payments').filter(p => 
      p.venueId === venueId && 
      p.createdAt >= startDateStr && 
      p.createdAt <= endDateStr + 'T23:59:59'
    );

    const slots = dbMock.getTable('slots').filter(s => 
      s.venueId === venueId && 
      s.date >= startDateStr && 
      s.date <= endDateStr
    );

    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    
    // Revenue calculations
    const totalRevenue = bookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    const refundsGiven = bookings
      .filter(b => b.status === 'cancelled')
      .reduce((sum, b) => sum + (b.refundAmount || 0), 0);

    const netRevenue = totalRevenue - refundsGiven;

    // Occupancy
    const totalSlots = slots.length;
    const bookedSlots = slots.filter(s => s.status === 'booked').length;
    const occupancyRate = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

    // Sport popularity
    const bookingsBySport = {};
    bookings.forEach(b => {
      bookingsBySport[b.sport] = (bookingsBySport[b.sport] || 0) + 1;
    });

    // Customer split (mock logic)
    const customerIds = bookings.map(b => b.customerId);
    const uniqueCustomers = new Set(customerIds).size;
    const newCustomers = Math.round(uniqueCustomers * 0.35); // 35% estimated new
    const returningCustomers = uniqueCustomers - newCustomers;

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
    await new Promise(r => setTimeout(r, 500));
    const start = parseISO(startDateStr);
    const end = parseISO(endDateStr);
    const days = eachDayOfInterval({ start, end });

    const bookings = dbMock.getTable('bookings').filter(b => b.venueId === venueId);
    const slots = dbMock.getTable('slots').filter(s => s.venueId === venueId);

    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      
      const dayBookings = bookings.filter(b => b.date === dateStr);
      const daySlots = slots.filter(s => s.date === dateStr);

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

      const totalSlots = daySlots.length;
      const bookedSlots = daySlots.filter(s => s.status === 'booked').length;
      const occupancyRate = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

      return {
        date: dateStr,
        totalBookings,
        confirmedBookings: confirmed,
        cancelledBookings: cancelled,
        revenue,
        netRevenue,
        occupancyRate
      };
    });
  },

  getOccupancyData: async (venueId, courtId = null, startDateStr, endDateStr) => {
    await new Promise(r => setTimeout(r, 300));
    let slots = dbMock.getTable('slots').filter(s => s.venueId === venueId && s.date >= startDateStr && s.date <= endDateStr);
    
    if (courtId) {
      slots = slots.filter(s => s.courtId === courtId);
    }

    // Return aggregated occupancy percentages grouped by hour (00:00 - 23:00)
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
    await new Promise(r => setTimeout(r, 200));
    const bookings = dbMock.getTable('bookings').filter(b => b.venueId === venueId && (b.status === 'confirmed' || b.status === 'completed'));
    
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
