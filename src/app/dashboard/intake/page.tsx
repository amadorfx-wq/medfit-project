"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/lib/store";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import {
    WellnessIntakeForm,
    MedicalWeightLossForm,
    TestosteroneTherapyForm,
    PeptideTherapyForm,
    SemaglutideInstructionsForm,
    NfcHipaaForm
} from "./forms";

export default function IntakeFormsPage() {
    const router = useRouter();
    const { currentUser, patients, submitForm } = useAppContext();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Protection mapping
    if (!currentUser) return null;

    const currentPatient = patients.find(p => p.id === currentUser.id);
    if (!currentPatient) return null;

    // Filter which forms are still pending
    const pendingForms = currentPatient.requiredForms.filter(
        formId => !currentPatient.completedForms.includes(formId)
    );

    const handleFormComplete = (formId: string) => {
        setIsSubmitting(true);
        // Simulate network API delay for submitting secure forms
        setTimeout(() => {
            submitForm(formId);
            setIsSubmitting(false);
        }, 1500);
    };

    if (pendingForms.length === 0) {
        // All forms completed
        return (
            <div className="p-6 md:p-12 w-full max-w-2xl mx-auto flex flex-col items-center justify-center text-center min-h-[60vh] animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <h1 className="text-3xl font-serif mb-4">You&apos;re All Set</h1>
                <p className="text-muted-foreground mb-8">All required medical and consent forms for your current treatment protocol have been successfully completed and securely encrypted.</p>
                <button
                    onClick={() => router.push("/dashboard")}
                    className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    // Determine which form to show next
    const currentFormId = pendingForms[0];

    return (
        <div className="p-4 md:p-8 w-full min-h-screen flex flex-col items-center justify-start opacity-100 transition-opacity">
            <div className="mb-8 text-center max-w-xl mx-auto">
                <p className="text-primary text-sm uppercase tracking-widest mb-2 font-semibold">Secure Clinic Forms</p>
                <p className="text-sm text-muted-foreground">
                    Required Form {currentPatient.completedForms.length + 1} of {currentPatient.requiredForms.length}
                </p>
            </div>

            {currentFormId === "wellness-intake" && <WellnessIntakeForm onSubmit={() => handleFormComplete(currentFormId)} isSubmitting={isSubmitting} />}
            {currentFormId === "nfc-hipaa" && <NfcHipaaForm onSubmit={() => handleFormComplete(currentFormId)} isSubmitting={isSubmitting} />}
            {currentFormId === "medical-weight-loss" && <MedicalWeightLossForm onSubmit={() => handleFormComplete(currentFormId)} isSubmitting={isSubmitting} />}
            {currentFormId === "testosterone-therapy" && <TestosteroneTherapyForm onSubmit={() => handleFormComplete(currentFormId)} isSubmitting={isSubmitting} />}
            {currentFormId === "peptide-therapy" && <PeptideTherapyForm onSubmit={() => handleFormComplete(currentFormId)} isSubmitting={isSubmitting} />}
            {currentFormId === "semaglutide-instructions" && <SemaglutideInstructionsForm onSubmit={() => handleFormComplete(currentFormId)} isSubmitting={isSubmitting} />}
        </div>
    );
}
