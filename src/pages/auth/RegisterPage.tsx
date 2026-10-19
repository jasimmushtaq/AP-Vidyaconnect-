// ============================================================================
// AP VIDYACONNECT — ONBOARDING & REGISTRATION PAGE
// Complete multi-actor registration with Admin Account creation
// ============================================================================

import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { InstitutionType, AttachedDocument } from '../../types/database';
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
  Loader2
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
  const [previewDoc, setPreviewDoc] = useState<AttachedDocument | null>(null);

  // Institution State
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

  // Attached Documents for Institution
  const [instDocs, setInstDocs] = useState<AttachedDocument[]>([]);

  // Institution Admin Account State
  const [instAdmin, setInstAdmin] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // Company State
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

  // Attached Documents for Company
  const [compDocs, setCompDocs] = useState<AttachedDocument[]>([]);

  // Company Admin Account State
  const [compAdmin, setCompAdmin] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // Add document handlers
  const handleAddInstDoc = (doc: { url: string; public_id: string; filename: string }) => {
    const newDoc: AttachedDocument = {
      id: `doc-inst-${Date.now()}`,
      name: doc.filename || 'College_Document.pdf',
      url: doc.url,
      file_type: 'application/pdf',
      file_size: '1.9 MB',
      category: 'accreditation_letter',
      uploaded_at: new Date().toISOString(),
      uploaded_by: instAdmin.fullName || 'Institution Principal'
    };
    setInstDocs(prev => [...prev, newDoc]);
  };

  const handleAddCompDoc = (doc: { url: string; public_id: string; filename: string }) => {
    const newDoc: AttachedDocument = {
      id: `doc-comp-${Date.now()}`,
      name: doc.filename || 'Corporate_Document.pdf',
      url: doc.url,
      file_type: 'application/pdf',
      file_size: '2.2 MB',
      category: 'mca_incorporation',
      uploaded_at: new Date().toISOString(),
      uploaded_by: compAdmin.fullName || 'Company HR'
    };
    setCompDocs(prev => [...prev, newDoc]);
  };

  const handleInstSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!instAdmin.password) {
      setFormError('Please enter a secure password.');
      return;
    }

    if (instAdmin.password !== instAdmin.confirmPassword) {
      setFormError('Passwords do not match. Please verify and re-enter your password.');
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

  const handleCompSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!compAdmin.password) {
      setFormError('Please enter a secure password.');
      return;
    }

    if (compAdmin.password !== compAdmin.confirmPassword) {
      setFormError('Passwords do not match. Please verify and re-enter your password.');
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
              Registration Completed Successfully
            </div>
            <p className="text-gray-700 leading-relaxed">
              Your account has been registered in the AP VidyaConnect network. You can sign in immediately using your registered official email and password to access your dedicated workspace and dashboard. State Super Admin (Dr. Varun Surya, IAS) will audit statutory credentials in the background.
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0E2350]">
          Institutional & Corporate Onboarding
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
          Register your college or company and configure your primary administrator login account in one unified step.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E3E6EB] max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('institution')}
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
          onClick={() => setActiveTab('company')}
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
      <div className="bg-white rounded-2xl border border-[#E3E6EB] p-6 sm:p-8 shadow-sm">
        {activeTab === 'institution' ? (
          <form onSubmit={handleInstSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#0E2350] border-b border-gray-100 pb-2 flex items-center gap-2">
                <School className="w-4 h-4 text-[#2A4E96]" />
                1. College & University Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Institution Legal Name</label>
                  <input
                    type="text"
                    required
                    value={instForm.name}
                    onChange={(e) => setInstForm({ ...instForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">College AISHE / Portal Code</label>
                  <input
                    type="text"
                    required
                    value={instForm.code}
                    onChange={(e) => setInstForm({ ...instForm, code: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-mono font-bold text-[#0E2350]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Affiliated University / Board</label>
                  <input
                    type="text"
                    required
                    value={instForm.affiliated_university}
                    onChange={(e) => setInstForm({ ...instForm, affiliated_university: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Accreditation (NAAC / NBA)</label>
                  <input
                    type="text"
                    value={instForm.accreditation}
                    onChange={(e) => setInstForm({ ...instForm, accreditation: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Principal / Head Name</label>
                  <input
                    type="text"
                    required
                    value={instForm.principal_name}
                    onChange={(e) => setInstForm({ ...instForm, principal_name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Official College Telephone</label>
                  <input
                    type="text"
                    required
                    value={instForm.official_phone}
                    onChange={(e) => setInstForm({ ...instForm, official_phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Mandatory & Additional Compliance Documents Upload */}
            <div className="space-y-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-[#0E2350] uppercase tracking-wider flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-[#F07421]" />
                    Mandatory Accreditation & Compliance Documents (PDF)
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    State Super Admin will inspect and audit these uploaded credentials before verification.
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0E2350]">
                  {instDocs.length} Attached
                </span>
              </div>

              {/* Upload Dropzone */}
              <FileUploader
                label="Upload College Affiliation / NAAC / Principal Authorization (PDF)"
                folderKind="institution_verification"
                helpText="Accepted format: PDF, PNG, JPG (Max 10 MB)"
                onUploadComplete={handleAddInstDoc}
              />

              {/* Attached Documents List */}
              {instDocs.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Attached Verification Documents:</span>
                  <div className="space-y-1.5">
                    {instDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-blue-100 text-xs shadow-xs"
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

            {/* 2. Admin Account Credentials */}
            <div className="space-y-4 pt-2">
              <h3 className="text-base font-bold text-[#0E2350] border-b border-gray-100 pb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#F07421]" />
                2. Principal / Administrator Login Account Setup
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Administrator Full Name</label>
                  <input
                    type="text"
                    required
                    value={instAdmin.fullName}
                    onChange={(e) => setInstAdmin({ ...instAdmin, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Admin Official Email (Login ID)</label>
                  <input
                    type="email"
                    required
                    value={instAdmin.email}
                    onChange={(e) => setInstAdmin({ ...instAdmin, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Admin Mobile / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={instAdmin.phone}
                    onChange={(e) => setInstAdmin({ ...instAdmin, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Create Secure Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter password"
                    value={instAdmin.password}
                    onChange={(e) => setInstAdmin({ ...instAdmin, password: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={instAdmin.confirmPassword}
                    onChange={(e) => setInstAdmin({ ...instAdmin, confirmPassword: e.target.value })}
                    className={`w-full px-3 py-2 bg-[#F6F7F9] border rounded-lg ${
                      instAdmin.confirmPassword && instAdmin.password !== instAdmin.confirmPassword
                        ? 'border-rose-400 focus:ring-rose-500'
                        : 'border-[#E3E6EB]'
                    }`}
                  />
                </div>
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Already registered? <Link to="/login" className="text-[#0E2350] font-bold hover:underline">Log in</Link>
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#0E2350] hover:bg-[#14336F] disabled:opacity-60 text-white rounded-lg text-xs sm:text-sm font-bold shadow transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                    <span>Saving Account to Database...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account & Submit for State Verification</span>
                    <ArrowRight className="w-4 h-4 text-[#F07421]" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCompSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#0E2350] border-b border-gray-100 pb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#F07421]" />
                1. Corporate & Industry Legal Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Company Legal Name</label>
                  <input
                    type="text"
                    required
                    value={compForm.name}
                    onChange={(e) => setCompForm({ ...compForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Corporate CIN Number</label>
                  <input
                    type="text"
                    required
                    value={compForm.cin}
                    onChange={(e) => setCompForm({ ...compForm, cin: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-mono font-bold text-[#0E2350]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Industry Domain</label>
                  <input
                    type="text"
                    required
                    value={compForm.industry}
                    onChange={(e) => setCompForm({ ...compForm, industry: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">GST Registration No.</label>
                  <input
                    type="text"
                    required
                    value={compForm.gst}
                    onChange={(e) => setCompForm({ ...compForm, gst: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">HQ Address</label>
                  <input
                    type="text"
                    required
                    value={compForm.headquarters}
                    onChange={(e) => setCompForm({ ...compForm, headquarters: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Official Company Phone</label>
                  <input
                    type="text"
                    required
                    value={compForm.official_phone}
                    onChange={(e) => setCompForm({ ...compForm, official_phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Mandatory & Additional Corporate Documents Upload */}
            <div className="space-y-3 p-4 bg-amber-50/50 rounded-xl border border-amber-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-[#0E2350] uppercase tracking-wider flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-[#F07421]" />
                    Mandatory Corporate Documents & MCA/GST Proof (PDF)
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    State Super Admin inspects these documents before granting full platform access.
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-[#F07421]">
                  {compDocs.length} Attached
                </span>
              </div>

              {/* Upload Dropzone */}
              <FileUploader
                label="Upload MCA Certificate / GST Registration / MSME Udyam (PDF)"
                folderKind="company_verification"
                helpText="Valid MCA Certificate, MSME Udyam, or GST Registration PDF"
                onUploadComplete={handleAddCompDoc}
              />

              {/* Attached Documents List */}
              {compDocs.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Attached Verification Documents:</span>
                  <div className="space-y-1.5">
                    {compDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-amber-100 text-xs shadow-xs"
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

            {/* 2. Company Admin Account */}
            <div className="space-y-4 pt-2">
              <h3 className="text-base font-bold text-[#0E2350] border-b border-gray-100 pb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#F07421]" />
                2. Company Admin / HR Account Setup
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">HR / Authorized Person Name</label>
                  <input
                    type="text"
                    required
                    value={compAdmin.fullName}
                    onChange={(e) => setCompAdmin({ ...compAdmin, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Official Work Email (Login ID)</label>
                  <input
                    type="email"
                    required
                    value={compAdmin.email}
                    onChange={(e) => setCompAdmin({ ...compAdmin, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={compAdmin.phone}
                    onChange={(e) => setCompAdmin({ ...compAdmin, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Create Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter password"
                    value={compAdmin.password}
                    onChange={(e) => setCompAdmin({ ...compAdmin, password: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={compAdmin.confirmPassword}
                    onChange={(e) => setCompAdmin({ ...compAdmin, confirmPassword: e.target.value })}
                    className={`w-full px-3 py-2 bg-[#F6F7F9] border rounded-lg ${
                      compAdmin.confirmPassword && compAdmin.password !== compAdmin.confirmPassword
                        ? 'border-rose-400 focus:ring-rose-500'
                        : 'border-[#E3E6EB]'
                    }`}
                  />
                </div>
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Already registered? <Link to="/login" className="text-[#0E2350] font-bold hover:underline">Log in</Link>
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#F07421] hover:bg-[#D96214] disabled:opacity-60 text-white rounded-lg text-xs sm:text-sm font-bold shadow transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                    <span>Saving Account to Database...</span>
                  </>
                ) : (
                  <>
                    <span>Create Corporate Account & Submit</span>
                    <ArrowRight className="w-4 h-4 text-white" />
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

