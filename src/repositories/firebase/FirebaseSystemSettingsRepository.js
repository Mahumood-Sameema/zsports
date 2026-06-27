// Firebase System Settings Repository
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const DEFAULT_SYSTEM_SETTINGS = {
  // General
  appName: 'ZSports Booking',
  companyName: 'ZSports Arena Group',
  supportEmail: 'support@zsports.com',
  supportPhone: '1800-123-4567',
  supportHours: '09:00 - 18:00',
  timezone: 'Asia/Kolkata',
  language: 'English',
  
  // Booking
  bookingDefaults: {
    slotDurationMinutes: 60,
    advanceBookingDays: 14,
    cancellationHours: 24,
    bookingHoldMinutes: 10,
    autoConfirm: true,
    bookingBufferMinutes: 10
  },
  
  // Payments
  currency: 'INR',
  paymentGateway: 'Razorpay',
  taxPercent: 5,
  convenienceFee: 50,
  
  // Notifications
  notifications: {
    enableEmail: true,
    enableSms: false,
    enablePush: true
  },
  
  // Authentication
  authentication: {
    allowSelfRegistration: true,
    enableGoogleLogin: true,
    sessionTimeoutMinutes: 60
  },
  
  // Appearance
  appearance: {
    darkModeDefault: true,
    primaryColor: 'Blue',
    consoleBranding: 'ZSports Console',
    logoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=150'
  },
  
  // Security
  security: {
    passwordMinLength: 8,
    maxLoginAttempts: 5,
    enable2FA: false
  },
  
  // Integrations
  integrations: {
    googleAnalyticsId: 'G-XXXXXXXXXX',
    razorpayKeyId: 'rzp_test_mock_12345',
    sendGridApiKey: 'SG.xxxxxxxxxxxxxx'
  },
  
  // Maintenance
  maintenanceMode: false
};

export const FirebaseSystemSettingsRepository = {
  getSettings: async () => {
    try {
      const docRef = doc(db, 'system_settings', 'global');
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        return null; // Return null if uninitialized, to trigger onboarding Setup Wizard
      }
      return snap.data();
    } catch (err) {
      console.error('Failed to fetch global system settings:', err);
      throw err;
    }
  },
  
  updateSettings: async (settings) => {
    try {
      const docRef = doc(db, 'system_settings', 'global');
      let oldValue = {};
      try {
        const snap = await getDoc(docRef);
        if (snap.exists()) oldValue = snap.data();
      } catch (e) {}

      const updated = { 
        ...DEFAULT_SYSTEM_SETTINGS, 
        ...settings, 
        isInitialized: true,
        updatedAt: new Date().toISOString() 
      };
      await setDoc(docRef, updated, { merge: true });

      try {
        const { FirebaseAuditLogRepository } = await import('./FirebaseAuditLogRepository');
        await FirebaseAuditLogRepository.log({
          action: 'Update System Configurations',
          module: 'Administration',
          entityType: 'System Settings',
          entityId: 'global',
          oldValue,
          newValue: updated
        });
      } catch (e) {}

      return updated;
    } catch (err) {
      console.error('Failed to update global system settings:', err);
      throw err;
    }
  },

  getDefaults: () => DEFAULT_SYSTEM_SETTINGS
};
