"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, FileText, CheckCircle2, AlertCircle } from "lucide-react";

export default function IntakeFormsPage() {
    const router = useRouter();
    const { currentUser, submitIntakeForms } = useAppContext();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Simulate form steps
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        dob: "",
        phone: "",
        address: "",
        medications: "",
        allergies: "",
        signature: ""
    });

    if (!currentUser) return null;

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
    };

    const handleFinalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate network API delay for submitting secure forms
        setTimeout(() => {
            submitIntakeForms();
            setIsSubmitting(false);
            router.push("/dashboard");
        }, 2000);
    };

    return (
        <div className="p-6 md:p-12 max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-10 border-b border-border/50 pb-6">
                <div className="flex items-center gap-3 text-primary mb-4">
                    <ShieldCheck className="w-6 h-6" />
                    <span className="text-sm font-medium tracking-wide uppercase">Secure Intake</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-serif mb-2">Patient Registration Forms</h1>
                <p className="text-muted-foreground">Please complete your HIPAA-compliant medical history and consent forms before your evaluation.</p>
            </header>

            <div className="flex gap-2 mb-8">
                <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-white/10'}`} />
                <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-white/10'}`} />
            </div>

            <Card className="bg-card border-border/50">
                <CardHeader>
                    <CardTitle className="font-serif text-xl flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        {step === 1 ? "Step 1: Patient Information" : "Step 2: Medical History & Consent"}
                    </CardTitle>
                    <CardDescription>
                        All information is encrypted and stored securely following HIPAA guidelines.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 1 ? (
                        <form onSubmit={handleNext} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="dob">Date of Birth</Label>
                                    <Input
                                        id="dob"
                                        type="date"
                                        value={formData.dob}
                                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                        required
                                        className="bg-white/5 border-white/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="(555) 000-0000"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                        className="bg-white/5 border-white/10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Full Address</Label>
                                <Input
                                    id="address"
                                    placeholder="123 Luxury Ave, Atlanta, GA 30305"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    required
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            <Button type="submit" className="w-full h-12 rounded-xl mt-6">Continue to Medical History</Button>
                        </form>
                    ) : (
                        <form onSubmit={handleFinalSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="space-y-2">
                                <Label htmlFor="medications">Current Medications & Supplements</Label>
                                <textarea
                                    id="medications"
                                    placeholder="List any prescriptions, over-the-counter meds, or supplements..."
                                    value={formData.medications}
                                    onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                                    className="w-full min-h-[100px] p-3 rounded-md bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="allergies">Known Allergies</Label>
                                <textarea
                                    id="allergies"
                                    placeholder="List any medication or food allergies..."
                                    value={formData.allergies}
                                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                                    className="w-full min-h-[100px] p-3 rounded-md bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    required
                                />
                            </div>

                            <Separator className="bg-border/50 my-6" />

                            <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex gap-3">
                                <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <div className="text-sm text-foreground/80 space-y-2">
                                    <p className="font-medium text-foreground">Informed Consent for Treatment</p>
                                    <p>By signing below, I acknowledge that the medical information provided is accurate. I authorize the clinical team at MedFit America to evaluate my health profile for potential treatment protocols including Hormone Therapy, Peptides, or Medical Weight Loss.</p>
                                </div>
                            </div>

                            <div className="space-y-2 pt-4">
                                <Label htmlFor="signature">Electronic Digital Signature</Label>
                                <Input
                                    id="signature"
                                    placeholder="Type your full legal name to sign"
                                    value={formData.signature}
                                    onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
                                    required
                                    className="bg-white/5 border-white/10 font-serif italic text-lg h-12"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 h-12 rounded-xl border-border/50 hover:bg-white/5">
                                    Back
                                </Button>
                                <Button type="submit" disabled={isSubmitting} className="flex-[2] h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground">
                                    {isSubmitting ? "Encrypting & Submitting..." : "Submit Secure Forms"}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
