// Firebase Repositories Export Entry
import { FirebaseAuthRepository } from './FirebaseAuthRepository';
import { FirebaseVenueRepository } from './FirebaseVenueRepository';
import { FirebaseCourtRepository } from './FirebaseCourtRepository';
import { FirebaseSlotRepository } from './FirebaseSlotRepository';
import { FirebaseBookingRepository } from './FirebaseBookingRepository';
import { FirebaseReviewRepository } from './FirebaseReviewRepository';
import { FirebaseCouponRepository } from './FirebaseCouponRepository';
import { FirebaseReportRepository } from './FirebaseReportRepository';
import { FirebaseNotificationRepository } from './FirebaseNotificationRepository';
import { FirebaseSystemSettingsRepository } from './FirebaseSystemSettingsRepository';
import { FirebaseRoleRepository } from './FirebaseRoleRepository';
import { FirebaseAuditLogRepository } from './FirebaseAuditLogRepository';

export default {
  auth: FirebaseAuthRepository,
  venue: FirebaseVenueRepository,
  court: FirebaseCourtRepository,
  slot: FirebaseSlotRepository,
  booking: FirebaseBookingRepository,
  review: FirebaseReviewRepository,
  coupon: FirebaseCouponRepository,
  report: FirebaseReportRepository,
  notification: FirebaseNotificationRepository,
  systemSettings: FirebaseSystemSettingsRepository,
  role: FirebaseRoleRepository,
  auditLog: FirebaseAuditLogRepository
};