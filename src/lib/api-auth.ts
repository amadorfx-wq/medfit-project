// src/lib/api-auth.ts
// ─── Server-Side API Authorization Helper ─────────────────────────────────────
// Use requireAuth() at the top of any API route handler to enforce role-based
// access control before executing business logic.
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export interface ApiUser {
    id: string;
    email: string | undefined;
    role: string;
    tenantId: string | undefined;
}

export interface AuthResult {
    user: ApiUser | null;
    error: NextResponse | null;
}

/**
 * Verifies the caller has a valid Supabase session and one of the allowed roles.
 * Returns { user, error: null } on success, or { user: null, error: NextResponse } on failure.
 *
 * Usage:
 *   const { user, error } = await requireAuth(request, ['SUPERADMIN', 'ADMIN']);
 *   if (error) return error;
 */
export async function requireAuth(
    request: NextRequest,
    allowedRoles: string[] = []
): Promise<AuthResult> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return {
            user: null,
            error: NextResponse.json(
                { error: 'Server configuration error.' },
                { status: 500 }
            ),
        };
    }

    // Reconstruct the session from the request cookie (same pattern as /api/auth/login)
    const projectRef = supabaseUrl.replace('https://', '').split('.')[0];
    const cookieName = `sb-${projectRef}-auth-token`;

    // Read cookie — handle both single and chunked formats
    let cookieValue: string | undefined;
    const singleCookie = request.cookies.get(cookieName)?.value;

    if (singleCookie) {
        cookieValue = singleCookie;
    } else {
        // Reassemble chunked cookies
        const chunks: string[] = [];
        let i = 0;
        while (true) {
            const chunk = request.cookies.get(`${cookieName}.${i}`)?.value;
            if (!chunk) break;
            chunks.push(chunk);
            i++;
        }
        if (chunks.length > 0) cookieValue = chunks.join('');
    }

    if (!cookieValue) {
        return {
            user: null,
            error: NextResponse.json({ error: 'Unauthorized — no session.' }, { status: 401 }),
        };
    }

    let session: any;
    try {
        session = JSON.parse(cookieValue);
    } catch {
        return {
            user: null,
            error: NextResponse.json({ error: 'Unauthorized — malformed session.' }, { status: 401 }),
        };
    }

    if (!session?.access_token) {
        return {
            user: null,
            error: NextResponse.json({ error: 'Unauthorized — no access token.' }, { status: 401 }),
        };
    }

    // Verify the token with Supabase
    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { autoRefreshToken: false, persistSession: false },
        global: { headers: { Authorization: `Bearer ${session.access_token}` } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser(session.access_token);

    if (userError || !user) {
        return {
            user: null,
            error: NextResponse.json({ error: 'Unauthorized — invalid or expired token.' }, { status: 401 }),
        };
    }

    const role: string = user.user_metadata?.role ?? 'PATIENT';

    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        return {
            user: null,
            error: NextResponse.json(
                { error: `Forbidden — requires one of: ${allowedRoles.join(', ')}` },
                { status: 403 }
            ),
        };
    }

    return {
        user: {
            id: user.id,
            email: user.email,
            role,
            tenantId: user.user_metadata?.tenant_id,
        },
        error: null,
    };
}

// Convenience: all staff roles (non-patient)
export const STAFF_ROLES = ['SUPERADMIN', 'ADMIN', 'DOCTOR', 'RECEPTION'] as const;
