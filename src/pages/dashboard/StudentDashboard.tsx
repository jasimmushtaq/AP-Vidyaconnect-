// ============================================================================
// AP VIDYACONNECT — ULTRA MODERN STUDENT COMMAND DASHBOARD
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { db } from '../../services/dbStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Briefcase,
  CalendarCheck,
  ArrowRight,
  ShieldCheck,
  Building2,
  AlertCircle,
  FileCheck2,
  Clock,
  CheckCircle2,
  School,
  MapPin,
  Camera,
  Sparkles,
  Zap,
  TrendingUp,
  UserCheck,
  Flame,
  Calendar,
  Layers,
  Compass,
  Check,
  RotateCcw,
  User,
  Upload
} from 'lucide-react';
import { StudentSelfAttendanceModal } from '../../components/attendance/StudentSelfAttendanceModal';

export const StudentDashboard: React.FC = () => {
  const { currentStudent, currentUser, updateProfile } = useAuth();
  const { showAlert } = useModal();
  const [batches, setBatches] = useState(db.batches);
  const [tasks, setTasks] = useState(db.tasks);
  const [attendance, setAttendance] = useState(db.attendance);
  const [showSelfAttendanceModal, setShowSelfAttendanceModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    const unsub = db.subscribe(() => {
      setBatches([...db.batches]);
      setTasks([...db.tasks]);
      setAttendance([...db.attendance]);
    });
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      unsub();
      clearInterval(timer);
    };
  }, []);

  const studentEmail = currentStudent?.email?.toLowerCase() || currentUser.email.toLowerCase();
  const studentId = currentStudent?.id || 'stu-001';
  const myBatch = batches.find(b =>
    b.students?.some(s => s.student_id === studentId || s.student?.email?.toLowerCase() === studentEmail)
  ) || batches[0];
  const myBatchStudent = myBatch?.students?.find(
    s => s.student_id === studentId || s.student?.email?.toLowerCase() === studentEmail
  );
  const myAttendance = attendance.filter(a => a.student_id === studentId);

  // Batch attendance settings (without exposing exact coordinates)
  const batchSettings = myBatch ? db.getBatchAttendanceSettings(myBatch.id) : null;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = myAttendance.find(a => a.date === todayStr);

  const presentCount = myAttendance.filter(a => a.status === 'present').length;
  const absentCount = myAttendance.filter(a => a.status === 'absent').length;
  const lateCount = myAttendance.filter(a => a.is_late || a.notes?.toLowerCase().includes('late')).length;
  const totalDays = myAttendance.length || 1;
  const attendancePercent = Math.round((presentCount / totalDays) * 100) || 100;

  const studentInstitution = db.institutions.find(i => i.id === currentStudent?.institution_id || i.id === myBatch?.institution_id) || db.institutions[0];

  const handleJoinConsent = async () => {
    if (myBatch) {
      db.studentAcceptConsent(myBatch.id, studentId);
      await showAlert({
        title: 'Internship Consent Recorded!',
        subtitle: 'Official APSCHE Student Joining Verification',
        type: 'success',
        badge: 'Digital Consent Timestamped',
        confirmText: 'Go to Internship Workspace',
        message: 'Your formal "JOIN INTERNSHIP" digital acceptance has been securely logged on the state audit ledger with your cryptographic timestamp. Attendance tracking is now fully unlocked.',
        details: [
          { label: 'Batch Code', value: myBatch.batch_code },
          { label: 'Company Partner', value: myBatch.company?.name || 'Partner Company' },
          { label: 'Monthly Stipend', value: `₹${myBatch.stipend_amount?.toLocaleString()}/mo` },
          { label: 'Status', value: 'Consent Signed (Active)' }
        ]
      });
    }
  };

  const handleResetToday = () => {
    db.resetTodayAttendance(studentId, todayStr);
  };

  const studentFullName = currentStudent?.full_name || currentUser.full_name || 'Rahul Sharma';
  const studentPhoto = (currentStudent?.photo_url && !currentStudent.photo_url.includes('1539571696357-5a69c17a67c6')) 
    ? currentStudent.photo_url 
    : (currentUser.avatar_url && !currentUser.avatar_url.includes('1539571696357-5a69c17a67c6'))
    ? currentUser.avatar_url
    : '';

  const studentInitials = studentFullName
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'ST';

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo size should be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      updateProfile({ avatar_url: base64 });
    };
    reader.readAsDataURL(file);
  };

  // SVG Radial Gauge Calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (attendancePercent / 100) * circumference;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Hidden File Input for Profile Photo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handlePhotoUpload}
      />

      {/* 1. TOP HERO PROFILE BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A1938] via-[#0E2350] to-[#163673] border border-blue-900/40 p-6 sm:p-8 shadow-xl text-white">
        {/* Subtle Ambient Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Student Profile Info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload or change your profile photo"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-1 bg-gradient-to-tr from-amber-400 via-blue-400 to-emerald-400 shadow-lg relative overflow-hidden transition-transform group-hover:scale-102">
                {studentPhoto ? (
                  <img
                    src={studentPhoto}
                    alt="Student Avatar"
                    className="w-full h-full rounded-xl object-cover bg-slate-900"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 flex flex-col items-center justify-center text-white border border-white/10 shadow-inner group-hover:bg-slate-800 transition">
                    <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono tracking-wider">{studentInitials}</span>
                    <span className="text-[9px] text-blue-200/90 font-bold uppercase tracking-tight flex items-center gap-0.5 mt-0.5">
                      <Camera className="w-2.5 h-2.5 text-amber-400" /> Upload
                    </span>
                  </div>
                )}

                {/* Hover overlay to change photo */}
                <div className="absolute inset-1 rounded-xl bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-center p-1">
                  <Camera className="w-5 h-5 text-amber-300 mb-0.5" />
                  <span className="text-[9px] font-bold text-slate-100 uppercase tracking-tighter">Update Photo</span>
                </div>
              </div>

              {studentPhoto ? (
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-[#0E2350] text-white shadow-sm" title="Profile Photo Verified">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              ) : (
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 ring-4 ring-[#0E2350] text-white shadow-sm animate-bounce" title="Click to upload your profile photo">
                  <Camera className="w-3 h-3 text-white" />
                </span>
              )}
            </div>


            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-mono font-bold tracking-wide">
                  {currentStudent?.roll_number || '2023-CS-042'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Enrolled Candidate
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-slate-200 text-[11px] font-medium backdrop-blur-sm">
                  <Sparkles className="w-3 h-3 text-amber-300" /> State Merit Portal
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                {currentStudent?.full_name || currentUser.full_name || 'Rahul Sharma'}
              </h1>

              <p className="text-xs text-blue-200/80 flex items-center gap-2 font-mono">
                <span>{currentStudent?.email || currentUser.email}</span>
                <span>•</span>
                <span className="text-emerald-400 font-sans font-semibold">Biometrics Synced</span>
              </p>
            </div>
          </div>

          {/* Academic Institution Cardlet */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-4 sm:min-w-[280px] flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-blue-200/70 uppercase font-bold tracking-wider block">Academic Institution</span>
              <p className="text-sm font-bold text-white mt-0.5 line-clamp-1">
                {studentInstitution?.name || 'Government Degree College'}
              </p>
              <span className="text-[11px] text-blue-300 flex items-center gap-1 mt-1">
                <School className="w-3.5 h-3.5 text-amber-400" />
                Affiliated APSCHE Center
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-blue-300" />
            </div>
          </div>
        </div>

        {/* 4 Hero Stat Badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-xs">
          <div className="bg-black/20 backdrop-blur-sm border border-white/5 p-3.5 rounded-xl transition hover:bg-black/30">
            <span className="text-[10px] text-blue-200/70 uppercase font-bold tracking-wider block">Course / Branch</span>
            <span className="font-bold text-white text-sm mt-1 block truncate">Computer Science & Engg.</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">B.Tech Specialization</span>
          </div>

          <div className="bg-black/20 backdrop-blur-sm border border-white/5 p-3.5 rounded-xl transition hover:bg-black/30">
            <span className="text-[10px] text-blue-200/70 uppercase font-bold tracking-wider block">Year of Study</span>
            <span className="font-bold text-white text-sm mt-1 block">{currentStudent?.year_of_study || 4}th Year (Final)</span>
            <span className="text-[10px] text-blue-300 block mt-0.5">Semester VIII Active</span>
          </div>

          <div className="bg-black/20 backdrop-blur-sm border border-white/5 p-3.5 rounded-xl transition hover:bg-black/30">
            <span className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider block flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" /> Academic CGPA
            </span>
            <span className="font-black text-emerald-300 text-sm mt-1 block font-mono">
              {currentStudent?.cgpa || 8.95} <span className="text-xs font-normal text-emerald-400/70">/ 10.0</span>
            </span>
            <span className="text-[10px] text-emerald-400/80 block mt-0.5">First Class with Distinction</span>
          </div>

          <div className="bg-black/20 backdrop-blur-sm border border-white/5 p-3.5 rounded-xl transition hover:bg-black/30">
            <span className="text-[10px] text-amber-300 uppercase font-bold tracking-wider block flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> Placement Status
            </span>
            <span className="font-black text-amber-400 text-sm mt-1 block">Internship In Progress</span>
            <span className="text-[10px] text-amber-300/80 block mt-0.5">Corporate Track Assigned</span>
          </div>
        </div>
      </div>

      {/* Mandatory Consent Banner if not joined */}
      {myBatch && myBatchStudent && !myBatchStudent.has_joined && (
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-[#F07421] to-orange-600 rounded-2xl p-6 shadow-xl text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  Mandatory Onboarding Step: "JOIN INTERNSHIP" Digital Consent
                </h3>
                <p className="text-xs text-white/90 mt-1 leading-relaxed max-w-2xl">
                  You have been selected by <strong>{myBatch.company?.name}</strong> for <strong>{myBatch.title}</strong> (Stipend: ₹{(myBatch.stipend || myBatch.stipend_amount)?.toLocaleString()}/mo). Please record your cryptographic student acceptance to unlock attendance check-ins.
                </p>
              </div>
            </div>
            <button
              onClick={handleJoinConsent}
              className="px-6 py-3 bg-white hover:bg-slate-50 text-[#0E2350] rounded-xl text-xs font-black shadow-lg hover:shadow-xl transition-all flex items-center gap-2 shrink-0 transform active:scale-95"
            >
              <FileCheck2 className="w-4 h-4 text-[#F07421]" />
              <span>I ACCEPT & JOIN INTERNSHIP</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. TODAY'S ATTENDANCE BIOMETRIC COMMAND CENTER */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-sm transition hover:shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
              todayRecord
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-amber-50 text-[#F07421] border border-amber-200'
            }`}>
              <CalendarCheck className="w-6 h-6" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-lg sm:text-xl font-black text-[#0E2350]">
                  Today's Attendance
                </h2>
                {todayRecord ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {todayRecord.is_late ? 'Marked (Late)' : 'Present (Verified)'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    Awaiting Check-in
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Multi-factor verified check-in using GPS geofence perimeter and live facial biometric match.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {!todayRecord ? (
              <button
                onClick={() => setShowSelfAttendanceModal(true)}
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-[#F07421] via-orange-500 to-[#E05E09] hover:from-[#D96214] hover:to-[#C55005] text-white rounded-xl text-xs font-black shadow-lg hover:shadow-orange-500/25 transition-all flex items-center justify-center gap-2.5 transform active:scale-95"
              >
                <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </div>
                <span>Mark Today's Attendance</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowSelfAttendanceModal(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#F07421] to-orange-600 hover:from-[#D96214] hover:to-[#C55005] text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 transform active:scale-95"
                  title="Re-open guided verification to test selfie and GPS again"
                >
                  <Camera className="w-3.5 h-3.5 text-white" />
                  <span>Test Verification Again</span>
                </button>
                <button
                  onClick={handleResetToday}
                  className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                  title="Clear today's record to reset check-in state back to Not Marked"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                  <span>Reset Today</span>
                </button>
                <Link
                  to="/attendance"
                  className="px-4 py-2.5 bg-[#EEF2FA] hover:bg-blue-100 text-[#0E2350] border border-[#2A4E96]/30 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-2xs hover:shadow"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

        </div>

        {/* 4 Interactive Biometric Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
          <div className="bg-slate-50/80 border border-slate-200/70 p-4 rounded-xl hover:border-blue-200 transition">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Internship Company</span>
            <p className="font-extrabold text-[#0E2350] mt-1 text-sm truncate">
              {myBatch?.company?.name || 'PixelWind Technology Pvt Ltd'}
            </p>
            <span className="text-xs text-slate-500 block truncate mt-0.5">
              {myBatch?.title || 'Full-Stack Web Engineering'}
            </span>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/70 p-4 rounded-xl hover:border-blue-200 transition">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Internship Batch</span>
            <p className="font-mono font-bold text-[#0E2350] mt-1 text-sm">
              {myBatch?.batch_code || 'KD-2026-PIX-GDCNL-036'}
            </p>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Status: Active Batch
            </span>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/70 p-4 rounded-xl hover:border-blue-200 transition">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Attendance Timing</span>
            <p className="font-bold text-slate-800 mt-1 text-sm font-mono">
              {batchSettings?.start_time || '08:00'} – {batchSettings?.end_time || '22:00'}
            </p>
            <span className="text-xs text-slate-500 block mt-0.5">
              {batchSettings?.working_days?.length ? `${batchSettings.working_days.length} Days/Wk` : '7 Days/Wk'}
            </span>
          </div>

          <div className={`p-4 rounded-xl border transition ${
            todayRecord
              ? 'bg-emerald-50/70 border-emerald-200/80'
              : 'bg-amber-50/50 border-amber-200/70'
          }`}>
            <span className="text-[10px] uppercase font-bold tracking-wider block text-slate-500">Today's Check-in</span>
            {todayRecord ? (
              <div>
                <span className="font-black text-emerald-800 mt-1 block text-sm font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {todayRecord.check_in_time || 'Verified'}
                </span>
                <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">
                  Location & Face Verified ✓
                </span>
              </div>
            ) : (
              <div>
                <span className="font-bold text-amber-800 mt-1 block text-sm flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" /> Ready to Check-in
                </span>
                <span className="text-[11px] text-amber-700 font-medium block mt-0.5">
                  GPS perimeter unlocked
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. ASSIGNED INTERNSHIP & LIVE ATTENDANCE ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Assigned Internship Details */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F07421] flex items-center justify-center border border-orange-200/60">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#0E2350]">
                  Assigned Internship Details
                </h3>
                <p className="text-xs text-slate-500">Corporate industry placement & supervisor details</p>
              </div>
            </div>
            {myBatch && <StatusBadge status={myBatch.status} size="sm" />}
          </div>

          {myBatch ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50/40 p-4 rounded-xl border border-slate-200/60">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono text-[#0E2350] bg-white border border-slate-200 px-2.5 py-0.5 rounded-md font-bold shadow-2xs">
                    {myBatch.batch_code}
                  </span>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                    {myBatch.domain || 'Engineering & Technology'}
                  </span>
                </div>

                <h2 className="text-lg font-black text-[#0E2350] mt-2">{myBatch.title}</h2>
                <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-1.5">
                  <Building2 className="w-4 h-4 text-[#F07421] shrink-0" />
                  <strong className="text-slate-800">{myBatch.company?.name}</strong> • Work Location: {myBatch.location} ({myBatch.mode?.toUpperCase() || 'ONSITE'})
                </p>
              </div>

              {/* 3 Detailed Specification Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Company Supervisor</span>
                  <p className="font-extrabold text-[#0E2350] mt-1 text-sm truncate">
                    {myBatch.mentor?.full_name || myBatch.company?.authorized_person_name || 'Pooja Deshmukh'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{myBatch.mentor?.designation || 'Principal Frontend Architect'}</p>
                </div>

                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/60">
                  <span className="text-[10px] text-emerald-700 uppercase font-bold tracking-wider block">Monthly Stipend</span>
                  <p className="font-black text-emerald-800 mt-1 text-sm font-mono">
                    ₹{(myBatch.stipend || myBatch.stipend_amount || 15000)?.toLocaleString()} <span className="text-xs font-medium text-emerald-600">/ mo</span>
                  </p>
                  <p className="text-xs text-emerald-700/80 mt-0.5">Direct Bank Transfer</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Duration & Dates</span>
                  <p className="font-bold text-slate-800 mt-1 text-xs">
                    {myBatch.start_date || '2026-06-01'} to {myBatch.end_date || '2026-08-31'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{myBatch.working_hours || '9:30 AM – 5:30 PM (Mon–Fri)'}</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Link
                  to="/attendance"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2A4E96] hover:text-[#0E2350] hover:underline transition"
                >
                  <span>View Full Attendance History</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-[11px] text-slate-400">Official APSCHE Internship Scheme</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-10 text-center">No active internship batch assigned yet.</p>
          )}
        </div>

        {/* Right 1 Col: Modern Radial Attendance Overview */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-[#0E2350]">
                  Attendance Overview
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                {attendancePercent}%
              </span>
            </div>

            {/* Radial SVG Circular Gauge */}
            <div className="py-4 text-center">
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className="text-slate-100"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  {/* Progress Circle with Gradient */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="url(#emeraldGrad)"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-800 tracking-tight font-mono">{attendancePercent}%</span>
                  <span className="text-[9px] uppercase font-extrabold text-emerald-600 tracking-wider">Compliance</span>
                </div>
              </div>

              {/* 4 Stat Breakdown Tiles */}
              <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60">
                  <p className="text-[9px] text-slate-400 uppercase font-bold">Total</p>
                  <p className="text-sm font-black text-slate-800 mt-0.5">{totalDays}</p>
                </div>

                <div className="bg-emerald-50/70 p-2 rounded-xl border border-emerald-200/60">
                  <p className="text-[9px] text-emerald-700 uppercase font-bold">Present</p>
                  <p className="text-sm font-black text-emerald-800 mt-0.5">{presentCount}</p>
                </div>

                <div className="bg-amber-50/70 p-2 rounded-xl border border-amber-200/60">
                  <p className="text-[9px] text-amber-700 uppercase font-bold">Late</p>
                  <p className="text-sm font-black text-amber-800 mt-0.5">{lateCount}</p>
                </div>

                <div className="bg-rose-50/70 p-2 rounded-xl border border-rose-200/60">
                  <p className="text-[9px] text-rose-700 uppercase font-bold">Absent</p>
                  <p className="text-sm font-black text-rose-800 mt-0.5">{absentCount}</p>
                </div>
              </div>

              {/* Cryptographic Trust Shield */}
              <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/60 p-3 rounded-xl text-[11px] text-[#0E2350] text-left mt-4">
                <div className="flex items-center gap-1.5 font-bold text-blue-900">
                  <ShieldCheck className="w-4 h-4 text-[#2A4E96]" />
                  <span>Multi-Factor Biometric Trust</span>
                </div>
                <p className="text-slate-600 text-[10px] mt-1 leading-relaxed">
                  Attendance is cryptographically logged using high-accuracy GPS geofence and live facial identity verification.
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/attendance"
            className="w-full py-2.5 bg-slate-50 hover:bg-blue-50 text-[#0E2350] hover:text-blue-900 rounded-xl text-xs font-black border border-slate-200 text-center transition-all block shadow-2xs hover:shadow-sm"
          >
            Open Attendance Calendar
          </Link>
        </div>
      </div>

      {/* Student Self Attendance Guided Verification Modal */}
      {showSelfAttendanceModal && (
        <StudentSelfAttendanceModal
          batch={myBatch || batches[0] || db.batches[0]}
          studentId={studentId}
          studentUser={currentUser}
          onClose={() => setShowSelfAttendanceModal(false)}
          onSuccess={() => {
            setShowSelfAttendanceModal(false);
            setAttendance([...db.attendance]);
          }}
        />
      )}
    </div>
  );
};

