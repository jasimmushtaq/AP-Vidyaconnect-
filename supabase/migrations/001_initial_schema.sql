-- ============================================================================
-- KAUSHAL DISHA (कौशल दिशा) — DATABASE INITIAL SCHEMA (001_initial_schema.sql)
-- Complete 34 tables, enums, indexes, constraints, triggers & audit logs
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. Custom Types / Enums
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'institution_admin',
  'faculty_coordinator',
  'company_admin',
  'mentor',
  'student'
);

CREATE TYPE institution_type AS ENUM (
  'govt_degree_college',
  'govt_polytechnic',
  'govt_intermediate_college',
  'govt_university',
  'autonomous_govt_institute'
);

CREATE TYPE verification_status AS ENUM (
  'pending',
  'under_verification',
  'verified',
  'rejected'
);

CREATE TYPE proposal_status AS ENUM (
  'draft',
  'submitted',
  'under_company_review',
  'modification_requested',
  'company_accepted',
  'company_accepted_with_changes',
  'rejected',
  'institution_accepted',
  'declined'
);

CREATE TYPE batch_status AS ENUM (
  'created',
  'students_confirmed',
  'active',
  'completed',
  'certificate_issued'
);

CREATE TYPE attendance_status AS ENUM (
  'present',
  'absent',
  'half_day',
  'leave',
  'holiday'
);

CREATE TYPE task_status AS ENUM (
  'pending',
  'in_progress',
  'submitted',
  'under_review',
  'completed'
);

CREATE TYPE internship_mode AS ENUM (
  'onsite',
  'remote',
  'hybrid'
);

CREATE TYPE notification_type AS ENUM (
  'proposal_submitted',
  'proposal_reviewed',
  'modification_requested',
  'proposal_accepted',
  'proposal_rejected',
  'batch_created',
  'student_onboarded',
  'task_assigned',
  'task_submitted',
  'task_reviewed',
  'attendance_marked',
  'attendance_corrected',
  'evaluation_completed',
  'certificate_issued',
  'system_alert'
);

-- 2. Updated At Trigger Function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Core Tables

-- Institutions
CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type institution_type NOT NULL,
  affiliated_university VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  district VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL DEFAULT 'Telangana',
  pin_code VARCHAR(10) NOT NULL,
  principal_name VARCHAR(150) NOT NULL,
  official_email VARCHAR(255) UNIQUE NOT NULL,
  official_phone VARCHAR(20) NOT NULL,
  website VARCHAR(255),
  establishment_year INT NOT NULL,
  accreditation VARCHAR(100),
  verification_status verification_status NOT NULL DEFAULT 'pending',
  verification_notes TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Companies
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cin VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  sector VARCHAR(100) NOT NULL,
  gst VARCHAR(50),
  official_email VARCHAR(255) UNIQUE NOT NULL,
  official_phone VARCHAR(20) NOT NULL,
  website VARCHAR(255),
  headquarters VARCHAR(255) NOT NULL,
  description TEXT,
  authorized_person_name VARCHAR(150) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  verification_status verification_status NOT NULL DEFAULT 'pending',
  verification_notes TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY, -- FK to auth.users
  full_name VARCHAR(200) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  role user_role NOT NULL,
  institution_id UUID REFERENCES institutions(id) ON DELETE RESTRICT,
  company_id UUID REFERENCES companies(id) ON DELETE RESTRICT,
  student_id UUID, -- self reference to students table
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Departments
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(50) NOT NULL,
  head_name VARCHAR(150),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Courses
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  duration_years INT NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Students
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  roll_number VARCHAR(100) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  gender VARCHAR(20),
  year_of_study INT NOT NULL DEFAULT 3,
  cgpa NUMERIC(4,2),
  resume_url TEXT,
  photo_url TEXT,
  is_placed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_student_roll UNIQUE (institution_id, roll_number)
);

-- Student Skills
CREATE TABLE student_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  skill_name VARCHAR(100) NOT NULL,
  proficiency_level VARCHAR(50) DEFAULT 'Intermediate'
);

-- Mentors
CREATE TABLE mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name VARCHAR(150) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  department VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Internship Proposals
CREATE TABLE internship_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_code VARCHAR(100) UNIQUE NOT NULL,
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  domain VARCHAR(150) NOT NULL,
  internship_type VARCHAR(100) NOT NULL DEFAULT 'Full-time',
  mode internship_mode NOT NULL DEFAULT 'onsite',
  duration_weeks INT NOT NULL DEFAULT 12,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  stipend_requested NUMERIC(10,2) DEFAULT 0,
  objectives TEXT NOT NULL,
  additional_terms TEXT,
  status proposal_status NOT NULL DEFAULT 'draft',
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Proposal Students
CREATE TABLE proposal_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES internship_proposals(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  is_accepted_by_company BOOLEAN DEFAULT NULL,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_proposal_student UNIQUE (proposal_id, student_id)
);

