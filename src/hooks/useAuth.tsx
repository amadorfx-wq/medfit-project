"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { signInWithCredentials, getRoleFromUserMetadata } from "@/lib/auth";
import { Role } from "@/types/staff";
import { AuditService } from "@/services/audit.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AuthUser {
    id: string;
    role: Role;
    name: string;
    ndaSignedAt?: string | null;
    tenantId?: string;
}

interface AuthContextType {
    currentUser: AuthUser | null;
    isAuthLoading: boolean;
    loginWithCredentials: (email: string, password: string) => Promise<void>;
    loginAsDemoPatient: (patientId: string, name: string) => void;
    logout: () => Promise<void>;
    updateUser: (updates: Partial<AuthUser>) => void;
    signNDA: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // 1. Check for real Supabase Session (Staff)
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    const role = getRoleFromUserMetadata(session.user) as Role || "ADMIN";
                    const name = session.user.user_metadata?.name || session.user.email || "Staff";
                    const tenantId = session.user.user_metadata?.tenant_id;

                    let ndaSignedAt: string | null = null;
                    if (role !== "PATIENT") {
                        const { data: staffData } = await supabase
                            .from('staff')
                            .select('nda_signed_at')
                            .eq('supabase_user_id', session.user.id)
                            .single();

                        if (staffData) {
                            ndaSignedAt = staffData.nda_signed_at;
                        }
                    }

                    setCurrentUser({ id: session.user.id, role, name, tenantId, ndaSignedAt });
                } else {
                    // 2. Check for Demo Patient Cookie (Legacy MVP fallback)
                    const cookieMatch = document.cookie.match(/(?:^|; )demo_patient_session=([^;]*)/);
                    if (cookieMatch && cookieMatch[1]) {
                        // We only know their ID. In a real app we'd fetch their profile or use JWT.
                        setCurrentUser({ id: cookieMatch[1], role: "PATIENT", name: "Patient (Demo Session)" });
                    }
                }
            } catch (err) {
                console.error("Auth init error:", err);
            } finally {
                setIsAuthLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                const role = getRoleFromUserMetadata(session.user) as Role || "ADMIN";
                const name = session.user.user_metadata?.name || session.user.email || "Staff";
                const tenantId = session.user.user_metadata?.tenant_id;

                let ndaSignedAt: string | null = null;
                if (role !== "PATIENT") {
                    const { data: staffData } = await supabase
                        .from('staff')
                        .select('nda_signed_at')
                        .eq('supabase_user_id', session.user.id)
                        .single();

                    if (staffData) {
                        ndaSignedAt = staffData.nda_signed_at;
                    }
                }

                setCurrentUser({ id: session.user.id, role, name, tenantId, ndaSignedAt });
            } else if (event === 'SIGNED_OUT') {
                setCurrentUser(null);
                document.cookie = 'demo_patient_session=; path=/; max-age=0; SameSite=Lax';
                // Force reload to clear all states
                window.location.href = '/login';
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const loginWithCredentials = async (email: string, password: string) => {
        setIsAuthLoading(true);
        try {
            const data = await signInWithCredentials(email, password);
            if (!data.user) throw new Error("Authentication failed.");

            const role = getRoleFromUserMetadata(data.user) as Role || "ADMIN";
            const name = data.user.user_metadata?.name || data.user.email || "Staff";
            const tenantId = data.user.user_metadata?.tenant_id;

            let ndaSignedAt: string | null = null;
            if (role !== "PATIENT") {
                const { data: staffData } = await supabase
                    .from('staff')
                    .select('nda_signed_at')
                    .eq('supabase_user_id', data.user.id)
                    .single();

                if (staffData) {
                    ndaSignedAt = staffData.nda_signed_at;
                }
            }

            setCurrentUser({ id: data.user.id, role, name, tenantId, ndaSignedAt });
            toast.success(`Welcome back, ${name}`);
        } finally {
            setIsAuthLoading(false);
        }
    };

    const loginAsDemoPatient = (patientId: string, name: string) => {
        const userObj = { id: patientId, role: "PATIENT" as Role, name };
        setCurrentUser(userObj);
        document.cookie = `demo_patient_session=${patientId}; path=/; max-age=86400; SameSite=Lax`;
    };

    const logout = async () => {
        setIsAuthLoading(true);
        try {
            if (currentUser?.role === "PATIENT") {
                setCurrentUser(null);
                document.cookie = 'demo_patient_session=; path=/; max-age=0; SameSite=Lax';
                window.location.href = '/login';
            } else {
                await supabase.auth.signOut();
                // onAuthStateChange handles the reload
            }
        } finally {
            setIsAuthLoading(false);
        }
    };

    const updateUser = (updates: Partial<AuthUser>) => {
        if (currentUser) {
            setCurrentUser({ ...currentUser, ...updates });
        }
    };

    const signNDA = async () => {
        if (!currentUser) return;

        try {
            const timestamp = new Date().toISOString();

            if (currentUser.role !== "PATIENT") {
                await supabase.from('staff').update({
                    nda_signed_at: timestamp
                }).eq('supabase_user_id', currentUser.id);
            }

            updateUser({ ndaSignedAt: timestamp });

            AuditService.logEvent({
                action: "NDA_SIGNED",
                category: "COMPLIANCE",
                details: "Staff completed mandatory confidentiality agreement",
                userId: currentUser.id,
                userName: currentUser.name,
                userRole: currentUser.role
            }, currentUser.tenantId);

            toast.success("Confidentiality Agreement Signed");
        } catch (error: any) {
            toast.error("Error signing agreement");
            console.error(error);
        }
    };

    return (
        <AuthContext.Provider value={{ currentUser, isAuthLoading, loginWithCredentials, loginAsDemoPatient, logout, updateUser, signNDA }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
