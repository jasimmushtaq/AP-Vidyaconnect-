// ============================================================================
// AP VIDYACONNECT — HOME LANDING PAGE
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../../components/common/BrandLogo';
import { db } from '../../services/dbStore';
import { useAuth } from '../../context/AuthContext';
import { PartnerCard } from '../../components/common/PartnerCard';
import { InstitutionCard } from '../../components/common/InstitutionCard';
import { PromotionalBannerCarousel } from '../../components/common/PromotionalBannerCarousel';
import {
  Building2,
  School,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Users,
  Award,
  Clock,
  Sparkles,
  TrendingUp,
  FileText,
  MapPin,
  Settings,
  Plus
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [institutions, setInstitutions] = useState(db.institutions);
  const [companies, setCompanies] = useState(db.companies);
  const [students, setStudents] = useState(db.students);
  const [batches, setBatches] = useState(db.batches);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setInstitutions([...db.institutions]);
      setCompanies([...db.companies]);
      setStudents([...db.students]);
      setBatches([...db.batches]);
    });
    return unsub;
  }, []);

  const verifiedCompanies = companies.filter((c) => c.verification_status === 'verified');
  const verifiedInstitutions = institutions.filter((i) => i.verification_status === 'verified');
  const displayedCompanies = verifiedCompanies.slice(0, 12);
  const displayedInstitutions = verifiedInstitutions.slice(0, 6);

  const registeredCollegesCount = verifiedInstitutions.length;
  const verifiedCompaniesCount = verifiedCompanies.length;
  const activeInternsCount = students.length;
  const activeBatchesCount = batches.length;

  return (
    <div className="w-full pb-10">
      {/* 1. HERO SECTION (Curved Cornered Banner Card with minimal side gap) */}
      <div className="w-full px-2 sm:px-4 pt-2 sm:pt-3">
        <section className="w-full relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/80 h-[330px] sm:h-[345px] lg:h-[360px] flex items-center bg-[#EAF5F7]">
          
          {/* Full-width Panoramic Campus & Graduate Background Image */}
          <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <img
              src="/images/hero-graduate-sunset.jpg"
              alt="Graduate in Cap and Gown overlooking Campus"
              className="w-full h-full object-cover object-[center_25%] select-none"
            />
          </div>

          {/* Directional Soft Gradient Overlay for Text Readability on Left & Vivid Sunset on Right */}
          <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-r from-[#E6F4F3] via-[#FFFDF8]/95 sm:via-[#FFFDF8]/90 to-transparent to-[65%]" />

          {/* Soft mint/cyan curved wave shape at bottom-left */}
          <div className="absolute left-0 bottom-0 top-0 w-1/3 pointer-events-none z-0">
            <svg className="w-full h-full" viewBox="0 0 500 360" preserveAspectRatio="none">
              <path
                d="M0,230 C120,260 180,300 260,285 C340,270 400,320 480,360 L0,360 Z"
                fill="rgba(168, 226, 219, 0.45)"
              />
              <path
                d="M0,275 C100,295 160,330 240,320 C320,310 360,345 420,360 L0,360 Z"
                fill="rgba(142, 215, 206, 0.3)"
              />
            </svg>
          </div>

          {/* Better Skills Brighter Future Calligraphy Text in open sky (Top-Right) */}
          <div className="absolute top-4 right-5 sm:top-5 sm:right-8 lg:top-6 lg:right-14 text-right select-none z-20 pointer-events-none">
            <span
              className="block text-xl sm:text-2xl lg:text-[28px] font-bold text-[#0B2A5B] leading-none tracking-tight drop-shadow-sm -rotate-6"
              style={{ fontFamily: "'Caveat', cursive" }}
            >
              Better Skills
            </span>
            <span
              className="block text-xl sm:text-2xl lg:text-[28px] font-bold text-[#0B2A5B] leading-none tracking-tight drop-shadow-sm -rotate-6 mt-1"
              style={{ fontFamily: "'Caveat', cursive" }}
            >
              Brighter Future
            </span>
            {/* Soft decorative curved swoosh */}
            <svg className="w-24 sm:w-30 h-2.5 text-[#0B2A5B]/85 ml-auto mt-0.5 -rotate-6" viewBox="0 0 140 12" fill="none">
              <path d="M2 3C40 10 95 11 138 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Hero Left Content Container */}
          <div className="w-full px-4 sm:px-8 lg:px-12 py-4 relative z-10">
            <div className="w-full sm:w-[65%] lg:w-[56%] text-left space-y-2.5 sm:space-y-3">
              {/* Framework Pill Badge */}
              <div className="inline-flex items-center gap-1.5 bg-[#FFF9F3] border border-[#FF7A00]/50 text-[#0B2A5B] px-3 py-0.5 rounded-full text-[10.5px] sm:text-[11.5px] font-bold shadow-2xs">
                <span className="text-[#FF7A00] font-bold">✦</span>
                <span className="tracking-tight">National Internship Transformation Framework • Govt of India</span>
              </div>

              {/* Main Bold Heading */}
              <h1 className="text-3xl sm:text-4xl lg:text-[45px] font-black text-[#0B2A5B] tracking-tight leading-[1.07]">
                Connecting Education <br />
                with Industry
              </h1>

              {/* Supporting Description */}
              <p className="text-xs sm:text-[13.5px] text-[#334155] max-w-[580px] font-normal leading-relaxed">
                The centralized, two-sided institutional collaboration platform enabling formal proposal reviews, auditable batch creation, verified attendance, and government-recognized internship certifications.
              </p>

              {/* Two Primary Side-by-Side CTA Buttons */}
              <div className="pt-1 flex flex-wrap items-center gap-3">
                <Link
                  to="/register?type=institution"
                  className="w-full sm:w-[205px] h-[44px] rounded-[9px] bg-[#0B2A5B] hover:bg-[#14336F] text-white font-bold text-xs sm:text-[13px] shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-between px-4 group"
                >
                  <div className="flex items-center gap-2">
                    <School className="w-4 h-4 text-[#FF7A00]" />
                    <span>Register Institution</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  to="/register?type=company"
                  className="w-full sm:w-[205px] h-[44px] rounded-[9px] bg-[#FF7A00] hover:bg-[#E66E00] text-white font-bold text-xs sm:text-[13px] shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-between px-4 group"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-white" />
                    <span>Register Company</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 1.1 PROMOTIONAL ANNOUNCEMENT BANNER CAROUSEL (Curved Corners with minimal side gap) */}
      <div className="w-full px-2 sm:px-4 mt-2.5 sm:mt-3">
        <section className="w-full relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/80 block">
          <PromotionalBannerCarousel />
        </section>
      </div>

      {/* REST OF HOMEPAGE CONTENT SECTIONS */}
      <div className="space-y-10 sm:space-y-12 pt-6 sm:pt-8">
        {/* 2. PLATFORM METRICS */}
        <div className="w-full px-2 sm:px-4">
          <section className="w-full bg-[#0E2350] text-white py-10 sm:py-12 rounded-2xl sm:rounded-3xl shadow-sm border border-[#14336F] overflow-hidden">
            <div className="w-full px-4 sm:px-8 lg:px-12">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                <div className="p-4 bg-[#102A60] rounded-xl border border-[#14336F]">
                  <School className="w-8 h-8 text-[#F07421] mx-auto mb-2" />
                  <p className="text-3xl sm:text-4xl font-extrabold text-white">{registeredCollegesCount}+</p>
                  <p className="text-xs text-[#DCE5F5] font-semibold mt-1">Government Colleges Registered</p>
                </div>

                <div className="p-4 bg-[#102A60] rounded-xl border border-[#14336F]">
                  <Building2 className="w-8 h-8 text-[#1C8A3C] mx-auto mb-2" />
                  <p className="text-3xl sm:text-4xl font-extrabold text-white">{verifiedCompaniesCount}+</p>
                  <p className="text-xs text-[#DCE5F5] font-semibold mt-1">Verified Corporate Partners</p>
                </div>

                <div className="p-4 bg-[#102A60] rounded-xl border border-[#14336F]">
                  <Users className="w-8 h-8 text-[#FFE5D3] mx-auto mb-2" />
                  <p className="text-3xl sm:text-4xl font-extrabold text-white">{activeInternsCount.toLocaleString()}+</p>
                  <p className="text-xs text-[#DCE5F5] font-semibold mt-1">Students Digitally Placed</p>
                </div>

                <div className="p-4 bg-[#102A60] rounded-xl border border-[#14336F]">
                  <TrendingUp className="w-8 h-8 text-[#F07421] mx-auto mb-2" />
                  <p className="text-3xl sm:text-4xl font-extrabold text-white">{activeBatchesCount.toLocaleString()}+</p>
                  <p className="text-xs text-[#DCE5F5] font-semibold mt-1">Active Internship Cohorts</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* 2.1 OUR INDUSTRY PARTNERS (DATABASE DRIVEN) */}
        <div className="w-full px-2 sm:px-4">
          <section className="w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E3E6EB] pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#F07421] mb-1">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Verified Corporate Collaboration</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0E2350] tracking-tight">
                  Our Industry Partners
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
                  Companies collaborating with educational institutions to create structured internship opportunities across Andhra Pradesh.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {currentUser?.role === 'super_admin' && (
                  <Link
                    to="/admin/companies"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0E2350] text-[#FFE5D3] hover:bg-[#1A3670] rounded-lg text-xs font-bold shadow-sm transition"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#F07421]" />
                    <span>Admin: Manage Partners (Add / Edit / Delete)</span>
                  </Link>
                )}

                <Link
                  to="/partners"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2A4E96] hover:text-[#0E2350] hover:underline shrink-0"
                >
                  <span>View All Partners ({verifiedCompanies.length})</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Dynamic Partner Grid */}
            {verifiedCompanies.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E3E6EB] p-10 text-center max-w-md mx-auto space-y-3 shadow-sm">
                <div className="w-12 h-12 bg-[#EEF2FA] rounded-xl flex items-center justify-center mx-auto text-[#0E2350]">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#0E2350]">No verified industry partners yet.</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Verified companies will appear here as they join the AP VidyaConnect network.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {displayedCompanies.map((company, idx) => (
                  <PartnerCard key={company.id} company={company} featured={idx === 0} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* 2.2 OUR INSTITUTIONAL NETWORK (DATABASE DRIVEN) */}
        <div className="w-full px-2 sm:px-4">
          <section className="w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E3E6EB] pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1C8A3C] mb-1">
                  <School className="w-3.5 h-3.5" />
                  <span>State Higher Education Network</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0E2350] tracking-tight">
                  Our Institutional Network
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
                  Verified Government Degree Colleges, Polytechnics, and Autonomous Universities participating in centralized internship governance.
                </p>
              </div>

              <Link
                to="/for-institutions"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1C8A3C] hover:text-emerald-900 hover:underline shrink-0"
              >
                <span>Explore Institution Ecosystem ({verifiedInstitutions.length})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Dynamic Institution Grid */}
            {verifiedInstitutions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E3E6EB] p-10 text-center max-w-md mx-auto space-y-3 shadow-sm">
                <div className="w-12 h-12 bg-[#EEF2FA] rounded-xl flex items-center justify-center mx-auto text-[#0E2350]">
                  <School className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#0E2350]">No verified institutions yet.</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Participating government colleges and polytechnics will appear here upon verification.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {displayedInstitutions.map((inst, idx) => (
                  <InstitutionCard key={inst.id} institution={inst} featured={idx === 0} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* 3. THREE ACTORS VALUE PILLARS */}
        <div className="w-full px-2 sm:px-4">
          <section className="w-full">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0E2350]">
                Empowering Every Stakeholder in the Internship Lifecycle
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Built specifically for academic rigor, industry productivity, and student career advancement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Institution Card */}
              <div className="bg-white rounded-2xl border border-[#E3E6EB] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-[#EEF2FA] flex items-center justify-center mb-4 text-[#0E2350]">
                    <School className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0E2350]">For Colleges & Institutions</h3>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    Seamlessly bulk-import students, discover verified corporate partners, formulate multi-student proposals, track live batch attendance, and monitor state accreditation metrics.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-gray-700 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1C8A3C]" />
                      CSV Bulk Student Ingestion & Validations
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1C8A3C]" />
                      Two-Sided Proposal Negotiation Stepper
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1C8A3C]" />
                      Realtime Attendance & Evaluation Sync
                    </li>
                  </ul>
                </div>
                <Link
                  to="/for-institutions"
                  className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[#2A4E96] hover:text-[#0E2350]"
                >
                  Institution Guide & Onboarding <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Company Card */}
              <div className="bg-white rounded-2xl border border-[#E3E6EB] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-[#FFF3EA] flex items-center justify-center mb-4 text-[#F07421]">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0E2350]">For Companies & Industry</h3>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    Review tailored proposals from premier colleges, allocate verified seats, assign technical supervisors, track milestones, and recruit pre-evaluated talent with zero overhead.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-gray-700 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1C8A3C]" />
                      Direct Proposal Review & Counter-Offers
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1C8A3C]" />
                      Intern Task Pipelines & Code Reviews
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1C8A3C]" />
                      Multi-Factor Performance Evaluation Form
                    </li>
                  </ul>
                </div>
                <Link
                  to="/for-companies"
                  className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[#F07421] hover:text-[#D96214]"
                >
                  Industry Partner Portal <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Student Card */}
              <div className="bg-white rounded-2xl border border-[#E3E6EB] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-[#EAF6EE] flex items-center justify-center mb-4 text-[#1C8A3C]">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0E2350]">For Students & Interns</h3>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    Receive verified college placements, digitally sign onboarding consent, log attendance, submit milestone deliverables, and receive structured supervisor appraisals.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-gray-700 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1C8A3C]" />
                      Mandatory "JOIN INTERNSHIP" Consent
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1C8A3C]" />
                      Deliverable & GitHub Link Submission
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1C8A3C]" />
                      Verified Academic Credit Transfer
                    </li>
                  </ul>
                </div>
                <Link
                  to="/for-students"
                  className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[#1C8A3C] hover:text-emerald-800"
                >
                  Student Portal & Guidelines <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* 4. OPPORTUNITIES & PARTNERSHIP BANNER */}
        <div className="w-full px-2 sm:px-4">
          <section className="w-full">
            <div className="bg-gradient-to-r from-[#0E2350] to-[#14336F] rounded-2xl sm:rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-[#14336F]">
              <div className="space-y-2 max-w-xl">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#F07421]">
                  INDUSTRY TALENT NETWORK
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold">
                  Explore Verified Corporate Internship Opportunities
                </h3>
                <p className="text-xs text-[#DCE5F5] leading-relaxed">
                  Connect with top corporate employers and MSMEs across Andhra Pradesh offering structured internships, competitive stipends, and direct Pre-Placement Offers (PPOs).
                </p>
              </div>

              <Link
                to="/opportunities"
                className="px-6 py-3 rounded-lg bg-white hover:bg-gray-100 text-[#0E2350] font-bold text-sm shadow-md transition-all shrink-0 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#F07421]" />
                Browse Opportunities Now
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
