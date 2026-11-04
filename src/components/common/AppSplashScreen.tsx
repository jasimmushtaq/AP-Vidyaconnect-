// ============================================================================
// PIXELWIND TECHNOLOGIES — MOBILE APK STARTUP ANIMATED SPLASH SCREEN
// Displays animated PixelWind Technologies branding & logo on APK launch
// ============================================================================

import React, { useState, useEffect } from 'react';
import { ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';

interface AppSplashScreenProps {
  onComplete: () => void;
  onStartExit?: () => void;
  logoUrl?: string;
  duration?: number; // total animation time in ms before exit
}

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({
  onComplete,
  onStartExit,
  logoUrl = '/brand/pixelwind-logo.png',
  duration = 2500,
}) => {
  const effectiveDuration = (() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const customDur = params.get('splash_duration');
      if (customDur) return parseInt(customDur, 10);
      if (params.get('splash') === 'hold') return 60000;
    }
    return duration;
  })();

  const [phase, setPhase] = useState<number>(1);
  const [progress, setProgress] = useState<number>(10);
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Initializing PixelWind Technologies...');

  useEffect(() => {
    // Phase 2: Shimmer beam & ecosystem connecting (750ms)
    const tPhase2 = setTimeout(() => {
      setPhase(2);
      setStatusMessage('Connecting Education with Industry...');
    }, 750);

    // Phase 3: Final state & welcome (1700ms)
    const tPhase3 = setTimeout(() => {
      setPhase(3);
      setStatusMessage('Welcome to PixelWind Technologies');
    }, 1600);

    // Progress bar animation step
    const interval = 25; // 25ms steps
    const totalSteps = effectiveDuration / interval;
    let step = Math.round(totalSteps * 0.1);
    const progressTimer = setInterval(() => {
      step++;
      const currentProgress = Math.min(100, Math.round((step / totalSteps) * 100));
      setProgress(currentProgress);
      if (step >= totalSteps) {
        clearInterval(progressTimer);
      }
    }, interval);

    // Exit transition sequence
    const tExit = setTimeout(() => {
      setIsExiting(true);
      if (onStartExit) onStartExit();
      // Give 500ms for smooth exit fade and scale before unmounting
      const tComplete = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(tComplete);
    }, effectiveDuration);

    return () => {
      clearTimeout(tPhase2);
      clearTimeout(tPhase3);
      clearTimeout(tExit);
      clearInterval(progressTimer);
    };
  }, [effectiveDuration, onComplete, onStartExit]);

  const handleSkip = () => {
    setIsExiting(true);
    if (onStartExit) onStartExit();
    setTimeout(() => {
      onComplete();
    }, 250);
  };

  return (
    <div
      id="pixelwind-apk-splash"
      className={`fixed inset-0 z-[9999999] flex flex-col items-center justify-between select-none overflow-hidden transition-all duration-500 ease-out ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at 50% 35%, #FFFFFF 0%, #F0F6FE 55%, #E2EDFC 100%)',
      }}
    >
      {/* Dynamic Ambient Background Glow Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Navy/Sky Blue Radial Aura */}
        <div
          className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-blue-500/15 blur-3xl transition-all duration-1000 ${
            phase >= 1 ? 'scale-125 opacity-100' : 'scale-75 opacity-0'
          }`}
        />
        {/* Soft Orange Radiant Glow */}
        <div
          className={`absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full bg-[#FF6500]/15 blur-3xl transition-all duration-1000 delay-200 ${
            phase >= 1 ? 'scale-110 opacity-100' : 'scale-50 opacity-0'
          }`}
        />
      </div>

      {/* Top Header Bar: Ecosystem Badge & Quick Skip */}
      <div className="w-full max-w-md px-6 pt-10 sm:pt-12 flex items-center justify-between z-10">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-slate-200/80 shadow-xs backdrop-blur-md transition-all duration-700 ${
            phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#FF6500] animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-[#0B1F46]" />
            <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#0B1F46] uppercase">
            Campus-to-Career Ecosystem
          </span>
        </div>

        {/* Skip button for instant entry */}
        <button
          type="button"
          onClick={handleSkip}
          className={`group inline-flex items-center gap-1 px-3 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 bg-white/80 hover:bg-white border border-slate-200/80 rounded-full shadow-xs transition-all duration-500 cursor-pointer ${
            phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
          title="Skip animation and enter app"
        >
          <span>Skip</span>
          <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Center Hero: PixelWind Technologies Logo & Branding */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 z-10 w-full max-w-md my-auto">
        <div className="relative flex flex-col items-center text-center">
          {/* Logo Card with 3D Pop, Glass Backplate */}
          <div
            className={`relative p-6 sm:p-8 rounded-3xl transition-all duration-700 ease-out transform ${
              phase >= 1
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-75 translate-y-6'
            }`}
          >
            {/* Soft backdrop blur plate */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-[0_20px_50px_rgba(11,31,70,0.1)] pointer-events-none" />

            {/* PixelWind Technologies Logo */}
            <div className="relative overflow-hidden rounded-2xl flex items-center justify-center p-3">
              <img
                src={logoUrl}
                alt="PixelWind Technologies"
                className={`w-64 h-auto max-h-24 sm:max-h-28 object-contain filter drop-shadow-sm transition-transform duration-1000 ease-out ${
                  phase >= 2 ? 'scale-105' : 'scale-100'
                }`}
              />
            </div>
          </div>

          {/* Subtitle / Ecosystem Lockup */}
          <div
            className={`mt-4 text-center transition-all duration-700 delay-100 ${
              phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF5EB] border border-[#FF6500]/30 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6500] animate-spin" style={{ animationDuration: '4s' }} />
              <span className="text-xs font-bold text-[#0B1F46] tracking-wide">
                Connecting Education with Industry
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600 max-w-xs mx-auto leading-relaxed">
              Institutional Collaboration & Verified Internship Platform
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer: Dynamic Status Ticker & Progress Bar */}
      <div className="w-full max-w-md px-6 pb-10 sm:pb-12 flex flex-col items-center z-10 space-y-4">
        {/* Dynamic Status Text */}
        <div
          className={`flex items-center gap-2 text-xs font-medium text-slate-600 transition-all duration-500 ${
            phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF6500] animate-ping" />
          <span className="font-semibold text-[#0B1F46]">{statusMessage}</span>
        </div>

        {/* Navy to Orange Loading Bar */}
        <div className="w-56 sm:w-64 h-2 bg-slate-200/80 rounded-full p-0.5 overflow-hidden shadow-inner border border-slate-300/40">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#0B1F46] via-[#2563EB] to-[#FF6500] transition-all duration-75 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/90 rounded-full shadow-sm" />
          </div>
        </div>

        {/* Security & Official Accreditation Badge */}
        <div
          className={`flex items-center gap-1.5 text-[11px] text-slate-500 transition-all duration-700 delay-200 ${
            phase >= 1 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Powered by PixelWind Technologies</span>
        </div>
      </div>
    </div>
  );
};
