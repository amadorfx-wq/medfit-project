// /api/auth/logout — Server-side logout
import { NextResponse } from 'next/server';

export async function POST() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const projectRef = supabaseUrl.replace('https://', '').split('.')[0];
    const cookieName = `sb-${projectRef}-auth-token`;

    const response = NextResponse.json({ success: true });

    // Clear the main auth cookie
    response.cookies.set(cookieName, '', { path: '/', maxAge: 0 });

    // Clear any chunked cookies (up to 10 chunks)
    for (let i = 0; i < 10; i++) {
        response.cookies.set(`${cookieName}.${i}`, '', { path: '/', maxAge: 0 });
    }

    return response;
}
