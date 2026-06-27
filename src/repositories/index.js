// Central Repository Dispatch Exporter
import { MOCK_MODE } from '../config/appConfig';
import mockRepositories from './mock';
import firebaseRepositories from './firebase';

// Log current application adapter target for diagnostic awareness
console.info(`[ZSports Adapter] Initializing repository layers in ${MOCK_MODE ? 'MOCK LOCAL' : 'PRODUCTION FIREBASE'} mode.`);

const activeRepositories = MOCK_MODE ? mockRepositories : firebaseRepositories;

export const authRepository = activeRepositories.auth;
export const venueRepository = activeRepositories.venue;
export const courtRepository = activeRepositories.court;
export const slotRepository = activeRepositories.slot;
export const bookingRepository = activeRepositories.booking;
export const reviewRepository = activeRepositories.review;
export const couponRepository = activeRepositories.coupon;
export const reportRepository = activeRepositories.report;
export const notificationRepository = activeRepositories.notification;
export const systemSettingsRepository = activeRepositories.systemSettings;
export const roleRepository = activeRepositories.role;
export const auditLogRepository = activeRepositories.auditLog;

export default activeRepositories;