"use client";

import { useAppContext } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Activity, Droplet, Pill, CalendarCheck, Info } from "lucide-react";

export default function TreatmentsPage() {
    const { currentUser, patients } = useAppContext();

    if (!currentUser) return null;

    const patientData = patients.find(p => p.id === currentUser.id);

    return (
        <div className="p-6 md:p-12 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-10 border-b border-border/50 pb-6">
                <h1 className="text-3xl md:text-4xl font-serif mb-2">My Treatments</h1>
                <p className="text-muted-foreground">Detailed overview of your current and past clinical protocols.</p>
            </header>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Active Protocol Col */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                        <CardHeader>
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className="text-primary border-primary bg-primary/10">Active Protocol</Badge>
                                <Activity className="w-5 h-5 text-primary" />
                            </div>
                            <CardTitle className="font-serif text-2xl">{patientData?.activeTreatment || "Pending Evaluation"}</CardTitle>
                            <CardDescription>Initiated on config settings. Status: Optimizing</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-sm text-foreground/80 leading-relaxed">
                                Your current protocol is tailored to optimize your hormonal baseline and drive sustainable weight management. Regular check-ins ensure maximum efficacy.
                            </p>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 bg-black/40 p-3 rounded-lg border border-white/5">
                                    <Droplet className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <p className="font-medium text-sm">Semaglutide Formulation</p>
                                        <p className="text-xs text-muted-foreground">0.5mg Subcutaneous Injection - Weekly</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-black/40 p-3 rounded-lg border border-white/5">
                                    <Pill className="w-5 h-5 text-[#B8977E]" />
                                    <div>
                                        <p className="font-medium text-sm">NAD+ Peptide Enhancer</p>
                                        <p className="text-xs text-muted-foreground">Oral Supplement - Daily</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <h3 className="text-xl font-serif mt-10 mb-4">Treatment History</h3>
                    <Card className="bg-card border-border/50">
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/50">
                                <div className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                                    <div>
                                        <p className="font-medium">Initial Blood Panel & Baseline</p>
                                        <p className="text-xs text-muted-foreground">Completed: Jan 15, 2026</p>
                                    </div>
                                    <Badge variant="outline" className="bg-white/5 text-muted-foreground">Archived</Badge>
                                </div>
                                <div className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                                    <div>
                                        <p className="font-medium">Consultation call w/ Dr. Kitchens</p>
                                        <p className="text-xs text-muted-foreground">Completed: Jan 10, 2026</p>
                                    </div>
                                    <Badge variant="outline" className="bg-white/5 text-muted-foreground">Archived</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card className="bg-card border-border/50">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CalendarCheck className="w-5 h-5 text-muted-foreground" />
                                Next Steps
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <p className="font-medium mb-1">Follow-up Lab Work</p>
                                <p className="text-muted-foreground text-xs mb-3">Required by end of month to adjust dosage.</p>
                                <button className="w-full py-2 text-xs font-medium bg-primary/10 text-primary border border-primary/20 rounded-md hover:bg-primary/20 transition-colors">
                                    View Instructions
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-[#080808] p-5 rounded-xl border border-white/5 flex gap-3 text-sm text-muted-foreground">
                        <Info className="w-5 h-5 text-primary shrink-0" />
                        <p>Need to report a side effect or adjust a delivery? Contact your dedicated concierge team immediately.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
