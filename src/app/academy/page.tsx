import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { academyPosts } from "@/data/posts";
import { ArrowRight } from "lucide-react";
import { tenant } from "@/lib/theme.config";

export default function AcademyPage() {
    return (
        <div className="min-h-screen bg-white text-[#102A52]">
            {/* Minimal Header */}
            <header className="fixed top-0 w-full z-50 border-b border-[#E5E7EB] bg-white/90 backdrop-blur-md">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded bg-[#102A52] flex items-center justify-center text-white font-serif font-bold text-xl">{tenant.logoInitial}</div>
                        <span className="font-serif text-xl tracking-wide text-[#102A52]">{tenant.name}</span>
                    </Link>
                    <Link href="/consultation">
                        <Button className="bg-[#a10c22] hover:bg-[#8b0a1d] text-white font-medium text-sm rounded-full px-6 shadow-lg shadow-[#a10c22]/20 transition-transform hover:scale-105">
                            Start Clinical Intake
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="pt-32 pb-24 container mx-auto px-6 max-w-6xl">
                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <p className="text-[#a10c22] text-sm font-bold tracking-[0.2em] uppercase mb-4">Educational Hub</p>
                    <h1 className="text-5xl md:text-6xl font-serif mb-6 text-[#102A52]">{tenant.academyName}</h1>
                    <p className="text-[#102A52]/70 text-lg max-w-2xl mx-auto">
                        Elevate your understanding of human optimization. Read specialized medical literature on longevity, peptide therapies, and weight management science.
                    </p>
                </div>

                {/* Blog Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {academyPosts.map((post, idx) => (
                        <Link href={`/academy/${post.slug}`} key={idx} className="group">
                            <Card className="bg-white border-[#E5E7EB] hover:border-[#a10c22]/50 hover:shadow-lg transition-all duration-300 h-full flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: `${idx * 100}ms` }}>
                                <div className="h-48 bg-[#f3f4f6] w-full flex items-center justify-center relative overflow-hidden">
                                    {post.image ? (
                                        <Image
                                            src={post.image}
                                            alt={post.title}
                                            fill
                                            className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                        />
                                    ) : (
                                        <>
                                            {/* Abstract generic thumbnail */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#102A52]/5 via-transparent to-[#f3f4f6] opacity-50 group-hover:scale-105 transition-transform duration-700" />
                                            <span className="font-serif text-2xl text-[#102A52]/20 italic tracking-widest">{post.category}</span>
                                        </>
                                    )}
                                </div>
                                <CardContent className="p-6 flex flex-col flex-1">
                                    <div className="flex items-center gap-4 text-xs tracking-wider text-[#102A52]/60 mb-4 uppercase font-semibold">
                                        <span>{post.date}</span>
                                        <span className="w-1 h-1 bg-[#102A52]/20 rounded-full" />
                                        <span className="text-[#a10c22]">{post.category}</span>
                                    </div>
                                    <h3 className="text-2xl font-serif text-[#102A52] leading-tight mb-4 group-hover:text-[#a10c22] transition-colors">{post.title}</h3>
                                    <p className="text-sm text-[#102A52]/70 mb-8 line-clamp-3 flex-1">{post.description}</p>

                                    <div className="mt-auto flex items-center gap-2 text-sm font-bold text-[#102A52] group-hover:text-[#a10c22] transition-colors">
                                        Read Protocol <ArrowRight className="w-4 h-4" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
