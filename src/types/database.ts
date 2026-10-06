// ============================================================================
// AP VIDYACONNECT — DATABASE TYPES & ENUMS
// ============================================================================

export type UserRole = 
  | 'super_admin'
  | 'institution_admin'
  | 'faculty_coordinator'
  | 'company_admin'
  | 'mentor'
  | 'student';

export type InstitutionType = 
  | 'govt_degree_college'
  | 'govt_polytechnic'
  | 'govt_intermediate_college'
  | 'govt_university'
  | 'autonomous_govt_institute';

export type VerificationStatus = 
  | 'pending'
  | 'under_verification'
  | 'verified'
  | 'rejected';

export type ProposalStatus = 
  | 'draft'
  | 'submitted'
  | 'under_company_review'
  | 'modification_requested'
  | 'company_accepted'
  | 'company_accepted_with_changes'
  | 'rejected'
  | 'institution_accepted'
  | 'declined';

export type BatchStatus = 
  | 'created'
  | 'students_confirmed'
  | 'active'
  | 'completed'
  | 'certificate_issued';

export type AttendanceStatus = 
  | 'present'
  | 'late'
  | 'absent'
  | 'half_day'
  | 'leave'
  | 'holiday';

export type TaskStatus = 
  | 'pending'
  | 'in_progress'
  | 'submitted'
  | 'under_review'
  | 'completed';

export type InternshipMode = 'onsite' | 'remote' | 'hybrid';

export type NotificationType = 
  | 'proposal_submitted'
  | 'proposal_reviewed'
  | 'modification_requested'
  | 'proposal_accepted'
  | 'proposal_rejected'
  | 'mou_created'
  | 'mou_sent'
  | 'mou_accepted'
  | 'mou_changes_requested'
  | 'mou_rejected'
  | 'mou_signed'
  | 'mou_active'
  | 'batch_created'
  | 'student_onboarded'
  | 'task_assigned'
  | 'task_submitted'
  | 'task_reviewed'
  | 'attendance_marked'
  | 'attendance_alert'
  | 'ATTENDANCE_MARKED'
  | 'attendance_corrected'
  | 'evaluation_completed'
  | 'certificate_issued'
  | 'system_alert';

export interface AttachedDocument {
  id: string;
  name: string;
  url: string;
  file_type?: string;
  file_size?: string;
  category?: string;
  uploaded_at: string;
  uploaded_by?: string;
}

export interface Institution {
  id: string;
  code: string;
  name: string;
  type: InstitutionType;
  aishe_code?: string;
  city?: string;
  affiliated_university: string;
  address: string;
  district: string;
  state: string;
  pin_code: string;
  principal_name: string;
  official_email: string;
  official_phone: string;
  website?: string;
  establishment_year: number;
  accreditation?: string;
  verification_status: VerificationStatus;
  verification_notes?: string;
  logo_url?: string;
  document_url?: string;
  document_name?: string;
  documents?: AttachedDocument[];
  created_at: string;
}

export interface Company {
  id: string;
  cin: string;
  name: string;
  industry: string;
  sector: string;
  gst?: string;
  official_email: string;
  official_phone: string;
  website?: string;
  headquarters: string;
  description?: string;
  authorized_person_name: string;
  designation: string;
  verification_status: VerificationStatus;
  verification_notes?: string;
  logo_url?: string;
  document_url?: string;
  document_name?: string;
  documents?: AttachedDocument[];
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  institution_id?: string;
  company_id?: string;
  student_id?: string;
  is_active: boolean;
  created_at: string;
}

export interface Department {
  id: string;
  institution_id: string;
  name: string;
  code: string;
  head_name?: string;
}

export interface Course {
  id: string;
  department_id: string;
  name: string;
  duration_years: number;
}

export interface Student {
  id: string;
  institution_id: string;
  department_id?: string;
  course_id?: string;
  roll_number: string;
  full_name: string;
  email: string;
  phone: string;
  gender: string;
  year_of_study: number;
  cgpa: number;
  resume_url?: string;
  photo_url?: string;
  is_placed: boolean;
  skills?: string[];
  auth_user_id?: string;
  internship_batch_id?: string;
  account_status?: 'active' | 'inactive';
  first_login_completed?: boolean;
  temp_password?: string;
  created_at: string;
  updated_at?: string;
}

