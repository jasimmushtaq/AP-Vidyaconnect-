// ============================================================================
// AP VIDYACONNECT — WORKFLOW TIMELINE COMPONENT
// Visual 10-step state machine tracker with brand node colors & filled ticks
// ============================================================================

import React from 'react';
import { ProposalStatus, BatchStatus } from '../../types/database';
import { Check, Clock, AlertCircle, Sparkles } from 'lucide-react';

export interface WorkflowTimelineProps {
  currentStatus: ProposalStatus | BatchStatus | string;
  className?: string;
  isCompact?: boolean;
  forceAllCompleted?: boolean;
  interactive?: boolean;
  onStepClick?: (stepIndex: number) => void;
  selectedStepIndex?: number;
}

export interface WorkflowStep {
  id: string;
  title: string;
  subtitle: string;
  stageName: string;
  actor: string;
  matches: string[];
}

export const CANONICAL_10_STEPS: WorkflowStep[] = [
  { id: '1', title: 'Drafting', subtitle: 'Institution prepares proposal', stageName: 'draft', actor: 'College Coordinator', matches: ['draft'] },
  { id: '2', title: 'Submitted', subtitle: 'Sent to company partner', stageName: 'submitted', actor: 'Principal Desk', matches: ['submitted'] },
  { id: '3', title: 'Company Review', subtitle: 'Company inspecting terms', stageName: 'under_company_review', actor: 'HR Lead / Tech Mentor', matches: ['under_company_review', 'modification_requested'] },
  { id: '4', title: 'Company Decision', subtitle: 'Terms accepted / amended', stageName: 'company_accepted', actor: 'Company Admin', matches: ['company_accepted', 'company_accepted_with_changes'] },
  { id: '5', title: 'Institution Accepted', subtitle: 'Batch auto-generated (KD-)', stageName: 'institution_accepted', actor: 'College Nodal Officer', matches: ['institution_accepted', 'created'] },
  { id: '6', title: 'Student Consent', subtitle: 'JOIN INTERNSHIP confirmed', stageName: 'students_confirmed', actor: 'Enrolled Students', matches: ['students_confirmed'] },
  { id: '7', title: 'Active Internship', subtitle: 'Attendance & daily ops', stageName: 'active', actor: 'Corporate Mentors', matches: ['active'] },
  { id: '8', title: 'Milestone Review', subtitle: 'Weekly attendance & sync', stageName: 'milestones_verified', actor: 'Faculty Supervisor', matches: ['milestones_verified', 'progress_reviewed'] },
  { id: '9', title: 'Evaluation Done', subtitle: 'Final score & appraisals', stageName: 'evaluation_completed', actor: 'Industry Evaluator', matches: ['evaluation_completed'] },
  { id: '10', title: 'Batch Completed', subtitle: 'Academic credits synced', stageName: 'completed', actor: 'Host Company & College', matches: ['completed', 'archived'] },
];

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({
  currentStatus,
  className = '',
  isCompact = false,
  forceAllCompleted = false,
  interactive = false,
  onStepClick,
  selectedStepIndex
}) => {
  const getActiveStepIndex = () => {
    if (forceAllCompleted || currentStatus === 'all_completed' || currentStatus === 'all_ticks') {
      return 10;
    }
    switch (currentStatus) {
      case 'draft': return 0;
      case 'submitted': return 1;
      case 'under_company_review':
      case 'modification_requested': return 2;
      case 'company_accepted':
      case 'company_accepted_with_changes': return 3;
      case 'institution_accepted':
      case 'created': return 4;
      case 'students_confirmed': return 5;
      case 'active': return 6;
      case 'milestones_verified':
      case 'progress_reviewed': return 7;
      case 'evaluation_completed': return 8;
      case 'completed':
      case 'archived': return 9;
      case 'rejected':
      case 'declined': return -1;
      default: return 9;
    }
  };

  const activeIndex = getActiveStepIndex();
  const isRejected = currentStatus === 'rejected' || currentStatus === 'declined';
  const totalSteps = CANONICAL_10_STEPS.length;

  // Calculate progress percentage for connector bar
  const progressPercent = forceAllCompleted || activeIndex >= totalSteps - 1
    ? 100
    : activeIndex < 0
    ? 0
    : (activeIndex / (totalSteps - 1)) * 100;

  return (
    <div className={`w-full overflow-x-auto py-4 ${className}`}>
      <div className="flex items-center min-w-[840px] justify-between relative px-2">
        {/* Continuous background track line */}
        <div className="absolute top-4 left-6 right-6 h-1.5 bg-gray-200 rounded-full -z-0" />

        {/* Dynamic filled progress track line */}
        <div
          className="absolute top-4 left-6 h-1.5 bg-gradient-to-r from-[#F07421] via-[#1C8A3C] to-[#16844A] rounded-full transition-all duration-700 -z-0 shadow-sm"
          style={{ width: `calc(${progressPercent}% * 0.95)` }}
        />

        {CANONICAL_10_STEPS.map((step, idx) => {
          const isPast = forceAllCompleted || activeIndex > idx || (activeIndex === 9 && idx === 9);
          const isCurrent = !forceAllCompleted && activeIndex === idx && activeIndex !== 9;
          const isSelected = selectedStepIndex === idx;

          let nodeBg = 'bg-white border-2 border-gray-300 text-gray-400';

          if (isPast) {
            // Saffron for early steps, rich Emerald for later/final
            if (idx >= 6) {
              nodeBg = 'bg-[#16844A] border-2 border-[#16844A] text-white shadow-md shadow-emerald-700/20';
            } else {
              nodeBg = 'bg-[#F07421] border-2 border-[#F07421] text-white shadow-md shadow-orange-500/20';
            }
          } else if (isCurrent) {
            nodeBg = 'bg-[#0E2350] border-3 border-[#EEF2FA] text-white ring-4 ring-[#0E2350]/20 animate-pulse shadow-md';
          }

          return (
            <div
              key={step.id}
              onClick={() => interactive && onStepClick && onStepClick(idx)}
              className={`flex flex-col items-center relative z-10 flex-1 px-1 transition-all ${
                interactive ? 'cursor-pointer hover:scale-105' : ''
              }`}
            >
              {/* Step circle node */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${nodeBg} ${
                  isSelected ? 'ring-4 ring-[#F07421] scale-110' : ''
                }`}
              >
                {isPast ? (
                  <Check className="w-4.5 h-4.5 stroke-[3] text-white" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <span className="text-xs font-bold">{idx + 1}</span>
                )}
              </div>

              {/* Title & subtitle */}
              <div className="text-center mt-2.5">
                <p
                  className={`text-xs font-black tracking-tight leading-tight ${
                    isSelected
                      ? 'text-[#F07421]'
                      : isPast
                      ? 'text-[#0E2350]'
                      : isCurrent
                      ? 'text-[#0E2350]'
                      : 'text-gray-400'
                  }`}
                >
                  {step.title}
                </p>
                {!isCompact && (
                  <p className="text-[10px] font-medium text-gray-500 max-w-[80px] truncate mt-0.5 leading-tight mx-auto">
                    {step.subtitle}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isRejected && (
        <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>This proposal workflow was terminated with status: <strong>{currentStatus.toUpperCase()}</strong></span>
        </div>
      )}
    </div>
  );
};
