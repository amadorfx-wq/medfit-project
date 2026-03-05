"use client";

import { useState } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { usePatients } from "@/hooks/usePatients";
import { useCart } from "@/hooks/useCart";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, AlertCircle, FileSignature, ArrowRight, MessageSquare, ShoppingBag, PhoneCall, CheckCircle2, Check, Stethoscope, ShieldCheck, Truck, Pill, Sparkles } from "lucide-react";
import { useBilling } from "@/hooks/useBilling";

export default function DashboardPage() {
    const { currentUser } = useAuth();
    const { patients } = usePatients();
    const { addToCart } = useCart();
    const { charges } = useBilling();
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [isShopModalOpen, setIsShopModalOpen] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [messageText, setMessageText] = useState("");
    const [shopSearchQuery, setShopSearchQuery] = useState("");
    const [bookingNote, setBookingNote] = useState("");

    if (!currentUser) return null;

    // Get full patient object to check forms status
    const currentPatientData = patients.find(p => p.id === currentUser.id);
    const hasPendingForms = currentPatientData?.formsStatus === "PENDING";
    const userDetails = patients.find(p => p.id === currentUser.id);
    const userCharges = charges.filter(c => c.patientId === currentUser.id);
    const pendingBalance = userCharges.reduce((acc, curr) => curr.status === "PENDING" ? acc + curr.amount : acc, 0);

    const statusValue = userDetails?.approvalStatus || "PENDING_FORMS";
    const stepMapping: Record<string, number> = {
        "PENDING_FORMS": 0,
        "PENDING_APPROVAL": 1,
        "PENDING_PAYMENT": 2,
        "PENDING_SHIPMENT": 3,
        "APPROVED": 4
    };
    const currentStep = stepMapping[statusValue] || 0;

    // Derive medication list from activeTreatment (real data)
    const PROTOCOL_MEDS: Record<string, { name: string; dose: string }[]> = {
        "Medical Weight Loss": [
            { name: "Semaglutide", dose: "0.25–1mg / week (Subcutaneous)" },
            { name: "Vitamin B12 (Methylcobalamin)", dose: "1ml / week injection" }
        ],
        "Medical Weight Loss (Tirzepatide)": [
            { name: "Tirzepatide", dose: "2.5–5mg / week (Subcutaneous)" },
            { name: "Vitamin B12 (Methylcobalamin)", dose: "1ml / week injection" }
        ],
        "Peptide Protocol": [
            { name: "BPC-157", dose: "250mcg / day (Subcutaneous)" },
            { name: "CJC-1295/Ipamorelin", dose: "100mcg / daily (Subcutaneous)" }
        ],
        "Testosterone Therapy": [
            { name: "Testosterone Cypionate", dose: "140mg / week (Injected)" },
            { name: "Anastrozole", dose: "0.5mg / twice a week" }
        ],
        "Comprehensive NFC Panel": [
            { name: "Lab Work Panel", dose: "Comprehensive blood draw" }
        ]
    };
    const activeMeds = userDetails?.activeTreatment
        ? (PROTOCOL_MEDS[userDetails.activeTreatment] ||
            Object.entries(PROTOCOL_MEDS).find(([key]) => userDetails.activeTreatment?.toLowerCase().includes(key.toLowerCase()))?.[1] ||
            [])
        : [];

    const trackerSteps = [
        { title: "Intake & Forms", description: "Patient profiling", icon: FileSignature },
        { title: "Clinical Review", description: "Physician assessment", icon: Stethoscope },
        { title: "Protocol Authorized", description: "Payment & Rx generation", icon: ShieldCheck },
        { title: "Fulfillment & Shipping", description: "Pharmacy processing", icon: Truck },
    ];

    return (
        <div className="p-6 md:p-12 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <header className="mb-10 border-b border-border/50 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-serif mb-2">Welcome, {currentUser.name}</h1>
                    <p className="text-muted-foreground">Your personalized wellness dashboard.</p>
                </div>
                <Link href="/dashboard/treatments" className="shrink-0 relative group">
                    {/* Premium Glow Effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#a10c22]/40 via-[#a10c22]/20 to-[#a10c22]/40 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse-slow"></div>

                    <div className="relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl border border-[#a10c22]/50 bg-[#0A0F17] hover:bg-[#a10c22]/10 transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(184,151,126,0.15)] group-hover:shadow-[0_0_30px_rgba(184,151,126,0.3)]">
                        <Sparkles className="w-4 h-4 text-[#a10c22]" />
                        <span className="text-sm font-medium text-[#a10c22] tracking-wide">Our Protocols</span>
                        <ArrowRight className="w-4 h-4 text-[#a10c22] group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>
            </header>

            {hasPendingForms && (
                <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-red-400">
                        <AlertCircle className="w-8 h-8 shrink-0" />
                        <div>
                            <h3 className="font-semibold text-lg text-red-400">Required Action: Intake Forms Pending</h3>
                            <p className="text-sm opacity-90">You must complete your secure medical and consent forms before scheduling treatments.</p>
                        </div>
                    </div>
                    <Link href="/dashboard/intake">
                        <Button className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white font-medium flex items-center gap-2">
                            <FileSignature className="w-4 h-4" />
                            Complete Forms Now
                        </Button>
                    </Link>
                </div>
            )}

            {/* Clinical Progress Tracker */}
            <div className="mb-10 bg-[#080D15] border border-white/5 p-6 md:p-8 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#a10c22]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                <h3 className="text-lg font-serif mb-6 flex items-center gap-2 text-white">
                    <Activity className="w-5 h-5 text-[#a10c22]" />
                    Live Clinical Status
                </h3>

                <div className="relative">
                    {/* Background Track */}
                    <div className="absolute top-5 left-8 right-8 h-0.5 bg-white/5 z-0 hidden md:block" />

                    {/* Active Track */}
                    <div
                        className="absolute top-5 left-8 h-0.5 bg-[#a10c22] z-0 hidden md:block transition-all duration-1000 ease-in-out"
                        style={{ width: `min(100%, calc(${currentStep * 33.33}% + 2rem))` }}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                        {trackerSteps.map((step, idx) => {
                            const isCompleted = idx < currentStep;
                            const isActive = idx === currentStep;
                            const isPending = idx > currentStep;

                            return (
                                <div key={idx} className="flex flex-row md:flex-col items-center md:items-start md:text-center text-left gap-4 md:gap-3 group">
                                    <div className="relative">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isCompleted ? 'bg-[#a10c22] border-[#a10c22] text-[#0A0F17]' : isActive ? 'bg-[#1A2332] border-[#a10c22] text-[#a10c22] shadow-[0_0_15px_rgba(184,151,126,0.3)] animate-pulse' : 'bg-[#0A0F17] border-white/10 text-white/30'}`}>
                                            {isCompleted ? <Check className="w-5 h-5" /> : <step.icon className="w-4 h-4" />}
                                        </div>
                                    </div>
                                    <div className="flex-1 md:w-full md:flex-none">
                                        <p className={`text-sm font-medium mb-1 transition-colors ${isActive || isCompleted ? 'text-white' : 'text-white/40'}`}>{step.title}</p>
                                        <p className={`text-xs transition-colors ${isActive || isCompleted ? 'text-white/60' : 'text-white/20'}`}>{step.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Balance Card */}
                <Card className={`border ${pendingBalance > 0 ? 'border-primary/50 bg-[#1A1A1A]' : 'border-border/50 bg-card'} relative overflow-hidden backdrop-blur-sm`}>
                    {pendingBalance > 0 && <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />}
                    <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                        <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                Balance Due
                                {pendingBalance > 0 && <AlertCircle className="w-4 h-4 text-primary" />}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-4xl font-serif">${pendingBalance.toFixed(2)}</h3>
                            {pendingBalance > 0 && <p className="text-sm text-muted-foreground mt-1">Pending action required</p>}
                        </div>
                        {pendingBalance > 0 ? (
                            <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl h-12">
                                <Link href="/dashboard/pay">
                                    PAY NOW <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        ) : (
                            <Badge variant="outline" className="border-border text-muted-foreground bg-white/5 w-fit px-4 py-1">
                                <CheckCircle2 className="w-3 h-3 mr-2" /> All clear
                            </Badge>
                        )}
                    </CardContent>
                </Card>

                {/* Active Treatment Card */}
                <Card className="border border-border/50 bg-card backdrop-blur-sm relative overflow-hidden">
                    {!userDetails?.activeTreatment && (
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#a10c22]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                    )}
                    <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Active Program</span>
                        <div>
                            {userDetails?.activeTreatment ? (
                                <h3 className="text-xl font-medium leading-tight mb-2">{userDetails.activeTreatment}</h3>
                            ) : (
                                <h3 className="text-xl font-serif text-[#a10c22] leading-tight mb-2">Begin Your Journey</h3>
                            )}
                        </div>
                        <div>
                            {userDetails?.activeTreatment ? (
                                <p className="text-sm text-muted-foreground mb-4">You are currently enrolled and active in this protocol.</p>
                            ) : (
                                <p className="text-sm text-foreground/80 mb-4">Discover medically supervised protocols tailored for you.</p>
                            )}
                            <Button asChild variant={userDetails?.activeTreatment ? "outline" : "default"} className={`w-full rounded-xl h-12 text-sm font-medium ${!userDetails?.activeTreatment ? 'bg-[#a10c22] hover:bg-[#a10c22]/90 text-black shadow-[0_0_15px_rgba(184,151,126,0.3)]' : 'border-border hover:bg-white/5'}`}>
                                <Link href="/dashboard/treatments">
                                    {userDetails?.activeTreatment ? "View Protocol Details" : "Explore Men's Protocols"}
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Appointment Card */}
                <Card className="border border-border/50 bg-card backdrop-blur-sm">
                    <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                        <span className="text-sm font-medium text-muted-foreground">Next Assessment</span>
                        <div>
                            <h3 className="text-xl font-medium mb-1">March 15, 2026</h3>
                            <p className="text-sm text-muted-foreground">with Dr. Kitchens (Video)</p>
                        </div>
                        <Button onClick={() => setIsBookingModalOpen(true)} variant="outline" className="w-full rounded-xl border-border hover:bg-white/5 h-12 text-sm font-medium">
                            Manage Booking
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* ─── Subscription / Billing Self-Service ────────────────── */}
            {userDetails?.activeTreatment && (
                <Card className="border border-border/50 bg-card backdrop-blur-sm mb-10 overflow-hidden">
                    <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row items-stretch">
                            <div className="flex-1 p-6 space-y-2">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-7 h-7 rounded-full bg-[#a10c22]/10 flex items-center justify-center">
                                        <Sparkles className="w-3.5 h-3.5 text-[#a10c22]" />
                                    </div>
                                    <span className="text-xs uppercase tracking-wider text-[#a10c22] font-medium">Active Subscription</span>
                                </div>
                                <h3 className="text-lg font-serif">{userDetails.activeTreatment}</h3>
                                <p className="text-sm text-muted-foreground">Your monthly protocol is active. Manage your payment methods, view invoices, or update your subscription below.</p>
                            </div>
                            <div className="sm:border-l border-t sm:border-t-0 border-border/50 p-6 flex flex-col items-center justify-center bg-white/[0.02]">
                                <Button
                                    variant="outline"
                                    className="rounded-xl border-[#a10c22]/30 text-[#a10c22] hover:bg-[#a10c22]/10 h-12 px-6 w-full"
                                    onClick={async () => {
                                        const patient = patients.find(p => p.id === currentUser.id);
                                        if (!patient?.email) {
                                            toast.error("No email found for your account.");
                                            return;
                                        }
                                        toast.loading("Opening secure portal...", { id: "portal" });
                                        try {
                                            const res = await fetch("/api/stripe-portal", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ customerEmail: patient.email }),
                                            });
                                            const data = await res.json();
                                            if (data.error) {
                                                toast.error(data.error, { id: "portal" });
                                                return;
                                            }
                                            toast.dismiss("portal");
                                            window.open(data.url, "_blank");
                                        } catch {
                                            toast.error("Failed to open billing portal.", { id: "portal" });
                                        }
                                    }}
                                >
                                    Manage Billing & Payment <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                                {/* Trust Badge */}
                                <div className="flex items-center gap-1.5 mt-3 text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                                    <span>Secured by Stripe</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Feed / Protocol List */}
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <h3 className="text-lg font-serif mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Your Current Meds
                        </h3>
                        {activeMeds.length > 0 ? (
                            <div className="space-y-3">
                                {activeMeds.map((med, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-white/5 hover:border-primary/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                <Pill className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{med.name}</p>
                                                <p className="text-sm text-muted-foreground">{med.dose}</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-primary border-primary/20 bg-primary/10 shrink-0">Active</Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-gradient-to-b from-[#1A2332]/50 to-transparent border border-[#a10c22]/20 rounded-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[#a10c22]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                <div className="w-16 h-16 rounded-2xl bg-[#a10c22]/10 flex items-center justify-center mb-6 border border-[#a10c22]/20">
                                    <Sparkles className="w-8 h-8 text-[#a10c22]" />
                                </div>
                                <h4 className="text-xl font-serif text-white mb-2">Optimize Your Biology</h4>
                                <p className="text-sm text-white/60 mb-8 max-w-sm mx-auto leading-relaxed">
                                    From medical weight loss to hormone optimization. Enroll in a protocol to track your prescriptions and progress here.
                                </p>
                                <Link href="/dashboard/treatments" className="w-full sm:w-auto">
                                    <Button className="h-12 px-8 rounded-full bg-[#a10c22] hover:bg-[#a10c22]/90 text-black font-medium tracking-wide shadow-[0_0_20px_rgba(184,151,126,0.2)] hover:shadow-[0_0_30px_rgba(184,151,126,0.4)] transition-all duration-300 w-full">
                                        View Clinical Protocols <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </section>

                    <section>
                        <h3 className="text-lg font-serif mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Recent Activity
                        </h3>
                        <div className="space-y-4">
                            {userCharges.filter(c => c.status === "PAID").slice(0, 3).map((charge, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-card">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle2 className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Payment Received for {charge.description}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{charge.date} • ${charge.amount.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                            {userCharges.filter(c => c.status === "PAID").length === 0 && (
                                <p className="text-sm text-muted-foreground italic">No recent activity.</p>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar / Quick Actions */}
                <div className="space-y-6">

                    <Card className="border border-border/50 bg-card">
                        <CardContent className="p-6">
                            <h3 className="text-sm font-serif mb-4 text-muted-foreground uppercase tracking-widest">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setIsMessageModalOpen(true)} className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 hover:bg-primary hover:text-primary-foreground border border-border/50 transition-colors gap-3">
                                    <MessageSquare className="w-6 h-6" strokeWidth={1.5} />
                                    <span className="text-xs font-medium text-center">Message<br />Clinic</span>
                                </button>
                                <button onClick={() => setIsShopModalOpen(true)} className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 hover:bg-primary hover:text-primary-foreground border border-border/50 transition-colors gap-3">
                                    <ShoppingBag className="w-6 h-6" strokeWidth={1.5} />
                                    <span className="text-xs font-medium text-center">Shop<br />Supplements</span>
                                </button>
                                <button className="col-span-2 flex items-center justify-center p-4 rounded-xl bg-transparent hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 border border-border/50 transition-colors gap-3 group">
                                    <PhoneCall className="w-5 h-5 text-muted-foreground group-hover:text-destructive" strokeWidth={1.5} />
                                    <span className="text-sm font-medium">Urgent Medical Line</span>
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>

            {/* Message Clinic Modal */}
            <Dialog open={isMessageModalOpen} onOpenChange={setIsMessageModalOpen}>
                <DialogContent className="bg-[#0C1420] border-white/10 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-[#a10c22]" />
                            Secure Concierge
                        </DialogTitle>
                        <DialogDescription className="text-white/50">
                            Send an encrypted message directly to your clinical team.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <textarea
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 min-h-[120px] focus:outline-none focus:border-[#a10c22]/50 resize-none transition-colors"
                            placeholder="Type your message here..."
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                        />
                        <Button
                            className="w-full bg-[#a10c22] text-black hover:bg-[#a10c22]/90 h-12"
                            onClick={() => {
                                if (!messageText.trim()) return toast.error("Please enter a message");
                                toast.success("Secure message sent to clinical team.");
                                setIsMessageModalOpen(false);
                                setMessageText("");
                            }}
                        >
                            Send Secure Message
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Shop Supplements Modal */}
            <Dialog open={isShopModalOpen} onOpenChange={setIsShopModalOpen}>
                <DialogContent className="bg-[#0C1420] border-white/10 text-white sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-[#a10c22]" />
                            Supplement Shop & Add-ons
                        </DialogTitle>
                        <DialogDescription className="text-white/50">
                            Order pharmaceutical-grade supplements directly to your door.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-2">
                        <Input
                            placeholder="Search supplements..."
                            value={shopSearchQuery}
                            onChange={(e) => setShopSearchQuery(e.target.value)}
                            className="bg-black/20 border-white/10 text-white placeholder:text-white/30 rounded-xl h-11 focus-visible:ring-[#a10c22]/50"
                        />
                    </div>

                    <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {[
                            { name: "Lipo-C (MIC) B12 Injection Kit", desc: "Fat metabolizer and energy booster. 10ml vial.", price: "$149.00" },
                            { name: "Glutathione Subcutaneous Kit", desc: "Master antioxidant for cellular health. 10ml vial.", price: "$175.00" },
                            { name: "NAD+ Subcutaneous Kit", desc: "Anti-aging and mitochondrial support. 1000mg.", price: "$299.00" },
                            { name: "B12 (Methylcobalamin)", desc: "Essential nerve function and energy. 10ml vial.", price: "$85.00" },
                            { name: "D3/K2 Oral Supplements", desc: "Bone health and immune support. 60 capsules.", price: "$45.00" }
                        ].filter(s => s.name.toLowerCase().includes(shopSearchQuery.toLowerCase()) || s.desc.toLowerCase().includes(shopSearchQuery.toLowerCase())).map((supp, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:border-[#a10c22]/30 transition-colors gap-4">
                                <div>
                                    <h4 className="font-medium text-white">{supp.name}</h4>
                                    <p className="text-sm text-white/50 mt-1">{supp.desc}</p>
                                </div>
                                <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                                    <span className="font-serif text-[#a10c22]">{supp.price}</span>
                                    <Button
                                        size="sm"
                                        className="bg-white/10 text-white hover:bg-[#a10c22] hover:text-black border-none transition-colors"
                                        onClick={() => {
                                            addToCart({ name: supp.name, price: supp.price });
                                            toast.success(`${supp.name} added to cart!`);
                                            setIsShopModalOpen(false);
                                        }}
                                    >
                                        Add to Cart
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {[
                            { name: "Lipo-C (MIC) B12 Injection Kit", desc: "Fat metabolizer and energy booster. 10ml vial.", price: "$149.00" },
                            { name: "Glutathione Subcutaneous Kit", desc: "Master antioxidant for cellular health. 10ml vial.", price: "$175.00" },
                            { name: "NAD+ Subcutaneous Kit", desc: "Anti-aging and mitochondrial support. 1000mg.", price: "$299.00" },
                            { name: "B12 (Methylcobalamin)", desc: "Essential nerve function and energy. 10ml vial.", price: "$85.00" },
                            { name: "D3/K2 Oral Supplements", desc: "Bone health and immune support. 60 capsules.", price: "$45.00" }
                        ].filter(s => s.name.toLowerCase().includes(shopSearchQuery.toLowerCase()) || s.desc.toLowerCase().includes(shopSearchQuery.toLowerCase())).length === 0 && (
                                <div className="text-center py-8 text-white/50 text-sm">
                                    No supplements found matching &quot;{shopSearchQuery}&quot;
                                </div>
                            )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Manage Booking Modal */}
            <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
                <DialogContent className="bg-[#0C1420] border-white/10 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[#a10c22]" />
                            Request Appointment
                        </DialogTitle>
                        <DialogDescription className="text-white/50">
                            Let us know when you&apos;d like to be seen. Our concierge will contact you to confirm the exact time.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <textarea
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 min-h-[120px] focus:outline-none focus:border-[#a10c22]/50 resize-none transition-colors"
                            placeholder="E.g., I would like to be seen next Tuesday afternoon, or any morning next week."
                            value={bookingNote}
                            onChange={(e) => setBookingNote(e.target.value)}
                        />
                        <Button
                            className="w-full bg-[#a10c22] text-black hover:bg-[#a10c22]/90 h-12"
                            onClick={() => {
                                if (!bookingNote.trim()) return toast.error("Please provide your preferred availability.");
                                toast.success("Appointment request sent to the clinic.");
                                setIsBookingModalOpen(false);
                                setBookingNote("");
                            }}
                        >
                            Request Appointment
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
