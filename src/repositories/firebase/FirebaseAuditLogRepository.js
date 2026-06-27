// Firebase Audit Log Repository
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const FirebaseAuditLogRepository = {
  getLogs: async () => {
    try {
      const q = query(
        collection(db, 'audit_logs'), 
        orderBy('timestamp', 'desc'), 
        limit(100)
      );
      const snap = await getDocs(q);
      const results = [];
      snap.forEach(doc => {
        results.push({ id: doc.id, ...doc.data() });
      });
      return results;
    } catch (err) {
      console.error('Failed to retrieve audit logs:', err);
      throw err;
    }
  },

  log: async ({ action, module, entityType = 'N/A', entityId = 'N/A', oldValue = 'N/A', newValue = 'N/A', success = true }) => {
    try {
      const { getAuth } = await import('firebase/auth');
      const { doc, getDoc } = await import('firebase/firestore');
      const authInstance = getAuth();
      const fbUser = authInstance.currentUser;

      let performedBy = 'System';
      let role = 'System';

      if (fbUser) {
        performedBy = fbUser.email || fbUser.uid;
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            role = userDoc.data().role || 'customer';
          }
        } catch (e) {
          console.warn('Failed to read user role in audit log:', e);
        }
      }

      const device = typeof navigator !== 'undefined' ? navigator.userAgent : 'NodeJS Agent';
      const ipAddress = '127.0.0.1'; // Local client mock IP

      const entry = {
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

      const docRef = await addDoc(collection(db, 'audit_logs'), entry);
      return { id: docRef.id, ...entry };
    } catch (err) {
      console.error('Failed to write audit log:', err);
      throw err;
    }
  }
};
