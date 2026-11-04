// ============================================================================
// AP VIDYACONNECT — HOME LANDING PAGE (PREMIUM REDESIGN)
// Fully Aligned with Mockup: No Human Photos, Floating Architecture,
// Modern Typography, Clean Statistics Bar & APSCHE Initiative Showcase
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../services/dbStore';
import { useAuth } from '../../context/AuthContext';
import { PartnerCard } from '../../components/common/PartnerCard';
import { InstitutionCard } from '../../components/common/InstitutionCard';
import { PromotionalBannerCarousel } from '../../components/common/PromotionalBannerCarousel';
import {
  Building2,
  School,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Users,
  MapPin,
  TrendingUp,
  Sparkles,
  Settings
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
    <div className="w-full pb-16">
      {/* ======================================================================== */}
      {/* 1. HERO SECTION (Art-Directed Academic Composition — Zero Human Photos) */}
      {/* ======================================================================== */}
      <div className="w-full px-2.5 sm:px-6 lg:px-8 pt-2 sm:pt-3">
        <section className="w-full relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[#E2E8F0] bg-white shadow-[0_8px_30px_rgba(11,31,70,0.05)]">
          
          {/* Subtle Ambient Sunset Glow behind Books on Right (Desktop) */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-[#FED7AA]/35 via-[#FDBA74]/15 to-transparent blur-3xl pointer-events-none hidden lg:block" />

          {/* Mobile-Only Academic Books & Graduation Cap Composition (No People) */}
          <div className="lg:hidden w-full h-[180px] sm:h-[230px] relative overflow-hidden bg-gradient-to-r from-white via-[#FFF8F2] to-[#F4F7FC] border-b border-[#E2E8F0] flex items-center justify-center">
            <img
              src="/images/hero-books-gradcap-blended.png"
              alt="Academic Foundation & Graduation Cap"
              className="w-full h-full object-contain object-right-bottom select-none"
            />
            {/* Mobile Calligraphy Overlay */}
            <div className="absolute top-2.5 right-3 text-right select-none pointer-events-none">
              <span
                className="block text-lg sm:text-xl font-bold text-[#0B1F46] leading-none tracking-tight -rotate-6"
                style={{ fontFamily: "'Caveat', cursive" }}
              >
                Better Skills
              </span>
              <span
                className="block text-lg sm:text-xl font-bold text-[#0B1F46] leading-none tracking-tight -rotate-6 mt-0.5"
                style={{ fontFamily: "'Caveat', cursive" }}
              >
                Brighter Future
              </span>
              <svg className="w-20 h-2 text-[#FF6500] ml-auto -rotate-6" viewBox="0 0 100 10" fill="none">
                <path d="M2 3C30 9 70 9 98 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Desktop Two-Column Hero Grid */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 items-center min-h-[380px] lg:min-h-[430px] px-4 sm:px-8 lg:px-12 py-6 lg:py-8 relative z-10">
            {/* Left Column: Heading, Outlined Pill & Two Side-by-Side CTAs */}
            <div className="w-full lg:col-span-7 space-y-4 sm:space-y-5 text-left">
              {/* National Framework Pill Badge with Govt Emblem */}
              <div className="inline-flex items-center gap-2 bg-white border border-[#E2E8F0] text-[#10264A] px-3 py-1 rounded-full text-xs font-semibold shadow-2xs">
                <img
                  src="/brand/ap-govt-emblem.svg"
                  alt="Govt of India / AP Emblem"
                  className="w-4 h-4 object-contain shrink-0"
                />
                <span className="tracking-tight text-[11px] sm:text-xs font-semibold text-[#10264A]">
                  National Internship Transformation Framework • Govt of India
                </span>
              </div>

              {/* Main Bold Heading with Orange Swoosh on 'Industry' */}
              <h1 className="text-3xl sm:text-4xl lg:text-[50px] font-black text-[#0B1F46] tracking-tight leading-[1.14]">
                Connecting Education<br />
                with{' '}
                <span className="relative inline-block text-[#FF6500]">
                  Industry
                  {/* Decorative Curved Swoosh Accent */}
                  <svg
                    className="absolute -top-1 sm:-top-2 -right-4 sm:-right-8 w-24 sm:w-36 h-4 sm:h-6 text-[#FF6500] pointer-events-none"
                    viewBox="0 0 120 20"
                    fill="none"
                  >
                    <path
                      d="M4 16 C 40 4, 85 4, 116 14"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>

              {/* Supporting Description */}
              <p className="text-xs sm:text-[14px] text-[#475569] max-w-[560px] font-normal leading-relaxed">
                The centralized, two-sided institutional collaboration platform enabling formal proposal reviews, auditable batch creation, verified attendance, and government-recognized internship certifications.
              </p>

              {/* Two Primary Side-by-Side CTA Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  to="/register?type=institution"
                  className="h-[46px] px-5 rounded-full bg-[#0B1F46] hover:bg-[#14336F] text-white font-bold text-xs sm:text-[13.5px] shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-between sm:justify-center gap-2.5 group"
                >
                  <div className="flex items-center gap-2">
                    <School className="w-4 h-4 text-[#FF6500]" />
                    <span>Register Institution</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  to="/register?type=company"
                  className="h-[46px] px-5 rounded-full bg-[#FF6500] hover:bg-[#E65A00] text-white font-bold text-xs sm:text-[13.5px] shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-between sm:justify-center gap-2.5 group"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-white" />
                    <span>Register Company</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Column: Realistic Academic Composition (Books + Mortarboard + University Facade) */}
            <div className="hidden lg:flex lg:col-span-5 relative items-center justify-end h-full min-h-[380px]">
              <img
                src="/images/hero-books-gradcap-blended.png"
                alt="Stack of Academic Books with Graduation Cap & Campus Architecture"
                className="relative z-10 w-full max-w-[540px] h-auto max-h-[360px] object-contain object-right select-none drop-shadow-sm"
              />
            </div>
          </div>
        </section>
      </div>

      {/* ======================================================================== */}
      {/* 2. IMPACT STATISTICS BAR (Real-Time Industry & Institutional Networks)   */}
      {/* ======================================================================== */}
      <div className="w-full px-2.5 sm:px-6 lg:px-8 mt-3 sm:mt-4">
        <div className="w-full bg-white rounded-2xl lg:rounded-full border border-[#E2E8F0] shadow-[0_4px_20px_rgba(11,31,70,0.04)] px-5 sm:px-8 py-3.5 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            
            {/* Metric 1: Industry Networks (Real-Time Live Data) */}
            <Link
              to="/partners"
              className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3 group hover:opacity-95 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#0B1F46] leading-none flex items-center gap-2">
                    <span>{verifiedCompaniesCount || companies.length}</span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      LIVE
                    </span>
                  </div>
                  <div className="text-xs sm:text-[13px] text-[#475569] font-bold mt-0.5 group-hover:text-[#1456C0] transition-colors">
                    Industry Networks
                  </div>
                </div>
              </div>
            </Link>

            <div className="h-9 w-[1px] bg-[#E2E8F0] hidden sm:block" />

            {/* Metric 2: Institutional Networks (Real-Time Live Data) */}
            <Link
              to="/institutions"
              className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3 group hover:opacity-95 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0B1F46] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <School className="w-5 h-5 text-[#FF6500]" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#0B1F46] leading-none flex items-center gap-2">
                    <span>{registeredCollegesCount || institutions.length}</span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      LIVE
                    </span>
                  </div>
                  <div className="text-xs sm:text-[13px] text-[#475569] font-bold mt-0.5 group-hover:text-[#1456C0] transition-colors">
                    Institutional Networks
                  </div>
                </div>
              </div>
            </Link>

            <div className="h-9 w-[1px] bg-[#E2E8F0] hidden lg:block" />

            {/* Metric 3: Building a Skilled & Self-Reliant India + Tiranga Wave */}
            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFF3EA] to-[#FFE0C7] text-[#FF6500] flex items-center justify-center shrink-0 border border-[#FED7AA]">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#0B1F46] leading-tight">
                    Building a Skilled
                  </div>
                  <div className="text-[11px] sm:text-xs text-[#475569] font-medium">
                    and Self-Reliant India
                  </div>
                </div>
              </div>

              {/* Artistic Tiranga (Saffron, White, Green) Ribbon Wave SVG */}
              <svg className="w-16 sm:w-20 h-6 shrink-0" viewBox="0 0 80 24" fill="none">
                <path d="M 2 12 C 24 4, 48 20, 78 8" stroke="#FF9933" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 2 15 C 24 7, 48 23, 78 11" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 2 18 C 24 10, 48 26, 78 14" stroke="#138808" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================================== */}
      {/* 3. PROMOTIONAL ANNOUNCEMENT BANNER CAROUSEL (APSCHE NODAL INITIATIVE)   */}
      {/* ======================================================================== */}
      <div className="w-full px-2.5 sm:px-6 lg:px-8 mt-3 sm:mt-4">
        <PromotionalBannerCarousel />
      </div>

      {/* ======================================================================== */}
      {/* 5. REST OF HOMEPAGE CONTENT (Dynamic Database Directories & Pillars)   */}
      {/* ======================================================================== */}
      <div className="space-y-8 sm:space-y-12 pt-6 sm:pt-10">
        
        {/* 5.1 OUR INDUSTRY PARTNERS (DATABASE DRIVEN) */}
        <div className="w-full px-2.5 sm:px-6 lg:px-8">
          <section className="w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E2E8F0] pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#FF6500] mb-1">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Verified Corporate Collaboration</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F46] tracking-tight">
                  Our Industry Partners
                </h2>
                <p className="text-xs sm:text-sm text-[#475569] mt-1 max-w-2xl leading-relaxed">
                  Companies collaborating with educational institutions to create structured internship opportunities across Andhra Pradesh.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {currentUser?.role === 'super_admin' && (
                  <Link
                    to="/admin/companies"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0B1F46] text-[#FFE5D3] hover:bg-[#14336F] rounded-lg text-xs font-bold shadow-sm transition"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#FF6500]" />
                    <span>Admin: Manage Partners</span>
                  </Link>
                )}

                <Link
                  to="/partners"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1456C0] hover:text-[#0B1F46] hover:underline shrink-0"
                >
                  <span>View All Partners ({verifiedCompanies.length})</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Dynamic Partner Grid */}
            {verifiedCompanies.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center max-w-md mx-auto space-y-3 shadow-sm">
                <div className="w-12 h-12 bg-[#F4F7FC] rounded-xl flex items-center justify-center mx-auto text-[#0B1F46]">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#0B1F46]">No verified industry partners yet.</h3>
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

        {/* 5.2 OUR INSTITUTIONAL NETWORK (DATABASE DRIVEN) */}
        <div className="w-full px-2.5 sm:px-6 lg:px-8">
          <section className="w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E2E8F0] pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#10B981] mb-1">
                  <School className="w-3.5 h-3.5" />
                  <span>State Higher Education Network</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F46] tracking-tight">
                  Our Institutional Network
                </h2>
                <p className="text-xs sm:text-sm text-[#475569] mt-1 max-w-2xl leading-relaxed">
                  Verified Government Degree Colleges, Polytechnics, and Autonomous Universities participating in centralized internship governance.
                </p>
              </div>

              <Link
                to="/institutions"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#10B981] hover:text-emerald-900 hover:underline shrink-0"
              >
                <span>Explore Institution Ecosystem ({verifiedInstitutions.length})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Dynamic Institution Grid */}
            {verifiedInstitutions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center max-w-md mx-auto space-y-3 shadow-sm">
                <div className="w-12 h-12 bg-[#F4F7FC] rounded-xl flex items-center justify-center mx-auto text-[#0B1F46]">
                  <School className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#0B1F46]">No verified institutions yet.</h3>
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

        {/* 5.3 THREE ACTORS VALUE PILLARS */}
        <div className="w-full px-2.5 sm:px-6 lg:px-8">
          <section className="w-full">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F46]">
                Empowering Every Stakeholder in the Internship Lifecycle
              </h2>
              <p className="text-sm text-[#475569] mt-2">
                Built specifically for academic rigor, industry productivity, and student career advancement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Institution Card */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#EEF2FA] flex items-center justify-center mb-4 text-[#0B1F46]">
                    <School className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0B1F46]">For Colleges & Institutions</h3>
                  <p className="text-xs text-[#475569] mt-2 leading-relaxed">
                    Seamlessly bulk-import students, discover verified corporate partners, formulate multi-student proposals, track live batch attendance, and monitor state accreditation metrics.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-[#10264A] font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      CSV Bulk Student Ingestion & Validations
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      Two-Sided Proposal Negotiation Stepper
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      Realtime Attendance & Evaluation Sync
                    </li>
                  </ul>
                </div>
                <Link
                  to="/for-institutions"
                  className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[#1456C0] hover:text-[#0B1F46]"
                >
                  Institution Guide & Onboarding <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Company Card */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#FFF3EA] flex items-center justify-center mb-4 text-[#FF6500]">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0B1F46]">For Companies & Industry</h3>
                  <p className="text-xs text-[#475569] mt-2 leading-relaxed">
                    Review tailored proposals from premier colleges, allocate verified seats, assign technical supervisors, track milestones, and recruit pre-evaluated talent with zero overhead.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-[#10264A] font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      Direct Proposal Review & Counter-Offers
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      Intern Task Pipelines & Code Reviews
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      Multi-Factor Performance Evaluation Form
                    </li>
                  </ul>
                </div>
                <Link
                  to="/for-companies"
                  className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[#FF6500] hover:text-[#E65A00]"
                >
                  Industry Partner Portal <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Student Card */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#EAF6EE] flex items-center justify-center mb-4 text-[#10B981]">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0B1F46]">For Students & Interns</h3>
                  <p className="text-xs text-[#475569] mt-2 leading-relaxed">
                    Receive verified college placements with direct automated batch enrollment, log daily GPS attendance, submit milestone deliverables, and receive structured supervisor appraisals.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-[#10264A] font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      Direct Automated Cohort Enrollment
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      Deliverable & GitHub Link Submission
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      Verified Academic Credit Transfer
                    </li>
                  </ul>
                </div>
                <Link
                  to="/for-students"
                  className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[#10B981] hover:text-emerald-800"
                >
                  Student Portal & Guidelines <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* 5.4 OPPORTUNITIES & PARTNERSHIP BANNER */}
        <div className="w-full px-2.5 sm:px-6 lg:px-8">
          <section className="w-full">
            <div className="bg-gradient-to-r from-[#0B1F46] via-[#10264A] to-[#14336F] rounded-2xl sm:rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-[#14336F]">
              <div className="space-y-2 max-w-xl">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#FF6500]">
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
                className="px-6 py-3 rounded-full bg-white hover:bg-gray-100 text-[#0B1F46] font-bold text-sm shadow-md transition-all shrink-0 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#FF6500]" />
                <span>Browse Opportunities Now</span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
