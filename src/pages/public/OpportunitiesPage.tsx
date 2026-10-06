// ============================================================================
// AP VIDYACONNECT — CORPORATE OPPORTUNITIES & INTERNSHIP MARKETPLACE
// Open Internship Postings, Detailed Job Specs & Opportunity Directory
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { db } from '../../services/dbStore';
import { InternshipOpportunity } from '../../types/database';
import {
  Building2,
  Search,
  MapPin,
  Briefcase,
  Sparkles,
  ShieldCheck,
  Plus,
  Eye,
  X,
  Clock
} from 'lucide-react';

export const OpportunitiesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const urlMode = searchParams.get('mode') || 'all';

  const { currentCompany, currentRole, isAuthenticated } = useAuth();
  const canPostInternship = isAuthenticated && currentRole === 'company_admin';
  const { showAlert } = useModal();
  const [opportunities, setOpportunities] = useState<InternshipOpportunity[]>(db.opportunities);
  const [search, setSearch] = useState(urlQuery);
  const [modeFilter, setModeFilter] = useState(urlMode);
  const [domainFilter, setDomainFilter] = useState('all');
  const [selectedOpp, setSelectedOpp] = useState<InternshipOpportunity | null>(null);

  // Modals
  const [showPostModal, setShowPostModal] = useState(false);

  // New Opportunity Form State
  const [newOpp, setNewOpp] = useState({
    title: '',
    domain: 'Artificial Intelligence & Machine Learning',
    description: '',
    location: 'Visakhapatnam, Andhra Pradesh',
    mode: 'hybrid' as 'onsite' | 'remote' | 'hybrid',
    duration_weeks: 16,
    seats: 25,
    stipend_range: '₹15,000 - ₹20,000 / month',
    skills_required: 'Python, PyTorch, SQL, REST APIs',
    eligible_degrees: 'B.Tech, M.Tech, MCA, B.Sc Computer Science',
    min_cgpa: 7.0,
    responsibilities: 'Build backend pipelines, participate in daily standups, integrate ML models',
    learning_outcomes: 'Production model deployment, enterprise git workflows, cloud infrastructure'
  });

  useEffect(() => {
    if (urlQuery) setSearch(urlQuery);
    if (urlMode) setModeFilter(urlMode);
  }, [urlQuery, urlMode]);

  const loadData = () => {
    setOpportunities([...db.opportunities]);
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return unsub;
  }, []);

  const filteredOpps = opportunities.filter((o) => {
    const matchesSearch =
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.domain.toLowerCase().includes(search.toLowerCase()) ||
      o.location.toLowerCase().includes(search.toLowerCase()) ||
      o.skills_required?.some(s => s.toLowerCase().includes(search.toLowerCase()));

    const matchesMode = modeFilter === 'all' || o.mode === modeFilter;
    const matchesDomain = domainFilter === 'all' || o.domain.toLowerCase().includes(domainFilter.toLowerCase());

    return matchesSearch && matchesMode && matchesDomain;
  });

  const domains = [
    'Artificial Intelligence & Machine Learning',
    'Full Stack Web & Cloud Development',
    'VLSI & Embedded Systems',
    'Data Engineering & Analytics',
    'Biopharma & Chemical Engineering',
    'IoT & Smart Manufacturing'
  ];

  // Handle Post New Opportunity by Company
  const handlePostOpportunity = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canPostInternship) {
      showAlert({
        title: 'Unauthorized Action',
        message: 'Only registered and verified Company Administrators can publish internship openings.',
        type: 'danger'
      });
      return;
    }

    const companyId = currentCompany?.id || 'comp-001';
    const created: InternshipOpportunity = {
      id: `opp-${Date.now()}`,
      company_id: companyId,
      company: currentCompany || db.companies.find(c => c.id === companyId),
      title: newOpp.title,
      domain: newOpp.domain,
      description: newOpp.description,
      location: newOpp.location,
      mode: newOpp.mode,
      duration_weeks: Number(newOpp.duration_weeks),
      seats: Number(newOpp.seats),
      stipend_range: newOpp.stipend_range,
      skills_required: newOpp.skills_required.split(',').map(s => s.trim()).filter(Boolean),
      eligible_degrees: newOpp.eligible_degrees.split(',').map(s => s.trim()).filter(Boolean),
      min_cgpa: Number(newOpp.min_cgpa),
      responsibilities: newOpp.responsibilities.split(',').map(s => s.trim()).filter(Boolean),
      learning_outcomes: newOpp.learning_outcomes.split(',').map(s => s.trim()).filter(Boolean),
      perks: ['Industry Experience Letter', 'Live Project Telemetry', 'Potential PPO Conversion'],
      is_active: true,
      created_at: new Date().toISOString()
    };

    db.opportunities.unshift(created);
    db.persist('opportunities');
    setOpportunities([...db.opportunities]);
    setShowPostModal(false);

    showAlert({
      title: 'Internship Opportunity Posted!',
      subtitle: created.title,
      message: `Your internship posting is now active and visible across all engineering colleges, faculty placement cells, and individual students across Andhra Pradesh.`,
      type: 'success',
      badge: 'Live on AP VidyaConnect'
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-gray-200">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF3EA] text-[#0E2350] border border-[#F07421]/20 text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#F07421]" />
              <span>Statewide Internship & Skill Gateway</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#0E2350] tracking-tight">
              Corporate Internship Opportunities
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 max-w-2xl">
              Curated, verified internship openings posted directly by corporate leaders across Andhra Pradesh.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {canPostInternship && (
              <button
                onClick={() => setShowPostModal(true)}
                className="px-4 py-2.5 bg-[#F07421] hover:bg-[#D96214] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Post New Internship</span>
              </button>
            )}

            <Link
              to="/partners"
              className="px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <Building2 className="w-4 h-4 text-[#2A4E96]" />
              <span>Partner Directory</span>
            </Link>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, technology (e.g. Python, React), location, company..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E2350]/20"
              />
            </div>

            {/* Domain Filter */}
            <div className="md:col-span-3">
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E2350]/20"
              >
                <option value="all">All Tech Domains</option>
                {domains.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Mode Filter Pills */}
            <div className="md:col-span-3 flex items-center gap-1.5 overflow-x-auto">
              {['all', 'onsite', 'hybrid', 'remote'].map((m) => (
                <button
                  key={m}
                  onClick={() => setModeFilter(m)}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                    modeFilter === m
                      ? 'bg-[#0E2350] text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Opportunities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpps.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-gray-200 p-8">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#0E2350]">No opportunities match your search query</h3>
              <p className="text-xs text-gray-500 mt-1">Try resetting filters to explore all active industrial openings.</p>
              <button
                onClick={() => { setSearch(''); setModeFilter('all'); setDomainFilter('all'); }}
                className="mt-4 px-4 py-2 bg-[#0E2350] text-white rounded-xl text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredOpps.map((opp) => {
              const comp = db.companies.find(c => c.id === opp.company_id);
              return (
                <div
                  key={opp.id}
                  className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs hover:shadow-md hover:border-[#F07421]/50 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Header line: Mode + Seats + Verification */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-[#FFF3EA] text-[#F07421] px-2.5 py-1 rounded-full border border-[#F07421]/20">
                        {opp.mode} • {opp.seats} Openings
                      </span>
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> CIN Verified
                      </span>
                    </div>

                    {/* Title & Employer */}
                    <div>
                      <h3 className="text-base font-extrabold text-[#0E2350] group-hover:text-[#2A4E96] transition-colors leading-snug line-clamp-2">
                        {opp.title}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 font-semibold">
                        <Building2 className="w-3.5 h-3.5 text-[#F07421]" />
                        {comp?.name || 'Verified Industry Partner'}
                      </p>
                    </div>

                    {/* Domain & Description */}
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                      {opp.description}
                    </p>

                    {/* Specs: Location & Duration & Stipend */}
                    <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
                      <p className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#F07421] shrink-0" />
                        <span className="truncate">{opp.location}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span><strong>{opp.duration_weeks} Weeks</strong> • {opp.stipend_range}</span>
                      </p>
                    </div>

                    {/* Skills pills */}
                    {opp.skills_required && opp.skills_required.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {opp.skills_required.slice(0, 3).map((sk) => (
                          <span key={sk} className="text-[10px] bg-[#EEF2FA] text-[#0E2350] font-semibold px-2 py-0.5 rounded-md">
                            {sk}
                          </span>
                        ))}
                        {opp.skills_required.length > 3 && (
                          <span className="text-[10px] text-gray-400 self-center font-medium">
                            +{opp.skills_required.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setSelectedOpp(opp)}
                      className="w-full py-2.5 bg-gray-100 hover:bg-[#0E2350] hover:text-white text-gray-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs group-hover:bg-[#0E2350] group-hover:text-white active:scale-98"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Opportunity Details</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* MODAL 1: FULL OPPORTUNITY DETAILS */}
        {selectedOpp && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-2xl w-full border border-gray-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#FFF3EA] text-[#F07421] text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                      {selectedOpp.mode} • {selectedOpp.seats} Seats Available
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                      {selectedOpp.duration_weeks} Weeks Duration
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-[#0E2350] mt-2">{selectedOpp.title}</h2>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5 font-semibold">
                    <Building2 className="w-3.5 h-3.5 text-[#F07421]" />
                    {db.companies.find(c => c.id === selectedOpp.company_id)?.name || 'Verified Industry Partner'}
                    <span className="text-gray-300">•</span>
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {selectedOpp.location}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOpp(null)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
                <div>
                  <h4 className="font-bold text-[#0E2350] mb-1 uppercase tracking-wider text-[11px]">Role Description</h4>
                  <p>{selectedOpp.description}</p>
                </div>

                {selectedOpp.responsibilities && selectedOpp.responsibilities.length > 0 && (
                  <div>
                    <h4 className="font-bold text-[#0E2350] mb-1 uppercase tracking-wider text-[11px]">Key Responsibilities</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {selectedOpp.responsibilities.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedOpp.learning_outcomes && selectedOpp.learning_outcomes.length > 0 && (
                  <div>
                    <h4 className="font-bold text-[#0E2350] mb-1 uppercase tracking-wider text-[11px]">Learning & Development Outcomes</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {selectedOpp.learning_outcomes.map((lo, idx) => (
                        <li key={idx}>{lo}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Monthly Stipend</span>
                    <p className="font-bold text-emerald-700 mt-0.5 text-xs">{selectedOpp.stipend_range}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Eligible Degrees</span>
                    <p className="font-bold text-[#0E2350] mt-0.5 text-xs">{selectedOpp.eligible_degrees?.join(', ') || 'All Tech Degrees'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Min CGPA</span>
                    <p className="font-bold text-[#0E2350] mt-0.5 text-xs">{selectedOpp.min_cgpa} CGPA or above</p>
                  </div>
                </div>

                {selectedOpp.perks && selectedOpp.perks.length > 0 && (
                  <div>
                    <h4 className="font-bold text-[#0E2350] mb-2 uppercase tracking-wider text-[11px]">Program Perks & Benefits</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedOpp.perks.map((p, idx) => (
                        <span key={idx} className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
                <button
                  onClick={() => setSelectedOpp(null)}
                  className="px-6 py-2.5 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-xl font-bold text-xs shadow transition-all active:scale-95"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: POST NEW INTERNSHIP (FOR COMPANIES / EMPLOYERS) */}
        {canPostInternship && showPostModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-2xl w-full border border-gray-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <span className="bg-[#FFF3EA] text-[#F07421] text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                    Employer Internship Publisher
                  </span>
                  <h2 className="text-xl font-extrabold text-[#0E2350] mt-1.5">Publish New Internship Opening</h2>
                  <p className="text-xs text-gray-500">Broadcast requirements to college placement cells & AP student interns</p>
                </div>
                <button
                  onClick={() => setShowPostModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePostOpportunity} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Internship Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI/ML Engineering & Edge Analytics Intern"
                    value={newOpp.title}
                    onChange={(e) => setNewOpp({ ...newOpp, title: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E2350]/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Technical Domain *</label>
                    <select
                      value={newOpp.domain}
                      onChange={(e) => setNewOpp({ ...newOpp, domain: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E2350]/20"
                    >
                      {domains.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Work Mode *</label>
                    <select
                      value={newOpp.mode}
                      onChange={(e) => setNewOpp({ ...newOpp, mode: e.target.value as any })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E2350]/20"
                    >
                      <option value="hybrid">Hybrid (Office & Remote)</option>
                      <option value="onsite">Onsite (Host Facility)</option>
                      <option value="remote">Fully Remote</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Location / City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Visakhapatnam, AP"
                      value={newOpp.location}
                      onChange={(e) => setNewOpp({ ...newOpp, location: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E2350]/20"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Duration (Weeks) *</label>
                    <input
                      type="number"
                      required
                      min={4}
                      max={52}
                      value={newOpp.duration_weeks}
                      onChange={(e) => setNewOpp({ ...newOpp, duration_weeks: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E2350]/20"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Open Seats *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={500}
                      value={newOpp.seats}
                      onChange={(e) => setNewOpp({ ...newOpp, seats: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E2350]/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Monthly Stipend Range *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ₹15,000 - ₹20,000 / month"
                      value={newOpp.stipend_range}
                      onChange={(e) => setNewOpp({ ...newOpp, stipend_range: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E2350]/20"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Required Skills (comma-separated) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Python, React, SQL, Docker"
                      value={newOpp.skills_required}
                      onChange={(e) => setNewOpp({ ...newOpp, skills_required: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E2350]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Comprehensive Role Description *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Detail the project goals, daily duties, team structure, and technologies used..."
                    value={newOpp.description}
                    onChange={(e) => setNewOpp({ ...newOpp, description: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E2350]/20"
                  />
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPostModal(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#F07421] hover:bg-[#D96214] text-white rounded-xl font-bold shadow flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publish Opening Live</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
