// ============================================================================
// AP VIDYACONNECT — REGISTERED CORPORATE INDUSTRY PARTNERS DIRECTORY
// Complete CRUD, Industry Filtering, Headquarters Breakdown & Openings Sync
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { db } from '../../services/dbStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Company, VerificationStatus } from '../../types/database';
import {
  Building2,
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
  Briefcase,
  ArrowRight
} from 'lucide-react';

export const CompaniesDirectoryPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showConfirm, showToast: modalToast } = useModal();
  const [companies, setCompanies] = useState<Company[]>(db.companies);
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Edit Modal State
  const [editingComp, setEditingComp] = useState<Company | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    cin: string;
    industry: string;
    sector: string;
    headquarters: string;
    authorized_person_name: string;
    designation: string;
    official_email: string;
    official_phone: string;
    website: string;
    description: string;
    logo_url: string;
    verification_status: VerificationStatus;
  }>({
    name: '',
    cin: '',
    industry: '',
    sector: '',
    headquarters: '',
    authorized_person_name: '',
    designation: '',
    official_email: '',
    official_phone: '',
    website: '',
    description: '',
    logo_url: '',
    verification_status: 'verified',
  });

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setCompanies([...db.companies]);
    });
    return unsub;
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleOpenEdit = (comp: Company) => {
    setEditingComp(comp);
    setEditForm({
      name: comp.name,
      cin: comp.cin,
      industry: comp.industry,
      sector: comp.sector || '',
      headquarters: comp.headquarters,
      authorized_person_name: comp.authorized_person_name,
      designation: comp.designation,
      official_email: comp.official_email,
      official_phone: comp.official_phone,
      website: comp.website || '',
      description: comp.description || '',
      logo_url: comp.logo_url || '',
      verification_status: comp.verification_status,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComp || !editForm.name.trim()) return;

    db.updateCompany(
      editingComp.id,
      {
        name: editForm.name.trim(),
        cin: editForm.cin.trim(),
        industry: editForm.industry.trim(),
        sector: editForm.sector.trim(),
        headquarters: editForm.headquarters.trim(),
        authorized_person_name: editForm.authorized_person_name.trim(),
        designation: editForm.designation.trim(),
        official_email: editForm.official_email.trim(),
        official_phone: editForm.official_phone.trim(),
        website: editForm.website.trim(),
        description: editForm.description.trim(),
        logo_url: editForm.logo_url.trim(),
        verification_status: editForm.verification_status,
      },
      currentUser
    );

    showToast(`Updated company details for "${editForm.name}".`);
    setEditingComp(null);
  };

  const handleDelete = async (comp: Company) => {
    const confirmed = await showConfirm({
      title: 'Remove Corporate Partner?',
      subtitle: `${comp.name} (CIN: ${comp.cin})`,
      type: 'danger',
      badge: 'Partner Registry Action',
      confirmText: 'Yes, Delete Partner',
      cancelText: 'Cancel',
      message: `Are you sure you want to permanently remove "${comp.name}" from the state industry partner directory? Associated active postings will be archived.`
    });

    if (confirmed) {
      db.deleteCompany(comp.id, currentUser);
      showToast(`Removed "${comp.name}" from partner registry.`);
    }
  };

  const handleToggleVerification = (comp: Company) => {
    const updated = db.toggleCompanyVerification(comp.id, currentUser);
    if (updated) {
      showToast(
        updated.verification_status === 'verified'
          ? `Verified "${comp.name}". Company is active on public partner network!`
          : `Set "${comp.name}" to Under Review.`
      );
    }
  };

  // Industries for filtering
  const industries = Array.from(new Set(companies.map((c) => c.industry))).filter(Boolean);

  const filtered = companies.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.cin.toLowerCase().includes(search.toLowerCase()) ||
      c.industry?.toLowerCase().includes(search.toLowerCase()) ||
      c.headquarters?.toLowerCase().includes(search.toLowerCase());

    const matchesIndustry = industryFilter === 'all' || c.industry === industryFilter;
    const matchesStatus = statusFilter === 'all' || c.verification_status === statusFilter;

    return matchesSearch && matchesIndustry && matchesStatus;
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
            <Building2 className="w-4 h-4 text-[#F07421]" />
            Corporate Industry Partner Registry
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Registered Companies & Employers
          </h1>
          <p className="text-xs sm:text-sm text-[#DCE5F5] mt-1 max-w-2xl">
            Directory of corporate organizations, enterprises, and industry partners offering verified credit-bearing internships and stipends.
          </p>
        </div>

        <Link
          to="/admin/register-partner?type=company"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F07421] to-[#FF8A3D] hover:from-[#E06411] hover:to-[#F07421] text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Company</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company by name, CIN, or industry..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0E2350]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap justify-end">
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-gray-200 font-bold bg-white text-[#0E2350] focus:ring-2 focus:ring-[#0E2350]"
          >
            <option value="all">All Industries ({industries.length})</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
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

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((comp) => (
          <div
            key={comp.id}
            className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-gray-200 flex items-center justify-center p-2 overflow-hidden shadow-inner shrink-0">
                  {comp.logo_url ? (
                    <img src={comp.logo_url} alt={comp.name} className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="w-7 h-7 text-[#F07421]" />
                  )}
                </div>

                <StatusBadge status={comp.verification_status} size="sm" />
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[10.5px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  CIN: {comp.cin}
                </span>

                <h3 className="text-sm font-extrabold text-[#0E2350] leading-snug pt-1">
                  {comp.name}
                </h3>

                <p className="text-xs text-gray-500 font-medium">
                  {comp.industry} • {comp.sector}
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-3 rounded-2xl border border-gray-200/70 mt-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#F07421] shrink-0" />
                  <span>{comp.headquarters}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{comp.official_email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>{comp.official_phone}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleToggleVerification(comp)}
                className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all ${
                  comp.verification_status === 'verified'
                    ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                {comp.verification_status === 'verified' ? 'Set Pending' : 'Verify'}
              </button>

              <div className="flex items-center gap-1.5">
                <Link
                  to={`/admin/verifications?q=${encodeURIComponent(comp.name)}`}
                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-all"
                  title="Inspect Credentials & Compliance PDFs"
                >
                  <ShieldCheck className="w-4 h-4" />
                </Link>
                <Link
                  to={`/partners/${comp.id}`}
                  className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 transition-all"
                  title="View Public Profile"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(comp)}
                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
                  title="Edit Company Details"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(comp)}
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-all"
                  title="Delete Company"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingComp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-[#0E2350]">Edit Company Information</h3>
              <button onClick={() => setEditingComp(null)} className="text-gray-400 hover:text-gray-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Company Name</label>
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
                  <label className="block font-bold text-gray-700 mb-1">MCA CIN</label>
                  <input
                    type="text"
                    required
                    value={editForm.cin}
                    onChange={(e) => setEditForm({ ...editForm, cin: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Industry</label>
                  <input
                    type="text"
                    value={editForm.industry}
                    onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
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

              <div>
                <label className="block font-bold text-gray-700 mb-1">Headquarters</label>
                <input
                  type="text"
                  value={editForm.headquarters}
                  onChange={(e) => setEditForm({ ...editForm, headquarters: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingComp(null)}
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
