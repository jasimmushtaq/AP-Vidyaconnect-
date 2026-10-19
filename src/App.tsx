// ============================================================================
// AP VIDYACONNECT — MAIN ROUTING APPLICATION
// ============================================================================

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import { NotificationProvider } from './context/NotificationContext';
import { NotificationToaster } from './components/notifications/NotificationToaster';
import { PublicLayout } from './components/layout/PublicLayout';
import { AppLayout } from './components/layout/AppLayout';
import { AppSplashScreen } from './components/common/AppSplashScreen';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { ForInstitutionsPage } from './pages/public/ForInstitutionsPage';
import { ForCompaniesPage } from './pages/public/ForCompaniesPage';
import { ForStudentsPage } from './pages/public/ForStudentsPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { OpportunitiesPage } from './pages/public/OpportunitiesPage';
import { AboutUsPage } from './pages/public/AboutUsPage';
import { TermsConditionsPage } from './pages/public/TermsConditionsPage';
import { PrivacyPolicyPage } from './pages/public/PrivacyPolicyPage';
import { FaqsPage } from './pages/public/FaqsPage';
import { PartnersPage } from './pages/public/PartnersPage';
import { ContactUsPage } from './pages/public/ContactUsPage';
import { InstitutionalNetworkPage } from './pages/public/InstitutionalNetworkPage';
import { PublicCompanyProfilePage } from './pages/public/PublicCompanyProfilePage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { LoginPage } from './pages/auth/LoginPage';
import { ChangePasswordPage } from './pages/auth/ChangePasswordPage';
import { ProfilePage } from './pages/profile/ProfilePage';

// Portal & Core Workflow Pages
import { DashboardRouter } from './pages/dashboard/DashboardRouter';
import { ProposalsListPage } from './pages/proposals/ProposalsListPage';
import { ProposalBuilderPage } from './pages/proposals/ProposalBuilderPage';
import { ProposalDetailPage } from './pages/proposals/ProposalDetailPage';
import { ProposalDecisionsPage } from './pages/proposals/ProposalDecisionsPage';
import { BatchesListPage } from './pages/batches/BatchesListPage';
import { BatchDetailPage } from './pages/batches/BatchDetailPage';
import { StudentManagementPage } from './pages/students/StudentManagementPage';
import { StudentMyInternshipsPage } from './pages/students/StudentMyInternshipsPage';
import { AttendancePage } from './pages/attendance/AttendancePage';
import { EvaluationsPage } from './pages/evaluations/EvaluationsPage';
import { EntityVerificationsPage } from './pages/admin/EntityVerificationsPage';
import { RegisterPartnerPage } from './pages/admin/RegisterPartnerPage';
import { InstitutionsDirectoryPage } from './pages/admin/InstitutionsDirectoryPage';
import { CompaniesDirectoryPage } from './pages/admin/CompaniesDirectoryPage';
import { PromotionBannersPage } from './pages/admin/PromotionBannersPage';
import { CompanyPostingsPage } from './pages/company/CompanyPostingsPage';
import { BatchAttendanceSettingsPage } from './pages/company/BatchAttendanceSettingsPage';
import { MoUListPage } from './pages/mou/MoUListPage';
import { CreateMoUPage } from './pages/mou/CreateMoUPage';
import { MoUDetailPage } from './pages/mou/MoUDetailPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { RoleGuard } from './components/auth/RoleGuard';
import { SuperAdminDashboard } from './pages/dashboard/SuperAdminDashboard';
import { CompanyDashboard } from './pages/dashboard/CompanyDashboard';
import { InstitutionDashboard } from './pages/dashboard/InstitutionDashboard';
import { StudentDashboard } from './pages/dashboard/StudentDashboard';
import { VidyaConnectChatbot } from './components/common/VidyaConnectChatbot';

