// ============================================================================
// AP VIDYACONNECT — SLEEK HORIZONTAL MILESTONE WORKFLOW TIMELINE
// Minimalist, high-impact continuous gradient timeline with glowing nodes,
// all 7 colorful circular checkpoints, and clean modern typography.
// ============================================================================

import React, { useState } from 'react';
import {
  Check,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  School,
  FileCheck2,
  Users,
  BarChart3,
  GraduationCap
} from 'lucide-react';

interface MilestoneStep {
  id: string;
  stepNumber: number;
  label: string;
  subLabel: string;
  description: string;
  actor: string;
  nodeColor: string;
  lineGradient: string;
  glowColor: string;
  icon: React.ElementType;
}

const MILESTONES: MilestoneStep[] = [
  {
    id: 'step-1',
    stepNumber: 1,
    label: 'COLLEGE DRAFT',
    subLabel: 'Select Student Cohort',
    description: 'College placement cell selects eligible students, defines duration, and drafts proposal.',
    actor: 'College Placement Cell',
    nodeColor: 'bg-[#FF6B00]', // Vibrant Saffron / Orange
    lineGradient: 'from-[#FF6B00] to-[#8B5CF6]',
    glowColor: 'rgba(255, 107, 0, 0.35)',
    icon: School,
  },
  {
    id: 'step-2',
    stepNumber: 2,
    label: 'SUBMIT PROPOSAL',
    subLabel: 'Cryptographic Lock',
    description: 'Proposal payload is locked with state engine verification and dispatched to industry.',
    actor: 'State Engine',
    nodeColor: 'bg-[#8B5CF6]', // Vibrant Purple
    lineGradient: 'from-[#8B5CF6] to-[#06B6D4]',
    glowColor: 'rgba(139, 92, 246, 0.35)',
    icon: FileCheck2,
  },
  {
    id: 'step-3',
    stepNumber: 3,
    label: 'COMPANY MATCH',
    subLabel: 'Review & Allocate Seats',
    description: 'Corporate partner reviews cohort, provisions monthly stipend, and assigns technical leads.',
    actor: 'Industry Partner',
    nodeColor: 'bg-[#06B6D4]', // Vibrant Cyan
    lineGradient: 'from-[#06B6D4] to-[#EC4899]',
    glowColor: 'rgba(6, 182, 212, 0.35)',
    icon: Building2,
  },
  {
    id: 'step-4',
    stepNumber: 4,
    label: 'MUTUAL APPROVAL',
    subLabel: 'Generate Batch',
    description: 'Both parties digitally sign terms, auto-generating the official internship batch ID.',
    actor: 'Joint Consensus',
    nodeColor: 'bg-[#EC4899]', // Vibrant Pink
    lineGradient: 'from-[#EC4899] to-[#3B82F6]',
    glowColor: 'rgba(236, 72, 153, 0.35)',
    icon: ShieldCheck,
  },
  {
    id: 'step-5',
    stepNumber: 5,
    label: 'ACTIVE INTERNSHIP',
    subLabel: 'Attendance & Tasks',
    description: 'Students accept onboarding declaration, submit milestone deliverables, and log attendance.',
    actor: 'Students & Industry Partners',
    nodeColor: 'bg-[#3B82F6]', // Vibrant Royal Blue
    lineGradient: 'from-[#3B82F6] to-[#F59E0B]',
    glowColor: 'rgba(59, 130, 246, 0.35)',
    icon: Users,
  },
  {
    id: 'step-6',
    stepNumber: 6,
    label: 'EVALUATION',
    subLabel: 'Company Rubric Score',
    description: 'Comprehensive multi-criteria scoring across code quality, viva, and professionalism.',
    actor: 'Industry Evaluator',
    nodeColor: 'bg-[#F59E0B]', // Vibrant Amber / Gold
    lineGradient: 'from-[#F59E0B] to-[#10B981]',
    glowColor: 'rgba(245, 158, 11, 0.35)',
    icon: BarChart3,
  },
  {
    id: 'step-7',
    stepNumber: 7,
    label: 'ACADEMIC CREDITS',
    subLabel: 'State Credit Transfer',
    description: 'Internship completion finalized and academic credits synced to university records.',
    actor: 'University Placement Desk',
    nodeColor: 'bg-[#10B981]', // Vibrant Emerald / Green
    lineGradient: 'from-[#10B981] to-[#10B981]',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    icon: GraduationCap,
  },
];