export interface FacultyCoordinator {
  id: string;
  institution_id: string;
  user_id?: string;
  full_name: string;
  department: string;
  designation: string;
  email: string;
  phone: string;
  is_active: boolean;
  assigned_batches_count?: number;
  created_at: string;
}

export interface Mentor {
  id: string;
  company_id: string;
  user_id?: string;
  full_name: string;
  designation: string;
  email: string;
  phone: string;
  department?: string;
  is_active: boolean;
  assigned_batches?: string[];
  created_at?: string;
}

export interface InternshipOpportunity {
  id: string;
  company_id: string;
  company?: Company;
  title: string;
  domain: string;
  internship_type?: string;
  description: string;
  responsibilities?: string[];
  learning_outcomes?: string[];
  eligible_degrees?: string[];
  eligible_branches?: string[];
  min_cgpa?: number;
  perks?: string[];
  mode: InternshipMode;
  location: string;
  stipend_amount?: number;
  stipend_range: string;
  duration_weeks: number;
  seats: number;
  skills_required: string[];
  start_date?: string;
  application_deadline?: string;
  target_institutions?: string;
  status?: 'active' | 'closed' | 'draft';
  is_active?: boolean;
  created_at: string;
}

export interface ProposalStudent {
  id: string;
  proposal_id: string;
  student_id: string;
  student?: Student;
  is_accepted_by_company?: boolean | null;
  rejection_reason?: string;
}

export interface ProposalVersion {
  id: string;
  proposal_id: string;
  version_number: number;
  snapshot: any;
  changed_by?: string;
  changed_by_name?: string;
  change_summary?: string;
  created_at: string;
}

export interface InternshipProposal {
  id: string;
  proposal_code: string;
  institution_id: string;
  institution?: Institution;
  company_id: string;
  company?: Company;
  created_by: string;
  created_by_name?: string;
  domain: string;
  internship_type: string;
  mode: InternshipMode;
  duration_weeks: number;
  start_date: string;
  end_date: string;
  stipend_requested: number;
  objectives: string;
  additional_terms?: string;
  status: ProposalStatus;
  version: number;
  students?: ProposalStudent[];
  versions?: ProposalVersion[];
  created_at: string;
  updated_at: string;
}

export interface InternshipBatch {
  id: string;
  batch_code: string; // KD-{YYYY}-{COMPANY}-{INST}-{NNN}
  proposal_id: string;
  institution_id: string;
  institution?: Institution;
  company_id: string;
  company?: Company;
  mentor_id?: string;
  mentor?: Mentor;
  faculty_coordinator_id?: string;
  title: string;
  domain: string;
  mode: InternshipMode;
  stipend_amount: number;
  start_date: string;
  end_date: string;
  working_hours: string;
  location: string;
  status: BatchStatus;
  stipend?: number;
  activated_at?: string;
  students?: InternshipStudent[];
  email_logs?: EmailLog[];
  attendance_settings?: BatchAttendanceSettings;
  created_at: string;
  updated_at: string;
}

export interface BatchAttendanceSettings {
  id: string;
  internship_batch_id: string;
  company_id: string;
  location_name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius_meters: number; // 50, 100, 200, 500, or custom
  start_time: string; // "09:00" or "09:00:00"
  end_time: string; // "10:30" or "10:30:00"
  allow_late: boolean;
  late_after_time?: string; // "10:30"
  working_days: string[]; // ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceAuditLog {
  id: string;
  batch_id: string;
  coordinator_id?: string;
  coordinator_name?: string;
  action: 'create_settings' | 'change_coordinates' | 'change_radius' | 'change_timing' | 'change_working_days' | 'toggle_active';
  old_value?: any;
  new_value?: any;
  timestamp: string;
}

export interface EmailLog {
  id: string;
  campaign_type: string;
  batch_id?: string;
  student_id?: string;
  recipient_email: string;
  student_name?: string;
  subject: string;
  status: 'pending' | 'sent' | 'failed';
  resend_message_id?: string;
  error_message?: string;
  sent_at?: string;
  created_at: string;
}

