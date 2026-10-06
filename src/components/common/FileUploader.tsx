import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, FileText, X } from 'lucide-react';
import { uploadToCloudinary } from '../../services/cloudinaryService';

interface FileUploaderProps {
  label: string;
  folderKind: string;
  accept?: string;
  maxSizeMB?: number;
  onUploadComplete?: (doc: { url: string; public_id: string; filename: string }) => void;
  className?: string;
  helpText?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  label,
  folderKind,
  accept = '.pdf,.png,.jpg,.jpeg,.docx',
  maxSizeMB = 5,
  onUploadComplete,
  className = '',
  helpText,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds maximum permitted ${maxSizeMB} MB limit.`);
      return;
    }

    setFile(selectedFile);
    performCloudinaryUpload(selectedFile);
  };

  const performCloudinaryUpload = async (f: File) => {
    setUploading(true);
    setProgress(25);

    try {
      setProgress(50);
      const res = await uploadToCloudinary(f, { folder: `platform/${folderKind}` });
      setProgress(100);
      setUploading(false);
      const finalUrl = res.secure_url || res.url;
      setUploadedUrl(finalUrl);
      if (onUploadComplete) {
        onUploadComplete({ url: finalUrl, public_id: res.public_id, filename: f.name });
      }
    } catch (err) {
      setUploading(false);
      setError('Failed to upload file to Cloudinary cloud storage.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadedUrl(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-xs font-bold text-[#0E2350] uppercase tracking-wide">
        {label}
      </label>

      {!file ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#E3E6EB] hover:border-[#2A4E96] bg-[#F6F7F9] hover:bg-[#EEF2FA]/50 rounded-lg p-5 text-center cursor-pointer transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
          <UploadCloud className="w-8 h-8 text-[#2A4E96] mx-auto mb-2" />
          <p className="text-xs font-medium text-gray-700">
            Click to upload or drag & drop document
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            Accepted: {accept} (Max {maxSizeMB} MB)
          </p>
          {helpText && <p className="text-[10px] text-[#2A4E96] font-medium mt-1.5">{helpText}</p>}
        </div>
      ) : (
        <div className="border border-[#E3E6EB] bg-white rounded-lg p-3.5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText className="w-6 h-6 text-[#0E2350] shrink-0" />
              <div className="truncate">
                <p className="text-xs font-bold text-gray-800 truncate">{file.name}</p>
                <p className="text-[10px] text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB • Cloudinary Encrypted</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {uploading ? (
                <div className="flex items-center gap-2 text-xs text-[#2A4E96] font-medium">
                  <span>Uploading {progress}%</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </span>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-gray-400 hover:text-rose-600 p-1 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {uploading && (
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className="bg-[#1C8A3C] h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-rose-600 flex items-center gap-1 mt-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
};
