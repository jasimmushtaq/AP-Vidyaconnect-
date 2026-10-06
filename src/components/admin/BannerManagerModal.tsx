// ============================================================================
// AP VIDYACONNECT — STATE SUPER ADMIN BANNER MANAGER MODAL
// Full CRUD modal to Add, Edit, Upload from Device, Toggle, and Delete promotional banners
// ============================================================================

import React, { useState, useRef } from 'react';
import { db } from '../../services/dbStore';
import { AnnouncementBanner } from '../../types/database';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Image as ImageIcon,
  Palette,
  Layers,
  ListPlus,
  Check,
  Upload,
  Link as LinkIcon,
  Maximize2,
  Sparkle,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';

import { uploadToCloudinary } from '../../services/cloudinaryService';

interface BannerManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GRADIENT_THEMES = [
  { id: 'saffron_red', label: 'Saffron & Warm Red (AICTE Style)', preview: 'from-[#FF6B00] via-[#F07421] to-[#E11D48]' },
  { id: 'ocean_blue', label: 'Deep Ocean Blue & Cyan', preview: 'from-[#0E2350] via-[#1D4ED8] to-[#0284C7]' },
  { id: 'emerald_teal', label: 'Andhra Emerald & Teal', preview: 'from-[#1C8A3C] via-[#059669] to-[#0D9488]' },
  { id: 'royal_purple', label: 'Royal Purple & Magenta', preview: 'from-[#6B21A8] via-[#8B5CF6] to-[#D946EF]' },
  { id: 'midnight_gold', label: 'Midnight Navy & Gold', preview: 'from-[#0B132B] via-[#1C2541] to-[#F59E0B]' },
];

