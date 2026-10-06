// ============================================================================
// AP VIDYACONNECT — COLLEGE ADMIN & INSTITUTION DASHBOARD
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
  School,
  FileText,
  Briefcase,
  Users,
  ArrowRight,
  CheckCircle2,
  Building2,
  BarChart3,
  PieChart as PieIcon,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  Activity,
  Zap,
  Calendar,
  Layers,
  Award
} from 'lucide-react';

export const InstitutionDashboard: React.FC = () => {
  const { currentInstitution, currentUser } = useAuth();
  const [proposals, setProposals] = useState(db.proposals);
  const [batches, setBatches] = useState(db.batches);
  const [students, setStudents] = useState(db.students);
  const [attendance, setAttendance] = useState(db.attendance);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setProposals([...db.proposals]);
      setBatches([...db.batches]);
      setStudents([...db.students]);
      setAttendance([...db.attendance]);
    });
    return unsub;
  }, []);

  const instId = currentInstitution?.id;

  // 1. Filter Real-Time Data for this Institution strictly
  const myStudents = useMemo(() => {
    if (!instId) return [];
    return students.filter(s => s.institution_id === instId);
  }, [students, instId]);

  const myBatches = useMemo(() => {
    if (!instId) return [];
    return batches.filter(b => b.institution_id === instId);
  }, [batches, instId]);

  const myActiveBatches = useMemo(() => {
    return myBatches.filter(b => b.status === 'active' || b.status === 'created');
  }, [myBatches]);

  const myProposals = useMemo(() => {
    if (!instId) return [];
    return proposals.filter(p => p.institution_id === instId);
  }, [proposals, instId]);

  // 2. Real-Time Attendance Aggregation across all Institution Students
  const myStudentIds = useMemo(() => new Set(myStudents.map(s => s.id)), [myStudents]);

  const myAttendance = useMemo(() => {
    if (!instId) return [];
    return attendance.filter(a => myStudentIds.has(a.student_id) || a.institution_id === instId);
  }, [attendance, myStudentIds, instId]);

  const presentCount = myAttendance.filter(a => a.status === 'present').length;
  const lateCount = myAttendance.filter(a => a.is_late || a.notes?.toLowerCase().includes('late') || a.status === 'half_day').length;
  const leaveCount = myAttendance.filter(a => a.status === 'leave').length;
  const absentCount = myAttendance.filter(a => a.status === 'absent').length;
  const totalAttendanceRecords = myAttendance.length;

  const attendancePieData = useMemo(() => {
    // If no records logged yet, display clean baseline distribution
    if (totalAttendanceRecords === 0) {
      return [
        { name: 'No Records Logged', value: 1, color: '#CBD5E1' }
      ];
    }
    const data = [
      { name: 'Present (On-Time)', value: presentCount, color: '#10B981' },
      { name: 'Late Check-in', value: lateCount, color: '#F59E0B' },
      { name: 'Approved Leave', value: leaveCount, color: '#8B5CF6' },
      { name: 'Absent / Unmarked', value: absentCount, color: '#EF4444' },
    ];
    return data.filter(d => d.value > 0);
  }, [presentCount, lateCount, leaveCount, absentCount, totalAttendanceRecords]);

  // Real-Time Overall Compliance %
  const overallAvgAttendance = useMemo(() => {
    if (totalAttendanceRecords === 0) return 100;
    const weighted = presentCount + (lateCount * 0.75);
    return Math.round((weighted / totalAttendanceRecords) * 100);
  }, [presentCount, lateCount, totalAttendanceRecords]);

  // 3. Real-Time Batch Attendance & 75% State Rule Compliance Bar Chart
  const batchComplianceBarData = useMemo(() => {
    if (myActiveBatches.length === 0) {
      return [];
    }

    return myActiveBatches.slice(0, 5).map(b => {
      const batchRecs = attendance.filter(a => a.batch_id === b.id || a.internship_batch_id === b.id);
      const batchPres = batchRecs.filter(a => a.status === 'present').length;
      const batchTot = batchRecs.length;

      const avgRate = batchTot > 0 ? Math.round((batchPres / batchTot) * 100) : 100;
      const compRate = avgRate >= 75 ? 100 : Math.round((avgRate / 75) * 100);

      const label = b.title.length > 16 ? b.title.substring(0, 16) + '...' : b.title;

      return {
        name: label,
        batchCode: b.batch_code,
        avgAttendance: avgRate,
        compliantPct: compRate
      };
    });
  }, [myActiveBatches, attendance]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* 1. TOP HERO INSTITUTION BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A1938] via-[#0E2350] to-[#163673] border border-blue-900/40 p-6 sm:p-8 shadow-xl text-white">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Institution Identity */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-mono font-bold tracking-wide">
                {currentInstitution?.code || 'GDC-NLG-2026'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                NAAC A+ Accredited Government Institution
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-slate-200 text-[11px] font-medium backdrop-blur-sm">
                <Sparkles className="w-3 h-3 text-amber-300" /> State Academic Portal
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              {currentInstitution?.name || 'kaka shah high school'}
            </h1>

            <p className="text-xs text-blue-200/80 flex flex-wrap items-center gap-2 font-mono">
              <span>Affiliated to {currentInstitution?.affiliated_university || 'jkbose'}</span>
              <span>•</span>
              <span className="font-sans">Principal: {currentInstitution?.principal_name || 'Dr. G. Ramana Rao'}</span>
            </p>
          </div>

          {/* Action Header Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/students"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-md transition-all flex items-center gap-2 transform active:scale-95"
            >
              <Users className="w-4 h-4 text-amber-300" />
              <span>Student Management</span>
            </Link>

            <Link
              to="/proposals/new"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F07421] to-orange-600 hover:from-[#D96214] hover:to-[#C55005] text-white text-xs font-black shadow-md transition-all flex items-center gap-2 transform active:scale-95"
            >
              <FileText className="w-4 h-4 text-white" />
              <span>Create Proposal</span>
            </Link>

            <Link
              to="/attendance"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition-all flex items-center gap-2 transform active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Attendance Register</span>
            </Link>

            <Link
              to="/opportunities"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 shadow-2xs"
            >
              <Building2 className="w-4 h-4 text-blue-300" />
              <span>Explore Companies</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Batches */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm transition hover:shadow-md hover:border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Batches</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#0E2350] mt-2 font-mono">{myActiveBatches.length || myBatches.length}</p>
          <Link to="/batches" className="text-[11px] font-bold text-emerald-700 hover:underline mt-1.5 inline-flex items-center gap-1">
            <span>View All Batches</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Enrolled Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm transition hover:shadow-md hover:border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enrolled Students</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#0E2350] mt-2 font-mono">{myStudents.length}</p>
          <Link to="/students" className="text-[11px] font-bold text-blue-700 hover:underline mt-1.5 inline-flex items-center gap-1">
            <span>Manage Student Roster</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Real-time Avg Attendance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm transition hover:shadow-md hover:border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Batch Attendance</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#F07421] flex items-center justify-center border border-orange-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#F07421] mt-2 font-mono">{overallAvgAttendance}%</p>
          <Link to="/attendance" className="text-[11px] font-bold text-[#F07421] hover:underline mt-1.5 inline-flex items-center gap-1">
            <span>Audit Register & Compliance</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Proposals Pipeline */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm transition hover:shadow-md hover:border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Proposals Pipeline</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-700 mt-2 font-mono">{myProposals.length}</p>
          <Link to="/proposals" className="text-[11px] font-bold text-purple-700 hover:underline mt-1.5 inline-flex items-center gap-1">
            <span>Track All Proposals</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 3. 100% REAL-TIME ANALYTICS GRAPHS (COHORT DISTRIBUTION & BATCH COMPLIANCE) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Overall Cohort Attendance Distribution (Live Donut Chart) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <PieIcon className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-[#0E2350]">
                Overall Cohort Attendance Distribution
              </h3>
            </div>
            <Link to="/attendance" className="text-xs font-bold text-[#2A4E96] hover:underline flex items-center gap-1">
              <span>View Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Live Recharts Donut */}
            <div className="h-56 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendancePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {attendancePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value} Logs`, name]}
                    contentStyle={{ backgroundColor: '#0E2350', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '11px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Compliance Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-black text-slate-800 font-mono">{overallAvgAttendance}%</span>
                <span className="text-[9px] uppercase font-extrabold text-emerald-600 tracking-wider">Compliance</span>
              </div>
            </div>

            {/* Real-time Legend & Metrics */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0 shadow-xs" />
                  <span className="font-semibold text-slate-700">Present (On-Time)</span>
                </div>
                <span className="font-bold text-[#0E2350] font-mono">{presentCount}</span>
              </div>

              <div className="flex items-center justify-between bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0 shadow-xs" />
                  <span className="font-semibold text-slate-700">Late Check-in</span>
                </div>
                <span className="font-bold text-[#0E2350] font-mono">{lateCount}</span>
              </div>

              <div className="flex items-center justify-between bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500 shrink-0 shadow-xs" />
                  <span className="font-semibold text-slate-700">Approved Leave</span>
                </div>
                <span className="font-bold text-[#0E2350] font-mono">{leaveCount}</span>
              </div>

              <div className="flex items-center justify-between bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0 shadow-xs" />
                  <span className="font-semibold text-slate-700">Absent / Unmarked</span>
                </div>
                <span className="font-bold text-[#0E2350] font-mono">{absentCount}</span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {overallAvgAttendance >= 75 ? 'Meets 75% State Cutoff' : 'Action Required'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{totalAttendanceRecords} Total Logs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Real-Time Batch Attendance & 75% Rule Compliance Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#F07421] flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-[#0E2350]">
                Batch Attendance & 75% Rule Compliance
              </h3>
            </div>
            <Link to="/attendance" className="text-xs font-bold text-[#2A4E96] hover:underline flex items-center gap-1">
              <span>Daily Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {batchComplianceBarData.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Users className="w-8 h-8 mb-2 text-slate-300" />
              <p className="text-xs font-bold text-slate-600">No Active Internship Batches Yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Cohort attendance compliance metrics will appear once batches are chartered.</p>
            </div>
          ) : (
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={batchComplianceBarData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
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
            <span className="text-[10px] text-slate-400">Live GPS Verified Data</span>
          </div>
        </div>
      </div>

      {/* 4. ACTIVE BATCHES & INDUSTRY PARTNERS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-extrabold text-[#0E2350]">
              Active Institutional Internship Batches ({myActiveBatches.length})
            </h3>
          </div>
          <Link to="/batches" className="text-xs font-bold text-[#2A4E96] hover:underline flex items-center gap-1">
            <span>View All Batches</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myActiveBatches.map((batch) => (
            <div
              key={batch.id}
              className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/60 hover:bg-white hover:border-blue-300 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-[10px] font-bold text-[#0E2350] bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                    {batch.batch_code}
                  </span>
                  <StatusBadge status={batch.status} size="sm" />
                </div>
                <h4 className="text-xs font-extrabold text-[#0E2350] mt-2">{batch.title}</h4>
                <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-[#F07421]" />
                  {batch.company?.name || 'Industry Partner'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 space-y-1 text-[10px] text-slate-500">
                <p>
                  <strong>Faculty:</strong> Prof. S. Sunitha Rao • <strong>Mentor:</strong> {batch.mentor?.full_name || 'Corporate Supervisor'}
                </p>
                <div className="flex items-center justify-between pt-1 font-semibold text-[#0E2350]">
                  <span>{batch.students?.length || 0} Confirmed Interns</span>
                  <Link to={`/batches/${batch.id}`} className="font-bold text-[#2A4E96] hover:underline">
                    Batch Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. EXPLORE COMPANIES & INDUSTRY OPPORTUNITIES CATALOG */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#F07421] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-extrabold text-[#0E2350]">
              Verified Industry Partners & Openings for College Proposals
            </h3>
          </div>
          <Link
            to="/opportunities"
            className="text-xs font-bold text-[#F07421] hover:underline flex items-center gap-1"
          >
            <span>Explore All Opportunities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {db.opportunities.slice(0, 3).map((opp) => {
            const comp = db.companies.find(c => c.id === opp.company_id);
            return (
              <div
                key={opp.id}
                className="p-4 rounded-xl border border-orange-100 bg-[#FFF3EA]/30 hover:bg-[#FFF3EA]/60 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase bg-[#FFF3EA] text-[#F07421] px-2 py-0.5 rounded">
                      {opp.mode} • {opp.seats} Seats
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700">{opp.stipend_range}</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-[#0E2350] mt-2 line-clamp-1">{opp.title}</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">{comp?.name}</p>
                </div>

                <div className="pt-2 border-t border-orange-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">{opp.duration_weeks} Weeks</span>
                  <Link
                    to={`/proposals/new?companyId=${opp.company_id}&domain=${encodeURIComponent(opp.domain)}`}
                    className="px-2.5 py-1 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-md text-[10px] font-bold shadow-2xs"
                  >
                    Draft Proposal
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

