/**
 * Capa de Abstracción Reactiva: usePatients.tsx
 * Extraída de store.tsx para delegar la gestión del estado y persistencia de Pacientes.
 */
"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { Patient, PatientInsertDTO } from "@/types/patient";
import { PatientService } from "@/services/patient.service";
import { AuditService } from "@/services/audit.service";
import { supabase, getTenantIdFromBrowser } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Role } from "@/types/staff";
import { toast } from "sonner";


// Re-utilizamos la función del store temporalmente o la movemos a clinical
export const getRequiredFormsForTreatment = (treatment: string): string[] => {
    const defaultForms = ["wellness-intake"];
    if (treatment.toLowerCase().includes("weight loss")) return [...defaultForms, "medical-weight-loss", "semaglutide-instructions"];
    if (treatment.toLowerCase().includes("testosterone") || treatment.toLowerCase().includes("trt")) return [...defaultForms, "testosterone-therapy"];
    if (treatment.toLowerCase().includes("peptide")) return [...defaultForms, "peptide-therapy"];
    if (treatment.toLowerCase().includes("semaglutide") || treatment.toLowerCase().includes("tirzepatide")) return [...defaultForms, "semaglutide-instructions"];
    if (treatment.toLowerCase().includes("nfc")) return [...defaultForms, "nfc-hipaa"];
    return defaultForms;
};

interface PatientsContextType {
    patients: Patient[];
    isPatientsLoading: boolean;
    updatePatient: (patientId: string, updates: Partial<Patient>) => Promise<void>;
    deletePatient: (patientId: string) => Promise<void>;
    registerAndLogin: (name: string, email: string, password: string) => Promise<{ success: boolean; isNew?: boolean; error?: string }>;
    refreshPatients: () => Promise<void>;
    // Navigation/Selection State
    selectedGlobalPatientId: string | null;
    setSelectedGlobalPatientId: (id: string | null) => void;
}

const PatientsContext = createContext<PatientsContextType | undefined>(undefined);

