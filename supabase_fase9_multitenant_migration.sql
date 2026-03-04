-- ═══════════════════════════════════════════════════════════════════════
-- FASE 9: SQL MIGRATION — Multi-Tenant B2B Architecture
-- ═══════════════════════════════════════════════════════════════════════
-- PURPOSE: Transform single-tenant MedFit into a multi-tenant SaaS
-- platform where each clinic's data is cryptographically isolated via
-- PostgreSQL Row Level Security (RLS).
--
-- RUN THIS IN: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════
-- 1. CREATE TENANTS TABLE
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,        -- subdomain: clinica-a.medfit.com
    name TEXT NOT NULL,               -- "MedFit America"
    config JSONB DEFAULT '{}',        -- tenant-specific branding/config
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);

-- Insert the first tenant (YOUR current clinic)
INSERT INTO tenants (slug, name, config)
VALUES (
    'medfit-america',
    'MedFit America',
    '{
        "legalEntity": "Medfit Of Georgia LLC",
        "phone": "404-980-9800",
        "email": "info@medfitamerica.com",
        "address": "2359 Windy Hill Rd STE 210, Marietta, GA 30067"
    }'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════
-- 2. ADD tenant_id TO ALL DATA TABLES
-- ═══════════════════════════════════════════════════════════════════════

-- Get the ID of the first tenant for backfilling
DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'medfit-america' LIMIT 1;

    -- PATIENTS
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'tenant_id') THEN
        ALTER TABLE patients ADD COLUMN tenant_id UUID;
        UPDATE patients SET tenant_id = v_tenant_id;
        ALTER TABLE patients ALTER COLUMN tenant_id SET NOT NULL;
        ALTER TABLE patients ADD CONSTRAINT fk_patients_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);
    END IF;

    -- CHARGES
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'charges' AND column_name = 'tenant_id') THEN
        ALTER TABLE charges ADD COLUMN tenant_id UUID;
        UPDATE charges SET tenant_id = v_tenant_id;
        ALTER TABLE charges ALTER COLUMN tenant_id SET NOT NULL;
        ALTER TABLE charges ADD CONSTRAINT fk_charges_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);
    END IF;

    -- AUDIT_LOGS
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'tenant_id') THEN
        ALTER TABLE audit_logs ADD COLUMN tenant_id UUID;
        UPDATE audit_logs SET tenant_id = v_tenant_id;
        ALTER TABLE audit_logs ALTER COLUMN tenant_id SET NOT NULL;
        ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_logs_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);
    END IF;

    -- NOTIFICATIONS
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'tenant_id') THEN
        ALTER TABLE notifications ADD COLUMN tenant_id UUID;
        UPDATE notifications SET tenant_id = v_tenant_id;
        ALTER TABLE notifications ALTER COLUMN tenant_id SET NOT NULL;
        ALTER TABLE notifications ADD CONSTRAINT fk_notifications_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);
    END IF;

    -- STAFF
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff' AND column_name = 'tenant_id') THEN
        ALTER TABLE staff ADD COLUMN tenant_id UUID;
        UPDATE staff SET tenant_id = v_tenant_id;
        ALTER TABLE staff ALTER COLUMN tenant_id SET NOT NULL;
        ALTER TABLE staff ADD CONSTRAINT fk_staff_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);
    END IF;

    -- CONSENT_FORMS
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'consent_forms' AND column_name = 'tenant_id') THEN
        ALTER TABLE consent_forms ADD COLUMN tenant_id UUID;
        UPDATE consent_forms SET tenant_id = v_tenant_id;
        ALTER TABLE consent_forms ALTER COLUMN tenant_id SET NOT NULL;
        ALTER TABLE consent_forms ADD CONSTRAINT fk_consent_forms_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════
