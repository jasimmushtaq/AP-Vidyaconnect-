// ============================================================================
// AP VIDYACONNECT — PROMOTIONAL ANNOUNCEMENT BANNER CAROUSEL
// Official APSCHE Nodal Initiative & Higher Education Promotional Banner
// Equipped with Real-Time Data, Slide Navigation Buttons (< and >), and Dot Indicators
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../services/dbStore';
import { useAuth } from '../../context/AuthContext';
import { BannerManagerModal } from '../admin/BannerManagerModal';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Settings,
  CheckCircle2,
  Building2,
  School,
  GraduationCap
} from 'lucide-react';

interface PromotionalSlide {
  id: string;
  badge: string;
  titlePrefix: string;
  titleHighlight: string;
  titleSuffix?: string;
  subtitle: string;
  bulletPoints: string[];
  linkUrl: string;
  linkLabel: string;
}

export const PromotionalBannerCarousel: React.FC = () => {
  const { currentUser, currentRole } = useAuth();
  const [companies, setCompanies] = useState(db.companies);
  const [institutions, setInstitutions] = useState(db.institutions);
  const [banners, setBanners] = useState(db.banners);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchStartX - touchEndX;
    if (deltaX > 45) {
      handleNext();
    } else if (deltaX < -45) {
      handlePrev();
    }
    setTouchStartX(null);
  };

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setCompanies([...db.companies]);
      setInstitutions([...db.institutions]);
      setBanners([...db.banners]);
    });
    return unsub;
  }, []);

  const verifiedCompaniesCount = companies.filter((c) => c.verification_status === 'verified').length;
  const registeredCollegesCount = institutions.filter((i) => i.verification_status === 'verified').length;

  // Curated list of high-impact government & industry promotional slides
  const defaultSlides: PromotionalSlide[] = [
    {
      id: 'slide-apsche-accelerator',
      badge: 'APSCHE NODAL INITIATIVE',
      titlePrefix: 'Andhra Pradesh Youth ',
      titleHighlight: 'Skill Accelerator',
      subtitle: 'Direct Academic Credit Transfer to University Portals',
      bulletPoints: [
        'Direct technical internships across verified industry & institutional networks',
        'Direct ABC (Academic Bank of Credits) integration with APSCHE guidelines',
        'Pre-Placement Offers (PPOs) backed by verified industry mentors'
      ],
      linkUrl: '/about',
      linkLabel: 'View Details'
    },
    {
      id: 'slide-aaj-interns',
      badge: 'NATIONAL INTERNSHIP MISSION',
      titlePrefix: 'Aaj Interns, ',
      titleHighlight: 'Kal Industry Ready',
      subtitle: 'Centralized Two-Sided Proposal Reviews & Cohort Governance',
      bulletPoints: [
        'Companies can post verified opportunities on an ongoing basis',
        'NEP 2020 credit synchronization with university examination branches',
        'Biometric GPS-geofenced daily attendance with zero ghost enrollment'
      ],
      linkUrl: '/opportunities',
      linkLabel: 'Explore Opportunities'
    },
    {
      id: 'slide-corporate-ecosystem',
      badge: 'CORPORATE PARTNERSHIP PORTAL',
      titlePrefix: 'Empower State Talent with ',
      titleHighlight: 'Zero Hiring Friction',
      subtitle: 'Tailored Bulk Cohort Placement from Premier Colleges',
      bulletPoints: [
        'Review pre-evaluated batch proposals with verified student GPA transcripts',
        'Custom milestone task tracking & automated mentor evaluation rubrics',
        'Direct Pre-Placement Offers (PPOs) backed by industry supervisors'
      ],
      linkUrl: '/register?type=company',
      linkLabel: 'Register Company'
    }
  ];

  // If super-admin added extra custom banners in database, map them into the slides list
  const customSlides: PromotionalSlide[] = banners
    .filter((b) => b.is_active && b.id !== 'banner-002')
    .map((b) => {
      const parts = b.title.split(' ');
      const highlight = parts.length > 2 ? parts.slice(-2).join(' ') : parts.slice(-1).join(' ');
      const prefix = b.title.replace(highlight, '');
      return {
        id: b.id,
        badge: (b.vertical_tag || 'OFFICIAL INITIATIVE').replace(/,$/, '').toUpperCase(),
        titlePrefix: prefix,
        titleHighlight: highlight,
        subtitle: b.subtitle || 'State Higher Education Collaboration Framework',
        bulletPoints: b.bullet_points && b.bullet_points.length > 0 ? b.bullet_points : [
          'Verified multi-student proposals with institutional faculty endorsement',
          'Academic Bank of Credits (ABC) compliance under APSCHE rules',
          'Fast-track supervisor appraisals and tamper-proof digital certificates'
        ],
        linkUrl: b.link_url || '/opportunities',
        linkLabel: b.link_label || 'View Details'
      };
    });

  const allSlides = [defaultSlides[0], ...customSlides, ...defaultSlides.slice(1)];
  // Deduplicate by ID
  const slides = Array.from(new Map(allSlides.map((s) => [s.id, s])).values());

  // Auto-play timer (8 seconds), pausing when hovering over the banner
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [slides.length, isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const currentSlide = slides[currentIndex] || slides[0];
  const isSuperAdmin = currentRole === 'super_admin' || currentUser?.role === 'super_admin';

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="w-full relative select-none block rounded-2xl sm:rounded-3xl overflow-hidden group shadow-xl"
    >
      <section className="w-full bg-[#0B1F46] rounded-2xl sm:rounded-3xl border border-[#14336F] text-white p-5 sm:p-8 lg:p-10 relative overflow-hidden">
        
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#168BFA]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Bottom Architectural Institutional Line Drawing SVG */}
        <svg
          className="absolute bottom-0 right-0 w-full sm:w-2/3 h-28 sm:h-36 pointer-events-none opacity-20 text-[#60A5FA]"
          viewBox="0 0 800 120"
          fill="none"
        >
          {/* Classical Colonnades, Towers & Institutional Facades */}
          <path d="M 0 120 L 0 95 L 40 95 L 40 120 M 40 95 L 80 70 L 120 95 L 120 120 M 60 95 L 60 120 M 100 95 L 100 120" stroke="currentColor" strokeWidth="1.2" />
          <path d="M 140 120 L 140 85 L 160 85 L 160 70 L 170 60 L 180 70 L 180 85 L 200 85 L 200 120" stroke="currentColor" strokeWidth="1.2" />
          <path d="M 220 120 L 220 75 L 360 75 L 360 120 M 240 75 L 240 120 M 260 75 L 260 120 M 280 75 L 280 120 M 300 75 L 300 120 M 320 75 L 320 120 M 340 75 L 340 120" stroke="currentColor" strokeWidth="1" />
          <path d="M 215 75 L 290 45 L 365 75 Z" stroke="currentColor" strokeWidth="1.2" />
          <path d="M 400 120 L 400 65 C 400 45, 450 45, 450 65 L 450 120 M 415 65 L 415 120 M 435 65 L 435 120" stroke="currentColor" strokeWidth="1.2" />
          <path d="M 425 45 L 425 30 M 420 30 L 430 30" stroke="currentColor" strokeWidth="1.2" />
          <path d="M 480 120 L 480 80 L 620 80 L 620 120 M 500 80 L 500 120 M 530 80 L 530 120 M 560 80 L 560 120 M 590 80 L 590 120" stroke="currentColor" strokeWidth="1" />
          <path d="M 640 120 L 640 60 L 720 60 L 720 120 M 660 60 L 660 120 M 680 60 L 680 120 M 700 60 L 700 120" stroke="currentColor" strokeWidth="1" />
          <path d="M 720 120 L 720 85 L 800 85 L 800 120" stroke="currentColor" strokeWidth="1" />
          <line x1="0" y1="120" x2="800" y2="120" stroke="currentColor" strokeWidth="1.5" />
        </svg>

        {/* Super Admin Manage Banners Shortcut */}
        {isSuperAdmin && (
          <div className="absolute top-3 right-4 sm:top-4 sm:right-6 z-20">
            <button
              onClick={() => setShowAdminModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 shadow-sm transition-all"
            >
              <Settings className="w-3.5 h-3.5 text-[#FF6500]" />
              <span>Admin: Manage Banners ({banners.length})</span>
            </button>
          </div>
        )}

        {/* Floating Side Slide Buttons (Previous < and Next >) */}
        {slides.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#0B1F46]/90 hover:bg-white text-white hover:text-[#0B1F46] border border-white/25 hover:border-white flex items-center justify-center shadow-lg transition-all active:scale-95 opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
              title="Previous Slide"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#0B1F46]/90 hover:bg-white text-white hover:text-[#0B1F46] border border-white/25 hover:border-white flex items-center justify-center shadow-lg transition-all active:scale-95 opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
              title="Next Slide"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </button>
          </>
        )}

        {/* Main Banner Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10 transition-opacity duration-300">
          
          {/* Left Side: Badge, Headline with Orange Highlight, Subtitle & 3 Check Bullets */}
          <div className="lg:col-span-7 space-y-3">
            {/* Pulsing Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-[#E9272E] animate-pulse" />
              <span>{currentSlide.badge}</span>
            </div>

            {/* Main Title with Vibrant Orange Accent */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              {currentSlide.titlePrefix}
              <span className="text-[#FF6500]">{currentSlide.titleHighlight}</span>
              {currentSlide.titleSuffix || ''}
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-[#DCE5F5] font-semibold">
              {currentSlide.subtitle}
            </p>

            {/* Three Benefits with Orange Checkmarks */}
            <ul className="pt-2 space-y-2.5 text-xs sm:text-[13px] text-white/90">
              {currentSlide.bulletPoints.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6500] shrink-0 mt-0.5" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Side: Real-Time Network Cards & Slide Controls + View Details CTA */}
          <div className="lg:col-span-5 flex flex-col items-start lg:items-end gap-5">
            {/* Real-Time Industry & Institutional Networks Cards */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 w-full">
              <Link
                to="/partners"
                className="p-3 sm:p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-center backdrop-blur-xs transition group/card"
              >
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF6500] mx-auto mb-1 group-hover/card:scale-110 transition-transform" />
                <p className="text-xl sm:text-2xl font-black text-white leading-none">
                  {verifiedCompaniesCount || companies.length}
                </p>
                <p className="text-[11px] sm:text-xs font-bold text-[#DCE5F5] mt-1">Industry Networks</p>
              </Link>

              <Link
                to="/institutions"
                className="p-3 sm:p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-center backdrop-blur-xs transition group/card"
              >
                <School className="w-5 h-5 sm:w-6 sm:h-6 text-[#60A5FA] mx-auto mb-1 group-hover/card:scale-110 transition-transform" />
                <p className="text-xl sm:text-2xl font-black text-white leading-none">
                  {registeredCollegesCount || institutions.length}
                </p>
                <p className="text-[11px] sm:text-xs font-bold text-[#DCE5F5] mt-1">Institutional Networks</p>
              </Link>
            </div>

            {/* Bottom Controls Row: Slide Buttons (< and >) with Dots, and Action Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
              {/* Slide Buttons Control Pill */}
              {slides.length > 1 && (
                <div className="flex items-center justify-center gap-1 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-sm mx-auto sm:mx-0">
                  <button
                    onClick={handlePrev}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white text-white hover:text-[#0B1F46] flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer"
                    title="Previous Slide"
                    aria-label="Previous Slide"
                  >
                    <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  {/* Dot Indicators */}
                  <div className="flex items-center gap-1.5 px-2">
                    {slides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          currentIndex === idx
                            ? 'w-5 bg-[#FF6500] shadow-sm'
                            : 'w-1.5 bg-white/40 hover:bg-white'
                        }`}
                        title={`Slide ${idx + 1}`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNext}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white text-white hover:text-[#0B1F46] flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer"
                    title="Next Slide"
                    aria-label="Next Slide"
                  >
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              )}

              {/* Action Button */}
              <Link
                to={currentSlide.linkUrl}
                className="w-full sm:w-auto justify-center px-6 py-2.5 rounded-full border border-white/80 hover:bg-white hover:text-[#0B1F46] text-white transition-all text-xs sm:text-[13px] font-bold flex items-center gap-2 shadow-sm whitespace-nowrap text-center"
              >
                <span>{currentSlide.linkLabel}</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Super Admin Modal */}
      {showAdminModal && (
        <BannerManagerModal
          isOpen={showAdminModal}
          onClose={() => setShowAdminModal(false)}
        />
      )}
    </div>
  );
};
