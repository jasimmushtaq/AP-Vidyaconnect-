// ============================================================================
// AP VIDYACONNECT — STATE SUPER ADMIN DIRECT PARTNER ONBOARDING STUDIO
// Dedicated portal for directly registering & onboarding Colleges & Companies
// ============================================================================

import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';
import {
  School,
  Building2,
  CheckCircle2,
  Sparkles,
  Upload,
  Image as ImageIcon,
  MapPin,
  Globe,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  ExternalLink,
  Award,
  Layers,
  FileCheck
} from 'lucide-react';

import { uploadToCloudinary } from '../../services/cloudinaryService';

export const RegisterPartnerPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Selected tab: 'institution' or 'company'
  const initialType = searchParams.get('type') === 'company' ? 'company' : 'institution';
  const [partnerType, setPartnerType] = useState<'institution' | 'company'>(initialType);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successEntity, setSuccessEntity] = useState<{ type: 'institution' | 'company'; name: string; id: string } | null>(null);

  // Logo file error states
  const [logoError, setLogoError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);

  // 1. Institution Form State
  const [instForm, setInstForm] = useState({
    name: '',
    code: `GDC-${Math.floor(100 + Math.random() * 900)}-2026`,
    type: 'govt_degree_college' as const,
    affiliated_university: 'Andhra University',
    principal_name: '',
    official_email: '',
    official_phone: '+91 891 2345678',
    district: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    pin_code: '530001',
    website: 'https://',
    accreditation: 'NAAC A+ Accredited',
    logo_url: '',
    is_verified_now: true,
  });

  // 2. Company Form State
  const [compForm, setCompForm] = useState({
    name: '',
    cin: `U72200AP2026PTC${Math.floor(100000 + Math.random() * 900000)}`,
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
    is_verified_now: true,
  });

  // File Upload Handler (PNG & WebP validation with Cloudinary storage)
  const handleFileUpload = async (file: File) => {
    setLogoError(null);
    const fileName = file.name.toLowerCase();
    const isPng = file.type === 'image/png' || fileName.endsWith('.png');
    const isWebp = file.type === 'image/webp' || fileName.endsWith('.webp');

    if (!isPng && !isWebp) {
      setLogoError('Unsupported image format! Please upload a transparent PNG (.png) or WebP (.webp) file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setLogoError('File exceeds 5MB size limit. Please upload a smaller image.');
      return;
    }

    try {
      const folder = partnerType === 'institution' ? 'platform/institution_logo' : 'platform/company_logo';
      const res = await uploadToCloudinary(file, { folder });
      const finalUrl = res.secure_url || res.url;
      if (partnerType === 'institution') {
        setInstForm((prev) => ({ ...prev, logo_url: finalUrl }));
      } else {
        setCompForm((prev) => ({ ...prev, logo_url: finalUrl }));
      }
      setLogoError(null);
    } catch (err) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const result = e.target.result as string;
          if (partnerType === 'institution') {
            setInstForm((prev) => ({ ...prev, logo_url: result }));
          } else {
            setCompForm((prev) => ({ ...prev, logo_url: result }));
          }
          setLogoError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (partnerType === 'institution') {
      if (!instForm.name.trim()) {
        setToastMsg('Please provide the College / Institution Name.');
        setIsSubmitting(false);
        return;
      }

      const created = db.addInstitution(
        {
          name: instForm.name.trim(),
          code: instForm.code.trim(),
          type: instForm.type,
          affiliated_university: instForm.affiliated_university.trim(),
          principal_name: instForm.principal_name.trim() || 'Principal In-Charge',
          official_email: instForm.official_email.trim() || `contact.${Date.now().toString().slice(-4)}@apgdc.edu.in`,
          official_phone: instForm.official_phone.trim(),
          district: instForm.district.trim(),
          state: instForm.state.trim(),
          pin_code: instForm.pin_code.trim(),
          website: instForm.website.trim(),
          accreditation: instForm.accreditation.trim(),
          logo_url: instForm.logo_url.trim(),
          verification_status: instForm.is_verified_now ? 'verified' : 'under_verification',
          verification_notes: `Directly onboarded by State Super Admin ${currentUser.full_name}`,
        },
        currentUser
      );

      setSuccessEntity({ type: 'institution', name: created.name, id: created.id });
    } else {
      if (!compForm.name.trim()) {
        setToastMsg('Please provide the Company / Corporate Name.');
        setIsSubmitting(false);
        return;
      }

      const created = db.addCompany(
        {
          name: compForm.name.trim(),
          cin: compForm.cin.trim(),
          industry: compForm.industry.trim(),
          sector: compForm.sector.trim(),
          headquarters: compForm.headquarters.trim(),
          authorized_person_name: compForm.authorized_person_name.trim() || 'Talent Acquisition Head',
          designation: compForm.designation.trim(),
          official_email: compForm.official_email.trim() || `careers.${Date.now().toString().slice(-4)}@company.com`,
          official_phone: compForm.official_phone.trim(),
          website: compForm.website.trim(),
          description: compForm.description.trim() || 'Official Corporate Internship & Skilling Partner.',
          logo_url: compForm.logo_url.trim(),
          verification_status: compForm.is_verified_now ? 'verified' : 'under_verification',
          verification_notes: `Directly onboarded by State Super Admin ${currentUser.full_name}`,
        },
        currentUser
      );

      setSuccessEntity({ type: 'company', name: created.name, id: created.id });
    }

    setIsSubmitting(false);
  };

  const handleResetForm = () => {
    setSuccessEntity(null);
    setLogoError(null);
    setShowUrlInput(false);
    if (partnerType === 'institution') {
      setInstForm({
        name: '',
        code: `GDC-${Math.floor(100 + Math.random() * 900)}-2026`,
        type: 'govt_degree_college',
        affiliated_university: 'Andhra University',
        principal_name: '',
        official_email: '',
        official_phone: '+91 891 2345678',
        district: 'Visakhapatnam',
        state: 'Andhra Pradesh',
        pin_code: '530001',
        website: 'https://',
        accreditation: 'NAAC A+ Accredited',
        logo_url: '',
        is_verified_now: true,
      });
    } else {
      setCompForm({
        name: '',
        cin: `U72200AP2026PTC${Math.floor(100000 + Math.random() * 900000)}`,
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
        is_verified_now: true,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 text-xs font-bold flex items-center justify-between shadow-sm">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-rose-700 hover:text-rose-950 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0E2350] via-[#102A60] to-[#1E3A8A] text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#F07421]/20 text-[#FF9E44] px-3 py-1 rounded-full text-xs font-bold mb-2 border border-[#F07421]/40">
            <Sparkles className="w-4 h-4 text-[#F07421]" />
            State Admin Direct Onboarding Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Register Partner Entity
          </h1>
          <p className="text-xs sm:text-sm text-[#DCE5F5] mt-1 max-w-2xl">
            Directly onboard verified Colleges, Universities, and Corporate Industry Partners into the live AP VidyaConnect portal.
          </p>
        </div>

        {/* Quick Jump Links */}
        <div className="flex items-center gap-2">
          <Link
            to="/admin/institutions"
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
          >
            View Colleges Directory
          </Link>
          <Link
            to="/admin/companies"
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
          >
            View Companies Directory
          </Link>
        </div>
      </div>

      {/* Success Notification Modal / Card */}
      {successEntity && (
        <div className="bg-emerald-50 border-2 border-emerald-400 p-6 rounded-3xl shadow-lg animate-in fade-in zoom-in-95 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Registration Successful
              </span>
              <h2 className="text-xl font-extrabold text-emerald-950 mt-1">
                "{successEntity.name}" is now live in the AP VidyaConnect ecosystem!
              </h2>
              <p className="text-xs text-emerald-800 mt-0.5">
                The entity has been registered, certified, and is now visible across the public directory, proposal builder, and student match engine.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleResetForm}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-all"
            >
              + Register Another Partner
            </button>
            <Link
              to={successEntity.type === 'institution' ? '/admin/institutions' : '/admin/companies'}
              className="px-4 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-900 font-bold text-xs hover:bg-emerald-100 transition-all flex items-center gap-1.5"
            >
              <span>Go to {successEntity.type === 'institution' ? 'Colleges' : 'Companies'} Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Mode Switcher Tabs */}
      {!successEntity && (
        <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setPartnerType('institution');
              setLogoError(null);
            }}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all ${
              partnerType === 'institution'
                ? 'bg-[#0E2350] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100 hover:text-[#0E2350]'
            }`}
          >
            <School className="w-4 h-4 text-[#F07421]" />
            <span>Register College / Institution Partner</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPartnerType('company');
              setLogoError(null);
            }}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all ${
              partnerType === 'company'
                ? 'bg-gradient-to-r from-[#F07421] to-[#E06411] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100 hover:text-[#0E2350]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Register Corporate / Industry Partner</span>
          </button>
        </div>
      )}

      {/* Main Form & Live Preview Grid */}
      {!successEntity && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-lg font-black text-[#0E2350]">
                {partnerType === 'institution'
                  ? '🏫 Institution Partner Details'
                  : '🏢 Corporate Industry Partner Details'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {partnerType === 'institution'
                  ? 'Provide college AISHE code, NAAC accreditation, principal details, and official contact.'
                  : 'Provide MCA CIN, corporate sector, authorized officer, and company overview.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Common / Institution Fields */}
              {partnerType === 'institution' ? (
                <>
                  {/* College Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      College / Institution Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={instForm.name}
                      onChange={(e) => setInstForm({ ...instForm, name: e.target.value })}
                      placeholder="e.g. Govt Degree College (Men), Srikakulam"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0E2350] focus:outline-none"
                    />
                  </div>

                  {/* Code & Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        AISHE / Institutional Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={instForm.code}
                        onChange={(e) => setInstForm({ ...instForm, code: e.target.value })}
                        placeholder="e.g. GDC-SKLM-2026"
                        className="w-full font-mono text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0E2350] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Institution Type
                      </label>
                      <select
                        value={instForm.type}
                        onChange={(e) => setInstForm({ ...instForm, type: e.target.value as any })}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 font-medium bg-white focus:ring-2 focus:ring-[#0E2350]"
                      >
                        <option value="govt_degree_college">Govt Degree College (GDC)</option>
                        <option value="autonomous_college">Autonomous College</option>
                        <option value="state_university">State University Department</option>
                        <option value="private_aided_college">Private Aided College</option>
                      </select>
                    </div>
                  </div>

                  {/* Affiliated University & NAAC */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Affiliated University
                      </label>
                      <select
                        value={instForm.affiliated_university}
                        onChange={(e) => setInstForm({ ...instForm, affiliated_university: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white font-medium focus:ring-2 focus:ring-[#0E2350]"
                      >
                        <option value="Andhra University">Andhra University (AU)</option>
                        <option value="Sri Venkateswara University">Sri Venkateswara University (SVU)</option>
                        <option value="Acharya Nagarjuna University">Acharya Nagarjuna University (ANU)</option>
                        <option value="JNTU Kakinada">JNTU Kakinada</option>
                        <option value="JNTU Anantapur">JNTU Anantapur</option>
                        <option value="Dr. B.R. Ambedkar University">Dr. B.R. Ambedkar University</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        NAAC Accreditation / Grade
                      </label>
                      <input
                        type="text"
                        value={instForm.accreditation}
                        onChange={(e) => setInstForm({ ...instForm, accreditation: e.target.value })}
                        placeholder="e.g. NAAC A+ Accredited (3.42 CGPA)"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0E2350]"
                      />
                    </div>
                  </div>

                  {/* Principal Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Principal / Head of Institution
                      </label>
                      <input
                        type="text"
                        value={instForm.principal_name}
                        onChange={(e) => setInstForm({ ...instForm, principal_name: e.target.value })}
                        placeholder="e.g. Dr. K. Ramanayya, M.Sc., Ph.D."
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0E2350]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Official Contact Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={instForm.official_email}
                        onChange={(e) => setInstForm({ ...instForm, official_email: e.target.value })}
                        placeholder="principal.gdck@ap.gov.in"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0E2350]"
                      />
                    </div>
                  </div>

                  {/* Phone & District */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Official Phone
                      </label>
                      <input
                        type="text"
                        value={instForm.official_phone}
                        onChange={(e) => setInstForm({ ...instForm, official_phone: e.target.value })}
                        placeholder="+91 891 2345678"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0E2350]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        District (Andhra Pradesh)
                      </label>
                      <select
                        value={instForm.district}
                        onChange={(e) => setInstForm({ ...instForm, district: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white font-medium focus:ring-2 focus:ring-[#0E2350]"
                      >
                        <option value="Visakhapatnam">Visakhapatnam</option>
                        <option value="Vijayawada (NTR)">Vijayawada (NTR)</option>
                        <option value="Guntur">Guntur</option>
                        <option value="Tirupati">Tirupati</option>
                        <option value="Kurnool">Kurnool</option>
                        <option value="Srikakulam">Srikakulam</option>
                        <option value="Vizianagaram">Vizianagaram</option>
                        <option value="East Godavari (Kakinada)">East Godavari (Kakinada)</option>
                        <option value="West Godavari (Eluru)">West Godavari (Eluru)</option>
                        <option value="Anantapur">Anantapur</option>
                        <option value="Kadapa (YSR)">Kadapa (YSR)</option>
                        <option value="Nellore">Nellore</option>
                        <option value="Prakasam (Ongole)">Prakasam (Ongole)</option>
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                /* Corporate Company Fields */
                <>
                  {/* Company Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Corporate / Enterprise Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={compForm.name}
                      onChange={(e) => setCompForm({ ...compForm, name: e.target.value })}
                      placeholder="e.g. Tata Consultancy Services Ltd."
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#F07421] focus:outline-none"
                    />
                  </div>

                  {/* CIN & Industry */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Corporate Identity Number (MCA CIN) *
                      </label>
                      <input
                        type="text"
                        required
                        value={compForm.cin}
                        onChange={(e) => setCompForm({ ...compForm, cin: e.target.value })}
                        placeholder="e.g. L72200MH1995PLC095642"
                        className="w-full font-mono text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#F07421] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Industry Domain
                      </label>
                      <select
                        value={compForm.industry}
                        onChange={(e) => setCompForm({ ...compForm, industry: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 font-medium bg-white focus:ring-2 focus:ring-[#F07421]"
                      >
                        <option value="Information Technology & Software">Information Technology & Software</option>
                        <option value="Pharmaceuticals & Healthcare">Pharmaceuticals & Healthcare</option>
                        <option value="Banking, Financial Services & Insurance (BFSI)">Banking & Financial Services (BFSI)</option>
                        <option value="Manufacturing & Automobile">Manufacturing & Automobile</option>
                        <option value="Renewable Energy & Power">Renewable Energy & Power</option>
                        <option value="Telecommunications & 5G">Telecommunications & 5G</option>
                        <option value="Biotechnology & Life Sciences">Biotechnology & Life Sciences</option>
                      </select>
                    </div>
                  </div>

                  {/* Sector & Headquarters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Specialized Sector
                      </label>
                      <input
                        type="text"
                        value={compForm.sector}
                        onChange={(e) => setCompForm({ ...compForm, sector: e.target.value })}
                        placeholder="e.g. Cloud Platforms & AI Solutions"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#F07421]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Headquarters / Regional Base
                      </label>
                      <input
                        type="text"
                        value={compForm.headquarters}
                        onChange={(e) => setCompForm({ ...compForm, headquarters: e.target.value })}
                        placeholder="e.g. Visakhapatnam, Andhra Pradesh"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#F07421]"
                      />
                    </div>
                  </div>

                  {/* Authorized Person & Designation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Authorized Signatory / HR Lead
                      </label>
                      <input
                        type="text"
                        value={compForm.authorized_person_name}
                        onChange={(e) => setCompForm({ ...compForm, authorized_person_name: e.target.value })}
                        placeholder="e.g. Pooja Deshmukh"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#F07421]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Designation
                      </label>
                      <input
                        type="text"
                        value={compForm.designation}
                        onChange={(e) => setCompForm({ ...compForm, designation: e.target.value })}
                        placeholder="e.g. VP — Talent Acquisition"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#F07421]"
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Official Corporate Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={compForm.official_email}
                        onChange={(e) => setCompForm({ ...compForm, official_email: e.target.value })}
                        placeholder="university.relations@company.com"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#F07421]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={compForm.official_phone}
                        onChange={(e) => setCompForm({ ...compForm, official_phone: e.target.value })}
                        placeholder="+91 891 4567890"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#F07421]"
                      />
                    </div>
                  </div>

                  {/* Company Description */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Company Overview & Internship Focus
                    </label>
                    <textarea
                      rows={2}
                      value={compForm.description}
                      onChange={(e) => setCompForm({ ...compForm, description: e.target.value })}
                      placeholder="Brief overview of internship programs, industry domains, and mentoring scope..."
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#F07421]"
                    />
                  </div>
                </>
              )}

              {/* Official Logo Upload Section */}
              <div className="pt-2 border-t">
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>Official Logo (PNG or WebP)</span>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-[11px] text-[#0E2350] hover:underline font-bold"
                  >
                    {showUrlInput ? 'Upload Device File' : 'Enter Image URL Instead'}
                  </button>
                </label>

                {!showUrlInput ? (
                  <div className="border-2 border-dashed border-gray-300 hover:border-[#0E2350] rounded-2xl p-4 text-center bg-gray-50/60 hover:bg-white transition-all cursor-pointer relative group">
                    <input
                      type="file"
                      accept=".png,.webp,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0E2350] flex items-center justify-center">
                        <Upload className="w-5 h-5 text-[#0E2350]" />
                      </div>
                      <p className="text-xs font-bold text-gray-700">
                        Click or drag & drop transparent logo
                      </p>
                      <p className="text-[10px] text-gray-400">
                        PNG or WebP format (Max 5MB)
                      </p>
                    </div>
                  </div>
                ) : (
                  <input
                    type="url"
                    value={partnerType === 'institution' ? instForm.logo_url : compForm.logo_url}
                    onChange={(e) => {
                      if (partnerType === 'institution') {
                        setInstForm({ ...instForm, logo_url: e.target.value });
                      } else {
                        setCompForm({ ...compForm, logo_url: e.target.value });
                      }
                    }}
                    placeholder="https://example.com/logo.png"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0E2350]"
                  />
                )}

                {logoError && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1.5">{logoError}</p>
                )}
              </div>

              {/* Instant Verification Checkbox */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-300 rounded-2xl flex items-center gap-3">
                <input
                  type="checkbox"
                  id="verify_now"
                  checked={partnerType === 'institution' ? instForm.is_verified_now : compForm.is_verified_now}
                  onChange={(e) => {
                    if (partnerType === 'institution') {
                      setInstForm({ ...instForm, is_verified_now: e.target.checked });
                    } else {
                      setCompForm({ ...compForm, is_verified_now: e.target.checked });
                    }
                  }}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="verify_now" className="text-xs text-emerald-950 font-bold cursor-pointer">
                  Certify & Activate Immediately (Status: Verified & Live)
                  <span className="block text-[10px] text-emerald-800 font-normal">
                    Skips the pending queue and directly admits the partner to the active AP VidyaConnect portal.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3.5 rounded-2xl text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-98 ${
                    partnerType === 'institution'
                      ? 'bg-gradient-to-r from-[#0E2350] to-[#1E3A8A] hover:from-[#14336F] hover:to-[#2563EB] shadow-blue-900/30'
                      : 'bg-gradient-to-r from-[#F07421] to-[#E06411] hover:from-[#E06411] hover:to-[#D95300] shadow-orange-500/30'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    {partnerType === 'institution'
                      ? 'Complete College Registration'
                      : 'Complete Corporate Registration'}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Live Preview Card (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-6 space-y-4">
              <div className="bg-[#0E2350] text-white p-4 rounded-2xl flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF9E44] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Live Portal Preview Card
                </span>
                <span className="text-[10px] text-gray-300">As shown on /partners</span>
              </div>

              {/* Simulated Card */}
              <div className="bg-white rounded-3xl border-2 border-[#0E2350]/20 p-5 shadow-xl space-y-4">
                <div className="flex items-start justify-between gap-3">
                  {/* Logo Preview */}
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-gray-200 flex items-center justify-center overflow-hidden p-2 shadow-inner">
                    {(partnerType === 'institution' ? instForm.logo_url : compForm.logo_url) ? (
                      <img
                        src={partnerType === 'institution' ? instForm.logo_url : compForm.logo_url}
                        alt="Logo Preview"
                        className="w-full h-full object-contain"
                      />
                    ) : partnerType === 'institution' ? (
                      <School className="w-8 h-8 text-[#0E2350]" />
                    ) : (
                      <Building2 className="w-8 h-8 text-[#F07421]" />
                    )}
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-700" />
                    Verified Partner
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-[#0E2350] leading-snug">
                    {partnerType === 'institution'
                      ? instForm.name || 'Government Degree College Name'
                      : compForm.name || 'Corporate Employer Name'}
                  </h3>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">
                    {partnerType === 'institution'
                      ? `${instForm.affiliated_university} • ${instForm.accreditation}`
                      : `${compForm.industry} • ${compForm.sector}`}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-3 rounded-2xl border border-gray-200/70">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#F07421]" />
                    <span>
                      {partnerType === 'institution'
                        ? `${instForm.district}, Andhra Pradesh`
                        : `${compForm.headquarters}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">
                      {partnerType === 'institution'
                        ? instForm.official_email || 'principal@ap.gov.in'
                        : compForm.official_email || 'careers@partner.com'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>
                      {partnerType === 'institution'
                        ? instForm.official_phone
                        : compForm.official_phone}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t flex items-center justify-between text-[11px] text-gray-500">
                  <span className="font-mono font-bold">
                    {partnerType === 'institution'
                      ? `AISHE: ${instForm.code}`
                      : `CIN: ${compForm.cin}`}
                  </span>
                  <span className="text-[#0E2350] font-bold flex items-center gap-0.5">
                    View Profile <ArrowRight className="w-3 h-3 text-[#F07421]" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
