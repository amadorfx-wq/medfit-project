import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LeadIntakeForm } from "@/components/LeadIntakeForm";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "TRT & Testosterone Replacement in Atlanta | Medfit",
    description: "Regain your energy and vitality with Medically Supervised TRT (Testosterone Replacement Therapy) in Atlanta, GA. Expert hormone optimization.",
};

export default function TRTLandingPage() {
    return (
        <div className="min-h-screen bg-[#F9F7F2] text-[#1A1A1A] selection:bg-[#8FA677]/30">
            {/* Minimal Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b border-[#E5E5E5]/50 bg-[#F9F7F2]/80 backdrop-blur-md">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-[#2D2D2D] hover:text-[#1A1A1A] transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium uppercase tracking-widest">Back to Homepage</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-[#8FA677] flex items-center justify-center text-white font-serif font-bold text-xl">M</div>
                        <span className="font-serif text-xl tracking-wide text-[#1A1A1A]">MedFit America</span>
                    </div>
                    <Link href="/login" className="hidden sm:block text-sm font-medium text-[#8FA677] hover:text-[#7D9365] transition-colors">
                        Patient Portal
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-6 container mx-auto">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="text-[#8FA677] text-xs font-bold tracking-[0.2em] uppercase mb-6 block">Hormonal Optimization</span>
                    <h1 className="text-5xl md:text-7xl font-serif text-[#1A1A1A] leading-tight mb-8">
                        Testosterone Replacement (TRT) in Atlanta
                    </h1>
                    <p className="text-xl md:text-2xl text-[#2D2D2D]/80 leading-relaxed font-light mb-12 max-w-2xl mx-auto">
                        Comprehensive Testosterone Replacement Therapy in Atlanta to restore optimal balance, increase lean muscle mass, improve libido, and overcome andropause.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                        <AddToCartButton
                            item={{ name: "TRT Protocol (Bio-identical)", price: "$249.00/mo" }}
                            label="Add Protocol to Request Cart"
                            className="bg-[#1A1A1A] hover:bg-[#2D2D2D] text-white font-medium text-lg px-8 h-16 rounded-full w-full sm:w-auto shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
                        />
                        <Link href="/login">
                            <Button variant="outline" className="border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A]/5 font-medium text-lg px-8 h-16 rounded-full w-full sm:w-auto transition-all">
                                Patient Portal Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Medical Approach / Info Section */}
            <section className="py-24 bg-white border-y border-[#E5E5E5]">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="relative h-[500px] w-full rounded-2xl overflow-hidden bg-[#E5E5E5]/50 group">
                            <Image
                                src="/images/treatments/trt_hero.png"
                                alt="Testosterone Replacement Therapy (TRT)"
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                priority
                            />
                        </div>
                        <div className="space-y-8">
                            <h2 className="text-4xl font-serif text-[#1A1A1A]">Restoring Optimal Vitality & Hormone Balance</h2>
                            <div className="space-y-6 text-[#2D2D2D]/80 leading-relaxed text-lg">
                                <p>
                                    As we age, testosterone levels naturally decline, often leading to fatigue, reduced muscle mass, cognitive fog, and diminished libido. Our Testosterone Replacement Therapy (TRT) is a precision-driven protocol designed to safely elevate your hormone levels back to their optimal, youthful range.
                                </p>
                                <ul className="space-y-4 pt-4">
                                    {[
                                        "Enhanced energy levels and mental focus",
                                        "Support for lean muscle mass and fat reduction",
                                        "Restored libido and sexual function",
                                        "Regulated under strict medical monitoring"
                                    ].map((feature, idx) => (
                                        <li key={idx} className="flex gap-4 items-start">
                                            <CheckCircle2 className="w-6 h-6 text-[#8FA677] shrink-0 mt-0.5" />
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
                    <div className="bg-white p-10 md:p-16 rounded-[2rem] border border-[#E5E5E5] shadow-sm text-center">
                        <h2 className="text-3xl font-serif text-[#1A1A1A] mb-4">Request Your Consultation</h2>
                        <p className="text-[#2D2D2D]/70 mb-10 max-w-lg mx-auto">
                            Reclaim your drive and focus. Provide your details below to schedule an evaluation with our clinical experts.
                        </p>

                        <LeadIntakeForm />
                    </div>
                </div>
            </section>

            {/* Simple Footer */}
            <footer className="py-10 border-t border-[#E5E5E5] text-center text-sm text-[#2D2D2D]/60">
                <p>© 2026 MedFit America. Exceptional Care, Discreetly Provided.</p>
            </footer>
        </div>
    );
}
