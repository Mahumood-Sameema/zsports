// BookingContext Provider
import React, { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [sport, setSport] = useState(() => sessionStorage.getItem('wizard_sport') || '');
  const [venue, setVenue] = useState(() => {
    const raw = sessionStorage.getItem('wizard_venue');
    return raw ? JSON.parse(raw) : null;
  });
  const [court, setCourt] = useState(() => {
    const raw = sessionStorage.getItem('wizard_court');
    return raw ? JSON.parse(raw) : null;
  });
  const [date, setDate] = useState(() => sessionStorage.getItem('wizard_date') || '');
  const [selectedSlots, setSelectedSlots] = useState(() => {
    const raw = sessionStorage.getItem('wizard_slots');
    return raw ? JSON.parse(raw) : [];
  });
  const [coupon, setCoupon] = useState(() => {
    const raw = sessionStorage.getItem('wizard_coupon');
    return raw ? JSON.parse(raw) : null;
  });

  // Sync to sessionStorage
  useEffect(() => {
    if (sport) sessionStorage.setItem('wizard_sport', sport);
    else sessionStorage.removeItem('wizard_sport');
  }, [sport]);

  useEffect(() => {
    if (venue) sessionStorage.setItem('wizard_venue', JSON.stringify(venue));
    else sessionStorage.removeItem('wizard_venue');
  }, [venue]);

  useEffect(() => {
    if (court) sessionStorage.setItem('wizard_court', JSON.stringify(court));
    else sessionStorage.removeItem('wizard_court');
  }, [court]);

  useEffect(() => {
    if (date) sessionStorage.setItem('wizard_date', date);
    else sessionStorage.removeItem('wizard_date');
  }, [date]);

  useEffect(() => {
    if (selectedSlots.length > 0) sessionStorage.setItem('wizard_slots', JSON.stringify(selectedSlots));
    else sessionStorage.removeItem('wizard_slots');
  }, [selectedSlots]);

  useEffect(() => {
    if (coupon) sessionStorage.setItem('wizard_coupon', JSON.stringify(coupon));
    else sessionStorage.removeItem('wizard_coupon');
  }, [coupon]);

  const resetBooking = () => {
    setSport('');
    setVenue(null);
    setCourt(null);
    setDate('');
    setSelectedSlots([]);
    setCoupon(null);
    sessionStorage.removeItem('wizard_sport');
    sessionStorage.removeItem('wizard_venue');
    sessionStorage.removeItem('wizard_court');
    sessionStorage.removeItem('wizard_date');
    sessionStorage.removeItem('wizard_slots');
    sessionStorage.removeItem('wizard_coupon');
  };

  const getSubtotal = () => {
    return selectedSlots.reduce((acc, curr) => acc + curr.price, 0);
  };

  const getDiscountAmount = () => {
    if (!coupon) return 0;
    const subtotal = getSubtotal();
    if (coupon.discountType === 'percentage') {
      let amt = (subtotal * coupon.discountValue) / 100;
      if (coupon.maximumDiscountAmount) {
        amt = Math.min(amt, coupon.maximumDiscountAmount);
      }
      return amt;
    }
    return Math.min(coupon.discountValue, subtotal);
  };

  const getTotalAmount = () => {
    return Math.max(0, getSubtotal() - getDiscountAmount());
  };

  return (
    <BookingContext.Provider value={{
      sport, setSport,
      venue, setVenue,
      court, setCourt,
      date, setDate,
      selectedSlots, setSelectedSlots,
      coupon, setCoupon,
      resetBooking,
      subtotal: getSubtotal(),
      discountAmount: getDiscountAmount(),
      totalAmount: getTotalAmount()
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBookingContext = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBookingContext must be used within a BookingProvider');
  return context;
};
export default BookingContext;
