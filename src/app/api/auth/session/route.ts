// /api/auth/session — Server-side session reader
// Reads auth cookies and returns the current user without ANY client-side Supabase SDK
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ user: null, session: null }, { status: 200 });
    }

    // Read the auth cookie directly
    const projectRef = supabaseUrl.replace('https://', '').split('.')[0];
    const cookieName = `sb-${projectRef}-auth-token`;

    // Try single cookie first, then chunked
    let cookieValue = request.cookies.get(cookieName)?.value;

    if (!cookieValue) {
        // Try chunked cookies
        const chunks: string[] = [];
        let i = 0;
        while (true) {
            const chunk = request.cookies.get(`${cookieName}.${i}`)?.value;
            if (!chunk) break;
            chunks.push(chunk);
            i++;
        }
        if (chunks.length > 0) {
            cookieValue = chunks.join('');
        }
    }

    if (!cookieValue) {
        return NextResponse.json({ user: null, session: null }, { status: 200 });
    }

    try {
        const sessionData = JSON.parse(cookieValue);

        if (!sessionData.access_token) {
            return NextResponse.json({ user: null, session: null }, { status: 200 });
        }

        // Verify the token is still valid by getting user from Supabase
        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: { persistSession: false, autoRefreshToken: false },
        });

        const { data: { user }, error } = await supabase.auth.getUser(sessionData.access_token);

        if (error || !user) {
            return NextResponse.json({ user: null, session: null }, { status: 200 });
        }

        const role = user.user_metadata?.role || 'ADMIN';
        const name = user.user_metadata?.name || user.email || 'Staff';
        const tenantId = user.user_metadata?.tenant_id;

        // Get NDA status
        let ndaSignedAt: string | null = null;
        if (role !== 'PATIENT') {
            const { data: staffData } = await supabase
                .from('staff')
                .select('nda_signed_at')
                .eq('supabase_user_id', user.id)
                .maybeSingle();
            ndaSignedAt = staffData?.nda_signed_at ?? null;
        }

        return NextResponse.json({
            user: { id: user.id, email: user.email, role, name, tenantId, ndaSignedAt },
            session: {
                access_token: sessionData.access_token,
                refresh_token: sessionData.refresh_token,
            },
        });
    } catch {
        return NextResponse.json({ user: null, session: null }, { status: 200 });
    }
}
