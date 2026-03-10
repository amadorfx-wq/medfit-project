/**
 * MedicalRecordPDF — React PDF component for patient medical record export.
 * Uses @react-pdf/renderer. Rendered server-side only (api/admin/medical-record).
 *
 * Layout:
 *   - Header:    Clinic name (from tenant config), export date, "CONFIDENTIAL"
 *   - Section 1: Patient demographics
 *   - Section 2: Consent forms signed
 *   - Section 3: Billing history
 *   - Footer:    HIPAA confidentiality notice
 */
import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
} from '@react-pdf/renderer';
import { tenant } from '@/lib/theme.config';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PatientRow {
    name:             string;
    email:            string;
    phone?:           string;
    address?:         string;
    dob?:             string;
    active_treatment: string;
    approval_status:  string;
    forms_status:     string;
    created_at:       string;
}

interface FormRow {
    form_slug:      string;
    signature_name: string;
    signed_at:      string;
}

interface ChargeRow {
    date:        string;
    description: string;
    amount:      number;
    status:      string;
}

interface Props {
    patient: PatientRow;
    forms:   FormRow[];
    charges: ChargeRow[];
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    page: {
        fontFamily:    'Helvetica',
        fontSize:      10,
        color:         '#111827',
        paddingTop:    48,
        paddingBottom: 60,
        paddingLeft:   48,
        paddingRight:  48,
    },

    // Header
    header: {
        borderBottomWidth: 2,
        borderBottomColor: '#0A2342',
        paddingBottom:     10,
        marginBottom:      20,
        flexDirection:     'row',
        justifyContent:    'space-between',
        alignItems:        'flex-end',
    },
    clinicName: {
        fontSize:   16,
        fontFamily: 'Helvetica-Bold',
        color:      '#0A2342',
    },
    headerRight: {
        textAlign: 'right',
    },
    confidential: {
        fontSize:   8,
        color:      '#8B0000',
        fontFamily: 'Helvetica-Bold',
        letterSpacing: 1,
    },
    headerDate: {
        fontSize: 8,
        color:    '#6B7280',
        marginTop: 2,
    },

    // Section
    section: {
        marginBottom: 18,
    },
    sectionTitle: {
        fontSize:          11,
        fontFamily:        'Helvetica-Bold',
        color:             '#0A2342',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingBottom:     4,
        marginBottom:      8,
    },

    // Data rows
    row: {
        flexDirection: 'row',
        marginBottom:  4,
    },
    label: {
        width:      130,
        fontFamily: 'Helvetica-Bold',
        color:      '#374151',
    },
    value: {
        flex:  1,
        color: '#111827',
    },

    // Table
    tableHeader: {
        flexDirection:   'row',
        backgroundColor: '#F3F4F6',
        paddingVertical: 4,
        paddingHorizontal: 6,
        marginBottom:    2,
    },
    tableRow: {
        flexDirection:   'row',
        paddingVertical: 3,
        paddingHorizontal: 6,
        borderBottomWidth: 0.5,
        borderBottomColor: '#E5E7EB',
    },
    colDate:   { width: 80 },
    colDesc:   { flex: 1 },
    colAmount: { width: 70, textAlign: 'right' },
    colStatus: { width: 60, textAlign: 'right' },
    colSlug:   { flex: 1 },
    colSigner: { width: 120 },
    colSigned: { width: 90, textAlign: 'right' },
    tableHeaderText: {
        fontFamily: 'Helvetica-Bold',
        fontSize:   9,
        color:      '#374151',
    },
    tableCell: {
        fontSize: 9,
        color:    '#111827',
    },
    emptyNote: {
        fontSize: 9,
        color:    '#9CA3AF',
        fontStyle: 'italic',
    },

    // Footer
    footer: {
        position:          'absolute',
        bottom:            30,
        left:              48,
        right:             48,
        borderTopWidth:    0.5,
        borderTopColor:    '#D1D5DB',
        paddingTop:        6,
        flexDirection:     'row',
        justifyContent:    'space-between',
    },
    footerText: {
        fontSize: 7,
        color:    '#9CA3AF',
    },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(val?: string | null): string {
    return val && val.trim() ? val.trim() : '—';
}

function fmtDate(iso?: string | null): string {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); }
    catch { return iso; }
}

