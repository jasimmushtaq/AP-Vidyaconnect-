// ============================================================================
// AP VIDYACONNECT — CREATE MOU WIZARD PAGE
// Multi-Step Interactive MoU Generator for Companies & Institutions
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';
import { Institution, MoUAgreement, MoUSignature } from '../../types/database';
import { MoUDocumentView } from '../../components/mou/MoUDocumentView';
import { MoUSignatureModal } from '../../components/mou/MoUSignatureModal';
import { MoUEmailModal } from '../../components/mou/MoUEmailModal';
import {
  FileText,
  Building2,
  School,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  PenTool,
  Send,
  Eye,
  ShieldCheck,
  Sparkles,
  Search,
  Plus,
  Trash2,
  Info
} from 'lucide-react';

export const CreateMoUPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedInstId = searchParams.get('institution_id');

  const { currentUser, currentCompany } = useAuth();
  const [institutions, setInstitutions] = useState(db.institutions);

  // Wizard Steps: 1 = Select College, 2 = Terms & Clauses, 3 = Review & Sign, 4 = Email & Dispatch
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [selectedInstId, setSelectedInstId] = useState<string>(preselectedInstId || 'inst-unity');
  const [searchQuery, setSearchQuery] = useState('');

  // Date defaults
  const today = new Date();
  const dayStr = today.getDate().toString();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthStr = monthNames[today.getMonth()];
  const yearStr = today.getFullYear().toString();

  const [effectiveDay, setEffectiveDay] = useState(dayStr);
  const [effectiveMonth, setEffectiveMonth] = useState(monthStr);
  const [effectiveYear, setEffectiveYear] = useState(yearStr);

  // Signatory details
  const [companyName, setCompanyName] = useState(currentCompany?.name || 'PIXELWIND TECHNOLOGIES');
  const [companyRepTitle, setCompanyRepTitle] = useState('Centre Head / Director / Managing Director');
  const [companyRepName, setCompanyRepName] = useState(
    currentCompany?.authorized_person_name || 'G Ram Prasad'
  );

  const [collegeName, setCollegeName] = useState('UNITY DEGREE COLLEGE');
  const [collegeRepTitle, setCollegeRepTitle] = useState('Principal / Director / Head of Department');
  const [collegeRepName, setCollegeRepName] = useState('Dr. K. S. Rao');
  const [collegeEmail, setCollegeEmail] = useState('principal@unitydegreecollege.edu.in');

  // Domains & Specialization
  const [areasOfCooperation, setAreasOfCooperation] = useState<string[]>([
    'Skill Based Training',
    'Education',
    'Placement',
    'Industrial Visit',
    'Expert Lecture'
  ]);
  const [newAreaInput, setNewAreaInput] = useState('');

  const [companySpecialization, setCompanySpecialization] = useState(
    'Internships on Digital Marketing, Full Stack Developer and Machine Learning'
  );
  const [validityYears, setValidityYears] = useState(3);

  // Signature state
  const [companySignature, setCompanySignature] = useState<MoUSignature | null>(null);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Newly created MoU reference
  const [createdMoU, setCreatedMoU] = useState<MoUAgreement | null>(null);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setInstitutions([...db.institutions]);
    });
    return unsub;
  }, []);

  // Update college fields when institution is selected
  useEffect(() => {
    const inst = institutions.find((i) => i.id === selectedInstId);
    if (inst) {
      setCollegeName(inst.name);
      setCollegeRepName(inst.principal_name || 'Dr. Principal');
      setCollegeEmail(inst.official_email || 'principal@college.edu.in');
    }
  }, [selectedInstId, institutions]);

  // Filtered institutions
  const filteredInstitutions = institutions.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddArea = () => {
    if (newAreaInput.trim() && !areasOfCooperation.includes(newAreaInput.trim())) {
      setAreasOfCooperation([...areasOfCooperation, newAreaInput.trim()]);
      setNewAreaInput('');
    }
  };

  const handleRemoveArea = (area: string) => {
    setAreasOfCooperation(areasOfCooperation.filter((a) => a !== area));
  };

  // Construct draft MoU object for preview
  const previewMoU: MoUAgreement = {
    id: createdMoU?.id || 'mou-draft',
    mou_code: createdMoU?.mou_code || `MOU-${effectiveYear}-PW-UDC-${Math.floor(100 + Math.random() * 900)}`,
    company_id: currentCompany?.id || currentUser.company_id || 'comp-001',
    company: currentCompany || {
      id: 'comp-001',
      name: companyName,
      cin: 'U72200TG2020PTC145678',
      industry: 'Information Technology',
      sector: 'Enterprise Software',
      official_email: 'contact@pixelwindtech.com',
      official_phone: '+91 40 4859 9000',
      headquarters: 'Visakhapatnam / Hyderabad',
      authorized_person_name: companyRepName,
      designation: companyRepTitle,
      verification_status: 'verified',
      created_at: new Date().toISOString()
    },
    institution_id: selectedInstId,
    institution: institutions.find((i) => i.id === selectedInstId),
    created_by: currentUser.id,
    created_by_name: currentUser.full_name,
    effective_day: effectiveDay,
    effective_month: effectiveMonth,
    effective_year: effectiveYear,
    effective_date: `${effectiveYear}-${effectiveMonth}-${effectiveDay}`,
    first_party_name: collegeName.toUpperCase(),
    first_party_rep_title: collegeRepTitle,
    first_party_rep_name: collegeRepName,
    second_party_name: companyName.toUpperCase(),
    second_party_rep_title: companyRepTitle,
    second_party_rep_name: companyRepName,
    areas_of_cooperation: areasOfCooperation,
    company_specialization: companySpecialization,
    clauses: {
      cooperation: `1.1 Both Parties are united by common interests and objectives, and they shall establish co-operation.\n1.2 First Party and Second Party co-operation will facilitate effective utilization of the intellectual capabilities.\n1.3 The parties shall co-operate with each other and shall as promptly as is responsibly practical, relevant agreement.`,
      industrial_training_visits: `2.1 Industrial Training & Visits: Industry and Institution interaction will provide an insight into the latest developments / requirements of the industries; the Second Party to permit the Faculty and Students of the First Party to visit its group companies and also involve in Industrial Training Programs for the First Party. This will provide confidence & smooth transition for students work. Also, the Second party may register on the AICTE Internship Portal and APSCHE Portal for the benefit of students.`,
      guest_lectures: `2.2 Guest Lectures: Second Party to extend the necessary support to deliver guest lecturers to the students of the First Party on the technology trends and in house requirements.`,
      placement_support: `2.3 Placement of trained students: second party will actively engage to help the delivery of the training and placement of the students of the first party on the technology trends and in house requirements.`,
      financial_terms: `2.4 There is no financial commitment on the part of the ${collegeName.toUpperCase()}, the first party to take up any program mention in MoU. If there is any financial consideration, it will be dealt separately.`,
      approvals_licenses: `2.5 Both Parties to obtain all internal approvals, consents, permissions, and licenses of whatsoever nature required.`,
      validity_duration: `3.1 This Agreement will be valid until it is expressly terminated by either Party on mutually agreed terms, during which period, the Second Part.`,
      relationship_terms: `5.1 It is expressly agreed that First Party and Second Party are acting under this MOU as independent contractors, and the relationship established under this MOU shall not be construed as a partnership.`
    },
    validity_years: validityYears,
    status: companySignature ? 'company_signed' : 'draft',
    first_party_signature: null,
    second_party_signature: companySignature,
    feedback_history: [],
    email_sent: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const handleSaveAndSign = async (sig: MoUSignature) => {
    setCompanySignature(sig);
    const newMoU = db.createMoU(
      {
        ...previewMoU,
        second_party_signature: sig,
        status: 'company_signed'
      },
      currentUser
    );
    setCreatedMoU(newMoU);
    setCurrentStep(4);
  };

  const handleDispatchEmail = async (email: string) => {
    if (!createdMoU) return;
    db.sendMoUByEmail(createdMoU.id, email, currentUser);
    navigate(`/mous/${createdMoU.id}?sent=true`);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Breadcrumb & Header */}
        <div className="bg-gradient-to-r from-[#0E2350] via-[#14336F] to-[#1c4596] rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-[#F07421] font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              Institutional Partnership Portal
            </div>
            <h1 className="text-2xl font-black tracking-tight">Create &amp; Dispatch New MoU</h1>
            <p className="text-xs text-[#DCE5F5]/80 max-w-xl">
              Standard 2-Page Bilateral Memorandum of Understanding between Higher Educational Institutions and Industry Partners under the AP State Higher Education Council framework.
            </p>
          </div>

          <button
            onClick={() => navigate('/mous')}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all self-start md:self-center"
          >
            ← Back to MoUs
          </button>
        </div>

        {/* Step Stepper Header */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
          {[
            { step: 1, title: '1. Select College', subtitle: 'Target Institution' },
            { step: 2, title: '2. MoU Terms', subtitle: 'Clauses & Scope' },
            { step: 3, title: '3. Preview & Sign', subtitle: 'Digital Execution' },
            { step: 4, title: '4. Transmit Email', subtitle: 'Dispatch to College' }
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => {
                if (s.step < currentStep || (createdMoU && s.step === 4)) {
                  setCurrentStep(s.step);
                }
              }}
              disabled={s.step > currentStep && !createdMoU}
              className={`p-3 rounded-xl text-left transition-all ${
                currentStep === s.step
                  ? 'bg-[#0E2350] text-white shadow-md'
                  : currentStep > s.step
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-gray-50 text-gray-400 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold">{s.title}</span>
                {currentStep > s.step && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto" />}
              </div>
              <p className={`text-[10px] truncate mt-0.5 ${currentStep === s.step ? 'text-[#DCE5F5]' : 'text-gray-500'}`}>
                {s.subtitle}
              </p>
            </button>
          ))}
        </div>

        {/* STEP 1: SELECT COLLEGE / INSTITUTION */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <School className="w-5 h-5 text-blue-600" />
                  Select Partner College / Higher Education Institution
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Choose the verified university, autonomous degree college, or polytechnic institution in Andhra Pradesh.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search college by name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Institution Selection Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredInstitutions.map((inst) => {
                const isSelected = selectedInstId === inst.id;
                return (
                  <div
                    key={inst.id}
                    onClick={() => setSelectedInstId(inst.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#F07421] bg-orange-50/30 shadow-md ring-2 ring-[#F07421]/20'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/20'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                          {inst.code}
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-[#F07421] text-white font-bold px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Selected
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-sm text-gray-900">{inst.name}</h3>
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <School className="w-3.5 h-3.5 text-gray-400" />
                        Affiliated to: <strong>{inst.affiliated_university}</strong>
                      </p>
                      <p className="text-xs text-gray-600">
                        Principal: <strong>{inst.principal_name}</strong>
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        {inst.official_email} • {inst.district}, {inst.state}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> NAAC / State Verified
                      </span>
                      <span className="text-[#0E2350] font-semibold">Select Institution →</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Step Navigation Bar */}
            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2.5 bg-[#0E2350] hover:bg-[#14336F] text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all"
              >
                Continue to Terms &amp; Scope <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: TERMS, DATES & SPECIALIZATION */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Configure MoU Terms &amp; Cooperation Scope
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Customize signatories, dates, areas of academic collaboration, and technology tracks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Effective Date */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-gray-200">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Effective MoU Date
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1">Day</label>
                    <input
                      type="text"
                      value={effectiveDay}
                      onChange={(e) => setEffectiveDay(e.target.value)}
                      placeholder="e.g. 21"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1">Month</label>
                    <input
                      type="text"
                      value={effectiveMonth}
                      onChange={(e) => setEffectiveMonth(e.target.value)}
                      placeholder="e.g. April"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1">Year</label>
                    <input
                      type="text"
                      value={effectiveYear}
                      onChange={(e) => setEffectiveYear(e.target.value)}
                      placeholder="e.g. 2026"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Agreement Validity */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Agreement Validity Duration
                  </h3>
                  <span className="text-[11px] font-bold text-blue-800 bg-blue-100/70 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {validityYears === 1
                      ? '1 Year (Pilot Partnership)'
                      : validityYears === 3
                      ? '3 Years (Recommended Standard)'
                      : validityYears === 5
                      ? '5 Years (Institutional Long-term)'
                      : `${validityYears} Years Duration`}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={25}
                      value={validityYears}
                      onChange={(e) => setValidityYears(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-24 px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none font-bold text-center bg-white focus:ring-2 focus:ring-blue-500 shadow-xs"
                      placeholder="e.g. 3"
                    />
                    <span className="text-xs font-semibold text-gray-700">Years Duration (Editable)</span>
                  </div>

                  {/* Preset option buttons with descriptive labels */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      { yr: 1, label: '1 Year', sub: 'Pilot Partnership' },
                      { yr: 2, label: '2 Years', sub: '' },
                      { yr: 3, label: '3 Years', sub: 'Recommended Standard' },
                      { yr: 4, label: '4 Years', sub: '' },
                      { yr: 5, label: '5 Years', sub: 'Institutional Long-term' },
                      { yr: 10, label: '10 Years', sub: 'Strategic Partner' }
                    ].map((item) => (
                      <button
                        key={item.yr}
                        type="button"
                        onClick={() => setValidityYears(item.yr)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                          validityYears === item.yr
                            ? 'bg-[#0E2350] text-white shadow-sm ring-2 ring-blue-500/20'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                        }`}
                      >
                        <span>{item.label}</span>
                        {item.sub && (
                          <span
                            className={`text-[10px] font-normal ${
                              validityYears === item.yr ? 'text-blue-200' : 'text-gray-500'
                            }`}
                          >
                            ({item.sub})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Parties Signatories Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* College Signatory */}
              <div className="space-y-3 p-4 rounded-xl border border-blue-200 bg-blue-50/40">
                <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2">
                  <School className="w-4 h-4 text-blue-600" />
                  First Party (College Representative)
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] text-gray-700">Institution Name</label>
                    <input
                      type="text"
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-700">Representative Designation</label>
                    <input
                      type="text"
                      value={collegeRepTitle}
                      onChange={(e) => setCollegeRepTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-700">Principal / Head Name</label>
                    <input
                      type="text"
                      value={collegeRepName}
                      onChange={(e) => setCollegeRepName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Company Signatory */}
              <div className="space-y-3 p-4 rounded-xl border border-orange-200 bg-orange-50/40">
                <h3 className="text-xs font-bold text-orange-950 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#F07421]" />
                  Second Party (Company Representative)
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] text-gray-700">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-700">Representative Designation</label>
                    <input
                      type="text"
                      value={companyRepTitle}
                      onChange={(e) => setCompanyRepTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-700">Signatory Person Name</label>
                    <input
                      type="text"
                      value={companyRepName}
                      onChange={(e) => setCompanyRepName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Areas of Cooperation */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                Areas of Academic &amp; Industry Cooperation (WHEREAS Clause C)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {areasOfCooperation.map((area) => (
                  <span
                    key={area}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200"
                  >
                    {area}
                    <button
                      type="button"
                      onClick={() => handleRemoveArea(area)}
                      className="hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  value={newAreaInput}
                  onChange={(e) => setNewAreaInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddArea())}
                  placeholder="Add cooperation area (e.g. Hackathons, Faculty Immersion)..."
                  className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddArea}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>

            {/* Company Specialization */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                Company Technical Domains / Specialization (WHEREAS Clause D)
              </label>
              <input
                type="text"
                value={companySpecialization}
                onChange={(e) => setCompanySpecialization(e.target.value)}
                placeholder="e.g. Internships on Digital Marketing, Full Stack Developer and Machine Learning"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg font-medium outline-none"
              />
            </div>

            {/* Navigation buttons */}
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Back to College Selection
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2.5 bg-[#0E2350] hover:bg-[#14336F] text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all"
              >
                Review Official 2-Page Document <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: LIVE PREVIEW & COMPANY DIGITAL SIGN */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#F07421]" />
                  Live Official 2-Page Document Preview
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Verify the rendered clauses. Sign digitally to authorize before emailing to the college.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold rounded-xl transition-all"
                >
                  Edit Clauses
                </button>

                <button
                  type="button"
                  onClick={() => setIsSignModalOpen(true)}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#F07421] to-[#d65f10] hover:from-[#d65f10] hover:to-[#F07421] text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all"
                >
                  <PenTool className="w-4 h-4" />
                  {companySignature ? 'Re-Sign Document' : 'Affix Digital Signature & Continue'}
                </button>
              </div>
            </div>

            {/* Document preview renderer */}
            <MoUDocumentView mou={previewMoU} />
          </div>
        )}

        {/* STEP 4: EMAIL DISPATCH & FINAL CONFIRMATION */}
        {currentStep === 4 && createdMoU && (
          <div className="bg-white rounded-2xl p-8 border border-gray-200/80 shadow-xl text-center space-y-6 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner animate-scaleUp">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="font-mono text-xs bg-blue-100 text-blue-900 font-bold px-3 py-1 rounded-full">
                {createdMoU.mou_code}
              </span>
              <h2 className="text-2xl font-black text-gray-900">MoU Created &amp; Pre-Signed!</h2>
              <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
                Your company has executed digital signing for <strong>{createdMoU.first_party_name}</strong>. Now transmit the official letter and review link by email to the College Principal.
              </p>
            </div>

            <div className="bg-slate-50 border border-gray-200 rounded-2xl p-4 text-left text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">First Party:</span>
                <span className="font-bold text-gray-900">{createdMoU.first_party_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Second Party:</span>
                <span className="font-bold text-gray-900">{createdMoU.second_party_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Recipient Email:</span>
                <span className="font-bold text-blue-700 font-mono">{collegeEmail}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Current Status:</span>
                <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  Company Signed (Ready to Send)
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(true)}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#F07421] to-[#d65f10] hover:from-[#d65f10] hover:to-[#F07421] text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" /> Send MoU by Email Now
              </button>

              <button
                type="button"
                onClick={() => navigate(`/mous/${createdMoU.id}`)}
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold rounded-xl transition-all"
              >
                View in Workspace
              </button>
            </div>
          </div>
        )}

        {/* Digital Signature Modal */}
        <MoUSignatureModal
          isOpen={isSignModalOpen}
          onClose={() => setIsSignModalOpen(false)}
          mou={previewMoU}
          party="second_party"
          onSign={handleSaveAndSign}
        />

        {/* Email Dispatch Modal */}
        {createdMoU && (
          <MoUEmailModal
            isOpen={isEmailModalOpen}
            onClose={() => setIsEmailModalOpen(false)}
            mou={createdMoU}
            onSendEmail={handleDispatchEmail}
          />
        )}
      </div>
    </div>
  );
};
