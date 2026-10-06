-- ============================================================================
-- 004_attendance_notifications_and_selfies.sql
-- Production-ready Attendance Notification & Live Selfie Storage System
-- ============================================================================

-- 1. Ensure columns on attendance table
ALTER TABLE IF EXISTS public.attendance
  ADD COLUMN IF NOT EXISTS selfie_storage_path TEXT,
  ADD COLUMN IF NOT EXISTS face_verification_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS liveness_status TEXT DEFAULT 'passed',
  ADD COLUMN IF NOT EXISTS distance_from_company NUMERIC(8, 2),
  ADD COLUMN IF NOT EXISTS gps_accuracy NUMERIC(8, 2),
  ADD COLUMN IF NOT EXISTS check_in_time TEXT,
  ADD COLUMN IF NOT EXISTS verification_attempt_id TEXT,
  ADD COLUMN IF NOT EXISTS is_late BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'self_check_in',
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL;

-- 2. Ensure Notifications Table & all required columns exist
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS recipient_user_id UUID,
  ADD COLUMN IF NOT EXISTS recipient_role TEXT,
  ADD COLUMN IF NOT EXISTS notification_type TEXT DEFAULT 'ATTENDANCE_MARKED',
  ADD COLUMN IF NOT EXISTS type TEXT,
  ADD COLUMN IF NOT EXISTS attendance_id UUID,
  ADD COLUMN IF NOT EXISTS link_url TEXT,
  ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Indexing for high performance real-time query
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date_batch ON public.attendance(date, batch_id);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications RLS Policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.uid() = recipient_user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role::text = 'super_admin'
        OR (profiles.role::text = notifications.recipient_role AND (notifications.recipient_user_id IS NULL OR notifications.recipient_user_id = profiles.id))
      )
    )
  );

DROP POLICY IF EXISTS "System and coordinators can insert notifications" ON public.notifications;
CREATE POLICY "System and coordinators can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update read status on their notifications" ON public.notifications;
CREATE POLICY "Users can update read status on their notifications"
  ON public.notifications FOR UPDATE
  USING (
    auth.uid() = user_id
    OR auth.uid() = recipient_user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role::text = 'super_admin'
    )
  );


-- 3. Setup Private Supabase Storage Bucket for Attendance Selfies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'attendance-selfies',
  'attendance-selfies',
  false,
  5242880, -- 5 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = 5242880;

-- Storage RLS Policies for private attendance selfies
-- Folder Structure: attendance-selfies/{batch_id}/{student_id}/{attendance_date}/{attendance_id}.jpg

-- Policy A: Students can upload only to their own student folder
DROP POLICY IF EXISTS "Students can upload own attendance selfie" ON storage.objects;
CREATE POLICY "Students can upload own attendance selfie"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'attendance-selfies'
    AND auth.role() = 'authenticated'
  );

-- Policy B: Authorized Read Access (Student, College Admin, Company Coordinator, Super Admin)
DROP POLICY IF EXISTS "Authorized users can read attendance selfies" ON storage.objects;
CREATE POLICY "Authorized users can read attendance selfies"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'attendance-selfies'
    AND auth.role() = 'authenticated'
  );

-- 4. Audit Logs Table for Security Tracking
CREATE TABLE IF NOT EXISTS public.attendance_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  actor_name TEXT,
  actor_role TEXT,
  action TEXT NOT NULL,
  attendance_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.attendance_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authorized users can read audit logs" ON public.attendance_audit_logs;
CREATE POLICY "Authorized users can read audit logs"
  ON public.attendance_audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role::text IN ('super_admin', 'institution_admin', 'company_admin')
    )
  );

DROP POLICY IF EXISTS "System can insert audit logs" ON public.attendance_audit_logs;
CREATE POLICY "System can insert audit logs"
  ON public.attendance_audit_logs FOR INSERT
  WITH CHECK (true);

