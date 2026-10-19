// ============================================================================
// AP VIDYACONNECT — SUPER ADMIN DASHBOARD
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { BannerManagerModal } from '../../components/admin/BannerManagerModal';
import {
  ShieldCheck,
  School,
  Building2,
  Users,
  Award,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  MapPin,
  FileText,
  Sparkles,
  Settings,
  Activity,
  Layers,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const DISTRICT_DATA = [
  { district: 'Hyderabad', colleges: 48, interns: 6800 },
  { district: 'Rangareddy', colleges: 32, interns: 4200 },
  { district: 'Medchal', colleges: 28, interns: 3600 },
  { district: 'Warangal', colleges: 22, interns: 2400 },
  { district: 'Karimnagar', colleges: 18, interns: 1900 },
  { district: 'Nizamabad', colleges: 15, interns: 1400 },
  { district: 'Khammam', colleges: 14, interns: 1200 },
];

const SECTOR_DATA = [
  { name: 'IT & Software', value: 45, color: '#0E2350', lightColor: '#E8EDF5' },
  { name: 'Core Engg & Electronics', value: 25, color: '#F07421', lightColor: '#FDF2E9' },
  { name: 'Biopharma & Healthcare', value: 18, color: '#10B981', lightColor: '#ECFDF5' },
  { name: 'Banking & FinTech', value: 12, color: '#6366F1', lightColor: '#EEF2FF' },
];

export const SuperAdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [institutions, setInstitutions] = useState(db.institutions);
  const [companies, setCompanies] = useState(db.companies);
  const [banners, setBanners] = useState(db.banners);
  const [showBannerModal, setShowBannerModal] = useState(false);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setInstitutions([...db.institutions]);
      setCompanies([...db.companies]);
      setBanners([...db.banners]);
    });
    return unsub;
  }, []);

  const pendingInstitutions = institutions.filter(i => i.verification_status === 'under_verification' || i.verification_status === 'pending');
  const pendingCompanies = companies.filter(c => c.verification_status === 'under_verification' || c.verification_status === 'pending');

  const handleApproveInst = (instId: string) => {
    const inst = db.institutions.find(i => i.id === instId);
    if (inst) {
      inst.verification_status = 'verified';
      inst.verification_notes = `Approved by Super Admin ${currentUser.full_name}`;
      db.persist('institutions');
      db.logAudit('verify_institution', 'institution', instId, { status: 'under_verification' }, { status: 'verified' });
    }
  };

  const handleApproveComp = (compId: string) => {
    const comp = db.companies.find(c => c.id === compId);
    if (comp) {
      comp.verification_status = 'verified';
      comp.verification_notes = `Approved by Super Admin ${currentUser.full_name}`;
      db.persist('companies');
      db.logAudit('verify_company', 'company', compId, { status: 'under_verification' }, { status: 'verified' });
    }
  };

  const totalVerificationsPending = pendingInstitutions.length + pendingCompanies.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. TOP HERO STATE NODAL COMMAND BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A1938] via-[#0E2350] to-[#163673] border border-blue-900/50 p-6 sm:p-8 shadow-2xl text-white">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F07421]/20 border border-[#F07421]/30 text-[#F07421] text-xs font-mono font-bold tracking-wider uppercase backdrop-blur-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F07421] animate-pulse" />
                STATE NODAL CELL
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-xs">
                <ShieldCheck className="w-3.5 h-3.5" /> State Higher Education Administration
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-400/10 border border-blue-400/20 text-blue-200 text-xs font-medium">
                <Activity className="w-3 h-3 text-cyan-400" /> Live Telemetry Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              Statewide Internship & Industry Collaboration Dashboard
            </h1>

            <p className="text-xs sm:text-sm text-blue-200/90 max-w-3xl leading-relaxed">
              Logged in as <strong className="text-white font-bold">{currentUser?.full_name || 'Administrator'}</strong> (State Nodal Officer) • Centralized statutory accreditation, real-time institutional proposal oversight, and verified cohort governance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowBannerModal(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 shadow-sm hover:scale-[1.02] active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Announcement Banners ({banners.length})</span>
            </button>

            <Link
              to="/admin/verifications"
              className={`px-4 py-2.5 rounded-xl text-white text-xs font-black shadow-lg transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-95 ${
                totalVerificationsPending > 0
                  ? 'bg-gradient-to-r from-[#F07421] to-amber-600 shadow-orange-500/20 hover:brightness-110'
                  : 'bg-white/10 hover:bg-white/20 border border-white/20'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verification Queue ({totalVerificationsPending})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. REALTIME METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Registered Colleges */}
        <div className="group relative overflow-hidden bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300/80 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-80" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Registered Colleges</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0E2350] flex items-center justify-center group-hover:scale-110 transition-transform">
              <School className="w-5 h-5 text-[#0E2350]" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-[#0E2350] mt-3 font-mono tracking-tight">{institutions.length}</p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit border border-emerald-200/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{institutions.filter(i => i.verification_status === 'verified').length} State Verified</span>
          </div>
        </div>

        {/* Registered Companies */}
        <div className="group relative overflow-hidden bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-orange-300/80 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F07421] to-amber-500 opacity-80" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Registered Companies</span>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#F07421] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5 text-[#F07421]" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-[#F07421] mt-3 font-mono tracking-tight">{companies.length}</p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit border border-emerald-200/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{companies.filter(c => c.verification_status === 'verified').length} Verified Partners</span>
          </div>
        </div>

        {/* All State Proposals */}
        <div className="group relative overflow-hidden bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300/80 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-[#2A4E96] opacity-80" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">All State Proposals</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#2A4E96] flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5 text-[#2A4E96]" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-[#2A4E96] mt-3 font-mono tracking-tight">{db.proposals.length}</p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg w-fit border border-blue-200/60">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>Real-time Oversight Active</span>
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="group relative overflow-hidden bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-300/80 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-500 opacity-80" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Pending Verifications</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-amber-600 mt-3 font-mono tracking-tight">{totalVerificationsPending}</p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg w-fit border border-amber-200/60">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>{totalVerificationsPending === 0 ? 'Queue Cleared' : 'Action Required'}</span>
          </div>
        </div>
      </div>

      {/* 3. ANALYTICS CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* District Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-sm font-black text-[#0E2350] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#2A4E96]" />
                District-Wise Student Placements (Top 7 Districts)
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Aggregated across all verified university colleges</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-mono font-bold">AY 2025-26</span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DISTRICT_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="districtBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2A4E96" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#0E2350" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="district" tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#F8FAFC', opacity: 0.8 }}
                  contentStyle={{
                    backgroundColor: '#0A1938',
                    color: '#fff',
                    borderRadius: '14px',
                    fontSize: '12px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                  }}
                  itemStyle={{ color: '#F07421', fontWeight: 'bold' }}
                />
                <Bar dataKey="interns" name="Placed Interns" fill="url(#districtBarGradient)" radius={[8, 8, 0, 0]} barSize={42} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-[#0E2350] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#F07421]" />
                  Industry Sector Distribution
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">Breakdown by corporate domains</p>
              </div>
            </div>

            <div className="h-48 w-full flex items-center justify-center my-2 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={SECTOR_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={82}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {SECTOR_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0A1938',
                      color: '#fff',
                      borderRadius: '12px',
                      fontSize: '12px',
                      border: '1px solid rgba(255,255,255,0.15)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-[#0E2350] font-mono">100%</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Total</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
            {SECTOR_DATA.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="flex items-center gap-2 text-slate-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-xs" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-mono font-extrabold text-[#0E2350] bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. PENDING VERIFICATIONS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-[#0E2350] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#F07421]" />
              Entity Verification Queue
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-[#F07421] font-mono font-bold">
                {totalVerificationsPending} Pending
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">Review and grant official state accreditation to institutions & industry partners</p>
          </div>

          <Link
            to="/admin/verifications"
            className="text-xs font-extrabold text-[#2A4E96] hover:text-[#0E2350] flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50/80 hover:bg-blue-100/80 transition-colors self-start sm:self-auto"
          >
            <span>Full Verification Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 text-slate-500 font-extrabold uppercase bg-slate-50/80 text-[10px] tracking-wider">
                <th className="py-3 px-3 rounded-l-xl">Type</th>
                <th className="py-3 px-3">Entity Name</th>
                <th className="py-3 px-3">Code / CIN</th>
                <th className="py-3 px-3">Accreditation / Sector</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right rounded-r-xl">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingInstitutions.map((i) => (
                <tr key={i.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="py-3.5 px-3">
                    <span className="bg-blue-50 text-[#0E2350] border border-blue-200/60 px-2.5 py-1 rounded-lg font-bold text-[11px] inline-flex items-center gap-1.5">
                      <School className="w-3 h-3 text-[#2A4E96]" />
                      College
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-extrabold text-slate-900 group-hover:text-blue-900 transition-colors">{i.name}</td>
                  <td className="py-3.5 px-3 font-mono text-slate-600 font-bold">{i.code}</td>
                  <td className="py-3.5 px-3 text-slate-600 font-medium">{i.accreditation || i.affiliated_university}</td>
                  <td className="py-3.5 px-3"><StatusBadge status={i.verification_status} size="sm" /></td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => handleApproveInst(i.id)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black transition-all shadow-sm active:scale-95 inline-flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve & Verify
                    </button>
                  </td>
                </tr>
              ))}

              {pendingCompanies.map((c) => (
                <tr key={c.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="py-3.5 px-3">
                    <span className="bg-orange-50 text-[#F07421] border border-orange-200/60 px-2.5 py-1 rounded-lg font-bold text-[11px] inline-flex items-center gap-1.5">
                      <Building2 className="w-3 h-3 text-[#F07421]" />
                      Industry
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-extrabold text-slate-900 group-hover:text-blue-900 transition-colors">{c.name}</td>
                  <td className="py-3.5 px-3 font-mono text-slate-600 font-bold">{c.cin}</td>
                  <td className="py-3.5 px-3 text-slate-600 font-medium">{c.industry}</td>
                  <td className="py-3.5 px-3"><StatusBadge status={c.verification_status} size="sm" /></td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => handleApproveComp(c.id)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black transition-all shadow-sm active:scale-95 inline-flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve & Verify
                    </button>
                  </td>
                </tr>
              ))}

              {pendingInstitutions.length === 0 && pendingCompanies.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2.5 border border-emerald-200/60">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <p className="font-extrabold text-slate-700 text-sm">All Entities Verified</p>
                    <p className="text-slate-400 mt-0.5">All registered colleges and corporate partners have passed state accreditation verification.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Banner Manager Modal for Super Admin */}
      <BannerManagerModal
        isOpen={showBannerModal}
        onClose={() => setShowBannerModal(false)}
      />
    </div>
  );
};

