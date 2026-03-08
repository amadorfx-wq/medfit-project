"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, CreditCard, Stethoscope, BookOpen, User, LogOut, Receipt, Bell, X, Check, CheckCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePatientNotifications } from "@/hooks/usePatientNotifications";
import { tenant } from "@/lib/theme.config";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useRef, useEffect } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { currentUser, logout } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllRead } = usePatientNotifications();
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "My Balance & Pay", href: "/dashboard/pay", icon: CreditCard },
        { name: "Billing & Subscriptions", href: "/dashboard/billing", icon: Receipt },
        { name: "My Treatments", href: "/dashboard/treatments", icon: Stethoscope },
        { name: "Academy", href: "/dashboard/academy", icon: BookOpen },
        { name: "Profile", href: "/dashboard/profile", icon: User },
    ];

    const getNotificationRoute = (type: string) => {
        switch (type) {
            case "PAYMENT_REQUIRED": return "/dashboard/pay";
            case "SHIPMENT_DISPATCHED": return "/dashboard/treatments";
            case "FORM_REQUIRED": return "/dashboard/intake";
            default: return "/dashboard";
        }
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    if (currentUser?.role !== "PATIENT") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <p className="text-muted-foreground">Please log in as a patient to view this page.</p>
                    <Link href="/login" className="text-primary hover:underline">Return to Login</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-background text-foreground">
            {/* Sidebar (Desktop) */}
            <aside className="w-72 hidden md:flex flex-col bg-sidebar border-r border-sidebar-border p-6 fixed h-full z-10">
                <div className="flex items-center gap-2 mb-12">
                    <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-xl">
                        {tenant.logoInitial}
                    </div>
                    <span className="font-serif text-xl tracking-wide text-foreground">{tenant.name}</span>
                </div>

                <div className="mb-10">
                    <div className="flex items-center gap-3 bg-card border border-border/50 rounded-xl p-3 shadow-sm">
                        <Avatar className="w-10 h-10 border border-border">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">{currentUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-serif text-card-foreground truncate">{currentUser.name}</p>
                            <p className="text-xs text-muted-foreground">Patient Portal</p>
                        </div>

                        {/* ── Notification Bell ── */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className="relative p-2 rounded-lg hover:bg-muted transition-colors"
                                aria-label="Notifications"
                            >
                                <Bell className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* ── Notification Dropdown ── */}
                            {isNotifOpen && (
                                <div className="absolute left-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 animate-in slide-in-from-top-2 fade-in duration-200 overflow-hidden">
                                    <div className="flex items-center justify-between p-4 border-b border-border/50">
                                        <h3 className="text-sm font-serif font-bold text-card-foreground">Notifications</h3>
                                        <div className="flex items-center gap-2">
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={markAllRead}
                                                    className="text-xs text-primary hover:underline flex items-center gap-1"
                                                >
                                                    <CheckCheck className="w-3 h-3" /> Mark all read
                                                </button>
                                            )}
                                            <button onClick={() => setIsNotifOpen(false)} className="p-1 rounded hover:bg-muted">
                                                <X className="w-4 h-4 text-muted-foreground" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-muted-foreground text-sm">
                                                <Bell className="w-8 h-8 mx-auto mb-3 opacity-30" />
                                                <p>No notifications yet</p>
                                            </div>
                                        ) : (
                                            notifications.map(n => (
                                                <button
                                                    key={n.id}
                                                    onClick={() => {
                                                        markAsRead(n.id);
                                                        setIsNotifOpen(false);
                                                        router.push(getNotificationRoute(n.type));
                                                    }}
                                                    className={`w-full text-left p-4 border-b border-border/30 hover:bg-muted/50 transition-colors ${!n.read ? "bg-primary/5" : ""}`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.read ? "bg-primary" : "bg-transparent"}`} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm ${!n.read ? "font-semibold text-card-foreground" : "text-muted-foreground"}`}>
                                                                {n.title}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                                                {n.message}
                                                            </p>
                                                            <p className="text-[10px] text-muted-foreground/60 mt-1">
                                                                {timeAgo(n.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                            >
                                <item.icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
                                <span className="font-serif text-sm tracking-wide">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto space-y-4">
                    <button
                        onClick={() => { logout(); window.location.href = '/login'; }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-muted-foreground hover:text-destructive transition-colors"
                    >
                        <LogOut className="w-5 h-5" strokeWidth={1.5} />
                        <span className="font-serif text-sm tracking-wide">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-72 flex flex-col min-h-screen pb-20 md:pb-0 bg-background">
                {children}
            </main>

            {/* Basic Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 w-full bg-sidebar/95 backdrop-blur-md border-t border-sidebar-border flex justify-around p-4 z-50">
                {navItems.slice(0, 4).map(item => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.name} href={item.href} className={`flex flex-col items-center gap-1 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                            <item.icon className="w-6 h-6" strokeWidth={isActive ? 2 : 1.5} />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    )
                })}
                {/* Mobile Notification Bell */}
                <button
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="relative flex flex-col items-center gap-1 text-muted-foreground"
                >
                    <Bell className="w-6 h-6" strokeWidth={1.5} />
                    <span className="text-[10px] font-medium">Alerts</span>
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 right-0 w-4 h-4 bg-primary text-primary-foreground text-[8px] font-bold rounded-full flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </button>
            </nav>
        </div>
    );
}

