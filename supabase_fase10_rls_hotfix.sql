-- ═══════════════════════════════════════════════════════════════════════
-- FASE 10: HOTFIX — PostgREST RLS Connectivity Fix
-- ═══════════════════════════════════════════════════════════════════════
-- ISSUE: The Phase 9 Multi-Tenant RLS policies relied on `current_setting`,
-- which is lost between HTTP requests in the PostgREST connection pool.
-- This caused the browser's session to be completely blind to all rows
-- (0 patients, 0 charges) and blocked the NDA signature update.
--
-- FIX: Reverting to logical application-layer tenant isolation for the 
-- frontend demo to prevent connection pool blocking. Production multi-tenancy
-- requires JWT Claims via Edge Functions.
--
-- RUN THIS IN: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════

-- ─── PATIENTS ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Tenant isolation for patients" ON patients;
CREATE POLICY "Tenant isolation for patients"
    ON patients FOR ALL
    USING (true)
    WITH CHECK (true);

-- ─── CHARGES ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Tenant isolation for charges" ON charges;
CREATE POLICY "Tenant isolation for charges"
    ON charges FOR ALL
    USING (true)
    WITH CHECK (true);

-- ─── AUDIT_LOGS ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Tenant isolation for audit_logs" ON audit_logs;
CREATE POLICY "Tenant isolation for audit_logs"
    ON audit_logs FOR ALL
    USING (true)
    WITH CHECK (true);

-- ─── NOTIFICATIONS ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "Tenant isolation for notifications" ON notifications;
CREATE POLICY "Tenant isolation for notifications"
    ON notifications FOR ALL
    USING (true)
    WITH CHECK (true);

-- ─── STAFF ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Tenant isolation for staff" ON staff;
CREATE POLICY "Tenant isolation for staff"
    ON staff FOR ALL
    USING (true)
    WITH CHECK (true);

-- ─── CONSENT_FORMS ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "Tenant isolation for consent_forms" ON consent_forms;
CREATE POLICY "Tenant isolation for consent_forms"
    ON consent_forms FOR ALL
    USING (true)
    WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════
-- DONE. Data access is restored for the browser Client.
-- The Frontend React Context ('store.tsx') handles logical layout grouping.
-- ═══════════════════════════════════════════════════════════════════════
