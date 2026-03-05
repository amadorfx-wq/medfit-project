// src/hooks/useNotifications.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuditService } from "@/services/audit.service";
import { AdminNotification } from "@/types/audit";
import { supabase } from "@/lib/supabase";

export const useNotifications = () => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);

    const sendAdminNotification = useCallback((notif: Omit<AdminNotification, "id" | "date" | "read">) => {
        AuditService.sendAdminNotification(notif, undefined);
    }, []);

    const markNotificationRead = useCallback(async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        await supabase.from('admin_notifications').update({ read: true }).eq('id', id);
    }, []);

    const fetchNotifications = useCallback(async () => {
        if (currentUser?.role !== "ADMIN" && currentUser?.role !== "SUPERADMIN") return;

        const { data, error } = await supabase
            .from('admin_notifications')
            .select('*')
            .order('date', { ascending: false })
            .limit(50);

        if (!error && data) {
            setNotifications(data.map(n => ({
                id: n.id, patientId: n.patient_id, patientName: n.patient_name,
                type: n.type, content: n.content, date: n.date, read: n.read, data: n.data
            })));
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser?.role === "ADMIN" || currentUser?.role === "SUPERADMIN") {
            fetchNotifications();

            // Subscripción a nuevas notificaciones en tiempo real
            const channel = supabase.channel('admin_notifications_changes')
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'admin_notifications' },
                    (payload) => {
                        const n = payload.new;
                        setNotifications(prev => [{
                            id: n.id, patientId: n.patient_id, patientName: n.patient_name,
                            type: n.type, content: n.content, date: n.date, read: n.read, data: n.data
                        }, ...prev].slice(0, 50));
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [currentUser, fetchNotifications]);

    return {
        notifications,
        sendAdminNotification,
        markNotificationRead,
        refreshNotifications: fetchNotifications
    };
};
