// ============================================================================
// AP VIDYACONNECT — HOME LANDING PAGE (PREMIUM REDESIGN)
// Fully Aligned with Mockup: No Human Photos, Floating Architecture,
// Modern Typography, Clean Statistics Bar & APSCHE Initiative Showcase
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../services/dbStore';
import { useAuth } from '../../context/AuthContext';
import { PartnerCard } from '../../components/common/PartnerCard';
import { InstitutionCard } from '../../components/common/InstitutionCard';
import { PromotionalBannerCarousel } from '../../components/common/PromotionalBannerCarousel';
import {
  Building2,
  School,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Users,
  MapPin,
  TrendingUp,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  Handshake
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [institutions, setInstitutions] = useState(db.institutions);
  const [companies, setCompanies] = useState(db.companies);
  const [students, setStudents] = useState(db.students);
  const [batches, setBatches] = useState(db.batches);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setInstitutions([...db.institutions]);
      setCompanies([...db.companies]);
      setStudents([...db.students]);
      setBatches([...db.batches]);
    });
    return unsub;
  }, []);

  const verifiedCompanies = companies.filter((c) => c.verification_status === 'verified');
  const verifiedInstitutions = institutions.filter((i) => i.verification_status === 'verified');

  // Carousel Pagination State for Industry Partners & Institutional Network
  const [partnerCarouselIndex, setPartnerCarouselIndex] = useState(0);
  const [instCarouselIndex, setInstCarouselIndex] = useState(0);

  const CARDS_PER_VIEW = 6;
  const partnerTotalPages = Math.max(3, Math.ceil(verifiedCompanies.length / CARDS_PER_VIEW));
  const currentPartnerSlice = verifiedCompanies.slice(
    partnerCarouselIndex * CARDS_PER_VIEW,
    (partnerCarouselIndex + 1) * CARDS_PER_VIEW
  );
  const displayedPartnerCards = currentPartnerSlice.length >= 6
    ? currentPartnerSlice
    : (verifiedCompanies.length > 0
        ? [...currentPartnerSlice, ...verifiedCompanies.filter(c => !currentPartnerSlice.some(s => s.id === c.id))].slice(0, 6)
        : []);

  const instTotalPages = Math.max(3, Math.ceil(verifiedInstitutions.length / CARDS_PER_VIEW));
  const currentInstSlice = verifiedInstitutions.slice(
    instCarouselIndex * CARDS_PER_VIEW,
    (instCarouselIndex + 1) * CARDS_PER_VIEW
  );
  const displayedInstCards = currentInstSlice.length >= 6
    ? currentInstSlice
    : (verifiedInstitutions.length > 0
        ? [...currentInstSlice, ...verifiedInstitutions.filter(i => !currentInstSlice.some(s => s.id === i.id))].slice(0, 6)
        : []);

  const prevPartnerPage = () => {
    setPartnerCarouselIndex((prev) => (prev - 1 + partnerTotalPages) % partnerTotalPages);
  };
  const nextPartnerPage = () => {
    setPartnerCarouselIndex((prev) => (prev + 1) % partnerTotalPages);
  };

  const prevInstPage = () => {
    setInstCarouselIndex((prev) => (prev - 1 + instTotalPages) % instTotalPages);
  };
  const nextInstPage = () => {
    setInstCarouselIndex((prev) => (prev + 1) % instTotalPages);
  };

  const registeredCollegesCount = verifiedInstitutions.length;
  const verifiedCompaniesCount = verifiedCompanies.length;
  const activeInternsCount = students.length;
  const activeBatchesCount = batches.length;

  return (
    <div className="w-full pb-16">
      {/* ======================================================================== */}
      {/* 1. HERO SECTION (Art-Directed Academic Composition — Seamless Full-Bleed) */}
      {/* ======================================================================== */}
      <div className="w-full px-2.5 sm:px-6 lg:px-8 pt-2 sm:pt-3">
        <section className="w-full max-w-[1480px] mx-auto relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[#CBD5E1]/80 bg-[#EAF2FD] shadow-[0_8px_30px_rgba(11,31,70,0.06)] min-h-[380px] lg:min-h-[430px] xl:min-h-[450px] flex flex-col lg:flex-row items-center justify-between">
          
          {/* Top-Left Ambient Orange Glow Accent matching reference branding */}
          <div className="absolute -top-16 -left-16 w-52 h-52 bg-gradient-to-br from-[#FF6500]/20 via-[#FFA040]/10 to-transparent rounded-full blur-2xl pointer-events-none" />

          {/* Desktop Full-Bleed Panoramic Artwork matching Reference Mockup (cap, books, diploma, calligraphy & wave) */}
          <div 
            className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none select-none z-0"
            style={{
              backgroundImage: `url('/images/hero-banner-clean-bg@2x.png')`,
              backgroundPosition: 'right center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover'
            }}
          />

          {/* Mobile/Tablet Dedicated Academic Composition Artwork Banner */}
          <div className="lg:hidden w-full h-[220px] sm:h-[270px] relative overflow-hidden bg-gradient-to-b from-[#A5CDFE]/30 via-white to-[#EAF2FD] border-b border-[#E2E8F0] flex items-center justify-center p-3 shrink-0">
            <img
              src="/images/hero-artwork-mobile.png"
              alt="Better Skills Brighter Future - Academic Foundation & Graduation Cap"
              className="w-full h-full object-contain object-center select-none"
            />
          </div>

          {/* Left Column: Heading, Outlined Pill & Two Side-by-Side CTAs */}
          <div className="relative z-10 w-full lg:w-[48%] xl:w-[44%] max-w-[540px] px-5 sm:px-8 lg:px-12 py-7 sm:py-9 lg:py-10 space-y-4 sm:space-y-5 text-left">
            {/* Premium Category Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-[#FFF6EE] border border-[#FF6500]/40 text-[#0B1F46] px-3.5 py-1.5 rounded-full text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6500] shrink-0" />
              <span className="tracking-tight text-[11.5px] sm:text-xs font-bold text-[#0B1F46]">
                Next-Gen Campus-to-Career Internship Ecosystem
              </span>
            </div>

            {/* Main Bold Heading matching 3-line format of reference mockup */}
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] xl:text-[48px] font-black text-[#0B1F46] tracking-tight leading-[1.12]">
              Connecting<br />
              Education<br />
              with{' '}
              <span className="relative inline-block text-[#FF6500]">
                Industry
                {/* Decorative Curved Arc Swoosh matching reference mockup */}
                <svg
                  className="absolute -top-1 sm:-top-2 -left-1 sm:-left-2 w-[112%] h-4 sm:h-5 text-[#FF6500] pointer-events-none"
                  viewBox="0 0 120 18"
                  fill="none"
                >
                  <path
                    d="M3 14 C 35 2, 85 2, 117 14"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Supporting Description */}
            <p className="text-xs sm:text-[13.5px] text-[#475569] max-w-[490px] font-normal leading-relaxed">
              The centralized, two-sided institutional collaboration platform enabling formal proposal reviews, auditable batch creation, verified attendance, and government-recognized internship certifications.
            </p>

            {/* Two Primary Side-by-Side CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                to="/register?type=institution"
                className="h-[46px] px-5 rounded-full bg-[#0B1F46] hover:bg-[#14336F] text-white font-bold text-xs sm:text-[13.5px] shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-between sm:justify-center gap-2.5 group whitespace-nowrap"
              >
                <div className="flex items-center gap-2">
                  <School className="w-4 h-4 text-[#FF6500]" />
                  <span>Register Institution</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/register?type=company"
                className="h-[46px] px-5 rounded-full bg-[#FF6500] hover:bg-[#E65A00] text-white font-bold text-xs sm:text-[13.5px] shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-between sm:justify-center gap-2.5 group whitespace-nowrap"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-white" />
                  <span>Register Company</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* ======================================================================== */}
      {/* 2. IMPACT STATISTICS BAR (Real-Time Industry & Institutional Networks)   */}
      {/* ======================================================================== */}
      <div className="w-full px-2.5 sm:px-6 lg:px-8 mt-3 sm:mt-4">
        <div className="w-full bg-white rounded-2xl lg:rounded-full border border-[#E2E8F0] shadow-[0_4px_20px_rgba(11,31,70,0.04)] px-5 sm:px-8 py-3.5 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            
            {/* Metric 1: Industry Networks (Real-Time Live Data) */}
            <Link
              to="/partners"
              className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3 group hover:opacity-95 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#0B1F46] leading-none flex items-center gap-2">
                    <span>{verifiedCompaniesCount || companies.length}</span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      LIVE
                    </span>
                  </div>
                  <div className="text-xs sm:text-[13px] text-[#475569] font-bold mt-0.5 group-hover:text-[#1456C0] transition-colors">
                    Industry Networks
                  </div>
                </div>
              </div>
            </Link>

            <div className="h-9 w-[1px] bg-[#E2E8F0] hidden sm:block" />

            {/* Metric 2: Institutional Networks (Real-Time Live Data) */}
            <Link
              to="/institutions"
              className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3 group hover:opacity-95 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0B1F46] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <School className="w-5 h-5 text-[#FF6500]" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#0B1F46] leading-none flex items-center gap-2">
                    <span>{registeredCollegesCount || institutions.length}</span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      LIVE
                    </span>
                  </div>
                  <div className="text-xs sm:text-[13px] text-[#475569] font-bold mt-0.5 group-hover:text-[#1456C0] transition-colors">
                    Institutional Networks
                  </div>
                </div>
              </div>
            </Link>

            <div className="h-9 w-[1px] bg-[#E2E8F0] hidden lg:block" />

            {/* Metric 3: Building a Skilled & Self-Reliant India + Tiranga Wave */}
            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFF3EA] to-[#FFE0C7] text-[#FF6500] flex items-center justify-center shrink-0 border border-[#FED7AA]">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#0B1F46] leading-tight">
                    Building a Skilled
                  </div>
                  <div className="text-[11px] sm:text-xs text-[#475569] font-medium">
                    and Self-Reliant India
                  </div>
                </div>
              </div>

              {/* Artistic Tiranga (Saffron, White, Green) Ribbon Wave SVG */}
              <svg className="w-16 sm:w-20 h-6 shrink-0" viewBox="0 0 80 24" fill="none">
                <path d="M 2 12 C 24 4, 48 20, 78 8" stroke="#FF9933" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 2 15 C 24 7, 48 23, 78 11" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 2 18 C 24 10, 48 26, 78 14" stroke="#138808" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================================== */}
      {/* 3. PROMOTIONAL ANNOUNCEMENT BANNER CAROUSEL (APSCHE NODAL INITIATIVE)   */}
      {/* ======================================================================== */}
      <div className="w-full px-2.5 sm:px-6 lg:px-8 mt-3 sm:mt-4">
        <PromotionalBannerCarousel />
      </div>

      {/* ======================================================================== */}
      {/* 5. REST OF HOMEPAGE CONTENT (Dynamic Database Directories & Pillars)   */}
      {/* ======================================================================== */}
      <div className="space-y-8 sm:space-y-12 pt-6 sm:pt-10">
        
        {/* 5.1 OUR INDUSTRY PARTNERS (DATABASE DRIVEN WITH SKY-BLUE & CLOUDS BACKGROUND) */}
        <div className="w-full px-2.5 sm:px-6 lg:px-8">
          <section className="w-full relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-gradient-to-b from-[#EBF5FE] via-[#F4F9FE] to-white shadow-[0_8px_30px_rgba(11,31,70,0.04)] px-5 sm:px-8 py-7 sm:py-8 space-y-6">
            
            {/* Background Sky-Blue Horizon, Soft Clouds & Abstract Saffron Waves (Zero Buildings) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
              {/* Soft White Cloud 1 (Upper Right) */}
              <svg className="absolute -top-4 right-16 sm:right-44 w-72 sm:w-96 h-28 opacity-75" viewBox="0 0 240 80" fill="none">
                <path
                  d="M40 60 A22 22 0 0 1 65 32 A32 32 0 0 1 120 28 A38 38 0 0 1 180 38 A24 24 0 0 1 210 60 Z"
                  fill="white"
                  fillOpacity="0.8"
                />
              </svg>
              {/* Soft White Cloud 2 (Upper Left/Center) */}
              <svg className="absolute top-2 left-20 sm:left-64 w-60 sm:w-80 h-24 opacity-60" viewBox="0 0 200 70" fill="none">
                <path
                  d="M30 52 A18 18 0 0 1 52 28 A26 26 0 0 1 98 24 A32 32 0 0 1 150 32 A20 20 0 0 1 175 52 Z"
                  fill="white"
                  fillOpacity="0.75"
                />
              </svg>

              {/* Left Corner Fluid Orange & Saffron Abstract Waves */}
              <svg
                className="absolute -left-6 -top-4 w-56 sm:w-72 h-64 sm:h-80 opacity-45"
                viewBox="0 0 280 280"
                fill="none"
              >
                <path
                  d="M-20 0 C 70 30, 95 120, 50 195 C 15 250, -20 270, -40 280 L -40 0 Z"
                  fill="url(#ind-orange-wave-1)"
                />
                <path
                  d="M-10 0 C 110 50, 130 150, 80 230 L -30 230 L -30 0 Z"
                  fill="url(#ind-orange-wave-2)"
                  opacity="0.6"
                />
                <defs>
                  <linearGradient id="ind-orange-wave-1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF6500" stopOpacity="0.85" />
                    <stop offset="60%" stopColor="#FED7AA" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="ind-orange-wave-2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF8533" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Right Corner Fluid Orange Abstract Waves */}
              <svg
                className="absolute -right-6 -top-4 w-60 sm:w-80 h-64 sm:h-80 opacity-45"
                viewBox="0 0 300 280"
                fill="none"
              >
                <path
                  d="M320 0 C 230 40, 195 140, 245 230 C 275 270, 310 280, 330 280 L 330 0 Z"
                  fill="url(#ind-orange-wave-3)"
                />
                <path
                  d="M310 20 C 210 80, 185 170, 230 250 L 320 250 L 320 20 Z"
                  fill="url(#ind-orange-wave-4)"
                  opacity="0.5"
                />
                <defs>
                  <linearGradient id="ind-orange-wave-3" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FF6500" stopOpacity="0.85" />
                    <stop offset="60%" stopColor="#FED7AA" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="ind-orange-wave-4" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFA055" stopOpacity="0.65" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Header Content */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E2E8F0]/80 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF4EC] border border-[#FF6500]/30 text-[#FF6500] mb-2 shadow-2xs">
                  <Handshake className="w-3.5 h-3.5 text-[#FF6500]" />
                  <span>VERIFIED CORPORATE COLLABORATION</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F46] tracking-tight">
                  Our <span className="text-[#FF6500]">Industry</span> Partners
                </h2>
                <p className="text-xs sm:text-sm text-[#475569] mt-1 max-w-2xl leading-relaxed">
                  Companies collaborating with educational institutions to create structured internship opportunities across Andhra Pradesh.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {currentUser?.role === 'super_admin' && (
                  <Link
                    to="/admin/companies"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0B1F46] text-[#FFE5D3] hover:bg-[#14336F] rounded-full text-xs font-bold shadow-sm transition"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#FF6500]" />
                    <span>Admin: Manage Partners</span>
                  </Link>
                )}

                <Link
                  to="/partners"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#CBD5E1] bg-white/90 hover:bg-white text-[#0B1F46] font-bold text-xs sm:text-sm shadow-sm hover:shadow hover:border-[#FF6500]/40 transition-all shrink-0 group"
                >
                  <span>View All Partners ({verifiedCompanies.length})</span>
                  <ArrowRight className="w-4 h-4 text-[#FF6500] group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Carousel / Dynamic Partner Cards */}
            {verifiedCompanies.length === 0 ? (
              <div className="relative z-10 bg-white/90 rounded-2xl border border-[#E2E8F0] p-10 text-center max-w-md mx-auto space-y-3 shadow-sm">
                <div className="w-12 h-12 bg-[#F4F7FC] rounded-xl flex items-center justify-center mx-auto text-[#0B1F46]">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#0B1F46]">No verified industry partners yet.</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Verified companies will appear here as they join the AP VidyaConnect network.
                </p>
              </div>
            ) : (
              <div className="relative">
                {/* Left Carousel Navigation Arrow */}
                <button
                  type="button"
                  onClick={prevPartnerPage}
                  className="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-[#E2E8F0] shadow-md items-center justify-center text-[#0B1F46] hover:bg-[#F8FAFC] hover:shadow-lg active:scale-95 transition-all z-20 cursor-pointer"
                  aria-label="Previous partners"
                >
                  <ChevronLeft className="w-5 h-5 text-[#0B1F46]" />
                </button>

                {/* Right Carousel Navigation Arrow */}
                <button
                  type="button"
                  onClick={nextPartnerPage}
                  className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-[#E2E8F0] shadow-md items-center justify-center text-[#0B1F46] hover:bg-[#F8FAFC] hover:shadow-lg active:scale-95 transition-all z-20 cursor-pointer"
                  aria-label="Next partners"
                >
                  <ChevronRight className="w-5 h-5 text-[#0B1F46]" />
                </button>

                {/* Cards Row (6 per view matching mockup) */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10">
                  {displayedPartnerCards.map((company, idx) => (
                    <PartnerCard
                      key={`${company.id}-${idx}`}
                      company={company}
                    />
                  ))}
                </div>

                {/* Functional Carousel Pagination Indicators */}
                <div className="flex items-center justify-center gap-1.5 pt-4 relative z-10">
                  {Array.from({ length: partnerTotalPages }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPartnerCarouselIndex(i)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        partnerCarouselIndex === i
                          ? 'w-6 bg-[#FF6500]'
                          : 'w-2.5 bg-[#CBD5E1] hover:bg-[#94A3B8]'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* 5.2 OUR INSTITUTIONAL NETWORK (DATABASE DRIVEN WITH ABSTRACT GREEN WAVES) */}
        <div className="w-full px-2.5 sm:px-6 lg:px-8">
          <section className="w-full relative overflow-hidden rounded-3xl border border-[#A7F3D0]/80 bg-gradient-to-b from-[#F0FDF4] via-[#F7FEFA] to-white shadow-[0_8px_30px_rgba(16,185,129,0.04)] px-5 sm:px-8 py-7 sm:py-8 space-y-6">
            
            {/* Background Elegant Abstract Green Wave Patterns (Zero Buildings) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
              <svg
                className="absolute right-0 top-0 w-full sm:w-[85%] lg:w-[75%] h-full"
                viewBox="0 0 1000 400"
                preserveAspectRatio="none"
                fill="none"
              >
                {/* Flowing Ribbon 1 - Deep soft mint */}
                <path
                  d="M180 0 C 420 70, 620 15, 820 60 C 920 85, 1000 50, 1000 50 L 1000 260 C 880 210, 720 245, 520 160 C 350 90, 230 40, 180 0 Z"
                  fill="url(#inst-green-wave-1)"
                />
                {/* Flowing Ribbon 2 - Emerald accent wave */}
                <path
                  d="M320 0 C 520 100, 720 30, 890 85 L 1000 110 L 1000 290 C 860 235, 690 260, 470 180 C 370 140, 330 75, 320 0 Z"
                  fill="url(#inst-green-wave-2)"
                />
                {/* Flowing Ribbon 3 - Delicate highlight stroke */}
                <path
                  d="M120 15 C 360 110, 600 25, 830 100 C 930 130, 1000 110, 1000 110"
                  stroke="url(#inst-green-stroke)"
                  strokeWidth="2.5"
                  strokeOpacity="0.5"
                />
                <defs>
                  <linearGradient id="inst-green-wave-1" x1="0%" y1="0%" x2="100%" y2="80%">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.07" />
                    <stop offset="50%" stopColor="#34D399" stopOpacity="0.14" />
                    <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0.04" />
                  </linearGradient>
                  <linearGradient id="inst-green-wave-2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#059669" stopOpacity="0.04" />
                    <stop offset="60%" stopColor="#10B981" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#A7F3D0" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="inst-green-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0" />
                    <stop offset="50%" stopColor="#10B981" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#34D399" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Header Content */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E2E8F0]/80 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] border border-[#10B981]/30 text-[#059669] mb-2 shadow-2xs">
                  <School className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>STATE HIGHER EDUCATION NETWORK</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F46] tracking-tight">
                  Our <span className="text-[#10B981]">Institutional</span> Network
                </h2>
                <p className="text-xs sm:text-sm text-[#475569] mt-1 max-w-2xl leading-relaxed">
                  Verified Government Degree Colleges, Polytechnics, and Autonomous Universities participating in centralized internship governance.
                </p>
              </div>

              <Link
                to="/institutions"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#10B981]/40 bg-white/90 hover:bg-white text-[#065F46] font-bold text-xs sm:text-sm shadow-sm hover:shadow hover:border-[#10B981] transition-all shrink-0 group"
              >
                <span>Explore Institution Ecosystem ({verifiedInstitutions.length})</span>
                <ArrowRight className="w-4 h-4 text-[#10B981] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Carousel / Dynamic Institution Cards */}
            {verifiedInstitutions.length === 0 ? (
              <div className="relative z-10 bg-white/90 rounded-2xl border border-[#E2E8F0] p-10 text-center max-w-md mx-auto space-y-3 shadow-sm">
                <div className="w-12 h-12 bg-[#F4F7FC] rounded-xl flex items-center justify-center mx-auto text-[#0B1F46]">
                  <School className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#0B1F46]">No verified institutions yet.</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Participating government colleges and polytechnics will appear here upon verification.
                </p>
              </div>
            ) : (
              <div className="relative">
                {/* Left Carousel Navigation Arrow */}
                <button
                  type="button"
                  onClick={prevInstPage}
                  className="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-[#E2E8F0] shadow-md items-center justify-center text-[#0B1F46] hover:bg-[#F8FAFC] hover:shadow-lg active:scale-95 transition-all z-20 cursor-pointer"
                  aria-label="Previous institutions"
                >
                  <ChevronLeft className="w-5 h-5 text-[#0B1F46]" />
                </button>

                {/* Right Carousel Navigation Arrow */}
                <button
                  type="button"
                  onClick={nextInstPage}
                  className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-[#E2E8F0] shadow-md items-center justify-center text-[#0B1F46] hover:bg-[#F8FAFC] hover:shadow-lg active:scale-95 transition-all z-20 cursor-pointer"
                  aria-label="Next institutions"
                >
                  <ChevronRight className="w-5 h-5 text-[#0B1F46]" />
                </button>

                {/* Cards Row (6 per view matching mockup) */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10">
                  {displayedInstCards.map((inst, idx) => (
                    <InstitutionCard
                      key={`${inst.id}-${idx}`}
                      institution={inst}
                    />
                  ))}
                </div>

                {/* Functional Carousel Pagination Indicators */}
                <div className="flex items-center justify-center gap-1.5 pt-4 relative z-10">
                  {Array.from({ length: instTotalPages }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setInstCarouselIndex(i)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        instCarouselIndex === i
                          ? 'w-6 bg-[#10B981]'
                          : 'w-2.5 bg-[#CBD5E1] hover:bg-[#94A3B8]'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* 5.3 THREE ACTORS VALUE PILLARS (REDESIGNED INTERNSHIP LIFECYCLE SECTION) */}
        <div className="w-full px-2.5 sm:px-6 lg:px-8">
          <section className="w-full relative overflow-hidden rounded-3xl border border-[#D5E6F8] bg-gradient-to-b from-[#EBF5FE] via-[#F4F9FE] to-[#E8F3FD] shadow-[0_8px_30px_rgba(11,31,70,0.04)] px-5 sm:px-8 lg:px-12 py-10 sm:py-14 space-y-10 sm:space-y-12">
            
            {/* Background Decorative Abstract Waves & Dotted Grids (No Buildings/Photos) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
              
              {/* Top-Left Vibrant Curved Orange Swoop Arc */}
              <div className="absolute top-0 left-0 w-72 sm:w-96 h-28 sm:h-36 pointer-events-none">
                <svg viewBox="0 0 450 160" fill="none" className="w-full h-full">
                  <path
                    d="M 0 0 L 320 0 C 220 35, 120 95, 0 150 Z"
                    fill="url(#stakeholder-orange-top)"
                  />
                  <path
                    d="M 0 0 L 360 0 C 250 40, 140 110, 0 160"
                    stroke="#38BDF8"
                    strokeWidth="2"
                    strokeOpacity="0.4"
                  />
                  <defs>
                    <linearGradient id="stakeholder-orange-top" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF7900" />
                      <stop offset="100%" stopColor="#FF5500" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Top-Right Soft Blue & Cyan Wave Ribbons */}
              <div className="absolute top-0 right-0 w-80 sm:w-[480px] h-32 sm:h-44 pointer-events-none opacity-40">
                <svg viewBox="0 0 500 180" fill="none" className="w-full h-full">
                  <path
                    d="M 120 0 C 260 90, 380 40, 500 120 L 500 0 Z"
                    fill="url(#stakeholder-blue-top)"
                  />
                  <path
                    d="M 160 0 C 300 95, 400 50, 500 140"
                    stroke="#1456C0"
                    strokeWidth="2.5"
                    strokeOpacity="0.3"
                  />
                  <defs>
                    <linearGradient id="stakeholder-blue-top" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#1456C0" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Bottom-Left Curved Vibrant Orange Wave Accent */}
              <div className="absolute -bottom-1 left-0 w-64 sm:w-80 h-24 sm:h-32 pointer-events-none">
                <svg viewBox="0 0 400 140" fill="none" className="w-full h-full">
                  <path
                    d="M 0 140 L 260 140 C 180 110, 90 60, 0 10 Z"
                    fill="url(#stakeholder-orange-bottom)"
                  />
                  <path
                    d="M 0 140 L 300 140 C 200 115, 110 70, 0 25"
                    stroke="#0284C7"
                    strokeWidth="2"
                    strokeOpacity="0.3"
                  />
                  <defs>
                    <linearGradient id="stakeholder-orange-bottom" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FF7900" />
                      <stop offset="100%" stopColor="#FF6500" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Bottom-Right Deep Royal Blue Flowing Wave Curve */}
              <div className="absolute -bottom-1 right-0 w-72 sm:w-[460px] h-28 sm:h-36 pointer-events-none">
                <svg viewBox="0 0 450 150" fill="none" className="w-full h-full">
                  <path
                    d="M 140 150 C 240 120, 340 70, 450 20 L 450 150 Z"
                    fill="url(#stakeholder-navy-bottom)"
                  />
                  <path
                    d="M 180 150 C 270 125, 360 80, 450 35"
                    stroke="#38BDF8"
                    strokeWidth="2"
                    strokeOpacity="0.5"
                  />
                  <defs>
                    <linearGradient id="stakeholder-navy-bottom" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0B1F46" />
                      <stop offset="50%" stopColor="#1456C0" />
                      <stop offset="100%" stopColor="#0284C7" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Dot Matrix Pattern - Top Left */}
              <svg className="absolute left-8 top-16 w-36 h-32 opacity-25 pointer-events-none" fill="none">
                <pattern id="stakeholder-dots-tl" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.3" fill="#0284C7" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#stakeholder-dots-tl)" />
              </svg>

              {/* Dot Matrix Pattern - Top Right */}
              <svg className="absolute right-12 top-8 w-44 h-36 opacity-25 pointer-events-none" fill="none">
                <pattern id="stakeholder-dots-tr" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.3" fill="#1456C0" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#stakeholder-dots-tr)" />
              </svg>
            </div>

            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto relative z-10">
              <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2">
                <div className="h-[1.5px] w-12 sm:w-20 bg-gradient-to-r from-transparent to-[#1456C0]/50" />
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F46] tracking-tight">
                  Empowering Every Stakeholder in the{' '}
                  <span className="text-[#FF7900]">Internship Lifecycle</span>
                </h2>
                <div className="h-[1.5px] w-12 sm:w-20 bg-gradient-to-l from-transparent to-[#1456C0]/50" />
              </div>
              <p className="text-xs sm:text-sm text-[#475569] mt-2 font-medium">
                Built specifically for academic rigor, industry productivity, and student career advancement.
              </p>
            </div>

            {/* Three Equal-Height Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch relative z-10">
              
              {/* Card 1: Colleges & Institutions (Blue Accent) */}
              <div className="bg-white/95 rounded-3xl border border-[#E2E8F0] border-l-4 border-l-[#1456C0] p-6 sm:p-7 shadow-[0_8px_25px_rgba(11,31,70,0.04)] hover:shadow-[0_16px_36px_rgba(20,86,192,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
                {/* Subtle Blue Corner Wave Accent */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-gradient-to-tl from-[#1456C0]/15 via-[#1456C0]/5 to-transparent pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-[#EBF3FC] border border-[#D5E6F8] flex items-center justify-center mb-5 text-[#1456C0] shadow-2xs group-hover:scale-105 transition-transform">
                    <School className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg sm:text-[19px] font-extrabold text-[#0B1F46] tracking-tight">
                    For Colleges & Institutions
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[#475569] mt-2.5 leading-relaxed font-normal">
                    Seamlessly bulk-import students, discover verified corporate partners, formulate multi-student proposals, track live batch attendance, and monitor state accreditation metrics.
                  </p>
                  <ul className="mt-5 space-y-2.5 text-xs text-[#10264A] font-medium">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                      <span>CSV Bulk Student Ingestion & Validations</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                      <span>Two-Sided Proposal Negotiation Stepper</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                      <span>Realtime Attendance & Evaluation Sync</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6 relative z-10">
                  <Link
                    to="/for-institutions"
                    className="inline-flex items-center gap-2 text-xs sm:text-[13px] font-bold text-[#1456C0] hover:text-[#0B1F46] group-hover:gap-2.5 transition-all"
                  >
                    <span>Institution Guide & Onboarding</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Card 2: Companies & Industry (Orange Accent) */}
              <div className="bg-white/95 rounded-3xl border border-[#E2E8F0] border-l-4 border-l-[#FF7900] p-6 sm:p-7 shadow-[0_8px_25px_rgba(11,31,70,0.04)] hover:shadow-[0_16px_36px_rgba(255,121,0,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
                {/* Subtle Orange Corner Wave Accent */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-gradient-to-tl from-[#FF7900]/15 via-[#FF7900]/5 to-transparent pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF4EC] border border-[#FED7AA] flex items-center justify-center mb-5 text-[#FF7900] shadow-2xs group-hover:scale-105 transition-transform">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg sm:text-[19px] font-extrabold text-[#0B1F46] tracking-tight">
                    For Companies & Industry
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[#475569] mt-2.5 leading-relaxed font-normal">
                    Review tailored proposals from premier colleges, allocate verified seats, assign technical supervisors, track milestones, and recruit pre-evaluated talent with zero overhead.
                  </p>
                  <ul className="mt-5 space-y-2.5 text-xs text-[#10264A] font-medium">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                      <span>Direct Proposal Review & Counter-Offers</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                      <span>Intern Task Pipelines & Code Reviews</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                      <span>Multi-Factor Performance Evaluation Form</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6 relative z-10">
                  <Link
                    to="/for-companies"
                    className="inline-flex items-center gap-2 text-xs sm:text-[13px] font-bold text-[#FF7900] hover:text-[#E65A00] group-hover:gap-2.5 transition-all"
                  >
                    <span>Industry Partner Portal</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Card 3: Students & Interns (Green Accent) */}
              <div className="bg-white/95 rounded-3xl border border-[#E2E8F0] border-l-4 border-l-[#10B981] p-6 sm:p-7 shadow-[0_8px_25px_rgba(11,31,70,0.04)] hover:shadow-[0_16px_36px_rgba(16,185,129,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
                {/* Subtle Green Corner Wave Accent */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-gradient-to-tl from-[#10B981]/15 via-[#10B981]/5 to-transparent pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center mb-5 text-[#10B981] shadow-2xs group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg sm:text-[19px] font-extrabold text-[#0B1F46] tracking-tight">
                    For Students & Interns
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[#475569] mt-2.5 leading-relaxed font-normal">
                    Receive verified college placements with direct automated batch enrollment, log daily GPS attendance, submit milestone deliverables, and receive structured supervisor appraisals.
                  </p>
                  <ul className="mt-5 space-y-2.5 text-xs text-[#10264A] font-medium">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                      <span>Direct Automated Cohort Enrollment</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                      <span>Deliverable & GitHub Link Submission</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                      <span>Verified Academic Credit Transfer</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6 relative z-10">
                  <Link
                    to="/for-students"
                    className="inline-flex items-center gap-2 text-xs sm:text-[13px] font-bold text-[#10B981] hover:text-[#065F46] group-hover:gap-2.5 transition-all"
                  >
                    <span>Student Portal & Guidelines</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* 5.4 OPPORTUNITIES & PARTNERSHIP BANNER */}
        <div className="w-full px-2.5 sm:px-6 lg:px-8">
          <section className="w-full">
            <div className="bg-gradient-to-r from-[#0B1F46] via-[#10264A] to-[#14336F] rounded-2xl sm:rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-[#14336F]">
              <div className="space-y-2 max-w-xl">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#FF6500]">
                  INDUSTRY TALENT NETWORK
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold">
                  Explore Verified Corporate Internship Opportunities
                </h3>
                <p className="text-xs text-[#DCE5F5] leading-relaxed">
                  Connect with top corporate employers and MSMEs across Andhra Pradesh offering structured internships, competitive stipends, and direct Pre-Placement Offers (PPOs).
                </p>
              </div>

              <Link
                to="/opportunities"
                className="px-6 py-3 rounded-full bg-white hover:bg-gray-100 text-[#0B1F46] font-bold text-sm shadow-md transition-all shrink-0 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#FF6500]" />
                <span>Browse Opportunities Now</span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
