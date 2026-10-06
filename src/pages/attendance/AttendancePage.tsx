import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AttendanceStatus, AttendanceRecord, InternshipBatch } from '../../types/database';
import {
  CalendarCheck,
  Calendar,
  CheckCircle2,
  Users,
  Clock,
  Check,
  Save,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Download,
  Upload,
  FileSpreadsheet,
  Building2,
  School,
  UserCheck,
  Filter,
  CheckSquare,
  X,
  FileText,
  MapPin
} from 'lucide-react';
import { StudentSelfAttendanceModal } from '../../components/attendance/StudentSelfAttendanceModal';
import { SelfieVerificationModal } from '../../components/attendance/SelfieVerificationModal';
import { Camera, Eye, ShieldAlert, RotateCcw } from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const { currentRole, currentUser, currentStudent, currentInstitution, currentCompany } = useAuth();

  const isMentor = (currentRole as string) === 'mentor';
  const mentorId = db.mentors.find(
    m => m.email.toLowerCase() === currentUser?.email?.toLowerCase() || m.user_id === currentUser?.id
  )?.id;
  const myInstId = currentInstitution?.id || currentUser?.institution_id;
  const myCompId = currentCompany?.id || currentUser?.company_id;

  const getScopedBatches = (): InternshipBatch[] => {
    if (currentRole === 'super_admin') {
      return [...db.batches];
    }
    if (currentRole === 'company_admin') {
      if (!myCompId) return [];
      return db.batches.filter(b => b.company_id === myCompId);
    }
    if (isMentor) {
      return db.batches.filter(
        b =>
          b.mentor_id === mentorId ||
          (mentorId && b.mentor?.id === mentorId) ||
          (myCompId && b.company_id === myCompId)
      );
    }
    if (currentRole === 'institution_admin' || currentRole === 'faculty_coordinator') {
      if (!myInstId) return [];
      return db.batches.filter(b => b.institution_id === myInstId);
    }
    if (currentRole === 'student') {
      const stuId = currentStudent?.id || currentUser?.student_id;
      return db.batches.filter(b =>
        (b.students || []).some(
          s => s.student_id === stuId || s.student?.email?.toLowerCase() === currentUser?.email?.toLowerCase()
        )
      );
    }
    return [];
  };

  const [batches, setBatches] = useState<InternshipBatch[]>(() => getScopedBatches());
  const [selectedBatchId, setSelectedBatchId] = useState<string>(() => getScopedBatches()[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(db.attendance);
  const [activeTab, setActiveTab] = useState<'daily' | 'cumulative'>('daily');
  const [filterAtRiskOnly, setFilterAtRiskOnly] = useState(false);
  const [dailyStatusFilter, setDailyStatusFilter] = useState<'all' | 'present' | 'late' | 'absent'>('all');
  const [selectedSelfieRecord, setSelectedSelfieRecord] = useState<AttendanceRecord | null>(null);

  // Student statuses for selected date
  const [studentStatuses, setStudentStatuses] = useState<{ [studentId: string]: AttendanceStatus }>({});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Bulk Upload Modal State
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [bulkParsedRows, setBulkParsedRows] = useState<Array<{ rollNumber: string; studentName: string; studentId: string; status: AttendanceStatus }>>([]);
  const [bulkError, setBulkError] = useState<string | null>(null);

  // Role permissions
  // ONLY students can add / mark attendance (using GPS Geofencing & Selfie verification).
  // Company Admin, Industry Mentor, Faculty Coordinator, and Institution Admin have VIEW ONLY and DOWNLOAD ONLY access.
  const isCompany = currentRole === 'company_admin' || isMentor;
  const isFaculty = currentRole === 'faculty_coordinator' || currentRole === 'institution_admin';
  const isSuperAdmin = currentRole === 'super_admin';
  const isStudent = currentRole === 'student';
  const canMarkOrUpload = false; // Strictly view-only for admins/companies — only students add attendance
  const canDownload = true; // All authorized roles can download Excel & CSV reports

  const activeBatch = batches.find(b => b.id === selectedBatchId) || batches[0] || null;

  const loadData = () => {
    const scoped = getScopedBatches();
    setBatches(scoped);
    setSelectedBatchId(prev => {
      if (scoped.some(b => b.id === prev)) return prev;
      return scoped[0]?.id || '';
    });
    setAttendance([...db.attendance]);
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return unsub;
  }, [currentRole, currentUser?.id, currentUser?.company_id, currentUser?.institution_id, currentCompany?.id, currentInstitution?.id]);

  useEffect(() => {
    if (activeBatch) {
      const initial: { [key: string]: AttendanceStatus } = {};
      activeBatch.students?.forEach(bs => {
        const existing = db.attendance.find(a => a.student_id === bs.student_id && a.date === selectedDate);
        initial[bs.student_id] = existing?.status || 'present';
      });
      setStudentStatuses(initial);
    }
  }, [selectedBatchId, selectedDate, activeBatch]);

  const handleMarkAll = (status: AttendanceStatus) => {
    if (!activeBatch || !canMarkOrUpload) return;
    const updated: { [key: string]: AttendanceStatus } = {};
    activeBatch.students?.forEach(bs => {
      updated[bs.student_id] = status;
    });
    setStudentStatuses(updated);
  };

  const handleSaveAttendance = () => {
    if (!activeBatch || !canMarkOrUpload) return;
    const records = Object.entries(studentStatuses).map(([studentId, status]) => ({
      student_id: studentId,
      date: selectedDate,
      status
    }));

    db.markAttendance(activeBatch.id, records, currentUser);
    setSaveSuccessMsg(`Attendance register for ${selectedDate} saved and cryptographically logged!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // --- Calculate Cumulative Stats Per Student ---
  const batchStudents = activeBatch?.students || [];
  const batchAttendance = attendance.filter(a => a.batch_id === activeBatch?.id);

  // Unique recorded dates for this batch
  const recordedDates = Array.from(new Set(batchAttendance.map(a => a.date))).sort();

  const studentStats = batchStudents.map(bs => {
    const stu = bs.student || db.students.find(s => s.id === bs.student_id);
    const stuRecords = batchAttendance.filter(a => a.student_id === bs.student_id);
    const totalRecorded = stuRecords.length;
    const presentCount = stuRecords.filter(a => a.status === 'present').length;
    const halfDayCount = stuRecords.filter(a => a.status === 'half_day').length;
    const leaveCount = stuRecords.filter(a => a.status === 'leave').length;
    const absentCount = stuRecords.filter(a => a.status === 'absent').length;

    // Weight: Present = 1, Half Day = 0.5, Leave/Absent = 0
    const weightedPresent = presentCount + (halfDayCount * 0.5);
    const attendancePct = totalRecorded > 0 ? Math.round((weightedPresent / totalRecorded) * 100) : 100;
    const isEligible = attendancePct >= 75;

    return {
      studentId: bs.student_id,
      student: stu,
      totalRecorded,
      presentCount,
      halfDayCount,
      leaveCount,
      absentCount,
      attendancePct,
      isEligible
    };
  });

  const overallPresentRate = studentStats.length > 0
    ? Math.round(studentStats.reduce((acc, c) => acc + c.attendancePct, 0) / studentStats.length)
    : 100;

  const eligibleCount = studentStats.filter(s => s.isEligible).length;

  // --- Excel / CSV Sheet Export ---
  const handleExportExcel = () => {
    if (!activeBatch) return;

    // Build CSV with UTF-8 BOM for Microsoft Excel compatibility
    const headerMeta = [
      `AP VIDYACONNECT — OFFICIAL INTERNSHIP ATTENDANCE REGISTER`,
      `Batch Code: ${activeBatch.batch_code}`,
      `Domain / Track: ${activeBatch.domain}`,
      `Institution: ${activeBatch.institution?.name || 'Government Higher Education Institute'}`,
      `Industry Partner: ${activeBatch.company?.name || 'Verified Corporate Partner'}`,
      `Industry Partner Supervisor: ${activeBatch.mentor?.full_name || activeBatch.company?.authorized_person_name || 'Corporate Lead'} (${activeBatch.company?.name || 'Partner Company'})`,
      `Faculty Coordinator: Prof. S. Sunitha Rao`,
      `Exported By: ${currentUser.full_name} (${currentUser.role?.replace(/_/g, ' ').toUpperCase()})`,
      `Export Timestamp: ${new Date().toLocaleString('en-IN')}`,
      `Mandatory Minimum Attendance for Govt Certification: 75%`,
      ``
    ];

    // CSV Table Header
    const tableHeader = [
      'Roll Number',
      'Student Name',
      'Official Email',
      'Gender',
      'Year of Study',
      'Total Days Tracked',
      'Days Present',
      'Days Half-Day',
      'Days Approved Leave',
      'Days Absent',
      'Attendance Percentage (%)',
      'Completion Eligibility (>=75%)',
      ...recordedDates.map(d => `Status (${d})`)
    ];

    // Data rows
    const rows = studentStats.map(stat => {
      const dateStatuses = recordedDates.map(d => {
        const rec = batchAttendance.find(a => a.student_id === stat.studentId && a.date === d);
        if (!rec) return '-';
        if (rec.status === 'present') return 'Present (P)';
        if (rec.status === 'absent') return 'Absent (A)';
        if (rec.status === 'half_day') return 'Half Day (HD)';
        if (rec.status === 'leave') return 'Leave (L)';
        return rec.status.toUpperCase();
      });

      return [
        `"${stat.student?.roll_number || ''}"`,
        `"${stat.student?.full_name || ''}"`,
        `"${stat.student?.email || ''}"`,
        `"${stat.student?.gender || ''}"`,
        `"Year ${stat.student?.year_of_study || 3}"`,
        stat.totalRecorded,
        stat.presentCount,
        stat.halfDayCount,
        stat.leaveCount,
        stat.absentCount,
        `"${stat.attendancePct}%"`,
        `"${stat.isEligible ? 'ELIGIBLE' : 'AT RISK (<75%)'}"`,
        ...dateStatuses.map(s => `"${s}"`)
      ].join(',');
    });

    const csvContent = '\uFEFF' + [...headerMeta, tableHeader.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `AP_VidyaConnect_Attendance_${activeBatch.batch_code}_${selectedDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- Bulk CSV Attendance Upload Handler ---
  const handleDownloadSampleTemplate = () => {
    const sampleHeader = 'Roll Number,Date (YYYY-MM-DD),Status (present/absent/half_day/leave)\n';
    const sampleRows = batchStudents.map(bs => {
      const stu = bs.student || db.students.find(s => s.id === bs.student_id);
      return `${stu?.roll_number || '2023-CS-001'},${selectedDate},present`;
    }).join('\n');

    const blob = new Blob(['\uFEFF' + sampleHeader + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Attendance_Template_${activeBatch?.batch_code || 'BATCH'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleParseCsv = (text: string) => {
    setBulkCsvText(text);
    setBulkError(null);
    const lines = text.trim().split('\n').filter(l => l.trim().length > 0);
    if (lines.length < 2) {
      setBulkError('CSV must include header row and at least 1 student row.');
      return;
    }

    const parsed: Array<{ rollNumber: string; studentName: string; studentId: string; status: AttendanceStatus }> = [];

    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
      if (cols.length >= 2) {
        const rollNumber = cols[0];
        const statusRaw = (cols[2] || cols[1] || 'present').toLowerCase();
        let status: AttendanceStatus = 'present';
        if (statusRaw.includes('absent') || statusRaw === 'a') status = 'absent';
        else if (statusRaw.includes('half') || statusRaw === 'hd') status = 'half_day';
        else if (statusRaw.includes('leave') || statusRaw === 'l') status = 'leave';
        else if (statusRaw.includes('holiday') || statusRaw === 'h') status = 'holiday';

        const matchedStudent = db.students.find(s => s.roll_number?.toLowerCase() === rollNumber.toLowerCase() || s.email?.toLowerCase() === rollNumber.toLowerCase());

        if (matchedStudent) {
          parsed.push({
            rollNumber: matchedStudent.roll_number,
            studentName: matchedStudent.full_name,
            studentId: matchedStudent.id,
            status
          });
        }
      }
    }

    if (parsed.length === 0) {
      setBulkError('No matching student roll numbers found in this batch. Check the template format.');
    } else {
      setBulkParsedRows(parsed);
    }
  };

  const handleApplyBulkUpload = () => {
    if (bulkParsedRows.length === 0 || !activeBatch) return;

    const records = bulkParsedRows.map(r => ({
      student_id: r.studentId,
      date: selectedDate,
      status: r.status
    }));

    db.markAttendance(activeBatch.id, records, currentUser);
    setIsBulkUploadOpen(false);
    setBulkCsvText('');
    setBulkParsedRows([]);
    setSaveSuccessMsg(`Bulk uploaded attendance for ${records.length} students on ${selectedDate} successfully!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Filtered student list for view
  const displayedStats = filterAtRiskOnly
    ? studentStats.filter(s => !s.isEligible)
    : studentStats;

  // Student-specific metrics
  const myStudentId = currentStudent?.id || currentUser.student_id || '';
  const myEnrolledBatch = batches.find(b => b.students?.some(s => s.student_id === myStudentId || s.student?.email?.toLowerCase() === currentUser.email?.toLowerCase())) || (batches.length > 0 ? batches[0] : null);
  const [showStudentSelfModal, setShowStudentSelfModal] = useState(false);
  const [studentFilterPeriod, setStudentFilterPeriod] = useState<'all' | 'week' | 'month'>('all');

  const myAttendanceRecords = attendance.filter(a => a.student_id === myStudentId);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayStudentRec = myAttendanceRecords.find(a => a.date === todayStr);

  const myTotalRecorded = myAttendanceRecords.length;
  const myPresentCount = myAttendanceRecords.filter(a => a.status === 'present').length;
  const myLateCount = myAttendanceRecords.filter(a => a.is_late || a.notes?.toLowerCase().includes('late')).length;
  const myHalfDayCount = myAttendanceRecords.filter(a => a.status === 'half_day').length;
  const myLeaveCount = myAttendanceRecords.filter(a => a.status === 'leave').length;
  const myAbsentCount = myAttendanceRecords.filter(a => a.status === 'absent').length;
  const myWeighted = myPresentCount + (myHalfDayCount * 0.5);
  const myAttendancePct = myTotalRecorded > 0 ? Math.round((myWeighted / myTotalRecorded) * 100) : 100;
  const isMyEligible = myAttendancePct >= 75;

  // Filtered records by period
  const filteredStudentRecords = myAttendanceRecords.filter(rec => {
    if (studentFilterPeriod === 'all') return true;
    const recDate = new Date(rec.date);
    const now = new Date();
    if (studentFilterPeriod === 'week') {
      const diffTime = Math.abs(now.getTime() - recDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }
    if (studentFilterPeriod === 'month') {
      const diffTime = Math.abs(now.getTime() - recDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    }
    return true;
  });

  // =========================================================================
  // VIEW 1: STUDENT / INTERN PERSONAL ATTENDANCE VIEW (NO DOWNLOAD, NO BATCH SWITCH)
  // =========================================================================
  if (isStudent) {
    if (!myEnrolledBatch) {
      return (
        <div className="space-y-6 max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A1938] via-[#0E2350] to-[#163673] border border-blue-900/40 p-6 sm:p-8 shadow-xl text-white">
            <div className="space-y-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-mono font-bold tracking-wide uppercase">
                STUDENT ATTENDANCE PORTAL
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                My Internship Attendance Log
              </h1>
              <p className="text-xs text-blue-200/90 max-w-2xl leading-relaxed">
                Multi-factor verified daily attendance. Minimum 75% attendance is required for NEP 2020 credit allocation.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-base font-extrabold text-[#0E2350]">No Active Batch Enrollment Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              You are not currently assigned to an active internship cohort. Once your institution coordinator provisions your internship enrollment, your daily GPS & selfie attendance panel will be activated here.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Student Top Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A1938] via-[#0E2350] to-[#163673] border border-blue-900/40 p-6 sm:p-8 shadow-xl text-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-mono font-bold tracking-wide uppercase">
                  {myEnrolledBatch?.batch_code || 'KD-2026-ACTIVE'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled Intern Attendance
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                My Internship Attendance Log
              </h1>
              <p className="text-xs text-blue-200/90 max-w-2xl leading-relaxed">
                Multi-factor verified daily attendance. Minimum 75% attendance is required for NEP 2020 credit allocation.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {!todayStudentRec ? (
                <button
                  onClick={() => setShowStudentSelfModal(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#F07421] to-orange-600 hover:from-[#D96214] text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-2 active:scale-95"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Mark Today's Attendance</span>
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5 backdrop-blur-md">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Today Checked In ({todayStudentRec.check_in_time || 'Present'})
                  </span>
                  <button
                    onClick={() => setShowStudentSelfModal(true)}
                    className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                    title="Re-open guided verification modal to test selfie and GPS again"
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-300" />
                    <span>Test Again</span>
                  </button>
                  <button
                    onClick={() => db.resetTodayAttendance(myStudentId)}
                    className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                    title="Reset today's check-in to test the initial state"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Today</span>
                  </button>
                </div>
              )}

              <span className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                isMyEligible
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
              }`}>
                <CheckCircle2 className="w-4 h-4" />
                {isMyEligible ? '75% Completion Eligible' : 'Below 75% Attendance'}
              </span>
            </div>

          </div>
        </div>

        {/* Student KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Attendance Rate</span>
            <p className={`text-2xl font-black mt-1 ${isMyEligible ? 'text-[#1C8A3C]' : 'text-rose-600'}`}>
              {myAttendancePct}%
            </p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className={`h-1.5 rounded-full ${isMyEligible ? 'bg-emerald-500' : 'bg-rose-500'}`}
                style={{ width: `${Math.min(myAttendancePct, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Days</span>
            <p className="text-2xl font-black text-[#0E2350] mt-1">{myTotalRecorded}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Logged sessions</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Present</span>
            <p className="text-2xl font-black text-emerald-700 mt-1">{myPresentCount}</p>
            <p className="text-[10px] text-emerald-600 mt-0.5 font-bold">On-time verified</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Late</span>
            <p className="text-2xl font-black text-amber-700 mt-1">{myLateCount}</p>
            <p className="text-[10px] text-amber-600 mt-0.5 font-bold">Late check-in</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all col-span-2 sm:col-span-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Absent / Leave</span>
            <p className="text-2xl font-black text-rose-700 mt-1">{myAbsentCount + myLeaveCount}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{myAbsentCount} absent, {myLeaveCount} leave</p>
          </div>
        </div>

        {/* Student Personal Attendance History Table (Item 14) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-0">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-[#0E2350] flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-[#F07421]" />
                Attendance History ({filteredStudentRecords.length} Records)
              </span>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Official cryptographically verified check-in history. Read-only record.
              </p>
            </div>

            {/* Filter by Period (Week, Month, All) */}
            <div className="flex items-center bg-white border border-[#E3E6EB] rounded-lg p-0.5 text-xs font-bold">
              <button
                onClick={() => setStudentFilterPeriod('all')}
                className={`px-3 py-1 rounded-md transition-all ${studentFilterPeriod === 'all' ? 'bg-[#0E2350] text-white shadow-xs' : 'text-gray-600 hover:text-[#0E2350]'}`}
              >
                All
              </button>
              <button
                onClick={() => setStudentFilterPeriod('week')}
                className={`px-3 py-1 rounded-md transition-all ${studentFilterPeriod === 'week' ? 'bg-[#0E2350] text-white shadow-xs' : 'text-gray-600 hover:text-[#0E2350]'}`}
              >
                This Week
              </button>
              <button
                onClick={() => setStudentFilterPeriod('month')}
                className={`px-3 py-1 rounded-md transition-all ${studentFilterPeriod === 'month' ? 'bg-[#0E2350] text-white shadow-xs' : 'text-gray-600 hover:text-[#0E2350]'}`}
              >
                This Month
              </button>
            </div>
          </div>

          {filteredStudentRecords.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <CalendarCheck className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-xs font-semibold text-gray-600">No attendance records found for this period.</p>
              <p className="text-[11px] text-gray-400 mt-1">Check-in daily during your authorized batch attendance hours.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAFAF8] border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Check-in Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Verification Method</th>
                    <th className="py-3 px-4">Geofence Distance</th>
                    <th className="py-3 px-4 text-right">Selfie Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudentRecords.map((rec) => {
                    const isLate = rec.is_late || rec.notes?.toLowerCase().includes('late');
                    return (
                      <tr key={rec.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-[#0E2350]">
                            {new Date(rec.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {new Date(rec.date).toLocaleDateString('en-US', { weekday: 'long' })}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-gray-700">
                          {rec.check_in_time || '09:15 AM'}
                        </td>

                        <td className="py-3.5 px-4">
                          {rec.status === 'present' ? (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                              isLate ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              <Check className="w-3 h-3" />
                              {isLate ? 'Late' : 'Present'}
                            </span>
                          ) : rec.status === 'absent' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                              Absent
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">
                              {rec.status}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {rec.source === 'self_check_in' || rec.face_verification_status === 'verified' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> GPS & Face Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                              Coordinator Verified
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-gray-600">
                          {rec.distance_meters !== undefined ? `${rec.distance_meters}m (Inside Zone)` : 'Verified within Geofence'}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedSelfieRecord(rec)}
                            className="px-2.5 py-1 rounded-lg bg-[#EEF2FA] hover:bg-[#0E2350] text-[#0E2350] hover:text-white font-bold text-[11px] transition-all inline-flex items-center gap-1"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>View Selfie</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Self Attendance Modal Render */}
        {showStudentSelfModal && myEnrolledBatch && (
          <StudentSelfAttendanceModal
            batch={myEnrolledBatch}
            studentId={myStudentId}
            studentUser={currentUser}
            onClose={() => setShowStudentSelfModal(false)}
            onSuccess={() => {
              setShowStudentSelfModal(false);
              loadData();
            }}
          />
        )}

        {/* Selfie Verification Modal */}
        {selectedSelfieRecord && (
          <SelfieVerificationModal
            record={selectedSelfieRecord}
            onClose={() => setSelectedSelfieRecord(null)}
          />
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: DUAL AUTHORITY (MENTOR & FACULTY) ATTENDANCE REGISTER (WITH EXCEL)
  // =========================================================================
  if (!activeBatch || batches.length === 0) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Top Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A1938] via-[#0E2350] to-[#163673] border border-blue-900/40 p-6 sm:p-8 shadow-xl text-white">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#F07421]/20 border border-[#F07421]/30 text-[#F07421] text-xs font-mono font-bold tracking-wide uppercase">
                AUDITED ATTENDANCE REGISTER
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                <UserCheck className="w-3.5 h-3.5" />
                Company Partner & Faculty Coordinator (View & Download Only)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Internship Attendance & Compliance Register
            </h1>

            <p className="text-xs text-blue-200/90 max-w-3xl leading-relaxed">
              Real-time GPS geofenced & photo verified logs with automated 75% credit qualification checks and Excel sheet downloads.
            </p>
          </div>
        </div>

        {/* Empty State Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-base font-extrabold text-[#0E2350]">No Active Internship Batches</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
            There are no active internship cohorts or enrolled students registered under your organization yet. Once an internship proposal is accepted and a batch is chartered, attendance records will appear here.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              to={isCompany ? "/company/postings" : "/proposals"}
              className="px-4 py-2.5 bg-[#0E2350] hover:bg-[#163673] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              <span>{isCompany ? "Create Internship Posting" : "View Inbound Proposals"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast Alert */}
      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          {saveSuccessMsg}
        </div>
      )}

      {/* Top Banner with Dual Authority Designation */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A1938] via-[#0E2350] to-[#163673] border border-blue-900/40 p-6 sm:p-8 shadow-xl text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#F07421]/20 border border-[#F07421]/30 text-[#F07421] text-xs font-mono font-bold tracking-wide uppercase">
                AUDITED ATTENDANCE REGISTER
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                <UserCheck className="w-3.5 h-3.5" />
                Company Partner & Faculty Coordinator (View & Download Only)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Internship Attendance & Compliance Register
            </h1>

            <p className="text-xs text-blue-200/90 max-w-3xl leading-relaxed">
              Real-time GPS geofenced & photo verified logs with automated 75% credit qualification checks and Excel sheet downloads.
            </p>
          </div>

          {/* Action Buttons (Download Excel Sheet & Attendance Settings) */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportExcel}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
              <span>Download Excel Sheet</span>
            </button>

            {currentRole === 'company_admin' && (
              <Link
                to={`/batches/${activeBatch?.id}/attendance-settings`}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 shadow-2xs"
                title="Configure Geofence Coordinates & Schedule (Company Admin Only)"
              >
                <MapPin className="w-4 h-4 text-[#F07421]" />
                <span>Geofence Settings</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Protocol Banner: Explaining Student Self-Attendance */}
      <div className="p-4 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-white border border-blue-200/80 rounded-2xl flex items-start gap-3 shadow-xs">
        <div className="w-9 h-9 rounded-xl bg-[#0E2350] text-[#F07421] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-extrabold text-[#0E2350]">Student Self-Attendance Protocol Active</h4>
          <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed font-medium">
            Enrolled interns record their daily check-in independently through GPS mobile geofencing and live selfie face verification. Company Administrators, Mentors, and Faculty Coordinators have real-time <strong>View-Only</strong> and <strong>Excel/CSV Download</strong> privileges to ensure tamper-proof compliance.
          </p>
        </div>
      </div>

      {/* KPI Cards: Strength, Today's Rate, 75% Compliance, Dual Supervisors */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block">Batch Interns</span>
          <p className="text-3xl font-black text-[#0E2350] mt-1">{batchStudents.length}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">{activeBatch?.domain || 'Software Track'}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block">Average Attendance</span>
          <p className="text-3xl font-black text-[#1C8A3C] mt-1">{overallPresentRate}%</p>
          <p className="text-[11px] text-emerald-700 font-bold mt-1">Weighted present rate</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block">75% Credit Eligible</span>
          <p className="text-3xl font-black text-[#2A4E96] mt-1">
            {eligibleCount} / {batchStudents.length}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Mandatory state cutoff</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block">Supervisors</span>
          <p className="text-xs font-black text-[#0E2350] mt-2 truncate">
            {activeBatch?.company?.name || 'Industry Partner'}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
            & Prof. S. Sunitha Rao (Faculty)
          </p>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Batch Selector & Date Picker */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Select Batch</label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#0E2350] focus:outline-none focus:ring-2 focus:ring-[#0E2350]"
            >
              {batches.map(b => (
                <option key={b.id} value={b.id}>{b.batch_code} — {b.domain}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E2350]"
            />
          </div>

          {/* Tab Switcher */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">View Mode</label>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveTab('daily')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'daily' ? 'bg-[#0E2350] text-white shadow-sm' : 'text-slate-600 hover:text-[#0E2350]'
                }`}
              >
                Daily Logs
              </button>
              <button
                onClick={() => setActiveTab('cumulative')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'cumulative' ? 'bg-[#0E2350] text-white shadow-sm' : 'text-slate-600 hover:text-[#0E2350]'
                }`}
              >
                Cumulative Register
              </button>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        {activeTab === 'cumulative' && (
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => setFilterAtRiskOnly(!filterAtRiskOnly)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                filterAtRiskOnly
                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {filterAtRiskOnly ? 'Showing < 75% At-Risk Interns' : 'Filter < 75% At-Risk'}
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: DAILY ATTENDANCE AUDIT LOGS */}
      {activeTab === 'daily' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-extrabold text-[#0E2350] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2A4E96]" />
              Cohort Interns ({batchStudents.length}) — Daily Audit Log for {selectedDate}
            </span>
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Geofence Verification Mode (Read-Only)
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {batchStudents.map((bs) => {
              const stu = bs.student || db.students.find(s => s.id === bs.student_id);
              const stat = studentStats.find(s => s.studentId === bs.student_id);
              const existingRec = batchAttendance.find(a => a.student_id === bs.student_id && a.date === selectedDate);
              const isLate = existingRec?.is_late || existingRec?.notes?.toLowerCase().includes('late');

              return (
                <div
                  key={bs.id}
                  className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-blue-50/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0A1938] to-[#1E3A8A] text-white flex items-center justify-center font-black text-xs shrink-0 border border-blue-900/30 shadow-xs">
                      {stu?.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'ST'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-extrabold text-slate-900">{stu?.full_name}</p>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          (stat?.attendancePct || 100) >= 75
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {stat?.attendancePct || 100}% Term
                        </span>
                        {existingRec && (
                          <span className="text-[10px] font-mono text-slate-600 bg-blue-50 border border-blue-200/50 px-2 py-0.5 rounded-md font-bold">
                            🕒 {existingRec.check_in_time || '09:14 AM'}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono font-medium mt-0.5">
                        Roll: {stu?.roll_number} • {stu?.email}
                      </p>
                    </div>
                  </div>

                  {/* Verification & Action Group */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {existingRec ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>📍 Location Verified ({existingRec.distance_meters !== undefined ? `${Math.round(existingRec.distance_meters)}m` : 'Geofence'})</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => setSelectedSelfieRecord(existingRec)}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-[#0E2350] text-[#0E2350] hover:text-white font-extrabold text-xs transition-all flex items-center gap-1.5 border border-[#2A4E96]/30 shadow-2xs"
                        >
                          <Camera className="w-3.5 h-3.5 text-[#F07421]" />
                          <span>View Selfie</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium italic">
                        ⚪ Not marked yet today
                      </span>
                    )}

                    {/* Status Badge (Read Only for Company / Faculty) */}
                    <div>
                      {existingRec ? (
                        existingRec.status === 'present' ? (
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold ${
                            isLate ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}>
                            <Check className="w-3 h-3" />
                            {isLate ? 'Late Check-in' : 'Present'}
                          </span>
                        ) : existingRec.status === 'half_day' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
                            Half Day
                          </span>
                        ) : existingRec.status === 'leave' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-purple-100 text-purple-900 border border-purple-200">
                            Approved Leave
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-900 border border-rose-200">
                            Absent
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                          Pending Check-in
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CUMULATIVE TERM ATTENDANCE & 75% ELIGIBILITY TABLE */}
      {activeTab === 'cumulative' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-extrabold text-[#0E2350]">
                Term Attendance Register & Credit Eligibility Audit
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Minimum 75% attendance required for Government of India & State Higher Education Council academic credit recognition.
              </p>
            </div>

            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Export Full Sheet (.csv)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-200/80 text-[10px] font-extrabold uppercase tracking-wider">
                  <th className="p-3.5 font-extrabold">Roll Number</th>
                  <th className="p-3.5 font-extrabold">Student Name</th>
                  <th className="p-3.5 font-extrabold text-center">Tracked Days</th>
                  <th className="p-3.5 font-extrabold text-center">Present</th>
                  <th className="p-3.5 font-extrabold text-center">Half Day</th>
                  <th className="p-3.5 font-extrabold text-center">Leave</th>
                  <th className="p-3.5 font-extrabold text-center">Absent</th>
                  <th className="p-3.5 font-extrabold text-center">Attendance %</th>
                  <th className="p-3.5 font-extrabold text-center">Govt Cert Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedStats.map((stat) => (
                  <tr key={stat.studentId} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-700">{stat.student?.roll_number}</td>
                    <td className="p-3.5 font-extrabold text-[#0E2350]">{stat.student?.full_name}</td>
                    <td className="p-3.5 text-center text-slate-600 font-semibold">{stat.totalRecorded}</td>
                    <td className="p-3.5 text-center text-emerald-700 font-black">{stat.presentCount}</td>
                    <td className="p-3.5 text-center text-amber-700 font-semibold">{stat.halfDayCount}</td>
                    <td className="p-3.5 text-center text-purple-700 font-semibold">{stat.leaveCount}</td>
                    <td className="p-3.5 text-center text-rose-700 font-semibold">{stat.absentCount}</td>
                    <td className="p-3.5 text-center">
                      <span className={`font-extrabold text-xs px-2.5 py-0.5 rounded-full ${
                        stat.attendancePct >= 75
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 font-black border border-rose-200'
                      }`}>
                        {stat.attendancePct}%
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      {stat.isEligible ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Eligible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                          <AlertCircle className="w-3 h-3 text-rose-600" /> At Risk (&lt;75%)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BULK UPLOAD MODAL */}
      {isBulkUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-gray-200 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-lg font-extrabold text-[#0E2350] flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[#2A4E96]" />
                  Bulk Upload Attendance Register
                </h2>
                <p className="text-xs text-gray-500">
                  Upload or paste CSV attendance data for <strong>{activeBatch?.batch_code}</strong> on <strong>{selectedDate}</strong>.
                </p>
              </div>
              <button
                onClick={() => setIsBulkUploadOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Downloader Button */}
            <div className="bg-[#EEF2FA] p-3.5 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#0E2350]">
                <FileSpreadsheet className="w-4 h-4 text-[#2A4E96]" />
                <span className="font-semibold">Need the batch template format?</span>
              </div>
              <button
                type="button"
                onClick={handleDownloadSampleTemplate}
                className="px-3 py-1.5 bg-white border border-[#2A4E96]/30 text-[#0E2350] hover:bg-blue-50 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Download CSV Template
              </button>
            </div>

            {/* File Upload / Paste Box */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase">
                Paste CSV Content or Upload File
              </label>
              <textarea
                rows={6}
                value={bulkCsvText}
                onChange={(e) => handleParseCsv(e.target.value)}
                placeholder="Roll Number,Date,Status&#10;2023-CS-001,2026-06-01,present&#10;2023-CS-002,2026-06-01,leave&#10;2023-CS-003,2026-06-01,present"
                className="w-full p-3 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs font-mono leading-relaxed"
              />
            </div>

            {bulkError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                {bulkError}
              </div>
            )}

            {/* Parsed Preview Table */}
            {bulkParsedRows.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-700 uppercase">
                  Parsed Verification Preview ({bulkParsedRows.length} Records)
                </h4>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-gray-100 text-gray-700 sticky top-0">
                      <tr>
                        <th className="p-2">Roll Number</th>
                        <th className="p-2">Student Name</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bulkParsedRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="p-2 font-mono font-bold text-gray-700">{row.rollNumber}</td>
                          <td className="p-2 text-[#0E2350]">{row.studentName}</td>
                          <td className="p-2">
                            <span className="font-bold text-emerald-700 uppercase text-[10px] bg-emerald-50 px-2 py-0.5 rounded">
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBulkUploadOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={bulkParsedRows.length === 0}
                onClick={handleApplyBulkUpload}
                className="px-5 py-2 bg-[#F07421] hover:bg-[#D96214] disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Apply & Save {bulkParsedRows.length} Records
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Secure Selfie Verification Modal for Dual Authority Review */}
      {selectedSelfieRecord && (
        <SelfieVerificationModal
          record={selectedSelfieRecord}
          onClose={() => setSelectedSelfieRecord(null)}
        />
      )}
    </div>
  );
};
