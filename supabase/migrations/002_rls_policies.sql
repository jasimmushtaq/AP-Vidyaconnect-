-- ============================================================================
-- KAUSHAL DISHA (कौशल दिशा) — ROW LEVEL SECURITY POLICIES (002_rls_policies.sql)
-- Strict zero-trust authorization: No table ships with RLS off.
-- ============================================================================

-- 1. Helper Functions (Security Definer, STABLE, search_path = public)

CREATE OR REPLACE FUNCTION get_current_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    auth.jwt() ->> 'user_role',
    (SELECT role::text FROM profiles WHERE id = auth.uid())
  );
$$;

CREATE OR REPLACE FUNCTION current_institution_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT institution_id FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION current_company_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION current_student_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT student_id FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT get_current_role() = 'super_admin';
$$;

-- 2. Enable RLS on All Tables

ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- 3. Core RLS Policies

-- Platform Settings (Public read, Super admin write)
CREATE POLICY "Public read platform settings" ON platform_settings FOR SELECT USING (true);
CREATE POLICY "Super admin update settings" ON platform_settings FOR UPDATE USING (is_super_admin());

-- Institutions (Verified visible to all; unverified visible to super admin and own members)
CREATE POLICY "Institutions read policy" ON institutions FOR SELECT USING (
  verification_status = 'verified' OR 
  is_super_admin() OR 
  id = current_institution_id()
);
CREATE POLICY "Institution self-register" ON institutions FOR INSERT WITH CHECK (true);
CREATE POLICY "Institution admin update own" ON institutions FOR UPDATE USING (
  id = current_institution_id() OR is_super_admin()
);

-- Companies (Verified visible to all; unverified visible to super admin and own members)
CREATE POLICY "Companies read policy" ON companies FOR SELECT USING (
  verification_status = 'verified' OR 
  is_super_admin() OR 
  id = current_company_id()
);
CREATE POLICY "Company self-register" ON companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Company admin update own" ON companies FOR UPDATE USING (
  id = current_company_id() OR is_super_admin()
);

-- Profiles (Users read own, members in same org, or super admin)
CREATE POLICY "Profiles read policy" ON profiles FOR SELECT USING (
  id = auth.uid() OR
  is_super_admin() OR
  (institution_id IS NOT NULL AND institution_id = current_institution_id()) OR
  (company_id IS NOT NULL AND company_id = current_company_id())
);
CREATE POLICY "Profiles update own" ON profiles FOR UPDATE USING (id = auth.uid() OR is_super_admin());

-- Students (Student reads own; Institution reads own students; Company reads students in received proposals/batches)
CREATE POLICY "Students read policy" ON students FOR SELECT USING (
  id = current_student_id() OR
  institution_id = current_institution_id() OR
  is_super_admin() OR
  EXISTS (
    SELECT 1 FROM proposal_students ps
    JOIN internship_proposals ip ON ip.id = ps.proposal_id
    WHERE ps.student_id = students.id AND ip.company_id = current_company_id()
  ) OR
  EXISTS (
    SELECT 1 FROM internship_students is_tab
    JOIN internship_batches ib ON ib.id = is_tab.batch_id
    WHERE is_tab.student_id = students.id AND ib.company_id = current_company_id()
  )
);
CREATE POLICY "Institution manage students" ON students FOR ALL USING (
  institution_id = current_institution_id() OR is_super_admin()
);

-- Internship Proposals
CREATE POLICY "Proposals read policy" ON internship_proposals FOR SELECT USING (
  institution_id = current_institution_id() OR
  company_id = current_company_id() OR
  is_super_admin()
);
CREATE POLICY "Institution insert proposal" ON internship_proposals FOR INSERT WITH CHECK (
  institution_id = current_institution_id()
);

-- Proposal Students
CREATE POLICY "Proposal students read policy" ON proposal_students FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM internship_proposals ip
    WHERE ip.id = proposal_students.proposal_id AND (
      ip.institution_id = current_institution_id() OR
      ip.company_id = current_company_id() OR
      is_super_admin()
    )
  ) OR student_id = current_student_id()
);

