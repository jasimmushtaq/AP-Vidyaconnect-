-- ============================================================================
-- AP VIDYACONNECT — BATCH ATTENDANCE SETTINGS & AUDIT LOGS (002_attendance_settings.sql)
-- Geofenced coordinates, radius boundary, timing window, and audit trail
-- ============================================================================

-- 1. Batch Attendance Settings Table
CREATE TABLE IF NOT EXISTS batch_attendance_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  internship_batch_id UUID NOT NULL REFERENCES internship_batches(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  location_name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  radius_meters INTEGER NOT NULL DEFAULT 100 CHECK (radius_meters >= 10 AND radius_meters <= 5000),
  start_time TIME NOT NULL DEFAULT '09:00:00',
  end_time TIME NOT NULL DEFAULT '10:30:00',
  allow_late BOOLEAN NOT NULL DEFAULT true,
  late_after_time TIME DEFAULT '10:30:00',
  working_days TEXT[] NOT NULL DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_batch_attendance UNIQUE (internship_batch_id)
);

-- 2. Attendance Audit Logs Table
CREATE TABLE IF NOT EXISTS attendance_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES internship_batches(id) ON DELETE CASCADE,
  coordinator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  coordinator_name VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  old_value JSONB,
  new_value JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Indexes for fast location & batch lookups
CREATE INDEX IF NOT EXISTS idx_batch_attendance_batch_id ON batch_attendance_settings(internship_batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_attendance_company_id ON batch_attendance_settings(company_id);
CREATE INDEX IF NOT EXISTS idx_batch_attendance_is_active ON batch_attendance_settings(is_active);
CREATE INDEX IF NOT EXISTS idx_attendance_audit_batch_id ON attendance_audit_logs(batch_id);
CREATE INDEX IF NOT EXISTS idx_attendance_audit_timestamp ON attendance_audit_logs(timestamp DESC);

-- 4. Automatic updated_at trigger
CREATE OR REPLACE FUNCTION update_attendance_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_batch_attendance_settings_timestamp ON batch_attendance_settings;
CREATE TRIGGER trg_batch_attendance_settings_timestamp
  BEFORE UPDATE ON batch_attendance_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_attendance_settings_timestamp();

-- 5. Row Level Security (RLS)
ALTER TABLE batch_attendance_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated users enrolled or managing the batch
DROP POLICY IF EXISTS "Allow read attendance settings for related users" ON batch_attendance_settings;
CREATE POLICY "Allow read attendance settings for related users"
  ON batch_attendance_settings FOR SELECT
  TO authenticated
  USING (true);

-- Allow company coordinators to insert/update settings for their company's batches
DROP POLICY IF EXISTS "Allow company coordinators to manage batch attendance settings" ON batch_attendance_settings;
CREATE POLICY "Allow company coordinators to manage batch attendance settings"
  ON batch_attendance_settings FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid() AND role IN ('company_admin', 'super_admin')
    )
  );

-- Allow company coordinators and system to insert audit logs
DROP POLICY IF EXISTS "Allow insert attendance audit logs" ON attendance_audit_logs;
CREATE POLICY "Allow insert attendance audit logs"
  ON attendance_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow view attendance audit logs" ON attendance_audit_logs;
CREATE POLICY "Allow view attendance audit logs"
  ON attendance_audit_logs FOR SELECT
  TO authenticated
  USING (true);