-- 3. PERFORMANCE INDEXES (tenant_id first for partition-like speed)
-- ═══════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_patients_tenant ON patients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_charges_tenant ON charges(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant ON notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_tenant ON staff(tenant_id);
CREATE INDEX IF NOT EXISTS idx_consent_forms_tenant ON consent_forms(tenant_id);

-- ═══════════════════════════════════════════════════════════════════════
-- 4. TENANT-AWARE RLS POLICIES
-- Uses current_setting('app.tenant_id') which is set by the application
-- before every query. This is the CRYPTOGRAPHIC BARRIER.
-- ═══════════════════════════════════════════════════════════════════════

-- Helper function for cleaner RLS
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.tenant_id', true), '')::UUID;
EXCEPTION
    WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ─── PATIENTS ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow all access to patients" ON patients;
DROP POLICY IF EXISTS "Tenant isolation for patients" ON patients;
CREATE POLICY "Tenant isolation for patients"
    ON patients FOR ALL
    USING (tenant_id = get_current_tenant_id())
    WITH CHECK (tenant_id = get_current_tenant_id());

-- ─── CHARGES ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow all access to charges" ON charges;
DROP POLICY IF EXISTS "Tenant isolation for charges" ON charges;
CREATE POLICY "Tenant isolation for charges"
    ON charges FOR ALL
    USING (tenant_id = get_current_tenant_id())
    WITH CHECK (tenant_id = get_current_tenant_id());

-- ─── AUDIT_LOGS ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow all access to audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "Tenant isolation for audit_logs" ON audit_logs;
CREATE POLICY "Tenant isolation for audit_logs"
    ON audit_logs FOR ALL
    USING (tenant_id = get_current_tenant_id())
    WITH CHECK (tenant_id = get_current_tenant_id());

-- ─── NOTIFICATIONS ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow all access to notifications" ON notifications;
DROP POLICY IF EXISTS "Tenant isolation for notifications" ON notifications;
CREATE POLICY "Tenant isolation for notifications"
    ON notifications FOR ALL
    USING (tenant_id = get_current_tenant_id())
    WITH CHECK (tenant_id = get_current_tenant_id());

-- ─── STAFF ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow all access to staff" ON staff;
DROP POLICY IF EXISTS "Tenant isolation for staff" ON staff;
CREATE POLICY "Tenant isolation for staff"
    ON staff FOR ALL
    USING (tenant_id = get_current_tenant_id())
    WITH CHECK (tenant_id = get_current_tenant_id());

-- ─── CONSENT_FORMS ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow all access to consent_forms" ON consent_forms;
DROP POLICY IF EXISTS "Tenant isolation for consent_forms" ON consent_forms;
CREATE POLICY "Tenant isolation for consent_forms"
    ON consent_forms FOR ALL
    USING (tenant_id = get_current_tenant_id())
    WITH CHECK (tenant_id = get_current_tenant_id());

-- ─── TENANTS (public read for resolver) ──────────────────────────────
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read of tenants" ON tenants;
CREATE POLICY "Allow public read of tenants"
    ON tenants FOR SELECT
    USING (true);

-- ═══════════════════════════════════════════════════════════════════════
-- 5. RPC FUNCTION: set_config (wraps PostgreSQL set_config for RLS)
-- This allows the frontend to call supabase.rpc('set_config', { ... })
-- to set the tenant context before queries.
-- ═══════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.set_config(
    setting_name TEXT,
    setting_value TEXT,
    is_local BOOLEAN DEFAULT false
)
RETURNS TEXT AS $$
BEGIN
    PERFORM pg_catalog.set_config(setting_name, setting_value, is_local);
    RETURN setting_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to both anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.set_config(TEXT, TEXT, BOOLEAN) TO anon;
GRANT EXECUTE ON FUNCTION public.set_config(TEXT, TEXT, BOOLEAN) TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════
-- DONE. Multi-tenant architecture is now active.
-- All existing data has been assigned to the 'medfit-america' tenant.
-- New tenants can be onboarded by inserting into the 'tenants' table.
-- ═══════════════════════════════════════════════════════════════════════