const PRESET_IMAGES = [
  { label: 'Diverse Student Team (Thumbs Up)', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80' },
  { label: 'Young Tech College Students', url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80' },
  { label: 'Engineering & Skill Workshop', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80' },
  { label: 'Modern Campus Collaboration', url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80' },
];

export const BannerManagerModal: React.FC<BannerManagerModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { showConfirm } = useModal();
  const [banners, setBanners] = useState<AnnouncementBanner[]>(db.banners);
  const [editingBanner, setEditingBanner] = useState<AnnouncementBanner | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [imageSourceTab, setImageSourceTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<{
    vertical_tag: string;
    title: string;
    subtitle: string;
    bullet_points: string[];
    pill_badge: string;
    link_url: string;
    link_label: string;
    gradient_theme: 'saffron_red' | 'ocean_blue' | 'emerald_teal' | 'royal_purple' | 'midnight_gold';
    image_url: string;
    banner_type: 'card_template' | 'full_graphic';
    image_fit: 'cover' | 'contain';
    image_bg: 'white' | 'transparent' | 'frame';
    is_active: boolean;
    display_order: number;
  }>({
    vertical_tag: 'Aaj Intern,',
    title: 'Kal Industry Ready',
    subtitle: 'National & State Internship Mission',
    bullet_points: [
      'Companies can post Internships on an ongoing basis',
      'Check last date of the application for each internship carefully',
      'Keep visiting to explore new internships'
    ],
    pill_badge: 'Financial assistance: Min. ₹9000/month | Internship duration - 6 / 9 months | Youth between 18-25 can apply',
    link_url: '/opportunities',
    link_label: 'Explore Opportunities',
    gradient_theme: 'saffron_red',
    image_url: PRESET_IMAGES[0].url,
    banner_type: 'card_template',
    image_fit: 'cover',
    image_bg: 'white',
    is_active: true,
    display_order: 1,
  });

  const [currentBulletInput, setCurrentBulletInput] = useState('');

  if (!isOpen) return null;

  const refreshList = () => {
    setBanners([...db.banners]);
  };

  const handleStartCreate = () => {
    setEditingBanner(null);
    setIsCreatingNew(true);
    setImageSourceTab('upload');
    setFormData({
      vertical_tag: 'State Initiative,',
      title: 'New Industry Accelerator Scheme',
      subtitle: 'Official Announcement',
      bullet_points: [
        'Direct stipends funded by Government of Andhra Pradesh',
        'Academic credit transfer verified by APSCHE'
      ],
      pill_badge: 'Govt Accredited | Open for all AP College Students',
      link_url: '/opportunities',
      link_label: 'Apply Now',
      gradient_theme: 'saffron_red',
      image_url: '',
      banner_type: 'card_template',
      image_fit: 'contain',
      image_bg: 'white',
      is_active: true,
      display_order: banners.length + 1,
    });
  };

  const handleStartEdit = (b: AnnouncementBanner) => {
    setIsCreatingNew(false);
    setEditingBanner(b);
    setImageSourceTab(b.image_url?.startsWith('data:') ? 'upload' : 'url');
    setFormData({
      vertical_tag: b.vertical_tag || '',
      title: b.title,
      subtitle: b.subtitle || '',
      bullet_points: b.bullet_points || [],
      pill_badge: b.pill_badge || '',
      link_url: b.link_url || '',
      link_label: b.link_label || '',
      gradient_theme: b.gradient_theme,
      image_url: b.image_url || '',
      banner_type: b.banner_type || 'card_template',
      image_fit: b.image_fit || 'contain',
      image_bg: b.image_bg || 'white',
      is_active: b.is_active,
      display_order: b.display_order,
    });
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP, SVG)');
      return;
    }
    try {
      const res = await uploadToCloudinary(file, { folder: 'platform/banners' });
      setFormData(prev => ({
        ...prev,
        image_url: res.secure_url || res.url
      }));
    } catch (err) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFormData(prev => ({
          ...prev,
          image_url: dataUrl
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleAddBullet = () => {
    if (!currentBulletInput.trim()) return;
    setFormData({
      ...formData,
      bullet_points: [...formData.bullet_points, currentBulletInput.trim()]
    });
    setCurrentBulletInput('');
  };

  const handleRemoveBullet = (index: number) => {
    setFormData({
      ...formData,
      bullet_points: formData.bullet_points.filter((_, idx) => idx !== index)
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (isCreatingNew) {
      db.createBanner(formData, { id: currentUser?.id, name: currentUser?.full_name, role: 'super_admin' });
    } else if (editingBanner) {
      db.updateBanner(editingBanner.id, formData, { id: currentUser?.id, name: currentUser?.full_name, role: 'super_admin' });
    }

    refreshList();
    setIsCreatingNew(false);
    setEditingBanner(null);
  };

  const handleDelete = async (id: string) => {
    const target = banners.find(b => b.id === id);
    const confirmed = await showConfirm({
      title: 'Delete Announcement Banner?',
      subtitle: target?.title || 'Selected Banner',
      type: 'danger',
      badge: 'Hero Carousel Manager',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      message: 'Are you sure you want to permanently delete this announcement banner from the public homepage carousel?'
    });

    if (confirmed) {
      db.deleteBanner(id, { id: currentUser?.id, name: currentUser?.full_name, role: 'super_admin' });
      refreshList();
      if (editingBanner?.id === id) {
        setEditingBanner(null);
        setIsCreatingNew(false);
      }
    }
  };

  const handleToggle = (id: string) => {
    db.toggleBannerStatus(id, { id: currentUser?.id, name: currentUser?.full_name, role: 'super_admin' });
    refreshList();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0E2350] text-white flex items-center justify-between border-b border-[#14336F]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F07421] flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">State Super Admin: Announcement Banners Manager</h3>
              <p className="text-xs text-blue-200">
                Upload graphics directly from device or configure interactive announcement slides
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: List of Banners (5 cols) */}
          <div className="lg:col-span-5 space-y-4 border-r border-gray-200 pr-0 lg:pr-6">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0E2350]">
                Configured Banners ({banners.length})
              </h4>
              <button
                type="button"
                onClick={handleStartCreate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E2350] hover:bg-[#14336F] text-white text-xs font-bold shadow transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-[#F07421]" />
                <span>Add Banner</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1">
              {banners.map((b) => {
                const isSelected = editingBanner?.id === b.id;
                return (
                  <div
                    key={b.id}
                    className={`rounded-xl border p-3.5 transition-all ${
                      isSelected
                        ? 'bg-blue-50/80 border-[#2A4E96] ring-2 ring-[#2A4E96]/30 shadow-sm'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                            #{b.display_order}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                              b.is_active
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {b.is_active ? 'Active on Home' : 'Hidden'}
                          </span>
                          {b.banner_type === 'full_graphic' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                              Full Graphic
                            </span>
                          )}
                        </div>
                        <h5 className="text-xs font-bold text-[#0E2350] line-clamp-1">{b.title}</h5>
                        {b.vertical_tag && (
                          <p className="text-[10px] text-gray-500 font-medium">{b.vertical_tag}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleToggle(b.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            b.is_active
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={b.is_active ? 'Hide from homepage' : 'Show on homepage'}
                        >
                          {b.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleStartEdit(b)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit banner"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete banner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Form Editor (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0E2350] flex items-center gap-2">
              <span>{isCreatingNew ? 'Create New Announcement Banner' : editingBanner ? 'Edit Banner Details' : 'Select a banner to edit or create a new one'}</span>
            </h4>

            {(isCreatingNew || editingBanner) ? (
              <form onSubmit={handleSave} className="space-y-4 bg-gray-50/70 p-4 rounded-xl border border-gray-200">
                {/* Banner Mode / Layout Switcher */}
                <div className="p-3 bg-white rounded-xl border border-blue-100 shadow-2xs">
                  <label className="block text-xs font-bold text-[#0E2350] mb-2 flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-[#F07421]" />
                    Banner Presentation Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, banner_type: 'card_template' })}
                      className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                        formData.banner_type === 'card_template'
                          ? 'border-[#0E2350] bg-blue-50/50 ring-2 ring-[#0E2350]/30'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xs font-bold text-[#0E2350]">Standard Template</span>
                      <span className="text-[10px] text-gray-500">Gradient background + Title, bullet points & side graphic</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, banner_type: 'full_graphic' })}
                      className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                        formData.banner_type === 'full_graphic'
                          ? 'border-[#0E2350] bg-blue-50/50 ring-2 ring-[#0E2350]/30'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xs font-bold text-[#0E2350]">Full Banner Graphic (Edge-to-Edge)</span>
                      <span className="text-[10px] text-gray-500">Perfect for Canva / Photoshop / Figma artwork banners</span>
                    </button>
                  </div>
                </div>

                {/* Vertical Tag & Title */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Vertical Tag / Tagline
                    </label>
                    <input
                      type="text"
                      value={formData.vertical_tag}
                      onChange={(e) => setFormData({ ...formData, vertical_tag: e.target.value })}
                      placeholder="e.g. Aaj Intern,"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2A4E96] focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Main Banner Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Kal Industry Ready"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2A4E96] focus:outline-none"
                    />
                  </div>
                </div>

                {formData.banner_type === 'card_template' && (
                  <>
                    {/* Subtitle */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Subtitle / Mission Tag
                      </label>
                      <input
                        type="text"
                        value={formData.subtitle}
                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                        placeholder="e.g. National & State Internship Mission"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2A4E96] focus:outline-none"
                      />
                    </div>

                    {/* Bullet Points */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Bullet Points / Key Features
                      </label>
                      <div className="space-y-1.5 mb-2">
                        {formData.bullet_points.map((pt, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-xs">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="flex-1 text-gray-700">{pt}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveBullet(idx)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={currentBulletInput}
                          onChange={(e) => setCurrentBulletInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddBullet();
                            }
                          }}
                          placeholder="Type bullet point and press Enter or Add..."
                          className="flex-1 text-xs px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2A4E96] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddBullet}
                          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-bold transition-all"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Pill Badge Text */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Bottom Pill Badge Text (Stipend / Eligibility)
                      </label>
                      <input
                        type="text"
                        value={formData.pill_badge}
                        onChange={(e) => setFormData({ ...formData, pill_badge: e.target.value })}
                        placeholder="e.g. Financial assistance: Min. ₹9000/month | Duration - 6 / 9 months"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2A4E96] focus:outline-none"
                      />
                    </div>

                    {/* Gradient Theme Picker */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Background Color Gradient Theme
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {GRADIENT_THEMES.map((th) => (
                          <button
                            key={th.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, gradient_theme: th.id as any })}
                            className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                              formData.gradient_theme === th.id
                                ? 'border-[#0E2350] bg-white ring-2 ring-[#0E2350]'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${th.preview} shrink-0`} />
                            <span className="text-[11px] font-medium text-gray-700 truncate">{th.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Image Section with Device Upload, URL, Fit Mode */}
                <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#F07421]" />
                      Banner Visual Graphic
                    </label>

                    {/* Tab Switcher */}
                    <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setImageSourceTab('upload')}
                        className={`px-2 py-1 rounded text-[11px] font-bold transition-all flex items-center gap-1 ${
                          imageSourceTab === 'upload'
                            ? 'bg-white text-[#0E2350] shadow-2xs'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <Upload className="w-3 h-3" />
                        From Device
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageSourceTab('url')}
                        className={`px-2 py-1 rounded text-[11px] font-bold transition-all flex items-center gap-1 ${
                          imageSourceTab === 'url'
                            ? 'bg-white text-[#0E2350] shadow-2xs'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <LinkIcon className="w-3 h-3" />
                        Web URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageSourceTab('presets')}
                        className={`px-2 py-1 rounded text-[11px] font-bold transition-all flex items-center gap-1 ${
                          imageSourceTab === 'presets'
                            ? 'bg-white text-[#0E2350] shadow-2xs'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Presets
                      </button>
                    </div>
                  </div>

                  {/* Device Upload Drag-and-Drop Box */}
                  {imageSourceTab === 'upload' && (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`cursor-pointer border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                        isDragging
                          ? 'border-[#F07421] bg-orange-50'
                          : 'border-gray-300 hover:border-blue-400 bg-gray-50/60'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/webp, image/svg+xml"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                      />
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-[#0E2350]">
                          <Upload className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-bold text-gray-700">
                          Click to browse or drag & drop banner image from device
                        </p>
                        <p className="text-[10px] text-gray-400">
                          Supports PNG, JPG, WebP, SVG • Automatically sized and optimized
                        </p>
                      </div>
                    </div>
                  )}

                  {/* URL Input */}
                  {imageSourceTab === 'url' && (
                    <input
                      type="text"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="Paste Image URL (https://...)..."
                      className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2A4E96] focus:outline-none"
                    />
                  )}

                  {/* Presets Grid */}
                  {imageSourceTab === 'presets' && (
                    <div className="flex flex-wrap gap-2">
                      {PRESET_IMAGES.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setFormData({ ...formData, image_url: img.url })}
                          className={`text-[10px] px-2 py-1 rounded border transition-all ${
                            formData.image_url === img.url
                              ? 'bg-blue-50 border-blue-500 font-bold text-blue-700'
                              : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {img.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Image Fit Option, Background Style & Live Preview */}
                  {formData.image_url && (
                    <div className="pt-3 border-t border-gray-100 space-y-3">
                      {/* Fit Mode */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-gray-700 flex items-center gap-1">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-[#0E2350]" />
                          Image Scaling:
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, image_fit: 'contain', image_bg: 'white' })}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all ${
                              formData.image_fit === 'contain'
                                ? 'bg-[#0E2350] text-white border-[#0E2350]'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            Fit Logo / Graphic (Contain)
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, image_fit: 'cover', image_bg: 'frame' })}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all ${
                              formData.image_fit === 'cover'
                                ? 'bg-[#0E2350] text-white border-[#0E2350]'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            Fill Frame (Cover)
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, image_url: '' })}
                            className="px-2 py-1 text-[11px] font-bold text-red-600 hover:bg-red-50 rounded transition-all"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      {/* Card Background Style */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-gray-700">Graphic Container Style:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, image_bg: 'white' })}
                            className={`px-2 py-1 rounded text-[11px] font-bold border transition-all ${
                              formData.image_bg === 'white'
                                ? 'bg-blue-50 border-blue-600 text-[#0E2350] ring-1 ring-blue-600'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            White Card (Clean Logo Fit)
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, image_bg: 'transparent' })}
                            className={`px-2 py-1 rounded text-[11px] font-bold border transition-all ${
                              formData.image_bg === 'transparent'
                                ? 'bg-blue-50 border-blue-600 text-[#0E2350] ring-1 ring-blue-600'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            Frameless / Transparent
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, image_bg: 'frame' })}
                            className={`px-2 py-1 rounded text-[11px] font-bold border transition-all ${
                              formData.image_bg === 'frame'
                                ? 'bg-blue-50 border-blue-600 text-[#0E2350] ring-1 ring-blue-600'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            Photo Frame
                          </button>
                        </div>
                      </div>

                      {/* Live Image Fit Thumbnail Box */}
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Live Render Preview in Banner Theme
                        </p>
                        <div
                          className={`w-full h-32 rounded-xl overflow-hidden flex items-center justify-center p-3 border shadow-inner ${
                            formData.gradient_theme === 'saffron_red' ? 'bg-gradient-to-r from-[#FF6B00] to-[#E11D48]' :
                            formData.gradient_theme === 'ocean_blue' ? 'bg-gradient-to-r from-[#0E2350] to-[#0284C7]' :
                            formData.gradient_theme === 'emerald_teal' ? 'bg-gradient-to-r from-[#1C8A3C] to-[#0D9488]' :
                            formData.gradient_theme === 'royal_purple' ? 'bg-gradient-to-r from-[#6B21A8] to-[#D946EF]' :
                            'bg-gradient-to-r from-[#0B132B] to-[#F59E0B]'
                          }`}
                        >
                          {formData.image_bg === 'transparent' ? (
                            <img
                              src={formData.image_url}
                              alt="Banner Preview"
                              className={`max-h-24 max-w-[200px] ${
                                formData.image_fit === 'cover' ? 'object-cover' : 'object-contain'
                              } drop-shadow-xl`}
                            />
                          ) : formData.image_bg === 'frame' || formData.image_fit === 'cover' ? (
                            <div className="w-44 h-24 rounded-xl overflow-hidden shadow-xl border-2 border-white/40 bg-black/10">
                              <img
                                src={formData.image_url}
                                alt="Banner Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="bg-white rounded-xl p-2 shadow-2xl border border-white/90 flex items-center justify-center max-w-[180px] max-h-[96px]">
                              <img
                                src={formData.image_url}
                                alt="Banner Preview"
                                className="max-h-20 max-w-full object-contain rounded-md"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Link & Active Toggle */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center pt-2 border-t border-gray-200">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Button Link URL
                    </label>
                    <input
                      type="text"
                      value={formData.link_url}
                      onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                      placeholder="/opportunities"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2A4E96] focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-1 flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="is_active_toggle"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-[#0E2350] rounded border-gray-300 focus:ring-[#0E2350]"
                    />
                    <label htmlFor="is_active_toggle" className="text-xs font-bold text-gray-700">
                      Active on Home
                    </label>
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingNew(false);
                      setEditingBanner(null);
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#0E2350] hover:bg-[#14336F] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5 text-[#F07421]" />
                    <span>{isCreatingNew ? 'Create & Publish Banner' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <ImageIcon className="w-10 h-10 text-gray-300 mb-2" />
                <p className="text-xs font-bold text-gray-600">No banner selected for editing</p>
                <p className="text-[11px] text-gray-400 mt-1 max-w-xs">
                  Select an existing banner from the left list or click Add Banner to upload artwork from device.
                </p>
                <button
                  type="button"
                  onClick={handleStartCreate}
                  className="mt-4 px-4 py-2 bg-[#0E2350] text-white rounded-lg text-xs font-bold hover:bg-[#14336F] transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-[#F07421]" />
                  Add New Banner
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Changes synchronize automatically to homepage carousel
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
