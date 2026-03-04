"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAppContext } from "@/lib/store";
import { tenant } from "@/lib/theme.config";
import { signOut as supabaseSignOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    LayoutDashboard,
    Users,
    ClipboardCheck,
    FileText,
    BarChart3,
    LogOut,
    Search,
    DollarSign,
    ChevronRight,
    Bell,
    MessageSquare,
    ShoppingCart,
    ShieldCheck,
    UserPlus,
    Video,
    AlertTriangle
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { currentUser, isAuthLoading, logout, patients, setSelectedGlobalPatientId, adminNotifications, markNotificationRead } = useAppContext();
    const pathname = usePathname();
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const unreadCount = adminNotifications?.filter(n => !n.read).length || 0;

    // Filter top 5 patients
    const searchResults = patients.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.phone && p.phone.includes(searchQuery))
    ).slice(0, 5);

    // Show loading state while confirming authentication
    if (isAuthLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0C1C30]">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-16 h-16 rounded bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-3xl mx-auto mb-6">
                        {tenant.logoInitial}
                    </div>
                    <div className="text-white/60">Verifying secure session...</div>
                </div>
            </div>
        );
    }

    // RBAC: Only clinical staff can access the admin portal
    const STAFF_ROLES = ["ADMIN", "SUPERADMIN", "DOCTOR", "RECEPTION"];
    if (!currentUser || !STAFF_ROLES.includes(currentUser.role ?? "")) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0C1C30]">
                <div className="text-center space-y-4 max-w-sm">
                    <div className="w-16 h-16 rounded bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-3xl mx-auto mb-6">
                        {tenant.logoInitial}
                    </div>
                    <h1 className="text-2xl font-serif text-white">Access Denied</h1>
                    <p className="text-white/60">This area is restricted to {tenant.name} Clinical Staff only.</p>
                    <Link href="/login" className="text-[#B8977E] hover:underline block mt-4">Return to Login</Link>
                </div>
            </div>
        );
    }

    // ─── NDA INTERCEPTOR: Block access until staff signs Confidentiality Agreement ───
    const STAFF_ROLES_REQUIRING_NDA = ["ADMIN", "SUPERADMIN", "DOCTOR", "RECEPTION"];
    const isOnboardingPage = pathname === "/admin/onboarding";
    const needsNDA = STAFF_ROLES_REQUIRING_NDA.includes(currentUser.role ?? "") && !currentUser.ndaSignedAt && !isOnboardingPage;

    if (needsNDA) {
        // Instead of redirecting (which would cause layout issues), render inline
        const OnboardingPage = require("./onboarding/page").default;
        return <OnboardingPage />;
    }

    const pendingAuthorizations = patients.filter(p => p.approvalStatus === "PENDING_APPROVAL" || p.approvalStatus === "PENDING_SHIPMENT").length;

    const allNavItems = [
        { name: "Dashboard Overview", href: "/admin", icon: LayoutDashboard, roles: ["SUPERADMIN", "ADMIN", "DOCTOR", "RECEPTION"] },
        { name: "Approvals & Shipments", href: "/admin/approvals", icon: ClipboardCheck, roles: ["SUPERADMIN", "ADMIN", "DOCTOR"], badge: pendingAuthorizations },
        { name: "Patient Management", href: "/admin/patients", icon: Users, roles: ["SUPERADMIN", "ADMIN", "DOCTOR", "RECEPTION"] },
        { name: "Billing & Invoices", href: "/admin/billing", icon: DollarSign, roles: ["SUPERADMIN", "ADMIN", "RECEPTION"] },
        { name: "Treatments & Forms", href: "/admin/forms", icon: FileText, roles: ["SUPERADMIN", "ADMIN", "DOCTOR"] },
        { name: "Analytics", href: "/admin/analytics", icon: BarChart3, roles: ["SUPERADMIN", "ADMIN"] },
        { name: "Telehealth HD", href: "/admin/telehealth", icon: Video, roles: ["SUPERADMIN", "ADMIN", "DOCTOR"], badge: "Locked" },
        { name: "Staff & Roles", href: "/admin/staff", icon: UserPlus, roles: ["SUPERADMIN"] },
        { name: "Security & Audit", href: "/admin/security", icon: ShieldCheck, roles: ["SUPERADMIN"] },
    ];

    // Filter nav items based on current user's role
    const navItems = allNavItems.filter(item => item.roles.includes(currentUser.role ?? ""));

    return (
        <div className="min-h-screen flex bg-[#0A0F17] text-white">

            {/* Sidebar */}
            <aside className="w-64 border-r border-border/50 bg-[#0C1420] flex flex-col hidden lg:flex">
                <div className="h-20 flex items-center px-6 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-xl">
                            {tenant.logoInitial}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-serif text-base tracking-wide leading-none">{tenant.name}</span>
                            <span className="text-[10px] text-[#B8977E] uppercase tracking-widest mt-1">Clinical Hub</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 py-6 px-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.name} href={item.href} className="block">
                                <Button
                                    variant="ghost"
                                    className={`w-full justify-start gap-3 h-11 px-3 ${isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    <span className="font-medium text-sm">{item.name}</span>
                                    {item.badge && (typeof item.badge === "number" ? item.badge > 0 : true) ? (
                                        <Badge className="ml-auto bg-[#E8A838] hover:bg-[#E8A838] text-black text-xs px-1.5 min-w-[20px] justify-center">
                                            {item.badge}
                                        </Badge>
                                    ) : null}
                                </Button>
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-border/50">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-serif">
                            {currentUser.name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-medium">{currentUser.name}</p>
                            <p className="text-xs text-white/50 capitalize">{currentUser.role?.toLowerCase().replace('_', ' ')}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={async () => {
                            logout();
                            try { await supabaseSignOut(); } catch (_) { }
                            window.location.href = '/login';
                        }}
                        className="w-full justify-start gap-3 text-white/50 hover:text-white hover:bg-white/5"
                    >
                        <LogOut className="w-4 h-4" />
                        Log Out
                    </Button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">

                {/* Topbar (Mobile menu toggle & Search) */}
                <header className="h-20 border-b border-border/50 bg-[#0C1420] flex items-center justify-between px-6 lg:px-10 shrink-0 relative z-[100]">
                    <div className="flex items-center gap-4 lg:hidden">
                        {/* Mobile Logo placeholder */}
                        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-xl">M</div>
                    </div>

                    <div className="flex-1 max-w-xl relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                        <Input
                            placeholder="Global Search: Patient Name, Email, or Phone..."
                            className="w-full bg-[#111A27] border-white/10 text-white pl-10 h-10 rounded-full focus-visible:ring-1 focus-visible:ring-[#B8977E]/50 focus-visible:bg-[#0C1420] transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                        />

                        {/* Dropdown de Resultados */}
                        {isSearchFocused && searchQuery.length > 1 && (
                            <div className="absolute top-12 left-0 w-full bg-[#0C1420] border border-border/50 shadow-2xl rounded-2xl overflow-hidden z-[100]">
                                {searchResults.length > 0 ? (
                                    <ul className="py-2">
                                        {searchResults.map(patient => (
                                            <li
                                                key={patient.id}
                                                className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center justify-between group transition-colors"
                                                onMouseDown={(e) => {
                                                    // use onMouseDown instead of onClick to fire before the input's onBlur hides the dropdown
                                                    e.preventDefault();
                                                    setSearchQuery("");
                                                    setIsSearchFocused(false);
                                                    setSelectedGlobalPatientId(patient.id);
                                                    if (pathname !== '/admin/patients') {
                                                        router.push('/admin/patients');
                                                    }
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-serif text-white group-hover:bg-[#B8977E]/20 group-hover:text-[#B8977E] transition-colors">
                                                        {patient.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-white group-hover:text-[#B8977E] transition-colors">{patient.name}</div>
                                                        <div className="text-[10px] text-white/50">{patient.email} {patient.phone ? `• ${patient.phone}` : ''}</div>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="p-4 text-center text-sm text-white/50 bg-[#0C1420]">
                                        No matching patients found for &quot;{searchQuery}&quot;
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 ml-6 relative">
                        <button
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            className="relative w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                            <Bell className="w-5 h-5 text-white/70" />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0C1420]" />
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {isNotifOpen && (
                            <div className="absolute top-12 right-0 w-80 sm:w-96 bg-[#0C1420] border border-border/50 shadow-2xl rounded-2xl overflow-hidden z-50">
                                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                    <h3 className="font-serif text-white flex items-center gap-2">
                                        <Bell className="w-4 h-4 text-[#B8977E]" />
                                        Notifications
                                    </h3>
                                    {unreadCount > 0 && (
                                        <Badge className="bg-[#B8977E] text-black hover:bg-[#B8977E] px-2">
                                            {unreadCount} New
                                        </Badge>
                                    )}
                                </div>
                                <div className="max-h-[300px] overflow-y-auto">
                                    {!adminNotifications || adminNotifications.length === 0 ? (
                                        <div className="p-8 text-center text-white/40">
                                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                            <p className="text-sm">No new notifications</p>
                                        </div>
                                    ) : (
                                        <ul className="divide-y divide-white/5">
                                            {adminNotifications.map((notif) => (
                                                <li
                                                    key={notif.id}
                                                    className={`p-4 transition-colors hover:bg-white/5 cursor-pointer ${notif.read ? 'opacity-60' : 'bg-white/5'}`}
                                                    onClick={() => {
                                                        markNotificationRead(notif.id);
                                                        setIsNotifOpen(false);

                                                        // Ensure the patient is selected before routing
                                                        if (notif.patientId !== "system" || notif.type !== "SYSTEM_ALERT") {
                                                            setSelectedGlobalPatientId(notif.patientId);
                                                        }

                                                        if (notif.type === 'CART_REQUEST') {
                                                            router.push('/admin/approvals');
                                                        } else {
                                                            router.push('/admin/patients');
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`mt-1 p-2 rounded-full ${notif.type === 'CART_REQUEST' ? 'bg-[#8FA677]/20 text-[#8FA677]' :
                                                            notif.type === 'SYSTEM_ALERT' ? 'bg-red-500/20 text-red-400' :
                                                                'bg-[#E8A838]/20 text-[#E8A838]'
                                                            }`}>
                                                            {notif.type === 'CART_REQUEST' ? <ShoppingCart className="w-4 h-4" /> :
                                                                notif.type === 'SYSTEM_ALERT' ? <AlertTriangle className="w-4 h-4" /> :
                                                                    <MessageSquare className="w-4 h-4" />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <p className="text-sm font-medium text-white">{notif.patientName}</p>
                                                                <span className="text-[10px] text-white/40">
                                                                    {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-white/60 line-clamp-2">{notif.content}</p>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative z-10 pointer-events-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
