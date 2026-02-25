"use client";

import { useState } from "react";
import { useAppContext } from "@/lib/store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, Users, Activity, FileText, ChevronRight, FileCheck2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PatientsManagementPage() {
    const { patients, charges } = useAppContext();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activePatient = patients.find(p => p.id === selectedPatientId);

    const getPatientPendingBalance = (patientId: string) => {
        return charges
            .filter(c => c.patientId === patientId && c.status === "PENDING")
            .reduce((sum, c) => sum + c.amount, 0);
    };

    const getPatientPaidTotal = (patientId: string) => {
        return charges
            .filter(c => c.patientId === patientId && c.status === "PAID")
            .reduce((sum, c) => sum + c.amount, 0);
    };

    const formatFormName = (slug: string) => {
        return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-serif text-white mb-2 flex items-center gap-3">
                        <Users className="w-8 h-8 text-[#B8977E]" />
                        Patient Unified CRM
                    </h1>
                    <p className="text-white/50">Search Directory, view profiles, and access HIPAA compliance logs.</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <Input
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#0C1420] border-border/50 text-white pl-9 h-11 focus-visible:ring-[#B8977E]/50"
                    />
                </div>
            </div>

            <div className="bg-[#0C1420] border border-border/50 rounded-xl overflow-hidden shadow-2xl">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-border/50 hover:bg-transparent">
                            <TableHead className="text-white/50 text-xs tracking-wider uppercase pl-6">Patient Core</TableHead>
                            <TableHead className="text-white/50 text-xs tracking-wider uppercase">Active Treatment</TableHead>
                            <TableHead className="text-white/50 text-xs tracking-wider uppercase">Approval Status</TableHead>
                            <TableHead className="text-white/50 text-xs tracking-wider uppercase">Forms Done</TableHead>
                            <TableHead className="text-white/50 text-xs tracking-wider uppercase text-right pr-6">Open Profile</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPatients.map(patient => {
                            const percentForms = patient.requiredForms.length === 0 ? 0 : Math.round((patient.completedForms.length / patient.requiredForms.length) * 100);

                            return (
                                <TableRow key={patient.id} className="border-border/50 text-white/80 hover:bg-white/5 cursor-pointer" onClick={() => setSelectedPatientId(patient.id)}>
                                    <TableCell className="pl-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-[#1A2332] flex items-center justify-center font-serif text-lg text-white border border-white/5 shadow-inner">
                                                {patient.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{patient.name}</div>
                                                <div className="text-xs text-white/40">{patient.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 text-sm">
                                        <span className="bg-white/5 border border-white/5 px-3 py-1.5 rounded-md text-white/80">
                                            {patient.activeTreatment}
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        {patient.approvalStatus === "APPROVED" && <Badge className="bg-[#8FA677]/10 text-[#8FA677] border-[#8FA677]/30 font-normal hover:bg-[#8FA677]/20">Active / Approved</Badge>}
                                        {patient.approvalStatus === "PENDING_APPROVAL" && <Badge className="bg-[#E8A838]/10 text-[#E8A838] border-[#E8A838]/30 font-normal hover:bg-[#E8A838]/20">Pending MD Auth</Badge>}
                                        {patient.approvalStatus === "PENDING_FORMS" && <Badge className="bg-white/5 text-white/50 border-white/10 font-normal hover:bg-white/10">Incomplete Intake</Badge>}
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#B8977E]" style={{ width: `${percentForms}%` }} />
                                            </div>
                                            <span className="text-xs text-white/50 w-8">{patient.completedForms.length}/{patient.requiredForms.length}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6 py-4">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#B8977E] hover:text-[#B8977E] hover:bg-[#B8977E]/10">
                                            <ChevronRight className="w-5 h-5" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* UPGRADED: Full-Screen Patient Profile View */}
            {activePatient && (
                <div className="fixed inset-0 z-50 bg-[#0A0F17] flex flex-col animate-in fade-in zoom-in-95 duration-300">
                    <div className="h-20 border-b border-border/50 px-6 lg:px-10 flex items-center justify-between bg-[#0C1420] shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center border border-white/10">
                                <Users className="w-5 h-5 text-[#B8977E]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-serif text-white leading-none">Complete Medical File</h2>
                                <span className="text-xs text-white/50 uppercase tracking-widest">{activePatient.id}</span>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="bg-transparent border-white/10 text-white hover:bg-white/10"
                            onClick={() => setSelectedPatientId(null)}
                        >
                            Close Profile
                        </Button>
                    </div>

                    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                        {/* Left Side: Demographic & Balance */}
                        <div className="w-full lg:w-96 bg-[#080D15] p-6 lg:p-10 border-b lg:border-b-0 lg:border-r border-border/50 overflow-y-auto shrink-0">
                            <div className="text-center mb-8">
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#1A2332] to-[#0A0F17] flex items-center justify-center font-serif text-5xl text-white border border-white/10 shadow-2xl mx-auto mb-6">
                                    {activePatient.name.charAt(0)}
                                </div>
                                <h2 className="text-3xl font-serif text-white">{activePatient.name}</h2>
                                <p className="text-white/50 text-base mt-2">{activePatient.email}</p>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Current Active Treatment</p>
                                    <div className="flex items-center gap-2 p-4 bg-white/5 rounded-xl border border-white/5">
                                        <Activity className="w-5 h-5 text-[#8FA677]" />
                                        <p className="text-white text-base font-medium">{activePatient.activeTreatment}</p>
                                    </div>
                                </div>

                                <div className="p-5 bg-black/40 rounded-xl border border-white/5 shadow-inner">
                                    <p className="text-xs text-white/40 uppercase tracking-wider mb-4">Financial Standing</p>
                                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                                        <span className="text-base text-white/70">Unpaid Balances</span>
                                        <span className="text-red-400 font-serif text-xl">${getPatientPendingBalance(activePatient.id).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-base text-white/70">Lifetime Value</span>
                                        <span className="text-[#8FA677] font-serif text-xl">${getPatientPaidTotal(activePatient.id).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Compliance Logs */}
                        <div className="flex-1 p-6 lg:p-12 overflow-y-auto bg-gradient-to-b from-[#0C1420] to-[#080D15]">
                            <div className="max-w-4xl mx-auto">
                                <div className="mb-10">
                                    <h3 className="text-3xl font-serif flex items-center gap-3 text-white mb-2">
                                        <FileCheck2 className="w-8 h-8 text-[#B8977E]" />
                                        Medical Records & Forms
                                    </h3>
                                    <p className="text-white/50 text-base">
                                        Digital footprint of all medical intake forms and signed consents securely logged. Ready for HIPAA audit.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {activePatient.requiredForms.length === 0 ? (
                                        <div className="text-center py-20 bg-black/20 rounded-2xl border border-white/5 border-dashed">
                                            <FileText className="w-12 h-12 text-white/10 mx-auto mb-4" />
                                            <p className="text-white/40">No records or forms are associated with this patient account yet.</p>
                                        </div>
                                    ) : (
                                        activePatient.requiredForms.map((reqFormSlug, i) => {
                                            const isCompleted = activePatient.completedForms.includes(reqFormSlug);
                                            return (
                                                <div key={i} className={`flex items-center justify-between p-6 rounded-2xl border transition-colors ${isCompleted ? 'bg-[#8FA677]/5 border-[#8FA677]/20 hover:bg-[#8FA677]/10' : 'bg-black/20 border-white/5 border-dashed'}`}>
                                                    <div className="flex items-center gap-6">
                                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${isCompleted ? 'bg-[#8FA677]/20 text-[#8FA677]' : 'bg-white/5 text-white/30'}`}>
                                                            <FileText className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h4 className={`text-lg font-medium ${isCompleted ? 'text-white' : 'text-white/50'}`}>{formatFormName(reqFormSlug)}</h4>
                                                            <p className="text-sm text-white/40 mt-1">
                                                                {isCompleted ? 'Digitally Signed & Verified' : 'Awaiting Patient Signature'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {isCompleted ? (
                                                        <Button variant="outline" className="border-[#B8977E]/50 text-[#B8977E] hover:bg-[#B8977E] hover:text-black bg-transparent h-10 px-6 shrink-0 shadow-[0_0_15px_rgba(184,151,126,0.1)]">
                                                            Abre & Descarga
                                                        </Button>
                                                    ) : (
                                                        <Badge variant="outline" className="text-white/30 border-white/10 uppercase text-xs px-3 py-1 cursor-not-allowed hidden md:flex">
                                                            Pending Action
                                                        </Badge>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {activePatient.completedForms.length > 0 && (
                                    <div className="mt-12 flex justify-end">
                                        <Button className="bg-[#B8977E] text-black hover:bg-[#B8977E]/90 shadow-[0_4px_20px_rgba(184,151,126,0.2)] h-12 px-8 font-semibold">
                                            Export Medical Record (Encrypted PDF)
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
