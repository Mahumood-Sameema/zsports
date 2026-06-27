// Centralized Permissions Configurations

export const Permissions = {
  VIEW_CUSTOMER_DASHBOARD: 'VIEW_CUSTOMER_DASHBOARD',
  CREATE_BOOKING: 'CREATE_BOOKING',
  CANCEL_OWN_BOOKING: 'CANCEL_OWN_BOOKING',
  SUBMIT_REVIEW: 'SUBMIT_REVIEW',

  VIEW_STAFF_DASHBOARD: 'VIEW_STAFF_DASHBOARD',
  WALK_IN_BOOKING: 'WALK_IN_BOOKING',
  OVERRIDE_SLOT: 'OVERRIDE_SLOT',
  LOOKUP_CUSTOMER: 'LOOKUP_CUSTOMER',
  CHECK_IN_CUSTOMER: 'CHECK_IN_CUSTOMER',

  VIEW_ADMIN_DASHBOARD: 'VIEW_ADMIN_DASHBOARD',
  MANAGE_VENUES: 'MANAGE_VENUES',
  MANAGE_COURTS: 'MANAGE_COURTS',
  MANAGE_SLOTS: 'MANAGE_SLOTS',
  MANAGE_BOOKINGS: 'MANAGE_BOOKINGS',
  INITIATE_REFUND: 'INITIATE_REFUND',
  MANAGE_STAFF: 'MANAGE_STAFF',
  MANAGE_COUPONS: 'MANAGE_COUPONS',
  VIEW_REPORTS: 'VIEW_REPORTS',
  ADMIN_ANNOUNCEMENTS: 'ADMIN_ANNOUNCEMENTS',
  MANAGE_SETTINGS: 'MANAGE_SETTINGS',
  MANAGE_PERMISSIONS: 'MANAGE_PERMISSIONS',
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
};

// Default fallback static permissions mapping (for bootstrap/diagnostic purposes)
const RolePermissions = {
  customer: [
    Permissions.VIEW_CUSTOMER_DASHBOARD,
    Permissions.CREATE_BOOKING,
    Permissions.CANCEL_OWN_BOOKING,
    Permissions.SUBMIT_REVIEW,
  ],
  staff: [
    Permissions.VIEW_STAFF_DASHBOARD,
    Permissions.WALK_IN_BOOKING,
    Permissions.OVERRIDE_SLOT,
    Permissions.LOOKUP_CUSTOMER,
    Permissions.CHECK_IN_CUSTOMER,
  ],
  admin: [
    Permissions.VIEW_ADMIN_DASHBOARD,
    Permissions.MANAGE_VENUES,
    Permissions.MANAGE_COURTS,
    Permissions.MANAGE_SLOTS,
    Permissions.MANAGE_BOOKINGS,
    Permissions.INITIATE_REFUND,
    Permissions.MANAGE_STAFF,
    Permissions.MANAGE_COUPONS,
    Permissions.VIEW_REPORTS,
    Permissions.ADMIN_ANNOUNCEMENTS,
    Permissions.MANAGE_SETTINGS,
    Permissions.MANAGE_PERMISSIONS,
    Permissions.VIEW_AUDIT_LOGS,
  ]
};

/**
 * Checks if a given role has a specific permission (static fallback check).
 * @param {string} role - The user's role (customer, staff, admin)
 * @param {string} permission - The permission key to check
 * @returns {boolean}
 */
export const checkPermission = (role, permission) => {
  if (!role) return false;
  
  const allowed = RolePermissions[role.toLowerCase()];
  if (!allowed) return false;
  
  return allowed.includes(permission);
};

export default Permissions;
