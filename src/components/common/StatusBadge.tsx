// ============================================================================
// AP VIDYACONNECT — STATUS BADGE COMPONENT
// Semantic badges strictly separated from brand tricolor
// ============================================================================

import React from 'react';
import { ProposalStatus, BatchStatus, AttendanceStatus, VerificationStatus, TaskStatus } from '../../types/database';

interface StatusBadgeProps {
  status: ProposalStatus | BatchStatus | AttendanceStatus | VerificationStatus | TaskStatus | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className = '' }) => {
  const getStyle = () => {
    switch (status) {
      // Success states
      case 'verified':
      case 'company_accepted':
      case 'institution_accepted':
      case 'students_confirmed':
      case 'completed':
      case 'certificate_issued':
      case 'present':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';

      // Warning / Attention states
      case 'company_accepted_with_changes':
      case 'modification_requested':
      case 'under_company_review':
      case 'under_verification':
      case 'pending':
      case 'in_progress':
      case 'under_review':
      case 'half_day':
      case 'leave':
        return 'bg-amber-50 text-amber-800 border-amber-200';

      // Info / Active states
      case 'submitted':
      case 'created':
      case 'active':
        return 'bg-blue-50 text-blue-800 border-blue-200';

      // Danger / Rejection states
      case 'rejected':
      case 'declined':
      case 'absent':
        return 'bg-rose-50 text-rose-800 border-rose-200';

      // Neutral states
      case 'draft':
      case 'holiday':
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClass} ${getStyle()} font-semibold tracking-wide ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {formatText(status)}
    </span>
  );
};
