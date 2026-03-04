import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LeadIntakeForm } from "@/components/LeadIntakeForm";
import { tenant } from "@/lib/theme.config";

export default function ConsultationPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Minimal Header */}
            <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-xl">{tenant.logoInitial}</div>
                        <span className="font-serif text-xl tracking-wide">{tenant.name}</span>
                    </Link>
                    <Link href="/login">
                        <Button variant="ghost" className="text-muted-foreground hover:text-white">
                            Patient Login
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="flex-1 pt-32 pb-24 container mx-auto px-6 max-w-4xl flex items-center justify-center">
                <div className="w-full">
                    <div className="text-center mb-12 animate-in fade-in duration-700">
                        <h1 className="text-4xl md:text-5xl font-serif mb-4">Request a Consultation</h1>
                        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                            Begin your journey to optimal health. Please provide your clinical context below. This acts as the first step towards your official Wellness Intake.
                        </p>
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        <LeadIntakeForm />
                    </div>

                    <div className="mt-12 text-center text-sm text-muted-foreground opacity-70">
                        <p>If you are an existing patient looking to start a new protocol,</p>
                        <Link href="/login" className="text-primary hover:text-primary/80 transition-colors underline underline-offset-4">
                            Log in to your Patient Portal.
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
