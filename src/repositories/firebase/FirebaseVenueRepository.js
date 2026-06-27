// Firebase Venue Repository
import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const FirebaseVenueRepository = {
  getVenues: async (filters = {}) => {
    let q = query(collection(db, 'venues'), where('isActive', '==', true));

    if (filters.city) {
      q = query(q, where('city', '==', filters.city));
    }
    if (filters.sport) {
      q = query(q, where('sports', 'array-contains', filters.sport));
    }

    const snap = await getDocs(q);
    let results = [];
    snap.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });

    // In-memory post filtering for matches Firestore can't do without custom indexes
    if (filters.search) {
      const sq = filters.search.toLowerCase();
      results = results.filter(v =>
        v.name.toLowerCase().includes(sq) ||
        v.description.toLowerCase().includes(sq)
      );
    }

    if (filters.rating) {
      results = results.filter(v => v.avgRating >= parseFloat(filters.rating));
    }

    if (filters.amenities && filters.amenities.length > 0) {
      results = results.filter(v =>
        filters.amenities.every(amenity => v.amenities?.includes(amenity))
      );
    }

    const courtsSnap = await getDocs(collection(db, 'courts'));
    const courtsList = [];
    courtsSnap.forEach(doc => {
      courtsList.push({ id: doc.id, ...doc.data() });
    });

    return results.map(v => {
      const venueCourts = courtsList.filter(c => c.venueId === v.id);
      return {
        ...v,
        courtCount: venueCourts.length,
        activeCourtCount: venueCourts.filter(c => c.isActive && !c.isUnderMaintenance).length,
        maintenanceCourtCount: venueCourts.filter(c => c.isUnderMaintenance).length,
        inactiveCourtCount: venueCourts.filter(c => !c.isActive).length
      };
    });
  },

  getVenueById: async (venueId) => {
    const docRef = doc(db, 'venues', venueId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const venue = { id: snap.id, ...snap.data() };

    const q = query(collection(db, 'courts'), where('venueId', '==', venueId));
    const courtsSnap = await getDocs(q);
    const venueCourts = [];
    courtsSnap.forEach(doc => {
      venueCourts.push({ id: doc.id, ...doc.data() });
    });

    venue.courtCount = venueCourts.length;
    venue.activeCourtCount = venueCourts.filter(c => c.isActive && !c.isUnderMaintenance).length;
    venue.maintenanceCourtCount = venueCourts.filter(c => c.isUnderMaintenance).length;
    venue.inactiveCourtCount = venueCourts.filter(c => !c.isActive).length;

    return venue;
  },

  getFeaturedVenues: async () => {
    const q = query(collection(db, 'venues'), where('isFeatured', '==', true), where('isActive', '==', true));
    const snap = await getDocs(q);
    const results = [];
    snap.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });

    const courtsSnap = await getDocs(collection(db, 'courts'));
    const courtsList = [];
    courtsSnap.forEach(doc => {
      courtsList.push({ id: doc.id, ...doc.data() });
    });

    return results.map(v => {
      const venueCourts = courtsList.filter(c => c.venueId === v.id);
      return {
        ...v,
        courtCount: venueCourts.length,
        activeCourtCount: venueCourts.filter(c => c.isActive && !c.isUnderMaintenance).length,
        maintenanceCourtCount: venueCourts.filter(c => c.isUnderMaintenance).length,
        inactiveCourtCount: venueCourts.filter(c => !c.isActive).length
      };
    });
  },

  createVenue: async (data) => {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const docRef = await addDoc(collection(db, 'venues'), {
      ...data,
      slug,
      avgRating: 0,
      reviewCount: 0,
      totalBookings: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    const docSnap = await getDoc(docRef);
    const created = { id: docSnap.id, ...docSnap.data() };
    
    try {
      const { FirebaseAuditLogRepository } = await import('./FirebaseAuditLogRepository');
      await FirebaseAuditLogRepository.log({
        action: 'Create Venue',
        module: 'Venue Management',
        entityType: 'Venue',
        entityId: created.id,
        newValue: created
      });
    } catch (err) {
      console.error('Audit log failed for venue creation:', err);
    }

    return created;
  },

  updateVenue: async (venueId, data) => {
    const ref = doc(db, 'venues', venueId);
    let oldValue = {};
    try {
      const oldSnap = await getDoc(ref);
      if (oldSnap.exists()) oldValue = oldSnap.data();
    } catch (e) {}

    await updateDoc(ref, {
      ...data,
      updatedAt: new Date().toISOString()
    });

    // Synchronize venue name to associated courts
    if (data.name && data.name !== oldValue.name) {
      const q = query(collection(db, 'courts'), where('venueId', '==', venueId));
      const courtsSnap = await getDocs(q);
      const batch = writeBatch(db);
      courtsSnap.forEach(courtDoc => {
        batch.update(doc(db, 'courts', courtDoc.id), {
          venueName: data.name,
          updatedAt: new Date().toISOString()
        });
      });
      await batch.commit();
    }

    const docSnap = await getDoc(ref);
    const updated = { id: docSnap.id, ...docSnap.data() };

    try {
      const { FirebaseAuditLogRepository } = await import('./FirebaseAuditLogRepository');
      await FirebaseAuditLogRepository.log({
        action: 'Update Venue',
        module: 'Venue Management',
        entityType: 'Venue',
        entityId: venueId,
        oldValue,
        newValue: updated
      });
    } catch (err) {
      console.error('Audit log failed for venue update:', err);
    }

    return updated;
  },

  deactivateVenue: async (venueId) => {
    const ref = doc(db, 'venues', venueId);
    let oldValue = {};
    try {
      const oldSnap = await getDoc(ref);
      if (oldSnap.exists()) oldValue = oldSnap.data();
    } catch (e) {}

    await updateDoc(ref, { isActive: false, updatedAt: new Date().toISOString() });
    
    try {
      const { FirebaseAuditLogRepository } = await import('./FirebaseAuditLogRepository');
      await FirebaseAuditLogRepository.log({
        action: 'Deactivate Venue',
        module: 'Venue Management',
        entityType: 'Venue',
        entityId: venueId,
        oldValue,
        newValue: { isActive: false }
      });
    } catch (err) {
      console.error('Audit log failed for venue deactivation:', err);
    }

    return true;
  },

  deleteVenue: async (venueId) => {
    const ref = doc(db, 'venues', venueId);
    let oldValue = {};
    try {
      const oldSnap = await getDoc(ref);
      if (oldSnap.exists()) oldValue = oldSnap.data();
    } catch (e) {}

    await deleteDoc(ref);
    
    try {
      const { FirebaseAuditLogRepository } = await import('./FirebaseAuditLogRepository');
      await FirebaseAuditLogRepository.log({
        action: 'Delete Venue',
        module: 'Venue Management',
        entityType: 'Venue',
        entityId: venueId,
        oldValue,
        newValue: null
      });
    } catch (err) {
      console.error('Audit log failed for venue deletion:', err);
    }

    return true;
  },

  getAllVenues: async () => {
    const snap = await getDocs(collection(db, 'venues'));
    const results = [];
    snap.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });

    const courtsSnap = await getDocs(collection(db, 'courts'));
    const courtsList = [];
    courtsSnap.forEach(doc => {
      courtsList.push({ id: doc.id, ...doc.data() });
    });

    return results.map(v => {
      const venueCourts = courtsList.filter(c => c.venueId === v.id);
      return {
        ...v,
        courtCount: venueCourts.length,
        activeCourtCount: venueCourts.filter(c => c.isActive && !c.isUnderMaintenance).length,
        maintenanceCourtCount: venueCourts.filter(c => c.isUnderMaintenance).length,
        inactiveCourtCount: venueCourts.filter(c => !c.isActive).length
      };
    });
  },

  getVenuesByAdmin: async (adminId) => {
    const q = query(collection(db, 'venues'), where('adminId', '==', adminId));
    const snap = await getDocs(q);
    const results = [];
    snap.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });

    const courtsSnap = await getDocs(collection(db, 'courts'));
    const courtsList = [];
    courtsSnap.forEach(doc => {
      courtsList.push({ id: doc.id, ...doc.data() });
    });

    return results.map(v => {
      const venueCourts = courtsList.filter(c => c.venueId === v.id);
      return {
        ...v,
        courtCount: venueCourts.length,
        activeCourtCount: venueCourts.filter(c => c.isActive && !c.isUnderMaintenance).length,
        maintenanceCourtCount: venueCourts.filter(c => c.isUnderMaintenance).length,
        inactiveCourtCount: venueCourts.filter(c => !c.isActive).length
      };
    });
  }
};
