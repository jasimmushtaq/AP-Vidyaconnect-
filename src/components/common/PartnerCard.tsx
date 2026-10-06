// ============================================================================
// AP VIDYACONNECT — VERIFIED INDUSTRY PARTNER CARD COMPONENT
// Styled to match the canonical national/state internship card format
// ============================================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Company } from '../../types/database';

interface PartnerCardProps {
  company: Company;
  featured?: boolean;
}

export const PartnerCard: React.FC<PartnerCardProps> = ({ company, featured = false }) => {
  const [imageError, setImageError] = useState(false);

  // Clean company display name for "Internship by [Name]"
  const cleanName = company.name
    .replace(/ Technology Cells| Internship Program| Rural Innovation| Pvt Ltd| Private Limited| Ltd| India/gi, '')
    .trim();

  // Subtitle / category (e.g., Ministry, Sector, or Industry)
  const subtitle = company.sector || company.industry || 'Technology & Innovation';

  // Custom high-fidelity vector emblem renderer matching official national / state identity
  const renderEmblem = () => {
    switch (company.id) {
      // 1. Indian Army
      case 'comp-army':
        return (
          <div className="w-14 h-9 rounded-full bg-[#B91C1C] flex items-center justify-center shadow-sm relative overflow-hidden border border-red-700 transition-transform duration-300 group-hover:scale-105">
            <svg viewBox="0 0 100 70" className="w-10 h-7 text-amber-300 fill-current">
              <path d="M 50 12 L 53 22 L 63 22 L 55 28 L 58 38 L 50 32 L 42 38 L 45 28 L 37 22 L 47 22 Z" />
              <path d="M 28 55 L 72 25 M 28 25 L 72 55" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
        );

      // 2. TULIP
      case 'comp-tulip':
        return (
          <div className="flex items-center gap-1.5 h-12 transition-transform duration-300 group-hover:scale-105">
            <svg viewBox="0 0 40 40" className="w-10 h-10">
              <path d="M 12 30 C 12 18, 20 12, 20 25 C 20 18, 28 12, 28 30 Z" fill="#65A30D" />
              <circle cx="28" cy="14" r="5" fill="#EAB308" />
              <circle cx="12" cy="14" r="5" fill="#3B82F6" />
            </svg>
            <div className="text-left leading-none">
              <span className="font-black text-sm tracking-wider text-[#0F766E] block">TULIP</span>
              <span className="text-[6.5px] text-gray-400 font-bold tracking-tight">LEARN AND GROW</span>
            </div>
          </div>
        );

      // 3. PRATIBHA (Ministry of Rural Development)
      case 'comp-pratibha':
        return (
          <div className="flex flex-col items-center justify-center h-12 transition-transform duration-300 group-hover:scale-105">
            <svg viewBox="0 0 40 40" className="w-6 h-6 text-gray-800 fill-current">
              <path d="M 20 4 L 23 12 L 31 12 L 25 17 L 27 25 L 20 21 L 13 25 L 15 17 L 9 12 L 17 12 Z" />
              <circle cx="20" cy="30" r="4" />
            </svg>
            <span className="text-[8px] font-black uppercase tracking-widest text-gray-800 mt-0.5">RURAL</span>
          </div>
        );

      // 4. Govt of Maharashtra
      case 'comp-maha':
        return (
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-sm p-0.5 border border-amber-500 transition-transform duration-300 group-hover:scale-105">
            <div className="w-9 h-9 rounded-full border-2 border-amber-100 flex items-center justify-center text-white">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M 12 6 L 12 18 M 6 12 L 18 12" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
              </svg>
            </div>
          </div>
        );

      // 5. Bharatiya Bhasha Samiti
      case 'comp-bbs':
        return (
          <div className="flex items-center gap-1.5 h-12 px-0.5 transition-transform duration-300 group-hover:scale-105">
            <div className="w-6 h-7 shrink-0 text-gray-800">
              <svg viewBox="0 0 24 28" className="w-full h-full fill-current">
                <path d="M 12 2 L 15 8 L 22 8 L 17 12 L 19 19 L 12 15 L 5 19 L 7 12 L 2 8 L 9 8 Z" />
                <rect x="8" y="21" width="8" height="2" rx="1" />
                <circle cx="12" cy="25" r="2" />
              </svg>
            </div>
            <div className="text-left leading-tight">
              <span className="text-[9px] font-bold text-gray-900 block">भारतीय भाषा समिति</span>
              <span className="text-[7.5px] font-semibold text-gray-700 block">Bharatiya Bhasha Samiti</span>
              <span className="text-[6px] text-gray-500 block">(Ministry of Education, Govt. of India)</span>
            </div>
          </div>
        );

      // 6. Cisco Networking Academy
      case 'comp-cisco':
        return (
          <div className="flex flex-col items-center justify-center h-12 transition-transform duration-300 group-hover:scale-105">
            <span className="text-[13px] font-black tracking-tight text-[#005073] leading-none">Cisco</span>
            <span className="text-[10px] font-bold text-[#1E293B] leading-tight mt-0.5">Networking</span>
            <span className="text-[10px] font-bold text-[#1E293B] leading-none">Academy</span>
          </div>
        );

      // 7. VTU (Visvesvaraya Technological University)
      case 'comp-vtu':
        return (
          <div className="w-11 h-11 rounded-full bg-white border-2 border-emerald-600 flex items-center justify-center p-0.5 shadow-sm transition-transform duration-300 group-hover:scale-105 relative">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-50 to-orange-50 border border-orange-400 flex items-center justify-center">
              <svg viewBox="0 0 32 32" className="w-7 h-7 text-emerald-800">
                <circle cx="16" cy="16" r="14" fill="none" stroke="#047857" strokeWidth="2" />
                <circle cx="16" cy="16" r="10" fill="#EA580C" opacity="0.2" />
                <path d="M 16 6 L 18 12 L 24 12 L 19 16 L 21 22 L 16 18 L 11 22 L 13 16 L 8 12 L 14 12 Z" fill="#047857" />
                <circle cx="16" cy="16" r="3" fill="#D97706" />
              </svg>
            </div>
          </div>
        );

      // 8. AMRUTAM 2.0 PIN Wells
      case 'comp-amrut':
        return (
          <div className="flex flex-col items-center justify-center h-12 transition-transform duration-300 group-hover:scale-105">
            <div className="flex items-center gap-1">
              <svg viewBox="0 0 60 28" className="w-14 h-7 text-[#0284C7]">
                <path d="M 4 22 C 16 4, 24 4, 34 22 C 40 10, 48 10, 56 22" fill="none" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 10 24 C 20 12, 28 12, 36 24 C 42 16, 50 16, 54 24" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
                <circle cx="34" cy="7" r="3" fill="#EA580C" />
              </svg>
              <span className="text-[11px] font-extrabold text-[#EA580C] leading-none">अमृत 2.0</span>
            </div>
            <span className="text-[6.5px] font-semibold text-gray-600 text-center leading-tight">
              Atal Mission for Rejuvenation and Urban Transformation
            </span>
          </div>
        );

      // 9. NHIDCL
      case 'comp-nhidcl':
        return (
          <div className="flex flex-col items-center justify-center h-12 transition-transform duration-300 group-hover:scale-105">
            <div className="flex items-center gap-1">
              <svg viewBox="0 0 50 30" className="w-10 h-7 text-gray-900">
                <polygon points="25,4 46,26 4,26" fill="none" stroke="#0F172A" strokeWidth="2" />
                <line x1="25" y1="4" x2="25" y2="26" stroke="#0284C7" strokeWidth="2" />
                <line x1="25" y1="4" x2="15" y2="26" stroke="#0284C7" strokeWidth="1" />
                <line x1="25" y1="4" x2="35" y2="26" stroke="#0284C7" strokeWidth="1" />
              </svg>
              <span className="text-[12px] font-black tracking-tight text-gray-900">NHIDCL</span>
            </div>
            <span className="text-[5.5px] font-bold tracking-tight text-gray-500 uppercase mt-0.5">
              BUILDING INFRASTRUCTURE • BUILDING THE NATION
            </span>
          </div>
        );

      // 10. AICTE Research
      case 'comp-aicte':
        return (
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center p-1 shadow-sm border border-amber-400 transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full rounded-full bg-[#1E3A8A] flex flex-col items-center justify-center text-white border border-amber-200">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-300 fill-current">
                <path d="M 12 2 L 14 6 L 19 6 L 15 10 L 17 15 L 12 12 L 7 15 L 9 10 L 5 6 L 10 6 Z" />
              </svg>
              <span className="text-[5.5px] font-black tracking-widest text-amber-200">AICTE</span>
            </div>
          </div>
        );

      // 11. Land Ports Authority
      case 'comp-lpai':
        return (
          <div className="w-11 h-11 rounded-full bg-white border-2 border-orange-500 flex items-center justify-center p-0.5 shadow-sm transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full rounded-full border border-emerald-600 flex flex-col items-center justify-center text-gray-800 bg-orange-50/30">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-emerald-800 fill-current">
                <circle cx="12" cy="12" r="9" fill="none" stroke="#EA580C" strokeWidth="1.5" />
                <path d="M 12 5 L 14 10 L 19 10 L 15 13 L 17 18 L 12 15 L 7 18 L 9 13 L 5 10 L 10 10 Z" />
              </svg>
              <span className="text-[5px] font-bold text-gray-700">LPAI</span>
            </div>
          </div>
        );

      // 12. Edunet Foundation
      case 'comp-edunet':
        return (
          <div className="flex flex-col items-center justify-center h-12 transition-transform duration-300 group-hover:scale-105">
            <span className="text-[17px] font-black tracking-tight text-[#0F172A] leading-none">
              edu<span className="text-[#B91C1C]">net</span>
            </span>
            <span className="text-[8px] tracking-widest text-gray-500 uppercase -mt-0.5 font-semibold">foundation</span>
          </div>
        );

      // 13. PixelWind Technology
      case 'comp-001':
        return (
          <img
            src="/brand/pixelwind-logo.png"
            alt="PixelWind Technologies"
            className="max-h-12 max-w-[130px] object-contain transition-transform duration-300 group-hover:scale-105"
          />
        );

      default:
        if (company.logo_url && !imageError) {
          return (
            <img
              src={company.logo_url}
              alt={`${company.name} Logo`}
              onError={() => setImageError(true)}
              className="max-h-12 max-w-[130px] object-contain transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          );
        }
        return (
          <div className="w-12 h-12 rounded-2xl bg-[#0E2350] text-[#F07421] font-black text-lg flex items-center justify-center shadow-sm">
            {cleanName.charAt(0)}
          </div>
        );
    }
  };

  const actionText = company.id === 'comp-vtu' ? 'VIEW ROLES' : 'OPEN';

  return (
    <Link
      to={`/partners/${company.id}`}
      className={`group relative rounded-2xl border ${
        featured
          ? 'bg-[#FFF8F0] border-[#FCE2CE] shadow-[0_4px_16px_rgba(240,116,33,0.06)]'
          : 'bg-white border-[#EBECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
      } p-5 sm:p-6 flex flex-col items-center justify-between text-center min-h-[210px] sm:min-h-[225px] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 hover:border-[#F07421]/40 transition-all duration-300 cursor-pointer overflow-hidden`}
    >
      {/* Top: Seamless Logo / Emblem Floating Container */}
      <div className="h-14 sm:h-16 w-full flex items-center justify-center mb-2 px-1">
        {renderEmblem()}
      </div>

      {/* Middle: Title & Department/Sector Subtitle */}
      <div className="space-y-1 w-full px-1">
        <h3
          className="text-xs sm:text-[13px] font-bold text-[#1E293B] group-hover:text-[#0E2350] leading-snug line-clamp-2"
          title={`Internship by ${cleanName}`}
        >
          Internship by {cleanName}
        </h3>
        <p
          className="text-[11px] text-[#64748B] font-medium line-clamp-1"
          title={subtitle}
        >
          {subtitle}
        </p>
      </div>

      {/* Bottom: OPEN ↗ or VIEW ROLES ↗ Action */}
      <div className="pt-3 w-full flex items-center justify-center">
        <span className="text-[11px] font-bold tracking-widest text-[#5B50A0] group-hover:text-[#3730A3] uppercase flex items-center gap-1 transition-colors group-hover:underline">
          {actionText} <span className="text-xs font-mono font-normal">↗</span>
        </span>
      </div>
    </Link>
  );
};

