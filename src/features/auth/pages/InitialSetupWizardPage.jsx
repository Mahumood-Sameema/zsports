import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useAuth } from '../hooks/useAuth';
import { systemSettingsRepository, venueRepository } from '../../../repositories';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { 
  Trophy, Building2, Sliders, Calendar, Sparkles, 
  ArrowRight, ArrowLeft, CheckCircle2, Globe, Clock, ShieldCheck
} from 'lucide-react';

const businessSchema = zod.object({
  companyName: zod.string().min(3, 'Company name must be at least 3 characters'),
  supportEmail: zod.string().email('Please enter a valid email address'),
  supportPhone: zod.string().min(8, 'Enter a valid phone number'),
  supportHours: zod.string().min(3, 'Enter support operational hours'),
});

const brandingSchema = zod.object({
  appName: zod.string().min(3, 'Platform name must be at least 3 characters'),
  consoleBranding: zod.string().min(3, 'Console title must be at least 3 characters'),
  logoUrl: zod.string().url('Please enter a valid logo image URL').or(zod.string().length(0)),
});

const venueSchema = zod.object({
  venueName: zod.string().min(3, 'Venue name must be at least 3 characters'),
  venueAddress: zod.string().min(5, 'Address is required'),
  venueCity: zod.string().min(2, 'City is required'),
});

