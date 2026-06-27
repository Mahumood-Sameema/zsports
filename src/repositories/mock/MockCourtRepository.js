// Mock Court Repository
import { dbMock } from './dbMock';

export const MockCourtRepository = {
  getCourts: async () => {
    await new Promise(r => setTimeout(r, 200));
    return dbMock.getTable('courts')
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },

  getCourtsByVenue: async (venueId) => {
    await new Promise(r => setTimeout(r, 200));
    return dbMock.getTable('courts')
      .filter(c => c.venueId === venueId)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },

  getCourtsByVenueAndSport: async (venueId, sport) => {
    await new Promise(r => setTimeout(r, 200));
    return dbMock.getTable('courts')
      .filter(c => c.venueId === venueId && c.sport === sport && c.isActive);
  },

  getCourtById: async (courtId) => {
    await new Promise(r => setTimeout(r, 150));
    return dbMock.getById('courts', courtId);
  },

  createCourt: async (data) => {
    await new Promise(r => setTimeout(r, 400));
    const venue = dbMock.getById('venues', data.venueId);
    const venueName = venue ? venue.name : '';
    const courts = dbMock.getTable('courts').filter(c => c.venueId === data.venueId);
    const newCourt = {
      ...data,
      venueName,
      isActive: true,
      isUnderMaintenance: false,
      displayOrder: courts.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const created = dbMock.insert('courts', newCourt);

    try {
      const { MockAuditLogRepository } = await import('./MockAuditLogRepository');
      await MockAuditLogRepository.log({
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
    await new Promise(r => setTimeout(r, 300));
    const oldValue = dbMock.getById('courts', courtId) || {};
    let venueName = oldValue.venueName || '';
    if (data.venueId && data.venueId !== oldValue.venueId) {
      const venue = dbMock.getById('venues', data.venueId);
      venueName = venue ? venue.name : '';
    }
    const updated = dbMock.update('courts', courtId, {
      ...data,
      venueName
    });

    try {
      const { MockAuditLogRepository } = await import('./MockAuditLogRepository');
      await MockAuditLogRepository.log({
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
    await new Promise(r => setTimeout(r, 250));
    const oldValue = dbMock.getById('courts', courtId) || {};
    const updated = dbMock.update('courts', courtId, { isUnderMaintenance: status });

    try {
      const { MockAuditLogRepository } = await import('./MockAuditLogRepository');
      await MockAuditLogRepository.log({
        action: 'Toggle Court Maintenance',
        module: 'Venue Management',
        entityType: 'Court',
        entityId: courtId,
        oldValue,
        newValue: { isUnderMaintenance: status }
      });
    } catch (e) {}

    return updated;
  },

  deleteCourt: async (courtId) => {
    await new Promise(r => setTimeout(r, 300));
    const oldValue = dbMock.getById('courts', courtId) || {};
    const deleted = dbMock.delete('courts', courtId);

    try {
      const { MockAuditLogRepository } = await import('./MockAuditLogRepository');
      await MockAuditLogRepository.log({
        action: 'Delete Court',
        module: 'Venue Management',
        entityType: 'Court',
        entityId: courtId,
        oldValue,
        newValue: null
      });
    } catch (e) {}

    return deleted;
  }
};
