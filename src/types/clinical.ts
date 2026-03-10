// src/types/clinical.ts
// Re-exports typed PHI contracts from core/ and adds non-PHI clinical types.
// Import PHI types from here throughout the app — the actual definitions live
// in src/core/types/clinical.ts to keep core logic brand-agnostic.

import { PatientApprovalStatus, PatientFormsStatus } from "./patient";

export type {
    ConsentFormData,
    ConsentFormInsertDTO,
    ConsentFormRecord,
} from "@/core/types/clinical";

export interface ConsentSignature {
    fullName: string;
    image: string; // Base64 or URL
    timestamp: string;
}

// Helper typing for updates returned by the service
export interface ClinicalPatientUpdate {
    activeTreatment?: string;
    requiredForms?: string[];
    completedForms?: string[];
    formsStatus?: PatientFormsStatus;
    approvalStatus?: PatientApprovalStatus;
}
