"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { tenant } from "@/lib/theme.config";
import { Button } from "@/components/ui/button";
import { ShieldCheck, FileSignature, ArrowRight, CheckCircle2 } from "lucide-react";

export default function StaffOnboardingPage() {
    const { currentUser, signNDA } = useAuth();
    const [hasRead, setHasRead] = useState(false);
    const [isSigning, setIsSigning] = useState(false);
    const [signed, setSigned] = useState(false);

    const handleSign = async () => {
        setIsSigning(true);
        await signNDA();
        setSigned(true);
        setIsSigning(false);

        // Let the layout's inline rendering handle the transition automatically 
        // once the AuthContext updates `currentUser.ndaSignedAt`.
        // Remove forced window.location override to prevent loop.
    };

    return (
        <div className="min-h-screen bg-[#0A0F17] flex items-center justify-center p-6">
            <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-700">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-serif text-white mb-2">Confidentiality Agreement</h1>
                    <p className="text-white/50 text-sm max-w-md mx-auto">
                        Before accessing patient data, all {tenant.name} clinical staff must acknowledge and sign this
                        Data Handling & Non-Disclosure Agreement.
                    </p>
                </div>

                {/* Contract Document */}
                <div className="bg-[#0C1420] border border-white/10 rounded-2xl p-6 md:p-8 mb-8">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                        <FileSignature className="w-5 h-5 text-[#B8977E]" />
                        <h2 className="font-serif text-white">Non-Disclosure & Data Handling Agreement</h2>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto pr-4 space-y-5 text-sm text-white/70 leading-relaxed scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        <p className="text-white/90 font-medium">
                            This Non-Disclosure and Data Handling Agreement (&quot;Agreement&quot;) is entered into between
                            {" "}{tenant.legalEntity} (&quot;Company&quot;) and the undersigned clinical staff member (&quot;Staff Member&quot;).
                        </p>

                        <section>
                            <h3 className="text-white font-medium mb-2">1. Confidentiality Obligations</h3>
                            <p>Staff Member agrees to maintain the strictest confidentiality of all patient Protected Health
                                Information (PHI) as defined under the Health Insurance Portability and Accountability Act of 1996
                                (HIPAA), including but not limited to: patient names, contact information, medical histories,
                                treatment plans, laboratory results, prescriptions, financial records, and electronic signatures.</p>
                        </section>

                        <section>
                            <h3 className="text-white font-medium mb-2">2. Permitted Use of PHI</h3>
                            <p>Staff Member may access, use, or disclose PHI only as necessary to perform their assigned clinical
                                duties and only for purposes of Treatment, Payment, or Healthcare Operations (TPO) as defined by HIPAA.
                                Any access beyond what is required for the Staff Member&apos;s role is strictly prohibited.</p>
                        </section>

                        <section>
                            <h3 className="text-white font-medium mb-2">3. Prohibited Activities</h3>
                            <p>Staff Member shall NOT:</p>
                            <ul className="list-disc pl-6 space-y-1 mt-2">
                                <li>Share, copy, print, photograph, or otherwise reproduce PHI outside of authorized clinical systems.</li>
                                <li>Access patient records of individuals not under their direct care.</li>
                                <li>Discuss patient information in public areas, on social media, or with unauthorized persons.</li>
                                <li>Use personal devices to store or transmit PHI unless authorized by the Company&apos;s HIPAA Security Officer.</li>
                                <li>Retain any PHI after termination of employment or contract.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-white font-medium mb-2">4. Data Security Responsibilities</h3>
                            <p>Staff Member agrees to: use strong, unique passwords for all clinical systems; never share login
                                credentials; immediately report any suspected data breach or unauthorized access to the {tenant.legal.privacyOfficer};
                                and lock workstations when unattended.</p>
                        </section>

                        <section>
                            <h3 className="text-white font-medium mb-2">5. Breach Consequences</h3>
                            <p>Violation of this Agreement may result in immediate termination of employment, civil liability under
                                HIPAA (fines up to $250,000 per violation category), and potential criminal prosecution under 42 U.S.C.
                                § 1320d-6, including imprisonment for up to 10 years for violations committed with intent to sell,
                                transfer, or use PHI for commercial advantage or malicious harm.</p>
                        </section>

                        <section>
                            <h3 className="text-white font-medium mb-2">6. Duration</h3>
                            <p>This Agreement remains in effect during the Staff Member&apos;s employment or contractual relationship
                                with the Company and for a period of five (5) years following its termination.</p>
                        </section>

                        <section>
                            <h3 className="text-white font-medium mb-2">7. Electronic Acceptance</h3>
                            <p>By clicking &quot;I Agree & Sign&quot; below, Staff Member acknowledges that this electronic signature
                                carries the same legal weight as a handwritten signature pursuant to the E-SIGN Act (15 U.S.C. § 7001)
                                and the Uniform Electronic Transactions Act (UETA). The timestamp and IP address of this signature
                                will be recorded for audit and legal compliance purposes.</p>
                        </section>
                    </div>
                </div>

                {/* Acceptance */}
                {!signed ? (
                    <div className="space-y-5 animate-in fade-in duration-300">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={hasRead}
                                onChange={(e) => setHasRead(e.target.checked)}
                                className="mt-1 w-5 h-5 accent-[#8FA677] rounded"
                            />
                            <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">
                                I, <strong className="text-white">{currentUser?.name || "Staff Member"}</strong>,
                                have read, understood, and agree to all terms of this Non-Disclosure & Data Handling Agreement.
                                I understand that violations may result in termination and legal action.
                            </span>
                        </label>

                        <Button
                            onClick={handleSign}
                            disabled={!hasRead || isSigning}
                            className="w-full h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-md shadow-[0_0_20px_rgba(143,166,119,0.3)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            {isSigning ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                                    Recording Signature...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <FileSignature className="w-5 h-5" />
                                    I Agree & Sign This Agreement
                                    <ArrowRight className="w-4 h-4" />
                                </span>
                            )}
                        </Button>
                    </div>
                ) : (
                    <div className="text-center animate-in fade-in zoom-in-95 duration-500 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-serif text-white">Agreement Signed Successfully</h3>
                        <p className="text-sm text-white/50">Redirecting to Clinical Hub...</p>
                    </div>
                )}

                <p className="text-center text-xs text-white/30 mt-8">{tenant.legal.copyright}</p>
            </div>
        </div>
    );
}
