// Mock Role Repository
import { dbMock } from './dbMock';
import { MockAuditLogRepository } from './MockAuditLogRepository';

const DEFAULT_ROLES = [
  {
    id: 'customer',
    name: 'Customer',
    description: 'Public players and booking users',
    permissions: [
      'VIEW_CUSTOMER_DASHBOARD',
      'CREATE_BOOKING',
      'CANCEL_OWN_BOOKING',
      'SUBMIT_REVIEW'
    ]
  },
  {
    id: 'staff',
    name: 'Staff',
    description: 'Ground gate keepers and operational cashier staff',
    permissions: [
      'VIEW_STAFF_DASHBOARD',
      'WALK_IN_BOOKING',
      'OVERRIDE_SLOT',
      'LOOKUP_CUSTOMER',
      'CHECK_IN_CUSTOMER'
    ]
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Organization administrators managing venues, configuration, and logs',
    permissions: [
      'VIEW_ADMIN_DASHBOARD',
      'MANAGE_VENUES',
      'MANAGE_COURTS',
      'MANAGE_SLOTS',
      'MANAGE_BOOKINGS',
      'INITIATE_REFUND',
      'MANAGE_STAFF',
      'MANAGE_COUPONS',
      'VIEW_REPORTS',
      'ADMIN_ANNOUNCEMENTS',
      'MANAGE_SETTINGS',
      'MANAGE_PERMISSIONS',
      'VIEW_AUDIT_LOGS'
    ]
  }
];

export const MockRoleRepository = {
  getRoles: async () => {
    await new Promise(r => setTimeout(r, 200));
    const table = dbMock.getTable('roles');
    if (table.length === 0) {
      dbMock.saveTable('roles', DEFAULT_ROLES);
      return DEFAULT_ROLES;
    }
    return table;
  },

  getRole: async (roleName) => {
    await new Promise(r => setTimeout(r, 100));
    const roles = await MockRoleRepository.getRoles();
    return roles.find(r => r.id === roleName.toLowerCase()) || null;
  },

  updateRolePermissions: async (roleName, permissions) => {
    await new Promise(r => setTimeout(r, 300));
    const roles = await MockRoleRepository.getRoles();
    const idx = roles.findIndex(r => r.id === roleName.toLowerCase());
    if (idx !== -1) {
      const oldPermissions = [...roles[idx].permissions];
      roles[idx].permissions = permissions;
      dbMock.saveTable('roles', roles);

      try {
        await MockAuditLogRepository.log({
          action: 'Update Role Permissions',
          module: 'Administration',
          entityType: 'Role',
          entityId: roleName,
          oldValue: { permissions: oldPermissions },
          newValue: { permissions }
        });
      } catch (e) {
        console.error('Audit logging failed in updateRolePermissions:', e);
      }

      return roles[idx];
    }
    throw new Error(`Role ${roleName} not found.`);
  },

  assignRole: async (userId, role) => {
    await new Promise(r => setTimeout(r, 200));
    const user = dbMock.getById('users', userId);
    if (!user) throw new Error('User not found');
    
    const oldRole = user.role;
    dbMock.update('users', userId, { role: role.toLowerCase() });

    try {
      await MockAuditLogRepository.log({
        action: 'Assign User Role',
        module: 'Administration',
        entityType: 'User',
        entityId: userId,
        oldValue: { role: oldRole },
        newValue: { role: role.toLowerCase() }
      });
    } catch (e) {
      console.error('Audit logging failed in assignRole:', e);
    }

    return true;
  },

  getUserRole: async (userId) => {
    await new Promise(r => setTimeout(r, 100));
    const user = dbMock.getById('users', userId);
    return user ? user.role : null;
  },

  getDefaults: () => DEFAULT_ROLES
};
