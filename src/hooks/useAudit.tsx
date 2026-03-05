// src/hooks/useAudit.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuditService } from "@/services/audit.service";
import { AuditCategory, AuditLog } from "@/types/audit";
import { supabase } from "@/lib/supabase";
import { Role } from "@/types/staff";

export const useAudit = () => {
    const { currentUser } = useAuth();
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

    const logEvent = useCallback((
        action: string,
        details: string,
        category: AuditCategory = "GENERAL",
        resourceType?: string,
        resourceId?: string,
        actorOverride?: { id: string, name: string, role: Role }
    ) => {
        const actorId = actorOverride?.id || currentUser?.id || 'system';
        const actorName = actorOverride?.name || currentUser?.name || 'System';
        const actorRole = actorOverride?.role || currentUser?.role || null;

        AuditService.logEvent({
            action,
            details,
            category,
            userId: actorId,
            userName: actorName,
            userRole: actorRole,
            resourceType,
            resourceId,
            ipAddress: "client-side"
        }, undefined);
    }, [currentUser]);

    // Opcional: Fetcher para Administradores que necesiten visualizar logs.
    const fetchLogs = useCallback(async () => {
        if (currentUser?.role !== "ADMIN" && currentUser?.role !== "SUPERADMIN") return;

        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(2000);

        if (!error && data) {
            setAuditLogs(data.map(a => ({
                id: a.id, action: a.action,
                category: (a.category ?? 'GENERAL') as AuditCategory,
                userId: a.user_id, userName: a.user_name, userRole: a.user_role as Role,
                details: a.details, resourceType: a.resource_type, resourceId: a.resource_id,
                ipAddress: a.ip_address, timestamp: a.created_at
            })));
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser?.role === "ADMIN" || currentUser?.role === "SUPERADMIN") {
            fetchLogs();
        }
    }, [currentUser, fetchLogs]);

    return {
        logEvent,
        auditLogs,
        refreshLogs: fetchLogs
    };
};
