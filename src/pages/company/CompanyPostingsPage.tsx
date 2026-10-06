// ============================================================================
// AP VIDYACONNECT — COMPANY INTERNSHIP POSTINGS & MANAGEMENT
// Corporate Portal for Creating and Managing Detailed Internship Openings
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { db } from '../../services/dbStore';
import { InternshipOpportunity, InternshipMode } from '../../types/database';
import {
  Building2,
  Briefcase,
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  Users,
  Award,
  Sparkles,
  CheckCircle2,
  Trash2,
  Edit3,
  Eye,
  ShieldCheck,
  GraduationCap,
  Clock,
  Layers,
  X
} from 'lucide-react';

export const CompanyPostingsPage: React.FC = () => {
  const { currentCompany, currentUser } = useAuth();
  const { showAlert, showConfirm } = useModal();
  const [opportunities, setOpportunities] = useState<InternshipOpportunity[]>([]);
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState<InternshipOpportunity | null>(null);
  const [viewingOpp, setViewingOpp] = useState<InternshipOpportunity | null>(null);
  const [savedAlert, setSavedAlert] = useState<string | null>(null);

  // Form State for Creating / Editing Opening
  const [formTitle, setFormTitle] = useState('');
  const [formDomain, setFormDomain] = useState('Software Engineering');
  const [formType, setFormType] = useState('Full-time Industry Immersion');
  const [formMode, setFormMode] = useState<InternshipMode>('onsite');
  const [formLocation, setFormLocation] = useState('');
  const [formSeats, setFormSeats] = useState(10);
  const [formDuration, setFormDuration] = useState(12);
  const [formStipend, setFormStipend] = useState(15000);
  const [formStartDate, setFormStartDate] = useState('2026-06-01');
  const [formDeadline, setFormDeadline] = useState('2026-05-15');
  const [formMinCgpa, setFormMinCgpa] = useState(6.5);
  const [formTargetColleges, setFormTargetColleges] = useState('All Verified Government Higher Education Institutions');
  const [formDescription, setFormDescription] = useState('');
  const [formResponsibilities, setFormResponsibilities] = useState<string[]>([]);
  const [formLearningOutcomes, setFormLearningOutcomes] = useState<string[]>([]);
  const [formEligibleDegrees, setFormEligibleDegrees] = useState<string[]>([
    'B.Tech / B.E.',
    'B.Sc Computer Science',
    'BCA / MCA'
  ]);
  const [formSkills, setFormSkills] = useState<string[]>([]);
  const [formPerks, setFormPerks] = useState<string[]>([
    'Pre-Placement Offer (PPO) for Top Performers',
    'Dedicated 1-on-1 Industry Mentorship',
    'Govt Recognized Certification'
  ]);

  // Input helpers for dynamic lists
  const [respInput, setRespInput] = useState('');
  const [outcomeInput, setOutcomeInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [perkInput, setPerkInput] = useState('');

  const loadData = () => {
    const myCompId = currentCompany?.id || currentUser.company_id;
    let list: InternshipOpportunity[] = [];
    if (currentUser.role === 'super_admin') {
      list = db.opportunities;
    } else {
      list = myCompId ? db.opportunities.filter(o => o.company_id === myCompId) : [];
    }
    setOpportunities([...list]);
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return unsub;
  }, [currentCompany, currentUser?.company_id, currentUser?.role]);

  const openCreateModal = () => {
    setEditingOpp(null);
    setFormTitle('');
    setFormDomain('Software Engineering');
    setFormType('Full-time Industry Immersion');
    setFormMode('onsite');
    setFormLocation(currentCompany?.headquarters || 'Visakhapatnam, Andhra Pradesh');
    setFormSeats(12);
    setFormDuration(12);
    setFormStipend(16000);
    setFormStartDate('2026-06-01');
    setFormDeadline('2026-05-15');
    setFormMinCgpa(6.5);
    setFormTargetColleges('All Verified Government Higher Education Institutions');
    setFormDescription(
      'Immersive industrial training on modern web architectures, state machine design, cloud-native services, and production deployment pipelines.'
    );
    setFormResponsibilities([
      'Develop modular frontend user interfaces using React 18, TypeScript, and modern design systems.',
      'Construct scalable backend API endpoints and manage relational database schemas.',
      'Participate in daily engineering standups, sprint reviews, and technical demonstrations.'
    ]);
    setFormLearningOutcomes([
      'Hands-on experience with production codebases and automated test suites.',
      'Proficiency in enterprise git workflows, code reviews, and cloud deployment pipelines.'
    ]);
    setFormEligibleDegrees(['B.Tech / B.E.', 'B.Sc Computer Science', 'BCA / MCA', 'Govt Polytechnic Diploma']);
    setFormSkills(['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Git', 'Tailwind CSS']);
    setFormPerks([
      'Pre-Placement Offer (PPO) Opportunity',
      '1-on-1 Dedicated Technical Mentorship',
      'State Higher Education Academic Credit Recognition',
      'Monthly Stipend & High-Performance Bonus'
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (opp: InternshipOpportunity) => {
    setEditingOpp(opp);
    setFormTitle(opp.title);
    setFormDomain(opp.domain);
    setFormType(opp.internship_type || 'Full-time Industry Immersion');
    setFormMode(opp.mode);
    setFormLocation(opp.location);
    setFormSeats(opp.seats);
    setFormDuration(opp.duration_weeks);
    setFormStipend(opp.stipend_amount || 15000);
    setFormStartDate(opp.start_date || '2026-06-01');
    setFormDeadline(opp.application_deadline || '2026-05-15');
    setFormMinCgpa(opp.min_cgpa || 6.5);
    setFormTargetColleges(opp.target_institutions || 'All Verified Government Higher Education Institutions');
    setFormDescription(opp.description);
    setFormResponsibilities(opp.responsibilities || []);
    setFormLearningOutcomes(opp.learning_outcomes || []);
    setFormEligibleDegrees(opp.eligible_degrees || ['B.Tech / B.E.', 'B.Sc Computer Science']);
    setFormSkills(opp.skills_required || []);
    setFormPerks(opp.perks || []);
    setIsModalOpen(true);
  };

  const handleSaveOpening = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      await showAlert({
        title: 'Missing Role Title',
        subtitle: 'Internship Posting Validation',
        type: 'warning',
        message: 'Please provide a descriptive title for this corporate internship opening.'
      });
      return;
    }

    const payload: Partial<InternshipOpportunity> = {
      title: formTitle,
      domain: formDomain,
      internship_type: formType,
      mode: formMode,
      location: formLocation,
      seats: Number(formSeats),
      duration_weeks: Number(formDuration),
      stipend_amount: Number(formStipend),
      stipend_range: `₹${Number(formStipend).toLocaleString()} / month`,
      start_date: formStartDate,
      application_deadline: formDeadline,
      min_cgpa: Number(formMinCgpa),
      target_institutions: formTargetColleges,
      description: formDescription,
      responsibilities: formResponsibilities,
      learning_outcomes: formLearningOutcomes,
      eligible_degrees: formEligibleDegrees,
      skills_required: formSkills,
      perks: formPerks,
      company_id: currentCompany?.id || currentUser.company_id || '',
      status: 'active'
    };

    if (editingOpp) {
      db.updateOpportunity(editingOpp.id, payload, currentUser);
      setSavedAlert(`Updated opening "${formTitle}" successfully.`);
    } else {
      db.createOpportunity(payload, currentUser, currentCompany);
      setSavedAlert(`Created new internship opening "${formTitle}" successfully.`);
    }

    setIsModalOpen(false);
    setTimeout(() => setSavedAlert(null), 4000);
  };

  const handleDeleteOpening = async (oppId: string, title: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Internship Opening?',
      subtitle: title,
      type: 'danger',
      badge: 'Listing Removal',
      confirmText: 'Yes, Delete Posting',
      cancelText: 'Cancel',
      message: `Are you sure you want to remove the internship posting for "${title}"? Colleges will no longer be able to discover or apply for this role.`
    });

    if (confirmed) {
      db.deleteOpportunity(oppId, currentUser);
      setSavedAlert(`Deleted opening "${title}".`);
      setTimeout(() => setSavedAlert(null), 3000);
    }
  };

  // Helper additions for lists
  const addResp = () => {
    if (respInput.trim()) {
      setFormResponsibilities([...formResponsibilities, respInput.trim()]);
      setRespInput('');
    }
  };

  const addOutcome = () => {
    if (outcomeInput.trim()) {
      setFormLearningOutcomes([...formLearningOutcomes, outcomeInput.trim()]);
      setOutcomeInput('');
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formSkills.includes(skillInput.trim())) {
      setFormSkills([...formSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const addPerk = () => {
    if (perkInput.trim()) {
      setFormPerks([...formPerks, perkInput.trim()]);
      setPerkInput('');
    }
  };

  const toggleDegree = (deg: string) => {
    if (formEligibleDegrees.includes(deg)) {
      setFormEligibleDegrees(formEligibleDegrees.filter(d => d !== deg));
    } else {
      setFormEligibleDegrees([...formEligibleDegrees, deg]);
    }
  };

  const filtered = opportunities.filter((o) => {
    const matchesSearch =
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.domain.toLowerCase().includes(search.toLowerCase()) ||
      o.location.toLowerCase().includes(search.toLowerCase()) ||
      o.skills_required?.some(s => s.toLowerCase().includes(search.toLowerCase()));

    const matchesMode = modeFilter === 'all' || o.mode === modeFilter;
    return matchesSearch && matchesMode;
  });

  const totalSeats = opportunities.reduce((acc, curr) => acc + (curr.seats || 0), 0);

  return (
    <div className="space-y-6">
      {/* Success Alert */}
      {savedAlert && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          {savedAlert}
        </div>
      )}

      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A1938] via-[#0E2350] to-[#163673] border border-blue-900/40 p-6 sm:p-8 shadow-xl text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#F07421]/20 border border-[#F07421]/30 text-[#F07421] text-xs font-mono font-bold tracking-wide uppercase">
                INDUSTRY TALENT PIPELINE
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Corporate Portal
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Manage & Post Internship Openings
            </h1>

            <p className="text-xs text-blue-200/90 max-w-3xl leading-relaxed">
              Create detailed internship offerings with roles, eligibility, stipend, and learning milestones for government college nominations.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#F07421] to-orange-600 hover:from-[#D96214] text-white text-xs font-black shadow-md transition-all flex items-center gap-2 self-start lg:self-auto active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>+ Post New Internship Opening</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block">Active Openings</span>
          <p className="text-3xl font-black text-[#0E2350] mt-1">{opportunities.length}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Published across portal</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block">Total Intake Capacity</span>
          <p className="text-3xl font-black text-[#1C8A3C] mt-1">{totalSeats} Seats</p>
          <p className="text-[11px] text-emerald-700 font-bold mt-1">Across all live tracks</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block">Target Institutions</span>
          <p className="text-3xl font-black text-[#2A4E96] mt-1">Govt Colleges</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Degree & Polytechnic</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block">Average Stipend</span>
          <p className="text-3xl font-black text-[#F07421] mt-1">
            ₹{Math.round(opportunities.reduce((acc, c) => acc + (c.stipend_amount || 15000), 0) / (opportunities.length || 1)).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Per month per intern</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, domain, tech stack..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0E2350] focus:bg-white text-slate-800 transition-all"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          {['all', 'onsite', 'hybrid', 'remote'].map((m) => (
            <button
              key={m}
              onClick={() => setModeFilter(m)}
              className={`px-3.5 py-1.5 rounded-lg capitalize transition-all ${
                modeFilter === m
                  ? 'bg-[#0E2350] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#0E2350]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* List of Openings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((opp) => (
          <div
            key={opp.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md hover:border-[#2A4E96]/50 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 border border-blue-200/60 text-[#0E2350] px-2.5 py-0.5 rounded-md">
                    {opp.domain}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-orange-50 border border-orange-200/60 text-[#F07421] px-2.5 py-0.5 rounded-md">
                    {opp.mode} • {opp.seats} Seats
                  </span>
                  <span className="text-[10px] font-extrabold bg-emerald-50 border border-emerald-200/60 text-emerald-800 px-2.5 py-0.5 rounded-md">
                    {opp.duration_weeks} Weeks
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewingOpp(opp)}
                    title="View Full Details"
                    className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(opp)}
                    title="Edit Opening"
                    className="p-1.5 hover:bg-blue-50 text-slate-500 hover:text-[#2A4E96] rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteOpening(opp.id, opp.title)}
                    title="Delete Opening"
                    className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-black text-base text-[#0E2350] group-hover:text-[#2A4E96] transition-colors">{opp.title}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {opp.location}
                </p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{opp.description}</p>

              {/* Skills Tags */}
              {opp.skills_required && opp.skills_required.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {opp.skills_required.slice(0, 5).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-md text-[10px] font-bold"
                    >
                      {skill}
                    </span>
                  ))}
                  {opp.skills_required.length > 5 && (
                    <span className="text-[10px] text-slate-400 font-semibold self-center">
                      +{opp.skills_required.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Monthly Stipend</span>
                <span className="font-black text-[#1C8A3C] text-sm">{opp.stipend_range}</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Target Candidates</span>
                <span className="font-extrabold text-slate-700 text-xs">
                  Min CGPA: {opp.min_cgpa || 6.5}+
                </span>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-2 bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No internship openings found</h4>
            <p className="text-xs text-slate-500">
              Create your first detailed internship offering to invite nominations from government institutions.
            </p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-[#F07421] text-white rounded-xl text-xs font-bold shadow hover:bg-[#D96214] transition-all"
            >
              Post Internship Opening
            </button>
          </div>
        )}
      </div>

      {/* FULL VIEW MODAL */}
      {viewingOpp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-gray-200 shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#FFF3EA] text-[#F07421] text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    {viewingOpp.mode} • {viewingOpp.seats} Openings
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">
                    {viewingOpp.duration_weeks} Weeks Duration
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-[#0E2350] mt-1.5">{viewingOpp.title}</h2>
                <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {viewingOpp.location}
                </p>
              </div>
              <button
                onClick={() => setViewingOpp(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-3 bg-[#F6F7F9] p-4 rounded-xl text-xs">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Stipend</span>
                <span className="font-extrabold text-[#1C8A3C] text-sm">{viewingOpp.stipend_range}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Start Date</span>
                <span className="font-bold text-[#0E2350]">{viewingOpp.start_date || '2026-06-01'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Cutoff CGPA</span>
                <span className="font-bold text-[#0E2350]">{viewingOpp.min_cgpa || 6.5}+ CGPA</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-[#0E2350] uppercase text-[11px]">Role Description & Scope</h4>
              <p className="text-gray-600 leading-relaxed">{viewingOpp.description}</p>
            </div>

            {/* Responsibilities */}
            {viewingOpp.responsibilities && viewingOpp.responsibilities.length > 0 && (
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-[#0E2350] uppercase text-[11px]">Key Responsibilities & Deliverables</h4>
                <ul className="space-y-1.5 text-gray-600">
                  {viewingOpp.responsibilities.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#F07421] font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Learning Outcomes */}
            {viewingOpp.learning_outcomes && viewingOpp.learning_outcomes.length > 0 && (
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-[#0E2350] uppercase text-[11px]">Learning Outcomes & Skill Milestones</h4>
                <ul className="space-y-1.5 text-gray-600">
                  {viewingOpp.learning_outcomes.map((o, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Eligible Degrees & Skills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <h4 className="font-bold text-[#0E2350] uppercase text-[11px]">Eligible Degrees</h4>
                <div className="flex flex-wrap gap-1.5">
                  {viewingOpp.eligible_degrees?.map((d, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded text-[11px] font-semibold">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[#0E2350] uppercase text-[11px]">Tech Stack & Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {viewingOpp.skills_required?.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded text-[11px] font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Perks */}
            {viewingOpp.perks && viewingOpp.perks.length > 0 && (
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-[#0E2350] uppercase text-[11px]">Perks & Career Benefits</h4>
                <div className="flex flex-wrap gap-2">
                  {viewingOpp.perks.map((p, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => setViewingOpp(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT OPENING MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-gray-200 shadow-2xl p-6 space-y-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-lg font-extrabold text-[#0E2350]">
                  {editingOpp ? 'Edit Internship Opening' : 'Post Detailed Internship Opening'}
                </h2>
                <p className="text-xs text-gray-500">
                  Provide complete terms, learning requirements, and compensation details.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOpening} className="space-y-5 text-xs">
              {/* Row 1: Title & Domain */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Internship Role Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Full-Stack Web Engineering Intern"
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs font-semibold text-[#0E2350]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Engineering / Technical Domain *
                  </label>
                  <select
                    value={formDomain}
                    onChange={(e) => setFormDomain(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs font-semibold"
                  >
                    <option value="Software Engineering">Software Engineering & Web Apps</option>
                    <option value="Cybersecurity & Cloud">Cybersecurity & Cloud Systems</option>
                    <option value="AI / ML & Data Science">AI / ML & Data Science</option>
                    <option value="VLSI & Embedded Systems">VLSI & Embedded Systems (IoT/Robotics)</option>
                    <option value="Healthcare Data Science">Healthcare & Bio-Informatics</option>
                    <option value="Industrial Automation">Industrial Automation & CAD/CAM</option>
                    <option value="Renewable Energy">Renewable Energy & Power Systems</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Mode, Location, Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Work Mode</label>
                  <select
                    value={formMode}
                    onChange={(e) => setFormMode(e.target.value as InternshipMode)}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs"
                  >
                    <option value="onsite">Onsite (Facility / Lab)</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Work Location / City</label>
                  <input
                    type="text"
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. HITEC City, Hyderabad"
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Internship Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs"
                  >
                    <option value="Full-time Industry Immersion">Full-time Industry Immersion</option>
                    <option value="Project-based Apprenticeship">Project-based Apprenticeship</option>
                    <option value="Summer Internship">Summer Internship</option>
                    <option value="Research Fellowship">Research Fellowship</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Seats, Duration, Monthly Stipend, Min CGPA */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Seats (Intake)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formSeats}
                    onChange={(e) => setFormSeats(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Duration (Weeks)</label>
                  <input
                    type="number"
                    min="4"
                    max="52"
                    required
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Stipend (₹/month)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={formStipend}
                    onChange={(e) => setFormStipend(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs font-bold text-[#1C8A3C]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Min CGPA Cutoff</label>
                  <input
                    type="number"
                    min="5.0"
                    max="10.0"
                    step="0.1"
                    required
                    value={formMinCgpa}
                    onChange={(e) => setFormMinCgpa(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Row 4: Start Date, Application Deadline, Target Institutions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Application Deadline</label>
                  <input
                    type="date"
                    required
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Target Institutions</label>
                  <input
                    type="text"
                    value={formTargetColleges}
                    onChange={(e) => setFormTargetColleges(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Detailed Role Description & Project Scope *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Outline the practical industry immersion project, live toolings used, and day-to-day work expectations."
                  className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs leading-relaxed"
                />
              </div>

              {/* Eligible Degrees Selection */}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Eligible Academic Degrees & Courses
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    'B.Tech / B.E.',
                    'B.Sc Computer Science',
                    'B.Sc Electronics',
                    'BCA / MCA',
                    'Govt Polytechnic Diploma (CSE/IT)',
                    'Govt Polytechnic Diploma (ECE/EEE)',
                    'M.Tech / M.Sc'
                  ].map((deg) => (
                    <button
                      type="button"
                      key={deg}
                      onClick={() => toggleDegree(deg)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        formEligibleDegrees.includes(deg)
                          ? 'bg-[#0E2350] text-white shadow-sm'
                          : 'bg-[#F6F7F9] text-gray-600 hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      {deg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills Tag Adder */}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Required Technical Skills & Tools
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="e.g. React, Python, Docker, SQL..."
                    className="flex-1 px-3 py-1.5 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-3 py-1.5 bg-[#2A4E96] text-white rounded-lg font-bold text-xs"
                  >
                    Add Skill
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {formSkills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-800 rounded text-xs flex items-center gap-1 font-medium"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => setFormSkills(formSkills.filter((_, i) => i !== idx))}
                        className="text-blue-500 hover:text-blue-800 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Responsibilities Adder */}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Key Responsibilities & Tasks
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={respInput}
                    onChange={(e) => setRespInput(e.target.value)}
                    placeholder="Add a milestone responsibility..."
                    className="flex-1 px-3 py-1.5 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addResp();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addResp}
                    className="px-3 py-1.5 bg-[#2A4E96] text-white rounded-lg font-bold text-xs"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-1">
                  {formResponsibilities.map((r, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-[#F6F7F9] p-2 rounded-lg text-xs"
                    >
                      <span className="text-gray-700">{r}</span>
                      <button
                        type="button"
                        onClick={() => setFormResponsibilities(formResponsibilities.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-rose-700 font-bold text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Outcomes Adder */}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Learning Outcomes & Skill Milestones
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={outcomeInput}
                    onChange={(e) => setOutcomeInput(e.target.value)}
                    placeholder="Add a tangible learning outcome..."
                    className="flex-1 px-3 py-1.5 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addOutcome();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addOutcome}
                    className="px-3 py-1.5 bg-[#2A4E96] text-white rounded-lg font-bold text-xs"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-1">
                  {formLearningOutcomes.map((o, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-[#F6F7F9] p-2 rounded-lg text-xs"
                    >
                      <span className="text-gray-700">{o}</span>
                      <button
                        type="button"
                        onClick={() => setFormLearningOutcomes(formLearningOutcomes.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-rose-700 font-bold text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Perks & Benefits */}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Perks & Corporate Incentives
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={perkInput}
                    onChange={(e) => setPerkInput(e.target.value)}
                    placeholder="e.g. Pre-Placement Offer (PPO), Travel Allowance..."
                    className="flex-1 px-3 py-1.5 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addPerk();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addPerk}
                    className="px-3 py-1.5 bg-[#2A4E96] text-white rounded-lg font-bold text-xs"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {formPerks.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 rounded text-xs flex items-center gap-1 font-medium"
                    >
                      {p}
                      <button
                        type="button"
                        onClick={() => setFormPerks(formPerks.filter((_, i) => i !== idx))}
                        className="text-amber-600 hover:text-amber-900 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-xs transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-[#F07421] hover:bg-[#D96214] text-white rounded-lg font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  {editingOpp ? 'Save Changes' : 'Publish Internship Opening'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
