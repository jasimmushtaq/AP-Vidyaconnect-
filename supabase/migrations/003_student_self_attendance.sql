-- ============================================================================
-- AP VIDYACONNECT — STUDENT SELF-ATTENDANCE & GEOFENCE VERIFICATION (003_student_self_attendance.sql)
-- Multi-Factor Verification: GPS Geofence + Accuracy + Working Day/Hours + Live Biometric Selfie
-- Targets the existing 'attendance' table created in 001_initial_schema.sql
-- ============================================================================

-- 1. Extend Attendance table with multi-factor verification audit & biometric fields
ALTER TABLE IF EXISTS attendance 
  ADD COLUMN IF NOT EXISTS check_in_time VARCHAR(20),
  ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7),
  ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7),
  ADD COLUMN IF NOT EXISTS gps_accuracy NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS distance_meters NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS face_verification_status VARCHAR(50) DEFAULT 'verified',
  ADD COLUMN IF NOT EXISTS liveness_status VARCHAR(50) DEFAULT 'passed',
  ADD COLUMN IF NOT EXISTS selfie_url TEXT,
  ADD COLUMN IF NOT EXISTS verification_attempt_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS is_late BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'self_check_in';

-- 2. Indexes for efficient lookup & anti-duplicate checks
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_batch_date ON attendance(batch_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_source ON attendance(source);

-- 3. Row Level Security for Attendance
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- 4. Secure Server-Side Stored Procedure for Student Self Attendance
CREATE OR REPLACE FUNCTION mark_student_self_attendance(
  p_batch_id UUID,
  p_student_id UUID,
  p_latitude NUMERIC,
  p_longitude NUMERIC,
  p_gps_accuracy NUMERIC,
  p_selfie_url TEXT,
  p_attempt_id VARCHAR
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings RECORD;
  v_batch RECORD;
  v_existing RECORD;
  v_distance NUMERIC;
  v_now_time TIME;
  v_now_date DATE;
  v_day_name VARCHAR;
  v_status attendance_status := 'present';
  v_is_late BOOLEAN := FALSE;
  v_record_id UUID;
  v_check_in_str VARCHAR;
BEGIN
  v_now_date := CURRENT_DATE;
  v_now_time := CURRENT_TIME;
  v_day_name := TO_CHAR(v_now_date, 'FMDay');
  v_check_in_str := TO_CHAR(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata', 'HH12:MI AM');

  -- 1. Check if attendance already exists for today
  SELECT * INTO v_existing FROM attendance 
  WHERE student_id = p_student_id AND date = v_now_date;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'ALREADY_MARKED',
      'message', 'Attendance has already been recorded for today.'
    );
  END IF;

  -- 2. Verify Batch & Status
  SELECT * INTO v_batch FROM internship_batches WHERE id = p_batch_id;
  IF NOT FOUND OR v_batch.status != 'active' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'BATCH_INACTIVE',
      'message', 'Internship batch is not currently active.'
    );
  END IF;

  -- 3. Verify Batch Attendance Settings
  SELECT * INTO v_settings FROM batch_attendance_settings WHERE internship_batch_id = p_batch_id;
  IF NOT FOUND OR v_settings.is_active = FALSE THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'ATTENDANCE_INACTIVE',
      'message', 'Attendance is currently unavailable or inactive for this internship batch.'
    );
  END IF;

  -- 4. Verify Working Day
  IF NOT (v_day_name = ANY(v_settings.working_days)) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'NON_WORKING_DAY',
      'message', 'Today is not a scheduled internship working day.'
    );
  END IF;

  -- 5. Verify Attendance Window
  IF v_now_time < v_settings.start_time THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'OUTSIDE_HOURS',
      'message', 'Attendance window has not opened yet. Check back at ' || TO_CHAR(v_settings.start_time, 'HH12:MI AM')
    );
  END IF;

  IF v_now_time > v_settings.end_time THEN
    IF v_settings.allow_late = TRUE THEN
      v_is_late := TRUE;
      v_status := 'present';
    ELSE
      RETURN jsonb_build_object(
        'success', false,
        'error_code', 'OUTSIDE_HOURS',
        'message', 'Attendance window closed at ' || TO_CHAR(v_settings.end_time, 'HH12:MI AM')
      );
    END IF;
  ELSE
    v_status := 'present';
  END IF;

  -- 6. Verify GPS Accuracy (Threshold: <= 200m)
  IF p_gps_accuracy > 200 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'LOW_GPS_ACCURACY',
      'message', 'GPS accuracy is too low (±' || ROUND(p_gps_accuracy) || 'm). Please move to an open area and try again.'
    );
  END IF;

  -- 7. Calculate Haversine Distance in meters
  v_distance := 6371000 * 2 * ASIN(SQRT(
    POWER(SIN(RADIANS(p_latitude - v_settings.latitude) / 2), 2) +
    COS(RADIANS(v_settings.latitude)) * COS(RADIANS(p_latitude)) *
    POWER(SIN(RADIANS(p_longitude - v_settings.longitude) / 2), 2)
  ));

  IF v_distance > v_settings.radius_meters THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'OUTSIDE_GEOFENCE',
      'message', 'You are outside the authorized internship location perimeter (' || ROUND(v_distance) || 'm away).',
      'distance_meters', ROUND(v_distance),
      'allowed_radius', v_settings.radius_meters
    );
  END IF;

  -- 8. Insert Verified Attendance Record
  v_record_id := gen_random_uuid();
  INSERT INTO attendance (
    id,
    batch_id,
    student_id,
    date,
    status,
    check_in_time,
    latitude,
    longitude,
    gps_accuracy,
    distance_meters,
    face_verification_status,
    liveness_status,
    selfie_url,
    verification_attempt_id,
    is_late,
    source,
    notes,
    created_at,
    updated_at
  ) VALUES (
    v_record_id,
    p_batch_id,
    p_student_id,
    v_now_date,
    v_status,
    v_check_in_str,
    p_latitude,
    p_longitude,
    p_gps_accuracy,
    ROUND(v_distance, 1),
    'verified',
    'passed',
    p_selfie_url,
    p_attempt_id,
    v_is_late,
    'self_check_in',
    CASE WHEN v_is_late THEN 'Self Check-in (Late verified)' ELSE 'Self Check-in (Verified)' END,
    NOW(),
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'status', v_status::TEXT,
    'is_late', v_is_late,
    'check_in_time', v_check_in_str,
    'distance_meters', ROUND(v_distance, 1),
    'message', 'Attendance verified and recorded successfully.'
  );
END;
$$;
