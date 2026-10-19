// ============================================================================
// AP VIDYACONNECT — ROLE-BASED ACCESS CONTROL (RBAC) ROUTE GUARD
// Strictly protects routes and dashboards based on verified database roles
// ============================================================================

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/database';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { currentRole, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 1. Show elegant loading state while restoring session from database
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

  // 2. Unauthenticated access: redirect directly to login
  if (!isAuthenticated || !currentRole) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Unauthorized role: redirect immediately to authorized role dashboard
  if (!allowedRoles.includes(currentRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