export function App() {
  // Check if running in mobile APK environment (Android / iOS / Capacitor / testing param)
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const isApk =
      Capacitor.isNativePlatform() ||
      Capacitor.getPlatform() === 'android' ||
      Capacitor.getPlatform() === 'ios' ||
      !!(window as any).Capacitor?.isNativePlatform?.() ||
      document.documentElement.classList.contains('plt-mobile') ||
      document.documentElement.classList.contains('plt-capacitor') ||
      /platform=apk|splash|show_splash/i.test(window.location.search);
    return isApk;
  });

  const [isSplashComplete, setIsSplashComplete] = useState<boolean>(() => !showSplash);
  const [isAppVisible, setIsAppVisible] = useState<boolean>(() => !showSplash);

  // Global event listener to replay splash animation on demand (e.g., from dev tools or chatbot)
  useEffect(() => {
    const handleReplay = () => {
      setShowSplash(true);
      setIsSplashComplete(false);
      setIsAppVisible(false);
    };

    window.addEventListener('replay-ap-splash', handleReplay);
    (window as any).replayApkSplash = handleReplay;

    return () => {
      window.removeEventListener('replay-ap-splash', handleReplay);
      delete (window as any).replayApkSplash;
    };
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <ModalProvider>
          {/* Mobile APK Animated Launch Splash Screen */}
          {showSplash && !isSplashComplete && (
            <AppSplashScreen
              onStartExit={() => {
                setIsAppVisible(true);
              }}
              onComplete={() => {
                setIsSplashComplete(true);
                setShowSplash(false);
                setIsAppVisible(true);
              }}
            />
          )}

          {/* Main App Content - Hidden while APK launch animation runs */}
          <div
            id="ap-vidyaconnect-app-shell"
            className={`min-h-screen transition-opacity duration-500 ease-out ${
              isAppVisible
                ? 'opacity-100 pointer-events-auto visible'
                : 'opacity-0 pointer-events-none invisible'
            }`}
          >
            <BrowserRouter>
              {/* Global Realtime Floating Toaster */}
              <NotificationToaster />
            <Routes>
              {/* Public Portal Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutUsPage />} />
                <Route path="/for-institutions" element={<ForInstitutionsPage />} />
                <Route path="/for-companies" element={<ForCompaniesPage />} />
                <Route path="/for-students" element={<ForStudentsPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/partners" element={<PartnersPage />} />
                <Route path="/partners/:id" element={<PublicCompanyProfilePage />} />
                <Route path="/company/:id" element={<PublicCompanyProfilePage />} />
                <Route path="/institutions" element={<InstitutionalNetworkPage />} />
                <Route path="/institutional-network" element={<Navigate to="/institutions" replace />} />
                <Route path="/opportunities" element={<OpportunitiesPage />} />
                <Route path="/contact" element={<ContactUsPage />} />
                <Route path="/contact-us" element={<Navigate to="/contact" replace />} />
                <Route path="/faqs" element={<FaqsPage />} />
                <Route path="/terms" element={<TermsConditionsPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/change-password" element={<ChangePasswordPage />} />
              </Route>

              {/* Authenticated Workspace & Workflow Routes */}
              <Route element={<AppLayout />}>
                {/* Unified Role-Aware Dashboard Route */}
                <Route path="/dashboard" element={<DashboardRouter />} />

                {/* Explicit Role Dashboard Routes (Protected) */}
                <Route path="/admin/dashboard" element={<RoleGuard allowedRoles={['super_admin']}><SuperAdminDashboard /></RoleGuard>} />
                <Route path="/company/dashboard" element={<RoleGuard allowedRoles={['company_admin', 'mentor', 'super_admin']}><CompanyDashboard /></RoleGuard>} />
                <Route path="/institution/dashboard" element={<RoleGuard allowedRoles={['institution_admin', 'faculty_coordinator', 'super_admin']}><InstitutionDashboard /></RoleGuard>} />
                <Route path="/student/dashboard" element={<RoleGuard allowedRoles={['student', 'super_admin']}><StudentDashboard /></RoleGuard>} />

                {/* General Profile & Settings */}
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/institution-profile" element={<ProfilePage />} />
                <Route path="/institution/faculty" element={<Navigate to="/students" replace />} />
                <Route path="/faculty" element={<Navigate to="/students" replace />} />
                <Route path="/company/mentors" element={<Navigate to="/company/postings" replace />} />
                <Route path="/mentors" element={<Navigate to="/company/postings" replace />} />
                <Route path="/company-profile" element={<ProfilePage />} />

                {/* Company Only Routes */}
                <Route path="/company/postings" element={<RoleGuard allowedRoles={['company_admin', 'mentor', 'super_admin']}><CompanyPostingsPage /></RoleGuard>} />
                <Route path="/opportunities/new" element={<RoleGuard allowedRoles={['company_admin', 'mentor', 'super_admin']}><CompanyPostingsPage /></RoleGuard>} />
                <Route path="/batches/:id/attendance-settings" element={<RoleGuard allowedRoles={['company_admin', 'mentor', 'super_admin']}><BatchAttendanceSettingsPage /></RoleGuard>} />
                <Route path="/company/batches/:id/attendance-settings" element={<RoleGuard allowedRoles={['company_admin', 'mentor', 'super_admin']}><BatchAttendanceSettingsPage /></RoleGuard>} />

                {/* MoUs & Inbound Proposals (Accessible to Institutional and Corporate Admins) */}
                <Route path="/mous" element={<MoUListPage />} />
                <Route path="/mous/new" element={<RoleGuard allowedRoles={['institution_admin', 'company_admin', 'super_admin']}><CreateMoUPage /></RoleGuard>} />
                <Route path="/mous/:id" element={<MoUDetailPage />} />
                <Route path="/company/mous" element={<Navigate to="/mous" replace />} />
                <Route path="/institution/mous" element={<Navigate to="/mous" replace />} />
                <Route path="/proposals" element={<ProposalsListPage />} />
                <Route path="/proposals/decisions" element={<RoleGuard allowedRoles={['institution_admin', 'company_admin', 'super_admin']}><ProposalDecisionsPage /></RoleGuard>} />
                <Route path="/proposals/new" element={<RoleGuard allowedRoles={['institution_admin', 'super_admin']}><ProposalBuilderPage /></RoleGuard>} />
                <Route path="/proposals/:id" element={<ProposalDetailPage />} />
                <Route path="/batches" element={<BatchesListPage />} />
                <Route path="/batches/:id" element={<BatchDetailPage />} />

                {/* Institution Student Management */}
                <Route path="/students" element={<RoleGuard allowedRoles={['institution_admin', 'faculty_coordinator', 'super_admin']}><StudentManagementPage /></RoleGuard>} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/tasks" element={<Navigate to="/dashboard" replace />} />
                <Route path="/evaluations" element={<EvaluationsPage />} />
                <Route path="/certificates" element={<Navigate to="/dashboard" replace />} />

                {/* Student Dedicated Routes */}
                <Route path="/my-internship" element={<RoleGuard allowedRoles={['student', 'super_admin']}><DashboardRouter /></RoleGuard>} />
                <Route path="/my-internships" element={<RoleGuard allowedRoles={['student', 'super_admin']}><StudentMyInternshipsPage /></RoleGuard>} />
                <Route path="/student/internships" element={<RoleGuard allowedRoles={['student', 'super_admin']}><StudentMyInternshipsPage /></RoleGuard>} />
                <Route path="/reports" element={<DashboardRouter />} />

                {/* Super Admin Restricted Routes */}
                <Route path="/admin/verifications" element={<RoleGuard allowedRoles={['super_admin']}><EntityVerificationsPage /></RoleGuard>} />
                <Route path="/admin/register-partner" element={<RoleGuard allowedRoles={['super_admin']}><RegisterPartnerPage /></RoleGuard>} />
                <Route path="/admin/institutions" element={<RoleGuard allowedRoles={['super_admin']}><InstitutionsDirectoryPage /></RoleGuard>} />
                <Route path="/admin/companies" element={<RoleGuard allowedRoles={['super_admin']}><CompaniesDirectoryPage /></RoleGuard>} />
                <Route path="/admin/banners" element={<RoleGuard allowedRoles={['super_admin']}><PromotionBannersPage /></RoleGuard>} />
                <Route path="/notifications" element={<NotificationsPage />} />
              </Route>

              {/* Catch-all redirect to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Global AP VidyaConnect AI Assistant & Interactive Website Guide */}
            <VidyaConnectChatbot />
          </BrowserRouter>
        </div>
        </ModalProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
