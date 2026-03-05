// src/services/audit.service.ts
import { supabase } from '@/lib/supabase';
import { AuditLog, AdminNotification } from '@/types/audit';

export class AuditService {
    /**
     * Escribe un log de auditoría asíncronamente (Fire and Forget)
     * Nunca bloqueará el renderizado de la UI.
     */
    static logEvent(
        log: Omit<AuditLog, "id" | "timestamp">,
        tenantId?: string
    ): void {
        supabase.from('audit_logs').insert({
            action: log.action,
            category: log.category,
            user_id: log.userId,
            user_name: log.userName,
            user_role: log.userRole,
            details: log.details,
            resource_type: log.resourceType,
            resource_id: log.resourceId,
            ip_address: log.ipAddress,
            tenant_id: tenantId
        }).then(({ error }) => {
            if (error) console.error('[AuditService] Failed to log event:', error);
        });
    }

    /**
     * Despacha una notificación para el administrador asíncronamente (Fire and Forget)
     */
    static sendAdminNotification(
        notif: Omit<AdminNotification, "id" | "date" | "read">,
        tenantId?: string
    ): void {
        supabase.from('admin_notifications').insert({
            patient_id: notif.patientId,
            patient_name: notif.patientName,
            type: notif.type,
            content: notif.content,
            data: notif.data,
            read: false,
            tenant_id: tenantId
        }).then(({ error }) => {
            if (error) console.error('[AuditService] Failed to send notification:', error);
        });
    }
}
