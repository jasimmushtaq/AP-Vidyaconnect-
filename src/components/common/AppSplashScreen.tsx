// ============================================================================
// AP VIDYACONNECT — MOBILE APK STARTUP ANIMATED SPLASH SCREEN
// Displays animated AP VidyaConnect logo & ecosystem branding on APK open
// before the main portal / dashboard content is revealed
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
  logoUrl = '/brand/splash-logo.png',
  duration = 2700,
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
  const [statusMessage, setStatusMessage] = useState<string>('Initializing AP VidyaConnect...');

  useEffect(() => {
    // Phase 2: Shimmer beam & ecosystem connecting (750ms)
    const tPhase2 = setTimeout(() => {
      setPhase(2);
      setStatusMessage('Connecting Higher Education & Industry Ecosystem...');
    }, 750);

    // Phase 3: Final state & welcome (1700ms)
    const tPhase3 = setTimeout(() => {
      setPhase(3);
      setStatusMessage('Welcome to AP VidyaConnect');
    }, 1700);

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
      id="ap-vidyaconnect-apk-splash"
      className={`fixed inset-0 z-[9999999] flex flex-col items-center justify-between select-none overflow-hidden transition-all duration-500 ease-out ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at 50% 35%, #FFFFFF 0%, #F5F8FE 55%, #E9F1FC 100%)',
      }}
    >
      {/* Dynamic Ambient Background Glow Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Blue Radial Aura */}
        <div
          className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-blue-400/15 blur-3xl transition-all duration-1000 ${
            phase >= 1 ? 'scale-125 opacity-100' : 'scale-75 opacity-0'
          }`}
        />
        {/* Soft Emerald Radiant Glow */}
        <div
          className={`absolute bottom-1/3 left-1/4 w-72 h-72 rounded-full bg-emerald-400/10 blur-3xl transition-all duration-1000 delay-200 ${
            phase >= 1 ? 'scale-110 opacity-100' : 'scale-50 opacity-0'
          }`}
        />
        {/* Soft Saffron Ambient Glow */}
        <div
          className={`absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full bg-amber-400/10 blur-3xl transition-all duration-1000 delay-300 ${
            phase >= 1 ? 'scale-110 opacity-100' : 'scale-50 opacity-0'
          }`}
        />

        {/* Animated Concentric Radar Pulse Rings behind Logo */}
        <div className="absolute top-[42%] sm:top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div
            className={`w-72 h-72 sm:w-96 sm:h-96 rounded-full border border-blue-400/20 transition-all duration-1000 ${
              phase >= 1 ? 'scale-100 opacity-60' : 'scale-50 opacity-0'
            }`}
            style={{ animation: 'splash-ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite' }}
          />
          <div
            className={`absolute inset-4 rounded-full border border-emerald-400/25 transition-all duration-1000 delay-150 ${
              phase >= 1 ? 'scale-100 opacity-70' : 'scale-50 opacity-0'
            }`}
            style={{ animation: 'splash-ping-slow 3s cubic-bezier(0, 0, 0.2, 1) 1.2s infinite' }}
          />
        </div>
      </div>

      {/* Top Header Bar: AP State Insignia & Quick Skip */}
      <div className="w-full max-w-md px-6 pt-10 sm:pt-12 flex items-center justify-between z-10">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-slate-200/80 shadow-sm backdrop-blur-md transition-all duration-700 ${
            phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#1C8A3C] animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-[#F07421]" />
            <span className="w-2 h-2 rounded-full bg-[#0E2350]" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-700 uppercase">
            Govt. of Andhra Pradesh
          </span>
        </div>

        {/* Skip button for instant entry */}
        <button
          type="button"
          onClick={handleSkip}
          className={`group inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 bg-white/70 hover:bg-white border border-slate-200/60 rounded-full shadow-xs transition-all duration-500 ${
            phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
          title="Skip animation and enter app"
        >
          <span>Skip</span>
          <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Center Hero: The AP VidyaConnect Animated Logo */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 z-10 w-full max-w-md my-auto">
        <div className="relative flex flex-col items-center">
          {/* Logo Card with 3D Pop, Glass Backplate & Light Sweep */}
          <div
            className={`relative p-4 sm:p-6 rounded-3xl transition-all duration-700 ease-out transform ${
              phase >= 1
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-75 translate-y-6'
            }`}
          >
            {/* Soft backdrop blur plate */}
            <div className="absolute inset-0 bg-white/60 backdrop-blur-md rounded-3xl border border-white/80 shadow-[0_20px_50px_rgba(14,35,80,0.08)] pointer-events-none" />

            {/* Glowing Accent Ring */}
            <div
              className={`absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-blue-500/20 via-emerald-500/20 to-amber-500/20 blur-sm transition-opacity duration-1000 ${
                phase >= 2 ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* The Official AP VidyaConnect Logo Image */}
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src={logoUrl}
                alt="AP VidyaConnect"
                className={`w-60 h-60 sm:w-72 sm:h-72 object-contain filter drop-shadow-md transition-transform duration-1000 ease-out ${
                  phase >= 2 ? 'scale-100' : 'scale-95'
                }`}
                style={{
                  animation: phase >= 2 ? 'splash-float 4s ease-in-out infinite' : undefined,
                }}
              />

              {/* Diagonal Light Shimmer Beam that sweeps across the logo */}
              <div
                className={`absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-500 ${
                  phase >= 2 ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div
                  className="w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12"
                  style={{
                    animation: 'splash-shimmer-sweep 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Subtitle / Department Lockup */}
          <div
            className={`mt-4 text-center transition-all duration-700 delay-100 ${
              phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="text-xs font-bold text-[#0E2350] tracking-wide">
                Higher Education Ecosystem
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600 max-w-xs mx-auto leading-relaxed">
              Bridging Colleges, Students & Industry Partners
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer: Dynamic Status Ticker & Tri-Color Progress Bar */}
      <div className="w-full max-w-md px-6 pb-10 sm:pb-12 flex flex-col items-center z-10 space-y-4">
        {/* Dynamic Status Text */}
        <div
          className={`flex items-center gap-2 text-xs font-medium text-slate-600 transition-all duration-500 ${
            phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#1C8A3C] animate-ping" />
          <span className="font-semibold text-slate-700">{statusMessage}</span>
        </div>

        {/* Tri-Color Loading Bar (Andhra Pradesh Colors: Navy • Saffron • Emerald) */}
        <div className="w-56 sm:w-64 h-2 bg-slate-200/80 rounded-full p-0.5 overflow-hidden shadow-inner border border-slate-300/40">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#0E2350] via-[#F07421] to-[#1C8A3C] transition-all duration-75 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            {/* Glossy light dot at progress head */}
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/80 rounded-full shadow-sm" />
          </div>
        </div>

        {/* Security & Official Accreditation Badge */}
        <div
          className={`flex items-center gap-1.5 text-[11px] text-slate-500 transition-all duration-700 delay-200 ${
            phase >= 1 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Official Andhra Pradesh Higher Education Portal</span>
        </div>
      </div>
    </div>
  );
};
