"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppContext } from "@/lib/store";
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
    DollarSign
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { currentUser, logout, patients } = useAppContext();
    const pathname = usePathname();

    // Basic RBAC
    if (currentUser?.role !== "ADMIN") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0C1C30]">
                <div className="text-center space-y-4 max-w-sm">
                    <div className="w-16 h-16 rounded bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-3xl mx-auto mb-6">
                        M
                    </div>
                    <h1 className="text-2xl font-serif text-white">Access Denied</h1>
                    <p className="text-white/60">This area is restricted to MedFit America Clinical Staff only.</p>
                    <Link href="/login" className="text-[#B8977E] hover:underline block mt-4">Return to Login</Link>
                </div>
            </div>
        );
    }

    const pendingAuthorizations = patients.filter(p => p.approvalStatus === "PENDING_APPROVAL").length;

    const navItems = [
        { name: "Dashboard Overview", href: "/admin", icon: LayoutDashboard },
        { name: "Pending Approvals", href: "/admin/approvals", icon: ClipboardCheck, badge: pendingAuthorizations },
        { name: "Patient Management", href: "/admin/patients", icon: Users },
        { name: "Billing & Invoices", href: "/admin/billing", icon: DollarSign },
        { name: "Treatments & Forms", href: "/admin/forms", icon: FileText },
        { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ];

    return (
        <div className="min-h-screen flex bg-[#0A0F17] text-white">

            {/* Sidebar */}
            <aside className="w-64 border-r border-border/50 bg-[#0C1420] flex flex-col hidden lg:flex">
                <div className="h-20 flex items-center px-6 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-xl">
                            M
                        </div>
                        <div className="flex flex-col">
                            <span className="font-serif text-base tracking-wide leading-none">MedFit America</span>
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
                                    {item.badge && item.badge > 0 ? (
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
                            <p className="text-xs text-white/50">Clinical Director</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() => { logout(); window.location.href = '/login'; }}
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
                <header className="h-20 border-b border-border/50 bg-[#0C1420] flex items-center justify-between px-6 lg:px-10 shrink-0">
                    <div className="flex items-center gap-4 lg:hidden">
                        {/* Mobile Logo placeholder */}
                        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-xl">M</div>
                    </div>

                    <div className="flex-1 max-w-xl relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                        <Input
                            placeholder="Global Search: Patient Name, Email, or Phone..."
                            className="w-full bg-white/5 border-white/10 text-white pl-10 h-10 rounded-full focus-visible:ring-[#B8977E]/50"
                        />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
