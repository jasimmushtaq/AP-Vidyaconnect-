// ============================================================================
// AP VIDYACONNECT — REGISTERED COLLEGES & INSTITUTES DIRECTORY
// Complete CRUD, Filtering, District Breakdown & Accreditation Management
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { db } from '../../services/dbStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Institution, VerificationStatus } from '../../types/database';
import {
  School,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Plus,
  Edit3,
  Trash2,
  MapPin,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  ShieldCheck,
  X,
  UserPlus,
  Upload,
  ArrowRight
} from 'lucide-react';

export const InstitutionsDirectoryPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showConfirm, showToast: modalToast } = useModal();
  const [institutions, setInstitutions] = useState<Institution[]>(db.institutions);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Edit Modal State
  const [editingInst, setEditingInst] = useState<Institution | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    code: string;
    affiliated_university: string;
    principal_name: string;
    official_email: string;
    official_phone: string;
    district: string;
    accreditation: string;
    logo_url: string;
    verification_status: VerificationStatus;
  }>({
    name: '',
    code: '',
    affiliated_university: '',
    principal_name: '',
    official_email: '',
    official_phone: '',
    district: '',
    accreditation: '',
    logo_url: '',
    verification_status: 'verified',
  });

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setInstitutions([...db.institutions]);
    });
    return unsub;
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleOpenEdit = (inst: Institution) => {
    setEditingInst(inst);
    setEditForm({
      name: inst.name,
      code: inst.code,
      affiliated_university: inst.affiliated_university,
      principal_name: inst.principal_name,
      official_email: inst.official_email,
      official_phone: inst.official_phone,
      district: inst.district,
      accreditation: inst.accreditation || '',
      logo_url: inst.logo_url || '',
      verification_status: inst.verification_status,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInst || !editForm.name.trim()) return;

    db.updateInstitution(
      editingInst.id,
      {
        name: editForm.name.trim(),
        code: editForm.code.trim(),
        affiliated_university: editForm.affiliated_university.trim(),
        principal_name: editForm.principal_name.trim(),
        official_email: editForm.official_email.trim(),
        official_phone: editForm.official_phone.trim(),
        district: editForm.district.trim(),
        accreditation: editForm.accreditation.trim(),
        logo_url: editForm.logo_url.trim(),
        verification_status: editForm.verification_status,
      },
      currentUser
    );

    showToast(`Updated college details for "${editForm.name}".`);
    setEditingInst(null);
  };

  const handleDelete = async (inst: Institution) => {
    const confirmed = await showConfirm({
      title: 'Remove College from Registry?',
      subtitle: `${inst.name} (${inst.code})`,
      type: 'danger',
      badge: 'State Registry Action',
      confirmText: 'Yes, Delete College',
      cancelText: 'Cancel',
      message: `Are you sure you want to permanently remove "${inst.name}" from the Andhra Pradesh state higher education institutional registry?`
    });

    if (confirmed) {
      db.deleteInstitution(inst.id, currentUser);
      showToast(`Removed "${inst.name}" from registry.`);
    }
  };

  const handleToggleVerification = (inst: Institution) => {
    const updated = db.toggleInstitutionVerification(inst.id, currentUser);
    if (updated) {
      showToast(
        updated.verification_status === 'verified'
          ? `Verified "${inst.name}". College is live in directory!`
          : `Set "${inst.name}" to Under Review.`
      );
    }
  };

  // Districts for filtering
  const districts = Array.from(new Set(institutions.map((i) => i.district))).filter(Boolean);

  const filtered = institutions.filter((i) => {
    const matchesSearch =
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.code.toLowerCase().includes(search.toLowerCase()) ||
      i.district?.toLowerCase().includes(search.toLowerCase()) ||
      i.affiliated_university?.toLowerCase().includes(search.toLowerCase());

    const matchesDistrict = districtFilter === 'all' || i.district === districtFilter;
    const matchesStatus = statusFilter === 'all' || i.verification_status === statusFilter;

    return matchesSearch && matchesDistrict && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
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

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0E2350] via-[#102A60] to-[#1E3A8A] text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#F07421]/20 text-[#FF9E44] px-3 py-1 rounded-full text-xs font-bold mb-2 border border-[#F07421]/40">
            <School className="w-4 h-4 text-[#F07421]" />
            Higher Education Department Institutional Registry
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Registered Colleges & Universities
          </h1>
          <p className="text-xs sm:text-sm text-[#DCE5F5] mt-1 max-w-2xl">
            Directory of all Government Degree Colleges, Autonomous Institutes, and Universities participating in the State Internship Framework.
          </p>
        </div>

        <Link
          to="/admin/register-partner?type=institution"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F07421] to-[#FF8A3D] hover:from-[#E06411] hover:to-[#F07421] text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New College</span>
        </Link>
      </div>

      {/* Filter Bar — Sticky on Scroll */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-gray-200 shadow-md flex flex-col md:flex-row gap-3 items-center justify-between transition-all">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search college by name, AISHE code, or university..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0E2350]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap justify-end">
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-gray-200 font-bold bg-white text-[#0E2350] focus:ring-2 focus:ring-[#0E2350]"
          >
            <option value="all">All Districts ({districts.length})</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-gray-200 font-bold bg-white text-[#0E2350] focus:ring-2 focus:ring-[#0E2350]"
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified & Active</option>
            <option value="under_verification">Pending Audit</option>
            <option value="rejected">Rejected / Incomplete</option>
          </select>
        </div>
      </div>

      {/* Colleges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((inst) => (
          <div
            key={inst.id}
            className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-gray-200 flex items-center justify-center p-2 overflow-hidden shadow-inner shrink-0">
                  {inst.logo_url ? (
                    <img src={inst.logo_url} alt={inst.name} className="w-full h-full object-contain" />
                  ) : (
                    <School className="w-7 h-7 text-[#0E2350]" />
                  )}
                </div>

                <StatusBadge status={inst.verification_status} size="sm" />
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[10.5px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  AISHE/Code: {inst.code}
                </span>

                <h3 className="text-sm font-extrabold text-[#0E2350] leading-snug pt-1">
                  {inst.name}
                </h3>

                <p className="text-xs text-gray-500 font-medium">
                  {inst.affiliated_university}
                </p>

                {inst.accreditation && (
                  <p className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded inline-block mt-1">
                    {inst.accreditation}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-3 rounded-2xl border border-gray-200/70 mt-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#F07421] shrink-0" />
                  <span>{inst.district}, Andhra Pradesh</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{inst.official_email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>{inst.official_phone}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleToggleVerification(inst)}
                className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all ${
                  inst.verification_status === 'verified'
                    ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                {inst.verification_status === 'verified' ? 'Set Pending' : 'Verify'}
              </button>

              <div className="flex items-center gap-1.5">
                <Link
                  to={`/admin/verifications?q=${encodeURIComponent(inst.name)}`}
                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-all"
                  title="Inspect Credentials & Compliance PDFs"
                >
                  <ShieldCheck className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(inst)}
                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
                  title="Edit College Details"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(inst)}
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-all"
                  title="Delete College"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingInst && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-[#0E2350]">Edit College Information</h3>
              <button onClick={() => setEditingInst(null)} className="text-gray-400 hover:text-gray-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">College Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0E2350]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">AISHE / Code</label>
                  <input
                    type="text"
                    required
                    value={editForm.code}
                    onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">District</label>
                  <input
                    type="text"
                    value={editForm.district}
                    onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    value={editForm.official_email}
                    onChange={(e) => setEditForm({ ...editForm, official_email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Official Phone</label>
                  <input
                    type="text"
                    value={editForm.official_phone}
                    onChange={(e) => setEditForm({ ...editForm, official_phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingInst(null)}
                  className="px-4 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0E2350] hover:bg-[#14336F] text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
