import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
// store.tsx ha sido erradicado
import { AuthProvider } from "@/hooks/useAuth";
import { BillingProvider } from "@/hooks/useBilling";
import { StaffProvider } from "@/hooks/useStaff";
import { CartProvider } from "@/hooks/useCart";
import { PatientsProvider } from "@/hooks/usePatients";
import { Toaster } from "@/components/ui/sonner";
import { GlobalCart } from "@/components/GlobalCart";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getClinicConfig } from "@/config/clinic-config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

// ── Clinic identity from environment — zero hardcoded branding ──────────────
const clinic = getClinicConfig();

export const metadata: Metadata = {
  title: `${clinic.name} | Medical Weight Loss & Longevity Clinic`,
  description: clinic.tagline,
  openGraph: {
    title: `${clinic.name} | Medical Weight Loss & Longevity`,
    description: clinic.tagline,
    type: "website",
    locale: "en_US",
  },
};

// ── Schema.org structured data — all values from env vars ───────────────────
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalClinic",
  "name": clinic.name,
  "image": clinic.logoUrl,
  "@id": clinic.siteUrl,
  "url": clinic.siteUrl,
  "telephone": clinic.phone,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": clinic.address,
    "addressLocality": clinic.city,
    "addressRegion": clinic.state,
    "postalCode": clinic.zip,
    "addressCountry": clinic.country,
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": clinic.lat,
    "longitude": clinic.lng,
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": clinic.openDays,
    "opens": clinic.opensAt,
    "closes": clinic.closesAt,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
          <Script
            id="google-maps"
            src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
            strategy="lazyOnload"
          />
        )}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          disableTransitionOnChange
        >
          <AuthProvider>
            <PatientsProvider>
              <StaffProvider>
                <CartProvider>
                  <BillingProvider>
                    {children}
                    <GlobalCart />
                    <Toaster position="top-center" />
                  </BillingProvider>
                </CartProvider>
              </StaffProvider>
            </PatientsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
