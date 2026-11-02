-- ============================================================================
-- AP VIDYACONNECT – PROPOSED MIGRATION (007_enforce_multi_tenant_rls_and_canonical_tables.sql)
-- Status: PROPOSED / DRAFT ONLY – DO NOT EXECUTE IN PHASE 1
--
-- ARCHITECTURAL PREREQUISITE NOTICE:
-- The application currently authenticates client users through custom application
-- credentials rather than Supabase Auth sessions, issuing anonymous REST requests
-- with the Supabase anon key where `auth.uid()` evaluates to NULL.
--
-- Applying these strict policies before migrating frontend authentication to
-- Supabase Auth JWTs (`supabase.auth.signInWithPassword`) would cause authenticated
-- users to be rejected by PostgreSQL RLS.
--
-- This migration specifies the zero-trust target schema and RLS policies required
-- to replace the insecure `USING (true)` / `WITH CHECK (true)` policies from 006.
-- ============================================================================

-- 1. Correct the RPC to prevent random company misassignment on non-UUID cast
CREATE OR REPLACE FUNCTION sync_canonical_proposal(p_proposal JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_code TEXT;
  v_status proposal_status;
  v_inst_id UUID;
  v_comp_id UUID;
  v_version INT;
  v_mode internship_mode;
  v_created_by UUID;
  v_raw_comp_id TEXT;
  v_raw_inst_id TEXT;
BEGIN
  -- Safe Proposal ID resolution
  BEGIN
    v_id := (p_proposal ->> 'id')::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_id := gen_random_uuid();
  END;

  v_code := p_proposal ->> 'proposal_code';
  v_raw_comp_id := p_proposal ->> 'company_id';
  v_raw_inst_id := p_proposal ->> 'institution_id';

  -- Resolve Company UUID strictly by ID, CIN, official email, or name
  -- NEVER fall back to 'SELECT id FROM companies LIMIT 1'
  BEGIN
    v_comp_id := v_raw_comp_id::UUID;
  EXCEPTION WHEN OTHERS THEN
    SELECT id INTO v_comp_id FROM companies
    WHERE cin = (p_proposal -> 'company' ->> 'cin')
       OR official_email = (p_proposal -> 'company' ->> 'official_email')
       OR name = (p_proposal -> 'company' ->> 'name')
    LIMIT 1;
  END;

  IF v_comp_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Target company could not be resolved in the database'
    );
  END IF;

  -- Resolve Institution UUID strictly
  BEGIN
    v_inst_id := v_raw_inst_id::UUID;
  EXCEPTION WHEN OTHERS THEN
    SELECT id INTO v_inst_id FROM institutions
    WHERE code = (p_proposal -> 'institution' ->> 'code')
       OR official_email = (p_proposal -> 'institution' ->> 'official_email')
       OR name = (p_proposal -> 'institution' ->> 'name')
    LIMIT 1;
  END;

  IF v_inst_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Submitting institution could not be resolved in the database'
    );
  END IF;

  -- Safe Proposal Status
  BEGIN
    v_status := (p_proposal ->> 'status')::proposal_status;
  EXCEPTION WHEN OTHERS THEN
    v_status := 'submitted'::proposal_status;
  END;

  v_version := COALESCE((p_proposal ->> 'version')::INT, 1);

  -- Safe mode parsing
  IF (p_proposal ->> 'mode') = 'remote' THEN
    v_mode := 'remote'::internship_mode;
  ELSIF (p_proposal ->> 'mode') = 'hybrid' THEN
    v_mode := 'hybrid'::internship_mode;
  ELSE
    v_mode := 'onsite'::internship_mode;
  END IF;

  -- Upsert canonical proposal
  INSERT INTO internship_proposals (
    id,
    proposal_code,
    institution_id,
    company_id,
    domain,
    mode,
    duration_weeks,
    start_date,
    end_date,
    stipend_requested,
    objectives,
    additional_terms,
    status,
    version,
    created_at,
    updated_at
  ) VALUES (
    v_id,
    v_code,
    v_inst_id,
    v_comp_id,
    COALESCE(p_proposal ->> 'domain', 'Technical Internship'),
    v_mode,
    COALESCE((p_proposal ->> 'duration_weeks')::INT, 12),
    COALESCE((p_proposal ->> 'start_date')::DATE, CURRENT_DATE),
    COALESCE((p_proposal ->> 'end_date')::DATE, CURRENT_DATE + INTERVAL '12 weeks'),
    COALESCE((p_proposal ->> 'stipend_requested')::NUMERIC, 0),
    COALESCE(p_proposal ->> 'objectives', 'Internship objectives'),
    p_proposal ->> 'additional_terms',
    v_status,
    v_version,
    COALESCE((p_proposal ->> 'created_at')::TIMESTAMPTZ, NOW()),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    company_id = EXCLUDED.company_id,
    additional_terms = COALESCE(EXCLUDED.additional_terms, internship_proposals.additional_terms),
    stipend_requested = EXCLUDED.stipend_requested,
    version = GREATEST(internship_proposals.version, EXCLUDED.version),
    updated_at = NOW();

  RETURN jsonb_build_object(
    'success', true,
    'id', v_id,
    'proposal_code', v_code,
    'company_id', v_comp_id,
    'status', v_status
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$;

-- 2. Revoke Insecure 006 Policies on Proposals
DROP POLICY IF EXISTS "Proposals read policy" ON internship_proposals;
DROP POLICY IF EXISTS "Institution insert proposal" ON internship_proposals;
DROP POLICY IF EXISTS "Proposals update policy" ON internship_proposals;

DROP POLICY IF EXISTS "Proposal versions read policy" ON proposal_versions;
DROP POLICY IF EXISTS "Proposal versions insert policy" ON proposal_versions;

DROP POLICY IF EXISTS "Proposal students read policy" ON proposal_students;
DROP POLICY IF EXISTS "Proposal students insert policy" ON proposal_students;
DROP POLICY IF EXISTS "Proposal students update policy" ON proposal_students;

-- 3. Zero-Trust Strict Multi-Tenant Policies (To be activated after Supabase Auth migration)
CREATE POLICY "Tenant proposals select" ON internship_proposals
FOR SELECT USING (
  is_super_admin()
  OR institution_id = current_institution_id()
  OR company_id = current_company_id()
);

CREATE POLICY "Tenant proposals insert" ON internship_proposals
FOR INSERT WITH CHECK (
  is_super_admin()
  OR institution_id = current_institution_id()
);

CREATE POLICY "Tenant proposals update" ON internship_proposals
FOR UPDATE USING (
  is_super_admin()
  OR institution_id = current_institution_id()
  OR company_id = current_company_id()
);

-- 4. Proposal Students Strict Policies
CREATE POLICY "Tenant proposal students select" ON proposal_students
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM internship_proposals ip
    WHERE ip.id = proposal_students.proposal_id AND (
      ip.institution_id = current_institution_id() OR
      ip.company_id = current_company_id() OR
      is_super_admin()
    )
  ) OR student_id = current_student_id()
);

