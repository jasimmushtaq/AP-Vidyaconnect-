// ============================================================================
// AP VIDYACONNECT — STRICT ROLE-BASED DASHBOARD ROUTER
// Dynamically routes users exclusively to their authorized role dashboard
// ============================================================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { InstitutionDashboard } from './InstitutionDashboard';
import { CompanyDashboard } from './CompanyDashboard';
import { StudentDashboard } from './StudentDashboard';
import { SuperAdminDashboard } from './SuperAdminDashboard';

export const DashboardRouter: React.FC = () => {
  const { currentRole, isAuthenticated, isLoading, currentUser } = useAuth();

  // 1. Safe loading state while checking session and verifying role
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-[#0E2350] border-t-[#F07421] rounded-full animate-spin" />
        <p className="text-xs font-bold text-[#0E2350] tracking-wide">
          Verifying security credentials & institutional role...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated check
  if (!isAuthenticated || !currentUser || !currentRole) {
    return <Navigate to="/login" replace />;
  }

  // 3. Strict role resolution - each role opens strictly their own dashboard
  switch (currentRole) {
    case 'institution_admin':
    case 'faculty_coordinator':
      return <InstitutionDashboard />;

    case 'company_admin':
    case 'mentor':
      return <CompanyDashboard />;

    case 'student':
      return <StudentDashboard />;

    case 'super_admin':
      return <SuperAdminDashboard />;

    default:
      // Never fall back to student dashboard if role is unknown or invalid
      console.warn('[DashboardRouter] Unknown or unverified user role:', currentRole);
      return <Navigate to="/login" replace />;
  }
};
