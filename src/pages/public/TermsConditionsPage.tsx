// ============================================================================
// AP VIDYACONNECT — TERMS & CONDITIONS OF SERVICE
// Comprehensive Legal, Regulatory, and Technical Governance Framework
// ============================================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Scale,
  Building2,
  School,
  GraduationCap,
  Lock,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  Award,
  Radio,
  FileCheck2,
  BookOpen,
  QrCode,
  Printer,
  ChevronRight,
  HelpCircle,
  Check
} from 'lucide-react';

export const TermsConditionsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<number | null>(null);

  const sections = [
    {
      id: 1,
      title: 'Statutory Mandate, NEP 2020 & AICTE Alignment',
      tag: 'Statutory Base',
      icon: BookOpen,
      points: [
        {
          heading: 'Mandatory Credit Integration',
          content: 'All internships executed through AP VidyaConnect strictly align with National Education Policy (NEP) 2020 guidelines and AICTE internship credit frameworks, guaranteeing standard academic credit recognition across all state universities.'
        },
        {
          heading: 'Accreditation Authenticity',
          content: 'Institutions registering on the platform must maintain active AISHE, NAAC, or NBA accreditations. Corporate partners must hold valid Corporate Identification Numbers (CIN) registered under the Ministry of Corporate Affairs (MCA), Government of India.'
        },
        {
          heading: 'Anti-Fraud Undertaking',
          content: 'Any submission of falsified documents, invalid GST credentials, or bogus student accounts will result in immediate blacklisting and statutory reporting to law enforcement authorities.'
        }
      ]
    },
    {
      id: 2,
      title: 'Institutional Obligations (Colleges & Universities)',
      tag: 'Higher Ed Norms',
      icon: School,
      points: [
        {
          heading: 'Cohort Proposal Integrity',
          content: 'College Placement Cells and Principals must author detailed batch proposals that accurately specify candidate prerequisites, branch disciplines, nominated student rosters, and faculty mentors.'
        },
        {
          heading: 'Mandatory Faculty Supervision',
          content: 'Each authorized internship batch must have a nominated Faculty Coordinator who periodically inspects student telemetry, reviews monthly progress evaluations, and addresses student grievances.'
        },
        {
          heading: 'Academic Attendance Enforcement',
          content: 'Institutions agree that no academic credit will be awarded to interns who fail to maintain the state-mandated minimum threshold of 75% verified geofenced attendance during the internship lifecycle.'
        }
      ]
    },
    {
      id: 3,
      title: 'Corporate Partner Obligations & Workplace Safety',
      tag: 'POSH & Labor Norms',
      icon: Building2,
      points: [
        {
          heading: 'Safe Work Environment & POSH Compliance',
          content: 'Host companies must provide safe, respectful, non-discriminatory physical and virtual work environments in strict adherence to the Prevention of Sexual Harassment (POSH) Act, 2013 and occupational safety norms.'
        },
        {
          heading: 'Dedicated Industry Mentors',
          content: 'Employers must designate qualified senior engineers or technical supervisors to mentor interns, assign structured milestone tasks, and conduct mid-term and final performance evaluations.'
        },
        {
          heading: 'Timely Stipend Disbursal',
          content: 'All stipends committed in approved cohort proposals must be disbursed directly to intern bank accounts without unauthorized deductions, delays, or commercial withholdings.'
        },
        {
          heading: 'No Commercial Exploitation',
          content: 'Internships must be structured around genuine hands-on technical training, skill development, and live industrial deliverables rather than routine non-academic clerical duties.'
        }
      ]
    },
    {
      id: 4,
      title: 'Geofenced GPS Mobile Attendance & Biometric Telemetry',
      tag: 'GPS & Telemetry',
      icon: Radio,
      points: [
        {
          heading: 'Company Admin Sole Authority for Geofence Settings',
          content: 'The exact workplace GPS coordinates (latitude, longitude), geofence boundary radius (e.g. 100m–250m), daily check-in time windows, and working days are managed and configured strictly and exclusively by the authorized Company Administrator.'
        },
        {
          heading: 'Tamper-Proof Verification Protocol',
          content: 'Students mark daily attendance independently from within the authorized employer geofence. The system automatically records GPS accuracy, device distance, timestamp, and live camera selfie face verification to prevent proxy check-ins.'
        },
        {
          heading: 'Anti-Spoofing & Device Integrity',
          content: 'Any attempt to spoof GPS locations using mock location apps, VPNs, or proxy selfies triggers an automatic security audit log and flags the student for institutional disciplinary review.'
        }
      ]
    },
    {
      id: 5,
      title: 'Institutional MoUs & Digital Signatures',
      tag: 'Legal Binding',
      icon: FileCheck2,
      points: [
        {
          heading: 'Dual-Signature Legal Enforceability',
          content: 'Institutional Memorandums of Understanding (MoUs) drafted and signed digitally on the platform constitute valid legal agreements under Section 65B of the Indian Evidence Act and Information Technology Act.'
        },
        {
          heading: 'State Higher Education Repository',
          content: 'Upon dual signature by College Principals and Corporate Directors, MoUs are automatically registered in the state higher education central repository with immutable audit timestamps.'
        }
      ]
    },
    {
      id: 6,
      title: 'Student Code of Conduct & Digital Consent',
      tag: 'Student Ethics',
      icon: GraduationCap,
      points: [
        {
          heading: 'Mandatory Digital Onboarding',
          content: 'Nominated students must log in, review workplace rules and stipend terms, and execute digital consent ("JOIN INTERNSHIP") before starting work.'
        },
        {
          heading: 'Confidentiality & Non-Disclosure (NDA)',
          content: 'Interns are bound to protect all proprietary algorithms, enterprise code repositories, client data, and trade secrets accessed during their internship tenure.'
        },
        {
          heading: 'Academic Integrity',
          content: 'Task submissions and project code must represent the student\'s original work. Plagiarism or unauthorized copying of commercial source code is strictly prohibited.'
        }
      ]
    },
    {
      id: 7,
      title: 'Academic Credit Recognition & NEP 2020 Compliance',
      tag: 'University Credits',
      icon: ShieldCheck,
      body: 'Upon successful cohort completion and evaluation approval by both Industry Mentor and College Faculty, AP VidyaConnect automatically validates and synchronizes academic internship credits (4 to 12 NEP credits) directly with the respective University Examination & Placement branch.'
    },
    {
      id: 8,
      title: 'Data Privacy, Encryption & Audit Governance',
      tag: 'DPDP Act 2023',
      icon: Lock,
      body: 'All personal data, academic records, and biometric selfie verifications are processed with 256-bit encryption in strict compliance with the Digital Personal Data Protection (DPDP) Act, 2023. User data is never monetized or shared with third-party advertisers. State administrators maintain continuous audit logs of all administrative actions.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF3EA] text-[#0E2350] border border-[#F07421]/20 text-xs font-black shadow-2xs">
            <Scale className="w-3.5 h-3.5 text-[#F07421]" />
            <span>Government of Andhra Pradesh • Higher Education Regulatory Framework</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0E2350] tracking-tight">
            Terms & Conditions of Service
          </h1>

          <p className="text-xs sm:text-sm text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive Statutory, Operational, and Technical Governance Guidelines for Higher Education Institutions, Industry Partners, and Student Interns.
          </p>

          <div className="inline-flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] text-gray-500 font-semibold">
            <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg shadow-2xs font-mono">
              Official Version: <strong>v3.4 (2026-2027 Academic Cycle)</strong>
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Promulgated under APSCHE & AP Higher Education Directives
            </span>
          </div>
        </div>

        {/* Quick Jump Pills */}
        <div className="bg-white rounded-2xl border border-gray-200 p-3 shadow-2xs overflow-x-auto flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 pl-2 shrink-0">
            Quick Jump:
          </span>
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#section-${s.id}`}
              className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-[#0E2350] hover:text-white text-gray-700 text-xs font-bold transition-all shrink-0 whitespace-nowrap"
            >
              § {s.id}. {s.title.split(' ')[0]} {s.title.split(' ')[1]}
            </a>
          ))}
        </div>

        {/* Main Document Body */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-12 shadow-sm space-y-10 text-xs sm:text-sm text-gray-700 leading-relaxed">
          {/* Executive Overview Box */}
          <div className="p-6 bg-gradient-to-r from-[#EEF2FA] via-blue-50/50 to-white rounded-2xl border border-blue-200/80 text-xs text-gray-700 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-[#0E2350] text-sm sm:text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                Executive Preamble & Binding Mandate
              </h3>
              <span className="text-[10px] uppercase font-black px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                Statutory Accord
              </span>
            </div>
            <p className="leading-relaxed text-gray-700">
              The <strong>AP VidyaConnect Platform</strong> is the official statewide digital ecosystem established by the Government of Andhra Pradesh to unify industrial internships, accredited college proposals, geofenced mobile attendance telemetry, dual-signature MoUs, and cryptographically verified certifications. Access to this platform constitutes a legally binding agreement under the <strong>Information Technology Act, 2000</strong> and applicable UGC / AICTE Internship Directives.
            </p>
          </div>

          {/* Render 8 Sections */}
          <div className="space-y-10 divide-y divide-gray-100">
            {sections.map((sec) => {
              const IconComponent = sec.icon;
              return (
                <section key={sec.id} id={`section-${sec.id}`} className="pt-8 first:pt-0 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-[#0E2350] text-white flex items-center justify-center text-xs font-black shrink-0 shadow-xs">
                        {sec.id}
                      </span>
                      <h2 className="text-base sm:text-lg font-extrabold text-[#0E2350] flex items-center gap-2">
                        {sec.title}
                      </h2>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg self-start sm:self-auto">
                      {sec.tag}
                    </span>
                  </div>

                  {sec.points && (
                    <div className="space-y-3 pl-2 sm:pl-4">
                      {sec.points.map((pt, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-3 text-xs sm:text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <strong className="text-[#0E2350] font-bold">{pt.heading}:</strong>{' '}
                            <span>{pt.content}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {sec.body && (
                    <div className="pl-2 sm:pl-4">
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed bg-gray-50/60 p-4 rounded-xl border border-gray-100">
                        {sec.body}
                      </p>
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          {/* Contact & Governance Footer Box */}
          <div className="p-6 bg-[#F6F7F9] rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0E2350]">
                Statutory Inquiries & Grievances
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                For legal inquiries, dispute arbitration, or compliance verification:
              </p>
              <p className="text-xs text-gray-700 font-semibold mt-1">
                APSCHE Nodal Secretariat • Neeladri Towers, Mangalagiri, Guntur District, AP
              </p>
            </div>

            <Link
              to="/contact"
              className="px-5 py-2.5 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span>Contact Nodal Desk</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
