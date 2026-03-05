import { Charge } from "@/types/billing";
import { supabase } from "@/lib/supabase";

/**
 * Enterprise Service Layer: Billing
 * Pure functions for data fetching and mutations related to billing operations.
 * NO React hooks or state here.
 */
export const BillingService = {
    /**
     * Fetch all charges for the current tenant context
     */
    async getCharges(): Promise<Charge[]> {
        const { data, error } = await supabase
            .from('charges')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.error('[BillingService] getCharges error:', error.message);
            throw error;
        }

        return (data || []).map(c => ({
            id: c.id,
            patientId: c.patient_id,
            amount: Number(c.amount),
            description: c.description,
            status: c.status as Charge["status"],
            date: c.date
        }));
    },

    /**
     * Create a new charge
     */
    async createCharge(chargeData: Omit<Charge, "id" | "date" | "status">, tenantId: string | null): Promise<Charge> {
        const newCharge: Charge = {
            ...chargeData,
            id: `c${Date.now()}`,
            status: "PENDING",
            date: new Date().toISOString().split('T')[0],
        };

        const { error } = await supabase.from('charges').insert({
            id: newCharge.id,
            patient_id: newCharge.patientId,
            amount: newCharge.amount,
            description: newCharge.description,
            status: newCharge.status,
            date: newCharge.date,
            tenant_id: tenantId || undefined
        });

        if (error) {
            console.error('[BillingService] createCharge error:', error.message);
            throw error;
        }

        return newCharge;
    },

    /**
     * Mark a charge as PAID
     */
    async markChargePAID(chargeId: string): Promise<void> {
        const { error } = await supabase
            .from('charges')
            .update({ status: 'PAID' })
            .eq('id', chargeId);

        if (error) {
            console.error('[BillingService] markChargePAID error:', error.message);
            throw error;
        }
    }
};
