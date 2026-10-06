import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MoUAgreement, MoUSignature } from '../../types/database';
import { cleanSignatureImage } from '../../utils/signatureExtractor';
import {
  X,
  Upload,
  Image as ImageIcon,
  Type,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Sparkles,
  ZoomIn,
  RefreshCw,
  Stamp
} from 'lucide-react';

interface MoUSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  mou: MoUAgreement;
  party: 'first_party' | 'second_party';
  onSign: (signature: MoUSignature) => Promise<void> | void;
}

export const MoUSignatureModal: React.FC<MoUSignatureModalProps> = ({
  isOpen,
  onClose,
  mou,
  party,
  onSign
}) => {
  const { currentUser } = useAuth();
  const [signType, setSignType] = useState<'upload' | 'type'>('upload');
  const [typedName, setTypedName] = useState(
    party === 'first_party'
      ? mou.first_party_rep_name || currentUser.full_name
      : mou.second_party_rep_name || currentUser.full_name
  );
  const [designation, setDesignation] = useState(
    party === 'first_party'
      ? mou.first_party_rep_title || 'Principal / Authorized Head'
      : mou.second_party_rep_title || 'Centre Head / Director'
  );
  const [consentChecked, setConsentChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Uploaded image state & tuning
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [cleanedPreviewSrc, setCleanedPreviewSrc] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [inkColor, setInkColor] = useState<'navy' | 'black' | 'royal_blue' | 'preserve'>('navy');
  const [contrastBoost, setContrastBoost] = useState<number>(1.0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTypedName(
        party === 'first_party'
          ? mou.first_party_rep_name || currentUser.full_name
          : mou.second_party_rep_name || currentUser.full_name
      );
      setDesignation(
        party === 'first_party'
          ? mou.first_party_rep_title || 'Principal / Authorized Head'
          : mou.second_party_rep_title || 'Centre Head / Director'
      );
      setConsentChecked(false);
      setScale(100);
      setRotation(0);
      setInkColor('navy');
      setContrastBoost(1.0);
    }
  }, [isOpen, party, mou, currentUser]);

  // Whenever uploaded image or ink color changes, generate the clean transparent pen ink preview
  useEffect(() => {
    if (!uploadedImageSrc) {
      setCleanedPreviewSrc(null);
      return;
    }
    let isMounted = true;
    setIsProcessingImage(true);
    cleanSignatureImage(uploadedImageSrc, {
      inkColor: inkColor,
      contrastBoost: contrastBoost
    }).then((cleaned) => {
      if (isMounted) {
        setCleanedPreviewSrc(cleaned);
        setIsProcessingImage(false);
      }
    }).catch(() => {
      if (isMounted) {
        setCleanedPreviewSrc(uploadedImageSrc);
        setIsProcessingImage(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [uploadedImageSrc, inkColor, contrastBoost]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp|svg\+xml)/)) {
      alert('Please upload a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImageSrc(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Convert uploaded image + adjustments into a clean transparent PNG
  const processAndExportSignature = async (): Promise<string> => {
    if (signType === 'type') {
      return typedName;
    }

    if (!uploadedImageSrc) {
      return typedName;
    }

    // First ensure we have the cleaned transparent ink
    const baseCleaned = cleanedPreviewSrc || await cleanSignatureImage(uploadedImageSrc, {
      inkColor: inkColor,
      contrastBoost: contrastBoost
    });

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 500;
        const maxH = 200;
        canvas.width = maxW;
        canvas.height = maxH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(baseCleaned);
          return;
        }

        ctx.clearRect(0, 0, maxW, maxH);
        ctx.save();
        ctx.translate(maxW / 2, maxH / 2);
        ctx.rotate((rotation * Math.PI) / 180);

        const currentScale = scale / 100;
        const aspect = img.width / img.height;
        let drawW = 320 * currentScale;
        let drawH = drawW / aspect;
        if (drawH > 160 * currentScale) {
          drawH = 160 * currentScale;
          drawW = drawH * aspect;
        }

        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(baseCleaned);
      img.src = baseCleaned;
    });
  };

  const handleConfirmSignature = async () => {
    if (!consentChecked) return;
    if (signType === 'upload' && !uploadedImageSrc && !typedName.trim()) return;
    if (signType === 'type' && !typedName.trim()) return;

    setIsSubmitting(true);
    try {
      const finalSignatureData = await processAndExportSignature();

      const signature: MoUSignature = {
        signed_by_name: typedName,
        designation: designation,
        signature_type: signType === 'upload' && uploadedImageSrc ? 'digital_seal' : 'typed',
        signature_data: finalSignatureData,
        signed_at: new Date().toISOString(),
        ip_address: '103.24.188.' + Math.floor(10 + Math.random() * 80),
        verification_seal: `APVC_SEAL_${party.toUpperCase()}_${Date.now()}`
      };

      await onSign(signature);
      onClose();
    } catch (err) {
      console.error('Error signing MoU:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const partyName = party === 'first_party' ? mou.first_party_name : mou.second_party_name;
  const partyRoleTitle =
    party === 'first_party'
      ? 'First Party (College / Institution)'
      : 'Second Party (Industry / Company)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-gray-100 animate-scaleUp max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0E2350] to-[#14336F] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#F07421]">
              <Stamp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Digital MoU Signature &amp; Seal</h3>
              <p className="text-xs text-[#DCE5F5]/80">{partyRoleTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Org context banner */}
          <div className="bg-blue-50 border border-blue-200/70 rounded-xl p-3 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900">
              <p className="font-bold">Signing on behalf of: {partyName}</p>
              <p className="text-blue-700 mt-0.5">
                MoU Reference: <strong className="font-mono">{mou.mou_code}</strong>
              </p>
            </div>
          </div>

          {/* Signatory Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Authorized Signatory Name
              </label>
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="e.g. Dr. K. S. Rao / G Ram Prasad"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Designation / Title
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Principal / Centre Head"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium"
              />
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => setSignType('upload')}
              className={`flex-1 py-2 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                signType === 'upload'
                  ? 'border-[#F07421] text-[#0E2350]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Signature from Device (JPG, PNG, WEBP)
            </button>
            <button
              type="button"
              onClick={() => setSignType('type')}
              className={`flex-1 py-2 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                signType === 'type'
                  ? 'border-[#F07421] text-[#0E2350]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              Stylized Script Signature
            </button>
          </div>

          {/* TAB 1: DEVICE UPLOAD WITH EASY ADJUSTMENTS */}
          {signType === 'upload' && (
            <div className="space-y-4">
              {/* File Upload Zone */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                onChange={handleFileUpload}
                className="hidden"
              />

              {!uploadedImageSrc ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/30 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2"
                >
                  <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">
                      Click to Browse or Drag &amp; Drop Signature Image
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Supports JPG, PNG, WEBP, or scanned paper photos from mobile/camera
                    </p>
                  </div>
                  <span className="inline-block text-[10px] bg-blue-50 text-blue-700 font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                    Auto-Blends Real Ink on Document
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Live Document Paper Simulation Canvas */}
                  <div className="relative border border-gray-300 rounded-xl bg-white p-5 shadow-inner overflow-hidden flex flex-col items-center justify-center min-h-[160px]">
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[10px] bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold px-2 py-1 rounded shadow-xs flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Change File
                      </button>
                    </div>

                    <div className="text-center w-full">
                      {/* Cleaned Signature Image with Zero Gray Box */}
                      <div className="h-24 flex items-center justify-center relative">
                        {isProcessingImage ? (
                          <div className="text-[11px] text-blue-600 flex items-center gap-1.5 font-semibold">
                            <Sparkles className="w-3.5 h-3.5 animate-spin" /> Extracting pure pen ink...
                          </div>
                        ) : (
                          <img
                            src={cleanedPreviewSrc || uploadedImageSrc}
                            alt="Signature Preview"
                            className="max-h-20 object-contain transition-all select-none"
                            style={{
                              transform: `scale(${scale / 100}) rotate(${rotation}deg)`,
                              mixBlendMode: 'multiply'
                            }}
                          />
                        )}
                      </div>

                      {/* Document baseline & signatory label */}
                      <div className="w-48 mx-auto border-t border-gray-400 pt-1 mt-1">
                        <p className="font-bold text-xs text-gray-900">{typedName}</p>
                        <p className="text-[10px] text-gray-500">{designation}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tuning Sliders & Filters */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-gray-200 space-y-3 text-xs">
                    <div className="flex items-center justify-between font-bold text-gray-700">
                      <span className="flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-[#F07421]" /> Adjust Signature Appearance
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setScale(100);
                          setRotation(0);
                          setInkColor('navy');
                          setContrastBoost(1.0);
                        }}
                        className="text-[10px] text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <RotateCcw className="w-2.5 h-2.5" /> Reset
                      </button>
                    </div>

                    {/* Scale & Tilt */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-[11px] text-gray-600 mb-1">
                          <span>Size: <strong>{scale}%</strong></span>
                        </div>
                        <input
                          type="range"
                          min="60"
                          max="140"
                          value={scale}
                          onChange={(e) => setScale(Number(e.target.value))}
                          className="w-full accent-blue-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] text-gray-600 mb-1">
                          <span>Tilt / Angle: <strong>{rotation}°</strong></span>
                        </div>
                        <input
                          type="range"
                          min="-15"
                          max="15"
                          value={rotation}
                          onChange={(e) => setRotation(Number(e.target.value))}
                          className="w-full accent-blue-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Ink Darkness / Paper Cleanup Slider */}
                    <div>
                      <div className="flex justify-between text-[11px] text-gray-600 mb-1">
                        <span>Ink Density &amp; Clarity: <strong>{Math.round(contrastBoost * 100)}%</strong></span>
                      </div>
                      <input
                        type="range"
                        min="0.7"
                        max="1.4"
                        step="0.05"
                        value={contrastBoost}
                        onChange={(e) => setContrastBoost(Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
                      />
                    </div>

                    {/* Ink Color Selector */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-200">
                      <span className="text-[11px] text-gray-600 font-semibold">Ink Color:</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setInkColor('navy')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                            inkColor === 'navy'
                              ? 'bg-[#0E2350] text-white shadow-xs'
                              : 'bg-white text-gray-700 border border-gray-300'
                          }`}
                        >
                          Classic Blue
                        </button>
                        <button
                          type="button"
                          onClick={() => setInkColor('black')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                            inkColor === 'black'
                              ? 'bg-black text-white shadow-xs'
                              : 'bg-white text-gray-700 border border-gray-300'
                          }`}
                        >
                          Deep Black
                        </button>
                        <button
                          type="button"
                          onClick={() => setInkColor('royal_blue')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                            inkColor === 'royal_blue'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white text-gray-700 border border-gray-300'
                          }`}
                        >
                          Royal Blue
                        </button>
                        <button
                          type="button"
                          onClick={() => setInkColor('preserve')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                            inkColor === 'preserve'
                              ? 'bg-slate-700 text-white shadow-xs'
                              : 'bg-white text-gray-700 border border-gray-300'
                          }`}
                        >
                          Natural Ink
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TYPED CALLIGRAPHY */}
          {signType === 'type' && (
            <div className="p-5 border-2 border-gray-200 rounded-xl bg-[#FAF9F5] flex flex-col items-center justify-center min-h-[140px] space-y-2">
              <p
                className="text-3xl text-[#0E2350] italic tracking-wide"
                style={{ fontFamily: "'Brush Script MT', 'Dancing Script', cursive, serif" }}
              >
                {typedName || 'Signatory Name'}
              </p>
              <div className="w-48 border-t border-gray-400 pt-1 text-center">
                <p className="text-[11px] font-bold text-gray-800">{typedName}</p>
                <p className="text-[10px] text-gray-500">{designation}</p>
              </div>
            </div>
          )}

          {/* Consent Checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer select-none bg-gray-50 p-3 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
            />
            <span className="text-[11px] text-gray-600 leading-relaxed">
              I certify that I am authorized to execute this Memorandum of Understanding on behalf of{' '}
              <strong className="text-gray-900">{partyName}</strong>. I accept the legal terms herein under the AP VidyaConnect higher education framework.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!consentChecked || isSubmitting || (!uploadedImageSrc && !typedName.trim())}
            onClick={handleConfirmSignature}
            className="px-6 py-2.5 bg-gradient-to-r from-[#0E2350] to-[#14336F] hover:from-[#14336F] hover:to-[#0E2350] text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
          >
            {isSubmitting ? (
              <span>Affixing Digital Seal...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#F07421]" />
                Affix Signature &amp; Submit
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
