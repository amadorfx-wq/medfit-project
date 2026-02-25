"use client";

import { useState } from "react";
import { useAppContext } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Search, Users, CreditCard, DollarSign, Calendar, LogOut, FileText, ChevronRight, AlertCircle, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
    const { currentUser, logout, patients, charges, addCharge, authorizeTreatment, setSelectedGlobalPatientId } = useAppContext();
    const router = useRouter();

    // Form state
    const [selectedPatientId, setSelectedPatientId] = useState<string>("p1");
    const [amount, setAmount] = useState<string>("");
    const [description, setDescription] = useState<string>("");

    if (!currentUser) return null;

    // KPIs calculations
    const totalPending = charges.filter(c => c.status === "PENDING").length;
    const pendingAuthorizations = patients.filter(p => p.approvalStatus === "PENDING_APPROVAL").length;
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
                                <div className="text-3xl font-serif text-white group-hover:text-[#B8977E] transition-colors">{patients.length}</div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/admin/billing" className="block focus:outline-none">
                        <Card className="bg-[#0C1420] border-border/50 text-white h-full hover:bg-[#111A27] hover:border-[#E8A838]/30 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(232,168,56,0.05)] transition-all duration-300 cursor-pointer group">
                            <CardContent className="p-5 h-full flex flex-col justify-between relative overflow-hidden">
                                {totalPending > 0 && <div className="absolute inset-0 border-l-2 border-[#E8A838]" />}
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">Pending Invoices</span>
                                    <CreditCard className={`w-4 h-4 transition-colors ${totalPending > 0 ? 'text-[#E8A838]' : 'text-white/40 group-hover:text-white/60'}`} />
                                </div>
                                <div className={`text-3xl font-serif transition-colors ${totalPending > 0 ? 'text-[#E8A838] group-hover:text-[#E8A838]/80' : 'text-white group-hover:text-[#B8977E]'}`}>{totalPending}</div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/admin/analytics" className="block focus:outline-none">
                        <Card className="bg-[#0C1420] border-border/50 text-white h-full hover:bg-[#111A27] hover:border-[#8FA677]/30 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(143,166,119,0.05)] transition-all duration-300 cursor-pointer group">
                            <CardContent className="p-5 h-full flex flex-col justify-between relative overflow-hidden">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">Revenue (MTD)</span>
                                    <DollarSign className="w-4 h-4 text-[#8FA677] group-hover:text-[#8FA677]/80 transition-colors" />
                                </div>
                                <div className="text-3xl font-serif text-white group-hover:text-[#8FA677] transition-colors">${revenueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/admin/approvals" className="block focus:outline-none">
                        <Card className="bg-[#0C1420] border-border/50 text-white h-full hover:bg-[#111A27] hover:border-[#E8A838]/30 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(232,168,56,0.05)] transition-all duration-300 cursor-pointer group">
                            <CardContent className="p-5 h-full flex flex-col justify-between relative overflow-hidden">
                                {pendingAuthorizations > 0 && <div className="absolute inset-0 border-l-2 border-[#E8A838]" />}
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">Pending Approvals</span>
                                    <AlertCircle className={`w-4 h-4 transition-colors ${pendingAuthorizations > 0 ? 'text-[#E8A838]' : 'text-white/40 group-hover:text-white/60'}`} />
                                </div>
                                <div className={`text-3xl font-serif transition-colors ${pendingAuthorizations > 0 ? 'text-[#E8A838] group-hover:text-[#E8A838]/80' : 'text-white group-hover:text-[#B8977E]'}`}>{pendingAuthorizations}</div>
                            </CardContent>
                        </Card>
                    </Link>
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
                    <Table>
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
                            {patients.map(patient => {
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
                                                <Badge variant="outline" className="ml-2 border-[#E8A838]/50 text-[#E8A838]/90 bg-[#E8A838]/10 text-[10px] uppercase">
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
                                        <TableCell className="text-right py-4">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/50 hover:text-white">
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

            </main>
        </div>
    );
}
