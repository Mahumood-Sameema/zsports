// Firebase Auth Repository
import { initializeApp, deleteApp } from 'firebase/app';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  getAuth
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';

const googleProvider = new GoogleAuthProvider();

export const FirebaseAuthRepository = {
  loginWithEmail: async (email, password) => {
    const isSystemAdmin = email.toLowerCase() === 'admin@zsports.com';
    const cred = await signInWithEmailAndPassword(auth, email, password);

    const userDocRef = doc(db, 'users', cred.user.uid);
    let userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      if (isSystemAdmin) {
        const profile = {
          uid: cred.user.uid,
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
        await setDoc(userDocRef, profile);
        return profile;
      }
      throw new Error('User profile not found in database.');
    }
    const data = userDoc.data();
    if (isSystemAdmin && data.role !== 'admin') {
      await updateDoc(userDocRef, { role: 'admin' });
      data.role = 'admin';
    }
    return data;
  },

  loginWithGoogle: async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    const userDocRef = doc(db, 'users', cred.user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // Create profile for first time Google logins
      const profile = {
        uid: cred.user.uid,
        displayName: cred.user.displayName || 'Google User',
        email: cred.user.email,
        phone: cred.user.phoneNumber || '',
        avatarUrl: cred.user.photoURL || '',
        role: 'customer',
        favoriteVenueIds: [],
        notificationPreferences: { email: true, inApp: true, sms: false },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(userDocRef, profile);
      return profile;
    }
    return userDoc.data();
  },

  registerWithEmail: async (email, password, displayName, phone = '') => {
    // Initialize a secondary Firebase app to prevent signing out the current admin
    const secondaryApp = initializeApp(auth.app.options, 'secondaryRegisterApp');
    const secondaryAuth = getAuth(secondaryApp);
    
    try {
      const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      
      const profile = {
        uid: cred.user.uid,
        displayName,
        email,
        phone,
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(displayName)}`,
        role: 'customer',
        favoriteVenueIds: [],
        notificationPreferences: { email: true, inApp: true, sms: false },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', cred.user.uid), profile);
      
      // Sign out from secondary auth and delete secondary app to clean up session
      await signOut(secondaryAuth);
      await deleteApp(secondaryApp);
      
      return profile;
    } catch (err) {
      try {
        await deleteApp(secondaryApp);
      } catch (e) {}
      throw err;
    }
  },

  logout: async () => {
    return await signOut(auth);
  },

  sendPasswordReset: async (email) => {
    return await sendPasswordResetEmail(auth, email);
  },

  getCurrentUser: () => {
    return auth?.currentUser || null;
  },

  onAuthStateChanged: (callback) => {
    if (!auth) {
      callback(null);
      return () => {};
    }
    
    return onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            callback(userDoc.data());
            return;
          }
        } catch (e) {
          console.error('Failed to retrieve user profile:', e);
        }
        callback({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || 'Firebase User',
          role: 'customer'
        });
      } else {
        callback(null);
      }
    });
  },

  updateUserProfile: async (uid, updates) => {
    const ref = doc(db, 'users', uid);
    let oldValue = {};
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) oldValue = snap.data();
    } catch (e) {}

    await updateDoc(ref, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    const updated = await getDoc(ref);
    const updatedData = updated.data();

    try {
      const { FirebaseAuditLogRepository } = await import('./FirebaseAuditLogRepository');
      await FirebaseAuditLogRepository.log({
        action: updates.role ? 'Assign User Role' : 'Update User Profile',
        module: 'Administration',
        entityType: 'User',
        entityId: uid,
        oldValue,
        newValue: updatedData
      });
    } catch (e) {}

    return updatedData;
  },

  getAllUsers: async () => {
    const { collection, getDocs } = await import('firebase/firestore');
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map(doc => doc.data());
  },

  getUserById: async (uid) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? userDoc.data() : null;
  }
};
