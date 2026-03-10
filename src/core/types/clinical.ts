/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  CLINICAL TYPES — HIPAA PHI Data Contracts                       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Lives in src/core/ — no branding, importable in any clinic instance.
 * Strict typing for all Protected Health Information (PHI) fields.
 *
 * DO NOT use Record<string, any> for form_data or formData.
 * Every field that touches patient health data must be typed here.
 */

/**
 * Typed container for HIPAA-regulated consent form data.
 *
 * text_fields:      free-text patient answers (e.g. "medication history")
 * checkbox_fields:  binary consent items (e.g. "consents to treatment: true")
 * selected_options: multi-select answers (e.g. "prior conditions: ['diabetes']")
 * signed_name:      legal full name as typed by patient at signature
 * signed_at:        ISO 8601 timestamp of the signature event
 * form_version:     semver string for audit trail and retroactive review
 */
export interface ConsentFormData {
  text_fields?:      Record<string, string>;
  checkbox_fields?:  Record<string, boolean>;
  selected_options?: Record<string, string[]>;
  signed_name?:      string;
  signed_at?:        string;
  form_version?:     string;
}

/**
 * Data Transfer Object for inserting a consent form record into the DB.
 * Matches the `consent_forms` table schema exactly.
 */
export interface ConsentFormInsertDTO {
  patient_id:      string;
  form_slug:       string;
  form_data:       ConsentFormData;
  signature_name:  string;
  signature_image: string;
  signed_at:       string;
  tenant_id?:      string;
}

/**
 * Domain model for reading a consent form record from the DB.
 */
export interface ConsentFormRecord {
  id?:             string;
  patientId:       string;
  formSlug:        string;
  formData:        ConsentFormData;
  signatureName:   string;
  signatureImage:  string;
  signedAt:        string;
  tenantId?:       string;
}
