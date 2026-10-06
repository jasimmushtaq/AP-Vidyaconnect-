// ============================================================================
// AP VIDYACONNECT — PUBLIC COMPANY PROFILE & PARTNER SHOWCASE
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../../services/dbStore';
import { useAuth } from '../../context/AuthContext';
import { Company, InternshipOpportunity } from '../../types/database';
import {
  Building2,
  CheckCircle2,
  MapPin,
  Globe,
  Mail,
  Phone,
  Briefcase,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Clock,
  Users,
  Award,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const PublicCompanyProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentRole } = useAuth();

  const [company, setCompany] = useState<Company | null>(null);
  const [opportunities, setOpportunities] = useState<InternshipOpportunity[]>([]);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchCompanyData = () => {
      const found = db.companies.find((c) => c.id === id);
      if (found) {
        setCompany({ ...found });
        const opps = db.opportunities.filter((o) => o.company_id === found.id && o.status === 'active');
        setOpportunities(opps);
      } else {
        setCompany(null);
      }
    };

    fetchCompanyData();
    const unsub = db.subscribe(fetchCompanyData);
    return unsub;
  }, [id]);

  if (!company) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-[#F6F7F9] rounded-2xl flex items-center justify-center mx-auto text-gray-400">
          <Building2 className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-[#0E2350]">Partner Company Not Found</h1>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          The requested industry partner does not exist or has not completed official state verification yet.
        </p>
        <Link
          to="/partners"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0E2350] hover:bg-[#14336F] text-white text-xs font-bold rounded-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Verified Partners
        </Link>
      </div>
    );
  }

  // Active batches for this company
  const activeBatchesCount = db.batches.filter((b) => b.company_id === company.id).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
        <Link to="/" className="hover:text-[#0E2350]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <Link to="/partners" className="hover:text-[#0E2350]">Industry Partners</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-[#0E2350] font-bold truncate max-w-[200px]">{company.name}</span>
      </div>

      {/* Main Company Header Card */}
      <div className="bg-white rounded-2xl border border-[#E3E6EB] p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Logo & Basic Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Fixed Aspect Ratio Container */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#F8FAFC] border border-[#E3E6EB] p-3 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
              {company.logo_url && !imageError ? (
                <img
                  src={company.logo_url}
                  alt={`${company.name} Logo`}
                  onError={() => setImageError(true)}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-[#0E2350] text-[#F07421] font-extrabold text-2xl rounded-xl flex items-center justify-center">
                  {company.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#F07421] bg-[#FFF3EA] px-2.5 py-0.5 rounded">
                  {company.industry}
                </span>

                {company.verification_status === 'verified' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Industry Partner
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200">
                    Verification In Progress
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0E2350] tracking-tight">
                {company.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 pt-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{company.headquarters || 'Andhra Pradesh, India'}</span>
                </div>

                {company.website && (
                  <a
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-[#2A4E96] font-semibold hover:underline"
                  >
                    <Globe className="w-4 h-4 text-[#2A4E96] shrink-0" />
                    <span>Official Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action CTAs for Colleges */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 self-start w-full sm:w-auto">
            {(currentRole === 'institution_admin' || currentRole === 'faculty_coordinator') && (
              <Link
                to={`/proposals/new?companyId=${company.id}`}
                className="px-5 py-2.5 bg-[#0E2350] hover:bg-[#14336F] text-white text-xs font-bold rounded-xl shadow transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#F07421]" />
                Draft College Proposal
              </Link>
            )}

            <Link
              to="/opportunities"
              className="px-5 py-2.5 bg-[#F6F7F9] hover:bg-gray-200 text-[#0E2350] text-xs font-bold rounded-xl border border-[#E3E6EB] transition-all flex items-center justify-center gap-1.5"
            >
              Browse All Opportunities <ArrowRight className="w-4 h-4 text-[#2A4E96]" />
            </Link>
          </div>
        </div>

        {/* Quick Statutory & Corporate Details Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-100 text-xs">
          <div className="p-3.5 bg-[#F6F7F9] rounded-xl">
            <span className="text-[10px] text-gray-500 font-bold uppercase block">Corporate CIN</span>
            <span className="text-xs font-mono font-bold text-[#0E2350] mt-1 block truncate" title={company.cin}>
              {company.cin || 'U72200AP2026PTC'}
            </span>
            <span className="text-[10px] text-gray-400">Govt of India MCA</span>
          </div>

          <div className="p-3.5 bg-[#F6F7F9] rounded-xl">
            <span className="text-[10px] text-gray-500 font-bold uppercase block">Authorized Liaison</span>
            <span className="text-xs font-bold text-[#0E2350] mt-1 block truncate" title={company.authorized_person_name}>
              {company.authorized_person_name || 'Corporate Partner Lead'}
            </span>
            <span className="text-[10px] text-gray-400">Institutional Relations</span>
          </div>

          <div className="p-3.5 bg-[#F6F7F9] rounded-xl">
            <span className="text-[10px] text-gray-500 font-bold uppercase block">Primary Sector</span>
            <span className="text-xs font-bold text-[#0E2350] mt-1 block truncate" title={company.sector}>
              {company.sector || company.industry || 'Enterprise Technology'}
            </span>
            <span className="text-[10px] text-gray-400">Industry Vertical</span>
          </div>

          <div className="p-3.5 bg-[#F6F7F9] rounded-xl">
            <span className="text-[10px] text-gray-500 font-bold uppercase block">State Trust Status</span>
            <span className="text-xs font-bold text-emerald-700 mt-1 block flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Auditable
            </span>
            <span className="text-[10px] text-gray-400">Govt Verified</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: About & Active Opportunities (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Section */}
          <div className="bg-white rounded-2xl border border-[#E3E6EB] p-6 shadow-sm space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#0E2350] border-b border-gray-100 pb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#F07421]" />
              About {company.name}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {company.description ||
                `${company.name} is an accredited industry partner registered with the AP VidyaConnect centralized internship portal. The organization collaborates with government and autonomous colleges to provide structured, industry-supervised practical internships.`}
            </p>
          </div>

          {/* Active Internship Opportunities Offered by this Partner */}
          <div className="bg-white rounded-2xl border border-[#E3E6EB] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#1C8A3C]" />
                <h2 className="text-base sm:text-lg font-bold text-[#0E2350]">
                  Active Internship Openings ({opportunities.length})
                </h2>
              </div>
              <span className="text-xs text-gray-400">Direct College Proposals Supported</span>
            </div>

            {opportunities.length === 0 ? (
              <div className="py-8 text-center text-gray-400 space-y-2">
                <Briefcase className="w-8 h-8 mx-auto text-gray-300" />
                <p className="text-xs font-semibold">No active public openings posted right now.</p>
                <p className="text-[11px] text-gray-400">
                  Colleges can still author custom proposals directly to this partner.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {opportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="p-4 rounded-xl border border-gray-100 bg-[#F6F7F9]/80 hover:bg-white hover:border-[#2A4E96]/40 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold uppercase bg-[#EEF2FA] text-[#0E2350] px-2 py-0.5 rounded">
                            {opp.mode} • {opp.duration_weeks} Weeks
                          </span>
                          <span className="text-[10px] font-bold text-[#1C8A3C]">
                            {opp.stipend_range || `₹${opp.stipend_amount}/mo`}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-[#0E2350] mt-1.5">{opp.title}</h3>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {(currentRole === 'institution_admin' || currentRole === 'faculty_coordinator') && (
                          <Link
                            to={`/proposals/new?companyId=${company.id}&domain=${encodeURIComponent(opp.domain)}`}
                            className="px-3 py-1.5 bg-[#0E2350] hover:bg-[#14336F] text-white text-[11px] font-bold rounded-lg shadow-sm"
                          >
                            Draft Proposal
                          </Link>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {opp.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {opp.skills_required?.slice(0, 5).map((skill) => (
                        <span
                          key={skill}
                          className="text-[9px] bg-white border border-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      <span className="text-[10px] text-gray-400 ml-auto font-medium">
                        {opp.seats} Seats Available
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Key Details & Institutional Guidance (1 Col) */}
        <div className="space-y-6">
          {/* Institutional Partnership Card */}
          <div className="bg-[#0E2350] text-white rounded-2xl p-6 shadow-md space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#F07421]">
              INSTITUTIONAL COLLABORATION
            </span>
            <h3 className="text-base font-bold leading-snug">
              Propose Student Cohorts to {company.name}
            </h3>
            <p className="text-xs text-[#DCE5F5] leading-relaxed">
              Higher education institutions can author custom proposals, allocate student rosters, and negotiate mentoring stipends under formal state governance.
            </p>

            {(currentRole === 'institution_admin' || currentRole === 'faculty_coordinator') ? (
              <Link
                to={`/proposals/new?companyId=${company.id}`}
                className="w-full py-2.5 bg-[#F07421] hover:bg-[#D96214] text-white text-xs font-bold rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                Initiate Formal Proposal
              </Link>
            ) : (
              <Link
                to="/login"
                className="w-full py-2.5 bg-white hover:bg-gray-100 text-[#0E2350] text-xs font-bold rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
              >
                Sign In as College Admin
              </Link>
            )}
          </div>

          {/* Public Corporate Relations Contact */}
          <div className="bg-white rounded-2xl border border-[#E3E6EB] p-6 shadow-sm space-y-4 text-xs">
            <h3 className="text-sm font-bold text-[#0E2350] border-b border-gray-100 pb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2A4E96]" />
              Campus Relations & Coordination
            </h3>

            <div className="space-y-3 text-gray-700">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Authorized Officer</span>
                <span className="font-bold text-[#0E2350] text-sm">{company.authorized_person_name}</span>
                <span className="text-[11px] text-gray-500 block">{company.designation}</span>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Official Contact</span>
                <p className="flex items-center gap-2 text-gray-800 font-mono text-[11px] mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {company.official_email}
                </p>
                <p className="flex items-center gap-2 text-gray-800 font-mono text-[11px] mt-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {company.official_phone}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Campus Location</span>
                <p className="flex items-start gap-1.5 text-gray-700 mt-0.5 leading-relaxed">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                  {company.headquarters}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
