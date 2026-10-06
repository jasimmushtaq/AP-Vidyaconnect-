// ============================================================================
// AP VIDYACONNECT — INDUSTRY MENTOR GENERATION & BATCH ASSIGNMENT
// Exclusive Company Admin Portal for Generating Mentor Accounts & Cohort Allocation
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { db } from '../../services/dbStore';
import { Mentor, InternshipBatch } from '../../types/database';
import {
  Users,
  UserPlus,
  Building2,
  Mail,
  Phone,
  Lock,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Trash2,
  ShieldCheck,
  Search,
  Sparkles,
  KeyRound,
  X,
  Copy,
  Check,
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';

export const IndustryMentorsPage: React.FC = () => {
  const { currentCompany, currentUser, currentRole } = useAuth();
  const { showAlert, showConfirm } = useModal();
  const [mentorsList, setMentorsList] = useState<Mentor[]>([]);
  const [batchesList, setBatchesList] = useState<InternshipBatch[]>([]);
  const [search, setSearch] = useState('');
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedMentorForAssign, setSelectedMentorForAssign] = useState<Mentor | null>(null);
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Form State for User Generation
  const [formName, setFormName] = useState('');
  const [formDept, setFormDept] = useState('Web Platforms & UI Engineering');
  const [formDesignation, setFormDesignation] = useState('Senior Full-Stack Lead & Technical Mentor');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('password123');
  const [formConfirmPassword, setFormConfirmPassword] = useState('password123');
  const [formAssignedBatches, setFormAssignedBatches] = useState<string[]>([]);

  const companyId = currentCompany?.id || currentUser.company_id;

  const loadData = () => {
    let mList: Mentor[] = [];
    let bList: InternshipBatch[] = [];
    if (currentRole === 'super_admin') {
      mList = db.mentors;
      bList = db.batches;
    } else {
      mList = companyId ? db.mentors.filter(m => m.company_id === companyId) : [];
      bList = companyId ? db.batches.filter(b => b.company_id === companyId) : [];
    }
    setMentorsList([...mList]);
    setBatchesList([...bList]);
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return unsub;
  }, [currentCompany, companyId, currentRole]);

  const openGenerateModal = () => {
    setFormName('');
    setFormDept('Web Platforms & Cloud Engineering');
    setFormDesignation('Technical Mentor & Project Guide');
    setFormEmail('');
    setFormPhone('');
    setFormPassword('password123');
    setFormConfirmPassword('password123');
    setFormAssignedBatches([]);
    setIsGenerateModalOpen(true);
  };

  const handleGenerateMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formPassword !== formConfirmPassword) {
      await showAlert({
        title: 'Password Mismatch',
        subtitle: 'Security Verification',
        type: 'warning',
        message: 'The password and confirmation password do not match. Please re-enter identical credentials.'
      });
      return;
    }

    if (!formEmail.trim() || !formName.trim()) {
      await showAlert({
        title: 'Missing Required Fields',
        subtitle: 'Industry Mentor Setup',
        type: 'warning',
        message: 'Please complete all required fields including Mentor Name and Official Corporate Email.'
      });
      return;
    }

    const res = db.generateIndustryMentor(
      {
        full_name: formName.trim(),
        department: formDept,
        designation: formDesignation,
        email: formEmail.trim().toLowerCase(),
        phone: formPhone.trim(),
        password: formPassword,
        assigned_batches: formAssignedBatches,
      },
      currentUser,
      companyId || ''
    );

    setIsGenerateModalOpen(false);
    await showAlert({
      title: 'Industry Mentor Account Generated!',
      subtitle: res.mentor.full_name,
      type: 'success',
      badge: 'Mentor Assigned',
      confirmText: 'Done',
      message: `Mentor credentials have been generated. They can now log in to review candidate milestones, track daily attendance, and score evaluations.`,
      details: [
        { label: 'Login Email', value: res.mentor.email },
        { label: 'Technical Domain', value: res.mentor.department || 'Engineering' },
        { label: 'Assigned Batches', value: `${formAssignedBatches.length} Cohorts` }
      ]
    });
  };

  const openAssignModal = (mentor: Mentor) => {
    setSelectedMentorForAssign(mentor);
    // Find batches where this mentor is assigned
    const assigned = batchesList.filter(b => b.mentor_id === mentor.id || mentor.assigned_batches?.includes(b.id)).map(b => b.id);
    setSelectedBatchIds(assigned);
    setIsAssignModalOpen(true);
  };

  const handleSaveBatchAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentorForAssign) return;

    db.assignMentorToBatches(selectedMentorForAssign.id, selectedBatchIds, currentUser);
    setIsAssignModalOpen(false);
    setSuccessToast(`Updated cohort assignments for ${selectedMentorForAssign.full_name}.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleToggleStatus = (mentorId: string) => {
    db.toggleMentorStatus(mentorId, currentUser);
  };

  const handleDeleteMentor = async (mentorId: string, name: string) => {
    const confirmed = await showConfirm({
      title: 'Remove Industry Mentor?',
      subtitle: name,
      type: 'danger',
      badge: 'Account Revocation',
      confirmText: 'Yes, Revoke Access',
      cancelText: 'Cancel',
      message: `Are you sure you want to revoke mentor platform access for "${name}"? Active internship batch assignments will be unlinked.`
    });

    if (confirmed) {
      db.deleteMentor(mentorId, currentUser);
      setSuccessToast(`Removed mentor account "${name}".`);
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(id);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const filteredMentors = mentorsList.filter(m => {
    const query = search.toLowerCase();
    const assignedBatchCodes = batchesList
      .filter(b => b.mentor_id === m.id || m.assigned_batches?.includes(b.id))
      .map(b => b.batch_code.toLowerCase())
      .join(' ');

    return (
      m.full_name.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      (m.department && m.department.toLowerCase().includes(query)) ||
      m.designation.toLowerCase().includes(query) ||
      assignedBatchCodes.includes(query)
    );
  });

  const totalAssignedBatches = batchesList.filter(b => !!b.mentor_id).length;
  const totalInternsMentored = batchesList
    .filter(b => !!b.mentor_id)
    .reduce((acc, b) => acc + (b.students?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="bg-emerald-50 border-2 border-emerald-500 p-4 rounded-xl text-emerald-900 font-bold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <p className="text-sm">{successToast}</p>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-950 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-[#E3E6EB] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#FFF3EA] text-[#F07421] text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              Corporate Admin Control
            </span>
            <span className="text-emerald-700 text-xs font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Industry Mentor Provisioning
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0E2350] mt-1.5 flex items-center gap-2">
            <Users className="w-7 h-7 text-[#F07421]" />
            Industry Mentors & Technical Leads
          </h1>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
            Generate and authorize corporate mentor accounts with email & password, assign cohorts/batches, and empower them to mark daily attendance, create milestone tasks, and perform apprentice evaluations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openGenerateModal}
            className="px-4 py-2.5 bg-[#F07421] hover:bg-[#D96214] text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            + Generate Industry Mentor
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E3E6EB] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Active Mentors</span>
            <Users className="w-5 h-5 text-[#F07421]" />
          </div>
          <p className="text-3xl font-extrabold text-[#0E2350] mt-2">
            {mentorsList.filter(m => m.is_active).length}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Corporate technical mentors</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E3E6EB] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Assigned Batches</span>
            <Briefcase className="w-5 h-5 text-[#1C8A3C]" />
          </div>
          <p className="text-3xl font-extrabold text-[#1C8A3C] mt-2">
            {totalAssignedBatches} / {batchesList.length}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Batches with allocated mentor</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E3E6EB] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Interns Mentored</span>
            <Layers className="w-5 h-5 text-[#2A4E96]" />
          </div>
          <p className="text-3xl font-extrabold text-[#2A4E96] mt-2">
            {totalInternsMentored}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Students under active mentorship</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E3E6EB] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Tech Domains</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-[#0E2350] mt-2">
            {new Set(mentorsList.map(m => m.department || 'Tech')).size}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Specialized engineering streams</p>
        </div>
      </div>

      {/* Mentors Table & Management Surface */}
      <div className="bg-white rounded-xl border border-[#E3E6EB] shadow-sm overflow-hidden">
        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FBFBFC]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by mentor name, email, department, designation, or batch code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#E3E6EB] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0E2350]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">
              Showing {filteredMentors.length} of {mentorsList.length} Mentors
            </span>
          </div>
        </div>

        {/* Table Content */}
        {filteredMentors.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-600">No industry mentors found</p>
            <p className="text-xs text-gray-400 mt-1">Click "+ Generate Industry Mentor" above to add your first technical lead.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F6F7F9] border-b border-[#E3E6EB] text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Mentor Profile</th>
                  <th className="py-3 px-4">Department / Domain</th>
                  <th className="py-3 px-4">Login Credentials</th>
                  <th className="py-3 px-4">Assigned Batches</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredMentors.map((mentor) => {
                  const assignedBatches = batchesList.filter(
                    b => b.mentor_id === mentor.id || mentor.assigned_batches?.includes(b.id)
                  );
                  const totalStudentsInBatches = assignedBatches.reduce((acc, b) => acc + (b.students?.length || 0), 0);

                  return (
                    <tr key={mentor.id} className="hover:bg-blue-50/30 transition-colors">
                      {/* Profile Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#0E2350] text-[#F07421] font-bold flex items-center justify-center text-sm shrink-0 shadow-sm border border-[#14336F]">
                            {mentor.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-[#0E2350]">{mentor.full_name}</p>
                            <p className="text-[11px] text-gray-500 flex items-center gap-1">
                              <Briefcase className="w-3 h-3 text-gray-400" />
                              {mentor.designation}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Department / Stream */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block bg-gray-100 text-gray-700 font-semibold px-2 py-0.5 rounded text-[11px]">
                          {mentor.department || 'Technical Mentorship'}
                        </span>
                      </td>

                      {/* Login Credentials */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-gray-700">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span>{mentor.email}</span>
                            <button
                              onClick={() => handleCopy(mentor.email, mentor.id)}
                              title="Copy Email"
                              className="text-gray-400 hover:text-[#0E2350] p-0.5"
                            >
                              {copiedEmail === mentor.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <p className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {mentor.phone || '+91 98765 00000'}
                          </p>
                        </div>
                      </td>

                      {/* Assigned Batches */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          {assignedBatches.length === 0 ? (
                            <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-semibold inline-flex">
                              <AlertCircle className="w-3 h-3" />
                              <span>No batch assigned</span>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {assignedBatches.map(b => (
                                <Link
                                  key={b.id}
                                  to={`/batches/${b.id}`}
                                  className="inline-flex items-center gap-1 bg-[#EEF2FA] text-[#0E2350] hover:bg-[#DCE5F5] font-bold px-2 py-0.5 rounded text-[10px] transition-colors border border-[#DCE5F5]"
                                >
                                  <span>{b.batch_code}</span>
                                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                </Link>
                              ))}
                            </div>
                          )}

                          {assignedBatches.length > 0 && (
                            <p className="text-[10px] text-gray-500">
                              Mentoring <strong>{totalStudentsInBatches} students</strong> across {assignedBatches.length} cohort(s)
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(mentor.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                            mentor.is_active
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {mentor.is_active ? '● Active Authorized' : '○ Suspended'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openAssignModal(mentor)}
                            className="px-2.5 py-1 bg-[#EEF2FA] hover:bg-[#DCE5F5] text-[#0E2350] font-bold text-[11px] rounded transition-colors flex items-center gap-1"
                            title="Assign Batches"
                          >
                            <Layers className="w-3 h-3 text-[#F07421]" />
                            Assign Batches
                          </button>

                          <button
                            onClick={() => handleDeleteMentor(mentor.id, mentor.full_name)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                            title="Remove Mentor Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Generate Industry Mentor Account */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#FFF3EA] text-[#F07421] font-bold flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#0E2350] text-base">Generate Industry Mentor User</h3>
                  <p className="text-xs text-gray-500">Creates corporate login credentials & batch assignment</p>
                </div>
              </div>

              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateMentor} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Mentor Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Vikramaditya Sharma"
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#0E2350]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Designation / Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    placeholder="e.g. Principal Cloud Architect & Team Lead"
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#0E2350]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Department / Tech Domain <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    placeholder="e.g. Web Platforms & UI Engineering"
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#0E2350]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Official Email (Login ID) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="vikram.sharma@pixelwindtech.com"
                      className="w-full pl-9 pr-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#0E2350]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Contact Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98765 22334"
                    className="w-full pl-9 pr-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#0E2350]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 bg-blue-50/50 rounded-xl border border-blue-100">
                <div>
                  <label className="block font-bold text-[#0E2350] uppercase mb-1">
                    Set Login Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#E3E6EB] rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#0E2350]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#0E2350] uppercase mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={formConfirmPassword}
                      onChange={(e) => setFormConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#E3E6EB] rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#0E2350]"
                    />
                  </div>
                </div>
              </div>

              {/* Assign Initial Batches */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-700 uppercase">
                  Assign Internship Cohorts / Batches ({formAssignedBatches.length} selected):
                </label>
                {batchesList.length === 0 ? (
                  <p className="text-[11px] text-gray-400 italic">No batches currently created for this company.</p>
                ) : (
                  <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-[#F6F7F9] rounded-lg border border-[#E3E6EB]">
                    {batchesList.map((batch) => {
                      const isChecked = formAssignedBatches.includes(batch.id);
                      return (
                        <label
                          key={batch.id}
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-white border-[#0E2350] shadow-sm text-[#0E2350] font-bold'
                              : 'bg-transparent border-transparent text-gray-600 hover:bg-gray-200/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormAssignedBatches([...formAssignedBatches, batch.id]);
                                } else {
                                  setFormAssignedBatches(formAssignedBatches.filter(id => id !== batch.id));
                                }
                              }}
                              className="rounded text-[#0E2350] focus:ring-[#0E2350]"
                            />
                            <div>
                              <span className="font-mono font-bold">{batch.batch_code}</span>
                              <span className="text-gray-400 text-[10px] ml-2">({batch.domain})</span>
                            </div>
                          </div>
                          <span className="text-[10px] text-gray-500 font-normal">
                            {batch.students?.length || 0} students
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0E2350] hover:bg-[#14336F] text-white font-bold rounded-lg shadow-md transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#F07421]" />
                  Generate Mentor & Save Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Assign / Reassign Batches to Existing Mentor */}
      {isAssignModalOpen && selectedMentorForAssign && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-extrabold text-[#0E2350] text-base">
                  Assign Cohorts to {selectedMentorForAssign.full_name}
                </h3>
                <p className="text-xs text-gray-500">{selectedMentorForAssign.designation}</p>
              </div>

              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBatchAssignment} className="space-y-4 text-xs">
              <p className="text-gray-600">
                Select the active batches that <strong>{selectedMentorForAssign.full_name}</strong> will supervise, mark daily attendance for, assign milestone tasks, and grade:
              </p>

              <div className="max-h-64 overflow-y-auto space-y-2 p-2 bg-[#F6F7F9] rounded-xl border border-[#E3E6EB]">
                {batchesList.map((batch) => {
                  const isChecked = selectedBatchIds.includes(batch.id);
                  return (
                    <label
                      key={batch.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-white border-[#0E2350] shadow-sm text-[#0E2350] font-bold'
                          : 'bg-white/60 border-gray-200 text-gray-700 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBatchIds([...selectedBatchIds, batch.id]);
                            } else {
                              setSelectedBatchIds(selectedBatchIds.filter(id => id !== batch.id));
                            }
                          }}
                          className="rounded text-[#0E2350] focus:ring-[#0E2350] w-4 h-4"
                        />
                        <div>
                          <p className="font-mono font-bold text-xs text-[#0E2350]">{batch.batch_code}</p>
                          <p className="text-[11px] text-gray-500 font-normal">{batch.title} ({batch.domain})</p>
                        </div>
                      </div>

                      <div className="text-right text-[11px] text-gray-500">
                        <span className="font-bold text-[#1C8A3C]">{batch.students?.length || 0} interns</span>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs font-semibold text-gray-500">
                  {selectedBatchIds.length} batch(es) selected
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(false)}
                    className="px-3.5 py-2 text-gray-600 hover:text-gray-800 font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0E2350] hover:bg-[#14336F] text-white font-bold rounded-lg shadow transition-all"
                  >
                    Save Batch Allocation
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
