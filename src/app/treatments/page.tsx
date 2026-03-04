import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight, Dna, Activity, Pill, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { tenant } from "@/lib/theme.config";

export default function PublicTreatmentsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Minimal Header with improved spacing (Silent Elegance) */}
            <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-md py-4">
                <div className="container mx-auto px-4 xl:px-8 h-20 xl:h-24 flex items-center justify-between gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 xl:gap-3 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-xl xl:text-2xl">{tenant.logoInitial}</div>
                        <span className="font-serif text-lg xl:text-2xl tracking-wide whitespace-nowrap">{tenant.name}</span>
                    </Link>

                    {/* Actions */}
                    <div className="flex items-center gap-2 xl:gap-5">
                        <Link href="/consultation">
                            <Button className="bg-[#8FA677] hover:bg-[#8FA677]/90 text-black font-medium text-xs xl:text-sm px-4 xl:px-8 h-9 xl:h-11 rounded-full transition-transform hover:scale-105 shadow-[0_0_15px_rgba(143,166,119,0.15)] hover:shadow-[0_0_20px_rgba(143,166,119,0.25)] whitespace-nowrap">
                                Start Clinical Intake
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="pt-40 pb-24 container mx-auto px-6 max-w-5xl">
                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <p className="text-primary text-sm font-bold tracking-[0.2em] uppercase mb-4">Clinical Optimization</p>
                    <h1 className="text-5xl md:text-6xl font-serif mb-6">Our Treatment Portfolio</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Evidence-based protocols designed to restore biological baseline, accelerate fat loss, and optimize longevity. Choose your path to access our secure patient portal.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {[
                        { id: "nfc-lab", title: "Comprehensive NFC Panel", desc: "Nutritional, Functional, and Cellular testing to roadmap your biological profile before any treatment starts.", icon: <Activity className="w-6 h-6" />, link: "/treatments/nfc-panel" },
                        { id: "medical-weight-loss", title: "Medical Weight Loss", desc: "A holistic metabolic reset combining customized GLP-1/GIP receptor agonists (Semaglutide/Tirzepatide) to build sustainable wellness without restrictive dieting.", icon: <Users className="w-6 h-6" />, link: "/treatments/weight-loss" },
                        { id: "testosterone-therapy", title: "Testosterone Replacement (TRT)", desc: "Restore optimal hormone levels, reignite vitality, and rebuild lean mass under strict medical supervision.", icon: <Dna className="w-6 h-6" />, link: "/treatments/trt" },
                        { id: "peptide-therapy", title: "Peptide Therapy", desc: "Advanced amino acid sequencing to accelerate recovery, boost anti-aging mechanisms, and enhance cognitive flow.", icon: <Pill className="w-6 h-6" />, link: "/treatments/peptides" }
                    ].map((tx, idx) => (
                        <Link href={tx.link} key={idx} className="block group">
                            <Card className="bg-[#080808] border-border/50 hover:border-primary/50 transition-colors animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 h-full">
                                <CardContent className="p-8 flex flex-col h-full cursor-pointer relative">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                                        {tx.icon}
                                    </div>
                                    <h3 className="text-2xl font-serif mb-4">{tx.title}</h3>
                                    <p className="text-muted-foreground mb-8 flex-1">{tx.desc}</p>

                                    <div className="mt-auto">
                                        <button className="w-full py-3 border border-white/10 group-hover:border-primary/50 bg-white/5 group-hover:bg-white/10 rounded-lg text-sm transition-all flex items-center justify-center gap-2 group-hover:text-primary">
                                            Learn More <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                <div className="mt-16 text-center text-sm text-muted-foreground flex justify-center items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    All protocols require medical authorization and completed Wellness Intake Forms.
                </div>
            </main>
        </div>
    );
}
