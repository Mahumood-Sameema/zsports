// VenueFormPage Component
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { venueRepository } from '../../../repositories';
import { useAuth } from '../../auth/hooks/useAuth';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import ImageUpload from '../../../components/common/ImageUpload';
import BackButton from '../../../components/common/BackButton';
import { Check, Compass, Plus, Save } from 'lucide-react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const ALL_SPORTS = [
  'Football Turf', 'Cricket Turf', 'Cricket Nets', 'Badminton', 
  'Tennis', 'Basketball', 'Volleyball', 'Table Tennis', 'Squash', 'Swimming'
];

const ALL_AMENITIES = ['Parking', 'Changing Rooms', 'Floodlights', 'Cafeteria', 'Restrooms', 'WiFi'];

// Schema
const venueFormSchema = zod.object({
  name: zod.string().min(3, 'Name must be at least 3 characters').max(120, 'Name must be under 120 characters'),
  description: zod.string().min(20, 'Description must be at least 20 characters').max(1000, 'Description must be under 1000 characters'),
  address: zod.string().min(5, 'Address is required'),
  city: zod.string().min(2, 'City is required'),
  state: zod.string().min(2, 'State is required'),
  pincode: zod.string().regex(/^\d{6}$/, 'Pincode must be exactly 6 digits'),
  phone: zod.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  email: zod.string().email('Please enter a valid email address'),
  sports: zod.array(zod.string()).min(1, 'Please select at least one sport'),
  amenities: zod.array(zod.string()),
  location: zod.object({
    lat: zod.number(),
    lng: zod.number()
  }),
  coverImageUrl: zod.string().min(1, 'Cover image is required to publish this venue'),
  galleryImageUrls: zod.array(zod.string()).optional()
});

