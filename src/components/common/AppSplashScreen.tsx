// ============================================================================
// AP VIDYACONNECT — MOBILE APK FULLSCREEN ANIMATED SPLASH SCREEN
// Pure transparent PNG logo, unboxed, fully visible on fullscreen with smooth
// floating animation, light sweep shimmer, status ticker & progress bar
// ============================================================================

import React, { useState, useEffect } from 'react';

interface AppSplashScreenProps {
  onComplete: () => void;
  onStartExit?: () => void;
  logoUrl?: string;
  duration?: number; // total animation time in ms before exit
}

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({
  onComplete,
  onStartExit,
  logoUrl = '/brand/ap-vidyaconnect-logo.png',
  duration = 2400,
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
  const [progress, setProgress] = useState<number>(15);
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Connecting Education with Industry...');

  useEffect(() => {
    // Phase 2: Shimmer beam & floating animation (600ms)
    const tPhase2 = setTimeout(() => {
      setPhase(2);
      setStatusMessage('Loading Platform Workspaces...');
    }, 600);

    // Phase 3: Final state & welcome (1500ms)
    const tPhase3 = setTimeout(() => {
      setPhase(3);
      setStatusMessage('Welcome to AP VidyaConnect');
    }, 1500);

    // Progress bar animation step
    const interval = 25; // 25ms steps
    const totalSteps = effectiveDuration / interval;
    let step = Math.round(totalSteps * 0.15);
    const progressTimer = setInterval(() => {
      step++;
      const currentProgress = Math.min(100, Math.round((step / totalSteps) * 100));
      setProgress(currentProgress);
      if (step >= totalSteps) {
        clearInterval(progressTimer);
      }
    }, interval);

    // Exit transition sequence with smooth fade & scale
    const tExit = setTimeout(() => {
      setIsExiting(true);
      if (onStartExit) onStartExit();
      // 500ms for smooth exit fade and scale before unmounting
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

  return (
    <div
      id="ap-vidyaconnect-apk-splash"
      className={`fixed inset-0 z-[9999999] flex flex-col items-center justify-between select-none overflow-hidden transition-all duration-600 ease-out ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at 50% 40%, #FFFFFF 0%, #F5F9FE 55%, #EAF2FC 100%)',
      }}
    >
      {/* Dynamic Ambient Background Glow Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Royal Blue Radial Aura in Center */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-blue-500/10 blur-3xl transition-all duration-1000 ${
            phase >= 1 ? 'scale-125 opacity-100' : 'scale-75 opacity-0'
          }`}
        />
        {/* Soft Orange Ambient Glow */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-[#FF6500]/10 blur-3xl transition-all duration-1000 delay-200 ${
            phase >= 1 ? 'scale-110 opacity-100' : 'scale-50 opacity-0'
          }`}
        />

        {/* Animated Concentric Radar Pulse Rings behind Logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div
            className={`w-72 h-72 sm:w-96 sm:h-96 rounded-full border border-blue-400/15 transition-all duration-1000 ${
              phase >= 1 ? 'scale-100 opacity-60' : 'scale-50 opacity-0'
            }`}
            style={{ animation: 'splash-ping-slow 3.2s cubic-bezier(0, 0, 0.2, 1) infinite' }}
          />
          <div
            className={`absolute inset-4 rounded-full border border-amber-400/20 transition-all duration-1000 delay-150 ${
              phase >= 1 ? 'scale-100 opacity-70' : 'scale-50 opacity-0'
            }`}
            style={{ animation: 'splash-ping-slow 3.2s cubic-bezier(0, 0, 0.2, 1) 1.2s infinite' }}
          />
        </div>
      </div>

      {/* Top Spacer for perfect vertical balance */}
      <div className="w-full h-8 sm:h-12 pointer-events-none" />

      {/* Center Hero: Fully Visible, Unboxed Transparent PNG Logo */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 w-full my-auto z-10 select-none">
        <div
          className={`relative flex flex-col items-center justify-center transition-all duration-700 ease-out transform ${
            phase >= 1
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-90 translate-y-4'
          }`}
        >
          {/* Transparent PNG Logo directly on screen (No box, no card border, fully visible) */}
          <div className="relative overflow-hidden flex items-center justify-center">
            <img
              src={logoUrl}
              alt="AP VidyaConnect"
              className="w-[78vw] max-w-[340px] sm:max-w-[420px] h-auto object-contain drop-shadow-[0_12px_28px_rgba(11,31,70,0.12)] transition-transform duration-1000 ease-out select-none"
              style={{
                animation: phase >= 2 ? 'splash-float 3.5s ease-in-out infinite' : undefined,
              }}
            />

            {/* Diagonal Light Shimmer Beam sweeping across the logo */}
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
      </div>

      {/* Bottom: Dynamic Status Ticker & Tri-Color Progress Bar (Clean & Minimal) */}
      <div className="w-full max-w-xs px-6 pb-12 sm:pb-14 flex flex-col items-center z-10 space-y-3.5 select-none">
        {/* Dynamic Status Text */}
        <div
          className={`flex items-center gap-2 text-xs font-semibold text-[#0B1F46] transition-all duration-500 ${
            phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF6500] animate-ping" />
          <span>{statusMessage}</span>
        </div>

        {/* Tri-Color Loading Bar (Navy • Saffron • Emerald) */}
        <div className="w-56 sm:w-64 h-1.5 bg-slate-200/90 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#0E2350] via-[#F07421] to-[#1C8A3C] transition-all duration-75 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full shadow-xs" />
          </div>
        </div>
      </div>
    </div>
  );
};
