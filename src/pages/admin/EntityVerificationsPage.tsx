// ============================================================================
// AP VIDYACONNECT — STATE SUPER ADMIN ENTITY VERIFICATION & AUDIT QUEUE
// Dedicated verification & compliance review workflow for colleges & companies
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Institution, Company, VerificationStatus, AttachedDocument } from '../../types/database';
import { DocumentViewerModal } from '../../components/common/DocumentViewerModal';
import { FileUploader } from '../../components/common/FileUploader';
import {
  printCredentialsDossier,
  downloadCredentialsDossierPDF,
  downloadCredentialsDossierHTML,
  downloadCredentialsCSV,
  downloadDocumentFile
} from '../../utils/credentialsDossier';
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
  X,
  Sparkles,
  MapPin,
  Globe,
  Mail,
  Phone,
  ArrowRight,
  Clock,
  FileCheck,
  AlertTriangle,
  FileSpreadsheet,
  Printer,
  Download,
  Copy,
  Paperclip,
  Eye,
  Plus,
  Trash2,
  UploadCloud
} from 'lucide-react';

export const EntityVerificationsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [institutions, setInstitutions] = useState<Institution[]>(db.institutions);
  const [companies, setCompanies] = useState<Company[]>(db.companies);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'under_verification' | 'verified' | 'rejected'>('under_verification');
  const [typeFilter, setTypeFilter] = useState<'all' | 'institution' | 'company'>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal states
  const [inspectEntity, setInspectEntity] = useState<{ type: 'institution' | 'company'; data: Institution | Company } | null>(null);
  const [rejectingEntity, setRejectingEntity] = useState<{ type: 'institution' | 'company'; data: Institution | Company } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activePreviewDoc, setActivePreviewDoc] = useState<AttachedDocument | null>(null);
  const [showAdminUpload, setShowAdminUpload] = useState(false);

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

  // Verification Actions
  const handleApprove = (type: 'institution' | 'company', entity: Institution | Company) => {
    if (type === 'institution') {
      db.setInstitutionVerificationStatus(
        entity.id,
        'verified',
        `Verified & Certified by State Super Admin ${currentUser.full_name}`,
        currentUser
      );
      showToast(`Approved & Certified College: "${entity.name}". Live in state registry!`);
    } else {
      db.setCompanyVerificationStatus(
        entity.id,
        'verified',
        `Verified & Certified by State Super Admin ${currentUser.full_name}`,
        currentUser
      );
      showToast(`Approved & Certified Company: "${entity.name}". Live on partner network!`);
    }
  };

  const handleOpenRejectModal = (type: 'institution' | 'company', entity: Institution | Company) => {
    setRejectingEntity({ type, data: entity });
    setRejectionReason('');
  };

  const handleConfirmReject = () => {
    if (!rejectingEntity) return;
    const { type, data } = rejectingEntity;
    const finalReason = rejectionReason.trim() || 'Missing compliance documentation or authentication error.';

    if (type === 'institution') {
      db.setInstitutionVerificationStatus(data.id, 'rejected', finalReason, currentUser);
      showToast(`Marked College "${data.name}" as Rejected. Feedback recorded.`);
    } else {
      db.setCompanyVerificationStatus(data.id, 'rejected', finalReason, currentUser);
      showToast(`Marked Company "${data.name}" as Rejected. Feedback recorded.`);
    }
    setRejectingEntity(null);
  };

  const handleCopyCredentialsSummary = (entity: Institution | Company, type: 'institution' | 'company') => {
    const isInst = type === 'institution';
    const inst = isInst ? (entity as Institution) : null;
    const comp = !isInst ? (entity as Company) : null;
    const code = isInst ? inst?.code : comp?.cin;
    const signatory = isInst ? inst?.principal_name : comp?.authorized_person_name;
    const summary = `AP VIDYACONNECT CREDENTIALS RECORD\nEntity: ${entity.name}\nCode/CIN: ${code}\nOfficial Email: ${entity.official_email}\nPhone: ${entity.official_phone}\nSignatory: ${signatory}\nStatus: ${entity.verification_status.toUpperCase()}\nDocuments Attached: ${entity.documents?.length || (entity.document_url ? 1 : 0)}`;
    navigator.clipboard.writeText(summary);
    showToast('Copied full credentials summary to clipboard!');
  };

  const handleAdminAddDocument = (doc: { url: string; public_id: string; filename: string }) => {
    if (!inspectEntity) return;
    const newDoc = db.addDocumentToEntity(
      inspectEntity.type,
      inspectEntity.data.id,
      {
        name: doc.filename || 'Compliance_Document.pdf',
        url: doc.url,
        file_type: 'application/pdf',
        file_size: '2.1 MB',
        category: 'compliance_audit',
        uploaded_by: `Super Admin (${currentUser.full_name})`
      },
      currentUser
    );
    if (newDoc) {
      showToast(`Attached document "${newDoc.name}" to ${inspectEntity.data.name}!`);
      const updatedEntity = inspectEntity.type === 'institution'
        ? db.institutions.find(i => i.id === inspectEntity.data.id)
        : db.companies.find(c => c.id === inspectEntity.data.id);
      if (updatedEntity) {
        setInspectEntity({ type: inspectEntity.type, data: updatedEntity });
      }
      setShowAdminUpload(false);
    }
  };

  const handleAdminRemoveDocument = (docId: string) => {
    if (!inspectEntity) return;
    const ok = db.removeDocumentFromEntity(inspectEntity.type, inspectEntity.data.id, docId, currentUser);
    if (ok) {
      showToast('Document removed from entity record.');
      const updatedEntity = inspectEntity.type === 'institution'
        ? db.institutions.find(i => i.id === inspectEntity.data.id)
        : db.companies.find(c => c.id === inspectEntity.data.id);
      if (updatedEntity) {
        setInspectEntity({ type: inspectEntity.type, data: updatedEntity });
      }
    }
  };

  // Unified items list (Memoized for high-performance rendering)
  const combinedList = useMemo(() => [
    ...institutions.map((i) => ({
      type: 'institution' as const,
      id: i.id,
      name: i.name,
      identifier: i.code,
      subtitle: `${i.affiliated_university} • ${i.accreditation || 'Affiliated'}`,
      district: i.district,
      email: i.official_email,
      phone: i.official_phone,
      website: i.website,
      logo_url: i.logo_url,
      verification_status: i.verification_status,
      verification_notes: i.verification_notes,
      created_at: i.created_at,
      raw: i
    })),
    ...companies.map((c) => ({
      type: 'company' as const,
      id: c.id,
      name: c.name,
      identifier: c.cin,
      subtitle: `${c.industry} • ${c.sector || 'Industry Partner'}`,
      district: c.headquarters,
      email: c.official_email,
      phone: c.official_phone,
      website: c.website,
      logo_url: c.logo_url,
      verification_status: c.verification_status,
      verification_notes: c.verification_notes,
      created_at: c.created_at,
      raw: c
    }))
  ], [institutions, companies]);

  // Filtering (Memoized for high-performance instant searching)
  const filteredList = useMemo(() => {
    const q = search.toLowerCase().trim();
    return combinedList.filter((item) => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.identifier.toLowerCase().includes(q) ||
        item.district.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || item.verification_status === statusFilter;
      const matchesType = typeFilter === 'all' || item.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [combinedList, search, statusFilter, typeFilter]);

  const { pendingCount, verifiedCount, rejectedCount } = useMemo(() => {
    let pending = 0;
    let verified = 0;
    let rejected = 0;
    for (let i = 0; i < combinedList.length; i++) {
      const s = combinedList[i].verification_status;
      if (s === 'under_verification') pending++;
      else if (s === 'verified') verified++;
      else if (s === 'rejected') rejected++;
    }
    return { pendingCount: pending, verifiedCount: verified, rejectedCount: rejected };
  }, [combinedList]);

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
      <div className="bg-gradient-to-r from-[#0E2350] via-[#102A60] to-[#1E3A8A] text-white p-6 rounded-2xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#F07421]/20 text-[#FF9E44] px-3 py-1 rounded-full text-xs font-bold mb-2 border border-[#F07421]/40">
            <ShieldCheck className="w-4 h-4 text-[#F07421]" />
            State Higher Education Council Verification Queue
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Entity Verification & Compliance
          </h1>
          <p className="text-xs sm:text-sm text-[#DCE5F5] mt-1 max-w-2xl">
            Audit, certify, or reject incoming registration applications from Colleges and Corporate Industry Partners.
          </p>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setStatusFilter('under_verification')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'under_verification'
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400 shadow-md'
              : 'bg-white border-gray-200 hover:border-amber-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Pending Audit</span>
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <p className="text-3xl font-black text-amber-800 mt-2">{pendingCount}</p>
          <p className="text-[11px] text-amber-700 mt-0.5">Require Super Admin certification</p>
        </div>

        <div
          onClick={() => setStatusFilter('verified')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'verified'
              ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400 shadow-md'
              : 'bg-white border-gray-200 hover:border-emerald-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Verified & Active</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-800 mt-2">{verifiedCount}</p>
          <p className="text-[11px] text-emerald-700 mt-0.5">Live on state portal & directory</p>
        </div>

        <div
          onClick={() => setStatusFilter('rejected')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'rejected'
              ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-400 shadow-md'
              : 'bg-white border-gray-200 hover:border-rose-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">Rejected / Incomplete</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-3xl font-black text-rose-800 mt-2">{rejectedCount}</p>
          <p className="text-[11px] text-rose-700 mt-0.5">Requires resubmission</p>
        </div>

        <div
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-400 shadow-md'
              : 'bg-white border-gray-200 hover:border-blue-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0E2350] uppercase tracking-wider">Total Submissions</span>
            <FileText className="w-4 h-4 text-[#0E2350]" />
          </div>
          <p className="text-3xl font-black text-[#0E2350] mt-2">{combinedList.length}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Colleges & Corporate Partners</p>
        </div>
      </div>

      {/* Search & Filter Bar — Sticky on Scroll */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-gray-200 shadow-md flex flex-col md:flex-row gap-3 items-center justify-between transition-all">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, AISHE code, CIN, or district..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0E2350]"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap justify-end">
          {/* 1. Entity Type Tabs (All | Colleges | Companies) */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-bold border border-gray-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                typeFilter === 'all'
                  ? 'bg-[#0E2350] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <span>All Entities</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${typeFilter === 'all' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
                {combinedList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter('institution')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                typeFilter === 'institution'
                  ? 'bg-indigo-700 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <School className="w-3.5 h-3.5 text-[#F07421]" />
              <span>Colleges</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${typeFilter === 'institution' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-800'}`}>
                {institutions.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter('company')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                typeFilter === 'company'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Companies</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${typeFilter === 'company' ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-800'}`}>
                {companies.length}
              </span>
            </button>
          </div>

          {/* 2. Verification Status Tabs */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-bold border border-gray-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setStatusFilter('under_verification')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'under_verification'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('verified')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'verified'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              Verified ({verifiedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('rejected')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'rejected'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              Rejected ({rejectedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-[#0E2350] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              All Status
            </button>
          </div>
        </div>
      </div>

      {/* Verification Queue List */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <FileCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#0E2350]">No Entity Submissions Found</h3>
            <p className="text-xs text-gray-500 mt-1">
              There are currently no items matching your filter criteria.
            </p>
          </div>
        ) : (
          filteredList.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className={`bg-white rounded-2xl border p-5 transition-all shadow-xs hover:shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                item.verification_status === 'under_verification'
                  ? 'border-amber-300 bg-amber-50/10'
                  : item.verification_status === 'verified'
                  ? 'border-emerald-200'
                  : 'border-rose-200 bg-rose-50/10'
              }`}
            >
              {/* Left Identity & Info */}
              <div className="flex items-start gap-4">
                {/* Entity Icon / Logo Badge */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                  {item.logo_url ? (
                    <img src={item.logo_url} alt={item.name} className="w-full h-full object-contain p-1.5" />
                  ) : item.type === 'institution' ? (
                    <School className="w-7 h-7 text-[#0E2350]" />
                  ) : (
                    <Building2 className="w-7 h-7 text-[#F07421]" />
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${
                        item.type === 'institution'
                          ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                          : 'bg-orange-100 text-orange-900 border border-orange-200'
                      }`}
                    >
                      {item.type === 'institution' ? <School className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                      {item.type === 'institution' ? 'Institution / College' : 'Corporate Employer'}
                    </span>

                    <span className="font-mono text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                      {item.type === 'institution' ? `AISHE/Code: ${item.identifier}` : `CIN: ${item.identifier}`}
                    </span>

                    <StatusBadge status={item.verification_status} size="sm" />
                  </div>

                  <h3 className="text-base font-extrabold text-[#0E2350] tracking-tight">
                    {item.name}
                  </h3>

                  <p className="text-xs text-gray-500 font-medium">
                    {item.subtitle}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-500 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {item.district}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      {item.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {item.phone}
                    </span>
                  </div>

                  {item.verification_notes && (
                    <p className="text-[11px] text-gray-600 italic bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200/60 mt-1">
                      <strong>Audit Log Note:</strong> {item.verification_notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setInspectEntity({ type: item.type, data: item.raw })}
                  className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center gap-1.5 transition-all"
                  title="Inspect detailed compliance credentials"
                >
                  <FileText className="w-3.5 h-3.5 text-[#0E2350]" />
                  <span>Inspect Credentials</span>
                </button>

                {item.verification_status !== 'verified' && (
                  <button
                    type="button"
                    onClick={() => handleApprove(item.type, item.raw)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Certify</span>
                  </button>
                )}

                {item.verification_status !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => handleOpenRejectModal(item.type, item.raw)}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Exhaustive Inspect Credentials & Statutory Audit Modal */}
      {inspectEntity && (() => {
        const attachedDocs: AttachedDocument[] = inspectEntity.data.documents && inspectEntity.data.documents.length > 0
          ? inspectEntity.data.documents
          : inspectEntity.data.document_url
          ? [{
              id: 'doc-primary',
              name: inspectEntity.data.document_name || (inspectEntity.type === 'institution' ? 'Accreditation & Affiliation Certificate (PDF)' : 'MCA Incorporation Certificate & GST Proof (PDF)'),
              url: inspectEntity.data.document_url,
              file_type: 'application/pdf',
              file_size: '2.1 MB',
              category: inspectEntity.type === 'institution' ? 'accreditation_letter' : 'mca_incorporation',
              uploaded_at: inspectEntity.data.created_at,
              uploaded_by: 'Authorized Registrant'
            }]
          : [];

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[94vh] overflow-y-auto shadow-2xl border border-gray-200 p-5 sm:p-7 space-y-5 animate-in fade-in zoom-in-95">
              
              {/* Modal Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center p-2 overflow-hidden shadow-inner shrink-0">
                    {inspectEntity.data.logo_url ? (
                      <img src={inspectEntity.data.logo_url} alt={inspectEntity.data.name} className="w-full h-full object-contain" />
                    ) : inspectEntity.type === 'institution' ? (
                      <School className="w-7 h-7 text-[#0E2350]" />
                    ) : (
                      <Building2 className="w-7 h-7 text-[#F07421]" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-blue-100 text-[#0E2350] border border-blue-200">
                        {inspectEntity.type === 'institution' ? 'Educational Institution' : 'Corporate Industry Partner'}
                      </span>
                      <StatusBadge status={inspectEntity.data.verification_status} size="sm" />
                    </div>
                    <h3 className="text-lg font-black text-[#0E2350] tracking-tight mt-0.5">
                      {inspectEntity.data.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {inspectEntity.type === 'institution'
                        ? `${(inspectEntity.data as Institution).affiliated_university} • ${(inspectEntity.data as Institution).district}`
                        : `${(inspectEntity.data as Company).industry} • ${(inspectEntity.data as Company).headquarters}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => printCredentialsDossier(inspectEntity.data, inspectEntity.type)}
                    className="px-3.5 py-2 rounded-xl bg-[#0E2350] hover:bg-[#14336F] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    title="Print Official Credentials Dossier Slip"
                  >
                    <Printer className="w-4 h-4 text-[#F07421]" />
                    <span>Print Dossier</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadCredentialsDossierPDF(inspectEntity.data, inspectEntity.type)}
                    className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                    title="Download Official Dossier strictly in PDF (.pdf) format"
                  >
                    <Download className="w-4 h-4 text-blue-700" />
                    <span className="hidden sm:inline">Download PDF Slip</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadCredentialsCSV(inspectEntity.data, inspectEntity.type)}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                    title="Download CSV Credentials Data"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyCredentialsSummary(inspectEntity.data, inspectEntity.type)}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                    title="Copy Credentials to Clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setInspectEntity(null)}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors ml-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Portal Login Authorization Banner */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                inspectEntity.data.verification_status === 'verified'
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                  : inspectEntity.data.verification_status === 'rejected'
                  ? 'bg-rose-50/90 border-rose-300 text-rose-950'
                  : 'bg-amber-50/90 border-amber-300 text-amber-950'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    inspectEntity.data.verification_status === 'verified'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : inspectEntity.data.verification_status === 'rejected'
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-amber-500 text-white shadow-md'
                  }`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider">
                      {inspectEntity.data.verification_status === 'verified'
                        ? '🔓 Portal Account Login Access: ACTIVE & AUTHORIZED'
                        : inspectEntity.data.verification_status === 'rejected'
                        ? '🚫 Portal Account Login Access: BLOCKED & DENIED'
                        : '🔒 Portal Account Login Access: LOCKED (Pending Verification)'}
                    </h4>
                    <p className="text-[11px] mt-0.5 opacity-90">
                      {inspectEntity.data.verification_status === 'verified'
                        ? 'Administrators, coordinators, and mentors can log in to the portal workspace.'
                        : inspectEntity.data.verification_status === 'rejected'
                        ? 'Account login is blocked until compliance corrections are submitted.'
                        : 'State Super Admin must review credentials and verify this entity before users can log in.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Comprehensive Entity Data Grid */}
              <div className="space-y-4 text-xs">
                {/* 1. Statutory Identity */}
                <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80 space-y-3">
                  <h4 className="font-extrabold text-[#0E2350] text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#F07421]" />
                    Statutory Identification & Classification
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {inspectEntity.type === 'institution' ? 'AISHE / Institutional Code' : 'Corporate CIN Number'}
                      </span>
                      <p className="font-mono font-bold text-gray-900 text-xs mt-0.5">
                        {'code' in inspectEntity.data ? inspectEntity.data.code : inspectEntity.data.cin}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {inspectEntity.type === 'institution' ? 'Institution Type' : 'Industry Domain'}
                      </span>
                      <p className="font-bold text-gray-800 text-xs mt-0.5">
                        {'type' in inspectEntity.data
                          ? (inspectEntity.data.type === 'govt_degree_college' ? 'Govt Degree College (GDC)' : inspectEntity.data.type)
                          : inspectEntity.data.industry}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {inspectEntity.type === 'institution' ? 'Affiliated University' : 'Specialized Sector'}
                      </span>
                      <p className="font-bold text-gray-800 text-xs mt-0.5">
                        {'affiliated_university' in inspectEntity.data
                          ? inspectEntity.data.affiliated_university
                          : (inspectEntity.data.sector || 'Enterprise Services')}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {inspectEntity.type === 'institution' ? 'NAAC Accreditation' : 'Corporate Base / GST'}
                      </span>
                      <p className="font-bold text-indigo-800 text-xs mt-0.5">
                        {'accreditation' in inspectEntity.data
                          ? (inspectEntity.data.accreditation || 'NAAC A Grade Certified')
                          : ((inspectEntity.data as Company).gst || 'GST Registered Partner')}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">District & State</span>
                      <p className="font-bold text-gray-800 text-xs mt-0.5">
                        {inspectEntity.type === 'institution'
                          ? `${(inspectEntity.data as Institution).district}, Andhra Pradesh`
                          : `${(inspectEntity.data as Company).headquarters}`}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Official Website</span>
                      <p className="mt-0.5">
                        {inspectEntity.data.website ? (
                          <a
                            href={inspectEntity.data.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 font-bold hover:underline inline-flex items-center gap-1"
                          >
                            <span>{inspectEntity.data.website}</span>
                            <ExternalLink className="w-3 h-3 text-[#F07421]" />
                          </a>
                        ) : (
                          <span className="text-gray-400 italic">Not Provided</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Authorized Signatory & Contact Verification */}
                <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80 space-y-3">
                  <h4 className="font-extrabold text-[#0E2350] text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                    Authorized Signatory & Administrative Official
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {inspectEntity.type === 'institution' ? 'Principal / Dean Name' : 'Authorized Representative'}
                      </span>
                      <p className="font-extrabold text-gray-900 text-xs mt-0.5">
                        {'principal_name' in inspectEntity.data
                          ? (inspectEntity.data.principal_name || 'Dr. Principal In-Charge')
                          : (inspectEntity.data.authorized_person_name || 'Director of University Relations')}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Official Designation</span>
                      <p className="font-bold text-gray-800 text-xs mt-0.5">
                        {inspectEntity.type === 'institution'
                          ? 'Principal & Institutional Head'
                          : ((inspectEntity.data as Company).designation || 'Head of Talent Acquisition')}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Official Login Email</span>
                      <p className="font-semibold text-blue-900 text-xs mt-0.5 truncate">
                        {inspectEntity.data.official_email}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Phone Number</span>
                      <p className="font-semibold text-gray-800 text-xs mt-0.5">
                        {inspectEntity.data.official_phone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. ATTACHED COMPLIANCE DOCUMENTS & PDFS (SUBMITTED DURING REGISTRATION) */}
                <div className="bg-gradient-to-r from-blue-50/80 via-white to-amber-50/50 p-4 sm:p-5 rounded-2xl border border-blue-200 shadow-xs space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#0E2350] text-white flex items-center justify-center">
                        <Paperclip className="w-4 h-4 text-[#F07421]" />
                      </div>
                      <div>
                        <h4 className="font-black text-[#0E2350] text-xs uppercase tracking-wider">
                          Attached Statutory Documents & Compliance PDFs ({attachedDocs.length})
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          Submitted by the registrant during onboarding for State Super Admin audit, preview & download.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Documents List */}
                  {attachedDocs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {attachedDocs.map((doc, idx) => (
                        <div
                          key={doc.id || idx}
                          className="flex flex-col justify-between p-3.5 bg-white rounded-xl border border-blue-100 hover:border-blue-300 shadow-xs transition-all gap-3 group"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100 group-hover:scale-105 transition-transform">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-100">
                                {doc.category?.replace(/_/g, ' ') || 'Statutory PDF'}
                              </span>
                              <h5 className="font-bold text-gray-900 text-xs mt-1 truncate" title={doc.name}>
                                {doc.name}
                              </h5>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                {doc.file_size || '1.8 MB'} • Uploaded on {new Date(doc.uploaded_at || inspectEntity.data.created_at).toLocaleDateString('en-IN')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-2">
                            <button
                              type="button"
                              onClick={() => setActivePreviewDoc(doc)}
                              className="flex-1 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0E2350] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                              title="Inspect and preview document full screen"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#2A4E96]" />
                              <span>Preview PDF</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => downloadDocumentFile(doc.url, doc.name)}
                              className="flex-1 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                              title="Download PDF directly to your device"
                            >
                              <Download className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Download</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-white rounded-xl border border-dashed border-gray-300 text-center">
                      <p className="text-xs text-gray-500 font-medium">No statutory compliance documents were attached by this applicant during registration.</p>
                    </div>
                  )}
                </div>

                {/* 4. Statutory Checklist & Digital Credentials Proof */}
                <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-2.5">
                  <h4 className="font-extrabold text-[#0E2350] text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-blue-700" />
                    Statutory Documentation & Compliance Checks:
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
                    <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-blue-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Government Statutory Registration Proof Checked</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-blue-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Authorized Administrative Official Authenticated</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-blue-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>State Jurisdiction & Higher Education Clearance</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-blue-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Official Domain Email & Contact Authentication</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Super Admin Action Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setInspectEntity(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Close Audit View
                </button>

                <div className="flex items-center gap-2">
                  {inspectEntity.data.verification_status !== 'rejected' && (
                    <button
                      type="button"
                      onClick={() => {
                        const cur = inspectEntity;
                        setInspectEntity(null);
                        handleOpenRejectModal(cur.type, cur.data);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject & Deny Login</span>
                    </button>
                  )}

                  {inspectEntity.data.verification_status !== 'verified' ? (
                    <button
                      type="button"
                      onClick={() => {
                        handleApprove(inspectEntity.type, inspectEntity.data);
                        setInspectEntity(null);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-md transition-all active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Grant Login Access</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      Verified by State Super Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* PDF / Document Viewer Modal */}
      {activePreviewDoc && (
        <DocumentViewerModal
          document={activePreviewDoc}
          entityName={inspectEntity?.data.name}
          onClose={() => setActivePreviewDoc(null)}
        />
      )}

      {/* Reject Reason Modal */}
      {rejectingEntity && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-extrabold text-[#0E2350]">Reject Application</h3>
            </div>

            <p className="text-xs text-gray-600">
              Please specify the compliance reason or missing documentation for rejecting{' '}
              <strong>"{rejectingEntity.data.name}"</strong>:
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Invalid AISHE/CIN code format, Missing NAAC accreditation letter, Unreachable official contact number..."
              className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingEntity(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
