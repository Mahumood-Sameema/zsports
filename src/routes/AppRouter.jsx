// AppRouter Component
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import RoleGuard from './RoleGuard';
import Permissions from '../features/auth/permissions/permissions';
import Spinner from '../components/common/Spinner';

// Layouts
import PublicLayout from '../components/layout/PublicLayout';
import AuthLayout from '../components/layout/AuthLayout';
import DashboardLayout from '../components/layout/DashboardLayout';

// Loading Placeholder
const PageLoader = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
    <Spinner size="lg" />
  </div>
);

// Lazy Loaded Pages
// Public
const HomePage = lazy(() => import('../features/venues/pages/HomePage'));
const AboutPage = lazy(() => import('../features/venues/pages/AboutPage'));
const FAQPage = lazy(() => import('../features/venues/pages/FAQPage'));
const ContactPage = lazy(() => import('../features/venues/pages/ContactPage'));
const VenuesListPage = lazy(() => import('../features/venues/pages/VenuesListPage'));
const VenueDetailPage = lazy(() => import('../features/venues/pages/VenueDetailPage'));

// Auth
const CustomerLoginPage = lazy(() => import('../features/auth/pages/CustomerLoginPage'));
const AdminLoginPage = lazy(() => import('../features/auth/pages/AdminLoginPage'));
const ForgotPasswordPage = lazy(() => import('../features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../features/auth/pages/ResetPasswordPage'));

// Customer Dashboard
const CustomerDashboardPage = lazy(() => import('../features/auth/pages/CustomerDashboardPage'));
const MyBookingsPage = lazy(() => import('../features/bookings/pages/MyBookingsPage'));
const BookingDetailPage = lazy(() => import('../features/bookings/pages/BookingDetailPage'));
const BookingWizardPage = lazy(() => import('../features/bookings/pages/BookingWizardPage'));
const MyReviewsPage = lazy(() => import('../features/reviews/pages/MyReviewsPage'));
const FavoritesPage = lazy(() => import('../features/venues/pages/FavoritesPage'));
const CustomerNotificationsPage = lazy(() => import('../features/notifications/pages/CustomerNotificationsPage'));
const CustomerProfilePage = lazy(() => import('../features/auth/pages/CustomerProfilePage'));
const PaymentMethodsPage = lazy(() => import('../features/bookings/pages/PaymentMethodsPage'));

// Staff Dashboard
const StaffDashboardPage = lazy(() => import('../features/staff/pages/StaffDashboardPage'));
const StaffTodaySchedulePage = lazy(() => import('../features/bookings/pages/StaffTodaySchedulePage'));
const StaffManageBookingsPage = lazy(() => import('../features/bookings/pages/StaffManageBookingsPage'));
const StaffWalkInBookingPage = lazy(() => import('../features/bookings/pages/StaffWalkInBookingPage'));
const StaffSlotOverridePage = lazy(() => import('../features/slots/pages/StaffSlotOverridePage'));
const CustomerLookupPage = lazy(() => import('../features/staff/pages/CustomerLookupPage'));
const StaffNotificationsPage = lazy(() => import('../features/notifications/pages/StaffNotificationsPage'));

// Admin Dashboard
import SetupGuard from './SetupGuard';
const AdminReportsPage = lazy(() => import('../features/reports/pages/AdminReportsPage'));
const AdminVenuesPage = lazy(() => import('../features/venues/pages/AdminVenuesPage'));
const VenueFormPage = lazy(() => import('../features/venues/pages/VenueFormPage'));
const AdminCourtsPage = lazy(() => import('../features/courts/pages/AdminCourtsPage'));
const CourtFormPage = lazy(() => import('../features/courts/pages/CourtFormPage'));
const AdminAllBookingsPage = lazy(() => import('../features/bookings/pages/AdminAllBookingsPage'));
const BookingDetailAdminPage = lazy(() => import('../features/bookings/pages/BookingDetailAdminPage'));
const AdminReviewsPage = lazy(() => import('../features/reviews/pages/AdminReviewsPage'));
const AdminCouponsPage = lazy(() => import('../features/coupons/pages/AdminCouponsPage'));
const CouponFormPage = lazy(() => import('../features/coupons/pages/CouponFormPage'));
const CustomersPage = lazy(() => import('../features/staff/pages/CustomersPage'));
const CustomerDetailPage = lazy(() => import('../features/staff/pages/CustomerDetailPage'));
const StaffManagementPage = lazy(() => import('../features/staff/pages/StaffManagementPage'));
const PaymentsPage = lazy(() => import('../features/bookings/pages/PaymentsPage'));
const AdminSettingsPage = lazy(() => import('../features/auth/pages/AdminSettingsPage'));
const AdminNotificationsPage = lazy(() => import('../features/notifications/pages/AdminNotificationsPage'));
const InitialSetupWizardPage = lazy(() => import('../features/auth/pages/InitialSetupWizardPage'));
const AdminVenueDetailPage = lazy(() => import('../features/venues/pages/AdminVenueDetailPage'));
const RolesPermissionsPage = lazy(() => import('../features/auth/pages/RolesPermissionsPage'));
const AuditLogsPage = lazy(() => import('../features/auth/pages/AuditLogsPage'));

