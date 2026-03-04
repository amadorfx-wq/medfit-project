"use client";

import { useAppContext } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Droplet, Pill, Info, ArrowRight, Zap, Target, ArrowUpRight, Microscope, Database } from "lucide-react";

export default function TreatmentsPage() {
    const { currentUser, patients, enrollTreatment } = useAppContext();
    const router = useRouter();

    if (!currentUser) return null;

    const patientData = patients.find(p => p.id === currentUser.id);

    const handleEnroll = (treatmentName: string) => {
        enrollTreatment(currentUser.id, treatmentName);
        router.push("/dashboard/intake");
    };

    const treatmentCards = [
        {
            name: "Medical Weight Loss",
            icon: Target,
            accentColor: "#8FA677",
            description: "Advanced metabolic reset using GLP-1/GIP receptor agonists (Semaglutide/Tirzepatide). Clinically proven to reduce cravings, improve insulin sensitivity, and drive sustainable fat loss.",
            features: [
                { icon: Droplet, label: "Subcutaneous Administration" },
                { icon: Activity, label: "Weekly Check-ins" }
            ]
        },
        {
            name: "Peptide Protocol",
            icon: Pill,
            accentColor: "#B8977E",
            description: "Targeted amino acid sequencing designed to accelerate recovery, enhance cognitive function, boost natural growth hormone, and optimize cellular longevity (e.g. BPC-157, CJC-1295).",
            features: [
                { icon: Activity, label: "Recovery & Healing" },
                { icon: Droplet, label: "Anti-Aging Focus" }
            ]
        },
        {
            name: "Testosterone Therapy",
            icon: Zap,
            accentColor: "#E8A838",
            description: "Comprehensive Testosterone Replacement Therapy. Restore vitality, increase lean muscle mass, improve libido, and overcome the symptoms of andropause under strict medical supervision.",
            features: [
                { icon: Activity, label: "Blood Panel Required" },
                { icon: ArrowUpRight, label: "Vitality Restoration" }
            ]
        },
        {
            name: "Comprehensive NFC Panel",
            icon: Microscope,
            accentColor: "#475569",
            description: "Advanced clinical laboratory testing and analysis. From comprehensive blood panels to specialized hormonal profiles, setting the baseline for your metamorphic journey.",
            features: [
                { icon: Database, label: "Comprehensive Panels" },
                { icon: ArrowUpRight, label: "Baseline Assessment" }
            ]
        }
    ];

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

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {treatmentCards.map((tx) => {
                    const Icon = tx.icon;
                    return (
                        /* ✅ Punto 4: La tarjeta ENTERA es el área clickeable en mobile y desktop */
                        <div
                            key={tx.name}
                            onClick={() => handleEnroll(tx.name)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && handleEnroll(tx.name)}
                            className="cursor-pointer group flex flex-col bg-card border border-border/50 rounded-xl overflow-hidden hover:border-opacity-50 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] select-none"
                            style={{ "--hover-color": tx.accentColor } as React.CSSProperties}
                        >
                            {/* Color accent top stripe */}
                            <div
                                className="h-1 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{ backgroundColor: tx.accentColor }}
                            />
                            <div className="p-6 flex flex-col flex-1">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors"
                                    style={{ backgroundColor: `${tx.accentColor}1A`, color: tx.accentColor }}
                                >
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h3
                                    className="font-serif text-xl border-b border-border/50 pb-4 mb-4"
                                    style={{ color: "inherit" }}
                                >
                                    {tx.name}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
                                    {tx.description}
                                </p>
                                <ul className="space-y-2 mb-6 text-sm text-foreground/80">
                                    {tx.features.map((f, i) => {
                                        const FIcon = f.icon;
                                        return (
                                            <li key={i} className="flex gap-2 items-center">
                                                <FIcon className="w-3.5 h-3.5 shrink-0" style={{ color: tx.accentColor }} />
                                                {f.label}
                                            </li>
                                        );
                                    })}
                                </ul>
                                {/* CTA Footer — visually indicates what happens on tap */}
                                <div
                                    className="mt-auto w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 text-sm transition-all"
                                    style={{ backgroundColor: `${tx.accentColor}1A`, color: tx.accentColor }}
                                >
                                    Enroll Protocol
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-12 bg-[#080808] p-5 rounded-xl border border-white/5 flex gap-3 text-sm text-muted-foreground">
                <Info className="w-5 h-5 text-primary shrink-0" />
                <p>Enrolling in a new protocol will securely redirect you to our medical onboarding system where you&apos;ll review strict instructions and sign digital consent forms prior to billing.</p>
            </div>
        </div>
    );
}
