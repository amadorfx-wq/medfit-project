// src/app/api/auth/patient-login/route.ts
// ─── Patient Authentication Endpoint ──────────────────────────────────────────
// Mirrors /api/auth/login but for patients (no NDA/staff query).
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

        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 401 });
        }

        if (!data.session || !data.user) {
            return NextResponse.json(
                { error: 'Authentication failed — no session returned.' },
                { status: 401 }
            );
        }

        const role = data.user.user_metadata?.role || 'PATIENT';

        // Only allow PATIENT role through this endpoint
        if (role !== 'PATIENT') {
            return NextResponse.json(
                { error: 'This login endpoint is for patients only.' },
                { status: 403 }
            );
        }

        const responseData = {
            user: {
                id: data.user.id,
                email: data.user.email,
                role,
                name: data.user.user_metadata?.name || data.user.email || 'Patient',
            },
        };

        const response = NextResponse.json(responseData, { status: 200 });

        const cookieOptions = {
            path: '/',
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            maxAge: 60 * 60 * 24 * 7, // 7 days
        };

        const cookieValue = JSON.stringify({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
            expires_in: data.session.expires_in,
            token_type: data.session.token_type,
            user: data.session.user,
        });

        const projectRef = supabaseUrl.replace('https://', '').split('.')[0];
        const cookieName = `sb-${projectRef}-auth-token`;
        const MAX_CHUNK_SIZE = 3180;

        if (cookieValue.length <= MAX_CHUNK_SIZE) {
            response.cookies.set(cookieName, cookieValue, cookieOptions);
        } else {
            const chunks = Math.ceil(cookieValue.length / MAX_CHUNK_SIZE);
            for (let i = 0; i < chunks; i++) {
                const chunk = cookieValue.substring(i * MAX_CHUNK_SIZE, (i + 1) * MAX_CHUNK_SIZE);
                response.cookies.set(`${cookieName}.${i}`, chunk, cookieOptions);
            }
        }

        return response;
    } catch (err: any) {
        console.error('[Patient Auth] Login error:', err);
        return NextResponse.json(
            { error: err.message || 'Internal server error during authentication.' },
            { status: 500 }
        );
    }
}
