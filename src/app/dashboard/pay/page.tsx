"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { CreditCard, CheckCircle2, Apple, Smartphone, Building2, ShieldCheck, Mail } from "lucide-react";

export default function PaymentPage() {
    const router = useRouter();
    const { currentUser, patients, charges, payCharge } = useAppContext();
    const [selectedMethod, setSelectedMethod] = useState<"card" | "apple" | "google" | "ach">("card");
    const [isProcessing, setIsProcessing] = useState(false);

    if (!currentUser) return null;

    const currentPatient = patients.find(p => p.id === currentUser.id);
    const userCharges = charges.filter(c => c.patientId === currentUser.id && c.status === "PENDING");
    const pendingBalance = userCharges.reduce((acc, curr) => acc + curr.amount, 0);

    const handlePayment = () => {
        setIsProcessing(true);
        // Simulate network delay
        setTimeout(() => {
            userCharges.forEach(charge => payCharge(charge.id));
            setIsProcessing(false);

            toast("Payment Successful & Confirmed", {
                description: `A detailed receipt for $${pendingBalance.toFixed(2)} has been sent to ${currentPatient?.email || "your registered email"}`,
                icon: <Mail className="w-4 h-4 text-green-500" />
            });

            router.push("/dashboard?paid=true");
        }, 1500);
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

            {pendingBalance === 0 ? (
                <Card className="bg-card border-border/50 text-center py-16">
                    <CardContent className="space-y-4 flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="font-serif text-2xl">Your account is up to date.</CardTitle>
                        <CardDescription className="text-base max-w-smmx-auto">
                            You have no pending charges. Thank you for your continued trust in MedFit America.
                        </CardDescription>
                        <Button variant="outline" onClick={() => router.push("/dashboard")} className="mt-4 rounded-xl">
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
                                <Card key={charge.id} className="bg-white/5 border-border/50">
                                    <CardContent className="p-4 flex items-start justify-between">
                                        <div>
                                            <p className="font-medium">{charge.description}</p>
                                            <p className="text-sm text-muted-foreground">Charge ID: #{charge.id}</p>
                                            <p className="text-xs text-muted-foreground mt-1">Added: {charge.date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-serif text-lg">${charge.amount.toFixed(2)}</p>
                                            <Badge variant="outline" className="mt-1 border-primary/50 text-primary bg-primary/10">Action Required</Badge>
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

                    {/* Right Col: Payment Method */}
                    <div className="bg-[#050505] -m-6 p-6 md:-m-12 md:p-12 md:border-l border-border/50 min-h-full">
                        <h3 className="text-lg font-serif mb-6">Payment Method</h3>

                        <div className="space-y-3 mb-8">
                            <button
                                onClick={() => setSelectedMethod("card")}
                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${selectedMethod === "card" ? "border-primary bg-primary/5" : "border-border/50 bg-white/5 hover:border-white/20"}`}
                            >
                                <div className="flex items-center gap-3">
                                    <CreditCard className={`w-5 h-5 ${selectedMethod === "card" ? "text-primary" : "text-muted-foreground"}`} />
                                    <span className="font-medium">Credit / Debit Card</span>
                                </div>
                                {selectedMethod === "card" && <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_2px_rgba(143,166,119,0.5)]" />}
                            </button>

                            <button
                                onClick={() => setSelectedMethod("apple")}
                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${selectedMethod === "apple" ? "border-foreground bg-white/5" : "border-border/50 bg-white/5 hover:border-white/20"}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Apple className={`w-5 h-5 ${selectedMethod === "apple" ? "text-foreground" : "text-muted-foreground"}`} />
                                    <span className="font-medium">Apple Pay</span>
                                </div>
                                {selectedMethod === "apple" && <div className="w-2 h-2 rounded-full bg-foreground shadow-[0_0_10px_2px_rgba(255,255,255,0.3)]" />}
                            </button>

                            <button
                                onClick={() => setSelectedMethod("google")}
                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${selectedMethod === "google" ? "border-foreground bg-white/5" : "border-border/50 bg-white/5 hover:border-white/20"}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Smartphone className={`w-5 h-5 ${selectedMethod === "google" ? "text-foreground" : "text-muted-foreground"}`} />
                                    <span className="font-medium">Google Pay</span>
                                </div>
                                {selectedMethod === "google" && <div className="w-2 h-2 rounded-full bg-foreground shadow-[0_0_10px_2px_rgba(255,255,255,0.3)]" />}
                            </button>

                            <button
                                onClick={() => setSelectedMethod("ach")}
                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${selectedMethod === "ach" ? "border-primary bg-primary/5" : "border-border/50 bg-white/5 hover:border-white/20"}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Building2 className={`w-5 h-5 ${selectedMethod === "ach" ? "text-primary" : "text-muted-foreground"}`} />
                                    <span className="font-medium">ACH Bank Transfer</span>
                                </div>
                                {selectedMethod === "ach" && <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_2px_rgba(143,166,119,0.5)]" />}
                            </button>
                        </div>

                        <div className="space-y-4">
                            {selectedMethod === "card" && (
                                <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-sm text-muted-foreground text-center">
                                    Stripe Elements (Card Input) will render here securely in production.
                                </div>
                            )}

                            <Button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className="w-full h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg shadow-[0_0_20px_rgba(143,166,119,0.3)] transition-all"
                            >
                                {isProcessing ? "Processing Securely..." : `Pay $${pendingBalance.toFixed(2)}`}
                            </Button>

                            <p className="text-xs text-center text-muted-foreground opacity-70 flex items-center justify-center gap-1">
                                Protected with 256-bit encryption. <ShieldCheck className="w-3 h-3" />
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
