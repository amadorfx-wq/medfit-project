import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { resolveTenant, extractSubdomain } from '@/lib/tenant-resolver';

// ─── Route Permission Map ──────────────────────────────────────────────────────
// Defines which roles can access which route prefixes.
// More specific paths take precedence.
const ROUTE_PERMISSIONS: { path: string; allowedRoles: string[] }[] = [
    // Staff & Security management = SUPERADMIN only
    { path: '/admin/staff', allowedRoles: ['SUPERADMIN'] },
    { path: '/admin/security', allowedRoles: ['SUPERADMIN'] },
    // Admin portal = SUPERADMIN, ADMIN, DOCTOR, RECEPTION
    { path: '/admin', allowedRoles: ['SUPERADMIN', 'ADMIN', 'DOCTOR', 'RECEPTION'] },
    // Patient portal = PATIENT only
    { path: '/dashboard', allowedRoles: ['PATIENT'] },
];

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: { headers: request.headers },
    });

    // ── 0. Multi-Tenant Resolution ───────────────────────────────────────────
    const hostname = request.headers.get('host') || 'localhost:3000';
    const tenantInfo = await resolveTenant(hostname);

    if (!tenantInfo) {
        const subdomain = extractSubdomain(hostname);
        // Only 404 if there was a real subdomain that didn't match
        if (subdomain) {
            return new NextResponse('Clinic not found', { status: 404 });
        }
    }

    // Inject tenant_id into the request headers and set a cookie for client-side access
    if (tenantInfo) {
        response.headers.set('x-tenant-id', tenantInfo.id);
        response.headers.set('x-tenant-slug', tenantInfo.slug);
        response.headers.set('x-tenant-name', tenantInfo.name);
        response.cookies.set('tenant_id', tenantInfo.id, {
            httpOnly: false,  // Needs to be readable by client-side JS
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24, // 24 hours
        });
    }

    // ── 1. Build Supabase client that can read/write cookies ──────────────────
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options });
                    response = NextResponse.next({ request: { headers: request.headers } });
                    // Re-inject tenant headers/cookies on response rebuild
                    if (tenantInfo) {
                        response.headers.set('x-tenant-id', tenantInfo.id);
                        response.cookies.set('tenant_id', tenantInfo.id, {
                            httpOnly: false,
                            secure: process.env.NODE_ENV === 'production',
                            sameSite: 'lax',
                            path: '/',
                            maxAge: 60 * 60 * 24,
                        });
                    }
                    response.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options });
                    response = NextResponse.next({ request: { headers: request.headers } });
                    if (tenantInfo) {
                        response.headers.set('x-tenant-id', tenantInfo.id);
                        response.cookies.set('tenant_id', tenantInfo.id, {
                            httpOnly: false,
                            secure: process.env.NODE_ENV === 'production',
                            sameSite: 'lax',
                            path: '/',
                            maxAge: 60 * 60 * 24,
                        });
                    }
                    response.cookies.set({ name, value: '', ...options });
                },
            },
        }
    );

    // ── 2. Refresh session (keeps tokens alive) ────────────────────────────────
    const { data: { session } } = await supabase.auth.getSession();
    const pathname = request.nextUrl.pathname;

    // ── 3. Find the most specific matching route rule ─────────────────────────
    const matchedRule = ROUTE_PERMISSIONS.find(rule => pathname.startsWith(rule.path));

    // ── 4. If no rule — public route, allow through ───────────────────────────
    if (!matchedRule) return response;

    // ── 5. Protected route — must have a session ──────────────────────────────
    if (!session) {
        // [DEMO HOTFIX] Check for demo patient cookie
        const demoCookie = request.cookies.get('demo_patient_session');
        if (demoCookie && matchedRule.allowedRoles.includes('PATIENT')) {
            // Bypass strict Supabase Auth for the PATIENT role demo
            return response;
        }

        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ── 6. Role-based access check ────────────────────────────────────────────
    const userRole: string = session.user.user_metadata?.role ?? 'PATIENT';
    const hasAccess = matchedRule.allowedRoles.includes(userRole);

    if (!hasAccess) {
        // Redirect to the appropriate portal based on role
        if (userRole === 'PATIENT') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        // Staff trying to reach a restricted admin sub-page
        if (pathname.startsWith('/admin')) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return response;
}

// ── Matcher: run on all non-static paths ──────────────────────────────────────
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
