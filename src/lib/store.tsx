"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase, getTenantIdFromBrowser } from "@/lib/supabase";
import { toast } from "sonner";
import { signInWithCredentials, getRoleFromUserMetadata } from "@/lib/auth";

// Types
export type Role = "PATIENT" | "ADMIN" | "SUPERADMIN" | "RECEPTION" | "DOCTOR" | null;

export type AuditCategory = "AUTH" | "PHI_ACCESS" | "CLINICAL" | "BILLING" | "ADMIN" | "SYSTEM" | "GENERAL" | "COMPLIANCE";

export interface AuditLog {
    id: string;
    action: string;
    category: AuditCategory;
    userId: string;
    userName: string;
    userRole: Role;
    details: string;
    resourceType?: string;
    resourceId?: string;
    ipAddress?: string;
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
    approvalStatus: "PENDING_FORMS" | "PENDING_APPROVAL" | "PENDING_PAYMENT" | "PENDING_SHIPMENT" | "APPROVED";
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
    type: "MESSAGE" | "CART_REQUEST" | "SYSTEM_ALERT";
    content: string;
    date: string;
    read: boolean;
    data?: any;
}

export interface StaffDocument {
    name: string;
    url: string;
    type: string;
    uploadedAt: string;
    size?: number;
}

export interface Staff {
    id: string;
    name: string;
    email: string;
    role: Role;
    department: string;
    lastActive: string;
    // Extended Expedient Fields
    address?: string;
    phone?: string;
    licenseNumber?: string;
    notes?: string;
    documents?: StaffDocument[];
    supabaseUserId?: string;
    ndaSignedAt?: string | null;
}

