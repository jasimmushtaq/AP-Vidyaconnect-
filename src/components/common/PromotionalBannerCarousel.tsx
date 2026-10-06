// ============================================================================
// AP VIDYACONNECT — PROMOTIONAL ANNOUNCEMENT BANNER CAROUSEL
// AICTE & AP State Government styled high-impact announcement banner
// Exactly matching official institutional portal aesthetics
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../services/dbStore';
import { AnnouncementBanner } from '../../types/database';
import { useAuth } from '../../context/AuthContext';
import { BannerManagerModal } from '../admin/BannerManagerModal';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Settings,
  Check
} from 'lucide-react';

const GRADIENT_MAP: Record<string, string> = {
  saffron_red: 'from-[#FF7A00] via-[#F07421] to-[#E9233F]',
  ocean_blue: 'from-[#0B2A5B] via-[#1D4ED8] to-[#0284C7]',
  emerald_teal: 'from-[#065F46] via-[#16844A] to-[#0D9488]',
  royal_purple: 'from-[#581C87] via-[#8B5CF6] to-[#D946EF]',
  midnight_gold: 'from-[#0B132B] via-[#1E293B] to-[#B45309]',
};

export const PromotionalBannerCarousel: React.FC = () => {
  const { currentUser, currentRole } = useAuth();
  const [banners, setBanners] = useState<AnnouncementBanner[]>(db.banners);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setBanners([...db.banners]);
    });
    return unsub;
  }, []);

  const activeBanners = banners
    .filter((b) => b.is_active)
    .sort((a, b) => a.display_order - b.display_order);

  // Auto-play timer (6 seconds)
  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 15000);

    return () => clearInterval(interval);
  }, [activeBanners.length, isPaused]);

  if (activeBanners.length === 0) {
    return null;
  }

  const currentBanner = activeBanners[currentIndex] || activeBanners[0];
  const gradientClass = GRADIENT_MAP[currentBanner.gradient_theme] || GRADIENT_MAP.saffron_red;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const isSuperAdmin = currentRole === 'super_admin' || currentUser?.role === 'super_admin';

  return (
    <div className="w-full relative select-none m-0 p-0 block rounded-2xl sm:rounded-3xl overflow-hidden">
      {/* Curved Banner Container */}
      <div className="w-full relative m-0 p-0 rounded-2xl sm:rounded-3xl overflow-hidden">
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative w-full overflow-hidden transition-all duration-700 bg-[#7C3AED] m-0 p-0 rounded-2xl sm:rounded-3xl"
        >
          {/* Super Admin Inline Control inside banner */}
          {isSuperAdmin && (
            <div className="absolute top-3 right-4 sm:top-3 sm:right-8 z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAdminModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[7px] bg-black/40 hover:bg-black/70 text-white text-[11px] font-bold backdrop-blur-md border border-white/30 shadow-md transition-all"
                title="Super Admin: Manage Announcement Banners"
              >
                <Settings className="w-3 h-3 text-white" />
                <span>Admin: Edit Banners ({banners.length})</span>
              </button>
            </div>
          )}

          {/* Primary Custom Banner Graphic or Dynamic Template */}
          {currentBanner.banner_type === 'full_graphic' || (currentIndex === 0 && !currentBanner.bullet_points?.length) ? (
            <Link to={currentBanner.link_url || '/opportunities'} className="block w-full relative group cursor-pointer m-0 p-0 overflow-hidden bg-black/5">
              <img
                src={currentBanner.image_url || '/images/find-internship-near-you-banner.png'}
                alt={currentBanner.title || 'Promotional Banner'}
                className={`w-full ${
                  currentBanner.image_fit === 'contain'
                    ? 'h-auto max-h-[360px] object-contain mx-auto'
                    : 'h-auto max-h-[360px] object-cover'
                } block select-none transition-transform duration-300 group-hover:scale-[1.005]`}
              />
            </Link>
          ) : (
            <div className={`relative w-full bg-gradient-to-r ${gradientClass} min-h-[210px] sm:min-h-[220px] flex flex-col justify-between pt-4 sm:pt-5 pb-12 sm:pb-6`}>
              <div className="w-full px-4 sm:px-8 lg:px-12 flex items-start justify-between gap-4">
                <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
                  {currentBanner.vertical_tag && (
                    <span className="inline-block text-[9.5px] sm:text-[10px] font-black uppercase tracking-widest text-white/95 bg-black/25 backdrop-blur-xs px-2 py-0.5 rounded">
                      {currentBanner.vertical_tag}
                    </span>
                  )}
                  <h2 className="text-lg sm:text-3xl font-black text-white leading-snug tracking-tight">
                    {currentBanner.title}
                  </h2>
                  {currentBanner.subtitle && (
                    <p className="text-[11px] sm:text-sm font-semibold text-white/90 leading-tight">
                      {currentBanner.subtitle}
                    </p>
                  )}
                  {currentBanner.bullet_points && (
                    <ul className="space-y-1 sm:space-y-1.5 text-[11px] sm:text-xs text-white/95 pt-0.5">
                      {currentBanner.bullet_points.map((b, i) => (
                        <li key={i} className="flex items-start sm:items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-white shrink-0 mt-0.5 sm:mt-0" />
                          <span className="leading-tight">{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {currentBanner.image_url && (
                  <div className="shrink-0 hidden sm:flex items-center justify-center">
                    {currentBanner.image_bg === 'transparent' ? (
                      <img
                        src={currentBanner.image_url}
                        alt={currentBanner.title}
                        className={`max-h-36 max-w-[240px] ${
                          currentBanner.image_fit === 'cover' ? 'object-cover' : 'object-contain'
                        } drop-shadow-2xl`}
                      />
                    ) : currentBanner.image_bg === 'frame' || currentBanner.image_fit === 'cover' ? (
                      <div className="w-48 sm:w-56 h-32 sm:h-36 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/50 bg-black/10">
                        <img
                          src={currentBanner.image_url}
                          alt={currentBanner.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      /* White Card default - for logos, emblems, badges & graphics */
                      <div className="bg-white rounded-2xl p-2.5 sm:p-3.5 shadow-2xl border border-white/90 flex items-center justify-center max-w-[220px] max-h-[160px]">
                        <img
                          src={currentBanner.image_url}
                          alt={currentBanner.title}
                          className="max-h-28 sm:max-h-32 max-w-full object-contain rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Carousel Footer: Slide Indicators (Left) & Navigation Arrows (Right) */}
          <div className="absolute bottom-2.5 inset-x-0 z-10 pointer-events-none">
            <div className="w-full px-3 sm:px-8 lg:px-12 flex items-center justify-between">
              {/* Pagination Dots */}
              <div className="flex items-center gap-1.5 pointer-events-auto bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full shadow-md">
                {activeBanners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentIndex === idx
                        ? 'w-5 sm:w-6 bg-white shadow'
                        : 'w-1.5 bg-white/50 hover:bg-white'
                    }`}
                    title={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Navigation Arrows (< and >) */}
              <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
                <button
                  onClick={handlePrev}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 hover:bg-white text-[#0B2A5B] flex items-center justify-center transition-all shadow-md border border-gray-200 active:scale-95"
                  title="Previous Announcement"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                </button>
                <button
                  onClick={handleNext}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 hover:bg-white text-[#0B2A5B] flex items-center justify-center transition-all shadow-md border border-gray-200 active:scale-95"
                  title="Next Announcement"
                >
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* State Super Admin Banner Manager Modal */}
      {showAdminModal && (
        <BannerManagerModal
          isOpen={showAdminModal}
          onClose={() => setShowAdminModal(false)}
        />
      )}
    </div>
  );
};
