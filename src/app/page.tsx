import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadIntakeForm } from "@/components/LeadIntakeForm";
import { tenant } from "@/lib/theme.config";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#102A52] selection:bg-[#a10c22]/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md py-4 border-b border-gray-100">
        <div className="container mx-auto px-4 xl:px-8 h-20 xl:h-24 flex items-center justify-between gap-2 lg:gap-4 xl:gap-8">

          {/* Logo (Left) */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 xl:gap-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-md bg-[#102A52] flex items-center justify-center text-white font-serif font-bold text-xl xl:text-2xl">
                {tenant.logoInitial}
              </div>
              <span className="font-serif text-lg xl:text-2xl tracking-wide whitespace-nowrap text-[#102A52]">{tenant.name}</span>
            </Link>
          </div>

          {/* Nav Menu (Center) */}
          <nav className="hidden lg:flex items-center justify-center lg:gap-5 xl:gap-10 text-xs xl:text-sm font-medium text-[#102A52]">
            <Link href="/treatments" className="hover:text-[#a10c22] transition-colors tracking-wide whitespace-nowrap">Treatments</Link>
            <Link href="/results" className="hover:text-[#a10c22] transition-colors tracking-wide whitespace-nowrap">Results</Link>
            <Link href="/about" className="hover:text-[#a10c22] transition-colors tracking-wide whitespace-nowrap">About Us</Link>
            <Link href="/academy" className="hover:text-[#a10c22] transition-colors tracking-wide whitespace-nowrap">Academy</Link>
          </nav>

          {/* Actions (Right) */}
          <div className="flex items-center justify-end gap-2 xl:gap-5">
            <Link
              href="/login"
              className="hidden lg:flex items-center justify-center text-xs xl:text-sm font-medium text-[#102A52] hover:text-[#a10c22] transition-colors whitespace-nowrap"
            >
              Patient Portal
            </Link>
            <a href={`tel:${tenant.phone}`} className="hidden xl:block text-sm font-medium text-[#102A52] tracking-wider whitespace-nowrap ml-2">
              {tenant.phone}
            </a>
            <Link href="/consultation" className="flex items-center">
              <Button className="bg-[#a10c22] hover:bg-[#8b0a1d] text-white font-medium text-xs xl:text-sm px-4 xl:px-8 h-9 xl:h-11 rounded-full transition-transform hover:scale-105 whitespace-nowrap shadow-lg shadow-[#a10c22]/20">
                Request Consultation
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-36 lg:pt-40 pb-20 overflow-hidden bg-white">
        {/* Abstract Dark Background -> Removed, using pure white */}
        <div className="absolute inset-0 bg-white z-0" />

        {/*
          Background Structure Replicating the Mockup:
          Pure white on the left side, image strictly confined to the right half in Desktop.
        */}
        <div className="absolute inset-0 bg-white z-0" />

        {/* The Image Container (Strictly on the right side for desktop) */}
        <div className="absolute right-0 top-0 h-full w-full lg:w-[50%] z-0">
          {/* Mobile gradient overlay for text readability */}
          <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-white via-white/80 to-transparent lg:hidden z-10" />

          {/* Desktop gradient: just a very soft fade on the exact left edge of the image to blend it with the white background */}
          <div className="hidden lg:block absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />

          <Image
            src="/hero-clean.png"
            alt="Warm welcoming successful patient"
            fill
            className="object-cover object-right md:object-[80%_15%] opacity-100"
            priority
          />
        </div>

        <div className="container mx-auto px-6 relative z-20">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-serif text-[#102A52] leading-tight mb-6">
              Reclaim Your <span className="text-[#a10c22] italic">Vitality.</span><br />
              <span className="text-3xl md:text-4xl text-[#102A52]">Atlanta&apos;s Premier Clinic for Longevity.</span>
            </h1>
            <p className="text-lg md:text-xl text-[#102A52]/70 mb-10 max-w-xl leading-relaxed">
              Experience compassionate, high-end medical weight loss and hormone therapy designed for your unique biology. The new standard in medical wellness.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/treatments">
                <Button size="lg" variant="outline" className="rounded-full text-[#102A52] border-[#102A52]/20 px-10 h-14 hover:bg-[#f3f4f6]">
                  View All Treatments
                </Button>
              </Link>
            </div>

            <div className="mt-16 flex flex-wrap items-center gap-8 text-sm text-[#102A52]/80 font-medium">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#102A52]" />
                Board-Certified Physicians
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#102A52]" />
                100% HIPAA Compliant
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#102A52]" />
                Authentic US-Compounded Medicine
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Treatments Section */}
      <section id="treatments" className="py-32 bg-[#F8F9FA] relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-[#a10c22] text-xs font-bold tracking-[0.2em] uppercase mb-4 block">Science-Backed Protocols</span>
            <h2 className="text-4xl md:text-5xl font-serif text-[#102A52]">From Custom GLP-1 Weight Loss to Peptide Therapy in Atlanta.</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Comprehensive NFC Panel", desc: "Advanced clinical laboratory testing and hormonal profiling to set the baseline for your metamorphic journey.", tags: ["Diagnostics", "Bloodwork", "Baseline"], link: "/treatments/nfc-panel" },
              { title: "Medical Weight Loss", desc: "Advanced metabolic reset combining customized GLP-1/GIP receptor agonists (Semaglutide/Tirzepatide). Clinically proven to drive sustainable fat loss.", tags: ["GLP-1", "Semaglutide", "Fat Loss"], link: "/treatments/weight-loss" },
              { title: "Testosterone Replacement Therapy", desc: "Comprehensive TRT to restore optimal balance, increase lean muscle mass, improve libido, and overcome andropause symptoms.", tags: ["Vitality", "Hormones", "Energy"], link: "/treatments/trt" },
              { title: "Peptide Therapy", desc: "Targeted amino acid sequencing designed to accelerate recovery, enhance cognitive function, and optimize cellular longevity.", tags: ["Recovery", "Anti-Aging", "Repair"], link: "/treatments/peptides" },
            ].map((service, i) => (
              <Card key={i} className="bg-white border-[#E5E7EB] hover:border-[#a10c22]/30 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="font-serif text-2xl text-[#102A52]">{service.title}</CardTitle>
                  <CardDescription className="text-sm text-[#102A52]/70 mt-3 leading-relaxed">{service.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-8 mt-2">
                    {service.tags.map(tag => (
                      <span key={tag} className="text-xs px-3 py-1 rounded-full bg-[#f3f4f6] text-[#102A52] font-medium border border-[#E5E7EB]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link href={service.link}>
                    <Button variant="link" className="text-[#a10c22] p-0 h-auto hover:text-[#8b0a1d] font-bold">
                      Learn More &rarr;
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Evaluation / Lead Capture */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-serif mb-6 text-[#102A52]">Discover Your Optimal Treatment in 60 Seconds</h2>
          <p className="text-[#102A52]/60 text-lg mb-16 max-w-2xl mx-auto">
            Answer 3 quick questions and our clinical team will reach out with a personalized recommendation — entirely bespoke and confidential.
          </p>

          <LeadIntakeForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] bg-[#F8F9FA] py-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-[#102A52] flex items-center justify-center text-white font-serif font-bold text-xl">
                {tenant.logoInitial}
              </div>
              <span className="font-serif text-xl tracking-wide text-[#102A52]">{tenant.name}</span>
            </div>
            <div className="text-sm text-[#102A52]/60 flex flex-wrap gap-6">
              <span>{tenant.legal.copyright}</span>
              <Link href="/legal/privacy" className="hover:text-[#102A52] transition-colors">Privacy Policy</Link>
              <Link href="/legal/terms" className="hover:text-[#102A52] transition-colors">Terms of Service</Link>
              <Link href="/legal/hipaa-notice" className="hover:text-[#102A52] transition-colors">HIPAA Notice</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
