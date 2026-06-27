// Mock Repositories Export Entry
import { MockAuthRepository } from './MockAuthRepository';
import { MockVenueRepository } from './MockVenueRepository';
import { MockCourtRepository } from './MockCourtRepository';
import { MockSlotRepository } from './MockSlotRepository';
import { MockBookingRepository } from './MockBookingRepository';
import { MockReviewRepository } from './MockReviewRepository';
import { MockCouponRepository } from './MockCouponRepository';
import { MockReportRepository } from './MockReportRepository';
import { MockNotificationRepository } from './MockNotificationRepository';
import { MockSystemSettingsRepository } from './MockSystemSettingsRepository';
import { MockRoleRepository } from './MockRoleRepository';
import { MockAuditLogRepository } from './MockAuditLogRepository';

export default {
  auth: MockAuthRepository,
  venue: MockVenueRepository,
  court: MockCourtRepository,
  slot: MockSlotRepository,
  booking: MockBookingRepository,
  review: MockReviewRepository,
  coupon: MockCouponRepository,
  report: MockReportRepository,
  notification: MockNotificationRepository,
  systemSettings: MockSystemSettingsRepository,
  role: MockRoleRepository,
  auditLog: MockAuditLogRepository
};

