// ============================================================================
// AP VIDYACONNECT — ONBOARDING & REGISTRATION PAGE
// Multi-actor registration with strict mandatory validation, input sanitization & document checks
// ============================================================================

import React, { useState, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { InstitutionType, AttachedDocument } from '../../types/database';
import { db } from '../../services/dbStore';
import { FileUploader } from '../../components/common/FileUploader';
import { DocumentViewerModal } from '../../components/common/DocumentViewerModal';
import { PhoneInputWithCountryCode } from '../../components/common/PhoneInputWithCountryCode';
import {
  validateEmail,
  validatePhone,
  isValidEmail,
  isValidPhone,
  formatWithCountryCode,
  sanitizePhoneDigits
} from '../../utils/validation';
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
  EyeOff,
  FileCheck,
  ShieldAlert,
  Loader2,
  Check,
  UploadCloud,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

// ============================================================================
// Robust Validation & Sanitization Helpers
// ============================================================================

export { isValidEmail, isValidPhone, sanitizePhoneDigits as sanitizePhone };

export const isValidName = (val: string): boolean => {
  if (!val || val.trim().length < 2) return false;
  return /^[a-zA-Z\s.,'-]{2,}$/.test(val.trim()) && !/^\d+$/.test(val.trim());
};

export const sanitizeCin = (val: string): string => {
  return val.toUpperCase().replace(/[^A-Z0-9]/g, '');
};

export const isValidCin = (val: string): boolean => {
  if (!val) return false;
  const cleaned = sanitizeCin(val);
  return cleaned.length >= 8 && cleaned.length <= 25;
};

export const sanitizeGst = (val: string): string => {
  return val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
};

export const isValidGst = (val: string): boolean => {
  if (!val) return false;
  const cleaned = sanitizeGst(val);
  return cleaned.length === 15;
};

export const sanitizeCode = (val: string): string => {
  return val.toUpperCase().replace(/[^A-Z0-9\-]/g, '');
};

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

  // Field touch & validation tracking
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [showAllErrors, setShowAllErrors] = useState(false);

  // Password visibility states
  const [showInstPass, setShowInstPass] = useState(false);
  const [showInstConfirm, setShowInstConfirm] = useState(false);
  const [showCompPass, setShowCompPass] = useState(false);
  const [showCompConfirm, setShowCompConfirm] = useState(false);

  // References for smooth scrolling
  const errorBannerRef = useRef<HTMLDivElement>(null);
  const instDocSectionRef = useRef<HTMLDivElement>(null);
  const compDocSectionRef = useRef<HTMLDivElement>(null);

  const markTouched = (field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

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
  // Field-Level Error Resolution
  // ---------------------------------------------------------------------------
  const getFieldError = (fieldName: string): string | null => {
    const isVisible = showAllErrors || touchedFields[fieldName];
    if (!isVisible) return null;

    switch (fieldName) {
      // Institution Fields
      case 'inst_name':
        if (!instForm.name.trim()) return 'Institution Legal Name is required';
        if (instForm.name.trim().length < 3) return 'Institution name must be at least 3 characters';
        return null;
      case 'inst_code':
        if (!instForm.code.trim()) return 'AISHE / Portal code is required';
        if (instForm.code.trim().length < 3) return 'Code must be at least 3 characters';
        return null;
      case 'inst_university':
        if (!instForm.affiliated_university.trim()) return 'Affiliated University / Board is required';
        return null;
      case 'inst_accreditation':
        if (!instForm.accreditation.trim()) return 'Accreditation status is required (e.g. NAAC / NBA)';
        return null;
      case 'inst_principal':
        if (!instForm.principal_name.trim()) return 'Principal / Head Name is required';
        if (!isValidName(instForm.principal_name)) return 'Principal name must contain letters only (min 2 characters)';
        return null;
      case 'inst_official_phone': {
        const phoneCheck = validatePhone(instForm.official_phone);
        if (!phoneCheck.isValid) return phoneCheck.error;
        return null;
      }
      case 'inst_admin_name':
        if (!instAdmin.fullName.trim()) return 'Administrator full name is required';
        if (!isValidName(instAdmin.fullName)) return 'Name must contain letters only (min 2 characters)';
        return null;
      case 'inst_admin_email': {
        const emailCheck = validateEmail(instAdmin.email);
        if (!emailCheck.isValid) return emailCheck.error;
        return null;
      }
      case 'inst_admin_phone': {
        const phoneCheck = validatePhone(instAdmin.phone);
        if (!phoneCheck.isValid) return phoneCheck.error;
        return null;
      }
      case 'inst_admin_pass':
        if (!instAdmin.password) return 'Password is required to secure your admin account';
        if (instAdmin.password.length < 6) return 'Password must be at least 6 characters';
        return null;
      case 'inst_admin_confirm':
        if (!instAdmin.confirmPassword) return 'Please confirm your password';
        if (instAdmin.password !== instAdmin.confirmPassword) return 'Passwords do not match';
        return null;

      // Corporate Fields
      case 'comp_name':
        if (!compForm.name.trim()) return 'Company Legal Name is required';
        if (compForm.name.trim().length < 3) return 'Company name must be at least 3 characters';
        return null;
      case 'comp_cin':
        if (!compForm.cin.trim()) return 'Corporate CIN number is required';
        if (!isValidCin(compForm.cin)) return 'CIN must be at least 8 alphanumeric characters (e.g. U72200AP2026PTC560426)';
        return null;
      case 'comp_industry':
        if (!compForm.industry.trim()) return 'Industry Domain is required';
        return null;
      case 'comp_gst':
        if (!compForm.gst.trim()) return 'GST Registration No. is required';
        if (!isValidGst(compForm.gst)) return 'GST number must be 15 alphanumeric characters (e.g. 37AADCP5604F1Z5)';
        return null;
      case 'comp_hq':
        if (!compForm.headquarters.trim()) return 'HQ Address is required';
        return null;
      case 'comp_official_phone': {
        const phoneCheck = validatePhone(compForm.official_phone);
        if (!phoneCheck.isValid) return phoneCheck.error;
        return null;
      }
      case 'comp_admin_name':
        if (!compAdmin.fullName.trim()) return 'HR / Authorized Person Name is required';
        if (!isValidName(compAdmin.fullName)) return 'Name must contain letters only (min 2 characters)';
        return null;
      case 'comp_admin_email': {
        const emailCheck = validateEmail(compAdmin.email);
        if (!emailCheck.isValid) return emailCheck.error;
        return null;
      }
      case 'comp_admin_phone': {
        const phoneCheck = validatePhone(compAdmin.phone);
        if (!phoneCheck.isValid) return phoneCheck.error;
        return null;
      }
      case 'comp_admin_pass':
        if (!compAdmin.password) return 'Password is required to secure your company account';
        if (compAdmin.password.length < 6) return 'Password must be at least 6 characters';
        return null;
      case 'comp_admin_confirm':
        if (!compAdmin.confirmPassword) return 'Please confirm your password';
        if (compAdmin.password !== compAdmin.confirmPassword) return 'Passwords do not match';
        return null;

      default:
        return null;
    }
  };

  // ---------------------------------------------------------------------------
  // Validation Logic: "THEN ONLY WE CAN CREATE ACCOUNT"
  // ---------------------------------------------------------------------------
  const getInstMissingFields = (): string[] => {
    const missing: string[] = [];
    if (!instForm.name.trim()) missing.push('1. Institution Legal Name');
    else if (instForm.name.trim().length < 3) missing.push('1. Institution Legal Name (must be at least 3 characters)');
    if (!instForm.code.trim()) missing.push('1. College AISHE / Portal Code');
    if (!instForm.affiliated_university.trim()) missing.push('1. Affiliated University / Board');
    if (!instForm.accreditation.trim()) missing.push('1. Accreditation (NAAC / NBA)');
    if (!instForm.principal_name.trim()) missing.push('1. Principal / Head Name');
    else if (!isValidName(instForm.principal_name)) missing.push('1. Principal / Head Name (letters only, min 2 characters)');
    
    const instPhoneRes = validatePhone(instForm.official_phone);
    if (!instPhoneRes.isValid) missing.push(`1. Official College Telephone (${instPhoneRes.error})`);
    
    if (instDocs.length === 0) missing.push('1. Mandatory Accreditation & Compliance Documents (At least 1 PDF/Image required)');

    if (!instAdmin.fullName.trim()) missing.push('2. Administrator Full Name');
    else if (!isValidName(instAdmin.fullName)) missing.push('2. Administrator Full Name (letters only, min 2 characters)');
    
    const instAdminEmailRes = validateEmail(instAdmin.email);
    if (!instAdminEmailRes.isValid) missing.push(`2. Admin Official Email (${instAdminEmailRes.error})`);
    
    const instAdminPhoneRes = validatePhone(instAdmin.phone);
    if (!instAdminPhoneRes.isValid) missing.push(`2. Admin Mobile / WhatsApp (${instAdminPhoneRes.error})`);
    
    if (!instAdmin.password) missing.push('2. Create Secure Password');
    else if (instAdmin.password.length < 6) missing.push('2. Password must be at least 6 characters');
    if (!instAdmin.confirmPassword) missing.push('2. Confirm Password');
    else if (instAdmin.password !== instAdmin.confirmPassword) missing.push('2. Confirm Password must match password');
    return missing;
  };

  const getCompMissingFields = (): string[] => {
    const missing: string[] = [];
    if (!compForm.name.trim()) missing.push('1. Company Legal Name');
    else if (compForm.name.trim().length < 3) missing.push('1. Company Legal Name (min 3 characters)');
    if (!compForm.cin.trim()) missing.push('1. Corporate CIN Number');
    else if (!isValidCin(compForm.cin)) missing.push('1. Corporate CIN Number (valid alphanumeric CIN, min 8 chars)');
    if (!compForm.industry.trim()) missing.push('1. Industry Domain');
    if (!compForm.gst.trim()) missing.push('1. GST Registration No.');
    else if (!isValidGst(compForm.gst)) missing.push('1. GST Registration No. (must be 15 alphanumeric characters)');
    if (!compForm.headquarters.trim()) missing.push('1. HQ Address');
    
    const compPhoneRes = validatePhone(compForm.official_phone);
    if (!compPhoneRes.isValid) missing.push(`1. Official Company Phone (${compPhoneRes.error})`);
    
    if (compDocs.length === 0) missing.push('1. Mandatory Corporate Documents & MCA/GST Proof (At least 1 PDF/Image required)');

    if (!compAdmin.fullName.trim()) missing.push('2. HR / Authorized Person Name');
    else if (!isValidName(compAdmin.fullName)) missing.push('2. HR / Authorized Person Name (letters only, min 2 characters)');
    
    const compAdminEmailRes = validateEmail(compAdmin.email);
    if (!compAdminEmailRes.isValid) missing.push(`2. Official Work Email (${compAdminEmailRes.error})`);
    
    const compAdminPhoneRes = validatePhone(compAdmin.phone);
    if (!compAdminPhoneRes.isValid) missing.push(`2. Contact Phone (${compAdminPhoneRes.error})`);
    
    if (!compAdmin.password) missing.push('2. Create Password');
    else if (compAdmin.password.length < 6) missing.push('2. Password must be at least 6 characters');
    if (!compAdmin.confirmPassword) missing.push('2. Confirm Password');
    else if (compAdmin.password !== compAdmin.confirmPassword) missing.push('2. Confirm Password must match password');
    return missing;
  };

  // Live Booleans for visual readiness indicators
  const isInstLegalComplete = useMemo(() => {
    return Boolean(
      instForm.name.trim().length >= 3 &&
      instForm.code.trim().length >= 3 &&
      instForm.affiliated_university.trim().length >= 2 &&
      instForm.accreditation.trim().length >= 2 &&
      isValidName(instForm.principal_name) &&
      isValidPhone(instForm.official_phone)
    );
  }, [instForm]);

  const isInstDocComplete = instDocs.length > 0;

  const isInstAdminComplete = useMemo(() => {
    return Boolean(
      isValidName(instAdmin.fullName) &&
      isValidEmail(instAdmin.email) &&
      isValidPhone(instAdmin.phone) &&
      instAdmin.password.length >= 6 &&
      instAdmin.password === instAdmin.confirmPassword
    );
  }, [instAdmin]);

  const isInstReadyToCreate = isInstLegalComplete && isInstDocComplete && isInstAdminComplete;

  const isCompLegalComplete = useMemo(() => {
    return Boolean(
      compForm.name.trim().length >= 3 &&
      isValidCin(compForm.cin) &&
      compForm.industry.trim().length >= 2 &&
      isValidGst(compForm.gst) &&
      compForm.headquarters.trim().length >= 3 &&
      isValidPhone(compForm.official_phone)
    );
  }, [compForm]);

  const isCompDocComplete = compDocs.length > 0;

  const isCompAdminComplete = useMemo(() => {
    return Boolean(
      isValidName(compAdmin.fullName) &&
      isValidEmail(compAdmin.email) &&
      isValidPhone(compAdmin.phone) &&
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
    setShowAllErrors(true);
    setFormError(null);
    setMissingFieldsList([]);

    // Strict validation: ALL fields + Mandatory Document must be added first
    const missing = getInstMissingFields();
    if (missing.length > 0) {
      setMissingFieldsList(missing);
      setFormError('Account creation locked: Please fix the highlighted errors and upload at least one mandatory compliance document.');
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
      official_phone: formatWithCountryCode(instForm.official_phone),
      document_url: instDocs[0]?.url,
      document_name: instDocs[0]?.name,
      documents: instDocs
    };

    const adminPayload = {
      ...instAdmin,
      phone: formatWithCountryCode(instAdmin.phone)
    };

    setIsSubmitting(true);
    try {
      const res = await registerInstitutionAdmin(payload, adminPayload);
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
    setShowAllErrors(true);
    setFormError(null);
    setMissingFieldsList([]);

    // Strict validation: ALL fields + Mandatory Document must be added first
    const missing = getCompMissingFields();
    if (missing.length > 0) {
      setMissingFieldsList(missing);
      setFormError('Account creation locked: Please fix the highlighted errors and upload at least one corporate document (MCA/GST Proof).');
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
      official_phone: formatWithCountryCode(compForm.official_phone),
      document_url: compDocs[0]?.url,
      document_name: compDocs[0]?.name,
      documents: compDocs
    };

    const adminPayload = {
      ...compAdmin,
      phone: formatWithCountryCode(compAdmin.phone)
    };

    setIsSubmitting(true);
    try {
      const res = await registerCompanyAdmin(payload, adminPayload);
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF3EA] text-[#F07421] text-xs font-extrabold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Statutory Accreditation & Registration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0E2350]">
          Register for AP VidyaConnect
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto">
          Complete mandatory statutory accreditation information, attach verification certificates, and configure your administrative account to access the Andhra Pradesh State Internship ecosystem.
        </p>
      </div>

      {/* Actor Tab Switcher */}
      <div className="flex border-b border-gray-200 text-xs font-bold justify-center">
        <button
          type="button"
          onClick={() => {
            setActiveTab('institution');
            setFormError(null);
            setMissingFieldsList([]);
            setShowAllErrors(false);
          }}
          className={`pb-3 px-6 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'institution'
              ? 'border-[#0E2350] text-[#0E2350]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <School className="w-4 h-4 text-[#2A4E96]" />
          Higher Education Institution (College / Univ)
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('company');
            setFormError(null);
            setMissingFieldsList([]);
            setShowAllErrors(false);
          }}
          className={`pb-3 px-6 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
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
          <form onSubmit={handleInstSubmit} className="space-y-6" noValidate>
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
                {/* Institution Legal Name */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Institution Legal Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Andhra Loyola Institute of Engineering & Technology"
                    value={instForm.name}
                    onBlur={() => markTouched('inst_name')}
                    onChange={(e) => setInstForm({ ...instForm, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors ${
                      getFieldError('inst_name')
                        ? 'bg-rose-50/30 border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400'
                        : 'bg-[#F6F7F9] border-[#E3E6EB] focus:border-[#2A4E96]'
                    }`}
                  />
                  {getFieldError('inst_name') && (
                    <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getFieldError('inst_name')}</span>
                    </p>
                  )}
                </div>

                {/* College AISHE / Portal Code */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    College AISHE / Portal Code <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AP-INST-7044"
                    value={instForm.code}
                    onBlur={() => markTouched('inst_code')}
                    onChange={(e) => setInstForm({ ...instForm, code: sanitizeCode(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg font-mono font-bold text-[#0E2350] focus:outline-none transition-colors ${
                      getFieldError('inst_code')
                        ? 'bg-rose-50/30 border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400'
                        : 'bg-[#F6F7F9] border-[#E3E6EB] focus:border-[#2A4E96]'
                    }`}
                  />
                  {getFieldError('inst_code') && (
                    <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getFieldError('inst_code')}</span>
                    </p>
                  )}
                </div>

                {/* Affiliated University / Board */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Affiliated University / Board <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JNTUK Kakinada / Andhra University"
                    value={instForm.affiliated_university}
                    onBlur={() => markTouched('inst_university')}
                    onChange={(e) => setInstForm({ ...instForm, affiliated_university: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors ${
                      getFieldError('inst_university')
                        ? 'bg-rose-50/30 border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400'
                        : 'bg-[#F6F7F9] border-[#E3E6EB] focus:border-[#2A4E96]'
                    }`}
                  />
                  {getFieldError('inst_university') && (
                    <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getFieldError('inst_university')}</span>
                    </p>
                  )}
                </div>

                {/* Accreditation */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Accreditation (NAAC / NBA) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NAAC Accredited A+ / NBA"
                    value={instForm.accreditation}
                    onBlur={() => markTouched('inst_accreditation')}
                    onChange={(e) => setInstForm({ ...instForm, accreditation: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors ${
                      getFieldError('inst_accreditation')
                        ? 'bg-rose-50/30 border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400'
                        : 'bg-[#F6F7F9] border-[#E3E6EB] focus:border-[#2A4E96]'
                    }`}
                  />
                  {getFieldError('inst_accreditation') && (
                    <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getFieldError('inst_accreditation')}</span>
                    </p>
                  )}
                </div>

                {/* Principal / Head Name */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Principal / Head Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. O. Mahesh, M.Tech, Ph.D"
                    value={instForm.principal_name}
                    onBlur={() => markTouched('inst_principal')}
                    onChange={(e) => setInstForm({ ...instForm, principal_name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors ${
                      getFieldError('inst_principal')
                        ? 'bg-rose-50/30 border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400'
                        : 'bg-[#F6F7F9] border-[#E3E6EB] focus:border-[#2A4E96]'
                    }`}
                  />
                  {getFieldError('inst_principal') && (
                    <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getFieldError('inst_principal')}</span>
                    </p>
                  )}
                </div>

                {/* Official College Telephone */}
                <div>
                  <PhoneInputWithCountryCode
                    label="Official College Telephone"
                    required
                    value={instForm.official_phone}
                    onBlur={() => markTouched('inst_official_phone')}
                    onChange={(digits) => {
                      setInstForm(prev => ({ ...prev, official_phone: digits }));
                    }}
                    error={getFieldError('inst_official_phone')}
                    placeholder="8662476161"
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
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0E2350] hover:bg-[#14336F] text-white text-[10px] font-bold transition shadow-xs cursor-pointer"
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
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Preview PDF"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Preview</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setInstDocs(prev => prev.filter(d => d.id !== doc.id))}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
                {/* Administrator Full Name */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Administrator Full Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={instAdmin.fullName}
                    onBlur={() => markTouched('inst_admin_name')}
                    onChange={(e) => setInstAdmin({ ...instAdmin, fullName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors ${
                      getFieldError('inst_admin_name')
                        ? 'bg-rose-50/30 border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400'
                        : 'bg-[#F6F7F9] border-[#E3E6EB] focus:border-[#2A4E96]'
                    }`}
                  />
                  {getFieldError('inst_admin_name') && (
                    <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getFieldError('inst_admin_name')}</span>
                    </p>
                  )}
                </div>

                {/* Admin Official Email */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Admin Official Email (Login ID) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="principal@college.edu.in"
                    value={instAdmin.email}
                    onBlur={() => markTouched('inst_admin_email')}
                    onChange={(e) => setInstAdmin({ ...instAdmin, email: e.target.value.trim() })}
                    className={`w-full px-3 py-2 border rounded-lg font-mono text-xs focus:outline-none transition-colors ${
                      getFieldError('inst_admin_email')
                        ? 'bg-rose-50/30 border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400'
                        : 'bg-[#F6F7F9] border-[#E3E6EB] focus:border-[#2A4E96]'
                    }`}
                  />
                  {getFieldError('inst_admin_email') && (
                    <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getFieldError('inst_admin_email')}</span>
                    </p>
                  )}
                </div>

                {/* Admin Mobile / WhatsApp */}
                <div>
                  <PhoneInputWithCountryCode
                    label="Admin Mobile / WhatsApp"
                    required
                    value={instAdmin.phone}
                    onBlur={() => markTouched('inst_admin_phone')}
                    onChange={(digits) => {
                      setInstAdmin(prev => ({ ...prev, phone: digits }));
                    }}
                    error={getFieldError('inst_admin_phone')}
                    placeholder="9848012345"
                  />
                </div>

                {/* Create Secure Password */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Create Secure Password <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showInstPass ? 'text' : 'password'}
                      required
                      placeholder="Enter password (min 6 characters)"
                      value={instAdmin.password}
                      onBlur={() => markTouched('inst_admin_pass')}
                      onChange={(e) => setInstAdmin({ ...instAdmin, password: e.target.value })}
                      className={`w-full px-3 pr-10 py-2 border rounded-lg focus:outline-none transition-colors ${
                        getFieldError('inst_admin_pass')
                          ? 'bg-rose-50/30 border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400'
                          : 'bg-[#F6F7F9] border-[#E3E6EB] focus:border-[#2A4E96]'
                      }`}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowInstPass(prev => !prev)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                      title={showInstPass ? 'Hide password' : 'Show password'}
                    >
                      {showInstPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {getFieldError('inst_admin_pass') && (
                    <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getFieldError('inst_admin_pass')}</span>
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Confirm Password <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showInstConfirm ? 'text' : 'password'}
                      required
                      placeholder="Re-enter password"
                      value={instAdmin.confirmPassword}
                      onBlur={() => markTouched('inst_admin_confirm')}
                      onChange={(e) => setInstAdmin({ ...instAdmin, confirmPassword: e.target.value })}
                      className={`w-full px-3 pr-10 py-2 border rounded-lg focus:outline-none transition-colors ${
                        getFieldError('inst_admin_confirm')
                          ? 'bg-rose-50/30 border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400'
                          : instAdmin.confirmPassword && instAdmin.password === instAdmin.confirmPassword
                          ? 'border-emerald-500 bg-emerald-50/10'
                          : 'bg-[#F6F7F9] border-[#E3E6EB] focus:border-[#2A4E96]'
                      }`}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowInstConfirm(prev => !prev)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                      title={showInstConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showInstConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {getFieldError('inst_admin_confirm') ? (
                    <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getFieldError('inst_admin_confirm')}</span>
                    </p>
                  ) : instAdmin.confirmPassword && instAdmin.password === instAdmin.confirmPassword ? (
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                      <Check className="w-3.5 h-3.5" /> Passwords match
                    </span>
                  ) : null}
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
                className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                  isInstReadyToCreate
                    ? 'bg-[#0E2350] hover:bg-[#14336F] text-white active:scale-98'
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
          <form onSubmit={handleCompSubmit} className="space-y-6" noValidate>
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
                {/* Company Legal Name */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Company Legal Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PixelWind Technologies Private Limited"
                    value={compForm.name}
                    onBlur={() => markTouched('comp_name')}
                    onChange={(e) => setCompForm({ ...compForm, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors ${
                      getFieldError('comp_name')
                        ? 'bg-rose-50/30 border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400'
                        : 'bg-[#F6F7F9] border-[#E3E6EB] focus:border-[#F07421]'
                    }`}
                  />
                  {getFieldError('comp_name') && (
                    <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getFieldError('comp_name')}</span>
                    </p>
                  )}
                </div>

                {/* Corporate CIN Number */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Corporate CIN Number <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. U72200AP2026PTC560426"
                    value={compForm.cin}
                    onBlur={() => markTouched('comp_cin')}
                    onChange={(e) => setCompForm({ ...compForm, cin: sanitizeCin(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg font-mono font-bold text-[#0E2350] focus:outline-none transition-colors ${
                      getFieldError('comp_cin')
                        ? 'bg-rose-50/30 border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400'
                        : 'bg-[#F6F7F9] border-[#E3E6EB] focus:border-[#F07421]'
                    }`}
                  />
                  {getFieldError('comp_cin') && (
                    <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getFieldError('comp_cin')}</span>
                    </p>
                  )}
                </div>

                {/* Industry Domain */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Industry Domain <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Information Technology & Cloud Services"
                    value={compForm.industry}
                    onBlur={() => markTouched('comp_industry')}
                    onChange={(e) => setCompForm({ ...compForm, industry: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors ${
                      getFieldError('comp_industry')
                        ? 'bg-rose-50/30 border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400'
                        : 'bg-[#F6F7F9] border-[#E3E6EB] focus:border-[#F07421]'
                    }`}
                  />
                  {getFieldError('comp_industry') && (
                    <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getFieldError('comp_industry')}</span>
                    </p>
                  )}
                </div>

                {/* GST Registration No. */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    GST Registration No. <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 37AADCP5604F1Z5"
                    value={compForm.gst}
                    onBlur={() => markTouched('comp_gst')}
                    onChange={(e) => setCompForm({ ...compForm, gst: sanitizeGst(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg font-mono focus:outline-none transition-colors ${
                      getFieldError('comp_gst')
                        ? 'bg-rose-50/30 border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400'
                        : 'bg-[#F6F7F9] border-[#E3E6EB] focus:border-[#F07421]'
                    }`}
                  />
                  {getFieldError('comp_gst') ? (
                    <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getFieldError('comp_gst')}</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-gray-400 mt-1">15 alphanumeric characters (e.g. 37AADCP5604F1Z5)</p>
                  )}
                </div>

                {/* HQ Address */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    HQ Address <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Visakhapatnam, Andhra Pradesh"
                    value={compForm.headquarters}
                    onBlur={() => markTouched('comp_hq')}
                    onChange={(e) => setCompForm({ ...compForm, headquarters: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors ${
                      getFieldError('comp_hq')
                        ? 'bg-rose-50/30 border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400'
                        : 'bg-[#F6F7F9] border-[#E3E6EB] focus:border-[#F07421]'
                    }`}
                  />
                  {getFieldError('comp_hq') && (
                    <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getFieldError('comp_hq')}</span>
                    </p>
                  )}
                </div>

                {/* Official Company Phone */}
                <div>
                  <PhoneInputWithCountryCode
                    label="Official Company Phone"
                    required
                    value={compForm.official_phone}
                    onBlur={() => markTouched('comp_official_phone')}
                    onChange={(digits) => {
                      setCompForm(prev => ({ ...prev, official_phone: digits }));
                    }}
                    error={getFieldError('comp_official_phone')}
                    placeholder="8912548900"
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
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#F07421] hover:bg-[#D96214] text-white text-[10px] font-bold transition shadow-xs cursor-pointer"
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
                            className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Preview PDF"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Preview</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setCompDocs(prev => prev.filter(d => d.id !== doc.id))}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
                {/* HR / Authorized Person Name */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    HR / Authorized Person Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter authorized representative name"
                    value={compAdmin.fullName}
                    onBlur={() => markTouched('comp_admin_name')}
                    onChange={(e) => setCompAdmin({ ...compAdmin, fullName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors ${
                      getFieldError('comp_admin_name')
                        ? 'bg-rose-50/30 border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400'
                        : 'bg-[#F6F7F9] border-[#E3E6EB] focus:border-[#F07421]'
                    }`}
                  />
                  {getFieldError('comp_admin_name') && (
                    <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getFieldError('comp_admin_name')}</span>
                    </p>
                  )}
                </div>

                {/* Official Work Email */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Official Work Email (Login ID) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="hr@company.com"
                    value={compAdmin.email}
                    onBlur={() => markTouched('comp_admin_email')}
                    onChange={(e) => setCompAdmin({ ...compAdmin, email: e.target.value.trim() })}
                    className={`w-full px-3 py-2 border rounded-lg font-mono text-xs focus:outline-none transition-colors ${
                      getFieldError('comp_admin_email')
                        ? 'bg-rose-50/30 border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400'
                        : 'bg-[#F6F7F9] border-[#E3E6EB] focus:border-[#F07421]'
                    }`}
                  />
                  {getFieldError('comp_admin_email') && (
                    <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getFieldError('comp_admin_email')}</span>
                    </p>
                  )}
                </div>

                {/* Contact Phone */}
                <div>
                  <PhoneInputWithCountryCode
                    label="Contact Phone"
                    required
                    value={compAdmin.phone}
                    onBlur={() => markTouched('comp_admin_phone')}
                    onChange={(digits) => {
                      setCompAdmin(prev => ({ ...prev, phone: digits }));
                    }}
                    error={getFieldError('comp_admin_phone')}
                    placeholder="9849056789"
                  />
                </div>

                {/* Create Password */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Create Password <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCompPass ? 'text' : 'password'}
                      required
                      placeholder="Enter password (min 6 characters)"
                      value={compAdmin.password}
                      onBlur={() => markTouched('comp_admin_pass')}
                      onChange={(e) => setCompAdmin({ ...compAdmin, password: e.target.value })}
                      className={`w-full px-3 pr-10 py-2 border rounded-lg focus:outline-none transition-colors ${
                        getFieldError('comp_admin_pass')
                          ? 'bg-rose-50/30 border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400'
                          : 'bg-[#F6F7F9] border-[#E3E6EB] focus:border-[#F07421]'
                      }`}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowCompPass(prev => !prev)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                      title={showCompPass ? 'Hide password' : 'Show password'}
                    >
                      {showCompPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {getFieldError('comp_admin_pass') && (
                    <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getFieldError('comp_admin_pass')}</span>
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Confirm Password <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCompConfirm ? 'text' : 'password'}
                      required
                      placeholder="Re-enter password"
                      value={compAdmin.confirmPassword}
                      onBlur={() => markTouched('comp_admin_confirm')}
                      onChange={(e) => setCompAdmin({ ...compAdmin, confirmPassword: e.target.value })}
                      className={`w-full px-3 pr-10 py-2 border rounded-lg focus:outline-none transition-colors ${
                        getFieldError('comp_admin_confirm')
                          ? 'bg-rose-50/30 border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400'
                          : compAdmin.confirmPassword && compAdmin.password === compAdmin.confirmPassword
                          ? 'border-emerald-500 bg-emerald-50/10'
                          : 'bg-[#F6F7F9] border-[#E3E6EB] focus:border-[#F07421]'
                      }`}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowCompConfirm(prev => !prev)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                      title={showCompConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showCompConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {getFieldError('comp_admin_confirm') ? (
                    <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getFieldError('comp_admin_confirm')}</span>
                    </p>
                  ) : compAdmin.confirmPassword && compAdmin.password === compAdmin.confirmPassword ? (
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                      <Check className="w-3.5 h-3.5" /> Passwords match
                    </span>
                  ) : null}
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
                className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                  isCompReadyToCreate
                    ? 'bg-[#F07421] hover:bg-[#D96214] text-white active:scale-98'
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

      {/* Document Preview Modal */}
      {previewDoc && (
        <DocumentViewerModal
          document={previewDoc}
          onClose={() => setPreviewDoc(null)}
          entityName={activeTab === 'institution' ? instForm.name : compForm.name}
        />
      )}
    </div>
  );
};
