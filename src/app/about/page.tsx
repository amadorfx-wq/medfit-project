import Link from "next/link";
import { Button } from "@/components/ui/button";
import { tenant } from "@/lib/theme.config";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Minimal Header */}
            <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-xl">{tenant.logoInitial}</div>
                        <span className="font-serif text-xl tracking-wide">{tenant.name}</span>
                    </Link>
                    <Link href="/consultation">
                        <Button className="bg-[#8FA677] hover:bg-[#8FA677]/90 text-black font-medium text-sm rounded-full px-6">
                            Start Clinical Intake
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="pt-32 pb-24 container mx-auto px-6 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center mb-16">
                    <p className="text-primary text-sm font-bold tracking-[0.2em] uppercase mb-4">Corporate Heritage</p>
                    <h1 className="text-5xl md:text-6xl font-serif mb-6">About {tenant.name}</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        We are fundamentally changing the architecture of preventive medicine and concierge health optimization.
                    </p>
                </div>

                <div className="space-y-16">
                    <section>
                        <h2 className="text-3xl font-serif mb-4 flex items-center gap-4">
                            <span className="w-8 h-[1px] bg-primary" />
                            Our Medical Philosophy
                        </h2>
                        <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed">
                            <p>
                                At {tenant.name}, we believe that true luxury is operating at peak biological capacity. For too long, the medical establishment has focused on treating sickness rather than optimizing health. We bridge the gap between reactive medicine and elite athletic performance care, making the world's most advanced longevity protocols accessible to discerning individuals.
                            </p>
                            <p>
                                Using data-driven diagnostics like NFC panels, we eliminate the guesswork from hormone health, peptide therapy, and metabolic weight loss.
                            </p>
                        </div>
                    </section>

                    <section className="bg-white/5 p-8 md:p-12 rounded-2xl border border-white/10">
                        <h2 className="text-3xl font-serif mb-6 text-white text-center">Uncompromising Standards</h2>
                        <div className="grid sm:grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-primary font-serif text-xl mb-2">Physician-Led Protocols</h4>
                                <p className="text-sm text-foreground/70">Every treatment is meticulously reviewed and prescribed by our board-certified physicians, ensuring maximum safety and efficacy.</p>
                            </div>
                            <div>
                                <h4 className="text-primary font-serif text-xl mb-2">Pharmacy Excellence</h4>
                                <p className="text-sm text-foreground/70">We exclusively partner with FDA-registered, PCAB-accredited compounding pharmacies to deliver the purest peptides and hormones.</p>
                            </div>
                            <div>
                                <h4 className="text-primary font-serif text-xl mb-2">White-Glove Concierge</h4>
                                <p className="text-sm text-foreground/70">Your health journey is supported 24/7 by a dedicated clinical concierge team via our private patient portal.</p>
                            </div>
                            <div>
                                <h4 className="text-primary font-serif text-xl mb-2">Data-Driven Precision</h4>
                                <p className="text-sm text-foreground/70">We don't guess. We utilize Comprehensive Cellular and Metabolic panels to map your biological blueprint.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
