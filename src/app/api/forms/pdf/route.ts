// src/app/api/forms/pdf/route.ts
// ─── PDF Generation Endpoint ──────────────────────────────────────────────────
// Generates a real PDF for a given form template using @react-pdf/renderer.
// Requires staff authentication.
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, STAFF_ROLES } from '@/lib/api-auth';
import React from 'react';
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 11,
        paddingTop: 60,
        paddingBottom: 60,
        paddingHorizontal: 60,
        backgroundColor: '#ffffff',
        color: '#1a1a1a',
    },
    header: {
        borderBottomWidth: 2,
        borderBottomColor: '#a10c22',
        borderBottomStyle: 'solid',
        paddingBottom: 16,
        marginBottom: 24,
    },
    clinicName: {
        fontSize: 22,
        fontFamily: 'Helvetica-Bold',
        color: '#a10c22',
        marginBottom: 4,
    },
    formTitle: {
        fontSize: 16,
        fontFamily: 'Helvetica-Bold',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 10,
        color: '#666666',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        color: '#a10c22',
        marginBottom: 8,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        borderBottomStyle: 'solid',
    },
    field: {
        marginBottom: 12,
    },
    fieldLabel: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        color: '#333333',
        marginBottom: 4,
    },
    fieldLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#cccccc',
        borderBottomStyle: 'solid',
        height: 20,
        marginBottom: 4,
    },
    signatureSection: {
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureBlock: {
        width: '45%',
    },
    signatureLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
        borderBottomStyle: 'solid',
        height: 30,
        marginBottom: 4,
    },
    signatureLabel: {
        fontSize: 9,
        color: '#666666',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 60,
        right: 60,
        fontSize: 8,
        color: '#999999',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    hipaaNote: {
        fontSize: 8,
        color: '#999999',
        marginTop: 8,
        fontStyle: 'italic',
    },
});

function FormPDF({ formTitle }: { formTitle: string }) {
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return React.createElement(
        Document,
        { title: formTitle, author: 'MedFit America' },
        React.createElement(
            Page,
            { size: 'A4', style: styles.page },

            // Header
            React.createElement(View, { style: styles.header },
                React.createElement(Text, { style: styles.clinicName }, 'MedFit America'),
                React.createElement(Text, { style: styles.formTitle }, formTitle),
                React.createElement(Text, { style: styles.subtitle }, `Generated: ${date} · HIPAA Compliant · Confidential`)
            ),

            // Patient Information
            React.createElement(View, { style: styles.section },
                React.createElement(Text, { style: styles.sectionTitle }, 'Patient Information'),
                React.createElement(View, { style: styles.field },
                    React.createElement(Text, { style: styles.fieldLabel }, 'Full Legal Name'),
                    React.createElement(View, { style: styles.fieldLine })
                ),
                React.createElement(View, { style: styles.field },
                    React.createElement(Text, { style: styles.fieldLabel }, 'Date of Birth'),
                    React.createElement(View, { style: styles.fieldLine })
                ),
                React.createElement(View, { style: styles.field },
                    React.createElement(Text, { style: styles.fieldLabel }, 'Email Address'),
                    React.createElement(View, { style: styles.fieldLine })
                ),
                React.createElement(View, { style: styles.field },
                    React.createElement(Text, { style: styles.fieldLabel }, 'Phone Number'),
                    React.createElement(View, { style: styles.fieldLine })
                ),
            ),

            // Medical History
            React.createElement(View, { style: styles.section },
                React.createElement(Text, { style: styles.sectionTitle }, 'Medical History & Current Medications'),
                React.createElement(View, { style: styles.field },
                    React.createElement(Text, { style: styles.fieldLabel }, 'Current Medications (list all)'),
                    React.createElement(View, { style: styles.fieldLine }),
                    React.createElement(View, { style: styles.fieldLine }),
                    React.createElement(View, { style: styles.fieldLine })
                ),
                React.createElement(View, { style: styles.field },
                    React.createElement(Text, { style: styles.fieldLabel }, 'Known Allergies'),
                    React.createElement(View, { style: styles.fieldLine })
                ),
                React.createElement(View, { style: styles.field },
                    React.createElement(Text, { style: styles.fieldLabel }, 'Previous Surgeries or Hospitalizations'),
                    React.createElement(View, { style: styles.fieldLine }),
                    React.createElement(View, { style: styles.fieldLine })
                ),
            ),

            // Consent
            React.createElement(View, { style: styles.section },
                React.createElement(Text, { style: styles.sectionTitle }, 'Informed Consent & Agreement'),
                React.createElement(Text, { style: { fontSize: 10, lineHeight: 1.6, color: '#333333' } },
                    'By signing below, I confirm that I have read and understood this form, that the information provided is accurate and complete to the best of my knowledge, and that I consent to the treatment and communication described herein.'
                ),
                React.createElement(Text, { style: styles.hipaaNote },
                    'This document is protected under HIPAA. Your information will only be shared with authorized healthcare providers involved in your care.'
                )
            ),

            // Signature
            React.createElement(View, { style: styles.signatureSection },
                React.createElement(View, { style: styles.signatureBlock },
                    React.createElement(View, { style: styles.signatureLine }),
                    React.createElement(Text, { style: styles.signatureLabel }, 'Patient Signature')
                ),
                React.createElement(View, { style: styles.signatureBlock },
                    React.createElement(View, { style: styles.signatureLine }),
                    React.createElement(Text, { style: styles.signatureLabel }, 'Date')
                )
            ),

            // Footer
            React.createElement(View, { style: styles.footer },
                React.createElement(Text, null, 'MedFit America — Confidential Medical Record'),
                React.createElement(Text, null, `Form: ${formTitle}`)
            )
        )
    );
}

export async function POST(req: NextRequest) {
    const { error: authError } = await requireAuth(req, [...STAFF_ROLES]);
    if (authError) return authError;

    try {
        const body = await req.json();
        const { formTitle } = body;

        if (!formTitle) {
            return NextResponse.json({ error: 'formTitle is required.' }, { status: 400 });
        }

        const pdfBuffer = await renderToBuffer(React.createElement(FormPDF, { formTitle }));

        const filename = `MedFit_${formTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': pdfBuffer.byteLength.toString(),
            },
        });
    } catch (err: any) {
        console.error('[PDF] Generation error:', err);
        return NextResponse.json({ error: 'Failed to generate PDF.' }, { status: 500 });
    }
}
