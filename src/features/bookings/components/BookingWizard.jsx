// BookingWizard Component
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useBookingContext } from '../context/BookingContext';
import { useAuth } from '../../auth/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { 
  venueRepository, courtRepository, slotRepository, 
  couponRepository, bookingRepository 
} from '../../../repositories';
import Button from '../../../components/common/Button';
import StepIndicator from '../../../components/common/StepIndicator';
import SlotCard from '../../slots/components/SlotCard';
import SportBadge from '../../venues/components/SportBadge';
import Input from '../../../components/common/Input';
import QRCode from '../../../components/common/QRCode';
import { Star, MapPin, Tag, CreditCard, CheckCircle2, ShieldCheck, Dribbble, Target, Trophy, Award, Activity } from 'lucide-react';
import confetti from 'canvas-confetti';

const STEPS = ['Sport', 'Venue & Court', 'Date & Slots', 'Summary', 'Payment', 'Confirmation'];

const SPORTS_LIST = [
  { name: 'Football Turf', icon: Dribbble },
  { name: 'Cricket Nets', icon: Target },
  { name: 'Badminton', icon: Trophy },
  { name: 'Tennis', icon: Award },
  { name: 'Basketball', icon: Dribbble },
  { name: 'Volleyball', icon: Dribbble },
  { name: 'Swimming', icon: Activity },
  { name: 'Squash', icon: Activity }
];

