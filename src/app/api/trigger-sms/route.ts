import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key");

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { patientId, patientName, type } = body;

        if (!patientId || !patientName) {
            return NextResponse.json(
                { error: "Missing required fields (patientId, patientName)" },
                { status: 400 }
            );
        }

        console.log(`[Notification Engine] Triggering rescue sequence for ${patientName} (${patientId})...`);
        const messageType = type || "ONBOARDING_RESCUE";

        // Fetch patient email from DB to send the real email
        const { data: patientData, error: patientError } = await supabase
            .from('patients')
            .select('email')
            .eq('id', patientId)
            .single();

        let targetEmail = patientData?.email;

        // Fallback for demo if no email is found
        if (!targetEmail || patientError) {
            targetEmail = "demo@example.com";
        }

        // 1. Send Real Email via Resend
        if (process.env.RESEND_API_KEY) {
            const { error: emailError } = await resend.emails.send({
                from: 'MedFit Concierge <onboarding@medfitamerica.com>', // Requires verified domain in Resend
                to: [targetEmail],
                subject: 'Action Required: Complete your MedFit Profile',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #080808; color: #ffffff; padding: 40px; border-radius: 8px;">
                        <h2 style="color: #B8977E; text-align: center;">MedFit America</h2>
                        <h3 style="color: #ffffff; text-align: center; font-weight: normal;">Hello ${patientName},</h3>
                        <p style="color: #a0a0a0; font-size: 16px; line-height: 1.5; text-align: center;">
                            We noticed you haven't completed your intake forms or clinical review yet. To proceed with your personalized treatment protocol, please complete your profile.
                        </p>
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/login" style="background-color: #B8977E; color: #000000; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
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
                console.error("[API] Resend failed to send email:", emailError);
            }
        } else {
            console.warn("[API] RESEND_API_KEY is missing. Email simulation only.");
        }

        // 2. Log the action in Supabase Audit Logs for compliance
        const { error: auditError } = await supabase.from('audit_logs').insert({
            id: `al_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            action: `SYSTEM_ALERT_${messageType}`,
            user_id: "system",
            user_name: "Auto-Recovery Engine",
            user_role: "SYSTEM",
            details: `Sent automated follow-up communication to ${patientName} (${targetEmail})`,
            timestamp: new Date().toISOString()
        });

        if (auditError) {
            console.error("[API] Failed to save audit log for notification trigger:", auditError);
        }

        return NextResponse.json({
            success: true,
            message: `Follow-up sequence initiated for ${patientName}`,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error("[API] Error in /api/trigger-sms:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}
