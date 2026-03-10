// /api/auth/logout — Server-side logout
// Invalidates the JWT on Supabase's end (kills the session globally),
// then clears all local auth cookies. Tokens cannot be reused post-logout.
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const projectRef = supabaseUrl.replace('https://', '').split('.')[0];
    const cookieName = `sb-${projectRef}-auth-token`;

    // ── Read access_token from cookie (single or chunked) ──────────────────
    let accessToken: string | undefined;

    const single = request.cookies.get(cookieName)?.value;
    if (single) {
        try { accessToken = JSON.parse(single)?.access_token; } catch { /* noop */ }
    } else {
        const chunks: string[] = [];
        let i = 0;
        while (true) {
            const chunk = request.cookies.get(`${cookieName}.${i}`)?.value;
            if (!chunk) break;
            chunks.push(chunk);
            i++;
        }
        if (chunks.length > 0) {
            try { accessToken = JSON.parse(chunks.join(''))?.access_token; } catch { /* noop */ }
        }
    }

    // ── Invalidate token on Supabase's end ─────────────────────────────────
    // scope: 'global' revokes the session for ALL devices, not just this one.
    // Non-fatal: if the token is already expired, signOut still returns success.
    if (accessToken && supabaseUrl && supabaseKey) {
        try {
            const supabase = createClient(supabaseUrl, supabaseKey, {
                auth: { persistSession: false, autoRefreshToken: false },
                global: { headers: { Authorization: `Bearer ${accessToken}` } },
            });
            await supabase.auth.signOut({ scope: 'global' });
        } catch { /* non-fatal — cookies are cleared below regardless */ }
    }

    // ── Clear all local auth cookies ────────────────────────────────────────
    const response = NextResponse.json({ success: true });
    response.cookies.set(cookieName, '', { path: '/', maxAge: 0 });
    for (let i = 0; i < 10; i++) {
        response.cookies.set(`${cookieName}.${i}`, '', { path: '/', maxAge: 0 });
    }

    return response;
}
