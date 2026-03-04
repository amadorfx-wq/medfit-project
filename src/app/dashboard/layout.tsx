"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CreditCard, Stethoscope, BookOpen, User, LogOut, Receipt } from "lucide-react";
import { useAppContext } from "@/lib/store";
import { tenant } from "@/lib/theme.config";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { currentUser, logout } = useAppContext();

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "My Balance & Pay", href: "/dashboard/pay", icon: CreditCard },
        { name: "Billing & Subscriptions", href: "/dashboard/billing", icon: Receipt },
        { name: "My Treatments", href: "/dashboard/treatments", icon: Stethoscope },
        { name: "Academy", href: "/dashboard/academy", icon: BookOpen },
        { name: "Profile", href: "/dashboard/profile", icon: User },
    ];

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
        <div className="min-h-screen flex bg-background">
            {/* Sidebar (Desktop) */}
            <aside className="w-72 hidden md:flex flex-col bg-[#050505] border-r border-border/50 p-6 fixed h-full z-10">
                <div className="flex items-center gap-2 mb-12">
                    <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-xl">
                        {tenant.logoInitial}
                    </div>
                    <span className="font-serif text-xl tracking-wide text-foreground">{tenant.name}</span>
                </div>

                <div className="mb-10">
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                        <Avatar className="w-10 h-10 border border-border">
                            <AvatarFallback className="bg-primary/20 text-primary">{currentUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-medium text-foreground">{currentUser.name}</p>
                            <p className="text-xs text-muted-foreground">Patient Portal</p>
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
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                    }`}
                            >
                                <item.icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
                                <span className="font-medium text-sm">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto">
                    <button
                        onClick={() => { logout(); window.location.href = '/login'; }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-muted-foreground hover:text-destructive transition-colors"
                    >
                        <LogOut className="w-5 h-5" strokeWidth={1.5} />
                        <span className="font-medium text-sm">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-72 flex flex-col min-h-screen pb-20 md:pb-0 bg-[#0A0A0A]">
                {children}
            </main>

            {/* Basic Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 w-full bg-[#050505]/95 backdrop-blur-md border-t border-border/50 flex justify-around p-4 z-50">
                {navItems.slice(0, 5).map(item => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.name} href={item.href} className={`flex flex-col items-center gap-1 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                            <item.icon className="w-6 h-6" strokeWidth={isActive ? 2 : 1.5} />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    );
}
