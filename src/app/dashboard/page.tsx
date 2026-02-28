"use client";

import { useState } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useAppContext } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, FileText, ChevronRight, AlertCircle, FileSignature, ArrowRight, MessageSquare, ShoppingBag, PhoneCall, CheckCircle2, Check, Stethoscope, ShieldCheck, Truck } from "lucide-react";

export default function DashboardPage() {
    const { currentUser, charges, patients, addToCart } = useAppContext();
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

    // Determine current active step (0-indexed)
    let currentStep = 0;
    if (statusValue === "PENDING_APPROVAL") currentStep = 1;
    if (statusValue === "APPROVED") currentStep = 2;

    const trackerSteps = [
        { title: "Intake & Forms", description: "Patient profiling", icon: FileSignature },
        { title: "Clinical Review", description: "Physician assessment", icon: Stethoscope },
        { title: "Protocol Authorized", description: "Rx generated", icon: ShieldCheck },
        { title: "Medication Shipped", description: "Pharmacy fulfillment", icon: Truck },
    ];

    return (
        <div className="p-6 md:p-12 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <header className="mb-10 border-b border-border/50 pb-6">
                <h1 className="text-3xl md:text-4xl font-serif mb-2">Welcome, {currentUser.name}</h1>
                <p className="text-muted-foreground">Your personalized wellness dashboard.</p>
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
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#B8977E]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                <h3 className="text-lg font-serif mb-6 flex items-center gap-2 text-white">
                    <Activity className="w-5 h-5 text-[#B8977E]" />
                    Live Clinical Status
                </h3>

                <div className="relative">
                    {/* Background Track */}
                    <div className="absolute top-5 left-8 right-8 h-0.5 bg-white/5 z-0 hidden md:block" />

                    {/* Active Track */}
                    <div
                        className="absolute top-5 left-8 h-0.5 bg-[#B8977E] z-0 hidden md:block transition-all duration-1000 ease-in-out"
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
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isCompleted ? 'bg-[#B8977E] border-[#B8977E] text-[#0A0F17]' : isActive ? 'bg-[#1A2332] border-[#B8977E] text-[#B8977E] shadow-[0_0_15px_rgba(184,151,126,0.3)] animate-pulse' : 'bg-[#0A0F17] border-white/10 text-white/30'}`}>
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
                <Card className="border border-border/50 bg-card backdrop-blur-sm">
                    <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                        <span className="text-sm font-medium text-muted-foreground">Active Program</span>
                        <div>
                            <h3 className="text-xl font-medium leading-tight mb-2">{userDetails?.activeTreatment || "None"}</h3>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-4">You are currently enrolled and active in this protocol.</p>
                            <Button asChild variant="outline" className="w-full rounded-xl border-border hover:bg-white/5 h-12 text-sm font-medium">
                                <Link href="/dashboard/treatments">
                                    View Protocol Details
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Feed / Protocol List */}
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <h3 className="text-lg font-serif mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Your Current Meds
                        </h3>
                        <div className="space-y-3">
                            {[
                                { name: "Testosterone Cypionate", dose: "140mg / week (Injected)", status: "Active" },
                                { name: "Anastrozole", dose: "0.5mg / twice a week", status: "Active" }
                            ].map((med, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-white/5 hover:border-primary/30 transition-colors">
                                    <div>
                                        <p className="font-medium">{med.name}</p>
                                        <p className="text-sm text-muted-foreground">{med.dose}</p>
                                    </div>
                                    <Badge variant="outline" className="text-primary border-primary/20 bg-primary/10">{med.status}</Badge>
                                </div>
                            ))}
                        </div>
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
                            <MessageSquare className="w-5 h-5 text-[#B8977E]" />
                            Secure Concierge
                        </DialogTitle>
                        <DialogDescription className="text-white/50">
                            Send an encrypted message directly to your clinical team.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <textarea
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 min-h-[120px] focus:outline-none focus:border-[#B8977E]/50 resize-none transition-colors"
                            placeholder="Type your message here..."
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                        />
                        <Button
                            className="w-full bg-[#B8977E] text-black hover:bg-[#B8977E]/90 h-12"
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
                            <ShoppingBag className="w-5 h-5 text-[#B8977E]" />
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
                            className="bg-black/20 border-white/10 text-white placeholder:text-white/30 rounded-xl h-11 focus-visible:ring-[#B8977E]/50"
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
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:border-[#B8977E]/30 transition-colors gap-4">
                                <div>
                                    <h4 className="font-medium text-white">{supp.name}</h4>
                                    <p className="text-sm text-white/50 mt-1">{supp.desc}</p>
                                </div>
                                <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                                    <span className="font-serif text-[#B8977E]">{supp.price}</span>
                                    <Button
                                        size="sm"
                                        className="bg-white/10 text-white hover:bg-[#B8977E] hover:text-black border-none transition-colors"
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
                                    No supplements found matching "{shopSearchQuery}"
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
                            <Clock className="w-5 h-5 text-[#B8977E]" />
                            Request Appointment
                        </DialogTitle>
                        <DialogDescription className="text-white/50">
                            Let us know when you'd like to be seen. Our concierge will contact you to confirm the exact time.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <textarea
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 min-h-[120px] focus:outline-none focus:border-[#B8977E]/50 resize-none transition-colors"
                            placeholder="E.g., I would like to be seen next Tuesday afternoon, or any morning next week."
                            value={bookingNote}
                            onChange={(e) => setBookingNote(e.target.value)}
                        />
                        <Button
                            className="w-full bg-[#B8977E] text-black hover:bg-[#B8977E]/90 h-12"
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
