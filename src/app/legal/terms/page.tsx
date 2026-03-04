"use client";

import Link from "next/link";
import { tenant } from "@/lib/theme.config";
import { Scale, ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
    const lastUpdated = "March 3, 2026";

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-xl">{tenant.logoInitial}</div>
                        <span className="font-serif text-xl tracking-wide">{tenant.name}</span>
                    </Link>
                    <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                </div>
            </header>

            <main className="pt-32 pb-24 container mx-auto px-6 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Scale className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-serif">Terms of Service</h1>
                        <p className="text-xs text-muted-foreground mt-1">Last Updated: {lastUpdated}</p>
                    </div>
                </div>

                <div className="prose prose-invert max-w-none text-foreground/80 space-y-8 text-sm leading-relaxed">
                    <section>
                        <h2 className="text-lg font-serif text-foreground mb-3">1. Acceptance of Terms</h2>
                        <p>
                            These Terms of Service (&quot;Terms&quot;) govern your access to and use of the {tenant.name} patient portal,
                            clinical management platform, and related services (collectively, the &quot;Service&quot;) provided by {tenant.legalEntity}.
                            By accessing or using the Service, you agree to these Terms. If you do not agree, you may not use the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-foreground mb-3">2. Medical Disclaimer</h2>
                        <p>
                            <strong className="text-foreground">The Service is not a substitute for professional medical advice, diagnosis, or treatment.</strong> All
                            medical decisions are made by licensed healthcare providers. The Service serves as a technology platform to
                            facilitate communication between patients and their healthcare providers, manage clinical workflows, and
                            process payments. Always consult with your healthcare provider for medical advice.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-foreground mb-3">3. Eligibility</h2>
                        <p>You must be at least 18 years of age to create an account and use the Service. By creating an account, you represent that the information you provide is accurate, current, and complete, and you agree to maintain and promptly update your information.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-foreground mb-3">4. Account Security</h2>
                        <p>You are responsible for maintaining the confidentiality of your login credentials. You agree to:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Use a strong, unique password for your account.</li>
                            <li>Not share your login credentials with any third party.</li>
                            <li>Immediately notify us of any unauthorized use of your account.</li>
                            <li>Accept responsibility for all activities that occur under your account.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-foreground mb-3">5. Payments and Billing</h2>
                        <p>
                            Payment processing is handled securely by Stripe Inc. By submitting a payment, you authorize {tenant.legalEntity} to
                            charge the specified amount to your payment method. All fees are stated in U.S. Dollars.
                            Charges will appear on your statement as &quot;{tenant.payment.statementDescriptor}&quot;.
                        </p>
                        <p>
                            <strong className="text-foreground">Refund Policy:</strong> Refund requests must be submitted within 30 days of the charge.
                            Refunds for medical products that have been dispensed or shipped are subject to review and may be denied if the
                            product has been opened or used.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-foreground mb-3">6. Electronic Signatures</h2>
                        <p>
                            By using the Service&apos;s electronic signature functionality, you consent to conducting transactions electronically
                            in accordance with the U.S. Electronic Signatures in Global and National Commerce Act (E-SIGN Act) and the
                            Uniform Electronic Transactions Act (UETA). You agree that your electronic signature carries the same legal
                            weight as a handwritten signature.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-foreground mb-3">7. Prohibited Uses</h2>
                        <p>You agree not to:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Use the Service for any unlawful purpose.</li>
                            <li>Attempt to gain unauthorized access to any system or data.</li>
                            <li>Submit false, misleading, or fraudulent medical information.</li>
                            <li>Interfere with or disrupt the integrity or performance of the Service.</li>
                            <li>Scrape, data mine, or otherwise extract information from the Service.</li>
                            <li>Share another patient&apos;s medical information obtained through the Service.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-foreground mb-3">8. Intellectual Property</h2>
                        <p>
                            All content, designs, logos, trademarks, and software comprising the Service are the property of {tenant.legalEntity} or
                            its licensors and are protected by U.S. and international intellectual property laws. You may not reproduce,
                            distribute, or create derivative works without prior written consent.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-foreground mb-3">9. Limitation of Liability</h2>
                        <p>
                            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, {tenant.legalEntity.toUpperCase()} SHALL NOT BE LIABLE FOR ANY
                            INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR IN CONNECTION WITH YOUR
                            USE OF THE SERVICE. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU TO US IN THE TWELVE (12)
                            MONTHS PRECEDING THE CLAIM.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-foreground mb-3">10. Dispute Resolution</h2>
                        <p>
                            Any dispute arising from these Terms shall be resolved through binding arbitration administered by the
                            American Arbitration Association (AAA) in the State of Georgia, in accordance with the AAA&apos;s Commercial
                            Arbitration Rules. You agree to waive any right to a jury trial or to participate in a class action.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-foreground mb-3">11. Governing Law</h2>
                        <p>
                            These Terms shall be governed by and construed in accordance with the laws of the State of Georgia, without
                            regard to its conflict of law provisions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-foreground mb-3">12. Modifications</h2>
                        <p>
                            We reserve the right to modify these Terms at any time. Material changes will be communicated to registered
                            users via email or a prominent notice on the Service. Your continued use of the Service after such notification
                            constitutes acceptance of the modified Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-foreground mb-3">13. Contact</h2>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10 mt-3">
                            <p className="font-medium text-foreground">{tenant.legalEntity}</p>
                            <p>{tenant.address.full}</p>
                            <p>Email: {tenant.email}</p>
                            <p>Phone: {tenant.phone}</p>
                        </div>
                    </section>

                    <div className="border-t border-white/10 pt-6 mt-10">
                        <p className="text-xs text-muted-foreground text-center">{tenant.legal.copyright}</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
