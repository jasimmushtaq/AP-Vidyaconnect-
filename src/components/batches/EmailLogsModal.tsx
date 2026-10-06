// ============================================================================
// AP VIDYACONNECT — EMAIL LOGS & RETRY MODAL
// Item 8 & 11: Realtime delivery audit roster & failed email retry trigger
// ============================================================================

import React, { useState } from 'react';
import { EmailLog } from '../../types/database';
import { BatchActivationService } from '../../services/batchActivationService';
import { db } from '../../services/dbStore';
import { useAuth } from '../../context/AuthContext';
import {
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  X,
  ShieldCheck,
  Send,
  AlertCircle
} from 'lucide-react';

interface EmailLogsModalProps {
  batchId: string;
  batchCode?: string;
  batchTitle?: string;
  logs: EmailLog[];
  onClose: () => void;
  onRefreshLogs?: () => void;
}

export const EmailLogsModal: React.FC<EmailLogsModalProps> = ({
  batchId,
  batchCode,
  batchTitle,
  logs: initialLogs,
  onClose,
  onRefreshLogs
}) => {
  const { currentUser } = useAuth();
  const [retrying, setRetrying] = useState(false);
  const [logs, setLogs] = useState<EmailLog[]>(initialLogs || db.getBatchEmailLogs(batchId));
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const sentCount = logs.filter((l) => l.status === 'sent').length;
  const failedCount = logs.filter((l) => l.status === 'failed').length;
  const pendingCount = logs.filter((l) => l.status === 'pending').length;

  const handleRetryFailed = async () => {
    setRetrying(true);
    setStatusMessage(null);
    try {
      const res = await BatchActivationService.retryFailedEmails(batchId, currentUser);
      const updated = db.getBatchEmailLogs(batchId);
      setLogs([...updated]);
      if (res.succeeded > 0) {
        setStatusMessage({ text: `Successfully delivered ${res.succeeded} email(s) via Resend!` });
      } else {
        setStatusMessage({ text: `Retry attempt completed: ${res.failed} failed.`, isError: true });
      }
      onRefreshLogs?.();
    } catch (err: any) {
      setStatusMessage({ text: `Retry error: ${err.message || 'Failed to dispatch retry'}`, isError: true });
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07132c]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 text-left flex flex-col max-h-[90vh]">
        {/* Top Gradient Ribbon */}
        <div className="h-2 bg-gradient-to-r from-[#F07421] via-amber-400 to-[#1C8A3C]" />

        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FA] text-[#0E2350] flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold font-mono bg-[#EEF2FA] text-[#0E2350] px-2 py-0.5 rounded">
                  {batchCode || 'BATCH-LOGS'}
                </span>
                <span className="text-xs text-gray-500 font-semibold">Resend Delivery Audit</span>
              </div>
              <h3 className="text-base font-extrabold text-[#0E2350] mt-0.5">
                Student Email Delivery Status
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

        {/* Stats Metrics Header */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-bold text-emerald-700">
              <CheckCircle2 className="w-4 h-4" /> {sentCount} Sent
            </span>
            <span className={`flex items-center gap-1.5 font-bold ${failedCount > 0 ? 'text-rose-600' : 'text-gray-400'}`}>
              <XCircle className="w-4 h-4" /> {failedCount} Failed
            </span>
            {pendingCount > 0 && (
              <span className="flex items-center gap-1.5 font-bold text-amber-700">
                <Clock className="w-4 h-4" /> {pendingCount} Pending
              </span>
            )}
          </div>

          {failedCount > 0 && (
            <button
              onClick={handleRetryFailed}
              disabled={retrying}
              className="px-3.5 py-1.5 bg-[#F07421] hover:bg-[#D96214] disabled:opacity-50 text-white rounded-lg font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
              {retrying ? 'Retrying...' : 'Retry Failed Emails'}
            </button>
          )}
        </div>

        {statusMessage && (
          <div
            className={`mx-6 mt-4 p-3 rounded-lg text-xs font-semibold flex items-center gap-2 border ${
              statusMessage.isError
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {statusMessage.isError ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            )}
            {statusMessage.text}
          </div>
        )}

        {/* Logs Scrollable Roster */}
        <div className="p-6 overflow-y-auto space-y-2.5 flex-1 text-xs">
          {logs.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Mail className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="font-semibold">No email logs found for this batch yet.</p>
              <p className="text-[11px] mt-0.5">Activate the batch to trigger onboarding notices.</p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl border border-gray-200/80 bg-white hover:border-gray-300 transition-all flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0E2350] truncate">
                      {log.student_name || 'Student Candidate'}
                    </span>
                    <span className="text-[11px] text-gray-500 font-mono">
                      &lt;{log.recipient_email}&gt;
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 truncate">{log.subject}</p>
                  {log.error_message && (
                    <p className="text-[10px] text-rose-600 font-medium">{log.error_message}</p>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {log.status === 'sent' && (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Sent
                    </span>
                  )}
                  {log.status === 'failed' && (
                    <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full text-[11px]">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" /> Failed
                    </span>
                  )}
                  {log.status === 'pending' && (
                    <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0E2350] hover:bg-[#14336F] text-white font-bold text-xs transition-colors"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
