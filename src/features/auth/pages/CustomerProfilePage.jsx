// CustomerProfilePage Component
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useAuth } from '../hooks/useAuth';
import { User, Phone, Mail, CheckCircle, Bell, Shield, Image } from 'lucide-react';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Avatar from '../../../components/common/Avatar';

const profileSchema = zod.object({
  displayName: zod.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  phone: zod.string().refine(val => !val || /^\d{10}$/.test(val), 'Phone number must be exactly 10 digits').optional(),
  avatarSeed: zod.string().min(1, 'Please enter a name seed').max(20),
  emailNotifications: zod.boolean(),
  inAppNotifications: zod.boolean(),
  smsNotifications: zod.boolean(),
});

export const CustomerProfilePage = () => {
  const { currentUser, userProfile, updateProfile } = useAuth();
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const currentPrefs = userProfile?.notificationPreferences || { email: true, inApp: true, sms: false };

  // Parse seed from avatar url or use default name seed
  const defaultSeed = userProfile?.avatarUrl 
    ? decodeURIComponent(userProfile.avatarUrl.split('seed=')[1] || userProfile.displayName)
    : userProfile?.displayName || 'Player';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: userProfile?.displayName || '',
      phone: userProfile?.phone || '',
      avatarSeed: defaultSeed,
      emailNotifications: currentPrefs.email,
      inAppNotifications: currentPrefs.inApp,
      smsNotifications: currentPrefs.sms,
    }
  });

  const avatarSeed = watch('avatarSeed');
  const tempAvatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(avatarSeed || 'Player')}`;

  const onSubmit = async (data) => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await updateProfile({
        displayName: data.displayName,
        phone: data.phone,
        avatarUrl: tempAvatarUrl,
        notificationPreferences: {
          email: data.emailNotifications,
          inApp: data.inAppNotifications,
          sms: data.smsNotifications,
        }
      });
      setSuccessMsg('Your profile configurations have been saved successfully.');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile settings.');
    }
  };

  const handlePresetAvatar = (seed) => {
    setValue('avatarSeed', seed);
  };

  const presetSeeds = ['Striker', 'Champ', 'Captain', 'Defender', 'Runner', 'Gamer'];

  return (
    <div className="space-y-6 select-none max-w-4xl mx-auto text-neutral-600 font-normal pb-12">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-5">
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
          <User className="text-primary h-6 w-6 shrink-0" />
          <span>Profile Settings</span>
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          Customize your player avatar, contact numbers, and in-app or email notifications preferences.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-250 text-xs font-semibold text-emerald-600 rounded flex items-center gap-2">
          <CheckCircle size={16} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-xs font-semibold text-accent-red rounded">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left avatar card column */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 flex flex-col items-center text-center space-y-5 h-fit shadow-2xs">
          <h3 className="text-xs font-bold text-neutral-850 uppercase tracking-wider self-start flex items-center gap-1.5 border-b border-neutral-100 pb-2 w-full">
            <Image size={15} className="text-primary" /> Profile Avatar
          </h3>

          <div className="relative group">
            <Avatar 
              src={tempAvatarUrl} 
              name={watch('displayName') || 'Player'} 
              size="xl" 
              className="h-28 w-28 ring-4 ring-primary-light shadow-md"
            />
          </div>

          <div className="w-full">
            <Input
              label="Avatar Name Seed"
              type="text"
              placeholder="Type avatar seed name..."
              error={errors.avatarSeed}
              {...register('avatarSeed')}
            />
            <p className="text-3xs text-neutral-400 mt-1">We render unique characters based on your seed.</p>
          </div>

          <div className="w-full space-y-2">
            <span className="block text-[10px] font-bold text-neutral-450 uppercase tracking-wider text-left">Quick presets</span>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {presetSeeds.map((seed) => (
                <button
                  key={seed}
                  type="button"
                  onClick={() => handlePresetAvatar(seed)}
                  className={`px-2.5 py-1 rounded text-3xs font-semibold uppercase tracking-wider border transition-all ${
                    avatarSeed === seed
                      ? 'bg-primary border-primary text-white font-bold'
                      : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                  }`}
                >
                  {seed}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center/Right form fields column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Credentials */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-neutral-850 uppercase tracking-wider flex items-center gap-1.5 border-b border-neutral-100 pb-2">
              <User size={15} className="text-primary" /> Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="e.g. Sameer Shah"
                error={errors.displayName}
                {...register('displayName')}
              />

              <Input
                label="Phone Number"
                type="tel"
                placeholder="e.g. 9876543210"
                error={errors.phone}
                {...register('phone')}
              />
            </div>

            <div className="w-full">
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                Registered Email Address (Locked)
              </label>
              <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 px-3 py-2 rounded text-sm text-neutral-500 font-semibold cursor-not-allowed">
                <Mail size={14} className="shrink-0" />
                <span>{userProfile?.email}</span>
              </div>
              <p className="text-3xs text-neutral-400 mt-1">Your login email cannot be changed directly.</p>
            </div>
          </div>

          {/* Section: Notification Preferences */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-neutral-850 uppercase tracking-wider flex items-center gap-1.5 border-b border-neutral-100 pb-2">
              <Bell size={15} className="text-primary" /> Notification Center
            </h3>

            <div className="space-y-3.5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-neutral-300 text-primary focus:ring-primary h-4.5 w-4.5 mt-0.5"
                  {...register('inAppNotifications')}
                />
                <div className="text-xs">
                  <span className="block font-bold text-neutral-800 leading-tight">In-App Notifications</span>
                  <span className="block text-neutral-450 mt-0.5">Receive confirmations, check-in scans alerts, and review updates inside your portal dashboard.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-neutral-300 text-primary focus:ring-primary h-4.5 w-4.5 mt-0.5"
                  {...register('emailNotifications')}
                />
                <div className="text-xs">
                  <span className="block font-bold text-neutral-800 leading-tight">Email Receipts & Invoices</span>
                  <span className="block text-neutral-450 mt-0.5">Send a booking PDF invoice and payment statements to your registered email inbox.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-neutral-300 text-primary focus:ring-primary h-4.5 w-4.5 mt-0.5"
                  {...register('smsNotifications')}
                />
                <div className="text-xs">
                  <span className="block font-bold text-neutral-800 leading-tight">SMS Alerts</span>
                  <span className="block text-neutral-450 mt-0.5">Receive short SMS reminders 1 hour before scheduled match timings.</span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
            >
              Save Configuration
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CustomerProfilePage;
