// src/types/audit.ts
import { Role } from "@/lib/store";

export type AuditCategory = "AUTH" | "PHI_ACCESS" | "CLINICAL" | "BILLING" | "ADMIN" | "SYSTEM" | "GENERAL" | "COMPLIANCE";

export interface AuditLog {
    id: string;
    action: string;
    category: AuditCategory;
    userId: string;
    userName: string;
    userRole: Role;
    details: string;
    resourceType?: string;
    resourceId?: string;
    ipAddress?: string;
    timestamp: string;
}

export interface AdminNotification {
    id: string;
    patientId: string;
    patientName: string;
    type: "MESSAGE" | "CART_REQUEST" | "SYSTEM_ALERT";
    content: string;
    date: string;
    read: boolean;
    data?: any;
}
