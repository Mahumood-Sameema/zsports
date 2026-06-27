// VenueDetailPage Component
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useVenueDetail from '../hooks/useVenueDetail';
import VenueGallery from '../components/VenueGallery';
import VenueMap from '../components/VenueMap';
import VenueAmenities from '../components/VenueAmenities';
import CourtCard from '../../courts/components/CourtCard';
import SportBadge from '../components/SportBadge';
import StarRating from '../../../components/common/StarRating';
import TabGroup from '../../../components/common/TabGroup';
import Button from '../../../components/common/Button';
import LoadingCard from '../../../components/common/LoadingCard';
import ErrorState from '../../../components/common/ErrorState';
import StatusBadge from '../../../components/common/StatusBadge';
import { useAuth } from '../../auth/hooks/useAuth';
import { slotRepository } from '../../../repositories';
import { format, addDays } from 'date-fns';
import { Calendar, Clock, Star, Landmark } from 'lucide-react';

export const VenueDetailPage = () => {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Booking states
  const [selectedSport, setSelectedSport] = useState('');
  const [bookingDate, setBookingDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Fetch venue detail (venue info, courts, reviews)
  const { venue, courts, reviews, isLoading, isError } = useVenueDetail(venueId);

  useEffect(() => {
    if (venue && venue.sports?.length > 0 && !selectedSport) {
      setSelectedSport(venue.sports[0]);
    }
  }, [venue, selectedSport]);

  // Load slots when court or date changes
  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedCourt) return;
      setSlotsLoading(true);
      try {
        const list = await slotRepository.getAvailableSlots(selectedCourt.id, bookingDate);
        setSlots(list.sort((a, b) => a.startTime.localeCompare(b.startTime)));
      } catch (err) {
        console.error('Failed to load slots:', err);
      } finally {
        setSlotsLoading(false);
      }
    };
    loadSlots();
    setSelectedSlots([]);
  }, [selectedCourt, bookingDate]);

  // Set default court when sport filter changes
  useEffect(() => {
    if (courts && courts.length > 0) {
      const active = courts.find(c => c.sport === selectedSport && !c.isUnderMaintenance && c.isActive);
      setSelectedCourt(active || null);
    }
  }, [selectedSport, courts]);

  if (isLoading) return <div className="max-w-4xl mx-auto py-12"><LoadingCard message="Loading venue profile..." /></div>;
  if (isError || !venue) return <div className="max-w-4xl mx-auto py-12"><ErrorState message="Failed to load venue profile details." /></div>;

  const handleSlotClick = (slot) => {
    if (slot.status !== 'available') return;
    
    setSelectedSlots((prev) => {
      const isSelected = prev.some(s => s.id === slot.id);
      if (isSelected) {
        return prev.filter(s => s.id !== slot.id);
      }
      return [...prev, slot].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
  };

  const handleProceedBooking = () => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/venues/${venueId}` } });
      return;
    }

    if (selectedSlots.length === 0) return;

    // Persist slots to sessionStorage for bookingWizard
    sessionStorage.setItem('wizard_sport', selectedSport);
    sessionStorage.setItem('wizard_venue', JSON.stringify(venue));
    sessionStorage.setItem('wizard_court', JSON.stringify(selectedCourt));
    sessionStorage.setItem('wizard_date', bookingDate);
    sessionStorage.setItem('wizard_slots', JSON.stringify(selectedSlots));

    navigate('/book?step=4'); // continue checkout on the public booking wizard
  };

  // Compute rating breakdown
  const ratingBreakdown = [5, 4, 3, 2, 1].map(r => {
    const count = reviews.filter(rev => rev.rating === r).length;
    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { rating: r, count, pct };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 select-none">
      {/* Top Breadcrumb */}
      <nav className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-6">
        <Link to="/" className="hover:text-primary">Home</Link> &bull;{' '}
        <Link to="/venues" className="hover:text-primary">Venues</Link> &bull;{' '}
        <span className="text-neutral-700">{venue.name}</span>
      </nav>

      {/* Main Grid: Gallery + Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Gallery & Details */}
        <div className="lg:col-span-2 space-y-6">
          <VenueGallery images={[venue.coverImageUrl, ...(venue.galleryImageUrls || [])]} />
          
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-extrabold text-neutral-900 leading-tight">
              {venue.name}
            </h1>
            <div className="flex items-center gap-4 flex-wrap text-sm text-neutral-500 font-medium">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star size={16} className="fill-current" />
                <span>{venue.avgRating || 'New'}</span>
                <span className="text-neutral-400 font-normal">({venue.reviewCount} reviews)</span>
              </div>
              <div>&bull;</div>
              <div>{venue.address}, {venue.city}</div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <TabGroup
            tabs={[
              { id: 'overview', label: 'Overview' },
              { id: 'booking', label: 'Courts & Booking' },
              { id: 'reviews', label: 'Reviews' },
              { id: 'location', label: 'Location' }
            ]}
            activeTab={activeTab}
            onChange={(tabId) => setActiveTab(tabId)}
            className="mt-6"
          />

          {/* Tab Content Panels */}
          <div className="py-4">
            {/* Overview Panel */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-2">About Venue</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed font-normal">{venue.description}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-3">Amenities</h3>
                  <VenueAmenities amenities={venue.amenities} />
                </div>
              </div>
            )}

            {/* Booking Panel */}
            {activeTab === 'booking' && (
              <div className="space-y-6">
                {/* Sports filters */}
                {venue.sports?.length > 1 && (
                  <div className="flex gap-2 border-b border-neutral-100 pb-3 overflow-x-auto">
                    {venue.sports.map((sport) => (
                      <button
                        key={sport}
                        onClick={() => setSelectedSport(sport)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border select-none transition-all ${
                          selectedSport === sport
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-white border-neutral-250 text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        {sport}
                      </button>
                    ))}
                  </div>
                )}

                {/* Courts list for chosen sport */}
                <div>
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Available Courts</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {courts.filter(c => c.sport === selectedSport && c.isActive).map(court => (
                      <CourtCard
                        key={court.id}
                        court={court}
                        isSelected={selectedCourt?.id === court.id}
                        onSelect={(c) => setSelectedCourt(c)}
                      />
                    ))}
                  </div>
                </div>

                {/* Date Picker + Slot Display */}
                {selectedCourt && (
                  <div className="bg-slate-50 border border-neutral-200 rounded-xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-widest">Select Booking Date</h4>
                        <p className="text-[11px] text-neutral-500 font-semibold mt-0.5">Court: {selectedCourt.name}</p>
                      </div>
                      
                      <div className="relative">
                        <input
                          type="date"
                          min={format(new Date(), 'yyyy-MM-dd')}
                          max={format(addDays(new Date(), venue.advanceBookingDays || 14), 'yyyy-MM-dd')}
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="text-xs font-bold rounded border border-neutral-300 py-1.5 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white text-neutral-700"
                        />
                      </div>
                    </div>

                    <div className="h-[1px] bg-neutral-200" />

                    {/* Slot Grid */}
                    <div>
                      <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-widest mb-3">Available Slots</h4>
                      {slotsLoading ? (
                        <div className="flex justify-center py-8"><LoadingCard message="Loading slots..." className="!border-0 shadow-none !p-4" /></div>
                      ) : slots.length === 0 ? (
                        <p className="text-xs font-semibold text-neutral-400 text-center py-6">No slots generated for this date.</p>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                          {slots.map((slot) => {
                            const isSelected = selectedSlots.some(s => s.id === slot.id);
                            
                            let bgClass = 'bg-white hover:bg-neutral-50 border-neutral-200 hover:border-primary text-neutral-700';
                            if (slot.status === 'booked') bgClass = 'bg-neutral-100 text-neutral-400 border-neutral-250 cursor-not-allowed';
                            if (slot.status === 'blocked') bgClass = 'bg-rose-50 text-accent-red border-rose-200 cursor-not-allowed';
                            if (slot.status === 'on_hold') bgClass = 'bg-amber-50 text-amber-600 border-amber-250 cursor-not-allowed';
                            if (isSelected) bgClass = 'bg-primary text-white border-primary ring-2 ring-primary-light';

                            return (
                              <button
                                key={slot.id}
                                disabled={slot.status !== 'available'}
                                onClick={() => handleSlotClick(slot)}
                                className={`flex flex-col items-center justify-center p-2.5 rounded border text-xs font-bold transition-all shadow-xs leading-none ${bgClass}`}
                              >
                                <span>{slot.startTime}</span>
                                <span className={`text-[10px] font-medium mt-1 ${isSelected ? 'text-white/80' : 'text-neutral-500'}`}>
                                  ₹{slot.price}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Panel */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Aggregate Rating Chart */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 border border-neutral-200 rounded-xl p-5 items-center">
                  <div className="text-center">
                    <h3 className="text-3xl font-extrabold text-neutral-900">{venue.avgRating || 'New'}</h3>
                    <StarRating rating={venue.avgRating} size="md" className="justify-center mt-1.5" />
                    <span className="text-[11px] text-neutral-400 font-semibold block mt-1.5 uppercase">Based on {venue.reviewCount} Reviews</span>
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    {ratingBreakdown.map((bar) => (
                      <div key={bar.rating} className="flex items-center gap-3 text-xs text-neutral-550">
                        <span className="w-3 font-semibold text-neutral-700">{bar.rating}</span>
                        <Star size={13} className="fill-amber-400 text-amber-400 shrink-0" />
                        <div className="flex-grow bg-neutral-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-400 h-full rounded-full" style={{ width: `${bar.pct}%` }} />
                        </div>
                        <span className="w-6 text-right font-medium text-neutral-400">{bar.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review Feed */}
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-xs text-neutral-400 text-center py-6 font-semibold">No reviews left for this venue yet.</p>
                  ) : (
                    reviews.map((rev) => (
                      <div key={rev.id} className="p-4 bg-white border border-neutral-200 rounded-xl shadow-sm space-y-2.5">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2.5">
                            <StarRating rating={rev.rating} size="sm" />
                            <span className="text-xs font-bold text-neutral-800">{rev.customerName}</span>
                          </div>
                          <span className="text-[10px] text-neutral-400 font-semibold">
                            {format(parseISO(rev.createdAt), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600 leading-relaxed font-normal">{rev.comment}</p>
                        {rev.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {rev.tags.map((t, tid) => (
                              <span key={tid} className="text-[9px] font-bold bg-slate-50 text-neutral-500 border border-neutral-200 px-2 py-0.5 rounded-full uppercase">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Location Panel */}
            {activeTab === 'location' && (
              <VenueMap location={venue.location} address={venue.address} name={venue.name} />
            )}
          </div>
        </div>

        {/* Right Column: Opening Hours & Quick Book Info */}
        <div className="space-y-6">
          
          {/* Opening Hours list */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4 select-none">
            <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-widest border-b border-neutral-100 pb-2">Opening Hours</h3>
            <div className="space-y-2.5 text-xs text-neutral-600">
              {Object.entries(venue.openingHours).map(([day, hrs]) => (
                <div key={day} className="flex justify-between font-semibold">
                  <span className="capitalize text-neutral-500">{day}</span>
                  <span>{hrs.isOpen ? `${hrs.open} - ${hrs.close}` : <span className="text-accent-red font-bold">Closed</span>}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Book Sidebar Summary Box */}
          {selectedSlots.length > 0 && (
            <div className="bg-primary-light/50 border border-primary/20 rounded-xl p-5 space-y-4 shadow-sm select-none">
              <h3 className="text-xs font-bold text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Booking Basket</h3>
              
              <div className="space-y-2.5 text-xs text-neutral-700">
                <div className="flex justify-between font-semibold">
                  <span className="text-neutral-500">Sport</span>
                  <span className="text-neutral-800 font-bold">{selectedSport}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-neutral-500">Court</span>
                  <span className="text-neutral-800 font-bold truncate max-w-[120px]">{selectedCourt?.name}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-neutral-500">Slots Selected</span>
                  <span className="text-neutral-800 font-bold">{selectedSlots.length} slot(s)</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-neutral-500">Total Hours</span>
                  <span className="text-neutral-800 font-bold">{selectedSlots.length} hour(s)</span>
                </div>
              </div>

              <div className="border-t border-primary/10 pt-3 flex justify-between items-center">
                <span className="text-xs text-neutral-500 font-bold">Total Bill</span>
                <span className="text-base font-extrabold text-primary">
                  ₹{selectedSlots.reduce((acc, curr) => acc + curr.price, 0)}
                </span>
              </div>

              <Button onClick={handleProceedBooking} variant="primary" fullWidth>
                {currentUser ? 'Book Selected Slots' : 'Login to Book Slots'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VenueDetailPage;
