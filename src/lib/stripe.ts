import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export const getStripe = () => {
    if (!stripeInstance) {
        if (!process.env.STRIPE_SECRET_KEY) {
            console.warn("STRIPE_SECRET_KEY is missing in the environment variables.");
        }
        stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
            apiVersion: '2026-02-25.clover', // Latest Stripe API Version
            typescript: true,
        });
    }
    return stripeInstance;
};