export interface InternshipStudent {
  id: string;
  batch_id: string;
  student_id: string;
  student?: Student;
  has_joined: boolean;
  joined_at?: string;
  consent_recorded_at?: string;
  completion_status: string; // 'in_progress' | 'completed' | 'withdrawn'
  final_score?: number;
}

export interface AttendanceRecord {
  id: string;
  batch_id: string;
  internship_batch_id?: string;
  student_id: string;
  student?: Student;
  company_id?: string;
  institution_id?: string;
  date: string;
  attendance_date?: string;
  status: AttendanceStatus;
  marked_by?: string;
  notes?: string;
  check_in_time?: string;
  latitude?: number;
  longitude?: number;
  gps_accuracy?: number;
  distance_meters?: number;
  distance_from_company?: number;
  face_verification_status?: 'verified' | 'failed' | 'manual' | 'pending';
  liveness_status?: 'passed' | 'failed' | 'not_supported';
  selfie_url?: string;
  selfie_storage_path?: string;
  verification_attempt_id?: string;
  is_late?: boolean;
  source?: 'self_check_in' | 'manual_override' | 'bulk_upload';
  created_at: string;
}

export interface SelfAttendanceRequest {
  batch_id: string;
  student_id: string;
  latitude: number;
  longitude: number;
  gps_accuracy: number;
  selfie_base64?: string;
  face_detected: boolean;
  liveness_verified: boolean;
  attempt_id: string;
}

export interface SelfAttendanceResult {
  success: boolean;
  status?: AttendanceStatus;
  check_in_time?: string;
  record?: AttendanceRecord;
  message: string;
  distance_meters?: number;
  allowed_radius?: number;
  is_late?: boolean;
  error_code?:
    | 'ALREADY_MARKED'
    | 'PERMISSION_DENIED'
    | 'OUTSIDE_GEOFENCE'
    | 'LOW_GPS_ACCURACY'
    | 'OUTSIDE_HOURS'
    | 'NON_WORKING_DAY'
    | 'ATTENDANCE_INACTIVE'
    | 'FACE_NOT_DETECTED'
    | 'MULTIPLE_FACES'
    | 'FACE_VERIFICATION_FAILED'
    | 'BATCH_INACTIVE'
    | 'NOT_ENROLLED'
    | 'SERVER_ERROR';
}

