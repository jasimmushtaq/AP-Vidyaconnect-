// ============================================================================
// AP VIDYACONNECT — VERIFIED INSTITUTION CARD COMPONENT
// Styled to match the canonical national/state card layout
// ============================================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Institution } from '../../types/database';
import { School, GraduationCap, Landmark, BookOpen, Building2 } from 'lucide-react';

interface InstitutionCardProps {
  institution: Institution;
  featured?: boolean;
}

export const InstitutionCard: React.FC<InstitutionCardProps> = ({ institution, featured = false }) => {
  const [imageError, setImageError] = useState(false);

  // Clean short name for "Cohort by [College Name]"
  const cleanName = institution.name
    .replace(/\(Autonomous\)/gi, '')
    .trim();

  const subtitle = `${institution.district}, ${institution.state}`;

  // Custom high-fidelity vector emblem renderer for canonical institutions
  const renderEmblem = () => {
    switch (institution.id) {
      case 'inst-001': // GDC Khairatabad
        return (
          <div className="w-11 h-11 rounded-full bg-white border-2 border-[#0E2350] flex items-center justify-center p-0.5 shadow-sm transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#0E2350] to-[#1E3A8A] flex flex-col items-center justify-center text-white border border-amber-300">
              <School className="w-5 h-5 text-[#F07421]" />
              <span className="text-[5px] font-black text-amber-200 tracking-wider">GDCK</span>
            </div>
          </div>
        );
      case 'inst-002': // Govt Polytechnic Masab Tank
        return (
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0A1931] to-[#0E2350] border border-cyan-500/30 flex flex-col items-center justify-center text-white shadow-sm p-1 transition-transform duration-300 group-hover:scale-105">
            <Landmark className="w-5 h-5 text-cyan-400" />
            <span className="text-[5.5px] font-black text-cyan-200 tracking-wider">GPT-MSB</span>
          </div>
        );
      case 'inst-003': // Andhra Loyola College
        return (
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#78350F] to-[#92400E] border-2 border-amber-400 flex flex-col items-center justify-center text-white shadow-sm p-0.5 transition-transform duration-300 group-hover:scale-105">
            <GraduationCap className="w-5 h-5 text-amber-300" />
            <span className="text-[5.5px] font-bold text-amber-100 tracking-wider">LOYOLA</span>
          </div>
        );
      case 'inst-004': // GCW Guntur
        return (
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#831843] to-[#9D174D] border-2 border-rose-300 flex flex-col items-center justify-center text-white shadow-sm p-0.5 transition-transform duration-300 group-hover:scale-105">
            <BookOpen className="w-5 h-5 text-rose-200" />
            <span className="text-[5px] font-bold text-rose-100 tracking-wider">GCW-GNT</span>
          </div>
        );
      case 'inst-005': // GP Vizag
        return (
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#065F46] to-[#047857] border-2 border-emerald-400 flex flex-col items-center justify-center text-white shadow-sm p-0.5 transition-transform duration-300 group-hover:scale-105">
            <Building2 className="w-5 h-5 text-emerald-200" />
            <span className="text-[5.5px] font-bold text-emerald-100 tracking-wider">GP-VSP</span>
          </div>
        );
      case 'inst-006': // SVUCE Tirupati
        return (
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1E1B4B] to-[#312E81] border-2 border-amber-400 flex flex-col items-center justify-center text-white shadow-sm p-0.5 transition-transform duration-300 group-hover:scale-105">
            <School className="w-5 h-5 text-amber-400" />
            <span className="text-[5.5px] font-bold text-indigo-200 tracking-wider">SVUCE</span>
          </div>
        );
      case 'inst-007': // Govt City College
        return (
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1E293B] to-[#334155] border-2 border-sky-400 flex flex-col items-center justify-center text-white shadow-sm p-0.5 transition-transform duration-300 group-hover:scale-105">
            <Landmark className="w-5 h-5 text-sky-400" />
            <span className="text-[5.5px] font-bold text-slate-200 tracking-wider">GCC-HYD</span>
          </div>
        );
      default:
        if (institution.logo_url && !imageError) {
          return (
            <img
              src={institution.logo_url}
              alt={`${institution.name} Emblem`}
              onError={() => setImageError(true)}
              className="max-h-12 max-w-[130px] object-contain transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          );
        }
        return (
          <div className="w-11 h-11 rounded-full bg-[#0E2350] text-[#F07421] font-black text-base flex items-center justify-center shadow-sm">
            <School className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div
      className={`group relative rounded-2xl border ${
        featured
          ? 'bg-[#FFF8F0] border-[#FCE2CE] shadow-[0_4px_16px_rgba(240,116,33,0.06)]'
          : 'bg-white border-[#EBECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
      } p-5 sm:p-6 flex flex-col items-center justify-between text-center min-h-[210px] sm:min-h-[225px] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 hover:border-[#1C8A3C]/40 transition-all duration-300 cursor-pointer overflow-hidden`}
    >
      {/* Top: Seamless Logo / Emblem Floating Container */}
      <div className="h-14 sm:h-16 w-full flex items-center justify-center mb-2 px-1">
        {renderEmblem()}
      </div>

      {/* Middle: Title & District/State Subtitle */}
      <div className="space-y-1 w-full px-1">
        <h3
          className="text-xs sm:text-[13px] font-bold text-[#1E293B] group-hover:text-[#0E2350] leading-snug line-clamp-2"
          title={`Cohort at ${cleanName}`}
        >
          {cleanName}
        </h3>
        <p
          className="text-[11px] text-[#64748B] font-medium line-clamp-1"
          title={subtitle}
        >
          {subtitle}
        </p>
      </div>

      {/* Bottom: OPEN ↗ Action */}
      <div className="pt-3 w-full flex items-center justify-center">
        <span className="text-[11px] font-bold tracking-widest text-[#5B50A0] group-hover:text-[#3730A3] uppercase flex items-center gap-1 transition-colors group-hover:underline">
          OPEN <span className="text-xs font-mono font-normal">↗</span>
        </span>
      </div>
    </div>
  );
};
