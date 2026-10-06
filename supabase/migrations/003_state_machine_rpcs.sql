-- ============================================================================
-- KAUSHAL DISHA (कौशल दिशा) — WORKFLOW STATE MACHINE RPCs (003_state_machine_rpcs.sql)
-- Immutable state machine functions enforcing formal two-sided proposal workflows
-- ============================================================================

-- 1. Helper: Validate Proposal Status Transition
CREATE OR REPLACE FUNCTION validate_proposal_transition(
  p_current_status proposal_status,
  p_new_status proposal_status
)
RETURNS BOOLEAN AS $$
BEGIN
  IF p_current_status = 'draft' AND p_new_status = 'submitted' THEN
    RETURN TRUE;
  ELSIF p_current_status = 'submitted' AND p_new_status IN ('under_company_review', 'draft') THEN
    RETURN TRUE;
  ELSIF p_current_status = 'under_company_review' AND p_new_status IN ('modification_requested', 'company_accepted', 'company_accepted_with_changes', 'rejected') THEN
    RETURN TRUE;
  ELSIF p_current_status = 'modification_requested' AND p_new_status = 'submitted' THEN
    RETURN TRUE;
  ELSIF p_current_status IN ('company_accepted', 'company_accepted_with_changes') AND p_new_status IN ('institution_accepted', 'declined') THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. State Transition Trigger
CREATE OR REPLACE FUNCTION trg_check_proposal_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NOT validate_proposal_transition(OLD.status, NEW.status) THEN
      RAISE EXCEPTION 'Illegal status transition for proposal % from % to %', OLD.id, OLD.status, NEW.status;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_proposal_status_check
BEFORE UPDATE OF status ON internship_proposals
FOR EACH ROW EXECUTE FUNCTION trg_check_proposal_transition();

