// ============================================================================
// AP VIDYACONNECT — ANDHRA PRADESH GOVERNMENT EDUCATION PORTALS COMPONENT
// Quick access to official education, higher education, and technical education portals
// ============================================================================

import React from 'react';
import { ExternalLink, Landmark, Globe, School, GraduationCap, BookOpen, Award, CheckCircle2 } from 'lucide-react';

interface GovtPortal {
  id: string;
  name: string;
  shortCode: string;
  category: string;
  description: string;
  url: string;
  badgeColor?: string;
  renderLogo: () => React.ReactNode;
}

export const AP_GOVT_PORTALS: GovtPortal[] = [
  {
    id: 'dse-ap',
    name: 'Department of School Education, Andhra Pradesh',
    shortCode: 'CSE AP',
    category: 'School Education & Administration',
    description: 'Primary and secondary school governance, teacher administration, student lifecycle tracking, and foundational learning infrastructure across Andhra Pradesh.',
    url: 'https://cse.ap.gov.in/',
    badgeColor: 'text-[#1C8A3C] bg-emerald-50 border-emerald-200',
    renderLogo: () => (
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-600 via-emerald-700 to-[#0E2350] p-0.5 shadow-sm flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-105">
        <div className="w-full h-full rounded-full border border-amber-300/60 flex flex-col items-center justify-center p-0.5">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-amber-300 fill-current">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M 12 5 L 14 10 L 19 10 L 15 13 L 17 18 L 12 15 L 7 18 L 9 13 L 5 10 L 10 10 Z" />
          </svg>
          <span className="text-[5.5px] font-black text-amber-100 tracking-wider">CSE AP</span>
        </div>
      </div>
    )
  },
  {
    id: 'bie-ap',
    name: 'Board of Intermediate Education (BIEAP)',
    shortCode: 'BIEAP',
    category: 'Higher Secondary & +2 Colleges',
    description: 'Statutory board regulating two-year intermediate education, curriculum design, college affiliations, and state-wide public examinations in AP.',
    url: 'https://bie.ap.gov.in/',
    badgeColor: 'text-[#0E2350] bg-blue-50 border-blue-200',
    renderLogo: () => (
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0E2350] to-[#1E3A8A] p-0.5 shadow-sm flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-105">
        <div className="w-full h-full rounded-full border border-amber-400/70 flex flex-col items-center justify-center p-0.5">
          <BookOpen className="w-5 h-5 text-amber-300" />
          <span className="text-[6px] font-black text-white tracking-wider mt-0.5">BIEAP</span>
        </div>
      </div>
    )
  },
  {
    id: 'apsche',
    name: 'AP State Council of Higher Education (APSCHE)',
    shortCode: 'APSCHE',
    category: 'Higher Education Planning & Governance',
    description: 'Apex statutory body coordinating universities, framing higher education policies, standardizing academic curricula, and regulating quality benchmarks.',
    url: 'https://apsche.ap.gov.in/',
    badgeColor: 'text-[#F07421] bg-[#FFF3EA] border-[#FCE2CE]',
    renderLogo: () => (
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 via-[#F07421] to-[#0E2350] p-0.5 shadow-sm flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-105">
        <div className="w-full h-full rounded-full bg-[#0E2350] border border-amber-300/80 flex flex-col items-center justify-center p-0.5">
          <GraduationCap className="w-5 h-5 text-[#F07421]" />
          <span className="text-[6px] font-black text-amber-200 tracking-wider">APSCHE</span>
        </div>
      </div>
    )
  },
  {
    id: 'dte-ap',
    name: 'Department of Technical Education, Andhra Pradesh',
    shortCode: 'DTE AP',
    category: 'Technical Colleges & Polytechnic Governance',
    description: 'Directing technical engineering institutions, promoting polytechnic infrastructure, technical faculty training, and industry-aligned skill programs.',
    url: 'https://dteap.nic.in/',
    badgeColor: 'text-[#0284C7] bg-sky-50 border-sky-200',
    renderLogo: () => (
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#0369A1] p-0.5 shadow-sm flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-105 border border-sky-400/40">
        <div className="w-full h-full rounded-xl flex flex-col items-center justify-center p-0.5">
          <School className="w-5 h-5 text-cyan-300" />
          <span className="text-[6px] font-black text-cyan-100 tracking-wider mt-0.5">DTE AP</span>
        </div>
      </div>
    )
  },
  {
    id: 'sbtet-ap',
    name: 'State Board of Technical Education & Training (SBTET AP)',
    shortCode: 'SBTET AP',
    category: 'Polytechnic Exams & Diplomas',
    description: 'Autonomous technical board administering diploma examinations, curriculum accreditation, vocational skill schemes, and student diplomas in Andhra Pradesh.',
    url: 'https://sbtet.ap.gov.in/',
    badgeColor: 'text-[#1C8A3C] bg-emerald-50 border-emerald-200',
    renderLogo: () => (
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#064E3B] to-[#047857] p-0.5 shadow-sm flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-105">
        <div className="w-full h-full rounded-full border border-amber-300/70 flex flex-col items-center justify-center p-0.5">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-300 fill-current">
            <path d="M 12 2 L 14 6 L 19 6 L 15 10 L 17 15 L 12 12 L 7 15 L 9 10 L 5 6 L 10 6 Z" />
            <circle cx="12" cy="12" r="3" fill="#064E3B" />
          </svg>
          <span className="text-[5.5px] font-black text-emerald-100 tracking-wider mt-0.5">SBTET AP</span>
        </div>
      </div>
    )
  },
  {
    id: 'samagra-shiksha',
    name: 'AP Samagra Shiksha',
    shortCode: 'Samagra Shiksha',
    category: 'Universal Inclusive Schooling Mission',
    description: 'Integrated centrally sponsored scheme covering pre-school to class XII for holistic, equitable, inclusive school education and smart classrooms across AP.',
    url: 'https://samagrashiksha.ap.gov.in/',
    badgeColor: 'text-[#D97706] bg-amber-50 border-amber-200',
    renderLogo: () => (
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 via-amber-500 to-emerald-600 p-0.5 shadow-sm flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-105">
        <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center p-0.5 text-[#0E2350]">
          <svg viewBox="0 0 32 32" className="w-6 h-6">
            <circle cx="16" cy="10" r="4" fill="#F07421" />
            <path d="M 8 26 C 8 20, 16 18, 16 18 C 16 18, 24 20, 24 26" fill="none" stroke="#1C8A3C" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 6 26 L 26 26" stroke="#0E2350" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="text-[5px] font-black text-[#0E2350] tracking-tight">SAMAGRA</span>
        </div>
      </div>
    )
  },
  {
    id: 'ap-cets',
    name: 'AP Common Entrance Tests (AP-CETS)',
    shortCode: 'AP-CETS',
    category: 'Centralized Professional Admissions',
    description: 'Centralized digital admission portal by APSCHE for engineering, pharmacy, management, education, law and PG programs (EAPCET, ICET, ECET, EDCET, PGECET).',
    url: 'https://cets.apsche.ap.gov.in/',
    badgeColor: 'text-[#6366F1] bg-indigo-50 border-indigo-200',
    renderLogo: () => (
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#312E81] to-[#4338CA] p-0.5 shadow-sm flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-105 border border-indigo-300/40">
        <div className="w-full h-full rounded-xl flex flex-col items-center justify-center p-0.5">
          <Award className="w-5 h-5 text-amber-300" />
          <span className="text-[6px] font-black text-indigo-100 tracking-wider mt-0.5">AP-CETS</span>
        </div>
      </div>
    )
  },
  {
    id: 'udise-plus',
    name: 'UDISE+ (Unified District Information System)',
    shortCode: 'UDISE+',
    category: 'National Education Registry & Analytics',
    description: 'National and state data management platform providing comprehensive real-time statistics on schools, teachers, student enrollments, and academic performance.',
    url: 'https://udiseplus.gov.in/',
    badgeColor: 'text-[#0E2350] bg-slate-100 border-slate-300',
    renderLogo: () => (
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0E2350] p-0.5 shadow-sm flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-105 border border-slate-400/40">
        <div className="w-full h-full rounded-xl flex flex-col items-center justify-center p-0.5">
          <Globe className="w-5 h-5 text-sky-400" />
          <span className="text-[6px] font-black text-sky-200 tracking-wider mt-0.5">UDISE+</span>
        </div>
      </div>
    )
  },
  {
    id: 'jnanabhumi',
    name: 'JnanaBhumi Portal',
    shortCode: 'JnanaBhumi',
    category: 'DBT Scholarships & Student Welfare',
    description: 'Smart e-governance portal for transparent disbursement of post-matric educational scholarships, tuition fee reimbursements, and welfare schemes in AP.',
    url: 'https://jnanabhumi.ap.gov.in/',
    badgeColor: 'text-[#EA580C] bg-orange-50 border-orange-200',
    renderLogo: () => (
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-[#0E2350] p-0.5 shadow-sm flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-105">
        <div className="w-full h-full rounded-full bg-[#0E2350] border border-amber-300/80 flex flex-col items-center justify-center p-0.5">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-300 fill-current">
            <path d="M 12 3 C 12 3, 7 8, 7 13 C 7 16, 9.5 18, 12 18 C 14.5 18, 17 16, 17 13 C 17 8, 12 3, 12 3 Z" />
            <path d="M 12 7 C 12 7, 9 10.5, 9 13 C 9 14.5, 10.5 16, 12 16 C 13.5 16, 15 14.5, 15 13 C 15 10.5, 12 7, 12 7 Z" fill="#F07421" />
          </svg>
          <span className="text-[5px] font-black text-amber-200 tracking-wider">JNANABHUMI</span>
        </div>
      </div>
    )
  }
];

export const ApGovernmentPortals: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E3E6EB] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#F07421] mb-1">
            <Landmark className="w-3.5 h-3.5 text-[#F07421]" />
            <span>Government of Andhra Pradesh • Official Gateways</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0E2350] tracking-tight">
            Andhra Pradesh Government Education Portals
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-3xl leading-relaxed">
            Quick access to official education, higher education and technical education portals of Andhra Pradesh.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 shrink-0">
          <span className="inline-flex items-center gap-1 bg-[#EEF2FA] text-[#0E2350] px-3 py-1 rounded-full font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#1C8A3C]" />
            9 Verified State Portals
          </span>
        </div>
      </div>

      {/* Grid: 3 cards per row on desktop, 2 on tablet, 1 on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {AP_GOVT_PORTALS.map((portal) => (
          <div
            key={portal.id}
            className="group relative bg-white border border-[#E3E6EB] rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-[#F07421]/40 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Top: Logo & Category */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="shrink-0">
                  {portal.renderLogo()}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${portal.badgeColor || 'text-gray-700 bg-gray-50 border-gray-200'} line-clamp-1`}>
                  {portal.shortCode}
                </span>
              </div>

              {/* Title & Category */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-[#F07421] tracking-wide block">
                  {portal.category}
                </span>
                <h3 className="text-sm sm:text-[15px] font-bold text-[#0E2350] group-hover:text-[#14336F] leading-snug">
                  {portal.name}
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed pt-1 line-clamp-3">
                  {portal.description}
                </p>
              </div>
            </div>

            {/* Bottom: Official Portal Action */}
            <div className="mt-5 pt-3.5 border-t border-[#F1F3F5]">
              <a
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between w-full text-xs font-bold text-[#2A4E96] group-hover:text-[#0E2350] transition-colors"
                title={`Visit ${portal.name}`}
              >
                <span>Visit Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#F07421] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
