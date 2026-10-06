// ============================================================================
// AP VIDYACONNECT — GLOBAL PREMIUM MODAL & TOAST NOTIFICATION SYSTEM
// Replaces default browser alert() and confirm() with high-end glassmorphic dialogs
// ============================================================================

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  Sparkles,
  ShieldCheck,
  Award,
  ArrowRight,
  Check
} from 'lucide-react';

export type DialogType = 'success' | 'warning' | 'danger' | 'info' | 'audit';

export interface DialogOptions {
  title: string;
  message: string | ReactNode;
  subtitle?: string;
  badge?: string;
  type?: DialogType;
  confirmText?: string;
  cancelText?: string;
  isConfirm?: boolean;
  details?: { label: string; value: string }[];
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface ToastOptions {
  id?: string;
  title: string;
  message?: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  duration?: number;
}

interface ModalContextType {
  showAlert: (options: Omit<DialogOptions, 'isConfirm'>) => Promise<void>;
  showConfirm: (options: Omit<DialogOptions, 'isConfirm'>) => Promise<boolean>;
  showToast: (options: ToastOptions) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeDialog, setActiveDialog] = useState<DialogOptions | null>(null);
  const [dialogResolver, setDialogResolver] = useState<((value: boolean) => void) | null>(null);
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  const showAlert = (options: Omit<DialogOptions, 'isConfirm'>): Promise<void> => {
    return new Promise((resolve) => {
      setActiveDialog({
        ...options,
        isConfirm: false,
        type: options.type || 'info',
        confirmText: options.confirmText || 'Acknowledged'
      });
      setDialogResolver(() => () => resolve());
    });
  };

  const showConfirm = (options: Omit<DialogOptions, 'isConfirm'>): Promise<boolean> => {
    return new Promise((resolve) => {
      setActiveDialog({
        ...options,
        isConfirm: true,
        type: options.type || 'warning',
        confirmText: options.confirmText || 'Confirm Action',
        cancelText: options.cancelText || 'Cancel'
      });
      setDialogResolver(() => (result: boolean) => resolve(result));
    });
  };

  const showToast = (toast: ToastOptions) => {
    const id = toast.id || Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration || 4000);
  };

  const handleClose = (result: boolean) => {
    if (activeDialog?.onConfirm && result) activeDialog.onConfirm();
    if (activeDialog?.onCancel && !result) activeDialog.onCancel();
    if (dialogResolver) dialogResolver(result);
    setActiveDialog(null);
    setDialogResolver(null);
  };

  const getIcon = (type?: DialogType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-10 h-10 text-[#1C8A3C]" />;
      case 'warning':
        return <AlertTriangle className="w-10 h-10 text-amber-500" />;
      case 'danger':
        return <AlertCircle className="w-10 h-10 text-rose-500" />;
      case 'audit':
        return <ShieldCheck className="w-10 h-10 text-[#2A4E96]" />;
      default:
        return <Info className="w-10 h-10 text-[#0E2350]" />;
    }
  };

  const getBadgeBg = (type?: DialogType) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'danger':
        return 'bg-rose-50 border-rose-200 text-rose-800';
      case 'audit':
        return 'bg-indigo-50 border-indigo-200 text-indigo-800';
      default:
        return 'bg-[#EEF2FA] border-[#2A4E96]/20 text-[#0E2350]';
    }
  };

  const getConfirmBtnColor = (type?: DialogType) => {
    switch (type) {
      case 'success':
        return 'bg-[#1C8A3C] hover:bg-emerald-800 text-white';
      case 'warning':
        return 'bg-[#F07421] hover:bg-[#D96214] text-white';
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700 text-white';
      default:
        return 'bg-[#0E2350] hover:bg-[#14336F] text-white';
    }
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm, showToast }}>
      {children}

      {/* FLOATING TOASTS NOTIFICATION LAYER */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-gray-100 flex items-start gap-3 animate-in slide-in-from-right-8 duration-300 transition-all"
          >
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#1C8A3C]" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500" />}
              {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-[#F07421]" />}
              {(!t.type || t.type === 'info') && <Info className="w-5 h-5 text-[#0E2350]" />}
            </div>
            <div className="flex-1 text-xs">
              <p className="font-extrabold text-[#0E2350]">{t.title}</p>
              {t.message && <p className="text-gray-600 mt-0.5 leading-relaxed">{t.message}</p>}
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* GLOBAL POPUP MODAL DIALOG */}
      {activeDialog && (
        <div className="fixed inset-0 z-[9998] bg-[#07132c]/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 text-left">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300 relative">
            {/* Top State Tri-Color Ribbon */}
            <div className="h-2 bg-gradient-to-r from-[#F07421] via-amber-400 to-[#1C8A3C]" />

            <div className="p-6 sm:p-8 space-y-6">
              {/* Header Badge & Icon */}
              <div className="text-center space-y-3">
                <div className="relative inline-block">
                  <div className="w-18 h-18 p-3.5 rounded-2xl bg-[#F6F7F9] border-2 border-gray-200/80 shadow-inner flex items-center justify-center mx-auto">
                    {getIcon(activeDialog.type)}
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#F07421] text-white flex items-center justify-center shadow-md animate-bounce">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full border ${getBadgeBg(
                      activeDialog.type
                    )}`}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    {activeDialog.badge || 'AP VidyaConnect Official System'}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-[#0E2350] mt-2">
                    {activeDialog.title}
                  </h2>
                  {activeDialog.subtitle && (
                    <p className="text-xs text-gray-500 mt-0.5 font-medium">
                      {activeDialog.subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Body Content */}
              <div className="text-xs text-gray-700 leading-relaxed bg-[#F6F7F9]/80 p-4 rounded-2xl border border-gray-200/60">
                {typeof activeDialog.message === 'string' ? (
                  <p>{activeDialog.message}</p>
                ) : (
                  activeDialog.message
                )}

                {/* Optional Grid Details */}
                {activeDialog.details && activeDialog.details.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200/60 grid grid-cols-2 gap-2 text-[11px]">
                    {activeDialog.details.map((d, i) => (
                      <div key={i}>
                        <span className="text-[9px] uppercase font-bold text-gray-400 block">
                          {d.label}
                        </span>
                        <span className="font-bold text-gray-900">{d.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-1">
                {activeDialog.isConfirm && (
                  <button
                    type="button"
                    onClick={() => handleClose(false)}
                    className="flex-1 py-3 px-4 bg-white hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold border border-gray-200 transition-colors text-center"
                  >
                    {activeDialog.cancelText || 'Cancel'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleClose(true)}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 ${getConfirmBtnColor(
                    activeDialog.type
                  )}`}
                >
                  <span>{activeDialog.confirmText || 'Continue'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
