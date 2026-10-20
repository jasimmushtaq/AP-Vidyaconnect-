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

  const isRejected =
    (isInstitutionUnderReview && currentInstitution?.verification_status === 'rejected') ||
    (isCompanyUnderReview && currentCompany?.verification_status === 'rejected');

  if (isRejected) {
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

        {/* Rejection Body */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
          <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner bg-rose-100 text-rose-700">
                <AlertCircle className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-300">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Registration Application Rejected
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

            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 space-y-2 text-xs text-rose-800">
              <p className="font-bold">Audit Decision Notes:</p>
              <p>{notes || 'Statutory documentation rejected by State Nodal Desk.'}</p>
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
    <div className="h-screen flex flex-col font-sans overflow-hidden print:h-auto print:overflow-visible print:bg-white relative">
      {/* AICTE & AP Institutional Government-Tech Background */}
      <div className="print:hidden">
        <GovernmentTechBackground />
      </div>

      <div className="flex-1 flex overflow-hidden print:block print:overflow-visible relative z-10">
        {/* Desktop Sidebar - Fixed in Position */}
        <div className="hidden lg:block print:hidden shrink-0 h-full">
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
            <div className="relative z-10 w-72 h-full flex flex-col">
              <Sidebar onMobileClose={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area - Scrolls independently while sidebar stays fixed */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto print:h-auto print:overflow-visible">
          <div className="print:hidden sticky top-0 z-30 shrink-0">
            <Header onMenuToggle={() => setMobileSidebarOpen(true)} />
          </div>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto print:p-0 print:m-0 print:max-w-none print:w-full">
            {/* Inline Verification Status Banner for Pending Audits */}
            {(isInstitutionUnderReview || isCompanyUnderReview) && (
              <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-inner">
                    <Clock className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs uppercase tracking-wider text-amber-800">
                        State Super Admin Credential Audit Pending
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-mono font-bold">
                        {isInstitutionUnderReview ? currentInstitution?.code : currentCompany?.cin}
                      </span>
                    </div>
                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                      Registration submitted for <strong>{isInstitutionUnderReview ? currentInstitution?.name : currentCompany?.name}</strong>. Desk of Dr. Varun Surya, IAS (State Super Admin) is reviewing statutory accreditation documents. You have full access to your {currentRole === 'company_admin' ? 'Company Dashboard' : 'Institution Dashboard'}.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Page Router Outlet */}
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
