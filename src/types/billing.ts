export type ChargeStatus = "PENDING" | "PAID" | "VERIFYING_PAYMENT";

export interface Charge {
    id: string;
    patientId: string;
    amount: number;
    description: string;
    status: ChargeStatus;
    date: string;
    tenantId?: string; // Optional for client side, enforced by RLS
}
