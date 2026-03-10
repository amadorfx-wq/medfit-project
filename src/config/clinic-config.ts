/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  CLINIC CONFIGURATION — White-Label Identity Layer               ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Single source of truth for all clinic branding and identity data.
 * To deploy this product for a new clinic: change environment variables.
 * Zero code changes required.
 *
 * Required env vars (set in Vercel + .env.local):
 *   NEXT_PUBLIC_CLINIC_NAME
 *   NEXT_PUBLIC_CLINIC_TAGLINE
 *   NEXT_PUBLIC_CLINIC_PHONE
 *   NEXT_PUBLIC_CLINIC_ADDRESS
 *   NEXT_PUBLIC_CLINIC_CITY
 *   NEXT_PUBLIC_CLINIC_STATE
 *   NEXT_PUBLIC_CLINIC_ZIP
 *   NEXT_PUBLIC_CLINIC_COUNTRY      (default: US)
 *   NEXT_PUBLIC_CLINIC_LAT
 *   NEXT_PUBLIC_CLINIC_LNG
 *   NEXT_PUBLIC_CLINIC_OPEN_DAYS    (comma-separated, default: Mon–Fri)
 *   NEXT_PUBLIC_CLINIC_OPENS_AT     (default: 09:00)
 *   NEXT_PUBLIC_CLINIC_CLOSES_AT    (default: 18:00)
 *   NEXT_PUBLIC_CLINIC_LOGO_URL
 *   NEXT_PUBLIC_URL                 (canonical site URL)
 */

export interface ClinicBrandingConfig {
  name: string;
  tagline: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  lat: number;
  lng: number;
  openDays: string[];
  opensAt: string;
  closesAt: string;
  logoUrl: string;
  siteUrl: string;
}

export function getClinicConfig(): ClinicBrandingConfig {
  return {
    name:     process.env.NEXT_PUBLIC_CLINIC_NAME     ?? 'Medical Clinic',
    tagline:  process.env.NEXT_PUBLIC_CLINIC_TAGLINE  ?? 'Your Health, Our Priority',
    phone:    process.env.NEXT_PUBLIC_CLINIC_PHONE    ?? '',
    address:  process.env.NEXT_PUBLIC_CLINIC_ADDRESS  ?? '',
    city:     process.env.NEXT_PUBLIC_CLINIC_CITY     ?? '',
    state:    process.env.NEXT_PUBLIC_CLINIC_STATE    ?? '',
    zip:      process.env.NEXT_PUBLIC_CLINIC_ZIP      ?? '',
    country:  process.env.NEXT_PUBLIC_CLINIC_COUNTRY  ?? 'US',
    lat:      parseFloat(process.env.NEXT_PUBLIC_CLINIC_LAT  ?? '0'),
    lng:      parseFloat(process.env.NEXT_PUBLIC_CLINIC_LNG  ?? '0'),
    openDays: (process.env.NEXT_PUBLIC_CLINIC_OPEN_DAYS ?? 'Monday,Tuesday,Wednesday,Thursday,Friday').split(','),
    opensAt:  process.env.NEXT_PUBLIC_CLINIC_OPENS_AT  ?? '09:00',
    closesAt: process.env.NEXT_PUBLIC_CLINIC_CLOSES_AT ?? '18:00',
    logoUrl:  process.env.NEXT_PUBLIC_CLINIC_LOGO_URL  ?? '',
    siteUrl:  process.env.NEXT_PUBLIC_URL              ?? '',
  };
}
