"use client";

import { useAppContext } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Clock, Search, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function SecurityAuditPage() {
    const { auditLogs } = useAppContext();
    const [searchTerm, setSearchTerm] = useState("");

    const filteredLogs = auditLogs.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-in fade-in duration-500 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif text-white mb-2 flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-[#8FA677]" />
                        Security & Audit Logs
                    </h1>
                    <p className="text-white/50">Immutable event trail for HIPAA compliance and technical due diligence.</p>
                </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-red-500 font-medium text-sm">Read-Only Mode</h4>
                    <p className="text-red-500/70 text-xs mt-1">Audit logs cannot be modified or deleted. Logs are automatically rotated after 100 events in this demonstration instance.</p>
                </div>
            </div>

            <div className="bg-[#0C1420] border border-border/50 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-white/5 flex items-center gap-4 bg-[#111A27]/50">
                    <div className="flex-1 relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                        <Input
                            placeholder="Filter events by user, action, or details..."
                            className="bg-[#0C1420] border-white/10 text-white pl-9 h-10 rounded-lg focus-visible:ring-1 focus-visible:ring-[#8FA677]/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Badge variant="outline" className="border-white/10 text-white/60 font-mono h-10 px-4">
                        {filteredLogs.length} Events Logged
                    </Badge>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-border/50">
                                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-widest w-40">Timestamp</th>
                                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-widest w-48">Action</th>
                                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-widest w-48">Actor</th>
                                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-widest">Event Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-white/40">
                                        No audit events match your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-4 align-top">
                                            <div className="flex items-center gap-2 text-white/70 font-mono text-xs">
                                                <Clock className="w-3 h-3 text-white/30" />
                                                {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                                            </div>
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
                                        <td className="p-4 align-top text-sm text-white/80">
                                            {log.details}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
