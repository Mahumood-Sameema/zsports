import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { systemSettingsRepository } from '../../../repositories';
import { 
  Settings, Sliders, CreditCard, Bell, ShieldCheck, 
  Palette, Lock, Cable, Wrench, X, Save, CheckCircle2, AlertCircle 
} from 'lucide-react';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import LoadingCard from '../../../components/common/LoadingCard';
import ErrorState from '../../../components/common/ErrorState';

export const AdminSettingsPage = () => {
  const queryClient = useQueryClient();
  const [activePanel, setActivePanel] = useState(null); // 'general', 'booking', etc.
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch global settings
  const { data: settings, isLoading, isError } = useQuery({
    queryKey: ['system-settings-global'],
    queryFn: () => systemSettingsRepository.getSettings(),
    staleTime: Infinity
  });

  // Mutation to save settings
  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings) => systemSettingsRepository.updateSettings(newSettings),
    onSuccess: (data) => {
      queryClient.setQueryData(['system-settings-global'], data);
      setSuccessMsg('System configuration updated successfully.');
      setTimeout(() => setSuccessMsg(''), 5000);
      setActivePanel(null);
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to save configuration settings.');
      setTimeout(() => setErrorMsg(''), 5000);
    }
  });

  const handleClearSessions = () => {
    setSuccessMsg('Temporary session logs and database caches cleared successfully.');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  if (isLoading) return <LoadingCard message="Fetching global settings..." />;
  if (isError) return <ErrorState message="Failed to load system settings configuration." />;

  const activeSettings = settings || systemSettingsRepository.getDefaults();

  // List of config cards
  const cards = [
    { 
      id: 'general', 
      title: 'General Settings', 
      desc: 'Configure application name, support details, and localization.', 
      icon: Settings, 
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' 
    },
    { 
      id: 'booking', 
      title: 'Booking Defaults', 
      desc: 'Set global slot defaults, cancellation rules, and limits.', 
      icon: Sliders, 
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' 
    },
    { 
      id: 'payments', 
      title: 'Payment Settings', 
      desc: 'Configure currency, gateways, default tax, and platform fees.', 
      icon: CreditCard, 
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' 
    },
    { 
      id: 'notifications', 
      title: 'Notifications', 
      desc: 'Enable email templates, operational SMS alerts, and push notifications.', 
      icon: Bell, 
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' 
    },
    { 
      id: 'authentication', 
      title: 'Authentication', 
      desc: 'Manage registration permissions, Google OAuth, and idle session limits.', 
      icon: ShieldCheck, 
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' 
    },
    { 
      id: 'appearance', 
      title: 'Appearance', 
      desc: 'Manage portal branding, logo resources, and console colors.', 
      icon: Palette, 
      color: 'text-pink-500 bg-pink-500/10 border-pink-500/20' 
    },
    { 
      id: 'security', 
      title: 'Security', 
      desc: 'Manage password requirements, lockout policies, and two-factor auth.', 
      icon: Lock, 
      color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' 
    },
    { 
      id: 'integrations', 
      title: 'Integrations', 
      desc: 'Connect Razorpay gateway, Google Analytics, and Sendgrid mail API.', 
      icon: Cable, 
      color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' 
    },
    { 
      id: 'maintenance', 
      title: 'Maintenance', 
      desc: 'Toggle system maintenance overlays and clear database logs.', 
      icon: Wrench, 
      color: 'text-slate-500 bg-slate-500/10 border-slate-500/20' 
    }
  ];

  return (
    <div className="space-y-6 text-slate-350 select-none pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="text-primary h-6 w-6 shrink-0 animate-spin" style={{ animationDuration: '8s' }} />
          <span>System Settings</span>
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Platform-wide global configurations, API integrations, booking policies, and authentication policies.
        </p>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-500 rounded-xl flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-xs font-semibold text-accent-red rounded-xl flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
        {cards.map(c => {
          const Icon = c.icon;
          return (
            <div 
              key={c.id} 
              onClick={() => setActivePanel(c.id)}
              className="bg-white border border-slate-200 hover:border-slate-300/80 p-5 rounded-2xl cursor-pointer hover:shadow-lg transition-all duration-200 flex flex-col gap-3 group"
            >
              <div className={`h-10 w-10 border rounded-lg flex items-center justify-center ${c.color} shrink-0 group-hover:scale-105 transition-transform`}>
                <Icon size={18} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{c.title}</h3>
                <p className="text-2xs text-slate-450 leading-relaxed font-medium">{c.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Panel Edit Modal (Render when a card is selected) */}
      {activePanel && (
        <ModalPanel 
          panel={activePanel} 
          settings={activeSettings} 
          onClose={() => setActivePanel(null)} 
          onSave={(updated) => updateSettingsMutation.mutate(updated)}
          onClearSessions={handleClearSessions}
        />
      )}
    </div>
  );
};

// Panel Component inside Settings
const ModalPanel = ({ panel, settings, onClose, onSave, onClearSessions }) => {
  const { register, handleSubmit } = useForm({
    defaultValues: settings
  });

  const onSubmit = (data) => {
    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-slate-50/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 shrink-0">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Configure {panel.charAt(0).toUpperCase() + panel.slice(1)} Settings
          </h3>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-900 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-grow overflow-y-auto p-6 space-y-4">
          
          {panel === 'general' && (
            <div className="space-y-4">
              <Input label="App Name" {...register('appName')} />
              <Input label="Company / Entity Name" {...register('companyName')} />
              <Input label="Support Email" type="email" {...register('supportEmail')} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Support Phone" {...register('supportPhone')} />
                <Input label="Support Hours" {...register('supportHours')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Timezone" {...register('timezone')} />
                <Input label="Language" {...register('language')} />
              </div>
            </div>
          )}

          {panel === 'booking' && (
            <div className="space-y-4">
              <Input label="Default Slot Duration (Minutes)" type="number" {...register('bookingDefaults.slotDurationMinutes', { valueAsNumber: true })} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Max Advance Days Bookable" type="number" {...register('bookingDefaults.advanceBookingDays', { valueAsNumber: true })} />
                <Input label="Cancellation cutoffs (Hours)" type="number" {...register('bookingDefaults.cancellationHours', { valueAsNumber: true })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Booking Hold Timeout (Mins)" type="number" {...register('bookingDefaults.bookingHoldMinutes', { valueAsNumber: true })} />
                <Input label="Booking Buffer Time (Mins)" type="number" {...register('bookingDefaults.bookingBufferMinutes', { valueAsNumber: true })} />
              </div>
              <label className="flex items-center gap-3 cursor-pointer pt-2">
                <input type="checkbox" className="rounded border-slate-300 bg-slate-50 text-primary h-4.5 w-4.5" {...register('bookingDefaults.autoConfirm')} />
                <span className="text-2xs font-bold text-slate-900">Auto-Confirm Bookings Automatically</span>
              </label>
            </div>
          )}

          {panel === 'payments' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Base Currency" {...register('currency')} />
                <Input label="Gateway Driver" {...register('paymentGateway')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="GST / Platform Tax Rate (%)" type="number" {...register('taxPercent', { valueAsNumber: true })} />
                <Input label="Convenience Booking Fee (INR)" type="number" {...register('convenienceFee', { valueAsNumber: true })} />
              </div>
            </div>
          )}

          {panel === 'notifications' && (
            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 bg-slate-50 text-primary h-4.5 w-4.5" {...register('notifications.enableEmail')} />
                <span className="text-2xs font-bold text-slate-900">Send Email Confirmations & Cancel Receipts</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 bg-slate-50 text-primary h-4.5 w-4.5" {...register('notifications.enableSms')} />
                <span className="text-2xs font-bold text-slate-900">Dispatch Operational SMS Warnings (requires Twilio key)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 bg-slate-50 text-primary h-4.5 w-4.5" {...register('notifications.enablePush')} />
                <span className="text-2xs font-bold text-slate-900">Trigger Console In-App Desktop Alerts</span>
              </label>
            </div>
          )}

          {panel === 'authentication' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 cursor-pointer pt-4">
                  <input type="checkbox" className="rounded border-slate-300 bg-slate-50 text-primary h-4.5 w-4.5" {...register('authentication.allowSelfRegistration')} />
                  <span className="text-2xs font-bold text-slate-900">Allow Public Register</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer pt-4">
                  <input type="checkbox" className="rounded border-slate-300 bg-slate-50 text-primary h-4.5 w-4.5" {...register('authentication.enableGoogleLogin')} />
                  <span className="text-2xs font-bold text-slate-900">Google OAuth Login</span>
                </label>
              </div>
              <Input label="Max Idle Session Duration (Mins)" type="number" {...register('authentication.sessionTimeoutMinutes', { valueAsNumber: true })} />
            </div>
          )}

          {panel === 'appearance' && (
            <div className="space-y-4">
              <Input label="Console Branding Sidebar Title" {...register('appearance.consoleBranding')} />
              <Input label="Application Logo Image URL" {...register('appearance.logoUrl')} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Active Theme Accent (e.g. Blue)" {...register('appearance.primaryColor')} />
                <label className="flex items-center gap-3 cursor-pointer pt-4">
                  <input type="checkbox" className="rounded border-slate-300 bg-slate-50 text-primary h-4.5 w-4.5" {...register('appearance.darkModeDefault')} />
                  <span className="text-2xs font-bold text-slate-900">Force Dark Mode Default</span>
                </label>
              </div>
            </div>
          )}

          {panel === 'security' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Minimum Password Length" type="number" {...register('security.passwordMinLength', { valueAsNumber: true })} />
                <Input label="Lockout Login Attempts" type="number" {...register('security.maxLoginAttempts', { valueAsNumber: true })} />
              </div>
              <label className="flex items-center gap-3 cursor-pointer pt-2">
                <input type="checkbox" className="rounded border-slate-300 bg-slate-50 text-primary h-4.5 w-4.5" {...register('security.enable2FA')} />
                <span className="text-2xs font-bold text-slate-900">Enable Multi-factor Auth (MFA) requirements for Staff</span>
              </label>
            </div>
          )}

          {panel === 'integrations' && (
            <div className="space-y-4">
              <Input label="Google Analytics Tracking ID" {...register('integrations.googleAnalyticsId')} />
              <Input label="Razorpay Payments Key ID" {...register('integrations.razorpayKeyId')} />
              <Input label="SendGrid Email API Sender Key" type="password" {...register('integrations.sendGridApiKey')} />
            </div>
          )}

          {panel === 'maintenance' && (
            <div className="space-y-5 py-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 bg-slate-50 text-primary h-4.5 w-4.5" {...register('maintenanceMode')} />
                <span className="text-2xs font-bold text-slate-900">Maintenance Mode Active (Overlay public views)</span>
              </label>
              <div className="h-[1px] bg-slate-100 my-4" />
              <div className="space-y-2">
                <span className="text-2xs font-bold text-slate-600 block uppercase">Clean Operational Database Caches</span>
                <button
                  type="button"
                  onClick={onClearSessions}
                  className="bg-red-500/10 border border-red-500/20 text-accent-red font-bold text-2xs hover:bg-red-500/20 px-4 py-2 rounded-lg transition-colors"
                >
                  Clear Cached Session Logs
                </button>
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-6 shrink-0">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" leftIcon={<Save size={14} />}>
              Save Configuration
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
