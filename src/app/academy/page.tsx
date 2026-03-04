import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { academyPosts } from "@/data/posts";
import { ArrowRight } from "lucide-react";
import { tenant } from "@/lib/theme.config";

export default function AcademyPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Minimal Header */}
            <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-xl">{tenant.logoInitial}</div>
                        <span className="font-serif text-xl tracking-wide">{tenant.name}</span>
                    </Link>
                    <Link href="/consultation">
                        <Button className="bg-[#8FA677] hover:bg-[#8FA677]/90 text-black font-medium text-sm rounded-full px-6">
                            Start Clinical Intake
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="pt-32 pb-24 container mx-auto px-6 max-w-6xl">
                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <p className="text-primary text-sm font-bold tracking-[0.2em] uppercase mb-4">Educational Hub</p>
                    <h1 className="text-5xl md:text-6xl font-serif mb-6">{tenant.academyName}</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Elevate your understanding of human optimization. Read specialized medical literature on longevity, peptide therapies, and weight management science.
                    </p>
                </div>

                {/* Blog Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {academyPosts.map((post, idx) => (
                        <Link href={`/academy/${post.slug}`} key={idx} className="group">
                            <Card className="bg-[#080808] border-border/50 hover:border-[#8FA677]/50 transition-all h-full flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
                                <div className="h-48 bg-white/5 w-full flex items-center justify-center relative overflow-hidden">
                                    {post.image ? (
                                        <Image
                                            src={post.image}
                                            alt={post.title}
                                            fill
                                            className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                        />
                                    ) : (
                                        <>
                                            {/* Abstract generic thumbnail using gradients based on category */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-background opacity-50 group-hover:scale-105 transition-transform duration-700" />
                                            <span className="font-serif text-2xl text-white/20 italic tracking-widest">{post.category}</span>
                                        </>
                                    )}
                                </div>
                                <CardContent className="p-6 flex flex-col flex-1">
                                    <div className="flex items-center gap-4 text-xs tracking-wider text-muted-foreground mb-4 uppercase">
                                        <span>{post.date}</span>
                                        <span className="w-1 h-1 bg-white/20 rounded-full" />
                                        <span className="text-primary">{post.category}</span>
                                    </div>
                                    <h3 className="text-2xl font-serif leading-tight mb-4 group-hover:text-primary transition-colors">{post.title}</h3>
                                    <p className="text-sm text-foreground/70 mb-8 line-clamp-3 flex-1">{post.description}</p>

                                    <div className="mt-auto flex items-center gap-2 text-sm font-medium text-white group-hover:text-primary transition-colors">
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
