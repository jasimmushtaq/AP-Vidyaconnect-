// ============================================================================
// AP VIDYACONNECT — LOGIN PAGE
// ============================================================================

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../../components/common/BrandLogo';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoggingIn(true);

    try {
      const res = await loginWithEmail(email, password);
      if (res.success && res.user) {
        if (res.requirePasswordChange) {
          navigate('/change-password', { replace: true });
        } else {
          // Immediately navigate to the user's verified database role dashboard
          const role = res.role || res.user.role;
          switch (role) {
            case 'company_admin':
            case 'mentor':
              navigate('/company/dashboard', { replace: true });
              break;
            case 'institution_admin':
            case 'faculty_coordinator':
              navigate('/institution/dashboard', { replace: true });
              break;
            case 'student':
              navigate('/student/dashboard', { replace: true });
              break;
            case 'super_admin':
              navigate('/admin/dashboard', { replace: true });
              break;
            default:
              navigate('/dashboard', { replace: true });
              break;
          }
        }
      } else {
        setError(res.message || 'Invalid email or password.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your network connection.');
    } finally {
      setIsLoggingIn(false);
    }
  };


  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSent(true);
    setTimeout(() => {
      setForgotSent(false);
      setShowForgotModal(false);
    }, 2800);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-2">
          <BrandLogo variant="stacked" size={200} />
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0E2350]">
          Sign In to AP VidyaConnect
        </h1>
        <p className="text-xs text-gray-500">
          Enter your official institutional, corporate or student login credentials.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E3E6EB] p-6 sm:p-8 shadow-sm space-y-5">
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1">Official Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. principal@college.gov.in"
                className="w-full pl-9 pr-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E2350]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-gray-700 uppercase">Password</label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setShowForgotModal(true);
                }}
                className="text-[11px] font-bold text-[#F07421] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E2350]"
              />
            </div>
          </div>

          {error && (
            <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              error.includes('Under Verification')
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
              <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${
                error.includes('Under Verification') ? 'text-amber-600' : 'text-rose-600'
              }`} />
              <div className="space-y-1">
                <span className="font-bold block">{error.includes('Under Verification') ? 'Verification Pending Review' : 'Access Restricted'}</span>
                <span className="leading-relaxed block">{error}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-2.5 bg-[#0E2350] hover:bg-[#14336F] disabled:opacity-60 text-white rounded-lg font-bold shadow transition-all flex items-center justify-center gap-2 mt-2"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 text-white animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Platform</span>
                <ArrowRight className="w-4 h-4 text-[#F07421]" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            Don't have an institutional account?{' '}
            <Link to="/register" className="text-[#0E2350] font-bold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-[#07132c]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF3EA] text-[#F07421] flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#0E2350]">Reset Password</h3>
                <p className="text-xs text-gray-500">Receive an official password reset link via email.</p>
              </div>
            </div>

            {forgotSent ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Password reset link dispatched to <strong>{forgotEmail}</strong>. Please check your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Registered Email</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your registered login email"
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E2350]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#F07421] hover:bg-[#D96214] text-white font-bold shadow"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
