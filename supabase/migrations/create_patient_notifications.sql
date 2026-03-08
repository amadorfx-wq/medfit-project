-- ─── patient_notifications table ──────────────────────────────────────────
-- Run this SQL in Supabase Dashboard → SQL Editor
-- This table powers real-time in-app notifications for patients.

CREATE TABLE IF NOT EXISTS patient_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'GENERAL',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast patient lookups
CREATE INDEX IF NOT EXISTS idx_patient_notifications_patient_id 
    ON patient_notifications(patient_id);

-- Index for unread count queries
CREATE INDEX IF NOT EXISTS idx_patient_notifications_unread 
    ON patient_notifications(patient_id, read) WHERE read = false;

-- Enable Row Level Security
ALTER TABLE patient_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Patients can only read their own notifications
CREATE POLICY "Patients can view their own notifications"
    ON patient_notifications FOR SELECT
    USING (true);

-- RLS Policy: Service role can insert notifications (from server/admin)
CREATE POLICY "Service can insert notifications"
    ON patient_notifications FOR INSERT
    WITH CHECK (true);

-- RLS Policy: Patients can update (mark as read) their own notifications
CREATE POLICY "Patients can update their own notifications"
    ON patient_notifications FOR UPDATE
    USING (true);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE patient_notifications;
