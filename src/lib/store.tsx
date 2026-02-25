"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// Types
export type Role = "PATIENT" | "ADMIN" | null;

export interface Patient {
    id: string;
    name: string;
    email: string;
    phone?: string;
    activeTreatment: string;
    formsStatus: "PENDING" | "COMPLETED";
    approvalStatus: "PENDING_FORMS" | "PENDING_APPROVAL" | "APPROVED";
    requiredForms: string[];
    completedForms: string[];
}

export const getRequiredFormsForTreatment = (treatment: string): string[] => {
    const defaultForms = ["wellness-intake"];
    if (treatment.toLowerCase().includes("weight loss")) return [...defaultForms, "medical-weight-loss", "semaglutide-instructions"];
    if (treatment.toLowerCase().includes("testosterone") || treatment.toLowerCase().includes("trt")) return [...defaultForms, "testosterone-therapy"];
    if (treatment.toLowerCase().includes("peptide")) return [...defaultForms, "peptide-therapy"];
    if (treatment.toLowerCase().includes("semaglutide") || treatment.toLowerCase().includes("tirzepatide")) return [...defaultForms, "semaglutide-instructions"];
    if (treatment.toLowerCase().includes("nfc")) return [...defaultForms, "nfc-hipaa"];
    return defaultForms;
};

export interface Charge {
    id: string;
    patientId: string;
    amount: number;
    description: string;
    status: "PENDING" | "PAID";
    date: string;
}

interface AppContextType {
    currentUser: { id: string; role: Role; name: string } | null;
    login: (email: string, role: Role) => void;
    logout: () => void;
    patients: Patient[];
    charges: Charge[];
    addCharge: (charge: Omit<Charge, "id" | "date" | "status">) => void;
    payCharge: (chargeId: string) => void;
    registerAndLogin: (name: string, email: string) => void;
    submitForm: (formId: string) => void;
    authorizeTreatment: (patientId: string, amount: number, description: string) => void;
    enrollTreatment: (patientId: string, treatment: string) => void;
}

// Initial Mock Data
const MOCK_PATIENTS: Patient[] = [
    { id: "p1", name: "Sarah Johnson", email: "sarah@example.com", phone: "+1 (404) 555-0198", activeTreatment: "Hormone Optimization - Month 3", formsStatus: "COMPLETED", approvalStatus: "APPROVED", requiredForms: ["wellness-intake"], completedForms: ["wellness-intake"] },
    { id: "p2", name: "Michael Chang", email: "michael@example.com", phone: "+1 (404) 555-0245", activeTreatment: "Peptide Protocol", formsStatus: "COMPLETED", approvalStatus: "APPROVED", requiredForms: ["wellness-intake", "peptide-therapy"], completedForms: ["wellness-intake", "peptide-therapy"] },
    { id: "p3", name: "Emma Davis", email: "emma@example.com", phone: "+1 (404) 555-0371", activeTreatment: "Medical Weight Loss", formsStatus: "COMPLETED", approvalStatus: "APPROVED", requiredForms: ["wellness-intake", "medical-weight-loss"], completedForms: ["wellness-intake", "medical-weight-loss"] },
    { id: "test", name: "Test Patient", email: "test@medfit.com", phone: "+1 (404) 555-9999", activeTreatment: "Testosterone Therapy", formsStatus: "PENDING", approvalStatus: "PENDING_FORMS", requiredForms: ["wellness-intake", "testosterone-therapy"], completedForms: [] },
];

