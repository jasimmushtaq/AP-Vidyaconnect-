// ============================================================================
// AP VIDYACONNECT — ONBOARDING & REGISTRATION PAGE
// Multi-actor registration with strict mandatory validation & document checks
// ============================================================================

import React, { useState, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { InstitutionType, AttachedDocument } from '../../types/database';
import { db } from '../../services/dbStore';
import { FileUploader } from '../../components/common/FileUploader';
import { DocumentViewerModal } from '../../components/common/DocumentViewerModal';
import {
  School,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  User,
  Lock,
  Mail,
  Phone,
  Clock,
  AlertCircle,
  FileText,
  Plus,
  Trash2,
  Paperclip,
  Eye,
  FileCheck,
  ShieldAlert,
  Loader2,
  Check,
  UploadCloud,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { registerInstitutionAdmin, registerCompanyAdmin } = useAuth();

  const defaultTab = searchParams.get('type') === 'company' ? 'company' : 'institution';
  const [activeTab, setActiveTab] = useState<'institution' | 'company'>(defaultTab);

  const [submitted, setSubmitted] = useState(false);
  const [submittedEntityName, setSubmittedEntityName] = useState('');
  const [submittedEntityCode, setSubmittedEntityCode] = useState('');
  const [submittedAdminEmail, setSubmittedAdminEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [missingFieldsList, setMissingFieldsList] = useState<string[]>([]);
  const [previewDoc, setPreviewDoc] = useState<AttachedDocument | null>(null);

  // References for smooth scrolling
  const errorBannerRef = useRef<HTMLDivElement>(null);
  const instDocSectionRef = useRef<HTMLDivElement>(null);
  const compDocSectionRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------------------------
  // 1. Institution Form State
  // ---------------------------------------------------------------------------
  const [instForm, setInstForm] = useState({
    code: `AP-INST-${Math.floor(1000 + Math.random() * 9000)}`,
    name: '',
    type: 'govt_degree_college' as InstitutionType,
    affiliated_university: '',
    address: '',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    pin_code: '',
    principal_name: '',
    official_email: '',
    official_phone: '',
    establishment_year: 2005,
    accreditation: 'NAAC Accredited',
    website: ''
  });

  // Attached Documents for Institution (MANDATORY)
  const [instDocs, setInstDocs] = useState<AttachedDocument[]>([]);

  // Institution Admin Account State
  const [instAdmin, setInstAdmin] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // ---------------------------------------------------------------------------
  // 2. Company Form State
  // ---------------------------------------------------------------------------
  const [compForm, setCompForm] = useState({
    cin: `U72200AP2026PTC${Math.floor(100000 + Math.random() * 900000)}`,
    name: '',
    industry: 'Information Technology & Cloud Services',
    sector: 'Software Engineering & Cloud Architecture',
    gst: '',
    official_email: '',
    official_phone: '',
    website: '',
    headquarters: 'Visakhapatnam, Andhra Pradesh',
    authorized_person_name: '',
    designation: 'Director - University Relations',
  });

  // Attached Documents for Company (MANDATORY)
  const [compDocs, setCompDocs] = useState<AttachedDocument[]>([]);

  // Company Admin Account State
  const [compAdmin, setCompAdmin] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // ---------------------------------------------------------------------------
  // Document Upload Handlers & Quick Sample Attachers
  // ---------------------------------------------------------------------------
  const handleAddInstDoc = (doc: { url: string; public_id: string; filename: string }) => {
    const newDoc: AttachedDocument = {
      id: `doc-inst-${Date.now()}`,
      name: doc.filename || 'College_Affiliation_NAAC_Certificate.pdf',
      url: doc.url,
      file_type: 'application/pdf',
      file_size: '1.9 MB',
      category: 'accreditation_letter',
      uploaded_at: new Date().toISOString(),
      uploaded_by: instAdmin.fullName || instForm.principal_name || 'Institution Principal'
    };
    setInstDocs(prev => [...prev, newDoc]);
    setFormError(null);
    setMissingFieldsList([]);
  };

  const handleAddSampleInstDoc = () => {
    const sampleDoc: AttachedDocument = {
      id: `doc-inst-${Date.now()}`,
      name: `${instForm.name || 'College'}_NAAC_Affiliation_Approval_2026.pdf`,
      url: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800',
      file_type: 'application/pdf',
      file_size: '2.4 MB',
      category: 'accreditation_letter',
      uploaded_at: new Date().toISOString(),
      uploaded_by: instAdmin.fullName || instForm.principal_name || 'Institution Principal'
    };
    setInstDocs(prev => [...prev, sampleDoc]);
    setFormError(null);
    setMissingFieldsList([]);
  };

  const handleAddCompDoc = (doc: { url: string; public_id: string; filename: string }) => {
    const newDoc: AttachedDocument = {
      id: `doc-comp-${Date.now()}`,
      name: doc.filename || 'Corporate_MCA_GST_Certificate.pdf',
      url: doc.url,
      file_type: 'application/pdf',
      file_size: '2.2 MB',
      category: 'mca_incorporation',
      uploaded_at: new Date().toISOString(),
      uploaded_by: compAdmin.fullName || 'Company HR'
    };
    setCompDocs(prev => [...prev, newDoc]);
    setFormError(null);
    setMissingFieldsList([]);
  };

  const handleAddSampleCompDoc = () => {
    const sampleDoc: AttachedDocument = {
      id: `doc-comp-${Date.now()}`,
      name: `${compForm.name || 'Company'}_MCA_Incorporation_GST_Proof.pdf`,
      url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
      file_type: 'application/pdf',
      file_size: '2.1 MB',
      category: 'mca_incorporation',
      uploaded_at: new Date().toISOString(),
      uploaded_by: compAdmin.fullName || 'Company HR'
    };
    setCompDocs(prev => [...prev, sampleDoc]);
    setFormError(null);
    setMissingFieldsList([]);
  };

  // ---------------------------------------------------------------------------
  // Validation Logic: "THEN ONLY WE CAN CREATE ACCOUNT"
  // ---------------------------------------------------------------------------
  const getInstMissingFields = (): string[] => {
    const missing: string[] = [];
    if (!instForm.name.trim()) missing.push('1. Institution Legal Name');
    if (!instForm.code.trim()) missing.push('1. College AISHE / Portal Code');
    if (!instForm.affiliated_university.trim()) missing.push('1. Affiliated University / Board');
    if (!instForm.accreditation.trim()) missing.push('1. Accreditation (NAAC / NBA)');
    if (!instForm.principal_name.trim()) missing.push('1. Principal / Head Name');
    if (!instForm.official_phone.trim()) missing.push('1. Official College Telephone');
    if (instDocs.length === 0) missing.push('1. Mandatory Accreditation & Compliance Documents (At least 1 PDF/Image required)');
    if (!instAdmin.fullName.trim()) missing.push('2. Administrator Full Name');
    if (!instAdmin.email.trim()) missing.push('2. Admin Official Email (Login ID)');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(instAdmin.email.trim())) missing.push('2. Valid Admin Official Email format');
    if (!instAdmin.phone.trim()) missing.push('2. Admin Mobile / WhatsApp');
    if (!instAdmin.password) missing.push('2. Create Secure Password');
    else if (instAdmin.password.length < 6) missing.push('2. Password must be at least 6 characters');
    if (!instAdmin.confirmPassword) missing.push('2. Confirm Password');
    else if (instAdmin.password !== instAdmin.confirmPassword) missing.push('2. Confirm Password must match password');
    return missing;
  };

  const getCompMissingFields = (): string[] => {
    const missing: string[] = [];
    if (!compForm.name.trim()) missing.push('1. Company Legal Name');
    if (!compForm.cin.trim()) missing.push('1. Corporate CIN Number');
    if (!compForm.industry.trim()) missing.push('1. Industry Domain');
    if (!compForm.gst.trim()) missing.push('1. GST Registration No.');
    if (!compForm.headquarters.trim()) missing.push('1. HQ Address');
    if (!compForm.official_phone.trim()) missing.push('1. Official Company Phone');
    if (compDocs.length === 0) missing.push('1. Mandatory Corporate Documents & MCA/GST Proof (At least 1 PDF/Image required)');
    if (!compAdmin.fullName.trim()) missing.push('2. HR / Authorized Person Name');
    if (!compAdmin.email.trim()) missing.push('2. Official Work Email (Login ID)');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(compAdmin.email.trim())) missing.push('2. Valid Work Email format');
    if (!compAdmin.phone.trim()) missing.push('2. Contact Phone');
    if (!compAdmin.password) missing.push('2. Create Password');
    else if (compAdmin.password.length < 6) missing.push('2. Password must be at least 6 characters');
    if (!compAdmin.confirmPassword) missing.push('2. Confirm Password');
    else if (compAdmin.password !== compAdmin.confirmPassword) missing.push('2. Confirm Password must match password');
    return missing;
  };

  // Live Booleans for visual readiness indicators
  const isInstLegalComplete = useMemo(() => {
    return Boolean(
      instForm.name.trim() &&
      instForm.code.trim() &&
      instForm.affiliated_university.trim() &&
      instForm.accreditation.trim() &&
      instForm.principal_name.trim() &&
      instForm.official_phone.trim()
    );
  }, [instForm]);

  const isInstDocComplete = instDocs.length > 0;

  const isInstAdminComplete = useMemo(() => {
    return Boolean(
      instAdmin.fullName.trim() &&
      instAdmin.email.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(instAdmin.email.trim()) &&
      instAdmin.phone.trim() &&
      instAdmin.password.length >= 6 &&
      instAdmin.password === instAdmin.confirmPassword
    );
  }, [instAdmin]);

  const isInstReadyToCreate = isInstLegalComplete && isInstDocComplete && isInstAdminComplete;

  const isCompLegalComplete = useMemo(() => {
    return Boolean(
      compForm.name.trim() &&
      compForm.cin.trim() &&
      compForm.industry.trim() &&
      compForm.gst.trim() &&
      compForm.headquarters.trim() &&
      compForm.official_phone.trim()
    );
  }, [compForm]);

  const isCompDocComplete = compDocs.length > 0;

  const isCompAdminComplete = useMemo(() => {
    return Boolean(
      compAdmin.fullName.trim() &&
      compAdmin.email.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(compAdmin.email.trim()) &&
      compAdmin.phone.trim() &&
      compAdmin.password.length >= 6 &&
      compAdmin.password === compAdmin.confirmPassword
    );
  }, [compAdmin]);

  const isCompReadyToCreate = isCompLegalComplete && isCompDocComplete && isCompAdminComplete;

  // ---------------------------------------------------------------------------
  // Institution Submit Handler
  // ---------------------------------------------------------------------------
  const handleInstSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setMissingFieldsList([]);

    // Strict validation: ALL fields + Mandatory Document must be added first
    const missing = getInstMissingFields();
    if (missing.length > 0) {
      setMissingFieldsList(missing);
      setFormError('Account creation locked: You must fill all information in Section 1 and Section 2, and upload at least one mandatory compliance document first.');
      errorBannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const cleanEmail = instAdmin.email.trim().toLowerCase();
    const existingInst = db.institutions.find(i => i.official_email?.toLowerCase().trim() === cleanEmail);
    const existingProf = db.profiles.find(p => p.email?.toLowerCase().trim() === cleanEmail);
    if (existingInst || existingProf) {
      setFormError(`An institution account is already registered with "${cleanEmail}". You do not need to register again — please log in to access your Institution Dashboard.`);
      return;
    }

    const payload = {
      ...instForm,
      document_url: instDocs[0]?.url,
      document_name: instDocs[0]?.name,
      documents: instDocs
    };

    setIsSubmitting(true);
    try {
      const res = await registerInstitutionAdmin(payload, instAdmin);
      if (!res.success || !res.institution || !res.user) {
        setFormError(res.error || 'Failed to persist institution registration to shared database. Please try again.');
        return;
      }
      setSubmittedEntityName(res.institution.name);
      setSubmittedEntityCode(res.institution.code);
      setSubmittedAdminEmail(res.user.email);
      setSubmitted(true);
    } catch (err: any) {
      setFormError(err?.message || 'Registration failed. Please check your network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Company Submit Handler
  // ---------------------------------------------------------------------------
  const handleCompSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setMissingFieldsList([]);

    // Strict validation: ALL fields + Mandatory Document must be added first
    const missing = getCompMissingFields();
    if (missing.length > 0) {
      setMissingFieldsList(missing);
      setFormError('Account creation locked: You must fill all information in Section 1 and Section 2, and upload at least one corporate document (MCA/GST Proof) first.');
      errorBannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const cleanEmail = compAdmin.email.trim().toLowerCase();
    const existingComp = db.companies.find(c => c.official_email?.toLowerCase().trim() === cleanEmail || (compForm.cin && c.cin?.toLowerCase().trim() === compForm.cin.toLowerCase().trim()));
    const existingProf = db.profiles.find(p => p.email?.toLowerCase().trim() === cleanEmail);
    if (existingComp || existingProf) {
      setFormError(`A company account is already registered with "${cleanEmail}". You do not need to register again — please log in to access your Company Dashboard.`);
      return;
    }

    const payload = {
      ...compForm,
      document_url: compDocs[0]?.url,
      document_name: compDocs[0]?.name,
      documents: compDocs
    };

    setIsSubmitting(true);
    try {
      const res = await registerCompanyAdmin(payload, compAdmin);
      if (!res.success || !res.company || !res.user) {
        setFormError(res.error || 'Failed to persist company registration to shared database. Please try again.');
        return;
      }
      setSubmittedEntityName(res.company.name);
      setSubmittedEntityCode(res.company.cin);
      setSubmittedAdminEmail(res.user.email);
      setSubmitted(true);
    } catch (err: any) {
      setFormError(err?.message || 'Registration failed. Please check your network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Success Confirmation Screen
  // ---------------------------------------------------------------------------
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-amber-300 p-8 sm:p-10 shadow-2xl space-y-6 text-left">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
              <Clock className="w-9 h-9" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-300 text-amber-800 rounded-full text-[11px] font-extrabold uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                Under State Super Admin Verification
              </div>
              <h2 className="text-2xl font-extrabold text-[#0E2350] mt-1">
                {submittedEntityName}
              </h2>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-semibold">Application Reference Code:</span>
              <span className="font-mono font-bold text-[#0E2350] bg-white px-2.5 py-1 rounded border border-slate-200">
                {submittedEntityCode}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-semibold">Registered Admin Login:</span>
              <span className="font-bold text-slate-900">{submittedAdminEmail}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Verification Authority:</span>
              <span className="font-bold text-slate-900">Dr. Varun Surya, IAS (State Super Admin)</span>
            </div>
          </div>

          <div className="bg-[#FFF3EA] border border-[#F07421]/30 p-4 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-2 text-[#F07421] font-bold">
              <ShieldCheck className="w-4 h-4" />
              Registration & Document Audit Pending
            </div>
            <p className="text-gray-700 leading-relaxed">
              Your account and compliance documents have been submitted to the AP VidyaConnect State Verification Queue. You can sign in immediately using your registered email and password to access your dedicated workspace. State Super Admin will audit statutory credentials.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100">
            <Link
              to="/"
              className="px-5 py-2.5 bg-white hover:bg-slate-100 text-[#0E2350] border border-slate-300 rounded-xl text-xs font-bold transition-all"
            >
              Return to Home
            </Link>

            <Link
              to="/login"
              className="px-6 py-2.5 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
            >
              Sign In to Your Dashboard
              <ArrowRight className="w-4 h-4 text-[#F07421]" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Main Registration Form
  // ---------------------------------------------------------------------------
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-300 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          Mandatory Verification Gate Active
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0E2350]">
          Institutional & Corporate Onboarding
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
          Complete all mandatory legal details, attach verified compliance documents, and configure administrator credentials to create your authorized account.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E3E6EB] max-w-md mx-auto">
        <button
          onClick={() => {
            setActiveTab('institution');
            setFormError(null);
            setMissingFieldsList([]);
          }}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
            activeTab === 'institution'
              ? 'border-[#0E2350] text-[#0E2350]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <School className="w-4 h-4 text-[#0E2350]" />
          Government College / Institute
        </button>

        <button
          onClick={() => {
            setActiveTab('company');
            setFormError(null);
            setMissingFieldsList([]);
          }}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
            activeTab === 'company'
              ? 'border-[#F07421] text-[#F07421]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Building2 className="w-4 h-4 text-[#F07421]" />
          Corporate / Industry Partner
        </button>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-2xl border border-[#E3E6EB] p-6 sm:p-8 shadow-sm space-y-6">

        {/* Global Error Banner (if validation fails) */}
        {formError && (
          <div ref={errorBannerRef} className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl text-rose-900 text-xs shadow-md animate-fade-in space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-rose-700">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
            {missingFieldsList.length > 0 && (
              <div className="pt-2 border-t border-rose-200">
                <span className="font-extrabold text-[11px] text-rose-800 uppercase tracking-wider block mb-1">
                  Missing Requirements to Create Account:
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-rose-700">
                  {missingFieldsList.map((m, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 font-medium">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Live Step-by-Step Readiness Tracker */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="text-[11px] font-black uppercase text-slate-500 tracking-wider mb-2">
            Account Creation Requirements Status:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            {/* Step 1 Status */}
            <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
              (activeTab === 'institution' ? isInstLegalComplete : isCompLegalComplete)
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}>
              <span className="font-bold">1. Legal Info</span>
              {(activeTab === 'institution' ? isInstLegalComplete : isCompLegalComplete) ? (
                <span className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700">
                  <AlertTriangle className="w-3.5 h-3.5" /> Incomplete
                </span>
              )}
            </div>

            {/* Document Status */}
            <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
              (activeTab === 'institution' ? isInstDocComplete : isCompDocComplete)
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}>
              <span className="font-bold">Mandatory Doc</span>
              {(activeTab === 'institution' ? isInstDocComplete : isCompDocComplete) ? (
                <span className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Attached
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-extrabold text-rose-700">
                  <AlertCircle className="w-3.5 h-3.5" /> 0 Attached (Required)
                </span>
              )}
            </div>

            {/* Step 2 Status */}
            <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
              (activeTab === 'institution' ? isInstAdminComplete : isCompAdminComplete)
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}>
              <span className="font-bold">2. Admin Setup</span>
              {(activeTab === 'institution' ? isInstAdminComplete : isCompAdminComplete) ? (
                <span className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700">
                  <AlertTriangle className="w-3.5 h-3.5" /> Incomplete
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* INSTITUTION REGISTRATION FORM */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'institution' ? (
          <form onSubmit={handleInstSubmit} className="space-y-6">
            {/* 1. College & University Information */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#0E2350] border-b border-gray-100 pb-2 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <School className="w-4 h-4 text-[#2A4E96]" />
                  1. College & University Information
                </span>
                <span className="text-[11px] font-semibold text-rose-600">* All Fields Required</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Institution Legal Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Andhra Loyola Institute of Engineering & Technology"
                    value={instForm.name}
                    onChange={(e) => setInstForm({ ...instForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] focus:border-[#2A4E96] rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    College AISHE / Portal Code <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AP-INST-7044"
                    value={instForm.code}
                    onChange={(e) => setInstForm({ ...instForm, code: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] focus:border-[#2A4E96] rounded-lg font-mono font-bold text-[#0E2350] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Affiliated University / Board <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JNTUK Kakinada / Andhra University"
                    value={instForm.affiliated_university}
                    onChange={(e) => setInstForm({ ...instForm, affiliated_university: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] focus:border-[#2A4E96] rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Accreditation (NAAC / NBA) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NAAC Accredited A+ / NBA"
                    value={instForm.accreditation}
                    onChange={(e) => setInstForm({ ...instForm, accreditation: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] focus:border-[#2A4E96] rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Principal / Head Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. O. Mahesh, M.Tech, Ph.D"
                    value={instForm.principal_name}
                    onChange={(e) => setInstForm({ ...instForm, principal_name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] focus:border-[#2A4E96] rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Official College Telephone <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 866 2476161"
                    value={instForm.official_phone}
                    onChange={(e) => setInstForm({ ...instForm, official_phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] focus:border-[#2A4E96] rounded-lg focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Mandatory Accreditation & Compliance Documents Upload */}
            <div ref={instDocSectionRef} className="space-y-3 p-4 bg-blue-50/50 rounded-xl border-2 border-blue-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-black text-[#0E2350] uppercase tracking-wider flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-[#F07421]" />
                    Mandatory Accreditation & Compliance Documents (PDF) <span className="text-rose-600">*</span>
                  </h4>
                  <p className="text-[11px] text-gray-600">
                    State Super Admin will inspect and audit these uploaded credentials before verification.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {instDocs.length === 0 ? (
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 border border-rose-300 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      0 Attached (Mandatory Document Required *)
                    </span>
                  ) : (
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {instDocs.length} Attached (Requirement Satisfied)
                    </span>
                  )}
                </div>
              </div>

              {/* Upload Dropzone */}
              <FileUploader
                label="Upload College Affiliation / NAAC / Principal Authorization (PDF)"
                folderKind="institution_verification"
                helpText="Accepted format: PDF, PNG, JPG (Max 10 MB)"
                maxSizeMB={10}
                onUploadComplete={handleAddInstDoc}
              />

              {/* Quick Sample Attacher for Seamless Testing */}
              {instDocs.length === 0 && (
                <div className="pt-1 flex items-center justify-between bg-white/70 p-2.5 rounded-lg border border-blue-100 text-xs">
                  <span className="text-[11px] text-gray-500">
                    Testing registration or don't have a PDF ready?
                  </span>
                  <button
                    type="button"
                    onClick={handleAddSampleInstDoc}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0E2350] hover:bg-[#14336F] text-white text-[10px] font-bold transition shadow-xs"
                  >
                    <Sparkles className="w-3 h-3 text-[#F07421]" />
                    Attach Sample Verified NAAC/Affiliation PDF
                  </button>
                </div>
              )}

              {/* Attached Documents List */}
              {instDocs.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Attached Verification Documents ({instDocs.length}):
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {instDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-blue-200 text-xs shadow-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-800 truncate text-xs">{doc.name}</p>
                            <p className="text-[10px] text-gray-500">
                              {doc.file_size || '1.8 MB'} • {doc.category?.replace(/_/g, ' ') || 'Accreditation Certificate'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center gap-1 transition-colors"
                            title="Preview PDF"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Preview</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setInstDocs(prev => prev.filter(d => d.id !== doc.id))}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Remove document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Principal / Administrator Login Account Setup */}
            <div className="space-y-4 pt-2">
              <h3 className="text-base font-bold text-[#0E2350] border-b border-gray-100 pb-2 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#F07421]" />
                  2. Principal / Administrator Login Account Setup
                </span>
                <span className="text-[11px] font-semibold text-rose-600">* All Fields Required</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Administrator Full Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={instAdmin.fullName}
                    onChange={(e) => setInstAdmin({ ...instAdmin, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] focus:border-[#2A4E96] rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Admin Official Email (Login ID) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="principal@college.edu.in"
                    value={instAdmin.email}
                    onChange={(e) => setInstAdmin({ ...instAdmin, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] focus:border-[#2A4E96] rounded-lg font-mono text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Admin Mobile / WhatsApp <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98480 12345"
                    value={instAdmin.phone}
                    onChange={(e) => setInstAdmin({ ...instAdmin, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] focus:border-[#2A4E96] rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Create Secure Password * <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter password (min 6 characters)"
                    value={instAdmin.password}
                    onChange={(e) => setInstAdmin({ ...instAdmin, password: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] focus:border-[#2A4E96] rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Confirm Password * <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={instAdmin.confirmPassword}
                    onChange={(e) => setInstAdmin({ ...instAdmin, confirmPassword: e.target.value })}
                    className={`w-full px-3 py-2 bg-[#F6F7F9] border rounded-lg focus:outline-none ${
                      instAdmin.confirmPassword && instAdmin.password !== instAdmin.confirmPassword
                        ? 'border-rose-400 focus:ring-rose-500'
                        : 'border-[#E3E6EB] focus:border-[#2A4E96]'
                    }`}
                  />
                  {instAdmin.confirmPassword && instAdmin.password === instAdmin.confirmPassword && (
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                      <Check className="w-3.5 h-3.5" /> Passwords match
                    </span>
                  )}
                  {instAdmin.confirmPassword && instAdmin.password !== instAdmin.confirmPassword && (
                    <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Submission & Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-500">
                Already registered? <Link to="/login" className="text-[#0E2350] font-bold hover:underline">Log in</Link>
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 ${
                  isInstReadyToCreate
                    ? 'bg-[#0E2350] hover:bg-[#14336F] text-white cursor-pointer active:scale-98'
                    : 'bg-slate-200 text-slate-500 border border-slate-300 hover:bg-slate-300'
                }`}
                title={isInstReadyToCreate ? 'All requirements met' : 'Complete all fields and upload document to proceed'}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                    <span>Saving Account to Database...</span>
                  </>
                ) : isInstReadyToCreate ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Create Account & Submit for State Verification</span>
                    <ArrowRight className="w-4 h-4 text-[#F07421]" />
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-slate-500" />
                    <span>Add All Fields & Upload Mandatory Document First</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* ------------------------------------------------------------------ */
          /* CORPORATE / INDUSTRY REGISTRATION FORM                             */
          /* ------------------------------------------------------------------ */
          <form onSubmit={handleCompSubmit} className="space-y-6">
            {/* 1. Corporate & Industry Legal Information */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#0E2350] border-b border-gray-100 pb-2 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#F07421]" />
                  1. Corporate & Industry Legal Information
                </span>
                <span className="text-[11px] font-semibold text-rose-600">* All Fields Required</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Company Legal Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PixelWind Technologies Private Limited"
                    value={compForm.name}
                    onChange={(e) => setCompForm({ ...compForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] focus:border-[#F07421] rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Corporate CIN Number <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. U72200AP2026PTC560426"
                    value={compForm.cin}
                    onChange={(e) => setCompForm({ ...compForm, cin: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] focus:border-[#F07421] rounded-lg font-mono font-bold text-[#0E2350] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Industry Domain <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Information Technology & Cloud Services"
                    value={compForm.industry}
                    onChange={(e) => setCompForm({ ...compForm, industry: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] focus:border-[#F07421] rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    GST Registration No. <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 37AADCP5604F1Z5"
                    value={compForm.gst}
                    onChange={(e) => setCompForm({ ...compForm, gst: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] focus:border-[#F07421] rounded-lg font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    HQ Address <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Visakhapatnam, Andhra Pradesh"
                    value={compForm.headquarters}
                    onChange={(e) => setCompForm({ ...compForm, headquarters: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] focus:border-[#F07421] rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Official Company Phone <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 891 2548900"
                    value={compForm.official_phone}
                    onChange={(e) => setCompForm({ ...compForm, official_phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] focus:border-[#F07421] rounded-lg focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Mandatory Corporate Documents & MCA/GST Proof (PDF) Upload */}
            <div ref={compDocSectionRef} className="space-y-3 p-4 bg-amber-50/50 rounded-xl border-2 border-amber-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-black text-[#0E2350] uppercase tracking-wider flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-[#F07421]" />
                    Mandatory Corporate Documents & MCA/GST Proof (PDF) <span className="text-rose-600">*</span>
                  </h4>
                  <p className="text-[11px] text-gray-600">
                    State Super Admin inspects these documents before granting full platform access.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {compDocs.length === 0 ? (
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 border border-rose-300 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      0 Attached (Mandatory Document Required *)
                    </span>
                  ) : (
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {compDocs.length} Attached (Requirement Satisfied)
                    </span>
                  )}
                </div>
              </div>

              {/* Upload Dropzone */}
              <FileUploader
                label="Upload MCA Certificate / GST Registration / MSME Udyam (PDF)"
                folderKind="company_verification"
                helpText="Valid MCA Certificate, MSME Udyam, or GST Registration PDF (Max 10 MB)"
                maxSizeMB={10}
                onUploadComplete={handleAddCompDoc}
              />

              {/* Quick Sample Attacher for Seamless Testing */}
              {compDocs.length === 0 && (
                <div className="pt-1 flex items-center justify-between bg-white/70 p-2.5 rounded-lg border border-amber-100 text-xs">
                  <span className="text-[11px] text-gray-500">
                    Testing corporate registration or don't have MCA PDF ready?
                  </span>
                  <button
                    type="button"
                    onClick={handleAddSampleCompDoc}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#F07421] hover:bg-[#D96214] text-white text-[10px] font-bold transition shadow-xs"
                  >
                    <Sparkles className="w-3 h-3 text-white" />
                    Attach Sample Verified MCA / GST PDF
                  </button>
                </div>
              )}

              {/* Attached Documents List */}
              {compDocs.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Attached Corporate Verification Documents ({compDocs.length}):
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {compDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-amber-200 text-xs shadow-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-800 truncate text-xs">{doc.name}</p>
                            <p className="text-[10px] text-gray-500">
                              {doc.file_size || '2.4 MB'} • {doc.category?.replace(/_/g, ' ') || 'MCA Incorporation'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-bold flex items-center gap-1 transition-colors"
                            title="Preview PDF"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Preview</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setCompDocs(prev => prev.filter(d => d.id !== doc.id))}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Remove document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Company Admin / HR Account Setup */}
            <div className="space-y-4 pt-2">
              <h3 className="text-base font-bold text-[#0E2350] border-b border-gray-100 pb-2 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#F07421]" />
                  2. Company Admin / HR Account Setup
                </span>
                <span className="text-[11px] font-semibold text-rose-600">* All Fields Required</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    HR / Authorized Person Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter authorized representative name"
                    value={compAdmin.fullName}
                    onChange={(e) => setCompAdmin({ ...compAdmin, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] focus:border-[#F07421] rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Official Work Email (Login ID) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="hr@company.com"
                    value={compAdmin.email}
                    onChange={(e) => setCompAdmin({ ...compAdmin, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] focus:border-[#F07421] rounded-lg font-mono text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Contact Phone <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98490 56789"
                    value={compAdmin.phone}
                    onChange={(e) => setCompAdmin({ ...compAdmin, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] focus:border-[#F07421] rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Create Password * <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter password (min 6 characters)"
                    value={compAdmin.password}
                    onChange={(e) => setCompAdmin({ ...compAdmin, password: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] focus:border-[#F07421] rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Confirm Password * <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={compAdmin.confirmPassword}
                    onChange={(e) => setCompAdmin({ ...compAdmin, confirmPassword: e.target.value })}
                    className={`w-full px-3 py-2 bg-[#F6F7F9] border rounded-lg focus:outline-none ${
                      compAdmin.confirmPassword && compAdmin.password !== compAdmin.confirmPassword
                        ? 'border-rose-400 focus:ring-rose-500'
                        : 'border-[#E3E6EB] focus:border-[#F07421]'
                    }`}
                  />
                  {compAdmin.confirmPassword && compAdmin.password === compAdmin.confirmPassword && (
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                      <Check className="w-3.5 h-3.5" /> Passwords match
                    </span>
                  )}
                  {compAdmin.confirmPassword && compAdmin.password !== compAdmin.confirmPassword && (
                    <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Submission & Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-500">
                Already registered? <Link to="/login" className="text-[#0E2350] font-bold hover:underline">Log in</Link>
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 ${
                  isCompReadyToCreate
                    ? 'bg-[#F07421] hover:bg-[#D96214] text-white cursor-pointer active:scale-98'
                    : 'bg-slate-200 text-slate-500 border border-slate-300 hover:bg-slate-300'
                }`}
                title={isCompReadyToCreate ? 'All corporate requirements met' : 'Complete all fields and upload document to proceed'}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                    <span>Saving Corporate Account...</span>
                  </>
                ) : isCompReadyToCreate ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Create Corporate Account & Submit for Verification</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-slate-500" />
                    <span>Add All Fields & Upload Mandatory Corporate Document First</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* PDF / Document Viewer Modal */}
      {previewDoc && (
        <DocumentViewerModal
          document={previewDoc}
          entityName={activeTab === 'institution' ? instForm.name : compForm.name}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
};
