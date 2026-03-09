// POST /api/auth/refresh
// Reads the refresh_token from the Supabase cookie, obtains a new session,
// and resets the cookie — extending the session by another hour.
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function readCookieSession(req: NextRequest): { access_token: string; refresh_token: string } | null {
    const cookieHeader = req.headers.get('cookie') || '';
    const cookies = cookieHeader.split(';').map((c) => c.trim());

    // Try single cookie
    for (const c of cookies) {
        if (c.startsWith('sb-') && c.includes('-auth-token=')) {
            try {
                const value = decodeURIComponent(c.split('=').slice(1).join('='));
                return JSON.parse(value);
            } catch {
                // continue
            }
        }
    }

    // Try chunked cookies
    const chunkPrefix = cookies
        .map((c) => c.split('=')[0])
        .find((name) => /^sb-.*-auth-token\.0$/.test(name));

    if (chunkPrefix) {
        const baseName = chunkPrefix.replace('.0', '');
        const chunks: string[] = [];
        let i = 0;
        while (true) {
            const chunk = cookies.find((c) => c.startsWith(`${baseName}.${i}=`));
            if (!chunk) break;
            chunks.push(decodeURIComponent(chunk.split('=').slice(1).join('=')));
            i++;
        }
        if (chunks.length > 0) {
            try {
                return JSON.parse(chunks.join(''));
            } catch {
                // fall through
            }
        }
    }

    return null;
}

export async function POST(req: NextRequest) {
    const session = readCookieSession(req);

    if (!session?.refresh_token) {
        return NextResponse.json({ error: 'No session to refresh.' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await supabase.auth.refreshSession({
        refresh_token: session.refresh_token,
    });

    if (error || !data.session) {
        return NextResponse.json({ error: 'Session refresh failed.' }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });

    const cookieOptions = {
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 60 * 60 * 24 * 7,
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
}