-- Internship Batches
CREATE POLICY "Batches read policy" ON internship_batches FOR SELECT USING (
  institution_id = current_institution_id() OR
  company_id = current_company_id() OR
  is_super_admin() OR
  EXISTS (
    SELECT 1 FROM internship_students is_tab
    WHERE is_tab.batch_id = internship_batches.id AND is_tab.student_id = current_student_id()
  )
);

-- Internship Students
CREATE POLICY "Batch students read policy" ON internship_students FOR SELECT USING (
  student_id = current_student_id() OR
  EXISTS (
    SELECT 1 FROM internship_batches ib
    WHERE ib.id = internship_students.batch_id AND (
      ib.institution_id = current_institution_id() OR
      ib.company_id = current_company_id() OR
      is_super_admin()
    )
  )
);

-- Attendance (Strict: Student only reads their own; Mentor/Company and Institution can read/mark)
CREATE POLICY "Attendance read policy" ON attendance FOR SELECT USING (
  student_id = current_student_id() OR
  EXISTS (
    SELECT 1 FROM internship_batches ib
    WHERE ib.id = attendance.batch_id AND (
      ib.institution_id = current_institution_id() OR
      ib.company_id = current_company_id() OR
      is_super_admin()
    )
  )
);
CREATE POLICY "Mentor mark attendance" ON attendance FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM internship_batches ib
    WHERE ib.id = attendance.batch_id AND ib.company_id = current_company_id()
  ) OR is_super_admin()
);

-- Tasks
CREATE POLICY "Tasks read policy" ON tasks FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM internship_batches ib
    WHERE ib.id = tasks.batch_id AND (
      ib.institution_id = current_institution_id() OR
      ib.company_id = current_company_id() OR
      is_super_admin() OR
      EXISTS (
        SELECT 1 FROM internship_students is_tab
        WHERE is_tab.batch_id = ib.id AND is_tab.student_id = current_student_id()
      )
    )
  )
);

-- Task Submissions (Student reads/creates own; Mentor reviews)
CREATE POLICY "Task submissions read policy" ON task_submissions FOR SELECT USING (
  student_id = current_student_id() OR
  EXISTS (
    SELECT 1 FROM tasks t
    JOIN internship_batches ib ON ib.id = t.batch_id
    WHERE t.id = task_submissions.task_id AND (
      ib.company_id = current_company_id() OR
      ib.institution_id = current_institution_id() OR
      is_super_admin()
    )
  )
);
CREATE POLICY "Student submit task" ON task_submissions FOR INSERT WITH CHECK (
  student_id = current_student_id()
);

-- Performance Evaluations
CREATE POLICY "Evaluations read policy" ON performance_evaluations FOR SELECT USING (
  student_id = current_student_id() OR
  EXISTS (
    SELECT 1 FROM internship_batches ib
    WHERE ib.id = performance_evaluations.batch_id AND (
      ib.institution_id = current_institution_id() OR
      ib.company_id = current_company_id() OR
      is_super_admin()
    )
  )
);

-- Documents
CREATE POLICY "Documents read policy" ON documents FOR SELECT USING (
  NOT is_private OR
  uploaded_by = auth.uid() OR
  student_id = current_student_id() OR
  (institution_id IS NOT NULL AND institution_id = current_institution_id()) OR
  (company_id IS NOT NULL AND company_id = current_company_id()) OR
  is_super_admin()
);

-- Certificates (Public verified read by code; Student reads own)
CREATE POLICY "Certificates read policy" ON certificates FOR SELECT USING (
  true -- Public read for verification; private details protected by client views
);

-- Notifications (User reads own only)
CREATE POLICY "Notifications read own" ON notifications FOR SELECT USING (
  user_id = auth.uid()
);
CREATE POLICY "Notifications update own" ON notifications FOR UPDATE USING (
  user_id = auth.uid()
);

-- Audit Logs (INSERT ONLY — NO UPDATE, NO DELETE EVER)
CREATE POLICY "Audit logs read policy" ON audit_logs FOR SELECT USING (
  is_super_admin() OR
  actor_id = auth.uid() OR
  (entity_type = 'institution' AND entity_id = current_institution_id()) OR
  (entity_type = 'company' AND entity_id = current_company_id())
);
CREATE POLICY "Audit logs insert policy" ON audit_logs FOR INSERT WITH CHECK (true);
-- Notice: No UPDATE or DELETE policy exists on audit_logs!
