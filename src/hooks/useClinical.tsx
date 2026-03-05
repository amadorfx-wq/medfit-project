"use client";

import { useCallback } from "react";
import { usePatients } from "@/hooks/usePatients";
import { ClinicalService } from "@/services/clinical.service";
import { ConsentSignature } from "@/types/clinical";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

import { useAudit } from "@/hooks/useAudit";

export const useClinical = () => {
    const { patients, updatePatient } = usePatients();
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
     * Medical Director overriding authority to approve a file for payment.
     */
    const authorizeTreatment = useCallback(async (patientId: string, amount: number, description: string) => {
        await updatePatient(patientId, { approvalStatus: "PENDING_PAYMENT" });
    }, [updatePatient]);

    /**
     * Fulfillment logic to dispatch prescription to patient.
     */
    const markAsShipped = useCallback(async (patientId: string) => {
        const patient = patients.find(p => p.id === patientId);
        if (!patient) return;

        await updatePatient(patientId, { approvalStatus: "APPROVED" });

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
