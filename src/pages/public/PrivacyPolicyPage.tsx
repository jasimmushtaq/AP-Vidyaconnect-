// ============================================================================
// AP VIDYACONNECT — PRIVACY POLICY
// Comprehensive Data Protection & Privacy Standard (DPDP Act 2023 Compliant)
// ============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Eye,
  Database,
  UserCheck,
  Server,
  FileCheck2,
  Mail,
  Phone,
  MapPin,
  Sparkles
} from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-[#EAF6EE] text-[#1C8A3C] px-3.5 py-1 rounded-full text-xs font-bold border border-[#1C8A3C]/20">
          <ShieldCheck className="w-3.5 h-3.5 text-[#1C8A3C]" />
          <span>Data Protection & Privacy Standard</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0E2350]">
          Privacy Policy
        </h1>
        <p className="text-xs text-gray-500">
          Effective Date: <strong>September 2026</strong> • Fully compliant with India’s Digital Personal Data Protection (DPDP) Act, 2023
        </p>
      </div>

      {/* Main Privacy Policy Container */}
      <div className="bg-white rounded-2xl border border-[#E3E6EB] p-6 sm:p-10 shadow-sm space-y-8 text-xs sm:text-sm text-gray-700 leading-relaxed">
        {/* Intro */}
        <div className="p-4 bg-[#F6F7F9] rounded-xl border border-gray-200 text-xs text-gray-600">
          <p>
            <strong>AP VidyaConnect</strong> ("we", "our", "platform"), developed and maintained by <strong>PixelWind Technologies</strong> for the Government of Andhra Pradesh, values your privacy and is committed to protecting the personal data of institutions, students, faculty, and corporate partners.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#0E2350] flex items-center gap-2 border-b border-gray-100 pb-2">
            <UserCheck className="w-4 h-4 text-[#F07421]" />
            1. Information We Collect
          </h2>
          <p>We only collect data strictly necessary to facilitate institutional internship management:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li><strong>Institutional Information:</strong> College name, AISHE code, affiliated university, principal/TPO official email, phone numbers, and NAAC accreditation details.</li>
            <li><strong>Corporate Partner Information:</strong> Corporate Entity name, Ministry of Corporate Affairs CIN, GST identification number, registered office address, and authorized coordinator contact data.</li>
            <li><strong>Student Intern Data:</strong> Full name, university roll number, academic branch/specialization, graduation year, institute email, daily attendance logs, and milestone deliverable links.</li>
            <li><strong>System & Audit Metadata:</strong> Cryptographic session tokens, timestamped state transitions, IP records, and cryptographic signatures generated for evaluation validation.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#0E2350] flex items-center gap-2 border-b border-gray-100 pb-2">
            <Database className="w-4 h-4 text-[#2A4E96]" />
            2. How We Use Your Information
          </h2>
          <p>Your data is processed strictly for legitimate academic and administrative objectives:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li>Executing formal internship proposal submissions and institutional cohort matching.</li>
            <li>Enabling real-time digital daily attendance verification by company supervisors.</li>
            <li>Conducting transparent performance reviews, milestone assessments, and rubric grading.</li>
            <li>Issuing auditable academic credit transcripts for university credit integration.</li>
            <li>Providing aggregated, non-personally identifiable statistical analytics for state education planning.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#0E2350] flex items-center gap-2 border-b border-gray-100 pb-2">
            <Lock className="w-4 h-4 text-[#1C8A3C]" />
            3. Data Security & Cryptographic Safeguards
          </h2>
          <p>We deploy robust enterprise-grade security protocols to protect your information:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li><strong>End-to-End Encryption:</strong> All communications are secured using 256-bit TLS/SSL encryption in transit and AES encryption at rest.</li>
            <li><strong>Role-Based Access Control (RBAC):</strong> Strict principle of least privilege ensures student data is only accessible to their assigned college TPO, corporate partner admin, and state nodal officer.</li>
            <li><strong>Cryptographic State Hashing:</strong> State machine records embed irreversible mathematical hashes that prevent unauthorized tampering or falsification.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#0E2350] flex items-center gap-2 border-b border-gray-100 pb-2">
            <Eye className="w-4 h-4 text-[#F07421]" />
            4. Third-Party Sharing & Commercial Stance
          </h2>
          <p className="text-xs">
            <strong>We NEVER sell, rent, monetize, or trade your personal or academic data to commercial advertisers or third-party marketing entities.</strong> Data is shared solely between the verified educational institution, the verified corporate partner hosting the internship, and the State Higher Education Department for official accreditation and credit transfer.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#0E2350] flex items-center gap-2 border-b border-gray-100 pb-2">
            <Server className="w-4 h-4 text-[#2A4E96]" />
            5. Data Retention & Student Rights
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li><strong>Academic Credit Records:</strong> Attendance transcripts and evaluation dossiers are retained in cold storage to guarantee perpetual verification for employers and higher studies.</li>
            <li><strong>Right of Correction:</strong> Users may request correction of inaccurate profile data through their college administration or the State Super Admin desk.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="p-5 bg-gradient-to-r from-[#EEF2FA] to-white rounded-xl border border-[#2A4E96]/20 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#0E2350]">
            Data Protection Officer & Grievance Redressal
          </h3>
          <p className="text-xs text-gray-600">
            For privacy inquiries, data requests, or grievance redressal, contact PixelWind Technologies:
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-800 pt-1">
            <span>PixelWind Technologies (Data Privacy Team)</span>
            <span>•</span>
            <a href="mailto:pixelwindtechnologies@gmail.com" className="text-[#2A4E96] hover:underline">pixelwindtechnologies@gmail.com</a>
            <span>•</span>
            <a href="tel:+919398929970" className="text-[#0E2350] hover:underline">+91 93989 29970</a>
            <span>•</span>
            <span>Andhra Pradesh, India</span>
          </div>
        </section>
      </div>
    </div>
  );
};
