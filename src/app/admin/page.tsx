"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePatients } from "@/hooks/usePatients";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Users, CreditCard, DollarSign, ChevronRight, AlertCircle, Mail, Activity, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBilling } from "@/hooks/useBilling";
import { useClinical } from "@/hooks/useClinical";
import { useAudit } from "@/hooks/useAudit";

export default function AdminDashboardPage() {
    const { currentUser } = useAuth();
    const { patients, setSelectedGlobalPatientId } = usePatients();
    const { authorizeTreatment } = useClinical();
    const { charges, addCharge } = useBilling();
    const { auditLogs } = useAudit();
    const router = useRouter();

    // Form state
    const [selectedPatientId] = useState<string>("p1");
    const [amount, setAmount] = useState<string>("");
    const [description, setDescription] = useState<string>("");

    if (!currentUser) return null;

    // KPIs calculations
    const totalPending = charges.filter(c => c.status === "PENDING").length;
    const pendingAuthorizations = patients.filter(p => p.approvalStatus === "PENDING_APPROVAL" || p.approvalStatus === "PENDING_SHIPMENT").length;
    const revenueAmount = charges.filter(c => c.status === "PAID").reduce((sum, c) => sum + c.amount, 0);

    const handleAddCharge = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !description) return;

        const patient = patients.find(p => p.id === selectedPatientId);

        if (patient?.approvalStatus === "PENDING_APPROVAL") {
            authorizeTreatment(selectedPatientId, parseFloat(amount), description);
            toast.success("Treatment Authorized", {
                description: `A secure payment link has been emailed to ${patient.name} for ${description}.`,
                icon: <Mail className="w-4 h-4 text-primary" />
            });
        } else {
            addCharge({
                patientId: selectedPatientId,
                amount: parseFloat(amount),
                description: description,
            });
            toast.success("Charge Assigned", {
                description: `Invoice added to ${patient?.name}'s portal.`
            });
        }

        setAmount("");
        setDescription("");
    };

    const getPatientPendingBalance = (patientId: string) => {
        return charges
            .filter(c => c.patientId === patientId && c.status === "PENDING")
            .reduce((sum, c) => sum + c.amount, 0);
    };

    return (
        <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
            {/* Main Content (Left) */}
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-serif text-white mb-2">Clinic Overview</h1>
                    <p className="text-white/50">Current operational metrics and active accounts.</p>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <Link href="/admin/patients" className="block focus:outline-none">
                        <Card className="bg-[#0C1420] border-border/50 text-white h-full hover:bg-[#111A27] hover:border-white/10 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-300 cursor-pointer group">
                            <CardContent className="p-5 h-full flex flex-col justify-between relative overflow-hidden">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">Total Patients</span>
                                    <Users className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
                                </div>
                                <div className="text-3xl font-serif text-white group-hover:text-[#a10c22] transition-colors">{patients.length}</div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/admin/billing" className="block focus:outline-none">
                        <Card className="bg-[#0C1420] border-border/50 text-white h-full hover:bg-[#111A27] hover:border-[#a10c22]/30 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(232,168,56,0.3)] transition-all duration-300 cursor-pointer group relative">
                            {/* Premium Glow for Pending Revenue */}
                            {totalPending > 0 && <div className="absolute -inset-0.5 bg-gradient-to-br from-[#a10c22]/20 to-transparent rounded-xl blur-md opacity-50 animate-pulse pointer-events-none" />}
                            <CardContent className="p-5 h-full flex flex-col justify-between relative overflow-hidden bg-[#0C1420] rounded-xl z-10">
                                {totalPending > 0 && <div className="absolute inset-0 border-l-2 border-[#a10c22]" />}
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">Pending Invoices</span>
                                    <CreditCard className={`w-4 h-4 transition-colors ${totalPending > 0 ? 'text-[#a10c22]' : 'text-white/40 group-hover:text-white/60'}`} />
                                </div>
                                <div className={`text-3xl font-serif transition-colors ${totalPending > 0 ? 'text-[#a10c22] group-hover:text-[#a10c22]/90 text-shadow-sm' : 'text-white group-hover:text-[#a10c22]'}`}>{totalPending}</div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/admin/analytics" className="block focus:outline-none">
                        <Card className="bg-[#0C1420] border-border/50 text-white h-full hover:bg-[#111A27] hover:border-[#a10c22]/30 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(143,166,119,0.3)] transition-all duration-300 cursor-pointer group relative">
                            {/* Premium Glow for Earned Revenue */}
                            {revenueAmount > 0 && <div className="absolute -inset-0.5 bg-gradient-to-br from-[#a10c22]/20 to-transparent rounded-xl blur-md opacity-50 animate-pulse pointer-events-none" />}
                            <CardContent className="p-5 h-full flex flex-col justify-between relative overflow-hidden bg-[#0C1420] rounded-xl z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">Revenue (MTD)</span>
                                    <DollarSign className="w-4 h-4 text-[#a10c22] group-hover:text-[#a10c22]/80 transition-colors" />
                                </div>
                                <div className="text-3xl font-serif text-white group-hover:text-[#a10c22] transition-colors">${revenueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/admin/approvals" className="block focus:outline-none">
                        <Card className="bg-[#0C1420] border-border/50 text-white h-full hover:bg-[#111A27] hover:border-[#a10c22]/30 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(232,168,56,0.05)] transition-all duration-300 cursor-pointer group">
                            <CardContent className="p-5 h-full flex flex-col justify-between relative overflow-hidden">
                                {pendingAuthorizations > 0 && <div className="absolute inset-0 border-l-2 border-[#a10c22]" />}
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">Approvals & Shipments</span>
                                    <AlertCircle className={`w-4 h-4 transition-colors ${pendingAuthorizations > 0 ? 'text-[#a10c22]' : 'text-white/40 group-hover:text-white/60'}`} />
                                </div>
                                <div className={`text-3xl font-serif transition-colors ${pendingAuthorizations > 0 ? 'text-[#a10c22] group-hover:text-[#a10c22]/80' : 'text-white group-hover:text-[#a10c22]'}`}>{pendingAuthorizations}</div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* Intake & Cart Recovery Engine */}
                <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-serif text-white flex items-center gap-2">
                                <Activity className="w-5 h-5 text-[#a10c22]" />
                                Intake & Cart Recovery Engine
                            </h2>
                            <p className="text-sm text-white/50 mt-1">Automated follow-ups for stalled patients (M&A Revenue Retention)</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {patients.filter(p => p.formsStatus === "PENDING" || p.approvalStatus === "PENDING_FORMS").map((patient, idx) => (
                            <Card key={idx} className="bg-[#0C1420] border-border/50 hover:border-[#a10c22]/30 transition-colors">
                                <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-medium text-white text-lg">{patient.name}</h3>
                                            <Badge variant="outline" className="border-[#a10c22]/50 text-[#a10c22] bg-[#a10c22]/10 text-[10px] uppercase">Stalled</Badge>
                                        </div>
                                        <p className="text-xs text-white/40 mb-3">{patient.activeTreatment}</p>
                                        <p className="text-sm text-[#a10c22]/90 flex items-center gap-2 bg-[#a10c22]/5 w-fit px-2 py-1 rounded border border-[#a10c22]/10">
                                            <AlertCircle className="w-3 h-3" />
                                            Pending: {patient.requiredForms.length - patient.completedForms.length} Forms
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full bg-[#a10c22]/10 border-[#a10c22]/20 text-[#a10c22] hover:bg-[#a10c22] hover:text-black transition-colors"
                                        onClick={async () => {
                                            try {
                                                const res = await fetch("/api/trigger-sms", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({
                                                        patientId: patient.id,
                                                        patientName: patient.name,
                                                        type: "ONBOARDING_RESCUE"
                                                    })
                                                });

                                                if (res.ok) {
                                                    toast.success("Recovery sequence initiated", {
                                                        description: `Automated SMS & Email sent to ${patient.name}.`
                                                    });
                                                } else {
                                                    toast.error("Failed to sequence", {
                                                        description: "The communication gateway is currently unavailable."
                                                    });
                                                }
                                            } catch (error) {
                                                toast.error("Network Error", {
                                                    description: "Could not reach the automated recovery engine."
                                                });
                                            }
                                        }}
                                    >
                                        <Mail className="w-4 h-4 mr-2" />
                                        Trigger Auto-Reminder
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                        {patients.filter(p => p.formsStatus === "PENDING" || p.approvalStatus === "PENDING_FORMS").length === 0 && (
                            <div className="col-span-1 md:col-span-2 lg:col-span-3 p-8 bg-[#0C1420] border border-border/50 rounded-xl text-center">
                                <CheckCircle2 className="w-8 h-8 text-[#a10c22] mx-auto mb-3" />
                                <p className="text-white/50 text-sm">All active patients are fully onboarded. No stalled accounts detected.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Patients Table */}
                <div className="bg-[#0C1420] border border-border/50 rounded-xl overflow-hidden shadow-2xl">
                    <div className="p-5 border-b border-border/50 flex justify-between items-center">
                        <h2 className="text-lg font-serif text-white">Patient Accounts</h2>
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-transparent border-white/10 text-white hover:bg-white/5"
                            onClick={() => router.push('/admin/patients')}
                        >
                            View All Directory
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <Table className="min-w-[800px]">
                            <TableHeader className="bg-white/5">
                                <TableRow className="border-border/50 hover:bg-transparent">
                                    <TableHead className="text-white/50 text-xs tracking-wider uppercase">Patient Name</TableHead>
                                    <TableHead className="text-white/50 text-xs tracking-wider uppercase">Active Treatment</TableHead>
                                    <TableHead className="text-white/50 text-xs tracking-wider uppercase">Balance Due</TableHead>
                                    <TableHead className="text-white/50 text-xs tracking-wider uppercase">Forms Intake</TableHead>
                                    <TableHead className="text-white/50 text-xs tracking-wider uppercase text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[...patients].sort((a, b) => {
                                    const aPendingBalance = charges.some(c => c.patientId === a.id && c.status === "PENDING");
                                    const bPendingBalance = charges.some(c => c.patientId === b.id && c.status === "PENDING");

                                    const aNeedsAttention = a.approvalStatus === "PENDING_APPROVAL" || a.approvalStatus === "PENDING_FORMS" || aPendingBalance;
                                    const bNeedsAttention = b.approvalStatus === "PENDING_APPROVAL" || b.approvalStatus === "PENDING_FORMS" || bPendingBalance;

                                    if (aNeedsAttention && !bNeedsAttention) return -1;
                                    if (!aNeedsAttention && bNeedsAttention) return 1;
                                    return 0;
                                }).map(patient => {
                                    const balance = getPatientPendingBalance(patient.id);
                                    return (
                                        <TableRow
                                            key={patient.id}
                                            className="border-border/50 text-white/80 hover:bg-white/5 cursor-pointer transition-colors"
                                            onClick={() => {
                                                setSelectedGlobalPatientId(patient.id);
                                                router.push('/admin/patients');
                                            }}
                                        >
                                            <TableCell className="font-medium text-white flex items-center gap-3 py-4">
                                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-serif text-white">
                                                    {patient.name.charAt(0)}
                                                </div>
                                                {patient.name}
                                            </TableCell>
                                            <TableCell className="py-4 text-sm">
                                                {patient.activeTreatment}
                                                {patient.approvalStatus === "PENDING_APPROVAL" && (
                                                    <Badge variant="outline" className="ml-2 border-[#a10c22]/50 text-[#a10c22]/90 bg-[#a10c22]/10 text-[10px] uppercase">
                                                        Requires Auth
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {balance > 0 ? (
                                                    <Badge variant="outline" className="border-red-500/50 text-red-400 bg-red-500/10 font-normal">
                                                        ${balance.toFixed(2)}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-white/40 text-sm">Clear</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {patient.formsStatus === "COMPLETED" ? (
                                                    <Badge variant="outline" className="border-[#a10c22]/50 text-[#a10c22] bg-[#a10c22]/10 font-normal">
                                                        Completed
                                                    </Badge>
                                                ) : (
                                                    <span className="text-[#a10c22]/80 text-sm">Action Needed</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right py-4 relative group-hover:pr-32 transition-all duration-300">
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {patient.formsStatus === "PENDING" && (
                                                        <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase tracking-wider border-[#a10c22]/30 text-[#a10c22] hover:bg-[#a10c22]/10 hidden md:flex" onClick={(e) => { e.stopPropagation(); toast.success("Reminder sent.") }}>
                                                            Remind
                                                        </Button>
                                                    )}
                                                    {patient.approvalStatus === "PENDING_APPROVAL" && (
                                                        <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase tracking-wider border-[#a10c22]/30 text-[#a10c22] hover:bg-[#a10c22]/10 hidden md:flex" onClick={(e) => { e.stopPropagation(); setSelectedGlobalPatientId(patient.id); router.push('/admin/patients'); }}>
                                                            Review
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/50 hover:text-white">
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/50 group-hover:opacity-0 transition-opacity">
                                                    <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Audit & Security Logs */}
                <div className="mt-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-serif text-white flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-[#a10c22]" />
                                Security & Audit Logs
                            </h2>
                            <p className="text-sm text-white/50 mt-1">Immutable record of system actions, authorizations, and compliance events.</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-transparent border-white/10 text-white hover:bg-white/5"
                            onClick={() => router.push('/admin/analytics')}
                        >
                            View Full Security Ledger
                        </Button>
                    </div>

                    <div className="bg-[#0C1420] border border-border/50 rounded-xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-white/5">
                                    <TableRow className="border-border/50 hover:bg-transparent">
                                        <TableHead className="text-white/50 text-xs tracking-wider uppercase pl-6">Timestamp</TableHead>
                                        <TableHead className="text-white/50 text-xs tracking-wider uppercase">Actor</TableHead>
                                        <TableHead className="text-white/50 text-xs tracking-wider uppercase">Action</TableHead>
                                        <TableHead className="text-white/50 text-xs tracking-wider uppercase">Details</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {auditLogs.slice(0, 10).map((log) => (
                                        <TableRow key={log.id} className="border-border/50 hover:bg-white/5">
                                            <TableCell className="pl-6 py-4 text-sm text-white/60">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="py-4 font-medium text-white text-sm">
                                                {log.userName}
                                                <span className="block text-xs text-white/40">{log.userRole}</span>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge
                                                    variant="outline"
                                                    className={`font-normal text-[10px] tracking-wider uppercase ${log.category === 'AUTH' || log.category === 'ADMIN' || log.action.includes('DELETE') ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                                                            log.category === 'PHI_ACCESS' || log.category === 'COMPLIANCE' || log.action.includes('CLINICAL') ? 'border-[#a10c22]/30 text-[#a10c22] bg-[#a10c22]/10' :
                                                                log.category === 'BILLING' || log.action.includes('CHARGE') ? 'border-[#a10c22]/30 text-[#a10c22] bg-[#a10c22]/10' :
                                                                    'border-white/10 text-white/60 bg-white/5'
                                                        }`}
                                                >
                                                    {log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4 text-sm text-white/80 max-w-md truncate">
                                                {log.details}
                                                {log.resourceType && (
                                                    <span className="ml-2 text-xs text-white/40 font-mono bg-black/50 px-1 py-0.5 rounded border border-white/5">
                                                        {log.resourceType}:{log.resourceId?.slice(0, 8)}...
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {auditLogs.length === 0 && (
                                        <TableRow className="border-border/50 hover:bg-transparent">
                                            <TableCell colSpan={4} className="text-center py-12 text-white/30">
                                                <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                                No audit logs recorded matching your permission level.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
