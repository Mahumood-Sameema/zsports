// Firebase Notification Repository
import { 
  collection, doc, getDoc, getDocs, query, limit, orderBy, 
  addDoc, updateDoc, writeBatch, onSnapshot, where 
} from 'firebase/firestore';
import { db } from '../../firebase/config';

export const FirebaseNotificationRepository = {
  getNotifications: async (userId, limitNum = 50) => {
    const q = query(
      collection(db, `users/${userId}/notifications`),
      orderBy('createdAt', 'desc'),
      limit(limitNum)
    );
    const snap = await getDocs(q);
    const results = [];
    snap.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results;
  },

  sendNotification: async (userId, notificationData) => {
    const colRef = collection(db, `users/${userId}/notifications`);
    const docRef = await addDoc(colRef, {
      ...notificationData,
      isRead: false,
      createdAt: new Date().toISOString()
    });
    const snap = await getDoc(docRef);
    return { id: snap.id, ...snap.data() };
  },

  markAsRead: async (userId, notificationId) => {
    const ref = doc(db, `users/${userId}/notifications`, notificationId);
    await updateDoc(ref, { isRead: true });
    return true;
  },

  markAllAsRead: async (userId) => {
    const q = query(collection(db, `users/${userId}/notifications`), where('isRead', '==', false));
    const snap = await getDocs(q);
    
    if (snap.empty) return true;

    const batch = writeBatch(db);
    snap.forEach(doc => {
      batch.update(doc.ref, { isRead: true });
    });
    await batch.commit();
    return true;
  },

  subscribeToNotifications: (userId, callback) => {
    const q = query(
      collection(db, `users/${userId}/notifications`),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const results = [];
      snapshot.forEach(doc => {
        results.push({ id: doc.id, ...doc.data() });
      });
      callback(results);
    }, (err) => {
      console.error('Error subscribing to notifications:', err);
    });
  }
};
