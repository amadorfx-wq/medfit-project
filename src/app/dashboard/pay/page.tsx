"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { usePatients } from "@/hooks/usePatients";
import { tenant } from "@/lib/theme.config";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { CheckCircle2, Building2, ShieldCheck, Truck } from "lucide-react";
import { Elements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe-client";
import CheckoutForm from "@/components/CheckoutForm";
import { useBilling } from "@/hooks/useBilling";

export default function PaymentPage() {
    const router = useRouter();
    const { currentUser } = useAuth();
    const { patients } = usePatients();
    const { charges, payCharge } = useBilling();
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    const currentPatient = currentUser ? patients.find(p => p.id === currentUser.id) : undefined;
    const userCharges = currentUser ? charges.filter(c => c.patientId === currentUser.id && c.status === "PENDING") : [];
    const pendingBalance = userCharges.reduce((acc, curr) => acc + curr.amount, 0);

    useEffect(() => {
        if (currentUser && pendingBalance > 0 && !clientSecret) {
            fetch("/api/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: pendingBalance,
                    description: `${tenant.shortName} Protocol Payment for ${currentPatient?.name}`
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.clientSecret) {
                        setClientSecret(data.clientSecret);
                    }
                })
                .catch((err) => console.error("Failed to fetch payment intent:", err));
        }
    }, [currentUser, pendingBalance, clientSecret, currentPatient]);

    if (!currentUser) return null;

    const handleSuccess = async () => {
        // Wait for all payCharge promises to resolve (DB + State + Notifications)
        await Promise.all(userCharges.map(charge => payCharge(charge.id)));

        toast.success("Payment Successful & Confirmed", {
            description: `A detailed receipt for $${pendingBalance.toFixed(2)} has been sent to ${currentPatient?.email || "your email"}`,
        });
        router.push("/dashboard?paid=true");
    };

    return (
        <div className="p-6 md:p-12 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

            <header className="mb-10 flex items-end justify-between border-b border-border/50 pb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-serif mb-2">My Balance & Pay</h1>
                    <p className="text-muted-foreground">Manage your statements and make secure payments.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Total Due</p>
                    <p className={`text-4xl font-serif ${pendingBalance > 0 ? "text-primary" : "text-foreground"}`}>
                        ${pendingBalance.toFixed(2)}
                    </p>
                </div>
            </header>

            {currentPatient?.approvalStatus === "PENDING_FORMS" ? (
                <Card className="bg-[#F9F7F2] border-[#E5E5E5]/50 shadow-sm rounded-3xl text-center py-16">
                    <CardContent className="space-y-4 flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-[#a10c22]/20 flex items-center justify-center">
                            <ShieldCheck className="w-8 h-8 text-[#a10c22]" />
                        </div>
                        <CardTitle className="font-serif text-2xl">Action Required</CardTitle>
                        <CardDescription className="text-base max-w-sm mx-auto">
                            Please complete your required clinical intake forms and medical questionnaires before proceeding to checkout.
                        </CardDescription>
                        <Button variant="outline" onClick={() => router.push("/dashboard/intake")} className="mt-6 rounded-full h-12 px-8 border-[#a10c22]/50 text-[#a10c22] hover:bg-[#a10c22]/10 font-medium tracking-wide transition-all duration-300">
                            Go to Security Forms
                        </Button>
                    </CardContent>
                </Card>
            ) : currentPatient?.approvalStatus === "PENDING_APPROVAL" ? (
                <Card className="bg-[#F9F7F2] border-[#E5E5E5]/50 shadow-sm rounded-3xl text-center py-16">
                    <CardContent className="space-y-4 flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-[#a10c22]/20 flex items-center justify-center animate-pulse">
                            <Building2 className="w-8 h-8 text-[#a10c22]" />
                        </div>
                        <CardTitle className="font-serif text-2xl">Pending Medical Authorization</CardTitle>
                        <CardDescription className="text-base max-w-md mx-auto">
                            Your requested treatment plan is currently under review by our clinical team. Once authorized, you will receive an email to complete your checkout securely.
                        </CardDescription>
                        <Button variant="outline" onClick={() => router.push("/dashboard")} className="mt-6 rounded-full h-12 px-8 border-[#E5E5E5] text-[#2D2D2D] hover:bg-white hover:text-[#1A1A1A] font-medium tracking-wide transition-all duration-300">
                            Return to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            ) : currentPatient?.approvalStatus === "PENDING_SHIPMENT" && pendingBalance === 0 ? (
                <Card className="bg-[#F9F7F2] border-[#E5E5E5]/50 shadow-sm rounded-3xl text-center py-16 animate-in slide-in-from-bottom-4">
                    <CardContent className="space-y-4 flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-[#a10c22]/20 flex items-center justify-center animate-pulse">
                            <Truck className="w-8 h-8 text-[#a10c22]" />
                        </div>
                        <CardTitle className="font-serif text-2xl">Processing Shipment</CardTitle>
                        <CardDescription className="text-base max-w-sm mx-auto">
                            Your payment was successful. The pharmacy is now preparing your protocol for shipping. You will receive tracking information soon.
                        </CardDescription>
                        <Button variant="outline" onClick={() => router.push("/dashboard")} className="mt-6 rounded-full h-12 px-8 border-[#E5E5E5] text-[#2D2D2D] hover:bg-white hover:text-[#1A1A1A] font-medium tracking-wide transition-all duration-300">
                            Return to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            ) : pendingBalance === 0 ? (
                <Card className="bg-[#F9F7F2] border-[#E5E5E5]/50 shadow-sm rounded-3xl text-center py-16">
                    <CardContent className="space-y-4 flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="font-serif text-2xl">Your account is up to date.</CardTitle>
                        <CardDescription className="text-base max-w-sm mx-auto">
                            You have no pending charges. Thank you for your continued trust in {tenant.name}.
                        </CardDescription>
                        <Button variant="outline" onClick={() => router.push("/dashboard")} className="mt-6 rounded-full h-12 px-8 border-[#E5E5E5] text-[#2D2D2D] hover:bg-white hover:text-[#1A1A1A] font-medium tracking-wide transition-all duration-300">
                            Return to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 gap-12 relative">

                    {/* Left Col: Invoice Details */}
                    <div>
                        <h3 className="text-lg font-serif mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Pending Charges
                        </h3>
                        <div className="space-y-4">
                            {userCharges.map(charge => (
                                <Card key={charge.id} className="bg-white border-[#E5E5E5]/50 shadow-sm rounded-2xl overflow-hidden group hover:border-[#a10c22]/30 transition-colors">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#a10c22] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <CardContent className="p-5 flex items-start justify-between relative">
                                        <div>
                                            <p className="font-medium text-[#1A1A1A] text-lg">{charge.description}</p>
                                            <p className="text-sm text-[#2D2D2D]/60 mt-1">Invoice #{charge.id.substring(0, 8)}</p>
                                            <p className="text-xs text-[#2D2D2D]/40 mt-1 uppercase tracking-wider">{charge.date}</p>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <p className="font-serif text-2xl text-[#1A1A1A] mb-2">${charge.amount.toFixed(2)}</p>
                                            <Badge variant="outline" className="border-[#a10c22]/50 text-[#a10c22] bg-[#a10c22]/5 rounded-full px-3 py-1 text-[10px] tracking-widest uppercase">Required</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Separator className="bg-border/50 my-8" />
                        <div className="flex justify-between items-center text-lg">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>${pendingBalance.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xl font-serif mt-4">
                            <span>Total to Pay</span>
                            <span className="text-primary">${pendingBalance.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Right Col: Secure Payment Terminal */}
                    <div className="bg-[#0C1420] -m-6 p-6 md:-m-12 md:p-12 md:rounded-r-3xl md:border-l border-[#E5E5E5]/20 min-h-full relative overflow-hidden">
                        {/* Subtle luxury glow in dark mode terminal */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#a10c22]/10 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none" />

                        <h3 className="text-lg font-serif mb-6 text-white flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-[#a10c22]" />
                            Secure Checkout
                        </h3>

                        <div className="bg-[#151D29] p-6 lg:p-8 rounded-3xl border border-white/5 shadow-2xl relative z-10">
                            {clientSecret ? (
                                <Elements
                                    stripe={getStripe()}
                                    options={{
                                        clientSecret,
                                        appearance: {
                                            theme: 'night',
                                            variables: {
                                                colorPrimary: '#a10c22',
                                                colorBackground: '#1A2332',
                                                colorText: '#F9F7F2',
                                                colorDanger: '#ef4444',
                                                fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                                borderRadius: '16px',
                                                spacingGridRow: '20px'
                                            }
                                        }
                                    }}
                                >
                                    <CheckoutForm amount={pendingBalance} onSuccess={handleSuccess} />
                                </Elements>
                            ) : (
                                <div className="h-64 flex flex-col items-center justify-center text-white/50 animate-pulse gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-[#a10c22]/10 flex items-center justify-center border border-[#a10c22]/20">
                                        <ShieldCheck className="w-8 h-8 text-[#a10c22]" />
                                    </div>
                                    <span className="text-sm tracking-wide">Initializing 256-bit encrypted terminal...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
