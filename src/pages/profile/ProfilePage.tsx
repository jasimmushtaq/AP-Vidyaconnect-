// ============================================================================
// AP VIDYACONNECT — USER & INSTITUTION/COMPANY PROFILE MANAGEMENT
// ============================================================================

import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  User,
  School,
  Building2,
  GraduationCap,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Clock,
  Sparkles,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Camera,
  Upload
} from 'lucide-react';


export const ProfilePage: React.FC = () => {
  const {
    currentUser,
    currentRole,
    currentInstitution,
    currentCompany,
    currentStudent,
    updateProfile,
    updateInstitution,
    updateCompany,
    changePassword,
    logout
  } = useAuth();

  // User details state
  const [userName, setUserName] = useState(currentUser?.full_name || '');
  const [userPhone, setUserPhone] = useState(currentUser?.phone || '');

  // Institution details state
  const [instName, setInstName] = useState(currentInstitution?.name || '');
  const [instAddress, setInstAddress] = useState(currentInstitution?.address || '');
  const [instPrincipal, setInstPrincipal] = useState(currentInstitution?.principal_name || '');
  const [instPhone, setInstPhone] = useState(currentInstitution?.official_phone || '');
  const [instWebsite, setInstWebsite] = useState(currentInstitution?.website || '');

  // Company details state
  const [compName, setCompName] = useState(currentCompany?.name || '');
  const [compHQ, setCompHQ] = useState(currentCompany?.headquarters || '');
  const [compContact, setCompContact] = useState(currentCompany?.authorized_person_name || '');
  const [compPhone, setCompPhone] = useState(currentCompany?.official_phone || '');
  const [compWebsite, setCompWebsite] = useState(currentCompany?.website || '');

  // Security & Password state
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    if (currentUser) {
      setUserName(currentUser.full_name || '');
      setUserPhone(currentUser.phone || '');
    }
    if (currentInstitution) {
      setInstName(currentInstitution.name || '');
      setInstAddress(currentInstitution.address || '');
      setInstPrincipal(currentInstitution.principal_name || '');
      setInstPhone(currentInstitution.official_phone || '');
      setInstWebsite(currentInstitution.website || '');
    }
    if (currentCompany) {
      setCompName(currentCompany.name || '');
      setCompHQ(currentCompany.headquarters || '');
      setCompContact(currentCompany.authorized_person_name || '');
      setCompPhone(currentCompany.official_phone || '');
      setCompWebsite(currentCompany.website || '');
    }
  }, [currentUser, currentInstitution, currentCompany]);

  if (!currentUser) {
    return (
      <div className="bg-white rounded-xl border border-[#E3E6EB] p-12 text-center text-gray-500 text-xs">
        Please log in to view and manage your profile.
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      full_name: userName,
      phone: userPhone,
    });

    if (currentInstitution) {
      updateInstitution({
        name: instName,
        address: instAddress,
        principal_name: instPrincipal,
        official_phone: instPhone,
        website: instWebsite,
      });
    }

    if (currentCompany) {
      updateCompany({
        name: compName,
        headquarters: compHQ,
        authorized_person_name: compContact,
        official_phone: compPhone,
        website: compWebsite,
      });
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (newPwd.length < 6) {
      setPwdError('New password must be at least 6 characters long.');
      return;
    }

    if (newPwd !== confirmPwd) {
      setPwdError('New password and confirm password do not match.');
      return;
    }

    const res = changePassword(currentPwd, newPwd);
    if (res.success) {
      setPwdSuccess('Your password has been changed successfully!');
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      setTimeout(() => setPwdSuccess(null), 6000);
    } else {
      setPwdError(res.message || 'Failed to update password.');
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo size should be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      updateProfile({ avatar_url: base64 });
    };
    reader.readAsDataURL(file);
  };

  const userInitials = (currentUser.full_name || 'U')
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const userAvatar = (currentUser.avatar_url && !currentUser.avatar_url.includes('1539571696357-5a69c17a67c6'))
    ? currentUser.avatar_url
    : '';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hidden File Input for Avatar */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handlePhotoUpload}
      />

      {/* 1. TOP HERO BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A1938] via-[#0E2350] to-[#163673] border border-blue-900/40 p-6 sm:p-8 shadow-xl text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div
              className="relative group cursor-pointer shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[#F07421] shadow-md"
              onClick={() => fileInputRef.current?.click()}
              title="Click to change profile picture"
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={currentUser.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-[#0A1938] to-[#1E3A8A] flex flex-col items-center justify-center text-white">
                  <span className="text-xl font-black text-amber-300 font-mono">{userInitials}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera className="w-5 h-5 text-amber-300" />
              </div>
              <span className="absolute bottom-1 right-1 p-1 bg-[#F07421] text-white rounded-lg shadow-xs">
                <Camera className="w-3 h-3" />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">{currentUser.full_name}</h1>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200">
                  {currentUser.role.replace('_', ' ')}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> Verified Account
                </span>
              </div>
              <p className="text-xs text-blue-200/90 font-medium">{currentUser.email}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-extrabold text-[#F07421] hover:text-orange-400 flex items-center gap-1 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" /> Update Profile Photo
              </button>
            </div>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-400/30 text-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-auto active:scale-95 shadow-2xs"
          >
            <LogOut className="w-4 h-4 text-rose-300" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Personal Details */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-9 h-9 rounded-xl bg-[#0E2350] text-[#F07421] flex items-center justify-center shadow-xs">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#0E2350]">Personal & Account Profile</h3>
              <p className="text-[11px] text-slate-400 font-medium">Manage your personal identification and login credentials</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-1.5">Full Legal Name</label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E2350] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-1.5">Email Address (Login ID)</label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-1.5">Primary Phone Number</label>
              <input
                type="tel"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E2350] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-1.5">Assigned System Role</label>
              <input
                type="text"
                disabled
                value={currentUser.role.toUpperCase()}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Student Academic & Internship Info */}
        {currentRole === 'student' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2A4E96] flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#0E2350]">Student Academic & Verified Enrollment Details</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Higher Education academic track records</p>
                </div>
              </div>
              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                Verified Candidate
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-1.5">Enrolled Institution</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold">
                  {currentInstitution?.name || 'Government Degree College'}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-1.5">Academic Department / Year</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold">
                  Computer Science & Engineering • Year {currentStudent?.year_of_study || 3}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-1.5">Enrollment / Roll Number</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold">
                  {currentStudent?.roll_number || 'AP-2026-05A4'}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-1.5">Account Activation Status</label>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-extrabold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Activated & Active
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Linked College Profile (For Institution Admins / Faculty only) */}
        {(currentRole === 'institution_admin' || currentRole === 'faculty_coordinator') && currentInstitution && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0E2350] text-[#F07421] flex items-center justify-center shadow-xs">
                  <School className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#0E2350]">
                    Institutional Affiliation ({currentInstitution.code})
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">State accredited college profile & official contact details</p>
                </div>
              </div>
              <StatusBadge status={currentInstitution.verification_status} size="sm" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-1.5">College Name</label>
                <input
                  type="text"
                  required
                  value={instName}
                  onChange={(e) => setInstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E2350] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-1.5">Affiliated University / Board</label>
                <input
                  type="text"
                  disabled
                  value={currentInstitution.affiliated_university}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-1.5">Principal / Head of College</label>
                <input
                  type="text"
                  required
                  value={instPrincipal}
                  onChange={(e) => setInstPrincipal(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E2350] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-1.5">Official Telephone</label>
                <input
                  type="text"
                  value={instPhone}
                  onChange={(e) => setInstPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E2350] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-1.5">Campus Address</label>
                <input
                  type="text"
                  value={instAddress}
                  onChange={(e) => setInstAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E2350] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-1.5">Institutional Website</label>
                <input
                  type="text"
                  value={instWebsite}
                  onChange={(e) => setInstWebsite(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E2350] focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Linked Company Profile */}
        {currentCompany && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 rounded-xl bg-[#0E2350] text-[#F07421] flex items-center justify-center shadow-xs">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#0E2350]">
                  Corporate Partner Profile (CIN: {currentCompany.cin})
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">Industry partner identity and corporate headquarters</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-1.5">Company Legal Name</label>
                <input
                  type="text"
                  required
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E2350] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-1.5">Industry & Sector</label>
                <input
                  type="text"
                  disabled
                  value={`${currentCompany.industry} • ${currentCompany.sector}`}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-1.5">Authorized Representative</label>
                <input
                  type="text"
                  required
                  value={compContact}
                  onChange={(e) => setCompContact(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E2350] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-1.5">Corporate Phone</label>
                <input
                  type="text"
                  value={compPhone}
                  onChange={(e) => setCompPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E2350] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-1.5">Headquarters Location</label>
                <input
                  type="text"
                  value={compHQ}
                  onChange={(e) => setCompHQ(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E2350] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-1.5">Corporate Website</label>
                <input
                  type="text"
                  value={compWebsite}
                  onChange={(e) => setCompWebsite(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E2350] focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Button & Confirmation Banner */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-4 py-2 rounded-xl flex items-center gap-2 border border-emerald-200 shadow-xs animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Profile changes saved successfully!
            </span>
          ) : <div />}

          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-[#0A1938] to-[#1E3A8A] hover:from-[#0E2350] hover:to-[#2A4E96] text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-2 active:scale-95 border border-blue-900/30"
          >
            <Save className="w-4 h-4 text-[#F07421]" />
            <span>Save Profile Updates</span>
          </button>
        </div>
      </form>

      {/* SECURITY & CHANGE PASSWORD SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F07421] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#0E2350]">Security & Account Password Management</h3>
              <p className="text-[11px] text-slate-400 font-medium">Update and protect your portal login credentials</p>
            </div>
          </div>
          {currentRole === 'super_admin' && (
            <span className="text-[10px] bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full font-bold border border-purple-200">
              Default: pixelwind@2005
            </span>
          )}
        </div>

        {pwdSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{pwdSuccess}</span>
          </div>
        )}

        {pwdError && (
          <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{pwdError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-1.5">Current Password</label>
              <input
                type={showPwd ? 'text' : 'password'}
                required
                placeholder="Enter current password"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E2350] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-1.5">New Password</label>
              <input
                type={showPwd ? 'text' : 'password'}
                required
                placeholder="Min 6 characters"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E2350] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-1.5">Confirm New Password</label>
              <input
                type={showPwd ? 'text' : 'password'}
                required
                placeholder="Repeat new password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E2350] focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="text-slate-500 hover:text-slate-800 font-semibold text-[11px] flex items-center gap-1.5 self-start transition-colors"
            >
              {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPwd ? 'Hide Passwords' : 'Show Passwords'}</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-[#F07421] to-orange-600 hover:from-[#D96214] text-white rounded-xl font-black text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Update Account Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
