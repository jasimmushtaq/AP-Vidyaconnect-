// ============================================================================
// AP VIDYACONNECT — ACTION QUEUE BANNER
// Direct answers to: What happened? What do I do next? Who is waiting?
// ============================================================================

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';

export const ActionQueueBanner: React.FC = () => {
  const { currentRole, currentUser } = useAuth();

  const getActionItems = () => {
    const items: { title: string; subtitle: string; link: string; type: 'urgent' | 'action' | 'info' }[] = [];

    if (currentRole === 'institution_admin' || currentRole === 'faculty_coordinator') {
      // Check proposals ready for final acceptance
      const readyForAccept = db.proposals.filter(p => p.status === 'company_accepted' || p.status === 'company_accepted_with_changes');
      if (readyForAccept.length > 0) {
        items.push({
          title: `${readyForAccept.length} Proposal(s) Accepted by Company — Ready for Final Batch Creation`,
          subtitle: `PixelWind accepted terms. You must confirm final acceptance to create official batch.`,
          link: `/proposals/${readyForAccept[0].id}`,
          type: 'urgent',
        });
      }

      // Check modification requested
      const modReq = db.proposals.filter(p => p.status === 'modification_requested');
      if (modReq.length > 0) {
        items.push({
          title: `${modReq.length} Proposal(s) Require Modification`,
          subtitle: `Company requested adjustments before acceptance.`,
          link: `/proposals/${modReq[0].id}`,
          type: 'action',
        });
      }
    }

    if (currentRole === 'company_admin') {
      // Check inbound proposals
      const pendingReview = db.proposals.filter(p => p.status === 'submitted' || p.status === 'under_company_review');
      if (pendingReview.length > 0) {
        items.push({
          title: `${pendingReview.length} Inbound Proposal(s) Waiting for Your Decision`,
          subtitle: `Government Degree College submitted a proposal for ${pendingReview[0].domain}.`,
          link: `/proposals/${pendingReview[0].id}`,
          type: 'urgent',
        });
      }
    }

    if (currentRole === 'student') {
      // Check if student has joined active batch
      const activeBatch = db.batches.find(b => b.students?.some(s => s.student_id === currentUser.student_id));
      const memberInfo = activeBatch?.students?.find(s => s.student_id === currentUser.student_id);

      if (activeBatch && !memberInfo?.has_joined) {
        items.push({
          title: `Action Required: Formal "JOIN INTERNSHIP" Consent Pending`,
          subtitle: `You have been selected for ${activeBatch.title}. Sign consent to begin.`,
          link: `/my-internship`,
          type: 'urgent',
        });
      }
    }

    if (currentRole === 'super_admin') {
      const pendingInstitutions = db.institutions.filter(i => i.verification_status === 'under_verification' || i.verification_status === 'pending');
      const pendingCompanies = db.companies.filter(c => c.verification_status === 'under_verification' || c.verification_status === 'pending');

      if (pendingInstitutions.length + pendingCompanies.length > 0) {
        items.push({
          title: `${pendingInstitutions.length + pendingCompanies.length} Entity Registrations Awaiting Verification`,
          subtitle: `Review accreditation documents and legal CIN/GST records to approve.`,
          link: `/admin/verifications`,
          type: 'urgent',
        });
      }
    }

    return items;
  };

  const actionItems = getActionItems();
  if (actionItems.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {actionItems.map((item, idx) => (
        <div
          key={idx}
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-4 sm:p-5 rounded-2xl border shadow-sm transition-all relative overflow-hidden backdrop-blur-md ${
            item.type === 'urgent'
              ? 'bg-gradient-to-r from-orange-50/90 via-amber-50/70 to-white border-orange-200/80 text-slate-900 shadow-orange-500/5'
              : item.type === 'action'
              ? 'bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-white border-blue-200/80 text-[#0E2350] shadow-blue-500/5'
              : 'bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-white border-emerald-200/80 text-emerald-950 shadow-emerald-500/5'
          }`}
        >
          {/* Subtle Left Accent Line */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-1.5 ${
              item.type === 'urgent' ? 'bg-[#F07421]' : item.type === 'action' ? 'bg-[#0E2350]' : 'bg-emerald-600'
            }`}
          />

          <div className="flex items-start gap-3.5 pl-1.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                item.type === 'urgent'
                  ? 'bg-orange-100/80 border-orange-300/60 text-[#F07421]'
                  : item.type === 'action'
                  ? 'bg-blue-100/80 border-blue-300/60 text-[#2A4E96]'
                  : 'bg-emerald-100/80 border-emerald-300/60 text-emerald-700'
              }`}
            >
              {item.type === 'urgent' ? (
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              ) : item.type === 'action' ? (
                <Clock className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-extrabold tracking-tight text-slate-900">{item.title}</h4>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    item.type === 'urgent'
                      ? 'bg-[#F07421] text-white'
                      : item.type === 'action'
                      ? 'bg-[#0E2350] text-white'
                      : 'bg-emerald-700 text-white'
                  }`}
                >
                  {item.type === 'urgent' ? 'Action Required' : item.type === 'action' ? 'Pending' : 'Notice'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">{item.subtitle}</p>
            </div>
          </div>

          <Link
            to={item.link}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 self-start sm:self-center shadow-md active:scale-95 ${
              item.type === 'urgent'
                ? 'bg-gradient-to-r from-[#F07421] to-orange-600 hover:from-[#D96214] hover:to-[#C55005] text-white shadow-orange-500/20'
                : item.type === 'action'
                ? 'bg-gradient-to-r from-[#0E2350] to-[#1E3A8A] hover:from-[#081530] hover:to-[#172554] text-white shadow-blue-900/20'
                : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-emerald-700/20'
            }`}
          >
            <span>Take Action</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      ))}
    </div>
  );
};
