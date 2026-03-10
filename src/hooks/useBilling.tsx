"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Charge, ChargeStatus } from "@/types/billing";
import { BillingService } from "@/services/billing.service";
import { NotificationService } from "@/services/notification.service";
import { useAuth } from "./useAuth";
import { getTenantIdFromBrowser } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface BillingContextType {
    charges: Charge[];
    isLoadingCharges: boolean;
    addCharge: (chargeData: Omit<Charge, "id" | "date" | "status">) => Promise<void>;
    payCharge: (chargeId: string) => Promise<void>;
    refreshCharges: () => Promise<void>;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

export function BillingProvider({ children }: { children: ReactNode }) {
    const { currentUser, isAuthReady } = useAuth();
    const [charges, setCharges] = useState<Charge[]>([]);
    const [isLoadingCharges, setIsLoadingCharges] = useState(true);

    const refreshCharges = useCallback(async () => {
        setIsLoadingCharges(true);
        try {
            const data = await BillingService.getCharges();
            setCharges(data);
        } catch (error: any) {
            console.error("[useBilling] Failed to load charges", error);
        } finally {
            setIsLoadingCharges(false);
        }
    }, []);

    useEffect(() => {
        if (!isAuthReady) return;
        refreshCharges();
    }, [isAuthReady, refreshCharges, currentUser?.id]);

    // ── Supabase Realtime: auto-refresh charges when any INSERT/UPDATE happens ──
    useEffect(() => {
        if (!isAuthReady) return;
        const channel = supabase.channel("charges_realtime")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "charges" },
                () => {
                    // A charge was inserted or updated — refetch all charges
                    refreshCharges();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [refreshCharges]);

    const addCharge = async (chargeData: Omit<Charge, "id" | "date" | "status">) => {
        const tenantId = getTenantIdFromBrowser();
        try {
            const tempId = `temp_${Date.now()}`;
            const optimisticCharge: Charge = {
                ...chargeData,
                id: tempId,
                status: "PENDING",
                date: new Date().toISOString().split('T')[0],
                tenantId: tenantId || undefined
            };

            setCharges(prev => [optimisticCharge, ...prev]);
            const newCharge = await BillingService.createCharge(chargeData, tenantId);
            setCharges(prev => prev.map(c => c.id === tempId ? newCharge : c));

        } catch (error: any) {
            refreshCharges();
            toast.error("Failed to create charge.");
        }
    };

    const payCharge = async (chargeId: string) => {
        try {
            // Find the charge being paid (before optimistic update)
            const chargeToPay = charges.find(c => c.id === chargeId);

            // Optimistic update
            setCharges(prev => prev.map(c =>
                c.id === chargeId ? { ...c, status: "PAID" as ChargeStatus } : c
            ));

            await BillingService.markChargePAID(chargeId);

            // ── EVENT-DRIVEN: After payment, check if ALL patient charges are now PAID ──
            if (chargeToPay) {
                const patientId = chargeToPay.patientId;
                const patientCharges = charges.filter(c => c.patientId === patientId);
                const allPaid = patientCharges.every(c =>
                    c.id === chargeId ? true : c.status === "PAID"
                );

                if (allPaid) {
                    // Update patient status to PENDING_SHIPMENT
                    const { error } = await supabase.from("patients").update({
                        approval_status: "PENDING_SHIPMENT"
                    }).eq("id", patientId);

                    if (error) {
                        console.error("[useBilling] Failed to update approvalStatus:", error.message);
                    }

                    // Notify admin that payment was received
                    const patientName = chargeToPay.description || "Patient";
                    await NotificationService.notifyAdmin({
                        patient_id: patientId,
                        patient_name: patientName,
                        type: "PAYMENT_RECEIVED",
                        content: `Payment of $${chargeToPay.amount.toFixed(2)} received. Patient is ready for shipment.`,
                        data: { chargeId, amount: chargeToPay.amount },
                    });
                }
            }

            toast.success("Payment Received.");

        } catch (error: any) {
            refreshCharges();
            toast.error("Failed to process payment. Please try again.");
        }
    };

    return (
        <BillingContext.Provider value={{
            charges,
            isLoadingCharges,
            addCharge,
            payCharge,
            refreshCharges
        }}>
            {children}
        </BillingContext.Provider>
    );
}

export const useBilling = () => {
    const context = useContext(BillingContext);
    if (context === undefined) {
        throw new Error("useBilling must be used within a BillingProvider");
    }
    return context;
};
