// ============================================================================
// AP VIDYACONNECT — HEADER & MULTI-PORTAL NAVIGATION COMPONENT
// Comprehensive Navigation: Explore Mega Menu, Opportunities, Partners, Colleges, Portal & Terms
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import {
  Bell,
  Search,
  Menu,
  X,
  Check,
  ArrowRight,
  ExternalLink,
  User,
  LogOut,
  School,
  Building2,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Compass,
  Briefcase,
  Layers,
  HelpCircle,
  Phone,
  FileText,
  Info,
  Scale,
  BookOpen,
  GraduationCap
} from 'lucide-react';

export const Header: React.FC<{ onMenuToggle?: () => void }> = ({ onMenuToggle }) => {
  const { currentUser, currentRole, currentInstitution, currentCompany, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [showExploreMenu, setShowExploreMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const exploreRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
        setShowExploreMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate('/login');
  };

  const isExploreActive = [
    '/about',
    '/how-it-works',
    '/for-institutions',
    '/for-companies',
    '/for-students',
    '/faqs',
    '/contact',
    '/terms'
  ].some(path => location.pathname === path);

  return (
    <header className="sticky top-0 z-40 w-full pt-2 sm:pt-2.5 pb-1 px-2.5 sm:px-6 lg:px-8 bg-transparent">
      <div className="w-full max-w-[1480px] mx-auto bg-white/95 backdrop-blur-md rounded-2xl lg:rounded-full border border-[#E2E8F0] shadow-[0_4px_24px_rgba(11,31,70,0.06)] px-3 sm:px-6 py-1.5 sm:py-2">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Brand Logo Lockup & Pixel Wind Technology Logo */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={() => {
                if (onMenuToggle) onMenuToggle();
                setMobileDrawerOpen(!mobileDrawerOpen);
              }}
              className="xl:hidden p-1.5 sm:p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
              <BrandLogo className="h-7 sm:h-9 w-auto" />

              <div className="h-5 sm:h-6 w-[1px] bg-[#D1D5DB] shrink-0" />

              <div className="flex items-center shrink-0">
                <img
                  src="/brand/pixelwind-logo.png"
                  alt="Pixel Wind Technology"
                  className="h-5 sm:h-7 w-auto object-contain transition-transform duration-300 group-hover:scale-105 select-none shrink-0"
                  title="Pixel Wind Technology"
                />
              </div>
            </Link>
          </div>

          {/* Center: Navigation Bar */}
          <nav className="hidden xl:flex items-center space-x-1 lg:space-x-2">
            {/* 1. Explore Dropdown Menu */}
            <div className="relative" ref={exploreRef}>
              <button
                type="button"
                onClick={() => {
                  setShowExploreMenu(!showExploreMenu);
                  setShowProfileMenu(false);
                }}
                className={`relative px-3 py-2 text-[14px] font-bold tracking-tight transition-colors flex items-center gap-1.5 rounded-full hover:bg-slate-50 ${
                  isExploreActive || showExploreMenu ? 'text-[#0B1F46]' : 'text-[#10264A] hover:text-[#1456C0]'
                }`}
              >
                <Compass className="w-4 h-4 text-[#FF6500]" />
                <span>Explore</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showExploreMenu ? 'rotate-180 text-[#0B1F46]' : 'text-gray-400'}`} />
                {isExploreActive && (
                  <span className="absolute bottom-0 left-3.5 right-3.5 h-[2.5px] bg-[#FF6500] rounded-full" />
                )}
              </button>

              {/* Explore Mega Dropdown */}
              {showExploreMenu && (
                <div className="absolute left-0 mt-2 w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0E2350] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF6500]" />
                      Explore AP VidyaConnect
                    </span>
                    <span className="text-[10px] font-semibold text-gray-400">Higher Education Gateway</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1 pt-2">
                    <Link
                      to="/about"
                      onClick={() => setShowExploreMenu(false)}
                      className="p-2.5 rounded-xl hover:bg-[#EEF2FA] transition-colors flex items-start gap-2.5 text-left group"
                    >
                      <Info className="w-4 h-4 text-[#2A4E96] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-[#0E2350] group-hover:text-[#2A4E96]">About Platform</p>
                        <p className="text-[10px] text-gray-500 leading-tight">Vision 2047 & State Mandate</p>
                      </div>
                    </Link>

                    <Link
                      to="/how-it-works"
                      onClick={() => setShowExploreMenu(false)}
                      className="p-2.5 rounded-xl hover:bg-[#FFF3EA] transition-colors flex items-start gap-2.5 text-left group"
                    >
                      <Layers className="w-4 h-4 text-[#FF6500] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-[#0E2350] group-hover:text-[#FF6500]">How It Works</p>
                        <p className="text-[10px] text-gray-500 leading-tight">5-Step Lifecycle Guide</p>
                      </div>
                    </Link>

                    <Link
                      to="/institutions"
                      onClick={() => setShowExploreMenu(false)}
                      className="p-2.5 rounded-xl hover:bg-emerald-50 transition-colors flex items-start gap-2.5 text-left group"
                    >
                      <School className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-[#0E2350] group-hover:text-emerald-700">Institutional Network</p>
                        <p className="text-[10px] text-gray-500 leading-tight">Accredited AP Colleges</p>
                      </div>
                    </Link>

                    <Link
                      to="/partners"
                      onClick={() => setShowExploreMenu(false)}
                      className="p-2.5 rounded-xl hover:bg-blue-50 transition-colors flex items-start gap-2.5 text-left group"
                    >
                      <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-[#0E2350] group-hover:text-blue-700">Industry Partners</p>
                        <p className="text-[10px] text-gray-500 leading-tight">Corporate Directory</p>
                      </div>
                    </Link>

                    <Link
                      to="/for-institutions"
                      onClick={() => setShowExploreMenu(false)}
                      className="p-2.5 rounded-xl hover:bg-gray-50 transition-colors flex items-start gap-2.5 text-left group"
                    >
                      <BookOpen className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-[#0E2350]">For Colleges</p>
                        <p className="text-[10px] text-gray-500 leading-tight">Placement Manual</p>
                      </div>
                    </Link>

                    <Link
                      to="/for-companies"
                      onClick={() => setShowExploreMenu(false)}
                      className="p-2.5 rounded-xl hover:bg-gray-50 transition-colors flex items-start gap-2.5 text-left group"
                    >
                      <Briefcase className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-[#0E2350]">For Companies</p>
                        <p className="text-[10px] text-gray-500 leading-tight">Hiring & POSH Norms</p>
                      </div>
                    </Link>

                    <Link
                      to="/for-students"
                      onClick={() => setShowExploreMenu(false)}
                      className="p-2.5 rounded-xl hover:bg-gray-50 transition-colors flex items-start gap-2.5 text-left group"
                    >
                      <GraduationCap className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-[#0E2350]">For Students</p>
                        <p className="text-[10px] text-gray-500 leading-tight">Geofence Attendance</p>
                      </div>
                    </Link>

                    <Link
                      to="/faqs"
                      onClick={() => setShowExploreMenu(false)}
                      className="p-2.5 rounded-xl hover:bg-gray-50 transition-colors flex items-start gap-2.5 text-left group"
                    >
                      <HelpCircle className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-[#0E2350]">FAQs & Helpdesk</p>
                        <p className="text-[10px] text-gray-500 leading-tight">Common Questions</p>
                      </div>
                    </Link>
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                    <Link
                      to="/contact"
                      onClick={() => setShowExploreMenu(false)}
                      className="p-2 bg-gray-50 hover:bg-[#EEF2FA] rounded-lg text-center font-bold text-[#0E2350] transition-colors flex items-center justify-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#FF6500]" />
                      <span>Contact Nodal Desk</span>
                    </Link>
                    <Link
                      to="/terms"
                      onClick={() => setShowExploreMenu(false)}
                      className="p-2 bg-gray-50 hover:bg-[#EEF2FA] rounded-lg text-center font-bold text-gray-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <Scale className="w-3.5 h-3.5 text-gray-500" />
                      <span>Terms & Policies</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Opportunities (with OPEN Badge) */}
            <Link
              to="/opportunities"
              className={`relative px-3 py-2 text-[14px] font-bold tracking-tight transition-colors flex items-center gap-1.5 rounded-full hover:bg-slate-50 ${
                location.pathname.startsWith('/opportunities') ? 'text-[#0B1F46]' : 'text-[#10264A] hover:text-[#1456C0]'
              }`}
            >
              <span>Opportunities</span>
              <span className="px-1.5 py-0.5 bg-[#FF6500] text-white rounded text-[9.5px] font-black uppercase shadow-2xs leading-none">
                OPEN
              </span>
              {location.pathname.startsWith('/opportunities') && (
                <span className="absolute bottom-0 left-3.5 right-3.5 h-[2.5px] bg-[#FF6500] rounded-full" />
              )}
            </Link>

            {/* 3. Industry Partners */}
            <Link
              to="/partners"
              className={`relative px-3 py-2 text-[14px] font-bold tracking-tight transition-colors rounded-full hover:bg-slate-50 ${
                location.pathname.startsWith('/partners') ? 'text-[#0B1F46]' : 'text-[#10264A] hover:text-[#1456C0]'
              }`}
            >
              <span>Industry Partners</span>
              {location.pathname.startsWith('/partners') && (
                <span className="absolute bottom-0 left-3.5 right-3.5 h-[2.5px] bg-[#FF6500] rounded-full" />
              )}
            </Link>

            {/* 4. Institutional Network */}
            <Link
              to="/institutions"
              className={`relative px-3 py-2 text-[14px] font-bold tracking-tight transition-colors rounded-full hover:bg-slate-50 ${
                location.pathname.startsWith('/institutions') ? 'text-[#0B1F46]' : 'text-[#10264A] hover:text-[#1456C0]'
              }`}
            >
              <span>Institutional Network</span>
              {location.pathname.startsWith('/institutions') && (
                <span className="absolute bottom-0 left-3.5 right-3.5 h-[2.5px] bg-[#FF6500] rounded-full" />
              )}
            </Link>

            {/* 5. Contact Us */}
            <Link
              to="/contact"
              className={`relative px-3 py-2 text-[14px] font-bold tracking-tight transition-colors rounded-full hover:bg-slate-50 ${
                location.pathname.startsWith('/contact') ? 'text-[#0B1F46]' : 'text-[#10264A] hover:text-[#1456C0]'
              }`}
            >
              <span>Contact Us</span>
              {location.pathname.startsWith('/contact') && (
                <span className="absolute bottom-0 left-3.5 right-3.5 h-[2.5px] bg-[#FF6500] rounded-full" />
              )}
            </Link>
          </nav>

          {/* Right: Notifications / Profile or Sign In / Register */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Realtime Notification Center Dropdown — Authenticated Sessions Only */}
            {isAuthenticated && currentUser && (
              <>
                <NotificationDropdown />
                <div className="h-6 w-[1px] bg-gray-200 hidden sm:block" />
              </>
            )}

            {/* Profile Pill & Dropdown / Sign In */}
            {isAuthenticated && currentUser ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowExploreMenu(false);
                  }}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors text-left"
                >
                  <img
                    src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={currentUser.full_name}
                    className="w-8 sm:w-9 h-8 sm:h-9 rounded-full object-cover border border-gray-300 shadow-2xs"
                  />
                  <div className="hidden sm:flex flex-col text-left leading-tight">
                    <p className="text-xs font-bold text-[#0B1F46] leading-none">
                      {currentUser.full_name.includes('Dr.') ? 'Dr.' : currentUser.full_name.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium capitalize mt-0.5">
                      {currentRole === 'super_admin' ? 'Super Admin' : currentRole === 'student' ? 'Student Intern' : currentRole?.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>

                {/* Profile Menu Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2.5 border-b border-gray-100 space-y-1">
                      <p className="text-xs font-bold text-[#0E2350]">{currentUser.full_name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{currentUser.email}</p>
                      <span className="inline-block bg-[#EEF2FA] text-[#0E2350] text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                        {currentRole?.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-[#EEF2FA] hover:text-[#0E2350] transition-colors font-medium"
                      >
                        <User className="w-4 h-4 text-[#2A4E96]" />
                        My Profile & Organization
                      </Link>

                      <Link
                        to="/dashboard"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-[#EEF2FA] hover:text-[#0E2350] transition-colors font-medium"
                      >
                        <School className="w-4 h-4 text-[#F07421]" />
                        Platform Portal Workspace
                      </Link>

                      <Link
                        to="/notifications"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-[#EEF2FA] hover:text-[#0E2350] transition-colors font-medium"
                      >
                        <Bell className="w-4 h-4 text-emerald-600" />
                        Notification Center
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          (window as any).replayApkSplash?.();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-blue-700 hover:bg-blue-50 transition-colors font-medium text-left"
                      >
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        Preview Mobile Launch Animation
                      </button>
                    </div>

                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors font-semibold text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out / Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                <Link
                  to="/login"
                  className="text-xs sm:text-[14px] font-bold text-[#10264A] hover:text-[#1456C0] transition-colors py-1.5 px-2.5 sm:px-3 rounded-full hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 sm:px-5.5 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-[#FF6500] to-[#E9272E] hover:from-[#E65A00] hover:to-[#D41E25] text-white text-xs sm:text-[13.5px] font-extrabold shadow-sm hover:shadow-md transition-all active:scale-95 tracking-tight flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>Register</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Responsive Mobile Drawer Menu */}
      {mobileDrawerOpen && (
        <div className="xl:hidden bg-white border-b border-gray-200 p-4 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <Link
              to="/opportunities"
              onClick={() => setMobileDrawerOpen(false)}
              className="p-2.5 bg-orange-50 rounded-xl text-[#0E2350] flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4 text-[#F07421]" />
              Opportunities
            </Link>

            <Link
              to="/partners"
              onClick={() => setMobileDrawerOpen(false)}
              className="p-2.5 bg-gray-50 rounded-xl text-[#0E2350] flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-blue-600" />
              Industry Partners
            </Link>

            <Link
              to="/institutions"
              onClick={() => setMobileDrawerOpen(false)}
              className="p-2.5 bg-gray-50 rounded-xl text-[#0E2350] flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              Institutional Network
            </Link>

            <Link
              to="/about"
              onClick={() => setMobileDrawerOpen(false)}
              className="p-2.5 bg-gray-50 rounded-xl text-[#0E2350] flex items-center gap-2"
            >
              <Info className="w-4 h-4 text-teal-600" />
              About Platform
            </Link>

            <Link
              to="/contact"
              onClick={() => setMobileDrawerOpen(false)}
              className="p-2.5 bg-gray-50 rounded-xl text-[#0E2350] flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-[#F07421]" />
              Contact Us
            </Link>

            <Link
              to="/terms"
              onClick={() => setMobileDrawerOpen(false)}
              className="p-2.5 bg-gray-50 rounded-xl text-gray-700 col-span-2 flex items-center justify-center gap-2"
            >
              <Scale className="w-4 h-4 text-gray-500" />
              Terms & Legal Regulatory Framework
            </Link>

            <button
              type="button"
              onClick={() => {
                setMobileDrawerOpen(false);
                (window as any).replayApkSplash?.();
              }}
              className="p-2.5 bg-blue-50/80 rounded-xl text-blue-800 col-span-2 flex items-center justify-center gap-2 font-semibold text-xs"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              Preview Mobile Launch Animation
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
