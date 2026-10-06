// ============================================================================
// AP VIDYACONNECT — HOW IT WORKS & CANONICAL STATE MACHINE
// ============================================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { WorkflowTimeline, CANONICAL_10_STEPS } from '../../components/common/WorkflowTimeline';
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  Briefcase,
  Award,
  Sparkles,
  ArrowRight,
  Lock,
  Layers,
  Check,
  ExternalLink,
  Users,
  MapPin,
  QrCode,
  Sliders,
  ChevronRight
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const [selectedStep, setSelectedStep] = useState(9); // Default to Step 10 (Certificate Issued)

  const stepDetails = [
    {
      step: 1,
      title: 'Proposal Drafting',
      actor: 'College Placement Cell / Department Coordinator',
      status: 'draft',
      desc: 'The institutional coordinator selects a corporate domain, specifies batch size, date ranges, and customized curriculum needs, generating a statutory proposal draft.',
      outputs: ['Draft Proposal Record', 'Student Cohort Pre-selection', 'MOU Association']
    },
    {
      step: 2,
      title: 'Proposal Submission',
      actor: 'College Principal / Authorized Signatory',
      status: 'submitted',
      desc: 'The college formally dispatches the proposal to the corporate partner’s corporate desk with authorized credentials and institutional accreditation proofs.',
      outputs: ['Instant Webhook to Company Admin', 'Real-time System Alert', 'Immutable Audit Timestamp']
    },
    {
      step: 3,
      title: 'Company Technical Review',
      actor: 'Corporate HR Lead / Technical Mentor',
      status: 'under_company_review',
      desc: 'Company leadership inspects prerequisites, infrastructure requirements, project mentors availability, and stipend schedules.',
      outputs: ['Feasibility Analysis', 'Mentor Allocation', 'Revision Requests (if any)']
    },
    {
      step: 4,
      title: 'Company Decision & Terms Confirmation',
      actor: 'Company Administrator',
      status: 'company_accepted',
      desc: 'The corporate partner accepts the proposal as-is or returns it with minor counter-amendments (e.g. stipend adjustment or date tweaks).',
      outputs: ['Corporate Acceptance Signoff', 'Approved Stipend Matrix', 'Facility Geofence Perimeter']
    },
    {
      step: 5,
      title: 'Institution Final Acceptance Rule',
      actor: 'College Principal / Placement Cell',
      status: 'institution_accepted',
      desc: 'Dual-key protocol: The college must confirm the company’s final terms. Upon this final handshake, the platform auto-provisions an official Batch Code (KD-YYYY-XXX).',
      outputs: ['Official Batch ID Provisioned', 'Geofence Radius Locked', 'Student Invite Links Dispatched']
    },
    {
      step: 6,
      title: 'Student Digital Consent',
      actor: 'Eligible Enrolled Students',
      status: 'students_confirmed',
      desc: 'Students access their platform dashboard, review code-of-conduct & POSH safety guidelines, and execute a one-click digital "JOIN INTERNSHIP" consent.',
      outputs: ['Digital Acceptance Dossier', 'Student Mobile App Access', 'Selfie Check-in Enabled']
    },
    {
      step: 7,
      title: 'Active Internship & Geofenced Attendance',
      actor: 'Interns & Corporate Supervisors',
      status: 'active',
      desc: 'Students check in daily inside the authorized geofenced perimeter. Company supervisors review selfie-verified check-ins and log shift completions.',
      outputs: ['Live GPS Telemetry', 'Daily Check-in Audit Logs', 'Real-time Attendance Rate']
    },
    {
      step: 8,
      title: 'Milestone & Weekly Progress Sync',
      actor: 'Faculty Coordinator & Industry Mentor',
      status: 'milestones_verified',
      desc: 'Weekly milestone reviews confirm project deliverables, code repositories, and laboratory telemetry, keeping college faculty fully synchronized.',
      outputs: ['Weekly Mentor Ratings', 'Milestone Checkpoints', 'Faculty Progress Oversight']
    },
    {
      step: 9,
      title: 'Corporate Evaluation & Grading',
      actor: 'Industry Evaluator / Tech Lead',
      status: 'completed',
      desc: 'Upon internship completion, the corporate evaluator grades candidates across technical execution, teamwork, problem solving, and initiative (1-100 score).',
      outputs: ['Weighted Scorecard', 'Performance Remarks', 'University Credit Recommendation']
    },
    {
      step: 10,
      title: 'Batch Finalization & Academic Credits',
      actor: 'Host Company & University Desk',
      status: 'completed',
      desc: 'The platform finalizes all cohort milestone data and automatically logs NEP 2020 academic credits with the university examination branch.',
      outputs: ['Batch Completion Dossier', 'Official NEP 2020 Credit Log', 'Permanent State Registry Record']
    }
  ];

  const active = stepDetails[selectedStep];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF3EA] text-[#0E2350] border border-[#F07421]/25 text-xs font-black shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#F07421]" />
            <span>Statewide Canonical Governance Protocol</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0E2350] tracking-tight">
            How AP VidyaConnect Governs Internships
          </h1>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Unlike informal job boards, AP VidyaConnect operates a strict, dual-key state machine. An internship only activates after mutual institutional-corporate handshakes, real-time geofence attendance, and tamper-proof QR certification.
          </p>
        </div>

        {/* State Machine Showcase Card */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h2 className="text-base font-black text-[#0E2350] uppercase tracking-wide">
                  Visual 10-Stage Canonical State Machine
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Every cohort lifecycle strictly transitions through 10 auditable phases. Click any node to inspect details.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold rounded-full flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                All 10 Stages Completed & Verified
              </span>
            </div>
          </div>

          {/* 10-Stage Timeline with all ticks filled */}
          <WorkflowTimeline
            currentStatus="all_completed"
            forceAllCompleted={true}
            interactive={true}
            selectedStepIndex={selectedStep}
            onStepClick={(idx) => setSelectedStep(idx)}
          />

          {/* Interactive Step Details Card */}
          <div className="bg-gradient-to-r from-[#F9FAFB] to-[#EEF2FA] rounded-2xl border border-gray-200 p-5 sm:p-6 transition-all space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/60 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-[#0E2350] text-white font-black text-xs flex items-center justify-center shadow-xs">
                  {active.step}
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#0E2350]">{active.title}</h3>
                  <span className="text-[11px] font-bold text-gray-500">
                    Primary Actor: <strong className="text-[#F07421]">{active.actor}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono bg-white px-2.5 py-1 rounded-lg border border-gray-200 text-gray-700 font-bold">
                  status: <code className="text-[#2A4E96]">{active.status}</code>
                </span>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg uppercase flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" /> Validated
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
              {active.desc}
            </p>

            <div className="pt-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block mb-1.5">
                Key Protocol Deliverables & Outputs:
              </span>
              <div className="flex flex-wrap gap-2">
                {active.outputs.map((out, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-[#0E2350] shadow-2xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {out}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4 Core Pillars */}
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-[#0E2350]">The 4 Architectural Pillars</h2>
            <p className="text-xs text-gray-500">How the platform guarantees institutional credibility and zero fraud</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pillar 1 */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-2xs hover:shadow-md transition-all space-y-3 group">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#F07421] flex items-center justify-center border border-orange-100 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-[#0E2350] flex items-center justify-between">
                <span>1. Two-Sided Proposal Negotiation</span>
                <span className="text-[10px] bg-orange-50 text-[#F07421] px-2 py-0.5 rounded font-black uppercase">Statutory</span>
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Proposals originate exclusively from verified institutions and travel through auditable status stages: <code className="bg-gray-100 px-1 py-0.5 rounded text-[#0E2350] font-bold">draft</code> → <code className="bg-gray-100 px-1 py-0.5 rounded text-[#0E2350] font-bold">submitted</code> → <code className="bg-gray-100 px-1 py-0.5 rounded text-[#0E2350] font-bold">under_company_review</code> → <code className="bg-gray-100 px-1 py-0.5 rounded text-[#0E2350] font-bold">company_accepted_with_changes</code>.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-2xs hover:shadow-md transition-all space-y-3 group">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-[#0E2350] flex items-center justify-between">
                <span>2. Dual-Key Final Acceptance Rule</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-black uppercase">Zero-Trust</span>
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                An internship <strong>never becomes active</strong> solely upon company acceptance. The originating college must confirm final terms to trigger batch creation (<code className="bg-gray-100 px-1 py-0.5 rounded text-[#0E2350] font-bold">KD-YYYY-...</code>), preventing rogue or unverified batches.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-2xl hover:shadow-md transition-all space-y-3 group">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2A4E96] flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-[#0E2350] flex items-center justify-between">
                <span>3. Geofenced Daily Attendance</span>
                <span className="text-[10px] bg-blue-50 text-[#2A4E96] px-2 py-0.5 rounded font-black uppercase">GPS Telemetry</span>
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Students execute digital onboarding consent. Company supervisors configure precise geofences (latitude, longitude, radius). Daily attendance uses selfie verification with leave/half-day flags and automated weekly compliance metrics.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-2xs hover:shadow-md transition-all space-y-3 group">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-[#0E2350] flex items-center justify-between">
                <span>4. Weighted Evaluation & Academic Credits</span>
                <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-black uppercase">Auditable</span>
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Corporate supervisors evaluate weighted criteria across technical execution, problem solving, and professional initiative. Academic credits are recognized directly by university examination and placement boards.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="bg-[#0E2350] rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-black tracking-tight">Ready to participate in Andhra Pradesh’s Skill Ecosystem?</h3>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
              Explore open opportunities, discover accredited engineering colleges, or sign in to access your institutional portal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/opportunities"
              className="px-6 py-3 bg-[#F07421] hover:bg-[#D96214] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95"
            >
              <span>Explore Opportunities</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/partners"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20 flex items-center gap-1.5"
            >
              <span>Partner Directory</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
