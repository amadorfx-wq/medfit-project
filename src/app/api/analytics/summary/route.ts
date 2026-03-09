// src/app/api/analytics/summary/route.ts
// ─── Analytics Summary Endpoint ───────────────────────────────────────────────
// Returns real financial metrics from Supabase. Requires ADMIN or SUPERADMIN.
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/api-auth';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(req: NextRequest) {
    const { user, error: authError } = await requireAuth(req, ['SUPERADMIN', 'ADMIN', 'DOCTOR', 'RECEPTION']);
    if (authError) return authError;

    const tenantId = user!.tenantId;

    try {
        // ── 1. Current month MRR ──────────────────────────────────────────────
        let mrrQuery = supabaseAdmin
            .from('charges')
            .select('amount')
            .eq('status', 'PAID')
            .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

        if (tenantId) mrrQuery = mrrQuery.eq('tenant_id', tenantId);

        const { data: mrrData } = await mrrQuery;
        const mrr = mrrData?.reduce((sum, r) => sum + (r.amount || 0), 0) ?? 0;

        // ── 2. Total active patients ──────────────────────────────────────────
        let countQuery = supabaseAdmin.from('patients').select('id', { count: 'exact', head: true });
        if (tenantId) countQuery = countQuery.eq('tenant_id', tenantId);
        const { count: totalPatients } = await countQuery;

        // ── 3. Monthly revenue trend (last 12 months) ─────────────────────────
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        let trendQuery = supabaseAdmin
            .from('charges')
            .select('amount, date, patient_id')
            .eq('status', 'PAID')
            .gte('date', twelveMonthsAgo.toISOString())
            .order('date', { ascending: true });

        if (tenantId) trendQuery = trendQuery.eq('tenant_id', tenantId);

        const { data: trendRaw } = await trendQuery;

        // Aggregate by month client-side (avoids complex RPC)
        const monthMap: Record<string, { revenue: number; patientSet: Set<string> }> = {};
        const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        for (const row of trendRaw || []) {
            const d = new Date(row.date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = monthLabels[d.getMonth()];
            if (!monthMap[key]) monthMap[key] = { revenue: 0, patientSet: new Set() };
            monthMap[key].revenue += row.amount || 0;
            if (row.patient_id) monthMap[key].patientSet.add(row.patient_id);
        }

        const revenueData = Object.entries(monthMap)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, val]) => ({
                month: monthLabels[parseInt(key.split('-')[1]) - 1],
                revenue: Math.round(val.revenue),
                patients: val.patientSet.size,
            }));

        // ── 4. Treatment distribution ─────────────────────────────────────────
        let treatQuery = supabaseAdmin
            .from('patients')
            .select('active_treatment');
        if (tenantId) treatQuery = treatQuery.eq('tenant_id', tenantId);

        const { data: treatRaw } = await treatQuery;

        const treatMap: Record<string, number> = {};
        for (const row of treatRaw || []) {
            const t = row.active_treatment || 'Pending Evaluation';
            treatMap[t] = (treatMap[t] || 0) + 1;
        }

        const treatmentData = Object.entries(treatMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6); // Top 6 treatments

        return NextResponse.json({
            mrr: Math.round(mrr),
            arr: Math.round(mrr * 12),
            totalPatients: totalPatients ?? 0,
            revenueData,
            treatmentData,
        });
    } catch (err: any) {
        console.error('[Analytics] Error:', err);
        return NextResponse.json({ error: 'Failed to fetch analytics.' }, { status: 500 });
    }
}
