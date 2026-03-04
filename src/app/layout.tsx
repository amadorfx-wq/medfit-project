import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { Toaster } from "@/components/ui/sonner";
import { GlobalCart } from "@/components/GlobalCart";

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
  "telephone": "+1-404-555-0100",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Peachtree St NE",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased`}
      >
        <Script
          id="google-maps"
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="afterInteractive"
        />
        <AppProvider>
          {children}
          <GlobalCart />
          <Toaster position="top-center" />
        </AppProvider>
      </body>
    </html>
  );
}
