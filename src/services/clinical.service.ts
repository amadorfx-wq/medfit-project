// src/services/clinical.service.ts
import { supabase } from '@/lib/supabase';
import { Patient } from '@/types/patient';
import { ConsentSignature, ConsentFormInsertDTO, ClinicalPatientUpdate } from '@/types/clinical';

/**
 * Capa de Servicios: ClinicalService
 * Responsabilidad exclusiva: Lógica de negocio médica, enrutamiento de formularios HIPAA
 * integraciones de firma electrónica y autorizaciones de tratamiento de pacientes.
 */
export class ClinicalService {

    /**
     * Calcula los formularios requeridos según el string de tratamiento.
     */
    static getRequiredFormsForTreatment(treatment: string): string[] {
        const defaultForms = ["wellness-intake"];
        const t = treatment.toLowerCase();

        if (t.includes("weight loss")) return [...defaultForms, "medical-weight-loss", "semaglutide-instructions"];
        if (t.includes("testosterone") || t.includes("trt")) return [...defaultForms, "testosterone-therapy"];
        if (t.includes("peptide")) return [...defaultForms, "peptide-therapy"];
        if (t.includes("semaglutide") || t.includes("tirzepatide")) return [...defaultForms, "semaglutide-instructions"];
        if (t.includes("nfc")) return [...defaultForms, "nfc-hipaa"];

        return defaultForms;
    }

    /**
     * Guarda el consentimiento firmado como PHI.
     */
    static async saveConsentForm(
        patientId: string,
        formSlug: string,
        formData: Record<string, any>,
        signature: ConsentSignature,
        tenantId?: string
    ): Promise<void> {
        const dto: ConsentFormInsertDTO = {
            patient_id: patientId,
            form_slug: formSlug,
            form_data: formData,
            signature_name: signature.fullName,
            signature_image: signature.image,
            signed_at: signature.timestamp,
            tenant_id: tenantId
        };

        const { error } = await supabase.from('consent_forms').upsert(dto, { onConflict: 'patient_id,form_slug' });

        if (error) {
            console.error('[ClinicalService] Error saving consent form:', error);
            throw new Error('Failed to save HIPAA consent form.');
        }
    }

    /**
     * Devuelve las propiedades actualizadas de un paciente al enviarle un formulario clínico.
     */
    static calculateFormSubmission(patient: Patient, formId: string): ClinicalPatientUpdate {
        const updatedCompleted = patient.completedForms.includes(formId)
            ? patient.completedForms
            : [...patient.completedForms, formId];

        const allDone = patient.requiredForms.every(req => updatedCompleted.includes(req));

        return {
            completedForms: updatedCompleted,
            formsStatus: allDone ? "COMPLETED" : "PENDING",
            approvalStatus: allDone ? "PENDING_APPROVAL" : "PENDING_FORMS"
        };
    }

    /**
     * Devuelve las propiedades actualizadas al asignar un tratamiento clínico a un perfil.
     */
    static calculateTreatmentEnrollment(patient: Patient, treatment: string): ClinicalPatientUpdate {
        const newRequired = this.getRequiredFormsForTreatment(treatment);
        const combinedRequired = Array.from(new Set([...patient.requiredForms, ...newRequired]));
        const allDone = combinedRequired.every(req => patient.completedForms.includes(req));

        const activeTreatment = patient.activeTreatment === "Pending Evaluation"
            ? treatment
            : `${patient.activeTreatment} + ${treatment}`;

        return {
            activeTreatment,
            requiredForms: combinedRequired,
            formsStatus: allDone ? "COMPLETED" : "PENDING",
            approvalStatus: allDone ? "PENDING_APPROVAL" : "PENDING_FORMS"
        };
    }

    /**
     * Calcula la adición manual de un formulario a los requerimientos de un paciente y evalúa su estatus general.
     */
    static calculateRequiredFormAddition(patient: Patient, formSlug: string): ClinicalPatientUpdate | null {
        if (patient.requiredForms.includes(formSlug)) return null;

        const combinedRequired = [...patient.requiredForms, formSlug];
        const allDone = combinedRequired.every(req => patient.completedForms.includes(req));

        return {
            requiredForms: combinedRequired,
            formsStatus: allDone ? "COMPLETED" : "PENDING",
            approvalStatus: allDone ? "PENDING_APPROVAL" : "PENDING_FORMS"
        };
    }
}
