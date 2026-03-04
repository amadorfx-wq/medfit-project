/**
 * MedFit — Create audit_logs table in Supabase
 */
// scripts/migrate.mjs
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load variables from .env.local
dotenv.config({ path: '.env.local' });

// Load variables from .env if .env.local doesn't cover everything
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Cannot run migration.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  console.log('\n🔧 MedFit — Verifying audit_logs table...\n');

  // Try to insert a test record. If the table doesn't exist, this fails clearly.
  const { error } = await admin.from('audit_logs').select('id').limit(1);

  if (error) {
    console.log('❌ audit_logs table does not exist or is inaccessible:', error.message);
    console.log('\n📝 Please run this SQL in Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/aohpwqgvrdjvnljhpjga/editor\n');
    console.log(`
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'GENERAL',
  user_id TEXT,
  user_name TEXT,
  user_role TEXT,
  details TEXT,
  resource_type TEXT,
  resource_id TEXT,
  ip_address TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for fast filtering
CREATE INDEX IF NOT EXISTS audit_logs_timestamp_idx ON public.audit_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON public.audit_logs (user_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON public.audit_logs (action);

-- Enable RLS — only authenticated staff can read logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: only SUPERADMIN and ADMIN roles can read  
CREATE POLICY "Staff can read audit logs" ON public.audit_logs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: anyone authenticated can insert (the app inserts on behalf of users)
CREATE POLICY "App can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- IMPORTANT: Nobody can UPDATE or DELETE audit logs (immutable)
-- (No UPDATE or DELETE policies means they are blocked by default with RLS)
        `);
  } else {
    console.log('✅ audit_logs table exists and is accessible!');

    // Also verify/add new columns if they don't exist
    console.log('\n📋 Run this SQL to upgrade existing table with new columns if needed:');
    console.log(`
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'GENERAL';
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS resource_type TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS resource_id TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS ip_address TEXT;
CREATE INDEX IF NOT EXISTS audit_logs_timestamp_idx ON public.audit_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON public.audit_logs (user_id);
        `);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
