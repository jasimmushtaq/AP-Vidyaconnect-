// ============================================================================
// AP VIDYACONNECT — FIRST LOGIN PASSWORD CHANGE PAGE
// Item 4: Mandatory security password setup for activated student accounts
// ============================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../../components/common/BrandLogo';
import {
  Lock,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';

export const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, currentStudent, changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Your new password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation password do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = changePassword(currentPassword, newPassword);
      if (res.success) {
        // Redirect to Student Dashboard
        navigate('/dashboard', { replace: true });
      } else {
        setError(res.message || 'Failed to update password.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <BrandLogo variant="stacked" size={190} />
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#F07421] bg-[#FFF3EA] px-3 py-1 rounded-full border border-[#F07421]/20">
            <ShieldCheck className="w-3.5 h-3.5" /> First-Time Login Security Setup
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#0E2350] mt-1">
            Create Your New Password
          </h1>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Welcome to AP VidyaConnect, <strong>{currentUser.full_name}</strong>. Please change your temporary password to secure your student account.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E3E6EB] p-6 sm:p-8 shadow-sm space-y-5 text-xs text-left">
          <div className="bg-[#EEF2FA] border border-[#2A4E96]/20 p-3 rounded-xl text-[11px] text-[#0E2350] space-y-0.5 font-semibold">
            <p className="font-bold">Student Account Security Protocol</p>
            <p className="text-gray-600 font-normal">
              You must set a personal permanent password before accessing your internship workspace and attendance records.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">
                Temporary / Current Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter temporary password from email"
                  className="w-full pl-9 pr-10 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E2350]"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">
                New Secure Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full pl-9 pr-10 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E2350]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-9 pr-10 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E2350]"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#F07421] hover:bg-[#D96214] disabled:opacity-50 text-white rounded-lg font-extrabold shadow transition-all flex items-center justify-center gap-2 mt-3"
            >
              <span>{loading ? 'Securing Account...' : 'Set Password & Enter Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
