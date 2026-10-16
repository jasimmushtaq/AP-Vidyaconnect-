// ============================================================================
// AP VIDYACONNECT — PUBLIC LAYOUT
// ============================================================================

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { GovernmentTechBackground } from '../common/GovernmentTechBackground';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen relative flex flex-col font-sans">
      {/* AICTE & AP Institutional Government-Tech Background */}
      <GovernmentTechBackground />
      
      <Header />
      <main className="flex-1 relative">
        <Outlet />
      </main>
    </div>
  );
};
