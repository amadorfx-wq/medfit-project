// ─── MedFit Supabase Client ─────────────────────────────────────────────────
// CRITICAL: Uses createClient (NOT createBrowserClient) with ALL auth
// persistence DISABLED. The @supabase/ssr createBrowserClient uses
// Navigator Web Locks API which hangs in Vercel production.
//
// Auth is handled entirely through server-side API routes:
//   POST /api/auth/login   → authenticate
//   GET  /api/auth/session  → check session
//   POST /api/auth/logout   → sign out
//
// This client is used ONLY for data queries (patients, staff, etc).
// The access_token is injected at runtime via setSupabaseToken().
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error(
        '[MedFit CRITICAL] Supabase environment variables are MISSING.\n' +
        `  NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'SET' : '❌ NOT SET'}\n` +
        `  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? 'SET' : '❌ NOT SET'}\n` +
        '  If on Vercel: add them in Settings → Environment Variables → Redeploy.'
    );
}

// Create a PLAIN Supabase client — no auth persistence, no Web Locks, no cookies
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
    },
});

/**
 * Inject an access token into the Supabase client for authenticated data queries.
 * Called after fetching the session from /api/auth/session.
 * This sets the Authorization header so RLS policies work correctly.
 */
export function setSupabaseToken(accessToken: string) {
    // The Supabase JS client stores global headers internally
    // We access the REST client's headers to inject our token
    (supabase as any).rest.headers['Authorization'] = `Bearer ${accessToken}`;
    // Also set on realtime if needed
    (supabase as any).realtime?.setAuth(accessToken);
}

/**
 * Clear the auth token from the Supabase client.
 */
export function clearSupabaseToken() {
    (supabase as any).rest.headers['Authorization'] = `Bearer ${supabaseKey}`;
}
