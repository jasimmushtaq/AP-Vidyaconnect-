// ============================================================================
// AP VIDYACONNECT — COMPANY ADMIN & MENTOR DASHBOARD
// Ultra-Modern Real-Time Command Center with Live Cohort Analytics
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  Building2,
  FileText,
  Briefcase,
  Users,
  CalendarCheck,
  Award,
  ArrowRight,
  Clock,
  ShieldCheck,
  Sparkles,
  Plus,
  MapPin,
  Play,
  Mail,
  CheckCircle2,
  RefreshCw,
  Eye,
  School,
  X,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  Flame,
  CheckCircle,
  PenTool
} from 'lucide-react';
import { BatchActivationModal } from '../../components/batches/BatchActivationModal';
import { BatchActivationProgressModal } from '../../components/batches/BatchActivationProgressModal';
import { BatchActivationService, ActivationProgressUpdate } from '../../services/batchActivationService';
import { InternshipBatch, MoUAgreement } from '../../types/database';

export const CompanyDashboard: React.FC = () => {
  const { currentCompany, currentUser } = useAuth();
  const [proposals, setProposals] = useState(db.proposals);
  const [batches, setBatches] = useState(db.batches);
  const [opportunities, setOpportunities] = useState(db.opportunities);
  const [mentors, setMentors] = useState(db.mentors);
  const [emailLogs, setEmailLogs] = useState(db.emailLogs);
  const [attendance, setAttendance] = useState(db.attendance);
  const [mous, setMous] = useState<MoUAgreement[]>(db.mous);

  // Activation & Modal States
  const [batchToActivate, setBatchToActivate] = useState<InternshipBatch | null>(null);
  const [activationProgress, setActivationProgress] = useState<ActivationProgressUpdate | null>(null);
  const [batchForStudents, setBatchForStudents] = useState<InternshipBatch | null>(null);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setProposals([...db.proposals]);
      setBatches([...db.batches]);
      setOpportunities([...db.opportunities]);
      setMentors([...db.mentors]);
      setAttendance([...db.attendance]);
      setEmailLogs([...db.emailLogs]);
      setMous([...db.mous]);
    });
    return unsub;
  }, []);

  const handleStartActivation = async () => {
    if (!batchToActivate) return;
    const targetBatch = batchToActivate;
    setBatchToActivate(null);

    try {
      await BatchActivationService.activateBatch(
        targetBatch,
        currentUser,
        (prog) => {
          setActivationProgress({ ...prog });
        }
      );
    } catch (err) {
      console.error('Batch activation error:', err);
    }
  };

  const companyId = currentCompany?.id || currentUser.company_id;

  // 1. Live Filtered Data for this Company strictly
  const companyBatches = useMemo(() => {
    if (!companyId) return [];
    return batches.filter(b => b.company_id === companyId);
  }, [batches, companyId]);

  const activeBatches = useMemo(() => {
    return companyBatches.filter(b => b.status === 'active' || b.status === 'created');
  }, [companyBatches]);

  const companyProposals = useMemo(() => {
    if (!companyId) return [];
    return proposals.filter(p => p.company_id === companyId);
  }, [proposals, companyId]);

  const inboundProposals = useMemo(() => {
    return companyProposals.filter(p => p.status === 'submitted' || p.status === 'under_company_review');
  }, [companyProposals]);

  const companyMous = useMemo(() => {
    if (!companyId) return [];
    return mous.filter(m => m.company_id === companyId);
  }, [mous, companyId]);

  const activeMous = useMemo(() => {
    return companyMous.filter(m => m.status === 'active');
  }, [companyMous]);

  const totalInterns = useMemo(() => {
    return companyBatches.flatMap(b => b.students || []).length;
  }, [companyBatches]);

  const companyBatchIds = useMemo(() => new Set(companyBatches.map(b => b.id)), [companyBatches]);
  const companyAttendance = useMemo(() => {
    return attendance.filter(a => (a.batch_id ? companyBatchIds.has(a.batch_id) : false) || (a.internship_batch_id ? companyBatchIds.has(a.internship_batch_id) : false));
  }, [attendance, companyBatchIds]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = useMemo(() => {
    return companyAttendance.filter(a => a.date === todayStr);
  }, [companyAttendance, todayStr]);

  const companyOpps = useMemo(() => {
    if (!companyId) return [];
    return opportunities.filter(o => o.company_id === companyId);
  }, [opportunities, companyId]);

  // 2. Real-Time Proposal Status Donut Chart Data
  const proposalPieData = useMemo(() => {
    const underReview = companyProposals.filter(p => p.status === 'submitted' || p.status === 'under_company_review').length;
    const accepted = companyProposals.filter(p => p.status === 'company_accepted' || p.status === 'company_accepted_with_changes' || p.status === 'institution_accepted').length;
    const active = companyBatches.filter(b => b.status === 'active').length;
    const completed = companyBatches.filter(b => b.status === 'completed').length;

    const data = [
      { name: 'Pending Review', value: underReview, color: '#F07421' },
      { name: 'Terms Accepted', value: accepted, color: '#2A4E96' },
      { name: 'Active Cohorts', value: active, color: '#10B981' },
      { name: 'Completed', value: completed, color: '#8B5CF6' }
    ];

    const activeItems = data.filter(d => d.value > 0);
    if (activeItems.length === 0) {
      return [{ name: 'No Active Proposals', value: 1, color: '#CBD5E1' }];
    }
    return activeItems;
  }, [companyProposals, companyBatches]);

  // 3. Real-Time Cohort Attendance & 75% Rule Compliance Bar Chart
  const batchAttendanceBarData = useMemo(() => {
    if (activeBatches.length === 0) {
      return [];
    }

    return activeBatches.slice(0, 5).map(b => {
      const batchRecs = companyAttendance.filter(a => a.batch_id === b.id || a.internship_batch_id === b.id);
      const presCount = batchRecs.filter(a => a.status === 'present').length;
      const totCount = batchRecs.length;

      const avgRate = totCount > 0 ? Math.round((presCount / totCount) * 100) : 100;
      const compRate = avgRate >= 75 ? 100 : Math.round((avgRate / 75) * 100);
      const label = b.title.length > 15 ? b.title.substring(0, 15) + '...' : b.title;

      return {
        name: label,
        batchCode: b.batch_code,
        avgAttendance: avgRate,
        compliantPct: compRate
      };
    });
  }, [activeBatches, companyAttendance]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* 1. TOP HERO COMPANY BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A1938] via-[#0E2350] to-[#163673] border border-blue-900/40 p-6 sm:p-8 shadow-xl text-white">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Company Identity */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#F07421]/20 border border-[#F07421]/30 text-orange-200 text-xs font-mono font-bold tracking-wide">
                CIN: {currentCompany?.cin || 'U72200TG2020PTC145678'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Industry Partner
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-slate-200 text-[11px] font-medium backdrop-blur-sm">
                <Sparkles className="w-3 h-3 text-amber-300" /> AP Corporate Internship Portal
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              {currentCompany?.name || 'PixelWind Technology Pvt Ltd'}
            </h1>

            <p className="text-xs text-blue-200/80 flex flex-wrap items-center gap-2">
              <span>{currentCompany?.industry || 'Information Technology & Software'}</span>
              <span>•</span>
              <span>HQ: {currentCompany?.headquarters || 'Cyber Gateway, Phase 2, HITEC City, Hyderabad'}</span>
            </p>
          </div>

          {/* Quick Action Header Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/mous/new"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F07421] to-orange-600 hover:from-[#D96214] hover:to-[#C55005] text-white text-xs font-black shadow-md transition-all flex items-center gap-2 transform active:scale-95"
            >
              <PenTool className="w-4 h-4 text-white" />
              <span>Create New MoU</span>
            </Link>

            <Link
              to="/mous"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 shadow-2xs"
            >
              <FileText className="w-4 h-4 text-orange-300" />
              <span>MoU Agreements ({companyMous.length})</span>
            </Link>

            <Link
              to="/company/postings"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 shadow-2xs"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Post Opening</span>
            </Link>

            <Link
              to="/attendance"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-black shadow-md transition-all flex items-center gap-2 transform active:scale-95"
            >
              <CalendarCheck className="w-4 h-4 text-emerald-200" />
              <span>Attendance</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Inbound Proposals */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm transition hover:shadow-md hover:border-orange-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inbound Proposals</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#F07421] flex items-center justify-center border border-orange-100">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#F07421] mt-2 font-mono">{inboundProposals.length}</p>
          <Link to="/proposals" className="text-[11px] font-bold text-[#F07421] hover:underline mt-1.5 inline-flex items-center gap-1">
            <span>Awaiting Response</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Active Cohorts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm transition hover:shadow-md hover:border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Cohorts</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2 font-mono">{activeBatches.length}</p>
          <Link to="/batches" className="text-[11px] font-bold text-emerald-700 hover:underline mt-1.5 inline-flex items-center gap-1">
            <span>Batches Under Mentorship</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Active Interns */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm transition hover:shadow-md hover:border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Interns</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2A4E96] flex items-center justify-center border border-blue-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#0E2350] mt-2 font-mono">{totalInterns}</p>
          <span className="text-[11px] font-bold text-slate-500 mt-1.5 inline-flex items-center gap-1">
            <span>Across Partner Institutions</span>
          </span>
        </div>

        {/* Real-time Attendance Logs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm transition hover:shadow-md hover:border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Attendance</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-teal-700 mt-2 font-mono">{todayAttendance.length}</p>
          <Link to="/attendance" className="text-[11px] font-bold text-teal-700 hover:underline mt-1.5 inline-flex items-center gap-1">
            <span>GPS Verified Logs</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 3. 100% REAL-TIME ANALYTICS GRAPHS (PIPELINE DISTRIBUTION & COHORT ATTENDANCE) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Proposal & Cohort Lifecycle Funnel (Live Donut Chart) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#F07421] flex items-center justify-center">
                <PieIcon className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-[#0E2350]">
                Institutional Engagement Lifecycle
              </h3>
            </div>
            <Link to="/proposals" className="text-xs font-bold text-[#2A4E96] hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Live Recharts Donut */}
            <div className="h-56 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={proposalPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {proposalPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value} Records`, name]}
                    contentStyle={{ backgroundColor: '#0E2350', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '11px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Active Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-black text-slate-800 font-mono">{companyBatches.length}</span>
                <span className="text-[9px] uppercase font-extrabold text-[#F07421] tracking-wider">Cohorts</span>
              </div>
            </div>

            {/* Real-time Legend & Metrics */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#F07421] shrink-0 shadow-xs" />
                  <span className="font-semibold text-slate-700">Pending Review</span>
                </div>
                <span className="font-bold text-[#0E2350] font-mono">{inboundProposals.length}</span>
              </div>

              <div className="flex items-center justify-between bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#2A4E96] shrink-0 shadow-xs" />
                  <span className="font-semibold text-slate-700">Terms Accepted</span>
                </div>
                <span className="font-bold text-[#0E2350] font-mono">
                  {companyProposals.filter(p => p.status.includes('accepted')).length}
                </span>
              </div>

              <div className="flex items-center justify-between bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0 shadow-xs" />
                  <span className="font-semibold text-slate-700">Active Batches</span>
                </div>
                <span className="font-bold text-[#0E2350] font-mono">{activeBatches.length}</span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Real-time Database Sync
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{companyProposals.length} Total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Cohort Attendance & 75% Rule Compliance Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-[#0E2350]">
                Mentored Cohort Attendance & 75% Compliance
              </h3>
            </div>
            <Link to="/attendance" className="text-xs font-bold text-[#2A4E96] hover:underline flex items-center gap-1">
              <span>Attendance Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {batchAttendanceBarData.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Users className="w-8 h-8 mb-2 text-slate-300" />
              <p className="text-xs font-bold text-slate-600">No Active Mentored Batches Yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Cohort attendance compliance metrics will appear once batches are chartered.</p>
            </div>
          ) : (
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={batchAttendanceBarData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    angle={-15}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748B' }} />
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val}%`, name]}
                    contentStyle={{ backgroundColor: '#0E2350', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '11px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="avgAttendance" fill="#0E2350" radius={[4, 4, 0, 0]} name="Avg Attendance (%)" />
                  <Bar dataKey="compliantPct" fill="#10B981" radius={[4, 4, 0, 0]} name=">= 75% Compliant (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#0E2350]" /> Avg Attendance
              </span>
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#10B981]" /> ≥75% Eligible
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Live GPS Verified</span>
          </div>
        </div>
      </div>

      {/* 4. PUBLISHED CORPORATE INTERNSHIP OPENINGS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#F07421] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-extrabold text-[#0E2350]">
              Published Corporate Internship Openings ({companyOpps.length})
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/company/postings"
              className="text-xs font-bold text-[#F07421] hover:underline flex items-center gap-1"
            >
              + Post New Opening
            </Link>
            <Link
              to="/company/postings"
              className="text-xs font-bold text-[#2A4E96] hover:underline flex items-center gap-1"
            >
              Manage All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {companyOpps.slice(0, 3).map((opp) => (
            <div
              key={opp.id}
              className="p-5 rounded-xl border border-slate-200/70 bg-slate-50/60 hover:bg-white hover:border-orange-300 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-[#0E2350] border border-blue-100 px-2 py-0.5 rounded">
                    {opp.mode} • {opp.seats} Seats
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    {opp.stipend_range}
                  </span>
                </div>
                <h4 className="text-xs font-extrabold text-[#0E2350] mt-2 line-clamp-1">{opp.title}</h4>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">{opp.description}</p>
              </div>

              <div className="pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>{opp.duration_weeks} Wks • Min CGPA {opp.min_cgpa || 6.5}+</span>
                <Link to="/company/postings" className="font-bold text-[#2A4E96] hover:underline flex items-center gap-1">
                  <span>Edit & Details</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. INBOUND PROPOSALS QUEUE & BATCH ACTIVATION PIPELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Inbound Proposals */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#F07421] flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-[#0E2350]">
                Inbound Institutional Proposals
              </h3>
            </div>
            <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
              {inboundProposals.length} Pending
            </span>
          </div>

          <div className="space-y-3">
            {companyProposals.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl border border-slate-200/70 hover:border-orange-300 bg-slate-50/50 hover:bg-orange-50/20 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500">{p.proposal_code}</span>
                    <h4 className="text-xs font-extrabold text-[#0E2350]">{p.domain}</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-1">
                      <School className="w-3 h-3 text-[#2A4E96]" />
                      {p.institution?.name || 'Government Degree College'}
                    </p>
                  </div>
                  <StatusBadge status={p.status} size="sm" />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                  <span className="text-slate-600 font-medium">
                    Stipend Req: <strong className="text-slate-800">₹{p.stipend_requested?.toLocaleString()}/mo</strong>
                  </span>
                  <Link
                    to={`/proposals/${p.id}`}
                    className="font-bold text-[#F07421] hover:underline flex items-center gap-1"
                  >
                    Review & Respond <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Active Batches & Activation Pipeline */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-[#0E2350]">
                Internship Batches & Activation Pipeline
              </h3>
            </div>
            <Link to="/batches" className="text-xs font-bold text-[#2A4E96] hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {companyBatches.slice(0, 3).map((b) => {
              const isReadyToActivate = b.status === 'created';
              const totalAccounts = b.students?.length || 0;

              return (
                <div
                  key={b.id}
                  className={`p-4 rounded-xl border transition-all space-y-3 ${
                    isReadyToActivate
                      ? 'border-orange-300 bg-orange-50/40'
                      : 'border-slate-200/70 bg-slate-50/60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-[#0E2350] bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                          {b.batch_code}
                        </span>
                        {isReadyToActivate ? (
                          <span className="text-[10px] font-extrabold text-[#F07421] bg-white border border-[#F07421]/30 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                            Ready to Activate
                          </span>
                        ) : (
                          <StatusBadge status={b.status} size="sm" />
                        )}
                      </div>
                      <h4 className="text-xs font-extrabold text-[#0E2350] mt-1.5">{b.title}</h4>
                      <div className="text-[11px] text-slate-600 mt-1 space-y-0.5">
                        <p><strong>Institution:</strong> {b.institution?.name || 'Government Polytechnic College'}</p>
                        <p><strong>Enrolled:</strong> {totalAccounts} Candidates • <strong>Stipend:</strong> ₹{(b.stipend || b.stipend_amount)?.toLocaleString()} / mo</p>
                      </div>
                    </div>
                  </div>

                  {/* Status & Action Bar */}
                  <div className="pt-2.5 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-xs">
                    {isReadyToActivate ? (
                      <div className="flex items-center gap-2 w-full justify-between">
                        <span className="text-[11px] font-bold text-[#F07421]">
                          Status: Ready to Activate
                        </span>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/batches/${b.id}/attendance-settings`}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-orange-50 text-[#0E2350] font-bold transition-colors text-[11px] flex items-center gap-1"
                          >
                            <MapPin className="w-3.5 h-3.5 text-[#F07421]" />
                            Settings
                          </Link>
                          <button
                            type="button"
                            onClick={() => setBatchForStudents(b)}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold transition-colors text-[11px] flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            Students
                          </button>
                          <button
                            type="button"
                            onClick={() => setBatchToActivate(b)}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-sm transition-all text-[11px] flex items-center gap-1"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            Activate
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full">
                        <div className="text-[11px] flex items-center flex-wrap gap-2 text-slate-700 font-medium">
                          <span className="text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                            ACTIVE ✓
                          </span>
                          <span className="font-semibold text-slate-800">{totalAccounts} Candidates</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            to={`/batches/${b.id}/attendance-settings`}
                            className="px-2.5 py-1.5 rounded-lg bg-orange-50 border border-orange-200 hover:bg-orange-100 text-[#0E2350] font-bold text-[11px] transition-colors flex items-center gap-1"
                          >
                            <MapPin className="w-3.5 h-3.5 text-[#F07421]" />
                            Geofence
                          </Link>
                          <button
                            type="button"
                            onClick={() => setBatchForStudents(b)}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-[#0E2350] font-bold text-[11px] transition-colors flex items-center gap-1"
                          >
                            <Users className="w-3.5 h-3.5 text-[#2A4E96]" />
                            Students
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {batchToActivate && (
        <BatchActivationModal
          batch={batchToActivate}
          onConfirm={handleStartActivation}
          onClose={() => setBatchToActivate(null)}
        />
      )}

      {/* Realtime Step Progress Modal */}
      {activationProgress && (
        <BatchActivationProgressModal
          progress={activationProgress}
          onClose={() => setActivationProgress(null)}
        />
      )}

      {/* View Batch Students Modal */}
      {batchForStudents && (
        <div className="fixed inset-0 z-50 bg-[#07132c]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold bg-[#EEF2FA] text-[#0E2350] px-2 py-0.5 rounded">
                  {batchForStudents.batch_code}
                </span>
                <h3 className="text-base font-extrabold text-[#0E2350] mt-1">
                  Enrolled Students ({batchForStudents.students?.length || 0})
                </h3>
              </div>
              <button
                onClick={() => setBatchForStudents(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 text-xs">
              {batchForStudents.students?.map((bs) => {
                const stu = bs.student || db.students.find(s => s.id === bs.student_id);
                return (
                  <div key={bs.id} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-[#0E2350]">{stu?.full_name || 'Candidate'}</p>
                      <p className="text-[11px] text-slate-500 font-mono">Roll: {stu?.roll_number} • {stu?.email}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Confirmed
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setBatchForStudents(null)}
                className="px-4 py-2 rounded-xl bg-[#0E2350] hover:bg-[#15357a] text-white font-bold text-xs shadow transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
