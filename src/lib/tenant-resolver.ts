/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  TENANT RESOLVER — Multi-Tenant Subdomain → tenant_id Mapping      ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Resolves a hostname (e.g., "clinica-a.medfit.com") to a tenant_id.
 * Used by middleware and server components to identify the current tenant.
 */

import { createClient } from '@supabase/supabase-js';

// Cache to avoid hitting DB on every request
const tenantCache = new Map<string, { id: string; name: string; config: Record<string, unknown>; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Use a lightweight Supabase client for tenant resolution (no RLS needed for tenants table)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface TenantInfo {
    id: string;
    slug: string;
    name: string;
    config: Record<string, unknown>;
}

/**
 * Extract the subdomain slug from a hostname.
 * - "clinica-a.medfit.com" → "clinica-a"
 * - "localhost:3000" → null (use default)
 * - "medfit.com" → null (use default)
 */
export function extractSubdomain(hostname: string): string | null {
    // Remove port
    const host = hostname.split(':')[0];

    // Localhost or IP → no subdomain
    if (host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
        return null;
    }

    const parts = host.split('.');
    // Need at least 3 parts: subdomain.domain.tld
    if (parts.length >= 3) {
        const subdomain = parts[0];
        // Ignore "www" as a subdomain
        if (subdomain !== 'www') {
            return subdomain;
        }
    }

    return null;
}

/**
 * Resolve a tenant by slug. Returns cached result if available.
 */
export async function resolveTenantBySlug(slug: string): Promise<TenantInfo | null> {
    // Check cache first
    const cached = tenantCache.get(slug);
    if (cached && cached.expiresAt > Date.now()) {
        return { id: cached.id, slug, name: cached.name, config: cached.config };
    }

    // Query Supabase
    const { data, error } = await supabaseAdmin
        .from('tenants')
        .select('id, slug, name, config')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

    if (error || !data) {
        console.warn(`[MedFit] Tenant not found for slug: ${slug}`);
        return null;
    }

    // Cache it
    tenantCache.set(slug, {
        id: data.id,
        name: data.name,
        config: data.config || {},
        expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return { id: data.id, slug: data.slug, name: data.name, config: data.config || {} };
}

/**
 * Resolve the default tenant (used in localhost / dev environments).
 */
export async function resolveDefaultTenant(): Promise<TenantInfo | null> {
    // Allow env override for development
    const defaultSlug = process.env.DEFAULT_TENANT_SLUG || 'medfit-america';
    return resolveTenantBySlug(defaultSlug);
}

/**
 * Main resolver: given a hostname, resolve to a TenantInfo.
 */
export async function resolveTenant(hostname: string): Promise<TenantInfo | null> {
    const subdomain = extractSubdomain(hostname);

    if (subdomain) {
        return resolveTenantBySlug(subdomain);
    }

    // No subdomain → use default tenant
    return resolveDefaultTenant();
}
