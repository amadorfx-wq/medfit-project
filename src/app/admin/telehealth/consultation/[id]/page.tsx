"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePatients } from "@/hooks/usePatients";
import { useClinical } from "@/hooks/useClinical";
import { useBilling } from "@/hooks/useBilling";
import { toast } from "sonner";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Settings, UserCircle2, ShieldCheck, CreditCard, ChevronLeft, DollarSign, Send, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ProviderConsultationRoom() {
    const params = useParams();
    const router = useRouter();
    const patientId = params.id as string;

    const { patients } = usePatients();
    const { authorizeTreatment } = useClinical();
    const { charges, addCharge } = useBilling();

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    // Upsell state
    const [invoiceAmount, setInvoiceAmount] = useState<string>("");
    const [invoiceDescription, setInvoiceDescription] = useState<string>("");

    // Identify Patient
    const activePatient = patients.find(p => p.id === patientId);

    // Mock Connection Sequence
    useEffect(() => {
        if (!activePatient) return;
        const timer1 = setTimeout(() => {
            setIsConnected(true);
            toast("Hardware Connected", {
                description: "Provider Stream Initialized. Waiting for patient to join.",
                icon: <Settings className="w-4 h-4 text-white/50" />
            });
        }, 800);

        return () => clearTimeout(timer1);
    }, [activePatient]);

    const handleLeaveCall = () => {
        toast("Consultation Ended");
        router.push("/admin/telehealth");
    };

    const handleInCallUpsell = async () => {
        if (!activePatient || !invoiceAmount || !invoiceDescription) return;

        // 1. Authorize the clinical treatment (moves status to PENDING_PAYMENT)
        await authorizeTreatment(activePatient.id, parseFloat(invoiceAmount), invoiceDescription);

        // 2. Add the actual charge in the billing module
        addCharge({
            patientId: activePatient.id,
            amount: parseFloat(invoiceAmount),
            description: invoiceDescription
        });

        toast.success("Treatment Authorized & Invoice Pushed", {
            description: `A secure payment link for $${invoiceAmount} popped up on the patient's screen.`,
            icon: <CreditCard className="w-4 h-4 text-[#a10c22]" />
        });

        setInvoiceAmount("");
        setInvoiceDescription("");
    };

    if (!activePatient) {
        return <div className="p-10 text-white font-serif">Loading Patient Data...</div>;
    }

    const patientBalance = charges
        .filter(c => c.patientId === activePatient.id && c.status === "PENDING")
        .reduce((sum, c) => sum + c.amount, 0);

    return (
        <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-theme(spacing.16))] sm:h-screen bg-black overflow-hidden relative">

            {/* Left Side: Video Feed */}
            <div className="flex-1 relative flex flex-col">
                {/* Header Overlay */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20 pointer-events-none">
                    <button onClick={() => router.push('/admin/telehealth')} className="pointer-events-auto flex items-center gap-2 text-white/50 hover:text-white transition-colors bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                        <ChevronLeft className="w-4 h-4" />
                        <span className="text-sm">Exit to Lobby</span>
                    </button>

                    <div className="pointer-events-auto">
                        <Badge variant="outline" className={`bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 flex items-center gap-2 text-[#a10c22]`}>
                            <div className="w-2 h-2 rounded-full bg-[#a10c22] animate-pulse" />
                            Provider View
                        </Badge>
                    </div>
                </div>

                {/* Video Area Container */}
                <div className="flex-1 relative p-4 flex items-center justify-center bg-[#05080c]">
                    {/* Simulated Patient Feed */}
                    <div className="w-full h-full max-w-5xl rounded-2xl overflow-hidden relative bg-[#0C1420] border border-white/5 shadow-2xl flex items-center justify-center group">

                        <div className="text-center animate-in fade-in zoom-in duration-500 delay-300">
                            <div className="w-24 h-24 rounded-full bg-white/5 mx-auto mb-6 flex items-center justify-center border border-white/10 overflow-hidden relative">
                                <span className="font-serif text-3xl text-white/50">{activePatient.name.charAt(0)}</span>
                            </div>
                            <h3 className="font-serif text-3xl text-white mb-2">Waiting for {activePatient.name}</h3>
                            <p className="text-white/50">
                                Patient has been notified and is joining the room...
                            </p>
                        </div>

                        {/* Provider Self View (PiP) */}
                        <div className="absolute bottom-6 right-6 w-32 sm:w-48 aspect-[3/4] sm:aspect-video bg-[#1A2332] rounded-xl border-2 border-white/10 shadow-2xl overflow-hidden z-20 flex items-center justify-center">
                            <UserCircle2 className="w-12 h-12 text-white/10" />
                            {(isMuted || isVideoOff) && (
                                <div className="absolute bottom-2 left-2 flex gap-1 bg-black/60 backdrop-blur-md rounded-md p-1 border border-white/5">
                                    {isMuted && <MicOff className="w-3 h-3 text-red-400" />}
                                    {isVideoOff && <VideoOff className="w-3 h-3 text-red-400" />}
                                </div>
                            )}
                            <span className="absolute bottom-2 right-2 text-[10px] text-white/50 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-md">You (Provider)</span>
                        </div>
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="h-20 bg-gradient-to-t from-black to-transparent flex items-center justify-center gap-4 z-30 pb-4">
                    <Button
                        variant="outline" size="icon"
                        onClick={() => setIsMuted(!isMuted)}
                        className={`h-12 w-12 rounded-full border-white/10 backdrop-blur-xl transition-all ${isMuted ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30' : 'bg-black/40 text-white hover:bg-white/10'}`}
                    >
                        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </Button>
                    <Button
                        variant="outline" size="icon"
                        onClick={() => setIsVideoOff(!isVideoOff)}
                        className={`h-12 w-12 rounded-full border-white/10 backdrop-blur-xl transition-all ${isVideoOff ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30' : 'bg-black/40 text-white hover:bg-white/10'}`}
                    >
                        {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                    </Button>
                    <Button
                        variant="default" size="icon"
                        onClick={handleLeaveCall}
                        className="h-12 w-12 rounded-full bg-red-600 hover:bg-red-700 text-white ml-2"
                    >
                        <PhoneOff className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Right Side: Clinical Sidebar & In-Call Upsell */}
            <div className="w-full md:w-80 lg:w-96 bg-[#0C1420] border-l border-white/10 flex flex-col shrink-0 z-30">

                {/* Patient Summary Header */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center font-serif text-xl text-[#a10c22] border border-white/10 shrink-0">
                            {activePatient.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl font-serif text-white leading-tight">{activePatient.name}</h2>
                            <p className="text-sm text-[#a10c22] flex items-center gap-1 mt-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Identity Verified
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="bg-white/5 border-white/10 text-white/70 text-[10px] uppercase font-normal">{activePatient.activeTreatment}</Badge>
                        <Badge variant="outline" className="bg-white/5 border-white/10 text-white/70 text-[10px] uppercase font-normal">{activePatient.dob}</Badge>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Clinical Overview */}
                    <div className="space-y-4">
                        <h3 className="text-xs text-white/40 uppercase tracking-widest font-semibold flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5" /> Clinical Context
                        </h3>
                        <div className="bg-black/20 border border-white/5 rounded-xl p-4 text-sm text-white/70">
                            Required Forms: {activePatient.requiredForms.length} <br />
                            Completed Forms: {activePatient.completedForms.length}
                            {activePatient.formsStatus !== 'COMPLETED' && (
                                <p className="text-[#a10c22] mt-2 text-xs flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Intake Pending</p>
                            )}
                        </div>
                    </div>

                    {/* In-Call Upsell Panel */}
                    <div className="space-y-4">
                        <h3 className="text-xs text-[#a10c22] uppercase tracking-widest font-semibold flex items-center gap-2">
                            <DollarSign className="w-3.5 h-3.5" /> In-Call Upsell & Push
                        </h3>
                        <div className="bg-gradient-to-br from-[#1A2332]/50 to-[#0C1420] border border-[#a10c22]/20 rounded-xl p-5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-16 bg-[#a10c22]/5 blur-3xl rounded-full" />

                            <p className="text-xs text-white/60 mb-4 relative z-10 leading-relaxed">
                                Authorize a treatment or add-on product. The payment terminal will instantly appear on the patient's screen.
                            </p>

                            <div className="space-y-3 relative z-10">
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5 block">Protocol/Product</label>
                                    <Input
                                        placeholder="e.g. B-12 Injection Kit"
                                        value={invoiceDescription}
                                        onChange={(e) => setInvoiceDescription(e.target.value)}
                                        className="bg-black/40 border-white/10 text-white h-9 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5 block">Amount ($)</label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={invoiceAmount}
                                        onChange={(e) => setInvoiceAmount(e.target.value)}
                                        className="bg-black/40 border-white/10 text-white h-9 text-sm font-serif"
                                    />
                                </div>
                                <Button
                                    className="w-full mt-2 bg-[#a10c22] text-black hover:bg-[#a10c22]/90 h-10 shadow-lg shadow-[#a10c22]/20 transition-transform active:scale-95"
                                    disabled={!invoiceAmount || !invoiceDescription}
                                    onClick={handleInCallUpsell}
                                >
                                    <Send className="w-4 h-4 mr-2" /> Push Invoice to Patient
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Balance */}
                    {patientBalance > 0 && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center justify-between">
                            <span className="text-sm text-red-400">Unpaid Balance:</span>
                            <span className="font-serif text-lg text-red-400">${patientBalance.toFixed(2)}</span>
                        </div>
                    )}

                </div>
            </div>

        </div>
    );
}
