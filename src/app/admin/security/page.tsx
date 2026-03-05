"use client";

import { useAuth } from "@/hooks/useAuth";
import { useAudit } from "@/hooks/useAudit";
import { AuditCategory, AuditLog } from "@/types/audit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ShieldCheck, Clock, Search, AlertTriangle,
    Download, RefreshCw, Filter, LogIn, LogOut,
    FileText, CreditCard, UserCog, Activity,
    Stethoscope, Server, Users
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";

// ─── Category Config ──────────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<AuditCategory, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    AUTH: { label: "Auth", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: LogIn },
    PHI_ACCESS: { label: "PHI Access", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: Users },
    CLINICAL: { label: "Clinical", color: "text-[#8FA677]", bg: "bg-[#8FA677]/10 border-[#8FA677]/20", icon: Stethoscope },
    BILLING: { label: "Billing", color: "text-[#E8A838]", bg: "bg-[#E8A838]/10 border-[#E8A838]/20", icon: CreditCard },
    ADMIN: { label: "Admin", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", icon: UserCog },
    SYSTEM: { label: "System", color: "text-white/50", bg: "bg-white/5 border-white/10", icon: Server },
    GENERAL: { label: "General", color: "text-white/40", bg: "bg-white/5 border-white/5", icon: Activity },
    COMPLIANCE: { label: "Compliance", color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/20", icon: ShieldCheck },
};

const ALL_CATEGORIES: AuditCategory[] = ["AUTH", "PHI_ACCESS", "CLINICAL", "BILLING", "ADMIN", "SYSTEM", "GENERAL", "COMPLIANCE"];

export default function SecurityAuditPage() {
    const { currentUser } = useAuth();
    const { auditLogs } = useAudit();
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState<AuditCategory | "ALL">("ALL");
    const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d" | "ALL">("ALL");

    // ─── Stats ────────────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const now = Date.now();
        const last24h = auditLogs.filter((l: AuditLog) => now - new Date(l.timestamp).getTime() < 86400000);
        const authEvents = auditLogs.filter((l: AuditLog) => l.category === "AUTH").length;
        const phiEvents = auditLogs.filter((l: AuditLog) => l.category === "PHI_ACCESS").length;
        const uniqueUsers = new Set(auditLogs.map((l: AuditLog) => l.userId)).size;
        return { total: auditLogs.length, last24h: last24h.length, authEvents, phiEvents, uniqueUsers };
    }, [auditLogs]);

    // ─── Filtered logs ────────────────────────────────────────────────────────
    const filteredLogs = useMemo(() => {
        const now = Date.now();
        const rangeMs: Record<string, number> = { "1h": 3600000, "24h": 86400000, "7d": 604800000 };

        return auditLogs.filter((log: AuditLog) => {
            const matchesSearch =
                log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.details.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = activeCategory === "ALL" || log.category === activeCategory;
            const matchesTime = timeRange === "ALL" || (now - new Date(log.timestamp).getTime()) < rangeMs[timeRange];
            return matchesSearch && matchesCategory && matchesTime;
        });
    }, [auditLogs, searchTerm, activeCategory, timeRange]);

    // ─── Export CSV ───────────────────────────────────────────────────────────
    const exportCSV = () => {
        const header = "Timestamp,Action,Category,Actor,Role,Details,Resource\n";
        const rows = filteredLogs.map(l =>
            `"${l.timestamp}","${l.action}","${l.category}","${l.userName}","${l.userRole}","${l.details}","${l.resourceType ?? ''}/${l.resourceId ?? ''}"`
        ).join("\n");
        const blob = new Blob([header + rows], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url;
        a.download = `medfit-audit-${new Date().toISOString().split("T")[0]}.csv`;
        a.click(); URL.revokeObjectURL(url);
    };

    return (
        <div className="animate-in fade-in duration-500 max-w-7xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif text-white mb-2 flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-[#8FA677]" />
                        Security & Audit Logs
                    </h1>
                    <p className="text-white/50 text-sm">Immutable HIPAA-compliant event trail. Every action is permanently recorded.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={exportCSV}
                        className="border-white/10 text-white/60 hover:text-white hover:bg-white/5 gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* HIPAA Warning */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-red-400 font-medium text-sm">Read-Only Mode — Immutable Record</h4>
                    <p className="text-red-400/60 text-xs mt-1">
                        Audit logs cannot be modified or deleted by any user, including administrators. This log constitutes a legal HIPAA compliance record. Logs are retained for a minimum of 6 years per 45 CFR §164.530(j).
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Events", value: stats.total, icon: Activity, color: "text-white" },
                    { label: "Last 24 Hours", value: stats.last24h, icon: Clock, color: "text-[#8FA677]" },
                    { label: "Auth Events", value: stats.authEvents, icon: LogIn, color: "text-blue-400" },
                    { label: "PHI Access Events", value: stats.phiEvents, icon: Users, color: "text-red-400" },
                ].map(stat => (
                    <div key={stat.label} className="bg-[#0C1420] border border-white/5 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            <p className="text-xs text-white/50 uppercase tracking-wider">{stat.label}</p>
                        </div>
                        <p className={`text-3xl font-serif font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Log Table */}
            <div className="bg-[#0C1420] border border-border/50 rounded-2xl overflow-hidden shadow-2xl">

                {/* Filters */}
                <div className="p-4 border-b border-white/5 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex-1 min-w-[200px] relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                            <Input
                                placeholder="Search events by user, action, or details..."
                                className="bg-[#0C1420] border-white/10 text-white pl-9 h-10 rounded-lg focus-visible:ring-1 focus-visible:ring-[#8FA677]/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {/* Time Range */}
                        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                            {(["1h", "24h", "7d", "ALL"] as const).map(range => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${timeRange === range ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                        <Badge variant="outline" className="border-white/10 text-white/60 font-mono h-10 px-4 whitespace-nowrap">
                            {filteredLogs.length} of {auditLogs.length} Events
                        </Badge>
                    </div>

                    {/* Category Filters */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter className="w-3 h-3 text-white/30" />
                        <button
                            onClick={() => setActiveCategory("ALL")}
                            className={`px-3 py-1 rounded-full text-xs border transition-colors ${activeCategory === "ALL" ? "bg-white/10 border-white/20 text-white" : "border-white/5 text-white/40 hover:text-white/70"}`}
                        >
                            All Categories
                        </button>
                        {ALL_CATEGORIES.map(cat => {
                            const cfg = CATEGORY_CONFIG[cat];
                            const count = auditLogs.filter(l => l.category === cat).length;
                            if (count === 0) return null;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-3 py-1 rounded-full text-xs border transition-colors flex items-center gap-1 ${activeCategory === cat ? `${cfg.bg} ${cfg.color}` : "border-white/5 text-white/40 hover:text-white/60"}`}
                                >
                                    <cfg.icon className="w-3 h-3" />
                                    {cfg.label}
                                    <span className="opacity-60">({count})</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-border/50">
                                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-widest w-44">Timestamp</th>
                                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-widest w-32">Category</th>
                                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-widest w-44">Action</th>
                                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-widest w-44">Actor</th>
                                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-widest">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center">
                                        <Activity className="w-8 h-8 mx-auto mb-3 text-white/10" />
                                        <p className="text-white/40 text-sm">No events match your filters.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log: AuditLog) => {
                                    const cfg = CATEGORY_CONFIG[(log.category as AuditCategory) ?? "GENERAL"];
                                    return (
                                        <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-4 align-top">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-white/70 font-mono text-xs">
                                                        {new Date(log.timestamp).toLocaleDateString([], { month: "short", day: "2-digit" })}
                                                    </span>
                                                    <span className="text-white/40 font-mono text-[10px] flex items-center gap-1">
                                                        <Clock className="w-2.5 h-2.5" />
                                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-top">
                                                <Badge className={`${cfg.bg} ${cfg.color} border text-[10px] font-mono px-2 py-0.5 flex items-center gap-1 w-fit`}>
                                                    <cfg.icon className="w-2.5 h-2.5" />
                                                    {cfg.label}
                                                </Badge>
                                            </td>
                                            <td className="p-4 align-top">
                                                <Badge className="bg-[#111A27] border border-white/10 font-mono text-[10px] text-white/80 uppercase">
                                                    {log.action}
                                                </Badge>
                                            </td>
                                            <td className="p-4 align-top">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-white group-hover:text-[#B8977E] transition-colors">{log.userName}</span>
                                                    <span className="text-[10px] text-white/40">{log.userRole}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-top">
                                                <p className="text-sm text-white/70">{log.details}</p>
                                                {log.resourceType && (
                                                    <p className="text-[10px] text-white/30 font-mono mt-1">
                                                        {log.resourceType}{log.resourceId ? `/${log.resourceId}` : ""}
                                                    </p>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