const MOCK_CHARGES: Charge[] = [
    { id: "c1", patientId: "p1", amount: 285.00, description: "Monthly Protocol Fee", status: "PENDING", date: "2026-02-20" },
    { id: "c2", patientId: "p2", amount: 1450.00, description: "Initial Peptide Supply", status: "PAID", date: "2026-02-15" },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<AppContextType["currentUser"]>(null);
    const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
    const [charges, setCharges] = useState<Charge[]>(MOCK_CHARGES);

    const login = (email: string, role: Role) => {
        if (role === "ADMIN") {
            setCurrentUser({ id: "admin1", role: "ADMIN", name: "Dr. Kitchens" });
        } else {
            // Find patient or default to Sarah
            const patient = patients.find(p => p.email === email);
            if (patient) {
                setCurrentUser({ id: patient.id, role: "PATIENT", name: patient.name });
            } else {
                // Fallback for demo
                setCurrentUser({ id: MOCK_PATIENTS[0].id, role: "PATIENT", name: MOCK_PATIENTS[0].name });
            }
        }
    };

    const registerAndLogin = (name: string, email: string) => {
        const activeTreatment = "Pending Evaluation";
        const reqForms = getRequiredFormsForTreatment(activeTreatment);
        const newPatient: Patient = {
            id: `p${Date.now()}`,
            name,
            email,
            activeTreatment,
            formsStatus: "PENDING",
            approvalStatus: "PENDING_FORMS",
            requiredForms: reqForms,
            completedForms: []
        };
        setPatients(prev => [newPatient, ...prev]);
        setCurrentUser({ id: newPatient.id, role: "PATIENT", name: newPatient.name });
    };

    const submitForm = (formId: string) => {
        if (currentUser?.role === "PATIENT") {
            setPatients(prev => prev.map(p => {
                if (p.id === currentUser.id) {
                    const updatedCompleted = p.completedForms.includes(formId) ? p.completedForms : [...p.completedForms, formId];
                    // Check if all required are completed
                    const allDone = p.requiredForms.every(req => updatedCompleted.includes(req));
                    return {
                        ...p,
                        completedForms: updatedCompleted,
                        formsStatus: allDone ? "COMPLETED" : "PENDING",
                        approvalStatus: allDone ? "PENDING_APPROVAL" : "PENDING_FORMS"
                    };
                }
                return p;
            }));
        }
    };

    const logout = () => setCurrentUser(null);

    const addCharge = (chargeData: Omit<Charge, "id" | "date" | "status">) => {
        const newCharge: Charge = {
            ...chargeData,
            id: `c${Date.now()}`,
            status: "PENDING",
            date: new Date().toISOString().split('T')[0],
        };
        setCharges(prev => [newCharge, ...prev]);
    };

    const payCharge = (chargeId: string) => {
        setCharges(prev => prev.map(c =>
            c.id === chargeId ? { ...c, status: "PAID" } : c
        ));
    };

    const authorizeTreatment = (patientId: string, amount: number, description: string) => {
        // Change status to approved
        setPatients(prev => prev.map(p =>
            p.id === patientId ? { ...p, approvalStatus: "APPROVED" } : p
        ));
        // Add the authorized charge
        addCharge({ patientId, amount, description });
    };

    const enrollTreatment = (patientId: string, treatment: string) => {
        setPatients(prev => prev.map(p => {
            if (p.id === patientId) {
                const newRequired = getRequiredFormsForTreatment(treatment);
                const combinedRequired = Array.from(new Set([...p.requiredForms, ...newRequired]));
                const allDone = combinedRequired.every(req => p.completedForms.includes(req));
                return {
                    ...p,
                    activeTreatment: p.activeTreatment === "Pending Evaluation" ? treatment : `${p.activeTreatment} + ${treatment}`,
                    requiredForms: combinedRequired,
                    formsStatus: allDone ? "COMPLETED" : "PENDING",
                    approvalStatus: allDone ? "PENDING_APPROVAL" : "PENDING_FORMS"
                };
            }
            return p;
        }));
    };

    return (
        <AppContext.Provider value={{ currentUser, login, logout, patients, charges, addCharge, payCharge, registerAndLogin, submitForm, authorizeTreatment, enrollTreatment }}>
            {children}
        </AppContext.Provider>
    );
}

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
};
