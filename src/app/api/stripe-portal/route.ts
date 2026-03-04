import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
    try {
        const { customerEmail } = await req.json();

        if (!customerEmail) {
            return NextResponse.json({ error: 'Missing customerEmail' }, { status: 400 });
        }

        // Find Stripe Customer by email
        const customers = await stripe.customers.list({
            email: customerEmail,
            limit: 1,
        });

        if (customers.data.length === 0) {
            return NextResponse.json({ error: 'No Stripe customer found for this email.' }, { status: 404 });
        }

        const customer = customers.data[0];

        // Create a Stripe Billing Portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customer.id,
            return_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard`,
        });

        return NextResponse.json({ url: portalSession.url });
    } catch (err: unknown) {
        console.error('[MedFit] Stripe Portal Error:', err);
        const message = err instanceof Error ? err.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
