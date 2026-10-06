// ============================================================================
// AP VIDYACONNECT — REALTIME FLOATING TOASTER
// Highly responsive notification toast popups with countdowns and quick actions
// ============================================================================

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications, RealtimeToast } from '../../context/NotificationContext';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  GraduationCap,
  CalendarCheck2,
  Sparkles,
  X,
  ExternalLink,
  ShieldCheck,
  Check,
  Award
} from 'lucide-react';

export const NotificationToaster: React.FC = () => {
  const { toasts, dismissToast, markAsRead } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <aside
      aria-label="Realtime Notification Alerts"
      className="fixed top-20 right-4 sm:right-6 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => dismissToast(toast.id)}
          onMarkRead={() => {
            markAsRead(toast.notification.id);
            dismissToast(toast.id);
          }}
        />
      ))}
    </aside>
  );
};

interface ToastItemProps {
  toast: RealtimeToast;
  onDismiss: () => void;
  onMarkRead: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss, onMarkRead }) => {
  const { notification, durationMs } = toast;

  // Auto-dismiss countdown
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, durationMs || 6000);

    return () => clearTimeout(timer);
  }, [durationMs, onDismiss]);

  const getIconAndStyle = () => {
    const type = notification.type || notification.notification_type;
    switch (type) {
      case 'attendance_alert':
      case 'ATTENDANCE_MARKED':
      case 'attendance_marked':
        return {
          icon: <CalendarCheck2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          badge: 'Live Attendance',
          bgBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          accentBorder: 'border-l-emerald-500'
        };
      case 'mou_active':
      case 'mou_signed':
      case 'mou_created':
      case 'mou_sent':
      case 'mou_accepted':
        return {
          icon: <FileCheck2 className="w-5 h-5 text-blue-600 shrink-0" />,
          badge: 'Institutional MoU',
          bgBadge: 'bg-blue-50 text-blue-700 border-blue-200',
          accentBorder: 'border-l-blue-500'
        };
      case 'proposal_submitted':
      case 'proposal_accepted':
      case 'proposal_reviewed':
        return {
          icon: <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />,
          badge: 'Internship Proposal',
          bgBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          accentBorder: 'border-l-indigo-500'
        };
      case 'task_assigned':
      case 'task_submitted':
      case 'task_reviewed':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />,
          badge: 'Batch Milestone',
          bgBadge: 'bg-amber-50 text-amber-700 border-amber-200',
          accentBorder: 'border-l-amber-500'
        };
      case 'certificate_issued':
        return {
          icon: <Award className="w-5 h-5 text-purple-600 shrink-0" />,
          badge: 'Certified Credential',
          bgBadge: 'bg-purple-50 text-purple-700 border-purple-200',
          accentBorder: 'border-l-purple-500'
        };
      default:
        return {
          icon: <Bell className="w-5 h-5 text-[#F07421] shrink-0" />,
          badge: 'Realtime Alert',
          bgBadge: 'bg-orange-50 text-[#F07421] border-orange-200',
          accentBorder: 'border-l-[#F07421]'
        };
    }
  };

  const style = getIconAndStyle();

  return (
    <div
      role="alert"
      className={`pointer-events-auto bg-white rounded-xl shadow-2xl border border-gray-200/90 border-l-4 ${style.accentBorder} p-4 transition-all transform animate-in slide-in-from-right-5 fade-in duration-300 relative overflow-hidden group hover:shadow-3xl`}
    >
      {/* Top row: Icon + Type Pill + Live Pulse Indicator + Close */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {style.icon}
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${style.bgBadge}`}>
            {style.badge}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Realtime
          </span>
        </div>

        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-700 p-1 rounded-md transition-colors"
          title="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="mt-2 text-left">
        <h4 className="text-xs font-bold text-[#0E2350] leading-snug">{notification.title}</h4>
        <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">{notification.message}</p>
      </div>

      {/* Action Buttons */}
      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
        <button
          onClick={onMarkRead}
          className="text-[11px] font-semibold text-gray-500 hover:text-[#0E2350] flex items-center gap-1 transition-colors"
        >
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          Mark as read
        </button>

        {notification.link_url && (
          <Link
            to={notification.link_url}
            onClick={() => {
              onMarkRead();
              onDismiss();
            }}
            className="px-2.5 py-1 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-md text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-all hover:scale-102"
          >
            <span>Open Details</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        )}
      </div>

      {/* Subtle Bottom Auto-dismiss Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gray-100 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#F07421] to-[#16844A] animate-toast-progress"
          style={{ animationDuration: `${durationMs}ms` }}
        />
      </div>
    </div>
  );
};