export const InitialSetupWizardPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Selections
  const [currency, setCurrency] = useState('INR');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [language, setLanguage] = useState('English');
  const [themeColor, setThemeColor] = useState('Blue');
  const [selectedSports, setSelectedSports] = useState(['Football Turf', 'Cricket Turf', 'Badminton']);
  const [openTime, setOpenTime] = useState('06:00');
  const [closeTime, setCloseTime] = useState('22:00');

  // React Hook Forms
  const { register: regBusiness, handleSubmit: valBusiness, formState: { errors: errBusiness } } = useForm({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      companyName: 'ZSports Arena Group',
      supportEmail: currentUser?.email || 'support@zsports.com',
      supportPhone: '1800-123-4567',
      supportHours: '09:00 - 18:00',
    }
  });

  const { register: regBranding, handleSubmit: valBranding, formState: { errors: errBranding } } = useForm({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      appName: 'ZSports Booking',
      consoleBranding: 'ZSports Console',
      logoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=150',
    }
  });

  const { register: regVenue, handleSubmit: valVenue, formState: { errors: errVenue } } = useForm({
    resolver: zodResolver(venueSchema),
    defaultValues: {
      venueName: 'Elite Sports Turf & Arena',
      venueAddress: 'Plot 45, Sector 4, Opposite Central Park',
      venueCity: 'Mumbai',
    }
  });

  // State data store
  const [wizardData, setWizardData] = useState({
    business: {},
    branding: {},
    venue: {}
  });

  const handleNext = (data, section) => {
    setWizardData(prev => ({ ...prev, [section]: data }));
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const adminId = currentUser?.uid || 'user-admin';
      
      // 1. Create global system settings object
      const globalSettings = {
        appName: wizardData.branding.appName,
        companyName: wizardData.business.companyName,
        supportEmail: wizardData.business.supportEmail,
        supportPhone: wizardData.business.supportPhone,
        supportHours: wizardData.business.supportHours,
        timezone,
        currency,
        language,
        bookingDefaults: {
          slotDurationMinutes: 60,
          advanceBookingDays: 14,
          cancellationHours: 24,
          bookingHoldMinutes: 10,
          autoConfirm: true,
          bookingBufferMinutes: 10
        },
        payments: {
          currency,
          paymentGateway: 'Razorpay',
          taxPercent: 5,
          convenienceFee: 50
        },
        notifications: {
          enableEmail: true,
          enableSms: false,
          enablePush: true
        },
        authentication: {
          allowSelfRegistration: true,
          enableGoogleLogin: true,
          sessionTimeoutMinutes: 60
        },
        appearance: {
          darkModeDefault: true,
          primaryColor: themeColor,
          consoleBranding: wizardData.branding.consoleBranding,
          logoUrl: wizardData.branding.logoUrl || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=150'
        },
        security: {
          passwordMinLength: 8,
          maxLoginAttempts: 5,
          enable2FA: false
        },
        integrations: {
          googleAnalyticsId: 'G-XXXXXXXXXX',
          razorpayKeyId: 'rzp_test_mock_12345',
          sendGridApiKey: 'SG.xxxxxxxxxxxxxx'
        },
        maintenanceMode: false
      };

      // Save global configuration
      await systemSettingsRepository.updateSettings(globalSettings);

      // 2. Generate standard business hours mapping
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const openingHours = days.reduce((acc, d) => ({
        ...acc,
        [d]: { open: openTime, close: closeTime, isOpen: true }
      }), {});

      // 3. Create the first venue
      const firstVenue = {
        name: wizardData.venue.venueName,
        description: `Premium venue managed by ${wizardData.business.companyName}. Complete facilities for playing ${selectedSports.join(', ')}.`,
        address: wizardData.venue.venueAddress,
        city: wizardData.venue.venueCity,
        pincode: '400001',
        state: 'Maharashtra',
        phone: wizardData.business.supportPhone,
        email: wizardData.business.supportEmail,
        sports: selectedSports,
        amenities: ['Parking', 'Changing Rooms', 'Restrooms', 'WiFi', 'Floodlights'],
        location: { lat: 19.0760, lng: 72.8777 },
        coverImageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200',
        galleryImageUrls: [
          'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&q=80&w=600'
        ],
        openingHours,
        avgRating: 5.0,
        reviewCount: 0,
        totalBookings: 0,
        adminId,
        isActive: true,
        isFeatured: true,
        settings: {
          booking: {
            maxSlotsPerUser: 4,
            allowWalkIns: true,
            slotDurationMinutes: 60,
            advanceBookingDays: 14,
            bookingBufferMinutes: 10
          },
          pricing: {
            taxPercent: 5,
            convenienceFee: 50
          },
          refundPolicy: {
            fullRefundHours: 24,
            partialRefundHours: 12,
            partialRefundPercent: 50
          },
          notifications: {
            enableEmail: true,
            enableSms: false
          }
        }
      };

      await venueRepository.createVenue(firstVenue);

      // Invalidate queries so SetupGuard notices the initialization immediately
      await queryClient.invalidateQueries({ queryKey: ['system-settings-global'] });

      // Redirect to Admin Dashboard
      navigate('/dashboard/admin', { replace: true });
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Setup failed. Please review values and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sportsOptions = [
    'Football Turf', 'Cricket Turf', 'Cricket Nets', 'Badminton', 
    'Tennis', 'Basketball', 'Volleyball', 'Table Tennis', 'Squash', 'Swimming'
  ];

  const handleSportToggle = (sport) => {
    setSelectedSports(prev => 
      prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-slate-700 font-sans">
      {/* Platform Welcome Header */}
      <div className="flex items-center gap-2 mb-8 select-none animate-pulse">
        <div className="h-10 w-10 bg-primary rounded flex items-center justify-center text-white font-extrabold shadow shadow-primary/40">
          <Trophy size={20} className="fill-white" />
        </div>
        <span className="text-xl font-black text-slate-900 uppercase tracking-wider">ZSports Booking</span>
      </div>

      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-8 space-y-6 relative overflow-hidden transition-all duration-300">
        
        {/* Step Indicator Header */}
        <div className="flex justify-between items-center select-none border-b border-slate-200/80 pb-4">
          <div>
            <span className="text-[10px] uppercase font-black text-primary tracking-widest block">Installation Onboarding</span>
            <h2 className="text-lg font-extrabold text-slate-900">
              {step === 1 && "Welcome Administrator"}
              {step === 2 && "Business Configurations"}
              {step === 3 && "Localization Settings"}
              {step === 4 && "Console Branding Options"}
              {step === 5 && "Define First Venue"}
              {step === 6 && "Complete Installation"}
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-500">Step {step} of 6</span>
        </div>

        {/* Step 1: Welcome Panel */}
        {step === 1 && (
          <div className="space-y-4 py-3 select-none text-center">
            <div className="h-20 w-20 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary mx-auto mb-4 animate-bounce" style={{ animationDuration: '3s' }}>
              <Sparkles size={40} />
            </div>
            <p className="text-sm text-slate-350 leading-relaxed font-medium">
              Thank you for choosing ZSports Booking. It looks like the system is running in an uninitialized environment.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              This setup wizard will help you configure platform branding, localization preferences, default tax/conv fees, and register your first sports venue to establish a working booking console.
            </p>
            <div className="pt-4 flex justify-center">
              <Button 
                variant="primary" 
                onClick={() => setStep(2)}
                rightIcon={<ArrowRight size={15} />}
                className="w-full sm:w-auto font-bold uppercase tracking-wider text-xs"
              >
                Begin Setup Wizard
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Business Info Form */}
        {step === 2 && (
          <form onSubmit={valBusiness(d => handleNext(d, 'business'))} className="space-y-4">
            <Input 
              label="Business/Company Name"
              placeholder="e.g. ZSports Arena Group"
              error={errBusiness.companyName}
              {...regBusiness('companyName')}
            />
            <Input 
              label="Operational Support Email"
              type="email"
              placeholder="e.g. support@zsports.com"
              error={errBusiness.supportEmail}
              {...regBusiness('supportEmail')}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                label="Support Phone Line"
                placeholder="e.g. 1800-123-4567"
                error={errBusiness.supportPhone}
                {...regBusiness('supportPhone')}
              />
              <Input 
                label="Support Hours"
                placeholder="e.g. 09:00 - 18:00"
                error={errBusiness.supportHours}
                {...regBusiness('supportHours')}
              />
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-slate-200/60 mt-4">
              <Button type="button" variant="ghost" onClick={handleBack} leftIcon={<ArrowLeft size={14} />}>Back</Button>
              <Button type="submit" variant="primary" rightIcon={<ArrowRight size={14} />}>Next Step</Button>
            </div>
          </form>
        )}

        {/* Step 3: Localization */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-600">Platform Timezone</label>
              <select
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="w-full text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none focus:ring-primary text-slate-700"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC / GMT</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (BST)</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-600">Base Currency</label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none focus:ring-primary text-slate-700"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-600">System Language</label>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="w-full text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none focus:ring-primary text-slate-700"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Hindi">Hindi</option>
                  <option value="French">French</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-200/60 mt-4">
              <Button type="button" variant="ghost" onClick={handleBack} leftIcon={<ArrowLeft size={14} />}>Back</Button>
              <Button type="button" variant="primary" onClick={() => handleNext({}, 'localization')} rightIcon={<ArrowRight size={14} />}>Next Step</Button>
            </div>
          </div>
        )}

        {/* Step 4: Branding */}
        {step === 4 && (
          <form onSubmit={valBranding(d => handleNext(d, 'branding'))} className="space-y-4">
            <Input 
              label="Console Portal App Name"
              placeholder="e.g. ZSports Booking"
              error={errBranding.appName}
              {...regBranding('appName')}
            />
            <Input 
              label="Admin Console Sidebar Branding"
              placeholder="e.g. ZSports Console"
              error={errBranding.consoleBranding}
              {...regBranding('consoleBranding')}
            />
            <Input 
              label="Branding Logo Image URL"
              placeholder="https://example.com/logo.png"
              error={errBranding.logoUrl}
              {...regBranding('logoUrl')}
            />

            <div className="space-y-2 select-none">
              <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-600">Primary Color Theme</label>
              <div className="flex gap-3">
                {['Blue', 'Emerald', 'Indigo', 'Amber', 'Rose'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setThemeColor(c)}
                    className={`text-2xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                      themeColor === c 
                        ? 'bg-primary/20 text-primary border-primary shadow shadow-primary/20' 
                        : 'bg-slate-50 border-slate-200 text-slate-450 hover:text-slate-900'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-200/60 mt-4">
              <Button type="button" variant="ghost" onClick={handleBack} leftIcon={<ArrowLeft size={14} />}>Back</Button>
              <Button type="submit" variant="primary" rightIcon={<ArrowRight size={14} />}>Next Step</Button>
            </div>
          </form>
        )}

        {/* Step 5: Create First Venue */}
        {step === 5 && (
          <form onSubmit={valVenue(d => handleNext(d, 'venue'))} className="space-y-4">
            <Input 
              label="First Venue/Facility Name"
              placeholder="e.g. Elite Sports Turf & Arena"
              error={errVenue.venueName}
              {...regVenue('venueName')}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Input 
                  label="Street Address"
                  placeholder="e.g. Plot 45, Sector 4"
                  error={errVenue.venueAddress}
                  {...regVenue('venueAddress')}
                />
              </div>
              <Input 
                label="City Location"
                placeholder="e.g. Mumbai"
                error={errVenue.venueCity}
                {...regVenue('venueCity')}
              />
            </div>

            {/* Sports Offered */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-600 block select-none">Supported Sports</label>
              <div className="flex flex-wrap gap-1.5">
                {sportsOptions.map(sport => {
                  const isSel = selectedSports.includes(sport);
                  return (
                    <button
                      key={sport}
                      type="button"
                      onClick={() => handleSportToggle(sport)}
                      className={`text-[10px] font-bold px-2 py-1 rounded transition-all ${
                        isSel 
                          ? 'bg-primary text-white' 
                          : 'bg-slate-50 border border-slate-200 text-slate-450 hover:bg-slate-100'
                      }`}
                    >
                      {sport}
                    </button>
                  );
                })}
              </div>
              {selectedSports.length === 0 && (
                <p className="text-[10px] text-accent-red font-semibold select-none">Please select at least one sport.</p>
              )}
            </div>

            {/* Timing */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-600">Opening Hour</label>
                <input
                  type="time"
                  value={openTime}
                  onChange={e => setOpenTime(e.target.value)}
                  className="w-full text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none focus:ring-primary text-slate-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-600">Closing Hour</label>
                <input
                  type="time"
                  value={closeTime}
                  onChange={e => setCloseTime(e.target.value)}
                  className="w-full text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none focus:ring-primary text-slate-700"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-200/60 mt-4">
              <Button type="button" variant="ghost" onClick={handleBack} leftIcon={<ArrowLeft size={14} />}>Back</Button>
              <Button 
                type="submit" 
                variant="primary" 
                disabled={selectedSports.length === 0} 
                rightIcon={<ArrowRight size={14} />}
              >
                Next Step
              </Button>
            </div>
          </form>
        )}

        {/* Step 6: Review & Finish */}
        {step === 6 && (
          <div className="space-y-5">
            <p className="text-xs text-slate-600 leading-relaxed select-none">
              Please review the settings configuration summary. Clicking "Complete Setup" will write settings defaults to Firestore and spin up your first venue.
            </p>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-3 font-semibold text-slate-600">
              <div className="flex justify-between">
                <span>Company Name:</span>
                <span className="text-slate-900">{wizardData.business.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span>Branding Title:</span>
                <span className="text-slate-900">{wizardData.branding.appName} ({themeColor} Theme)</span>
              </div>
              <div className="flex justify-between">
                <span>Localization:</span>
                <span className="text-slate-900">{currency} | {timezone}</span>
              </div>
              <div className="flex justify-between">
                <span>First Venue:</span>
                <span className="text-slate-900">{wizardData.venue.venueName}</span>
              </div>
              <div className="flex justify-between">
                <span>Working Hours:</span>
                <span className="text-slate-900">{openTime} to {closeTime}</span>
              </div>
              <div className="flex justify-between">
                <span>Sports Count:</span>
                <span className="text-slate-900">{selectedSports.length} active sports</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-2xs font-semibold text-accent-red rounded">
                {errorMsg}
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-slate-200/60">
              <Button type="button" variant="ghost" disabled={isSubmitting} onClick={handleBack} leftIcon={<ArrowLeft size={14} />}>Back</Button>
              <Button 
                type="button" 
                variant="primary" 
                loading={isSubmitting}
                onClick={handleFinish}
                leftIcon={<CheckCircle2 size={15} />}
              >
                Complete Setup
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default InitialSetupWizardPage;
