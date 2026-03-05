/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  TENANT CONFIGURATION — White-Label Theme & Branding               ║
 * ║                                                                    ║
 * ║  This is the SINGLE SOURCE OF TRUTH for all tenant-specific        ║
 * ║  branding, colors, legal entity names, and clinic details.         ║
 * ║                                                                    ║
 * ║  To deploy this app for a new clinic:                              ║
 * ║  1. Duplicate this file                                            ║
 * ║  2. Change the values below                                        ║
 * ║  3. Rebuild → the entire app re-brands automatically               ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

export const tenant = {

    // ─── Brand Identity ──────────────────────────────────────────────────────
    name: "MedFit America",
    shortName: "MedFit",
    legalEntity: "MedFit America LLC",
    tagline: "Excellence in Medical Longevity.",
    logoInitial: "M", // Single letter shown in compact logo mark
    academyName: "MedFit Academy",

    // ─── Contact & Location ──────────────────────────────────────────────────
    address: {
        street: "2359 Windy Hill Rd STE 210",
        city: "Marietta",
        state: "GA",
        zip: "30067",
        full: "2359 Windy Hill Rd STE 210, Marietta, GA 30067",
    },
    phone: "404-980-9800",
    email: "info@medfitamerica.com",
    website: "medfitamerica.com",

    // ─── Clinical Staff (for consent forms) ──────────────────────────────────
    clinician: {
        name: "Justin Kitchens",
        title: "F.N.P.",
        fullTitle: "Justin Kitchens F.N.P.",
    },
    labPartner: {
        name: "N.F.C",
        contact: "Mr. David Oblas",
    },

    // ─── Color Palette ───────────────────────────────────────────────────────
    // Change these to re-brand the entire app for a new clinic.
    colors: {
        // Primary brand color (Midnight Navy)
        primary: "#0A2342",
        primaryHover: "#081D36",
        primaryLight: "rgba(10, 35, 66, 0.1)",
        primaryGlow: "rgba(10, 35, 66, 0.3)",

        // Secondary accent (Ruby Red)
        accent: "#8B0000",
        accentHover: "#6B0000",

        // Alert/warning
        warning: "#a10c22",

        // Backgrounds
        pageBg: "#F8F9FA",            // light cream
        adminBg: "#0C1420",           // dark navy command center
        adminCard: "#111A27",
        adminBorder: "rgba(255,255,255,0.05)",

        // Text
        textDark: "#111827",
        textMuted: "#6B7280",
        textLight: "rgba(255,255,255,0.7)",
        textLighter: "rgba(255,255,255,0.4)",

        // Form surfaces
        formBg: "#FFFFFF",
        formBorder: "#E5E7EB",
        formInputBg: "#FFFFFF",
    },

    // ─── Payment Configuration ───────────────────────────────────────────────
    payment: {
        statementDescriptor: "MEDFIT WELLNESS", // Max 22 chars, appears on bank statement
        defaultDescription: "Medical Services",
        fallbackName: "Protocol Payment",
    },

    // ─── Legal & Compliance ──────────────────────────────────────────────────
    legal: {
        privacyOfficer: "Privacy Official",
        hipaaRetentionYears: 6,
        copyrightYear: new Date().getFullYear(),
        copyright: `© ${new Date().getFullYear()} MedFit America. All rights reserved.`,
        eSignDisclaimer: "This document constitutes a legally binding electronic signature in accordance with the U.S. Electronic Signatures in Global and National Commerce Act (E-SIGN) and UETA.",
    },

    // ─── SEO Defaults ────────────────────────────────────────────────────────
    seo: {
        titleSuffix: "| MedFit America",
        defaultTitle: "MedFit | Atlanta Medical Weight Loss & Longevity Clinic",
        defaultDescription: "Atlanta's premier medical wellness clinic offering TRT, Peptide Therapy, Semaglutide weight loss, and NFC lab panels.",
    },

    // ─── Feature Flags ───────────────────────────────────────────────────────
    features: {
        telehealth: false,
        academy: true,
        patientPortal: true,
        billing: true,
        eSign: true,
    },

} as const;

// ─── Type Export ──────────────────────────────────────────────────────────────
export type TenantConfig = typeof tenant;

/**
 * Resolve tenant config dynamically.
 * For the MVP, returns the default static config.
 * In production, this will merge overrides from the tenants.config JSONB column.
 */
export function getTenantConfig(tenantConfig?: Record<string, unknown>): TenantConfig {
    if (!tenantConfig || Object.keys(tenantConfig).length === 0) {
        return tenant;
    }

    // Shallow merge: tenant DB config overrides static defaults
    return {
        ...tenant,
        name: (tenantConfig.name as string) || tenant.name,
        legalEntity: (tenantConfig.legalEntity as string) || tenant.legalEntity,
        phone: (tenantConfig.phone as string) || tenant.phone,
        email: (tenantConfig.email as string) || tenant.email,
    } as TenantConfig;
}
