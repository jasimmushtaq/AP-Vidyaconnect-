// ============================================================================
// AP VIDYACONNECT — BATCH DETAIL & MANAGEMENT PAGE
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { WorkflowTimeline } from '../../components/common/WorkflowTimeline';
import { InternshipBatch } from '../../types/database';
import { BatchActivationModal } from '../../components/batches/BatchActivationModal';
import { BatchActivationProgressModal } from '../../components/batches/BatchActivationProgressModal';
import { BatchActivationService, ActivationProgressUpdate } from '../../services/batchActivationService';
import {
  Briefcase,
  Building2,
  School,
  Calendar,
  Users,
  CheckCircle2,
  Play,
  FileCheck2,
  CalendarCheck,
  CheckSquare,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Sparkles,
  X,
  Check,
  Lock,
  ExternalLink,
  Mail,
  RefreshCw,
  MapPin,
  Sliders
} from 'lucide-react';

export const BatchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentRole, currentUser } = useAuth();
  const [batch, setBatch] = useState<InternshipBatch | null>(null);
  const [showActivationConfirm, setShowActivationConfirm] = useState(false);
  const [activationProgress, setActivationProgress] = useState<ActivationProgressUpdate | null>(null);

  useEffect(() => {
    const load = () => {
      const match = db.batches.find(b => b.id === id);
      if (match) setBatch({ ...match });
    };
    load();
    const unsub = db.subscribe(load);
    return unsub;
  }, [id]);

  if (!batch) {
    return (
      <div className="bg-white rounded-xl border border-[#E3E6EB] p-12 text-center text-gray-500 text-xs">
        Batch not found.
      </div>
    );
  }

  const isCompanyOrMentor = currentRole === 'company_admin' || currentRole === 'mentor';
  const isSuperAdmin = currentRole === 'super_admin';

  const handleStartActivationProcess = async () => {
    setShowActivationConfirm(false);
    try {
      await BatchActivationService.activateBatch(
        batch,
        currentUser,
        (prog) => setActivationProgress({ ...prog })
      );
    } catch (err) {
      console.error('Batch activation error:', err);
    }
  };

  const handleCompleteBatch = () => {
    db.completeBatch(batch.id, currentUser);
    setBatch(prev => prev ? { ...prev, status: 'completed' } : null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. TOP HERO COMMAND BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A1938] via-[#0E2350] to-[#163673] border border-blue-900/40 p-6 sm:p-8 shadow-xl text-white space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-blue-200 bg-blue-500/20 px-2.5 py-0.5 rounded-md border border-blue-400/30">
                {batch.batch_code}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Institution Final Accepted
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {batch.title}
            </h1>
            <p className="text-xs text-blue-200/90 max-w-2xl leading-relaxed">
              State-chartered active cohort with real-time GPS mobile geofencing, verified mentor evaluations, and NEP 2020 credit synchronization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <StatusBadge status={batch.status} />

            {currentRole === 'company_admin' && (
              <Link
                to={`/batches/${batch.id}/attendance-settings`}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-2 backdrop-blur-md"
              >
                <MapPin className="w-4 h-4 text-[#F07421]" />
                <span>Geofence Settings</span>
              </Link>
            )}

            {/* Lifecycle RPC Actions */}
            {batch.status === 'created' && (isCompanyOrMentor || isSuperAdmin) && (
              <button
                onClick={() => setShowActivationConfirm(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-2 active:scale-95"
              >
                <Play className="w-4 h-4" />
                <span>Activate Internship Batch</span>
              </button>
            )}

            {batch.status === 'active' && (isCompanyOrMentor || isSuperAdmin) && (
              <button
                onClick={handleCompleteBatch}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-2 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Batch Completed</span>
              </button>
            )}
          </div>
        </div>

        {/* Workflow Timeline */}
        <div className="pt-4 border-t border-blue-800/40 relative z-10">
          <WorkflowTimeline currentStatus={batch.status} />
        </div>
      </div>

      {/* Grid: Cohort Specs & Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Cohort Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-[#0E2350] border-b border-slate-100 pb-2">
              Batch Operational Parameters
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#F6F7F9] p-3 rounded-lg">
                <p className="text-gray-400 uppercase font-bold text-[10px]">Host Company</p>
                <p className="font-bold text-[#F07421] mt-0.5">{batch.company?.name}</p>
                <p className="text-[10px] text-gray-500 font-mono">CIN: {batch.company?.cin}</p>
              </div>

              <div className="bg-[#F6F7F9] p-3 rounded-lg">
                <p className="text-gray-400 uppercase font-bold text-[10px]">Originating College</p>
                <p className="font-bold text-[#0E2350] mt-0.5">{batch.institution?.name}</p>
                <p className="text-[10px] text-gray-500 font-mono">{batch.institution?.code}</p>
              </div>

              <div className="bg-[#F6F7F9] p-3 rounded-lg">
                <p className="text-gray-400 uppercase font-bold text-[10px]">Company Supervisor</p>
                <p className="font-bold text-gray-800 mt-0.5">{batch.mentor?.full_name || batch.company?.authorized_person_name || 'Corporate Lead'}</p>
                <p className="text-[10px] text-gray-500">{batch.mentor?.designation || 'Technical Lead'}</p>
              </div>

              <div className="bg-[#F6F7F9] p-3 rounded-lg">
                <p className="text-gray-400 uppercase font-bold text-[10px]">Monthly Stipend</p>
                <p className="font-bold text-emerald-700 mt-0.5">₹{batch.stipend_amount?.toLocaleString()} / mo</p>
                <p className="text-[10px] text-gray-500">Working Hours: {batch.working_hours}</p>
              </div>

              <div className="bg-[#F6F7F9] p-3 rounded-lg col-span-2">
                <p className="text-gray-400 uppercase font-bold text-[10px]">Location & Work Environment</p>
                <p className="font-bold text-gray-800 mt-0.5">{batch.location} ({batch.mode.toUpperCase()})</p>
              </div>
            </div>

            {/* Quick module links */}
            <div className="pt-2 flex flex-wrap gap-2">
              {currentRole === 'company_admin' && (
                <Link
                  to={`/batches/${batch.id}/attendance-settings`}
                  className="px-3.5 py-2 bg-[#FFF3EA] hover:bg-orange-100 text-[#0E2350] rounded-lg text-xs font-bold border border-[#F07421]/30 transition-colors flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#F07421]" />
                  Attendance Geofence & Timing
                </Link>
              )}

              <Link
                to="/attendance"
                className="px-3.5 py-2 bg-[#F6F7F9] hover:bg-[#EEF2FA] text-[#0E2350] rounded-lg text-xs font-bold border border-[#E3E6EB] transition-colors flex items-center gap-1.5"
              >
                <CalendarCheck className="w-3.5 h-3.5 text-[#1C8A3C]" />
                Daily Attendance Register
              </Link>
            </div>

          </div>
        </div>

        {/* Right 1 Col: Enrolled Students */}
        <div className="bg-white rounded-xl border border-[#E3E6EB] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="text-sm font-bold text-[#0E2350] flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#2A4E96]" />
              Confirmed Interns ({batch.students?.length || 0})
            </h3>
          </div>

          <div className="space-y-3">
            {batch.students?.map((bs) => {
              const stu = bs.student || db.students.find(s => s.id === bs.student_id);
              return (
                <div
                  key={bs.id}
                  className="p-3 rounded-lg border border-gray-100 bg-[#F6F7F9]/60 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-gray-900">{stu?.full_name}</p>
                    {bs.has_joined ? (
                      <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Consent Signed
                      </span>
                    ) : (
                      <span className="text-amber-800 font-bold text-[10px] bg-amber-50 px-2 py-0.5 rounded">
                        Pending Consent
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 font-mono">Roll: {stu?.roll_number} • CGPA: {stu?.cgpa}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Confirmation Modal (Item 1) */}
      {showActivationConfirm && (
        <BatchActivationModal
          batch={batch}
          onConfirm={handleStartActivationProcess}
          onClose={() => setShowActivationConfirm(false)}
        />
      )}

      {/* Realtime Step Progress Modal */}
      {activationProgress && (
        <BatchActivationProgressModal
          progress={activationProgress}
          onClose={() => setActivationProgress(null)}
        />
      )}
    </div>
  );
};
