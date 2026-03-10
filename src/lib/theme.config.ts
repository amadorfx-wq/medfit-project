/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  TENANT CONFIGURATION — White-Label Theme & Branding               ║
 * ║                                                                    ║
 * ║  SINGLE SOURCE OF TRUTH for all tenant-specific branding,          ║
 * ║  colors, legal entity names, and clinic details.                   ║
 * ║                                                                    ║
 * ║  To deploy for a new clinic: set environment variables.            ║
 * ║  Zero code changes required.                                       ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Required env vars → src/config/clinic-config.ts for full list.
 */

// ── Resolve values from environment at module load time ─────────────────────
const _name        = process.env.NEXT_PUBLIC_CLINIC_NAME          ?? 'Medical Clinic';
const _shortName   = process.env.NEXT_PUBLIC_CLINIC_SHORT_NAME    ?? _name.split(' ')[0];
const _tagline     = process.env.NEXT_PUBLIC_CLINIC_TAGLINE        ?? 'Your Health, Our Priority';
const _phone       = process.env.NEXT_PUBLIC_CLINIC_PHONE          ?? '';
const _email       = process.env.NEXT_PUBLIC_CLINIC_EMAIL          ?? '';
const _street      = process.env.NEXT_PUBLIC_CLINIC_ADDRESS        ?? '';
const _city        = process.env.NEXT_PUBLIC_CLINIC_CITY           ?? '';
const _state       = process.env.NEXT_PUBLIC_CLINIC_STATE          ?? '';
const _zip         = process.env.NEXT_PUBLIC_CLINIC_ZIP            ?? '';
const _legalEntity = process.env.NEXT_PUBLIC_CLINIC_LEGAL_ENTITY   ?? `${_name} LLC`;
const _website     = (process.env.NEXT_PUBLIC_URL ?? '')
    .replace('https://', '').replace('http://', '').split('/')[0];
const _clinicianName      = process.env.NEXT_PUBLIC_CLINICIAN_NAME       ?? '';
const _clinicianTitle     = process.env.NEXT_PUBLIC_CLINICIAN_TITLE      ?? '';
const _clinicianFull      = process.env.NEXT_PUBLIC_CLINICIAN_FULL_TITLE ?? `${_clinicianName} ${_clinicianTitle}`.trim();
const _labPartnerName     = process.env.NEXT_PUBLIC_LAB_PARTNER_NAME     ?? '';
const _labPartnerContact  = process.env.NEXT_PUBLIC_LAB_PARTNER_CONTACT  ?? '';

export const tenant = {

    // ─── Brand Identity ──────────────────────────────────────────────────────
    name:        _name,
    shortName:   _shortName,
    legalEntity: _legalEntity,
    tagline:     _tagline,
    logoInitial: _name.charAt(0).toUpperCase(),
    academyName: `${_name} Academy`,

    // ─── Contact & Location ──────────────────────────────────────────────────
    address: {
        street: _street,
        city:   _city,
        state:  _state,
        zip:    _zip,
        full:   `${_street}, ${_city}, ${_state} ${_zip}`.trim().replace(/^,\s*/, ''),
    },
    phone:   _phone,
    email:   _email,
    website: _website,

    // ─── Clinical Staff (for consent forms) ──────────────────────────────────
    clinician: {
        name:      _clinicianName,
        title:     _clinicianTitle,
        fullTitle: _clinicianFull,
    },
    labPartner: {
        name:    _labPartnerName,
        contact: _labPartnerContact,
    },

    // ─── Color Palette ───────────────────────────────────────────────────────
    // Override individual colors via env vars if needed, or replace this block.
    colors: {
        primary:      process.env.NEXT_PUBLIC_COLOR_PRIMARY       ?? '#0A2342',
        primaryHover: process.env.NEXT_PUBLIC_COLOR_PRIMARY_HOVER ?? '#081D36',
        primaryLight: process.env.NEXT_PUBLIC_COLOR_PRIMARY_LIGHT ?? 'rgba(10, 35, 66, 0.1)',
        primaryGlow:  process.env.NEXT_PUBLIC_COLOR_PRIMARY_GLOW  ?? 'rgba(10, 35, 66, 0.3)',
        accent:       process.env.NEXT_PUBLIC_COLOR_ACCENT        ?? '#8B0000',
        accentHover:  process.env.NEXT_PUBLIC_COLOR_ACCENT_HOVER  ?? '#6B0000',
        warning:                                                      '#a10c22',
        pageBg:                                                       '#F8F9FA',
        adminBg:                                                      '#0C1420',
        adminCard:                                                    '#111A27',
        adminBorder:                                                  'rgba(255,255,255,0.05)',
        textDark:                                                     '#111827',
        textMuted:                                                    '#6B7280',
        textLight:                                                    'rgba(255,255,255,0.7)',
        textLighter:                                                  'rgba(255,255,255,0.4)',
        formBg:                                                       '#FFFFFF',
        formBorder:                                                   '#E5E7EB',
        formInputBg:                                                  '#FFFFFF',
    },

    // ─── Payment Configuration ───────────────────────────────────────────────
    payment: {
        statementDescriptor: process.env.NEXT_PUBLIC_STRIPE_STATEMENT_DESCRIPTOR ?? 'MEDICAL WELLNESS',
        defaultDescription:  'Medical Services',
        fallbackName:        'Protocol Payment',
    },

    // ─── Legal & Compliance ──────────────────────────────────────────────────
    legal: {
        privacyOfficer:      'Privacy Official',
        hipaaRetentionYears: 6,
        copyrightYear:       new Date().getFullYear(),
        copyright:           `© ${new Date().getFullYear()} ${_legalEntity}. All rights reserved.`,
        eSignDisclaimer:     'This document constitutes a legally binding electronic signature in accordance with the U.S. Electronic Signatures in Global and National Commerce Act (E-SIGN) and UETA.',
    },

    // ─── SEO Defaults ────────────────────────────────────────────────────────
    seo: {
        titleSuffix:        `| ${_name}`,
        defaultTitle:       `${_name} | Medical Weight Loss & Longevity Clinic`,
        defaultDescription: _tagline,
    },

    // ─── Feature Flags ───────────────────────────────────────────────────────
    features: {
        telehealth:    process.env.NEXT_PUBLIC_FEATURE_TELEHEALTH    === 'true',
        academy:       process.env.NEXT_PUBLIC_FEATURE_ACADEMY       !== 'false',
        patientPortal: process.env.NEXT_PUBLIC_FEATURE_PATIENT_PORTAL !== 'false',
        billing:       process.env.NEXT_PUBLIC_FEATURE_BILLING       !== 'false',
        eSign:         process.env.NEXT_PUBLIC_FEATURE_ESIGN         !== 'false',
    },

};

// ─── Type Export ──────────────────────────────────────────────────────────────
export type TenantConfig = typeof tenant;

/**
 * Resolve tenant config dynamically.
 * Merges env-var defaults with overrides from the tenants.config JSONB column.
 */
export function getTenantConfig(tenantConfig?: Record<string, unknown>): TenantConfig {
    if (!tenantConfig || Object.keys(tenantConfig).length === 0) {
        return tenant;
    }

    return {
        ...tenant,
        name:        (tenantConfig.name        as string) || tenant.name,
        legalEntity: (tenantConfig.legalEntity as string) || tenant.legalEntity,
        phone:       (tenantConfig.phone       as string) || tenant.phone,
        email:       (tenantConfig.email       as string) || tenant.email,
    } as TenantConfig;
}
