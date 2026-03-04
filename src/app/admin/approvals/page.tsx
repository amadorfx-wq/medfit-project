"use client";

import { useState } from "react";
import { useAppContext } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, ClipboardCheck, ArrowRight, Mail, AlertCircle, CheckCircle2, FileText, ShieldCheck, Truck, Package } from "lucide-react";
import { WellnessIntakeForm, MedicalWeightLossForm, SemaglutideInstructionsForm, TestosteroneTherapyForm, PeptideTherapyForm, NfcHipaaForm } from "@/app/dashboard/intake/forms";

export default function PendingApprovalsPage() {
    const { patients, authorizeTreatment, markAsShipped } = useAppContext();
    const pendingApprovals = patients.filter(p => p.approvalStatus === "PENDING_APPROVAL");
    const pendingShipments = patients.filter(p => p.approvalStatus === "PENDING_SHIPMENT");

    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [previewDoc, setPreviewDoc] = useState<string | null>(null);
    const [amount, setAmount] = useState<string>("");
    const [description, setDescription] = useState<string>("");

    const formatFormName = (slug: string) => {
        return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const handleApprove = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPatientId || !amount || !description) return;

        const patient = patients.find(p => p.id === selectedPatientId);
        if (!patient) return;

        authorizeTreatment(selectedPatientId, parseFloat(amount), description);

        toast.success("Treatment Authorized successfully", {
            description: `A secure payment link has been emailed to ${patient.email} for ${description}.`,
            icon: <Mail className="w-4 h-4 text-primary" />
        });

        setSelectedPatientId(null);
        setAmount("");
        setDescription("");
    };

    return (
        <div className="animate-in fade-in duration-500 max-w-5xl">
            <div className="mb-8">
                <h1 className="text-3xl font-serif text-white mb-2 flex items-center gap-3">
                    <ClipboardCheck className="w-8 h-8 text-[#B8977E]" />
                    Pending Approvals
                </h1>
                <p className="text-white/50">Review clinical intakes, verify consent forms, and issue secure payment links.</p>
            </div>

            {/* --- MEDICAL REVIEW SECTION --- */}
            <div className="mb-10">
                <h2 className="text-xl font-serif text-white mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E8A838]" />
                    Medical Review Phase
                </h2>

                {pendingApprovals.length === 0 ? (
                    <div className="text-center py-20 bg-[#0C1420] border border-border/50 rounded-xl mb-8">
                        <CheckCircle2 className="w-12 h-12 text-[#8FA677] mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-serif text-white mb-2">All Caught Up</h3>
                        <p className="text-white/50">There are no pending patient intakes waiting for medical review.</p>
                    </div>
                ) : (
                    <div className="space-y-6 mb-8">
                        {pendingApprovals.map(patient => (
                            <Card key={patient.id} className="bg-[#0C1420] border-border/50 overflow-hidden">
                                <CardContent className="p-0 flex flex-col md:flex-row">
                                    {/* Left Side: Patient Info & Forms */}
                                    <div className="flex-1 p-6 md:p-8 border-b md:border-b-0 md:border-r border-border/50">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                                    <User className="w-5 h-5 text-white/50" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-medium text-white">{patient.name}</h3>
                                                    <p className="text-sm text-white/50">{patient.email}</p>
                                                </div>
                                            </div>
                                            <Badge className="bg-[#E8A838]/10 text-[#E8A838] border-[#E8A838]/30 hover:bg-[#E8A838]/20">
                                                Action Required
                                            </Badge>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Requested Treatment</p>
                                                <p className="text-white font-medium bg-white/5 inline-flex px-3 py-1.5 rounded-md border border-white/5">
                                                    {patient.activeTreatment}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    Completed Forms Log <CheckCircle2 className="w-3 h-3 text-[#8FA677]" />
                                                </p>
                                                <div className="space-y-2">
                                                    {patient.completedForms.map((formSlug, idx) => (
                                                        <div key={idx} className="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-white/5">
                                                            <span className="text-sm text-white/80">{formatFormName(formSlug)}</span>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 text-xs text-[#B8977E] hover:text-white hover:bg-white/5"
                                                                onClick={() => setPreviewDoc(formSlug)}
                                                            >
                                                                View PDF
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Side: Approval Action */}
                                    <div className="w-full md:w-96 p-6 md:p-8 bg-black/10 flex flex-col justify-center">
                                        {selectedPatientId === patient.id ? (
                                            <div className="animate-in slide-in-from-right-4 duration-300">
                                                <div className="flex items-center justify-between mb-6">
                                                    <h4 className="text-lg font-serif text-white">Issue Invoice</h4>
                                                    <Button variant="ghost" size="sm" onClick={() => setSelectedPatientId(null)} className="h-8 text-white/50 hover:text-white">
                                                        Cancel
                                                    </Button>
                                                </div>
                                                <form onSubmit={handleApprove} className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-white/60 text-xs uppercase tracking-wider">Line Item Description</Label>
                                                        <Input
                                                            placeholder="e.g. Initial Consultation & Labs"
                                                            className="bg-[#0C1420] border-border/50 text-white"
                                                            value={description}
                                                            onChange={(e) => setDescription(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-white/60 text-xs uppercase tracking-wider">Amount Due</Label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                placeholder="0.00"
                                                                className="bg-[#0C1420] border-border/50 pl-8 font-serif text-lg text-white"
                                                                value={amount}
                                                                onChange={(e) => setAmount(e.target.value)}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <Button type="submit" className="w-full bg-[#B8977E] hover:bg-[#B8977E]/90 text-black font-semibold mt-2 h-11">
                                                        Send Payment Link
                                                        <ArrowRight className="w-4 h-4 ml-2" />
                                                    </Button>
                                                    <p className="text-[10px] text-white/30 text-center mt-3">
                                                        Authorizing will instantly notify the patient and append the balance to their secure portal.
                                                    </p>
                                                </form>
                                            </div>
                                        ) : (
                                            <div className="text-center space-y-6">
                                                <div className="w-16 h-16 rounded-full bg-[#E8A838]/10 flex items-center justify-center mx-auto mb-4 border border-[#E8A838]/20">
                                                    <AlertCircle className="w-8 h-8 text-[#E8A838]" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-medium text-white mb-2">Ready for Review</h4>
                                                    <p className="text-sm text-white/50 mb-6">Intake forms are complete. Please review the patient's medical history before authorizing treatment.</p>
                                                </div>
                                                <Button
                                                    onClick={() => {
                                                        setSelectedPatientId(patient.id);
                                                        setDescription(patient.activeTreatment); // Auto-fill
                                                    }}
                                                    className="w-full bg-white text-black hover:bg-white/90 font-medium"
                                                >
                                                    Approve & Set Price
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* --- PHARMACY FULFILLMENT SECTION --- */}
            <div>
                <h2 className="text-xl font-serif text-white mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8FA677]" />
                    Pharmacy Fulfillment Phase
                </h2>

                {pendingShipments.length === 0 ? (
                    <div className="text-center py-20 bg-[#0C1420]/50 border border-border/50 rounded-xl">
                        <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
                        <h3 className="text-xl font-serif text-white mb-2">No Active Shipments</h3>
                        <p className="text-white/50">All paid orders have been shipped to patients.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {pendingShipments.map(patient => (
                            <Card key={patient.id} className="bg-[#0C1420] border-border/50 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#8FA677]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-6 w-full md:w-auto">
                                        <div className="w-14 h-14 rounded-full bg-[#8FA677]/10 flex items-center justify-center border border-[#8FA677]/20 shrink-0">
                                            <Package className="w-6 h-6 text-[#8FA677]" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-xl font-medium text-white">{patient.name}</h3>
                                                <Badge className="bg-[#8FA677]/10 text-[#8FA677] border-[#8FA677]/30">Paid & Ready</Badge>
                                            </div>
                                            <p className="text-sm text-white/50 mb-2">Shipment details needed for: <strong className="text-white/80">{patient.activeTreatment}</strong></p>
                                            <p className="text-xs text-white/40 flex items-center gap-2">
                                                <AlertCircle className="w-3 h-3" /> Address: {patient.address || "No address on file. Contact patient."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="w-full md:w-auto shrink-0 flex flex-col gap-3">
                                        <Button
                                            onClick={() => markAsShipped(patient.id)}
                                            className="w-full md:w-48 bg-[#8FA677] hover:bg-[#8FA677]/90 text-black font-semibold h-11"
                                        >
                                            <Truck className="w-4 h-4 mr-2" /> Mark as Shipped
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Document Preview Modal */}
            <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
                <DialogContent className="max-w-4xl bg-[#080808] border-[#E5E5E5]/10 text-white p-0 overflow-hidden">
                    <div className="flex flex-col h-[85vh]">
                        <div className="p-6 border-b border-white/10 bg-[#0C1420] flex justify-between items-center">
                            <div>
                                <DialogTitle className="font-serif text-2xl mb-1 text-white">Document Viewer</DialogTitle>
                                <DialogDescription className="text-white/50">
                                    Securely reviewing patient completed form
                                </DialogDescription>
                            </div>
                            <div className="flex gap-3">
                                <Badge variant="outline" className="text-[#8FA677] border-[#8FA677]/30 bg-[#8FA677]/10">
                                    <ShieldCheck className="w-3 h-3 mr-1" /> Verified Signature
                                </Badge>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto max-h-[70vh] custom-scrollbar p-6">
                            {previewDoc === "wellness-intake" && <WellnessIntakeForm onSubmit={() => { }} isSubmitting={false} />}
                            {previewDoc === "medical-weight-loss" && <MedicalWeightLossForm onSubmit={() => { }} isSubmitting={false} />}
                            {previewDoc === "semaglutide-instructions" && <SemaglutideInstructionsForm onSubmit={() => { }} isSubmitting={false} />}
                            {previewDoc === "testosterone-therapy" && <TestosteroneTherapyForm onSubmit={() => { }} isSubmitting={false} />}
                            {previewDoc === "peptide-therapy" && <PeptideTherapyForm onSubmit={() => { }} isSubmitting={false} />}
                            {previewDoc === "nfc-hipaa-authorization" && <NfcHipaaForm onSubmit={() => { }} isSubmitting={false} />}

                            {!["wellness-intake", "medical-weight-loss", "semaglutide-instructions", "testosterone-therapy", "peptide-therapy", "nfc-hipaa-authorization"].includes(previewDoc || "") && (
                                <div className="flex-1 flex flex-col items-center justify-center py-20">
                                    <FileText className="w-16 h-16 text-white/5 mb-4" />
                                    <p className="text-white/30 text-sm">Visual PDF embedded view of the master template loads here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
