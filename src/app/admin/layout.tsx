"use client";

import Link from "next/link";
import { useAppContext } from "@/lib/store";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { currentUser } = useAppContext();

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

    return (
        <div className="min-h-screen flex flex-col bg-[#0A0F17]">
            {/* Slightly deeper navy/slate background for Admin area */}
            {children}
        </div>
    );
}
