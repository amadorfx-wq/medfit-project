"use client";

import { useCallback } from "react";
import { usePatients } from "@/hooks/usePatients";
import { useBilling } from "@/hooks/useBilling";
import { ClinicalService } from "@/services/clinical.service";
import { NotificationService } from "@/services/notification.service";
import { ConsentSignature } from "@/types/clinical";
import { toast } from "sonner";
import { useAudit } from "@/hooks/useAudit";
import { getTenantIdFromBrowser } from "@/lib/supabase";

export const useClinical = () => {
    const { patients, updatePatient } = usePatients();
    const { addCharge } = useBilling();
    const { logEvent } = useAudit();

    /**
     * Enrolls a patient into a new clinical protocol/treatment.
     */
    const enrollTreatment = useCallback(async (patientId: string, treatment: string) => {
        const patient = patients.find(p => p.id === patientId);
        if (!patient) return;

        const updates = ClinicalService.calculateTreatmentEnrollment(patient, treatment);
        await updatePatient(patientId, updates);

        logEvent("TREATMENT_ENROLLED", `Patient ${patientId} enrolled in ${treatment}`);
    }, [patients, updatePatient, logEvent]);

    /**
     * Completes a required HIPAA/Clinical intake form.
     */
    const submitForm = useCallback(async (patientId: string, formId: string) => {
        const patient = patients.find(p => p.id === patientId);
        if (!patient) return;

        const updates = ClinicalService.calculateFormSubmission(patient, formId);
        await updatePatient(patientId, updates);

        logEvent("FORM_SUBMITTED", `Patient completed form: ${formId}`, "CLINICAL", "form", formId);
    }, [patients, updatePatient, logEvent]);

    /**
     * Dynamically adds a custom form requirement to a patient's queue.
     */
    const addRequiredFormToPatient = useCallback(async (patientId: string, formSlug: string) => {
        const patient = patients.find(p => p.id === patientId);
        if (!patient) return;

        const updates = ClinicalService.calculateRequiredFormAddition(patient, formSlug);
        if (!updates) return; // Already required

        await updatePatient(patientId, updates);
    }, [patients, updatePatient]);

    /**
     * Safely persists a cryptographic signature and form payload into the secure vault.
     */
    const saveConsentForm = useCallback(async (patientId: string, formSlug: string, formData: Record<string, any>, signature: ConsentSignature) => {
        try {
            await ClinicalService.saveConsentForm(patientId, formSlug, formData, signature, undefined);
        } catch (error) {
            toast.error("Failed to save HIPAA consent form.");
            throw error;
        }
    }, []);

    /**
     * Medical Director authorizes treatment → creates charge + notifies patient.
     * This is the CRITICAL wiring point between admin approval and patient billing.
     */
    const authorizeTreatment = useCallback(async (patientId: string, amount: number, description: string) => {
        const patient = patients.find(p => p.id === patientId);
        if (!patient) return;

        // 1. Update patient approval status
        await updatePatient(patientId, { approvalStatus: "PENDING_PAYMENT" });

        // 2. CREATE the charge in the billing system (THE MISSING LINK)
        await addCharge({
            patientId,
            amount,
            description,
        });

        // 3. Notify the patient in real-time
        await NotificationService.notifyPatient({
            patient_id: patientId,
            type: "PAYMENT_REQUIRED",
            title: "Payment Required",
            message: `Your ${description} treatment has been approved! A payment of $${amount.toFixed(2)} is required to proceed.`,
            data: { amount, description },
        });

        logEvent("TREATMENT_AUTHORIZED", `Treatment authorized for ${patient.name}: $${amount} — ${description}`);
    }, [patients, updatePatient, addCharge, logEvent]);

    /**
     * Fulfillment: dispatch prescription to patient.
     */
    const markAsShipped = useCallback(async (patientId: string) => {
        const patient = patients.find(p => p.id === patientId);
        if (!patient) return;

        await updatePatient(patientId, { approvalStatus: "APPROVED" });

        // Notify patient that their medication has shipped
        await NotificationService.notifyPatient({
            patient_id: patientId,
            type: "SHIPMENT_DISPATCHED",
            title: "Your Medication Has Shipped! 🚚",
            message: `Your ${patient.activeTreatment} protocol medications are on their way. You will receive tracking information shortly.`,
            data: { treatment: patient.activeTreatment },
        });

        logEvent("MEDICATION_SHIPPED", `Medications shipped for ${patient.name}`);
        toast.success("Case Closed & Shipped", {
            description: `Tracking info has been sent to ${patient.name}.`,
        });
    }, [patients, updatePatient, logEvent]);

    return {
        enrollTreatment,
        submitForm,
        addRequiredFormToPatient,
        saveConsentForm,
        authorizeTreatment,
        markAsShipped
    };
};