export const VenueFormPage = () => {
  const { venueId } = useParams();
  const isEdit = !!venueId;
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [openingHours, setOpeningHours] = useState(
    DAYS.reduce((acc, d) => ({
      ...acc,
      [d]: { open: '06:00', close: '22:00', isOpen: true }
    }), {})
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(venueFormSchema),
    defaultValues: {
      name: '',
      description: '',
      address: '',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '',
      phone: '',
      email: '',
      sports: [],
      amenities: [],
      location: { lat: 19.0760, lng: 72.8777 }, // Mumbai defaults
      coverImageUrl: '',
      galleryImageUrls: []
    }
  });

  const watchSports = watch('sports') || [];
  const watchAmenities = watch('amenities') || [];
  const watchCover = watch('coverImageUrl');
  const watchGallery = watch('galleryImageUrls') || [];

  // Load existing details if editing
  useEffect(() => {
    const loadDetails = async () => {
      if (!isEdit) return;
      setLoading(true);
      try {
        const data = await venueRepository.getVenueById(venueId);
        if (data) {
          reset(data);
          if (data.openingHours) {
            setOpeningHours(data.openingHours);
          }
        }
      } catch (err) {
        console.error('Failed to load venue details for editing:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [venueId, isEdit, reset]);

  const handleCoordinatesGeocode = () => {
    // Mock geocoding coordinates around Mumbai center
    const addressStr = watch('address');
    if (!addressStr) {
      alert('Please enter address details first.');
      return;
    }
    const offsetLat = (Math.random() - 0.5) * 0.1;
    const offsetLng = (Math.random() - 0.5) * 0.1;
    setValue('location.lat', parseFloat((19.0760 + offsetLat).toFixed(6)));
    setValue('location.lng', parseFloat((72.8777 + offsetLng).toFixed(6)));
    alert('Mock Geocoding Complete! Latitude & Longitude mapped successfully.');
  };

  const handleSportToggle = (sportName) => {
    const active = [...watchSports];
    const index = active.indexOf(sportName);
    if (index === -1) {
      setValue('sports', [...active, sportName]);
    } else {
      setValue('sports', active.filter(s => s !== sportName));
    }
  };

  const handleAmenityToggle = (amenityName) => {
    const active = [...watchAmenities];
    const index = active.indexOf(amenityName);
    if (index === -1) {
      setValue('amenities', [...active, amenityName]);
    } else {
      setValue('amenities', active.filter(a => a !== amenityName));
    }
  };

  const handleHourToggle = (day) => {
    setOpeningHours(prev => ({
      ...prev,
      [day]: { ...prev[day], isOpen: !prev[day].isOpen }
    }));
  };

  const handleHourTimeChange = (day, field, value) => {
    setOpeningHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        openingHours,
        adminId: currentUser?.uid || 'user-admin'
      };

      if (isEdit) {
        await venueRepository.updateVenue(venueId, payload);
      } else {
        await venueRepository.createVenue(payload);
      }

      navigate('/dashboard/admin/venues');
    } catch (err) {
      alert(err.message || 'Failed to submit venue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-350 select-none pb-12">
      {/* Top action row */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {isEdit ? 'Configure Venue' : 'Create Venue Listing'}
            </h2>
            <p className="text-xs text-slate-600 mt-1">Configure public discovery cards, details, hours, and sports.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
        
        {/* Basic Information */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            1. Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Venue Name"
              type="text"
              placeholder="e.g. Elite Turf & Arena"
              error={errors.name}
              className="bg-slate-50/20 border-slate-200 focus:border-primary text-slate-900"
              {...register('name')}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Contact Phone"
                type="tel"
                placeholder="10 digit number"
                error={errors.phone}
                className="bg-slate-50/20 border-slate-200 focus:border-primary text-slate-900"
                {...register('phone')}
              />
              <Input
                label="Contact Email"
                type="email"
                placeholder="info@venue.com"
                error={errors.email}
                className="bg-slate-50/20 border-slate-200 focus:border-primary text-slate-900"
                {...register('email')}
              />
            </div>
          </div>
          <Input
            label="Description (Markdown supported)"
            type="text"
            placeholder="Introduce your venue, turf dimensions, floodlights description etc..."
            error={errors.description}
            className="bg-slate-50/20 border-slate-200 focus:border-primary text-slate-900"
            {...register('description')}
          />
        </section>

        {/* Location & Coordinates */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            2. Location Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Street Address"
              type="text"
              placeholder="Plot No, Road, Locality..."
              error={errors.address}
              className="bg-slate-50/20 border-slate-200 focus:border-primary text-slate-900"
              {...register('address')}
            />
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="City"
                type="text"
                placeholder="Mumbai"
                error={errors.city}
                className="bg-slate-50/20 border-slate-200 focus:border-primary text-slate-900"
                {...register('city')}
              />
              <Input
                label="State"
                type="text"
                placeholder="Maharashtra"
                error={errors.state}
                className="bg-slate-50/20 border-slate-200 focus:border-primary text-slate-900"
                {...register('state')}
              />
              <Input
                label="Pincode"
                type="text"
                placeholder="400013"
                error={errors.pincode}
                className="bg-slate-50/20 border-slate-200 focus:border-primary text-slate-900"
                {...register('pincode')}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-slate-200 bg-slate-50/25 rounded-lg">
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div>
                <span className="block text-slate-500 text-[10px]">Latitude</span>
                <span className="text-slate-900">{watch('location.lat') || 0}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[10px]">Longitude</span>
                <span className="text-slate-900">{watch('location.lng') || 0}</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Compass size={14} />}
              onClick={handleCoordinatesGeocode}
              className="border-slate-200 hover:bg-slate-100"
            >
              Get Coordinates
            </Button>
          </div>
        </section>

        {/* Sports & Amenities selection */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            3. Configurations (Sports & Amenities)
          </h3>
          
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-slate-600">Sports Offered</span>
            <div className="flex flex-wrap gap-2">
              {ALL_SPORTS.map((sport) => {
                const selected = watchSports.includes(sport);
                return (
                  <Button
                    key={sport}
                    type="button"
                    variant={selected ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleSportToggle(sport)}
                    className="!rounded-full border-slate-200"
                  >
                    {sport}
                  </Button>
                );
              })}
            </div>
            {errors.sports && <p className="text-xs text-accent-red font-semibold">{errors.sports.message}</p>}
          </div>

          <div className="space-y-2 pt-2">
            <span className="block text-xs font-semibold text-slate-600">Amenities Provided</span>
            <div className="flex flex-wrap gap-2">
              {ALL_AMENITIES.map((amenity) => {
                const selected = watchAmenities.includes(amenity);
                return (
                  <Button
                    key={amenity}
                    type="button"
                    variant={selected ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleAmenityToggle(amenity)}
                    className="!rounded-full border-slate-200"
                  >
                    {amenity}
                  </Button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Opening Hours */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            4. Opening Hours
          </h3>
          <div className="space-y-3.5">
            {DAYS.map((day) => {
              const hrs = openingHours[day];
              return (
                <div key={day} className="flex items-center justify-between gap-4 py-2 border-b border-slate-200 last:border-0">
                  <div className="flex items-center gap-3 w-32 select-none">
                    <input
                      type="checkbox"
                      checked={hrs.isOpen}
                      onChange={() => handleHourToggle(day)}
                      className="rounded border-slate-200 text-primary focus:ring-primary h-4 w-4 bg-slate-50/20"
                    />
                    <span className="text-xs font-bold text-slate-900 capitalize">{day}</span>
                  </div>

                  {hrs.isOpen ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={hrs.open}
                        onChange={(e) => handleHourTimeChange(day, 'open', e.target.value)}
                        className="bg-slate-50/20 border border-slate-200 rounded text-xs font-bold text-slate-900 py-1 px-2.5 focus:outline-none"
                      />
                      <span className="text-xs text-slate-500 font-bold">to</span>
                      <input
                        type="time"
                        value={hrs.close}
                        onChange={(e) => handleHourTimeChange(day, 'close', e.target.value)}
                        className="bg-slate-50/20 border border-slate-200 rounded text-xs font-bold text-slate-900 py-1 px-2.5 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Closed</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Image uploads */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            5. Images & Cover Photo
          </h3>
          
          <div className="space-y-4">
            <div>
              <span className="block text-xs font-semibold text-slate-600 mb-2">Cover Image</span>
              <ImageUpload
                maxFiles={1}
                existingImages={watchCover ? [watchCover] : []}
                onUpload={(urls) => setValue('coverImageUrl', urls[0] || '')}
              />
              {errors.coverImageUrl && <p className="text-xs text-accent-red font-semibold mt-1">{errors.coverImageUrl.message}</p>}
            </div>
            
            <div>
              <span className="block text-xs font-semibold text-slate-600 mb-2">Gallery Photos (Up to 10)</span>
              <ImageUpload
                maxFiles={10}
                existingImages={watchGallery}
                onUpload={(urls) => setValue('galleryImageUrls', urls)}
              />
            </div>
          </div>
        </section>

        {/* Form Actions */}
        <div className="flex justify-end items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard/admin/venues')}
            className="border-slate-200 hover:bg-slate-100"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            leftIcon={<Save size={16} />}
            loading={loading}
          >
            {isEdit ? 'Save Changes' : 'Publish Venue'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VenueFormPage;
