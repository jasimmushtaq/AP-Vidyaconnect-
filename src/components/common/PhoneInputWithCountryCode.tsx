// ============================================================================
// AP VIDYACONNECT — INDIAN PHONE NUMBER INPUT WITH SEPARATE +91 COUNTRY CODE
// Strict numeric only (0–9), exactly 10 digits, blocks non-digits & special chars
// ============================================================================

import React from 'react';
import { sanitizePhoneDigits } from '../../utils/validation';
import { AlertCircle, Check } from 'lucide-react';

interface PhoneInputWithCountryCodeProps {
  label?: string;
  required?: boolean;
  value: string;
  onChange: (digits: string) => void;
  onBlur?: () => void;
  error?: string | null;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const PhoneInputWithCountryCode: React.FC<PhoneInputWithCountryCodeProps> = ({
  label,
  required,
  value,
  onChange,
  onBlur,
  error,
  placeholder = "98480 12345",
  disabled,
  className = ""
}) => {
  const digits = sanitizePhoneDigits(value);
  const isComplete = digits.length === 10;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow navigation and editing keys
    if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'].includes(e.key)) {
      return;
    }
    // Allow standard copy/paste/select-all
    if (e.ctrlKey || e.metaKey) {
      return;
    }
    // Block anything that is NOT a digit 0-9 (alphabets, spaces, symbols)
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = sanitizePhoneDigits(e.target.value);
    onChange(clean);
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block font-bold text-gray-700 uppercase mb-1 text-xs">
          {label} {required && <span className="text-rose-600">*</span>}
        </label>
      )}

      <div className={`flex rounded-lg border transition-all overflow-hidden ${
        error
          ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400'
          : isComplete
          ? 'border-emerald-500 bg-emerald-50/10'
          : 'border-[#E3E6EB] bg-[#F6F7F9] focus-within:border-[#0E2350] focus-within:ring-2 focus-within:ring-[#0E2350]/20'
      }`}>
        {/* Country Code Display (Fixed Separately) */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 border-r border-slate-300 select-none shrink-0 font-bold text-xs text-slate-700">
          <span className="text-sm leading-none">🇮🇳</span>
          <span>+91</span>
        </div>

        {/* 10-Digit Numeric Input */}
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={10}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          value={digits}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          onBlur={onBlur}
          className="w-full px-3 py-2 bg-transparent text-xs font-mono font-medium text-slate-900 focus:outline-none tracking-wider placeholder:font-sans placeholder:tracking-normal placeholder:text-gray-400"
        />

        {/* Counter / Status Badge */}
        <div className="flex items-center px-2.5 select-none shrink-0 text-[10px] font-bold">
          {isComplete ? (
            <span className="text-emerald-600 flex items-center gap-0.5">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>10/10</span>
            </span>
          ) : digits.length > 0 ? (
            <span className="text-amber-600 font-mono">
              {digits.length}/10
            </span>
          ) : (
            <span className="text-slate-400 font-mono">
              0/10
            </span>
          )}
        </div>
      </div>

      {/* Validation Message */}
      {error ? (
        <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1 animate-fade-in">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : digits.length > 0 && digits.length < 10 ? (
        <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-1 animate-fade-in">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Enter {10 - digits.length} more digit{10 - digits.length > 1 ? 's' : ''} (10 digits required)</span>
        </p>
      ) : null}
    </div>
  );
};

