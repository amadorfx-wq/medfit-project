// POST /api/admin/medical-record
// Generates a real PDF medical record for a patient using @react-pdf/renderer.
// Fetches patient data, consent forms, and charges from Supabase (service role).
import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { createClient } from '@supabase/supabase-js';
import { MedicalRecordPDF } from '@/components/pdf/MedicalRecordPDF';
import { apiResponse } from '@/core/api-response';
import { NotFoundError, ServiceError } from '@/core/errors';

export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => null);
    const patientId: string | undefined = body?.patientId;

    if (!patientId) {
        return apiResponse.error(new ServiceError('MedicalRecord', 'patientId is required'));
    }

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Fetch patient
    const { data: patient, error: patientError } = await supabaseAdmin
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

    if (patientError || !patient) {
        return apiResponse.error(new NotFoundError('Patient'));
    }

    // Fetch consent forms (non-fatal if none)
    const { data: forms } = await supabaseAdmin
        .from('consent_forms')
        .select('form_slug, signature_name, signed_at')
        .eq('patient_id', patientId)
        .order('signed_at', { ascending: true });

    // Fetch charges (non-fatal if none)
    const { data: charges } = await supabaseAdmin
        .from('charges')
        .select('date, description, amount, status')
        .eq('patient_id', patientId)
        .order('date', { ascending: false });

    try {
        const pdfBuffer = await renderToBuffer(
            React.createElement(MedicalRecordPDF, {
                patient,
                forms:   forms   ?? [],
                charges: charges ?? [],
            })
        );

        const safeName = patient.name?.replace(/[^a-zA-Z0-9_\-]/g, '_') ?? 'Patient';
        const dateStr  = new Date().toISOString().split('T')[0];
        const filename = `MedicalRecord_${safeName}_${dateStr}.pdf`;

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type':        'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length':      pdfBuffer.byteLength.toString(),
            },
        });

    } catch (err) {
        return apiResponse.error(
            new ServiceError('PDF', 'renderToBuffer failed', err)
        );
    }
}
