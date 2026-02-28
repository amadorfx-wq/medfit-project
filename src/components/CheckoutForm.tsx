import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export default function CheckoutForm({ amount, onSuccess }: { amount: number, onSuccess: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);
        setErrorMessage("");

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // The return_url is required by default, but we use redirect: "if_required" for SPAs
            },
            redirect: 'if_required'
        });

        if (error) {
            setErrorMessage(error.message || "An unexpected error occurred.");
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            onSuccess();
        } else {
            setIsProcessing(false);
            setErrorMessage("Payment status could not be verified.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <PaymentElement options={{ layout: "tabs" }} />
            </div>

            {errorMessage && (
                <div className="text-red-400 text-sm p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    {errorMessage}
                </div>
            )}

            <div className="pt-2">
                <Button
                    type="submit"
                    disabled={isProcessing || !stripe || !elements}
                    className="w-full h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg shadow-[0_0_20px_rgba(143,166,119,0.3)] transition-all"
                >
                    {isProcessing ? "Processing Securely..." : `Pay $${amount.toFixed(2)}`}
                </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground opacity-70 flex items-center justify-center gap-1 mt-4">
                Protected with 256-bit AES encryption via Stripe. <ShieldCheck className="w-3 h-3" />
            </p>
        </form>
    );
}
