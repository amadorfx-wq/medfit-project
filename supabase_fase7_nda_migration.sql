-- ═══════════════════════════════════════════════════════════════════════
-- FASE 7: SQL MIGRATION — Staff NDA / Confidentiality Tracking
-- ═══════════════════════════════════════════════════════════════════════
-- PURPOSE: Add columns to the `staff` table to track NDA / Data Handling
-- Agreement signatures. Required for HIPAA compliance.
-- RUN THIS IN: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════

-- 1. Add NDA tracking columns to staff table
ALTER TABLE staff
ADD COLUMN IF NOT EXISTS nda_signed_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS nda_ip_address TEXT DEFAULT NULL;

-- 2. Comment for documentation
COMMENT ON COLUMN staff.nda_signed_at IS 'Timestamp when the staff member signed the NDA / Data Handling Agreement. NULL = not signed.';
COMMENT ON COLUMN staff.nda_ip_address IS 'IP address of the staff member at the time of NDA signature. For legal audit trail.';
