// ============================================================================
// AP VIDYACONNECT — MAIN ROUTING APPLICATION
// ============================================================================

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import { NotificationProvider } from './context/NotificationContext';
import { NotificationToaster } from './components/notifications/NotificationToaster';
import { PublicLayout } from './components/layout/PublicLayout';
import { AppLayout } from './components/layout/AppLayout';

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
import { VidyaConnectChatbot } from './components/common/VidyaConnectChatbot';

export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ModalProvider>
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
                <Route path="/dashboard" element={<DashboardRouter />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/institution-profile" element={<ProfilePage />} />
                <Route path="/institution/faculty" element={<Navigate to="/students" replace />} />
                <Route path="/faculty" element={<Navigate to="/students" replace />} />
                <Route path="/company/mentors" element={<Navigate to="/company/postings" replace />} />
                <Route path="/mentors" element={<Navigate to="/company/postings" replace />} />
                <Route path="/company-profile" element={<ProfilePage />} />
                <Route path="/company/postings" element={<CompanyPostingsPage />} />
                <Route path="/opportunities/new" element={<CompanyPostingsPage />} />
                <Route path="/mous" element={<MoUListPage />} />
                <Route path="/mous/new" element={<CreateMoUPage />} />
                <Route path="/mous/:id" element={<MoUDetailPage />} />
                <Route path="/company/mous" element={<Navigate to="/mous" replace />} />
                <Route path="/institution/mous" element={<Navigate to="/mous" replace />} />
                <Route path="/proposals" element={<ProposalsListPage />} />
                <Route path="/proposals/decisions" element={<ProposalDecisionsPage />} />
                <Route path="/proposals/new" element={<ProposalBuilderPage />} />
                <Route path="/proposals/:id" element={<ProposalDetailPage />} />
                <Route path="/batches" element={<BatchesListPage />} />
                <Route path="/batches/:id" element={<BatchDetailPage />} />
                <Route path="/batches/:id/attendance-settings" element={<BatchAttendanceSettingsPage />} />
                <Route path="/company/batches/:id/attendance-settings" element={<BatchAttendanceSettingsPage />} />
                <Route path="/students" element={<StudentManagementPage />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/tasks" element={<Navigate to="/dashboard" replace />} />
                <Route path="/evaluations" element={<EvaluationsPage />} />
                <Route path="/certificates" element={<Navigate to="/dashboard" replace />} />
                <Route path="/my-internship" element={<DashboardRouter />} />
                <Route path="/my-internships" element={<StudentMyInternshipsPage />} />
                <Route path="/student/internships" element={<StudentMyInternshipsPage />} />
                <Route path="/reports" element={<DashboardRouter />} />
                <Route path="/admin/verifications" element={<EntityVerificationsPage />} />
                <Route path="/admin/register-partner" element={<RegisterPartnerPage />} />
                <Route path="/admin/institutions" element={<InstitutionsDirectoryPage />} />
                <Route path="/admin/companies" element={<CompaniesDirectoryPage />} />
                <Route path="/admin/banners" element={<PromotionBannersPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
              </Route>

              {/* Catch-all redirect to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Global AP VidyaConnect AI Assistant & Interactive Website Guide */}
            <VidyaConnectChatbot />
          </BrowserRouter>
        </ModalProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
