// POST /api/admin/cancel-patient-subscription
// Cancels all active Stripe subscriptions for a patient before they are deleted.
// Non-fatal: if patient has no Stripe customer, returns { cancelled: false }.
import { NextRequest } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { apiResponse } from '@/core/api-response';
import { ServiceError } from '@/core/errors';

export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => null);
    const patientEmail: string | undefined = body?.patientEmail;

    if (!patientEmail) {
        return apiResponse.error(new ServiceError('Stripe', 'patientEmail is required'));
    }

    try {
        const stripe = getStripe();

        // Look up Stripe customer by email
        const customers = await stripe.customers.list({ email: patientEmail, limit: 1 });

        if (customers.data.length === 0) {
            // Patient never had a Stripe account — nothing to cancel
            return apiResponse.ok({ cancelled: false, reason: 'no_stripe_customer' });
        }

        const customerId = customers.data[0].id;

        // Fetch all active subscriptions for this customer
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'active',
        });

        if (subscriptions.data.length === 0) {
            return apiResponse.ok({ cancelled: false, reason: 'no_active_subscriptions' });
        }

        // Cancel all active subscriptions immediately
        await Promise.all(
            subscriptions.data.map(sub => stripe.subscriptions.cancel(sub.id))
        );

        return apiResponse.ok({
            cancelled: true,
            count: subscriptions.data.length,
            customerId,
        });

    } catch (err) {
        return apiResponse.error(
            new ServiceError('Stripe', `Failed to cancel subscriptions for ${patientEmail}`, err)
        );
    }
}
