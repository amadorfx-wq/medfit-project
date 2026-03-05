// src/types/staff.ts

// The generic enterprise Roles spanning across both Patients and Staff
export type Role = "PATIENT" | "ADMIN" | "SUPERADMIN" | "RECEPTION" | "DOCTOR" | null;

export interface StaffDocument {
    name: string;
    url: string;
    type: string;
    uploadedAt: string;
    size?: number;
}

export interface Staff {
    id: string;
    name: string;
    email: string;
    role: Role;
    department: string;
    lastActive: string;

    // Extended Expedient Fields
    address?: string;
    phone?: string;
    licenseNumber?: string;
    notes?: string;
    documents?: StaffDocument[];
    supabaseUserId?: string;
    ndaSignedAt?: string | null;
}
