// ============================================================================
// AP VIDYACONNECT — BATCH ACTIVATION CONFIRMATION MODAL
// Item 1: Pre-activation verification of company, college, seats, dates & stipend
// ============================================================================

import React from 'react';
import { InternshipBatch } from '../../types/database';
import { db } from '../../services/dbStore';
import {
  AlertTriangle,
  Building2,
  School,
  Calendar,
  Users,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  X,
  MailCheck,
  UserCheck
} from 'lucide-react';

interface BatchActivationModalProps {
  batch: InternshipBatch;
  onConfirm: () => void;
  onClose: () => void;
}

export const BatchActivationModal: React.FC<BatchActivationModalProps> = ({
  batch,
  onConfirm,
  onClose
}) => {
  const students = batch.students || [];
  const totalStudents = students.length;

  // Calculate students who already have active accounts
  const existingAccountsCount = students.filter((s) => {
    const stu = db.students.find((st) => st.id === s.student_id) || s.student;
    return !!stu?.auth_user_id || stu?.account_status === 'active';
  }).length;

  const newAccountsCount = totalStudents - existingAccountsCount;

  return (
    <div className="fixed inset-0 z-50 bg-[#07132c]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 text-left">
        {/* Header Ribbon */}
        <div className="h-2 bg-gradient-to-r from-[#F07421] via-amber-400 to-[#1C8A3C]" />

        <div className="p-6 sm:p-7 space-y-6">
          {/* Title & Close */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#FFF3EA] border border-[#F07421]/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-[#F07421]" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F07421] bg-[#FFF3EA] px-2 py-0.5 rounded">
                  State Verification Protocol
                </span>
                <h3 className="text-lg font-extrabold text-[#0E2350] mt-0.5">
                  Activate Internship Batch
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Primary Confirmation Prompt */}
          <div className="bg-[#EEF2FA] border border-[#2A4E96]/20 p-4 rounded-xl text-xs text-[#0E2350] space-y-1">
            <p className="font-bold text-sm text-[#0E2350]">
              Are you sure you want to activate this internship batch?
            </p>
            <p className="text-gray-600 leading-relaxed">
              Student portal accounts will be created and verified for direct login access.
            </p>
          </div>

          {/* Specification Summary Grid */}
          <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-4 text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500 font-semibold">Internship Title:</span>
              <span className="font-bold text-[#0E2350] text-right">{batch.title}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[10px] font-bold uppercase text-gray-400 block">Host Company</span>
                <span className="font-bold text-[#F07421] flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {batch.company?.name || 'Partner Company'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-gray-400 block">Academic Institution</span>
                <span className="font-bold text-[#0E2350] flex items-center gap-1 mt-0.5">
                  <School className="w-3.5 h-3.5 text-[#2A4E96]" />
                  {batch.institution?.name || 'Government College'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-gray-400 block">Internship Duration</span>
                <span className="font-bold text-gray-800 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  {batch.start_date} to {batch.end_date}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-gray-400 block">Monthly Stipend</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                  <IndianRupee className="w-3.5 h-3.5" />
                  ₹{(batch.stipend || batch.stipend_amount)?.toLocaleString()} / month
                </span>
              </div>
            </div>

            {/* Candidate & Account Metrics Banner */}
            <div className="pt-2 border-t border-gray-200 grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Total Candidates</span>
                <span className="text-base font-extrabold text-[#0E2350]">{totalStudents}</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Accounts to Create</span>
                <span className="text-base font-extrabold text-[#F07421]">{newAccountsCount}</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs col-span-2 sm:col-span-1">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Existing Accounts</span>
                <span className="text-base font-extrabold text-emerald-700">{existingAccountsCount}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-6 py-2.5 rounded-xl bg-[#1C8A3C] hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm & Activate Batch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