export function PatientsProvider({ children }: { children: ReactNode }) {
    const { currentUser } = useAuth();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isPatientsLoading, setIsPatientsLoading] = useState(true);
    const [selectedGlobalPatientId, setSelectedGlobalPatientId] = useState<string | null>(null);

    const refreshPatients = useCallback(async () => {
        setIsPatientsLoading(true);
        try {
            const data = await PatientService.getPatients();
            setPatients(data);
        } catch (error) {
            console.error("Failed to fetch patients:", error);
        } finally {
            setIsPatientsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshPatients();

        // 2. Listen for patient record changes in real-time (approval_status, etc.)
        const patientsChannel = supabase
            .channel('patients-realtime')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'patients' }, (payload) => {
                const p = payload.new as PatientInsertDTO;
                setPatients(prev => prev.map(patient =>
                    patient.id === p.id ? {
                        ...patient,
                        activeTreatment: p.active_treatment,
                        formsStatus: p.forms_status,
                        approvalStatus: p.approval_status,
                        requiredForms: p.required_forms || [],
                        completedForms: p.completed_forms || [],
                    } : patient
                ));
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'patients' }, (payload) => {
                const p = payload.new as PatientInsertDTO;
                const newPatient: Patient = {
                    id: p.id, name: p.name, email: p.email, phone: p.phone,
                    address: p.address, dob: p.dob,
                    activeTreatment: p.active_treatment,
                    formsStatus: p.forms_status,
                    approvalStatus: p.approval_status,
                    requiredForms: p.required_forms || [],
                    completedForms: p.completed_forms || [],
                    createdAt: p.created_at ?? new Date().toISOString(),
                    tenantId: p.tenant_id
                };
                setPatients(prev => {
                    if (prev.find(existing => existing.id === p.id)) return prev;
                    return [newPatient, ...prev];
                });
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'patients' }, (payload) => {
                setPatients(prev => prev.filter(patient => patient.id !== payload.old.id));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(patientsChannel);
        };
    }, [refreshPatients]);

    const updatePatient = useCallback(async (patientId: string, updates: Partial<Patient>) => {
        // Optimistic UI update
        setPatients(prev => prev.map(p => p.id === patientId ? { ...p, ...updates } : p));

        try {
            await PatientService.updatePatient(patientId, updates);
            AuditService.logEvent({
                action: "PATIENT_UPDATED",
                category: "GENERAL",
                details: `Updated profile for patient ${patientId}`,
                userId: currentUser?.id || "system",
                userName: currentUser?.name || "System",
                userRole: currentUser?.role ?? ("SUPERADMIN" as Role)
            }, getTenantIdFromBrowser() || undefined);
        } catch (error) {
            // Rollback could be implemented here
            toast.error("Failed to update patient record.");
        }
    }, [currentUser]);

    const deletePatient = useCallback(async (patientId: string) => {
        let deletedPatientName: string | undefined;

        setPatients(prev => {
            const patientToDelete = prev.find(p => p.id === patientId);
            if (patientToDelete) deletedPatientName = patientToDelete.name;
            return prev.filter(p => p.id !== patientId);
        });

        if (selectedGlobalPatientId === patientId) {
            setSelectedGlobalPatientId(null);
        }

        if (deletedPatientName) {
            AuditService.sendAdminNotification({
                patientId: patientId,
                patientName: deletedPatientName,
                type: "SYSTEM_ALERT",
                content: `Patient profile for ${deletedPatientName} was permanently deleted from the system.`,
            }, getTenantIdFromBrowser() || undefined);
        }

        try {
            await PatientService.deletePatient(patientId);
            AuditService.logEvent({
                action: "PATIENT_DELETED",
                category: "GENERAL",
                details: `Permanently deleted patient record ${patientId}`,
                userId: currentUser?.id || "system",
                userName: currentUser?.name || "System",
                userRole: currentUser?.role ?? ("SUPERADMIN" as Role)
            }, getTenantIdFromBrowser() || undefined);
        } catch (error: any) {
            console.error('[MedFit] Supabase deletePatient error:', error);
            AuditService.logEvent({
                action: "PATIENT_DELETE_ERROR",
                category: "SYSTEM",
                details: `Supabase error deleting ${patientId}: ${error.message}`,
                userId: currentUser?.id || "system",
                userName: currentUser?.name || "System",
                userRole: currentUser?.role ?? ("SUPERADMIN" as Role)
            }, getTenantIdFromBrowser() || undefined);
        }
    }, [selectedGlobalPatientId, currentUser]);

    const registerAndLogin = useCallback(async (name: string, email: string, password: string) => {
        // [DEDUPLICATION LOCK] Check if email already exists
        const existingPatient = patients.find(p => p.email.toLowerCase() === email.toLowerCase());
        if (existingPatient) {
            return { success: false, error: 'email_exists' as const };
        }

        try {
            const res = await fetch('/api/auth/patient-register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const result = await res.json();

            if (!res.ok) {
                toast.error(result.error || 'Error creating account. Please try again.');
                return { success: false };
            }

            // Registration succeeded — session cookie is set by the API route
            return { success: true, isNew: true };
        } catch (error) {
            toast.error('Error creating account. Please try again.');
            return { success: false };
        }
    }, [patients]);

    return (
        <PatientsContext.Provider value={{
            patients,
            isPatientsLoading,
            updatePatient,
            deletePatient,
            registerAndLogin,
            refreshPatients,
            selectedGlobalPatientId,
            setSelectedGlobalPatientId
        }}>
            {children}
        </PatientsContext.Provider>
    );
}

export function usePatients() {
    const context = useContext(PatientsContext);
    if (context === undefined) {
        throw new Error("usePatients must be used within a PatientsProvider");
    }
    return context;
}
