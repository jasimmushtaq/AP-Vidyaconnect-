// ============================================================================
// AP VIDYACONNECT — STUDENT GUIDELINES & SOP (FULL DETAILED GUIDE)
// ============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  Award,
  CheckCircle2,
  ArrowRight,
  Clock,
  FileCheck2,
  Lock,
  AlertTriangle,
  QrCode,
  BookOpen,
  Briefcase,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const ForStudentsPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
      {/* 1. HERO SECTION */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#EAF6EE] text-[#1C8A3C] border border-[#1C8A3C]/20 px-4 py-1.5 rounded-full text-xs font-bold">
          <GraduationCap className="w-4 h-4 text-[#1C8A3C]" />
          <span>Official Student Internship Standard Operating Procedure (SOP)</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0E2350] tracking-tight leading-tight">
          Your Gateway to High-Impact Industry Internships
        </h1>

        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          AP VidyaConnect empowers students from Government Degree, Engineering, and Polytechnic colleges across Andhra Pradesh with structured corporate internships, direct mentorship from industry leaders, and cryptographically verified digital credentials for academic credits and career growth.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/dashboard"
            className="px-6 py-3.5 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <GraduationCap className="w-4 h-4 text-[#F07421]" />
            Access Student Portal
          </Link>
          <Link
            to="/opportunities"
            className="px-6 py-3.5 bg-white border border-[#E3E6EB] hover:bg-gray-50 text-[#0E2350] rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2"
          >
            Explore Opportunities
            <ArrowRight className="w-4 h-4 text-[#2A4E96]" />
          </Link>
        </div>
      </section>

      {/* 2. THE 6-STEP STUDENT LIFECYCLE */}
      <section className="bg-white rounded-2xl border border-[#E3E6EB] p-8 shadow-sm space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1C8A3C]">
            MANDATORY PROTOCOL & SOP
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0E2350]">
            The 6-Stage Student Internship Journey
          </h2>
          <p className="text-xs text-gray-500">
            Follow this step-by-step lifecycle to successfully complete your internship and earn verifiable academic credits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-[#EEF2FA] border border-[#2A4E96]/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg bg-[#0E2350] text-white font-bold text-xs flex items-center justify-center">1</span>
              <span className="text-[11px] font-bold text-[#2A4E96] uppercase">College Level</span>
            </div>
            <h3 className="text-sm font-bold text-[#0E2350]">Institutional Nomination</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Your college Training & Placement Officer (TPO) maps your profile into a formal proposal sent to a verified partner enterprise based on your branch and CGPA.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFF3EA] border border-[#F07421]/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg bg-[#F07421] text-white font-bold text-xs flex items-center justify-center">2</span>
              <span className="text-[11px] font-bold text-[#F07421] uppercase">Mandatory</span>
            </div>
            <h3 className="text-sm font-bold text-[#0E2350]">Digital "JOIN" Consent</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Upon batch creation, log in to your portal and execute the mandatory digital onboarding consent to activate your attendance tracking and task workspace.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#EAF6EE] border border-[#1C8A3C]/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg bg-[#1C8A3C] text-white font-bold text-xs flex items-center justify-center">3</span>
              <span className="text-[11px] font-bold text-[#1C8A3C] uppercase">Daily Routine</span>
            </div>
            <h3 className="text-sm font-bold text-[#0E2350]">Daily Attendance (80% Req.)</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Maintain regular attendance marked daily by your assigned Company Supervisor. A minimum of 80% attendance is mandatory for credit eligibility.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#EEF2FA] border border-[#2A4E96]/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg bg-[#0E2350] text-white font-bold text-xs flex items-center justify-center">4</span>
              <span className="text-[11px] font-bold text-[#2A4E96] uppercase">Milestones</span>
            </div>
            <h3 className="text-sm font-bold text-[#0E2350]">Task & Deliverable Submissions</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Work on assigned milestone tasks, submit your GitHub repositories, documentation links, and project reports directly through the Tasks portal.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFF3EA] border border-[#F07421]/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg bg-[#F07421] text-white font-bold text-xs flex items-center justify-center">5</span>
              <span className="text-[11px] font-bold text-[#F07421] uppercase">Assessment</span>
            </div>
            <h3 className="text-sm font-bold text-[#0E2350]">Supervisor Evaluation & Feedback</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Receive structured grading across technical execution, problem solving, communication, and punctuality from your Company Supervisor and Faculty Coordinator.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#EAF6EE] border border-[#1C8A3C]/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg bg-[#1C8A3C] text-white font-bold text-xs flex items-center justify-center">6</span>
              <span className="text-[11px] font-bold text-[#1C8A3C] uppercase">Transcript</span>
            </div>
            <h3 className="text-sm font-bold text-[#0E2350]">Academic Credit Transcripts</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Upon successful cohort completion and supervisor grading, verified academic credit transcripts are synced directly to your college records for degree credits.
            </p>
          </div>
        </div>
      </section>

      {/* 3. CODE OF CONDUCT & RULES */}
      <section className="bg-white rounded-2xl border border-[#E3E6EB] p-8 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-[#0E2350] border-b border-gray-100 pb-3 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#1C8A3C]" />
          Student Code of Conduct & Academic Integrity
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-600 leading-relaxed">
          <div className="space-y-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Professional Expectations
            </h4>
            <ul className="list-disc pl-4 space-y-1.5">
              <li>Adhere strictly to company working hours and designated reporting channels.</li>
              <li>Maintain utmost confidentiality regarding proprietary enterprise data, APIs, and client records.</li>
              <li>Communicate proactively with your Company Supervisor and Department Faculty Coordinator.</li>
              <li>Submit all original work—plagiarism in project deliverables leads to immediate disqualification.</li>
            </ul>
          </div>

          <div className="space-y-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5 text-amber-700">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Attendance & Leave Regulations
            </h4>
            <ul className="list-disc pl-4 space-y-1.5">
              <li>Mandatory minimum <strong>80% attendance</strong> is enforced for academic credit transfer.</li>
              <li>Prior approval from the company supervisor is mandatory for any planned leave.</li>
              <li>Unexplained absence exceeding 3 consecutive days may result in cohort termination.</li>
              <li>Discrepancies in attendance must be reported to the college TPO within 48 hours.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. ACADEMIC CREDIT PORTABILITY */}
      <section className="bg-gradient-to-r from-[#FFF3EA] via-white to-[#EEF2FA] rounded-2xl border border-[#E3E6EB] p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F07421]">
            NEP 2020 CREDIT TRANSFERS
          </span>
          <h3 className="text-xl font-bold text-[#0E2350]">
            State & University Recognized Academic Credits
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            All internship evaluations and attendance records generated on AP VidyaConnect conform to UGC and APSCHE mandates for seamless Academic Bank of Credits (ABC) integration.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="px-6 py-3.5 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-xl text-xs font-bold shadow transition-all flex items-center gap-2 shrink-0"
        >
          <GraduationCap className="w-4 h-4 text-[#F07421]" />
          Access Student Portal
        </Link>
      </section>
    </div>
  );
};
