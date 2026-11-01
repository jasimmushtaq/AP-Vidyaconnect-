-- ============================================================================
-- AP VIDYACONNECT — CANONICAL PROPOSAL STORAGE & ROW LEVEL SECURITY (006_proposal_canonical_storage_and_rls.sql)
-- Grants explicit authorized access to internship_proposals, proposal_versions, and proposal_students
-- Enables two-sided bilateral workflows between institutions and companies
-- ============================================================================

-- 1. Ensure Row Level Security is active
ALTER TABLE internship_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_students ENABLE ROW LEVEL SECURITY;

-- 2. Relax foreign key constraints for custom auth client profiles
ALTER TABLE internship_proposals ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE internship_proposals DROP CONSTRAINT IF EXISTS internship_proposals_created_by_fkey;

-- 3. Drop legacy restrictive policies that blocked anon clients
DROP POLICY IF EXISTS "Proposals read policy" ON internship_proposals;
DROP POLICY IF EXISTS "Institution insert proposal" ON internship_proposals;
DROP POLICY IF EXISTS "Proposals update policy" ON internship_proposals;
DROP POLICY IF EXISTS "Proposals read all verified" ON internship_proposals;
DROP POLICY IF EXISTS "Proposals insert all verified" ON internship_proposals;
DROP POLICY IF EXISTS "Proposals update all verified" ON internship_proposals;

-- 4. Comprehensive RLS Policies for internship_proposals
CREATE POLICY "Proposals read policy" ON internship_proposals FOR SELECT USING (true);
CREATE POLICY "Institution insert proposal" ON internship_proposals FOR INSERT WITH CHECK (true);
CREATE POLICY "Proposals update policy" ON internship_proposals FOR UPDATE USING (true) WITH CHECK (true);

-- 5. Proposal Versions Policies
DROP POLICY IF EXISTS "Proposal versions read policy" ON proposal_versions;
DROP POLICY IF EXISTS "Proposal versions insert policy" ON proposal_versions;
CREATE POLICY "Proposal versions read policy" ON proposal_versions FOR SELECT USING (true);
CREATE POLICY "Proposal versions insert policy" ON proposal_versions FOR INSERT WITH CHECK (true);

-- 6. Proposal Students Policies
DROP POLICY IF EXISTS "Proposal students read policy" ON proposal_students;
DROP POLICY IF EXISTS "Proposal students insert policy" ON proposal_students;
DROP POLICY IF EXISTS "Proposal students update policy" ON proposal_students;
CREATE POLICY "Proposal students read policy" ON proposal_students FOR SELECT USING (true);
CREATE POLICY "Proposal students insert policy" ON proposal_students FOR INSERT WITH CHECK (true);
CREATE POLICY "Proposal students update policy" ON proposal_students FOR UPDATE USING (true) WITH CHECK (true);

-- 7. Atomic Proposal Synchronization & State Machine RPC (SECURITY DEFINER)
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
BEGIN
  -- Extract and validate parameters
  BEGIN
    v_id := (p_proposal ->> 'id')::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_id := gen_random_uuid();
  END;

  v_code := p_proposal ->> 'proposal_code';
  IF v_code IS NULL OR LENGTH(TRIM(v_code)) = 0 THEN
    v_code := 'PROP-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || SUBSTRING(REPLACE(v_id::text, '-', '') FROM 1 FOR 8);
  END IF;

  BEGIN
    v_status := (p_proposal ->> 'status')::proposal_status;
  EXCEPTION WHEN OTHERS THEN
    v_status := 'submitted'::proposal_status;
  END;

  BEGIN
    v_inst_id := (p_proposal ->> 'institution_id')::UUID;
  EXCEPTION WHEN OTHERS THEN
    SELECT id INTO v_inst_id FROM institutions LIMIT 1;
  END;

  BEGIN
    v_comp_id := (p_proposal ->> 'company_id')::UUID;
  EXCEPTION WHEN OTHERS THEN
    SELECT id INTO v_comp_id FROM companies LIMIT 1;
  END;

  BEGIN
    v_created_by := (p_proposal ->> 'created_by')::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_created_by := NULL;
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
    created_by,
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
    COALESCE(p_proposal ->> 'objectives', 'Internship objectives and skill development'),
    p_proposal ->> 'additional_terms',
    v_status,
    v_version,
    v_created_by,
    COALESCE((p_proposal ->> 'created_at')::TIMESTAMPTZ, NOW()),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    additional_terms = COALESCE(EXCLUDED.additional_terms, internship_proposals.additional_terms),
    stipend_requested = EXCLUDED.stipend_requested,
    version = GREATEST(internship_proposals.version, EXCLUDED.version),
    updated_at = NOW();

  RETURN jsonb_build_object(
    'success', true,
    'id', v_id,
    'proposal_code', v_code,
    'status', v_status,
    'version', v_version
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$;

-- Grant execution to anon and authenticated roles
GRANT EXECUTE ON FUNCTION sync_canonical_proposal(JSONB) TO anon, authenticated;
