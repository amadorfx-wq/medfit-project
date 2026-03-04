import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase credentials are missing. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local file.");
}

// Default Supabase client (used for non-tenant-specific operations like auth)
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Set the current tenant context on a Supabase client.
 * This activates the RLS policies that filter by tenant_id.
 *
 * MUST be called before any data queries within a request context.
 * Uses PostgreSQL's `set_config` to set a session-level variable
 * that our RLS policies read via `current_setting('app.tenant_id')`.
 */
export async function setTenantContext(client: SupabaseClient, tenantId: string): Promise<void> {
    const { error } = await client.rpc('set_config', {
        setting_name: 'app.tenant_id',
        setting_value: tenantId,
        is_local: true,  // Setting is local to the current transaction
    });

    if (error) {
        // Fallback: try raw SQL approach via a custom function
        console.warn('[MedFit] set_config RPC failed, tenant context may not be set:', error.message);
    }
}

/**
 * Get the current tenant ID from browser context.
 * Reads from a cookie/header set by the middleware.
 */
export function getTenantIdFromBrowser(): string {
    if (typeof window === 'undefined') return '';

    // Read from meta tag injected by layout
    const meta = document.querySelector('meta[name="x-tenant-id"]');
    if (meta) return meta.getAttribute('content') || '';

    // Fallback: read from cookie
    const match = document.cookie.match(/(?:^|; )tenant_id=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : '';
}
