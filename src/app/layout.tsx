import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
// store.tsx ha sido erradicado
import { AuthProvider } from "@/hooks/useAuth";
import { BillingProvider } from "@/hooks/useBilling";
import { StaffProvider } from "@/hooks/useStaff";
import { CartProvider } from "@/hooks/useCart";
import { Toaster } from "@/components/ui/sonner";
import { GlobalCart } from "@/components/GlobalCart";
import { ThemeProvider } from "@/components/ThemeProvider";

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

export const metadata: Metadata = {
  title: "Medfit | Atlanta Medical Weight Loss & Longevity Clinic",
  description: "Reclaim your vitality with Atlanta's premier medical weight loss and longevity clinic. Board-certified physicians offering Semaglutide, Tirzepatide, TRT, and Peptides.",
  openGraph: {
    title: "Medfit | Atlanta Medical Weight Loss & Longevity",
    description: "Reclaim your vitality with Atlanta's premier medical weight loss and longevity clinic.",
    type: "website",
    locale: "en_US",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalClinic",
  "name": "Medfit",
  "image": "https://medfitamerica.com/logo.png",
  "@id": "https://medfitamerica.com",
  "url": "https://medfitamerica.com",
  "telephone": process.env.NEXT_PUBLIC_CLINIC_PHONE || "+1-404-555-0100",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": process.env.NEXT_PUBLIC_CLINIC_ADDRESS || "123 Peachtree St NE",
    "addressLocality": "Atlanta",
    "addressRegion": "GA",
    "postalCode": "30303",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 33.7490,
    "longitude": -84.3880
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday"
    ],
    "opens": "09:00",
    "closes": "18:00"
  }
};

import { cookies } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();

  // [SSR OPTIMIZATION] Predict user state to prevent hydration blinks on guarded layouts
  let initialUser = null;
  const hasSupabaseCookie = cookieStore.getAll().some((c: any) => c.name.includes('-auth-token'));
  if (hasSupabaseCookie) {
    initialUser = { id: "ssr-shell", role: "ADMIN", name: "Loading..." };
  }

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
              <StaffProvider>
                <CartProvider>
                  <BillingProvider>
                    {children}
                    <GlobalCart />
                    <Toaster position="top-center" />
                  </BillingProvider>
                </CartProvider>
              </StaffProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
