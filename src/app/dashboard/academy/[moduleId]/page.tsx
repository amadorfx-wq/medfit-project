"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, PlayCircle, Download, FileText, CheckCircle2, Clock, ChevronRight, Share2, Bookmark } from "lucide-react";
import { toast } from "sonner";

// This is mock data that would typically be fetched via an API based on the `moduleId`
const MOCK_CONTENT = {
    "v-001": {
        title: "Semaglutide Protocol: Maximizing Fat Loss",
        type: "video",
        duration: "45 min",
        category: "Masterclass",
        description: "Dr. Kitchens explains how to mitigate GI side effects and optimize your macro timing for accelerated fat loss during month 1. This video covers the scientific basis of GLP-1 agonists and their impact on gastric emptying.",
        transcript: `Welcome everyone to the Month 1 Masterclass. Today we are diving deep into the Semaglutide protocol... \n\nThe primary mechanism we are optimizing here is delayed gastric emptying. What this means for you on a day-to-day basis is that meal timing becomes absolutely critical. If you stack heavy carbohydrates late in the evening, you will likely experience nausea because the food is sitting in your stomach overnight.\n\nOur recommended approach for the first 30 days is a front-loaded protein intake...`,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
        thumbnail: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1000&auto=format&fit=crop"
    },
    "m-101": {
        title: "Nutrition Protocol Guide",
        type: "document",
        duration: "15 min read",
        category: "PDF Guide",
        description: "Comprehensive macronutrient tracking and MedFit approved diets tailored for optimal metabolic response.",
        transcript: `MedFit Nutrition Protocol v2.1\n\n1. Macro Optimization\nProtein is your foundation. Aim for 1g per lb of target body weight. This preserves lean mass while in a caloric deficit...\n\n2. Hydration Requirements\nMinimum 100oz of water daily. Add electrolytes if experiencing fatigue or headaches during week 1 and 2.`,
        videoUrl: null,
        thumbnail: null
    }
};

export default function AcademyModuleViewer({ params }: { params: Promise<{ moduleId: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Use mock content or fallback
    const content = MOCK_CONTENT[resolvedParams.moduleId as keyof typeof MOCK_CONTENT] || MOCK_CONTENT["v-001"];

    const handleComplete = () => {
        setIsCompleted(true);
        toast.success("Module Completed!", {
            description: "Your progress has been recorded."
        });
        setTimeout(() => {
            router.push('/dashboard/academy');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Minimalist Top Nav for returning to Academy */}
            <div className="border-b border-white/5 bg-[#0a0a0a] sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button
                        onClick={() => router.push('/dashboard/academy')}
                        className="flex items-center text-sm text-white/50 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Academy
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSaved(!isSaved)}
                            className={`p-2 rounded-full transition-colors ${isSaved ? 'text-[#a10c22] bg-[#a10c22]/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                        >
                            <Bookmark className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                    <Badge variant="outline" className="bg-white/5 text-white/70 border-white/10 text-[10px] uppercase font-bold tracking-widest px-3 py-1 mb-4 flex items-center w-fit gap-1.5">
                        {content.type === 'video' ? <PlayCircle className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                        {content.category}
                    </Badge>
                    <h1 className="text-3xl md:text-5xl font-serif leading-tight mb-4">{content.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-white/40">
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {content.duration}</span>
                        <span>•</span>
                        <span>Dr. Kitchens, MD</span>
                    </div>
                </div>

                {/* Content Area (Video or Document) */}
                {content.type === 'video' ? (
                    <div className="aspect-video w-full bg-black rounded-xl overflow-hidden border border-white/10 mb-10 shadow-2xl relative group">
                        {/* Fake Video Player for Demonstration */}
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
                            style={{ backgroundImage: `url('${content.thumbnail}')` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-500 cursor-pointer">
                            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                                <PlayCircle className="w-8 h-8 text-white ml-1" />
                            </div>
                        </div>

                        {/* Player Controls (Mock) */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between border-t border-white/10 bg-black/40 backdrop-blur-md">
                            <div className="flex items-center gap-4 w-full">
                                <PlayCircle className="w-5 h-5 text-white cursor-pointer hover:text-[#a10c22]" />
                                <div className="h-1 bg-white/20 rounded-full flex-1 overflow-hidden relative">
                                    <div className="absolute top-0 left-0 bottom-0 bg-[#a10c22] w-1/3 rounded-full" />
                                </div>
                                <span className="text-xs text-white/50 font-mono">15:00 / 45:00</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <Card className="bg-[#0c1420] border-white/5 p-8 md:p-12 mb-10">
                        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-white/10 rounded-xl bg-black/20">
                            <FileText className="w-16 h-16 text-[#a10c22] mb-6 opacity-80" />
                            <h3 className="text-xl font-medium text-white mb-2">Secure Document Available</h3>
                            <p className="text-white/50 max-w-md mx-auto mb-8">This is a comprehensive guide required for your current protocol phase. Please download for offline viewing.</p>
                            <Button className="bg-[#a10c22] text-black hover:bg-[#a6866c] shadow-lg shadow-[#a10c22]/20">
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF Guide (2.4 MB)
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Description & Transcript / Text */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h3 className="text-lg font-serif text-white mb-3">Module Overview</h3>
                            <p className="text-white/60 leading-relaxed">{content.description}</p>
                        </div>

                        <div className="pt-8 border-t border-white/10">
                            <h3 className="text-lg font-serif text-white mb-4">Transcript & Notes</h3>
                            <div className="prose prose-invert max-w-none text-white/60 prose-p:leading-relaxed prose-headings:text-white prose-a:text-[#a10c22]">
                                {content.transcript.split('\n').map((paragraph, idx) => (
                                    <p key={idx}>{paragraph}</p>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6 sticky top-24">
                            <h4 className="font-medium text-white mb-4 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#a10c22]" />
                                Completion Requirements
                            </h4>
                            <p className="text-sm text-white/50 mb-6">Watching this masterclass is highly recommended before beginning week 2 of your protocol.</p>

                            <Button
                                onClick={handleComplete}
                                disabled={isCompleted}
                                className={`w-full ${isCompleted ? 'bg-[#a10c22]/20 text-[#a10c22] border-[#a10c22]/30' : 'bg-white text-black hover:bg-white/90'} border transition-all`}
                            >
                                {isCompleted ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 mr-2" /> Completed
                                    </>
                                ) : (
                                    'Mark as Completed'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
