/**
 * MedFit Auth Helpers
 * Wraps Supabase Auth for use across the application.
 * Passwords are NEVER stored in plaintext — Supabase uses bcrypt internally.
 */
import { supabase, assertSupabaseConfigured } from "@/lib/supabase";
import type { Role } from "@/types/staff";

// ─── Timeout utility ─────────────────────────────────────────────────────────
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    return Promise.race([
        promise,
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(
                `${label} timed out after ${ms / 1000}s. ` +
                'This usually means Supabase environment variables are not configured in Vercel. ' +
                'Go to Vercel → Settings → Environment Variables and add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
            )), ms)
        ),
    ]);
}

// ─── Sign In ──────────────────────────────────────────────────────────────────
export async function signInWithCredentials(email: string, password: string) {
    // ENTERPRISE GUARD: Fail fast if Supabase is not configured
    assertSupabaseConfigured();

    const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        10000, // 10 second timeout
        'signInWithPassword'
    );

    if (error) throw new Error(error.message);
    return data;
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
}

// ─── Get Current Session ──────────────────────────────────────────────────────
export async function getSessionUser() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user ?? null;
}

// ─── Create Staff User (Admin only — uses service role via API route) ─────────
// This calls a Next.js API Route so the service_role key stays server-side only.
export async function createStaffUser(email: string, password: string, metadata: {
    name: string;
    role: Role;
    department: string;
    staffId: string;
}) {
    const res = await fetch("/api/admin/create-staff-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, metadata }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create staff user");
    }
    return res.json();
}

// ─── Map Supabase Auth user → our app role ────────────────────────────────────
export function getRoleFromUserMetadata(user: any): Role {
    return (user?.user_metadata?.role as Role) ?? null;
}
