"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

// Types
export type Role = "PATIENT" | "ADMIN" | "SUPERADMIN" | "RECEPTION" | null;

export interface AuditLog {
    id: string;
    action: string;
    userId: string;
    userName: string;
    userRole: Role;
    details: string;
    timestamp: string;
}

export interface Patient {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    dob?: string;
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

export interface CartItem {
    id: string;
    name: string;
    price: string;
}

export interface AdminNotification {
    id: string;
    patientId: string;
    patientName: string;
    type: "MESSAGE" | "CART_REQUEST";
    content: string;
    date: string;
    read: boolean;
    data?: any;
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
    addRequiredFormToPatient: (patientId: string, formSlug: string) => void;
    // Core Navigation State
    selectedGlobalPatientId: string | null;
    setSelectedGlobalPatientId: (id: string | null) => void;
    // Medical Cart (Order Requests)
    cart: CartItem[];
    addToCart: (item: Omit<CartItem, "id">) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    submitCartRequest: () => Promise<void>;
    // Bidirectional Notification Engine
    adminNotifications: AdminNotification[];
    sendAdminNotification: (notif: Omit<AdminNotification, "id" | "date" | "read">) => void;
    markNotificationRead: (id: string) => void;
    // M&A Due Diligence: Audit Trail
    auditLogs: AuditLog[];
    logEvent: (action: string, details: string, actorOverride?: { id: string, name: string, role: Role }) => void;
}

// Initial Mock Data
const MOCK_PATIENTS: Patient[] = [
    { id: "p1", name: "Sarah Johnson", email: "sarah@example.com", phone: "+1 (404) 555-0198", address: "123 Peachtree St, Atlanta, GA", dob: "1985-04-12", activeTreatment: "Hormone Optimization - Month 3", formsStatus: "COMPLETED", approvalStatus: "APPROVED", requiredForms: ["wellness-intake"], completedForms: ["wellness-intake"] },
    { id: "p2", name: "Michael Chang", email: "michael@example.com", phone: "+1 (404) 555-0245", address: "456 Piedmont Ave, Atlanta, GA", dob: "1978-09-22", activeTreatment: "Peptide Protocol", formsStatus: "COMPLETED", approvalStatus: "APPROVED", requiredForms: ["wellness-intake", "peptide-therapy"], completedForms: ["wellness-intake", "peptide-therapy"] },
    { id: "p3", name: "Emma Davis", email: "emma@example.com", phone: "+1 (404) 555-0371", address: "789 Ponce De Leon Ave, Atlanta, GA", dob: "1992-11-05", activeTreatment: "Medical Weight Loss", formsStatus: "COMPLETED", approvalStatus: "APPROVED", requiredForms: ["wellness-intake", "medical-weight-loss"], completedForms: ["wellness-intake", "medical-weight-loss"] },
    { id: "test", name: "Test Patient", email: "test@medfit.com", phone: "+1 (404) 555-9999", address: "999 Buckhead Village, Atlanta, GA", dob: "1980-01-01", activeTreatment: "Testosterone Therapy", formsStatus: "PENDING", approvalStatus: "PENDING_FORMS", requiredForms: ["wellness-intake", "testosterone-therapy"], completedForms: [] },
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
    const [selectedGlobalPatientId, setSelectedGlobalPatientId] = useState<string | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([
        { id: "n1", patientId: "p1", patientName: "Sarah Johnson", type: "MESSAGE", content: "I have a question about my medication dosage instructions for this week.", date: new Date().toISOString(), read: false },
        { id: "n2", patientId: "p3", patientName: "Emma Davis", type: "CART_REQUEST", content: "Requested Peptide Refill Protocol.", date: new Date().toISOString(), read: false }
    ]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

    useEffect(() => {
        const fetchInitialData = async () => {
            // Fetch Patients
            const { data: pData } = await supabase.from('patients').select('*');
            if (pData && pData.length > 0) {
                const formattedPatients: Patient[] = pData.map(p => ({
                    id: p.id,
                    name: p.name,
                    email: p.email,
                    phone: p.phone,
                    address: p.address,
                    dob: p.dob,
                    activeTreatment: p.active_treatment,
                    formsStatus: p.forms_status,
                    approvalStatus: p.approval_status,
                    requiredForms: p.required_forms || [],
                    completedForms: p.completed_forms || [],
                }));
                setPatients(formattedPatients);
            } else {
                setPatients(MOCK_PATIENTS);
                for (const p of MOCK_PATIENTS) {
                    await supabase.from('patients').insert({
                        id: p.id, name: p.name, email: p.email, phone: p.phone, address: p.address, dob: p.dob,
                        active_treatment: p.activeTreatment, forms_status: p.formsStatus, approval_status: p.approvalStatus,
                        required_forms: p.requiredForms, completed_forms: p.completedForms
                    });
                }
            }

            // Fetch Charges
            const { data: cData } = await supabase.from('charges').select('*');
            if (cData && cData.length > 0) {
                const formattedCharges: Charge[] = cData.map(c => ({
                    id: c.id, patientId: c.patient_id, amount: Number(c.amount), description: c.description, status: c.status, date: c.date
                }));
                setCharges(formattedCharges);
            } else {
                setCharges(MOCK_CHARGES);
                for (const c of MOCK_CHARGES) {
                    await supabase.from('charges').insert({
                        id: c.id, patient_id: c.patientId, amount: c.amount, description: c.description, status: c.status, date: c.date
                    });
                }
            }

            // Fetch Audit Logs
            const { data: aData } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
            if (aData && aData.length > 0) {
                const formattedLogs: AuditLog[] = aData.map(a => ({
                    id: a.id, action: a.action, userId: a.user_id, userName: a.user_name, userRole: a.user_role as Role, details: a.details, timestamp: a.timestamp
                }));
                setAuditLogs(formattedLogs);
            } else {
                setAuditLogs([{ id: "log1", action: "SYSTEM_INIT", userId: "system", userName: "System", userRole: "SUPERADMIN", details: "Security Audit Engine initialized.", timestamp: new Date(Date.now() - 86400000).toISOString() }]);
            }
        };

        fetchInitialData();
    }, []);

    const logEvent = (action: string, details: string, actorOverride?: { id: string, name: string, role: Role }) => {
        const actor = actorOverride || currentUser || { id: "system", name: "System", role: "SUPERADMIN" as Role };
        const newLog: AuditLog = {
            id: `log_${Math.random().toString(36).substr(2, 9)}`,
            action,
            userId: actor.id,
            userName: actor.name,
            userRole: actor.role,
            details,
            timestamp: new Date().toISOString()
        };
        // Keep only last 100 logs to prevent memory leak
        setAuditLogs(prev => [newLog, ...prev].slice(0, 100));

        // Supabase insertion
        supabase.from('audit_logs').insert({
            id: newLog.id,
            action: newLog.action,
            user_id: newLog.userId,
            user_name: newLog.userName,
            user_role: newLog.userRole,
            details: newLog.details,
            timestamp: newLog.timestamp
        }).then();
    };

    const addToCart = (item: Omit<CartItem, "id">) => {
        setCart(prev => [...prev, { ...item, id: `cart_item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }]);
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(c => c.id !== id));
    };

    const clearCart = () => setCart([]);

    const sendAdminNotification = (notif: Omit<AdminNotification, "id" | "date" | "read">) => {
        const newNotif: AdminNotification = {
            ...notif,
            id: `notif_${Date.now()}`,
            date: new Date().toISOString(),
            read: false,
        };
        setAdminNotifications(prev => [newNotif, ...prev]);
    };

    const markNotificationRead = (id: string) => {
        setAdminNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const submitCartRequest = async () => {
        if (cart.length === 0) return;

        const pId = currentUser?.id || "guest";
        const pName = currentUser?.role === "PATIENT" ? currentUser.name : "New Lead (Guest)";
        const content = `Requested ${cart.length} item(s): ` + cart.map(c => c.name).join(", ");

        sendAdminNotification({
            patientId: pId,
            patientName: pName,
            type: "CART_REQUEST",
            content: content,
            data: { items: [...cart] }
        });

        logEvent("CART_REQUEST_SUBMITTED", `Submitted request for ${cart.length} item(s).`);

        // Simulate network delay for sending the request to the clinic
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                setCart([]);
                resolve();
            }, 1000);
        });
    };

    const login = (email: string, role: Role) => {
        if (role === "ADMIN" || role === "SUPERADMIN") {
            const adminUser = { id: "admin1", role: role as Role, name: "Dr. Kitchens" };
            setCurrentUser(adminUser);
            logEvent("USER_LOGIN", `Clinical Staff signed in.`, adminUser);
        } else {
            // Find patient or default to Sarah
            let userObj;
            const patient = patients.find(p => p.email === email);
            if (patient) {
                userObj = { id: patient.id, role: "PATIENT" as Role, name: patient.name };
            } else {
                // Fallback for demo
                userObj = { id: MOCK_PATIENTS[0].id, role: "PATIENT" as Role, name: MOCK_PATIENTS[0].name };
            }
            setCurrentUser(userObj);
            logEvent("PATIENT_LOGIN", `Patient Portal session started.`, userObj);
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

        supabase.from('patients').insert({
            id: newPatient.id,
            name: newPatient.name,
            email: newPatient.email,
            active_treatment: newPatient.activeTreatment,
            forms_status: newPatient.formsStatus,
            approval_status: newPatient.approvalStatus,
            required_forms: newPatient.requiredForms,
            completed_forms: newPatient.completedForms
        }).then();

        const userObj = { id: newPatient.id, role: "PATIENT" as Role, name: newPatient.name };
        setCurrentUser(userObj);
        logEvent("PATIENT_REGISTERED", `New patient lead registered: ${email}`, userObj);
    };

    const submitForm = (formId: string) => {
        if (currentUser?.role === "PATIENT") {
            setPatients(prev => prev.map(p => {
                if (p.id === currentUser.id) {
                    const updatedCompleted = p.completedForms.includes(formId) ? p.completedForms : [...p.completedForms, formId];
                    // Check if all required are completed
                    const allDone = p.requiredForms.every(req => updatedCompleted.includes(req));
                    const updatedPatient = {
                        ...p,
                        completedForms: updatedCompleted,
                        formsStatus: (allDone ? "COMPLETED" : "PENDING") as "COMPLETED" | "PENDING",
                        approvalStatus: (allDone ? "PENDING_APPROVAL" : "PENDING_FORMS") as "PENDING_APPROVAL" | "PENDING_FORMS"
                    };

                    supabase.from('patients').update({
                        completed_forms: updatedPatient.completedForms,
                        forms_status: updatedPatient.formsStatus,
                        approval_status: updatedPatient.approvalStatus
                    }).eq('id', p.id).then();

                    return updatedPatient;
                }
                return p;
            }));
            logEvent("FORM_SUBMITTED", `Patient completed form: ${formId}`);
        }
    };

    const logout = () => {
        logEvent("USER_LOGOUT", `Session ended`);
        setCurrentUser(null);
    };

    const addCharge = (chargeData: Omit<Charge, "id" | "date" | "status">) => {
        const newCharge: Charge = {
            ...chargeData,
            id: `c${Date.now()}`,
            status: "PENDING",
            date: new Date().toISOString().split('T')[0],
        };
        setCharges(prev => [newCharge, ...prev]);

        supabase.from('charges').insert({
            id: newCharge.id,
            patient_id: newCharge.patientId,
            amount: newCharge.amount,
            description: newCharge.description,
            status: newCharge.status,
            date: newCharge.date
        }).then();

        logEvent("CHARGE_CREATED", `Created charge $${chargeData.amount} for patient ${chargeData.patientId}`);
    };

    const payCharge = (chargeId: string) => {
        setCharges(prev => prev.map(c =>
            c.id === chargeId ? { ...c, status: "PAID" } : c
        ));
        supabase.from('charges').update({ status: "PAID" }).eq('id', chargeId).then();
        logEvent("PAYMENT_PROCESSED", `Charge ${chargeId} marked as PAID`);
    };

    const authorizeTreatment = (patientId: string, amount: number, description: string) => {
        // Change status to approved
        setPatients(prev => prev.map(p =>
            p.id === patientId ? { ...p, approvalStatus: "APPROVED" } : p
        ));
        supabase.from('patients').update({ approval_status: "APPROVED" }).eq('id', patientId).then();
        // Add the authorized charge
        addCharge({ patientId, amount, description });
    };

    const enrollTreatment = (patientId: string, treatment: string) => {
        setPatients(prev => prev.map(p => {
            if (p.id === patientId) {
                const newRequired = getRequiredFormsForTreatment(treatment);
                const combinedRequired = Array.from(new Set([...p.requiredForms, ...newRequired]));
                const allDone = combinedRequired.every(req => p.completedForms.includes(req));
                const updatedPatient = {
                    ...p,
                    activeTreatment: p.activeTreatment === "Pending Evaluation" ? treatment : `${p.activeTreatment} + ${treatment}`,
                    requiredForms: combinedRequired,
                    formsStatus: (allDone ? "COMPLETED" : "PENDING") as "COMPLETED" | "PENDING",
                    approvalStatus: (allDone ? "PENDING_APPROVAL" : "PENDING_FORMS") as "PENDING_APPROVAL" | "PENDING_FORMS"
                };

                supabase.from('patients').update({
                    active_treatment: updatedPatient.activeTreatment,
                    required_forms: updatedPatient.requiredForms,
                    forms_status: updatedPatient.formsStatus,
                    approval_status: updatedPatient.approvalStatus
                }).eq('id', p.id).then();

                return updatedPatient;
            }
            return p;
        }));
        logEvent("TREATMENT_ENROLLED", `Patient ${patientId} enrolled in ${treatment}`);
    };

    const addRequiredFormToPatient = (patientId: string, formSlug: string) => {
        setPatients(prev => prev.map(p => {
            if (p.id === patientId) {
                // Return early if already required
                if (p.requiredForms.includes(formSlug)) return p;

                const combinedRequired = [...p.requiredForms, formSlug];
                const allDone = combinedRequired.every(req => p.completedForms.includes(req));

                const updatedPatient = {
                    ...p,
                    requiredForms: combinedRequired,
                    formsStatus: (allDone ? "COMPLETED" : "PENDING") as "COMPLETED" | "PENDING",
                    approvalStatus: (allDone ? "PENDING_APPROVAL" : "PENDING_FORMS") as "PENDING_APPROVAL" | "PENDING_FORMS"
                };

                supabase.from('patients').update({
                    required_forms: updatedPatient.requiredForms,
                    forms_status: updatedPatient.formsStatus,
                    approval_status: updatedPatient.approvalStatus
                }).eq('id', p.id).then();

                return updatedPatient;
            }
            return p;
        }));
    };

    return (
        <AppContext.Provider value={{
            currentUser, login, logout, patients, charges, addCharge, payCharge, registerAndLogin, submitForm, authorizeTreatment, enrollTreatment, addRequiredFormToPatient, selectedGlobalPatientId, setSelectedGlobalPatientId,
            cart, addToCart, removeFromCart, clearCart, submitCartRequest,
            adminNotifications, sendAdminNotification, markNotificationRead,
            auditLogs, logEvent
        }}>
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
