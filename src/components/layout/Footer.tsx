// ============================================================================
// AP VIDYACONNECT — FOOTER COMPONENT
// Visible on website; automatically hidden in native Android / Capacitor APK
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { BrandLogo } from '../common/BrandLogo';
import { Link } from 'react-router-dom';
import { ShieldCheck, Phone, Mail, MapPin, ExternalLink, Globe, Linkedin } from 'lucide-react';

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
    <footer className="bg-[#0E2350] text-white border-t-4 border-[#F07421]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-4 md:col-span-1">
            <BrandLogo variant="reverse" size={200} />
            <p className="text-xs text-[#DCE5F5] leading-relaxed">
              Centralized digital platform bridging Government Colleges, Students, and Industries for transparent, auditable, and performance-evaluated internships.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#1C8A3C] font-semibold bg-[#102A60] px-3 py-1.5 rounded w-fit border border-[#14336F]">
              <ShieldCheck className="w-4 h-4 text-[#1C8A3C]" />
              Official Higher Education Portal
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F07421]">
              Platform Portals
            </h4>
            <ul className="space-y-2 text-xs text-[#DCE5F5]">
              <li><Link to="/partners" className="hover:text-white transition-colors font-medium">Verified Industry Partners</Link></li>
              <li><Link to="/for-institutions" className="hover:text-white transition-colors">For Degree & Polytechnic Colleges</Link></li>
              <li><Link to="/for-companies" className="hover:text-white transition-colors">For Corporate & MSME Partners</Link></li>
              <li><Link to="/for-students" className="hover:text-white transition-colors">Student Guidelines & SOP</Link></li>
              <li><Link to="/opportunities" className="hover:text-white transition-colors">Explore Industry Opportunities</Link></li>
            </ul>
          </div>

          {/* Col 3: Policy & Integrity */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F07421]">
              Governance & Policies
            </h4>
            <ul className="space-y-2 text-xs text-[#DCE5F5]">
              <li><Link to="/about" className="hover:text-white transition-colors font-medium">About AP VidyaConnect</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">State Workflow Architecture</Link></li>
              <li><Link to="/faqs" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact & Helpdesk */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F07421]">
              Contact & Helpdesk
            </h4>
            <div className="space-y-2.5 text-xs text-[#DCE5F5]">
              <p className="font-bold text-white flex items-center gap-1.5">
                PixelWind Technologies
              </p>
              <p className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#F07421]" />
                <a
                  href="https://www.pixelwindtechnologies.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors underline decoration-[#F07421]/60"
                >
                  www.pixelwindtechnologies.com
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#F07421]" />
                <a
                  href="mailto:pixelwindtechnologies@gmail.com"
                  className="hover:text-white transition-colors"
                >
                  pixelwindtechnologies@gmail.com
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#F07421]" />
                <a
                  href="tel:+919398929970"
                  className="hover:text-white transition-colors font-medium"
                >
                  +91 93989 29970
                </a>
              </p>
              <p className="flex items-start gap-2 text-gray-300">
                <MapPin className="w-4 h-4 text-[#F07421] shrink-0 mt-0.5" />
                <span>Andhra Pradesh, India</span>
              </p>
            </div>
          </div>
        </div>

        {/* Developed by PixelWind Technologies Bar */}
        <div className="mt-10 pt-6 border-t border-[#14336F] flex flex-col lg:flex-row items-center justify-between text-xs text-[#DCE5F5]/80 gap-6">
          <div className="flex items-center gap-1.5 text-xs text-[#DCE5F5]">
            <span>© {new Date().getFullYear()} Developed by</span>
            <a
              href="https://www.pixelwindtechnologies.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-white hover:text-[#F07421] transition-colors underline decoration-[#F07421]/60 underline-offset-4"
            >
              PixelWind Technologies
            </a>
          </div>

          {/* Social & Contact Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-[#DCE5F5]">
            <a
              href="https://www.pixelwindtechnologies.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors bg-[#102A60]/70 hover:bg-[#102A60] px-3 py-1.5 rounded-lg border border-[#14336F]"
            >
              <Globe className="w-3.5 h-3.5 text-[#F07421]" />
              <span>website</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            <a
              href="https://www.linkedin.com/company/pixelwind-technologies/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors bg-[#102A60]/70 hover:bg-[#102A60] px-3 py-1.5 rounded-lg border border-[#14336F]"
            >
              <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
              <span>linkedin</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            <a
              href="mailto:pixelwindtechnologies@gmail.com"
              className="flex items-center gap-1.5 hover:text-white transition-colors bg-[#102A60]/70 hover:bg-[#102A60] px-3 py-1.5 rounded-lg border border-[#14336F]"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>pixelwindtechnologies@gmail.com</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
