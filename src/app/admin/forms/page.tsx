"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, FileText, ChevronRight, Activity, ShieldCheck, HeartPulse, Stethoscope, Download, Copy, Loader2, FileCheck2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { WellnessIntakeForm, MedicalWeightLossForm, SemaglutideInstructionsForm, TestosteroneTherapyForm, PeptideTherapyForm, NfcHipaaForm } from "@/app/dashboard/intake/forms";

type FormTemp = { title: string; required: boolean; updated: string; id?: string };
type TreatmentCategory = { id: string; name: string; icon: any; activePatients: number; forms: FormTemp[]; color: string };

export default function TreatmentsAndFormsPage() {
    const router = useRouter();
    const [selectedTreatment, setSelectedTreatment] = useState<string>("Weight Loss Protocol");
    const [previewDoc, setPreviewDoc] = useState<string | null>(null);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [selectedFormToMap, setSelectedFormToMap] = useState("");
    const [formSearchQuery, setFormSearchQuery] = useState("");
    const [isNavigating, setIsNavigating] = useState<string | null>(null);

    // Global click and hydration tracer
    useEffect(() => {
        console.log("TreatmentsAndFormsPage Rendered, selectedTreatment:", selectedTreatment);
        const logClick = (e: MouseEvent) => {
            console.log("GLOBAL CLICK INTERCEPTED AT:", e.target);
            // alert(`Click target: ${ (e.target as HTMLElement).tagName } \nClasses: ${ (e.target as HTMLElement).className } `);
        };
        document.addEventListener('click', logClick, true); // true = capture phase
        return () => document.removeEventListener('click', logClick, true);
    }, [selectedTreatment]);

    const [treatmentsState, setTreatmentsState] = useState<TreatmentCategory[]>([
        {
            id: "weight-loss",
            name: "Weight Loss Protocol",
            icon: Activity,
            activePatients: 142,
            forms: [
                { title: "Wellness Intake Form", required: true, updated: "2025-10-15" },
                { title: "Medical Weight Loss Consent", required: true, updated: "2026-01-20" },
                { title: "Semaglutide Protocol Instructions", required: true, updated: "2026-02-10" }
            ],
            color: "text-[#B8977E]"
        },
        {
            id: "trt",
            name: "Testosterone Optimization (TRT)",
            icon: ShieldCheck,
            activePatients: 84,
            forms: [
                { title: "Wellness Intake Form", required: true, updated: "2025-10-15" },
                { title: "Testosterone Therapy Consent", required: true, updated: "2026-01-05" }
            ],
            color: "text-[#8FA677]"
        },
        {
            id: "peptides",
            name: "Peptide Therapy",
            icon: HeartPulse,
            activePatients: 56,
            forms: [
                { title: "Wellness Intake Form", required: true, updated: "2025-10-15" },
                { title: "Peptide Therapy Consent", required: true, updated: "2025-11-20" }
            ],
            color: "text-[#E8A838]"
        },
        {
            id: "nfc",
            name: "NFC Blood Labs Analysis",
            icon: Stethoscope,
            activePatients: 210,
            forms: [
                { title: "Wellness Intake Form", required: true, updated: "2025-10-15" },
                { title: "NFC HIPAA Authorization", required: true, updated: "2026-02-01" }
            ],
            color: "text-white"
        }
    ]);

    const activeDetails = treatmentsState.find(t => t.name === selectedTreatment);

    const handleCopy = (e: React.MouseEvent, form: FormTemp) => {
        console.log("Copy clicked for:", form.title);

        try {
            setTreatmentsState((prev: TreatmentCategory[]) => prev.map((t: TreatmentCategory) => {
                if (t.name === selectedTreatment) {
                    const newForm = { ...form, id: Date.now().toString(), title: `${form.title} - Copia`, updated: new Date().toISOString().split('T')[0] };
                    return { ...t, forms: [...t.forms, newForm] };
                }
                return t;
            }));
            toast.success(`Template duplicated: ${form.title} - Copia`);
        } catch (error) {
            console.error(error);
            toast.error('Database error while duplicating.');
        }
    };

    const handleDownload = (e: React.MouseEvent, title: string) => {
        console.log("Download clicked for:", title);

        const promise = new Promise((resolve) => {
            setTimeout(() => {
                const blob = new Blob([`Mock PDF content for Blank Template: ${title} `], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Template_${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 100);
                resolve(true);
            }, 1000);
        });

        toast.promise(promise, {
            loading: `Packaging master PDF for ${title}...`,
            success: 'Reference Blank PDF downloaded successfully.',
            error: 'Failed to access filesystem.',
        });
    };

    const handleOpenPreview = (e: React.MouseEvent, title: string) => {
        console.log("Open Preview clicked for:", title);
        setPreviewDoc(title);
    };

    const handleGoToBuilder = (e: React.MouseEvent, title: string) => {
        console.log("Go To Builder clicked for:", title);
        setIsNavigating(title);
        toast.info(`Routing to Builder Editor for ${title}...`);

        try {
            router.push(`/ admin / forms / builder ? form = ${encodeURIComponent(title)} `);
        } catch (err) {
            console.error("Router error:", err);
            window.location.href = `/ admin / forms / builder ? form = ${encodeURIComponent(title)} `;
        }
    };

    const handleMapNewForm = (e: React.MouseEvent) => {
        if (!selectedFormToMap) return;

        console.log("Map form clicked for:", selectedFormToMap);

        try {
            setTreatmentsState((prev: TreatmentCategory[]) => prev.map((t: TreatmentCategory) => {
                if (t.name === selectedTreatment) {
                    const newForm = { title: selectedFormToMap, required: true, updated: new Date().toISOString().split('T')[0] };
                    return { ...t, forms: [...t.forms, newForm] };
                }
                return t;
            }));
            toast.success(`Form template "${selectedFormToMap}" linked to ${selectedTreatment}.`);
            setIsMapModalOpen(false);
            setSelectedFormToMap("");
            setFormSearchQuery("");
        } catch (error) {
            console.error(error);
            toast.error('Failed to link template.');
        }
    };

    const handleRemoveForm = (e: React.MouseEvent, formTitleToRemove: string) => {
        e.stopPropagation();
        setTreatmentsState((prev: TreatmentCategory[]) => prev.map((t: TreatmentCategory) => {
            if (t.name === selectedTreatment) {
                return {
                    ...t,
                    forms: t.forms.filter(f => f.title !== formTitleToRemove)
                };
            }
            return t;
        }));
        toast.success(`Removed "${formTitleToRemove}" from protocol.`);
    };

    return (
        <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-serif text-white mb-2 flex items-center gap-3">
                    <FileText className="w-8 h-8 text-[#B8977E]" />
                    Treatments & Forms Center
                </h1>
                <p className="text-white/50">Manage clinical offerings and the required compliance intake mapped to each protocol.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">

                {/* Available Treatments List */}
                <div className="w-full lg:w-1/3 flex flex-col gap-3">
                    <h3 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-2 pl-2">Active Protocols</h3>
                    {treatmentsState.map((treatment: TreatmentCategory) => {
                        const isSelected = selectedTreatment === treatment.name;
                        return (
                            <button
                                key={treatment.id}
                                onClick={() => setSelectedTreatment(treatment.name)}
                                className={`w - full text - left p - 5 rounded - xl border transition - all duration - 300 flex items - center justify - between group ${isSelected ? 'bg-[#1A2332] border-[#B8977E]/30 shadow-[0_0_20px_rgba(184,151,126,0.1)]' : 'bg-[#0A0F17] hover:bg-[#0C1420] border-white/5'} `}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w - 10 h - 10 rounded - full flex items - center justify - center shrink - 0 ${isSelected ? 'bg-black/40 shadow-inner' : 'bg-white/5'} `}>
                                        <treatment.icon className={`w - 5 h - 5 ${isSelected ? treatment.color : 'text-white/40'} `} />
                                    </div>
                                    <div>
                                        <h4 className={`font - serif ${isSelected ? 'text-white text-lg' : 'text-white/70 text-base'} `}>{treatment.name}</h4>
                                        <p className="text-xs text-white/40 mt-1">{treatment.activePatients} Enrolled Patients</p>
                                    </div>
                                </div>
                                <ChevronRight className={`w - 5 h - 5 transition - transform ${isSelected ? 'text-[#B8977E] translate-x-1' : 'text-white/20 group-hover:text-white/40'} `} />
                            </button>
                        );
                    })}
                </div>

                {/* Selected Treatment Details & Forms */}
                <div className="flex-1">
                    {activeDetails && (
                        <div className="animate-in slide-in-from-right-4 duration-300 relative z-10" onClick={() => console.log("Card wrapper clicked")}>
                            <Card className="bg-[#0C1420] border-border/50 shadow-2xl relative z-20 pointer-events-auto overflow-visible">
                                <CardContent className="p-8">
                                    <div className="flex items-center justify-between mb-8 pb-8 border-b border-border/50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center border border-white/5 shadow-inner">
                                                <activeDetails.icon className={`w - 8 h - 8 ${activeDetails.color} `} />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-serif text-white">{activeDetails.name}</h2>
                                                <Badge variant="outline" className="mt-2 border-[#8FA677]/30 text-[#8FA677] bg-[#8FA677]/10 font-normal">Active System-Wide</Badge>
                                            </div>
                                        </div>
                                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
                                            Edit Protocol Outline
                                        </Button>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-serif text-white mb-6 flex items-center gap-2">
                                            Required patient templates
                                            <span className="text-xs font-sans font-normal text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{activeDetails.forms.length} Docs</span>
                                        </h3>

                                        <div className="space-y-4">
                                            {activeDetails.forms.map((form: FormTemp, idx: number) => (
                                                <div key={idx} className="flex p-5 rounded-xl border border-white/5 bg-[#080D15] justify-between items-center group hover:border-[#B8977E]/20 transition-colors">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 rounded-lg bg-black/50 border border-white/5 flex items-center justify-center">
                                                            <FileText className="w-6 h-6 text-white/50 group-hover:text-[#B8977E] transition-colors" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-base font-medium text-white">{form.title}</h4>
                                                            <div className="flex items-center gap-3 mt-1.5">
                                                                {form.required && <Badge variant="secondary" className="bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[10px] uppercase border border-red-500/20">Required for MD Auth</Badge>}
                                                                <span className="text-xs text-white/30">Last updated: {form.updated}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 relative z-[9999] pointer-events-auto">
                                                        <button
                                                            type="button"
                                                            className="h-9 px-3 rounded-md text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-colors pointer-events-auto cursor-pointer"
                                                            title="Open Preview"
                                                            onClick={(e) => { handleOpenPreview(e, form.title); }}
                                                        >
                                                            Open
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="h-9 px-2 rounded-md text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-colors pointer-events-auto cursor-pointer flex items-center justify-center"
                                                            title="Download Template"
                                                            onClick={(e) => { handleDownload(e, form.title); }}
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                        <div className="w-px h-5 bg-white/10 mx-1"></div>
                                                        <button
                                                            type="button"
                                                            className="h-9 w-9 rounded-md text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-colors pointer-events-auto cursor-pointer flex items-center justify-center p-0"
                                                            title="Duplicate Template"
                                                            onClick={(e) => { handleCopy(e, form); }}
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="h-9 w-9 rounded-md text-sm font-medium text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-colors pointer-events-auto cursor-pointer flex items-center justify-center p-0"
                                                            title="Remove Form from Protocol"
                                                            onClick={(e) => handleRemoveForm(e, form.title)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="h-9 px-4 rounded-md text-sm font-medium bg-[#1A2332] text-white hover:bg-[#B8977E] hover:text-black border border-white/10 transition-colors pointer-events-auto cursor-pointer min-w-[120px] flex items-center justify-center relative z-20"
                                                            onClick={(e) => { handleGoToBuilder(e, form.title); }}
                                                        >
                                                            {isNavigating === form.title ? <Loader2 className="w-4 h-4 animate-spin mx-auto" strokeWidth={3} /> : "Builder Editor"}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                type="button"
                                                onClick={(e) => { setIsMapModalOpen(true); }}
                                                style={{ zIndex: 9999, pointerEvents: 'auto' }}
                                                className="w-full p-5 rounded-xl border border-dashed border-white/10 text-white/50 font-medium hover:text-white hover:bg-white/5 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer relative"
                                            >
                                                <span>+ Map New Form Template to Protocol</span>
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

            </div>

            {/* Open Viewer Modal */}
            <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
                <DialogContent className="bg-[#0A0F17] border-white/10 text-white sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl flex items-center gap-2">
                            <FileCheck2 className="w-6 h-6 text-[#8FA677]" />
                            Template Pre-Viewer
                        </DialogTitle>
                        <DialogDescription className="text-white/50">
                            Read-only visualization of the master template for clinical verification.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-[#080D15] rounded-lg border border-white/5 p-8 mt-4 min-h-[500px] flex flex-col">
                        <div className="border-b border-white/10 pb-6 mb-6">
                            <h4 className="text-xl font-medium text-white">{previewDoc}</h4>
                            <div className="flex gap-4 mt-3">
                                <span className="text-xs text-white/40 flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" /> System Master Default
                                </span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto max-h-[70vh] custom-scrollbar">
                            {previewDoc === "Wellness Intake Form" && <WellnessIntakeForm onSubmit={() => { }} isSubmitting={false} />}
                            {previewDoc === "Medical Weight Loss Consent" && <MedicalWeightLossForm onSubmit={() => { }} isSubmitting={false} />}
                            {previewDoc === "Semaglutide Protocol Instructions" && <SemaglutideInstructionsForm onSubmit={() => { }} isSubmitting={false} />}
                            {previewDoc === "Testosterone Therapy Consent" && <TestosteroneTherapyForm onSubmit={() => { }} isSubmitting={false} />}
                            {previewDoc === "Peptide Therapy Consent" && <PeptideTherapyForm onSubmit={() => { }} isSubmitting={false} />}
                            {previewDoc === "NFC HIPAA Authorization" && <NfcHipaaForm onSubmit={() => { }} isSubmitting={false} />}

                            {!["Wellness Intake Form", "Medical Weight Loss Consent", "Semaglutide Protocol Instructions", "Testosterone Therapy Consent", "Peptide Therapy Consent", "NFC HIPAA Authorization"].includes(previewDoc || "") && (
                                <div className="flex-1 flex flex-col items-center justify-center py-20">
                                    <FileText className="w-16 h-16 text-white/5 mb-4" />
                                    <p className="text-white/30 text-sm">Visual PDF embedded view of the master template loads here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Map Form Modal */}
            <Dialog open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
                <DialogContent className="bg-[#0C1420] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl">+ Map New Template</DialogTitle>
                        <DialogDescription className="text-white/50">
                            Select a system form to attach to the {activeDetails?.name} intake flow.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-white/70 block mb-1">Available Global Templates</label>

                            <Input
                                placeholder="Search templates by name..."
                                className="bg-black/20 border-white/10 text-white h-11 mb-2"
                                value={formSearchQuery}
                                onChange={(e) => setFormSearchQuery(e.target.value)}
                            />

                            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                {[
                                    "Wellness Intake Forms",
                                    "NFC HIPAA Form",
                                    "Medical Weight Loss Consent Form",
                                    "Semaglutide Self-Administration Instructions",
                                    "Testosterone Replacement Therapy Forms",
                                    "Peptide Therapy Form"
                                ]
                                    .filter(t => t.toLowerCase().includes(formSearchQuery.toLowerCase()))
                                    .map(templateName => (
                                        <div
                                            key={templateName}
                                            onClick={() => setSelectedFormToMap(templateName)}
                                            className={`p-3 text-sm rounded-lg border cursor-pointer transition-colors flex items-center justify-between ${selectedFormToMap === templateName ? 'bg-[#1A2332] border-[#B8977E]/50 text-white shadow-inner' : 'border-white/5 hover:bg-white/5 text-white/60'}`}
                                        >
                                            <span>{templateName}</span>
                                            {selectedFormToMap === templateName && <CheckCircle2 className="w-4 h-4 text-[#B8977E]" />}
                                        </div>
                                    ))}
                            </div>
                        </div>
                        <Button
                            type="button"
                            className="w-full bg-[#B8977E] text-black hover:bg-[#B8977E]/90 h-12 cursor-pointer"
                            disabled={!selectedFormToMap}
                            onClick={handleMapNewForm}
                        >
                            Inject Template to Protocol
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
