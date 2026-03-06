/**
 * MedFit Auth Helpers
 * Wraps Supabase Auth for use across the application.
 * Passwords are NEVER stored in plaintext — Supabase uses bcrypt internally.
 */
import { supabase } from "@/lib/supabase";
import type { Role } from "@/types/staff";

// ─── Dev Credentials (for bootstrapping / never expose in production) ──────────
export const DEV_CREDENTIALS = [
    { email: "admin@medfit.com", password: "MedFit2026!", role: "SUPERADMIN" as Role, name: "Dr. James Kitchens" },
    { email: "doctor@medfit.com", password: "Doctor2026!", role: "DOCTOR" as Role, name: "Sarah Connor, NP" },
    { email: "reception@medfit.com", password: "Staff2026!", role: "RECEPTION" as Role, name: "Emily Watson" },
];

// ─── Sign In ──────────────────────────────────────────────────────────────────
export async function signInWithCredentials(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
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
