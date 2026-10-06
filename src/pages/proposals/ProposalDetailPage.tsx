// ============================================================================
// AP VIDYACONNECT — PROPOSAL DETAIL & TWO-SIDED STATE MACHINE WORKFLOW
// Enforces formal two-sided negotiations & Institution Final Acceptance Batch Creation
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';
import { WorkflowTimeline } from '../../components/common/WorkflowTimeline';
import { StatusBadge } from '../../components/common/StatusBadge';
import { InternshipProposal, ProposalStudent } from '../../types/database';
import {
  School,
  Building2,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  History,
  Check,
  X,
  FileCheck2,
  Clock,
  Sparkles,
  Award,
  Copy,
  ExternalLink,
  Layers
} from 'lucide-react';

export const ProposalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentRole, currentUser } = useAuth();
  const [proposal, setProposal] = useState<InternshipProposal | null>(null);

  // Company response form state
  const [responseAction, setResponseAction] = useState<'accept' | 'accept_with_changes' | 'request_modification' | 'reject'>('accept_with_changes');
  const [stipendOffered, setStipendOffered] = useState(15000);
  const [mentorName, setMentorName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [studentDecisions, setStudentDecisions] = useState<{ [key: string]: boolean }>({});
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [batchCreatedModal, setBatchCreatedModal] = useState<{ batchId: string; batchCode: string } | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionRemarks, setRejectionRemarks] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const load = () => {
      const match = db.proposals.find(p => p.id === id);
      if (match) {
        setProposal({ ...match });
        setStipendOffered(match.stipend_requested || 15000);



        if (match.students) {
          const decs: { [key: string]: boolean } = {};
          match.students.forEach(s => {
            decs[s.student_id] = s.is_accepted_by_company !== false;
          });
          setStudentDecisions(decs);
        }
      }
    };
    load();
    const unsub = db.subscribe(load);
    return unsub;
  }, [id]);

  if (!proposal) {
    return (
      <div className="bg-white rounded-xl border border-[#E3E6EB] p-12 text-center text-gray-500 text-xs">
        Proposal not found.
      </div>
    );
  }

  // Check state machine permissions (strictly bilateral between college & company)
  const isInstitution = currentRole === 'institution_admin' || currentRole === 'faculty_coordinator';
  const isCompany = currentRole === 'company_admin' || currentRole === 'mentor';
  const isSuperAdmin = currentRole === 'super_admin';

  const canCompanyRespond = isCompany && !isSuperAdmin && (proposal.status === 'submitted' || proposal.status === 'under_company_review');
  const canInstitutionFinalAccept = isInstitution && !isSuperAdmin && (proposal.status === 'company_accepted' || proposal.status === 'company_accepted_with_changes');

  const companyMentors = db.mentors.filter(
    m => !proposal.company_id || m.company_id === proposal.company_id || m.company_id === 'comp-001'
  );

  const handleStartReview = () => {
    db.startCompanyReview(proposal.id, currentUser);
  };

  const handleCompanySubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    const decisionsArray = Object.entries(studentDecisions).map(([studentId, accepted]) => ({
      studentId,
      accepted,
      reason: accepted ? undefined : 'Seat capacity allocation'
    }));

    const finalMentorName = mentorName.trim() || 'Assigned Technical Lead';

    db.companyRespond(
      proposal.id,
      responseAction,
      {
        stipendOffered,
        mentorName: finalMentorName,
        remarks: remarks || `Terms updated for ${responseAction.replace('_', ' ')}`,
        studentDecisions: decisionsArray
      },
      currentUser
    );
  };

  const handleInstitutionFinalAccept = () => {
    const res = db.institutionFinalAccept(proposal.id, currentUser);
    setBatchCreatedModal({
      batchId: res.batch_id,
      batchCode: res.batch_code
    });
  };

  const handleInstitutionReject = (e: React.FormEvent) => {
    e.preventDefault();
    setRejecting(true);
    try {
      db.institutionReject(
        proposal.id,
        rejectionRemarks.trim() || 'Institutional terms declined by College Coordinator',
        currentUser
      );
      setShowRejectModal(false);
    } finally {
      setRejecting(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-xl border border-[#E3E6EB] p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#0E2350] bg-[#EEF2FA] px-2.5 py-1 rounded">
                {proposal.proposal_code}
              </span>
              <span className="text-xs text-gray-500 font-semibold">Version {proposal.version}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0E2350] mt-1.5">
              {proposal.domain}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={proposal.status} />
            <button
              onClick={() => setShowVersionModal(true)}
              className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5" />
              Version History ({proposal.versions?.length || 1})
            </button>
          </div>
        </div>

        {/* Visual 10-Step Workflow Timeline */}
        <div className="pt-2 border-t border-gray-100">
          <WorkflowTimeline currentStatus={proposal.status} />
        </div>
      </div>

      {/* STATE SUPER ADMIN REALTIME OVERSIGHT NOTICE */}
      {isSuperAdmin && (
        <div className="p-4 bg-[#EEF2FA] border border-[#2A4E96]/30 rounded-xl text-xs text-[#0E2350] flex items-center gap-3 font-semibold shadow-sm">
          <ShieldCheck className="w-5 h-5 text-[#2A4E96] shrink-0" />
          <div>
            <p className="font-bold text-[#0E2350]">State Oversight Audit Mode (Real-time Read Only)</p>
            <p className="text-gray-600 text-[11px]">You are inspecting live state proposal metrics and curriculum compliance. Formal state approvals and activation are bilateral between College Coordinators and Industry Partners.</p>
          </div>
        </div>
      )}

      {/* INFORMATIONAL NOTICE: DECISION CENTRALIZED IN ACCEPT / REJECT TERMS */}
      {canInstitutionFinalAccept && (
        <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-white border border-emerald-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Company Accepted Terms
              </span>
              <h3 className="text-sm font-extrabold text-[#0E2350] mt-1">
                Terms Confirmed by {proposal.company?.name || 'Industry Partner'}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Under state protocol, final institutional acceptance and batch generation is processed exclusively through the <strong>Accept / Reject Terms</strong> decision center.
              </p>
            </div>
          </div>

          <Link
            to="/proposals/decisions"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 text-white text-xs font-black shadow-md transition-all flex items-center gap-2 shrink-0 self-start sm:self-center"
          >
            <span>Open Accept / Reject Terms</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* COMPANY RESPONSE FORM */}
      {canCompanyRespond && (
        <div className="bg-[#FFF3EA] border-2 border-[#F07421] rounded-xl p-6 shadow-md space-y-5">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-[#F07421] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold text-[#0E2350]">
                Company Review & Counter-Offer Terminal
              </h3>
              <p className="text-xs text-gray-700 mt-0.5">
                Review candidate profiles, adjust stipend/duration terms, and select your corporate decision.
              </p>
            </div>
          </div>

          <form onSubmit={handleCompanySubmitResponse} className="space-y-4 bg-white p-5 rounded-xl border border-[#F07421]/30 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Corporate Action</label>
                <select
                  value={responseAction}
                  onChange={(e) => setResponseAction(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#F6F7F9] border border-gray-300 rounded-lg font-bold text-[#0E2350]"
                >
                  <option value="accept">Accept All Terms</option>
                  <option value="accept_with_changes">Accept With Changes (Stipend/Seats)</option>
                  <option value="request_modification">Request Institution Modification</option>
                  <option value="reject">Reject Proposal</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Offered Monthly Stipend (₹)</label>
                <input
                  type="number"
                  value={stipendOffered}
                  onChange={(e) => setStipendOffered(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#F6F7F9] border border-gray-300 rounded-lg font-semibold text-emerald-800"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Corporate Supervisor / Technical Lead
                </label>
                <input
                  type="text"
                  placeholder="Enter supervisor / technical lead name & designation..."
                  value={mentorName}
                  onChange={(e) => setMentorName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F6F7F9] border border-gray-300 rounded-lg font-semibold text-[#0E2350] focus:ring-2 focus:ring-[#F07421] focus:bg-white transition-all text-xs"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Type the full name & designation of the technical lead supervising this cohort.
                </p>
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">Official Response Remarks / Modifications</label>
              <textarea
                rows={2}
                placeholder="Specify seat allocation, technical requirements or reason for modification..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 bg-[#F6F7F9] border border-gray-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#F07421] hover:bg-[#D96214] text-white rounded-lg font-bold text-xs shadow transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Submit Company Decision
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid: Proposal Terms & Nominated Students */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Terms & Objectives */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-[#E3E6EB] p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#0E2350] border-b border-gray-100 pb-2">
              Internship Scope & Parameters
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-[#F6F7F9] p-3 rounded-lg">
                <p className="text-gray-400 uppercase font-bold text-[10px]">Host Industry</p>
                <p className="font-bold text-[#F07421] mt-0.5">{proposal.company?.name}</p>
                <p className="text-[10px] text-gray-500 font-mono">CIN: {proposal.company?.cin}</p>
              </div>

              <div className="bg-[#F6F7F9] p-3 rounded-lg">
                <p className="text-gray-400 uppercase font-bold text-[10px]">Originating College</p>
                <p className="font-bold text-[#0E2350] mt-0.5">{proposal.institution?.name}</p>
                <p className="text-[10px] text-gray-500">{proposal.institution?.affiliated_university}</p>
              </div>

              <div className="bg-[#F6F7F9] p-3 rounded-lg">
                <p className="text-gray-400 uppercase font-bold text-[10px]">Mode & Schedule</p>
                <p className="font-bold text-gray-800 mt-0.5">{proposal.mode.toUpperCase()}</p>
                <p className="text-[10px] text-gray-500">{proposal.duration_weeks} Weeks Duration</p>
              </div>

              <div className="bg-[#F6F7F9] p-3 rounded-lg">
                <p className="text-gray-400 uppercase font-bold text-[10px]">Stipend Terms</p>
                <p className="font-bold text-emerald-700 mt-0.5">₹{proposal.stipend_requested?.toLocaleString()} / month</p>
              </div>

              <div className="bg-[#F6F7F9] p-3 rounded-lg sm:col-span-2">
                <p className="text-gray-400 uppercase font-bold text-[10px]">Calendar Window</p>
                <p className="font-bold text-gray-800 mt-0.5">{proposal.start_date} to {proposal.end_date}</p>
              </div>
            </div>

            <div className="text-xs space-y-1 pt-2">
              <p className="font-bold text-gray-700 uppercase text-[10px]">Learning Objectives</p>
              <p className="text-gray-600 leading-relaxed bg-[#F6F7F9] p-3 rounded-lg">{proposal.objectives}</p>
            </div>

            {proposal.additional_terms && (
              <div className="text-xs space-y-1">
                <p className="font-bold text-[#F07421] uppercase text-[10px]">Company Counter-Terms & Remarks</p>
                <p className="text-gray-700 leading-relaxed bg-[#FFF3EA] p-3 rounded-lg border border-[#F07421]/20">
                  {proposal.additional_terms}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Nominated Students Roster */}
        <div className="bg-white rounded-xl border border-[#E3E6EB] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="text-sm font-bold text-[#0E2350] flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#2A4E96]" />
              Nominated Students ({proposal.students?.length || 0})
            </h3>
          </div>

          <div className="space-y-3">
            {proposal.students?.map((ps) => {
              const stu = ps.student || db.students.find(s => s.id === ps.student_id);
              const isAccepted = studentDecisions[ps.student_id] ?? (ps.is_accepted_by_company !== false);

              return (
                <div
                  key={ps.id}
                  className="p-3 rounded-lg border border-gray-100 bg-[#F6F7F9]/60 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-gray-900">{stu?.full_name}</p>
                      <p className="text-[10px] text-gray-500 font-mono">Roll: {stu?.roll_number} • CGPA: {stu?.cgpa}</p>
                    </div>

                    {canCompanyRespond ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setStudentDecisions({ ...studentDecisions, [ps.student_id]: true })}
                          className={`p-1 rounded ${isAccepted ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                          title="Accept Student"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setStudentDecisions({ ...studentDecisions, [ps.student_id]: false })}
                          className={`p-1 rounded ${!isAccepted ? 'bg-rose-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                          title="Decline Student"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span>
                        {ps.is_accepted_by_company === true && (
                          <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Accepted
                          </span>
                        )}
                        {ps.is_accepted_by_company === false && (
                          <span className="text-rose-700 font-bold text-[10px] flex items-center gap-0.5">
                            <XCircle className="w-3 h-3" /> Declined
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {stu?.skills?.map((sk) => (
                      <span key={sk} className="text-[9px] bg-white border border-gray-200 px-1.5 py-0.2 rounded text-gray-600">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Version History Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-[#0E2350] flex items-center gap-2">
                <History className="w-4 h-4 text-[#F07421]" />
                Proposal Audit & Version Snapshots
              </h3>
              <button
                onClick={() => setShowVersionModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {proposal.versions?.map((v) => (
                <div key={v.id} className="p-3.5 bg-[#F6F7F9] rounded-lg text-xs space-y-1 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0E2350]">Version {v.version_number}</span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(v.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700 font-medium">{v.change_summary}</p>
                  <p className="text-[10px] text-gray-400">Author: {v.changed_by_name || 'System'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GORGEOUS BATCH CREATION CELEBRATION POPUP MODAL */}
      {batchCreatedModal && (
        <div className="fixed inset-0 z-50 bg-[#07132c]/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-emerald-100 animate-in zoom-in-95 duration-300 relative text-left">
            {/* Top Tri-Color State Gradient Ribbon */}
            <div className="h-2 bg-gradient-to-r from-[#F07421] via-amber-400 to-[#1C8A3C]" />

            <div className="p-6 sm:p-8 space-y-6">
              {/* Animated Celebration Avatar */}
              <div className="text-center space-y-3">
                <div className="relative inline-block">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-teal-50 border-4 border-white shadow-lg flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-11 h-11 text-[#1C8A3C]" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#F07421] text-white flex items-center justify-center shadow-md animate-bounce">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#1C8A3C] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    <Award className="w-3.5 h-3.5" />
                    Government of AP Certified Workflow
                  </span>
                  <h2 className="text-2xl font-black text-[#0E2350] mt-2">
                    Proposal Accepted!
                  </h2>
                  <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto leading-relaxed">
                    Official bilateral agreement established. An active internship batch has been created in the state registry.
                  </p>
                </div>
              </div>

              {/* Official Batch Code Card */}
              <div className="bg-gradient-to-br from-[#0E2350] to-[#14336F] text-white p-5 rounded-2xl shadow-md space-y-3 relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-28 h-28 bg-[#F07421]/15 rounded-full blur-2xl" />

                <div className="flex items-center justify-between text-[11px] text-gray-300 font-semibold border-b border-white/10 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#F07421]" />
                    Official Internship Batch Code
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                    Live Active
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="font-mono text-base sm:text-lg font-black tracking-wide text-amber-300">
                    {batchCreatedModal.batchCode}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(batchCreatedModal.batchCode)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border border-white/15"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Batch Summary Highlights */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-[#F6F7F9] p-4 rounded-xl border border-gray-200/80">
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-500 block">Domain / Track</span>
                  <span className="font-bold text-[#0E2350] truncate block">{proposal.domain}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-500 block">Industry Partner</span>
                  <span className="font-bold text-[#0E2350] truncate block">{proposal.company?.name || 'Partner Company'}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-500 block">Host Institution</span>
                  <span className="font-bold text-[#0E2350] truncate block">{proposal.institution?.name || 'Government College'}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-500 block">Allocated Students</span>
                  <span className="font-bold text-[#1C8A3C] block">
                    {proposal.students?.filter(s => s.is_accepted_by_company !== false).length || proposal.students?.length || 0} Candidates
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => navigate(`/batches/${batchCreatedModal.batchId}`)}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-[#0E2350] via-[#14336F] to-[#0E2350] hover:from-[#14336F] hover:to-[#2A4E96] text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Open Internship Batch Workspace</span>
                  <ArrowRight className="w-4 h-4 text-[#F07421] group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/batches')}
                    className="flex-1 py-2 px-3 bg-white hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-bold border border-gray-200 transition-colors text-center"
                  >
                    View All Batches
                  </button>

                  <button
                    type="button"
                    onClick={() => setBatchCreatedModal(null)}
                    className="flex-1 py-2 px-3 bg-white hover:bg-gray-100 text-gray-500 rounded-lg text-xs font-semibold border border-gray-200 transition-colors text-center"
                  >
                    Stay on Proposal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Institutional Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-[#07132c]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4 text-left animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0E2350]">Decline Company Terms</h3>
                  <p className="text-xs text-gray-500">Formally decline company terms for this proposal</p>
                </div>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInstitutionReject} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Reason for Institutional Rejection <span className="text-rose-600">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={rejectionRemarks}
                  onChange={(e) => setRejectionRemarks(e.target.value)}
                  placeholder="State official reason (e.g., Stipend counter-offer below institutional norms, academic examination clash, etc.)"
                  className="w-full p-3 bg-[#F6F7F9] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs text-gray-800"
                />
              </div>

              {/* Quick Reason Suggestions */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quick Suggestions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Stipend counter-offer does not meet institutional guidelines',
                    'Internship timeline clashes with university semester examinations',
                    'Candidate seat allocation mismatch for departmental batch',
                    'Students opted for alternative accredited internship programs'
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setRejectionRemarks(tag)}
                      className="text-[11px] px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium text-left transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejecting}
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  {rejecting ? 'Declining...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
