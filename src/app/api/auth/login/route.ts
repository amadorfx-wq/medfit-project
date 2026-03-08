// src/app/api/auth/login/route.ts
// ─── Server-Side Authentication Endpoint ──────────────────────────────────────
// This endpoint handles authentication server-side, bypassing any client-side
// Supabase issues. It authenticates with Supabase from the server, then sets
// the session cookies so the middleware can read them on subsequent requests.
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required.' },
                { status: 400 }
            );
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json(
                { error: 'Server configuration error: Supabase credentials missing.' },
                { status: 500 }
            );
        }

        // Create a fresh Supabase client for this request (no shared state)
        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        // Authenticate with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            );
        }

        if (!data.session || !data.user) {
            return NextResponse.json(
                { error: 'Authentication failed — no session returned.' },
                { status: 401 }
            );
        }

        // Fetch staff NDA status
        let ndaSignedAt: string | null = null;
        const role = data.user.user_metadata?.role || 'ADMIN';

        if (role !== 'PATIENT') {
            const { data: staffData } = await supabase
                .from('staff')
                .select('nda_signed_at')
                .eq('supabase_user_id', data.user.id)
                .maybeSingle();

            ndaSignedAt = staffData?.nda_signed_at ?? null;
        }

        // Build the response with the user data
        const responseData = {
            user: {
                id: data.user.id,
                email: data.user.email,
                role,
                name: data.user.user_metadata?.name || data.user.email || 'Staff',
                tenantId: data.user.user_metadata?.tenant_id,
                ndaSignedAt,
            },
            session: {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_at: data.session.expires_at,
            },
        };

        const response = NextResponse.json(responseData, { status: 200 });

        // Set Supabase auth cookies so the middleware can read the session
        // These cookie names match what @supabase/ssr expects
        // httpOnly=false so the Supabase client can read cookies for data queries
        const cookieOptions = {
            path: '/',
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            maxAge: 60 * 60 * 24 * 7, // 7 days
        };

        // Store the full session in the standard Supabase cookie format
        const cookieValue = JSON.stringify({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
            expires_in: data.session.expires_in,
            token_type: data.session.token_type,
            user: data.session.user,
        });

        // Supabase SSR uses a chunked cookie pattern: sb-{project-ref}-auth-token
        // The project ref is extracted from the URL
        const projectRef = supabaseUrl.replace('https://', '').split('.')[0];
        const cookieName = `sb-${projectRef}-auth-token`;

        // If cookie is too large, chunk it (Supabase SSR pattern)
        const MAX_CHUNK_SIZE = 3180; // Leave room for cookie overhead
        if (cookieValue.length <= MAX_CHUNK_SIZE) {
            response.cookies.set(cookieName, cookieValue, cookieOptions);
        } else {
            // Chunk the cookie value
            const chunks = Math.ceil(cookieValue.length / MAX_CHUNK_SIZE);
            for (let i = 0; i < chunks; i++) {
                const chunk = cookieValue.substring(i * MAX_CHUNK_SIZE, (i + 1) * MAX_CHUNK_SIZE);
                response.cookies.set(`${cookieName}.${i}`, chunk, cookieOptions);
            }
        }

        return response;
    } catch (err: any) {
        console.error('[Auth API] Login error:', err);
        return NextResponse.json(
            { error: err.message || 'Internal server error during authentication.' },
            { status: 500 }
        );
    }
}
