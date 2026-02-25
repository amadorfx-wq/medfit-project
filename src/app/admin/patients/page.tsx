"use client";

import { useState } from "react";
import { useAppContext } from "@/lib/store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, Users, Activity, FileText, ChevronRight, FileCheck2, DollarSign, MapPin, Phone, Calendar, Download, Edit3, Plus, CreditCard, Clock, CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function PatientsManagementPage() {
    const { patients, charges, selectedGlobalPatientId, setSelectedGlobalPatientId, addRequiredFormToPatient } = useAppContext();
    const [searchTerm, setSearchTerm] = useState("");

    // Document Management States
    const [selectedDocumentPreview, setSelectedDocumentPreview] = useState<string | null>(null);
    const [isMapFormModalOpen, setIsMapFormModalOpen] = useState(false);
    const [selectedFormToMap, setSelectedFormToMap] = useState<string>("");

    const AVAILABLE_FORM_TEMPLATES = [
        "wellness-intake",
        "medical-weight-loss",
        "semaglutide-instructions",
        "testosterone-therapy",
        "peptide-therapy",
        "nfc-hipaa"
    ];

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
        const aPendingBalance = charges.some(c => c.patientId === a.id && c.status === "PENDING");
        const bPendingBalance = charges.some(c => c.patientId === b.id && c.status === "PENDING");

        const aNeedsAttention = a.approvalStatus === "PENDING_APPROVAL" || a.approvalStatus === "PENDING_FORMS" || aPendingBalance;
        const bNeedsAttention = b.approvalStatus === "PENDING_APPROVAL" || b.approvalStatus === "PENDING_FORMS" || bPendingBalance;

        if (aNeedsAttention && !bNeedsAttention) return -1;
        if (!aNeedsAttention && bNeedsAttention) return 1;
        return 0;
    });

    const activePatient = patients.find(p => p.id === selectedGlobalPatientId);

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

    const handleDownloadDocument = (formName: string) => {
        const promise = new Promise((resolve) => {
            setTimeout(() => {
                // Mock a PDF Download
                const blob = new Blob([`Mock PDF content for ${formName}`], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${activePatient?.name.replace(' ', '_')}_${formName}.pdf`;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 100);
                resolve(true);
            }, 1500);
        });

        toast.promise(promise, {
            loading: `Decrypting & Assembling ${formatFormName(formName)}...`,
            success: 'Secure PDF downloaded to your local drive.',
            error: 'Failed to access encrypted filesystem.',
        });
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
                                <TableRow key={patient.id} className="border-border/50 text-white/80 hover:bg-white/5 cursor-pointer" onClick={() => setSelectedGlobalPatientId(patient.id)}>
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
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                            >
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit Profile
                            </Button>
                            <Button
                                variant="outline"
                                className="bg-transparent border-white/10 text-white hover:bg-white/10"
                                onClick={() => setSelectedGlobalPatientId(null)}
                            >
                                Close Directory
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-gradient-to-br from-[#0A0F17] to-[#080D15]">
                        {/* Left Side: Demographic Panel */}
                        <div className="w-full md:w-80 lg:w-[400px] border-b md:border-b-0 md:border-r border-border/50 shrink-0 flex flex-col bg-[#0C1420]/50 backdrop-blur-xl">
                            <div className="p-8 text-center border-b border-border/50">
                                <div className="w-32 h-32 rounded-full bg-black/40 flex items-center justify-center font-serif text-5xl text-[#B8977E] border border-white/10 shadow-2xl mx-auto mb-6 relative">
                                    {activePatient.name.charAt(0)}
                                    <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-green-500 border-2 border-[#0A0F17]" />
                                </div>
                                <h2 className="text-2xl font-serif text-white">{activePatient.name}</h2>
                                <p className="text-[#8FA677] text-sm mt-1 flex items-center justify-center gap-1.5 font-medium">
                                    <Activity className="w-4 h-4" />
                                    {activePatient.activeTreatment}
                                </p>
                            </div>

                            <div className="p-8 flex-1 overflow-y-auto">
                                <h3 className="text-xs text-white/40 uppercase tracking-widest mb-6 font-semibold">Contact & Demographics</h3>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                                            <Phone className="w-4 h-4 text-[#B8977E]" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-white/50 mb-1">Phone Number</p>
                                            <p className="text-sm text-white">{activePatient.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                                            <Mail className="w-4 h-4 text-[#B8977E]" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-white/50 mb-1">Email Address</p>
                                            <p className="text-sm text-white break-all">{activePatient.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                                            <MapPin className="w-4 h-4 text-[#B8977E]" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-white/50 mb-1">Physical Address</p>
                                            <p className="text-sm text-white leading-relaxed">{activePatient.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                                            <Calendar className="w-4 h-4 text-[#B8977E]" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-white/50 mb-1">Date of Birth</p>
                                            <p className="text-sm text-white">{activePatient.dob}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Consolidated History (Tabs) */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8">
                            <Tabs defaultValue="medical" className="w-full max-w-5xl mx-auto">
                                <TabsList className="bg-[#0C1420] border border-white/10 p-1 mb-8">
                                    <TabsTrigger value="medical" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50">
                                        Medical Records & Forms
                                    </TabsTrigger>
                                    <TabsTrigger value="financial" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50">
                                        Purchases & Financial History
                                    </TabsTrigger>
                                </TabsList>

                                {/* TAB 1: Medical Records */}
                                <TabsContent value="medical" className="space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                        <div>
                                            <h3 className="text-2xl font-serif text-white">Clinical Footprint</h3>
                                            <p className="text-white/50 text-sm mt-1">Legally binding intake consents and laboratory logs.</p>
                                        </div>
                                        {activePatient.completedForms.length > 0 && (
                                            <Button
                                                className="bg-[#B8977E] text-black hover:bg-[#B8977E]/90 h-11 px-6 font-medium shadow-[0_0_20px_rgba(184,151,126,0.15)]"
                                                onClick={() => {
                                                    const promise = new Promise((resolve) => setTimeout(resolve, 2000));
                                                    toast.promise(promise, {
                                                        loading: 'Compiling Encrypted Medical File...',
                                                        success: 'Secure PDF Ready for Download.',
                                                        error: 'Error Compiling Data.',
                                                    });
                                                }}
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                Export Medical Record
                                            </Button>
                                        )}
                                    </div>

                                    {activePatient.requiredForms.length === 0 ? (
                                        <div className="text-center py-24 bg-black/20 rounded-2xl border border-white/5 border-dashed">
                                            <FileText className="w-12 h-12 text-white/10 mx-auto mb-4" />
                                            <p className="text-white/40">No records or forms are associated with this patient account yet.</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-3">
                                            {activePatient.requiredForms.map((reqFormSlug, i) => {
                                                const isCompleted = activePatient.completedForms.includes(reqFormSlug);
                                                return (
                                                    <div key={i} className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border transition-all ${isCompleted ? 'bg-black/40 border-white/5 hover:bg-white/5' : 'bg-black/20 border-white/5 border-dashed opacity-70'}`}>
                                                        <div className="flex items-center gap-5 mb-4 sm:mb-0">
                                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${isCompleted ? 'bg-[#8FA677]/10 text-[#8FA677]' : 'bg-white/5 text-white/30'}`}>
                                                                <FileText className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <h4 className={`text-base font-medium ${isCompleted ? 'text-white' : 'text-white/50'}`}>{formatFormName(reqFormSlug)}</h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    {isCompleted ? (
                                                                        <span className="flex items-center text-xs text-[#8FA677]">
                                                                            <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-xs text-white/40">Awaiting Signature</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {isCompleted ? (
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-white/70 hover:text-white hover:bg-white/10 h-9"
                                                                    onClick={() => setSelectedDocumentPreview(reqFormSlug)}
                                                                >
                                                                    Open
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="border-white/10 text-white hover:bg-white/10 h-9"
                                                                    onClick={() => handleDownloadDocument(reqFormSlug)}
                                                                >
                                                                    Download
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Badge variant="outline" className="text-[#E8A838] border-[#E8A838]/20 bg-[#E8A838]/5 uppercase px-3 py-1 text-[10px] w-fit">
                                                                Required for MD Auth
                                                            </Badge>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <Button
                                        variant="outline"
                                        className="w-full mt-4 border-dashed border-white/10 text-white/50 hover:text-white hover:bg-white/5 h-12"
                                        onClick={() => setIsMapFormModalOpen(true)}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Map New Form Template to Protocol
                                    </Button>
                                </TabsContent>

                                {/* TAB 2: Financial History */}
                                <TabsContent value="financial" className="space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                        <div>
                                            <h3 className="text-2xl font-serif text-white">Transaction Logs</h3>
                                            <p className="text-white/50 text-sm mt-1">Lifetime value and pending billing actions.</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="px-4 py-2 bg-black/40 border border-white/5 rounded-lg text-center">
                                                <p className="text-[10px] uppercase text-white/40 tracking-wider">Unpaid Blnc.</p>
                                                <p className="text-red-400 font-serif text-lg leading-tight mt-0.5">${getPatientPendingBalance(activePatient.id).toFixed(2)}</p>
                                            </div>
                                            <div className="px-4 py-2 bg-black/40 border border-white/5 rounded-lg text-center">
                                                <p className="text-[10px] uppercase text-white/40 tracking-wider">Lifetime LTV</p>
                                                <p className="text-[#8FA677] font-serif text-lg leading-tight mt-0.5">${getPatientPaidTotal(activePatient.id).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border border-white/5 rounded-xl overflow-hidden bg-black/20">
                                        <Table>
                                            <TableHeader className="bg-white/5">
                                                <TableRow className="border-white/5 hover:bg-transparent">
                                                    <TableHead className="text-white/50 text-xs">Date</TableHead>
                                                    <TableHead className="text-white/50 text-xs">Description</TableHead>
                                                    <TableHead className="text-white/50 text-xs text-right">Amount</TableHead>
                                                    <TableHead className="text-white/50 text-xs text-right">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {charges.filter(c => c.patientId === activePatient.id).map(charge => (
                                                    <TableRow key={charge.id} className="border-white/5 hover:bg-white/5">
                                                        <TableCell className="text-white/70 py-4">
                                                            <span className="flex items-center gap-2">
                                                                <Clock className="w-3.5 h-3.5 text-white/40" />
                                                                {charge.date}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-white font-medium py-4">{charge.description}</TableCell>
                                                        <TableCell className="text-right text-white font-serif py-4">${charge.amount.toFixed(2)}</TableCell>
                                                        <TableCell className="text-right py-4">
                                                            {charge.status === "PAID" ? (
                                                                <Badge className="bg-[#8FA677]/10 text-[#8FA677] border-none">Paid</Badge>
                                                            ) : (
                                                                <Badge className="bg-red-500/10 text-red-400 border-none px-3 font-normal">Pending</Badge>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {charges.filter(c => c.patientId === activePatient.id).length === 0 && (
                                                    <TableRow className="border-white/5 hover:bg-transparent">
                                                        <TableCell colSpan={4} className="text-center py-12 text-white/30">
                                                            <CreditCard className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                                            No transaction history found for this account.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 h-10 px-6">
                                            <DollarSign className="w-4 h-4 mr-2" />
                                            Billing Interruption / Manual Action
                                        </Button>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>

                    {/* Document Viewer Modal */}
                    <Dialog open={!!selectedDocumentPreview} onOpenChange={(open) => !open && setSelectedDocumentPreview(null)}>
                        <DialogContent className="bg-[#0A0F17] border-white/10 text-white sm:max-w-2xl">
                            <DialogHeader>
                                <DialogTitle className="font-serif text-2xl flex items-center gap-2">
                                    <FileCheck2 className="w-6 h-6 text-[#8FA677]" />
                                    Clinical Document Viewer
                                </DialogTitle>
                                <DialogDescription className="text-white/50">
                                    Encrypted read-only access to signed HIPAA agreements and intake protocols.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="bg-[#080D15] rounded-lg border border-white/5 p-8 mt-4 min-h-[400px] flex flex-col">
                                <div className="border-b border-white/10 pb-6 mb-6">
                                    <h4 className="text-xl font-medium text-white">{selectedDocumentPreview ? formatFormName(selectedDocumentPreview) : ''}</h4>
                                    <div className="flex gap-4 mt-3">
                                        <span className="text-xs text-white/40 flex items-center gap-1">
                                            <Users className="w-3 h-3" /> {activePatient.name}
                                        </span>
                                        <span className="text-xs text-[#8FA677] flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Verified Signature
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <FileText className="w-16 h-16 text-white/5 mx-auto mb-4" />
                                        <p className="text-white/30 text-sm">Secure document contents are loaded visually here in production via PDF.js or an embedded secure iframe.</p>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Map New Form Template Modal */}
                    <Dialog open={isMapFormModalOpen} onOpenChange={setIsMapFormModalOpen}>
                        <DialogContent className="bg-[#0C1420] border-white/10 text-white">
                            <DialogHeader>
                                <DialogTitle className="font-serif text-2xl">Map Template to Protocol</DialogTitle>
                                <DialogDescription className="text-white/50">
                                    Assign a new intake form or clinical consent requirement to this patient. It will appear pending on their portal.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                                <div className="space-y-3">
                                    <label className="text-sm text-white/70">Select Template Library</label>
                                    <div className="flex flex-col gap-2">
                                        {AVAILABLE_FORM_TEMPLATES.map((template) => {
                                            const isAlreadyRequired = activePatient.requiredForms.includes(template);
                                            return (
                                                <Button
                                                    key={template}
                                                    variant="outline"
                                                    onClick={() => !isAlreadyRequired && setSelectedFormToMap(template)}
                                                    className={`justify-start h-12 w-full border-white/5 ${isAlreadyRequired ? 'opacity-50 cursor-not-allowed bg-white/5 text-white/30' : selectedFormToMap === template ? 'bg-[#B8977E]/20 text-[#B8977E] border-[#B8977E]/50' : 'bg-black/20 text-white/70 hover:bg-white/5'}`}
                                                >
                                                    <FileText className="w-4 h-4 mr-3 opacity-50" />
                                                    {formatFormName(template)}
                                                    {isAlreadyRequired && <span className="ml-auto text-xs">Already Assigned</span>}
                                                </Button>
                                            )
                                        })}
                                    </div>
                                </div>
                                <Button
                                    className="w-full bg-[#B8977E] text-black hover:bg-[#B8977E]/90"
                                    disabled={!selectedFormToMap}
                                    onClick={() => {
                                        addRequiredFormToPatient(activePatient.id, selectedFormToMap);
                                        toast.success("Template mapped successfully to patient protocol.");
                                        setIsMapFormModalOpen(false);
                                        setSelectedFormToMap("");
                                    }}
                                >
                                    Confirm & Requirements Injection
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            )}

        </div>
    );
}
