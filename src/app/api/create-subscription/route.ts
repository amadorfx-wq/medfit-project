import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export async function POST(req: Request) {
    try {
        const { patientEmail, patientName, priceAmount, planName, patientId } = await req.json();

        // Validate inputs
        if (!patientEmail || !priceAmount || !planName) {
            return NextResponse.json(
                { error: 'Missing required fields: patientEmail, priceAmount, planName' },
                { status: 400 }
            );
        }

        const stripe = getStripe();

        // 1. Find or create Stripe Customer
        const existingCustomers = await stripe.customers.list({
            email: patientEmail,
            limit: 1,
        });

        let customer;
        if (existingCustomers.data.length > 0) {
            customer = existingCustomers.data[0];
        } else {
            customer = await stripe.customers.create({
                email: patientEmail,
                name: patientName || undefined,
                metadata: {
                    medfit_patient_id: patientId || '',
                },
            });
        }

        // 2. Create a Price (recurring) for the plan
        const price = await stripe.prices.create({
            currency: 'usd',
            unit_amount: Math.round(priceAmount * 100), // cents
            recurring: {
                interval: 'month',
            },
            product_data: {
                name: planName,
                metadata: {
                    medfit_plan: planName,
                },
            },
        });

        // 3. Create the Subscription with a trial (captures card, charges in 3 days)
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: price.id }],
            payment_behavior: 'default_incomplete',
            payment_settings: {
                save_default_payment_method: 'on_subscription',
            },
            expand: ['latest_invoice.payment_intent'],
            metadata: {
                medfit_patient_id: patientId || '',
                medfit_plan: planName,
            },
        });

        // Extract client_secret for frontend to complete payment
        const invoice = subscription.latest_invoice as any;
        const paymentIntent = invoice?.payment_intent as any;

        return NextResponse.json({
            subscriptionId: subscription.id,
            clientSecret: paymentIntent?.client_secret || null,
            customerId: customer.id,
            status: subscription.status,
        });
    } catch (err: unknown) {
        console.error('[MedFit] Stripe Subscription Error:', err);
        const message = err instanceof Error ? err.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
