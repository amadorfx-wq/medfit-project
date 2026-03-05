"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Charge, ChargeStatus } from "@/types/billing";
import { BillingService } from "@/services/billing.service";
import { useAuth } from "./useAuth";
import { getTenantIdFromBrowser } from "@/lib/supabase";
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
    const { currentUser } = useAuth();
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
        // Fetch initially, and refetch if user changes context
        refreshCharges();
    }, [refreshCharges, currentUser?.id]);

    const addCharge = async (chargeData: Omit<Charge, "id" | "date" | "status">) => {
        const tenantId = getTenantIdFromBrowser();
        try {
            // Optimistic approach
            const tempId = `temp_${Date.now()}`;
            const optimisticCharge: Charge = {
                ...chargeData,
                id: tempId,
                status: "PENDING",
                date: new Date().toISOString().split('T')[0],
                tenantId: tenantId || undefined
            };

            setCharges(prev => [optimisticCharge, ...prev]);

            // Database mutation
            const newCharge = await BillingService.createCharge(chargeData, tenantId);

            // Swap temp with real
            setCharges(prev => prev.map(c => c.id === tempId ? newCharge : c));

        } catch (error: any) {
            // Revert on failure (simplified for MVP)
            refreshCharges();
            toast.error("Failed to create charge.");
        }
    };

    const payCharge = async (chargeId: string) => {
        try {
            // Optimistic update
            setCharges(prev => prev.map(c =>
                c.id === chargeId ? { ...c, status: "PAID" as ChargeStatus } : c
            ));

            await BillingService.markChargePAID(chargeId);
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
