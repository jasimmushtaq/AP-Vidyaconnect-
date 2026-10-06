// ============================================================================
// AP VIDYACONNECT — ATTACHED PDF & COMPLIANCE DOCUMENT VIEWER MODAL
// Full-screen interactive viewer with inline PDF render, download & print
// ============================================================================

import React, { useState } from 'react';
import {
  X,
  Download,
  ExternalLink,
  Printer,
  FileText,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { downloadDocumentFile } from '../../utils/credentialsDossier';

interface DocumentViewerModalProps {
  document: {
    name: string;
    url: string;
    category?: string;
    file_type?: string;
    file_size?: string;
    uploaded_at?: string;
    uploaded_by?: string;
  };
  onClose: () => void;
  entityName?: string;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document: doc,
  onClose,
  entityName,
}) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [iframeError, setIframeError] = useState(false);

  const urlLower = doc.url.toLowerCase();
  const nameLower = doc.name.toLowerCase();

  const isRealPdfUrl = urlLower.includes('.pdf') || urlLower.startsWith('data:application/pdf') || doc.file_type === 'application/pdf';
  const isImageUrl = urlLower.match(/\.(jpg|jpeg|png|webp|gif)/) || urlLower.includes('images.unsplash.com') || urlLower.startsWith('data:image/') || doc.file_type?.includes('image');

  const handleDownload = () => {
    downloadDocumentFile(doc.url, doc.name);
  };

  const handlePrint = () => {
    const printWin = window.open(doc.url, '_blank');
    if (printWin) {
      setTimeout(() => {
        printWin.focus();
        printWin.print();
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col p-2 sm:p-4 animate-in fade-in duration-200">
      {/* Top Action Bar */}
      <div className="bg-[#0E2350] text-white px-4 py-3 rounded-t-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl border-b border-blue-900/60">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-[#F07421]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold truncate text-white">
                {doc.name}
              </h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                {doc.category?.replace(/_/g, ' ') || 'Statutory PDF'}
              </span>
            </div>
            <p className="text-[11px] text-blue-200/80 truncate">
              {entityName ? `Attached to: ${entityName}` : 'State Verified Compliance Document'} • {doc.file_size || '1.8 MB'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1 mr-1 text-xs">
            <button
              onClick={() => setZoom((z) => Math.max(z - 20, 50))}
              className="p-1 hover:bg-white/20 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 text-[11px] font-mono">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(z + 20, 200))}
              className="p-1 hover:bg-white/20 rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="p-1 hover:bg-white/20 rounded"
              title="Rotate 90°"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-lg bg-[#F07421] hover:bg-[#d96214] text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all active:scale-95"
            title="Download original file"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Print document"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Open in new window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Open Tab</span>
          </a>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-gray-300 hover:text-white transition-colors ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Document Viewport */}
      <div className="flex-1 bg-slate-950/90 rounded-b-2xl overflow-auto relative flex items-center justify-center p-3 sm:p-6">
        {isRealPdfUrl && !iframeError ? (
          <div className="w-full h-full max-w-5xl rounded-xl overflow-hidden bg-white shadow-2xl flex flex-col">
            <iframe
              src={`${doc.url}#toolbar=1&navpanes=0&scrollbar=1`}
              title={doc.name}
              className="w-full h-full border-0"
              onError={() => setIframeError(true)}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center overflow-auto py-4">
            <div
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease',
              }}
              className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 max-w-3xl w-full border border-gray-200 space-y-4"
            >
              {/* Document Header Header in preview */}
              <div className="flex items-center justify-between border-b pb-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0E2350] flex items-center justify-center font-bold">
                    AP
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0E2350]">{doc.name}</h4>
                    <p className="text-[10px] text-gray-500">Government Certified Statutory Verification Record</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  VERIFIED DOCUMENT
                </span>
              </div>

              {/* Main Document Image or Preview */}
              <div className="rounded-xl overflow-hidden border border-gray-200 max-h-[60vh] flex items-center justify-center bg-gray-50">
                <img
                  src={doc.url}
                  alt={doc.name}
                  className="max-w-full max-h-[58vh] object-contain mx-auto"
                />
              </div>

              {/* Document Metadata Footer */}
              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                <span>Category: <strong className="text-gray-700">{doc.category?.replace(/_/g, ' ') || 'Accreditation Endorsement'}</strong></span>
                <span>File Size: <strong className="text-gray-700">{doc.file_size || '2.1 MB'}</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
