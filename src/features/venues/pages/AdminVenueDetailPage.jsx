import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { venueRepository, courtRepository, reviewRepository } from '../../../repositories';
import {
  Building2, Calendar, Landmark, DollarSign, Sparkles,
  Trophy, Image, Star, Settings, Save, Plus, Trash2,
  CheckCircle2, AlertCircle, Clock, ShieldAlert, Eye, Sliders
} from 'lucide-react';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import LoadingCard from '../../../components/common/LoadingCard';
import ErrorState from '../../../components/common/ErrorState';

const ALL_SPORTS = [
  'Football Turf', 'Cricket Turf', 'Cricket Nets', 'Badminton',
  'Tennis', 'Basketball', 'Volleyball', 'Table Tennis', 'Squash', 'Swimming'
];

const ALL_AMENITIES = ['Parking', 'Changing Rooms', 'Floodlights', 'Cafeteria', 'Restrooms', 'WiFi'];
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const AdminVenueDetailPage = () => {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch venue
  const { data: venue, isLoading: venueLoading, isError: venueError } = useQuery({
    queryKey: ['admin-venue-detail', venueId],
    queryFn: () => venueRepository.getVenueById(venueId),
    enabled: !!venueId
  });

  // Fetch courts
  const { data: courts = [], isLoading: courtsLoading } = useQuery({
    queryKey: ['admin-venue-courts', venueId],
    queryFn: () => courtRepository.getCourtsByVenue(venueId),
    enabled: !!venueId
  });

  // Fetch reviews
  const { data: reviews = [] } = useQuery({
    queryKey: ['admin-venue-reviews', venueId],
    queryFn: () => reviewRepository.getReviewsByVenue(venueId),
    enabled: !!venueId
  });

  // Mutation to update venue
  const updateVenueMutation = useMutation({
    mutationFn: (updatedFields) => venueRepository.updateVenue(venueId, updatedFields),
    onSuccess: (data) => {
      queryClient.setQueryData(['admin-venue-detail', venueId], data);
      queryClient.invalidateQueries({ queryKey: ['admin-venues'] });
      setSuccessMsg('Venue configuration updated successfully.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSuccessMsg(''), 5000);
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to update venue details.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setErrorMsg(''), 5000);
    }
  });

  // Sub-mutations for Quick toggles (Courts)
  const toggleCourtStatus = useMutation({
    mutationFn: ({ courtId, fields }) => courtRepository.updateCourt(courtId, fields),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-venue-courts', venueId] });
      setSuccessMsg('Court status updated.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  });

  if (venueLoading) return <LoadingCard message="Fetching venue console..." />;
  if (venueError || !venue) return <ErrorState message="Failed to load venue details." />;

  // Default values mapping
  const formDefaults = {
    name: venue.name || '',
    description: venue.description || '',
    address: venue.address || '',
    city: venue.city || '',
    state: venue.state || '',
    pincode: venue.pincode || '',
    phone: venue.phone || '',
    email: venue.email || '',
    isActive: venue.isActive ?? true,
    isFeatured: venue.isFeatured ?? false,

    // settings overrides
    maxSlotsPerUser: venue.settings?.booking?.maxSlotsPerUser ?? 4,
    allowWalkIns: venue.settings?.booking?.allowWalkIns ?? true,
    slotDurationMinutes: venue.settings?.booking?.slotDurationMinutes ?? 60,
    advanceBookingDays: venue.settings?.booking?.advanceBookingDays ?? 14,
    bookingBufferMinutes: venue.settings?.booking?.bookingBufferMinutes ?? 10,

    taxPercent: venue.settings?.pricing?.taxPercent ?? 5,
    convenienceFee: venue.settings?.pricing?.convenienceFee ?? 50,

    fullRefundHours: venue.settings?.refundPolicy?.fullRefundHours ?? 24,
    partialRefundHours: venue.settings?.refundPolicy?.partialRefundHours ?? 12,
    partialRefundPercent: venue.settings?.refundPolicy?.partialRefundPercent ?? 50,

    enableEmailNotifications: venue.settings?.notifications?.enableEmail ?? true,
    enableSmsNotifications: venue.settings?.notifications?.enableSms ?? false,

    coverImageUrl: venue.coverImageUrl || '',
    galleryImageUrls: venue.galleryImageUrls || []
  };

  const handleSaveOverview = (data) => {
    updateVenueMutation.mutate({
      name: data.name,
      description: data.description,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      phone: data.phone,
      email: data.email
    });
  };

  const handleSaveHours = (hoursData) => {
    updateVenueMutation.mutate({ openingHours: hoursData });
  };

  const handleToggleAmenity = (amenity) => {
    const list = venue.amenities || [];
    const updated = list.includes(amenity)
      ? list.filter(a => a !== amenity)
      : [...list, amenity];
    updateVenueMutation.mutate({ amenities: updated });
  };

  const handleToggleSport = (sport) => {
    const list = venue.sports || [];
    const updated = list.includes(sport)
      ? list.filter(s => s !== sport)
      : [...list, sport];
    updateVenueMutation.mutate({ sports: updated });
  };

  const handleSaveGallery = (coverUrl, galleryList) => {
    updateVenueMutation.mutate({
      coverImageUrl: coverUrl,
      galleryImageUrls: galleryList
    });
  };

  const handleSaveSettings = (data) => {
    updateVenueMutation.mutate({
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      settings: {
        booking: {
          maxSlotsPerUser: data.maxSlotsPerUser,
          allowWalkIns: data.allowWalkIns,
          slotDurationMinutes: data.slotDurationMinutes,
          advanceBookingDays: data.advanceBookingDays,
          bookingBufferMinutes: data.bookingBufferMinutes
        },
        pricing: {
          taxPercent: data.taxPercent,
          convenienceFee: data.convenienceFee
        },
        refundPolicy: {
          fullRefundHours: data.fullRefundHours,
          partialRefundHours: data.partialRefundHours,
          partialRefundPercent: data.partialRefundPercent
        },
        notifications: {
          enableEmail: data.enableEmailNotifications,
          enableSms: data.enableSmsNotifications
        }
      }
    });
  };

  return (
    <div className="space-y-6 text-slate-350 select-none pb-12">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="text-primary" size={24} />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{venue.name}</h2>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${venue.isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              {venue.isActive ? 'Active Listing' : 'Suspended'}
            </span>
          </div>
          <p className="text-xs text-slate-450 mt-1">{venue.address}, {venue.city}, {venue.state}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link to={`/venues/${venue.id}`}>
            <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-100" leftIcon={<Eye size={14} />}>
              Public View
            </Button>
          </Link>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-500 rounded-lg flex items-center gap-2 max-w-4xl">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-xs font-semibold text-accent-red rounded-lg flex items-center gap-2 max-w-4xl">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 gap-1 select-none">
        {[
          { id: 'overview', label: 'Overview', icon: Building2 },
          { id: 'hours', label: 'Business Hours', icon: Clock },
          { id: 'courts', label: 'Courts', icon: Landmark },
          { id: 'amenities', label: 'Amenities', icon: Sparkles },
          { id: 'sports', label: 'Supported Sports', icon: Trophy },
          { id: 'gallery', label: 'Gallery', icon: Image },
          { id: 'reviews', label: 'Reviews', icon: Star },
          { id: 'settings', label: 'Settings & Policies', icon: Settings }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === t.id
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="max-w-4xl">
        {activeTab === 'overview' && <OverviewPanel defaults={formDefaults} onSubmit={handleSaveOverview} isSaving={updateVenueMutation.isLoading} />}
        {activeTab === 'hours' && <HoursPanel openingHours={venue.openingHours || {}} onSubmit={handleSaveHours} isSaving={updateVenueMutation.isLoading} />}
        {activeTab === 'courts' && <CourtsPanel courts={courts} venueId={venueId} onToggle={(courtId, fields) => toggleCourtStatus.mutate({ courtId, fields })} />}
        {activeTab === 'amenities' && <AmenitiesPanel activeAmenities={venue.amenities || []} onToggle={handleToggleAmenity} />}
        {activeTab === 'sports' && <SportsPanel activeSports={venue.sports || []} onToggle={handleToggleSport} />}
        {activeTab === 'gallery' && <GalleryPanel defaults={formDefaults} onSubmit={handleSaveGallery} isSaving={updateVenueMutation.isLoading} />}
        {activeTab === 'reviews' && <ReviewsPanel reviews={reviews} />}
        {activeTab === 'settings' && <SettingsPanel defaults={formDefaults} onSubmit={handleSaveSettings} isSaving={updateVenueMutation.isLoading} />}
      </div>
    </div>
  );
};

// Panel 1: Overview
const OverviewPanel = ({ defaults, onSubmit, isSaving }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: defaults });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-200 pb-2">Venue General Information</h3>
      <Input label="Venue Profile Name" error={errors.name} {...register('name', { required: 'Name is required' })} />
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold text-slate-600">Venue Description</label>
        <textarea
          className="w-full text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50/80 p-3 focus:outline-none focus:ring-1 focus:ring-primary text-slate-700 min-h-[100px]"
          {...register('description')}
        />
      </div>
      <Input label="Street Address" error={errors.address} {...register('address', { required: 'Address is required' })} />
      <div className="grid grid-cols-3 gap-4">
        <Input label="City" {...register('city')} />
        <Input label="State" {...register('state')} />
        <Input label="Pincode" {...register('pincode')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Contact Phone" {...register('phone')} />
        <Input label="Contact Email" type="email" {...register('email')} />
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" variant="primary" loading={isSaving} leftIcon={<Save size={14} />}>Save Details</Button>
      </div>
    </form>
  );
};

// Panel 2: Business Hours
const HoursPanel = ({ openingHours, onSubmit, isSaving }) => {
  const [hours, setHours] = useState(
    DAYS.reduce((acc, d) => ({
      ...acc,
      [d]: openingHours[d] || { open: '06:00', close: '22:00', isOpen: true }
    }), {})
  );

  const handleToggle = (day) => {
    setHours(prev => ({
      ...prev,
      [day]: { ...prev[day], isOpen: !prev[day].isOpen }
    }));
  };

  const handleTimeChange = (day, field, val) => {
    setHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: val }
    }));
  };

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-2">Weekly Operational Hours</h3>
      <div className="divide-y divide-slate-200">
        {DAYS.map(day => (
          <div key={day} className="py-3 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider w-24">{day}</span>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hours[day].isOpen}
                  onChange={() => handleToggle(day)}
                  className="rounded border-slate-300 bg-slate-50 text-primary h-4.5 w-4.5"
                />
                <span className="text-2xs font-bold text-slate-600">Open</span>
              </label>

              {hours[day].isOpen && (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={hours[day].open}
                    onChange={e => handleTimeChange(day, 'open', e.target.value)}
                    className="text-xs font-bold rounded border border-slate-200 bg-slate-50 p-1 px-2 focus:outline-none focus:ring-primary text-slate-700"
                  />
                  <span className="text-slate-500 text-xs">to</span>
                  <input
                    type="time"
                    value={hours[day].close}
                    onChange={e => handleTimeChange(day, 'close', e.target.value)}
                    className="text-xs font-bold rounded border border-slate-200 bg-slate-50 p-1 px-2 focus:outline-none focus:ring-primary text-slate-700"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-4">
        <Button onClick={() => onSubmit(hours)} variant="primary" loading={isSaving} leftIcon={<Save size={14} />}>Save Hours</Button>
      </div>
    </div>
  );
};

// Panel 3: Courts
const CourtsPanel = ({ courts, venueId, onToggle }) => {
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4">
      <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-2">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Courts & Fields</h3>
        <Link to={`/dashboard/admin/courts/form?venueId=${venueId}`}>
          <Button variant="primary" size="xs" leftIcon={<Plus size={14} />}>Add Court</Button>
        </Link>
      </div>

      {courts.length === 0 ? (
        <div className="text-center p-8 text-slate-500 font-bold text-xs">
          No courts created for this venue. Click "Add Court" to list your play areas.
        </div>
      ) : (
        <div className="divide-y divide-slate-200">
          {courts.map(court => (
            <div key={court.id} className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900">{court.name}</h4>
                <p className="text-[10px] text-slate-450 mt-0.5">{court.sport} • Capacity: {court.capacity} players</p>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-slate-600">
                  <input
                    type="checkbox"
                    checked={court.isActive}
                    onChange={() => onToggle(court.id, { isActive: !court.isActive })}
                    className="rounded border-slate-300 bg-slate-50 text-primary h-3.5 w-3.5"
                  />
                  <span>Active</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-slate-600">
                  <input
                    type="checkbox"
                    checked={court.isUnderMaintenance}
                    onChange={() => onToggle(court.id, { isUnderMaintenance: !court.isUnderMaintenance })}
                    className="rounded border-slate-300 bg-slate-50 text-primary h-3.5 w-3.5"
                  />
                  <span className="text-orange-500">Maintenance</span>
                </label>
                <Link to={`/dashboard/admin/courts/form/${court.id}`}>
                  <Button variant="outline" size="xs" className="border-slate-200 hover:bg-slate-100 text-slate-350">Edit</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Panel 4: Amenities
const AmenitiesPanel = ({ activeAmenities, onToggle }) => {
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-2">Amenities Offerings</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {ALL_AMENITIES.map(amenity => {
          const isActive = activeAmenities.includes(amenity);
          return (
            <button
              key={amenity}
              onClick={() => onToggle(amenity)}
              className={`p-4 border rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-2 ${isActive
                  ? 'bg-primary/20 border-primary text-primary shadow shadow-primary/10'
                  : 'bg-slate-50 border-slate-200 text-slate-450 hover:text-slate-900'
                }`}
            >
              <span>{amenity}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Panel 5: Sports
const SportsPanel = ({ activeSports, onToggle }) => {
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-2">Supported Play Sports</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {ALL_SPORTS.map(sport => {
          const isActive = activeSports.includes(sport);
          return (
            <button
              key={sport}
              onClick={() => onToggle(sport)}
              className={`p-4 border rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-2 ${isActive
                  ? 'bg-primary/20 border-primary text-primary shadow shadow-primary/10'
                  : 'bg-slate-50 border-slate-200 text-slate-450 hover:text-slate-900'
                }`}
            >
              <span>{sport}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Panel 6: Gallery
const GalleryPanel = ({ defaults, onSubmit, isSaving }) => {
  const [coverUrl, setCoverUrl] = useState(defaults.coverImageUrl);
  const [newImage, setNewImage] = useState('');
  const [gallery, setGallery] = useState(defaults.galleryImageUrls);

  const handleAddImage = () => {
    if (!newImage.trim()) return;
    setGallery(prev => [...prev, newImage.trim()]);
    setNewImage('');
  };

  const handleRemoveImage = (idx) => {
    setGallery(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-2">Venue Media Gallery</h3>

      <Input
        label="Cover Page Image URL"
        value={coverUrl}
        onChange={e => setCoverUrl(e.target.value)}
      />
      {coverUrl && (
        <img src={coverUrl} alt="Cover Preview" className="h-32 w-full object-cover rounded-lg border border-slate-200 shadow" />
      )}

      <div className="h-[1px] bg-slate-100 my-4" />

      <div className="flex gap-2 items-end">
        <div className="flex-grow">
          <Input
            label="Add Gallery Image URL"
            placeholder="https://images.unsplash.com/..."
            value={newImage}
            onChange={e => setNewImage(e.target.value)}
          />
        </div>
        <Button onClick={handleAddImage} variant="primary" type="button">Add Image</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
        {gallery.map((img, idx) => (
          <div key={idx} className="relative group border border-slate-200 rounded-lg overflow-hidden h-20 bg-slate-50">
            <img src={img} alt="Gallery item" className="h-full w-full object-cover" />
            <button
              onClick={() => handleRemoveImage(idx)}
              className="absolute top-1 right-1 bg-red-500 text-slate-900 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={10} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={() => onSubmit(coverUrl, gallery)} variant="primary" loading={isSaving} leftIcon={<Save size={14} />}>Save Gallery</Button>
      </div>
    </div>
  );
};

// Panel 7: Reviews
const ReviewsPanel = ({ reviews }) => {
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-2">Customer Feedback Reviews</h3>
      {reviews.length === 0 ? (
        <div className="text-center p-8 text-slate-500 font-bold text-xs">
          No ratings or reviews received yet.
        </div>
      ) : (
        <div className="space-y-4 divide-y divide-slate-200">
          {reviews.map((rev, idx) => (
            <div key={rev.id || idx} className={`${idx > 0 ? 'pt-4' : ''} space-y-2`}>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{rev.customerName}</span>
                  <span className="text-[10px] text-slate-450 block">{new Date(rev.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex text-amber-500 gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className={i < rev.rating ? 'fill-amber-500' : 'text-slate-700'} />
                  ))}
                </div>
              </div>
              <p className="text-2xs text-slate-600 leading-relaxed font-semibold">{rev.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Panel 8: Settings
const SettingsPanel = ({ defaults, onSubmit, isSaving }) => {
  const { register, handleSubmit } = useForm({ defaultValues: defaults });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-slate-200 p-6 rounded-2xl space-y-5">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-2">Venue Booking Rules & Status</h3>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-3 cursor-pointer pt-4">
          <input type="checkbox" className="rounded border-slate-300 bg-slate-50 text-primary h-4.5 w-4.5" {...register('isActive')} />
          <span className="text-2xs font-bold text-slate-900">Active Venue Listing Status</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer pt-4">
          <input type="checkbox" className="rounded border-slate-300 bg-slate-50 text-primary h-4.5 w-4.5" {...register('isFeatured')} />
          <span className="text-2xs font-bold text-slate-900">Feature in Homepage list</span>
        </label>
      </div>

      <div className="h-[1px] bg-slate-100" />

      {/* Booking rules */}
      <h4 className="text-2xs font-bold text-slate-900 uppercase tracking-wider">Booking Restrictions</h4>
      <div className="grid grid-cols-3 gap-4">
        <Input label="Max Slot Hours / user" type="number" {...register('maxSlotsPerUser', { valueAsNumber: true })} />
        <Input label="Advance booking limit (days)" type="number" {...register('advanceBookingDays', { valueAsNumber: true })} />
        <Input label="Hold Duration (minutes)" type="number" {...register('bookingBufferMinutes', { valueAsNumber: true })} />
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" className="rounded border-slate-300 bg-slate-50 text-primary h-4.5 w-4.5" {...register('allowWalkIns')} />
        <span className="text-2xs font-bold text-slate-900">Allow cash cashier reservations (Walk-ins)</span>
      </label>

      <div className="h-[1px] bg-slate-100" />

      {/* Pricing overrides */}
      <h4 className="text-2xs font-bold text-slate-900 uppercase tracking-wider">Pricing Controls Override</h4>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Tax Rate override (%)" type="number" {...register('taxPercent', { valueAsNumber: true })} />
        <Input label="Convenience fee override (INR)" type="number" {...register('convenienceFee', { valueAsNumber: true })} />
      </div>

      <div className="h-[1px] bg-slate-100" />

      {/* Refund Cutoffs */}
      <h4 className="text-2xs font-bold text-slate-900 uppercase tracking-wider">Cancellation Refund Policy</h4>
      <div className="grid grid-cols-3 gap-4">
        <Input label="Full Refund Hours" type="number" {...register('fullRefundHours', { valueAsNumber: true })} />
        <Input label="Partial Refund Hours" type="number" {...register('partialRefundHours', { valueAsNumber: true })} />
        <Input label="Partial Refund %" type="number" {...register('partialRefundPercent', { valueAsNumber: true })} />
      </div>

      <div className="h-[1px] bg-slate-100" />

      {/* Notifications */}
      <h4 className="text-2xs font-bold text-slate-900 uppercase tracking-wider">Venue Notifications</h4>
      <div className="flex gap-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="rounded border-slate-300 bg-slate-50 text-primary h-4.5 w-4.5" {...register('enableEmailNotifications')} />
          <span className="text-2xs font-bold text-slate-900">Enable Email Alerts</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="rounded border-slate-300 bg-slate-50 text-primary h-4.5 w-4.5" {...register('enableSmsNotifications')} />
          <span className="text-2xs font-bold text-slate-900">Enable SMS Alerts</span>
        </label>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" variant="primary" loading={isSaving} leftIcon={<Save size={14} />}>Save Configurations</Button>
      </div>
    </form>
  );
};

export default AdminVenueDetailPage;
