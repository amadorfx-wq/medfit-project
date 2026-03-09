import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "@/lib/api-auth";

// ⚠️ This runs SERVER-SIDE only. The service_role key is never exposed to the browser.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // stored in .env.local only — not NEXT_PUBLIC_
    { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
    const { error: authError } = await requireAuth(req, ['SUPERADMIN']);
    if (authError) return authError;

    try {
        const body = await req.json();
        const { email, password, metadata } = body;

        // In Enterprise Multi-Tenant mode, tenantId (tenant_id) is mandatory for Staff
        if (!email || !password || !metadata?.name || !metadata?.role || !metadata?.tenantId) {
            return NextResponse.json(
                { error: "Missing required fields: email, password, name, role" },
                { status: 400 }
            );
        }

        // Password is hashed by Supabase (bcrypt) — never stored in plaintext
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // auto-confirm for staff (admin-created accounts)
            user_metadata: {
                name: metadata.name,
                role: metadata.role,
                department: metadata.department,
                staff_id: metadata.staffId,
                tenant_id: metadata.tenantId, // ENTERPRISE: Cryptographic isolation boundary
            },
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            userId: data.user?.id,
            email: data.user?.email,
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
    }
}