export interface AttendanceCorrection {
  id: string;
  attendance_id: string;
  requested_by: string;
  requested_by_name: string;
  previous_status: AttendanceStatus;
  requested_status: AttendanceStatus;
  reason: string;
  is_approved?: boolean | null;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface Task {
  id: string;
  batch_id: string;
  created_by: string;
  created_by_name?: string;
  title: string;
  description: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  status: TaskStatus;
  expected_output?: string;
  attachments?: { name: string; url: string; size: string }[];
  submissions?: TaskSubmission[];
  created_at: string;
}

export interface TaskSubmission {
  id: string;
  task_id: string;
  student_id: string;
  student?: Student;
  submission_text?: string;
  links?: string[];
  github_repo_url?: string;
  attachments?: { name: string; url: string; size: string }[];
  submitted_at: string;
  score?: number;
  feedback?: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface PerformanceEvaluation {
  id: string;
  batch_id: string;
  student_id: string;
  student?: Student;
  evaluated_by: string;
  evaluated_by_name?: string;
  evaluation_type: 'mid_term' | 'final';
  technical_skills_score: number; // 1-10
  communication_score: number;
  teamwork_score: number;
  problem_solving_score: number;
  discipline_score: number;
  attendance_score: number;
  task_completion_score: number;
  learning_ability_score: number;
  professionalism_score: number;
  weighted_overall_score: number;
  written_feedback: string;
  mentor_recommendation: string;
  created_at: string;
}

export interface DocumentAsset {
  id: string;
  entity_type: string;
  entity_id: string;
  folder_kind: string;
  cloudinary_public_id: string;
  format: string;
  bytes: number;
  original_filename: string;
  is_private: boolean;
  uploaded_by: string;
  institution_id?: string;
  company_id?: string;
  student_id?: string;
  created_at: string;
}

export interface Certificate {
  id: string;
  certificate_code: string; // KD-CERT-2027-XXXX
  batch_id: string;
  batch?: InternshipBatch;
  student_id: string;
  student?: Student;
  institution_id: string;
  institution?: Institution;
  company_id: string;
  company?: Company;
  issue_date: string;
  qr_code_url: string;
  document_url?: string;
  verification_hash: string;
  is_revoked: boolean;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  recipient_user_id?: string;
  recipient_role?: string;
  notification_type?: string;
  type: NotificationType;
  title: string;
  message: string;
  attendance_id?: string;
  link_url?: string;
  is_read: boolean;
  read_at?: string;
  metadata?: any;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  actor_name?: string;
  actor_role?: UserRole;
  action: string;
  entity_type: string;
  entity_id: string;
  before?: any;
  after?: any;
  ip?: string;
  created_at: string;
}

export interface AnnouncementBanner {
  id: string;
  title: string;
  vertical_tag?: string; // e.g. "Aaj Intern,"
  subtitle?: string;
  bullet_points: string[];
  pill_badge?: string; // e.g. "Financial assistance: Min. ₹9000/month | Internship duration - 6 / 9 months | Youth between 18-25 can apply"
  link_url?: string;
  link_label?: string;
  gradient_theme: 'saffron_red' | 'ocean_blue' | 'emerald_teal' | 'royal_purple' | 'midnight_gold';
  image_url?: string;
  banner_type?: 'full_graphic' | 'card_template';
  image_fit?: 'cover' | 'contain';
  image_bg?: 'white' | 'transparent' | 'frame';
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export type MoUStatus = 
  | 'draft'
  | 'sent_to_college'
  | 'changes_requested'
  | 'college_accepted'
  | 'company_signed'
  | 'college_signed'
  | 'active'
  | 'rejected'
  | 'terminated';

export interface MoUSignature {
  signed_by_name: string;
  designation: string;
  signature_type: 'digital_draw' | 'typed' | 'digital_seal';
  signature_data?: string;
  signed_at: string;
  ip_address?: string;
  verification_seal?: string;
}

export interface MoUFeedbackItem {
  id: string;
  sender_role: string;
  sender_name: string;
  action: 'requested_changes' | 'accepted' | 'rejected' | 'signed' | 'created' | 'sent';
  message: string;
  timestamp: string;
}

export interface MoUClauseSet {
  cooperation?: string;
  industrial_training_visits?: string;
  guest_lectures?: string;
  placement_support?: string;
  financial_terms?: string;
  approvals_licenses?: string;
  validity_duration?: string;
  relationship_terms?: string;
  custom_clauses?: { title: string; content: string }[];
}

export interface MoUAgreement {
  id: string;
  mou_code: string; // e.g. MOU-2026-PW-UDC-001
  company_id: string;
  company?: Company;
  institution_id: string;
  institution?: Institution;
  created_by: string;
  created_by_name: string;

  // Format parameters matching official document
  effective_day: string; // "21"
  effective_month: string; // "April"
  effective_year: string; // "2026"
  effective_date: string; // "2026-04-21"

  first_party_name: string; // "UNITY DEGREE COLLEGE"
  first_party_rep_title: string; // "Principal / Director / Head of Department"
  first_party_rep_name: string; // "Dr. K. S. Rao"

  second_party_name: string; // "PIXELWIND TECHNOLOGIES"
  second_party_rep_title: string; // "Centre Head / Director / Managing Director"
  second_party_rep_name: string; // "G Ram Prasad"

  areas_of_cooperation: string[]; // ["Skill Based Training", "Education", "Placement", "Industrial Visit", "Expert Lecture"]
  company_specialization: string; // "Internships on Digital Marketing, Full Stack Developer and Machine Learning"

  clauses: MoUClauseSet;
  validity_years: number;
  status: MoUStatus;

  first_party_signature?: MoUSignature | null;
  second_party_signature?: MoUSignature | null;

  feedback_history: MoUFeedbackItem[];

  email_sent: boolean;
  email_recipient?: string;
  email_sent_at?: string;
  email_message_id?: string;

  created_at: string;
  updated_at: string;
}

