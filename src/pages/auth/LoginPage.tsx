// ============================================================================
// AP VIDYACONNECT — LOGIN PAGE
// Real-time validation, password toggle & clean credentials flow
// ============================================================================

import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../../components/common/BrandLogo';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

const isValidEmail = (val: string): boolean => {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val.trim());
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  // Field-level validation errors
  const emailError = useMemo(() => {
    if (!touched.email) return null;
    const clean = email.trim();
    if (!clean) return 'Official email address or student roll number is required';
    if (clean.includes('@') && !isValidEmail(clean)) {
      return 'Please enter a valid email address (e.g. name@domain.com)';
    }
    if (!clean.includes('@') && clean.length < 3) {
      return 'Student roll number must be at least 3 characters';
    }
    return null;
  }, [email, touched.email]);

  const passwordError = useMemo(() => {
    if (!touched.password) return null;
    if (!password) return 'Password is required to sign in';
    if (password.length < 4) return 'Password must be at least 4 characters';
    return null;
  }, [password, touched.password]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your official email or student roll number.');
      return;
    }
    if (cleanEmail.includes('@') && !isValidEmail(cleanEmail)) {
      setError('Please enter a valid email address format (e.g. principal@college.gov.in).');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoggingIn(true);

    try {
      const res = await loginWithEmail(cleanEmail, password);
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
            case 'college_admin':
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
        <form onSubmit={handleLogin} className="space-y-4 text-xs" noValidate>
          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1">
              Official Email Address or Roll Number <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                autoComplete="username"
                value={email}
                onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. principal@college.gov.in or 2023-CS-492"
                className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none transition-colors ${
                  emailError
                    ? 'bg-rose-50/30 border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400'
                    : 'bg-[#F6F7F9] border-[#E3E6EB] focus:ring-2 focus:ring-[#0E2350]'
                }`}
              />
            </div>
            {emailError && (
              <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{emailError}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1">
              Password <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="••••••••"
                className={`w-full pl-9 pr-10 py-2 border rounded-lg focus:outline-none transition-colors ${
                  passwordError
                    ? 'bg-rose-50/30 border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400'
                    : 'bg-[#F6F7F9] border-[#E3E6EB] focus:ring-2 focus:ring-[#0E2350]'
                }`}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordError && (
              <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{passwordError}</span>
              </p>
            )}
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
            className="w-full py-2.5 bg-[#0E2350] hover:bg-[#14336F] disabled:opacity-60 text-white rounded-lg font-bold shadow transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
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
    </div>
  );
};
