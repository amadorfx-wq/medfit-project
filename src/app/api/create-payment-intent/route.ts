import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { buildStripePayload } from '@/lib/payment-nomenclature';

export async function POST(req: Request) {
    try {
        const { amount, description, patientId, chargeId, metadata } = await req.json();

        // Validate amount
        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        // ──────────────────────────────────────────────────────────
        // CRITICAL: Translate the internal medical description into
        // a generic, processor-safe label before sending to Stripe.
        // This prevents account freezes from flagged keywords like
        // "Testosterone", "Semaglutide", "Peptide", etc.
        // ──────────────────────────────────────────────────────────
        const stripePayload = buildStripePayload(
            description || 'Medical Services',
            patientId,
            chargeId
        );

        const stripe = getStripe();
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects amounts in cents
            currency: 'usd',
            description: stripePayload.description,
            statement_descriptor: stripePayload.statement_descriptor,
            metadata: {
                ...stripePayload.metadata,
                ...(metadata || {}),
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            // Send back the translated label so frontend can display it
            processorDescription: stripePayload.description,
        });
    } catch (err: unknown) {
        console.error('Stripe PaymentIntent Error:', err);
        const message = err instanceof Error ? err.message : 'Internal Server Error';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
