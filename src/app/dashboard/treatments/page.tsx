"use client";

import { useAppContext } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Droplet, Pill, Info, ArrowRight, Zap, Target, ArrowUpRight } from "lucide-react";

export default function TreatmentsPage() {
    const { currentUser, patients, enrollTreatment } = useAppContext();
    const router = useRouter();

    if (!currentUser) return null;

    const patientData = patients.find(p => p.id === currentUser.id);

    const handleEnroll = (treatmentName: string) => {
        enrollTreatment(currentUser.id, treatmentName);
        router.push("/dashboard/intake");
    };

    return (
        <div className="p-6 md:p-12 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-10 border-b border-border/50 pb-6">
                <h1 className="text-3xl md:text-4xl font-serif mb-2">My Treatments</h1>
                <p className="text-muted-foreground">Detailed overview of your current protocols and advanced clinical catalog.</p>
            </header>

            {/* Active Protocol */}
            <div className="mb-16">
                <Card className="bg-gradient-to-br from-[#B8977E]/10 to-transparent border-[#B8977E]/20">
                    <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="text-[#B8977E] border-[#B8977E]/50 bg-[#B8977E]/10 tracking-widest uppercase">
                                Active Protocol
                            </Badge>
                            <Activity className="w-5 h-5 text-[#B8977E]" />
                        </div>
                        <CardTitle className="font-serif text-3xl">{patientData?.activeTreatment || "Pending Evaluation"}</CardTitle>
                        <CardDescription className="text-base mt-2 max-w-2xl">
                            Your current protocol is tailored by our clinical team. Please check the dashboard or messages for your upcoming milestones.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>

            {/* Catalog Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-serif mb-2">Optimization Catalog</h2>
                <p className="text-muted-foreground">Self-enroll in our pristine selection of regenerative and metamorphic protocols.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">

                {/* 1. Weight Loss */}
                <Card className="bg-card border-border/50 hover:border-[#8FA677]/50 transition-all flex flex-col group">
                    <CardHeader className="pb-4">
                        <div className="w-12 h-12 rounded-xl bg-[#8FA677]/10 flex items-center justify-center mb-4 text-[#8FA677]">
                            <Target className="w-6 h-6" />
                        </div>
                        <CardTitle className="font-serif text-xl border-b border-border/50 pb-4 mb-4">Medical Weight Loss</CardTitle>
                        <p className="text-sm text-muted-foreground leading-relaxed h-[100px]">
                            Advanced metabolic reset using GLP-1/GIP receptor agonists (Semaglutide/Tirzepatide). Clinically proven to reduce cravings, improve insulin sensitivity, and drive sustainable fat loss.
                        </p>
                    </CardHeader>
                    <CardContent className="mt-auto pt-0 text-sm">
                        <ul className="space-y-2 mb-6 text-foreground/80">
                            <li className="flex gap-2 items-center"><Droplet className="w-3.5 h-3.5 text-[#8FA677]" /> Subcutaneous Administration</li>
                            <li className="flex gap-2 items-center"><Activity className="w-3.5 h-3.5 text-[#8FA677]" /> Weekly Check-ins</li>
                        </ul>
                        <button
                            onClick={() => handleEnroll("Medical Weight Loss")}
                            className="w-full py-4 rounded-xl bg-white/5 hover:bg-[#8FA677] text-foreground hover:text-white font-medium transition-all group-hover:shadow-[0_0_15px_rgba(143,166,119,0.2)] flex items-center justify-center gap-2"
                        >
                            Enroll Protocol <ArrowRight className="w-4 h-4" />
                        </button>
                    </CardContent>
                </Card>

                {/* 2. Peptide Therapy */}
                <Card className="bg-card border-border/50 hover:border-[#B8977E]/50 transition-all flex flex-col group">
                    <CardHeader className="pb-4">
                        <div className="w-12 h-12 rounded-xl bg-[#B8977E]/10 flex items-center justify-center mb-4 text-[#B8977E]">
                            <Pill className="w-6 h-6" />
                        </div>
                        <CardTitle className="font-serif text-xl border-b border-border/50 pb-4 mb-4">Peptide Therapy</CardTitle>
                        <p className="text-sm text-muted-foreground leading-relaxed h-[100px]">
                            Targeted amino acid sequencing designed to accelerate recovery, enhance cognitive function, boost natural growth hormone, and optimize cellular longevity (e.g. BPC-157, CJC-1295).
                        </p>
                    </CardHeader>
                    <CardContent className="mt-auto pt-0 text-sm">
                        <ul className="space-y-2 mb-6 text-foreground/80">
                            <li className="flex gap-2 items-center"><Activity className="w-3.5 h-3.5 text-[#B8977E]" /> Recovery & Healing</li>
                            <li className="flex gap-2 items-center"><Droplet className="w-3.5 h-3.5 text-[#B8977E]" /> Anti-Aging Focus</li>
                        </ul>
                        <button
                            onClick={() => handleEnroll("Peptide Protocol")}
                            className="w-full py-4 rounded-xl bg-white/5 hover:bg-[#B8977E] hover:text-black text-foreground font-medium transition-all group-hover:shadow-[0_0_15px_rgba(184,151,126,0.2)] flex items-center justify-center gap-2"
                        >
                            Enroll Protocol <ArrowRight className="w-4 h-4" />
                        </button>
                    </CardContent>
                </Card>

                {/* 3. TRT */}
                <Card className="bg-card border-border/50 hover:border-[#E8A838]/50 transition-all flex flex-col group">
                    <CardHeader className="pb-4">
                        <div className="w-12 h-12 rounded-xl bg-[#E8A838]/10 flex items-center justify-center mb-4 text-[#E8A838]">
                            <Zap className="w-6 h-6" />
                        </div>
                        <CardTitle className="font-serif text-xl border-b border-border/50 pb-4 mb-4">Hormone Optimization (TRT)</CardTitle>
                        <p className="text-sm text-muted-foreground leading-relaxed h-[100px]">
                            Comprehensive Testosterone Replacement Therapy. Restore vitality, increase lean muscle mass, improve libido, and overcome the symptoms of andropause under strict medical supervision.
                        </p>
                    </CardHeader>
                    <CardContent className="mt-auto pt-0 text-sm">
                        <ul className="space-y-2 mb-6 text-foreground/80">
                            <li className="flex gap-2 items-center"><Activity className="w-3.5 h-3.5 text-[#E8A838]" /> Blood Panel Required</li>
                            <li className="flex gap-2 items-center"><ArrowUpRight className="w-3.5 h-3.5 text-[#E8A838]" /> Vitality Restoration</li>
                        </ul>
                        <button
                            onClick={() => handleEnroll("Testosterone Therapy")}
                            className="w-full py-4 rounded-xl bg-white/5 hover:bg-[#E8A838] hover:text-black text-foreground font-medium transition-all group-hover:shadow-[0_0_15px_rgba(232,168,56,0.2)] flex items-center justify-center gap-2"
                        >
                            Enroll Protocol <ArrowRight className="w-4 h-4" />
                        </button>
                    </CardContent>
                </Card>

            </div>

            <div className="mt-12 bg-[#080808] p-5 rounded-xl border border-white/5 flex gap-3 text-sm text-muted-foreground">
                <Info className="w-5 h-5 text-primary shrink-0" />
                <p>Enrolling in a new protocol will securely redirect you to our medical onboarding system where you'll review strict instructions and sign digital consent forms prior to billing.</p>
            </div>
        </div>
    );
}
