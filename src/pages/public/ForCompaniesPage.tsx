// ============================================================================
// AP VIDYACONNECT — FOR CORPORATE & MSME PARTNERS (FULL DETAILED GUIDE)
// ============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Award,
  Users,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  FileText,
  Briefcase,
  Layers,
  Sparkles,
  Check,
  Globe,
  Mail,
  Phone
} from 'lucide-react';

export const ForCompaniesPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
      {/* 1. HERO SECTION */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#FFF3EA] text-[#0E2350] border border-[#F07421]/20 px-4 py-1.5 rounded-full text-xs font-bold">
          <Building2 className="w-4 h-4 text-[#F07421]" />
          <span>Industry Partnership & Talent Incubation Network</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0E2350] tracking-tight leading-tight">
          Verified Higher Education Talent Pipelines for Industry
        </h1>

        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          Access thousands of pre-vetted students from Government Degree, Engineering, and Polytechnic colleges across Andhra Pradesh. AP VidyaConnect provides end-to-end tooling for proposal reviews, dedicated mentorship, daily digital attendance, and verifiable skill credentialing.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/register?type=company"
            className="px-6 py-3.5 bg-[#F07421] hover:bg-[#D96214] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Building2 className="w-4 h-4 text-white" />
            Register Corporate Partner
          </Link>
          <Link
            to="/opportunities"
            className="px-6 py-3.5 bg-white border border-[#E3E6EB] hover:bg-gray-50 text-[#0E2350] rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2"
          >
            Browse Active Opportunities
            <ArrowRight className="w-4 h-4 text-[#2A4E96]" />
          </Link>
        </div>
      </section>

      {/* 2. VALUE PROPOSITION MATRIX */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-[#E3E6EB] shadow-sm space-y-3 hover:border-[#F07421] transition-all">
          <div className="w-10 h-10 rounded-xl bg-[#FFF3EA] text-[#F07421] flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#F07421]" />
          </div>
          <h3 className="text-base font-bold text-[#0E2350]">Inbound Proposals</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Receive structured batch proposals authored by college TPOs with full academic transcripts, CGPA, and prerequisite skills.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E3E6EB] shadow-sm space-y-3 hover:border-[#2A4E96] transition-all">
          <div className="w-10 h-10 rounded-xl bg-[#EEF2FA] text-[#0E2350] flex items-center justify-center">
            <Users className="w-5 h-5 text-[#2A4E96]" />
          </div>
          <h3 className="text-base font-bold text-[#0E2350]">Cohort Task Pipelines</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Empower your team leads to manage intern cohorts directly, assign deliverables, inspect GitHub repositories, and log attendance.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E3E6EB] shadow-sm space-y-3 hover:border-[#1C8A3C] transition-all">
          <div className="w-10 h-10 rounded-xl bg-[#EAF6EE] text-[#1C8A3C] flex items-center justify-center">
            <Award className="w-5 h-5 text-[#1C8A3C]" />
          </div>
          <h3 className="text-base font-bold text-[#0E2350]">Pre-Placement Pipeline</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Evaluate interns on real-world projects before full-time hiring—reducing recruitment friction, onboarding cost, and time-to-productivity.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E3E6EB] shadow-sm space-y-3 hover:border-[#0E2350] transition-all">
          <div className="w-10 h-10 rounded-xl bg-[#EEF2FA] text-[#0E2350] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-[#0E2350]" />
          </div>
          <h3 className="text-base font-bold text-[#0E2350]">Government Recognized</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Gain official recognition as a State Industry Partner, contributing to CSR skilling targets and academic-industry alignment.
          </p>
        </div>
      </section>

      {/* 3. 5-STEP CORPORATE LIFECYCLE */}
      <section className="bg-white rounded-2xl border border-[#E3E6EB] p-8 shadow-sm space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F07421]">
            ENTERPRISE ENGAGEMENT PIPELINE
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0E2350]">
            How Companies Operate on AP VidyaConnect
          </h2>
          <p className="text-xs text-gray-500">
            A frictionless, zero-paperwork platform built for modern engineering and business teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              step: '01',
              title: 'CIN / GST Verification & Registration',
              desc: 'Submit your Corporate Identity Number (CIN), GSTIN, official domain email, and designated Talent Director details for instant state authentication.'
            },
            {
              step: '02',
              title: 'Publish Internship Postings',
              desc: 'Create public postings specifying required technical stacks, seat counts, stipend per month, duration, and workplace mode (onsite, remote, or hybrid).'
            },
            {
              step: '03',
              title: 'Review Inbound College Proposals',
              desc: 'Review structured proposals sent by verified colleges. Accept as-is, propose counter-terms (stipend/seats), or request candidate roster adjustments.'
            },
            {
              step: '04',
              title: 'Assign Technical Supervisors & Track Attendance',
              desc: 'Assign company technical supervisors to mark daily attendance, create milestone tasks, and provide continuous feedback.'
            },
            {
              step: '05',
              title: 'Rubric Evaluation & Skill Appraisal',
              desc: 'Conduct final weighted evaluations across technical skills, punctuality, and problem-solving to finalize academic credit reports.'
            },
            {
              step: '06',
              title: 'Direct PPO / FTE Job Offers',
              desc: 'Issue Pre-Placement Offers (PPOs) or Full-Time Employment opportunities directly to top performers with full performance audit records.'
            }
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-xl border border-gray-100 bg-[#F6F7F9]/70 flex items-start gap-4 hover:border-[#F07421]/40 transition-all">
              <span className="text-xl font-black text-[#F07421] shrink-0 font-mono">{item.step}</span>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#0E2350]">{item.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. KEY SECTORS IN DEMAND */}
      <section className="bg-white rounded-2xl border border-[#E3E6EB] p-8 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-[#0E2350] border-b border-gray-100 pb-3">
          Key Industry Domains Currently Active
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center text-xs">
          {[
            'Cloud & DevOps',
            'AI / ML & Data',
            'Full Stack Web',
            'VLSI & Embedded',
            'Cybersecurity',
            'FinTech & Banking',
            'Biopharma & Health',
            'Green Energy & EV',
            'Industrial Robotics',
            'Civil Infrastructure',
            'AgriTech & Supply',
            'Digital Marketing'
          ].map((domain, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-[#F6F7F9] border border-gray-200 font-semibold text-gray-800">
              {domain}
            </div>
          ))}
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="bg-[#0E2350] text-white p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 max-w-xl">
          <h3 className="text-xl font-bold">Register Your Enterprise on AP VidyaConnect</h3>
          <p className="text-xs text-[#DCE5F5] leading-relaxed">
            Join 1,240+ verified corporate partners building future-ready talent pipelines with Andhra Pradesh's top academic institutions.
          </p>
        </div>

        <Link
          to="/register?type=company"
          className="px-6 py-3.5 bg-[#F07421] hover:bg-[#D96214] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow shrink-0"
        >
          Register Company <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
};
