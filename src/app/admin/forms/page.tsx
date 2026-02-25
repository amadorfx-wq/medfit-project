"use client";

import { useState } from "react";
import { Copy, FileText, Activity, ShieldCheck, HeartPulse, ChevronRight, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function TreatmentsAndFormsPage() {
    const [selectedTreatment, setSelectedTreatment] = useState<string>("Weight Loss Protocol");

    const treatments = [
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
    ];

    const activeDetails = treatments.find(t => t.name === selectedTreatment);

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
                    {treatments.map((treatment) => {
                        const isSelected = selectedTreatment === treatment.name;
                        return (
                            <button
                                key={treatment.id}
                                onClick={() => setSelectedTreatment(treatment.name)}
                                className={`w-full text-left p-5 rounded-xl border transition-all duration-300 flex items-center justify-between group ${isSelected ? 'bg-[#1A2332] border-[#B8977E]/30 shadow-[0_0_20px_rgba(184,151,126,0.1)]' : 'bg-[#0A0F17] hover:bg-[#0C1420] border-white/5'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-black/40 shadow-inner' : 'bg-white/5'}`}>
                                        <treatment.icon className={`w-5 h-5 ${isSelected ? treatment.color : 'text-white/40'}`} />
                                    </div>
                                    <div>
                                        <h4 className={`font-serif ${isSelected ? 'text-white text-lg' : 'text-white/70 text-base'}`}>{treatment.name}</h4>
                                        <p className="text-xs text-white/40 mt-1">{treatment.activePatients} Enrolled Patients</p>
                                    </div>
                                </div>
                                <ChevronRight className={`w-5 h-5 transition-transform ${isSelected ? 'text-[#B8977E] translate-x-1' : 'text-white/20 group-hover:text-white/40'}`} />
                            </button>
                        );
                    })}
                </div>

                {/* Selected Treatment Details & Forms */}
                <div className="flex-1">
                    {activeDetails && (
                        <div className="animate-in slide-in-from-right-4 duração-300">
                            <Card className="bg-[#0C1420] border-border/50 shadow-2xl">
                                <CardContent className="p-8">
                                    <div className="flex items-center justify-between mb-8 pb-8 border-b border-border/50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center border border-white/5 shadow-inner">
                                                <activeDetails.icon className={`w-8 h-8 ${activeDetails.color}`} />
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
                                            {activeDetails.forms.map((form, idx) => (
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
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-white/50 hover:text-white" title="Copy public link">
                                                            <Copy className="w-4 h-4" />
                                                        </Button>
                                                        <Button className="bg-[#1A2332] text-white hover:bg-[#B8977E] hover:text-black shadow-none border border-white/10">
                                                            Builder Editor
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}

                                            <button className="w-full p-5 rounded-xl border border-dashed border-white/10 text-white/30 font-medium hover:text-white hover:bg-white/5 transition-all text-sm flex items-center justify-center gap-2">
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
        </div>
    );
}
