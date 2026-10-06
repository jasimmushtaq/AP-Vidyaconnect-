import React, { useState } from 'react';
import { MoUAgreement } from '../../types/database';
import {
  X,
  Mail,
  Send,
  Building2,
  School,
  FileText,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Paperclip,
  Globe
} from 'lucide-react';

interface MoUEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  mou: MoUAgreement;
  onSendEmail: (recipientEmail: string) => Promise<void> | void;
}

export const MoUEmailModal: React.FC<MoUEmailModalProps> = ({
  isOpen,
  onClose,
  mou,
  onSendEmail
}) => {
  const [emailTo, setEmailTo] = useState(
    mou.institution?.official_email ||
    (mou.first_party_name.toLowerCase().includes('unity') ? 'principal@unitydegreecollege.edu.in' : 'principal@college.edu.in')
  );
  const [ccEmail, setCcEmail] = useState('apsche.internships@ap.gov.in, verify.vidyaconnect@ap.gov.in');
  const [subject, setSubject] = useState(
    `Official MoU Proposal: ${mou.second_party_name} ↔ ${mou.first_party_name} [Ref: ${mou.mou_code}]`
  );
  const [customMessage, setCustomMessage] = useState(
    `Respected Principal / Director,

Greetings from ${mou.second_party_name}.

We are pleased to submit the official Memorandum of Understanding (MoU) under the AP VidyaConnect Industry-Academia framework for academic year 2026-2027.

Key Collaboration Highlights:
• Focus Areas: ${mou.areas_of_cooperation.join(', ')}
• Technical Engagement: ${mou.company_specialization}
• Financial Commitment: Nil (Zero financial liability on the institution)
• Duration: ${mou.validity_years} Years

Please review the official 2-page MoU on the AP VidyaConnect portal and digitally sign or submit requested modifications.

Direct Review & Signature Link:
${window.location.origin}/mous/${mou.id}

Warm regards,
${mou.second_party_rep_name || 'Authorized Signatory'}
${mou.second_party_rep_title || 'Director / Centre Head'}
${mou.second_party_name}`
  );
  const [isSending, setIsSending] = useState(false);
  const [isSentSuccess, setIsSentSuccess] = useState(false);

  if (!isOpen) return null;

  const mailtoLink = `mailto:${encodeURIComponent(emailTo.trim())}?cc=${encodeURIComponent(ccEmail.trim())}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(customMessage)}`;
  const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailTo.trim())}&cc=${encodeURIComponent(ccEmail.trim())}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(customMessage)}`;

  const handleSend = async (target: 'default' | 'gmail' = 'default') => {
    if (!emailTo.trim()) return;
    setIsSending(true);
    try {
      if (target === 'gmail') {
        window.open(gmailLink, '_blank', 'noopener,noreferrer');
      } else {
        // Trigger system default mail client (Outlook, Apple Mail, Thunderbird, Windows Mail)
        const link = document.createElement('a');
        link.href = mailtoLink;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      await onSendEmail(emailTo);
      setIsSentSuccess(true);
      setTimeout(() => {
        setIsSentSuccess(false);
        onClose();
      }, 2500);
    } catch (e) {
      console.error('Email sending error:', e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-gray-100 animate-scaleUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0E2350] to-[#14336F] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#F07421]">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Transmit MoU from Your Email</h3>
              <p className="text-xs text-[#DCE5F5]/80">Opens pre-composed email ready to send from your account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSentSuccess ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-bold text-gray-900">Email Client Opened &amp; Dispatched!</h4>
            <p className="text-xs text-gray-600 max-w-md mx-auto">
              Your email client was opened with the recipient <strong>{emailTo}</strong> and MoU reference <strong>{mou.mou_code}</strong>. The MoU status has been updated to <strong>Sent to College</strong>.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
            {/* Info notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-blue-900">
              <ExternalLink className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Sent directly from your personal / work mail account</p>
                <p className="text-blue-700 text-[11px] mt-0.5">
                  Clicking the button will open your email app (or Gmail) with all details, recipient addresses, and MoU portal link pre-filled.
                </p>
              </div>
            </div>

            {/* Context pill */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-gray-200 text-xs">
              <div className="flex items-center gap-2">
                <School className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-gray-800">{mou.first_party_name}</span>
              </div>
              <span className="font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">
                {mou.mou_code}
              </span>
            </div>

            {/* Email To */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Recipient (College Official / Principal Email)
              </label>
              <input
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="principal@college.edu.in"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* CC */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                CC (Government / Portal Registry)
              </label>
              <input
                type="text"
                value={ccEmail}
                onChange={(e) => setCcEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-gray-50 text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Subject Line
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Official Letter Body
              </label>
              <textarea
                rows={7}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full p-3 text-xs border border-gray-300 rounded-lg font-mono leading-relaxed focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Attachment preview with direct Download / Save PDF button */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-xs text-orange-950">
                  <div className="w-8 h-8 rounded-lg bg-[#F07421]/15 flex items-center justify-center text-[#F07421] shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{mou.mou_code}.pdf</p>
                    <p className="text-[10px] text-gray-600">Official Pre-Signed 2-Page MoU Document</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => window.open(`/mous/${mou.id}?print=true`, '_blank')}
                  className="text-[11px] bg-white border border-[#F07421]/40 hover:bg-orange-50 text-[#d65f10] font-bold px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <Paperclip className="w-3.5 h-3.5" /> Download / Save PDF
                </button>
              </div>

              <div className="bg-white/80 rounded-lg p-2 border border-orange-200/60 text-[10.5px] text-gray-700 leading-normal flex items-start gap-2">
                <span className="text-[#F07421] font-bold text-xs">ℹ️</span>
                <span>
                  <strong>Attaching in Email:</strong> Browser security does not allow auto-attaching local files into external mail tabs. Click <strong>&quot;Download / Save PDF&quot;</strong> above, then click the paperclip (📎) icon in your email compose window to attach it.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {!isSentSuccess && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 transition-colors text-center"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => window.open(`/mous/${mou.id}?print=true`, '_blank')}
                className="px-3.5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all"
                title="Download / Print MoU PDF"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                Download PDF
              </button>

              <button
                type="button"
                disabled={isSending || !emailTo.trim()}
                onClick={() => handleSend('gmail')}
                className="flex-1 sm:flex-initial px-6 py-2.5 bg-gradient-to-r from-[#F07421] to-[#d65f10] hover:from-[#d65f10] hover:to-[#F07421] text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-900/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                title="Open directly in Gmail Web"
              >
                {isSending ? (
                  <span>Opening Gmail...</span>
                ) : (
                  <>
                    <Globe className="w-4 h-4 text-white" />
                    Open in Gmail Web
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

