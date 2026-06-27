// Firebase Court Repository
import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const FirebaseCourtRepository = {
  getCourts: async () => {
    const snap = await getDocs(collection(db, 'courts'));
    const results = [];
    snap.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },

  getCourtsByVenue: async (venueId) => {
    const q = query(collection(db, 'courts'), where('venueId', '==', venueId));
    const snap = await getDocs(q);
    const results = [];
    snap.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },

  getCourtsByVenueAndSport: async (venueId, sport) => {
    const q = query(
      collection(db, 'courts'),
      where('venueId', '==', venueId),
      where('sport', '==', sport),
      where('isActive', '==', true)
    );
    const snap = await getDocs(q);
    const results = [];
    snap.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results;
  },

  getCourtById: async (courtId) => {
    const docRef = doc(db, 'courts', courtId);
    const snap = await getDoc(docRef);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  createCourt: async (data) => {
    const venueDoc = await getDoc(doc(db, 'venues', data.venueId));
    const venueName = venueDoc.exists() ? venueDoc.data().name : '';
    const docRef = await addDoc(collection(db, 'courts'), {
      ...data,
      venueName,
      isActive: true,
      isUnderMaintenance: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    const docSnap = await getDoc(docRef);
    const created = { id: docSnap.id, ...docSnap.data() };

    try {
      const { FirebaseAuditLogRepository } = await import('./FirebaseAuditLogRepository');
      await FirebaseAuditLogRepository.log({
        action: 'Create Court',
        module: 'Venue Management',
        entityType: 'Court',
        entityId: created.id,
        newValue: created
      });
    } catch (e) {}

    return created;
  },

  updateCourt: async (courtId, data) => {
    const ref = doc(db, 'courts', courtId);
    let oldValue = {};
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) oldValue = snap.data();
    } catch (e) {}

    let venueName = oldValue.venueName || '';
    if (data.venueId && data.venueId !== oldValue.venueId) {
      const venueDoc = await getDoc(doc(db, 'venues', data.venueId));
      if (venueDoc.exists()) venueName = venueDoc.data().name;
    }

    await updateDoc(ref, {
      ...data,
      venueName,
      updatedAt: new Date().toISOString()
    });
    const docSnap = await getDoc(ref);
    const updated = { id: docSnap.id, ...docSnap.data() };

    try {
      const { FirebaseAuditLogRepository } = await import('./FirebaseAuditLogRepository');
      await FirebaseAuditLogRepository.log({
        action: 'Update Court',
        module: 'Venue Management',
        entityType: 'Court',
        entityId: courtId,
        oldValue,
        newValue: updated
      });
    } catch (e) {}

    return updated;
  },

  toggleMaintenance: async (courtId, status) => {
    const ref = doc(db, 'courts', courtId);
    let oldValue = {};
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) oldValue = snap.data();
    } catch (e) {}

    await updateDoc(ref, { isUnderMaintenance: status, updatedAt: new Date().toISOString() });
    
    try {
      const { FirebaseAuditLogRepository } = await import('./FirebaseAuditLogRepository');
      await FirebaseAuditLogRepository.log({
        action: 'Toggle Court Maintenance',
        module: 'Venue Management',
        entityType: 'Court',
        entityId: courtId,
        oldValue,
        newValue: { isUnderMaintenance: status }
      });
    } catch (e) {}

    return true;
  },

  deleteCourt: async (courtId) => {
    const ref = doc(db, 'courts', courtId);
    let oldValue = {};
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) oldValue = snap.data();
    } catch (e) {}

    await deleteDoc(ref);

    try {
      const { FirebaseAuditLogRepository } = await import('./FirebaseAuditLogRepository');
      await FirebaseAuditLogRepository.log({
        action: 'Delete Court',
        module: 'Venue Management',
        entityType: 'Court',
        entityId: courtId,
        oldValue,
        newValue: null
      });
    } catch (e) {}

    return true;
  }
};
