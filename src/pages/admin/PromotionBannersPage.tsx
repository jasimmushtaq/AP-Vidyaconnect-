// ============================================================================
// AP VIDYACONNECT — STATE SUPER ADMIN PROMOTION BANNERS MANAGEMENT PAGE
// View, Create, Edit, Toggle, and Delete Promotional Carousel Banners
// ============================================================================

import React, { useState, useEffect } from 'react';
import { db } from '../../services/dbStore';
import { useModal } from '../../context/ModalContext';
import { AnnouncementBanner } from '../../types/database';
import { BannerManagerModal } from '../../components/admin/BannerManagerModal';
import {
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PromotionBannersPage: React.FC = () => {
  const { showConfirm } = useModal();
  const [banners, setBanners] = useState<AnnouncementBanner[]>(db.banners);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AnnouncementBanner | null>(null);

  // Sync state whenever db changes
  useEffect(() => {
    setBanners([...db.banners]);
  }, [isModalOpen]);

  const handleToggleActive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = banners.map(b => b.id === id ? { ...b, is_active: !b.is_active } : b);
    setBanners(updated);
    db.banners = updated;
  };

  const handleDelete = async (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = await showConfirm({
      title: 'Delete Promotion Banner?',
      subtitle: title,
      type: 'danger',
      badge: 'Portal Campaign Control',
      confirmText: 'Yes, Delete Banner',
      cancelText: 'Cancel',
      message: `Are you sure you want to delete the homepage announcement banner "${title}"?`
    });

    if (confirmed) {
      const updated = banners.filter(b => b.id !== id);
      setBanners(updated);
      db.banners = updated;
    }
  };

  const handleEdit = (banner: AnnouncementBanner) => {
    setEditingBanner(banner);
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setEditingBanner(null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#0E2350] via-[#102A60] to-[#1E3A8A] rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#F07421] font-bold text-xs uppercase tracking-wider mb-1">
            <Megaphone className="w-4 h-4 animate-bounce" />
            <span>Portal Announcements & Campaign Control</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Promotion Banners
          </h1>
          <p className="text-sm text-[#DCE5F5] mt-1 max-w-2xl">
            Manage the hero promotional carousel displayed on the AP VidyaConnect public portal and student homepage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition-all shadow-sm"
          >
            <ExternalLink className="w-4 h-4" />
            View Public Home
          </Link>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F07421] to-[#FF8A3D] hover:from-[#E06411] hover:to-[#F07421] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add New Banner
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Banners</p>
            <p className="text-2xl font-bold text-[#0E2350] mt-1">{banners.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0E2350]">
            <Layers className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Active Live Banners</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {banners.filter(b => b.is_active).length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Eye className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Draft / Inactive</p>
            <p className="text-2xl font-bold text-gray-500 mt-1">
              {banners.filter(b => !b.is_active).length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
            <EyeOff className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Banner Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[#0E2350] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#F07421]" />
          Configured Banners & Real-Time Previews
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`bg-white rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden flex flex-col ${
                banner.is_active ? 'border-blue-200' : 'border-gray-200 opacity-80'
              }`}
            >
              {/* Visual Banner Preview Strip */}
              {banner.banner_type === 'full_graphic' ? (
                <div className="relative w-full h-36 bg-gray-900 overflow-hidden flex items-center justify-center">
                  <img
                    src={banner.image_url || '/images/find-internship-near-you-banner.png'}
                    alt={banner.title}
                    className={`w-full h-full ${
                      banner.image_fit === 'contain' ? 'object-contain' : 'object-cover'
                    }`}
                  />
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase">
                    Full Graphic Banner
                  </div>
                </div>
              ) : (
                <div
                  className={`relative p-5 text-white overflow-hidden ${
                    banner.gradient_theme === 'saffron_red' ? 'bg-gradient-to-r from-[#FF6B00] via-[#F07421] to-[#E11D48]' :
                    banner.gradient_theme === 'ocean_blue' ? 'bg-gradient-to-r from-[#0E2350] via-[#1D4ED8] to-[#0284C7]' :
                    banner.gradient_theme === 'emerald_teal' ? 'bg-gradient-to-r from-[#1C8A3C] via-[#059669] to-[#0D9488]' :
                    banner.gradient_theme === 'royal_purple' ? 'bg-gradient-to-r from-[#6B21A8] via-[#8B5CF6] to-[#D946EF]' :
                    'bg-gradient-to-r from-[#0B132B] via-[#1C2541] to-[#F59E0B]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 relative z-10">
                    <div className="space-y-1.5 max-w-[70%]">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 backdrop-blur-sm border border-white/25 uppercase tracking-wider">
                        {banner.vertical_tag || 'Portal Feature'}
                      </span>
                      <h3 className="text-lg font-black leading-tight text-white drop-shadow-sm">
                        {banner.title}
                      </h3>
                      <p className="text-xs text-white/90 line-clamp-2">
                        {banner.subtitle}
                      </p>
                    </div>

                    {banner.image_url && (
                      <div className="shrink-0 flex items-center justify-center">
                        {banner.image_bg === 'transparent' ? (
                          <img
                            src={banner.image_url}
                            alt="Preview"
                            className={`max-h-20 max-w-[90px] ${
                              banner.image_fit === 'cover' ? 'object-cover' : 'object-contain'
                            } drop-shadow-md`}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : banner.image_bg === 'frame' || banner.image_fit === 'cover' ? (
                          <div className="w-20 h-20 rounded-xl overflow-hidden shadow-md border border-white/40 bg-black/10">
                            <img
                              src={banner.image_url}
                              alt="Preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="bg-white rounded-xl p-1.5 shadow-md border border-white/90 flex items-center justify-center max-w-[100px] max-h-[80px]">
                            <img
                              src={banner.image_url}
                              alt="Preview"
                              className="max-h-16 max-w-full object-contain rounded-md"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {banner.bullet_points && banner.bullet_points.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/20 flex flex-wrap gap-2 text-[11px] font-semibold text-white/95">
                      {banner.bullet_points.map((pt, i) => (
                        <span key={i} className="flex items-center gap-1 bg-black/15 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3 text-[#F07421]" />
                          {pt}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Banner Details & Action Controls */}
              <div className="p-4 flex-1 flex flex-col justify-between bg-gray-50/50">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span className="font-mono">Order: #{banner.display_order ?? (index + 1)}</span>
                  <span className="flex items-center gap-1">
                    Link target:{' '}
                    <span className="font-semibold text-blue-600">{banner.link_url || '/opportunities'}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <button
                    onClick={(e) => handleToggleActive(banner.id, e)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      banner.is_active
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {banner.is_active ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        Active (Live)
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                        Inactive (Hidden)
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => handleDelete(banner.id, banner.title, e)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Banner Manager Modal */}
      {isModalOpen && (
        <BannerManagerModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingBanner(null);
            setBanners([...db.banners]);
          }}
        />
      )}
    </div>
  );
};
