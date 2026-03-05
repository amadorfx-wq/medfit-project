// src/types/clinical.ts
import { Patient, PatientApprovalStatus, PatientFormsStatus } from "./patient";

export interface ConsentSignature {
    fullName: string;
    image: string; // Base64 or URL
    timestamp: string;
}

export interface ConsentFormRecord {
    id?: string;
    patientId: string;
    formSlug: string;
    formData: Record<string, any>;
    signatureName: string;
    signatureImage: string;
    signedAt: string;
    tenantId?: string;
}

export interface ConsentFormInsertDTO {
    patient_id: string;
    form_slug: string;
    form_data: Record<string, any>;
    signature_name: string;
    signature_image: string;
    signed_at: string;
    tenant_id?: string;
}

// Helper typing for updates returned by the service
export interface ClinicalPatientUpdate {
    activeTreatment?: string;
    requiredForms?: string[];
    completedForms?: string[];
    formsStatus?: PatientFormsStatus;
    approvalStatus?: PatientApprovalStatus;
}
