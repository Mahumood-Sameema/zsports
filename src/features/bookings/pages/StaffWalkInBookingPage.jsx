// StaffWalkInBookingPage Component
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { courtRepository, slotRepository, bookingRepository } from '../../../repositories';
import { dbMock } from '../../../repositories/mock/dbMock';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { Search, UserCheck, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export const StaffWalkInBookingPage = () => {
  const { currentUser } = useAuth();
  const venueId = currentUser?.venueId || 'venue-1';

  // Customer details
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerProfile, setCustomerProfile] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Booking details
  const [courts, setCourts] = useState([]);
  const [selectedCourtId, setSelectedCourtId] = useState('');
  const [bookingDate, setBookingDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [slots, setSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load venue courts
  useEffect(() => {
    const loadCourts = async () => {
      try {
        const list = await courtRepository.getCourtsByVenue(venueId);
        setCourts(list.filter(c => c.isActive && !c.isUnderMaintenance));
        if (list.length > 0) setSelectedCourtId(list[0].id);
      } catch (err) {
        console.error(err);
      }
    };
    loadCourts();
  }, [venueId]);

  // Load available slots
  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedCourtId || !bookingDate) return;
      try {
        const list = await slotRepository.getAvailableSlots(selectedCourtId, bookingDate);
        setSlots(list.sort((a, b) => a.startTime.localeCompare(b.startTime)));
      } catch (err) {
        console.error(err);
      }
    };
    loadSlots();
    setSelectedSlots([]);
  }, [selectedCourtId, bookingDate]);

  const handleLookupCustomer = () => {
    if (!customerSearch) return;
    const users = dbMock.getTable('users');
    const matched = users.find(
      u => u.email.toLowerCase() === customerSearch.toLowerCase() || u.phone === customerSearch
    );

    if (matched) {
      setCustomerProfile(matched);
      setCustomerName(matched.displayName);
      setCustomerEmail(matched.email);
      setCustomerPhone(matched.phone || '');
      alert(`Customer profile found: ${matched.displayName}`);
    } else {
      alert('No matching customer profile found. Proceeding with temporary walk-in inputs.');
      setCustomerProfile(null);
    }
  };

  const handleSlotToggle = (slot) => {
    setSelectedSlots(prev => {
      const isSel = prev.some(s => s.id === slot.id);
      if (isSel) return prev.filter(s => s.id !== slot.id);
      return [...prev, slot].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
  };

  const handleCreateWalkIn = async (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      alert('Please fill out customer name and phone details.');
      return;
    }
    if (selectedSlots.length === 0) {
      alert('Please select at least one available slot.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        venueId,
        courtId: selectedCourtId,
        date: bookingDate,
        startTime: selectedSlots[0].startTime,
        endTime: selectedSlots[selectedSlots.length - 1].endTime,
        slotIds: selectedSlots.map(s => s.id),
        customerName,
        customerPhone,
        customerEmail,
        paymentMethod,
        notes,
        staffId: currentUser?.uid || 'user-staff'
      };

      await bookingRepository.createWalkInBooking(payload);
      alert('Walk-in booking created and auto check-in complete!');
      
      // Reset forms
      setCustomerProfile(null);
      setCustomerSearch('');
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setSelectedSlots([]);
      setNotes('');
    } catch (err) {
      alert(err.message || 'Failed to create walk-in booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-350 select-none pb-12">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Walk-in Booking Builder</h2>
        <p className="text-xs text-slate-600 mt-1">Book courts on behalf of offline guests. Records Cash/Card/UPI transactions.</p>
      </div>

      <form onSubmit={handleCreateWalkIn} className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">
        
        {/* Left Columns: Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer profile */}
          <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
              1. Customer Profile Lookup
            </h3>

            <div className="flex gap-2">
              <Input
                placeholder="Enter customer email or phone number..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="bg-slate-50/20 border-slate-200 focus:border-primary text-slate-900"
              />
              <Button type="button" onClick={handleLookupCustomer} variant="outline" className="border-slate-200 hover:bg-slate-100">
                <Search size={16} />
              </Button>
            </div>

            <div className="h-[1px] bg-slate-100" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Customer Full Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Full Name"
                required
                className="bg-slate-50/20 border-slate-200 focus:border-primary text-slate-900"
              />
              <Input
                label="Customer Phone Number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="10 digit number"
                required
                className="bg-slate-50/20 border-slate-200 focus:border-primary text-slate-900"
              />
            </div>
            <Input
              label="Customer Email (Optional)"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="name@customer.com"
              className="bg-slate-50/20 border-slate-200 focus:border-primary text-slate-900"
            />
          </section>

          {/* Court slot selector */}
          <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
              2. Court & Slots Selection
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1.5">
                  Choose Court
                </label>
                <select
                  value={selectedCourtId}
                  onChange={(e) => setSelectedCourtId(e.target.value)}
                  className="block w-full text-xs font-bold rounded border border-slate-200 bg-white py-2.5 px-3 focus:outline-none focus:ring-primary text-slate-350"
                >
                  {courts.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.sport})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1.5">
                  Select Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="block w-full text-xs font-bold rounded border border-slate-200 bg-white py-2.5 px-3 focus:outline-none focus:ring-primary text-slate-350"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Available Slots</h4>
              {slots.length === 0 ? (
                <p className="text-xs font-semibold text-slate-500 text-center py-4">No available slots for this combination.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map(s => {
                    const isSel = selectedSlots.some(x => x.id === s.id);
                    let style = 'bg-white border-slate-200 text-slate-700 hover:border-primary';
                    if (s.status === 'booked') style = 'bg-slate-50 text-slate-600 border-slate-200 cursor-not-allowed';
                    if (s.status === 'blocked') style = 'bg-rose-950/20 text-rose-500 border-rose-900/50 cursor-not-allowed';
                    if (isSel) style = 'bg-primary text-white border-primary ring-2 ring-primary-light';

                    return (
                      <button
                        key={s.id}
                        type="button"
                        disabled={s.status !== 'available'}
                        onClick={() => handleSlotToggle(s)}
                        className={`flex flex-col items-center justify-center p-2 rounded border text-xs font-bold transition-all shadow-xs leading-none ${style}`}
                      >
                        <span>{s.startTime}</span>
                        <span className={`text-[9px] font-medium mt-1 ${isSel ? 'text-slate-900/80' : 'text-slate-500'}`}>
                          ₹{s.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Columns: Summary Checkout */}
        <div className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
              3. Payment & Memo
            </h3>

            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1.5">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="block w-full text-xs font-bold rounded border border-slate-200 bg-white py-2.5 px-3 focus:outline-none focus:ring-primary text-slate-350"
              >
                <option value="Cash">Cash Collected</option>
                <option value="UPI">UPI Transfer</option>
                <option value="Card">Terminal Card Reader</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1.5">
                Internal Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write checking details, items issued, bat rentals..."
                className="w-full text-xs font-semibold rounded border border-slate-200 bg-white py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-slate-900 h-24"
              />
            </div>

            {selectedSlots.length > 0 && (
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex justify-between text-xs font-semibold text-slate-450">
                  <span>Subtotal ({selectedSlots.length} slot(s))</span>
                  <span className="text-slate-900">₹{selectedSlots.reduce((a, b) => a + b.price, 0)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount Paid</span>
                  <span className="text-primary font-extrabold">₹{selectedSlots.reduce((a, b) => a + b.price, 0)}</span>
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={submitting}
              disabled={selectedSlots.length === 0}
            >
              Issue Check-In Ticket
            </Button>
          </section>
        </div>
      </form>
    </div>
  );
};

export default StaffWalkInBookingPage;
