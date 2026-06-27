// Firebase Role Repository
import { doc, getDoc, getDocs, setDoc, updateDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase/config';

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

export const FirebaseRoleRepository = {
  getRoles: async () => {
    try {
      const snap = await getDocs(collection(db, 'roles'));
      if (snap.empty) {
        // Initialize default roles in database
        for (const role of DEFAULT_ROLES) {
          await setDoc(doc(db, 'roles', role.id), role);
        }
        return DEFAULT_ROLES;
      }
      const results = [];
      snap.forEach(doc => {
        results.push({ id: doc.id, ...doc.data() });
      });
      return results;
    } catch (err) {
      console.error('Failed to get roles list:', err);
      throw err;
    }
  },

  getRole: async (roleName) => {
    try {
      const docRef = doc(db, 'roles', roleName.toLowerCase());
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() };
      }
      
      // Fallback seed check if not found
      const defaults = DEFAULT_ROLES.find(r => r.id === roleName.toLowerCase());
      if (defaults) {
        await setDoc(docRef, defaults);
        return defaults;
      }
      return null;
    } catch (err) {
      console.error(`Failed to fetch role details for: ${roleName}`, err);
      throw err;
    }
  },

  updateRolePermissions: async (roleName, permissions) => {
    try {
      const docRef = doc(db, 'roles', roleName.toLowerCase());
      const oldDoc = await getDoc(docRef);
      const oldPermissions = oldDoc.exists() ? oldDoc.data().permissions || [] : [];

      await updateDoc(docRef, {
        permissions,
        updatedAt: new Date().toISOString()
      });
      const updated = await getDoc(docRef);

      try {
        const { FirebaseAuditLogRepository } = await import('./FirebaseAuditLogRepository');
        await FirebaseAuditLogRepository.log({
          action: 'Update Role Permissions',
          module: 'Administration',
          entityType: 'Role',
          entityId: roleName,
          oldValue: { permissions: oldPermissions },
          newValue: { permissions }
        });
      } catch (logErr) {
        console.error('Audit logging failed in updateRolePermissions:', logErr);
      }

      return { id: updated.id, ...updated.data() };
    } catch (err) {
      console.error(`Failed to update permissions for role: ${roleName}`, err);
      throw err;
    }
  },

  assignRole: async (userId, role) => {
    try {
      const docRef = doc(db, 'users', userId);
      const oldDoc = await getDoc(docRef);
      const oldRole = oldDoc.exists() ? oldDoc.data().role : null;

      await updateDoc(docRef, {
        role: role.toLowerCase(),
        updatedAt: new Date().toISOString()
      });

      try {
        const { FirebaseAuditLogRepository } = await import('./FirebaseAuditLogRepository');
        await FirebaseAuditLogRepository.log({
          action: 'Assign User Role',
          module: 'Administration',
          entityType: 'User',
          entityId: userId,
          oldValue: { role: oldRole },
          newValue: { role: role.toLowerCase() }
        });
      } catch (logErr) {
        console.error('Audit logging failed in assignRole:', logErr);
      }

      return true;
    } catch (err) {
      console.error(`Failed to update role assignment for user: ${userId}`, err);
      throw err;
    }
  },

  getUserRole: async (userId) => {
    try {
      const docRef = doc(db, 'users', userId);
      const snap = await getDoc(docRef);
      return snap.exists() ? snap.data().role : null;
    } catch (err) {
      console.error(`Failed to fetch role assignment for user: ${userId}`, err);
      throw err;
    }
  },

  getDefaults: () => DEFAULT_ROLES
};
