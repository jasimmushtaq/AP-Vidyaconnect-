// ============================================================================
// AP VIDYACONNECT — NATIVE MOBILE BOTTOM NAVIGATION BAR
// Thumb-friendly quick navigation for Android/iOS APK & mobile browsers
// ============================================================================

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users,
  Menu,
  Building2,
  CalendarCheck,
  Search,
  ShieldCheck,
  PenTool
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMenu }) => {
  const { currentRole } = useAuth();
  const location = useLocation();

  // Tab configurations based on active user role
  const getTabs = () => {
    switch (currentRole) {
      case 'college_admin':
      case 'institution_admin':
      case 'faculty_coordinator':
        return [
          { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { label: 'Batches', path: '/batches', icon: Briefcase },
          { label: 'Proposals', path: '/proposals', icon: FileText },
          { label: 'Students', path: '/students', icon: Users },
        ];

      case 'company_admin':
      case 'mentor':
        return [
          { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { label: 'Batches', path: '/batches', icon: Briefcase },
          { label: 'Proposals', path: '/proposals', icon: FileText },
          { label: 'Postings', path: '/company/postings', icon: Building2 },
        ];

      case 'student':
        return [
          { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { label: 'Internships', path: '/my-internships', icon: Briefcase },
          { label: 'Attendance', path: '/attendance', icon: CalendarCheck },
          { label: 'Explore', path: '/opportunities', icon: Search },
        ];

      case 'super_admin':
        return [
          { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { label: 'Verify', path: '/admin/verifications', icon: ShieldCheck },
          { label: 'Colleges', path: '/admin/institutions', icon: Users },
          { label: 'Companies', path: '/admin/companies', icon: Building2 },
        ];

      default:
        return [
          { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { label: 'Batches', path: '/batches', icon: Briefcase },
          { label: 'Proposals', path: '/proposals', icon: FileText },
        ];
    }
  };

  const tabs = getTabs();

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] shadow-[0_-4px_24px_rgba(11,31,70,0.08)] select-none"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 6px)',
      }}
    >
      <div className="grid grid-cols-5 items-center h-14 max-w-lg mx-auto px-1">
        {tabs.slice(0, 4).map((tab) => {
          const Icon = tab.icon;
          const isActive =
            location.pathname === tab.path ||
            (tab.path !== '/dashboard' && location.pathname.startsWith(tab.path));

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all active:scale-95 ${
                isActive
                  ? 'text-[#FF6500]'
                  : 'text-[#64748B] hover:text-[#0B1F46]'
              }`}
            >
              <div
                className={`relative p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-[#FFF4EC] text-[#FF6500]' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#FF6500]" />
                )}
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight font-bold ${
                  isActive ? 'text-[#0B1F46]' : 'text-[#64748B]'
                }`}
              >
                {tab.label}
              </span>
            </NavLink>
          );
        })}

        {/* 5th Tab: Menu Drawer Toggle */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-[#64748B] hover:text-[#0B1F46] transition-all active:scale-95"
        >
          <div className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <Menu className="w-5 h-5 text-[#0B1F46]" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-bold text-[#64748B]">
            All Menu
          </span>
        </button>
      </div>
    </nav>
  );
};

