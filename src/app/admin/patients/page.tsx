"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePatients } from "@/hooks/usePatients";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, Users, Activity, FileText, ChevronRight, FileCheck2, DollarSign, MapPin, Phone, Calendar, Download, Edit3, Plus, CreditCard, Clock, CheckCircle2, Mail, AlertTriangle, ShieldAlert, Lock, Trash2, ArrowLeft, LayoutDashboard, Truck, Package, ShieldCheck, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAdminPatients } from "@/hooks/useAdminPatients";
import { useBilling } from "@/hooks/useBilling";
import { useClinical } from "@/hooks/useClinical";
import { useAudit } from "@/hooks/useAudit";

export default function PatientsManagementPage() {
    const router = useRouter();
    const { selectedGlobalPatientId, setSelectedGlobalPatientId, updatePatient, deletePatient } = usePatients();
    const { logEvent } = useAudit();
    const { addRequiredFormToPatient, authorizeTreatment } = useClinical();
    const { charges, addCharge } = useBilling();
    const { patients, isLoading, error, mutate, setPatients } = useAdminPatients();
    const [searchTerm, setSearchTerm] = useState("");

    // Document Management States
    const [selectedDocumentPreview, setSelectedDocumentPreview] = useState<string | null>(null);
    const [isMapFormModalOpen, setIsMapFormModalOpen] = useState(false);
    const [selectedFormToMap, setSelectedFormToMap] = useState<string>("");

    // CRUD States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [invoiceAmount, setInvoiceAmount] = useState<string>("");
    const [invoiceDescription, setInvoiceDescription] = useState<string>("");
    const [editForm, setEditForm] = useState<Partial<typeof patients[0]>>({});

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleSaveEdit = async () => {
        if (!activePatient) return;
        await updatePatient(activePatient.id, editForm);
        // Enterprise UI: Optimistic local state update to prevent flashing.
        setPatients(prev => prev.map(p => p.id === activePatient.id ? { ...p, ...editForm } as any : p));
        setIsEditModalOpen(false);
        toast.success("Patient profile updated successfully");
    };

    const handleIssueInvoice = async () => {
        if (!activePatient || !invoiceAmount || !invoiceDescription) return;

        // 1. Authorize the clinical treatment (moves status to PENDING_PAYMENT)
        await authorizeTreatment(activePatient.id, parseFloat(invoiceAmount), invoiceDescription);

        // 2. Add the actual charge in the billing module
        addCharge({
            patientId: activePatient.id,
            amount: parseFloat(invoiceAmount),
            description: invoiceDescription
        });

        toast.success("Treatment Authorized & Invoice Sent", {
            description: `A secure payment link for $${invoiceAmount} has been emailed to ${activePatient.name}.`,
            icon: <Mail className="w-4 h-4 text-[#a10c22]" />
        });

        setIsInvoiceModalOpen(false);
        setInvoiceAmount("");
        setInvoiceDescription("");
    };

    const handleDeletePatient = async () => {
        if (!activePatient) return;
        // Capture the ID and name BEFORE any async state changes happen
        const patientIdToDelete = activePatient.id;
        const patientNameToDelete = activePatient.name;

        // Mock Stripe Deactivation
        logEvent('STRIPE_SUBSCRIPTION_CANCELLED', `Cancelled active billing subscriptions for ${patientIdToDelete} prior to deletion.`);

        // Close modals first to prevent UI referencing a deleted/null patient
        setIsDeleteModalOpen(false);
        setIsEditModalOpen(false);

        // Optimistic UI cache burst 
        setPatients(prev => prev.filter(p => p.id !== patientIdToDelete));

        // Now run the delete
        await deletePatient(patientIdToDelete);
        toast.success(`Patient record and active subscriptions for ${patientNameToDelete} have been permanently deleted.`);
    };

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

        const aNeedsAttention = a.approvalStatus === "PENDING_APPROVAL" || a.approvalStatus === "PENDING_FORMS" || a.approvalStatus === "PENDING_SHIPMENT" || aPendingBalance;
        const bNeedsAttention = b.approvalStatus === "PENDING_APPROVAL" || b.approvalStatus === "PENDING_FORMS" || b.approvalStatus === "PENDING_SHIPMENT" || bPendingBalance;

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

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-32 h-[60vh] animate-in fade-in duration-500">
                <div className="w-12 h-12 border-4 border-[#a10c22]/20 border-t-[#a10c22] rounded-full animate-spin mb-6" />
                <h3 className="font-serif text-xl text-foreground mb-2">Decrypting Patient Records</h3>
                <p className="text-muted-foreground/70 text-sm">Establishing secure connection to healthcare pipeline...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-32 h-[60vh] animate-in fade-in duration-500">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="font-serif text-primaryxl text-foreground mb-2">Database Connection Failed</h3>
                <p className="text-muted-foreground text-sm max-w-md text-primaryenter mb-8">{error.message}</p>
                <Button onClick={mutate} className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50">
                    Retry Connection
                </Button>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">

            {/* ── PROFILE VIEW: Shown when a patient is selected ── */}
            {activePatient ? (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    {/* In-page Breadcrumb Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
                        <div className="flex items-center gap-2 text-sm min-w-0">
                            <button
                                onClick={() => setSelectedGlobalPatientId(null)}
                                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group shrink-0"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                                <span>Patients</span>
                            </button>
                            <ChevronRight className="w-3.5 h-3.5 text-foreground/20 shrink-0" />
                            <span className="text-[#a10c22] font-medium truncate">{activePatient.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-[#a10c22]/10 border-[#a10c22]/30 text-[#a10c22] hover:bg-[#a10c22]/20 h-9"
                                onClick={() => router.push(`/admin/telehealth/consultation/${activePatient.id}`)}
                            >
                                <Video className="w-3.5 h-3.5 mr-1.5" />
                                Start Video Call
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 h-9"
                                onClick={() => setIsDeleteModalOpen(true)}
                            >
                                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                Delete Patient
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-accent/50 text-accent-foreground border-border text-foreground hover:bg-accent text-accent-foreground h-9"
                                onClick={() => {
                                    setEditForm(activePatient);
                                    setIsEditModalOpen(true);
                                }}
                            >
                                <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                                Edit Profile
                            </Button>
                        </div>
                    </div>


                    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-gradient-to-br from-[#0A0F17] to-[#080D15]">
                        {/* Left Side: Demographic Panel */}
                        <div className="w-full md:w-80 lg:w-[400px] border-b md:border-b-0 md:border-r border-border shrink-0 flex flex-col bg-card text-primaryard-foreground/50 backdrop-blur-xl">
                            <div className="p-8 text-primaryenter border-b border-border">
                                <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center font-serif text-5xl text-[#a10c22] border border-border shadow-2xl mx-auto mb-6 relative">
                                    {activePatient.name.charAt(0)}
                                    <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-green-500 border-2 border-[#0A0F17]" />
                                </div>
                                <h2 className="text-primaryxl font-serif text-foreground">{activePatient.name}</h2>
                                <p className="text-[#a10c22] text-sm mt-1 flex items-center justify-center gap-1.5 font-medium">
                                    <Activity className="w-4 h-4" />
                                    {activePatient.activeTreatment}
                                </p>
                            </div>

                            <div className="p-8 flex-1 overflow-y-auto">
                                <h3 className="text-xs text-muted-foreground/70 uppercase tracking-widest mb-6 font-semibold">Contact & Demographics</h3>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-accent/50 text-accent-foreground flex items-center justify-center shrink-0 border border-border">
                                            <Phone className="w-4 h-4 text-[#a10c22]" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Phone Number</p>
                                            <p className="text-sm text-foreground">{activePatient.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-accent/50 text-accent-foreground flex items-center justify-center shrink-0 border border-border">
                                            <Mail className="w-4 h-4 text-[#a10c22]" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Email Address</p>
                                            <p className="text-sm text-foreground break-all">{activePatient.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-accent/50 text-accent-foreground flex items-center justify-center shrink-0 border border-border">
                                            <MapPin className="w-4 h-4 text-[#a10c22]" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Physical Address</p>
                                            <p className="text-sm text-foreground leading-relaxed">{activePatient.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-accent/50 text-accent-foreground flex items-center justify-center shrink-0 border border-border">
                                            <Calendar className="w-4 h-4 text-[#a10c22]" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Date of Birth</p>
                                            <p className="text-sm text-foreground">{activePatient.dob}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Consolidated History (Tabs) */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8">

                            {/* --- PATIENT STATUS ALERT --- */}
                            <div className="w-full max-w-5xl mx-auto mb-8 animate-in slide-in-from-bottom-2 duration-500">
                                {activePatient.approvalStatus === "PENDING_FORMS" && (
                                    <div className="bg-accent/50 text-accent-foreground border border-border rounded-xl p-4 flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                                                <FileText className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <h4 className="text-foreground font-medium">Pending Patient Action: Clinical Intake</h4>
                                                <p className="text-muted-foreground text-sm mt-1">Patient has not completed all required intake forms yet. Awaiting patient input before medical review can begin.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {activePatient.approvalStatus === "PENDING_APPROVAL" && (
                                    <div className="bg-[#a10c22]/10 border border-[#a10c22]/20 rounded-xl p-4 flex items-start flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-[#a10c22]/20 flex items-center justify-center shrink-0">
                                                <AlertTriangle className="w-5 h-5 text-[#a10c22]" />
                                            </div>
                                            <div>
                                                <h4 className="text-[#a10c22] font-medium">Action Required: Medical Review</h4>
                                                <p className="text-[#a10c22]/70 text-sm mt-1">Patient forms are complete. Please review records and issue an invoice securely.</p>
                                            </div>
                                        </div>
                                        <Button size="sm" className="bg-[#a10c22] text-primary-foreground hover:bg-[#a10c22]/90 font-medium shrink-0" onClick={() => setIsInvoiceModalOpen(true)}>
                                            Issue Invoice
                                        </Button>
                                    </div>
                                )}
                                {activePatient.approvalStatus === "PENDING_PAYMENT" && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                                            <DollarSign className="w-5 h-5 text-red-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-red-400 font-medium">Pending Patient Action: Payment</h4>
                                            <p className="text-red-400/80 text-sm mt-1">Treatment authorized & invoice sent. Waiting for the patient to complete their payment.</p>
                                        </div>
                                    </div>
                                )}
                                {activePatient.approvalStatus === "PENDING_SHIPMENT" && (
                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                                <Package className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-blue-400 font-medium">Action Required: Pharmacy Fulfillment</h4>
                                                <p className="text-blue-400/80 text-sm mt-1">Patient payment received. Protocol is ready to be processed and shipped.</p>
                                            </div>
                                        </div>
                                        <Button size="sm" className="bg-blue-500 text-foreground hover:bg-blue-600 font-medium shrink-0" onClick={() => window.location.href = '/admin/approvals'}>
                                            Fulfill Order
                                        </Button>
                                    </div>
                                )}
                                {activePatient.approvalStatus === "APPROVED" && (
                                    <div className="bg-[#a10c22]/10 border border-[#a10c22]/20 rounded-xl p-4 flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#a10c22]/20 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-5 h-5 text-[#a10c22]" />
                                        </div>
                                        <div>
                                            <h4 className="text-[#a10c22] font-medium">Case Active & Shipped</h4>
                                            <p className="text-[#a10c22]/80 text-sm mt-1">Patient is fully onboarded, treatment authorized, and medication shipped.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Tabs defaultValue="medical" className="w-full max-w-5xl mx-auto">
                                <TabsList className="bg-card text-primaryard-foreground border border-border p-1 mb-8">
                                    <TabsTrigger value="medical" className="data-[state=active]:bg-accent text-accent-foreground data-[state=active]:text-foreground text-muted-foreground">
                                        Medical Records & Forms
                                    </TabsTrigger>
                                    <TabsTrigger value="financial" className="data-[state=active]:bg-accent text-accent-foreground data-[state=active]:text-foreground text-muted-foreground">
                                        Purchases & Financial History
                                    </TabsTrigger>
                                </TabsList>

                                {/* TAB 1: Medical Records */}
                                <TabsContent value="medical" className="space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                        <div>
                                            <h3 className="text-primaryxl font-serif text-foreground">Clinical Footprint</h3>
                                            <p className="text-muted-foreground text-sm mt-1">Legally binding intake consents and laboratory logs.</p>
                                        </div>
                                        {activePatient.completedForms.length > 0 && (
                                            <Button
                                                className="bg-[#a10c22] text-primary-foreground hover:bg-[#a10c22]/90 h-11 px-6 font-medium shadow-[0_0_20px_rgba(184,151,126,0.15)]"
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
                                        <div className="text-primaryenter py-24 bg-muted/50 rounded-2xl border border-border border-dashed">
                                            <FileText className="w-12 h-12 text-foreground/10 mx-auto mb-4" />
                                            <p className="text-muted-foreground/70">No records or forms are associated with this patient account yet.</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-3">
                                            {activePatient.requiredForms.map((reqFormSlug, i) => {
                                                const isCompleted = activePatient.completedForms.includes(reqFormSlug);
                                                return (
                                                    <div key={i} className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border transition-all ${isCompleted ? 'bg-muted border-border hover:bg-accent/50 text-accent-foreground' : 'bg-muted/50 border-border border-dashed opacity-70'}`}>
                                                        <div className="flex items-center gap-5 mb-4 sm:mb-0">
                                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${isCompleted ? 'bg-[#a10c22]/10 text-[#a10c22]' : 'bg-accent/50 text-accent-foreground text-foreground/30'}`}>
                                                                <FileText className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <h4 className={`text-base font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>{formatFormName(reqFormSlug)}</h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    {isCompleted ? (
                                                                        <span className="flex items-center text-xs text-[#a10c22]">
                                                                            <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-xs text-muted-foreground/70">Awaiting Signature</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {isCompleted ? (
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-muted-foreground hover:text-foreground hover:bg-accent text-accent-foreground h-9"
                                                                    onClick={() => setSelectedDocumentPreview(reqFormSlug)}
                                                                >
                                                                    Open
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="border-border text-foreground hover:bg-accent text-accent-foreground h-9"
                                                                    onClick={() => handleDownloadDocument(reqFormSlug)}
                                                                >
                                                                    Download
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Badge variant="outline" className="text-[#a10c22] border-[#a10c22]/20 bg-[#a10c22]/5 uppercase px-3 py-1 text-[10px] w-fit">
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
                                        className="w-full mt-4 border-dashed border-border text-muted-foreground hover:text-foreground hover:bg-accent/50 text-accent-foreground h-12"
                                        onClick={() => setIsMapFormModalOpen(true)}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Map New Form Template to Protocol
                                    </Button>

                                    {/* MÓDULO 2: Fast-Track Compliance Auditor (Upsell Paywall) */}
                                    <div className="mt-12 rounded-2xl border border-[#a10c22]/20 bg-gradient-to-br from-[#1A2332]/50 to-[#0C1420] p-8 overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-32 bg-[#a10c22]/5 blur-[100px] rounded-full pointer-events-none" />

                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                                            <div className="flex gap-5">
                                                <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center border border-border shrink-0 shadow-lg">
                                                    <ShieldAlert className="w-6 h-6 text-[#a10c22]" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-lg font-serif text-foreground">Fast-Track Compliance Auditor</h3>
                                                        <Badge variant="outline" className="border-[#a10c22]/30 text-[#a10c22] bg-[#a10c22]/10 text-[10px] uppercase font-bold tracking-widest shrink-0">Premium Add-on</Badge>
                                                    </div>
                                                    <p className="text-muted-foreground text-sm max-w-lg leading-relaxed">
                                                        Generate a military-grade, encrypted Mega-PDF dossier with all verified e-signatures, timestamps, and audit trails for this patient. Ready for State Board Medical Audits or M&A Due Diligence in 1-click.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="w-full md:w-auto flex flex-col items-center gap-3 shrink-0">
                                                <Button
                                                    className="w-full bg-white text-primary-foreground hover:bg-white/90 h-11 px-6 shadow-xl shadow-white/5"
                                                    onClick={() => {
                                                        toast("M&A Compliance Module Locked", {
                                                            description: "Contact your MedFit Account Executive to upgrade your SaaS tier and enable automated legal diligence.",
                                                            icon: <Lock className="w-4 h-4 text-[#a10c22]" />,
                                                            duration: 5000,
                                                        })
                                                    }}
                                                >
                                                    <Lock className="w-4 h-4 mr-2 text-primary-foreground/60" />
                                                    Upgrade to Unlock
                                                </Button>
                                                <span className="text-[10px] text-foreground/30 tracking-widest uppercase">Increase valuation with 1-click M&A audits</span>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* TAB 2: Financial History */}
                                <TabsContent value="financial" className="space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                        <div>
                                            <h3 className="text-primaryxl font-serif text-foreground">Transaction Logs</h3>
                                            <p className="text-muted-foreground text-sm mt-1">Lifetime value and pending billing actions.</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="px-4 py-2 bg-muted border border-border rounded-lg text-primaryenter">
                                                <p className="text-[10px] uppercase text-muted-foreground/70 tracking-wider">Unpaid Blnc.</p>
                                                <p className="text-red-400 font-serif text-lg leading-tight mt-0.5">${getPatientPendingBalance(activePatient.id).toFixed(2)}</p>
                                            </div>
                                            <div className="px-4 py-2 bg-muted border border-border rounded-lg text-primaryenter">
                                                <p className="text-[10px] uppercase text-muted-foreground/70 tracking-wider">Lifetime LTV</p>
                                                <p className="text-[#a10c22] font-serif text-lg leading-tight mt-0.5">${getPatientPaidTotal(activePatient.id).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border border-border rounded-xl overflow-x-auto bg-muted/50">
                                        <Table className="min-w-[600px]">
                                            <TableHeader className="bg-accent/50 text-accent-foreground">
                                                <TableRow className="border-border hover:bg-transparent">
                                                    <TableHead className="text-muted-foreground text-xs">Date</TableHead>
                                                    <TableHead className="text-muted-foreground text-xs">Description</TableHead>
                                                    <TableHead className="text-muted-foreground text-xs text-right">Amount</TableHead>
                                                    <TableHead className="text-muted-foreground text-xs text-right">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {charges.filter(c => c.patientId === activePatient.id).map(charge => (
                                                    <TableRow key={charge.id} className="border-border hover:bg-accent/50 text-accent-foreground">
                                                        <TableCell className="text-muted-foreground py-4">
                                                            <span className="flex items-center gap-2">
                                                                <Clock className="w-3.5 h-3.5 text-muted-foreground/70" />
                                                                {charge.date}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-foreground font-medium py-4">{charge.description}</TableCell>
                                                        <TableCell className="text-right text-foreground font-serif py-4">${charge.amount.toFixed(2)}</TableCell>
                                                        <TableCell className="text-right py-4">
                                                            {charge.status === "PAID" ? (
                                                                <Badge className="bg-[#a10c22]/10 text-[#a10c22] border-none">Paid</Badge>
                                                            ) : (
                                                                <Badge className="bg-red-500/10 text-red-400 border-none px-3 font-normal">Pending</Badge>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {charges.filter(c => c.patientId === activePatient.id).length === 0 && (
                                                    <TableRow className="border-border hover:bg-transparent">
                                                        <TableCell colSpan={4} className="text-primaryenter py-12 text-foreground/30">
                                                            <CreditCard className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                                            No transaction history found for this account.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <Button variant="outline" className="border-border text-foreground hover:bg-accent/50 text-accent-foreground h-10 px-6">
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
                        <DialogContent className="bg-background border-border text-foreground sm:max-w-2xl">
                            <DialogHeader>
                                <DialogTitle className="font-serif text-primaryxl flex items-center gap-2">
                                    <FileCheck2 className="w-6 h-6 text-[#a10c22]" />
                                    Clinical Document Viewer
                                </DialogTitle>
                                <DialogDescription className="text-muted-foreground">
                                    Encrypted read-only access to signed HIPAA agreements and intake protocols.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="bg-background rounded-lg border border-border p-8 mt-4 min-h-[400px] flex flex-col">
                                <div className="border-b border-border pb-6 mb-6">
                                    <h4 className="text-xl font-medium text-foreground">{selectedDocumentPreview ? formatFormName(selectedDocumentPreview) : ''}</h4>
                                    <div className="flex gap-4 mt-3">
                                        <span className="text-xs text-muted-foreground/70 flex items-center gap-1">
                                            <Users className="w-3 h-3" /> {activePatient.name}
                                        </span>
                                        <span className="text-xs text-[#a10c22] flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Verified Signature
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-primaryenter">
                                        <FileText className="w-16 h-16 text-foreground/5 mx-auto mb-4" />
                                        <p className="text-foreground/30 text-sm">Secure document contents are loaded visually here in production via PDF.js or an embedded secure iframe.</p>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Map New Form Template Modal */}
                    <Dialog open={isMapFormModalOpen} onOpenChange={setIsMapFormModalOpen}>
                        <DialogContent className="bg-card text-primaryard-foreground border-border text-foreground">
                            <DialogHeader>
                                <DialogTitle className="font-serif text-primaryxl">Map Template to Protocol</DialogTitle>
                                <DialogDescription className="text-muted-foreground">
                                    Assign a new intake form or clinical consent requirement to this patient. It will appear pending on their portal.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                                <div className="space-y-3">
                                    <label className="text-sm text-muted-foreground">Select Template Library</label>
                                    <div className="flex flex-col gap-2">
                                        {AVAILABLE_FORM_TEMPLATES.map((template) => {
                                            const isAlreadyRequired = activePatient.requiredForms.includes(template);
                                            return (
                                                <Button
                                                    key={template}
                                                    variant="outline"
                                                    onClick={() => !isAlreadyRequired && setSelectedFormToMap(template)}
                                                    className={`justify-start h-12 w-full border-border ${isAlreadyRequired ? 'opacity-50 cursor-not-allowed bg-accent/50 text-accent-foreground text-foreground/30' : selectedFormToMap === template ? 'bg-[#a10c22]/20 text-[#a10c22] border-[#a10c22]/50' : 'bg-muted/50 text-muted-foreground hover:bg-accent/50 text-accent-foreground'}`}
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
                                    className="w-full bg-[#a10c22] text-primary-foreground hover:bg-[#a10c22]/90"
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

                    {/* Edit Patient Modal */}
                    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                        <DialogContent className="bg-card text-primaryard-foreground border-border text-foreground sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="font-serif text-primaryxl">Edit Patient Profile</DialogTitle>
                                <DialogDescription className="text-muted-foreground">
                                    Update demographic information or adjust pipeline status manually.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                    <Input name="name" value={editForm.name || ""} onChange={handleEditInputChange} className="bg-muted/50 border-border text-foreground" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                                    <Input name="email" value={editForm.email || ""} onChange={handleEditInputChange} className="bg-muted/50 border-border text-foreground" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                                    <Input name="phone" value={editForm.phone || ""} onChange={handleEditInputChange} className="bg-muted/50 border-border text-foreground" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Physical Address</label>
                                    <Input name="address" value={editForm.address || ""} onChange={handleEditInputChange} className="bg-muted/50 border-border text-foreground" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                                    <Input name="dob" type="date" value={editForm.dob || ""} onChange={handleEditInputChange} className="bg-muted/50 border-border text-foreground" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="border-border text-foreground hover:bg-accent/50 text-accent-foreground">Cancel</Button>
                                <Button onClick={handleSaveEdit} className="bg-[#a10c22] text-primary-foreground hover:bg-[#a10c22]/90">Save Changes</Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Delete Confirmation Modal */}
                    <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                        <DialogContent className="bg-card text-primaryard-foreground border-red-500/20 text-foreground sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="font-serif text-primaryxl text-red-500 flex items-center gap-2">
                                    <AlertTriangle className="w-6 h-6" /> Destructive Action
                                </DialogTitle>
                                <DialogDescription className="text-muted-foreground">
                                    You are about to permanently delete <strong>{activePatient.name}</strong>. All associated medical records, consent forms, and invoice associations will be unlinked. This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end gap-3 mt-6">
                                <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="border-border text-foreground hover:bg-accent/50 text-accent-foreground">Cancel</Button>
                                <Button onClick={handleDeletePatient} className="bg-red-600 hover:bg-red-700 text-foreground">Permanently Delete</Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Issue Invoice (Approval) Modal */}
                    <Dialog open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen}>
                        <DialogContent className="bg-card text-primaryard-foreground border-border text-foreground sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="font-serif text-primaryxl flex items-center gap-2">
                                    <ShieldCheck className="w-6 h-6 text-[#a10c22]" /> Authorize Treatment
                                </DialogTitle>
                                <DialogDescription className="text-muted-foreground">
                                    Approve {activePatient.name}'s protocol and issue a secure checkout link.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Protocol / Description</label>
                                    <Input
                                        placeholder="e.g. TRT Monthly Protocol"
                                        value={invoiceDescription}
                                        onChange={(e) => setInvoiceDescription(e.target.value)}
                                        className="bg-muted/50 border-border text-foreground"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Amount ($)</label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={invoiceAmount}
                                        onChange={(e) => setInvoiceAmount(e.target.value)}
                                        className="bg-muted/50 border-border text-foreground text-lg font-serif"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4 border-t border-border pt-4">
                                <Button variant="outline" onClick={() => setIsInvoiceModalOpen(false)} className="border-border text-foreground hover:bg-accent/50 text-accent-foreground">Cancel</Button>
                                <Button
                                    onClick={handleIssueInvoice}
                                    disabled={!invoiceAmount || !invoiceDescription}
                                    className="bg-[#a10c22] text-primary-foreground hover:bg-[#a10c22]/90 font-medium"
                                >
                                    Authorize & Send Link
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                </div>
            ) : (
                /* ── LIST VIEW: Shown when no patient is selected ── */
                <>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-serif text-foreground mb-2 flex items-center gap-3">
                                <Users className="w-8 h-8 text-[#a10c22]" />
                                Patient Unified CRM
                            </h1>
                            <p className="text-muted-foreground">Search Directory, view profiles, and access HIPAA compliance logs.</p>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
                            <Input
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-card text-primaryard-foreground border-border text-foreground pl-9 h-11 focus-visible:ring-[#a10c22]/50"
                            />
                        </div>
                    </div>

                    {filteredPatients.some(p => p.approvalStatus === "PENDING_FORMS" || charges.some(c => c.patientId === p.id && c.status === "PENDING")) && (
                        <div className="mb-8 border border-red-500/20 bg-red-500/5 rounded-xl p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-foreground font-medium text-lg flex items-center gap-2">
                                        Revenue at Risk (Cart Abandonment)
                                        <Badge variant="outline" className="text-red-400 border-red-400/20 bg-red-400/10 text-xs">Action Required</Badge>
                                    </h3>
                                    <p className="text-muted-foreground text-sm mt-1">
                                        {filteredPatients.filter(p => p.approvalStatus === "PENDING_FORMS" || charges.some(c => c.patientId === p.id && c.status === "PENDING")).length} VIP patients have paused their intake or payment process.
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={() => toast.success("Rescue SMS Workflow Triggered.", { description: "Automated reminders sent to stalled patients." })}
                                className="bg-red-500/80 hover:bg-red-500 text-foreground whitespace-nowrap h-11"
                            >
                                Trigger Rescue SMS Flow
                            </Button>
                        </div>
                    )}

                    <div className="bg-card text-primaryard-foreground border border-border rounded-xl overflow-hidden shadow-2xl">
                        <Table>
                            <TableHeader className="bg-accent/50 text-accent-foreground">
                                <TableRow className="border-border hover:bg-transparent">
                                    <TableHead className="text-muted-foreground text-xs tracking-wider uppercase pl-6">Patient Core</TableHead>
                                    <TableHead className="text-muted-foreground text-xs tracking-wider uppercase">Active Treatment</TableHead>
                                    <TableHead className="text-muted-foreground text-xs tracking-wider uppercase">Approval Status</TableHead>
                                    <TableHead className="text-muted-foreground text-xs tracking-wider uppercase">Forms Done</TableHead>
                                    <TableHead className="text-muted-foreground text-xs tracking-wider uppercase text-right pr-6">Open Profile</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPatients.map(patient => {
                                    const percentForms = patient.requiredForms.length === 0 ? 0 : Math.round((patient.completedForms.length / patient.requiredForms.length) * 100);
                                    return (
                                        <TableRow key={patient.id} className="border-border text-foreground/80 hover:bg-accent/50 text-accent-foreground cursor-pointer" onClick={() => setSelectedGlobalPatientId(patient.id)}>
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-[#1A2332] flex items-center justify-center font-serif text-lg text-foreground border border-border shadow-inner">{patient.name.charAt(0)}</div>
                                                    <div>
                                                        <div className="font-medium text-foreground">{patient.name}</div>
                                                        <div className="text-xs text-muted-foreground/70">{patient.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 text-sm">
                                                <span className="bg-accent/50 text-accent-foreground border border-border px-3 py-1.5 rounded-md text-foreground/80">{patient.activeTreatment}</span>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {patient.approvalStatus === "APPROVED" && <Badge className="bg-[#a10c22]/10 text-[#a10c22] border-[#a10c22]/30 font-normal">Active / Approved</Badge>}
                                                {patient.approvalStatus === "PENDING_SHIPMENT" && <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 font-normal">Pending Shipment</Badge>}
                                                {patient.approvalStatus === "PENDING_PAYMENT" && <Badge className="bg-red-500/10 text-red-400 border-red-500/30 font-normal">Pending Payment</Badge>}
                                                {patient.approvalStatus === "PENDING_APPROVAL" && <Badge className="bg-[#a10c22]/10 text-[#a10c22] border-[#a10c22]/30 font-normal">Pending MD Auth</Badge>}
                                                {patient.approvalStatus === "PENDING_FORMS" && <Badge className="bg-accent/50 text-accent-foreground text-muted-foreground border-border font-normal">Incomplete Intake</Badge>}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-accent text-accent-foreground rounded-full overflow-hidden">
                                                        <div className="h-full bg-[#a10c22]" style={{ width: `${percentForms}%` }} />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground w-8">{patient.completedForms.length}/{patient.requiredForms.length}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right py-4 relative group-hover:pr-32 transition-all duration-300">
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {patient.formsStatus === "PENDING" && (
                                                        <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase tracking-wider border-[#a10c22]/30 text-[#a10c22] hover:bg-[#a10c22]/10 hidden md:flex" onClick={(e) => { e.stopPropagation(); toast.success("Reminder sent.") }}>
                                                            Remind
                                                        </Button>
                                                    )}
                                                    {patient.approvalStatus === "PENDING_APPROVAL" && (
                                                        <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase tracking-wider border-[#a10c22]/30 text-[#a10c22] hover:bg-[#a10c22]/10 hidden md:flex" onClick={(e) => { e.stopPropagation(); setSelectedGlobalPatientId(patient.id); }}>
                                                            Review
                                                        </Button>
                                                    )}
                                                </div>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground group-hover:opacity-0 transition-opacity">
                                                    <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </>
            )}

        </div>
    );
}
