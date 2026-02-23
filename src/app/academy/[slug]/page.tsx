import Link from "next/link";
import { Button } from "@/components/ui/button";
import { academyPosts } from "@/data/posts";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Metadata, ResolvingMetadata } from "next";

type Props = {
    params: { slug: string }
};

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
    const post = academyPosts.find(p => p.slug === params.slug);
    if (!post) {
        return { title: 'Post Not Found' };
    }
    return {
        title: `${post.title} | MedFit Academy`,
        description: post.description,
    };
}

// Ensure static generation for all slugs to prevent build errors
export function generateStaticParams() {
    return academyPosts.map((post) => ({
        slug: post.slug,
    }));
}

export default function BlogPostPage({ params }: Props) {
    const post = academyPosts.find(p => p.slug === params.slug);

    if (!post) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-[#F9F7F2] text-[#1a1a1a]"> {/* Silent Elegance Cream Background */}
            {/* Minimal Header - specialized for reader (dark text on cream) */}
            <header className="fixed top-0 w-full z-50 border-b border-black/5 bg-[#F9F7F2]/90 backdrop-blur-md">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-xl">M</div>
                        <span className="font-serif text-xl tracking-wide text-black">MedFit America</span>
                    </Link>
                    <Link href="/consultation">
                        <Button className="bg-[#8FA677] hover:bg-[#8FA677]/90 text-white font-medium text-sm rounded-full px-6 shadow-sm">
                            Request a Consultation
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="pt-32 pb-32 container mx-auto px-6 max-w-3xl">
                <Link href="/academy" className="inline-flex items-center gap-2 text-sm text-[#8FA677] font-medium hover:opacity-80 transition-opacity mb-12">
                    <ArrowLeft className="w-4 h-4" /> Back to Academy
                </Link>

                <article className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <header className="mb-14 border-b border-black/10 pb-10">
                        <div className="flex items-center gap-4 text-xs font-bold tracking-widest text-[#B8977E] uppercase mb-6">
                            <span>{post.category}</span>
                            <span className="w-1 h-1 bg-[#B8977E] rounded-full" />
                            <span>{post.readTime}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-serif text-black leading-[1.1] mb-6">
                            {post.title}
                        </h1>
                    </header>

                    <div className="prose prose-lg md:prose-xl prose-stone max-w-none 
                        prose-headings:font-serif prose-headings:text-black prose-headings:font-normal
                        prose-p:font-sans prose-p:text-stone-800 prose-p:leading-relaxed
                        prose-li:text-stone-800 marker:text-[#8FA677]
                        prose-strong:text-black prose-strong:font-semibold">
                        {post.content}
                    </div>

                    {/* Highly Converting CTA Segment */}
                    <div className="mt-20 p-10 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-black/5 text-center">
                        <h3 className="text-2xl font-serif text-black mb-4">Start Your Optimization Journey Today</h3>
                        <p className="text-stone-600 mb-8 max-w-lg mx-auto">
                            The true elegance begins with inner health. Step forward with clinically-proven strategies under physician guidance.
                        </p>
                        <Link href="/consultation">
                            <Button className="h-14 px-10 rounded-full bg-[#8FA677] hover:bg-[#7D9365] text-white text-lg font-medium shadow-md hover:shadow-lg transition-all">
                                Request a Consultation
                            </Button>
                        </Link>
                    </div>
                </article>
            </main>
        </div>
    );
}
