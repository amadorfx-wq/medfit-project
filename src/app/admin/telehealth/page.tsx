"use client";

import { Lock, Video, ShieldCheck, Activity, CreditCard, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

export default function TelehealthHDPage() {
    return (
        <div className="animate-in fade-in duration-500 max-w-6xl mx-auto space-y-8 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-20">
                <div>
                    <h1 className="text-3xl font-serif text-white mb-2 flex items-center gap-3">
                        <Video className="w-8 h-8 text-[#B8977E]" />
                        Virtual Consultations (Telehealth HD)
                    </h1>
                    <p className="text-white/50">Conduct instant HIPAA-compliant video calls and secure real-time payments.</p>
                </div>
            </div>

            {/* Paywall Container */}
            <div className="relative w-full rounded-2xl border border-[#B8977E]/20 bg-[#0C1420] overflow-hidden mt-8 shadow-2xl">

                {/* Background "Tease" Image / Mock UI (Blurred) */}
                <div className="absolute inset-0 pointer-events-none opacity-40 blur-[8px] flex items-center justify-center select-none">
                    <div className="w-full h-full p-8 grid grid-cols-3 gap-6">
                        <div className="col-span-2 bg-black/50 rounded-xl flex items-center justify-center border border-white/5 relative overflow-hidden">
                            <div className="absolute top-4 right-4 bg-red-500/20 text-red-500 text-xs px-2 py-1 rounded">REC 00:04:12</div>
                            <Video className="w-32 h-32 text-white/10" />
                        </div>
                        <div className="space-y-6">
                            <div className="h-64 bg-black/50 rounded-xl border border-white/5 p-4 space-y-4">
                                <div className="h-4 w-1/2 bg-white/10 rounded" />
                                <div className="h-2 w-full bg-white/5 rounded" />
                                <div className="h-2 w-3/4 bg-white/5 rounded" />
                                <div className="h-2 w-full bg-white/5 rounded" />
                            </div>
                            <div className="h-48 bg-[#B8977E]/10 rounded-xl border border-[#B8977E]/20 p-4 flex flex-col justify-end">
                                <div className="h-10 w-full bg-[#B8977E]/30 rounded" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dark Overlay for contrast */}
                <div className="absolute inset-0 bg-black/60 z-10" />

                {/* Paywall Content */}
                <div className="relative z-20 p-8 md:p-16 flex flex-col items-center justify-center text-center max-w-3xl mx-auto min-h-[600px] space-y-8">

                    <div className="w-20 h-20 bg-gradient-to-br from-[#B8977E]/20 to-black rounded-2xl flex items-center justify-center border border-[#B8977E]/30 shadow-2xl shadow-[#B8977E]/10 mb-2">
                        <Lock className="w-10 h-10 text-[#B8977E]" />
                    </div>

                    <div className="space-y-4">
                        <Badge variant="outline" className="border-[#B8977E]/30 text-[#B8977E] bg-[#B8977E]/10 text-xs uppercase font-bold tracking-widest px-4 py-1">
                            Enterprise Feature
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-serif text-white leading-tight">
                            The <span className="text-[#B8977E] italic">Virtual Closing Room.</span>
                        </h2>
                        <p className="text-white/60 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
                            Stop losing 30% of patients who abandon checkout after an audio call. Secure a 100% close rate with an integrated video-to-payment pipeline.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left mt-8">
                        <Card className="bg-white/5 border-white/10 p-5 backdrop-blur-sm">
                            <ShieldCheck className="w-6 h-6 text-[#B8977E] mb-3" />
                            <h3 className="text-white font-medium mb-1">HIPAA Verified</h3>
                            <p className="text-white/40 text-sm">Military-grade encrypted P2P video calls, guaranteeing legal compliance and BAA data protection.</p>
                        </Card>
                        <Card className="bg-white/5 border-white/10 p-5 backdrop-blur-sm">
                            <Activity className="w-6 h-6 text-[#B8977E] mb-3" />
                            <h3 className="text-white font-medium mb-1">Split-Screen CRM</h3>
                            <p className="text-white/40 text-sm">Review medical histories and adjust dosages in real-time without ever taking your eyes off the patient.</p>
                        </Card>
                        <Card className="bg-[#B8977E]/10 border-[#B8977E]/20 p-5 backdrop-blur-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-16 bg-[#B8977E]/20 blur-[50px] rounded-full" />
                            <CreditCard className="w-6 h-6 text-[#B8977E] mb-3 relative z-10" />
                            <h3 className="text-[#B8977E] font-medium mb-1 relative z-10">Stripe Injection</h3>
                            <p className="text-[#B8977E]/70 text-sm relative z-10">Push the payment checkout directly to the patient's screen during the video call to capture the sale instantly.</p>
                        </Card>
                    </div>

                    <div className="pt-8 w-full max-w-sm flex flex-col gap-4">
                        <Button
                            className="w-full bg-white text-black hover:bg-white/90 h-14 text-lg font-medium shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-all hover:scale-[1.02]"
                            onClick={() => {
                                toast.message("Enterprise Upgrade Required", {
                                    description: "Contact your Account Manager to enable MedFit Telehealth HD ($299/mo).",
                                    icon: <Lock className="w-4 h-4 text-[#B8977E]" />,
                                    duration: 5000,
                                })
                            }}
                        >
                            <Lock className="w-4 h-4 mr-2 opacity-50" />
                            Upgrade to Unlock Module
                        </Button>
                        <Button variant="ghost" className="text-white/40 hover:text-white group">
                            Schedule a Technical Demo
                            <ChevronRight className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
}
