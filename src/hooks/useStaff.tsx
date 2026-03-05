"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { Staff, StaffDocument } from "@/types/staff";
import { StaffService } from "@/services/staff.service";
import { AuditService } from "@/services/audit.service";
import { useAuth } from "@/hooks/useAuth";
import { supabase, getTenantIdFromBrowser } from "@/lib/supabase";
import { toast } from "sonner";

interface StaffContextType {
    staff: Staff[];
    isStaffLoading: boolean;
    refreshStaff: () => Promise<void>;
    addStaff: (staffObj: Omit<Staff, "id" | "lastActive" | "documents"> & { password?: string }) => Promise<void>;
    updateStaff: (id: string, updates: Partial<Omit<Staff, "id">>) => Promise<void>;
    deleteStaff: (id: string) => Promise<void>;
    uploadStaffDocument: (staffId: string, file: File) => Promise<void>;
    deleteStaffDocument: (staffId: string, docName: string) => Promise<void>;
}

const StaffContext = createContext<StaffContextType | undefined>(undefined);

export function StaffProvider({ children }: { children: ReactNode }) {
    const { currentUser } = useAuth();
    const [staff, setStaff] = useState<Staff[]>([]);
    const [isStaffLoading, setIsStaffLoading] = useState(true);

    const refreshStaff = useCallback(async () => {
        setIsStaffLoading(true);
        try {
            const data = await StaffService.getStaff();
            setStaff(data);
        } catch (error) {
            console.error("Failed to fetch staff:", error);
        } finally {
            setIsStaffLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshStaff();
    }, [refreshStaff]);

    const addStaff = useCallback(async (staffObj: Omit<Staff, "id" | "lastActive" | "documents"> & { password?: string }) => {
        const { password, ...staffData } = staffObj;
        const newStaff: Staff = {
            ...staffData,
            id: `s_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            lastActive: new Date().toISOString(),
            documents: [],
        };

        // Optimistic UI Update
        setStaff(prev => [...prev, newStaff]);

        try {
            // First DB entry
            await StaffService.createStaff(newStaff, getTenantIdFromBrowser() || undefined);

            // Auth Proxy if password provided
            if (password) {
                const res = await fetch("/api/admin/create-staff-user", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: newStaff.email,
                        password,
                        metadata: {
                            name: newStaff.name,
                            role: newStaff.role,
                            department: newStaff.department,
                            staffId: newStaff.id,
                            tenantId: getTenantIdFromBrowser() || undefined
                        }
                    }),
                });

                if (!res.ok) {
                    const err = await res.json();
                    toast.error(`Auth account error: ${err.error}`);
                } else {
                    const authData = await res.json();
                    await StaffService.updateStaff(newStaff.id, { supabaseUserId: authData.userId });
                    setStaff(prev => prev.map(s => s.id === newStaff.id ? { ...s, supabaseUserId: authData.userId } : s));
                    toast.success(`Login credentials created for ${newStaff.name}`);
                }
            }

            AuditService.logEvent({
                action: "STAFF_ADDED",
                category: "ADMIN",
                details: `Invited new staff member: ${newStaff.name} (${newStaff.role})`,
                userId: currentUser?.id || "system",
                userName: currentUser?.name || "System",
                userRole: currentUser?.role || ("SUPERADMIN" as any)
            }, getTenantIdFromBrowser() || undefined);

        } catch (error: any) {
            toast.error(`Failed to create staff: ${error.message}`);
            // Rollback optimistic update
            setStaff(prev => prev.filter(s => s.id !== newStaff.id));
        }
    }, [currentUser]);

    const updateStaff = useCallback(async (id: string, updates: Partial<Omit<Staff, "id">>) => {
        setStaff(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
        try {
            await StaffService.updateStaff(id, updates);
            AuditService.logEvent({
                action: "STAFF_UPDATED",
                category: "ADMIN",
                details: `Updated staff profile for ID: ${id}`,
                userId: currentUser?.id || "system",
                userName: currentUser?.name || "System",
                userRole: currentUser?.role || ("SUPERADMIN" as any)
            }, getTenantIdFromBrowser() || undefined);
        } catch (error: any) {
            toast.error(`Failed to update staff: ${error.message}`);
        }
    }, [currentUser]);

    const deleteStaff = useCallback(async (id: string) => {
        setStaff(prev => prev.filter(s => s.id !== id));
        try {
            await StaffService.deleteStaff(id);
            AuditService.logEvent({
                action: "STAFF_DELETED",
                category: "ADMIN",
                details: `Removed staff member access for ID: ${id}`,
                userId: currentUser?.id || "system",
                userName: currentUser?.name || "System",
                userRole: currentUser?.role || ("SUPERADMIN" as any)
            }, getTenantIdFromBrowser() || undefined);
        } catch (error: any) {
            toast.error(`Failed to delete staff: ${error.message}`);
        }
    }, [currentUser]);

    const uploadStaffDocument = useCallback(async (staffId: string, file: File) => {
        try {
            const publicUrl = await StaffService.uploadDocument(staffId, file);
            const newDoc: StaffDocument = {
                name: file.name,
                url: publicUrl,
                type: file.type,
                size: file.size,
                uploadedAt: new Date().toISOString()
            };

            const staffMember = staff.find(s => s.id === staffId);
            if (staffMember) {
                const updatedDocs = [...(staffMember.documents || []), newDoc];
                await StaffService.updateStaff(staffId, { documents: updatedDocs as any });
                setStaff(prev => prev.map(s => s.id === staffId ? { ...s, documents: updatedDocs } : s));

                AuditService.logEvent({
                    action: "STAFF_DOCUMENT_UPLOADED",
                    category: "COMPLIANCE",
                    details: `Document compliance uploaded for staff ID: ${staffId}`,
                    userId: currentUser?.id || "system",
                    userName: currentUser?.name || "System",
                    userRole: currentUser?.role || ("SUPERADMIN" as any)
                }, getTenantIdFromBrowser() || undefined);
            }
        } catch (error: any) {
            toast.error(`Failed to upload document: ${error.message}`);
        }
    }, [staff, currentUser]);

    const deleteStaffDocument = useCallback(async (staffId: string, docName: string) => {
        try {
            await StaffService.deleteDocument(staffId, docName);

            setStaff(prev => prev.map(s => {
                if (s.id === staffId && s.documents) {
                    const newDocs = s.documents.filter(d => d.name !== docName);
                    StaffService.updateStaff(staffId, { documents: newDocs as any }).catch(console.error);
                    return { ...s, documents: newDocs };
                }
                return s;
            }));

            AuditService.logEvent({
                action: "STAFF_DOCUMENT_DELETED",
                category: "COMPLIANCE",
                details: `Document deleted for staff ID: ${staffId}`,
                userId: currentUser?.id || "system",
                userName: currentUser?.name || "System",
                userRole: currentUser?.role || ("SUPERADMIN" as any)
            }, getTenantIdFromBrowser() || undefined);
        } catch (error: any) {
            toast.error(`Failed to delete document: ${error.message}`);
        }
    }, [currentUser]);

    return (
        <StaffContext.Provider value={{
            staff,
            isStaffLoading,
            refreshStaff,
            addStaff,
            updateStaff,
            deleteStaff,
            uploadStaffDocument,
            deleteStaffDocument
        }}>
            {children}
        </StaffContext.Provider>
    );
}

export function useStaff() {
    const context = useContext(StaffContext);
    if (context === undefined) {
        throw new Error("useStaff must be used within a StaffProvider");
    }
    return context;
}
