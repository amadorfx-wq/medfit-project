import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";
import { requireAuth, STAFF_ROLES } from "@/lib/api-auth";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key");

export async function POST(req: NextRequest) {
    const { error: authError } = await requireAuth(req, [...STAFF_ROLES]);
    if (authError) return authError;

    try {
        const body = await req.json();
        const { patientId, patientName, type } = body;

        if (!patientId || !patientName) {
            return NextResponse.json(
                { error: "Missing required fields (patientId, patientName)" },
                { status: 400 }
            );
        }

        const messageType = type || "ONBOARDING_RESCUE";

        // Fetch patient email from DB
        const { data: patientData, error: patientError } = await supabase
            .from('patients')
            .select('email')
            .eq('id', patientId)
            .single();

        if (!patientData?.email || patientError) {
            return NextResponse.json(
                { error: 'Patient has no email address on file. Cannot send notification.' },
                { status: 400 }
            );
        }

        const targetEmail = patientData.email;

        // 1. Send email via Resend
        if (process.env.RESEND_API_KEY) {
            const { error: emailError } = await resend.emails.send({
                from: 'MedFit Concierge <onboarding@medfitamerica.com>',
                to: [targetEmail],
                subject: 'Action Required: Complete your MedFit Profile',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #080808; color: #ffffff; padding: 40px; border-radius: 8px;">
                        <h2 style="color: #a10c22; text-align: center;">MedFit America</h2>
                        <h3 style="color: #ffffff; text-align: center; font-weight: normal;">Hello ${patientName},</h3>
                        <p style="color: #a0a0a0; font-size: 16px; line-height: 1.5; text-align: center;">
                            We noticed you haven't completed your intake forms or clinical review yet. To proceed with your personalized treatment protocol, please complete your profile.
                        </p>
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/login" style="background-color: #a10c22; color: #000000; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
                                Resume Onboarding
                            </a>
                        </div>
                        <p style="color: #a0a0a0; font-size: 12px; text-align: center; margin-top: 40px; opacity: 0.7;">
                            Secure & Encrypted • HIPAA Compliant
                        </p>
                    </div>
                `
            });

            if (emailError) {
                console.error("[Notifications] Resend failed to send email:", emailError);
            }
        } else {
            console.warn("[Notifications] RESEND_API_KEY is missing. Email not sent.");
        }

        // 2. Audit log
        const { error: auditError } = await supabase.from('audit_logs').insert({
            id: `al_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            action: `SYSTEM_ALERT_${messageType}`,
            user_id: "system",
            user_name: "Auto-Recovery Engine",
            user_role: "SYSTEM",
            details: `Sent automated follow-up communication to ${patientName} (${targetEmail})`,
            timestamp: new Date().toISOString()
        });

        if (auditError) {
            console.error("[Notifications] Failed to save audit log:", auditError);
        }

        return NextResponse.json({
            success: true,
            message: `Follow-up sequence initiated for ${patientName}`,
            timestamp: new Date().toISOString()
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        console.error("[Notifications] Unhandled error:", message);
        return NextResponse.json({ error: "Internal Server Error", details: message }, { status: 500 });
    }
}
