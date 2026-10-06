// ============================================================================
// AP VIDYACONNECT — ABOUT US PAGE
// Comprehensive Institutional & Industry Overview
// ============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../../components/common/BrandLogo';
import {
  ShieldCheck,
  School,
  Building2,
  GraduationCap,
  Award,
  CheckCircle2,
  Users,
  Target,
  Sparkles,
  ArrowRight,
  Globe,
  FileCheck2,
  Lock,
  Cpu,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

export const AboutUsPage: React.FC = () => {
  return (
    <div className="space-y-16 py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. HERO SECTION */}
      <section className="text-center space-y-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#FFF3EA] border border-[#F07421]/30 text-[#0E2350] px-4 py-1.5 rounded-full text-xs font-bold">
          <Sparkles className="w-4 h-4 text-[#F07421]" />
          <span>Transforming State Higher Education & Industry Readiness</span>
        </div>

        <div className="flex justify-center my-2">
          <BrandLogo variant="stacked" size={240} />
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0E2350] tracking-tight leading-tight">
          Bridging Academic Knowledge with Industry Excellence
        </h1>

        <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
          <strong>AP VidyaConnect</strong> is the flagship centralized digital platform engineered for the Government of Andhra Pradesh. It unifies Government Colleges, Polytechnic Institutes, Corporate Industry Partners, and Students into a secure, auditable, and performance-evaluated internship ecosystem aligned with the National Education Policy (NEP 2020).
        </p>
      </section>

      {/* 2. MISSION & VISION */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-[#0E2350] to-[#14336F] text-white p-8 rounded-2xl shadow-md space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8 pointer-events-none" />
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#F07421]">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">Our Vision</h2>
          <p className="text-sm text-[#DCE5F5] leading-relaxed">
            To build a transparent, frictionless statewide bridge between higher education institutions and leading corporate enterprises—empowering every student in Andhra Pradesh with verifiable real-world skills, corporate mentorship, and recognized digital credentials.
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#102A60] to-[#0E2350] text-white p-8 rounded-2xl shadow-md space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F07421]/10 rounded-full -translate-y-8 translate-x-8 pointer-events-none" />
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#1C8A3C]">
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold">Our Mission</h2>
          <p className="text-sm text-[#DCE5F5] leading-relaxed">
            To digitize the entire internship lifecycle—from institutional proposal submission, seat allocation, and daily biometric/digital attendance, to milestone reviews and verified skill appraisals that integrate directly into academic credit banks.
          </p>
        </div>
      </section>

      {/* 3. FOUR PILLARS OF AP VIDYACONNECT */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0E2350]">
            The 4-Pillar Collaborative Framework
          </h2>
          <p className="text-sm text-gray-600">
            A cohesive architecture connecting all key actors in technical and vocational education.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E3E6EB] shadow-sm hover:border-[#2A4E96] transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FA] text-[#0E2350] flex items-center justify-center">
              <School className="w-5 h-5 text-[#2A4E96]" />
            </div>
            <h3 className="text-base font-bold text-[#0E2350]">Higher Education Institutes</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              AISHE-verified government degree, engineering, and polytechnic colleges author formal batch proposals and map cohorts to corporate partners.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E3E6EB] shadow-sm hover:border-[#F07421] transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF3EA] text-[#F07421] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#F07421]" />
            </div>
            <h3 className="text-base font-bold text-[#0E2350]">Corporate Partners</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              CIN & GST-verified enterprises and MSMEs post verified opportunities, review college proposals, assign technical leads, and evaluate deliverables.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E3E6EB] shadow-sm hover:border-[#1C8A3C] transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF6EE] text-[#1C8A3C] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-[#1C8A3C]" />
            </div>
            <h3 className="text-base font-bold text-[#0E2350]">Students & Interns</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Enrolled students join verified internship cohorts with digital consent, mark daily attendance, submit project deliverables, and receive structured company feedback.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E3E6EB] shadow-sm hover:border-[#0E2350] transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FA] text-[#0E2350] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#0E2350]" />
            </div>
            <h3 className="text-base font-bold text-[#0E2350]">State Quality Directorate</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              State nodal administrators oversee real-time entity verifications, statewide internship audits, stipend compliance, and credit allocations.
            </p>
          </div>
        </div>
      </section>

      {/* 4. KEY PLATFORM ADVANTAGES */}
      <section className="bg-white rounded-2xl border border-[#E3E6EB] p-8 shadow-sm space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0E2350] border-b border-gray-100 pb-3">
          Key Technological Innovations & Standards
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#0E2350] font-bold text-sm">
              <Lock className="w-4 h-4 text-[#F07421]" />
              Cryptographic State Machine
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Bilateral proposal transitions and batch agreements are sealed with cryptographic state validation to eliminate data tampering.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#0E2350] font-bold text-sm">
              <FileCheck2 className="w-4 h-4 text-[#1C8A3C]" />
              Immutable Audit Logging
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Every state transition—proposal creation, corporate review, supervisor assignment, and evaluation—is logged in tamper-evident audit trails.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#0E2350] font-bold text-sm">
              <Cpu className="w-4 h-4 text-[#2A4E96]" />
              High Performance & Reliability
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Engineered with sub-second response times, cross-tab state synchronization, and scalable relational architecture designed for 100,000+ simultaneous users.
            </p>
          </div>
        </div>
      </section>

      {/* 5. DEVELOPED BY PIXELWIND TECHNOLOGIES */}
      <section className="bg-gradient-to-r from-[#FFF3EA] via-white to-[#EEF2FA] rounded-2xl border border-[#E3E6EB] p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F07421]">
            ENGINEERING & TECHNOLOGY PARTNER
          </span>
          <h3 className="text-2xl font-extrabold text-[#0E2350]">
            Developed by PixelWind Technologies
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            PixelWind Technologies designs, engineers, and maintains mission-critical cloud software, e-governance platforms, and digital credential ecosystems. AP VidyaConnect is proudly designed and maintained by PixelWind Technologies.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-700 pt-2">
            <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-[#F07421]" /> www.pixelwindtechnologies.com</span>
            <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-[#F07421]" /> pixelwindtechnologies@gmail.com</span>
            <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-[#F07421]" /> +91 93989 29970</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#F07421]" /> Andhra Pradesh, India</span>
          </div>
        </div>

        <a
          href="https://www.pixelwindtechnologies.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3.5 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 shrink-0"
        >
          Visit PixelWind Technologies
          <ArrowRight className="w-4 h-4 text-[#F07421]" />
        </a>
      </section>
    </div>
  );
};
