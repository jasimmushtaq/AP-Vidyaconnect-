// ============================================================================
// AP VIDYACONNECT — FACULTY COORDINATOR WORKSPACE & DASHBOARD
// Departmental Nodal Hub with Full College Details, Batches, Attendance & Students
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  School,
  Building2,
  Briefcase,
  Users,
  CalendarCheck,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FileText,
  MapPin,
  Mail,
  Phone,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Award
} from 'lucide-react';

export const FacultyDashboard: React.FC = () => {
  const { currentInstitution, currentUser } = useAuth();
  const [batches, setBatches] = useState(db.batches);
  const [proposals, setProposals] = useState(db.proposals);
  const [students, setStudents] = useState(db.students);
  const [attendance, setAttendance] = useState(db.attendance);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setBatches([...db.batches]);
      setProposals([...db.proposals]);
      setStudents([...db.students]);
      setAttendance([...db.attendance]);
    });
    return unsub;
  }, []);

  const instId = currentInstitution?.id || currentUser.institution_id;
  const collegeBatches = instId ? batches.filter(b => b.institution_id === instId) : [];
  const collegeProposals = instId ? proposals.filter(p => p.institution_id === instId) : [];
  const collegeStudents = instId ? students.filter(s => s.institution_id === instId) : [];

  // Faculty coordinator info
  const facCoordinator = db.facultyCoordinators.find(
    f => f.email.toLowerCase() === currentUser.email.toLowerCase() || f.user_id === currentUser.id
  ) || {
    department: 'Computer Science & Engineering',
    designation: 'Associate Professor & Departmental Coordinator',
    assigned_batches_count: collegeBatches.length
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Faculty Welcome & Actions */}
      <div className="bg-white rounded-xl border border-[#E3E6EB] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#EEF2FA] text-[#0E2350] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              FACULTY COORDINATOR PORTAL
            </span>
            <span className="text-emerald-700 text-xs font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Departmental Nodal Supervisor
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0E2350] mt-1">
            Welcome, {currentUser.full_name}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {facCoordinator.designation} • Department of <strong>{facCoordinator.department}</strong>
          </p>
        </div>

        {/* Action Controls for Faculty */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/attendance"
            className="px-3.5 py-2 rounded-lg bg-[#0E2350] hover:bg-[#14336F] text-white text-xs font-bold shadow transition-all flex items-center gap-1.5"
          >
            <CalendarCheck className="w-4 h-4 text-[#F07421]" />
            Upload Attendance
          </Link>

          <Link
            to="/attendance"
            className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            Download Excel Sheet
          </Link>

          <Link
            to="/proposals/new"
            className="px-3.5 py-2 rounded-lg bg-[#F07421] hover:bg-[#D96214] text-white text-xs font-bold shadow transition-all flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            Nominate Candidates
          </Link>
        </div>
      </div>

      {/* INSTITUTION / COLLEGE FULL DETAILS CARD */}
      <div className="bg-white rounded-2xl border-2 border-[#0E2350]/15 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#0E2350] text-[#F07421] flex items-center justify-center font-extrabold text-lg shadow">
              <School className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-[#EEF2FA] text-[#0E2350] px-2 py-0.5 rounded">
                  {currentInstitution?.code || 'GDCK-HYD'}
                </span>
                <span className="text-emerald-700 text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> NAAC A+ Verified Institution
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#0E2350] mt-1">
                {currentInstitution?.name || 'Government Degree College (Autonomous)'}
              </h2>
            </div>
          </div>

          <Link
            to="/profile"
            className="text-xs font-bold text-[#2A4E96] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            Full College Profile →
          </Link>
        </div>

        {/* 4-Column College Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F6F7F9] p-4 rounded-xl text-xs">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Affiliation</span>
            <span className="font-bold text-[#0E2350]">{currentInstitution?.affiliated_university || 'State University'}</span>
          </div>

          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Principal / Head</span>
            <span className="font-bold text-[#0E2350]">{currentInstitution?.principal_name || 'Dr. G. Ramana Rao'}</span>
          </div>

          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Official Contact</span>
            <span className="font-semibold text-gray-700 font-mono text-[11px] block">{currentInstitution?.official_phone || '+91 8682 223456'}</span>
            <span className="text-gray-500 font-mono text-[10px] truncate block">{currentInstitution?.official_email || 'principal@institute.edu.in'}</span>
          </div>

          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Campus Location</span>
            <span className="font-semibold text-gray-700 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              {currentInstitution?.district || 'Hyderabad'}, {currentInstitution?.state || 'Telangana'}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E3E6EB] shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Supervised Batches</span>
          <p className="text-2xl font-extrabold text-[#0E2350] mt-1">{collegeBatches.length}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Active industry cohorts</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E3E6EB] shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Department Interns</span>
          <p className="text-2xl font-extrabold text-[#1C8A3C] mt-1">{collegeStudents.length}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Enrolled candidates</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E3E6EB] shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Attendance Compliance</span>
          <p className="text-2xl font-extrabold text-[#2A4E96] mt-1">94%</p>
          <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">Meet &gt;= 75% state rule</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E3E6EB] shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Proposals Pipeline</span>
          <p className="text-2xl font-extrabold text-[#F07421] mt-1">{collegeProposals.length}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Nominations in review</p>
        </div>
      </div>

      {/* Dual Panel: 1. Assigned Batches & 2. Attendance & Excel Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Assigned Batches */}
        <div className="bg-white rounded-xl border border-[#E3E6EB] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#1C8A3C]" />
              <h3 className="text-sm font-bold text-[#0E2350]">
                Assigned Internship Batches ({collegeBatches.length})
              </h3>
            </div>
            <Link to="/batches" className="text-xs font-bold text-[#2A4E96] hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {collegeBatches.slice(0, 3).map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-lg border border-gray-100 bg-[#F6F7F9]/80 hover:bg-white hover:border-[#2A4E96]/40 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-[#0E2350] bg-[#EEF2FA] px-1.5 py-0.5 rounded">
                      {b.batch_code}
                    </span>
                    <h4 className="text-xs font-bold text-[#0E2350] mt-1">{b.title}</h4>
                    <p className="text-[11px] text-gray-600 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-[#F07421]" />
                      {b.company?.name} • Assigned Mentor: {b.mentor?.full_name}
                    </p>
                  </div>
                  <StatusBadge status={b.status} size="sm" />
                </div>

                <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-semibold">{b.students?.length || 0} Students Assigned</span>
                  <div className="flex items-center gap-3">
                    <Link to="/attendance" className="font-bold text-[#0E2350] hover:underline">Attendance</Link>
                    <Link to={`/batches/${b.id}`} className="font-bold text-[#2A4E96] hover:underline">Details →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Attendance Verification & Excel Sheet Download */}
        <div className="bg-white rounded-xl border border-[#E3E6EB] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-[#F07421]" />
              <h3 className="text-sm font-bold text-[#0E2350]">
                Attendance Auditing & Excel Register
              </h3>
            </div>
            <Link to="/attendance" className="text-xs font-bold text-[#2A4E96] hover:underline flex items-center gap-1">
              Open Register <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-[#EEF2FA] p-4 rounded-xl space-y-3">
            <p className="text-xs text-gray-700 leading-relaxed">
              As the departmental Faculty Coordinator, you have authorized access to upload attendance, verify student compliance against the mandatory <strong>75% minimum state attendance rule</strong>, and download official attendance sheets in Microsoft Excel format.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <Link
                to="/attendance"
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                Download Excel Sheet (.csv)
              </Link>

              <Link
                to="/attendance"
                className="px-3.5 py-2 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <CalendarCheck className="w-4 h-4 text-[#F07421]" />
                Daily Attendance Register
              </Link>
            </div>
          </div>

          {/* Quick Explore Companies Shortcut */}
          <div className="p-3 bg-[#FFF3EA]/50 rounded-xl border border-orange-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F07421]" />
              <span className="text-xs font-bold text-[#0E2350]">Explore Verified Corporate Partners</span>
            </div>
            <Link
              to="/opportunities"
              className="text-xs font-bold text-[#F07421] hover:underline flex items-center gap-1"
            >
              Browse Openings →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