function fmtAmount(n?: number | null): string {
    if (n == null) return '—';
    return `$${Number(n).toFixed(2)}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MedicalRecordPDF({ patient, forms, charges }: Props) {
    const exportDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });

    return (
        <Document
            title={`Medical Record — ${patient.name}`}
            author={tenant.name}
            subject="Patient Medical Record"
        >
            <Page size="LETTER" style={styles.page}>

                {/* ── Header ── */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.clinicName}>{tenant.name}</Text>
                        <Text style={{ fontSize: 8, color: '#6B7280', marginTop: 2 }}>
                            {tenant.address.full}  ·  {tenant.phone}
                        </Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.confidential}>CONFIDENTIAL MEDICAL RECORD</Text>
                        <Text style={styles.headerDate}>Exported: {exportDate}</Text>
                    </View>
                </View>

                {/* ── Section 1: Patient Demographics ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Patient Information</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Full Name</Text>
                        <Text style={styles.value}>{fmt(patient.name)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.value}>{fmt(patient.email)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Phone</Text>
                        <Text style={styles.value}>{fmt(patient.phone)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Date of Birth</Text>
                        <Text style={styles.value}>{fmtDate(patient.dob)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Address</Text>
                        <Text style={styles.value}>{fmt(patient.address)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Active Treatment</Text>
                        <Text style={styles.value}>{fmt(patient.active_treatment)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Approval Status</Text>
                        <Text style={styles.value}>{fmt(patient.approval_status)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Member Since</Text>
                        <Text style={styles.value}>{fmtDate(patient.created_at)}</Text>
                    </View>
                </View>

                {/* ── Section 2: Consent Forms ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Consent & HIPAA Forms Signed</Text>
                    {forms.length === 0 ? (
                        <Text style={styles.emptyNote}>No consent forms on record.</Text>
                    ) : (
                        <>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderText, styles.colSlug]}>Form</Text>
                                <Text style={[styles.tableHeaderText, styles.colSigner]}>Signed By</Text>
                                <Text style={[styles.tableHeaderText, styles.colSigned]}>Date Signed</Text>
                            </View>
                            {forms.map((f, i) => (
                                <View key={i} style={styles.tableRow}>
                                    <Text style={[styles.tableCell, styles.colSlug]}>{fmt(f.form_slug)}</Text>
                                    <Text style={[styles.tableCell, styles.colSigner]}>{fmt(f.signature_name)}</Text>
                                    <Text style={[styles.tableCell, styles.colSigned]}>{fmtDate(f.signed_at)}</Text>
                                </View>
                            ))}
                        </>
                    )}
                </View>

                {/* ── Section 3: Billing History ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Billing History</Text>
                    {charges.length === 0 ? (
                        <Text style={styles.emptyNote}>No charges on record.</Text>
                    ) : (
                        <>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderText, styles.colDate]}>Date</Text>
                                <Text style={[styles.tableHeaderText, styles.colDesc]}>Description</Text>
                                <Text style={[styles.tableHeaderText, styles.colAmount]}>Amount</Text>
                                <Text style={[styles.tableHeaderText, styles.colStatus]}>Status</Text>
                            </View>
                            {charges.map((c, i) => (
                                <View key={i} style={styles.tableRow}>
                                    <Text style={[styles.tableCell, styles.colDate]}>{fmtDate(c.date)}</Text>
                                    <Text style={[styles.tableCell, styles.colDesc]}>{fmt(c.description)}</Text>
                                    <Text style={[styles.tableCell, styles.colAmount]}>{fmtAmount(c.amount)}</Text>
                                    <Text style={[styles.tableCell, styles.colStatus]}>{fmt(c.status)}</Text>
                                </View>
                            ))}
                        </>
                    )}
                </View>

                {/* ── Footer ── */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>
                        {tenant.legal.copyright}
                    </Text>
                    <Text style={styles.footerText}>
                        This document is protected under HIPAA. Unauthorized disclosure is prohibited.
                    </Text>
                </View>

            </Page>
        </Document>
    );
}