// Error Pages
const NotFoundPage = lazy(() => import('../features/auth/pages/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('../features/auth/pages/UnauthorizedPage'));
const ServerErrorPage = lazy(() => import('../features/auth/pages/ServerErrorPage'));

export const AppRouter = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Website Flow */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="faq" element={<FAQPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="venues" element={<VenuesListPage />} />
            <Route path="venues/:venueId" element={<VenueDetailPage />} />
            <Route path="book" element={<BookingWizardPage />} />
          </Route>

          {/* Authentication Flow (wrapped in AuthLayout) */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<CustomerLoginPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Setup / Onboarding Wizard Flow */}
          <Route path="/setup" element={
            <PrivateRoute>
              <InitialSetupWizardPage />
            </PrivateRoute>
          } />

          {/* Customer Dashboard Portal */}
          <Route
            path="/dashboard/customer"
            element={
              <PrivateRoute>
                <RoleGuard requiredPermission={Permissions.VIEW_CUSTOMER_DASHBOARD}>
                  <DashboardLayout />
                </RoleGuard>
              </PrivateRoute>
            }
          >
            <Route index element={<CustomerDashboardPage />} />
            <Route path="bookings" element={<MyBookingsPage />} />
            <Route path="bookings/:bookingId" element={<BookingDetailPage />} />
            <Route path="book" element={<Navigate to="/book" replace />} />
            <Route path="reviews" element={<MyReviewsPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="notifications" element={<CustomerNotificationsPage />} />
            <Route path="profile" element={<CustomerProfilePage />} />
            <Route path="payments" element={<PaymentMethodsPage />} />
          </Route>

          {/* Staff Dashboard Portal */}
          <Route
            path="/dashboard/staff"
            element={
              <PrivateRoute>
                <RoleGuard requiredPermission={Permissions.VIEW_STAFF_DASHBOARD}>
                  <DashboardLayout />
                </RoleGuard>
              </PrivateRoute>
            }
          >
            <Route index element={<StaffDashboardPage />} />
            <Route path="schedule" element={<StaffTodaySchedulePage />} />
            <Route path="bookings" element={<StaffManageBookingsPage />} />
            <Route path="walk-in" element={<StaffWalkInBookingPage />} />
            <Route path="slots" element={<StaffSlotOverridePage />} />
            <Route path="lookup" element={<CustomerLookupPage />} />
            <Route path="notifications" element={<StaffNotificationsPage />} />
          </Route>

          {/* Admin Dashboard Portal (wrapped in SetupGuard) */}
          <Route
            path="/dashboard/admin"
            element={
              <PrivateRoute>
                <RoleGuard requiredPermission={Permissions.VIEW_ADMIN_DASHBOARD}>
                  <SetupGuard>
                    <DashboardLayout />
                  </SetupGuard>
                </RoleGuard>
              </PrivateRoute>
            }
          >
            <Route index element={<AdminReportsPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="venues" element={<AdminVenuesPage />} />
            <Route path="venues/:venueId" element={<AdminVenueDetailPage />} />
            <Route path="venues/form" element={<VenueFormPage />} />
            <Route path="venues/form/:venueId" element={<VenueFormPage />} />
            <Route path="venues/new" element={<VenueFormPage />} />
            <Route path="venues/edit/:venueId" element={<VenueFormPage />} />
            <Route path="courts" element={<AdminCourtsPage />} />
            <Route path="courts/form" element={<CourtFormPage />} />
            <Route path="courts/form/:courtId" element={<CourtFormPage />} />
            <Route path="slots" element={<StaffSlotOverridePage />} />
            <Route path="bookings" element={<AdminAllBookingsPage />} />
            <Route path="bookings/:bookingId" element={<BookingDetailAdminPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="coupons" element={<AdminCouponsPage />} />
            <Route path="coupons/form" element={<CouponFormPage />} />
            <Route path="coupons/form/:couponId" element={<CouponFormPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="customers/:customerId" element={<CustomerDetailPage />} />
            <Route path="staff" element={<StaffManagementPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="permissions" element={<RolesPermissionsPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
          </Route>

          {/* Error & Fallback Paths */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/server-error" element={<ServerErrorPage />} />
          <Route path="404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;
