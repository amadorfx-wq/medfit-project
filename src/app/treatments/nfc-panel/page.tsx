import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LeadIntakeForm } from "@/components/LeadIntakeForm";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { tenant } from "@/lib/theme.config";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Comprehensive NFC Lab Panel in Atlanta | Baseline Diagnostics | Medfit",
    description: "Discover your metabolic, hormonal, and cellular health with our advanced NFC Panel diagnostics in Atlanta. Precision longevity mapping.",
};

export default function NfcPanelLandingPage() {
    return (
        <div className="min-h-screen bg-[white] text-[#102A52] selection:bg-[#a10c22]/30">
            {/* Minimal Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b border-[#E5E7EB]/50 bg-[white]/80 backdrop-blur-md">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-[#102A52] hover:text-[#102A52] transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium uppercase tracking-widest">Back to Homepage</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-[#a10c22] flex items-center justify-center text-white font-serif font-bold text-xl">{tenant.logoInitial}</div>
                        <span className="font-serif text-xl tracking-wide text-[#102A52]">{tenant.name}</span>
                    </div>
                    <Link href="/login" className="hidden sm:block text-sm font-medium text-[#a10c22] hover:text-[#7D9365] transition-colors">
                        Patient Portal
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-6 container mx-auto">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="text-[#a10c22] text-xs font-bold tracking-[0.2em] uppercase mb-6 block">Diagnostics & Baseline Assessment</span>
                    <h1 className="text-5xl md:text-7xl font-serif text-[#102A52] leading-tight mb-8">
                        Comprehensive NFC Panel Atlanta
                    </h1>
                    <p className="text-xl md:text-2xl text-[#102A52]/80 leading-relaxed font-light mb-12 max-w-2xl mx-auto">
                        Advanced clinical laboratory testing and hormonal profiling in Atlanta. The absolute baseline for your metamorphic journey to optimal health.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                        <AddToCartButton
                            item={{ name: "Comprehensive NFC Panel Diagnostics", price: "$450.00" }}
                            label="Add Diagnostics to Request Cart"
                            className="bg-[#102A52] hover:bg-[#102A52] text-white font-medium text-lg px-8 h-16 rounded-full w-full sm:w-auto shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
                        />
                        <Link href="/login">
                            <Button variant="outline" className="border-[#102A52] text-[#102A52] hover:bg-[#102A52]/5 font-medium text-lg px-8 h-16 rounded-full w-full sm:w-auto transition-all">
                                Patient Portal Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Medical Approach / Info Section */}
            <section className="py-24 bg-white border-y border-[#E5E7EB]">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="relative h-[500px] w-full rounded-2xl overflow-hidden bg-[#E5E7EB]/50 group">
                            <Image
                                src="/images/treatments/nfc_hero.png"
                                alt="Comprehensive NFC Panel Laboratory Diagnostics"
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                priority
                            />
                        </div>
                        <div className="space-y-8">
                            <h2 className="text-4xl font-serif text-[#102A52]">The Deep Clinical Dive Into Your Biology</h2>
                            <div className="space-y-6 text-[#102A52]/80 leading-relaxed text-lg">
                                <p>
                                    True wellness begins with understanding. Our Comprehensive NFC Panel goes far beyond a standard physical exam. We extract over 50 crucial biomarkers to map your metabolic, hormonal, and cellular health.
                                </p>
                                <ul className="space-y-4 pt-4">
                                    {[
                                        "Complete Hormonal Optimization Mapping",
                                        "Inflammation and Metabolic Tracking",
                                        "Nutritional and Vitamin Deficiency Scans",
                                        "Cardiovascular and Organ Health Baseline"
                                    ].map((feature, idx) => (
                                        <li key={idx} className="flex gap-4 items-start">
                                            <CheckCircle2 className="w-6 h-6 text-[#a10c22] shrink-0 mt-0.5" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Lead Capture Section */}
            <section className="py-24">
                <div className="container mx-auto px-6 max-w-3xl">
                    <div className="bg-white p-10 md:p-16 rounded-[2rem] border border-[#E5E7EB] shadow-sm text-center">
                        <h2 className="text-3xl font-serif text-[#102A52] mb-4">Request Your Consultation</h2>
                        <p className="text-[#102A52]/70 mb-10 max-w-lg mx-auto">
                            Leave your details below and our clinical coordination team will contact you to schedule your initial lab draw.
                        </p>

                        <LeadIntakeForm />
                    </div>
                </div>
            </section>

            {/* Simple Footer */}
            <footer className="py-10 border-t border-[#E5E7EB] text-center text-sm text-[#102A52]/60">
                <p>© {tenant.legal.copyrightYear} {tenant.name}. {tenant.tagline}</p>
            </footer>
        </div>
    );
}
