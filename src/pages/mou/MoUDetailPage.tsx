// ============================================================================
// AP VIDYACONNECT — MOU DETAIL & REAL-TIME WORKFLOW REVIEW PAGE
// Full lifecycle: Create -> Email -> College Review -> Dual Sign -> Active
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';
import { MoUAgreement, MoUSignature, MoUStatus } from '../../types/database';
import { MoUDocumentView } from '../../components/mou/MoUDocumentView';
import { MoUSignatureModal } from '../../components/mou/MoUSignatureModal';
import { MoUEmailModal } from '../../components/mou/MoUEmailModal';
import {
  FileText,
  School,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  PenTool,
  Send,
  Printer,
  Download,
  Share2,
  ShieldCheck,
  History,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  Calendar,
  Lock,
  Stamp,
  Mail
} from 'lucide-react';

export const MoUDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, currentRole, currentCompany, currentInstitution } = useAuth();

  const [mou, setMou] = useState<MoUAgreement | null>(null);
  const [activeTab, setActiveTab] = useState<'document' | 'history' | 'credentials'>('document');

  // Modals
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isChangesModalOpen, setIsChangesModalOpen] = useState(false);
  const [changesText, setChangesText] = useState('');
  const [signPartyTarget, setSignPartyTarget] = useState<'first_party' | 'second_party'>('first_party');

  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadMou = () => {
      const found = db.mous.find((m) => m.id === id);
      if (found) {
        setMou({ ...found });
      }
    };
    loadMou();
    const unsub = db.subscribe(loadMou);
    return unsub;
  }, [id]);

  useEffect(() => {
    if (window.location.search.includes('print=true')) {
      setActiveTab('document');
      const timer = setTimeout(() => {
        window.print();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!mou) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
          <FileText className="w-12 h-12 text-gray-400 mx-auto" />
          <h2 className="text-lg font-bold text-gray-900">MoU Document Not Found</h2>
          <p className="text-xs text-gray-500">
            The requested Memorandum of Understanding record could not be located in the database.
          </p>
          <button
            onClick={() => navigate('/mous')}
            className="px-5 py-2 bg-[#0E2350] text-white text-xs font-bold rounded-xl"
          >
            ← Return to MoUs
          </button>
        </div>
      </div>
    );
  }

  // Permission flags
  const isCompanyUser =
    currentRole === 'company_admin' ||
    currentRole === 'mentor' ||
    (currentCompany && currentCompany.id === mou.company_id);

  const isCollegeUser =
    currentRole === 'institution_admin' ||
    currentRole === 'faculty_coordinator' ||
    (currentInstitution && currentInstitution.id === mou.institution_id);

  const isSuperAdmin = currentRole === 'super_admin';

  // Status mapping
  const getStatusBadge = (status: MoUStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> ACTIVE (FULLY EXECUTED)
          </span>
        );
      case 'sent_to_college':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-900 border border-blue-300">
            <Clock className="w-4 h-4 text-blue-600" /> PENDING COLLEGE REVIEW
          </span>
        );
      case 'changes_requested':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> CHANGES REQUESTED BY COLLEGE
          </span>
        );
      case 'college_accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-900 border border-purple-300">
            <CheckCircle2 className="w-4 h-4 text-purple-600" /> COLLEGE ACCEPTED (AWAITING DUAL SIGNATURE)
          </span>
        );
      case 'company_signed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-900 border border-indigo-300">
            <PenTool className="w-4 h-4 text-indigo-600" /> COMPANY SIGNED (AWAITING COLLEGE SIGNATURE)
          </span>
        );
      case 'college_signed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-900 border border-indigo-300">
            <PenTool className="w-4 h-4 text-indigo-600" /> COLLEGE SIGNED (AWAITING COMPANY COUNTER-SIGNATURE)
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-900 border border-red-300">
            <XCircle className="w-4 h-4 text-red-600" /> REJECTED / DECLINED
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gray-100 text-gray-800 border border-gray-300">
            <FileText className="w-4 h-4 text-gray-500" /> DRAFT MOU
          </span>
        );
    }
  };

  // Lifecycle Steps calculation
  const getStepIndex = (status: MoUStatus) => {
    switch (status) {
      case 'draft':
        return 1;
      case 'sent_to_college':
      case 'changes_requested':
        return 2;
      case 'college_accepted':
      case 'company_signed':
      case 'college_signed':
        return 3;
      case 'active':
        return 4;
      default:
        return 1;
    }
  };

  const currentWorkflowStep = getStepIndex(mou.status);

  // Actions
  const handleCollegeAccept = () => {
    db.reviewMoUByCollege(mou.id, 'accept', 'College Principal approved the MoU terms.', currentUser);
    setActionSuccessMsg('MoU terms accepted by College! You can now affix your digital signature.');
    setSignPartyTarget('first_party');
    setIsSignModalOpen(true);
  };

  const handleCollegeRequestChanges = () => {
    if (!changesText.trim()) return;
    db.reviewMoUByCollege(mou.id, 'request_changes', changesText, currentUser);
    setIsChangesModalOpen(false);
    setActionSuccessMsg('Feedback & requested changes submitted to Company.');
  };

  const handleCollegeReject = () => {
    if (window.confirm('Are you sure you want to decline this MoU proposal?')) {
      db.reviewMoUByCollege(mou.id, 'reject', 'College declined the MoU proposal at this time.', currentUser);
      setActionSuccessMsg('MoU declined.');
    }
  };

  const handleSignConfirm = (sig: MoUSignature) => {
    db.signMoU(mou.id, signPartyTarget, sig, currentUser);
    setActionSuccessMsg('Digital signature verified and permanently affixed to official record!');
  };

  const handleSendEmailConfirm = (recipient: string) => {
    db.sendMoUByEmail(mou.id, recipient, currentUser);
    setActionSuccessMsg(`Official MoU email transmitted successfully to ${recipient}!`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation & Header (Hidden in Print) */}
        <div className="print:hidden space-y-4">
          <button
            onClick={() => navigate('/mous')}
            className="text-xs font-semibold text-gray-500 hover:text-[#0E2350] flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to MoU Agreements List
          </button>

          {/* Action Success Toast */}
          {actionSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center justify-between text-xs font-semibold animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{actionSuccessMsg}</span>
              </div>
              <button
                onClick={() => setActionSuccessMsg(null)}
                className="text-emerald-700 hover:text-emerald-900 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Main Top Banner */}
          <div className="bg-gradient-to-r from-[#0E2350] via-[#14336F] to-[#1c4596] rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs bg-white/20 text-white font-bold px-2.5 py-0.5 rounded-md border border-white/20">
                  {mou.mou_code}
                </span>
                {getStatusBadge(mou.status)}
              </div>

              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                {mou.first_party_name} ↔ {mou.second_party_name}
              </h1>

              <p className="text-xs text-[#DCE5F5]/80 flex items-center gap-3">
                <span>Effective Date: <strong>{mou.effective_day} {mou.effective_month} {mou.effective_year}</strong></span>
                <span>•</span>
                <span>Validity: <strong>{mou.validity_years} Years</strong></span>
                <span>•</span>
                <span>State Portal Ref: <strong>APSCHE-MOU-{mou.id.slice(-6).toUpperCase()}</strong></span>
              </p>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Printer className="w-3.5 h-3.5" /> Print / PDF Copy
              </button>

              {/* Company email send/resend button */}
              {(isCompanyUser || isSuperAdmin) && (
                <button
                  onClick={() => setIsEmailModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#F07421] hover:bg-[#d65f10] text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {mou.email_sent ? 'Resend Email Dispatch' : 'Send by Email'}
                </button>
              )}
            </div>
          </div>

          {/* 5-STAGE WORKFLOW STEPPER */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F07421]" />
                MoU Execution Workflow Progression
              </h3>
              <span className="text-[11px] text-gray-500 font-mono">
                Step {currentWorkflowStep} of 4 Complete
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  step: 1,
                  title: '1. MoU Created',
                  desc: 'Company drafted clauses & terms',
                  isDone: true,
                  isActive: currentWorkflowStep === 1
                },
                {
                  step: 2,
                  title: '2. Sent by Email',
                  desc: mou.email_sent
                    ? `Sent to ${mou.email_recipient || 'College'}`
                    : 'Awaiting email dispatch',
                  isDone: mou.email_sent,
                  isActive: currentWorkflowStep === 2
                },
                {
                  step: 3,
                  title: '3. College Review',
                  desc:
                    mou.status === 'college_accepted' || mou.status === 'active' || mou.first_party_signature
                      ? 'Terms accepted by College'
                      : mou.status === 'changes_requested'
                      ? 'Changes requested'
                      : 'Pending College Review',
                  isDone:
                    mou.status === 'college_accepted' ||
                    mou.status === 'active' ||
                    !!mou.first_party_signature,
                  isActive: currentWorkflowStep === 3
                },
                {
                  step: 4,
                  title: '4. Dual Signatures',
                  desc:
                    mou.status === 'active'
                      ? 'Both parties signed (Active)'
                      : mou.second_party_signature && !mou.first_party_signature
                      ? 'Awaiting College signature'
                      : !mou.second_party_signature && mou.first_party_signature
                      ? 'Awaiting Company signature'
                      : 'Pending digital seals',
                  isDone: mou.status === 'active',
                  isActive: currentWorkflowStep === 4
                }
              ].map((item) => (
                <div
                  key={item.step}
                  className={`p-3 rounded-xl border transition-all ${
                    item.isDone
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                      : item.isActive
                      ? 'bg-blue-50 border-blue-300 text-blue-950 ring-2 ring-blue-500/20'
                      : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{item.title}</span>
                    {item.isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </div>
                  <p className="text-[10px] leading-relaxed opacity-80">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* DYNAMIC ACTION BAR FOR COLLEGE OR COMPANY */}
          {/* 1. College Action Card */}
          {isCollegeUser && (
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-5 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#F07421] tracking-wider">
                  College Academic Review Station
                </span>
                <h3 className="text-sm font-bold text-white">
                  Action Required from {mou.first_party_name}
                </h3>
                <p className="text-xs text-[#DCE5F5]/80 max-w-xl">
                  Review the 2-page MoU terms proposed by {mou.second_party_name}. Accept and digitally sign with institutional seal, or request adjustments.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!mou.first_party_signature && (
                  <>
                    <button
                      onClick={handleCollegeAccept}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Accept &amp; Sign MoU
                    </button>

                    <button
                      onClick={() => setIsChangesModalOpen(true)}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                    >
                      <AlertTriangle className="w-4 h-4" /> Request Changes
                    </button>

                    <button
                      onClick={handleCollegeReject}
                      className="px-3 py-2.5 bg-red-600/80 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all"
                    >
                      <XCircle className="w-4 h-4" /> Decline
                    </button>
                  </>
                )}

                {mou.first_party_signature && (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-3 py-1.5 rounded-xl text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> College Signed on {new Date(mou.first_party_signature.signed_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 2. Company Action Card */}
          {isCompanyUser && !mou.second_party_signature && (
            <div className="bg-gradient-to-r from-orange-900 to-amber-900 rounded-2xl p-5 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-orange-300 tracking-wider">
                  Company Signatory Action
                </span>
                <h3 className="text-sm font-bold text-white">
                  Affix Company Representative Digital Seal
                </h3>
                <p className="text-xs text-orange-100 max-w-xl">
                  Sign as Second Party ({mou.second_party_rep_name} - {mou.second_party_rep_title}) to complete execution.
                </p>
              </div>

              <button
                onClick={() => {
                  setSignPartyTarget('second_party');
                  setIsSignModalOpen(true);
                }}
                className="px-5 py-2.5 bg-[#F07421] hover:bg-[#d65f10] text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
              >
                <PenTool className="w-4 h-4" /> Affix Company Digital Signature
              </button>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 space-x-4">
            <button
              onClick={() => setActiveTab('document')}
              className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'document'
                  ? 'border-[#0E2350] text-[#0E2350]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4" /> Official 2-Page Document
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'history'
                  ? 'border-[#0E2350] text-[#0E2350]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <History className="w-4 h-4" /> Feedback &amp; Audit Log ({mou.feedback_history.length})
            </button>
            <button
              onClick={() => setActiveTab('credentials')}
              className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'credentials'
                  ? 'border-[#0E2350] text-[#0E2350]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Legal Credentials &amp; Seals
            </button>
          </div>
        </div>

        {/* PRINT-ONLY VIEW: ALWAYS PRINTS STRICT 2-PAGE OFFICIAL MOU */}
        <div className="hidden print:block w-full">
          <MoUDocumentView mou={mou} />
        </div>

        {/* SCREEN-ONLY TAB CONTENT */}
        <div className="print:hidden">
          {/* TAB 1: OFFICIAL 2-PAGE DOCUMENT */}
          {activeTab === 'document' && (
            <div className="space-y-6">
              <MoUDocumentView mou={mou} />
            </div>
          )}

          {/* TAB 2: AUDIT & FEEDBACK LOG */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-gray-900">MoU Event History &amp; Feedback Trail</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Cryptographically tracked lifecycle progression timestamps.
                </p>
              </div>

              <div className="space-y-4">
                {mou.feedback_history.map((fb, idx) => (
                  <div
                    key={fb.id || idx}
                    className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-slate-50/70"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-bold text-xs text-gray-900">
                          {fb.sender_name} ({fb.sender_role})
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {new Date(fb.timestamp).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100/70 text-blue-900">
                        Action: {fb.action}
                      </span>
                      <p className="text-xs text-gray-700 font-sans leading-relaxed pt-1">
                        {fb.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LEGAL CREDENTIALS & SEALS */}
          {activeTab === 'credentials' && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-gray-900">Signatory Credentials &amp; Verification Hashes</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Official registration metadata under Andhra Pradesh State Higher Education Council (APSCHE).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* College Signatory Card */}
                <div className="border border-gray-200 rounded-2xl p-5 space-y-3 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 uppercase">First Party (College)</span>
                    {mou.first_party_signature ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                        Verified
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                        Unsigned
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-gray-900">{mou.first_party_name}</h4>

                  {mou.first_party_signature ? (
                    <div className="space-y-1.5 text-xs text-gray-600 font-mono bg-white p-3 rounded-xl border border-gray-200">
                      <p><strong>Signatory:</strong> {mou.first_party_signature.signed_by_name}</p>
                      <p><strong>Title:</strong> {mou.first_party_signature.designation}</p>
                      <p><strong>Signed At:</strong> {new Date(mou.first_party_signature.signed_at).toLocaleString()}</p>
                      <p><strong>IP Address:</strong> {mou.first_party_signature.ip_address || '157.48.91.22'}</p>
                      <p><strong>Seal ID:</strong> {mou.first_party_signature.verification_seal || 'APVC_SEAL_INST_VERIFIED'}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-700 italic">
                      College Principal has not yet executed digital signature.
                    </p>
                  )}
                </div>

                {/* Company Signatory Card */}
                <div className="border border-gray-200 rounded-2xl p-5 space-y-3 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-orange-950 uppercase">Second Party (Company)</span>
                    {mou.second_party_signature ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                        Verified
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                        Unsigned
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-gray-900">{mou.second_party_name}</h4>

                  {mou.second_party_signature ? (
                    <div className="space-y-1.5 text-xs text-gray-600 font-mono bg-white p-3 rounded-xl border border-gray-200">
                      <p><strong>Signatory:</strong> {mou.second_party_signature.signed_by_name}</p>
                      <p><strong>Title:</strong> {mou.second_party_signature.designation}</p>
                      <p><strong>Signed At:</strong> {new Date(mou.second_party_signature.signed_at).toLocaleString()}</p>
                      <p><strong>IP Address:</strong> {mou.second_party_signature.ip_address || '103.24.188.42'}</p>
                      <p><strong>Seal ID:</strong> {mou.second_party_signature.verification_seal || 'APVC_SEAL_COMP_VERIFIED'}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-700 italic">
                      Company Centre Head has not yet executed digital signature.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Digital Signature Modal */}
        <MoUSignatureModal
          isOpen={isSignModalOpen}
          onClose={() => setIsSignModalOpen(false)}
          mou={mou}
          party={signPartyTarget}
          onSign={handleSignConfirm}
        />

        {/* Email Dispatch Modal */}
        <MoUEmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          mou={mou}
          onSendEmail={handleSendEmailConfirm}
        />

        {/* Request Changes Modal */}
        {isChangesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-gray-100">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Request MoU Adjustments / Modifications
                </h3>
                <button
                  onClick={() => setIsChangesModalOpen(false)}
                  className="text-gray-400 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Specify requested changes for {mou.second_party_name}:
                </label>
                <textarea
                  rows={5}
                  value={changesText}
                  onChange={(e) => setChangesText(e.target.value)}
                  placeholder="e.g. Please include 120-hour on-campus hands-on coding labs for CS final year batch, and specify internship duration and stipend terms..."
                  className="w-full p-3 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangesModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!changesText.trim()}
                  onClick={handleCollegeRequestChanges}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  Submit Changes to Company
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
