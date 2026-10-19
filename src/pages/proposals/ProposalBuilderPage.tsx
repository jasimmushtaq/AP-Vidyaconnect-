// ============================================================================
// AP VIDYACONNECT — PROPOSAL BUILDER WIZARD
// Multi-step Stepper for drafting and submitting verified proposals
// ============================================================================

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';
import { cloudSync } from '../../services/cloudSyncService';
import { InternshipProposal, Student, InternshipMode } from '../../types/database';
import {
  School,
  Building2,
  Calendar,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Search,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const ProposalBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentInstitution, currentUser } = useAuth();
  const [step, setStep] = useState(1);

  const queryCompanyId = searchParams.get('companyId');
  const queryDomain = searchParams.get('domain');

  // Form State
  const [selectedCompanyId, setSelectedCompanyId] = useState(queryCompanyId || db.companies[0]?.id || '');
  const [domain, setDomain] = useState(queryDomain || 'Full-Stack Web Engineering');
  const [internshipType, setInternshipType] = useState('Full-time Industry Immersion');
  const [mode, setMode] = useState<InternshipMode>('onsite');
  const [durationWeeks, setDurationWeeks] = useState(12);
  const [startDate, setStartDate] = useState('2026-06-01');
  const [endDate, setEndDate] = useState('2026-08-31');
  const [stipendRequested, setStipendRequested] = useState(15000);
  const [objectives, setObjectives] = useState('Provide immersive industry exposure on modern production web applications, version control workflows, and cloud deployments.');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([db.students[0]?.id, db.students[1]?.id]);

  const [studentSearch, setStudentSearch] = useState('');

  const companies = db.companies.filter(c => c.verification_status === 'verified');
  const students = db.students;

  const toggleStudent = (stuId: string) => {
    if (selectedStudentIds.includes(stuId)) {
      setSelectedStudentIds(selectedStudentIds.filter(id => id !== stuId));
    } else {
      setSelectedStudentIds([...selectedStudentIds, stuId]);
    }
  };

  const handleSubmitProposal = (asDraft: boolean) => {
    const selectedCompany = db.companies.find(c => c.id === selectedCompanyId);
    const proposalCode = `PROP-2027-${currentInstitution?.code || 'INST'}-${selectedCompany?.name.slice(0, 3).toUpperCase() || 'CMP'}-${Math.floor(100 + Math.random() * 900)}`;

    const proposalStudents = selectedStudentIds.map((sid, idx) => ({
      id: `ps-${Date.now()}-${idx}`,
      proposal_id: `prop-${Date.now()}`,
      student_id: sid,
      student: db.students.find(s => s.id === sid),
      is_accepted_by_company: null
    }));

    const newProposal: InternshipProposal = {
      id: `prop-${Date.now()}`,
      proposal_code: proposalCode,
      institution_id: currentInstitution?.id || 'inst-001',
      institution: currentInstitution,
      company_id: selectedCompanyId,
      company: selectedCompany,
      created_by: currentUser?.id || 'system',
      created_by_name: currentUser?.full_name || 'Faculty Coordinator',
      domain,
      internship_type: internshipType,
      mode,
      duration_weeks: durationWeeks,
      start_date: startDate,
      end_date: endDate,
      stipend_requested: stipendRequested,
      objectives,
      status: asDraft ? 'draft' : 'submitted',
      version: 1,
      students: proposalStudents,
      versions: [
        {
          id: `ver-${Date.now()}`,
          proposal_id: `prop-${Date.now()}`,
          version_number: 1,
          snapshot: { domain, stipendRequested, durationWeeks, studentCount: selectedStudentIds.length },
          changed_by_name: currentUser?.full_name || 'Faculty Coordinator',
          change_summary: asDraft ? 'Draft proposal created' : 'Proposal formally submitted to company',
          created_at: new Date().toISOString()
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.proposals.unshift(newProposal);
    db.persist('proposals');

    // Sync proposal to Supabase PostgreSQL database for cross-browser synchronization
    cloudSync.syncProposalToCloud(newProposal);

    db.logAudit(
      asDraft ? 'save_draft_proposal' : 'submit_proposal',
      'internship_proposal',
      newProposal.id,
      null,
      { code: newProposal.proposal_code, status: newProposal.status },
      { id: currentUser?.id || 'system', name: currentUser?.full_name || 'System', role: currentUser?.role || 'institution_admin' }
    );

    if (!asDraft) {
      db.sendNotification(
        'user-comp-admin',
        'proposal_submitted',
        `New Proposal from ${currentInstitution?.name}`,
        `Proposal ${proposalCode} for ${domain} is ready for review.`,
        `/proposals/${newProposal.id}`
      );
    }

    navigate(`/proposals/${newProposal.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Stepper Header */}
      <div className="bg-white rounded-xl border border-[#E3E6EB] p-6 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0E2350]">
          Create Formal Internship Proposal
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Formulate terms and nominate candidates for two-sided review by verified industry partners.
        </p>

        {/* Stepper indicators */}
        <div className="mt-6 flex items-center justify-between relative max-w-2xl">
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 -z-0" />
          {[
            { n: 1, label: 'Institution' },
            { n: 2, label: 'Company' },
            { n: 3, label: 'Terms & Dates' },
            { n: 4, label: 'Students' },
            { n: 5, label: 'Review' },
          ].map(({ n, label }) => {
            const isCompleted = step > n;
            const isCurrent = step === n;
            return (
              <div key={n} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? 'bg-[#F07421] text-white'
                      : isCurrent
                      ? 'bg-[#0E2350] text-white ring-4 ring-[#EEF2FA]'
                      : 'bg-white border-2 border-gray-300 text-gray-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : n}
                </div>
                <span className={`text-[11px] font-bold mt-1.5 ${isCurrent ? 'text-[#0E2350]' : 'text-gray-500'}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Contents */}
      <div className="bg-white rounded-xl border border-[#E3E6EB] p-6 shadow-sm">
        {/* Step 1: Institution Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#0E2350] flex items-center gap-2 border-b border-gray-100 pb-2">
              <School className="w-4 h-4 text-[#2A4E96]" />
              Originating Institution Details (Prefilled)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#F6F7F9] p-3 rounded-lg">
                <p className="text-gray-400 uppercase font-bold text-[10px]">Institution Name</p>
                <p className="font-bold text-[#0E2350] text-sm mt-0.5">{currentInstitution?.name}</p>
              </div>

              <div className="bg-[#F6F7F9] p-3 rounded-lg">
                <p className="text-gray-400 uppercase font-bold text-[10px]">Affiliated University</p>
                <p className="font-bold text-gray-800 text-sm mt-0.5">{currentInstitution?.affiliated_university}</p>
              </div>

              <div className="bg-[#F6F7F9] p-3 rounded-lg">
                <p className="text-gray-400 uppercase font-bold text-[10px]">AISHE / College Code</p>
                <p className="font-mono font-bold text-gray-800 text-sm mt-0.5">{currentInstitution?.code}</p>
              </div>

              <div className="bg-[#F6F7F9] p-3 rounded-lg">
                <p className="text-gray-400 uppercase font-bold text-[10px]">Accreditation & Standing</p>
                <p className="font-bold text-emerald-700 text-sm mt-0.5">{currentInstitution?.accreditation || 'State Verified'}</p>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
              >
                Proceed to Company Selection <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Company Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#0E2350] flex items-center gap-2 border-b border-gray-100 pb-2">
              <Building2 className="w-4 h-4 text-[#F07421]" />
              Select Target Verified Industry Partner
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {companies.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCompanyId(c.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedCompanyId === c.id
                      ? 'border-[#0E2350] bg-[#EEF2FA]/50 shadow-sm'
                      : 'border-[#E3E6EB] hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-[#0E2350]">{c.name}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">{c.industry}</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-mono">CIN: {c.cin}</p>
                    </div>
                    {selectedCompanyId === c.id && (
                      <CheckCircle2 className="w-5 h-5 text-[#0E2350] shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-5 py-2 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
              >
                Configure Terms & Dates <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Internship Details */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#0E2350] flex items-center gap-2 border-b border-gray-100 pb-2">
              <Calendar className="w-4 h-4 text-[#1C8A3C]" />
              Internship Domain, Mode & Schedule
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Domain / Project Specialization</label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Internship Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as InternshipMode)}
                  className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs"
                >
                  <option value="onsite">Onsite (Company Office)</option>
                  <option value="remote">Remote (Virtual)</option>
                  <option value="hybrid">Hybrid (Office + Remote)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Duration (Weeks)</label>
                <input
                  type="number"
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Requested Stipend (₹/month)</label>
                <input
                  type="number"
                  value={stipendRequested}
                  onChange={(e) => setStipendRequested(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Proposed Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Proposed End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Learning Objectives & Outcomes</label>
                <textarea
                  rows={3}
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-5 py-2 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
              >
                Nominate Students ({selectedStudentIds.length}) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Student Selection */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-[#0E2350] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#2A4E96]" />
                Select Nominated Students ({selectedStudentIds.length} Selected)
              </h3>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by name, skills, roll..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {students
                .filter(s => s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) || s.roll_number.toLowerCase().includes(studentSearch.toLowerCase()))
                .map((s) => {
                  const isSelected = selectedStudentIds.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      onClick={() => toggleStudent(s.id)}
                      className={`p-3 rounded-lg border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isSelected ? 'border-[#0E2350] bg-[#EEF2FA]/50' : 'border-[#E3E6EB] hover:bg-gray-50 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 text-[#0E2350] rounded"
                        />
                        <div>
                          <p className="text-xs font-bold text-gray-900">{s.full_name}</p>
                          <p className="text-[10px] text-gray-500 font-mono">Roll: {s.roll_number} • CGPA: {s.cgpa}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {s.skills?.map((sk) => (
                              <span key={sk} className="text-[9px] bg-white border border-gray-200 px-1.5 py-0.2 rounded text-gray-600">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-[#0E2350]">
                        {isSelected ? 'Selected' : '+ Add'}
                      </span>
                    </div>
                  );
                })}
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                disabled={selectedStudentIds.length === 0}
                onClick={() => setStep(5)}
                className="px-5 py-2 bg-[#0E2350] hover:bg-[#14336F] disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
              >
                Review Proposal <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Final Review & Submission */}
        {step === 5 && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-[#0E2350] border-b border-gray-100 pb-2">
              Proposal Summary & Verification
            </h3>

            <div className="bg-[#F6F7F9] rounded-xl p-4 text-xs space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px]">Institution</p>
                  <p className="font-bold text-[#0E2350] mt-0.5">{currentInstitution?.name}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px]">Target Industry Partner</p>
                  <p className="font-bold text-[#F07421] mt-0.5">{db.companies.find(c => c.id === selectedCompanyId)?.name}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px]">Specialization Domain</p>
                  <p className="font-bold text-gray-800 mt-0.5">{domain}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px]">Mode & Duration</p>
                  <p className="font-bold text-gray-800 mt-0.5">{mode.toUpperCase()} • {durationWeeks} Weeks</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px]">Stipend Requested</p>
                  <p className="font-bold text-emerald-700 mt-0.5">₹{stipendRequested.toLocaleString()} / mo</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px]">Nominated Students</p>
                  <p className="font-bold text-[#2A4E96] mt-0.5">{selectedStudentIds.length} Candidate(s)</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(4)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSubmitProposal(true)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-bold transition-all"
                >
                  Save as Draft
                </button>

                <button
                  onClick={() => handleSubmitProposal(false)}
                  className="px-6 py-2 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-lg text-xs font-bold shadow transition-all flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-[#F07421]" />
                  Submit Formal Proposal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
