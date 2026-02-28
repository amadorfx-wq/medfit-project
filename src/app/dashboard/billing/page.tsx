"use client";

import { useAppContext } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar, ShieldCheck, Settings, AlertCircle, ArrowRight, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function BillingSubscriptionPage() {
    const { currentUser, patients } = useAppContext();
    const patient = patients.find(p => p.id === currentUser?.id);
    const [subStatus, setSubStatus] = useState<"ACTIVE" | "PAUSED">("ACTIVE");

    // Retention Triage States
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [triageStep, setTriageStep] = useState<"REASON" | "OFFER_NAUSEA" | "OFFER_PRICE" | "OFFER_RESULTS">("REASON");
    const [selectedReason, setSelectedReason] = useState<string>("");

    if (!patient) return null;

    const hasActiveSubscription = patient.activeTreatment !== "Pending Evaluation" && patient.activeTreatment !== "";

    // Derived dummy data for UI display corresponding to the active treatment
    const subscriptionPrice = patient.activeTreatment.includes("Weight Loss") ? "$399.00" :
        patient.activeTreatment.includes("TRT") ? "$249.00" :
            patient.activeTreatment.includes("Peptide") ? "$450.00" : "$0.00";

    const nextBillingDate = new Date();
    nextBillingDate.setDate(nextBillingDate.getDate() + 14); // 2 weeks from now

    const handleToggleSubscription = () => {
        const newStatus = subStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
        setSubStatus(newStatus);

        if (newStatus === "PAUSED") {
            toast.success("Subscription paused.", {
                description: "Your next shipment and billing have been suspended. You can reactivate anytime.",
            });
        } else {
            toast.success("Subscription reactivated.", {
                description: "Your protocol will resume on the next scheduled date.",
            });
        }
    };

    return (
        <div className="animate-in fade-in duration-500 max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif text-[#1A1A1A] mb-2">Billing & Subscriptions</h1>
                    <p className="text-[#666666]">Manage your active protocols, payment methods, and billing history.</p>
                </div>
            </div>

            {hasActiveSubscription ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Active Subscription Card */}
                    <Card className="md:col-span-2 border-[#E5E5E5] shadow-sm bg-white overflow-hidden">
                        <div className="h-2 w-full bg-[#B8977E]" />
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <CardTitle className="text-xl font-serif text-[#1A1A1A]">
                                            {patient.activeTreatment}
                                        </CardTitle>
                                        <Badge className={`border-none ${subStatus === 'ACTIVE' ? 'bg-[#8FA677] text-white hover:bg-[#A3B88A]' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'} transition-colors`}>
                                            {subStatus}
                                        </Badge>
                                    </div>
                                    <CardDescription>Monthly Protocol Subscription</CardDescription>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-semibold text-[#1A1A1A]">{subscriptionPrice}</span>
                                    <span className="text-[#666666] text-sm"> / mo</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-[#F9F7F2] rounded-lg border border-[#E5E5E5]">
                                <Calendar className="w-5 h-5 text-[#8FA677]" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-[#1A1A1A]">Next Billing Date</p>
                                    <p className="text-sm text-[#666666]">{nextBillingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="border-[#B8977E] text-[#B8977E] hover:bg-[#B8977E] hover:text-white"
                                    onClick={() => {
                                        if (subStatus === "ACTIVE") {
                                            setTriageStep("REASON");
                                            setSelectedReason("");
                                            setIsCancelModalOpen(true);
                                        } else {
                                            handleToggleSubscription();
                                        }
                                    }}
                                >
                                    {subStatus === "ACTIVE" ? "Pause Protocol" : "Resume Protocol"}
                                </Button>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-[#1A1A1A] border-b border-[#E5E5E5] pb-2">Payment Method</h4>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-8 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                                            <CreditCard className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-[#1A1A1A]">•••• •••• •••• 4242</p>
                                            <p className="text-xs text-[#666666]">Expires 12/28</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-[#8FA677]">Update</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security & Support Card */}
                    <div className="space-y-6">
                        <Card className="border-[#E5E5E5] shadow-sm bg-[#F9F7F2]">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium flex items-center gap-2 text-[#1A1A1A]">
                                    <ShieldCheck className="w-4 h-4 text-[#8FA677]" />
                                    Secure Billing
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-[#666666] leading-relaxed">
                                    Your payment information is encrypted and securely processed via Stripe. MedFit does not store your full card details on our servers.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-[#E5E5E5] shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-[#1A1A1A]">Need Help?</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-4 h-4 text-[#B8977E] shrink-0 mt-0.5" />
                                    <p className="text-xs text-[#666666]">
                                        Modifying your subscription may affect your clinical progress. Please consult your physician before pausing.
                                    </p>
                                </div>
                                <Button className="w-full bg-white border border-[#E5E5E5] text-[#1A1A1A] hover:bg-gray-50 flex items-center justify-between group">
                                    <span className="flex items-center gap-2">
                                        <Settings className="w-4 h-4" />
                                        Contact Support
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#1A1A1A] transition-colors" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            ) : (
                <div className="text-center py-16 bg-white border border-[#E5E5E5] rounded-xl shadow-sm">
                    <p className="text-[#666666] mb-4">You do not have any active protocols or subscriptions at this time.</p>
                    <Link href="/treatments">
                        <Button className="bg-[#1A1A1A] text-white hover:bg-black font-medium px-8 py-2 rounded-none tracking-widest text-[#F9F7F2]">
                            Explore Treatments
                        </Button>
                    </Link>
                </div>
            )}

            {/* UPSELL B2B MÓDULO 3: Botiquín Triage de Retención Mágica */}
            <Dialog open={isCancelModalOpen} onOpenChange={(open) => !open && setIsCancelModalOpen(false)}>
                <DialogContent className="bg-white border-[#E5E5E5] text-[#1A1A1A] sm:max-w-lg">
                    {triageStep === "REASON" && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="font-serif text-2xl text-[#1A1A1A]">Pause Subscription</DialogTitle>
                                <DialogDescription className="text-[#666666]">
                                    We're sorry to see you consider pausing your {patient.activeTreatment} protocol. To help us improve or assist you, please let us know why.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-6">
                                <RadioGroup value={selectedReason} onValueChange={setSelectedReason} className="space-y-4">
                                    <div className="flex items-center space-x-3 border border-[#E5E5E5] p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedReason("nausea")}>
                                        <RadioGroupItem value="nausea" id="r1" className="text-[#8FA677] border-gray-300" />
                                        <Label htmlFor="r1" className="cursor-pointer font-medium">I'm experiencing side effects (e.g., Nausea)</Label>
                                    </div>
                                    <div className="flex items-center space-x-3 border border-[#E5E5E5] p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedReason("price")}>
                                        <RadioGroupItem value="price" id="r2" className="text-[#8FA677] border-gray-300" />
                                        <Label htmlFor="r2" className="cursor-pointer font-medium">It's too expensive right now</Label>
                                    </div>
                                    <div className="flex items-center space-x-3 border border-[#E5E5E5] p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedReason("results")}>
                                        <RadioGroupItem value="results" id="r3" className="text-[#8FA677] border-gray-300" />
                                        <Label htmlFor="r3" className="cursor-pointer font-medium">I'm not seeing the desired results</Label>
                                    </div>
                                    <div className="flex items-center space-x-3 border border-[#E5E5E5] p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedReason("other")}>
                                        <RadioGroupItem value="other" id="r4" className="text-[#8FA677] border-gray-300" />
                                        <Label htmlFor="r4" className="cursor-pointer font-medium">Other reason</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <DialogFooter className="flex-col sm:flex-row gap-3">
                                <Button variant="outline" onClick={() => setIsCancelModalOpen(false)} className="border-[#E5E5E5] text-[#666666] w-full sm:w-auto">Keep Subscription</Button>
                                <Button
                                    className="bg-[#1A1A1A] text-white hover:bg-black w-full sm:w-auto"
                                    disabled={!selectedReason}
                                    onClick={() => {
                                        if (selectedReason === "nausea") setTriageStep("OFFER_NAUSEA");
                                        else if (selectedReason === "price") setTriageStep("OFFER_PRICE");
                                        else if (selectedReason === "results") setTriageStep("OFFER_RESULTS");
                                        else {
                                            setIsCancelModalOpen(false);
                                            handleToggleSubscription();
                                        }
                                    }}
                                >
                                    Continue
                                </Button>
                            </DialogFooter>
                        </>
                    )}

                    {triageStep === "OFFER_NAUSEA" && (
                        <div className="py-4 text-center pb-2">
                            <div className="w-16 h-16 bg-[#8FA677]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="w-8 h-8 text-[#8FA677]" />
                            </div>
                            <h3 className="text-2xl font-serif text-[#1A1A1A] mb-3">Don't let side effects stop your progress.</h3>
                            <p className="text-[#666666] mb-8">
                                Mild nausea is very common. We can instantly pause your billing for 14 days and send a free prescription for Zofran (anti-nausea medication) to your local pharmacy so your body can adjust comfortably.
                            </p>
                            <div className="flex flex-col gap-3">
                                <Button
                                    className="w-full bg-[#8FA677] hover:bg-[#A3B88A] text-white font-medium h-12 text-lg shadow-lg shadow-[#8FA677]/20"
                                    onClick={() => {
                                        toast.success("Care Package Activated", { description: "Zofran Rx requested and billing paused for 14 days." });
                                        setIsCancelModalOpen(false);
                                    }}
                                >
                                    Claim Zofran Rx & Pause Billing
                                </Button>
                                <Button variant="ghost" className="text-[#666666]" onClick={() => { setIsCancelModalOpen(false); handleToggleSubscription(); }}>
                                    Proceed to cancel anyway
                                </Button>
                            </div>
                        </div>
                    )}

                    {triageStep === "OFFER_PRICE" && (
                        <div className="py-4 text-center pb-2">
                            <div className="w-16 h-16 bg-[#B8977E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <DollarSign className="w-8 h-8 text-[#B8977E]" />
                            </div>
                            <h3 className="text-2xl font-serif text-[#1A1A1A] mb-3">Switch to the Maintenance Protocol.</h3>
                            <p className="text-[#666666] mb-8">
                                Instead of losing all your momentum, we can step you down to our 'Maintenance Protocol'. You retain access to your doctor and receive a perfectly adjusted micro-dose at <strong className="text-[#B8977E]">50% off the standard monthly price</strong>.
                            </p>
                            <div className="flex flex-col gap-3">
                                <Button
                                    className="w-full bg-[#1A1A1A] hover:bg-black text-white font-medium h-12 text-lg shadow-xl"
                                    onClick={() => {
                                        toast.success("Protocol Downgraded", { description: "You are now on the 50% Off Maintenance Plan." });
                                        setIsCancelModalOpen(false);
                                    }}
                                >
                                    Claim 50% Off Maintenance
                                </Button>
                                <Button variant="ghost" className="text-[#666666]" onClick={() => { setIsCancelModalOpen(false); handleToggleSubscription(); }}>
                                    Proceed to cancel anyway
                                </Button>
                            </div>
                        </div>
                    )}

                    {triageStep === "OFFER_RESULTS" && (
                        <div className="py-4 text-center pb-2">
                            <div className="w-16 h-16 bg-[#1A1A1A]/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck className="w-8 h-8 text-[#1A1A1A]" />
                            </div>
                            <h3 className="text-2xl font-serif text-[#1A1A1A] mb-3">Let's adjust your dosage instantly.</h3>
                            <p className="text-[#666666] mb-8">
                                Every body metabolizes differently. If the current dosage isn't yielding results, don't quit. Click below to schedule a priority 5-minute triage call with our MD to adjust your protocol and accelerate results.
                            </p>
                            <div className="flex flex-col gap-3">
                                <Button
                                    className="w-full bg-white border border-[#E5E5E5] hover:bg-gray-50 text-[#1A1A1A] font-medium h-12 text-lg shadow-sm"
                                    onClick={() => {
                                        toast.success("Priority Triage Scheduled", { description: "The medical team has been alerted. Your billing is paused until your call." });
                                        setIsCancelModalOpen(false);
                                    }}
                                >
                                    Schedule Free Triage Consultation
                                </Button>
                                <Button variant="ghost" className="text-[#666666]" onClick={() => { setIsCancelModalOpen(false); handleToggleSubscription(); }}>
                                    Proceed to cancel anyway
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
}
