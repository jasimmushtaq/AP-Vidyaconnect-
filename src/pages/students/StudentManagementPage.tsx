// ============================================================================
// AP VIDYACONNECT — STUDENT MANAGEMENT & COHORT INGESTION
// Faculty Coordinator & College Admin Portal for Adding, Editing, Generating Passwords & Managing Students
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { db } from '../../services/dbStore';
import { Student, InternshipBatch } from '../../types/database';
import {
  Users,
  Plus,
  UploadCloud,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  X,
  Sparkles,
  Edit3,
  Trash2,
  School,
  Mail,
  Phone,
  GraduationCap,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  ArrowRight
} from 'lucide-react';

export const StudentManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentInstitution, currentUser, loginWithEmail } = useAuth();
  const { showAlert, showConfirm } = useModal();
  const [students, setStudents] = useState<Student[]>(db.students);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'enrolled' | 'available'>('all');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Credentials Management State
  const [showBatchCredsModal, setShowBatchCredsModal] = useState(false);
  const [showSingleCredModal, setShowSingleCredModal] = useState(false);
  const [selectedStudentForCreds, setSelectedStudentForCreds] = useState<Student | null>(null);
  const [credsEmail, setCredsEmail] = useState('');
  const [credsPassword, setCredsPassword] = useState('');
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [generatedBatchCreds, setGeneratedBatchCreds] = useState<any[]>([]);

  // Single Student Form State (Add / Edit)
  const [formFullName, setFormFullName] = useState('');
  const [formRollNumber, setFormRollNumber] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formGender, setFormGender] = useState('Male');
  const [formYear, setFormYear] = useState('3');
  const [formCgpa, setFormCgpa] = useState('8.50');
  const [formSkills, setFormSkills] = useState('React, Python, SQL');
  const [formIsPlaced, setFormIsPlaced] = useState(false);

  // Bulk import state
  const [importText, setImportText] = useState(`RollNumber,FullName,Email,Phone,Gender,Year,CGPA,Skills
2023-CS-101,Aarav Sen,aarav.sen@student.gdck.ac.in,+919876543210,Male,3,8.75,"React, Node.js, SQL"
2023-CS-102,Kavya Sharma,kavya.s@student.gdck.ac.in,+919876543211,Female,3,9.10,"Python, Django, AWS"
2023-CS-103,Nikhil Varma,nikhil.v@student.gdck.ac.in,+919876543212,Male,3,8.40,"Cybersecurity, Linux"
2023-CS-104,Divya Reddy,divya.r@student.gdck.ac.in,+919876543213,Female,3,9.35,"Machine Learning, PyTorch"`);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<any[]>([]);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setStudents([...db.students]);
    });
    return unsub;
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const toggleShowPassword = (studentId: string) => {
    setShowPasswordMap(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const getStudentPassword = (stu: Student): string => {
    return stu.temp_password || db.getPassword(stu.email) || `APV#${stu.roll_number.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() || '2026'}!`;
  };

  const getStudentBatch = (stu: Student): InternshipBatch | undefined => {
    return db.getStudentInternshipBatch(stu.id) || db.getStudentInternshipBatch(stu.email);
  };

  const openAddModal = () => {
    const roll = `2023-CS-${Math.floor(100 + Math.random() * 900)}`;
    setFormFullName('Ananya Rao');
    setFormRollNumber(roll);
    setFormEmail('ananya.rao@student.gdck.ac.in');
    setFormPassword(`APV#${roll.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase()}!`);
    setFormPhone('+91 98480 77889');
    setFormGender('Female');
    setFormYear('3');
    setFormCgpa('8.95');
    setFormSkills('React, TypeScript, TailwindCSS, REST APIs');
    setFormIsPlaced(false);
    setShowAddModal(true);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName.trim() || !formRollNumber.trim() || !formEmail.trim()) {
      await showAlert({
        title: 'Missing Required Fields',
        subtitle: 'Student Enrollment Validation',
        type: 'warning',
        message: 'Please provide the student Full Name, Roll Number, and Official Email address to complete onboarding.'
      });
      return;
    }

    const myInstId = currentInstitution?.id || currentUser.institution_id;
    if (!myInstId) {
      await showAlert({
        title: 'Institution Required',
        subtitle: 'Validation',
        type: 'warning',
        message: 'No active institution profile linked to this account.'
      });
      return;
    }

    const created = db.addStudent(
      myInstId,
      {
        full_name: formFullName.trim(),
        roll_number: formRollNumber.trim(),
        email: formEmail.trim().toLowerCase(),
        temp_password: formPassword.trim() || undefined,
        phone: formPhone.trim(),
        gender: formGender,
        year_of_study: parseInt(formYear) || 3,
        cgpa: parseFloat(formCgpa) || 8.0,
        skills: formSkills.split(',').map(s => s.trim()).filter(Boolean),
        is_placed: formIsPlaced,
      },
      currentUser
    );

    setShowAddModal(false);
    setToastMsg(`Added student ${created.full_name} (${created.roll_number}) with Portal Login credentials!`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const openEditModal = (stu: Student) => {
    setEditingStudent(stu);
    setFormFullName(stu.full_name);
    setFormRollNumber(stu.roll_number);
    setFormEmail(stu.email);
    setFormPassword(getStudentPassword(stu));
    setFormPhone(stu.phone || '');
    setFormGender(stu.gender || 'Male');
    setFormYear(String(stu.year_of_study || 3));
    setFormCgpa(String(stu.cgpa || 8.0));
    setFormSkills(stu.skills ? stu.skills.join(', ') : '');
    setFormIsPlaced(!!stu.is_placed);
    setShowEditModal(true);
  };

  const handleUpdateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    db.updateStudent(
      editingStudent.id,
      {
        full_name: formFullName.trim(),
        roll_number: formRollNumber.trim(),
        email: formEmail.trim().toLowerCase(),
        temp_password: formPassword.trim() || undefined,
        phone: formPhone.trim(),
        gender: formGender,
        year_of_study: parseInt(formYear) || 3,
        cgpa: parseFloat(formCgpa) || 8.0,
        skills: formSkills.split(',').map(s => s.trim()).filter(Boolean),
        is_placed: formIsPlaced,
      },
      currentUser
    );

    if (formPassword.trim()) {
      db.passwords[formEmail.trim().toLowerCase()] = formPassword.trim();
      db.persist('passwords');
    }

    setShowEditModal(false);
    setEditingStudent(null);
    setToastMsg(`Updated student record for ${formFullName} (${formRollNumber}) successfully!`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleDeleteStudent = async (stu: Student) => {
    const confirmed = await showConfirm({
      title: 'Remove Student Record?',
      subtitle: `${stu.full_name} (${stu.roll_number})`,
      type: 'danger',
      badge: 'Destructive Action',
      confirmText: 'Yes, Delete Student',
      cancelText: 'Keep Record',
      message: 'Are you sure you want to remove this student from the institution cohort database? All proposal nomination references will be unlinked.'
    });

    if (confirmed) {
      db.deleteStudent(stu.id, currentUser);
      setToastMsg(`Deleted student record for "${stu.full_name}".`);
      setTimeout(() => setToastMsg(null), 4000);
    }
  };

  // Open Individual Student Credentials Modal
  const openCredentialsModal = (stu: Student) => {
    setSelectedStudentForCreds(stu);
    setCredsEmail(stu.email);
    setCredsPassword(getStudentPassword(stu));
    setShowSingleCredModal(true);
  };

  // Generate / Reset password for single student
  const handleRegeneratePassword = (stu: Student) => {
    const newPass = `APV#${Math.random().toString(36).substring(2, 6).toUpperCase()}2026!`;
    setCredsPassword(newPass);
  };

  const handleSaveStudentCredentials = () => {
    if (!selectedStudentForCreds) return;
    const res = db.generateStudentCredentials(
      selectedStudentForCreds.id,
      { customEmail: credsEmail.trim(), customPassword: credsPassword.trim() },
      currentUser
    );
    setShowSingleCredModal(false);
    setToastMsg(`Generated & activated portal credentials for ${res.student.full_name} (${res.email})!`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Bulk Generate Credentials for All Students strictly for current institution
  const handleGenerateAllCredentials = async () => {
    const myInstId = currentInstitution?.id || currentUser.institution_id;
    if (!myInstId || filteredStudents.length === 0) {
      await showAlert({
        title: 'No Students in Roster',
        subtitle: 'Batch Credentialing',
        type: 'warning',
        message: 'No student candidates found in this college cohort to provision credentials for. Please add or import students first.'
      });
      return;
    }
    const result = db.generateAllStudentsCredentials(myInstId, currentUser);
    setGeneratedBatchCreds(result.credentials);
    setShowBatchCredsModal(true);
    setToastMsg(`Generated email and password credentials for ${result.count} students!`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Quick Direct Login as Student
  const handleLoginAsStudent = async (stu: Student) => {
    const pass = getStudentPassword(stu);
    const res = loginWithEmail(stu.email, pass);
    if (res.success) {
      navigate('/dashboard');
    } else {
      await showAlert({
        title: 'Login Attempt',
        subtitle: 'Student Portal Access',
        type: 'warning',
        message: res.message || 'Could not authenticate into student portal.'
      });
    }
  };

  const handleParsePreview = () => {
    const lines = importText.trim().split('\n');
    if (lines.length <= 1) {
      setImportErrors(['CSV must contain a header and at least 1 data row.']);
      return;
    }

    const rows: any[] = [];
    const errors: string[] = [];

    lines.slice(1).forEach((line, idx) => {
      const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
      if (parts.length < 7) {
        errors.push(`Row ${idx + 2}: Insufficient columns (expected 7+).`);
        return;
      }

      const [roll, name, email, phone, gender, year, cgpa, skills] = parts;
      const parsedCgpa = parseFloat(cgpa);

      if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10) {
        errors.push(`Row ${idx + 2}: Invalid CGPA value "${cgpa}". Must be between 0.0 and 10.0.`);
      }

      rows.push({
        roll_number: roll,
        full_name: name,
        email,
        phone,
        gender,
        year_of_study: parseInt(year) || 3,
        cgpa: parsedCgpa || 8.0,
        skills: skills ? skills.split(';').map(s => s.trim()) : ['General'],
      });
    });

    setPreviewRows(rows);
    setImportErrors(errors);
  };

  const handleConfirmImport = () => {
    if (previewRows.length === 0) return;
    const myInstId = currentInstitution?.id || currentUser.institution_id || '';
    db.bulkImportStudents(myInstId, previewRows, currentUser);
    setToastMsg(`Successfully imported ${previewRows.length} students into college database with auto-generated login passwords!`);
    setTimeout(() => setToastMsg(null), 4000);
    setShowImportModal(false);
    setPreviewRows([]);
    setImportErrors([]);
  };

  const myInstId = currentInstitution?.id || currentUser.institution_id;
  const myCohortStudents = useMemo(() => {
    if (currentUser.role === 'super_admin') return students;
    if (!myInstId) return [];
    return students.filter(s => s.institution_id === myInstId);
  }, [students, myInstId, currentUser.role]);

  const filteredStudents = useMemo(() => {
    return myCohortStudents.filter(s => {
      const matchesSearch =
        s.full_name.toLowerCase().includes(search.toLowerCase()) ||
        s.roll_number.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        (s.skills && s.skills.some(sk => sk.toLowerCase().includes(search.toLowerCase())));

      if (!matchesSearch) return false;

      if (statusFilter === 'enrolled') {
        return s.is_placed || !!getStudentBatch(s);
      }
      if (statusFilter === 'available') {
        return !s.is_placed && !getStudentBatch(s);
      }
      return true;
    });
  }, [myCohortStudents, search, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-emerald-700 hover:text-emerald-950 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. TOP HERO BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A1938] via-[#0E2350] to-[#163673] border border-blue-900/40 p-6 sm:p-8 shadow-xl text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-mono font-bold tracking-wide">
                {currentInstitution?.code || 'GDC-NLG-2026'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                College Administration Student Roster Portal
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Student Roster & Cohort Management
            </h1>

            <p className="text-xs text-blue-200/90 max-w-3xl leading-relaxed">
              Generate student login credentials (email & password), provision portal access for enrolled internships, and manage student rosters.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleGenerateAllCredentials}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-md transition-all flex items-center gap-2 border border-blue-400/30 group active:scale-95"
            >
              <KeyRound className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span>Generate All Passwords</span>
              <span className="bg-[#F07421] text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black">
                {myCohortStudents.length}
              </span>
            </button>

            <button
              onClick={openAddModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F07421] to-orange-600 hover:from-[#D96214] text-white text-xs font-black shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>+ Add New Student</span>
            </button>

            <button
              onClick={() => {
                setShowImportModal(true);
                handleParsePreview();
              }}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 shadow-2xs"
            >
              <UploadCloud className="w-4 h-4 text-blue-300" />
              <span>CSV Bulk Import</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. AUTOMATED CREDENTIAL ONBOARDING CARD */}
      <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-white rounded-2xl border border-blue-200/80 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#0E2350] text-[#F07421] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="font-extrabold text-[#0E2350] text-sm flex items-center gap-2">
              <span>Automated Student Credential & Internship Portal Onboarding</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                Active
              </span>
            </p>
            <p className="text-slate-600 leading-relaxed font-medium">
              College Admin can generate official emails and passwords for every student. After students are enrolled in an internship batch, they can log in to their student portal with these credentials to track attendance, submit internship tasks, and track academic credit milestones.
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerateAllCredentials}
          className="shrink-0 px-4 py-2.5 bg-white hover:bg-slate-50 text-[#0E2350] border border-[#2A4E96]/30 rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-[#F07421]" />
          <span>View / Export All Credentials Slip</span>
        </button>
      </div>

      {/* 3. FILTER & SEARCH BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, roll, email, or skill..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0E2350] focus:bg-white text-slate-800 transition-all"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-[#0E2350] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#0E2350]'
              }`}
            >
              All ({myCohortStudents.length})
            </button>
            <button
              onClick={() => setStatusFilter('enrolled')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'enrolled'
                  ? 'bg-[#0E2350] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#0E2350]'
              }`}
            >
              Internship Enrolled ({myCohortStudents.filter(s => s.is_placed || !!getStudentBatch(s)).length})
            </button>
            <button
              onClick={() => setStatusFilter('available')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'available'
                  ? 'bg-[#0E2350] text-white shadow-sm'
                  : 'text-gray-600 hover:text-[#0E2350]'
              }`}
            >
              Available ({myCohortStudents.filter(s => !s.is_placed && !getStudentBatch(s)).length})
            </button>
          </div>
        </div>

        <div className="text-xs text-gray-500 font-semibold shrink-0">
          Showing <strong>{filteredStudents.length}</strong> of <strong>{myCohortStudents.length}</strong> Students
        </div>
      </div>

      {/* Students Data Table with Credentials & Internship Column */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 text-slate-500 font-extrabold uppercase bg-slate-50/80 text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Student Profile</th>
                <th className="py-3.5 px-4">Roll Number</th>
                <th className="py-3.5 px-4">Contact & Official Email</th>
                <th className="py-3.5 px-4">Portal Login & Password</th>
                <th className="py-3.5 px-4">Year & CGPA</th>
                <th className="py-3.5 px-4">Technical Skills</th>
                <th className="py-3.5 px-4">Internship Enrollment</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => {
                const pass = getStudentPassword(s);
                const isPasswordShown = !!showPasswordMap[s.id];
                const enrolledBatch = getStudentBatch(s);

                return (
                  <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                    {/* Profile */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0A1938] to-[#1E3A8A] text-[#F07421] font-black flex items-center justify-center text-xs shrink-0 border border-blue-900/30 shadow-xs">
                          {s.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 text-xs">{s.full_name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{s.gender || 'Student'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Roll Number */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700 text-xs">
                      {s.roll_number}
                    </td>

                    {/* Contact & Email */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                          <Mail className="w-3.5 h-3.5 text-[#2A4E96] shrink-0" />
                          <span className="truncate max-w-[170px]">{s.email}</span>
                          <button
                            onClick={() => copyToClipboard(s.email, `email-${s.id}`)}
                            title="Copy student email"
                            className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                          >
                            {copiedKey === `email-${s.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {s.phone || '+91 90000 00000'}
                        </p>
                      </div>
                    </td>

                    {/* Portal Password & Credentials (Highlighted) */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1.5 min-w-[210px]">
                        <div className="flex items-center gap-2 bg-slate-50 border border-blue-200/70 px-2.5 py-1.5 rounded-xl">
                          <KeyRound className="w-3.5 h-3.5 text-[#F07421] shrink-0" />
                          <span className="font-mono text-[11px] font-black text-[#0E2350] tracking-wider select-all">
                            {isPasswordShown ? pass : '••••••••••'}
                          </span>
                          <div className="ml-auto flex items-center gap-1">
                            <button
                              onClick={() => toggleShowPassword(s.id)}
                              className="text-slate-400 hover:text-[#0E2350] p-1 rounded transition-colors"
                              title={isPasswordShown ? 'Hide Password' : 'Show Password'}
                            >
                              {isPasswordShown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => copyToClipboard(pass, `pass-${s.id}`)}
                              className="text-slate-400 hover:text-emerald-600 p-1 rounded transition-colors"
                              title="Copy Password"
                            >
                              {copiedKey === `pass-${s.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Direct Login as Student quick link */}
                        <div className="flex items-center justify-between gap-1 text-[10px]">
                          <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Portal Ready
                          </span>
                          <button
                            onClick={() => handleLoginAsStudent(s)}
                            className="font-extrabold text-[#F07421] hover:text-[#D45D10] flex items-center gap-0.5 group"
                            title="Directly sign into student portal as this student"
                          >
                            <span>Login to Portal</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Year & CGPA */}
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-[#0E2350] text-xs">{s.cgpa} CGPA</span>
                      <p className="text-[10px] text-slate-400 font-medium">Year {s.year_of_study}</p>
                    </td>

                    {/* Technical Skills */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {s.skills?.map((sk) => (
                          <span key={sk} className="text-[9px] bg-blue-50 border border-blue-200/60 text-[#0E2350] px-2 py-0.5 rounded-md font-bold">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Internship Status */}
                    <td className="py-3.5 px-4">
                      {enrolledBatch ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Enrolled in Batch
                          </span>
                          <p className="text-[10px] text-slate-700 font-bold line-clamp-1">
                            {enrolledBatch.title}
                          </p>
                          <p className="text-[9px] text-slate-400 font-mono font-medium">
                            {enrolledBatch.company?.name || 'Partner Company'}
                          </p>
                        </div>
                      ) : s.is_placed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Placed
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          Available
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openCredentialsModal(s)}
                          className="p-1.5 text-[#2A4E96] hover:text-[#0E2350] hover:bg-blue-50 rounded-lg transition-colors"
                          title="Generate / Manage Student Login Credentials"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-[#F07421]" />
                        </button>

                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1.5 text-slate-500 hover:text-[#0E2350] hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Student Record"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteStudent(s)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Student Record"
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
      </div>

      {/* MODAL: Bulk Generated Credentials Center */}
      {showBatchCredsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0E2350] text-[#F07421] flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0E2350]">
                    Generated Student Email & Password Credentials
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Official AP VidyaConnect student accounts are active. Students can sign in using their official email and generated password.
                  </p>
                </div>
              </div>
              <button onClick={() => setShowBatchCredsModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar inside Modal */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#F6F7F9] rounded-xl border border-[#E3E6EB] text-xs">
              <span className="font-bold text-[#0E2350]">
                Total Accounts Provisioned: {generatedBatchCreds.length || filteredStudents.length} Students
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const list = generatedBatchCreds.length > 0 ? generatedBatchCreds : filteredStudents.map(s => ({
                      student: s,
                      email: s.email,
                      password: getStudentPassword(s)
                    }));
                    const lines = list.map(item => {
                      const stu = item.student || item;
                      const email = item.email || stu.email;
                      const pass = item.password || getStudentPassword(stu);
                      return `Roll: ${stu.roll_number} | Name: ${stu.full_name} | Email: ${email} | Password: ${pass}`;
                    }).join('\n');
                    copyToClipboard(lines, 'bulk-copy-all');
                  }}
                  className="px-3 py-1.5 bg-white text-[#0E2350] hover:bg-gray-100 border border-[#E3E6EB] rounded-lg font-bold flex items-center gap-1.5"
                >
                  {copiedKey === 'bulk-copy-all' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied All Slips!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy All Credentials</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    const list = generatedBatchCreds.length > 0 ? generatedBatchCreds : filteredStudents.map(s => ({
                      student: s,
                      email: s.email,
                      password: getStudentPassword(s),
                      internshipBatch: getStudentBatch(s)
                    }));
                    const csvContent = "data:text/csv;charset=utf-8," 
                      + ["RollNumber,FullName,Email,Password,InternshipBatch"].join(",") + "\n"
                      + list.map(item => {
                        const stu = item.student || item;
                        const email = item.email || stu.email;
                        const pass = item.password || getStudentPassword(stu);
                        const b = item.internshipBatch || getStudentBatch(stu);
                        return `"${stu.roll_number}","${stu.full_name}","${email}","${pass}","${b?.title || 'Available'}"`;
                      }).join("\n");
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `AP_VidyaConnect_Student_Credentials_${currentInstitution?.code || 'GDC'}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-3 py-1.5 bg-[#0E2350] text-white hover:bg-[#14336F] rounded-lg font-bold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-[#F07421]" />
                  <span>Download Credentials CSV</span>
                </button>
              </div>
            </div>

            {/* Credentials Roster Table */}
            <div className="max-h-72 overflow-y-auto border border-[#E3E6EB] rounded-xl divide-y divide-gray-100 text-xs">
              {(generatedBatchCreds.length > 0 ? generatedBatchCreds : filteredStudents.map(s => ({
                student: s,
                email: s.email,
                password: getStudentPassword(s),
                internshipBatch: getStudentBatch(s)
              }))).map((cred, idx) => (
                <div key={idx} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-blue-50/40 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#0E2350] bg-[#EEF2FA] px-1.5 py-0.5 rounded text-[11px]">
                        {cred.student?.roll_number}
                      </span>
                      <strong className="text-gray-900">{cred.student?.full_name}</strong>
                      {cred.internshipBatch && (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.2 rounded-full">
                          Enrolled: {cred.internshipBatch.title}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-gray-600 text-[11px]">
                      <span>Email: <strong className="font-mono text-gray-900">{cred.email}</strong></span>
                      <span>Password: <strong className="font-mono text-[#0E2350] bg-gray-100 px-1.5 py-0.5 rounded">{cred.password}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => copyToClipboard(`Email: ${cred.email}\nPassword: ${cred.password}\nLogin URL: ${window.location.origin}/login`, `item-${idx}`)}
                      className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-semibold text-[11px] flex items-center gap-1"
                    >
                      {copiedKey === `item-${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Slip</span>
                    </button>

                    <button
                      onClick={() => handleLoginAsStudent(cred.student)}
                      className="px-2.5 py-1 bg-[#0E2350] hover:bg-[#14336F] text-white rounded font-bold text-[11px] flex items-center gap-1"
                    >
                      <span>Login as Student</span>
                      <ExternalLink className="w-3 h-3 text-[#F07421]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowBatchCredsModal(false)}
                className="px-5 py-2 bg-[#0E2350] text-white rounded-lg font-bold"
              >
                Close & Return to Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Single Student Credentials Manager */}
      {showSingleCredModal && selectedStudentForCreds && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0E2350] text-[#F07421] flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0E2350]">
                    Manage Student Credentials
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {selectedStudentForCreds.full_name} ({selectedStudentForCreds.roll_number})
                  </p>
                </div>
              </div>
              <button onClick={() => setShowSingleCredModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Official Login Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={credsEmail}
                    onChange={(e) => setCredsEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-mono font-medium text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-gray-700 uppercase">Student Portal Password</label>
                  <button
                    type="button"
                    onClick={() => handleRegeneratePassword(selectedStudentForCreds)}
                    className="text-[11px] font-bold text-[#F07421] hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Generate New
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={credsPassword}
                    onChange={(e) => setCredsPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-mono font-bold text-xs"
                  />
                </div>
              </div>

              {/* Enrolled Internship Card if applicable */}
              {getStudentBatch(selectedStudentForCreds) && (
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Enrolled Internship Batch</span>
                  </div>
                  <p className="font-semibold text-gray-800">
                    {getStudentBatch(selectedStudentForCreds)?.title}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Partner: {getStudentBatch(selectedStudentForCreds)?.company?.name} • Code: {getStudentBatch(selectedStudentForCreds)?.batch_code}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleSaveStudentCredentials}
                  className="w-full py-2 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-lg font-bold shadow flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#F07421]" />
                  Save & Update Credentials
                </button>

                <button
                  type="button"
                  onClick={() => handleLoginAsStudent(selectedStudentForCreds)}
                  className="w-full py-2 bg-gradient-to-r from-[#F07421] to-[#D45D10] hover:opacity-95 text-white rounded-lg font-bold shadow flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" />
                  One-Click Login to Student Portal
                </button>

                <button
                  type="button"
                  onClick={() => copyToClipboard(`Official Email: ${credsEmail}\nPassword: ${credsPassword}\nPortal Link: ${window.location.origin}/login`, 'single-slip')}
                  className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold flex items-center justify-center gap-1.5"
                >
                  {copiedKey === 'single-slip' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied Slip to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Student Login Slip</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Add New Student */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-[#0E2350] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#F07421]" />
                Add New Student to College Roster
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    placeholder="e.g. Ananya Rao"
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Roll Number *</label>
                  <input
                    type="text"
                    required
                    value={formRollNumber}
                    onChange={(e) => {
                      setFormRollNumber(e.target.value);
                      setFormPassword(`APV#${e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() || '2026'}!`);
                    }}
                    placeholder="e.g. 2023-CS-105"
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="ananya.rao@student.gdck.ac.in"
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Initial Password</label>
                  <input
                    type="text"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="APV#105!"
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-mono font-bold text-xs text-[#0E2350]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98480 77889"
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Gender</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-medium"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Year of Study</label>
                  <select
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-medium"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">CGPA (0 - 10)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={formCgpa}
                    onChange={(e) => setFormCgpa(e.target.value)}
                    placeholder="8.50"
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Technical Skills (comma-separated)</label>
                <input
                  type="text"
                  value={formSkills}
                  onChange={(e) => setFormSkills(e.target.value)}
                  placeholder="e.g. React, Python, Machine Learning, AWS"
                  className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-medium"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={formIsPlaced}
                    onChange={(e) => setFormIsPlaced(e.target.checked)}
                    className="rounded text-[#0E2350] focus:ring-[#0E2350]"
                  />
                  <span>Mark as Already Placed / Non-Available for Internships</span>
                </label>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-lg font-bold shadow"
                >
                  Save & Generate Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Student */}
      {showEditModal && editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-[#0E2350] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#2A4E96]" />
                Edit Student: {editingStudent.full_name} ({editingStudent.roll_number})
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStudent} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Roll Number *</label>
                  <input
                    type="text"
                    required
                    value={formRollNumber}
                    onChange={(e) => setFormRollNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Login Password</label>
                  <input
                    type="text"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-mono font-bold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Gender</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-medium"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Year of Study</label>
                  <select
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-medium"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">CGPA (0 - 10)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={formCgpa}
                    onChange={(e) => setFormCgpa(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Technical Skills (comma-separated)</label>
                <input
                  type="text"
                  value={formSkills}
                  onChange={(e) => setFormSkills(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-medium"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={formIsPlaced}
                    onChange={(e) => setFormIsPlaced(e.target.checked)}
                    className="rounded text-[#0E2350] focus:ring-[#0E2350]"
                  />
                  <span>Mark as Placed</span>
                </label>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-lg font-bold shadow"
                >
                  Update Student Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Bulk Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-[#0E2350] flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#1C8A3C]" />
                CSV / Excel Bulk Student Ingestion
              </h3>
              <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-gray-700">Paste or Edit CSV Records (Header Required):</label>
              <textarea
                rows={6}
                value={importText}
                onChange={(e) => {
                  setImportText(e.target.value);
                  handleParsePreview();
                }}
                className="w-full font-mono text-[11px] p-3 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg focus:outline-none"
              />
            </div>

            {importErrors.length > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-1 text-xs text-rose-700">
                {importErrors.map((err, i) => (
                  <p key={i} className="flex items-center gap-1.5 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {err}
                  </p>
                ))}
              </div>
            )}

            {previewRows.length > 0 && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-gray-500 font-bold">
                  <span>Validation Preview ({previewRows.length} Valid Records):</span>
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> All credentials will be auto-generated
                  </span>
                </div>

                <div className="max-h-40 overflow-y-auto border border-[#E3E6EB] rounded-lg divide-y divide-gray-100 font-mono text-[11px]">
                  {previewRows.map((r, i) => (
                    <div key={i} className="p-2 flex items-center justify-between bg-white hover:bg-gray-50">
                      <div>
                        <span className="font-bold text-[#0E2350]">{r.roll_number}</span> — {r.full_name} ({r.email})
                      </div>
                      <div className="text-gray-500 font-sans">
                        CGPA: <strong>{r.cgpa}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={previewRows.length === 0}
                onClick={handleConfirmImport}
                className="px-5 py-2 bg-[#1C8A3C] hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg font-bold shadow"
              >
                Import {previewRows.length} Students & Generate Credentials
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
