// Mock System Settings Repository
import { dbMock } from './dbMock';

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

export const MockSystemSettingsRepository = {
  getSettings: async () => {
    await new Promise(r => setTimeout(r, 200));
    const table = dbMock.getTable('system_settings');
    const matched = table.find(s => s.id === 'global');
    return matched || null; // Return null if uninitialized, so setup wizard triggers
  },
  
  updateSettings: async (settings) => {
    await new Promise(r => setTimeout(r, 300));
    const table = dbMock.getTable('system_settings');
    const idx = table.findIndex(s => s.id === 'global');
    const oldValue = idx !== -1 ? table[idx] : {};

    const updated = { 
      id: 'global', 
      ...DEFAULT_SYSTEM_SETTINGS, 
      ...settings, 
      isInitialized: true,
      updatedAt: new Date().toISOString() 
    };
    
    if (idx !== -1) {
      table[idx] = { ...table[idx], ...updated };
    } else {
      table.push(updated);
    }
    
    dbMock.saveTable('system_settings', table);

    try {
      const { MockAuditLogRepository } = await import('./MockAuditLogRepository');
      await MockAuditLogRepository.log({
        action: 'Update System Configurations',
        module: 'Administration',
        entityType: 'System Settings',
        entityId: 'global',
        oldValue,
        newValue: updated
      });
    } catch (e) {}

    return updated;
  },

  getDefaults: () => DEFAULT_SYSTEM_SETTINGS
};
