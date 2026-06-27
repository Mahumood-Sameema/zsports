// CourtFormPage Component
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { courtRepository, venueRepository } from '../../../repositories';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import ImageUpload from '../../../components/common/ImageUpload';
import BackButton from '../../../components/common/BackButton';
import { Save } from 'lucide-react';

const ALL_SPORTS = [
  'Football Turf', 'Cricket Turf', 'Cricket Nets', 'Badminton', 
  'Tennis', 'Basketball', 'Volleyball', 'Table Tennis', 'Squash', 'Swimming'
];

const courtFormSchema = zod.object({
  venueId: zod.string().min(1, 'Please select a venue'),
  name: zod.string().min(2, 'Name must be at least 2 characters').max(80, 'Name must be under 80 characters'),
  sport: zod.string().min(1, 'Please select a sport'),
  surfaceType: zod.string().min(1, 'Surface type is required'),
  capacity: zod.coerce.number().min(1, 'Capacity must be at least 1 player').max(100, 'Capacity cannot exceed 100 players'),
  description: zod.string().optional(),
  baseHourlyRate: zod.coerce.number().positive('Rate must be greater than zero'),
  peakHourlyRate: zod.coerce.number().min(0),
  weekendRate: zod.coerce.number().min(0),
  slotDurationMinutes: zod.coerce.number().refine(val => [30, 60, 90, 120].includes(val), 'Slot duration must be 30, 60, 90, or 120 minutes'),
  peakHours: zod.object({
    start: zod.string().min(1, 'Peak hour start time is required'),
    end: zod.string().min(1, 'Peak hour end time is required')
  }),
  imageUrls: zod.array(zod.string()).optional()
});

