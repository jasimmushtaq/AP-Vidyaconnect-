-- ============================================================================
-- AP VIDYACONNECT — MIGRATION 004: STUDENT ACTIVATION, EMAIL LOGS & RLS
-- ============================================================================

-- 1. Ensure students table has all required columns
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS internship_batch_id UUID REFERENCES internship_batches(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS account_status VARCHAR(50) NOT NULL DEFAULT 'active',
ADD COLUMN IF NOT EXISTS first_login_completed BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS temp_password_issued_at TIMESTAMPTZ;

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_students_auth_user ON students(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_students_batch ON students(internship_batch_id);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);

-- 2. Ensure internship_batches has activated_at and stipend column alias
ALTER TABLE internship_batches 
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS stipend NUMERIC(10,2) DEFAULT 0;

-- Sync stipend with stipend_amount if not already set
UPDATE internship_batches 
SET stipend = stipend_amount 
WHERE stipend IS NULL OR stipend = 0;

-- 3. Create email_logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_type VARCHAR(100) NOT NULL DEFAULT 'student_batch_activation',
  batch_id UUID REFERENCES internship_batches(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending' | 'sent' | 'failed'
  resend_message_id VARCHAR(255),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_batch ON email_logs(batch_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_student ON email_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);

-- 4. Enable RLS on email_logs
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- 5. Row Level Security Policies for email_logs

-- Admins: View all logs
DROP POLICY IF EXISTS "Super admin view all email logs" ON email_logs;
CREATE POLICY "Super admin view all email logs" ON email_logs
  FOR SELECT
  USING (
    COALESCE(
      auth.jwt() ->> 'user_role',
      (SELECT role::text FROM profiles WHERE id = auth.uid())
    ) = 'super_admin'
  );

-- Companies: View email logs for batches owned by their company
DROP POLICY IF EXISTS "Company view batch email logs" ON email_logs;
CREATE POLICY "Company view batch email logs" ON email_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM internship_batches ib
      WHERE ib.id = email_logs.batch_id
      AND ib.company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Institutions: View email logs for batches originating from their institution
DROP POLICY IF EXISTS "Institution view batch email logs" ON email_logs;
CREATE POLICY "Institution view batch email logs" ON email_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM internship_batches ib
      WHERE ib.id = email_logs.batch_id
      AND ib.institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid())
    )
  );


-- 6. Strict RLS Policies on Attendance:
-- Students can ONLY SELECT (View) their own attendance. No INSERT, UPDATE, or DELETE permitted for students.

DROP POLICY IF EXISTS "Attendance read policy" ON attendance;
CREATE POLICY "Attendance read policy" ON attendance
  FOR SELECT
  USING (
    student_id = (SELECT student_id FROM profiles WHERE id = auth.uid()) OR
    student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM internship_batches ib
      WHERE ib.id = attendance.batch_id AND (
        ib.institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid()) OR
        ib.company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()) OR
        COALESCE(auth.jwt() ->> 'user_role', (SELECT role::text FROM profiles WHERE id = auth.uid())) = 'super_admin'
      )
    )
  );

-- Companies & Mentors can insert/update attendance for their own batches
DROP POLICY IF EXISTS "Company and Mentor mark attendance" ON attendance;
CREATE POLICY "Company and Mentor mark attendance" ON attendance
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM internship_batches ib
      WHERE ib.id = attendance.batch_id 
      AND ib.company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    ) OR
    COALESCE(auth.jwt() ->> 'user_role', (SELECT role::text FROM profiles WHERE id = auth.uid())) = 'super_admin'
  );

DROP POLICY IF EXISTS "Company and Mentor update attendance" ON attendance;
CREATE POLICY "Company and Mentor update attendance" ON attendance
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM internship_batches ib
      WHERE ib.id = attendance.batch_id 
      AND ib.company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    ) OR
    COALESCE(auth.jwt() ->> 'user_role', (SELECT role::text FROM profiles WHERE id = auth.uid())) = 'super_admin'
  );

-- 7. RLS on Students:
DROP POLICY IF EXISTS "Students self read" ON students;
CREATE POLICY "Students self read" ON students
  FOR SELECT
  USING (
    auth_user_id = auth.uid() OR
    id = (SELECT student_id FROM profiles WHERE id = auth.uid()) OR
    institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid()) OR
    COALESCE(auth.jwt() ->> 'user_role', (SELECT role::text FROM profiles WHERE id = auth.uid())) = 'super_admin' OR
    EXISTS (
      SELECT 1 FROM internship_students is_tab
      JOIN internship_batches ib ON ib.id = is_tab.batch_id
      WHERE is_tab.student_id = students.id
      AND ib.company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    )
  );
