// ============================================================================
// AP VIDYACONNECT — STATE SUPER ADMIN ENTITY MANAGEMENT & DIRECTORY
// Complete CRUD for Companies & Institutions with Realtime State Sync
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Institution, Company } from '../../types/database';
import {
  ShieldCheck,
  School,
  Building2,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  ExternalLink,
  Search,
  Filter,
  Check,
  Plus,
  X,
  Edit3,
  Trash2,
  Sparkles,
  MapPin,
  Globe,
  Mail,
  Phone,
  ArrowRight,
  Upload,
  Image as ImageIcon,
  FileWarning,
  UserPlus
} from 'lucide-react';

export const VerificationsQueuePage: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [institutions, setInstitutions] = useState<Institution[]>(db.institutions);
  const [companies, setCompanies] = useState<Company[]>(db.companies);
  const [search, setSearch] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal States
  const [showAddInstModal, setShowAddInstModal] = useState(false);
  const [showAddCompModal, setShowAddCompModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);

  // Logo upload & error state (PNG & WebP validation)
  const [compLogoError, setCompLogoError] = useState<string | null>(null);
  const [instLogoError, setInstLogoError] = useState<string | null>(null);
  const [showCompUrlInput, setShowCompUrlInput] = useState(false);
  const [showInstUrlInput, setShowInstUrlInput] = useState(false);

  // Institution Form (Add / Edit)
  const [instForm, setInstForm] = useState({
    name: '',
    code: '',
    affiliated_university: 'Andhra University',
    principal_name: '',
    official_email: '',
    official_phone: '+91 891 2345678',
    district: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    type: 'govt_degree_college' as const,
    accreditation: 'NAAC A+ Accredited',
    logo_url: '',
    verification_status: 'verified' as const,
  });

  // Company Form (Add / Edit)
  const [compForm, setCompForm] = useState({
    name: '',
    cin: '',
    industry: 'Information Technology & Software',
    sector: 'Enterprise Software & Cloud Platforms',
    headquarters: 'Visakhapatnam, Andhra Pradesh',
    authorized_person_name: '',
    designation: 'Director of University Relations',
    official_email: '',
    official_phone: '+91 891 4567890',
    website: 'https://',
    description: '',
    logo_url: '',
    verification_status: 'verified' as const,
  });

  // Strict PNG & WebP File Upload Handler
  const handleLogoFileUpload = (
    file: File,
    onSuccess: (dataUrl: string) => void,
    onError: (msg: string | null) => void
  ) => {
    onError(null);
    const fileName = file.name.toLowerCase();
    const isPng = file.type === 'image/png' || fileName.endsWith('.png');
    const isWebp = file.type === 'image/webp' || fileName.endsWith('.webp');

    if (!isPng && !isWebp) {
      onError('Unsupported format! Only PNG (.png) and WebP (.webp) image files are permitted.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onError('File exceeds 5MB size limit. Please choose a smaller PNG/WebP image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onSuccess(e.target.result as string);
        onError(null);
      }
    };
    reader.onerror = () => {
      onError('Failed to read image file from your device.');
    };
    reader.readAsDataURL(file);
  };

  // Default active tab based on route
  const getInitialTab = () => {
    if (location.pathname.includes('/admin/register-partner')) return 'register';
    if (location.pathname.includes('/admin/institutions')) return 'institutions';
    if (location.pathname.includes('/admin/companies')) return 'companies';
    return 'all';
  };

  const [activeTab, setActiveTab] = useState<'all' | 'register' | 'institutions' | 'companies'>(getInitialTab());

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setInstitutions([...db.institutions]);
      setCompanies([...db.companies]);
    });
    return unsub;
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // --- Company CRUD Handlers ---
  const handleOpenAddCompany = () => {
    setEditingCompany(null);
    setCompLogoError(null);
    setShowCompUrlInput(false);
    setCompForm({
      name: '',
      cin: `U72200AP2026PTC${Math.floor(100000 + Math.random() * 900000)}`,
      industry: 'Information Technology & Software',
      sector: 'Enterprise Software & Cloud Platforms',
      headquarters: 'Visakhapatnam, Andhra Pradesh',
      authorized_person_name: 'Director of Operations',
      designation: 'Head of Talent Relations',
      official_email: `careers.${Date.now().toString().slice(-4)}@partner.com`,
      official_phone: '+91 891 4567890',
      website: 'https://partner.com',
      description: 'Corporate industry partner offering structured practical internships.',
      logo_url: '',
      verification_status: 'verified',
    });
    setShowAddCompModal(true);
  };

  const handleOpenEditCompany = (c: Company) => {
    setEditingCompany(c);
    setCompLogoError(null);
    setShowCompUrlInput(false);
    setCompForm({
      name: c.name,
      cin: c.cin,
      industry: c.industry,
      sector: c.sector || '',
      headquarters: c.headquarters,
      authorized_person_name: c.authorized_person_name,
      designation: c.designation,
      official_email: c.official_email,
      official_phone: c.official_phone,
      website: c.website || '',
      description: c.description || '',
      logo_url: c.logo_url || '',
      verification_status: c.verification_status as any,
    });
    setShowAddCompModal(true);
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compForm.name.trim()) return;

    if (editingCompany) {
      db.updateCompany(
        editingCompany.id,
        {
          name: compForm.name.trim(),
          cin: compForm.cin.trim(),
          industry: compForm.industry.trim(),
          sector: compForm.sector.trim(),
          headquarters: compForm.headquarters.trim(),
          authorized_person_name: compForm.authorized_person_name.trim(),
          designation: compForm.designation.trim(),
          official_email: compForm.official_email.trim(),
          official_phone: compForm.official_phone.trim(),
          website: compForm.website.trim(),
          description: compForm.description.trim(),
          logo_url: compForm.logo_url.trim(),
          verification_status: compForm.verification_status,
        },
        currentUser
      );
      showToast(`Updated company details for "${compForm.name}". Live ecosystem refreshed!`);
    } else {
      db.addCompany(
        {
          name: compForm.name.trim(),
          cin: compForm.cin.trim(),
          industry: compForm.industry.trim(),
          sector: compForm.sector.trim(),
          headquarters: compForm.headquarters.trim(),
          authorized_person_name: compForm.authorized_person_name.trim(),
          designation: compForm.designation.trim(),
          official_email: compForm.official_email.trim(),
          official_phone: compForm.official_phone.trim(),
          website: compForm.website.trim(),
          description: compForm.description.trim(),
          logo_url: compForm.logo_url.trim(),
          verification_status: compForm.verification_status,
          verification_notes: `Directly created & verified by State Admin ${currentUser.full_name}`,
        },
        currentUser
      );
      showToast(`Added new company partner "${compForm.name}". Available publicly!`);
    }

    setShowAddCompModal(false);
    setEditingCompany(null);
  };

  const handleDeleteCompany = (c: Company) => {
    if (confirm(`Are you sure you want to permanently delete company partner "${c.name}" (${c.cin})?`)) {
      db.deleteCompany(c.id, currentUser);
      showToast(`Deleted company "${c.name}" from database.`);
    }
  };

  const handleToggleCompVerification = (c: Company) => {
    const updated = db.toggleCompanyVerification(c.id, currentUser);
    if (updated) {
      showToast(
        updated.verification_status === 'verified'
          ? `Verified "${c.name}". Company now live on homepage & partners directory!`
          : `Revoked verification for "${c.name}". Company hidden from public directory.`
      );
    }
  };

  // --- Institution CRUD Handlers ---
  const handleOpenAddInst = () => {
    setEditingInstitution(null);
    setInstLogoError(null);
    setShowInstUrlInput(false);
    setInstForm({
      name: '',
      code: `GDC-${Math.floor(100 + Math.random() * 900)}-2026`,
      affiliated_university: 'Andhra University',
      principal_name: 'Dr. Principal Rao',
      official_email: `principal.${Date.now().toString().slice(-4)}@ap.gov.in`,
      official_phone: '+91 891 2345678',
      district: 'Visakhapatnam',
      state: 'Andhra Pradesh',
      type: 'govt_degree_college',
      accreditation: 'NAAC A+ (CGPA 3.45)',
      logo_url: '',
      verification_status: 'verified',
    });
    setShowAddInstModal(true);
  };

  const handleOpenEditInst = (inst: Institution) => {
    setEditingInstitution(inst);
    setInstLogoError(null);
    setShowInstUrlInput(false);
    setInstForm({
      name: inst.name,
      code: inst.code,
      affiliated_university: inst.affiliated_university,
      principal_name: inst.principal_name,
      official_email: inst.official_email,
      official_phone: inst.official_phone,
      district: inst.district,
      state: inst.state,
      type: inst.type as any,
      accreditation: inst.accreditation || '',
      logo_url: inst.logo_url || '',
      verification_status: inst.verification_status as any,
    });
    setShowAddInstModal(true);
  };

  const handleSaveInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instForm.name.trim()) return;

    if (editingInstitution) {
      db.updateInstitution(
        editingInstitution.id,
        {
          name: instForm.name.trim(),
          code: instForm.code.trim(),
          affiliated_university: instForm.affiliated_university.trim(),
          principal_name: instForm.principal_name.trim(),
          official_email: instForm.official_email.trim(),
          official_phone: instForm.official_phone.trim(),
          district: instForm.district.trim(),
          state: instForm.state.trim(),
          type: instForm.type,
          accreditation: instForm.accreditation.trim(),
          logo_url: instForm.logo_url.trim(),
          verification_status: instForm.verification_status,
        },
        currentUser
      );
      showToast(`Updated college details for "${instForm.name}".`);
    } else {
      db.addInstitution(
        {
          name: instForm.name.trim(),
          code: instForm.code.trim(),
          affiliated_university: instForm.affiliated_university.trim(),
          principal_name: instForm.principal_name.trim(),
          official_email: instForm.official_email.trim(),
          official_phone: instForm.official_phone.trim(),
          district: instForm.district.trim(),
          state: instForm.state.trim(),
          type: instForm.type,
          accreditation: instForm.accreditation.trim(),
          logo_url: instForm.logo_url.trim(),
          verification_status: instForm.verification_status,
          verification_notes: `Directly onboarded & verified by State Admin ${currentUser.full_name}`,
        },
        currentUser
      );
      showToast(`Added new college "${instForm.name}" to state registry!`);
    }

    setShowAddInstModal(false);
    setEditingInstitution(null);
  };

  const handleDeleteInstitution = (inst: Institution) => {
    if (confirm(`Are you sure you want to delete college "${inst.name}" (${inst.code})?`)) {
      db.deleteInstitution(inst.id, currentUser);
      showToast(`Deleted college "${inst.name}".`);
    }
  };

  const handleToggleInstVerification = (inst: Institution) => {
    const updated = db.toggleInstitutionVerification(inst.id, currentUser);
    if (updated) {
      showToast(
        updated.verification_status === 'verified'
          ? `Verified "${inst.name}". College now visible on public ecosystem!`
          : `Set "${inst.name}" to Under Review.`
      );
    }
  };

  // Filter lists
  const filteredInstitutions = institutions.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.code.toLowerCase().includes(search.toLowerCase()) ||
      i.district?.toLowerCase().includes(search.toLowerCase()) ||
      i.affiliated_university?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.cin.toLowerCase().includes(search.toLowerCase()) ||
      c.industry?.toLowerCase().includes(search.toLowerCase()) ||
      c.headquarters?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#FFF3EA] text-[#0E2350] px-2.5 py-0.5 rounded text-[11px] font-bold mb-1 border border-[#F07421]/30">
            <ShieldCheck className="w-3.5 h-3.5 text-[#F07421]" />
            State Super Admin Entity Governance
          </div>
          <h1 className="text-2xl font-extrabold text-[#0E2350]">
            Entity Management & Registry Directory
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Review, verify, update, or manage participating corporate employers and government institutions in real time.
          </p>
        </div>
      </div>

      {/* Filter & Tab Switcher Bar */}
      <div className="bg-white rounded-xl border border-[#E3E6EB] p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 border-b sm:border-b-0 pb-2 sm:pb-0 w-full sm:w-auto flex-wrap">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-[#0E2350] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Entities ({institutions.length + companies.length})
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-[#F07421] to-[#D96214] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Partner</span>
            <span className="bg-white/20 text-[10px] px-1.5 py-0.2 rounded font-bold">New</span>
          </button>

          <button
            onClick={() => setActiveTab('companies')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'companies'
                ? 'bg-[#F07421] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Companies ({companies.length})
          </button>

          <button
            onClick={() => setActiveTab('institutions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'institutions'
                ? 'bg-[#0E2350] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            Colleges ({institutions.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, CIN, AISHE, city..."
            className="w-full pl-9 pr-4 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0E2350]"
          />
        </div>
      </div>

      {/* SECTION 0: REGISTER COMPANY / COLLEGE PARTNER ONBOARDING HUB */}
      {activeTab === 'register' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-gradient-to-r from-[#0E2350] via-[#14336F] to-[#0E2350] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-[#F07421] text-white px-3 py-1 rounded-full text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>State Admin Onboarding Hub</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Register New Ecosystem Partners
              </h2>
              <p className="text-xs sm:text-sm text-[#DCE5F5] leading-relaxed">
                Directly register corporate industry employers or government degree/polytechnic colleges. Upload high-resolution PNG/WebP logos and publish them live to the state directory.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Register Corporate Partner */}
            <div className="bg-white rounded-2xl border-2 border-[#FFE5D3] hover:border-[#F07421] p-6 shadow-sm space-y-4 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#FFF3EA] text-[#F07421] flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#0E2350] group-hover:text-[#F07421] transition-colors">
                  Register Corporate / MSME Partner
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Onboard corporate employers, MSMEs, or public sector enterprises with official CIN, contact coordinator, website, and transparent PNG/WebP brand logo.
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-gray-400">
                  {companies.length} active partners registered
                </span>
                <button
                  onClick={handleOpenAddCompany}
                  className="px-4 py-2 bg-[#F07421] hover:bg-[#D96214] text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Company</span>
                </button>
              </div>
            </div>

            {/* Card 2: Register College / Polytechnic */}
            <div className="bg-white rounded-2xl border-2 border-[#E3E6EB] hover:border-[#0E2350] p-6 shadow-sm space-y-4 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#EEF2FA] text-[#0E2350] flex items-center justify-center font-bold">
                <School className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#0E2350] group-hover:text-[#14336F] transition-colors">
                  Register Government College / Institute
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Add accredited Government Degree Colleges, Polytechnics, and Autonomous Universities with AISHE code, affiliation, principal email, and emblem.
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-gray-400">
                  {institutions.length} institutions enrolled
                </span>
                <button
                  onClick={handleOpenAddInst}
                  className="px-4 py-2 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4 text-[#F07421]" />
                  <span>Register College</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: COMPANIES REGISTRY & CRUD */}
      {(activeTab === 'all' || activeTab === 'companies') && (
        <div className="bg-white rounded-xl border border-[#E3E6EB] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#F07421]" />
              <h3 className="text-sm font-bold text-[#0E2350]">
                Corporate Industry Partners ({filteredCompanies.length})
              </h3>
            </div>
            <Link to="/partners" className="text-xs font-bold text-[#F07421] hover:underline flex items-center gap-1">
              View Public Showcase →
            </Link>
          </div>

          <div className="space-y-3">
            {filteredCompanies.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-gray-200 bg-[#F6F7F9]/80 hover:bg-white hover:border-[#F07421]/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-gray-700 bg-white px-2 py-0.5 rounded border text-[10px]">
                      CIN: {c.cin}
                    </span>
                    <StatusBadge status={c.verification_status} size="sm" />
                    {c.sector && (
                      <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-medium">
                        {c.sector}
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-[#0E2350] flex items-center gap-2">
                    {c.name}
                    {c.website && (
                      <a
                        href={c.website.startsWith('http') ? c.website : `https://${c.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-400 hover:text-[#2A4E96]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </h4>

                  <p className="text-gray-600">
                    <strong>Industry:</strong> {c.industry} • <strong>Location:</strong> {c.headquarters} • <strong>Contact:</strong> {c.official_email} ({c.official_phone})
                  </p>
                </div>

                {/* Action Controls: Verify / Edit / Delete */}
                <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                  <button
                    onClick={() => handleToggleCompVerification(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm ${
                      c.verification_status === 'verified'
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                        : 'bg-[#1C8A3C] hover:bg-emerald-800 text-white'
                    }`}
                  >
                    {c.verification_status === 'verified' ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Verified (Click to Unverify)
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Verify
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenEditCompany(c)}
                    className="p-1.5 bg-white hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 transition-colors"
                    title="Edit Company Details"
                  >
                    <Edit3 className="w-4 h-4 text-[#2A4E96]" />
                  </button>

                  <button
                    onClick={() => handleDeleteCompany(c)}
                    className="p-1.5 bg-white hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-lg border border-gray-200 transition-colors"
                    title="Delete Company"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: INSTITUTIONS REGISTRY & CRUD */}
      {(activeTab === 'all' || activeTab === 'institutions') && (
        <div className="bg-white rounded-xl border border-[#E3E6EB] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <School className="w-4 h-4 text-[#0E2350]" />
              <h3 className="text-sm font-bold text-[#0E2350]">
                Registered Colleges & Higher Education Institutes ({filteredInstitutions.length})
              </h3>
            </div>
            <Link to="/for-institutions" className="text-xs font-bold text-[#0E2350] hover:underline flex items-center gap-1">
              View Institutions →
            </Link>
          </div>

          <div className="space-y-3">
            {filteredInstitutions.map((inst) => (
              <div
                key={inst.id}
                className="p-4 rounded-xl border border-gray-200 bg-[#F6F7F9]/80 hover:bg-white hover:border-[#0E2350]/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-gray-700 bg-white px-2 py-0.5 rounded border text-[10px]">
                      AISHE: {inst.code}
                    </span>
                    <StatusBadge status={inst.verification_status} size="sm" />
                    {inst.accreditation && (
                      <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                        {inst.accreditation}
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-[#0E2350]">{inst.name}</h4>

                  <p className="text-gray-600">
                    <strong>Affiliated:</strong> {inst.affiliated_university} • <strong>Principal:</strong> {inst.principal_name} • <strong>Location:</strong> {inst.district}, {inst.state}
                  </p>
                </div>

                {/* Action Controls */}
                <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                  <button
                    onClick={() => handleToggleInstVerification(inst)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm ${
                      inst.verification_status === 'verified'
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                        : 'bg-[#0E2350] hover:bg-[#14336F] text-white'
                    }`}
                  >
                    {inst.verification_status === 'verified' ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Verified (Click to Unverify)
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Verify
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenEditInst(inst)}
                    className="p-1.5 bg-white hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 transition-colors"
                    title="Edit College Details"
                  >
                    <Edit3 className="w-4 h-4 text-[#2A4E96]" />
                  </button>

                  <button
                    onClick={() => handleDeleteInstitution(inst)}
                    className="p-1.5 bg-white hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-lg border border-gray-200 transition-colors"
                    title="Delete College"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT COMPANY */}
      {showAddCompModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-gray-100 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-[#0E2350] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#F07421]" />
                {editingCompany ? `Edit Partner: ${editingCompany.name}` : 'Register New Corporate Partner'}
              </h3>
              <button onClick={() => setShowAddCompModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Company / Organization Name *</label>
                <input
                  type="text"
                  required
                  value={compForm.name}
                  onChange={(e) => setCompForm({ ...compForm, name: e.target.value })}
                  placeholder="e.g. PixelWind Technology Pvt Ltd"
                  className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Corporate CIN / Reg Code</label>
                  <input
                    type="text"
                    value={compForm.cin}
                    onChange={(e) => setCompForm({ ...compForm, cin: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Industry</label>
                  <input
                    type="text"
                    value={compForm.industry}
                    onChange={(e) => setCompForm({ ...compForm, industry: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Sector / Department</label>
                  <input
                    type="text"
                    value={compForm.sector}
                    onChange={(e) => setCompForm({ ...compForm, sector: e.target.value })}
                    placeholder="e.g. Cloud & AI / Ministry of Defence"
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Location / Headquarters</label>
                  <input
                    type="text"
                    value={compForm.headquarters}
                    onChange={(e) => setCompForm({ ...compForm, headquarters: e.target.value })}
                    placeholder="e.g. Visakhapatnam, Andhra Pradesh"
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Official Email</label>
                  <input
                    type="email"
                    value={compForm.official_email}
                    onChange={(e) => setCompForm({ ...compForm, official_email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Website URL</label>
                  <input
                    type="text"
                    value={compForm.website}
                    onChange={(e) => setCompForm({ ...compForm, website: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg"
                  />
                </div>
              </div>

              {/* Logo Upload Section - PNG & WEBP Only from Device */}
              <div className="space-y-1.5 bg-[#FAFBFD] p-3.5 rounded-xl border border-[#E3E6EB]">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-gray-800 uppercase text-[11px] tracking-wider">
                    Company Logo
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF3EA] text-[#F07421] border border-[#F07421]/20">
                    PNG & WEBP Only
                  </span>
                </div>

                {compLogoError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[11px] font-semibold flex items-center gap-1.5 animate-in fade-in">
                    <FileWarning className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{compLogoError}</span>
                  </div>
                )}

                {compForm.logo_url ? (
                  <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-[#E3E6EB] shadow-sm">
                    <div className="w-14 h-14 rounded-lg bg-[#F8FAFC] p-1.5 flex items-center justify-center border border-gray-200 shrink-0 overflow-hidden">
                      <img
                        src={compForm.logo_url}
                        alt="Company Logo Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-[11px] font-bold text-gray-800 truncate">Logo attached</p>
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer text-[11px] font-bold text-[#F07421] hover:underline flex items-center gap-1">
                          <Upload className="w-3 h-3" />
                          <span>Replace File (.png, .webp)</span>
                          <input
                            type="file"
                            accept=".png,.webp,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleLogoFileUpload(
                                  file,
                                  (dataUrl) => setCompForm({ ...compForm, logo_url: dataUrl }),
                                  setCompLogoError
                                );
                              }
                            }}
                          />
                        </label>
                        <span className="text-gray-300">|</span>
                        <button
                          type="button"
                          onClick={() => setCompForm({ ...compForm, logo_url: '' })}
                          className="text-[11px] font-bold text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#D2D8E2] hover:border-[#F07421] bg-white rounded-xl p-4 text-center cursor-pointer transition-colors group">
                      <div className="w-10 h-10 rounded-full bg-[#FFF3EA] text-[#F07421] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-[#0E2350]">
                        Click to upload logo from device
                      </p>
                      <p className="text-[10.5px] text-gray-500 mt-0.5">
                        Supports <span className="font-bold text-[#F07421]">.PNG</span> and <span className="font-bold text-[#F07421]">.WEBP</span> files only (Max 5MB)
                      </p>
                      <input
                        type="file"
                        accept=".png,.webp,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleLogoFileUpload(
                              file,
                              (dataUrl) => setCompForm({ ...compForm, logo_url: dataUrl }),
                              setCompLogoError
                            );
                          }
                        }}
                      />
                    </label>

                    <div className="flex items-center justify-between px-1">
                      <button
                        type="button"
                        onClick={() => setShowCompUrlInput(!showCompUrlInput)}
                        className="text-[10.5px] font-semibold text-gray-500 hover:text-[#0E2350] underline"
                      >
                        {showCompUrlInput ? 'Hide URL input' : 'Or enter image URL instead'}
                      </button>
                    </div>

                    {showCompUrlInput && (
                      <input
                        type="text"
                        value={compForm.logo_url}
                        onChange={(e) => setCompForm({ ...compForm, logo_url: e.target.value })}
                        placeholder="https://... direct logo image link"
                        className="w-full px-3 py-2 bg-white border border-[#E3E6EB] rounded-lg font-mono text-[11px]"
                      />
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Verification Status</label>
                <select
                  value={compForm.verification_status}
                  onChange={(e) => setCompForm({ ...compForm, verification_status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-bold"
                >
                  <option value="verified">Verified (Displayed Publicly)</option>
                  <option value="under_verification">Under Verification (Hidden Publicly)</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCompModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#F07421] hover:bg-[#D96214] text-white rounded-lg font-bold shadow"
                >
                  {editingCompany ? 'Save Changes' : 'Create Company Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT INSTITUTION */}
      {showAddInstModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-gray-100 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-[#0E2350] flex items-center gap-2">
                <School className="w-4 h-4 text-[#0E2350]" />
                {editingInstitution ? `Edit College: ${editingInstitution.name}` : 'Register New Government College'}
              </h3>
              <button onClick={() => setShowAddInstModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInstitution} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">College / Institution Name *</label>
                <input
                  type="text"
                  required
                  value={instForm.name}
                  onChange={(e) => setInstForm({ ...instForm, name: e.target.value })}
                  placeholder="e.g. Government Degree College, Vijayawada"
                  className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">AISHE / Code</label>
                  <input
                    type="text"
                    value={instForm.code}
                    onChange={(e) => setInstForm({ ...instForm, code: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Affiliated University</label>
                  <input
                    type="text"
                    value={instForm.affiliated_university}
                    onChange={(e) => setInstForm({ ...instForm, affiliated_university: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">District</label>
                  <input
                    type="text"
                    value={instForm.district}
                    onChange={(e) => setInstForm({ ...instForm, district: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Principal Name</label>
                  <input
                    type="text"
                    value={instForm.principal_name}
                    onChange={(e) => setInstForm({ ...instForm, principal_name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Institution Type</label>
                  <select
                    value={instForm.type}
                    onChange={(e) => setInstForm({ ...instForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-medium"
                  >
                    <option value="govt_degree_college">Govt Degree College</option>
                    <option value="govt_polytechnic">Govt Polytechnic</option>
                    <option value="govt_university">State University</option>
                    <option value="autonomous_govt_institute">Autonomous Institute</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Verification Status</label>
                  <select
                    value={instForm.verification_status}
                    onChange={(e) => setInstForm({ ...instForm, verification_status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-bold"
                  >
                    <option value="verified">Verified (Displayed Publicly)</option>
                    <option value="under_verification">Under Verification (Hidden)</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* College Logo Upload Section - PNG & WEBP Only from Device */}
              <div className="space-y-1.5 bg-[#FAFBFD] p-3.5 rounded-xl border border-[#E3E6EB]">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-gray-800 uppercase text-[11px] tracking-wider">
                    College / Institution Emblem / Logo
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EEF2FA] text-[#0E2350] border border-[#0E2350]/20">
                    PNG & WEBP Only
                  </span>
                </div>

                {instLogoError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[11px] font-semibold flex items-center gap-1.5 animate-in fade-in">
                    <FileWarning className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{instLogoError}</span>
                  </div>
                )}

                {instForm.logo_url ? (
                  <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-[#E3E6EB] shadow-sm">
                    <div className="w-14 h-14 rounded-lg bg-[#F8FAFC] p-1.5 flex items-center justify-center border border-gray-200 shrink-0 overflow-hidden">
                      <img
                        src={instForm.logo_url}
                        alt="College Logo Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-[11px] font-bold text-gray-800 truncate">Emblem attached</p>
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer text-[11px] font-bold text-[#0E2350] hover:underline flex items-center gap-1">
                          <Upload className="w-3 h-3" />
                          <span>Replace File (.png, .webp)</span>
                          <input
                            type="file"
                            accept=".png,.webp,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleLogoFileUpload(
                                  file,
                                  (dataUrl) => setInstForm({ ...instForm, logo_url: dataUrl }),
                                  setInstLogoError
                                );
                              }
                            }}
                          />
                        </label>
                        <span className="text-gray-300">|</span>
                        <button
                          type="button"
                          onClick={() => setInstForm({ ...instForm, logo_url: '' })}
                          className="text-[11px] font-bold text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#D2D8E2] hover:border-[#0E2350] bg-white rounded-xl p-4 text-center cursor-pointer transition-colors group">
                      <div className="w-10 h-10 rounded-full bg-[#EEF2FA] text-[#0E2350] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-[#0E2350]">
                        Click to upload emblem/logo from device
                      </p>
                      <p className="text-[10.5px] text-gray-500 mt-0.5">
                        Supports <span className="font-bold text-[#0E2350]">.PNG</span> and <span className="font-bold text-[#0E2350]">.WEBP</span> files only (Max 5MB)
                      </p>
                      <input
                        type="file"
                        accept=".png,.webp,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleLogoFileUpload(
                              file,
                              (dataUrl) => setInstForm({ ...instForm, logo_url: dataUrl }),
                              setInstLogoError
                            );
                          }
                        }}
                      />
                    </label>

                    <div className="flex items-center justify-between px-1">
                      <button
                        type="button"
                        onClick={() => setShowInstUrlInput(!showInstUrlInput)}
                        className="text-[10.5px] font-semibold text-gray-500 hover:text-[#0E2350] underline"
                      >
                        {showInstUrlInput ? 'Hide URL input' : 'Or enter image URL instead'}
                      </button>
                    </div>

                    {showInstUrlInput && (
                      <input
                        type="text"
                        value={instForm.logo_url}
                        onChange={(e) => setInstForm({ ...instForm, logo_url: e.target.value })}
                        placeholder="https://... direct logo image link"
                        className="w-full px-3 py-2 bg-white border border-[#E3E6EB] rounded-lg font-mono text-[11px]"
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddInstModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-lg font-bold shadow"
                >
                  {editingInstitution ? 'Save Changes' : 'Create College'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
