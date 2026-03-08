"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { setSupabaseToken, clearSupabaseToken } from "@/lib/supabase";
import { Role } from "@/types/staff";
import { AuditService } from "@/services/audit.service";
import { toast } from "sonner";

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

// ─── TIMEOUT UTILITY ────────────────────────────────────────────────────────
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
        promise,
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Request timed out after ${ms / 1000}s`)), ms)
        ),
    ]);
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                // ─── ALL AUTH THROUGH SERVER-SIDE API ─────────────────────
                // NO client-side Supabase auth calls. Zero Web Locks. Zero hangs.
                const res = await withTimeout(
                    fetch('/api/auth/session'),
                    8000 // 8 second timeout — if server doesn't respond, fail fast
                );

                if (!res.ok) throw new Error('Session check failed');

                const data = await res.json();

                if (data.user && mounted) {
                    setCurrentUser({
                        id: data.user.id,
                        role: data.user.role as Role,
                        name: data.user.name,
                        tenantId: data.user.tenantId,
                        ndaSignedAt: data.user.ndaSignedAt,
                    });

                    // Inject token into Supabase client for data queries (patients, etc)
                    if (data.session?.access_token) {
                        setSupabaseToken(data.session.access_token);
                    }
                } else {
                    // Check for Demo Patient Cookie (Legacy MVP fallback)
                    if (typeof document !== 'undefined') {
                        const cookieMatch = document.cookie.match(/(?:^|; )demo_patient_session=([^;]*)/);
                        if (cookieMatch && cookieMatch[1] && mounted) {
                            setCurrentUser({ id: cookieMatch[1], role: "PATIENT", name: "Patient (Demo Session)" });
                        }
                    }
                }
            } catch (err) {
                console.error("[Auth] Session init error:", err);
                // On timeout or error, just show the page without auth (will show Access Denied or Login)
            } finally {
                if (mounted) setIsAuthLoading(false);
            }
        };

        initializeAuth();

        // NO onAuthStateChange listener — it uses Web Locks and hangs.
        // Auth state is managed entirely through our API routes.

        return () => { mounted = false; };
    }, []);

    const loginWithCredentials = async (email: string, password: string) => {
        setIsAuthLoading(true);

        try {
            // Server-side authentication — no client-side Supabase
            const res = await withTimeout(
                fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                }),
                10000 // 10 second timeout
            );

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Authentication failed.');
            }

            // Update React state
            const user = result.user;
            setCurrentUser({
                id: user.id,
                role: user.role as Role,
                name: user.name,
                tenantId: user.tenantId,
                ndaSignedAt: user.ndaSignedAt,
            });
            toast.success(`Welcome back, ${user.name}`);

            // Full page navigation — middleware reads cookies, page reloads cleanly
            window.location.href = '/admin';
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
            } else {
                // Server-side logout — clears cookies
                await fetch('/api/auth/logout', { method: 'POST' });
                clearSupabaseToken();
                setCurrentUser(null);
            }
            window.location.href = '/login';
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

            // NDA update through a direct API call to our own backend
            // The Supabase data operations still work (they don't use Web Locks)
            const { supabase } = await import("@/lib/supabase");
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
