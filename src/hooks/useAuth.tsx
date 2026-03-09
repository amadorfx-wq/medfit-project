"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
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
    loginAsPatient: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (updates: Partial<AuthUser>) => void;
    signNDA: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── HELPER: Decode JWT payload without any library ─────────────────────────
function decodeJwtPayload(token: string): Record<string, any> | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(payload));
    } catch {
        return null;
    }
}

// ─── HELPER: Read auth cookie from browser ──────────────────────────────────
function readAuthCookie(): { access_token: string; refresh_token: string; user: any } | null {
    if (typeof document === 'undefined') return null;

    try {
        // The cookie name follows Supabase convention: sb-{project-ref}-auth-token
        const cookies = document.cookie.split(';').map(c => c.trim());

        // Try single cookie first
        for (const c of cookies) {
            if (c.startsWith('sb-') && c.includes('-auth-token=')) {
                const value = decodeURIComponent(c.split('=').slice(1).join('='));
                return JSON.parse(value);
            }
        }

        // Try chunked cookies (sb-xxx-auth-token.0, sb-xxx-auth-token.1, ...)
        const chunkPrefix = cookies
            .map(c => c.split('=')[0])
            .find(name => name.match(/^sb-.*-auth-token\.0$/));

        if (chunkPrefix) {
            const baseName = chunkPrefix.replace('.0', '');
            const chunks: string[] = [];
            let i = 0;
            while (true) {
                const chunk = cookies.find(c => c.startsWith(`${baseName}.${i}=`));
                if (!chunk) break;
                chunks.push(decodeURIComponent(chunk.split('=').slice(1).join('=')));
                i++;
            }
            if (chunks.length > 0) {
                return JSON.parse(chunks.join(''));
            }
        }
    } catch (err) {
        console.error('[Auth] Failed to read auth cookie:', err);
    }

    return null;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                // ─── READ AUTH FROM COOKIE DIRECTLY ──────────────────────
                // NO Supabase SDK auth calls. NO fetch to /api/auth/session.
                // Just read the httpOnly:false cookie that /api/auth/login set.
                const session = readAuthCookie();

                if (session?.access_token && mounted) {
                    // Decode the JWT to get user metadata
                    const payload = decodeJwtPayload(session.access_token);

                    if (payload) {
                        const userMeta = payload.user_metadata || {};
                        const role = userMeta.role || 'ADMIN';
                        const name = userMeta.name || payload.email || 'Staff';
                        const tenantId = userMeta.tenant_id;

                        // Get NDA status from staff table (this is a DATA query, not AUTH)
                        let ndaSignedAt: string | null = null;
                        if (role !== 'PATIENT') {
                            // Inject the session so the query passes RLS
                            await supabase.auth.setSession({ access_token: session.access_token, refresh_token: session.refresh_token || '' });

                            try {
                                const { data: staffData } = await supabase
                                    .from('staff')
                                    .select('nda_signed_at')
                                    .eq('supabase_user_id', payload.sub)
                                    .maybeSingle();
                                ndaSignedAt = staffData?.nda_signed_at ?? null;
                            } catch (err) {
                                console.warn('[Auth] NDA check failed:', err);
                            }
                        }

                        setCurrentUser({
                            id: payload.sub,
                            role: role as Role,
                            name,
                            tenantId,
                            ndaSignedAt,
                        });
                    }
                }
            } catch (err) {
                console.error("[Auth] Session init error:", err);
            } finally {
                if (mounted) setIsAuthLoading(false);
            }
        };

        initializeAuth();

        // Proactive token refresh every 45 minutes (Supabase tokens expire at 60m).
        // Fires silently — the user never sees a loading state.
        const REFRESH_MS = 45 * 60 * 1000;
        const refreshInterval = setInterval(() => {
            fetch('/api/auth/refresh', { method: 'POST' }).catch(() => {
                // Refresh failure is non-fatal; user will be logged out on next hard nav.
            });
        }, REFRESH_MS);

        // NO onAuthStateChange. NO Web Locks. Auth state from cookies only.
        return () => {
            mounted = false;
            clearInterval(refreshInterval);
        };
    }, []);

    const loginWithCredentials = async (email: string, password: string) => {
        setIsAuthLoading(true);

        try {
            // Server-side authentication via our API route
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000);

            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                signal: controller.signal,
            });
            clearTimeout(timeout);

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Authentication failed.');
            }

            toast.success(`Welcome back, ${result.user.name}`);

            // Full page navigation — on reload, initializeAuth reads the new cookie
            window.location.href = '/admin';
        } catch (err: any) {
            if (err.name === 'AbortError') {
                throw new Error('Connection timed out. Please check your internet connection and try again.');
            }
            throw err;
        } finally {
            setIsAuthLoading(false);
        }
    };

    const loginAsPatient = async (email: string, password: string) => {
        setIsAuthLoading(true);
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000);

            const res = await fetch('/api/auth/patient-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                signal: controller.signal,
            });
            clearTimeout(timeout);

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Authentication failed.');
            }

            toast.success(`Welcome back, ${result.user.name}`);
            window.location.href = '/dashboard';
        } catch (err: any) {
            if (err.name === 'AbortError') {
                throw new Error('Connection timed out. Please check your internet connection and try again.');
            }
            throw err;
        } finally {
            setIsAuthLoading(false);
        }
    };

    const logout = async () => {
        setIsAuthLoading(true);
        try {
            // Clear all Supabase auth cookies (works for both staff and patients)
            const cookies = document.cookie.split(';').map(c => c.trim());
            for (const c of cookies) {
                const name = c.split('=')[0];
                if (name.startsWith('sb-') && name.includes('auth-token')) {
                    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
                }
            }
            await supabase.auth.signOut({ scope: 'local' });
            setCurrentUser(null);
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

            await supabase.from('staff').update({
                nda_signed_at: timestamp
            }).eq('supabase_user_id', currentUser.id);

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
        <AuthContext.Provider value={{ currentUser, isAuthLoading, loginWithCredentials, loginAsPatient, logout, updateUser, signNDA }}>
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
