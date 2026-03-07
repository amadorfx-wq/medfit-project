// src/app/api/health/route.ts
// ─── Production Diagnostics Endpoint ──────────────────────────────────────────
// Reports environment variable status and Supabase connectivity.
// NEVER exposes actual secret values — only boolean flags.
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const diagnostics: Record<string, any> = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'unknown',
        env_vars: {
            NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
            NEXT_PUBLIC_SUPABASE_ANON_KEY: !!supabaseKey,
            SUPABASE_SERVICE_ROLE_KEY: !!serviceRoleKey,
            NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!stripeKey,
        },
        // Expose only the domain (not the full URL with potential sensitive paths)
        supabase_url_domain: supabaseUrl ? new URL(supabaseUrl).hostname : 'NOT_SET',
        auth_connection: 'not_tested',
    };

    // Test Supabase connection only if env vars are present
    if (supabaseUrl && supabaseKey) {
        try {
            const testClient = createClient(supabaseUrl, supabaseKey);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Connection timeout (5s)')), 5000)
            );
            const authPromise = testClient.auth.getSession();

            await Promise.race([authPromise, timeoutPromise]);
            diagnostics.auth_connection = 'ok';
            diagnostics.status = 'healthy';
        } catch (err: any) {
            diagnostics.auth_connection = `error: ${err.message}`;
            diagnostics.status = 'degraded';
        }
    } else {
        diagnostics.auth_connection = 'skipped — missing env vars';
        diagnostics.status = 'misconfigured';
    }

    const httpStatus = diagnostics.status === 'healthy' ? 200 : 503;
    return NextResponse.json(diagnostics, { status: httpStatus });
}