export const CanonicalWorkflowShowcase: React.FC = () => {
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(3);
  const selectedStep = MILESTONES[selectedStepIndex];

  return (
    <div className="w-full relative select-none">
      {/* Soft Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-28 bg-gradient-to-r from-[#FF6B00]/10 via-[#8B5CF6]/10 to-[#10B981]/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto px-4 mb-4">
        <p className="text-[10.5px] font-extrabold uppercase tracking-widest text-gray-500 mb-0.5">
          CANONICAL TWO-SIDED AUDITABLE WORKFLOW
        </p>
        <h3 className="text-lg sm:text-2xl font-black text-[#0E2350] tracking-tight">
          How Andhra Pradesh Connects Education to Industry
        </h3>
      </div>

      {/* Modern Connected Stepper Bar Container (Same Width & Curved Endpoints as Promotional Banner) */}
      <div className="w-full">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-sm">
          {/* Horizontal Stepper Track */}
          <div className="relative py-4">
            {/* Multi-segment Full Colored Connecting Lines */}
            <div className="absolute top-8 left-[6%] right-[6%] h-[3.5px] -translate-y-1/2 z-0 hidden sm:flex">
              {MILESTONES.slice(0, -1).map((step, idx) => (
                <div
                  key={idx}
                  className={`flex-1 h-full bg-gradient-to-r ${step.lineGradient}`}
                />
              ))}
            </div>

            {/* Step Nodes */}
            <div className="grid grid-cols-2 sm:grid-cols-7 gap-y-6 gap-x-2 relative z-10">
              {MILESTONES.map((step, idx) => {
                const isSelected = selectedStepIndex === idx;

                return (
                  <div
                    key={step.id}
                    onClick={() => setSelectedStepIndex(idx)}
                    className="flex flex-col items-center text-center cursor-pointer group"
                  >
                    {/* Circle Node Disc */}
                    <div className="relative flex items-center justify-center mb-3">
                      {/* Selected step halo ring */}
                      {isSelected && (
                        <div className="absolute -inset-1.5 rounded-full ring-2 ring-[#0E2350] ring-offset-2 pointer-events-none animate-in fade-in" />
                      )}

                      <div
                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-white transition-all duration-300 shadow-md ${
                          step.nodeColor
                        } ${isSelected ? 'scale-115 shadow-lg' : 'hover:scale-110'}`}
                        style={{
                          boxShadow: `0 6px 18px ${step.glowColor}`,
                        }}
                      >
                        {idx === 6 ? (
                          <Award className="w-5 h-5 stroke-[2.5] text-white" />
                        ) : (
                          <Check className="w-5 h-5 stroke-[3] text-white" />
                        )}
                      </div>
                    </div>

                    {/* Step Label (Clean Bold Uppercase) */}
                    <span
                      className={`text-[11px] sm:text-xs font-black tracking-wider uppercase transition-colors ${
                        isSelected
                          ? 'text-[#0E2350]'
                          : 'text-gray-900 group-hover:text-[#0E2350]'
                      }`}
                    >
                      {step.label}
                    </span>

                    {/* Short Sublabel */}
                    <span className="text-[10px] text-gray-500 mt-0.5 font-medium max-w-[110px] leading-tight hidden sm:block">
                      {step.subLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Selected Step Micro-Bar */}
          <div className="mt-8 pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#F8FAFC]/80 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#0E2350] text-white font-black text-xs flex items-center justify-center shrink-0">
                0{selectedStep.stepNumber}
              </span>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-black text-[#0E2350]">
                    {selectedStep.label} • {selectedStep.subLabel}
                  </h4>
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-white text-gray-700 border border-gray-200">
                    {selectedStep.actor}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                  {selectedStep.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10.5px] font-bold text-[#1C8A3C] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/80 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Audited Transition</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
