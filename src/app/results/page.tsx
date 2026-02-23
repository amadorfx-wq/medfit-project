import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, BarChart, LineChart } from "lucide-react";

export default function ResultsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Minimal Header */}
            <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-xl">M</div>
                        <span className="font-serif text-xl tracking-wide">MedFit America</span>
                    </Link>
                    <Link href="/consultation">
                        <Button className="bg-[#8FA677] hover:bg-[#8FA677]/90 text-black font-medium text-sm rounded-full px-6">
                            Start Clinical Intake
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="pt-32 pb-24 container mx-auto px-6 max-w-5xl">
                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <p className="text-primary text-sm font-bold tracking-[0.2em] uppercase mb-4">Evidence-Based</p>
                    <h1 className="text-5xl md:text-6xl font-serif mb-6">Patient Outcomes</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        At MedFit America, we measure success not just in pounds lost or hormones optimized, but in the sustained quality of life our patients reclaim.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    <Card className="bg-[#080808] border-border/50">
                        <CardContent className="p-8 text-center flex flex-col items-center">
                            <TrendingUp className="w-8 h-8 text-[#E8A838] mb-4" />
                            <h3 className="text-4xl font-serif text-white mb-2">84%</h3>
                            <p className="text-sm text-muted-foreground">Average retention of lean muscle mass during aggressive weight loss protocols.</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#080808] border-border/50">
                        <CardContent className="p-8 text-center flex flex-col items-center">
                            <BarChart className="w-8 h-8 text-[#8FA677] mb-4" />
                            <h3 className="text-4xl font-serif text-white mb-2">-18%</h3>
                            <p className="text-sm text-muted-foreground">Average reduction in visceral body fat within the first 12 weeks of Semaglutide logic.</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#080808] border-border/50">
                        <CardContent className="p-8 text-center flex flex-col items-center">
                            <LineChart className="w-8 h-8 text-[#B8977E] mb-4" />
                            <h3 className="text-4xl font-serif text-white mb-2">3x</h3>
                            <p className="text-sm text-muted-foreground">Improvement in deep sleep architecture using specialized Peptide protocols.</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Case Studies */}
                <div className="space-y-8 animate-in fade-in duration-700 delay-300">
                    <h2 className="text-3xl font-serif mb-8 border-b border-white/5 pb-4">Clinical Case Studies</h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-[#050505] p-8 rounded-2xl border border-white/5">
                            <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/20">TRT Optimization</Badge>
                            <h4 className="text-xl font-serif text-white mb-2">Executive Fatigue Reversal</h4>
                            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                                Male, 45. Presented with severe brain fog, sleep apnea, and declining testosterone levels (280 ng/dL). After 6 months of a tailored TRT protocol and lifestyle staging, testosterone stabilized at 850 ng/dL. Patient reported a complete return of cognitive sharpness and an 8lb gain in lean mass.
                            </p>
                        </div>

                        <div className="bg-[#050505] p-8 rounded-2xl border border-white/5">
                            <Badge variant="outline" className="mb-4 bg-[#8FA677]/10 text-[#8FA677] border-[#8FA677]/20">GLP-1 Weight Loss</Badge>
                            <h4 className="text-xl font-serif text-white mb-2">Metabolic Syndrome Recovery</h4>
                            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                                Female, 38. Struggling with insulin resistance and pre-diabetes. Implemented a 16-week Semaglutide formulation coupled with customized NFC lab insights. Reduced A1C to normal ranges and lost 32 lbs while maintaining resting metabolic rate.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
// Placeholder Badge for this file
const Badge = ({ children, className }: { children: React.ReactNode, variant?: string, className?: string }) => (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>{children}</span>
);
