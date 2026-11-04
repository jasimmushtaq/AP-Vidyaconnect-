// ============================================================================
// AP VIDYACONNECT — PREMIUM REDESIGNED FOOTER COMPONENT
// Closely matching official reference design: Deep Navy to Royal Blue Gradient,
// Fluid Waves, Orange Swooshes, Dotted Patterns & Transparent Action Pills
// Visible on website; automatically hidden in native Android / Capacitor APK
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { BrandLogo } from '../common/BrandLogo';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Globe,
  Linkedin,
  ChevronRight,
  Layers,
  Headset
} from 'lucide-react';

export const Footer: React.FC = () => {
  // Check if running inside mobile APK / Capacitor native platform
  const [isApk, setIsApk] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      Capacitor.isNativePlatform() ||
      Capacitor.getPlatform() === 'android' ||
      Capacitor.getPlatform() === 'ios' ||
      !!(window as any).Capacitor?.isNativePlatform?.() ||
      /Capacitor|MobileApp/i.test(navigator.userAgent) ||
      window.location.search.includes('platform=apk')
    );
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isNative =
        Capacitor.isNativePlatform() ||
        Capacitor.getPlatform() === 'android' ||
        Capacitor.getPlatform() === 'ios' ||
        !!(window as any).Capacitor?.isNativePlatform?.() ||
        document.documentElement.classList.contains('plt-mobile') ||
        document.documentElement.classList.contains('plt-capacitor') ||
        /Capacitor|MobileApp/i.test(navigator.userAgent) ||
        window.location.search.includes('platform=apk');
      if (isNative) {
        setIsApk(true);
      }
    }
  }, []);

  // When running inside the Android APK, completely hide the website footer
  if (isApk) {
    return null;
  }

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-[#061D49] via-[#082E72] to-[#041639] text-white pt-16 sm:pt-20 pb-8 mt-12 sm:mt-16">
      
      {/* ======================================================================== */}
      {/* 1. TOP CURVED WAVE & VIBRANT ORANGE SWOOSHES (BACKGROUND ARTWORK)        */}
      {/* ======================================================================== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        
        {/* Top-Left Vibrant Orange Sweep Arc */}
        <div className="absolute top-0 left-0 w-80 sm:w-[480px] h-32 sm:h-44 pointer-events-none">
          <svg viewBox="0 0 500 160" fill="none" className="w-full h-full">
            <path
              d="M 0 0 L 360 0 C 260 35, 140 100, 0 150 Z"
              fill="url(#footer-top-orange)"
            />
            <path
              d="M 0 0 L 400 0 C 290 40, 160 115, 0 160"
              stroke="#60A5FA"
              strokeWidth="2"
              strokeOpacity="0.4"
            />
            <defs>
              <linearGradient id="footer-top-orange" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF7900" />
                <stop offset="100%" stopColor="#FF5500" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Top Wave S-Curve Flow across the Header */}
        <div className="absolute top-0 right-0 w-full lg:w-[70%] h-24 sm:h-36 pointer-events-none opacity-40">
          <svg viewBox="0 0 1000 140" fill="none" preserveAspectRatio="none" className="w-full h-full">
            <path
              d="M 0 0 C 300 90, 650 10, 1000 70 L 1000 0 Z"
              fill="url(#footer-royal-wave)"
            />
            <defs>
              <linearGradient id="footer-royal-wave" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1E58C8" stopOpacity="0.2" />
                <stop offset="60%" stopColor="#38BDF8" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#1E58C8" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Bottom-Right Curved Vibrant Orange Swoosh */}
        <div className="absolute -bottom-1 right-0 w-72 sm:w-[440px] h-28 sm:h-40 pointer-events-none">
          <svg viewBox="0 0 450 160" fill="none" className="w-full h-full">
            <path
              d="M 120 160 C 220 135, 320 80, 450 15 L 450 160 Z"
              fill="url(#footer-bottom-orange)"
            />
            <path
              d="M 160 160 C 250 140, 340 95, 450 40"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeOpacity="0.5"
            />
            <defs>
              <linearGradient id="footer-bottom-orange" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF7900" />
                <stop offset="100%" stopColor="#FF5500" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Subtle Dot Matrix Pattern - Left Side */}
        <svg className="absolute left-6 top-32 w-40 h-56 opacity-20 pointer-events-none" fill="none">
          <pattern id="footer-dots-left" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.3" fill="#38BDF8" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#footer-dots-left)" />
        </svg>

        {/* Subtle Dot Matrix Pattern - Upper Right Side */}
        <svg className="absolute right-20 top-8 w-52 h-44 opacity-20 pointer-events-none" fill="none">
          <pattern id="footer-dots-right" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.3" fill="#60A5FA" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#footer-dots-right)" />
        </svg>

        {/* Soft Blue Ambient Glow Spots */}
        <div className="absolute top-1/4 right-1/3 w-96 h-96 rounded-full bg-[#1E58C8]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-80 h-80 rounded-full bg-[#0A3A9A]/20 blur-3xl pointer-events-none" />
      </div>

      {/* ======================================================================== */}
      {/* 2. FOUR COLUMN MAIN FOOTER CONTENT                                       */}
      {/* ======================================================================== */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 items-start">
          
          {/* -------------------------------------------------------------------- */}
          {/* COLUMN 1: VIDYACONNECT BRANDING & HIGHER EDUCATION PORTAL CTA        */}
          {/* -------------------------------------------------------------------- */}
          <div className="space-y-4 lg:border-r lg:border-white/10 lg:pr-6 xl:lg:pr-8">
            <div className="flex items-center gap-2">
              <BrandLogo variant="reverse" size={200} />
            </div>

            <p className="text-xs sm:text-[12.5px] text-[#C5D9F8] leading-relaxed max-w-[290px]">
              Centralized digital platform bridging Government Colleges, Students, and Industries for transparent, auditable, and performance-evaluated internships.
            </p>
          </div>

          {/* -------------------------------------------------------------------- */}
          {/* COLUMN 2: PLATFORM PORTALS                                           */}
          {/* -------------------------------------------------------------------- */}
          <div className="space-y-3 lg:border-r lg:border-white/10 lg:pr-6 xl:lg:pr-8">
            {/* Header with Orange Icon & Underline */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#FF7900] flex items-center justify-center text-white shadow-sm shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-[13px] font-extrabold uppercase tracking-wider text-white">
                  PLATFORM PORTALS
                </h4>
                <div className="w-10 h-0.5 bg-[#FF7900] mt-1" />
              </div>
            </div>

            {/* Navigation Links with Arrow Icons */}
            <ul className="space-y-2 text-xs text-[#C5D9F8]">
              <li>
                <Link
                  to="/partners"
                  className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all group py-0.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#FF7900] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  <span>Verified Industry Partners</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/for-institutions"
                  className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all group py-0.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#FF7900] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  <span>For Degree & Polytechnic Colleges</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/for-companies"
                  className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all group py-0.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#FF7900] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  <span>For Corporate & MSME Partners</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/for-students"
                  className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all group py-0.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#FF7900] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  <span>Student Guidelines & SOP</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/opportunities"
                  className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all group py-0.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#FF7900] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  <span>Explore Industry Opportunities</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* -------------------------------------------------------------------- */}
          {/* COLUMN 3: GOVERNANCE & POLICIES                                      */}
          {/* -------------------------------------------------------------------- */}
          <div className="space-y-3 lg:border-r lg:border-white/10 lg:pr-6 xl:lg:pr-8">
            {/* Header with Orange Shield Icon & Underline */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#FF7900] flex items-center justify-center text-white shadow-sm shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-[13px] font-extrabold uppercase tracking-wider text-white">
                  GOVERNANCE & POLICIES
                </h4>
                <div className="w-10 h-0.5 bg-[#FF7900] mt-1" />
              </div>
            </div>

            {/* Navigation Links with Arrow Icons */}
            <ul className="space-y-2 text-xs text-[#C5D9F8]">
              <li>
                <Link
                  to="/about"
                  className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all group py-0.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#FF7900] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  <span>About AP VidyaConnect</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/how-it-works"
                  className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all group py-0.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#FF7900] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  <span>State Workflow Architecture</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/faqs"
                  className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all group py-0.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#FF7900] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  <span>Frequently Asked Questions</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all group py-0.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#FF7900] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  <span>Terms & Conditions</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all group py-0.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#FF7900] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* -------------------------------------------------------------------- */}
          {/* COLUMN 4: CONTACT & HELPDESK                                         */}
          {/* -------------------------------------------------------------------- */}
          <div className="space-y-3">
            {/* Header with Orange Headset Icon & Underline */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#FF7900] flex items-center justify-center text-white shadow-sm shrink-0">
                <Headset className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-[13px] font-extrabold uppercase tracking-wider text-white">
                  CONTACT & HELPDESK
                </h4>
                <div className="w-10 h-0.5 bg-[#FF7900] mt-1" />
              </div>
            </div>

            {/* PixelWind Contact Details */}
            <div className="space-y-2.5 text-xs text-[#C5D9F8]">
              <p className="font-extrabold text-white text-sm tracking-tight">
                PixelWind Technologies
              </p>

              <p className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-[#FF7900] shrink-0" />
                <a
                  href="https://www.pixelwindtechnologies.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors underline decoration-[#FF7900]/60 underline-offset-2"
                >
                  www.pixelwindtechnologies.com
                </a>
              </p>

              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#FF7900] shrink-0" />
                <a
                  href="mailto:pixelwindtechnologies@gmail.com"
                  className="hover:text-white transition-colors"
                >
                  pixelwindtechnologies@gmail.com
                </a>
              </p>

              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#FF7900] shrink-0" />
                <a
                  href="tel:+919398929970"
                  className="hover:text-white transition-colors font-medium"
                >
                  +91 93989 29970
                </a>
              </p>

              <p className="flex items-center gap-2.5 text-[#A5C2F2]">
                <MapPin className="w-4 h-4 text-[#FF7900] shrink-0" />
                <span>Andhra Pradesh, India</span>
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================================== */}
        {/* 3. BOTTOM FOOTER BAR (DEVELOPED BY & TRANSPARENT ACTION PILLS)           */}
        {/* ======================================================================== */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-[#C5D9F8] gap-4 relative z-10">
          
          {/* Copyright & Developed By */}
          <div className="flex items-center gap-1.5 text-xs text-[#C5D9F8]">
            <span>© {new Date().getFullYear()} Developed by</span>
            <a
              href="https://www.pixelwindtechnologies.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-white hover:text-[#FF7900] underline decoration-[#FF7900] underline-offset-4 transition-colors"
            >
              PixelWind Technologies
            </a>
          </div>

          {/* Transparent Action Pill Buttons matching reference design */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs font-semibold">
            {/* Website Pill */}
            <a
              href="https://www.pixelwindtechnologies.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 text-xs text-white transition-all shadow-2xs group cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#FF7900]" />
              <span>website</span>
              <ExternalLink className="w-3 h-3 text-white/60 group-hover:text-white transition-colors" />
            </a>

            {/* LinkedIn Pill */}
            <a
              href="https://www.linkedin.com/company/pixelwind-technologies/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 text-xs text-white transition-all shadow-2xs group cursor-pointer"
            >
              <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
              <span>linkedin</span>
              <ExternalLink className="w-3 h-3 text-white/60 group-hover:text-white transition-colors" />
            </a>

            {/* Email Pill */}
            <a
              href="mailto:pixelwindtechnologies@gmail.com"
              className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 text-[11px] sm:text-xs text-white transition-all shadow-2xs group cursor-pointer max-w-full truncate"
            >
              <Mail className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
              <span className="truncate">pixelwindtechnologies@gmail.com</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
