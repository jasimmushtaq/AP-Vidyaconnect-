import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';
import {
  CalendarCheck,
  Award,
  Users,
  ArrowRight,
  Upload,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';

export const MentorDashboard: React.FC = () => {
  const { currentUser, currentCompany } = useAuth();
  const [batches, setBatches] = useState(db.batches);
  const [attendance, setAttendance] = useState(db.attendance);
  const [evaluations, setEvaluations] = useState(db.evaluations);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setBatches([...db.batches]);
      setAttendance([...db.attendance]);
      setEvaluations([...db.evaluations]);
    });
    return unsub;
  }, []);

  const activeBatch = batches[0];
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.date === todayStr);
  const totalInterns = activeBatch?.students?.length || 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-[#E3E6EB] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#EEF2FA] text-[#0E2350] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              INDUSTRY MENTOR WORKSPACE
            </span>
            <span className="text-emerald-700 text-xs font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Technical Supervisor
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0E2350] mt-1">
            Welcome, {currentUser.full_name}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Assigned Corporate Mentor for <strong>{activeBatch?.title || 'Batch Track'}</strong> ({activeBatch?.batch_code}) at {currentCompany?.name || 'Industry Partner'}.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/attendance"
            className="px-3.5 py-2 rounded-lg bg-[#0E2350] hover:bg-[#14336F] text-white text-xs font-bold shadow transition-all flex items-center gap-1.5"
          >
            <CalendarCheck className="w-4 h-4 text-[#F07421]" />
            Manage Daily Attendance
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Today's Attendance */}
        <div className="bg-white p-5 rounded-xl border border-[#E3E6EB] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Today's Attendance</span>
            <CalendarCheck className="w-5 h-5 text-[#1C8A3C]" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#1C8A3C] mt-2">
            {todayAttendance.length > 0 ? `${todayAttendance.filter(a => a.status === 'present').length}/${totalInterns}` : 'Pending'}
          </p>
          <Link to="/attendance" className="text-[11px] font-bold text-[#1C8A3C] hover:underline mt-1 flex items-center gap-1">
            Mark / Upload Register <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Metric 2: Active Interns */}
        <div className="bg-white p-5 rounded-xl border border-[#E3E6EB] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Active Interns</span>
            <Users className="w-5 h-5 text-[#2A4E96]" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0E2350] mt-2">{totalInterns}</p>
          <p className="text-[11px] text-gray-500 mt-1">In assigned cohort</p>
        </div>

        {/* Metric 3: Attendance Compliance Rate */}
        <div className="bg-white p-5 rounded-xl border border-[#E3E6EB] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase">75% Rule Compliance</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-2">
            100%
          </p>
          <Link to="/attendance" className="text-[11px] font-bold text-emerald-700 hover:underline mt-1 flex items-center gap-1">
            View Eligibility Ledger <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Attendance Verification & Excel Download Hub */}
      <div className="bg-white rounded-xl border border-[#E3E6EB] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-[#1C8A3C]" />
            <h3 className="text-sm font-bold text-[#0E2350]">
              Attendance Verification & Excel Export
            </h3>
          </div>
          <Link to="/attendance" className="text-xs font-bold text-[#2A4E96] hover:underline flex items-center gap-1">
            Open Full Register <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Quick Attendance Summary Card */}
        <div className="bg-[#EEF2FA] p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#0E2350]">Assigned Batch:</span>
            <span className="font-mono font-bold text-[#0E2350] bg-white px-2 py-0.5 rounded shadow-xs">
              {activeBatch?.batch_code}
            </span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Verify daily student attendance logs, upload bulk registers, check the mandatory 75% minimum attendance rule, and export official reports in Microsoft Excel format.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2">
            <Link
              to="/attendance"
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Download Excel Sheet
            </Link>
            <Link
              to="/attendance"
              className="px-3 py-1.5 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              Bulk Upload Attendance
            </Link>
          </div>
        </div>

        {/* Cohort Interns Quick List */}
        <div className="space-y-2 pt-1">
          <h4 className="text-[11px] font-bold text-gray-500 uppercase">Assigned Interns Under Mentorship</h4>
          <div className="divide-y divide-gray-100">
            {activeBatch?.students?.slice(0, 3).map((bs) => {
              const stu = bs.student || db.students.find(s => s.id === bs.student_id);
              return (
                <div key={bs.id} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-gray-900">{stu?.full_name}</p>
                    <p className="text-[10px] text-gray-500 font-mono">Roll: {stu?.roll_number}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Enrolled Intern
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

