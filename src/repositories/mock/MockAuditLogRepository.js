// Mock Audit Log Repository
import { dbMock } from './dbMock';

export const MockAuditLogRepository = {
  getLogs: async () => {
    await new Promise(r => setTimeout(r, 200));
    let list = dbMock.getTable('audit_logs');
    if (list.length === 0) {
      const seedLogs = [
        {
          id: 'log-seed1',
          action: 'Update System Settings',
          module: 'System Settings',
          entityType: 'GlobalSettings',
          entityId: 'global',
          oldValue: JSON.stringify({ appName: 'ZSports', currency: 'USD', companyName: 'Z3connect' }),
          newValue: JSON.stringify({ appName: 'ZSports Pro', currency: 'USD', companyName: 'ZSports Network Inc.' }),
          performedBy: 'admin@zsports.com',
          role: 'admin',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          success: true,
          device: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          ipAddress: '192.168.1.50'
        },
        {
          id: 'log-seed2',
          action: 'Create Venue - Elite Arena',
          module: 'Venue Management',
          entityType: 'Venue',
          entityId: 'venue-elite-arena',
          oldValue: 'N/A',
          newValue: JSON.stringify({ name: 'Elite Arena', address: '123 Turf Lane', sports: ['Football', 'Cricket'], isActive: true }),
          performedBy: 'admin@zsports.com',
          role: 'admin',
          timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
          success: true,
          device: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36',
          ipAddress: '172.16.254.1'
        },
        {
          id: 'log-seed3',
          action: 'Check-In Customer',
          module: 'Booking Operations',
          entityType: 'Booking',
          entityId: 'booking-89021',
          oldValue: JSON.stringify({ status: 'confirmed', checkedIn: false }),
          newValue: JSON.stringify({ status: 'completed', checkedIn: true }),
          performedBy: 'staff@zsports.com',
          role: 'staff',
          timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
          success: true,
          device: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
          ipAddress: '192.168.2.115'
        },
        {
          id: 'log-seed4',
          action: 'Assign User Role',
          module: 'Administration',
          entityType: 'User',
          entityId: 'user-staff1',
          oldValue: JSON.stringify({ email: 'staff@zsports.com', role: 'customer' }),
          newValue: JSON.stringify({ email: 'staff@zsports.com', role: 'staff' }),
          performedBy: 'admin@zsports.com',
          role: 'admin',
          timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
          success: true,
          device: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
          ipAddress: '192.168.1.50'
        }
      ];
      dbMock.saveTable('audit_logs', seedLogs);
      list = seedLogs;
    }
    return [...list].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },

  log: async ({ action, module, entityType = 'N/A', entityId = 'N/A', oldValue = 'N/A', newValue = 'N/A', success = true }) => {
    await new Promise(r => setTimeout(r, 100));
    const table = dbMock.getTable('audit_logs');
    
    // Automatically retrieve current user details from mock session
    let performedBy = 'System';
    let role = 'System';
    try {
      const sessionUserRaw = sessionStorage.getItem('zsports_session_user');
      if (sessionUserRaw) {
        const user = JSON.parse(sessionUserRaw);
        performedBy = user.email || user.displayName || user.uid;
        role = user.role || 'customer';
      }
    } catch (e) {
      console.warn('Failed to parse mock session user for logs:', e);
    }
    
    const device = typeof navigator !== 'undefined' ? navigator.userAgent : 'NodeJS Agent';
    const ipAddress = '127.0.0.1';
    
    const entry = {
      id: `log-${Math.random().toString(36).substring(2, 9)}`,
      action,
      module,
      entityType,
      entityId,
      oldValue: typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue),
      newValue: typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue),
      performedBy,
      role,
      timestamp: new Date().toISOString(),
      success,
      device,
      ipAddress
    };
    
    table.push(entry);
    dbMock.saveTable('audit_logs', table);
    return entry;
  }
};