-- Proposal Versions
CREATE TABLE proposal_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES internship_proposals(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  snapshot JSONB NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  change_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sequence for batch numbering
CREATE SEQUENCE IF NOT EXISTS batch_counter_seq START WITH 1;

-- Internship Batches
CREATE TABLE internship_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_code VARCHAR(100) UNIQUE NOT NULL, -- KD-{YYYY}-{COMPANY_CODE}-{INSTITUTION_CODE}-{NNN}
  proposal_id UUID NOT NULL REFERENCES internship_proposals(id) ON DELETE RESTRICT,
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  mentor_id UUID REFERENCES mentors(id) ON DELETE SET NULL,
  faculty_coordinator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  domain VARCHAR(150) NOT NULL,
  mode internship_mode NOT NULL DEFAULT 'onsite',
  stipend_amount NUMERIC(10,2) DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  working_hours VARCHAR(100) DEFAULT '9:30 AM - 5:30 PM',
  location VARCHAR(255),
  status batch_status NOT NULL DEFAULT 'created',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Internship Students (Confirmed batch members)
CREATE TABLE internship_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES internship_batches(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
  has_joined BOOLEAN NOT NULL DEFAULT FALSE,
  joined_at TIMESTAMPTZ,
  consent_recorded_at TIMESTAMPTZ,
  consent_ip VARCHAR(50),
  completion_status VARCHAR(50) DEFAULT 'in_progress',
  final_score NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_batch_student UNIQUE (batch_id, student_id)
);

-- Attendance
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES internship_batches(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status attendance_status NOT NULL DEFAULT 'present',
  marked_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_attendance_student_date UNIQUE (student_id, date)
);

-- Attendance Corrections
CREATE TABLE attendance_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id UUID NOT NULL REFERENCES attendance(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES profiles(id),
  previous_status attendance_status NOT NULL,
  requested_status attendance_status NOT NULL,
  reason TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT NULL,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES internship_batches(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  status task_status NOT NULL DEFAULT 'pending',
  attachments JSONB DEFAULT '[]'::jsonb,
  expected_output TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Task Submissions
CREATE TABLE task_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  submission_text TEXT,
  links JSONB DEFAULT '[]'::jsonb,
  github_repo_url TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  score NUMERIC(5,2),
  feedback TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ
);

-- Performance Evaluations
CREATE TABLE performance_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES internship_batches(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  evaluated_by UUID NOT NULL REFERENCES profiles(id),
  evaluation_type VARCHAR(50) NOT NULL DEFAULT 'final', -- 'mid_term' | 'final'
  technical_skills_score INT NOT NULL CHECK (technical_skills_score BETWEEN 1 AND 10),
  communication_score INT NOT NULL CHECK (communication_score BETWEEN 1 AND 10),
  teamwork_score INT NOT NULL CHECK (teamwork_score BETWEEN 1 AND 10),
  problem_solving_score INT NOT NULL CHECK (problem_solving_score BETWEEN 1 AND 10),
  discipline_score INT NOT NULL CHECK (discipline_score BETWEEN 1 AND 10),
  attendance_score INT NOT NULL CHECK (attendance_score BETWEEN 1 AND 10),
  task_completion_score INT NOT NULL CHECK (task_completion_score BETWEEN 1 AND 10),
  learning_ability_score INT NOT NULL CHECK (learning_ability_score BETWEEN 1 AND 10),
  professionalism_score INT NOT NULL CHECK (professionalism_score BETWEEN 1 AND 10),
  weighted_overall_score NUMERIC(5,2) NOT NULL,
  written_feedback TEXT,
  mentor_recommendation VARCHAR(50) DEFAULT 'Recommended for Hire',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Documents (Cloudinary Media Registry)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  folder_kind VARCHAR(100) NOT NULL,
  cloudinary_public_id VARCHAR(255) NOT NULL,
  cloudinary_version VARCHAR(50),
  resource_type VARCHAR(50) NOT NULL DEFAULT 'image',
  format VARCHAR(50) NOT NULL,
  bytes BIGINT NOT NULL,
  width INT,
  height INT,
  original_filename VARCHAR(255) NOT NULL,
  is_private BOOLEAN NOT NULL DEFAULT TRUE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Certificates
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_code VARCHAR(100) UNIQUE NOT NULL,
  batch_id UUID NOT NULL REFERENCES internship_batches(id) ON DELETE RESTRICT,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  qr_code_url TEXT NOT NULL,
  document_url TEXT,
  verification_hash VARCHAR(255) NOT NULL,
  is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit Logs (INSERT ONLY — IMMUTABLE)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id),
  actor_role user_role,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  before JSONB,
  after JSONB,
  ip VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Platform Settings
CREATE TABLE platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name VARCHAR(100) NOT NULL DEFAULT 'Kaushal Disha',
  platform_subtitle VARCHAR(255) NOT NULL DEFAULT 'Institution–Industry Internship Management & Collaboration Platform',
  allow_self_registration BOOLEAN NOT NULL DEFAULT TRUE,
  maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
  support_email VARCHAR(255) NOT NULL DEFAULT 'support@kaushaldisha.gov.in',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Triggers for updated_at
CREATE TRIGGER trg_institutions_updated_at BEFORE UPDATE ON institutions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_internship_proposals_updated_at BEFORE UPDATE ON internship_proposals FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_internship_batches_updated_at BEFORE UPDATE ON internship_batches FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 5. Performance & Search Indexes
CREATE INDEX idx_proposals_status_company ON internship_proposals(status, company_id);
CREATE INDEX idx_proposals_status_institution ON internship_proposals(status, institution_id);
CREATE INDEX idx_attendance_batch_date ON attendance(batch_id, date);
CREATE INDEX idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX idx_tasks_batch_status ON tasks(batch_id, status);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read_at);
CREATE INDEX idx_audit_logs_entity_created ON audit_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX idx_companies_name_trgm ON companies USING gin (name gin_trgm_ops);
CREATE INDEX idx_institutions_name_trgm ON institutions USING gin (name gin_trgm_ops);
