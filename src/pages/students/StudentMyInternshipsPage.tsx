// ============================================================================
// AP VIDYACONNECT — STUDENT INTERNSHIPS HUB (ALL ENROLLED COHORTS)
// Multi-Cohort Showcase, Live Telemetry, Stipend Tracker & Verified Credentials
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { db } from '../../services/dbStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Briefcase,
  CalendarCheck,
  Building2,
  School,
  Clock,
  CheckCircle2,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  Camera,
  FileCheck2,
  Layers,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  User,
  Zap,
  DollarSign
} from 'lucide-react';
import { StudentSelfAttendanceModal } from '../../components/attendance/StudentSelfAttendanceModal';

export const StudentMyInternshipsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentStudent, currentUser } = useAuth();
  const { showAlert } = useModal();
  const [batches, setBatches] = useState(db.batches);
  const [attendance, setAttendance] = useState(db.attendance);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'completed'>('all');
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setBatches([...db.batches]);
      setAttendance([...db.attendance]);
    });
    return unsub;
  }, []);

  const studentEmail = currentStudent?.email?.toLowerCase() || currentUser?.email?.toLowerCase() || '';
  const studentId = currentStudent?.id || 'stu-001';

  // Find all batches this student is enrolled in
  const myBatches = batches.filter(b =>
    b.students?.some(s => s.student_id === studentId || s.student?.email?.toLowerCase() === studentEmail)
  );

  // If no enrolled batches found in mock data, fall back to showing sample active cohort
  const displayBatches = myBatches.length > 0 ? myBatches : [batches[0]];

  const activeBatches = displayBatches.filter(b => b.status === 'active' || b.status === 'created' || b.status === 'students_confirmed');
  const completedBatches = displayBatches.filter(b => b.status === 'completed' || b.status === 'certificate_issued');

  const filteredBatches =
    filterTab === 'active'
      ? activeBatches
      : filterTab === 'completed'
      ? completedBatches
      : displayBatches;

  // Compute aggregate metrics
  const myAttendance = attendance.filter(a => a.student_id === studentId);
  const presentCount = myAttendance.filter(a => a.status === 'present').length;
  const totalDays = myAttendance.length || 1;
  const overallAttendancePercent = Math.round((presentCount / totalDays) * 100) || 100;
  const totalStipendEarned = displayBatches.reduce((acc, b) => acc + (b.stipend_amount || 15000), 0);
  const totalCreditsEarned = completedBatches.length * 6 + (activeBatches.length > 0 ? 6 : 0);

  const handleJoinConsent = async (batch: any) => {
    db.studentAcceptConsent(batch.id, studentId);
    await showAlert({
      title: 'Internship Consent Recorded!',
      subtitle: `Official APSCHE Student Joining Verification • ${batch.batch_code}`,
      type: 'success',
      badge: 'Digital Consent Timestamped',
      confirmText: 'Continue to Attendance Telemetry',
      message: 'Your formal "JOIN INTERNSHIP" digital acceptance has been securely logged on the state audit ledger. Geofenced daily attendance is now fully unlocked.',
      details: [
        { label: 'Batch Code', value: batch.batch_code },
        { label: 'Corporate Host', value: batch.company?.name || 'Industry Partner' },
        { label: 'Stipend Package', value: `₹${batch.stipend_amount?.toLocaleString()}/month` },
        { label: 'Status', value: 'Consent Signed (Active)' }
      ]
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Hero */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF2FA] text-[#0E2350] text-xs font-bold border border-[#2A4E96]/20">
              <Layers className="w-3.5 h-3.5 text-[#2A4E96]" />
              <span>Student Enrolled Cohorts & Internships</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0E2350] tracking-tight">
              My Internships ({displayBatches.length} Enrolled)
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 max-w-2xl">
              Track your industrial training programs, geofenced shift attendance, corporate mentor evaluations, and APSCHE certified academic credits.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedBatchId(displayBatches[0]?.id);
                setShowAttendanceModal(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-[#0E2350] to-[#1E3A8A] hover:from-[#14336F] hover:to-[#2563EB] text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Camera className="w-4 h-4 text-[#F07421]" />
              <span>Mark Today's Attendance</span>
            </button>
            <Link
              to="/opportunities"
              className="px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-[#F07421]" />
              <span>Explore More</span>
            </Link>
          </div>
        </div>

        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0E2350] flex items-center justify-center shrink-0">
              <Briefcase className="w-6 h-6 text-[#2A4E96]" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Enrolled Batches</span>
              <div className="text-xl font-black text-[#0E2350] mt-0.5">
                {displayBatches.length} <span className="text-xs font-semibold text-emerald-600">({activeBatches.length} Active)</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Attendance Rate</span>
              <div className="text-xl font-black text-emerald-800 mt-0.5">
                {overallAttendancePercent}% <span className="text-[10px] font-semibold text-emerald-600">(≥75% Cutoff)</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">NEP 2020 Credits</span>
              <div className="text-xl font-black text-amber-900 mt-0.5">
                {totalCreditsEarned} Credits
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-800 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Monthly Stipend</span>
              <div className="text-xl font-black text-indigo-900 mt-0.5">
                ₹{displayBatches[0]?.stipend_amount?.toLocaleString() || '18,000'}/mo
              </div>
            </div>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              filterTab === 'all'
                ? 'bg-[#0E2350] text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All Internships ({displayBatches.length})
          </button>
          <button
            onClick={() => setFilterTab('active')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              filterTab === 'active'
                ? 'bg-emerald-800 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active Cohorts ({activeBatches.length})
          </button>
          <button
            onClick={() => setFilterTab('completed')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              filterTab === 'completed'
                ? 'bg-blue-800 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Completed Cohorts ({completedBatches.length})
          </button>
        </div>

        {/* Batches List */}
        <div className="space-y-6">
          {filteredBatches.map((batch) => {
            const batchStudent = batch.students?.find(
              s => s.student_id === studentId || s.student?.email?.toLowerCase() === studentEmail
            );
            const hasConsent = batchStudent?.has_joined || batch.status === 'active' || batch.status === 'completed';
            const company = db.companies.find(c => c.id === batch.company_id) || batch.company || db.companies[0];
            const institution = db.institutions.find(i => i.id === batch.institution_id) || batch.institution || db.institutions[0];

            return (
              <div
                key={batch.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden p-6 space-y-5"
              >
                {/* Card Top Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0E2350] to-[#1E3A8A] text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                      {company.name.charAt(0)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-black text-[#0E2350] tracking-tight">
                          {batch.title || 'Advanced Full-Stack Engineering Internship'}
                        </h3>
                        <StatusBadge status={batch.status} />
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#0E2350] font-mono text-xs font-bold">
                          {batch.batch_code}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1 font-semibold text-gray-700">
                          <Building2 className="w-3.5 h-3.5 text-blue-700" />
                          {company.name} ({company.headquarters || 'Andhra Pradesh'})
                        </span>
                        <span className="flex items-center gap-1">
                          <School className="w-3.5 h-3.5 text-indigo-600" />
                          {institution.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          Mode: <strong className="uppercase text-slate-800">{batch.mode || 'onsite'}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Monthly Stipend</span>
                      <span className="text-base font-black text-[#0E2350]">
                        ₹{batch.stipend_amount?.toLocaleString() || '18,000'}/mo
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Middle Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60 text-xs">
                  {/* Attendance & Telemetry */}
                  <div className="space-y-1.5">
                    <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-emerald-600" />
                      GPS Geofence Attendance
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-emerald-800">{overallAttendancePercent}%</span>
                      <span className="text-gray-500 font-medium text-[11px]">(Verified GPS Shifts)</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${overallAttendancePercent}%` }} />
                    </div>
                  </div>

                  {/* Mentor Info */}
                  <div className="space-y-1">
                    <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      Corporate Mentor
                    </span>
                    <div className="font-bold text-slate-800 text-xs">
                      {batch.mentor?.full_name || 'Senior Engineering Mentor'}
                    </div>
                    <span className="text-gray-500 text-[11px]">
                      {batch.mentor?.email || 'mentor@pixelwind.com'}
                    </span>
                  </div>

                  {/* Consent & Compliance */}
                  <div className="space-y-1">
                    <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      NEP 2020 Compliance
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{hasConsent ? 'Digital Joining Signed' : 'Consent Pending'}</span>
                    </div>
                    <span className="text-gray-500 text-[11px]">
                      6 Academic Credits recognized across AP
                    </span>
                  </div>
                </div>

                {/* Card Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>Timeline: <strong>{batch.start_date} to {batch.end_date}</strong></span>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    {!hasConsent && (
                      <button
                        onClick={() => handleJoinConsent(batch)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Sign "JOIN INTERNSHIP"</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedBatchId(batch.id);
                        setShowAttendanceModal(true);
                      }}
                      className="flex-1 sm:flex-none px-4 py-2 bg-[#0E2350] hover:bg-[#14336F] text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Camera className="w-4 h-4 text-[#F07421]" />
                      <span>Check-In Selfie</span>
                    </button>

                    <Link
                      to="/attendance"
                      className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-bold rounded-xl text-xs transition-all shadow-2xs flex items-center justify-center gap-1.5"
                    >
                      <CalendarCheck className="w-4 h-4 text-gray-500" />
                      <span>View Log</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Student Self Attendance Modal */}
      {showAttendanceModal && (
        <StudentSelfAttendanceModal
          batch={displayBatches.find(b => b.id === selectedBatchId) || displayBatches[0]}
          studentId={studentId}
          studentUser={{
            id: currentUser?.id || 'stu-user',
            email: currentUser?.email || '',
            full_name: currentStudent?.full_name || currentUser?.full_name || 'Student'
          }}
          onClose={() => setShowAttendanceModal(false)}
          onSuccess={() => {
            setAttendance([...db.attendance]);
          }}
        />
      )}
    </div>
  );
};
