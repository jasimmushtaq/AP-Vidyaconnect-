// ============================================================================
// AP VIDYACONNECT — FOR DEGREE & POLYTECHNIC COLLEGES (FULL DETAILED GUIDE)
// ============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { CanonicalWorkflowShowcase } from '../../components/common/CanonicalWorkflowShowcase';
import {
  School,
  CheckCircle2,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  FileText,
  Users,
  Award,
  BookOpen,
  Scale,
  Sparkles,
  Layers,
  ChevronRight,
  Phone,
  Mail,
  Building2,
  Check
} from 'lucide-react';

export const ForInstitutionsPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
      {/* 1. HERO SECTION */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#EEF2FA] text-[#0E2350] border border-[#2A4E96]/20 px-4 py-1.5 rounded-full text-xs font-bold">
          <School className="w-4 h-4 text-[#2A4E96]" />
          <span>Andhra Pradesh Higher & Technical Education Framework</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0E2350] tracking-tight leading-tight">
          Empowering Degree, Engineering & Polytechnic Colleges
        </h1>

        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          AP VidyaConnect provides a centralized, cryptographically secure digital corridor for Principals, Training & Placement Officers (TPOs), and College Administrators to collaborate with verified industries, manage student cohorts, audit daily attendance, and ensure 100% auditable academic internship compliance.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/register?type=institution"
            className="px-6 py-3.5 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <School className="w-4 h-4 text-[#F07421]" />
            Register Your College Now
          </Link>
          <Link
            to="/opportunities"
            className="px-6 py-3.5 bg-white border border-[#E3E6EB] hover:bg-gray-50 text-[#0E2350] rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2"
          >
            Explore Corporate Openings
            <ArrowRight className="w-4 h-4 text-[#2A4E96]" />
          </Link>
        </div>
      </section>

      {/* CANONICAL WORKFLOW TIMELINE */}
      <section className="w-full">
        <CanonicalWorkflowShowcase />
      </section>

      {/* 2. CORE VALUE PILLARS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-[#E3E6EB] shadow-sm space-y-3 hover:border-[#2A4E96] transition-all">
          <div className="w-10 h-10 rounded-xl bg-[#EEF2FA] text-[#0E2350] flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5 text-[#2A4E96]" />
          </div>
          <h3 className="text-base font-bold text-[#0E2350]">Roster Ingestion</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Bulk-import hundreds of students via CSV/Excel with real-time AISHE validation, CGPA filtering, and department categorization.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E3E6EB] shadow-sm space-y-3 hover:border-[#F07421] transition-all">
          <div className="w-10 h-10 rounded-xl bg-[#FFF3EA] text-[#F07421] flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#F07421]" />
          </div>
          <h3 className="text-base font-bold text-[#0E2350]">Two-Sided Proposals</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Formulate multi-student proposals directly to verified companies with stipend, duration, and corporate terms.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E3E6EB] shadow-sm space-y-3 hover:border-[#1C8A3C] transition-all">
          <div className="w-10 h-10 rounded-xl bg-[#EAF6EE] text-[#1C8A3C] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-[#1C8A3C]" />
          </div>
          <h3 className="text-base font-bold text-[#0E2350]">Live Academic Oversight</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Faculty coordinators monitor daily attendance logs, corporate remarks, and milestone evaluations in real time.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E3E6EB] shadow-sm space-y-3 hover:border-[#0E2350] transition-all">
          <div className="w-10 h-10 rounded-xl bg-[#EEF2FA] text-[#0E2350] flex items-center justify-center">
            <Award className="w-5 h-5 text-[#0E2350]" />
          </div>
          <h3 className="text-base font-bold text-[#0E2350]">NAAC / NBA Credit Sync</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Automated generation of NEP 2020 credit transfer transcripts and auditable evaluation dossiers for academic records.
          </p>
        </div>
      </section>

      {/* 3. STEP-BY-STEP INSTITUTIONAL WORKFLOW */}
      <section className="bg-white rounded-2xl border border-[#E3E6EB] p-8 shadow-sm space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F07421]">
            STANDARDIZED CANONICAL WORKFLOW
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0E2350]">
            The 6-Stage Institutional Onboarding Lifecycle
          </h2>
          <p className="text-xs text-gray-500">
            A transparent digital pipeline replacing manual paperwork and MoUs with auditable state governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              step: '01',
              title: 'Institutional Registration & AISHE Verification',
              desc: 'The Principal or TPO registers the college using the AISHE/DTE institution code, official .ac.in / .gov.in email, and accreditation documentation. The State Directorate verifies the institution within 24 hours.'
            },
            {
              step: '02',
              title: 'Student Roster Ingestion & Cohort Setup',
              desc: 'Upload departmental student lists via CSV or single entries, verify CGPA benchmarks, and group cohorts for internship opportunities.'
            },
            {
              step: '03',
              title: 'Opportunity Discovery & Proposal Drafting',
              desc: 'Browse state-verified corporate postings or initiate custom internship proposals directly to partner enterprises specifying seat counts, duration, and learning objectives.'
            },
            {
              step: '04',
              title: 'Two-Way Negotiation & Final Acceptance',
              desc: 'Review counter-offers from corporate HR regarding stipends, workplace mode (onsite/remote), and technical leads before executing digital bilateral acceptance.'
            },
            {
              step: '05',
              title: 'Automated Batch Generation & Digital Consent',
              desc: 'Upon acceptance, an immutable Internship Batch is provisioned. Students receive automated notifications to execute digital consent and initiate training.'
            },
            {
              step: '06',
              title: 'Real-Time Transcripts & Academic Credit Sync',
              desc: 'Monitor weekly attendance and milestone evaluations. Upon batch conclusion, download tamper-proof academic completion transcripts for university credit transfer.'
            }
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-xl border border-gray-100 bg-[#F6F7F9]/70 flex items-start gap-4 hover:border-[#2A4E96]/40 transition-all">
              <span className="text-xl font-black text-[#F07421] shrink-0 font-mono">{item.step}</span>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#0E2350]">{item.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. ROLES & PERMISSIONS MATRIX */}
      <section className="bg-white rounded-2xl border border-[#E3E6EB] p-8 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-[#0E2350] border-b border-gray-100 pb-3">
          Institutional Governance & User Roles
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-600">
          <div className="p-4 rounded-xl bg-[#EEF2FA] space-y-2 border border-[#2A4E96]/20">
            <div className="flex items-center gap-2 font-bold text-[#0E2350] text-sm">
              <School className="w-4 h-4 text-[#2A4E96]" />
              College Admin & Institutional Leadership
            </div>
            <p>Full institutional governance, student roster ingestion, attendance audit compliance, official proposal submissions, and NEP 2020 credit transfer sign-off.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#FFF3EA] space-y-2 border border-[#F07421]/20">
            <div className="flex items-center gap-2 font-bold text-[#0E2350] text-sm">
              <Users className="w-4 h-4 text-[#F07421]" />
              Training & Placement Administration (TPO)
            </div>
            <p>Direct industry outreach, authoring partnership proposals, managing student cohort readiness, coordinating with corporate HR, and batch monitoring.</p>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION & HELPDESK */}
      <section className="bg-[#0E2350] text-white p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 max-w-xl">
          <h3 className="text-xl font-bold">Ready to Onboard Your College on AP VidyaConnect?</h3>
          <p className="text-xs text-[#DCE5F5] leading-relaxed">
            Join 840+ verified government and autonomous institutions across Andhra Pradesh. Instant registration with 24-hour state moderation.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/register?type=institution"
            className="px-6 py-3.5 bg-[#F07421] hover:bg-[#D96214] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow"
          >
            Register Institution <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
