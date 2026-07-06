import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
import ScrollToTop from './components/common/ScrollToTop';

// Lazy loading pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const ArticlesPage = lazy(() => import('./pages/ArticlesPage'));
const ArticleDetailsPage = lazy(() => import('./pages/ArticleDetailsPage'));
const BookPage = lazy(() => import('./pages/BookPage'));
const NurseProfilePage = lazy(() => import('./pages/NurseProfilePage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ChangePasswordPage = lazy(() => import('./pages/ChangePasswordPage'));
const UrgentBookingPage = lazy(() => import('./pages/UrgentBookingPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));

// Lazy loading admin pages
const AdminRoute = lazy(() => import('./components/admin/AdminRoute'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const PendingNurses = lazy(() => import('./pages/admin/PendingNurses'));
const ActiveNurses = lazy(() => import('./pages/admin/ActiveNurses'));
const PatientsManagement = lazy(() => import('./pages/admin/PatientsManagement'));
const Bookings = lazy(() => import('./pages/admin/Bookings'));
const Financials = lazy(() => import('./pages/admin/Financials'));
const AdminManagement = lazy(() => import('./pages/admin/AdminManagement'));
const SystemSettings = lazy(() => import('./pages/admin/SystemSettings'));

function App() {
  return (
    <Router>
      <ScrollToTop />
      <ErrorBoundary>
        <Suspense fallback={
          <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        }>
          <Routes>
            {/* Main Public Routes with Header and Footer */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/articles" element={<ArticlesPage />} />
              <Route path="/articles/:id" element={<ArticleDetailsPage />} />
              <Route path="/book" element={<BookPage />} />
              <Route path="/nurse/:id" element={<NurseProfilePage />} />
              <Route path="/book-appointment/:id" element={<BookingPage />} />
              <Route path="/book-urgent" element={<UrgentBookingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/change-password" element={<ChangePasswordPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
            </Route>

            {/* Protected Admin Routes without Header/Footer */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="pending-nurses" element={<PendingNurses />} />
                <Route path="active-nurses" element={<ActiveNurses />} />
                <Route path="patients" element={<PatientsManagement />} />
                <Route path="bookings" element={<Bookings />} />
                <Route path="financials" element={<Financials />} />
                <Route path="manage-admins" element={<AdminManagement />} />
                <Route path="settings" element={<SystemSettings />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
