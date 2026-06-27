// Mock Venue Repository
import { dbMock } from './dbMock';

export const MockVenueRepository = {
  getVenues: async (filters = {}) => {
    await new Promise(r => setTimeout(r, 400));
    let venues = dbMock.getTable('venues').filter(v => v.isActive);
    const courts = dbMock.getTable('courts');

    // Filter by city
    if (filters.city) {
      venues = venues.filter(v => v.city.toLowerCase() === filters.city.toLowerCase());
    }

    // Filter by sport
    if (filters.sport) {
      venues = venues.filter(v => v.sports.includes(filters.sport));
    }

    // Filter by search query
    if (filters.search) {
      const q = filters.search.toLowerCase();
      venues = venues.filter(v =>
        v.name.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.address.toLowerCase().includes(q)
      );
    }

    // Filter by rating
    if (filters.rating) {
      venues = venues.filter(v => v.avgRating >= parseFloat(filters.rating));
    }

    // Filter by amenities
    if (filters.amenities && filters.amenities.length > 0) {
      venues = venues.filter(v =>
        filters.amenities.every(amenity => v.amenities.includes(amenity))
      );
    }

    // Filter by price range
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      venues = venues.filter(v => {
        // Find rates of all active courts at this venue
        const venueCourts = courts.filter(c => c.venueId === v.id && c.isActive);
        if (venueCourts.length === 0) return false;

        const minRate = Math.min(...venueCourts.map(c => c.baseHourlyRate));
        const maxRate = Math.max(...venueCourts.map(c => c.baseHourlyRate));

        const minMatch = filters.priceMin === undefined || maxRate >= filters.priceMin;
        const maxMatch = filters.priceMax === undefined || minRate <= filters.priceMax;

        return minMatch && maxMatch;
      });
    }

    return venues.map(v => {
      const venueCourts = courts.filter(c => c.venueId === v.id);
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
    await new Promise(r => setTimeout(r, 200));
    const venue = dbMock.getById('venues', venueId);
    if (venue) {
      const venueCourts = dbMock.getTable('courts').filter(c => c.venueId === venueId);
      venue.courtCount = venueCourts.length;
      venue.activeCourtCount = venueCourts.filter(c => c.isActive && !c.isUnderMaintenance).length;
      venue.maintenanceCourtCount = venueCourts.filter(c => c.isUnderMaintenance).length;
      venue.inactiveCourtCount = venueCourts.filter(c => !c.isActive).length;
    }
    return venue;
  },

  getFeaturedVenues: async () => {
    await new Promise(r => setTimeout(r, 300));
    const courts = dbMock.getTable('courts');
    return dbMock.getTable('venues')
      .filter(v => v.isActive && v.isFeatured)
      .map(v => {
        const venueCourts = courts.filter(c => c.venueId === v.id);
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
    await new Promise(r => setTimeout(r, 500));
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newVenue = {
      ...data,
      slug,
      avgRating: 0,
      reviewCount: 0,
      totalBookings: 0,
      isActive: true,
      galleryImageUrls: data.galleryImageUrls || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const created = dbMock.insert('venues', newVenue);

    try {
      const { MockAuditLogRepository } = await import('./MockAuditLogRepository');
      await MockAuditLogRepository.log({
        action: 'Create Venue',
        module: 'Venue Management',
        entityType: 'Venue',
        entityId: created.id,
        newValue: created
      });
    } catch (e) {}

    return created;
  },

  updateVenue: async (venueId, data) => {
    await new Promise(r => setTimeout(r, 400));
    const oldValue = dbMock.getById('venues', venueId) || {};
    const updated = dbMock.update('venues', venueId, data);

    // Synchronize venue name to associated courts
    if (data.name && data.name !== oldValue.name) {
      const courts = dbMock.getTable('courts');
      const updatedCourts = courts.map(c => {
        if (c.venueId === venueId) {
          return { ...c, venueName: data.name, updatedAt: new Date().toISOString() };
        }
        return c;
      });
      dbMock.saveTable('courts', updatedCourts);
    }

    try {
      const { MockAuditLogRepository } = await import('./MockAuditLogRepository');
      await MockAuditLogRepository.log({
        action: 'Update Venue',
        module: 'Venue Management',
        entityType: 'Venue',
        entityId: venueId,
        oldValue,
        newValue: updated
      });
    } catch (e) {}

    return updated;
  },

  deactivateVenue: async (venueId) => {
    await new Promise(r => setTimeout(r, 300));
    const oldValue = dbMock.getById('venues', venueId) || {};
    const updated = dbMock.update('venues', venueId, { isActive: false });

    try {
      const { MockAuditLogRepository } = await import('./MockAuditLogRepository');
      await MockAuditLogRepository.log({
        action: 'Deactivate Venue',
        module: 'Venue Management',
        entityType: 'Venue',
        entityId: venueId,
        oldValue,
        newValue: { isActive: false }
      });
    } catch (e) {}

    return updated;
  },

  deleteVenue: async (venueId) => {
    await new Promise(r => setTimeout(r, 300));
    const oldValue = dbMock.getById('venues', venueId) || {};
    const deleted = dbMock.delete('venues', venueId);

    try {
      const { MockAuditLogRepository } = await import('./MockAuditLogRepository');
      await MockAuditLogRepository.log({
        action: 'Delete Venue',
        module: 'Venue Management',
        entityType: 'Venue',
        entityId: venueId,
        oldValue,
        newValue: null
      });
    } catch (e) {}

    return deleted;
  },

  getAllVenues: async () => {
    await new Promise(r => setTimeout(r, 300));
    const courts = dbMock.getTable('courts');
    return dbMock.getTable('venues').map(v => {
      const venueCourts = courts.filter(c => c.venueId === v.id);
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
    await new Promise(r => setTimeout(r, 300));
    const courts = dbMock.getTable('courts');
    return dbMock.getTable('venues')
      .filter(v => v.adminId === adminId)
      .map(v => {
        const venueCourts = courts.filter(c => c.venueId === v.id);
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