interface AppContextType {
    currentUser: { id: string; role: Role; name: string; ndaSignedAt?: string | null } | null;
    isAuthLoading: boolean;
    login: (email: string, role: Role) => void;
    logout: () => void;
    patients: Patient[];
    charges: Charge[];
    addCharge: (charge: Omit<Charge, "id" | "date" | "status">) => void;
    payCharge: (chargeId: string) => Promise<void>;
    registerAndLogin: (name: string, email: string) => void;
    submitForm: (formId: string) => void;
    authorizeTreatment: (patientId: string, amount: number, description: string) => void;
    markAsShipped: (patientId: string) => Promise<void>;
    enrollTreatment: (patientId: string, treatment: string) => void;
    addRequiredFormToPatient: (patientId: string, formSlug: string) => void;
    // Core Navigation State
    selectedGlobalPatientId: string | null;
    setSelectedGlobalPatientId: (id: string | null) => void;
    // Patient Management Actions
    updatePatient: (patientId: string, updates: Partial<Patient>) => Promise<void>;
    deletePatient: (patientId: string) => Promise<void>;
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
    logEvent: (action: string, details: string, category?: AuditCategory, resourceType?: string, resourceId?: string, actorOverride?: { id: string, name: string, role: Role }) => void;
    // Staff Management
    staff: Staff[];
    addStaff: (staffObj: Omit<Staff, "id" | "lastActive" | "documents"> & { password?: string }) => Promise<void>;
    updateStaff: (id: string, updates: Partial<Omit<Staff, "id">>) => Promise<void>;
    deleteStaff: (id: string) => Promise<void>;
    uploadStaffDocument: (staffId: string, file: File) => Promise<void>;
    deleteStaffDocument: (staffId: string, docName: string) => Promise<void>;
    loginWithCredentials: (email: string, password: string) => Promise<void>;
    // NDA / Confidentiality Agreement
    signNDA: () => Promise<void>;
    // Consent Form Persistence
    saveConsentForm: (patientId: string, formSlug: string, formData: Record<string, any>, signature: { fullName: string; image: string; timestamp: string }) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children, initialUser = null }: { children: ReactNode, initialUser?: any }) {
    const [currentUser, setCurrentUser] = useState<AppContextType["currentUser"]>(initialUser);
    const [isAuthLoading, setIsAuthLoading] = useState(!initialUser);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [charges, setCharges] = useState<Charge[]>([]);
    const [selectedGlobalPatientId, setSelectedGlobalPatientId] = useState<string | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    // ─── Multi-Tenant ────────────────────────────────────────────────────
    const [tenantId, setTenantId] = useState<string>('');

    useEffect(() => {
        const tid = getTenantIdFromBrowser();
        if (tid) setTenantId(tid);

        // Set tenant context for RLS before any queries
        const initTenant = async (tid: string) => {
            if (tid) {
                const { error } = await supabase.rpc('set_config', {
                    setting_name: 'app.tenant_id',
                    setting_value: tid,
                    is_local: false,
                });
                if (error) console.warn('[MedFit] set_config RPC failed:', error.message);
            }
        };

        const fetchInitialData = async () => {
            const resolvedTid = tid || getTenantIdFromBrowser();
            if (resolvedTid) await initTenant(resolvedTid);

            // Fetch Current Session Status FIRST to unblock routing (if not already primed by SSR)
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (session?.user) {
                // Determine base role
                const baseRole = getRoleFromUserMetadata(session.user) as Role;
                // Try to find staff member for enriched data
                const { data: staffData } = await supabase.from('staff').select('*').eq('email', session.user.email).maybeSingle();

                const role = staffData?.role || baseRole || 'ADMIN';
                const name = staffData?.name || session.user.user_metadata?.name || session.user.email || 'Staff';
                const ndaSignedAt = staffData?.nda_signed_at || null;

                setCurrentUser({
                    id: staffData?.id || session.user.id,
                    role: role as Role,
                    name,
                    ndaSignedAt
                });
            } else if (!session?.user && document.cookie.includes('demo_patient_session')) {
                // If the user has a demo session cookie, we don't clear it. Hydrate it fully below...
            } else {
                // Only clear if neither exists
                if (currentUser?.id === "ssr-shell") setCurrentUser(null);
            }
            setIsAuthLoading(false);

            // Fetch Patients from Supabase
            const { data: pData, error: pErr } = await supabase.from('patients').select('*');
            if (pErr) console.error('[MedFit] Error fetching patients:', pErr.message);
            if (pData) {
                setPatients(pData.map(p => ({
                    id: p.id, name: p.name, email: p.email, phone: p.phone,
                    address: p.address, dob: p.dob,
                    activeTreatment: p.active_treatment,
                    formsStatus: p.forms_status,
                    approvalStatus: p.approval_status,
                    requiredForms: p.required_forms || [],
                    completedForms: p.completed_forms || [],
                })));
            }

            // Fetch Charges
            const { data: cData, error: cErr } = await supabase.from('charges').select('*');
            if (cErr) console.error('[MedFit] Error fetching charges:', cErr.message);
            if (cData) {
                setCharges(cData.map(c => ({
                    id: c.id, patientId: c.patient_id, amount: Number(c.amount),
                    description: c.description, status: c.status, date: c.date
                })));
            }

            // Fetch Audit Logs
            const { data: aData, error: aErr } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
            if (aErr) console.error('[MedFit] Error fetching audit logs:', aErr.message);
            if (aData) {
                setAuditLogs(aData.map(a => ({
                    id: a.id, action: a.action,
                    category: (a.category ?? 'GENERAL') as AuditCategory,
                    userId: a.user_id, userName: a.user_name, userRole: a.user_role as Role,
                    details: a.details, resourceType: a.resource_type, resourceId: a.resource_id,
                    ipAddress: a.ip_address, timestamp: a.timestamp
                })));
            }

            // Fetch Notifications
            const { data: nData, error: nErr } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50);
            if (nErr) console.error('[MedFit] Error fetching notifications:', nErr.message);
            if (nData) {
                setAdminNotifications(nData.map(n => ({
                    id: n.id, patientId: n.patient_id, patientName: n.patient_name,
                    type: n.type, content: n.content, date: n.created_at,
                    read: n.read, data: n.data
                })));
            }

            // Fetch Staff
            const { data: sData, error: sErr } = await supabase.from('staff').select('*');
            if (sErr) console.error('[MedFit] Error fetching staff:', sErr.message);
            if (sData) {
                setStaff(sData.map(s => ({
                    id: s.id, name: s.name, email: s.email,
                    role: s.role as Role, department: s.department,
                    lastActive: s.last_active,
                    address: s.address, phone: s.phone,
                    licenseNumber: s.license_number, notes: s.notes,
                    documents: s.documents || [], supabaseUserId: s.supabase_user_id
                })));
            }
        };

        fetchInitialData();

        // --- Supabase Realtime Subscriptions ---
        // 1. Listen for new admin notifications in real-time
        const notificationsChannel = supabase
            .channel('notifications-realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
                const n = payload.new as any;
                const newNotif: AdminNotification = {
                    id: n.id,
                    patientId: n.patient_id,
                    patientName: n.patient_name,
                    type: n.type,
                    content: n.content,
                    date: n.created_at,
                    read: n.read,
                    data: n.data
                };
                setAdminNotifications(prev => [newNotif, ...prev]);
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications' }, (payload) => {
                const n = payload.new as any;
                setAdminNotifications(prev => prev.map(existing =>
                    existing.id === n.id ? { ...existing, read: n.read } : existing
                ));
            })
            .subscribe();

        // 2. Listen for patient record changes in real-time (approval_status, etc.)
        const patientsChannel = supabase
            .channel('patients-realtime')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'patients' }, (payload) => {
                const p = payload.new as any;
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
            .subscribe();

        // 3. Listen for new charges in real-time
        const chargesChannel = supabase
            .channel('charges-realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'charges' }, (payload) => {
                const c = payload.new as any;
                const newCharge: Charge = {
                    id: c.id, patientId: c.patient_id, amount: Number(c.amount),
                    description: c.description, status: c.status, date: c.date
                };
                setCharges(prev => [newCharge, ...prev]);
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'charges' }, (payload) => {
                const c = payload.new as any;
                setCharges(prev => prev.map(charge =>
                    charge.id === c.id ? { ...charge, status: c.status } : charge
                ));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(notificationsChannel);
            supabase.removeChannel(patientsChannel);
            supabase.removeChannel(chargesChannel);
        };
    }, []);

    const logEvent = (action: string, details: string, category: AuditCategory = "GENERAL", resourceType?: string, resourceId?: string, actorOverride?: { id: string, name: string, role: Role }) => {
        const actor = actorOverride || currentUser || { id: "system", name: "System", role: "SUPERADMIN" as Role };
        const newLog: AuditLog = {
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            action,
            category,
            userId: actor.id,
            userName: actor.name,
            userRole: actor.role,
            details,
            resourceType,
            resourceId,
            timestamp: new Date().toISOString()
        };
        setAuditLogs(prev => [newLog, ...prev].slice(0, 200));

        // Persist to Supabase (fire-and-forget)
        supabase.from('audit_logs').insert({
            id: newLog.id,
            action: newLog.action,
            category: newLog.category,
            user_id: newLog.userId,
            user_name: newLog.userName,
            user_role: newLog.userRole,
            details: newLog.details,
            resource_type: newLog.resourceType,
            resource_id: newLog.resourceId,
            timestamp: newLog.timestamp,
            tenant_id: tenantId || undefined
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
            id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            date: new Date().toISOString(),
            read: false,
        };
        setAdminNotifications(prev => [newNotif, ...prev]);

        // Supabase insertion
        supabase.from('notifications').insert({
            id: newNotif.id,
            patient_id: newNotif.patientId,
            patient_name: newNotif.patientName,
            type: newNotif.type,
            content: newNotif.content,
            read: newNotif.read,
            data: newNotif.data,
            created_at: newNotif.date,
            tenant_id: tenantId || undefined
        }).then();
    };

    const markNotificationRead = (id: string) => {
        setAdminNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

        // Supabase update
        supabase.from('notifications').update({ read: true }).eq('id', id).then();
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
            logEvent("USER_LOGIN", `Clinical Staff signed in (demo mode).`, "AUTH", "staff", adminUser.id, adminUser);
        } else {
            // Find patient by email or use first available patient
            let userObj;
            const patient = patients.find(p => p.email === email);
            if (patient) {
                userObj = { id: patient.id, role: "PATIENT" as Role, name: patient.name };
            } else if (patients.length > 0) {
                userObj = { id: patients[0].id, role: "PATIENT" as Role, name: patients[0].name };
            } else {
                toast.error("No patient records found. Please register first.");
                return;
            }
            setCurrentUser(userObj);
            document.cookie = `demo_patient_session=${userObj.id}; path=/; max-age=86400; SameSite=Lax`;
            logEvent("PATIENT_LOGIN", `Patient Portal session started.`, "AUTH", "patient", userObj.id, userObj);
        }
    };

    // Real Supabase Auth login for Clinical Staff
    const loginWithCredentials = async (email: string, password: string) => {
        const data = await signInWithCredentials(email, password);
        const authUser = data.user;
        if (!authUser) throw new Error("Authentication failed.");

        // Cross-reference with our staff table by email to get role & name
        const staffMember = staff.find(s => s.email === authUser.email);
        const role: Role = staffMember?.role
            ?? (getRoleFromUserMetadata(authUser) as Role)
            ?? "ADMIN";
        const name = staffMember?.name ?? authUser.user_metadata?.name ?? authUser.email ?? "Staff";
        const id = staffMember?.id ?? authUser.id;

        const ndaSignedAt = staffMember?.ndaSignedAt ?? null;
        const userObj = { id, role, name, ndaSignedAt };
        setCurrentUser(userObj);
        logEvent("STAFF_LOGIN", `${name} (${role}) signed in via Supabase Auth.`, "AUTH", "staff", id, userObj);
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
            completed_forms: newPatient.completedForms,
            tenant_id: tenantId || undefined
        }).then();

        const userObj = { id: newPatient.id, role: "PATIENT" as Role, name: newPatient.name };
        setCurrentUser(userObj);
        document.cookie = `demo_patient_session=${userObj.id}; path=/; max-age=86400; SameSite=Lax`;
        logEvent("PATIENT_REGISTERED", `New patient lead registered: ${email}`, "AUTH", "patient", newPatient.id, userObj);
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
            logEvent("FORM_SUBMITTED", `Patient completed form: ${formId}`, "CLINICAL", "form", formId);
        }
    };

    const logout = () => {
        document.cookie = 'demo_patient_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        logEvent("USER_LOGOUT", `Session ended`, "AUTH");
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
            date: newCharge.date,
            tenant_id: tenantId || undefined
        }).then();

        logEvent("CHARGE_CREATED", `Created charge $${chargeData.amount} for patient ${chargeData.patientId}`, "BILLING", "charge");
    };

    const payCharge = async (chargeId: string) => {
        const charge = charges.find(c => c.id === chargeId);

        setCharges(prev => prev.map(c =>
            c.id === chargeId ? { ...c, status: "PAID" } : c
        ));
        await supabase.from('charges').update({ status: "PAID" }).eq('id', chargeId);
        logEvent("PAYMENT_PROCESSED", `Charge ${chargeId} marked as PAID`, "BILLING", "charge", chargeId);

        if (charge) {
            const patient = patients.find(p => p.id === charge.patientId);
            if (patient) {
                // If they pay for their initial evaluation, move them to PENDING_SHIPMENT.
                if (patient.approvalStatus === "PENDING_APPROVAL" || patient.approvalStatus === "PENDING_FORMS" || patient.approvalStatus === "PENDING_PAYMENT") {
                    setPatients(prev => prev.map(p =>
                        p.id === patient.id ? { ...p, approvalStatus: "PENDING_SHIPMENT" } : p
                    ));
                    await supabase.from('patients').update({ approval_status: "PENDING_SHIPMENT" }).eq('id', patient.id);
                }

                // Notify Admins about the payment
                sendAdminNotification({
                    patientId: patient.id,
                    patientName: patient.name,
                    type: "SYSTEM_ALERT",
                    content: `Payment of $${charge.amount.toFixed(2)} received for ${charge.description}.`,
                });
            }
        }
    };

    const authorizeTreatment = (patientId: string, amount: number, description: string) => {
        // Change status to pending payment
        setPatients(prev => prev.map(p =>
            p.id === patientId ? { ...p, approvalStatus: "PENDING_PAYMENT" } : p
        ));
        supabase.from('patients').update({ approval_status: "PENDING_PAYMENT" }).eq('id', patientId).then();
        // Add the authorized charge
        addCharge({ patientId, amount, description });
    };

    const markAsShipped = async (patientId: string) => {
        const patient = patients.find(p => p.id === patientId);
        if (!patient) return;

        setPatients(prev => prev.map(p =>
            p.id === patientId ? { ...p, approvalStatus: "APPROVED" } : p
        ));
        await supabase.from('patients').update({ approval_status: "APPROVED" }).eq('id', patientId);

        // Notify patient that their meds have shipped (via audit log / mock)
        logEvent("MEDICATION_SHIPPED", `Medications shipped for ${patient.name}`);

        toast.success("Case Closed & Shipped", {
            description: `Tracking info has been sent to ${patient.name}.`,
        });
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

    const updatePatient = async (patientId: string, updates: Partial<Patient>) => {
        setPatients(prev => prev.map(p => p.id === patientId ? { ...p, ...updates } : p));

        // Map camelCase to snake_case for Supabase
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.email !== undefined) dbUpdates.email = updates.email;
        if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
        if (updates.address !== undefined) dbUpdates.address = updates.address;
        if (updates.dob !== undefined) dbUpdates.dob = updates.dob;
        if (updates.activeTreatment !== undefined) dbUpdates.active_treatment = updates.activeTreatment;
        if (updates.approvalStatus !== undefined) dbUpdates.approval_status = updates.approvalStatus;

        if (Object.keys(dbUpdates).length > 0) {
            await supabase.from('patients').update(dbUpdates).eq('id', patientId);
        }

        logEvent("PATIENT_UPDATED", `Updated profile for patient ${patientId}`);
    };

    const deletePatient = async (patientId: string) => {
        // Find the patient before deleting for notification purposes
        let deletedPatientName: string | undefined;
        setPatients(prev => {
            const patientToDelete = prev.find(p => p.id === patientId);
            if (patientToDelete) {
                deletedPatientName = patientToDelete.name;
            }
            // Optimistic UI update: remove from local state first for instant response
            return prev.filter(p => p.id !== patientId);
        });

        if (selectedGlobalPatientId === patientId) {
            setSelectedGlobalPatientId(null);
        }

        // Create a notification for the deletion
        if (deletedPatientName) {
            sendAdminNotification({
                patientId: patientId,
                patientName: deletedPatientName,
                type: "SYSTEM_ALERT",
                content: `Patient profile for ${deletedPatientName} was permanently deleted from the system.`,
            });
        }

        // Persist to Supabase
        const { error } = await supabase.from('patients').delete().eq('id', patientId);
        if (error) {
            console.error('[MedFit] Supabase deletePatient error:', error.message, error);
            // Note: We do NOT revert the local state here — the optimistic delete stands
            // for this demo context to ensure the UI reflects the action clearly.
            logEvent("PATIENT_DELETE_ERROR", `Supabase error deleting ${patientId}: ${error.message}`);
        } else {
            logEvent("PATIENT_DELETED", `Permanently deleted patient record ${patientId}`);
        }
    };

    const addStaff = async (staffObj: Omit<Staff, "id" | "lastActive" | "documents"> & { password?: string }) => {
        const { password, ...staffData } = staffObj;
        const newStaff: Staff = {
            ...staffData,
            id: `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            lastActive: new Date().toISOString(),
            documents: [],
        };
        setStaff(prev => [...prev, newStaff]);

        // Persist to Supabase staff table
        await supabase.from('staff').insert({
            id: newStaff.id,
            name: newStaff.name,
            email: newStaff.email,
            role: newStaff.role,
            department: newStaff.department,
            address: newStaff.address,
            phone: newStaff.phone,
            license_number: newStaff.licenseNumber,
            notes: newStaff.notes,
            documents: newStaff.documents,
            last_active: newStaff.lastActive,
            tenant_id: tenantId || undefined
        });

        // If a password is provided, create the Supabase Auth user so they can log in
        if (password) {
            try {
                const res = await fetch("/api/admin/create-staff-user", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: newStaff.email,
                        password,
                        metadata: { name: newStaff.name, role: newStaff.role, department: newStaff.department, staffId: newStaff.id }
                    }),
                });
                if (!res.ok) {
                    const err = await res.json();
                    toast.error(`Auth account error: ${err.error}`);
                } else {
                    const authData = await res.json();
                    // Link Supabase Auth user_id to our staff record
                    await supabase.from('staff').update({ supabase_user_id: authData.userId }).eq('id', newStaff.id);
                    toast.success(`Login credentials created for ${newStaff.name}`);
                }
            } catch (e: any) {
                toast.error(`Failed to create auth account: ${e.message}`);
            }
        }

        logEvent("STAFF_ADDED", `Invited new staff member: ${newStaff.name} (${newStaff.role})`);
    };

    const updateStaff = async (id: string, updates: Partial<Omit<Staff, "id">>) => {
        setStaff(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.email !== undefined) dbUpdates.email = updates.email;
        if (updates.role !== undefined) dbUpdates.role = updates.role;
        if (updates.department !== undefined) dbUpdates.department = updates.department;
        if (updates.lastActive !== undefined) dbUpdates.last_active = updates.lastActive;

        await supabase.from('staff').update(dbUpdates).eq('id', id);

        logEvent("STAFF_UPDATED", `Updated staff profile for ID: ${id}`);
    };

    const deleteStaff = async (id: string) => {
        setStaff(prev => prev.filter(s => s.id !== id));
        await supabase.from('staff').delete().eq('id', id);
        logEvent("STAFF_DELETED", `Removed staff member access for ID: ${id}`);
    };

    // Upload document to Supabase Storage and link to staff record
    const uploadStaffDocument = async (staffId: string, file: File) => {
        const ext = file.name.split('.').pop();
        const fileName = `${Date.now()}_${file.name}`;
        const path = `${staffId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('staff-documents')
            .upload(path, file, { upsert: false });

        if (uploadError) {
            toast.error(`Upload failed: ${uploadError.message}`);
            return;
        }

        const { data: urlData } = supabase.storage.from('staff-documents').getPublicUrl(path);
        const publicUrl = urlData.publicUrl;

        const newDoc: import("@/lib/store").StaffDocument = {
            name: file.name,
            url: publicUrl,
            type: file.type || ext || 'unknown',
            uploadedAt: new Date().toISOString(),
            size: file.size,
        };

        setStaff(prev => prev.map(s => {
            if (s.id !== staffId) return s;
            const updatedDocs = [...(s.documents || []), newDoc];
            supabase.from('staff').update({ documents: updatedDocs }).eq('id', staffId).then();
            return { ...s, documents: updatedDocs };
        }));

        toast.success(`${file.name} uploaded successfully`);
        logEvent("STAFF_DOCUMENT_UPLOADED", `Document "${file.name}" uploaded for staff ID: ${staffId}`);
    };

    // Delete document from Supabase Storage and remove from staff record
    const deleteStaffDocument = async (staffId: string, docName: string) => {
        const staffMember = staff.find(s => s.id === staffId);
        if (!staffMember) return;

        const doc = staffMember.documents?.find(d => d.name === docName);
        if (!doc) return;

        // Extract storage path from URL
        const urlParts = doc.url.split('/staff-documents/');
        if (urlParts.length > 1) {
            await supabase.storage.from('staff-documents').remove([urlParts[1]]);
        }

        const updatedDocs = (staffMember.documents || []).filter(d => d.name !== docName);
        setStaff(prev => prev.map(s =>
            s.id === staffId ? { ...s, documents: updatedDocs } : s
        ));
        await supabase.from('staff').update({ documents: updatedDocs }).eq('id', staffId);
        toast.success(`Document "${docName}" deleted.`);
        logEvent("STAFF_DOCUMENT_DELETED", `Document "${docName}" removed for staff ID: ${staffId}`);
    };

    // ─── Consent Form Persistence ────────────────────────────────────────
    const saveConsentForm = async (
        patientId: string,
        formSlug: string,
        formData: Record<string, any>,
        signature: { fullName: string; image: string; timestamp: string }
    ) => {
        const { error } = await supabase.from('consent_forms').upsert({
            patient_id: patientId,
            form_slug: formSlug,
            form_data: formData,
            signature_name: signature.fullName,
            signature_image: signature.image,
            signed_at: signature.timestamp,
            tenant_id: tenantId || undefined
        }, { onConflict: 'patient_id,form_slug' });

        if (error) {
            console.error('[MedFit] Error saving consent form:', error);
            toast.error('Failed to save consent form. Please try again.');
            return;
        }

        logEvent("CONSENT_FORM_SIGNED", `Patient signed ${formSlug}`, "CLINICAL", "consent_form", formSlug);
        toast.success('Consent form saved securely.');
    };

    // ─── NDA / Confidentiality Agreement ──────────────────────────────
    const signNDA = async () => {
        if (!currentUser) return;
        const now = new Date().toISOString();
        // Get IP address for legal audit trail
        let ipAddress = 'unknown';
        try {
            const ipRes = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipRes.json();
            ipAddress = ipData.ip;
        } catch { /* fallback */ }

        // Update Supabase
        const { error } = await supabase
            .from('staff')
            .update({ nda_signed_at: now, nda_ip_address: ipAddress })
            .eq('id', currentUser.id);

        if (error) {
            console.error('[MedFit] NDA sign error:', error);
            toast.error('Failed to save NDA signature. Please try again.');
            return;
        }

        // Update local state
        setCurrentUser({ ...currentUser, ndaSignedAt: now });
        logEvent('NDA_SIGNED', `${currentUser.name} signed the Confidentiality & Data Handling Agreement. IP: ${ipAddress}`, 'COMPLIANCE', 'staff', currentUser.id);
        toast.success('Confidentiality Agreement signed successfully.');
    };

    return (
        <AppContext.Provider value={{
            currentUser, isAuthLoading, login, logout, loginWithCredentials, patients, charges, addCharge, payCharge, registerAndLogin, submitForm, authorizeTreatment, markAsShipped, enrollTreatment, addRequiredFormToPatient, selectedGlobalPatientId, setSelectedGlobalPatientId,
            updatePatient, deletePatient,
            cart, addToCart, removeFromCart, clearCart, submitCartRequest,
            adminNotifications, sendAdminNotification, markNotificationRead,
            auditLogs, logEvent,
            staff, addStaff, updateStaff, deleteStaff, uploadStaffDocument, deleteStaffDocument,
            signNDA, saveConsentForm
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
