// Mock Auth Repository
import { dbMock } from './dbMock';

const SESSION_KEY = 'zsports_session_user';
let authListeners = [];

const triggerListeners = (user) => {
  authListeners.forEach(listener => listener(user));
};

export const MockAuthRepository = {
  loginWithEmail: async (email, password) => {
    // Artificial delay for realism
    await new Promise(r => setTimeout(r, 600));

    const users = dbMock.getTable('users');
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    const isSystemAdmin = email.toLowerCase() === 'admin@zsports.com';

    if (!user) {
      if (isSystemAdmin && password === 'admin123') {
        const newUser = {
          uid: 'user-admin',
          displayName: 'System Admin',
          email: email.toLowerCase(),
          phone: '',
          avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=SystemAdmin`,
          role: 'admin',
          favoriteVenueIds: [],
          notificationPreferences: { email: true, inApp: true, sms: true },
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        dbMock.insert('users', newUser);
        user = newUser;
      } else {
        throw new Error('auth/user-not-found');
      }
    } else {
      if (isSystemAdmin && user.role !== 'admin') {
        user.role = 'admin';
        dbMock.update('users', user.uid, { role: 'admin' });
      }

      // Mock validation (checks if password matches role name prefix)
      const expectedPassword = user.role + '123';
      if (password !== expectedPassword && password !== 'password123') {
        throw new Error('auth/wrong-password');
      }
    }

    if (!user.isActive) {
      throw new Error('auth/user-disabled');
    }

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    triggerListeners(user);
    return user;
  },

  loginWithGoogle: async () => {
    await new Promise(r => setTimeout(r, 800));
    
    // Sign in as our customer Sam Williams
    const user = dbMock.getById('users', 'user-customer');
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    triggerListeners(user);
    return user;
  },

  registerWithEmail: async (email, password, displayName, phone = '') => {
    await new Promise(r => setTimeout(r, 600));

    const users = dbMock.getTable('users');
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

    if (exists) {
      throw new Error('auth/email-already-in-use');
    }

    const newUser = {
      uid: 'user-' + Math.random().toString(36).substring(2, 9),
      displayName,
      email,
      phone,
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(displayName)}`,
      role: 'customer',
      favoriteVenueIds: [],
      notificationPreferences: { email: true, inApp: true, sms: false },
      isActive: true
    };

    dbMock.insert('users', newUser);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    triggerListeners(newUser);
    return newUser;
  },

  logout: async () => {
    await new Promise(r => setTimeout(r, 200));
    sessionStorage.removeItem(SESSION_KEY);
    triggerListeners(null);
    return true;
  },

  sendPasswordReset: async (email) => {
    await new Promise(r => setTimeout(r, 400));
    const users = dbMock.getTable('users');
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (!exists) {
      throw new Error('auth/user-not-found');
    }
    return true;
  },

  getCurrentUser: () => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  onAuthStateChanged: (callback) => {
    authListeners.push(callback);
    
    // Run initial emit
    const currentUser = MockAuthRepository.getCurrentUser();
    callback(currentUser);

    // Return unsubscribe function
    return () => {
      authListeners = authListeners.filter(l => l !== callback);
    };
  },

  updateUserProfile: async (uid, updates) => {
    await new Promise(r => setTimeout(r, 400));
    const oldValue = dbMock.getById('users', uid) || {};
    const updated = dbMock.update('users', uid, updates);
    if (updated) {
      // If current session is updated, sync session storage
      const current = MockAuthRepository.getCurrentUser();
      if (current && current.uid === uid) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
        triggerListeners(updated);
      }
    }

    try {
      const { MockAuditLogRepository } = await import('./MockAuditLogRepository');
      await MockAuditLogRepository.log({
        action: updates.role ? 'Assign User Role' : 'Update User Profile',
        module: 'Administration',
        entityType: 'User',
        entityId: uid,
        oldValue,
        newValue: updated
      });
    } catch (e) {}

    return updated;
  },

  getAllUsers: async () => {
    await new Promise(r => setTimeout(r, 300));
    return dbMock.getTable('users');
  },

  getUserById: async (uid) => {
    await new Promise(r => setTimeout(r, 200));
    return dbMock.getById('users', uid);
  }
};