export const CourtFormPage = () => {
  const { courtId } = useParams();
  const isEdit = !!courtId;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryVenueId = searchParams.get('venueId');

  const [loading, setLoading] = useState(false);
  const [venues, setVenues] = useState([]);
  const [isVenueLocked, setIsVenueLocked] = useState(!!queryVenueId || isEdit);
  const [parentVenue, setParentVenue] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(courtFormSchema),
    defaultValues: {
      venueId: queryVenueId || '',
      name: '',
      sport: '',
      surfaceType: 'AstroTurf',
      capacity: 10,
      description: '',
      baseHourlyRate: 1000,
      peakHourlyRate: 1500,
      weekendRate: 1200,
      slotDurationMinutes: 60,
      peakHours: { start: '17:00', end: '22:00' },
      imageUrls: []
    }
  });

  const watchImages = watch('imageUrls') || [];
  const watchedVenueId = watch('venueId');

  // Load venues to populate dropdown
  useEffect(() => {
    const loadVenues = async () => {
      try {
        const list = await venueRepository.getVenues();
        setVenues(list);
      } catch (err) {
        console.error('Failed to load venues:', err);
      }
    };
    loadVenues();
  }, []);

  // Load court details for editing
  useEffect(() => {
    const loadCourtDetails = async () => {
      if (!isEdit) return;
      setLoading(true);
      try {
        const court = await courtRepository.getCourtById(courtId);
        if (court) {
          reset(court);
        }
      } catch (err) {
        console.error('Failed to load court details:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCourtDetails();
  }, [courtId, isEdit, reset]);

  // Load parent venue info
  useEffect(() => {
    const loadParentVenue = async () => {
      if (!watchedVenueId) {
        setParentVenue(null);
        return;
      }
      try {
        const v = await venueRepository.getVenueById(watchedVenueId);
        setParentVenue(v);
      } catch (err) {
        console.error('Failed to load parent venue:', err);
      }
    };
    loadParentVenue();
  }, [watchedVenueId]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        venueId: watchedVenueId
      };

      if (isEdit) {
        await courtRepository.updateCourt(courtId, payload);
      } else {
        await courtRepository.createCourt(payload);
      }

      navigate('/dashboard/admin/courts');
    } catch (err) {
      alert(err.message || 'Failed to submit court.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-350 select-none pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {isEdit ? 'Configure Court' : 'List New Court'}
            </h2>
            <p className="text-xs text-slate-600 mt-1">Configure pricing multipliers, game configurations, and capacity limits.</p>
            {parentVenue && (
              <p className="text-xs font-semibold text-slate-650 mt-1">
                Venue: <span className="font-bold text-primary">{parentVenue.name}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
        
        {/* Basic Details */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            1. Court Details
          </h3>

          <div className="flex flex-col">
            <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1.5">
              Associated Venue
            </label>
            <div className="flex gap-2">
              <select
                {...register('venueId')}
                disabled={isVenueLocked}
                className="block w-full text-xs font-bold rounded border border-slate-200 bg-white py-2.5 px-3 focus:outline-none focus:ring-primary text-slate-350 disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">-- Choose Venue --</option>
                {venues.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
              {isVenueLocked && (
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => setIsVenueLocked(false)}
                  className="shrink-0"
                >
                  Unlock
                </Button>
              )}
            </div>
            {errors.venueId && <p className="text-[10px] text-accent-red font-semibold mt-1">{errors.venueId.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Court Name"
              type="text"
              placeholder="e.g. Wembley Turf A (5v5)"
              error={errors.name}
              className="bg-slate-50/20 border-slate-200 focus:border-primary text-slate-900"
              {...register('name')}
            />
            
            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1.5">
                Sport Type
              </label>
              <select
                {...register('sport')}
                className="block w-full text-xs font-bold rounded border border-slate-200 bg-white py-2.5 px-3 focus:outline-none focus:ring-primary text-slate-350"
              >
                <option value="">-- Choose Sport --</option>
                {ALL_SPORTS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.sport && <p className="text-[10px] text-accent-red font-semibold mt-1">{errors.sport.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Surface Type"
              type="text"
              placeholder="e.g. AstroTurf, Yonex Mat, Clay"
              error={errors.surfaceType}
              className="bg-slate-50/20 border-slate-200 focus:border-primary text-slate-900"
              {...register('surfaceType')}
            />
            <Input
              label="Max Capacity (Players)"
              type="number"
              error={errors.capacity}
              className="bg-slate-50/20 border-slate-200 focus:border-primary text-slate-900"
              {...register('capacity')}
            />
            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1.5">
                Slot Duration (Minutes)
              </label>
              <select
                {...register('slotDurationMinutes')}
                className="block w-full text-xs font-bold rounded border border-slate-200 bg-white py-2.5 px-3 focus:outline-none focus:ring-primary text-slate-350"
              >
                <option value="30">30 min</option>
                <option value="60">60 min (Recommended)</option>
                <option value="90">90 min</option>
                <option value="120">120 min</option>
              </select>
              {errors.slotDurationMinutes && <p className="text-[10px] text-accent-red font-semibold mt-1">{errors.slotDurationMinutes.message}</p>}
            </div>
          </div>

          <Input
            label="Court Description"
            type="text"
            placeholder="Introduce surface parameters, size, netting features..."
            error={errors.description}
            className="bg-slate-50/20 border-slate-200 focus:border-primary text-slate-900"
            {...register('description')}
          />
        </section>

        {/* Pricing Policies */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            2. Slot Pricing Policies
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Base Hourly Rate (₹)"
              type="number"
              error={errors.baseHourlyRate}
              className="bg-slate-50/20 border-slate-200 focus:border-primary text-slate-900"
              {...register('baseHourlyRate')}
            />
            <Input
              label="Peak Hours Rate (₹)"
              type="number"
              error={errors.peakHourlyRate}
              className="bg-slate-50/20 border-slate-200 focus:border-primary text-slate-900"
              {...register('peakHourlyRate')}
            />
            <Input
              label="Weekend Hourly Rate (₹)"
              type="number"
              error={errors.weekendRate}
              className="bg-slate-50/20 border-slate-200 focus:border-primary text-slate-900"
              {...register('weekendRate')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <Input
              label="Peak Hours Start (HH:MM)"
              type="text"
              placeholder="e.g. 17:00"
              error={errors.peakHours?.start}
              className="bg-slate-50/20 border-slate-200 focus:border-primary text-slate-900"
              {...register('peakHours.start')}
            />
            <Input
              label="Peak Hours End (HH:MM)"
              type="text"
              placeholder="e.g. 22:00"
              error={errors.peakHours?.end}
              className="bg-slate-50/20 border-slate-200 focus:border-primary text-slate-900"
              {...register('peakHours.end')}
            />
          </div>
        </section>

        {/* Upload photos */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            3. Court Images (Up to 5)
          </h3>
          <ImageUpload
            maxFiles={5}
            existingImages={watchImages}
            onUpload={(urls) => setValue('imageUrls', urls)}
          />
        </section>

        {/* Form buttons */}
        <div className="flex justify-end items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard/admin/courts')}
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
            {isEdit ? 'Save Changes' : 'Publish Court'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CourtFormPage;
