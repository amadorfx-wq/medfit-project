// src/types/patient.ts

export type PatientFormsStatus = "PENDING" | "COMPLETED";
export type PatientApprovalStatus = "PENDING_FORMS" | "PENDING_APPROVAL" | "PENDING_PAYMENT" | "PENDING_SHIPMENT" | "APPROVED";

/**
 * Enterprise Contract: Patient
 * This interface represents the strictly typed domain object for a Patient
 * on the Client Side (Frontend). It abstracts away database implementation details (like snake_case).
 */
export interface Patient {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    dob?: string;
    activeTreatment: string;
    formsStatus: PatientFormsStatus;
    approvalStatus: PatientApprovalStatus;
    requiredForms: string[];
    completedForms: string[];
    createdAt: string;
    tenantId?: string;
}

/**
 * Data Transfer Object (DTO) for inserting or updating records into Supabase.
 * Maps exactly to the PostgreSQL schema.
 */
export interface PatientInsertDTO {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    dob?: string;
    active_treatment: string;
    forms_status: PatientFormsStatus;
    approval_status: PatientApprovalStatus;
    required_forms: string[];
    completed_forms: string[];
    tenant_id?: string;
    created_at?: string;
}
