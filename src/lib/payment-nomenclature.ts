/**
 * MedFit — Payment Nomenclature Translator (Stripe-Safe)
 * 
 * This module translates internal medical line-item descriptions into
 * generic, processor-safe descriptions before they are sent to Stripe
 * or any other payment gateway.
 * 
 * WHY: Payment processors like Stripe flag and freeze accounts that
 * mention controlled substances (Testosterone, Semaglutide, Peptides)
 * in their transaction descriptions. This translator ensures that
 * the clinic's Stripe account remains in good standing while the
 * internal system retains full medical context.
 * 
 * LEGAL: The clinic's internal invoice (shown in-app and on PDF receipts)
 * still shows the full medical description. Only the Stripe-side
 * metadata is genericized.
 */

import { tenant } from './theme.config';

// ─── Keyword → Generic Code Mapping ──────────────────────────────────────────
const KEYWORD_MAP: [RegExp, string][] = [
    // Controlled substances / HRT
    [/testosterone|trt|androgen|cypionate|enanthate/i, "Wellness Consultation — Tier 3"],
    // GLP-1 weight loss
    [/semaglutide|tirzepatide|ozempic|wegovy|mounjaro|glp.?1/i, "Medical Program — Series A"],
    // Peptides
    [/peptide|bpc.?157|cjc.?1295|ipamorelin|thymosin|tb.?500|sermorelin|pt.?141|mots.?c|semax|selank/i, "Wellness Program — Protocol B"],
    // General hormone
    [/hormone|estrogen|progesterone|dhea|hrt|hcg/i, "Wellness Consultation — Tier 2"],
    // IV therapy
    [/iv\s?therapy|infusion|drip|nad\+?|glutathione|vitamin.?iv/i, "In-Office Service — Session"],
    // Lab work
    [/lab|blood\s?work|panel|cbc|cmp|lipid|thyroid|hormone\s?panel/i, "Diagnostic Service — Standard"],
    // Consultation
    [/consult|visit|follow.?up|evaluation|check.?up|telehealth/i, "Professional Consultation"],
    // Supplements
    [/supplement|vitamin|mineral|nutraceutical|probiotic/i, "Wellness Product — General"],
    // Shipping
    [/ship|deliver|freight|fedex|ups|usps/i, "Fulfillment & Handling"],
    // Subscription
    [/monthly|subscription|membership|recurring|protocol\s?fee/i, "Membership — Monthly"],
    // Refill
    [/refill|renewal|reorder|resupply/i, "Program Renewal"],
];

/**
 * Translates a medical line-item description into a Stripe-safe generic description.
 * 
 * @param internalDescription - The full medical description (e.g. "Semaglutide 1mg Weekly Injections")
 * @returns A generic, processor-safe description (e.g. "Medical Program — Series A")
 * 
 * @example
 * translateForProcessor("Monthly TRT Protocol Refill")
 * // => "Wellness Consultation — Tier 3"
 * 
 * translateForProcessor("Peptide BPC-157 Supply")
 * // => "Wellness Program — Protocol B"
 * 
 * translateForProcessor("Lab Panel CBC + CMP")
 * // => "Diagnostic Service — Standard"
 */
export function translateForProcessor(internalDescription: string): string {
    for (const [pattern, genericLabel] of KEYWORD_MAP) {
        if (pattern.test(internalDescription)) {
            return genericLabel;
        }
    }
    return "Medical Services";
}

/**
 * Generates a full Stripe-safe metadata payload.
 * 
 * The `description` field is what appears on the customer's credit card statement.
 * The `metadata` field is internal to Stripe and not visible to the payment processor's
 * fraud detection systems — so we can safely store the internal reference there.
 */
export function buildStripePayload(internalDescription: string, patientId?: string, chargeId?: string) {
    return {
        description: translateForProcessor(internalDescription),
        statement_descriptor: tenant.payment.statementDescriptor,
        metadata: {
            internal_ref: chargeId || "N/A",
            patient_ref: patientId || "N/A",
            // DO NOT put the raw medical description in metadata — Stripe reviews metadata too
            service_tier: translateForProcessor(internalDescription),
        },
    };
}

/**
 * Preview function for the admin UI — shows staff what Stripe will see
 * alongside what patients will see on their internal invoice.
 */
export function getPaymentPreview(internalDescription: string) {
    return {
        internalLabel: internalDescription,
        stripeLabel: translateForProcessor(internalDescription),
        statementLabel: tenant.payment.statementDescriptor,
    };
}
