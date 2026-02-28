import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("STRIPE_SECRET_KEY is missing in the environment variables.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-02-24.acacia', // Latest Stripe API Version mapped
    typescript: true,
});
