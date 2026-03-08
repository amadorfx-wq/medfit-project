// src/services/notification.service.ts
// ─── Enterprise Notification Service ──────────────────────────────────────────
// Centralized service for creating notifications for both patients and admins.
// All notifications are persisted to Supabase and delivered via Realtime channels.
import { supabase } from "@/lib/supabase";

export interface PatientNotification {
    id?: string;
    patient_id: string;
    type: "PAYMENT_REQUIRED" | "SHIPMENT_DISPATCHED" | "FORM_REQUIRED" | "TREATMENT_APPROVED" | "GENERAL";
    title: string;
    message: string;
    data?: Record<string, any>;
    read?: boolean;
    created_at?: string;
}

export const NotificationService = {
    /**
     * Send a notification to a patient.
     * This inserts into `patient_notifications` which triggers Supabase Realtime.
     */
    async notifyPatient(notification: Omit<PatientNotification, "id" | "read" | "created_at">): Promise<void> {
        const { error } = await supabase.from("patient_notifications").insert({
            patient_id: notification.patient_id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            data: notification.data || {},
        });

        if (error) {
            console.error("[NotificationService] Failed to notify patient:", error.message);
            // Don't throw — notifications should never block the primary operation
        }
    },

    /**
     * Send a notification to the admin panel.
     * Inserts into `admin_notifications` which triggers Supabase Realtime for ADMIN users.
     */
    async notifyAdmin(notification: {
        patient_id: string;
        patient_name: string;
        type: string;
        content: string;
        data?: Record<string, any>;
    }): Promise<void> {
        const { error } = await supabase.from("admin_notifications").insert({
            patient_id: notification.patient_id,
            patient_name: notification.patient_name,
            type: notification.type,
            content: notification.content,
            data: notification.data || {},
            read: false,
            date: new Date().toISOString(),
        });

        if (error) {
            console.error("[NotificationService] Failed to notify admin:", error.message);
        }
    },

    /**
     * Mark a patient notification as read.
     */
    async markPatientNotificationRead(notificationId: string): Promise<void> {
        await supabase.from("patient_notifications").update({ read: true }).eq("id", notificationId);
    },

    /**
     * Mark all patient notifications as read.
     */
    async markAllPatientNotificationsRead(patientId: string): Promise<void> {
        await supabase
            .from("patient_notifications")
            .update({ read: true })
            .eq("patient_id", patientId)
            .eq("read", false);
    },
};
