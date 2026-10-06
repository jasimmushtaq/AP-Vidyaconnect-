// ============================================================================
// AP VIDYACONNECT — CONTACT & STATE NODAL DESK
// Official Support Desk, District Coordination, and Direct Helplines
// ============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Building2,
  School,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  Globe,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Headphones,
  Compass,
  FileCheck2,
  Users
} from 'lucide-react';

export const ContactUsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF3EA] text-[#0E2350] border border-[#F07421]/20 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#F07421]" />
            <span>Government of Andhra Pradesh • Higher Education Nodal Desk</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0E2350] tracking-tight">
            Connect with VidyaConnect Support
          </h1>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Direct assistance for accredited engineering colleges, corporate industry partners, and enrolled student interns across all 26 districts of Andhra Pradesh.
          </p>
        </div>

        {/* 3 Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: PixelWind Technologies Headquarters */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-[#0E2350] text-[#F07421] flex items-center justify-center shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0E2350]">PixelWind Technologies</h3>
              <p className="text-xs text-gray-500 mt-0.5">Corporate & Development Headquarters</p>
            </div>
            <div className="space-y-2.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#F07421] shrink-0 mt-0.5" />
                <span>Andhra Pradesh, India</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#F07421] shrink-0" />
                <a href="tel:+919398929970" className="font-semibold text-gray-800 hover:text-[#0E2350]">
                  +91 93989 29970
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#F07421] shrink-0" />
                <a href="mailto:pixelwindtechnologies@gmail.com" className="text-[#2A4E96] font-semibold hover:underline">
                  pixelwindtechnologies@gmail.com
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#F07421] shrink-0" />
                <a
                  href="https://www.pixelwindtechnologies.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2A4E96] font-semibold hover:underline flex items-center gap-1"
                >
                  <span>www.pixelwindtechnologies.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>

          {/* Card 2: Technology & Platform Operations */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F07421] to-[#FF7A00] text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0E2350]">Technical & Operations Helpdesk</h3>
              <p className="text-xs text-gray-500 mt-0.5">PixelWind Engineering Support</p>
            </div>
            <div className="space-y-2.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#F07421] shrink-0 mt-0.5" />
                <span>Andhra Pradesh, India</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#F07421] shrink-0" />
                <a href="tel:+919398929970" className="font-semibold text-gray-800 hover:text-[#0E2350]">
                  +91 93989 29970
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#F07421] shrink-0" />
                <a href="mailto:pixelwindtechnologies@gmail.com" className="text-[#2A4E96] font-semibold hover:underline">
                  pixelwindtechnologies@gmail.com
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#F07421] shrink-0" />
                <a
                  href="https://www.pixelwindtechnologies.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2A4E96] font-semibold hover:underline flex items-center gap-1"
                >
                  <span>www.pixelwindtechnologies.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>

          {/* Card 3: Operating Hours & Direct Support */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0E2350]">Operating Schedule</h3>
              <p className="text-xs text-gray-500 mt-0.5">Support & Assistance Window</p>
            </div>
            <div className="space-y-2.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Monday – Saturday:</strong> 09:30 AM – 06:30 PM IST</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Average Response Time: <strong>Within 2 Hours</strong></span>
              </p>
              <p className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                <a
                  href="https://www.pixelwindtechnologies.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2A4E96] font-semibold hover:underline flex items-center gap-1"
                >
                  <span>www.pixelwindtechnologies.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Support Knowledge & Assistance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Item 1 */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-3 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0E2350] flex items-center justify-center">
              <School className="w-5 h-5 text-[#2A4E96]" />
            </div>
            <h3 className="text-base font-bold text-[#0E2350]">Institutional & Company Verification</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              State Super Admin verifies official AISHE accreditation, NAAC certificates, and MCA Corporate Identification Numbers (CIN) within 24–48 business hours.
            </p>
            <div className="pt-2">
              <Link
                to="/institutions"
                className="text-xs font-bold text-[#0E2350] hover:text-[#F07421] inline-flex items-center gap-1 transition-colors"
              >
                <span>View Colleges Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Item 2 */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-3 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-base font-bold text-[#0E2350]">Geofence & Attendance Telemetry</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Company Administrators manage facility GPS coordinates and check-in perimeters (100m–250m). Students check in with selfie face verification.
            </p>
            <div className="pt-2">
              <Link
                to="/attendance"
                className="text-xs font-bold text-[#0E2350] hover:text-[#F07421] inline-flex items-center gap-1 transition-colors"
              >
                <span>View Attendance Register</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Item 3 */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-3 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-800 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-base font-bold text-[#0E2350]">Dual-Signature MoUs & State Registry</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Legally binding electronic agreements under Section 65B IT Act. Memorandums activate immediately upon bilateral digital execution by Principal and HR Director.
            </p>
            <div className="pt-2">
              <Link
                to="/mous"
                className="text-xs font-bold text-[#0E2350] hover:text-[#F07421] inline-flex items-center gap-1 transition-colors"
              >
                <span>Explore Active MoUs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Item 4 */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-3 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-base font-bold text-[#0E2350]">NEP 2020 Academic Credits</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Every 30–35 hours of verified industrial training unlocks 1 university credit point (4 to 12 credits). Credits synchronize directly to university records.
            </p>
            <div className="pt-2">
              <Link
                to="/how-it-works"
                className="text-xs font-bold text-[#0E2350] hover:text-[#F07421] inline-flex items-center gap-1 transition-colors"
              >
                <span>10-Stage State Machine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Item 5 */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-3 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-base font-bold text-[#0E2350]">Corporate Openings & Recruitment</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Corporate leaders post structured opportunities with defined stipend matrices, prerequisite skills, and degree requirements for statewide student pools.
            </p>
            <div className="pt-2">
              <Link
                to="/opportunities"
                className="text-xs font-bold text-[#0E2350] hover:text-[#F07421] inline-flex items-center gap-1 transition-colors"
              >
                <span>Browse Opportunities</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Item 6 */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-3 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center">
              <Headphones className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="text-base font-bold text-[#0E2350]">VidyaBot 3D AI Assistant</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Ask our built-in 3D AI assistant for instant answers on platform rules, credit calculators, geofence testing, and onboarding guides 24/7.
            </p>
            <div className="pt-2">
              <Link
                to="/faqs"
                className="text-xs font-bold text-[#0E2350] hover:text-[#F07421] inline-flex items-center gap-1 transition-colors"
              >
                <span>Frequently Asked Questions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* CTA Hero Card */}
        <div className="bg-gradient-to-br from-[#0A1938] via-[#0E2350] to-[#163673] rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-[#F07421]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 text-center md:text-left relative z-10">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Ready to Register Your College or Company?
            </h3>
            <p className="text-xs sm:text-sm text-blue-200 max-w-xl leading-relaxed">
              Join Andhra Pradesh’s official state-governed higher education ecosystem to empower students with verified industry training.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10">
            <Link
              to="/register"
              className="px-6 py-3 bg-[#F07421] hover:bg-[#D96214] text-white font-black rounded-xl text-xs transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <span>Register Partner Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/how-it-works"
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition-all border border-white/20 backdrop-blur-md"
            >
              How It Works
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

