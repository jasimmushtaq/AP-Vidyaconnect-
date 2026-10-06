// ============================================================================
// AP VIDYACONNECT — ROLE SWITCHER COMPONENT
// ============================================================================

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/database';
import { ShieldCheck, School, GraduationCap, Building2, UserCheck, User } from 'lucide-react';

const ROLES: { role: UserRole; label: string; icon: any; hint: string }[] = [
  { role: 'institution_admin', label: 'College Admin', icon: School, hint: 'Prof. Sunitha Rao (Principal / Placement Officer)' },
  { role: 'company_admin', label: 'Company Admin', icon: Building2, hint: 'Arjun Verma (PixelWind Tech)' },
  { role: 'student', label: 'Student / Intern', icon: User, hint: 'Rahul Sharma (B.Sc CS 3rd Yr)' },
  { role: 'super_admin', label: 'State Super Admin', icon: ShieldCheck, hint: 'Dr. Varun Surya, IAS' },
];

export const RoleSwitcherBar: React.FC = () => {
  const { currentRole, switchRole } = useAuth();

  return (
    <div className="bg-[#0E2350] text-white px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#14336F] shadow-sm">
      <div className="flex items-center gap-2">
        <span className="bg-[#F07421] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]">
          Demo Persona Switcher
        </span>
        <span className="text-[#DCE5F5] hidden sm:inline">
          Switch roles to experience two-sided workflows & RLS authorization:
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {ROLES.map(({ role, label, icon: Icon, hint }) => {
          const isActive = currentRole === role;
          return (
            <button
              key={role}
              onClick={() => switchRole(role)}
              title={hint}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all font-medium ${
                isActive
                  ? 'bg-white text-[#0E2350] font-bold shadow-sm ring-2 ring-[#F07421]'
                  : 'bg-[#14336F]/80 text-[#DCE5F5] hover:bg-[#14336F] hover:text-white'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#F07421]' : 'text-[#DCE5F5]'}`} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
