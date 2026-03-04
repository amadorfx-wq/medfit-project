"use client";

import Link from "next/link";
import { tenant } from "@/lib/theme.config";
import { FileHeart, ArrowLeft } from "lucide-react";

export default function HipaaNoticePage() {
    const effectiveDate = "March 3, 2026";

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
                        <FileHeart className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-serif">Notice of Privacy Practices</h1>
                        <p className="text-xs text-muted-foreground mt-1">Effective Date: {effectiveDate}</p>
                    </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-8 text-sm">
                    <p className="font-medium text-primary">THIS NOTICE DESCRIBES HOW MEDICAL INFORMATION ABOUT YOU MAY BE USED AND DISCLOSED AND HOW YOU CAN GET ACCESS TO THIS INFORMATION. PLEASE REVIEW IT CAREFULLY.</p>
                </div>

                <div className="prose prose-invert max-w-none text-foreground/80 space-y-8 text-sm leading-relaxed">
                    <section>
                        <h2 className="text-lg font-serif text-foreground mb-3">Our Commitment to Your Privacy</h2>
                        <p>
                            {tenant.legalEntity} (&quot;{tenant.shortName}&quot;) is committed to protecting the privacy of your health information.
                            This Notice of Privacy Practices (&quot;Notice&quot;) applies to all protected health information (&quot;PHI&quot;)
                            maintained by {tenant.shortName}, including information created or received through our patient portal,
                            clinical operations, and electronic health records.
                        </p>
                        <p>
                            We are required by law to maintain the privacy of your PHI, provide you with this Notice of our legal duties
                            and privacy practices, and abide by the terms of the Notice currently in effect.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-foreground mb-3">How We May Use and Disclose Your PHI</h2>

                        <h3 className="text-sm font-semibold text-foreground/90 mt-4 mb-2">For Treatment</h3>
                        <p>We may use your PHI to provide, coordinate, or manage your medical treatment and related services. For example, your treating provider may access your lab results, prescription history, and clinical notes through our platform.</p>

                        <h3 className="text-sm font-semibold text-foreground/90 mt-4 mb-2">For Payment</h3>
                        <p>We may use and disclose your PHI to obtain payment for services provided to you. This includes submitting claims to insurance providers and creating billing records. Payment card information is processed exclusively by our PCI-DSS compliant payment processor.</p>

                        <h3 className="text-sm font-semibold text-foreground/90 mt-4 mb-2">For Healthcare Operations</h3>
                        <p>We may use your PHI in connection with our healthcare operations, including quality assessment, staff training, business management, and compliance activities.</p>

                        <h3 className="text-sm font-semibold text-foreground/90 mt-4 mb-2">As Required by Law</h3>
                        <p>We will disclose PHI when required to do so by federal, state, or local law, including for public health activities, reporting abuse or neglect, health oversight activities, and judicial or administrative proceedings.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-foreground mb-3">Your Rights Regarding Your PHI</h2>
                        <p>Under federal law, you have the following rights:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <strong className="text-foreground">Right to Inspect and Copy:</strong> You may request access to your medical records and obtain copies. We may charge a reasonable fee for copying costs.
                            </li>
                            <li>
                                <strong className="text-foreground">Right to Amend:</strong> You may request an amendment to your PHI if you believe it is inaccurate or incomplete. We may deny your request under certain circumstances, but we will provide a written explanation.
                            </li>
                            <li>
                                <strong className="text-foreground">Right to an Accounting of Disclosures:</strong> You may request a list of certain disclosures of your PHI that we have made, excluding disclosures for treatment, payment, healthcare operations, and certain other exceptions.
                            </li>
                            <li>
                                <strong className="text-foreground">Right to Request Restrictions:</strong> You may request restrictions on certain uses or disclosures of your PHI. We are not required to agree to a restriction, except where you pay for a service out-of-pocket in full and request that we not disclose the PHI to a health plan.
                            </li>
                            <li>
                                <strong className="text-foreground">Right to Request Confidential Communications:</strong> You may request that we communicate with you through a particular method or at a particular location.
                            </li>
                            <li>
                                <strong className="text-foreground">Right to a Paper Copy:</strong> You may request a paper copy of this Notice at any time.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-foreground mb-3">Our Duties</h2>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>We are required to maintain the privacy and security of your PHI.</li>
                            <li>We are required to notify you if a breach of your unsecured PHI occurs.</li>
                            <li>We must follow the duties and privacy practices described in this Notice.</li>
                            <li>We will not use or disclose your PHI without your written authorization, except as described in this Notice.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-foreground mb-3">Changes to This Notice</h2>
                        <p>
                            We reserve the right to change this Notice and to make the revised Notice effective for PHI we already have
                            about you as well as any information we receive in the future. The current Notice will be posted on our
                            patient portal and available at our office. You may request a copy of the current Notice at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-foreground mb-3">Complaints</h2>
                        <p>
                            If you believe your privacy rights have been violated, you may file a complaint with us or with the
                            Secretary of the U.S. Department of Health and Human Services. We will not retaliate against you for
                            filing a complaint.
                        </p>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10 mt-3 space-y-2">
                            <div>
                                <p className="font-medium text-foreground">File a Complaint with {tenant.shortName}:</p>
                                <p>{tenant.legal.privacyOfficer}, {tenant.legalEntity}</p>
                                <p>{tenant.address.full}</p>
                                <p>Email: {tenant.email} | Phone: {tenant.phone}</p>
                            </div>
                            <div className="border-t border-white/10 pt-2">
                                <p className="font-medium text-foreground">File a Complaint with HHS:</p>
                                <p>U.S. Department of Health and Human Services</p>
                                <p>Office for Civil Rights</p>
                                <p>Website: hhs.gov/ocr/privacy/hipaa/complaints</p>
                            </div>
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
