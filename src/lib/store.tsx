"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// Types
export type Role = "PATIENT" | "ADMIN" | null;

export interface Patient {
    id: string;
    name: string;
    email: string;
    activeTreatment: string;
    formsStatus: "PENDING" | "COMPLETED";
}

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
    submitIntakeForms: () => void;
}

// Initial Mock Data
const MOCK_PATIENTS: Patient[] = [
    { id: "p1", name: "Sarah Johnson", email: "sarah@example.com", activeTreatment: "Hormone Optimization - Month 3", formsStatus: "COMPLETED" },
    { id: "p2", name: "Michael Chang", email: "michael@example.com", activeTreatment: "Peptide Protocol", formsStatus: "COMPLETED" },
    { id: "p3", name: "Emma Davis", email: "emma@example.com", activeTreatment: "Medical Weight Loss", formsStatus: "COMPLETED" },
    { id: "test", name: "Test Patient", email: "test@medfit.com", activeTreatment: "Test Protocol", formsStatus: "PENDING" }, // Easy test login
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
        const newPatient: Patient = {
            id: `p${Date.now()}`,
            name,
            email,
            activeTreatment: "Pending Evaluation",
            formsStatus: "PENDING"
        };
        setPatients(prev => [newPatient, ...prev]);
        setCurrentUser({ id: newPatient.id, role: "PATIENT", name: newPatient.name });
    };

    const submitIntakeForms = () => {
        if (currentUser?.role === "PATIENT") {
            setPatients(prev => prev.map(p =>
                p.id === currentUser.id ? { ...p, formsStatus: "COMPLETED" } : p
            ));
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

    return (
        <AppContext.Provider value={{ currentUser, login, logout, patients, charges, addCharge, payCharge, registerAndLogin, submitIntakeForms }}>
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
