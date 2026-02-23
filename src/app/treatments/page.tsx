import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight, Dna, Activity, Droplet, Pill, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function PublicTreatmentsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Minimal Header */}
            <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-xl">M</div>
                        <span className="font-serif text-xl tracking-wide">MedFit America</span>
                    </Link>
                    <Link href="/consultation">
                        <Button className="bg-[#8FA677] hover:bg-[#8FA677]/90 text-black font-medium text-sm rounded-full px-6">
                            Start Clinical Intake
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="pt-32 pb-24 container mx-auto px-6 max-w-5xl">
                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <p className="text-primary text-sm font-bold tracking-[0.2em] uppercase mb-4">Clinical Optimization</p>
                    <h1 className="text-5xl md:text-6xl font-serif mb-6">Our Treatment Portfolio</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Evidence-based protocols designed to restore biological baseline, accelerate fat loss, and optimize longevity. Choose your path to access our secure patient portal.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {[
                        { id: "nfc-lab", title: "Comprehensive NFC Panel", desc: "Nutritional, Functional, and Cellular testing to roadmap your biological profile before any treatment starts.", icon: <Activity className="w-6 h-6" /> },
                        { id: "medical-weight-loss", title: "Medical Weight Loss", desc: "A holistic metabolic reset program using advanced clinical directives to build sustainable wellness without restrictive dieting.", icon: <Users className="w-6 h-6" /> },
                        { id: "testosterone-therapy", title: "Testosterone Replacement (TRT)", desc: "Restore optimal hormone levels, reignite vitality, and rebuild lean mass under strict medical supervision.", icon: <Dna className="w-6 h-6" /> },
                        { id: "peptide-therapy", title: "Peptide Therapy", desc: "Advanced amino acid sequencing to accelerate recovery, boost anti-aging mechanisms, and enhance cognitive flow.", icon: <Pill className="w-6 h-6" /> },
                        { id: "semaglutide-instructions", title: "Semaglutide / Tirzepatide", desc: "FDA-cleared GLP-1/GIP agonists scientifically proven to regulate appetite, improve insulin sensitivity, and drive significant fat loss.", icon: <Droplet className="w-6 h-6" /> }
                    ].map((tx, idx) => (
                        <Card key={idx} className="bg-[#080808] border-border/50 hover:border-primary/50 transition-colors animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 group">
                            <CardContent className="p-8 flex flex-col h-full">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                                    {tx.icon}
                                </div>
                                <h3 className="text-2xl font-serif mb-4">{tx.title}</h3>
                                <p className="text-muted-foreground mb-8 flex-1">{tx.desc}</p>

                                <Link href="/consultation" className="mt-auto">
                                    <button className="w-full py-3 border border-white/10 hover:border-primary/50 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-all flex items-center justify-center gap-2 group-hover:text-primary">
                                        Begin Authorization Process <ArrowRight className="w-4 h-4" />
                                    </button>
                                </Link>
                            </CardContent>
                        </Card>
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
