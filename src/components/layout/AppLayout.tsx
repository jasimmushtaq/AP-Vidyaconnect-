import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { GovernmentTechBackground } from '../common/GovernmentTechBackground';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { Clock, ShieldAlert, LogOut, PhoneCall, CheckCircle2, AlertCircle } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { isAuthenticated, currentUser, currentInstitution, currentCompany, currentRole, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if current user is an institution or company pending verification
  const isInstitutionUnderReview =
    (currentRole === 'institution_admin' || currentRole === 'faculty_coordinator') &&
    currentInstitution &&
    currentInstitution.verification_status !== 'verified';

  const isCompanyUnderReview =
    (currentRole === 'company_admin' || currentRole === 'mentor') &&
    currentCompany &&
    currentCompany.verification_status !== 'verified';

  if (isInstitutionUnderReview || isCompanyUnderReview) {
    const isRejected =
      (isInstitutionUnderReview && currentInstitution?.verification_status === 'rejected') ||
      (isCompanyUnderReview && currentCompany?.verification_status === 'rejected');

    const entityName = isInstitutionUnderReview ? currentInstitution?.name : currentCompany?.name;
    const entityCode = isInstitutionUnderReview ? currentInstitution?.code : currentCompany?.cin;
    const entityTypeLabel = isInstitutionUnderReview ? 'Higher Education Institution' : 'Industry Partner';
    const notes = isInstitutionUnderReview ? currentInstitution?.verification_notes : currentCompany?.verification_notes;

    return (
      <div className="min-h-screen relative flex flex-col font-sans bg-[#F8FAFC]">
        <GovernmentTechBackground />

        {/* Top Government Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs relative z-10">
          <BrandLogo variant="lockup" size={160} />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">{currentUser?.full_name}</p>
              <p className="text-[10px] text-slate-500">{currentUser?.email}</p>
            </div>
            <button
              onClick={() => logout()}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Pending Verification Body */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
          <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                isRejected ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {isRejected ? <AlertCircle className="w-9 h-9" /> : <Clock className="w-9 h-9" />}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                    isRejected ? 'bg-rose-50 text-rose-800 border border-rose-300' : 'bg-amber-50 text-amber-800 border border-amber-300'
                  }`}>
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {isRejected ? 'Registration Application Rejected' : 'Under State Super Admin Verification'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono font-bold">
                    {entityCode}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#0E2350]">
                  {entityName}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {entityTypeLabel} • Registered by {currentUser?.full_name} ({currentUser?.email})
                </p>
              </div>
            </div>

            {/* Audit Status Steps */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-[#0E2350] uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Live State Credential Audit Progress
              </h3>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Registration Dossier & Compliance Documents Submitted</p>
                    <p className="text-[11px] text-slate-500">Statutory credentials and certificates successfully uploaded to the state vault.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isRejected ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700 animate-pulse'
                  }`}>
                    {isRejected ? '✗' : '2'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      State Super Admin Document Verification & AISHE/CIN Audit
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {isRejected
                        ? `Audit Failed: ${notes || 'Statutory documentation rejected by nodal desk.'}`
                        : 'Desk of Dr. Varun Surya, IAS (State Super Admin) is actively auditing your affiliation certificates.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center shrink-0 text-xs font-bold">
                    3
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400">Portal Authorization & Multi-Batch Provisioning</p>
                    <p className="text-[11px] text-slate-400">Batches, proposals, and student cohort management unlock automatically upon approval.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Helpdesk Notice */}
            <div className="bg-[#FFF3EA] border border-[#F07421]/30 p-4 rounded-xl text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-[#F07421] font-bold">
                <PhoneCall className="w-4 h-4" />
                Need expedited clearance or assistance?
              </div>
              <p className="text-slate-700 leading-relaxed">
                Contact the Andhra Pradesh State Council of Higher Education (APSCHE) Nodal Desk at{' '}
                <strong className="text-slate-900">1800-425-0012</strong> or email{' '}
                <strong className="text-slate-900">nodal-support@apsche.ap.gov.in</strong> quoting reference{' '}
                <strong className="font-mono text-[#0E2350]">{entityCode}</strong>.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => logout()}
                className="px-6 py-2.5 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-xl text-xs font-bold shadow transition-all flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out from Session
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col font-sans print:min-h-0 print:bg-white">
      {/* AICTE & AP Institutional Government-Tech Background */}
      <div className="print:hidden">
        <GovernmentTechBackground />
      </div>

      <div className="flex-1 flex print:block">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block print:hidden">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden print:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative z-10 w-72">
              <Sidebar />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 print:block">
          <div className="print:hidden">
            <Header onMenuToggle={() => setMobileSidebarOpen(true)} />
          </div>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto print:p-0 print:m-0 print:max-w-none print:w-full">
            {/* Page Router Outlet */}
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