export const BookingWizard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStep = parseInt(searchParams.get('step')) || 1;

  const {
    sport, setSport,
    venue, setVenue,
    court, setCourt,
    date, setDate,
    selectedSlots, setSelectedSlots,
    coupon, setCoupon,
    resetBooking,
    subtotal, discountAmount, totalAmount
  } = useBookingContext();

  // Wizard States
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [completedRef, setCompletedRef] = useState('');

  // Fetch Venues offering chosen sport
  const { data: venues = [] } = useQuery({
    queryKey: ['wizard-venues', sport],
    queryFn: () => venueRepository.getVenues({ sport }),
    enabled: currentStep === 2 && !!sport
  });

  // Fetch Courts for chosen venue & sport
  const { data: courts = [] } = useQuery({
    queryKey: ['wizard-courts', venue?.id, sport],
    queryFn: () => courtRepository.getCourtsByVenueAndSport(venue?.id, sport),
    enabled: currentStep === 2 && !!venue?.id && !!sport
  });

  // Validate booking context
  useEffect(() => {
    if (currentStep > 1) {
      if (!sport) {
        navigate('/book?step=1', { replace: true });
        return;
      }
      if (currentStep >= 3) {
        if (!venue) {
          navigate('/venues', { replace: true });
          return;
        }
        if (!court) {
          navigate(`/venues/${venue.id}`, { replace: true });
          return;
        }
      }
    }
  }, [currentStep, sport, venue, court, navigate]);

  // Fetch Slots
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  
  useEffect(() => {
    const loadSlots = async () => {
      if (currentStep !== 3 || !court || !date) return;
      setSlotsLoading(true);
      try {
        const list = await slotRepository.getAvailableSlots(court.id, date);
        setSlots(list.sort((a, b) => a.startTime.localeCompare(b.startTime)));
      } catch (err) {
        console.error(err);
      } finally {
        setSlotsLoading(false);
      }
    };
    loadSlots();
  }, [currentStep, court, date]);

  // Trigger confetti on confirmation load
  useEffect(() => {
    if (currentStep === 6) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [currentStep]);

  const setStep = (stepNum) => {
    setSearchParams({ step: stepNum.toString() });
  };

  const handleSportSelect = (sportName) => {
    setSport(sportName);
    setVenue(null);
    setCourt(null);
    setStep(2);
  };

  const handleCourtSelect = (v, c) => {
    setVenue(v);
    setCourt(c);
    setDate(new Date().toISOString().split('T')[0]); // default to today
    setStep(3);
  };

  const handleSlotToggle = (slot) => {
    setSelectedSlots(prev => {
      const isSel = prev.some(s => s.id === slot.id);
      if (isSel) {
        return prev.filter(s => s.id !== slot.id);
      }
      return [...prev, slot].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
  };

  const handleValidateCoupon = async () => {
    setCouponError('');
    setCouponSuccess('');
    try {
      const res = await couponRepository.validateCoupon(couponCode, {
        subtotal,
        sport,
        venueId: venue.id
      });
      setCoupon(res);
      setCouponSuccess(`Coupon code applied! ₹${res.discountAmount} discount applied.`);
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon.');
      setCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setCoupon(null);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  const handleMockPayment = async () => {
    setPaymentProcessing(true);
    
    // Simulate Razorpay processing flow
    setTimeout(async () => {
      try {
        const bookingData = {
          customerId: currentUser?.uid || 'user-customer',
          venueId: venue.id,
          courtId: court.id,
          date,
          startTime: selectedSlots[0].startTime,
          endTime: selectedSlots[selectedSlots.length - 1].endTime,
          slotIds: selectedSlots.map(s => s.id),
          subtotal,
          discountAmount,
          couponCode: coupon?.code,
          totalAmount,
          paymentMethod: 'UPI'
        };

        const res = await bookingRepository.createBooking(bookingData);
        
        // If coupon applied, track coupon usage
        if (coupon) {
          await couponRepository.applyCoupon(coupon.couponId, res.id, currentUser.uid, discountAmount);
        }

        setCompletedRef(res.bookingRef);
        setStep(6);
      } catch (err) {
        alert(err.message || 'Payment processing failed.');
      } finally {
        setPaymentProcessing(false);
      }
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 select-none">
      <StepIndicator steps={STEPS} currentStep={currentStep} className="mb-8" />

      {/* Main Grid: Steps content on left, Cart preview details on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Step Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Sport Grid */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-neutral-800 uppercase tracking-widest text-center">
                Select Sport Category
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {SPORTS_LIST.map((sp) => {
                  const Icon = sp.icon;
                  return (
                    <button
                      key={sp.name}
                      onClick={() => handleSportSelect(sp.name)}
                      className={`flex flex-col items-center justify-center p-6 border rounded-xl bg-white shadow-xs transition-all hover:scale-105 active:scale-95 ${
                        sport === sp.name ? 'border-primary ring-2 ring-primary-light' : 'border-neutral-200 hover:border-primary'
                      }`}
                    >
                      <Icon size={28} className="mb-2.5 text-primary" />
                      <span className="text-xs font-semibold text-neutral-700">{sp.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Venue and Court list */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-neutral-800 uppercase tracking-widest">
                Choose Court for {sport}
              </h2>
              
              {venues.length === 0 ? (
                <p className="text-xs font-semibold text-neutral-400">No venues offer this sport currently.</p>
              ) : (
                <div className="space-y-6">
                  {venues.map((v) => (
                    <div key={v.id} className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm space-y-4">
                      {/* Venue Intro */}
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="text-sm font-bold text-neutral-800">{v.name}</h3>
                          <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
                            <MapPin size={12} />
                            {v.address}, {v.city}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-500 font-bold text-xs">
                          <Star size={12} className="fill-current text-amber-500 shrink-0" />
                          <span>{v.avgRating || 'New'}</span>
                        </div>
                      </div>

                      {/* Filter Courts for this venue */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
                        {courts.filter(c => c.venueId === v.id).map(c => (
                          <div 
                            key={c.id} 
                            onClick={() => handleCourtSelect(v, c)}
                            className="p-3 border border-neutral-200 hover:border-primary hover:shadow bg-slate-50/50 hover:bg-white rounded-lg cursor-pointer flex flex-col justify-between"
                          >
                            <div>
                              <h4 className="text-xs font-bold text-neutral-800">{c.name}</h4>
                              <p className="text-[10px] text-neutral-500 mt-1">Surface: {c.surfaceType}</p>
                            </div>
                            <div className="flex justify-between items-center mt-3 pt-2 border-t border-neutral-100/50">
                              <span className="text-[9px] text-neutral-400 font-semibold uppercase">Rate</span>
                              <span className="text-xs font-bold text-neutral-800">₹{c.baseHourlyRate}/hr</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Date & Slots */}
          {currentStep === 3 && court && (
            <div className="space-y-6 bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-neutral-850">Select Date & slots</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">{venue.name} &bull; {court.name}</p>
                </div>
                
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="text-xs font-bold rounded border border-neutral-200 py-1.5 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white text-neutral-700"
                />
              </div>

              {/* Slot grid */}
              <div className="border-t border-neutral-100 pt-4">
                <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-widest mb-3">Available Slots</h4>
                {slotsLoading ? (
                  <p className="text-xs font-semibold text-neutral-450 text-center py-6">Loading slots...</p>
                ) : slots.length === 0 ? (
                  <p className="text-xs font-semibold text-neutral-400 text-center py-6">No slots generated for this date.</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {slots.map((s) => {
                      const isSel = selectedSlots.some(x => x.id === s.id);
                      let style = 'bg-white border-neutral-200 text-neutral-700 hover:border-primary';
                      if (s.status === 'booked') style = 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed';
                      if (s.status === 'blocked') style = 'bg-rose-50 text-accent-red border-rose-200 cursor-not-allowed';
                      if (isSel) style = 'bg-primary text-white border-primary ring-2 ring-primary-light';

                      return (
                        <button
                          key={s.id}
                          disabled={s.status !== 'available'}
                          onClick={() => handleSlotToggle(s)}
                          className={`flex flex-col items-center justify-center p-2 rounded border text-xs font-bold transition-all shadow-xs leading-none ${style}`}
                        >
                          <span>{s.startTime}</span>
                          <span className={`text-[9px] font-medium mt-1 ${isSel ? 'text-white/80' : 'text-neutral-500'}`}>
                            ₹{s.price}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Coupon apply widget */}
              {selectedSlots.length > 0 && (
                <div className="border-t border-neutral-100 pt-4 space-y-3">
                  <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-widest">Apply Promo Coupon</h4>
                  {coupon ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded text-xs text-emerald-850">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Tag size={14} />
                        COUPON APPLIED: {coupon.code} (-₹{coupon.discountAmount})
                      </span>
                      <button onClick={handleRemoveCoupon} className="text-xs font-bold text-neutral-500 hover:text-neutral-800 underline">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="ENTER COUPON CODE"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        error={couponError}
                        className="max-w-xs"
                      />
                      <Button onClick={handleValidateCoupon} variant="primary" size="md">
                        Apply
                      </Button>
                    </div>
                  )}
                  {couponSuccess && <p className="text-xs text-emerald-600 font-semibold">{couponSuccess}</p>}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Summary review */}
          {currentStep === 4 && (
            <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-neutral-850 border-b border-neutral-100 pb-2">
                Booking Information Review
              </h2>
              
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-neutral-700">
                <div>
                  <span className="block text-[10px] text-neutral-450 uppercase tracking-wider">Venue</span>
                  <span className="text-neutral-900 font-bold block mt-0.5">{venue?.name}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-neutral-450 uppercase tracking-wider">Court / Sport</span>
                  <span className="text-neutral-900 font-bold block mt-0.5">{court?.name} ({sport})</span>
                </div>
                <div>
                  <span className="block text-[10px] text-neutral-450 uppercase tracking-wider">Booking Date</span>
                  <span className="text-neutral-900 font-bold block mt-0.5">{date}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-neutral-450 uppercase tracking-wider">Selected Slots</span>
                  <span className="text-neutral-900 font-bold block mt-0.5">
                    {selectedSlots.map(s => s.startTime).join(', ')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Payment Processing Overlay */}
          {currentStep === 5 && (
            <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center space-y-6">
              <div className="h-16 w-16 bg-primary-light text-primary rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CreditCard size={28} />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">Secure Payment Gateway</h3>
                <p className="text-xs text-neutral-500 mt-1">Completing court reservation with simulated payment gateway order.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg max-w-sm mx-auto border border-neutral-100">
                <div className="flex justify-between text-xs font-semibold text-neutral-600 mb-2">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs font-semibold text-emerald-600 mb-2">
                    <span>Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-neutral-800 pt-2 border-t border-neutral-200">
                  <span>Grand Total</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleMockPayment}
                loading={paymentProcessing}
                fullWidth
                className="max-w-xs mx-auto"
              >
                Authorize & Pay Now
              </Button>
            </div>
          )}

          {/* Step 6: Confirmation check */}
          {currentStep === 6 && (
            <div className="bg-white border border-emerald-100 rounded-xl p-6 text-center space-y-6">
              <div className="h-16 w-16 bg-emerald-50 text-accent-green rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} className="text-emerald-500" />
              </div>
              
              <div>
                <h2 className="text-lg font-extrabold text-neutral-900">Booking Reservation Complete!</h2>
                <p className="text-xs text-neutral-500 mt-1">Your slots are now officially registered under reference:</p>
                <span className="inline-block mt-3 text-lg font-extrabold text-primary border border-primary/20 bg-primary-light px-4 py-1 rounded tracking-widest select-all">
                  {completedRef}
                </span>
              </div>

              {/* QR Display */}
              <div className="flex flex-col items-center justify-center p-4 border border-neutral-150 bg-slate-50/50 rounded-xl max-w-sm mx-auto">
                <QRCode value={completedRef} size={150} />
                <p className="text-[10px] text-neutral-400 mt-3 font-semibold uppercase tracking-wider">Scan this QR code for walk-in check-in validation</p>
              </div>

              <div className="flex justify-center items-center gap-3 max-w-xs mx-auto pt-2">
                <Button 
                  onClick={() => { resetBooking(); navigate('/dashboard/customer/bookings'); }}
                  variant="outline" 
                  fullWidth
                >
                  View Bookings
                </Button>
                <Button 
                  onClick={() => { resetBooking(); setStep(1); }}
                  variant="primary" 
                  fullWidth
                >
                  Book Another
                </Button>
              </div>
            </div>
          )}

          {/* Back/Next Control buttons */}
          {currentStep > 1 && currentStep < 5 && (
            <div className="flex justify-between items-center pt-4 border-t border-neutral-200">
              <Button 
                variant="outline" 
                onClick={() => setStep(currentStep - 1)}
              >
                Back
              </Button>
              
              <Button
                variant="primary"
                disabled={
                  (currentStep === 2 && (!venue || !court)) ||
                  (currentStep === 3 && selectedSlots.length === 0)
                }
                onClick={() => setStep(currentStep + 1)}
              >
                {currentStep === 4 ? 'Proceed to Pay' : 'Next'}
              </Button>
            </div>
          )}
        </div>

        {/* Right Sidebar: Basket Summary info (Steps 2-4) */}
        {currentStep > 1 && currentStep < 5 && (
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-5 h-fit">
            <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-widest border-b border-neutral-100 pb-2">
              Booking basket
            </h3>
            
            <div className="space-y-3 text-xs text-neutral-600">
              <div className="flex justify-between font-semibold">
                <span className="text-neutral-500">Sport</span>
                <span className="text-neutral-800 font-bold">{sport}</span>
              </div>
              {venue && (
                <div className="flex justify-between font-semibold">
                  <span className="text-neutral-500">Venue</span>
                  <span className="text-neutral-800 font-bold truncate max-w-[120px]">{venue.name}</span>
                </div>
              )}
              {court && (
                <div className="flex justify-between font-semibold">
                  <span className="text-neutral-500">Court</span>
                  <span className="text-neutral-800 font-bold truncate max-w-[120px]">{court.name}</span>
                </div>
              )}
              {date && (
                <div className="flex justify-between font-semibold">
                  <span className="text-neutral-500">Date</span>
                  <span className="text-neutral-800 font-bold">{date}</span>
                </div>
              )}
              {selectedSlots.length > 0 && (
                <div className="flex justify-between font-semibold">
                  <span className="text-neutral-500">Slots Selected</span>
                  <span className="text-neutral-800 font-bold">{selectedSlots.length} slot(s)</span>
                </div>
              )}
            </div>

            {selectedSlots.length > 0 && (
              <div className="border-t border-neutral-100 pt-4 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-neutral-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs font-semibold text-emerald-600">
                    <span>Coupon Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-100">
                  <span>Grand Total</span>
                  <span className="text-primary font-extrabold">₹{totalAmount}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingWizard;
