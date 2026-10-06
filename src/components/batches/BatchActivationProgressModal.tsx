// ============================================================================
// AP VIDYACONNECT — ACTIVATION PROGRESS MODAL
// Step-by-step progress UI for student account provisioning & batch activation
// ============================================================================

import React from 'react';
import { ActivationProgressUpdate } from '../../services/batchActivationService';
import {
  CheckCircle2,
  Loader2,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface BatchActivationProgressModalProps {
  progress: ActivationProgressUpdate;
  onClose: () => void;
  onViewLogs?: () => void;
}

export const BatchActivationProgressModal: React.FC<BatchActivationProgressModalProps> = ({
  progress,
  onClose
}) => {
  const isComplete = progress.step === 'complete' || progress.percent >= 100;

  return (
    <div className="fixed inset-0 z-50 bg-[#07132c]/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 text-left">
        {/* Top Gradient Ribbon */}
        <div className="h-2 bg-gradient-to-r from-[#F07421] via-amber-400 to-[#1C8A3C]" />

        <div className="p-6 sm:p-7 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              isComplete ? 'bg-emerald-100 text-[#1C8A3C]' : 'bg-[#EEF2FA] text-[#0E2350]'
            }`}>
              {isComplete ? (
                <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
              ) : (
                <Loader2 className="w-7 h-7 animate-spin text-[#F07421]" />
              )}
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0E2350] bg-[#EEF2FA] px-2 py-0.5 rounded font-mono">
                {isComplete ? 'SUCCESSFULLY ACTIVATED' : 'PROVISIONING COHORT'}
              </span>
              <h3 className="text-xl font-extrabold text-[#0E2350] mt-0.5">
                {isComplete ? 'Activation Complete' : 'Activating Internship Batch...'}
              </h3>
            </div>
          </div>

          {/* Dynamic Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#0E2350]">
              <span>{progress.message}</span>
              <span className="font-mono text-[#F07421]">{progress.percent}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200/80">
              <div
                className="h-full bg-gradient-to-r from-[#F07421] to-[#1C8A3C] transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(5, progress.percent)}%` }}
              />
            </div>
          </div>

          {/* Sequential Step Status List */}
          <div className="bg-[#F6F7F9] rounded-xl p-4 space-y-2.5 text-xs font-semibold">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#1C8A3C] shrink-0" />
              <span className="text-gray-800">Batch parameters validated</span>
            </div>

            <div className="flex items-center gap-2.5">
              {progress.percent >= 50 ? (
                <CheckCircle2 className="w-4 h-4 text-[#1C8A3C] shrink-0" />
              ) : (
                <Loader2 className="w-4 h-4 animate-spin text-[#F07421] shrink-0" />
              )}
              <span className={progress.percent >= 50 ? 'text-gray-800' : 'text-gray-400'}>
                Confirmed student roster loaded ({progress.totalStudents} candidates)
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {progress.percent >= 80 ? (
                <CheckCircle2 className="w-4 h-4 text-[#1C8A3C] shrink-0" />
              ) : progress.percent >= 50 ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#F07421] shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
              )}
              <span className={progress.percent >= 80 ? 'text-gray-800' : 'text-gray-400'}>
                Provisioning student portal accounts & credentials...
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {isComplete ? (
                <CheckCircle2 className="w-4 h-4 text-[#1C8A3C] shrink-0" />
              ) : progress.percent >= 80 ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#F07421] shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
              )}
              <span className={isComplete ? 'text-gray-800 font-bold text-emerald-800' : 'text-gray-400'}>
                Finalizing state audit ledger & activating batch
              </span>
            </div>
          </div>

          {/* Results Summary Box (Shown on completion) */}
          {isComplete && (
            <div className="bg-[#EAF6EE] border border-[#1C8A3C]/30 rounded-xl p-4 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                Activation Results Summary
              </div>

              <div className="grid grid-cols-2 gap-3 text-center text-xs">
                <div className="bg-white p-3 rounded-lg border border-emerald-200">
                  <span className="text-[10px] text-gray-500 block uppercase font-bold">Total Candidates</span>
                  <span className="text-lg font-black text-[#0E2350]">{progress.totalStudents}</span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-emerald-200">
                  <span className="text-[10px] text-gray-500 block uppercase font-bold">Accounts Activated</span>
                  <span className="text-lg font-black text-[#1C8A3C]">{progress.accountsCreated || progress.totalStudents}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          {isComplete && (
            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0E2350] hover:bg-[#14336F] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Done & View Workspace</span>
                <ArrowRight className="w-4 h-4 text-[#F07421]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
