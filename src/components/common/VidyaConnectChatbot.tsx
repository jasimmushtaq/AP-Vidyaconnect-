// ============================================================================
// AP VIDYACONNECT — VIDYABOT / IDYABOT 3D AI ASSISTANT (COMPLETE EDITION)
// Advanced 3D Interactive Mascot, Multi-Modal Voice AI, Exhaustive Knowledge
// Engine, Interactive Policy Tools & NEP 2020 Credit Calculators
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ChevronRight,
  School,
  Building2,
  GraduationCap,
  ShieldCheck,
  FileText,
  Briefcase,
  CalendarCheck,
  CheckCircle2,
  Award,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  Minimize2,
  Maximize2,
  Megaphone,
  HelpCircle,
  Search,
  Check,
  Users,
  BarChart3,
  Layers,
  History,
  FileSpreadsheet,
  QrCode,
  Lock,
  Cpu,
  BookmarkCheck,
  Camera,
  MapPin,
  Key,
  Compass,
  Volume2,
  VolumeX,
  Phone,
  Scale,
  Mic,
  MicOff,
  Copy,
  Calculator,
  Compass as CompassIcon,
  ShieldAlert,
  Info,
  Sliders,
  Play,
  Pause,
  AlertCircle
} from 'lucide-react';

// ============================================================================
// 1. 3D PROCEDURAL CHARACTER AVATAR (Fallback & Animation Vector Component)
// ============================================================================
export const VidyaBot3DAvatar: React.FC<{
  size?: number | string;
  className?: string;
  isThinking?: boolean;
  isSpeaking?: boolean;
  mood?: 'happy' | 'neutral' | 'curious' | 'excited';
  useImage?: boolean;
  fullBody?: boolean;
}> = ({
  size = 56,
  className = "",
  isThinking = false,
  isSpeaking = false,
  mood = 'happy',
  useImage = true,
  fullBody = false
}) => {
  const [imgError, setImgError] = useState(false);

  if (useImage && !imgError) {
    return (
      <div
        className={`relative inline-flex items-center justify-center select-none transition-all duration-300 ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src="/brand/idyabot-3d.png"
          alt="VidyaBot 3D AI Assistant Mascot"
          onError={() => setImgError(true)}
          className={`w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(14,35,80,0.35)] select-none transition-transform duration-300 ${
            isThinking ? 'scale-105 animate-pulse' : isSpeaking ? 'scale-110' : 'hover:scale-110'
          }`}
        />
        {isThinking && (
          <span className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping pointer-events-none" />
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none transition-transform duration-300 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_8px_16px_rgba(14,35,80,0.35)]"
      >
        <defs>
          <radialGradient id="vb_aura_full" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F07421" stopOpacity="0.5" />
            <stop offset="70%" stopColor="#2A4E96" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0E2350" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="vb_helmet_3d_full" cx="35%" cy="28%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="20%" stopColor="#E2E8F0" />
            <stop offset="55%" stopColor="#94A3B8" />
            <stop offset="85%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1E293B" />
          </radialGradient>

          <linearGradient id="vb_visor_3d_full" x1="20" y1="30" x2="80" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#071328" />
            <stop offset="45%" stopColor="#0A1E44" />
            <stop offset="80%" stopColor="#0B2A5B" />
            <stop offset="100%" stopColor="#050E20" />
          </linearGradient>

          <linearGradient id="vb_glass_sheen_full" x1="25" y1="35" x2="75" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
            <stop offset="40%" stopColor="#60A5FA" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0E2350" stopOpacity="0" />
          </linearGradient>

          <filter id="vb_cyan_glow_full" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="vb_orange_glow_full" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <circle cx="50" cy="50" r="48" fill="url(#vb_aura_full)" />

        {/* Floating Collar */}
        <ellipse cx="50" cy="74" rx="20" ry="6" fill="#1E293B" opacity="0.9" />
        <ellipse cx="50" cy="73" rx="18" ry="4.5" fill="#F07421" opacity="0.85" filter="url(#vb_orange_glow_full)" />

        {/* Cyber Body */}
        <path
          d="M32 75 C32 72 38 71 50 71 C62 71 68 72 68 75 L72 90 C72 95 62 98 50 98 C38 98 28 95 28 90 Z"
          fill="#475569"
        />
        <circle cx="50" cy="85" r="4.5" fill="#F07421" filter="url(#vb_orange_glow_full)" />
        <circle cx="50" cy="85" r="2" fill="#FFFFFF" />

        {/* Ears */}
        <rect x="15" y="42" width="7" height="14" rx="3.5" fill="#334155" />
        <rect x="16" y="44" width="5" height="10" rx="2.5" fill="#0284C7" filter="url(#vb_cyan_glow_full)" />
        <rect x="78" y="42" width="7" height="14" rx="3.5" fill="#334155" />
        <rect x="79" y="44" width="5" height="10" rx="2.5" fill="#0284C7" filter="url(#vb_cyan_glow_full)" />

        {/* Antenna */}
        <path d="M50 20 L50 9" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="7" r="5" fill="#F07421" filter="url(#vb_orange_glow_full)" />
        <circle cx="48.5" cy="5.5" r="1.5" fill="#FFFFFF" />

        {/* Head Sphere */}
        <rect x="20" y="18" width="60" height="54" rx="27" fill="url(#vb_helmet_3d_full)" />

        {/* Curved Visor */}
        <rect x="25" y="26" width="50" height="38" rx="18" fill="url(#vb_visor_3d_full)" />

        {/* Glowing Eyes */}
        {isThinking ? (
          <g filter="url(#vb_cyan_glow_full)">
            <circle cx="39" cy="45" r="4" fill="#38BDF8" className="animate-ping" />
            <circle cx="50" cy="45" r="4" fill="#F07421" className="animate-pulse" />
            <circle cx="61" cy="45" r="4" fill="#38BDF8" className="animate-ping" />
          </g>
        ) : (
          <g filter="url(#vb_cyan_glow_full)">
            <path d="M34 47 C34 40 46 40 46 47" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
            <circle cx="44" cy="43" r="1.2" fill="#FFFFFF" />
            <path d="M54 47 C54 40 66 40 66 47" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
            <circle cx="64" cy="43" r="1.2" fill="#FFFFFF" />
            <circle cx="33" cy="53" r="2.5" fill="#F07421" opacity="0.8" filter="url(#vb_orange_glow_full)" />
            <circle cx="67" cy="53" r="2.5" fill="#F07421" opacity="0.8" filter="url(#vb_orange_glow_full)" />
          </g>
        )}

        {/* Visor Sheen */}
        <path d="M30 30 C45 30 65 34 70 42 C64 36 48 33 32 34 Z" fill="url(#vb_glass_sheen_full)" />
      </svg>
    </div>
  );
};

// ============================================================================
// 2. DATA STRUCTURES & INTERFACES
// ============================================================================
interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  links?: { label: string; url: string }[];
  badges?: string[];
  actionType?: 'calculator' | 'geofence' | 'certificate' | 'workflow';
}

interface KnowledgeTopic {
  category: 'overview' | 'workflow' | 'attendance' | 'corporate' | 'institutions' | 'mou' | 'terms' | 'support' | 'roles' | 'security';
  keywords: string[];
  title: string;
  response: string;
  links?: { label: string; url: string }[];
  badges?: string[];
  actionType?: 'calculator' | 'geofence' | 'certificate' | 'workflow';
}

// ============================================================================
// 3. EXHAUSTIVE 20-MODULE KNOWLEDGE BASE ENGINE (BIT BY BIT PLATFORM POLICIES)
// ============================================================================
const KNOWLEDGE_BASE: KnowledgeTopic[] = [
  // 1. OVERVIEW & MISSION
  {
    category: 'overview',
    keywords: ['what is', 'about', 'vidyaconnect', 'ap vidyaconnect', 'overview', 'platform', 'purpose', 'website', 'introduce', 'explain website', 'details', 'mission', 'apsche', 'vision', 'initiative'],
    title: 'Overview & Mission of AP VidyaConnect',
    response: `**AP VidyaConnect** is Andhra Pradesh's official flagship state-governed higher education internship & corporate collaboration ecosystem under **APSCHE (Andhra Pradesh State Council of Higher Education)**.

It seamlessly unifies **Accredited Colleges & Universities**, **Verified Industry Partners**, and **Enrolled Students** across all 26 districts of Andhra Pradesh through audited, dual-key approved workflows.

### 🌟 Core Architecture & Capabilities:
1. **Corporate Opportunities Marketplace**: Verified industrial openings posted directly by corporate leaders across AI/ML, VLSI, Cloud, and Core Engineering domains (\`/opportunities\`).
2. **Visual 10-Stage Canonical State Machine**: Audited lifecycle ensuring mutual institutional and corporate handshake before any batch activates (\`/how-it-works\`).
3. **Biometric Selfie + 100m GPS Geofenced Attendance**: Daily check-in/out with anti-spoofing telemetry managed exclusively by Company Admins (\`/attendance\`).
4. **Legally Binding Dual-Signature MoUs**: Section 65B IT Act compliant agreements registered in the State Higher Education Repository (\`/mous\`).
5. **Statewide Institutional Network**: Accredited engineering colleges, polytechnics, and universities across North Coastal, Central, and Rayalaseema clusters (\`/institutions\`).
6. **NEP 2020 Academic Credit Synchronization**: Real-time evaluation and direct university credit validation (4–12 credits).`,
    badges: ['Govt of AP', 'APSCHE Accredited', 'NEP 2020 Aligned', '26 AP Districts'],
    links: [
      { label: 'Explore Opportunities', url: '/opportunities' },
      { label: '10-Stage State Machine', url: '/how-it-works' },
      { label: 'Institutional Network', url: '/institutions' },
      { label: 'Industry Partners Directory', url: '/partners' }
    ]
  },

  // 2. VISUAL 10-STAGE CANONICAL STATE MACHINE
  {
    category: 'workflow',
    keywords: ['10 stage', '10-stage', 'state machine', 'workflow', 'lifecycle', 'canonical', 'steps', 'how it works', 'stages', 'process', 'timeline'],
    title: 'The Visual 10-Stage Canonical State Machine',
    response: `### 🔄 Visual 10-Stage Canonical State Machine:

Every cohort follows a strict 10-phase auditable protocol with dual-key validation:

1. **Stage 1: Proposal Drafting (\`draft\`)** — College placement cell drafts cohort proposal mapped to a corporate opportunity.
2. **Stage 2: Proposal Submission (\`submitted\`)** — Formal dispatch with authorized college signatory credentials.
3. **Stage 3: Company Review (\`under_company_review\`)** — Corporate mentor inspects prerequisites, curriculum, and seat allocation.
4. **Stage 4: Company Decision (\`company_accepted\` / \`company_accepted_with_changes\`)** — Terms accepted or counter-amendments provided.
5. **Stage 5: Institution Accepted (\`institution_accepted\`)** — Dual-key handshake: College confirms final terms to auto-provision Batch Code (\`KD-YYYY-XXX\`).
6. **Stage 6: Student Consent (\`students_confirmed\`)** — Enrolled students execute digital "JOIN INTERNSHIP" onboarding consent.
7. **Stage 7: Active Internship (\`active\`)** — Daily geofenced attendance inside employer perimeter with live webcam selfies.
8. **Stage 8: Milestone Review (\`milestones_verified\`)** — Weekly code repositories, diary logs, and faculty-industry progress sync.
9. **Stage 9: Corporate Evaluation (\`evaluation_completed\`)** — Mentors grade candidates across technical quality, problem solving, and soft skills (1–100).
10. **Stage 10: Batch Finalization & NEP Credits (\`completed\`)** — Batch finalized and official academic credits transmitted to university examination records.`,
    badges: ['10-Stage Lifecycle', 'Dual-Key Protocol', 'Zero Rogue Batches'],
    actionType: 'workflow',
    links: [
      { label: 'Interactive State Machine', url: '/how-it-works' },
      { label: 'Browse Industry Opportunities', url: '/opportunities' },
      { label: 'Terms & Regulatory Framework', url: '/terms' }
    ]
  },

  // 3. GEOFENCED ATTENDANCE & COMPANY ADMIN EXCLUSIVE CONTROLS
  {
    category: 'attendance',
    keywords: ['geofence', 'attendance', 'selfie', 'gps', 'company admin', 'radius', '100m', 'settings', 'check in', 'check out', 'cutoff', '75%', 'camera', 'biometric', 'spoofing', 'who can set geofence'],
    title: 'Geofenced GPS Mobile Attendance & Company Admin Settings',
    response: `### 📍 Geofenced Attendance & Telemetry Rules:

1. **Company Admin Sole Authority**:
   - The workplace GPS coordinates (latitude, longitude), geofence boundary radius (e.g. 100m–250m), daily check-in time windows, and shift schedules are managed **strictly and exclusively by the authorized Company Administrator**.
   - College coordinators or students cannot modify geofence coordinates.

2. **Daily Student Check-In & Live Selfie**:
   - Students check in from within the employer's designated GPS radius.
   - The system automatically validates GPS accuracy, device distance, timestamp, and live camera selfie capture to prevent proxy attendance.

3. **Mandatory 75% Attendance Threshold**:
   - In accordance with APSCHE statutory rules, interns must maintain at least **75% verified geofenced attendance** during their cohort lifecycle to receive university academic credits and milestone signoffs.

4. **Anti-Spoofing Protections**:
   - Any attempt to spoof coordinates via mock location tools or VPNs triggers automated audit log flags.`,
    badges: ['Company Admin Controlled', 'GPS 100m Radius', '75% Mandatory Cutoff'],
    actionType: 'geofence',
    links: [
      { label: 'View Attendance Register', url: '/attendance' },
      { label: 'Terms of Service § 4', url: '/terms' },
      { label: 'Student Internships', url: '/students/my-internships' }
    ]
  },

  // 4. CORPORATE OPPORTUNITIES MARKETPLACE
  {
    category: 'corporate',
    keywords: ['opportunities', 'openings', 'internships', 'jobs', 'browse opportunities', 'apply', 'post internship', 'stipend', 'domains', 'hybrid', 'remote', 'onsite'],
    title: 'Corporate Opportunities Marketplace',
    response: `### 💼 Corporate Internship Opportunities Directory:

Verified corporate leaders across Andhra Pradesh publish structured internship openings directly on AP VidyaConnect:

- **Work Modes**: \`onsite\` (Host facilities), \`hybrid\` (Office & remote telemetry), and \`remote\`.
- **Key Tech Domains**: AI & Machine Learning, Full-Stack Web & Cloud Development, VLSI & Embedded Systems, Data Engineering, IoT & Smart Manufacturing, Biopharma & Chemical Engineering.
- **Detailed Specifications**: Duration in weeks, stipend range (e.g. ₹12,000 – ₹25,000/month), prerequisite technologies, eligible degrees (B.Tech, MCA, M.Tech, B.Sc), and minimum CGPA criteria.
- **Posting Restriction**: Only verified **Company Administrators** (\`company_admin\`) can publish new openings.`,
    badges: ['Verified CIN Postings', 'Transparent Stipends', 'Statewide Access'],
    links: [
      { label: 'Explore Opportunities', url: '/opportunities' },
      { label: 'Industry Partners Directory', url: '/partners' }
    ]
  },

  // 5. INDUSTRY PARTNERS DIRECTORY & MCA VALIDATION
  {
    category: 'corporate',
    keywords: ['partners', 'companies', 'corporate', 'industry', 'cin', 'mca', 'pixelwind', 'cyberapex', 'recruitment', 'employers'],
    title: 'Industry Partners & Corporate Ecosystem',
    response: `### 🏢 Verified Industry Partners Directory:

All corporate participants undergo rigorous verification under the Ministry of Corporate Affairs (MCA), Government of India:

- **Statutory CIN Validation**: Every partner displays a verified Corporate Identification Number (CIN), GST credentials, and authorized liaison.
- **Active Industrial Mentorship**: Dedicated engineering mentors guide student cohorts through live sprints, code reviews, and milestone deliverables.
- **PPO & Hiring Pipeline**: High-performing interns frequently convert to Pre-Placement Offers (PPOs) upon graduation.`,
    badges: ['MCA CIN Verified', 'PPO Conversions', 'Enterprise Mentorship'],
    links: [
      { label: 'Browse Industry Partners', url: '/partners' },
      { label: 'For Corporate Partners', url: '/for-companies' }
    ]
  },

  // 6. INSTITUTIONAL NETWORK & COLLEGES
  {
    category: 'institutions',
    keywords: ['institutions', 'colleges', 'universities', 'aishe', 'naac', 'nba', 'network', 'districts', 'guntur', 'visakhapatnam', 'tirupati', 'andhra university', 'jntu'],
    title: 'Statewide Institutional Network',
    response: `### 🏛️ Statewide Institutional Network:

AP VidyaConnect connects accredited engineering, polytechnic, and degree institutions across Andhra Pradesh:

- **Accreditation Standards**: Institutions maintain valid AISHE codes, NAAC grading, or NBA accreditations.
- **Regional Clusters**:
  - *North Coastal AP*: Visakhapatnam, Vizianagaram, Srikakulam (Andhra University, GVPCE, Gayatri Vidya Parishad, etc.)
  - *Central AP*: Vijayawada, Guntur, Krishna, Godavari (JNTU-K, VR Siddhartha, RVR & JC, KL University, etc.)
  - *Rayalaseema*: Tirupati, Anantapur, Kurnool, Kadapa (SV University, JNTU-A, Sri Padmavati Mahila Visvavidyalayam, etc.)
- **Placement Cell Dashboard**: Author cohort proposals, review geofence attendance registers, and monitor credit conversions.`,
    badges: ['AISHE Accredited', '26 AP Districts', 'Zero Ghost Cohorts'],
    links: [
      { label: 'Explore Colleges Network', url: '/institutions' },
      { label: 'For Colleges & Universities', url: '/for-institutions' }
    ]
  },

  // 7. DUAL-SIGNATURE MOUS
  {
    category: 'mou',
    keywords: ['mou', 'mous', 'agreement', 'contract', 'legal', 'dual signature', 'principal', 'sign', 'central repository', 'section 65b'],
    title: 'Dual-Signature Institutional MoUs',
    response: `### ✍️ Dual-Signature Institutional MoUs:

1. **Section 65B Legal Enforceability**:
   - Memorandums of Understanding (MoUs) executed on AP VidyaConnect constitute legally binding electronic agreements under Section 65B of the Indian Evidence Act and Information Technology Act, 2000.
2. **Bilateral Signoff**:
   - Both the College Principal and Corporate HR Director sign with cryptographic timestamps and audit records.
3. **State Central Repository**:
   - Executed MoUs are automatically registered into the State Higher Education Repository with immutable reference numbers.`,
    badges: ['Section 65B Enforceable', 'Dual-Key Signing', 'State Repository'],
    links: [
      { label: 'View Active MoUs', url: '/mous' },
      { label: 'Terms & Policies', url: '/terms' }
    ]
  },

  // 8. TERMS, REGULATORY FRAMEWORK & NEP 2020
  {
    category: 'terms',
    keywords: ['terms', 'regulatory', 'policy', 'rules', 'framework', 'nep 2020', 'aicte', 'posh', 'dpdp', 'privacy', 'v3.4', 'academic credits', 'calculate credits'],
    title: 'Statutory Terms & Regulatory Framework (v3.4)',
    response: `### 📜 Terms & Conditions of Service (v3.4 Academic Cycle):

Promulgated under **APSCHE & AP Higher Education Directives**:

- **§ 1. Statutory NEP 2020 & AICTE Alignment**: Guaranteed 4–12 academic credits recognized across all state universities.
- **§ 2. Institutional Obligations**: Mandatory faculty coordinator oversight and enforcement of the 75% attendance cutoff.
- **§ 3. Corporate Obligations & POSH Act**: Safe work environment in strict adherence to the POSH Act 2013; timely direct stipend disbursal without unauthorized deductions.
- **§ 4. Geofence Attendance Telemetry**: Company Admin sole authority for coordinates; live camera selfie face verification.
- **§ 5. Dual-Signature MoUs**: Binding agreements under Section 65B IT Act.
- **§ 6. Student Ethics & NDA**: Confidentiality of proprietary algorithms, client data, and original academic submissions.
- **§ 7. Academic Credit Transfer**: Automated university examination branch synchronization upon batch completion.
- **§ 8. Data Privacy (DPDP Act 2023)**: 256-bit encryption; user data is never monetized.`,
    badges: ['Version v3.4', 'NEP 2020 Compliant', 'POSH Act 2013'],
    actionType: 'calculator',
    links: [
      { label: 'Read Complete Terms & Conditions', url: '/terms' },
      { label: 'Privacy Policy', url: '/privacy' }
    ]
  },

  // 9. CONTACT & TECHNICAL HELPDESK
  {
    category: 'support',
    keywords: ['contact', 'helpdesk', 'support', 'phone', 'email', 'pixelwind', 'address', 'hours', 'phone number', 'office', 'call', 'sla'],
    title: 'Support Desk & Contact Information',
    response: `### 📞 Support & Helpdesk Information:

- **Technical & Operations Partner**: PixelWind Technologies
- **Phone / WhatsApp**: \`+91 93989 29970\`
- **Official Email**: \`pixelwindtechnologies@gmail.com\`
- **Official Website**: \`www.pixelwindtechnologies.com\`
- **Operating Hours**: Monday – Saturday: 09:30 AM – 06:30 PM IST
- **Average Response Time (SLA)**: Within 2 Hours`,
    badges: ['PixelWind Support', '+91 93989 29970', '2hr Resolution Target'],
    links: [
      { label: 'Contact Helpdesk Page', url: '/contact' },
      { label: 'Frequently Asked Questions', url: '/faqs' }
    ]
  },

  // 10. ROLES & PERMISSIONS (RBAC)
  {
    category: 'roles',
    keywords: ['role', 'roles', 'permissions', 'who can do what', 'student', 'faculty', 'principal', 'company admin', 'super admin', 'mentor'],
    title: 'User Roles & System Permissions',
    response: `### 👥 Role-Based Access Control (RBAC):

1. **College / Institution Admin (\`institution_admin\`)**:
   - Draft cohort proposals, upload AISHE accreditation, confirm final terms, sign MoUs, and track batch attendance.
2. **Faculty Coordinator (\`faculty_coordinator\`)**:
   - Monitor daily intern selfies, review weekly diary submissions, and synchronize academic credits.
3. **Company Administrator (\`company_admin\`)**:
   - Configure geofence coordinates & radius, post internships, accept/counter proposals, manage mentors, and sign MoUs.
4. **Industry Mentor (\`mentor\`)**:
   - Assign technical sprints, verify daily shift check-ins, and submit rubric evaluations (1–100).
5. **Student Intern (\`student\`)**:
   - Execute digital joining consent, check in daily with GPS selfie, log diaries, and track academic credits.
6. **State Super Admin (\`super_admin\`)**:
   - Statewide telemetry oversight, verify company CIN & college accreditations, manage promotional announcements.`,
    badges: ['6 System Roles', 'Strict RBAC', 'State Oversight'],
    links: [
      { label: 'Platform Portal Dashboard', url: '/dashboard' },
      { label: 'How It Works Guide', url: '/how-it-works' }
    ]
  },

  // 11. NEP 2020 ACADEMIC CREDITS & RECOGNITION
  {
    category: 'workflow',
    keywords: ['credit', 'credits', 'nep 2020', 'academic credits', 'university recognition', 'grading', 'evaluation', 'formula'],
    title: 'NEP 2020 Academic Credits & University Recognition',
    response: `### 🎓 Academic Credit Synchronization & NEP 2020:

1. **Direct University Credit Transfer**:
   - Every completed batch with ≥75% attendance and approved evaluation unlocks **4 to 12 NEP 2020 academic credits**.
2. **Statutory Credit Formula**:
   - Every **30–35 hours** of certified industrial training corresponds to 1 official university credit point.
   - *4-Week Internship:* 2–4 Credits
   - *8-Week Internship:* 4–6 Credits
   - *12-Week Semester Internship:* 6–8 Credits
   - *24-Week Full-Year Internship:* 10–12 Credits
3. **Automated University Sync**:
   - Official completion scores and recommendation records are transmitted directly to the college examination cell.`,
    badges: ['NEP 2020 Aligned', 'Credit Transfer', 'University Sync'],
    actionType: 'calculator',
    links: [
      { label: 'View Enrolled Cohorts', url: '/students/my-internships' },
      { label: 'How It Works Guide', url: '/how-it-works' }
    ]
  },

  // 12. STUDENT STEP-BY-STEP ONBOARDING
  {
    category: 'roles',
    keywords: ['student onboarding', 'student login', 'how student join', 'join internship', 'student guide', 'how to login as student'],
    title: 'Step-by-Step Student Onboarding & Joining Guide',
    response: `### 👨‍🎓 Student Onboarding & Joining Workflow:

1. **Receive Official Credentials**:
   - Your College Administrator generates official portal login credentials and enrolls you in an internship cohort.
2. **Sign In to Student Portal**:
   - Go to \`/login\`, select **Student Intern**, and enter your credentials.
3. **Execute Digital "JOIN INTERNSHIP" Consent**:
   - Navigate to **My Internships** (\`/students/my-internships\`), review the code-of-conduct & POSH safety rules, and click **Sign "JOIN INTERNSHIP"**.
4. **Daily GPS Selfie Attendance**:
   - When on-site at the company facility, open the attendance tool and click **Check-In Selfie** within the verified GPS geofence perimeter.
5. **Milestones & Credits**:
   - Complete tasks assigned by your industry mentor to earn your university academic credits.`,
    badges: ['Student Guide', '1-Click Consent', 'Selfie Check-in'],
    links: [
      { label: 'My Internships Portal', url: '/students/my-internships' },
      { label: 'Student Opportunities', url: '/opportunities' }
    ]
  },

  // 13. COMPANY STEP-BY-STEP ONBOARDING
  {
    category: 'corporate',
    keywords: ['company onboarding', 'company registration', 'how company join', 'post job', 'how to hire', 'employer guide'],
    title: 'Step-by-Step Corporate Employer Onboarding Guide',
    response: `### 🏢 Corporate Partner Onboarding & Hiring Workflow:

1. **Register Organization**:
   - Complete company registration at \`/register\`, providing legal business name, MCA CIN, and GST credentials.
2. **Super Admin Verification**:
   - State administrators verify incorporation documents within 24 hours.
3. **Post Internship Opportunities**:
   - Publish structured openings at \`/opportunities\` specifying stipend, duration, seats, and required skills.
4. **Review Inbound College Proposals**:
   - Accept proposals as-is or adjust stipend/dates at \`/proposals\`.
5. **Configure Geofence Perimeter**:
   - Under Batch Detail (\`/batches/:id/attendance-settings\`), set facility GPS coordinates and 100m–250m radius.
6. **Assign Mentors & Finalize**:
   - Assign technical mentors to guide cohorts and complete evaluations.`,
    badges: ['Company Guide', 'CIN Verification', 'Automated Cohorts'],
    links: [
      { label: 'Post New Opportunity', url: '/opportunities' },
      { label: 'Company Dashboard', url: '/dashboard' }
    ]
  },

  // 14. COLLEGE / INSTITUTION STEP-BY-STEP ONBOARDING
  {
    category: 'institutions',
    keywords: ['college onboarding', 'institution registration', 'placement cell', 'tpo guide', 'how college create batch'],
    title: 'Step-by-Step College & Placement Cell Guide',
    response: `### 🏛️ College & Placement Cell Operational Workflow:

1. **Register Institution**:
   - Register at \`/register\` with official AISHE code, NAAC accreditation, and Principal authorization.
2. **Search Corporate Opportunities**:
   - Explore matching industrial openings at \`/opportunities\`.
3. **Draft & Dispatch Proposals**:
   - Select student cohort and dispatch formal proposal to the company partner (\`/proposals\`).
4. **Execute Dual-Key Handshake**:
   - Once the company accepts, confirm final terms to provision the official Batch Code (\`KD-YYYY-XXX\`).
5. **Monitor Telemetry**:
   - Track live GPS attendance registers and student diary submissions in real-time.`,
    badges: ['College Guide', 'AISHE Registered', 'Batch Generation'],
    links: [
      { label: 'Inbound Proposals', url: '/proposals' },
      { label: 'College Directory', url: '/institutions' }
    ]
  },

  // 15. POSH ACT 2013 & STUDENT SAFETY
  {
    category: 'security',
    keywords: ['posh', 'posh act', 'safety', 'harassment', 'women safety', 'code of conduct', 'grievance', 'icc'],
    title: 'POSH Act 2013 Compliance & Student Safety Protocol',
    response: `### 🛡️ POSH Act 2013 & Workplace Safety Framework:

1. **Statutory Non-Negotiable Protection**:
   - All corporate partners must maintain strict compliance with the **Prevention of Sexual Harassment (POSH) Act, 2013**.
2. **Internal Complaints Committee (ICC)**:
   - Partner companies provide direct linkage to an active ICC for immediate grievance redressal.
3. **24/7 Student Escalation**:
   - Students can report workplace safety concerns directly through their dashboard or via the State Higher Education helpline (\`+91 93989 29970\`).
4. **Immediate Partner Delisting**:
   - Any violation results in immediate blacklisting and legal escalation under state directives.`,
    badges: ['POSH Act 2013', 'Zero Tolerance', 'ICC Protection'],
    links: [
      { label: 'Regulatory Framework', url: '/terms' },
      { label: 'Contact Safety Desk', url: '/contact' }
    ]
  },

  // 16. DATA PRIVACY & DPDP ACT 2023
  {
    category: 'security',
    keywords: ['privacy', 'data privacy', 'dpdp', 'encryption', 'security', 'gdpr', 'confidentiality'],
    title: 'Data Privacy & DPDP Act 2023 Compliance',
    response: `### 🔒 Data Privacy & Encryption Standards:

1. **DPDP Act 2023 Compliance**:
   - All student academic telemetry, biometric selfies, and personal data are processed in strict compliance with the Digital Personal Data Protection Act, 2023.
2. **256-Bit Bank-Grade Encryption**:
   - Sensitive records and credentials are encrypted at rest and in transit.
3. **Zero Data Monetization**:
   - Government and student data is never sold, shared, or leveraged for third-party advertising.
4. **Audit Logging**:
   - Every administrative modification and state transition is captured in chronological audit logs.`,
    badges: ['DPDP Act 2023', '256-Bit SSL', 'Privacy First'],
    links: [
      { label: 'Privacy Policy', url: '/privacy' },
      { label: 'Terms of Service', url: '/terms' }
    ]
  },

  // 17. REALTIME NOTIFICATIONS & AUDIO ENGINE
  {
    category: 'workflow',
    keywords: ['notifications', 'realtime', 'alerts', 'sound', 'chime', 'toast', 'push notifications', 'bell'],
    title: 'Realtime Notification & Streaming Event Engine',
    response: `### 🔔 Realtime Notification & Event Streaming Console:

1. **Role-Isolated Event Streams**:
   - Notifications stream in realtime strictly filtered to your active user role (Super Admin, College Admin, Company Admin, Mentor, Student).
2. **Multi-Factor Audio Alerts**:
   - Features gentle Web Audio API harmonic two-tone chimes for immediate situational awareness.
3. **Interactive Floating Toasts & Push**:
   - Realtime floating toast cards and native browser push notifications alert you to live student check-ins, proposal approvals, and MoU executions.`,
    badges: ['Realtime WebSocket', 'Web Audio Chimes', 'Role Isolated'],
    links: [
      { label: 'Notification Center', url: '/notifications' },
      { label: 'Platform Dashboard', url: '/dashboard' }
    ]
  },

  // 18. STIPEND DISBURSAL & FINANCIAL GUIDELINES
  {
    category: 'corporate',
    keywords: ['stipend', 'payment', 'salary', 'allowance', 'money', 'disbursal', 'bank account'],
    title: 'Stipend Disbursal Norms & Financial Governance',
    response: `### 💰 Stipend Governance & Disbursal Directives:

1. **Transparent Benchmark Ranges**:
   - Industry openings specify clear stipend ranges (e.g. ₹10,000 – ₹25,000/month).
2. **Direct Bank Disbursal**:
   - Corporate partners disburse stipends directly to students' registered bank accounts on or before the 7th of every calendar month.
3. **Zero Deductions**:
   - No unauthorized deductions, training fees, or security deposits are permitted under state regulations.`,
    badges: ['Direct Disbursal', 'Zero Deductions', 'Transparent Pay'],
    links: [
      { label: 'Explore Paid Opportunities', url: '/opportunities' },
      { label: 'Terms & Conditions', url: '/terms' }
    ]
  },

  // 19. FAQS & COMMON TROUBLESHOOTING
  {
    category: 'support',
    keywords: ['faq', 'faqs', 'troubleshoot', 'issue', 'problem', 'error', 'login problem', 'gps error', 'camera error', 'help'],
    title: 'Frequently Asked Questions & Quick Troubleshooting',
    response: `### ❓ FAQs & Instant Troubleshooting Guide:

- **Q: Why does my check-in fail with "Outside Geofence"?**
  - *Answer:* Ensure you are physically inside the employer's facility radius (100m–250m) and device Location Services (GPS) are enabled with high accuracy.
- **Q: Why is camera access blocked during selfie verification?**
  - *Answer:* Grant browser camera permissions in site settings (tap lock icon in browser URL bar).
- **Q: How does a student get portal login credentials?**
  - *Answer:* Your college administration generates your official account when assigning you to an internship cohort.
- **Q: Can a proposal be modified after rejection?**
  - *Answer:* Yes, colleges can revise proposed terms, adjust cohort size, and resubmit immediately.`,
    badges: ['Self-Service FAQs', 'GPS Troubleshooting', 'Instant Answers'],
    links: [
      { label: 'Complete FAQs Page', url: '/faqs' },
      { label: 'Contact Support Desk', url: '/contact' }
    ]
  },

  // 20. STATE GOVERNMENT MANDATE & APSCHE POLICY
  {
    category: 'overview',
    keywords: ['government', 'andhra pradesh', 'cm', 'higher education council', 'policy', 'state government', 'minister', 'directive'],
    title: 'Government of Andhra Pradesh & APSCHE Statutory Mandate',
    response: `### 🏛️ Government of Andhra Pradesh & APSCHE Mandate:

- **State Vision**: Transforming Andhra Pradesh into the premier high-skill technology and manufacturing talent hub of India.
- **Mandatory Internship Directive**: All undergraduate engineering, polytechnic, and technical degree students in AP must complete accredited industrial training.
- **Canonical Platform**: AP VidyaConnect serves as the single centralized government repository and governance engine for all 26 districts of the state.`,
    badges: ['Govt of AP Mandate', 'APSCHE Directive', 'Statewide Registry'],
    links: [
      { label: 'Institutional Network', url: '/institutions' },
      { label: 'Industry Partners', url: '/partners' }
    ]
  }
];

// ============================================================================
// 4. MAIN CHATBOT COMPONENT WITH INTERACTIVE TOOLS & VOICE CAPABILITIES
// ============================================================================
export const VidyaConnectChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'calculator' | 'geofence' | 'guide'>('chat');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Interactive Calculator State
  const [calcWeeks, setCalcWeeks] = useState(12);
  const [calcHoursPerDay, setCalcHoursPerDay] = useState(7);
  
  // Geofence Simulator State
  const [simLat, setSimLat] = useState('16.5062');
  const [simLng, setSimLng] = useState('80.6480');
  const [simRadius, setSimRadius] = useState(150);
  const [simStatus, setSimStatus] = useState<'inside' | 'outside' | null>('inside');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: `👋 Namaste! I am **VidyaBot (IdyaBot)**, your 3D AI Assistant for **AP VidyaConnect**.

I can assist you with:
- 💼 **Corporate Opportunities** & Verified Openings (\`/opportunities\`)
- 🔄 **10-Stage Canonical State Machine** & Proposal Lifecycles (\`/how-it-works\`)
- 📍 **GPS Geofenced Selfie Attendance** & Company Admin Settings (\`/attendance\`)
- 🏛️ **Institutional Network** & Verified Colleges across AP (\`/institutions\`)
- 📜 **Statutory Terms & Regulatory Directives** (\`/terms\`)
- 🧮 **NEP 2020 Academic Credit Calculator** (built-in)

How can I assist your educational or corporate journey today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      badges: ['VidyaBot 3D AI', 'Official AP Vidya Guide'],
      links: [
        { label: 'Explore Opportunities', url: '/opportunities' },
        { label: '10-Stage Workflow', url: '/how-it-works' },
        { label: 'Institutional Network', url: '/institutions' },
        { label: 'Contact Support Desk', url: '/contact' }
      ]
    }
  ]);

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const speakText = (text: string) => {
    if (!speechEnabled || !synthRef.current) return;
    synthRef.current.cancel();
    const cleanText = text.replace(/[*#`_]/g, '').replace(/\[.*?\]\(.*?\)/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    synthRef.current.speak(utterance);
  };

  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery(transcript);
        handleSendMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.18);
    } catch {
      // Ignore audio failure
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized && activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, isTyping, activeTab]);

  const findBestResponse = (query: string): KnowledgeTopic => {
    let q = query.toLowerCase().trim();
    // Normalize typos and variations
    q = q
      .replace(/vidyconnect/g, 'vidyaconnect')
      .replace(/vidya connect/g, 'vidyaconnect')
      .replace(/vidhya/g, 'vidya')
      .replace(/vidiya/g, 'vidya')
      .replace(/apvidya/g, 'ap vidyaconnect')
      .replace(/apsche/g, 'apsche');

    // Direct overview and purpose match
    if (
      q.includes('what is ap vidyaconnect') ||
      q.includes('what is vidyaconnect') ||
      q.includes('what is this website') ||
      q.includes('what is this') ||
      q.includes('explain website') ||
      q.includes('about platform') ||
      q.includes('about vidyaconnect') ||
      q.includes('overview') ||
      q === 'vidyaconnect' ||
      q === 'ap vidya' ||
      q === 'hi' ||
      q === 'hello' ||
      q === 'namaste'
    ) {
      return KNOWLEDGE_BASE[0];
    }

    let bestMatch: KnowledgeTopic | null = null;
    let highestScore = 0;

    const tokens = q.split(/\s+/).filter(t => t.length > 2);

    for (const item of KNOWLEDGE_BASE) {
      let score = 0;
      for (const kw of item.keywords) {
        if (q.includes(kw)) {
          score += kw.length * 3;
        }
        for (const token of tokens) {
          if (kw.includes(token)) {
            score += token.length * 1.5;
          }
        }
      }
      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    }

    if (bestMatch && highestScore > 0) {
      return bestMatch;
    }

    // Default to Overview
    return KNOWLEDGE_BASE[0];
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    setActiveTab('chat');
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      const topic = findBestResponse(query);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: topic.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        badges: topic.badges,
        links: topic.links,
        actionType: topic.actionType
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
      playChime();
      speakText(topic.response);
    }, 350);
  };

  const handleQuickChip = (chipText: string) => {
    handleSendMessage(chipText);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-msg-reset',
        sender: 'bot',
        text: `Chat cleared! How can **VidyaBot 3D AI Assistant** assist you with **AP VidyaConnect** today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        badges: ['VidyaBot 3D AI'],
        links: [
          { label: 'Explore Opportunities', url: '/opportunities' },
          { label: '10-Stage Workflow', url: '/how-it-works' },
          { label: 'Institutional Network', url: '/institutions' }
        ]
      }
    ]);
  };

  // Calculator calculations
  const totalHours = calcWeeks * 5 * calcHoursPerDay;
  const nepCredits = Math.min(12, Math.max(2, Math.round(totalHours / 35)));
  const minAttendanceHours = Math.round(totalHours * 0.75);

  return (
    <>
      {/* 1. FLOATING ACTION TRIGGER BUTTON */}
      {!isOpen && (
        <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 flex items-end gap-3 print:hidden">
          {/* Animated Mascot Badge Pill */}
          <div
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2.5 bg-[#0E2350]/95 backdrop-blur-md text-white pl-3.5 pr-4 py-2 rounded-2xl shadow-2xl border border-white/20 text-xs font-bold cursor-pointer hover:bg-[#14336F] transition-all transform hover:-translate-y-1 active:scale-95 shadow-blue-950/40 group mb-2"
          >
            <Sparkles className="w-4 h-4 text-[#F07421] group-hover:rotate-12 transition-transform" />
            <div className="flex flex-col text-left">
              <span className="leading-tight text-white font-extrabold text-xs">Need Help?</span>
              <span className="text-[10px] text-[#F07421] font-bold">Ask VidyaBot 3D AI</span>
            </div>
          </div>

          {/* 3D Mascot Floating Character (Transparent PNG without box frame) */}
          <div className="relative group cursor-pointer" onClick={() => setIsOpen(true)}>
            {/* Ground Shadow */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 sm:w-12 h-2 sm:h-3 bg-black/25 rounded-full blur-[2px] group-hover:w-14 group-hover:bg-black/35 transition-all duration-300 pointer-events-none" />

            {/* Glowing Aura */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 via-cyan-400/20 to-transparent rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* 3D Robot Character */}
            <div className="relative w-11 h-13 sm:w-16 sm:h-20 flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-1 active:scale-95">
              <img
                src="/brand/idyabot-3d.png"
                alt="VidyaBot 3D AI Assistant Mascot"
                className="w-full h-full object-contain filter drop-shadow-[0_6px_14px_rgba(14,35,80,0.35)] select-none pointer-events-auto"
              />

              {/* Online Status Dot */}
              <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-400 border-2 border-white rounded-full shadow-md animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* 2. EXPANDED CHAT WINDOW MODAL */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 print:hidden ${
            isFullscreen
              ? 'inset-3 sm:inset-6 w-auto h-auto'
              : isMinimized
              ? 'bottom-5 right-5 w-84 h-16'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[500px] md:w-[540px] h-[88vh] sm:h-[680px] max-h-[94vh]'
          } bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5`}
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-[#0A1938] via-[#0E2350] to-[#163673] text-white px-4 py-3 flex items-center justify-between border-b border-[#14336F] shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <img
                  src="/brand/idyabot-3d.png"
                  alt="VidyaBot 3D AI Assistant"
                  className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)] transition-transform hover:scale-110"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#0E2350] rounded-full animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black tracking-tight text-white">VidyaBot (IdyaBot)</h3>
                  <span className="px-2 py-0.5 rounded-full bg-[#F07421]/30 border border-[#F07421]/50 text-[9px] font-black text-[#FFD8B8] uppercase tracking-wider">
                    3D AI Assistant
                  </span>
                </div>
                <p className="text-[10.5px] text-[#DCE5F5] font-medium leading-tight">
                  Official AP VidyaConnect Intelligence Gateway
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-gray-300">
              <button
                onClick={() => setSpeechEnabled(!speechEnabled)}
                className={`p-1.5 rounded-lg transition-colors ${
                  speechEnabled ? 'text-amber-400 bg-white/10' : 'text-gray-400 hover:bg-white/10'
                }`}
                title={speechEnabled ? 'Mute AI Voice' : 'Enable AI Voice Narration'}
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-1.5 rounded-lg transition-colors ${
                  soundEnabled ? 'text-blue-300 hover:bg-white/10' : 'text-gray-500 hover:bg-white/10'
                }`}
                title={soundEnabled ? 'Mute Chimes' : 'Enable Chimes'}
              >
                {soundEnabled ? <Sparkles className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                title="Reset Conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors hidden sm:inline-flex"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors sm:hidden"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                title="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Category & Tools Nav Tabs */}
              <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === 'chat'
                      ? 'bg-[#0E2350] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  AI Chat
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('calculator')}
                  className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === 'calculator'
                      ? 'bg-[#0E2350] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5 text-amber-500" />
                  NEP 2020 Credit Calculator
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('geofence')}
                  className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === 'geofence'
                      ? 'bg-[#0E2350] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  Geofence Rules
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('guide')}
                  className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === 'guide'
                      ? 'bg-[#0E2350] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  <CompassIcon className="w-3.5 h-3.5 text-indigo-500" />
                  Topic Index
                </button>
              </div>

              {/* TAB 1: AI CHAT */}
              {activeTab === 'chat' && (
                <>
                  {/* Message History */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9]/80 text-xs">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.sender === 'bot' && (
                          <div className="w-8 h-8 flex items-center justify-center shrink-0 mt-0.5">
                            <VidyaBot3DAvatar size={32} mood="happy" useImage={true} />
                          </div>
                        )}

                        <div
                          className={`max-w-[88%] rounded-2xl p-3.5 shadow-xs relative group ${
                            msg.sender === 'user'
                              ? 'bg-gradient-to-r from-[#0E2350] to-[#1E3A8A] text-white rounded-br-xs'
                              : 'bg-white text-gray-800 border border-gray-200/90 rounded-bl-xs'
                          }`}
                        >
                          {/* Copy button */}
                          <button
                            onClick={() => handleCopyText(msg.id, msg.text)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md bg-black/5 hover:bg-black/10 text-gray-500"
                            title="Copy Response"
                          >
                            {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>

                          {/* Topic Badges */}
                          {msg.badges && msg.badges.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {msg.badges.map((b, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#0E2350]/10 text-[#0E2350]"
                                >
                                  {b}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Formatted Markdown */}
                          <div
                            className="leading-relaxed whitespace-pre-line space-y-2 text-slate-800"
                            dangerouslySetInnerHTML={{
                              __html: msg.text
                                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-[#0E2350]">$1</strong>')
                                .replace(/### (.*?)\n/g, '<h4 class="font-black text-sm text-[#0E2350] mt-2 mb-1">$1</h4>')
                                .replace(/#### (.*?)\n/g, '<h5 class="font-bold text-xs text-[#0E2350] mt-1.5 mb-0.5">$1</h5>')
                                .replace(/`([^`]+)`/g, '<code class="bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-mono text-[11px] font-bold border border-blue-200/60">$1</code>')
                            }}
                          />

                          {/* Action shortcuts if present */}
                          {msg.actionType === 'calculator' && (
                            <button
                              onClick={() => setActiveTab('calculator')}
                              className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-900 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/25 transition-all"
                            >
                              <Calculator className="w-3.5 h-3.5 text-amber-600" />
                              Open Interactive Credit Calculator
                            </button>
                          )}
                          {msg.actionType === 'geofence' && (
                            <button
                              onClick={() => setActiveTab('geofence')}
                              className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-900 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/25 transition-all"
                            >
                              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                              View Geofence Rules & Simulation
                            </button>
                          )}

                          {/* Direct Interactive Links */}
                          {msg.links && msg.links.length > 0 && (
                            <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-wrap gap-1.5">
                              {msg.links.map((link, idx) => (
                                <Link
                                  key={idx}
                                  to={link.url}
                                  onClick={() => setIsOpen(false)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0E2350] font-bold text-[11px] border border-blue-200/70 transition-all shadow-2xs"
                                >
                                  <span>{link.label}</span>
                                  <ArrowRight className="w-3 h-3 text-[#F07421]" />
                                </Link>
                              ))}
                            </div>
                          )}

                          <span className="block text-[9px] text-gray-400 mt-1.5 text-right font-medium">
                            {msg.timestamp}
                          </span>
                        </div>

                        {msg.sender === 'user' && (
                          <div className="w-7 h-7 rounded-lg bg-[#F07421] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    ))}

                    {/* AI Typing Animation */}
                    {isTyping && (
                      <div className="flex gap-2.5 items-center text-gray-400">
                        <div className="w-8 h-8 flex items-center justify-center shrink-0">
                          <VidyaBot3DAvatar size={32} isThinking={true} useImage={true} />
                        </div>
                        <div className="bg-white px-3.5 py-2.5 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#F07421] animate-pulse" />
                          <span className="w-2 h-2 rounded-full bg-[#0E2350] animate-pulse delay-150" />
                          <span className="w-2 h-2 rounded-full bg-[#1C8A3C] animate-pulse delay-300" />
                          <span className="text-[11px] font-semibold text-gray-500 ml-1.5">VidyaBot is searching portal knowledge...</span>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Topic Suggestion Chips */}
                  <div className="p-2.5 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                    <button
                      type="button"
                      onClick={() => handleQuickChip('Tell me complete overview and purpose of this website')}
                      className="px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-[#0E2350] border border-blue-200 text-[10.5px] font-bold shrink-0 transition-all flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-[#F07421]" />
                      What is AP VidyaConnect?
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickChip('Explain the 10-stage canonical state machine')}
                      className="px-2.5 py-1 rounded-full bg-orange-50 hover:bg-orange-100 text-[#F07421] border border-orange-200 text-[10.5px] font-bold shrink-0 transition-all flex items-center gap-1"
                    >
                      <History className="w-3 h-3" />
                      10-Stage State Machine
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickChip('How does the GPS selfie attendance register work and who can set geofence?')}
                      className="px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10.5px] font-bold shrink-0 transition-all flex items-center gap-1"
                    >
                      <Camera className="w-3 h-3 text-emerald-600" />
                      Geofence Attendance
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickChip('Tell me about Corporate Opportunities marketplace')}
                      className="px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10.5px] font-bold shrink-0 transition-all flex items-center gap-1"
                    >
                      <Briefcase className="w-3 h-3" />
                      Opportunities
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickChip('Tell me about Statewide Institutional Network of colleges')}
                      className="px-2.5 py-1 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-[10.5px] font-bold shrink-0 transition-all flex items-center gap-1"
                    >
                      <School className="w-3 h-3" />
                      Colleges Network
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickChip('Explain Dual-Signature MoUs and legal status')}
                      className="px-2.5 py-1 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-[10.5px] font-bold shrink-0 transition-all flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" />
                      Dual-Signature MoUs
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickChip('Tell me about Terms and Conditions and NEP 2020 framework')}
                      className="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10.5px] font-bold shrink-0 transition-all flex items-center gap-1"
                    >
                      <Scale className="w-3 h-3 text-amber-600" />
                      Regulatory Terms (v3.4)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickChip('Explain NEP 2020 Academic Credits & Credit Formula')}
                      className="px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10.5px] font-bold shrink-0 transition-all flex items-center gap-1"
                    >
                      <GraduationCap className="w-3 h-3 text-emerald-600" />
                      NEP 2020 Credits
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickChip('Show me Step-by-Step Student Onboarding & Joining Guide')}
                      className="px-2.5 py-1 rounded-full bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-[10.5px] font-bold shrink-0 transition-all flex items-center gap-1"
                    >
                      <User className="w-3 h-3 text-cyan-600" />
                      Student Guide
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickChip('Show me Step-by-Step Corporate Employer Onboarding Guide')}
                      className="px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10.5px] font-bold shrink-0 transition-all flex items-center gap-1"
                    >
                      <Building2 className="w-3 h-3 text-indigo-600" />
                      Employer Guide
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickChip('Explain POSH Act 2013 and student safety policies')}
                      className="px-2.5 py-1 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-800 border border-pink-200 text-[10.5px] font-bold shrink-0 transition-all flex items-center gap-1"
                    >
                      <ShieldAlert className="w-3 h-3 text-pink-600" />
                      POSH & Safety
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickChip('Explain User Roles and RBAC system permissions')}
                      className="px-2.5 py-1 rounded-full bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 text-[10.5px] font-bold shrink-0 transition-all flex items-center gap-1"
                    >
                      <Users className="w-3 h-3 text-violet-600" />
                      User Roles
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickChip('Show me contact details for PixelWind Technologies')}
                      className="px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-[10.5px] font-bold shrink-0 transition-all flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3 text-rose-600" />
                      Contact Support
                    </button>
                  </div>

                  {/* Input Form with Voice Support */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="p-3 bg-white border-t border-gray-200 flex items-center gap-2 shrink-0"
                  >
                    <button
                      type="button"
                      onClick={toggleSpeechRecognition}
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                        isListening
                          ? 'bg-rose-500 border-rose-600 text-white animate-pulse'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                      title={isListening ? 'Listening... click to stop' : 'Speak to VidyaBot'}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>

                    <input
                      type="text"
                      value={inputQuery}
                      onChange={(e) => setInputQuery(e.target.value)}
                      placeholder="Ask VidyaBot anything about AP VidyaConnect..."
                      className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0E2350] focus:border-transparent focus:outline-none placeholder-gray-400 bg-gray-50/50"
                    />
                    <button
                      type="submit"
                      disabled={!inputQuery.trim()}
                      className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#0E2350] to-[#1E3A8A] hover:from-[#14336F] hover:to-[#2563EB] disabled:opacity-40 text-white flex items-center justify-center shadow-md transition-all shrink-0 active:scale-95"
                      title="Send Message"
                    >
                      <Send className="w-4 h-4 text-[#F07421]" />
                    </button>
                  </form>
                </>
              )}

              {/* TAB 2: NEP 2020 CREDIT CALCULATOR */}
              {activeTab === 'calculator' && (
                <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gradient-to-b from-slate-50 to-white text-xs">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 to-[#0E2350] text-white">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Calculator className="w-5 h-5 text-amber-400" />
                      <h4 className="font-extrabold text-sm">NEP 2020 & AICTE Academic Credit Estimator</h4>
                    </div>
                    <p className="text-blue-200 text-xs">
                      Compute official university credits and minimum 75% attendance threshold hours based on APSCHE statutory formulas.
                    </p>
                  </div>

                  <div className="space-y-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div>
                      <div className="flex justify-between items-center mb-1 font-bold text-slate-700">
                        <span>Internship Duration (Weeks):</span>
                        <span className="text-[#0E2350] font-black text-sm">{calcWeeks} Weeks</span>
                      </div>
                      <input
                        type="range"
                        min="4"
                        max="24"
                        step="2"
                        value={calcWeeks}
                        onChange={(e) => setCalcWeeks(Number(e.target.value))}
                        className="w-full accent-[#0E2350]"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                        <span>4 Weeks (Short-term)</span>
                        <span>12 Weeks (Semester)</span>
                        <span>24 Weeks (Full-year)</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1 font-bold text-slate-700">
                        <span>Daily Working Hours:</span>
                        <span className="text-[#0E2350] font-black text-sm">{calcHoursPerDay} Hours/Day</span>
                      </div>
                      <input
                        type="range"
                        min="4"
                        max="8"
                        step="1"
                        value={calcHoursPerDay}
                        onChange={(e) => setCalcHoursPerDay(Number(e.target.value))}
                        className="w-full accent-[#0E2350]"
                      />
                    </div>
                  </div>

                  {/* Calculated Results */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-800">Academic Credits</span>
                      <div className="text-2xl font-black text-amber-900 mt-1">
                        {nepCredits} Credits
                      </div>
                      <p className="text-[10px] text-amber-700 mt-1">
                        Recognized across JNTU, Andhra Univ, SVU & Affiliated Colleges.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800">75% Attendance Target</span>
                      <div className="text-2xl font-black text-emerald-900 mt-1">
                        {minAttendanceHours} hrs
                      </div>
                      <p className="text-[10px] text-emerald-700 mt-1">
                        Out of total {totalHours} logged hours across {calcWeeks * 5} working days.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-xs">Statutory Clause:</span>
                      <p className="text-[11px] text-blue-800 mt-0.5">
                        Under APSCHE Directive §1.2, every 30–35 hours of certified industrial internship corresponds to 1 official university credit point.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleSendMessage(`Based on my calculation of ${calcWeeks} weeks (${nepCredits} credits), tell me about available opportunities.`);
                      setActiveTab('chat');
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#0E2350] hover:bg-[#14336F] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <span>Browse Matching Opportunities</span>
                    <ArrowRight className="w-4 h-4 text-[#F07421]" />
                  </button>
                </div>
              )}

              {/* TAB 3: GEOFENCE SIMULATOR & POLICY */}
              {activeTab === 'geofence' && (
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-slate-50 to-white text-xs">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white">
                    <div className="flex items-center gap-2 mb-1.5">
                      <MapPin className="w-5 h-5 text-emerald-400" />
                      <h4 className="font-extrabold text-sm">GPS Geofence Perimeter Rules</h4>
                    </div>
                    <p className="text-emerald-200 text-xs">
                      Managed exclusively by Company Administrators to prevent proxy attendance and enforce genuine industrial training.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Company Admin Exclusive Controls:</span>
                    </div>
                    <ul className="space-y-1.5 text-slate-600 text-[11px] list-disc pl-4">
                      <li><strong>Latitude & Longitude:</strong> Configured at facility main entrance or engineering floor.</li>
                      <li><strong>Radius Bounds:</strong> Typically set between <strong>100m to 250m</strong>.</li>
                      <li><strong>Selfie Camera Telemetry:</strong> Live camera capture is compared with device orientation and GPS lock.</li>
                      <li><strong>Zero Coordinator Override:</strong> Neither college coordinators nor interns can edit geofence coordinates.</li>
                    </ul>
                  </div>

                  {/* Simulator Box */}
                  <div className="p-4 rounded-2xl bg-slate-100 border border-slate-300/80 space-y-3">
                    <span className="font-black text-slate-800 text-xs block">Geofence Distance Simulator:</span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <label className="text-gray-500 block mb-0.5">Facility Radius</label>
                        <select
                          value={simRadius}
                          onChange={(e) => setSimRadius(Number(e.target.value))}
                          className="w-full p-1.5 rounded-lg border border-gray-300 bg-white font-bold"
                        >
                          <option value={100}>100 Meters (Standard)</option>
                          <option value={150}>150 Meters (Tech Park)</option>
                          <option value={250}>250 Meters (Large Campus)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-gray-500 block mb-0.5">Intern Distance</label>
                        <select
                          onChange={(e) => setSimStatus(e.target.value as any)}
                          className="w-full p-1.5 rounded-lg border border-gray-300 bg-white font-bold"
                        >
                          <option value="inside">45 Meters (Inside Perimeter)</option>
                          <option value="outside">380 Meters (Outside - Remote)</option>
                        </select>
                      </div>
                    </div>

                    <div className={`p-3 rounded-xl border font-bold flex items-center gap-2 ${
                      simStatus === 'inside'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}>
                      {simStatus === 'inside' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Check-In Allowed: Verified Inside Geofence ({simRadius}m bound).</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>Check-In Rejected: Device is beyond {simRadius}m facility perimeter.</span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleSendMessage('Explain all attendance rules and 75% cutoff requirements');
                      setActiveTab('chat');
                    }}
                    className="w-full py-2 rounded-xl bg-[#0E2350] hover:bg-[#14336F] text-white font-bold text-xs text-center"
                  >
                    Ask VidyaBot for More Attendance Guidance
                  </button>
                </div>
              )}

              {/* TAB 4: TOPIC INDEX & GUIDES */}
              {activeTab === 'guide' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50 to-white text-xs">
                  <div className="text-slate-500 text-[11px] font-bold mb-1">
                    Select a topic to query the official AP VidyaConnect intelligence engine:
                  </div>

                  {KNOWLEDGE_BASE.map((topic, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        handleSendMessage(`Explain ${topic.title}`);
                        setActiveTab('chat');
                      }}
                      className="p-3 bg-white rounded-xl border border-slate-200 hover:border-[#0E2350] hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div>
                        <h5 className="font-bold text-slate-800 group-hover:text-[#0E2350] transition-colors">
                          {topic.title}
                        </h5>
                        <div className="flex gap-1 mt-1">
                          {topic.badges?.slice(0, 2).map((b, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded text-[9px] bg-slate-100 text-slate-600 font-semibold">
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#F07421] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};
