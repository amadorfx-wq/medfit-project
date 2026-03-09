// src/app/api/auth/patient-register/route.ts
// ─── Patient Self-Registration Endpoint ───────────────────────────────────────
// Creates a Supabase Auth user for the patient, inserts a record in the
// patients table using the real auth UUID, then auto-logs them in.
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required.' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters.' },
                { status: 400 }
            );
        }

        // Read tenant from cookie (set by middleware on every request)
        const tenantId = request.cookies.get('tenant_id')?.value || null;

        // Create Supabase Auth user (service role — server-side only)
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // auto-confirm for managed patient onboarding
            user_metadata: {
                name,
                role: 'PATIENT',
                tenant_id: tenantId,
            },
        });

        if (authError) {
            const status = authError.message.includes('already registered') ? 409 : 400;
            return NextResponse.json({ error: authError.message }, { status });
        }

        const userId = authData.user?.id;
        if (!userId) {
            return NextResponse.json({ error: 'User creation failed.' }, { status: 500 });
        }

        // Insert patient record using the real Supabase auth UUID as the primary key
        const { error: insertError } = await supabaseAdmin.from('patients').insert({
            id: userId,
            name,
            email,
            active_treatment: 'Pending Evaluation',
            forms_status: 'PENDING',
            approval_status: 'PENDING_FORMS',
            required_forms: ['wellness-intake'],
            completed_forms: [],
            created_at: new Date().toISOString(),
            tenant_id: tenantId,
        });

        if (insertError) {
            // Rollback: delete the auth user if patient record creation fails
            await supabaseAdmin.auth.admin.deleteUser(userId);
            return NextResponse.json(
                { error: 'Failed to create patient record: ' + insertError.message },
                { status: 500 }
            );
        }

        // Auto-login: sign in to get a session immediately after registration
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabaseAnon = createClient(supabaseUrl, supabaseKey, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data: sessionData, error: sessionError } = await supabaseAnon.auth.signInWithPassword({
            email,
            password,
        });

        if (sessionError || !sessionData.session) {
            // Registration succeeded — user just needs to log in manually
            return NextResponse.json({ success: true, requiresLogin: true });
        }

        // Set session cookies (same chunked pattern as /api/auth/login)
        const response = NextResponse.json({ success: true, requiresLogin: false });

        const cookieOptions = {
            path: '/',
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            maxAge: 60 * 60 * 24 * 7,
        };

        const cookieValue = JSON.stringify({
            access_token: sessionData.session.access_token,
            refresh_token: sessionData.session.refresh_token,
            expires_at: sessionData.session.expires_at,
            expires_in: sessionData.session.expires_in,
            token_type: sessionData.session.token_type,
            user: sessionData.session.user,
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
        console.error('[Patient Register] Error:', err);
        return NextResponse.json(
            { error: err.message || 'Internal server error during registration.' },
            { status: 500 }
        );
    }
}