-- 3. RPC: submit_proposal
CREATE OR REPLACE FUNCTION submit_proposal(p_proposal_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_proposal RECORD;
  v_caller_inst_id UUID;
  v_verified_company BOOLEAN;
BEGIN
  v_caller_inst_id := current_institution_id();
  
  SELECT * INTO v_proposal FROM internship_proposals WHERE id = p_proposal_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Proposal % not found', p_proposal_id;
  END IF;

  IF v_proposal.institution_id != v_caller_inst_id AND NOT is_super_admin() THEN
    RAISE EXCEPTION 'Not authorized to submit proposal for this institution';
  END IF;

  IF v_proposal.status != 'draft' AND v_proposal.status != 'modification_requested' THEN
    RAISE EXCEPTION 'Proposal must be in draft or modification_requested state to submit';
  END IF;

  -- Ensure company is verified
  SELECT (verification_status = 'verified') INTO v_verified_company FROM companies WHERE id = v_proposal.company_id;
  IF NOT v_verified_company THEN
    RAISE EXCEPTION 'Proposals can only be submitted to verified companies';
  END IF;

  -- Update status
  UPDATE internship_proposals
  SET status = 'submitted', updated_at = NOW()
  WHERE id = p_proposal_id;

  -- Record version snapshot
  INSERT INTO proposal_versions (proposal_id, version_number, snapshot, changed_by, change_summary)
  VALUES (p_proposal_id, v_proposal.version, row_to_json(v_proposal)::jsonb, auth.uid(), 'Proposal submitted by institution');

  -- Log audit
  INSERT INTO audit_logs (actor_id, actor_role, action, entity_type, entity_id, before, after)
  VALUES (auth.uid(), get_current_role()::user_role, 'submit_proposal', 'internship_proposal', p_proposal_id, jsonb_build_object('status', v_proposal.status), jsonb_build_object('status', 'submitted'));

  RETURN jsonb_build_object('success', true, 'status', 'submitted', 'proposal_id', p_proposal_id);
END;
$$;

-- 4. RPC: company_start_review
CREATE OR REPLACE FUNCTION company_start_review(p_proposal_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_proposal RECORD;
BEGIN
  SELECT * INTO v_proposal FROM internship_proposals WHERE id = p_proposal_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Proposal not found';
  END IF;

  IF v_proposal.company_id != current_company_id() AND NOT is_super_admin() THEN
    RAISE EXCEPTION 'Not authorized for this company';
  END IF;

  IF v_proposal.status != 'submitted' THEN
    RAISE EXCEPTION 'Proposal must be submitted before review';
  END IF;

  UPDATE internship_proposals
  SET status = 'under_company_review', updated_at = NOW()
  WHERE id = p_proposal_id;

  INSERT INTO audit_logs (actor_id, actor_role, action, entity_type, entity_id, before, after)
  VALUES (auth.uid(), get_current_role()::user_role, 'start_review', 'internship_proposal', p_proposal_id, jsonb_build_object('status', 'submitted'), jsonb_build_object('status', 'under_company_review'));

  RETURN jsonb_build_object('success', true, 'status', 'under_company_review');
END;
$$;

-- 5. RPC: company_respond
CREATE OR REPLACE FUNCTION company_respond(
  p_proposal_id UUID,
  p_response JSONB -- { action: 'company_accepted'|'company_accepted_with_changes'|'modification_requested'|'rejected', student_decisions: [...], stipend: ..., remarks: ... }
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_proposal RECORD;
  v_new_status proposal_status;
  v_action TEXT;
  v_remarks TEXT;
BEGIN
  v_action := p_response ->> 'action';
  v_remarks := p_response ->> 'remarks';

  SELECT * INTO v_proposal FROM internship_proposals WHERE id = p_proposal_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Proposal not found';
  END IF;

  IF v_proposal.company_id != current_company_id() AND NOT is_super_admin() THEN
    RAISE EXCEPTION 'Not authorized for this company';
  END IF;

  IF v_action = 'accept' THEN
    v_new_status := 'company_accepted';
  ELSIF v_action = 'accept_with_changes' THEN
    v_new_status := 'company_accepted_with_changes';
  ELSIF v_action = 'request_modification' THEN
    IF v_remarks IS NULL OR LENGTH(TRIM(v_remarks)) = 0 THEN
      RAISE EXCEPTION 'Remarks are mandatory when requesting modifications';
    END IF;
    v_new_status := 'modification_requested';
  ELSIF v_action = 'reject' THEN
    IF v_remarks IS NULL OR LENGTH(TRIM(v_remarks)) = 0 THEN
      RAISE EXCEPTION 'Rejection reason is mandatory';
    END IF;
    v_new_status := 'rejected';
  ELSE
    RAISE EXCEPTION 'Invalid response action: %', v_action;
  END IF;

  UPDATE internship_proposals
  SET status = v_new_status,
      additional_terms = COALESCE(v_remarks, additional_terms),
      updated_at = NOW()
  WHERE id = p_proposal_id;

  -- Record version
  INSERT INTO proposal_versions (proposal_id, version_number, snapshot, changed_by, change_summary)
  VALUES (p_proposal_id, v_proposal.version + 1, p_response, auth.uid(), 'Company responded with ' || v_new_status::text);

  INSERT INTO audit_logs (actor_id, actor_role, action, entity_type, entity_id, before, after)
  VALUES (auth.uid(), get_current_role()::user_role, 'company_respond', 'internship_proposal', p_proposal_id, jsonb_build_object('status', v_proposal.status), jsonb_build_object('status', v_new_status, 'response', p_response));

  RETURN jsonb_build_object('success', true, 'status', v_new_status);
END;
$$;

-- 6. RPC: institution_final_accept (CREATES BATCH in single atomic transaction)
CREATE OR REPLACE FUNCTION institution_final_accept(p_proposal_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_proposal RECORD;
  v_inst RECORD;
  v_comp RECORD;
  v_batch_id UUID;
  v_batch_code TEXT;
  v_seq_val INT;
  v_year TEXT;
  v_student_rec RECORD;
  v_student_count INT := 0;
BEGIN
  SELECT * INTO v_proposal FROM internship_proposals WHERE id = p_proposal_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Proposal not found';
  END IF;

  IF v_proposal.institution_id != current_institution_id() AND NOT is_super_admin() THEN
    RAISE EXCEPTION 'Not authorized to accept proposal for this institution';
  END IF;

  IF v_proposal.status NOT IN ('company_accepted', 'company_accepted_with_changes') THEN
    RAISE EXCEPTION 'Cannot create batch: Proposal is in % state', v_proposal.status;
  END IF;

  SELECT * INTO v_inst FROM institutions WHERE id = v_proposal.institution_id;
  SELECT * INTO v_comp FROM companies WHERE id = v_proposal.company_id;

  -- Generate Sequence Code: KD-{YYYY}-{COMPANY_CODE}-{INSTITUTION_CODE}-{NNN}
  v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  v_seq_val := nextval('batch_counter_seq');
  v_batch_code := 'KD-' || v_year || '-' || UPPER(SUBSTRING(REGEXP_REPLACE(v_comp.name, '[^a-zA-Z0-9]', '', 'g') FROM 1 FOR 3)) || '-' || UPPER(SUBSTRING(REGEXP_REPLACE(v_inst.code, '[^a-zA-Z0-9]', '', 'g') FROM 1 FOR 5)) || '-' || LPAD(v_seq_val::text, 3, '0');

  -- Update Proposal Status
  UPDATE internship_proposals
  SET status = 'institution_accepted', updated_at = NOW()
  WHERE id = p_proposal_id;

  -- Create Internship Batch
  INSERT INTO internship_batches (
    batch_code,
    proposal_id,
    institution_id,
    company_id,
    title,
    domain,
    mode,
    stipend_amount,
    start_date,
    end_date,
    working_hours,
    location,
    status
  ) VALUES (
    v_batch_code,
    p_proposal_id,
    v_proposal.institution_id,
    v_proposal.company_id,
    v_proposal.domain || ' Internship Batch',
    v_proposal.domain,
    v_proposal.mode,
    COALESCE(v_proposal.stipend_requested, 0),
    v_proposal.start_date,
    v_proposal.end_date,
    '9:30 AM - 5:30 PM',
    v_comp.headquarters,
    'created'
  ) RETURNING id INTO v_batch_id;

  -- Attach Accepted Proposal Students into internship_students
  FOR v_student_rec IN 
    SELECT student_id FROM proposal_students 
    WHERE proposal_id = p_proposal_id AND (is_accepted_by_company IS NULL OR is_accepted_by_company = TRUE)
  LOOP
    INSERT INTO internship_students (batch_id, student_id, has_joined, completion_status)
    VALUES (v_batch_id, v_student_rec.student_id, FALSE, 'in_progress');
    v_student_count := v_student_count + 1;
  END LOOP;

  -- Audit Log
  INSERT INTO audit_logs (actor_id, actor_role, action, entity_type, entity_id, before, after)
  VALUES (auth.uid(), get_current_role()::user_role, 'institution_final_accept_batch_created', 'internship_batch', v_batch_id, jsonb_build_object('proposal_id', p_proposal_id), jsonb_build_object('batch_code', v_batch_code, 'student_count', v_student_count));

  RETURN jsonb_build_object(
    'success', true,
    'batch_id', v_batch_id,
    'batch_code', v_batch_code,
    'student_count', v_student_count
  );
END;
$$;

-- 7. RPC: activate_batch
CREATE OR REPLACE FUNCTION activate_batch(p_batch_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE internship_batches
  SET status = 'active', updated_at = NOW()
  WHERE id = p_batch_id;

  INSERT INTO audit_logs (actor_id, actor_role, action, entity_type, entity_id, before, after)
  VALUES (auth.uid(), get_current_role()::user_role, 'activate_batch', 'internship_batch', p_batch_id, jsonb_build_object('status', 'created'), jsonb_build_object('status', 'active'));

  RETURN jsonb_build_object('success', true, 'status', 'active');
END;
$$;

-- 8. RPC: complete_batch
CREATE OR REPLACE FUNCTION complete_batch(p_batch_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE internship_batches
  SET status = 'completed', updated_at = NOW()
  WHERE id = p_batch_id;

  INSERT INTO audit_logs (actor_id, actor_role, action, entity_type, entity_id, before, after)
  VALUES (auth.uid(), get_current_role()::user_role, 'complete_batch', 'internship_batch', p_batch_id, jsonb_build_object('status', 'active'), jsonb_build_object('status', 'completed'));

  RETURN jsonb_build_object('success', true, 'status', 'completed');
END;
$$;
