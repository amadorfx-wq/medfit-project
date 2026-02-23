"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, FileText, CheckCircle2, AlertCircle } from "lucide-react";

interface FormProps {
    onSubmit: () => void;
    isSubmitting: boolean;
}

// Light Luxury Theme Wrapper
const FormLayout = ({ title, subtitle, step, totalSteps, children, icon: Icon = FileText }: any) => (
    <div className="bg-[#F9F7F2] text-[#2D2D2D] p-6 md:p-12 rounded-3xl shadow-sm border border-[#E5E5E5] w-full max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-500">
        <header className="mb-8 border-b border-[#E5E5E5] pb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[#8FA677]">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-xs font-semibold tracking-widest uppercase">Secure Form</span>
                </div>
                {totalSteps > 0 && (
                    <div className="text-xs font-medium text-[#2D2D2D]/60 tracking-wider">
                        STEP {step} OF {totalSteps}
                    </div>
                )}
            </div>
            <h1 className="text-3xl md:text-4xl font-serif text-[#1A1A1A] mb-2">{title}</h1>
            <p className="text-[#2D2D2D]/70 text-sm">{subtitle}</p>
        </header>

        {totalSteps > 1 && (
            <div className="flex gap-2 mb-8">
                {Array.from({ length: totalSteps }).map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < step ? 'bg-[#8FA677]' : 'bg-[#E5E5E5]'}`} />
                ))}
            </div>
        )}

        {children}
    </div>
);

// Form 1: Wellness Intake (Global)
export function WellnessIntakeForm({ onSubmit, isSubmitting }: FormProps) {
    const [step, setStep] = useState(1);
    const [signature, setSignature] = useState("");

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
    };

    const handleFinalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    const inputClasses = "border-0 border-b border-[#E5E5E5] bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-[#8FA677] px-0 h-12 text-[#1A1A1A]";
    const labelClasses = "text-xs font-semibold text-[#2D2D2D]/60 uppercase tracking-wider";

    if (step === 1) {
        return (
            <FormLayout title="Wellness Intake Profile" subtitle="Please provide your foundational health details to begin your journey." step={1} totalSteps={2}>
                <form onSubmit={handleNext} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <Label className={labelClasses}>Date of Birth</Label>
                            <Input type="date" required className={inputClasses} />
                        </div>
                        <div className="space-y-2">
                            <Label className={labelClasses}>Phone Number</Label>
                            <Input type="tel" placeholder="(555) 000-0000" required className={inputClasses} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className={labelClasses}>Full Address</Label>
                        <Input placeholder="Current living address" required className={inputClasses} />
                    </div>
                    <div className="space-y-2">
                        <Label className={labelClasses}>Primary Health Goal</Label>
                        <Input placeholder="e.g., Weight loss, hormone balance, energy..." required className={inputClasses} />
                    </div>
                    <div className="pt-4">
                        <Button type="submit" className="w-full h-14 rounded-2xl bg-[#8FA677] hover:bg-[#7D9365] text-white text-base font-medium transition-all shadow-md hover:shadow-lg">
                            Continue to Medical History
                        </Button>
                    </div>
                </form>
            </FormLayout>
        );
    }

    return (
        <FormLayout title="Medical History & Consent" subtitle="Review and confirm your medical disclosures." step={2} totalSteps={2}>
            <form onSubmit={handleFinalSubmit} className="space-y-8 animate-in slide-in-from-right-8">
                <div className="space-y-2">
                    <Label className={labelClasses}>Current Medications & Supplements</Label>
                    <textarea required className="w-full min-h-[100px] p-4 rounded-2xl bg-white border border-[#E5E5E5] text-sm focus:outline-none focus:border-[#8FA677] resize-none text-[#1A1A1A]" placeholder="List any prescriptions..." />
                </div>
                <div className="space-y-2">
                    <Label className={labelClasses}>Known Allergies</Label>
                    <textarea required className="w-full min-h-[80px] p-4 rounded-2xl bg-white border border-[#E5E5E5] text-sm focus:outline-none focus:border-[#8FA677] resize-none text-[#1A1A1A]" placeholder="List any medication or food allergies..." />
                </div>

                <div className="bg-[#8FA677]/10 p-5 rounded-2xl flex gap-4 mt-6">
                    <AlertCircle className="w-5 h-5 text-[#8FA677] shrink-0 mt-0.5" />
                    <div className="text-sm text-[#2D2D2D]/80 leading-relaxed">
                        <p className="font-medium text-[#1A1A1A] mb-1">General Consent for Treatment</p>
                        I acknowledge that the medical information provided is accurate. I authorize the clinical team at MedFit America to evaluate my health profile for potential treatment protocols.
                    </div>
                </div>

                <div className="space-y-2 pt-4">
                    <Label className={labelClasses}>Electronic Signature</Label>
                    <Input required value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="Type your full legal name" className={`${inputClasses} font-serif italic text-lg px-2`} />
                </div>

                <div className="flex gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 h-14 rounded-2xl border-[#E5E5E5] text-[#2D2D2D] hover:bg-white hover:text-[#1A1A1A]">
                        Back
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="flex-[2] h-14 rounded-2xl bg-[#8FA677] hover:bg-[#7D9365] text-white font-medium shadow-md">
                        {isSubmitting ? "Submitting..." : "Sign & Complete Profile"}
                    </Button>
                </div>
            </form>
        </FormLayout>
    );
}

// Form 2: NFC HIPAA
export function NfcHipaaForm({ onSubmit, isSubmitting }: FormProps) {
    const [signature, setSignature] = useState("");
    const inputClasses = "border-0 border-b border-[#E5E5E5] bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-[#8FA677] px-0 h-10 text-[#1A1A1A]";

    return (
        <FormLayout title="HIPAA Authorization" subtitle="Notice of Privacy Practices for NFC Lab Services." step={1} totalSteps={1}>
            <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-8">
                <div className="prose prose-sm text-[#2D2D2D]/80 leading-relaxed max-w-none mb-8 bg-white p-6 rounded-2xl border border-[#E5E5E5]">
                    <p>This form authorizes MedFit America and its affiliated NFC Lab partners to use and disclose your Protected Health Information (PHI) for the purposes of treatment, payment, and healthcare operations.</p>
                    <p>By signing below, you acknowledge that you have received and read our Notice of Privacy Practices, which provides detailed information about how we may use and disclose your PHI.</p>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-semibold text-[#2D2D2D]/60 uppercase tracking-wider">Patient Signature</Label>
                    <Input required value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="Type your full legal name" className={`${inputClasses} font-serif italic text-lg`} />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl bg-[#8FA677] hover:bg-[#7D9365] text-white font-medium shadow-md">
                    {isSubmitting ? "Authorizing..." : "I Agree & Authorize"}
                </Button>
            </form>
        </FormLayout>
    );
}

// Form 3: Medical Weight Loss
export function MedicalWeightLossForm({ onSubmit, isSubmitting }: FormProps) {
    const [signature, setSignature] = useState("");
    return (
        <FormLayout title="Medical Weight Loss Consent" subtitle="Informed consent for our comprehensive weight loss program." step={1} totalSteps={1}>
            <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-8">
                <div className="text-sm text-[#2D2D2D]/80 leading-relaxed bg-white p-6 rounded-2xl border border-[#E5E5E5] space-y-4">
                    <p>I understand that medical weight loss treatments involve customized plans that may include prescription medications, dietary changes, and lifestyle modifications.</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>I agree to follow the prescribed protocol and report any adverse effects immediately.</li>
                        <li>I understand that results vary and are not guaranteed.</li>
                        <li>I have fully disclosed my medical history, including cardiovascular issues or eating disorders.</li>
                    </ul>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-semibold text-[#2D2D2D]/60 uppercase tracking-wider">Signature</Label>
                    <Input required value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="Type your full legal name" className="border-0 border-b border-[#E5E5E5] bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-[#8FA677] px-0 h-10 text-[#1A1A1A] font-serif italic text-lg" />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl bg-[#8FA677] hover:bg-[#7D9365] text-white font-medium shadow-md">
                    {isSubmitting ? "Processing..." : "Sign Consent"}
                </Button>
            </form>
        </FormLayout>
    );
}

// Form 4: Testosterone Therapy
export function TestosteroneTherapyForm({ onSubmit, isSubmitting }: FormProps) {
    const [signature, setSignature] = useState("");
    return (
        <FormLayout title="Testosterone Replacement Therapy (TRT)" subtitle="Consent and acknowledgment of risks and benefits." step={1} totalSteps={1}>
            <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-8">
                <div className="text-sm text-[#2D2D2D]/80 leading-relaxed bg-white p-6 rounded-2xl border border-[#E5E5E5] space-y-4">
                    <p>TRT is indicated for the treatment of hypogonadism. I understand that this therapy carries potential benefits and risks, which have been explained to me by a medical provider.</p>
                    <p className="font-medium text-[#1A1A1A]">Potential Risks include but are not limited to:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Polycythemia (thickened blood)</li>
                        <li>Changes in cholesterol levels</li>
                        <li>Prostate enlargement or exacerbation of prostate conditions</li>
                        <li>Infertility or reduced sperm count</li>
                    </ul>
                    <p>I consent to routine baseline and follow-up blood work to monitor my health during therapy.</p>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-semibold text-[#2D2D2D]/60 uppercase tracking-wider">Patient Acknowledgment</Label>
                    <Input required value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="Type your full legal name" className="border-0 border-b border-[#E5E5E5] bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-[#8FA677] px-0 h-10 text-[#1A1A1A] font-serif italic text-lg" />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl bg-[#8FA677] hover:bg-[#7D9365] text-white font-medium shadow-md">
                    {isSubmitting ? "Processing..." : "I Acknowledge & Consent"}
                </Button>
            </form>
        </FormLayout>
    );
}

// Form 5: Peptide Therapy
export function PeptideTherapyForm({ onSubmit, isSubmitting }: FormProps) {
    const [signature, setSignature] = useState("");
    return (
        <FormLayout title="Peptide Therapy Consent" subtitle="Information regarding experimental and supportive peptide protocols." step={1} totalSteps={1}>
            <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-8">
                <div className="text-sm text-[#2D2D2D]/80 leading-relaxed bg-white p-6 rounded-2xl border border-[#E5E5E5] space-y-4">
                    <p>Peptide therapy involves the use of specific amino acid sequences to signal cellular functions. Many peptides are considered "off-label" or for research purposes, though they have strong safety profiles in clinical environments.</p>
                    <p>I understand the specific peptide protocol prescribed to me, its intended uses (e.g., recovery, longevity, immune support), and the correct administration technique.</p>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-semibold text-[#2D2D2D]/60 uppercase tracking-wider">Signature</Label>
                    <Input required value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="Type your full legal name" className="border-0 border-b border-[#E5E5E5] bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-[#8FA677] px-0 h-10 text-[#1A1A1A] font-serif italic text-lg" />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl bg-[#8FA677] hover:bg-[#7D9365] text-white font-medium shadow-md">
                    {isSubmitting ? "Processing..." : "Sign Consent"}
                </Button>
            </form>
        </FormLayout>
    );
}

// Form 6: Semaglutide
export function SemaglutideInstructionsForm({ onSubmit, isSubmitting }: FormProps) {
    const [step, setStep] = useState(1);
    const [signature, setSignature] = useState("");

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
    };

    if (step === 1) {
        return (
            <FormLayout title="Semaglutide / Tirzepatide Instructions" subtitle="Self-Administration Guidelines & Protocol" step={1} totalSteps={2}>
                <form onSubmit={handleNext} className="space-y-6">
                    <div className="text-sm text-[#2D2D2D]/80 leading-relaxed bg-white p-6 rounded-2xl border border-[#E5E5E5] space-y-4">
                        <h3 className="font-serif text-lg text-[#1A1A1A]">Subcutaneous Injection Protocol</h3>
                        <ol className="list-decimal pl-5 space-y-3">
                            <li><strong>Preparation:</strong> Wash hands thoroughly. Clean the injection site (abdomen, thigh, or back of arm) with an alcohol swab and let it dry.</li>
                            <li><strong>Dosing:</strong> Always refer to your personalized dosing schedule. Do not increase dosage without medical instruction.</li>
                            <li><strong>Injection:</strong> Pinch the skin, insert the needle at a 45 to 90-degree angle, and inject slowly.</li>
                            <li><strong>Disposal:</strong> Dispose of needles safely in a sharps container immediately after use.</li>
                        </ol>
                        <div className="bg-[#E5E5E5]/50 p-4 rounded-xl mt-4">
                            <p className="font-medium text-[#1A1A1A]">Important side effects to monitor:</p>
                            <p className="text-xs mt-1">Nausea, mild diarrhea, or constipation are common initially. Report any severe abdominal pain immediately.</p>
                        </div>
                    </div>
                    <Button type="submit" className="w-full h-14 rounded-2xl bg-[#8FA677] hover:bg-[#7D9365] text-white font-medium shadow-md">
                        I Have Read the Instructions
                    </Button>
                </form>
            </FormLayout>
        );
    }

    return (
        <FormLayout title="GLP-1 Consent to Treat" subtitle="Acknowledge your understanding of the treatment protocol." step={2} totalSteps={2}>
            <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-8 animate-in slide-in-from-right-8">
                <div className="text-sm text-[#2D2D2D]/80 leading-relaxed bg-white p-6 rounded-2xl border border-[#E5E5E5] space-y-4">
                    <p>By signing below, I confirm that I have read the self-administration instructions for Semaglutide/Tirzepatide. I understand how to safely store, handle, and inject the medication.</p>
                    <p>I agree to adhere to the titration schedule and will not exceed the prescribed dose.</p>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-semibold text-[#2D2D2D]/60 uppercase tracking-wider">Patient Signature</Label>
                    <Input required value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="Type your full legal name" className="border-0 border-b border-[#E5E5E5] bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-[#8FA677] px-0 h-10 text-[#1A1A1A] font-serif italic text-lg" />
                </div>
                <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 h-14 rounded-2xl border-[#E5E5E5] text-[#2D2D2D] hover:bg-white hover:text-[#1A1A1A]">
                        Back
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="flex-[2] h-14 rounded-2xl bg-[#8FA677] hover:bg-[#7D9365] text-white font-medium shadow-md">
                        {isSubmitting ? "Finalizing..." : "Accept & Sign"}
                    </Button>
                </div>
            </form>
        </FormLayout>
    );
}
