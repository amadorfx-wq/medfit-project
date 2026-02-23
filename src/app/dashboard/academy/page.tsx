"use client";

import { useAppContext } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, FileText, ChevronRight, Lock } from "lucide-react";

export default function AcademyPage() {
    const { currentUser } = useAppContext();

    if (!currentUser) return null;

    return (
        <div className="p-6 md:p-12 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-10 border-b border-border/50 pb-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-serif mb-2">MedFit Academy</h1>
                        <p className="text-muted-foreground">Exclusive educational resources for our patients.</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* VIP Video Block */}
                <Card className="col-span-1 md:col-span-2 lg:col-span-3 bg-[#080808] border-border/50 overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/2 p-8 flex flex-col justify-center bg-gradient-to-r from-primary/10 to-transparent">
                            <Badge variant="outline" className="w-fit text-primary border-primary bg-primary/10 mb-4 text-xs font-semibold uppercase tracking-widest">Featured Masterclass</Badge>
                            <h2 className="text-2xl font-serif mb-4">Understanding Peptide Therapy: The Science of Longevity</h2>
                            <p className="text-muted-foreground mb-6">Dr. Kitchens breaks down how specific peptides target cellular regeneration and metabolic efficiency.</p>
                            <button className="flex items-center gap-2 text-primary hover:text-white transition-colors font-medium">
                                <PlayCircle className="w-8 h-8" />
                                Watch Now (45 min)
                            </button>
                        </div>
                        <div className="md:w-1/2 min-h-[250px] relative bg-black flex items-center justify-center border-l border-white/5">
                            {/* Simulated Video Thumbnail */}
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
                            <PlayCircle className="w-16 h-16 text-white/50 z-10" />
                        </div>
                    </div>
                </Card>

                {/* Resource Cards */}
                <Card className="bg-card border-border/50 hover:bg-white/5 transition-colors cursor-pointer group">
                    <CardHeader>
                        <FileText className="w-8 h-8 text-primary mb-3" />
                        <CardTitle className="font-serif">Nutrition Protocol Guide</CardTitle>
                        <CardDescription>Comprehensive macronutrient tracking and MedFit approved diets.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-sm text-primary group-hover:translate-x-1 transition-transform">
                            Download PDF <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border/50 hover:bg-white/5 transition-colors cursor-pointer group">
                    <CardHeader>
                        <PlayCircle className="w-8 h-8 text-[#B8977E] mb-3" />
                        <CardTitle className="font-serif">Injection Tutorial</CardTitle>
                        <CardDescription>Step-by-step video guide for safe subcutaneous administration.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-sm text-[#B8977E] group-hover:translate-x-1 transition-transform">
                            Watch Video <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#050505] border-white/5 opacity-70">
                    <CardHeader>
                        <Lock className="w-8 h-8 text-muted-foreground mb-3" />
                        <CardTitle className="font-serif text-muted-foreground">Advanced Hypertrophy</CardTitle>
                        <CardDescription>Unlocks at Month 3 of your current protocol.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </div>
    );
}
