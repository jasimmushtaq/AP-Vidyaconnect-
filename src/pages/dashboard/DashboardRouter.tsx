// ============================================================================
// AP VIDYACONNECT — DASHBOARD ROUTER
// ============================================================================

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { InstitutionDashboard } from './InstitutionDashboard';
import { CompanyDashboard } from './CompanyDashboard';
import { StudentDashboard } from './StudentDashboard';
import { SuperAdminDashboard } from './SuperAdminDashboard';

export const DashboardRouter: React.FC = () => {
  const { currentRole } = useAuth();

  switch (currentRole) {
    case 'institution_admin':
    case 'faculty_coordinator':
      return <InstitutionDashboard />;

    case 'company_admin':
      return <CompanyDashboard />;

    case 'student':
      return <StudentDashboard />;

    case 'super_admin':
    default:
      return <SuperAdminDashboard />;
  }
};
