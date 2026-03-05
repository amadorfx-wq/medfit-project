"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, FileText, ChevronRight, Lock, BookOpen, Clock, Activity } from "lucide-react";

export default function AcademyPage() {
    const { currentUser } = useAuth();
    const router = useRouter();

    if (!currentUser) return null;

    // Simulate Dynamic Track based on active treatment. In a real app, this comes from a CMS.
    const isWeightLoss = currentUser.activeTreatment?.toLowerCase().includes('weight') || false;

    const trackTitle = isWeightLoss
        ? "Medical Weight Loss Curriculum"
        : "TRT & Peptide Optimization Track";

    const featuredVideo = {
        id: "v-001",
        title: isWeightLoss ? "Semaglutide Protocol: Maximizing Fat Loss" : "Understanding Peptide Therapy: The Science of Longevity",
        description: isWeightLoss ? "Dr. Kitchens explains how to mitigate GI side effects and optimize your macro timing for accelerated fat loss during month 1." : "Dr. Kitchens breaks down how specific peptides target cellular regeneration and metabolic efficiency.",
        duration: "45 min",
        thumbnail: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1000&auto=format&fit=crop"
    };

    const modules = [
        {
            id: "m-101",
            title: isWeightLoss ? "Nutrition Protocol Guide" : "Subcutaneous Injection Training",
            type: "document",
            duration: "15 min read",
            description: isWeightLoss ? "Comprehensive macronutrient tracking and MedFit approved diets." : "Step-by-step visual guide for safe at-home administration.",
            icon: FileText,
            locked: false
        },
        {
            id: "m-102",
            title: "Managing Side Effects",
            type: "video",
            duration: "22 min",
            description: "Detailed protocols for handling nausea, fatigue, or localized reactions.",
            icon: PlayCircle,
            locked: false
        },
        {
            id: "m-201",
            title: "Advanced Hypertrophy (Month 2)",
            type: "course",
            duration: "Unlock: Month 2",
            description: "Your endocrine system is now balanced. It's time to build lean tissue.",
            icon: Lock,
            locked: true
        },
        {
            id: "m-301",
            title: "Longevity & Anti-Aging (Month 3)",
            type: "course",
            duration: "Unlock: Month 3",
            description: "Advanced protocols for telomere lengthening and continuous optimization.",
            icon: Lock,
            locked: true
        }
    ];

    return (
        <div className="p-6 md:p-12 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-10 border-b border-border/50 pb-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl md:text-4xl font-serif text-white">MedFit Academy</h1>
                            <Badge variant="outline" className="bg-[#a10c22]/10 text-[#a10c22] border-[#a10c22]/30 text-[10px] uppercase font-bold tracking-widest px-3 py-1">
                                Patient Portal
                            </Badge>
                        </div>
                        <p className="text-white/50 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-[#a10c22]" />
                            Current Track: <span className="text-white font-medium">{trackTitle}</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-white/50">Your Progress</p>
                        <p className="font-serif text-2xl text-white">12% <span className="text-base text-[#a10c22] ml-2">Month 1/6</span></p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* VIP Video Block - Featured Masterclass */}
                <Card
                    className="col-span-1 md:col-span-2 lg:col-span-3 bg-[#080808] border-white/10 overflow-hidden group cursor-pointer hover:border-white/20 transition-all shadow-2xl"
                    onClick={() => router.push(`/dashboard/academy/${featuredVideo.id}`)}
                >
                    <div className="flex flex-col md:flex-row h-full">
                        <div className="md:w-5/12 p-8 md:p-12 flex flex-col justify-center bg-gradient-to-r from-[#0a0a0a] to-[#121212] z-10 border-b md:border-b-0 md:border-r border-white/5">
                            <Badge variant="outline" className="w-fit text-[#a10c22] border-[#a10c22]/30 bg-[#a10c22]/10 mb-6 text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                                Featured Masterclass
                            </Badge>
                            <h2 className="text-3xl md:text-4xl font-serif mb-4 text-white leading-tight group-hover:text-[#a10c22] transition-colors">
                                {featuredVideo.title}
                            </h2>
                            <p className="text-white/50 mb-8 text-sm md:text-base leading-relaxed">
                                {featuredVideo.description}
                            </p>
                            <div className="flex items-center gap-3 text-white">
                                <span className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 group-hover:bg-[#a10c22] group-hover:text-black transition-colors">
                                    <PlayCircle className="w-6 h-6 ml-0.5" />
                                </span>
                                <div>
                                    <p className="font-medium">Watch Masterclass</p>
                                    <p className="text-xs text-white/50 flex items-center gap-1"><Clock className="w-3 h-3" /> {featuredVideo.duration}</p>
                                </div>
                            </div>
                        </div>
                        <div className="md:w-7/12 min-h-[300px] md:min-h-full relative bg-black flex items-center justify-center overflow-hidden">
                            <div
                                className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay group-hover:scale-105 group-hover:opacity-50 transition-all duration-700"
                                style={{ backgroundImage: `url('${featuredVideo.thumbnail}')` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                            <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                                <PlayCircle className="w-8 h-8 text-white ml-1" />
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-4 mb-2">
                    <h3 className="text-xl font-serif text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-white/50" /> Course Modules
                    </h3>
                </div>

                {/* Resource Cards */}
                {modules.map((module) => (
                    <Card
                        key={module.id}
                        className={`border-white/5 transition-all duration-300 ${module.locked ? 'bg-[#050505] opacity-60 cursor-not-allowed' : 'bg-[#0C1420] hover:bg-[#111A27] hover:-translate-y-1 cursor-pointer group shadow-xl hover:shadow-2xl hover:border-white/10'}`}
                        onClick={() => !module.locked && router.push(`/dashboard/academy/${module.id}`)}
                    >
                        <CardHeader className="pb-4 relative">
                            {module.locked && (
                                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center border border-white/5">
                                    <Lock className="w-4 h-4 text-white/30" />
                                </div>
                            )}
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${module.locked ? 'bg-white/5' : 'bg-[#a10c22]/10'}`}>
                                <module.icon className={`w-6 h-6 ${module.locked ? 'text-white/20' : 'text-[#a10c22]'}`} />
                            </div>
                            <CardTitle className="font-serif text-white text-xl leading-tight mb-2">{module.title}</CardTitle>
                            <CardDescription className="text-white/40 h-10 line-clamp-2 leading-relaxed">
                                {module.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                <span className="text-xs text-white/40 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {module.duration}
                                </span>
                                {!module.locked && (
                                    <span className="flex items-center text-xs font-medium text-[#a10c22] group-hover:translate-x-1 transition-transform">
                                        Open Module <ChevronRight className="w-4 h-4 ml-1" />
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}

            </div>
        </div>
    );
}
