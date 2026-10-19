import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { db } from '../../services/dbStore';
import { FacultyCoordinator } from '../../types/database';
import {
  Users,
  UserPlus,
  School,
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
  X
} from 'lucide-react';

export const FacultyCoordinatorsPage: React.FC = () => {
  const { currentInstitution, currentUser, currentRole } = useAuth();
  const { showAlert, showConfirm } = useModal();
  const [facultyList, setFacultyList] = useState<FacultyCoordinator[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form State for User Generation
  const [formName, setFormName] = useState('');
  const [formDept, setFormDept] = useState('Computer Science & Engineering');
  const [formDesignation, setFormDesignation] = useState('Associate Professor & Internship Coordinator');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('password123');
  const [formConfirmPassword, setFormConfirmPassword] = useState('password123');

  const loadData = () => {
    const myInstId = currentInstitution?.id || currentUser?.institution_id;
    let list: FacultyCoordinator[] = [];
    if (currentRole === 'super_admin') {
      list = db.facultyCoordinators;
    } else {
      list = myInstId ? db.facultyCoordinators.filter(f => f.institution_id === myInstId) : [];
    }
    setFacultyList([...list]);
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return unsub;
  }, [currentInstitution, currentUser?.institution_id, currentRole]);

  const openGenerateModal = () => {
    setFormName('');
    setFormDept('Computer Science & Engineering');
    setFormDesignation('Associate Professor & Internship Coordinator');
    setFormEmail('');
    setFormPhone('');
    setFormPassword('password123');
    setFormConfirmPassword('password123');
    setIsModalOpen(true);
  };

  const handleGenerateFacultyUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
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
        subtitle: 'Faculty Coordinator Setup',
        type: 'warning',
        message: 'Please complete all required fields including Faculty Name and Official Academic Email.'
      });
      return;
    }

    const myInstId = currentInstitution?.id || currentUser.institution_id || '';
    const res = db.generateFacultyCoordinator(
      {
        full_name: formName.trim(),
        department: formDept,
        designation: formDesignation,
        email: formEmail.trim().toLowerCase(),
        phone: formPhone.trim(),
        password: formPassword,
      },
      currentUser,
      myInstId
    );

    setIsModalOpen(false);
    await showAlert({
      title: 'Faculty Coordinator Account Created!',
      subtitle: res.faculty.full_name,
      type: 'success',
      badge: 'Credentials Initialized',
      confirmText: 'Done',
      message: 'The faculty member account has been registered. They can immediately log in to formulate proposals and manage student cohorts.',
      details: [
        { label: 'Login Email', value: res.faculty.email },
        { label: 'Department', value: res.faculty.department },
        { label: 'Assigned Role', value: 'Faculty Coordinator' }
      ]
    });
  };

  const handleToggleStatus = (facId: string) => {
    if (!currentUser) return;
    db.toggleFacultyStatus(facId, currentUser);
  };

  const handleDelete = async (facId: string, name: string) => {
    if (!currentUser) return;
    const confirmed = await showConfirm({
      title: 'Remove Faculty Coordinator?',
      subtitle: name,
      type: 'danger',
      badge: 'Account Revocation',
      confirmText: 'Yes, Revoke Access',
      cancelText: 'Cancel',
      message: `Are you sure you want to revoke platform access for "${name}"? They will no longer be able to log in or submit proposals.`
    });

    if (confirmed) {
      db.deleteFacultyCoordinator(facId, currentUser);
      setSuccessToast(`Removed faculty coordinator account "${name}".`);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  const filtered = facultyList.filter(
    f =>
      f.full_name.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase()) ||
      f.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast Alert */}
      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          {successToast}
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-[#E3E6EB] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#EEF2FA] text-[#0E2350] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              COLLEGE ADMIN PORTAL
            </span>
            <span className="text-emerald-700 text-xs font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Institutional Authority
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0E2350] mt-1">
            Faculty Coordinator User Accounts
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Generate and manage departmental faculty coordinator credentials (email & password) for internship batch coordination and attendance auditing.
          </p>
        </div>

        <button
          onClick={openGenerateModal}
          className="px-4 py-2.5 rounded-lg bg-[#0E2350] hover:bg-[#14336F] text-white text-xs font-bold shadow-md hover:shadow transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 text-[#F07421]" />
          Generate Faculty Coordinator User
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E3E6EB] shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Registered Coordinators</span>
          <p className="text-2xl font-extrabold text-[#0E2350] mt-1">{facultyList.length}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Across academic depts</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E3E6EB] shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Active Status</span>
          <p className="text-2xl font-extrabold text-[#1C8A3C] mt-1">
            {facultyList.filter(f => f.is_active).length}
          </p>
          <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">Authorized for portal access</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E3E6EB] shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Batches Supervised</span>
          <p className="text-2xl font-extrabold text-[#2A4E96] mt-1">
            {db.batches.length}
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">Active industry cohorts</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E3E6EB] shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Institution</span>
          <p className="text-xs font-extrabold text-[#0E2350] mt-1 truncate">
            {currentInstitution?.code || 'GDCK-HYD'}
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5 truncate">
            Principal: {currentInstitution?.principal_name || 'Dr. G. Ramana Rao'}
          </p>
        </div>
      </div>

      {/* Search & List */}
      <div className="bg-white rounded-xl border border-[#E3E6EB] shadow-sm overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by faculty name, email, department..."
              className="w-full pl-9 pr-4 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs"
            />
          </div>

          <span className="text-xs text-gray-500 font-medium self-end sm:self-auto">
            Showing {filtered.length} Faculty Users
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#EEF2FA] text-[#0E2350] border-b border-[#E3E6EB]">
                <th className="p-3 font-bold">Faculty Coordinator</th>
                <th className="p-3 font-bold">Department & Designation</th>
                <th className="p-3 font-bold">Official Login Email</th>
                <th className="p-3 font-bold">Phone</th>
                <th className="p-3 font-bold text-center">Active Batches</th>
                <th className="p-3 font-bold text-center">Status</th>
                <th className="p-3 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((fac) => (
                <tr key={fac.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#0E2350] text-[#F07421] flex items-center justify-center font-bold text-xs">
                        {fac.full_name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-[#0E2350]">{fac.full_name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">ID: {fac.id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-3">
                    <p className="font-semibold text-gray-800">{fac.department}</p>
                    <p className="text-[10px] text-gray-500">{fac.designation}</p>
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-1.5 text-gray-700 font-mono text-xs">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      {fac.email}
                    </div>
                  </td>

                  <td className="p-3 font-mono text-gray-600">{fac.phone}</td>

                  <td className="p-3 text-center">
                    <span className="font-bold bg-[#EEF2FA] text-[#0E2350] px-2 py-0.5 rounded text-xs">
                      {fac.assigned_batches_count || 1}
                    </span>
                  </td>

                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleToggleStatus(fac.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                        fac.is_active
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {fac.is_active ? 'Active User' : 'Disabled'}
                    </button>
                  </td>

                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDelete(fac.id, fac.full_name)}
                      title="Delete User"
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* GENERATE FACULTY USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-gray-200 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-lg font-extrabold text-[#0E2350] flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#F07421]" />
                  Generate Faculty Coordinator User Account
                </h2>
                <p className="text-xs text-gray-500">
                  Create departmental nodal coordinator login credentials (email and password) for {currentInstitution?.name || 'College'}.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateFacultyUser} className="space-y-4 text-xs">
              {/* Name & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Faculty Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Prof. Rajesh Verma"
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Department *
                  </label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs font-semibold"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Data Science & AI">Data Science & AI</option>
                    <option value="Electrical & Electronics">Electrical & Electronics</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Biotechnology & Life Sciences">Biotechnology & Life Sciences</option>
                    <option value="Commerce & Business Studies">Commerce & Business Studies</option>
                  </select>
                </div>
              </div>

              {/* Designation & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    placeholder="e.g. Associate Professor & TPO Nodal Officer"
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Mobile / Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98480 88990"
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* Login Email */}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Official Login Email Address (Username) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="faculty.cs@institute.edu.in"
                    className="w-full pl-9 pr-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FFF3EA]/40 p-3.5 rounded-xl border border-[#F07421]/20">
                <div>
                  <label className="block font-bold text-[#0E2350] uppercase mb-1 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-[#F07421]" />
                    Set Login Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-white border border-[#E3E6EB] rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0E2350] uppercase mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-[#F07421]" />
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={formConfirmPassword}
                    onChange={(e) => setFormConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-white border border-[#E3E6EB] rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-[11px] leading-relaxed">
                <strong>Instant Account Activation:</strong> The faculty coordinator will be able to log in immediately using this email and password. They will have access to their assigned internship cohorts, student attendance verification, and milestone task monitoring.
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-lg text-xs font-bold shadow flex items-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4 text-[#F07421]" />
                  Generate User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
