"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

export function LeadIntakeForm() {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    // Form data state
    const [formData, setFormData] = useState({
        goal: "",
        age: "",
        challenges: "",
        name: "",
        email: "",
        phone: ""
    });

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate secure API transmission
        setTimeout(() => {
            setIsSubmitting(false);
            setIsComplete(true);
        }, 1500);
    };

    if (isComplete) {
        return (
            <Card className="bg-card border-border/50 text-center p-8 md:p-12 animate-in fade-in zoom-in-95 duration-500">
                <CardContent className="space-y-4 flex flex-col items-center p-0">
                    <div className="w-20 h-20 rounded-full bg-[#8FA677]/20 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-10 h-10 text-[#8FA677]" />
                    </div>
                    <h3 className="font-serif text-3xl mb-2">Request Received</h3>
                    <p className="text-muted-foreground text-lg max-w-md mx-auto">
                        Your confidential profile has been encrypted and submitted to our clinical team. A dedicated concierge will reach out via email shortly to schedule your initial consultation.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-card border-border/50 text-left p-6 md:p-12 relative overflow-hidden">
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                <div
                    className="h-full bg-primary transition-all duration-500 ease-in-out"
                    style={{ width: `${(step / 3) * 100}%` }}
                />
            </div>

            <CardContent className="p-0">
                <div className="mb-8 flex justify-between items-center">
                    <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                        Step {step} of 3
                    </span>
                    {step > 1 && (
                        <button onClick={handleBack} className="text-xs text-muted-foreground hover:text-white transition-colors">
                            ← Back
                        </button>
                    )}
                </div>

                <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-8 animate-in slide-in-from-right-8 duration-500" key={step}>

                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-2xl font-serif mb-2">What is your primary clinical goal?</h3>
                                <p className="text-muted-foreground text-sm">Select the core area you wish to optimize.</p>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {["Medical Weight Loss", "Hormonal Balance (TRT)", "Peptide & Longevity", "General Preventive Health"].map((goal) => (
                                    <div
                                        key={goal}
                                        onClick={() => { setFormData({ ...formData, goal }); handleNext(); }}
                                        className={`border rounded-xl p-5 text-center cursor-pointer transition-all ${formData.goal === goal ? "border-primary bg-primary/10 text-white" : "border-border/50 bg-white/5 hover:border-primary/50 text-muted-foreground"
                                            }`}
                                    >
                                        <span className="text-sm font-medium">{goal}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-2xl font-serif mb-2">Clinical Context</h3>
                                <p className="text-muted-foreground text-sm">Help our medical team understand your baseline.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Age Range</Label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {["20-30", "31-40", "41-55", "55+"].map(age => (
                                            <div
                                                key={age}
                                                onClick={() => setFormData({ ...formData, age })}
                                                className={`border rounded-lg p-2 text-center text-xs tracking-wider cursor-pointer transition-all ${formData.age === age ? "border-primary bg-primary/10 text-white" : "border-border/50 bg-white/5 text-muted-foreground hover:border-white/20"
                                                    }`}
                                            >
                                                {age}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2 mt-6">
                                    <Label htmlFor="challenges" className="text-muted-foreground">Current Challenges (Optional)</Label>
                                    <Input
                                        id="challenges"
                                        placeholder="e.g., low energy, stubborn fat, poor sleep..."
                                        className="bg-background/50 border-white/10 focus-visible:ring-primary h-12"
                                        value={formData.challenges}
                                        onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button type="button" onClick={handleNext} disabled={!formData.age} className="w-full rounded-xl h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium flex items-center justify-center gap-2">
                                    Continue to Contact Info <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-2xl font-serif mb-2">Secure Contact File</h3>
                                <p className="text-muted-foreground text-sm">Where should our concierge team reach you?</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-white/80">Full Legal Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Sarah Johnson"
                                        className="bg-background/50 border-white/10 focus-visible:ring-primary h-12"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-white/80">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="sarah@example.com"
                                            className="bg-background/50 border-white/10 focus-visible:ring-primary h-12"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-white/80">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="+1 (555) 000-0000"
                                            className="bg-background/50 border-white/10 focus-visible:ring-primary h-12"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button type="submit" disabled={isSubmitting || !formData.name || !formData.email} className="w-full rounded-xl h-14 text-lg bg-[#8FA677] hover:bg-[#7D9365] text-white font-medium shadow-[0_0_15px_rgba(143,166,119,0.3)] flex justify-center items-center">
                                    {isSubmitting ? "Encrypting & Sending..." : "Request Clinical Evaluation"}
                                </Button>
                                <p className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center gap-1.5 opacity-70">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Your information is 100% private and protected under HIPAA.
                                </p>
                            </div>
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
