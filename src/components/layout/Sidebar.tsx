// ============================================================================
// AP VIDYACONNECT — SIDEBAR COMPONENT (Navy #0E2350 Surface)
// ============================================================================

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';
import { BrandLogo } from '../common/BrandLogo';
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  Briefcase,
  CheckSquare,
  CalendarCheck,
  Award,
  BarChart3,
  ShieldCheck,
  Sliders,
  History,
  FolderOpen,
  HelpCircle,
  Sparkles,
  School,
  UserPlus,
  Megaphone,
  PenTool,
  Stamp,
  Layers
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onToggleCollapse }) => {
  const { currentUser, currentRole, currentInstitution, currentCompany, currentStudent } = useAuth();
  const location = useLocation();

  const getNavLinks = () => {
    switch (currentRole) {
      case 'institution_admin':
      case 'faculty_coordinator': {
        const instId = currentInstitution?.id || currentUser.institution_id;
        const decisionCount = instId
          ? db.proposals.filter(
              p => p.institution_id === instId &&
                (p.status === 'company_accepted' || p.status === 'company_accepted_with_changes' || p.status === 'modification_requested')
            ).length
          : 0;
        const pendingMous = instId
          ? db.mous.filter(
              m => m.institution_id === instId &&
                (m.status === 'sent_to_college' || m.status === 'company_signed' || m.status === 'college_accepted')
            ).length
          : 0;

        return [
          { label: 'Overview Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { label: 'MoU Agreements', path: '/mous', icon: PenTool, badge: pendingMous > 0 ? `${pendingMous} Review` : 'Review' },
          { label: 'Student Management', path: '/students', icon: Users, badge: 'Roster' },
          { label: 'Internship Proposals', path: '/proposals', icon: FileText, badge: 'Nominate' },
          { label: 'Accept / Reject Terms', path: '/proposals/decisions', icon: CheckSquare, badge: decisionCount > 0 ? `${decisionCount} Waiting` : undefined },
          { label: 'Active Batches', path: '/batches', icon: Briefcase },
          { label: 'Daily Attendance', path: '/attendance', icon: CalendarCheck, badge: 'Register' },
          { label: 'Explore Companies', path: '/opportunities', icon: Building2 },
          { label: 'College Profile', path: '/profile', icon: School },
        ];
      }

      case 'company_admin': {
        const compId = currentCompany?.id || currentUser.company_id;
        const pendingCount = compId
          ? db.proposals.filter(
              p => p.company_id === compId && (p.status === 'submitted' || p.status === 'under_company_review')
            ).length
          : 0;
        const compMousCount = compId
          ? db.mous.filter(m => m.company_id === compId && m.status === 'active').length
          : 0;

        return [
          { label: 'Industry Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { label: 'MoU Agreements', path: '/mous', icon: PenTool, badge: 'Create MoU' },
          { label: 'Pending Decisions', path: '/proposals?filter=submitted', icon: ShieldCheck, badge: pendingCount > 0 ? `${pendingCount} Waiting` : undefined },
          { label: 'Internship Openings', path: '/company/postings', icon: Sparkles, badge: 'Post' },
          { label: 'Inbound Proposals', path: '/proposals', icon: FileText, badge: pendingCount > 0 ? `${pendingCount} New` : undefined },
          { label: 'Internship Batches', path: '/batches', icon: Briefcase },
          { label: 'Daily Attendance', path: '/attendance', icon: CalendarCheck, badge: 'Register' },
          { label: 'Company Profile', path: '/profile', icon: Building2 },
        ];
      }

      case 'student': {
        const studentEmail = currentStudent?.email?.toLowerCase() || currentUser?.email?.toLowerCase() || '';
        const studentId = currentStudent?.id || 'stu-001';
        const myBatches = db.batches.filter(b =>
          b.students?.some(s => s.student_id === studentId || s.student?.email?.toLowerCase() === studentEmail)
        );
        const totalCount = myBatches.length > 0 ? myBatches.length : 1;

        return [
          { label: 'Student Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { label: 'My Active Internship', path: '/my-internship', icon: Briefcase, badge: 'Enrolled' },
          { label: 'Enrolled Internships', path: '/my-internships', icon: Layers, badge: `${totalCount} ${totalCount === 1 ? 'Batch' : 'Batches'}` },
          { label: 'My Attendance Log', path: '/attendance', icon: CalendarCheck },
          { label: 'My Profile', path: '/profile', icon: School },
        ];
      }

      case 'super_admin':
      default:
        return [
          { label: 'State Overview', path: '/dashboard', icon: LayoutDashboard },
          { label: 'Entity Verifications', path: '/admin/verifications', icon: ShieldCheck, badge: 'Pending' },
          { label: 'Register Company / College Partner', path: '/admin/register-partner', icon: UserPlus, badge: 'Add' },
          { label: 'Registered Colleges / Institutes', path: '/admin/institutions', icon: School },
          { label: 'Registered Companies', path: '/admin/companies', icon: Building2 },
          { label: 'Promotion Banner', path: '/admin/banners', icon: Megaphone, badge: 'Live' },
          { label: 'My Profile & Org Detail', path: '/profile', icon: Building2 },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <aside
      className={`bg-[#0E2350] text-white flex flex-col justify-between transition-all duration-300 z-20 ${
        collapsed ? 'w-20' : 'w-64'
      } min-h-screen shadow-xl`}
    >
      {/* Top Brand Banner */}
      <div>
        <div className="h-16 flex items-center justify-center px-4 border-b border-[#14336F]">
          {collapsed ? (
            <BrandLogo variant="mark" size={32} />
          ) : (
            <BrandLogo variant="reverse" size={170} />
          )}
        </div>

        {/* Current Org / Student Context Pill */}
        {!collapsed && (
          <div className="px-4 py-3 bg-[#102A60] border-b border-[#14336F]/60">
            <p className="text-[10px] uppercase tracking-wider text-[#F07421] font-bold">
              {currentRole === 'student' ? 'Student Workspace' : 'Active Context'}
            </p>
            <p className="text-xs font-semibold text-white truncate mt-0.5">
              {currentRole === 'student'
                ? currentStudent?.full_name || currentUser?.full_name || 'Student Intern'
                : currentInstitution?.name || currentCompany?.name || 'State Higher Education Dept'}
            </p>
            <p className="text-[10px] text-[#DCE5F5]/70 truncate">
              {currentRole === 'student'
                ? `Roll No: ${currentStudent?.roll_number || '2023-CS-05A4'}`
                : currentInstitution?.code || currentCompany?.cin || `ID: ${currentStudent?.roll_number || 'GOVT-TS'}`}
            </p>
          </div>
        )}

        {/* Nav Links */}
        <nav className="p-3 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive: active }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    active
                      ? 'bg-[#14336F] text-white shadow-sm border-l-4 border-[#F07421]'
                      : 'text-[#DCE5F5]/80 hover:bg-[#102A60] hover:text-white'
                  } ${collapsed ? 'justify-center' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#F07421]' : 'text-[#DCE5F5]'}`} />
                {!collapsed && (
                  <span className="truncate flex-1">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span className="text-[10px] bg-[#F07421]/20 text-[#FFE5D3] px-1.5 py-0.5 rounded font-bold border border-[#F07421]/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom info / Help box */}
      <div className="p-3 border-t border-[#14336F]">
        {!collapsed && (
          <div className="bg-[#102A60]/80 rounded-lg p-3 text-[11px] text-[#DCE5F5] space-y-1">
            <p className="font-bold text-white flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-[#F07421]" />
              Helpdesk & SOP
            </p>
            <p className="text-gray-300 text-[10px] leading-relaxed">
              Toll-free helpline: 1800-425-0012
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
