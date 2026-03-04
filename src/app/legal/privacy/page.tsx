"use client";

import Link from "next/link";
import { tenant } from "@/lib/theme.config";
import { Shield, ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
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
                        <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-serif">Privacy Policy</h1>
                        <p className="text-xs text-muted-foreground mt-1">Last Updated: {lastUpdated}</p>
                    </div>
                </div>

                <div className="prose prose-invert max-w-none text-foreground/80 space-y-8 text-sm leading-relaxed">
                    <section>
                        <h2 className="text-lg font-serif text-foreground mb-3">1. Introduction</h2>
                        <p>
                            {tenant.legalEntity} (&quot;{tenant.shortName}&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the {tenant.name} platform
                            and related services. This Privacy Policy describes how we collect, use, protect, and share your personal
                            information, including Protected Health Information (&quot;PHI&quot;) as defined under the Health Insurance Portability
                            and Accountability Act of 1996 (&quot;HIPAA&quot;).
                        </p>
                        <p>
                            By using our services, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-foreground mb-3">2. Information We Collect</h2>
                        <p><strong className="text-foreground">Personal Information:</strong> Name, email address, phone number, date of birth, mailing address, and government-issued identification when required.</p>
                        <p><strong className="text-foreground">Protected Health Information (PHI):</strong> Medical history, treatment records, laboratory results, consent forms, electronic signatures, prescription information, and clinical notes.</p>
                        <p><strong className="text-foreground">Financial Information:</strong> Payment card details (processed and stored exclusively by our PCI-DSS compliant payment processor, Stripe Inc.), billing addresses, and transaction history.</p>
                        <p><strong className="text-foreground">Technical Data:</strong> IP addresses, browser type, device information, and usage analytics collected through standard web technologies.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-foreground mb-3">3. How We Use Your Information</h2>
                        <p>We use your information exclusively for the following purposes:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Providing and managing your medical treatment and care coordination.</li>
                            <li>Processing payments and maintaining billing records.</li>
                            <li>Communicating with you regarding appointments, treatment updates, and account notifications.</li>
                            <li>Complying with legal and regulatory requirements, including HIPAA.</li>
                            <li>Improving our platform and healthcare services.</li>
                            <li>Maintaining audit logs for security and compliance purposes.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-foreground mb-3">4. How We Share Your Information</h2>
                        <p>We <strong className="text-foreground">do not sell</strong> your personal information or PHI. We may share information only with:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li><strong className="text-foreground">Healthcare Providers:</strong> Treating physicians and clinical staff who require access for your care.</li>
                            <li><strong className="text-foreground">Payment Processors:</strong> Stripe Inc. processes payment transactions under their own privacy policy and PCI-DSS compliance.</li>
                            <li><strong className="text-foreground">Cloud Infrastructure:</strong> Our data is hosted by Supabase Inc. and Vercel Inc., both of which maintain SOC 2 compliant infrastructure.</li>
                            <li><strong className="text-foreground">Legal Requirements:</strong> When required by law, court order, or government regulation.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-foreground mb-3">5. HIPAA Compliance</h2>
                        <p>
                            As a healthcare technology platform, we are committed to compliance with the HIPAA Privacy Rule, Security Rule,
                            and Breach Notification Rule. We implement administrative, physical, and technical safeguards to protect the
                            confidentiality, integrity, and availability of PHI.
                        </p>
                        <p>
                            We maintain Business Associate Agreements (BAAs) with all third-party service providers who may access PHI
                            in the course of providing services to us.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-foreground mb-3">6. Data Security</h2>
                        <p>We employ industry-standard security measures including:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>TLS 1.3 encryption for all data in transit.</li>
                            <li>AES-256 encryption for data at rest.</li>
                            <li>Row Level Security (RLS) policies to ensure data isolation.</li>
                            <li>Multi-factor authentication for clinical staff access.</li>
                            <li>Comprehensive audit logging of all PHI access events.</li>
                            <li>Regular security assessments and vulnerability scanning.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-foreground mb-3">7. Data Retention</h2>
                        <p>
                            Medical records and PHI are retained for a minimum of {tenant.legal.hipaaRetentionYears} years from the date of
                            last treatment, in accordance with applicable state and federal regulations. You may request deletion of
                            non-medical personal data at any time by contacting our {tenant.legal.privacyOfficer}.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-foreground mb-3">8. Your Rights</h2>
                        <p>Under HIPAA and applicable state law, you have the right to:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Access and obtain a copy of your PHI.</li>
                            <li>Request amendments to your medical records.</li>
                            <li>Receive an accounting of disclosures of your PHI.</li>
                            <li>Request restrictions on certain uses and disclosures of your PHI.</li>
                            <li>Receive confidential communications regarding your health information.</li>
                            <li>File a complaint if you believe your privacy rights have been violated.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-foreground mb-3">9. Contact Information</h2>
                        <p>For questions or concerns about this Privacy Policy or our data practices, contact us at:</p>
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
