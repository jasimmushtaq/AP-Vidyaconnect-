// ============================================================================
// AP VIDYACONNECT — INSTITUTIONAL NETWORK DIRECTORY
// Public Showcase of Verified Universities, Engineering & Degree Colleges in AP
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';
import { Institution } from '../../types/database';
import {
  School,
  Search,
  MapPin,
  ShieldCheck,
  Building2,
  GraduationCap,
  Users,
  Award,
  Sparkles,
  ExternalLink,
  Filter,
  CheckCircle2,
  ArrowRight,
  BookOpen
} from 'lucide-react';

export const InstitutionalNetworkPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentRole } = useAuth();
  const [institutions, setInstitutions] = useState<Institution[]>(db.institutions);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    setInstitutions([...db.institutions]);
    const unsub = db.subscribe(() => {
      setInstitutions([...db.institutions]);
    });
    return unsub;
  }, []);

  const filteredInstitutions = institutions.filter((inst) => {
    const q = search.toLowerCase();
    const matchesSearch =
      inst.name.toLowerCase().includes(q) ||
      inst.code.toLowerCase().includes(q) ||
      (inst.aishe_code && inst.aishe_code.toLowerCase().includes(q)) ||
      (inst.city && inst.city.toLowerCase().includes(q)) ||
      (inst.district && inst.district.toLowerCase().includes(q));

    const matchesDistrict = districtFilter === 'all' || (inst.district && inst.district.toLowerCase() === districtFilter.toLowerCase()) || (inst.city && inst.city.toLowerCase().includes(districtFilter.toLowerCase()));
    const matchesType = typeFilter === 'all' || (inst.type && inst.type.toLowerCase().includes(typeFilter.toLowerCase()));

    return matchesSearch && matchesDistrict && matchesType;
  });

  const districts = ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Kakinada', 'Anantapur', 'Kurnool'];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Hero */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF2FA] text-[#0E2350] text-xs font-bold border border-[#2A4E96]/20">
              <School className="w-3.5 h-3.5 text-[#2A4E96]" />
              <span>Higher Education Institutional Network</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#0E2350] tracking-tight">
              State Accredited Colleges & Universities
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 max-w-2xl">
              Explore recognized engineering institutes, autonomous polytechnics, and premier state universities actively partnering with industry leaders across Andhra Pradesh.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/register"
              className="px-4 py-2.5 bg-[#0E2350] hover:bg-[#14336F] text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <School className="w-4 h-4 text-[#F07421]" />
              <span>Register College</span>
            </Link>
            <Link
              to="/opportunities"
              className="px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <span>View Openings</span>
              <ArrowRight className="w-4 h-4 text-gray-500" />
            </Link>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search college by name, AISHE code, institution code, district..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E2350]/20"
              />
            </div>

            {/* District Filter */}
            <div className="md:col-span-3">
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E2350]/20"
              >
                <option value="all">All AP Districts</option>
                {districts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="md:col-span-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E2350]/20"
              >
                <option value="all">All Institution Types</option>
                <option value="engineering">Engineering & Technology</option>
                <option value="university">State / Deemed University</option>
                <option value="autonomous">Autonomous Institutes</option>
                <option value="polytechnic">Polytechnic / Diploma</option>
                <option value="degree">Arts, Science & Commerce</option>
              </select>
            </div>
          </div>
        </div>

        {/* Institutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstitutions.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-gray-200 p-8">
              <School className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#0E2350]">No colleges match your filter criteria</h3>
              <p className="text-xs text-gray-500 mt-1">Try resetting search filters to explore all accredited institutions.</p>
              <button
                onClick={() => { setSearch(''); setDistrictFilter('all'); setTypeFilter('all'); }}
                className="mt-4 px-4 py-2 bg-[#0E2350] text-white rounded-xl text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredInstitutions.map((inst) => (
              <div
                key={inst.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-[#2A4E96]/50"
              >
                <div className="space-y-3">
                  {/* Top Bar: Icon + Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0E2350] to-[#1E4D94] text-white flex items-center justify-center font-black text-sm shadow-2xs">
                      {inst.name.charAt(0)}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      AISHE Verified
                    </span>
                  </div>

                  {/* Institution Details */}
                  <div>
                    <h3 className="text-sm font-bold text-[#0E2350] group-hover:text-[#2A4E96] transition-colors leading-snug line-clamp-2">
                      {inst.name}
                    </h3>
                    <p className="text-[11px] text-gray-500 font-mono mt-0.5">Code: {inst.code} {inst.aishe_code ? `• AISHE: ${inst.aishe_code}` : ''}</p>
                  </div>

                  {/* Location & Affiliation */}
                  <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#F07421] shrink-0" />
                      <span>{inst.city || 'Andhra Pradesh'}, {inst.district || 'AP'}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Type: <strong className="text-gray-800 uppercase">{inst.type || 'College'}</strong></span>
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-gray-500">
                    Host Partner
                  </span>

                  {currentRole === 'company_admin' ? (
                    <Link
                      to={`/proposals/new?institutionId=${inst.id}`}
                      className="px-3 py-1.5 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <span>Propose Batch</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <Link
                      to="/opportunities"
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <span>View Openings</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
