import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';
import { Company } from '../../types/database';
import { PartnerCard } from '../../components/common/PartnerCard';
import { CanonicalWorkflowShowcase } from '../../components/common/CanonicalWorkflowShowcase';
import {
  Building2,
  Search,
  Filter,
  CheckCircle2,
  SlidersHorizontal,
  X,
  Sparkles,
  MapPin,
  ArrowUpDown,
  Settings,
  Plus
} from 'lucide-react';

export const PartnersPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const urlIndustry = searchParams.get('industry') || 'all';
  const urlLocation = searchParams.get('location') || 'all';

  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState(urlQuery);
  const [selectedIndustry, setSelectedIndustry] = useState(urlIndustry);
  const [selectedLocation, setSelectedLocation] = useState(urlLocation);
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'openings'>('recent');

  useEffect(() => {
    if (urlQuery) setSearchTerm(urlQuery);
    if (urlIndustry) setSelectedIndustry(urlIndustry);
    if (urlLocation) setSelectedLocation(urlLocation);
  }, [urlQuery, urlIndustry, urlLocation]);

  useEffect(() => {
    const loadCompanies = () => {
      // Only VERIFIED companies should appear publicly
      const verified = db.companies.filter((c) => c.verification_status === 'verified');
      setCompanies(verified);
      setIsLoading(false);
    };

    loadCompanies();
    const unsub = db.subscribe(loadCompanies);
    return unsub;
  }, []);

  // Collect unique industries from verified companies
  const industries = Array.from(new Set(companies.map((c) => c.industry).filter(Boolean)));

  // Collect unique city/district locations from headquarters
  const locations = Array.from(
    new Set(
      companies
        .map((c) => {
          if (!c.headquarters) return null;
          const parts = c.headquarters.split(',');
          return parts[parts.length - 2]?.trim() || parts[parts.length - 1]?.trim();
        })
        .filter(Boolean)
    )
  );

  // Filtered & Sorted list
  const filteredCompanies = companies
    .filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.sector && c.sector.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.headquarters && c.headquarters.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchIndustry = selectedIndustry === 'all' || c.industry === selectedIndustry;

      const matchLocation =
        selectedLocation === 'all' ||
        (c.headquarters && c.headquarters.toLowerCase().includes(selectedLocation.toLowerCase()));

      return matchSearch && matchIndustry && matchLocation;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'openings') {
        const countA = db.opportunities.filter((o) => o.company_id === a.id && o.status === 'active').length;
        const countB = db.opportunities.filter((o) => o.company_id === b.id && o.status === 'active').length;
        return countB - countA;
      }
      // 'recent' by default (created_at desc)
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedIndustry('all');
    setSelectedLocation('all');
    setSortBy('recent');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 bg-[#FFF3EA] border border-[#F07421]/30 text-[#0E2350] px-4 py-1.5 rounded-full text-xs font-bold">
          <Sparkles className="w-4 h-4 text-[#F07421]" />
          <span>Centralized Industry-Academia Ecosystem</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0E2350] tracking-tight">
          Verified Industry Partners
        </h1>

        <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-normal">
          Accredited corporate enterprises, technology leaders, and MSMEs collaborating with higher education institutions to deliver structured, NEP 2020 aligned student internship programs across Andhra Pradesh.
        </p>

        {currentUser?.role === 'super_admin' && (
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              to="/admin/companies"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0E2350] text-[#FFE5D3] hover:bg-[#183B82] rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Settings className="w-4 h-4 text-[#F07421]" />
              <span>State Super Admin: Manage Partners & Companies (Add, Edit, Delete)</span>
            </Link>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E3E6EB] p-4 sm:p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search partner by name or domain..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#F6F7F9] border border-[#E3E6EB] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0E2350]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Industry Dropdown */}
          <div>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#F6F7F9] border border-[#E3E6EB] rounded-xl text-xs font-medium text-[#0E2350] focus:outline-none focus:ring-2 focus:ring-[#0E2350]"
            >
              <option value="all">All Industries & Sectors ({companies.length})</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          {/* Location Dropdown */}
          <div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#F6F7F9] border border-[#E3E6EB] rounded-xl text-xs font-medium text-[#0E2350] focus:outline-none focus:ring-2 focus:ring-[#0E2350]"
            >
              <option value="all">All Locations / Districts</option>
              {locations.map((loc) => (
                <option key={loc} value={loc as string}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-[#F6F7F9] border border-[#E3E6EB] rounded-xl text-xs font-medium text-[#0E2350] focus:outline-none focus:ring-2 focus:ring-[#0E2350]"
            >
              <option value="recent">Sort by: Recently Verified</option>
              <option value="name">Sort by: Name (A to Z)</option>
              <option value="openings">Sort by: Most Opportunities</option>
            </select>
          </div>
        </div>

        {/* Results Counter & Active Filters Tag Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs">
          <div className="text-gray-500 font-medium flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-[#F07421]" />
            <span>
              Showing <strong>{filteredCompanies.length}</strong> of <strong>{companies.length}</strong> Verified Partners
            </span>
          </div>

          {(searchTerm || selectedIndustry !== 'all' || selectedLocation !== 'all') && (
            <button
              onClick={resetFilters}
              className="text-[#F07421] hover:underline font-bold text-xs flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Grid of Partner Cards */}
      {isLoading ? (
        /* Skeleton Loading State */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E3E6EB] p-4 h-64 animate-pulse space-y-3">
              <div className="h-16 bg-gray-200 rounded-lg w-full" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-2/3" />
                <div className="h-5 bg-gray-200 rounded-full w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : companies.length === 0 ? (
        /* Empty State: No Verified Companies in Database */
        <div className="bg-white rounded-2xl border border-[#E3E6EB] p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-[#EEF2FA] rounded-2xl flex items-center justify-center mx-auto text-[#0E2350]">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#0E2350]">No verified industry partners yet.</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Verified companies will appear here as they join the AP VidyaConnect network.
          </p>
        </div>
      ) : filteredCompanies.length === 0 ? (
        /* Empty State: Filter mismatch */
        <div className="bg-white rounded-2xl border border-[#E3E6EB] p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
            <Filter className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#0E2350]">No partners matched your filters</h3>
          <p className="text-xs text-gray-500">
            Try adjusting your search keywords or resetting the industry and location filters.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-[#0E2350] hover:bg-[#14336F] text-white text-xs font-bold rounded-lg transition-all"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {filteredCompanies.map((company) => (
            <PartnerCard key={company.id} company={company} />
          ))}
        </div>
      )}

      {/* CANONICAL WORKFLOW TIMELINE */}
      <div className="pt-6 border-t border-gray-100">
        <CanonicalWorkflowShowcase />
      </div>
    </div>
  );
};
