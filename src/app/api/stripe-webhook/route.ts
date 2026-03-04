import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

// Service-role client for webhook (bypasses RLS)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');

    if (!sig) {
        return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error('[MedFit] STRIPE_WEBHOOK_SECRET not configured');
        return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    let event;
    try {
        const stripe = getStripe();
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Webhook verification failed';
        console.error('[MedFit] Webhook signature verification failed:', message);
        return NextResponse.json({ error: message }, { status: 400 });
    }

    // Process the event
    try {
        switch (event.type) {
            case 'invoice.paid': {
                const invoice = event.data.object as any;
                const customerId = invoice.customer;
                const subscriptionId = invoice.subscription;
                const amountPaid = invoice.amount_paid / 100;

                // Log successful payment
                await supabaseAdmin.from('audit_logs').insert({
                    id: `stripe_${event.id}`,
                    action: 'SUBSCRIPTION_PAYMENT_SUCCESS',
                    category: 'BILLING',
                    user_id: customerId,
                    user_name: invoice.customer_email || 'Stripe Customer',
                    user_role: 'PATIENT',
                    details: `Subscription payment of $${amountPaid.toFixed(2)} processed successfully. Subscription: ${subscriptionId}`,
                    resource_type: 'subscription',
                    resource_id: subscriptionId,
                    timestamp: new Date().toISOString(),
                });

                // Create a paid charge record
                await supabaseAdmin.from('charges').insert({
                    id: `sub_${event.id}`,
                    patient_id: invoice.metadata?.medfit_patient_id || customerId,
                    amount: amountPaid,
                    description: `Monthly Protocol Subscription`,
                    status: 'PAID',
                    date: new Date().toISOString().split('T')[0],
                });

                console.log(`[MedFit] ✅ Invoice paid: $${amountPaid} for ${invoice.customer_email}`);
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as any;
                const customerId = invoice.customer;

                await supabaseAdmin.from('audit_logs').insert({
                    id: `stripe_${event.id}`,
                    action: 'SUBSCRIPTION_PAYMENT_FAILED',
                    category: 'BILLING',
                    user_id: customerId,
                    user_name: invoice.customer_email || 'Stripe Customer',
                    user_role: 'PATIENT',
                    details: `Subscription payment failed for ${invoice.customer_email}. Amount: $${(invoice.amount_due / 100).toFixed(2)}`,
                    resource_type: 'subscription',
                    resource_id: invoice.subscription,
                    timestamp: new Date().toISOString(),
                });

                // Create admin notification
                await supabaseAdmin.from('notifications').insert({
                    id: `stripe_fail_${event.id}`,
                    patient_id: invoice.metadata?.medfit_patient_id || customerId,
                    patient_name: invoice.customer_email || 'Unknown',
                    type: 'SYSTEM_ALERT',
                    content: `⚠️ Subscription payment FAILED for ${invoice.customer_email}. Amount: $${(invoice.amount_due / 100).toFixed(2)}`,
                    read: false,
                });

                console.log(`[MedFit] ❌ Invoice payment failed for ${invoice.customer_email}`);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any;

                await supabaseAdmin.from('audit_logs').insert({
                    id: `stripe_${event.id}`,
                    action: 'SUBSCRIPTION_CANCELLED',
                    category: 'BILLING',
                    user_id: subscription.customer,
                    user_name: 'System',
                    user_role: 'SYSTEM',
                    details: `Subscription ${subscription.id} cancelled.`,
                    resource_type: 'subscription',
                    resource_id: subscription.id,
                    timestamp: new Date().toISOString(),
                });

                console.log(`[MedFit] 🔴 Subscription cancelled: ${subscription.id}`);
                break;
            }

            default:
                console.log(`[MedFit] Unhandled webhook event: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (err: unknown) {
        console.error('[MedFit] Webhook processing error:', err);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