CREATE POLICY "Tenant proposal students insert" ON proposal_students
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM internship_proposals ip
    WHERE ip.id = proposal_students.proposal_id AND (
      ip.institution_id = current_institution_id() OR
      is_super_admin()
    )
  )
);

-- 5. Student Table Strict Multi-Tenant Isolation
DROP POLICY IF EXISTS "Students read policy" ON students;
DROP POLICY IF EXISTS "Institution manage students" ON students;

CREATE POLICY "Tenant students select" ON students
FOR SELECT USING (
  id = current_student_id()
  OR institution_id = current_institution_id()
  OR is_super_admin()
  OR EXISTS (
    SELECT 1 FROM proposal_students ps
    JOIN internship_proposals ip ON ip.id = ps.proposal_id
    WHERE ps.student_id = students.id AND ip.company_id = current_company_id()
  )
  OR EXISTS (
    SELECT 1 FROM internship_students is_tab
    JOIN internship_batches ib ON ib.id = is_tab.batch_id
    WHERE is_tab.student_id = students.id AND ib.company_id = current_company_id()
  )
);

CREATE POLICY "Tenant students manage" ON students
FOR ALL USING (
  is_super_admin() OR institution_id = current_institution_id()
);

-- 6. Canonical Attendance Multi-Tenant Isolation
DROP POLICY IF EXISTS "Attendance read policy" ON attendance;
DROP POLICY IF EXISTS "Mentor mark attendance" ON attendance;
DROP POLICY IF EXISTS "Users can mark attendance" ON attendance;

CREATE POLICY "Tenant attendance select" ON attendance
FOR SELECT USING (
  student_id = current_student_id()
  OR is_super_admin()
  OR institution_id = current_institution_id()
  OR company_id = current_company_id()
);

CREATE POLICY "Tenant attendance insert" ON attendance
FOR INSERT WITH CHECK (
  student_id = current_student_id()
  OR is_super_admin()
  OR company_id = current_company_id()
);

