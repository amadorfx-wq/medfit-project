// src/hooks/usePatientNotifications.tsx
// ─── Real-Time In-App Notifications for Patients ──────────────────────────
// Uses Supabase Realtime (postgres_changes) to deliver instant notifications
// when admin authorizes payments, ships medications, or requires form actions.
"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { NotificationService } from "@/services/notification.service";

export interface PatientNotificationItem {
    id: string;
    type: string;
    title: string;
    message: string;
    data: Record<string, any>;
    read: boolean;
    created_at: string;
}

export const usePatientNotifications = () => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState<PatientNotificationItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const unreadCount = notifications.filter(n => !n.read).length;

    // ── Fetch existing notifications ──
    const fetchNotifications = useCallback(async () => {
        if (!currentUser?.id) return;

        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from("patient_notifications")
                .select("*")
                .eq("patient_id", currentUser.id)
                .order("created_at", { ascending: false })
                .limit(30);

            if (!error && data) {
                setNotifications(data.map(n => ({
                    id: n.id,
                    type: n.type,
                    title: n.title,
                    message: n.message,
                    data: n.data || {},
                    read: n.read,
                    created_at: n.created_at,
                })));
            }
        } catch (err) {
            console.error("[usePatientNotifications] Fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser?.id]);

    // ── Mark single notification as read ──
    const markAsRead = useCallback(async (notificationId: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
        ));
        await NotificationService.markPatientNotificationRead(notificationId);
    }, []);

    // ── Mark all as read ──
    const markAllRead = useCallback(async () => {
        if (!currentUser?.id) return;
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        await NotificationService.markAllPatientNotificationsRead(currentUser.id);
    }, [currentUser?.id]);

    // ── Initial fetch + Supabase Realtime subscription ──
    useEffect(() => {
        if (!currentUser?.id) return;

        fetchNotifications();

        // Subscribe to new notifications in real-time
        const channel = supabase.channel(`patient_notifs_${currentUser.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "patient_notifications",
                    filter: `patient_id=eq.${currentUser.id}`,
                },
                (payload) => {
                    const n = payload.new;
                    const newNotification: PatientNotificationItem = {
                        id: n.id,
                        type: n.type,
                        title: n.title,
                        message: n.message,
                        data: n.data || {},
                        read: n.read,
                        created_at: n.created_at,
                    };

                    setNotifications(prev => [newNotification, ...prev].slice(0, 30));

                    // Audio/visual cue: play a subtle notification sound
                    if (typeof window !== "undefined" && "Notification" in window) {
                        try {
                            // Browser notification (if permission granted)
                            if (Notification.permission === "granted") {
                                new Notification(n.title, { body: n.message });
                            }
                        } catch { /* silent */ }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser?.id, fetchNotifications]);

    return {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllRead,
        refreshNotifications: fetchNotifications,
    };
};
