// ============================================================================
// AP VIDYACONNECT — FREQUENTLY ASKED QUESTIONS (FAQS)
// Comprehensive Actor-Based Interactive Knowledge Base
// ============================================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  School,
  Building2,
  GraduationCap,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  ArrowRight,
  Mail,
  Phone
} from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

interface FaqCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: FaqItem[];
}

export const FaqsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [expandedIndices, setExpandedIndices] = useState<Record<string, boolean>>({
    'inst-0': true,
    'comp-0': true,
    'stu-0': true,
    'gen-0': true
  });

  const toggleExpand = (key: string) => {
    setExpandedIndices(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const categories: FaqCategory[] = [
    {
      id: 'institutions',
      title: 'Colleges & Higher Education Institutes',
      icon: <School className="w-5 h-5 text-[#2A4E96]" />,
      items: [
        {
          q: 'How does a government college or institute register on AP VidyaConnect?',
          a: 'Colleges can register by clicking "Register Institution" from the homepage. Provide your AISHE code, official institution email, Principal name, and district. Upon submission, your application is reviewed and verified by the State Higher Education Directorate.'
        },
        {
          q: 'How does an Institution submit an internship proposal to a corporate partner?',
          a: 'Once logged in as an Institution Admin or TPO, navigate to "Proposals" ➔ "Create Proposal". Select the target corporate partner, choose eligible student cohorts, specify internship domain and dates, and click "Submit Proposal". The proposal enters a cryptographic state engine for company review.'
        },
        {
          q: 'Can an institution track daily attendance and supervisor marks?',
          a: 'Yes. Departmental coordinators and TPOs have real-time visibility into student attendance marked by company supervisors, milestone progress, and faculty supervisor oversight.'
        },
        {
          q: 'How are internship credits mapped to university academic requirements?',
          a: 'AP VidyaConnect produces standardized, cryptographically signed completion transcripts that specify total completed hours, mentor grades, and project deliverables, conforming to UGC/AICTE credit transfer norms.'
        }
      ]
    },
    {
      id: 'companies',
      title: 'Corporate Partners & Employers',
      icon: <Building2 className="w-5 h-5 text-[#F07421]" />,
      items: [
        {
          q: 'What are the criteria for corporate partner verification?',
          a: 'Enterprises and MSMEs register with their Corporate Identity Number (CIN), GSTIN, official domain email, and authorized director details. State Nodal Officers verify corporate authenticity before granting portal access.'
        },
        {
          q: 'How do companies review and accept college proposals?',
          a: 'When an institution submits a cohort proposal, the company admin receives an instant alert. The company can review seats, stipend commitments, and candidate profiles, request modifications, or approve the proposal.'
        },
        {
          q: 'How do companies mark attendance and evaluate interns?',
          a: 'Corporate partners access the built-in Attendance and Tasks Management portals to mark daily attendance (Present, Absent, Leave, Half-Day) and conduct milestone rubric evaluations based on technical competence, punctuality, and initiative.'
        },
        {
          q: 'Can companies post new internship opportunities on the portal?',
          a: 'Yes. Verified companies can post detailed internship opportunities specifying technical prerequisites, stipend, duration, and seat availability, allowing colleges across the state to express interest.'
        }
      ]
    },
    {
      id: 'students',
      title: 'Students & Interns',
      icon: <GraduationCap className="w-5 h-5 text-[#1C8A3C]" />,
      items: [
        {
          q: 'How do students join their assigned internship cohort?',
          a: 'Once your college maps you to an approved proposal and the cohort batch is formed, you receive a portal notification. Log in, go to "My Internship", and click "JOIN INTERNSHIP" to complete your digital onboarding consent.'
        },
        {
          q: 'What is the minimum attendance required for internship completion?',
          a: 'Students must maintain at least 80% attendance throughout the internship duration as marked by the company supervisor to remain eligible for academic credit transfer.'
        },
        {
          q: 'How do students track their evaluation marks and performance feedback?',
          a: 'Students can view real-time feedback, milestone grades, and supervisor remarks directly within their Student Dashboard under the Tasks and Performance sections.'
        },
        {
          q: 'What should I do if my attendance is marked incorrectly?',
          a: 'Raise a dispute through your college Faculty Coordinator or contact your Company Supervisor immediately through the platform communication channel.'
        }
      ]
    },
    {
      id: 'general',
      title: 'General & Technical Security',
      icon: <ShieldCheck className="w-5 h-5 text-[#0E2350]" />,
      items: [
        {
          q: 'How does bilateral proposal validation work?',
          a: 'Proposals submitted by colleges pass through an auditable state engine where corporate HR reviews candidate cohorts, sets stipend terms, and approves bilateral engagement.'
        },
        {
          q: 'Who develops and maintains the AP VidyaConnect platform?',
          a: 'AP VidyaConnect is designed, engineered, and maintained by PixelWind Technologies in technical partnership with the State Higher Education Department.'
        },
        {
          q: 'Is the platform compliant with national security and privacy laws?',
          a: 'Yes. AP VidyaConnect utilizes 256-bit TLS encryption, RBAC security models, immutable audit logging, and is fully compliant with India’s Digital Personal Data Protection (DPDP) Act 2023.'
        }
      ]
    }
  ];

  const filteredCategories = categories.map(cat => {
    if (activeTab !== 'all' && activeTab !== cat.id) return null;
    const items = cat.items.filter(item =>
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase())
    );
    return { ...cat, items };
  }).filter(Boolean) as FaqCategory[];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-[#FFF3EA] text-[#0E2350] px-3.5 py-1 rounded-full text-xs font-bold border border-[#F07421]/20">
          <HelpCircle className="w-3.5 h-3.5 text-[#F07421]" />
          <span>Knowledge Base & Support Desk</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0E2350]">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-gray-600 max-w-2xl mx-auto">
          Clear, comprehensive guidance for colleges, companies, students, and academic administrators.
        </p>
      </div>

      {/* Search Bar & Filter Tabs */}
      <div className="space-y-4">
        <div className="relative max-w-xl mx-auto">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions (e.g. attendance, proposal, credits, CIN)..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-[#E3E6EB] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2350] shadow-sm"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {[
            { id: 'all', label: 'All Questions' },
            { id: 'institutions', label: 'Colleges' },
            { id: 'companies', label: 'Companies' },
            { id: 'students', label: 'Students' },
            { id: 'general', label: 'General & Security' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-[#0E2350] text-white shadow-sm'
                  : 'bg-white border border-[#E3E6EB] text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="space-y-8">
        {filteredCategories.map(cat => (
          <div key={cat.id} className="bg-white rounded-2xl border border-[#E3E6EB] p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-[#F6F7F9] flex items-center justify-center">
                {cat.icon}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#0E2350]">{cat.title}</h2>
            </div>

            <div className="space-y-3">
              {cat.items.map((item, idx) => {
                const key = `${cat.id}-${idx}`;
                const isExpanded = !!expandedIndices[key];

                return (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-xl overflow-hidden transition-all bg-[#F6F7F9]/50"
                  >
                    <button
                      onClick={() => toggleExpand(key)}
                      className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-gray-100/80 transition-colors"
                    >
                      <span className="font-bold text-xs sm:text-sm text-[#0E2350]">{item.q}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#F07421] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-white">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}

              {cat.items.length === 0 && (
                <p className="text-xs text-gray-400 py-2">No matching questions found in this category.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Helpdesk Support Card */}
      <div className="bg-gradient-to-r from-[#FFF3EA] via-white to-[#EEF2FA] rounded-2xl border border-[#E3E6EB] p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base font-bold text-[#0E2350]">Still have questions or need technical assistance?</h3>
          <p className="text-xs text-gray-600">Our dedicated helpdesk team is available to assist your institution or enterprise.</p>
          <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-700 pt-2 justify-center sm:justify-start">
            <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-[#F07421]" /> pixelwindtechnologies@gmail.com</span>
            <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-[#F07421]" /> +91 93989 29970</span>
          </div>
        </div>

        <Link
          to="/register"
          className="px-5 py-3 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-xl text-xs font-bold shadow flex items-center gap-2 shrink-0 transition-all"
        >
          Get Started Now
          <ArrowRight className="w-4 h-4 text-[#F07421]" />
        </Link>
      </div>
    </div>
  );
};
