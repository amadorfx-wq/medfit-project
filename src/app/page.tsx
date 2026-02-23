import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LeadIntakeForm } from "@/components/LeadIntakeForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-md py-4">
        <div className="container mx-auto px-4 xl:px-8 h-20 xl:h-24 flex items-center justify-between gap-2 lg:gap-4 xl:gap-8">

          {/* Logo (Left) */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 xl:gap-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-xl xl:text-2xl">
                M
              </div>
              <span className="font-serif text-lg xl:text-2xl tracking-wide whitespace-nowrap">MedFit America</span>
            </Link>
          </div>

          {/* Nav Menu (Center) */}
          <nav className="hidden lg:flex items-center justify-center lg:gap-5 xl:gap-10 text-xs xl:text-sm font-medium">
            <Link href="/treatments" className="hover:text-primary transition-colors tracking-wide whitespace-nowrap">Treatments</Link>
            <Link href="/results" className="hover:text-primary transition-colors tracking-wide whitespace-nowrap">Results</Link>
            <Link href="/about" className="hover:text-primary transition-colors tracking-wide whitespace-nowrap">About Us</Link>
            <Link href="/academy" className="hover:text-primary transition-colors tracking-wide whitespace-nowrap">Academy</Link>
          </nav>

          {/* Actions (Right) */}
          <div className="flex items-center justify-end gap-2 xl:gap-5">
            <Link
              href="/login"
              className="hidden lg:flex items-center justify-center text-xs xl:text-sm font-medium text-[#8FA677] bg-[#8FA677]/5 hover:bg-[#8FA677]/10 border border-[#8FA677]/20 px-3 xl:px-6 h-9 xl:h-11 rounded-full transition-all shadow-[0_0_15px_rgba(143,166,119,0.15)] hover:shadow-[0_0_20px_rgba(143,166,119,0.25)] whitespace-nowrap"
            >
              Patient Portal
            </Link>
            <a href="tel:4045550199" className="hidden xl:block text-sm font-medium text-[#B8977E] tracking-wider whitespace-nowrap ml-2">
              404-555-0199
            </a>
            <Link href="/consultation" className="flex items-center">
              <Button className="bg-[#8FA677] hover:bg-[#8FA677]/90 text-black font-medium text-xs xl:text-sm px-4 xl:px-8 h-9 xl:h-11 rounded-full transition-transform hover:scale-105 whitespace-nowrap">
                Request Consultation
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-24 overflow-hidden">
        {/* Abstract Dark Background */}
        <div className="absolute inset-0 bg-background z-0" />

        {/* Right side image fading into background */}
        <div className="absolute right-0 top-0 h-full w-full lg:w-1/2 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10 lg:from-background lg:via-background/40 lg:to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent z-10" />
          <Image
            src="/hero.png"
            alt="Warm welcoming successful patient"
            fill
            className="object-cover object-center lg:object-right opacity-80 lg:opacity-100"
            priority
          />
        </div>

        <div className="container mx-auto px-6 relative z-20">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-serif leading-tight mb-6">
              Reclaim Your <span className="text-primary italic">Best Self.</span><br />
              Feel Welcomed.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed">
              Experience compassionate, high-end medical weight loss and hormone therapy designed for your unique biology. The new standard in medical wellness.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/treatments">
                <Button size="lg" variant="outline" className="rounded-full text-md px-10 h-14 border-white/10 hover:bg-white/5">
                  View All Treatments
                </Button>
              </Link>
            </div>

            <div className="mt-16 flex items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Medically Supervised
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Fully Personalized
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Discreet & Confidential
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Treatments Section */}
      <section id="treatments" className="py-32 bg-[#080808] relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-[#B8977E] text-xs font-bold tracking-[0.2em] uppercase mb-4 block">Experience</span>
            <h2 className="text-4xl md:text-5xl font-serif">Our Treatment Portfolio</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Comprehensive NFC Panel", desc: "Advanced clinical laboratory testing and hormonal profiling to set the baseline for your metamorphic journey.", tags: ["Diagnostics", "Bloodwork", "Baseline"], link: "/treatments/nfc-panel" },
              { title: "Medical Weight Loss", desc: "Advanced metabolic reset combining customized GLP-1/GIP receptor agonists (Semaglutide/Tirzepatide). Clinically proven to drive sustainable fat loss.", tags: ["GLP-1", "Semaglutide", "Fat Loss"], link: "/treatments/weight-loss" },
              { title: "Testosterone Replacement Therapy", desc: "Comprehensive TRT to restore optimal balance, increase lean muscle mass, improve libido, and overcome andropause symptoms.", tags: ["Vitality", "Hormones", "Energy"], link: "/treatments/trt" },
              { title: "Peptide Therapy", desc: "Targeted amino acid sequencing designed to accelerate recovery, enhance cognitive function, and optimize cellular longevity.", tags: ["Recovery", "Anti-Aging", "Repair"], link: "/treatments/peptides" },
            ].map((service, i) => (
              <Card key={i} className="bg-card/50 border-border/50 backdrop-blur-sm hover:border-primary/30 transition-colors">
                <CardHeader>
                  <CardTitle className="font-serif text-2xl">{service.title}</CardTitle>
                  <CardDescription className="text-base text-muted-foreground mt-2">{service.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {service.tags.map(tag => (
                      <span key={tag} className="text-xs px-3 py-1 rounded-full bg-white/5 text-muted-foreground border border-white/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link href={service.link}>
                    <Button variant="link" className="text-primary p-0 h-auto hover:text-primary/80">
                      Learn More →
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Evaluation / Lead Capture */}
      <section className="py-32 bg-gradient-to-b from-[#080808] to-background">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-serif mb-6">Discover Your Optimal Treatment in 60 Seconds</h2>
          <p className="text-muted-foreground text-lg mb-16 max-w-2xl mx-auto">
            Answer 3 quick questions and our clinical team will reach out with a personalized recommendation — entirely bespoke and confidential.
          </p>

          <LeadIntakeForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#050505] py-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-xl">
                M
              </div>
              <span className="font-serif text-xl tracking-wide">MedFit America</span>
            </div>
            <div className="text-sm text-muted-foreground flex gap-6">
              <span>© 2026 MedFit America. All rights reserved.</span>
              <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
              <Link href="#" className="hover:text-foreground">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
