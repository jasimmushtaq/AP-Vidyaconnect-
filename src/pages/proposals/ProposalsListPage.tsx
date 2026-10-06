// ============================================================================
// AP VIDYACONNECT — INTERNSHIP PROPOSALS MANAGEMENT
// Ultra-Modern State-of-the-Art Bilateral Proposal Hub & Candidate Nomination Center
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { InternshipProposal, ProposalStatus } from '../../types/database';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Building2,
  School,
  ArrowRight,
  Calendar,
  Users,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  ChevronRight,
  X,
  AlertCircle,
  Coins
} from 'lucide-react';

export const ProposalsListPage: React.FC = () => {
  const { currentRole, currentInstitution, currentCompany, currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || searchParams.get('status') || 'all';

  const [proposals, setProposals] = useState<InternshipProposal[]>(db.proposals);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter);

  useEffect(() => {
    const filterFromUrl = searchParams.get('filter') || searchParams.get('status');
    if (filterFromUrl) {
      setStatusFilter(filterFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setProposals([...db.proposals]);
    });
    return unsub;
  }, []);

  const handleFilterChange = (st: string) => {
    setStatusFilter(st);
    if (st === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ filter: st });
    }
  };

  const instId = currentInstitution?.id || currentUser.institution_id;
  const compId = currentCompany?.id || currentUser.company_id;

  // Role Scoped Proposals strictly
  const scopedProposals = useMemo(() => {
    if (currentRole === 'institution_admin' || currentRole === 'faculty_coordinator') {
      if (!instId) return [];
      return proposals.filter(p => p.institution_id === instId);
    }
    if (currentRole === 'company_admin') {
      if (!compId) return [];
      return proposals.filter(p => p.company_id === compId);
    }
    return proposals;
  }, [proposals, currentRole, instId, compId]);

  // Real-Time Counters
  const submittedCount = useMemo(
    () => scopedProposals.filter(p => p.status === 'submitted' || p.status === 'under_company_review').length,
    [scopedProposals]
  );
  const acceptedCount = useMemo(
    () => scopedProposals.filter(p => p.status === 'company_accepted' || p.status === 'company_accepted_with_changes').length,
    [scopedProposals]
  );
  const finalizedCount = useMemo(
    () => scopedProposals.filter(p => p.status === 'institution_accepted').length,
    [scopedProposals]
  );

  // Filtered List
  const filteredProposals = useMemo(() => {
    return scopedProposals.filter((p) => {
      const matchesSearch =
        p.domain.toLowerCase().includes(search.toLowerCase()) ||
        p.proposal_code.toLowerCase().includes(search.toLowerCase()) ||
        (p.company?.name && p.company.name.toLowerCase().includes(search.toLowerCase())) ||
        (p.institution?.name && p.institution.name.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' ||
        p.status === statusFilter ||
        (statusFilter === 'submitted' && (p.status === 'submitted' || p.status === 'under_company_review')) ||
        (statusFilter === 'company_accepted' && (p.status === 'company_accepted' || p.status === 'company_accepted_with_changes')) ||
        (statusFilter === 'decision' && (
          p.status === 'company_accepted' ||
          p.status === 'company_accepted_with_changes' ||
          p.status === 'modification_requested' ||
          p.status === 'submitted'
        ));

      return matchesSearch && matchesStatus;
    });
  }, [scopedProposals, search, statusFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* 1. TOP HERO COMMAND BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A1938] via-[#0E2350] to-[#163673] border border-blue-900/40 p-6 sm:p-8 shadow-xl text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-mono font-bold tracking-wide flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-300" />
                Institutional Proposal Hub
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                State-Accredited Bilateral Contracts
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Internship Proposals & Nominations
            </h1>

            <p className="text-xs text-blue-200/90 max-w-3xl leading-relaxed">
              Two-sided institutional internship nominations with versioned curriculum objectives, stipend negotiations, and state-chartered batch creation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {(currentRole === 'institution_admin' || currentRole === 'faculty_coordinator') && (
              <Link
                to="/proposals/new"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F07421] to-orange-600 hover:from-[#D96214] hover:to-[#C55005] text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-2 transform active:scale-95"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>+ Create New Proposal</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME STATS RIBBON */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Proposals</span>
            <p className="text-2xl sm:text-3xl font-black text-[#0E2350] mt-1 font-mono">{scopedProposals.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0E2350] flex items-center justify-center border border-blue-100">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Under Corporate Review</span>
            <p className="text-2xl sm:text-3xl font-black text-[#F07421] mt-1 font-mono">{submittedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#F07421] flex items-center justify-center border border-orange-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company Accepted</span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1 font-mono">{acceptedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chartered Batches</span>
            <p className="text-2xl sm:text-3xl font-black text-indigo-700 mt-1 font-mono">{finalizedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. CONTROL & SEARCH BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search domain, code, company, college..."
            className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0E2350] focus:bg-white transition-all text-slate-800"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Navigation Chips */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />

          <button
            onClick={() => handleFilterChange('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              statusFilter === 'all'
                ? 'bg-[#0E2350] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Proposals ({scopedProposals.length})
          </button>

          <button
            onClick={() => handleFilterChange('submitted')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
              statusFilter === 'submitted'
                ? 'bg-[#0E2350] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Under Review ({submittedCount})
          </button>

          <button
            onClick={() => handleFilterChange('company_accepted')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
              statusFilter === 'company_accepted'
                ? 'bg-[#0E2350] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Company Accepted ({acceptedCount})
          </button>

          <button
            onClick={() => handleFilterChange('institution_accepted')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
              statusFilter === 'institution_accepted'
                ? 'bg-[#0E2350] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Finalized ({finalizedCount})
          </button>
        </div>
      </div>

      {/* 4. PROPOSALS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredProposals.length === 0 ? (
          <div className="col-span-2 bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm space-y-3">
            <FileText className="w-10 h-10 mx-auto text-slate-300" />
            <h3 className="text-sm font-extrabold text-[#0E2350]">No Proposals Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No proposal records match your current filter or search criteria.
            </p>
            <button
              onClick={() => {
                setSearch('');
                handleFilterChange('all');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredProposals.map((p) => {
            const isCompanyAccepted =
              p.status === 'company_accepted' || p.status === 'company_accepted_with_changes';
            const isFinalized = p.status === 'institution_accepted';
            const isUnderReview = p.status === 'submitted' || p.status === 'under_company_review';

            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                  isCompanyAccepted
                    ? 'border-emerald-300 ring-1 ring-emerald-400/30'
                    : isFinalized
                    ? 'border-blue-200/80'
                    : 'border-slate-200/80 hover:border-[#2A4E96]/40'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Proposal Top Monospace Code & Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold text-[#0E2350] bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md shadow-2xs">
                        {p.proposal_code}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 font-mono">v{p.version}</span>
                    </div>
                    <StatusBadge status={p.status} size="sm" />
                  </div>

                  {/* Domain Title */}
                  <div>
                    <h3 className="text-base font-extrabold text-[#0E2350] tracking-tight">{p.domain}</h3>
                    <p className="text-[11px] text-slate-500 font-medium capitalize mt-0.5">
                      {p.internship_type || 'Full-time Industry Immersion'}
                    </p>
                  </div>

                  {/* Organization Tags */}
                  <div className="p-3 bg-slate-50/70 border border-slate-200/60 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <School className="w-3.5 h-3.5 text-[#2A4E96] shrink-0" />
                      <span className="truncate">{p.institution?.name || 'Academic Institution'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-[#F07421] shrink-0" />
                      <span className="truncate font-semibold text-[#0E2350]">{p.company?.name || 'Corporate Partner'}</span>
                    </div>
                  </div>

                  {/* Metadata Chips Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-emerald-50/60 border border-emerald-200/60 p-2.5 rounded-xl flex items-center gap-2">
                      <Coins className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <div>
                        <span className="text-[9px] font-bold text-emerald-800 uppercase block">Stipend</span>
                        <span className="font-extrabold text-emerald-900 font-mono">
                          ₹{p.stipend_requested?.toLocaleString()}/mo
                        </span>
                      </div>
                    </div>

                    <div className="bg-blue-50/60 border border-blue-200/60 p-2.5 rounded-xl flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#2A4E96] shrink-0" />
                      <div>
                        <span className="text-[9px] font-bold text-[#2A4E96] uppercase block">Duration</span>
                        <span className="font-bold text-[#0E2350]">
                          {p.duration_weeks} Wks • {p.mode}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Special Decision Alert Callout */}
                  {isCompanyAccepted && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Company Accepted Terms
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 uppercase">Decision Required</span>
                      </div>
                      <p className="text-[11px] text-emerald-800">
                        Corporate terms confirmed. Ready to final accept & generate active internship batch.
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600 flex items-center gap-1.5 font-semibold">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{p.students?.length || 0} Candidates Nominated</span>
                  </span>

                  {isCompanyAccepted ? (
                    <Link
                      to="/proposals/decisions"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 text-white font-extrabold text-xs shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <span>Accept / Reject Terms</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <Link
                      to={`/proposals/${p.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#0E2350] text-[#0E2350] hover:text-white font-bold text-xs transition-all flex items-center gap-1"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
