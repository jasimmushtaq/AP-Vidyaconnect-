// ============================================================================
// AP VIDYACONNECT — MOU LIST & PARTNERSHIP AGREEMENT DIRECTORY
// Complete Management Hub for Institutional-Industry Bilateral MoUs
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';
import { MoUAgreement, MoUStatus } from '../../types/database';
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Building2,
  School,
  Printer,
  Eye,
  PenTool,
  Send,
  ShieldCheck,
  Sparkles,
  Calendar,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const MoUListPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, currentRole, currentCompany, currentInstitution } = useAuth();
  const [mous, setMous] = useState<MoUAgreement[]>(db.mous);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setMous([...db.mous]);
    });
    return unsub;
  }, []);

  // Filter based on logged-in context
  const contextMous = useMemo(() => {
    if (currentRole === 'company_admin' || currentRole === 'mentor') {
      const compId = currentCompany?.id || currentUser.company_id;
      return mous.filter((m) => !compId || m.company_id === compId);
    }
    if (currentRole === 'institution_admin' || currentRole === 'faculty_coordinator') {
      const instId = currentInstitution?.id || currentUser.institution_id;
      return mous.filter((m) => !instId || m.institution_id === instId);
    }
    return mous; // Super Admin sees all state-wide MoUs
  }, [mous, currentRole, currentCompany, currentInstitution, currentUser]);

  // Status and search filtering
  const filteredMous = useMemo(() => {
    return contextMous.filter((m) => {
      const matchesSearch =
        m.first_party_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.second_party_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.mou_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.company_specialization.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'all') return true;
      if (statusFilter === 'active') return m.status === 'active';
      if (statusFilter === 'pending')
        return (
          m.status === 'sent_to_college' ||
          m.status === 'college_accepted' ||
          m.status === 'company_signed' ||
          m.status === 'college_signed'
        );
      if (statusFilter === 'changes_requested') return m.status === 'changes_requested';
      if (statusFilter === 'draft') return m.status === 'draft';
      return true;
    });
  }, [contextMous, searchQuery, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: contextMous.length,
      active: contextMous.filter((m) => m.status === 'active').length,
      pendingReview: contextMous.filter(
        (m) =>
          m.status === 'sent_to_college' ||
          m.status === 'college_accepted' ||
          m.status === 'company_signed' ||
          m.status === 'college_signed'
      ).length,
      changesRequested: contextMous.filter((m) => m.status === 'changes_requested').length
    };
  }, [contextMous]);

  const getStatusBadge = (status: MoUStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active MoU
          </span>
        );
      case 'sent_to_college':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-blue-600" /> Sent (Reviewing)
          </span>
        );
      case 'changes_requested':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> Changes Requested
          </span>
        );
      case 'college_accepted':
      case 'company_signed':
      case 'college_signed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-300 px-2.5 py-0.5 rounded-full">
            <PenTool className="w-3 h-3 text-purple-600" /> Ready to Sign
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-red-100 text-red-900 border border-red-300 px-2.5 py-0.5 rounded-full">
            <XCircle className="w-3 h-3 text-red-600" /> Declined
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-gray-100 text-gray-800 border border-gray-300 px-2.5 py-0.5 rounded-full">
            <FileText className="w-3 h-3 text-gray-500" /> Draft
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-[#0E2350] via-[#14336F] to-[#1c4596] rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#F07421] font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              Andhra Pradesh Higher Education Council (APSCHE)
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Institutional MoU Agreements
            </h1>
            <p className="text-xs text-[#DCE5F5]/80 max-w-2xl leading-relaxed">
              Legally binding bilateral Memorandums of Understanding between Higher Educational Institutions and Verified Industry Partners for internship cohorts, guest lectures, placements, and campus tech centers.
            </p>
          </div>

          {currentRole === 'company_admin' && (
            <button
              onClick={() => navigate('/mous/new')}
              className="px-6 py-3 bg-gradient-to-r from-[#F07421] to-[#d65f10] hover:from-[#d65f10] hover:to-[#F07421] text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-900/30 flex items-center gap-2 self-start md:self-center transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" /> Create New MoU
            </button>
          )}
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total MoUs</p>
              <p className="text-2xl font-black text-gray-900">{stats.total}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Active (Fully Signed)</p>
              <p className="text-2xl font-black text-emerald-600">{stats.active}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Pending Review / Sign</p>
              <p className="text-2xl font-black text-amber-600">{stats.pendingReview}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Changes Requested</p>
              <p className="text-2xl font-black text-purple-600">{stats.changesRequested}</p>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {[
              { key: 'all', label: `All MoUs (${stats.total})` },
              { key: 'active', label: `Active (${stats.active})` },
              { key: 'pending', label: `In Progress (${stats.pendingReview})` },
              { key: 'changes_requested', label: `Changes Requested (${stats.changesRequested})` }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === tab.key
                    ? 'bg-[#0E2350] text-white shadow-sm'
                    : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by college, company, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* MoU Agreements List Cards */}
        {filteredMous.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center space-y-4 border border-gray-200 shadow-sm">
            <FileText className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-800">No MoU Agreements Found</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              No MoU records matching the active filters. Click &quot;Create New MoU&quot; to initiate a partnership agreement with an educational institution.
            </p>
            {(currentRole === 'company_admin' || currentRole === 'super_admin') && (
              <button
                onClick={() => navigate('/mous/new')}
                className="px-5 py-2 bg-[#0E2350] hover:bg-[#14336F] text-white text-xs font-bold rounded-xl shadow transition-all"
              >
                Create New MoU Now
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMous.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-2xl p-6 border border-gray-200/80 hover:border-blue-300 hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                      {m.mou_code}
                    </span>
                    {getStatusBadge(m.status)}
                    {m.email_sent && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <Send className="w-3 h-3 text-emerald-600" /> Email Sent
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        First Party (College / Institution)
                      </span>
                      <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                        <School className="w-4 h-4 text-blue-600 shrink-0" />
                        {m.first_party_name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Signatory: {m.first_party_rep_name} ({m.first_party_rep_title})
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        Second Party (Industry / Company)
                      </span>
                      <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-[#F07421] shrink-0" />
                        {m.second_party_name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Signatory: {m.second_party_rep_name} ({m.second_party_rep_title})
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-gray-500 pt-1">
                    <span>
                      Effective: <strong>{m.effective_day} {m.effective_month} {m.effective_year}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Validity: <strong>{m.validity_years} Years</strong>
                    </span>
                    <span>•</span>
                    <span className="truncate max-w-md">
                      Specialization: <strong>{m.company_specialization}</strong>
                    </span>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex flex-wrap lg:flex-col items-stretch justify-center gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                  <Link
                    to={`/mous/${m.id}`}
                    className="px-5 py-2.5 bg-[#0E2350] hover:bg-[#14336F] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                  >
                    <Eye className="w-4 h-4" /> View &amp; Review MoU
                  </Link>

                  {m.status === 'active' && (
                    <button
                      onClick={() => navigate(`/mous/${m.id}?print=true`)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
