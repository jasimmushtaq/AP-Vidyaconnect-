// ============================================================================
// AP VIDYACONNECT — INSTITUTIONAL DECISION INBOX (ACCEPT / REJECT TERMS)
// Dedicated solely for College Admins to Accept & Generate Batches or Reject Corporate Terms
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { InternshipProposal } from '../../types/database';
import {
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  School,
  FileText,
  AlertCircle,
  Briefcase,
  Check,
  X,
  Plus,
  RefreshCw
} from 'lucide-react';

export const ProposalDecisionsPage: React.FC = () => {
  const { currentInstitution, currentUser } = useAuth();
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<InternshipProposal[]>(db.proposals);
  const [activeTab, setActiveTab] = useState<'pending' | 'modifications' | 'history'>('pending');

  // Confirmation & Modal State
  const [acceptingProposal, setAcceptingProposal] = useState<InternshipProposal | null>(null);
  const [batchCreated, setBatchCreated] = useState<{ batchId: string; batchCode: string } | null>(null);

  const [rejectingProposal, setRejectingProposal] = useState<InternshipProposal | null>(null);
  const [rejectionRemarks, setRejectionRemarks] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setProposals([...db.proposals]);
    });
    return unsub;
  }, []);

  const instId = currentInstitution?.id || currentUser.institution_id;

  // Filter proposals strictly relevant to this institution
  const myProposals = useMemo(() => {
    if (!instId) return [];
    return proposals.filter(p => p.institution_id === instId);
  }, [proposals, instId]);

  // 1. Proposals waiting for institution's final acceptance/rejection (Company accepted terms)
  const pendingDecisions = useMemo(() => {
    return myProposals.filter(
      p => p.status === 'company_accepted' || p.status === 'company_accepted_with_changes'
    );
  }, [myProposals]);

  // 2. Proposals where company requested modifications
  const modificationProposals = useMemo(() => {
    return myProposals.filter(p => p.status === 'modification_requested');
  }, [myProposals]);

  // 3. Past decisions (Accepted into batches or Declined)
  const historyDecisions = useMemo(() => {
    return myProposals.filter(
      p => p.status === 'institution_accepted' || p.status === 'rejected' || p.status === 'declined'
    );
  }, [myProposals]);

  // Handlers
  const handleFinalAccept = (proposal: InternshipProposal) => {
    setIsProcessing(true);
    try {
      const res = db.institutionFinalAccept(proposal.id, currentUser);
      setAcceptingProposal(null);
      setBatchCreated({
        batchId: res.batch_id,
        batchCode: res.batch_code
      });
    } catch (err: any) {
      alert(err.message || 'Error accepting proposal');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalReject = () => {
    if (!rejectingProposal) return;
    setIsProcessing(true);
    try {
      db.institutionReject(
        rejectingProposal.id,
        rejectionRemarks.trim() || 'Institutional terms declined by College Coordinator',
        currentUser
      );
      setRejectingProposal(null);
      setRejectionRemarks('');
    } catch (err: any) {
      alert(err.message || 'Error declining proposal');
    } finally {
      setIsProcessing(false);
    }
  };

  const displayedList =
    activeTab === 'pending'
      ? pendingDecisions
      : activeTab === 'modifications'
      ? modificationProposals
      : historyDecisions;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* 1. TOP HERO HEADER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A1938] via-[#0E2350] to-[#163673] border border-blue-900/40 p-6 sm:p-8 shadow-xl text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-bold tracking-wide flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Institutional Final Decision Center
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 text-xs font-semibold">
                AP State Council Internship Protocol
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              ⚡ Accept / Reject Corporate Terms
            </h1>

            <p className="text-xs text-blue-200/90 max-w-3xl leading-relaxed">
              Review formal counter-offers and accepted candidate rosters from verified industry partners. Under state protocol, an active internship batch is officially chartered only upon your final institutional acceptance.
            </p>
          </div>
        </div>
      </div>

      {/* 2. TAB CONTROLS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Ready for Final Decision</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'pending' ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {pendingDecisions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('modifications')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'modifications'
                ? 'bg-gradient-to-r from-[#0E2350] to-[#1E3A8A] text-white shadow-md'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>Modifications Requested</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'modifications' ? 'bg-white text-[#0E2350]' : 'bg-blue-100 text-[#0E2350]'
              }`}
            >
              {modificationProposals.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-slate-700 to-slate-900 text-white shadow-md'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>Decision History</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'history' ? 'bg-white text-slate-900' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {historyDecisions.length}
            </span>
          </button>
        </div>

        <span className="text-xs text-slate-400 font-medium px-2">
          {displayedList.length} Proposal(s) in this queue
        </span>
      </div>

      {/* 3. PROPOSALS DECISION QUEUE */}
      {displayedList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#0E2350]">All Caught Up!</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              There are currently no proposals waiting in the <strong>{activeTab.replace('_', ' ')}</strong> queue. When industry partners respond to your proposals, they will immediately appear here for your final decision.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              to="/opportunities"
              className="px-4 py-2 bg-[#0E2350] hover:bg-[#15357a] text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              Explore Companies
            </Link>
            <Link
              to="/batches"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all"
            >
              View Active Batches
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedList.map((p) => {
            const isReadyForFinalAcceptance =
              p.status === 'company_accepted' || p.status === 'company_accepted_with_changes';
            const isDeclined = p.status === 'rejected' || p.status === 'declined';
            const isAccepted = p.status === 'institution_accepted';

            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all space-y-5 ${
                  isReadyForFinalAcceptance
                    ? 'border-emerald-300 ring-1 ring-emerald-400/30'
                    : isAccepted
                    ? 'border-blue-200 bg-blue-50/20'
                    : isDeclined
                    ? 'border-rose-200 bg-rose-50/20'
                    : 'border-slate-200/80'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#0E2350] bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md shadow-2xs">
                        {p.proposal_code}
                      </span>
                      <span className="text-xs font-bold text-slate-500">v{p.version}</span>
                      <StatusBadge status={p.status} size="sm" />
                    </div>
                    <h3 className="text-lg font-extrabold text-[#0E2350] mt-1.5">{p.domain}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Building2 className="w-4 h-4 text-[#F07421]" />
                      <strong>{p.company?.name || 'Industry Partner'}</strong>
                    </span>
                  </div>
                </div>

                {/* Offer Terms Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirmed Stipend</span>
                    <p className="text-base font-black text-emerald-700 mt-1 font-mono">
                      ₹{p.stipend_requested?.toLocaleString()} <span className="text-[10px] text-slate-500 font-sans">/ month</span>
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration & Mode</span>
                    <p className="text-sm font-bold text-[#0E2350] mt-1 capitalize">
                      {p.duration_weeks} Weeks • {p.mode}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Candidate Seats</span>
                    <p className="text-sm font-bold text-[#0E2350] mt-1">
                      {p.students?.length || 0} Confirmed Interns
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Schedule</span>
                    <p className="text-xs font-semibold text-slate-600 mt-1">
                      {p.start_date} to {p.end_date}
                    </p>
                  </div>
                </div>

                {/* Candidate Roster Preview */}
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-[#0E2350] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#2A4E96]" />
                    <span>Allocated Students ({p.students?.length || 0})</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {p.students?.map((ps) => {
                      const stu = ps.student || db.students.find(s => s.id === ps.student_id);
                      return (
                        <div
                          key={ps.id}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-200/70 rounded-lg text-xs flex items-center gap-2"
                        >
                          <span className="font-bold text-slate-800">{stu?.full_name || 'Candidate'}</span>
                          <span className="font-mono text-[10px] text-slate-500">({stu?.roll_number})</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Accepted by Company"></span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Direct Action Decision Bar */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <Link
                    to={`/proposals/${p.id}`}
                    className="text-xs font-bold text-[#2A4E96] hover:underline flex items-center gap-1 self-start sm:self-center"
                  >
                    <span>View Complete Proposal Dossier & Audit Log</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {isReadyForFinalAcceptance ? (
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setRejectingProposal(p)}
                        className="px-4 py-2.5 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                      >
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Reject / Decline Terms</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAcceptingProposal(p)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-2 transform active:scale-95"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                        <span>Final Accept & Generate Batch</span>
                      </button>
                    </div>
                  ) : isAccepted ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Chartered & Active Internship Batch
                    </span>
                  ) : isDeclined ? (
                    <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      Declined by Institution
                    </span>
                  ) : (
                    <Link
                      to={`/proposals/${p.id}`}
                      className="px-4 py-2 rounded-xl bg-[#0E2350] hover:bg-[#15357a] text-white text-xs font-bold shadow-sm transition-all"
                    >
                      Review Terms
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: ACCEPT & CREATE BATCH CONFIRMATION */}
      {acceptingProposal && (
        <div className="fixed inset-0 z-50 bg-[#07132c]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-left">
            <div className="flex items-center gap-3 text-emerald-700">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#0E2350]">Final Institutional Acceptance</h3>
                <p className="text-xs text-slate-500 font-mono">{acceptingProposal.proposal_code}</p>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-2 text-slate-700 leading-relaxed">
              <p>
                You are executing the <strong>final bilateral acceptance</strong> for <strong>{acceptingProposal.domain}</strong> with <strong>{acceptingProposal.company?.name}</strong>.
              </p>
              <p className="font-semibold text-emerald-900">
                ✓ Stipend: ₹{acceptingProposal.stipend_requested?.toLocaleString()}/mo • {acceptingProposal.students?.length} Candidates Enrolled
              </p>
              <p className="text-[11px] text-slate-500">
                This will automatically charter an official state <strong>Internship Batch (KD-2026-...)</strong>, notify students, and initiate attendance geofencing.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setAcceptingProposal(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleFinalAccept(acceptingProposal)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 text-white font-black text-xs shadow-md flex items-center gap-2"
              >
                {isProcessing ? 'Generating Batch...' : 'Confirm & Charter Batch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: BATCH CREATED SUCCESS */}
      {batchCreated && (
        <div className="fixed inset-0 z-50 bg-[#07132c]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <Sparkles className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-extrabold text-[#0E2350]">Official Batch Created!</h3>
            <p className="text-xs text-slate-600">
              The internship batch has been successfully chartered on the AP State Portal.
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-black text-emerald-700">
              {batchCreated.batchCode}
            </div>

            <div className="pt-3 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setBatchCreated(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Done
              </button>
              <button
                type="button"
                onClick={() => {
                  setBatchCreated(null);
                  navigate(`/batches/${batchCreated.batchId}`);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#0E2350] hover:bg-[#15357a] text-white font-black text-xs shadow transition-all flex items-center gap-1.5"
              >
                <span>Go to Batch Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REJECT TERMS */}
      {rejectingProposal && (
        <div className="fixed inset-0 z-50 bg-[#07132c]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-left">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6 text-rose-700" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#0E2350]">Decline Corporate Terms</h3>
                <p className="text-xs text-slate-500 font-mono">{rejectingProposal.proposal_code}</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Provide a reason or remarks for declining this counter-proposal from <strong>{rejectingProposal.company?.name}</strong>:
              </p>
              <textarea
                value={rejectionRemarks}
                onChange={(e) => setRejectionRemarks(e.target.value)}
                placeholder="e.g., Stipend below minimum institutional benchmark, candidate allocation modified..."
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setRejectingProposal(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleFinalReject}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md flex items-center gap-2"
              >
                {isProcessing ? 'Declining...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
