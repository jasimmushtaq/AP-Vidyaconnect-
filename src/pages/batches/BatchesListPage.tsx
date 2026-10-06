// ============================================================================
// AP VIDYACONNECT — BATCHES LIST PAGE
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { InternshipBatch } from '../../types/database';
import {
  Briefcase,
  Building2,
  School,
  Users,
  Calendar,
  ArrowRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const BatchesListPage: React.FC = () => {
  const { currentRole, currentUser, currentInstitution, currentCompany } = useAuth();
  const [batches, setBatches] = useState<InternshipBatch[]>(db.batches);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'created' | 'active' | 'completed'>('all');

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setBatches([...db.batches]);
    });
    return unsub;
  }, []);

  const isMentor = currentRole === 'mentor';
  const mentorId = db.mentors.find(
    m => m.email.toLowerCase() === currentUser.email.toLowerCase() || m.user_id === currentUser.id
  )?.id;

  const myInstId = currentInstitution?.id || currentUser.institution_id;
  const myCompId = currentCompany?.id || currentUser.company_id;

  const scopedBatches = useMemo(() => {
    if (currentRole === 'super_admin') {
      return batches;
    }
    if (currentRole === 'institution_admin' || currentRole === 'faculty_coordinator') {
      if (!myInstId) return [];
      return batches.filter(b => b.institution_id === myInstId);
    }
    if (currentRole === 'company_admin') {
      if (!myCompId) return [];
      return batches.filter(b => b.company_id === myCompId);
    }
    if (isMentor) {
      return batches.filter(
        b =>
          b.mentor_id === mentorId ||
          (mentorId && b.mentor?.id === mentorId) ||
          (myCompId && b.company_id === myCompId)
      );
    }
    if (currentRole === 'student') {
      const studentId = currentUser.student_id;
      return batches.filter(b =>
        (b.students || []).some(
          s => s.student?.id === studentId || s.student?.email?.toLowerCase() === currentUser.email?.toLowerCase()
        )
      );
    }
    return batches;
  }, [batches, currentRole, myInstId, myCompId, isMentor, mentorId, currentUser]);

  const filteredBatches = scopedBatches.filter(b => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.batch_code.toLowerCase().includes(search.toLowerCase()) ||
      b.company?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.institution?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.mentor?.full_name?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    return true;
  });

  const totalInterns = scopedBatches.reduce((acc, curr) => acc + (curr.students?.length || 0), 0);
  const activeBatchesCount = scopedBatches.filter(b => b.status === 'active').length;
  const uniqueCompanies = new Set(scopedBatches.map(b => b.company?.name).filter(Boolean)).size;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* 1. TOP HERO COMMAND BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A1938] via-[#0E2350] to-[#163673] border border-blue-900/40 p-6 sm:p-8 shadow-xl text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-mono font-bold tracking-wide flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-300" />
                KD-2026-ACTIVE
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                State-Chartered Active Cohorts
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {isMentor ? 'My Assigned Mentorship Batches' : 'Internship Batches & Cohort Registry'}
            </h1>

            <p className="text-xs text-blue-200/90 max-w-3xl leading-relaxed">
              {isMentor
                ? 'Active internship cohorts assigned to you for mentorship, GPS attendance tracking, milestone evaluation, and grading.'
                : 'Active industry cohorts created via institutional final acceptance with generated canonical IDs (KD-YYYY-...), live attendance geofencing, and verified mentorship.'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME KPI RIBBON */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Batches</span>
          <p className="text-3xl font-black text-[#0E2350] mt-1 font-mono">{scopedBatches.length}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">State charted cohorts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Confirmed Interns</span>
          <p className="text-3xl font-black text-[#1C8A3C] mt-1 font-mono">{totalInterns}</p>
          <p className="text-[11px] text-emerald-700 font-bold mt-1">Placed & verified students</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Active Batches</span>
          <p className="text-3xl font-black text-[#2A4E96] mt-1 font-mono">{activeBatchesCount}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Currently in session</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Partner Corporates</span>
          <p className="text-3xl font-black text-[#F07421] mt-1 font-mono">{uniqueCompanies}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Host industry partners</p>
        </div>
      </div>

      {/* 3. SEARCH & FILTER TOOLBAR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cohort title, code, company, mentor..."
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0E2350] focus:bg-white text-slate-800 transition-all"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold w-full sm:w-auto overflow-x-auto">
          {(['all', 'created', 'active', 'completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg capitalize transition-all shrink-0 ${
                statusFilter === st
                  ? 'bg-[#0E2350] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#0E2350]'
              }`}
            >
              {st === 'all' ? `All (${scopedBatches.length})` : st}
            </button>
          ))}
        </div>
      </div>

      {/* 4. COHORT CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredBatches.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md hover:border-[#2A4E96]/50 transition-all flex flex-col justify-between space-y-5 group"
          >
            <div className="space-y-3.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono font-black text-[#0E2350] bg-blue-50 border border-blue-200/60 px-2.5 py-1 rounded-md tracking-wider">
                    {b.batch_code}
                  </span>
                  <h3 className="text-base font-black text-[#0E2350] mt-2 group-hover:text-[#2A4E96] transition-colors leading-snug">
                    {b.title}
                  </h3>
                </div>
                <StatusBadge status={b.status} size="sm" />
              </div>

              <div className="space-y-2 text-xs text-slate-600 font-medium">
                <p className="flex items-center gap-2.5">
                  <School className="w-4 h-4 text-[#2A4E96] shrink-0" />
                  <span className="font-bold text-slate-800">{b.institution?.name}</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-[#F07421] shrink-0" />
                  <span>
                    <strong>{b.company?.name}</strong> • {b.location}
                  </span>
                </p>
                <p className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-[#1C8A3C] shrink-0" />
                  <span>
                    Mentor: <strong className="text-slate-800">{b.mentor?.full_name}</strong> ({b.mentor?.designation})
                  </span>
                </p>
                <p className="flex items-center gap-2.5 text-slate-500 font-mono text-[11px]">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{b.start_date} to {b.end_date} • Stipend: ₹{b.stipend_amount?.toLocaleString()}/mo</span>
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5 overflow-hidden">
                  {(b.students || []).slice(0, 3).map((st, i) => (
                    <div
                      key={i}
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-[#0E2350] text-[#F07421] text-[9px] font-black flex items-center justify-center"
                    >
                      {st.student?.full_name?.charAt(0) || 'S'}
                    </div>
                  ))}
                </div>
                <span className="text-slate-600 font-bold text-xs">
                  {b.students?.length || 0} Confirmed Interns
                </span>
              </div>

              <Link
                to={`/batches/${b.id}`}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-200 hover:border-emerald-600 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 group/btn shadow-2xs active:scale-95"
              >
                <span>Manage Cohort</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        ))}

        {filteredBatches.length === 0 && (
          <div className="col-span-2 bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No internship batches found</h4>
            <p className="text-xs text-slate-500">
              Batches are created automatically once bilateral proposal terms are accepted.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
