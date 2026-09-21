// Onboarding document requirements, organised by flow (Client / Distributor)
// and entity type. The onboarding form renders one upload slot per document in
// the selected category, so investors are only asked for what applies to them.
//
// `optional: true` documents are "if any / if applicable" and are not required
// to submit. Everything else is mandatory.

export interface OnboardingDoc {
  key: string;
  label: string;
  optional?: boolean;
}

export interface OnboardingCategory {
  key: string;
  label: string;
  /** Short helper line shown under the category tabs. */
  note?: string;
  docs: OnboardingDoc[];
  /** Extra "provide on your letterhead / as annexures" items, uploaded too. */
  annexures?: OnboardingDoc[];
}

export interface OnboardingFlowDef {
  key: 'client' | 'distributor';
  label: string;
  categories: OnboardingCategory[];
}

/* ------------------------------- Client -------------------------------- */

const CLIENT: OnboardingCategory[] = [
  {
    key: 'individual',
    label: 'Individual',
    docs: [
      { key: 'pan', label: 'PAN Card' },
      { key: 'aadhaar', label: 'Aadhaar Card' },
      { key: 'bank', label: 'Bank Proof (personalised cancelled cheque)' },
      { key: 'nominee', label: 'Nominee ID proof' },
      { key: 'signature', label: 'Signature (white background)' },
      { key: 'photo', label: 'Passport-size photograph' },
    ],
  },
  {
    key: 'corporate',
    label: 'Corporate',
    docs: [
      { key: 'company_pan', label: 'Company PAN Card' },
      { key: 'company_address', label: 'Company Address Proof' },
      { key: 'company_bank', label: 'Company Bank Proof (personalised cancelled cheque)' },
      { key: 'moa_aoa', label: 'MOA & AOA' },
      { key: 'audited', label: 'Latest two financial years’ audited statements' },
      { key: 'incorporation', label: 'Certificate of Incorporation' },
      { key: 'signatories', label: 'All authorised signatories’ PAN & Address Proof (with authorised-signatory stamp & signature)' },
      { key: 'directors', label: 'All Directors’ PAN & Address Proof (with Directors’ stamp)' },
    ],
  },
  {
    key: 'huf',
    label: 'HUF',
    docs: [
      { key: 'huf_pan', label: 'HUF PAN Card (attested by Karta with stamp)' },
      { key: 'huf_address', label: 'HUF Address Proof — latest 3-month bank statement (attested by Karta with stamp)' },
      { key: 'karta_pan', label: 'Karta PAN Card (self-attested by Karta)' },
      { key: 'karta_address', label: 'Karta Address Proof — DL/Aadhaar/Voter ID/Passport (self-attested by Karta)' },
      { key: 'huf_bank', label: 'HUF Bank Proof (personalised cancelled cheque / latest bank statement)' },
      { key: 'karta_declaration', label: 'Declaration by Karta of HUF' },
      { key: 'annexure3', label: 'Annexure 3 — details of Karta' },
      { key: 'cdsl_poa', label: 'CDSL Demat Account Form (Non-Individual), Pages 9–12 — Master Power of Attorney, all co-parceners’ signatures' },
      { key: 'acmiil_poa', label: 'ACMIIL POA — all pages, co-parceners’ signatures' },
    ],
  },
  {
    key: 'llp',
    label: 'LLP',
    docs: [
      { key: 'llp_pan', label: 'PAN Card — LLP' },
      { key: 'llp_address', label: 'Address Proof — LLP' },
      { key: 'llp_bank', label: 'Bank Proof — cancelled cheque — LLP' },
      { key: 'llp_deed', label: 'LLP Deed' },
      { key: 'llp_incorporation', label: 'Copy of Certificate of Incorporation' },
      { key: 'llp_audited', label: 'Audited Annual Accounts for latest 2 financial years' },
      { key: 'llp_signatories', label: 'PAN & Proof of Address of Authorised Signatories' },
      { key: 'llp_partners', label: 'PAN & Proof of Address of Partners' },
    ],
  },
  {
    key: 'partnership',
    label: 'Partnership Firm',
    docs: [
      { key: 'pf_pan', label: 'PAN Card — Partnership Firm (attested by authorised signatory with stamp & signature)' },
      { key: 'pf_address', label: 'Address Proof — Partnership Firm (attested by authorised signatory with stamp & signature)' },
      { key: 'pf_deed', label: 'Partnership Deed (attested by authorised signatory with stamp & signature)' },
      { key: 'pf_bank', label: 'Bank Proof (attested by authorised signatory with stamp & signature; if cheque copy)' },
      { key: 'pf_audited', label: 'Last two years’ audited statements (attested by authorised signatory with stamp & signature)' },
      { key: 'pf_partners', label: 'All Partners’ self-attested PAN & Address Proof' },
    ],
    annexures: [
      { key: 'pf_board_res', label: 'Board resolution — format attached (on company letterhead)' },
      { key: 'pf_signatory_list', label: 'List of authorised signatories (on company letterhead)' },
      { key: 'pf_shareholding', label: 'Shareholding pattern (on company letterhead)' },
      { key: 'pf_partner_list', label: 'List of Partners (on company letterhead)' },
    ],
  },
  {
    key: 'nre',
    label: 'NRE',
    note: 'For NRE accounts.',
    docs: [
      { key: 'nre_pan', label: 'Self-attested PAN Card' },
      { key: 'nre_foreign_address', label: 'Self-attested Foreign Address Proof (valid DL / latest utility bill / latest 3-month bank statements)' },
      { key: 'nre_indian_address', label: 'Self-attested Indian Address Proof (DL/Voter ID/Aadhaar, if any)' },
      { key: 'nre_passport', label: 'Valid self-attested Passport' },
      { key: 'nre_immigration', label: 'Latest Immigration Page (if visited India within 3 months)' },
      { key: 'nre_visa', label: 'Valid Visa / Work Permit (self-attested)' },
      { key: 'nre_residential', label: 'Residential Card (if any)' },
      { key: 'nre_oci', label: 'OCI/PIO card self-attested copy (if any)' },
      { key: 'nre_nominee', label: 'Self-attested Nominee ID Proof' },
      { key: 'nre_kyc_cheque', label: 'Cheque of ₹15,000 towards KYC check by the bank' },
    ],
  },
  {
    key: 'nro',
    label: 'NRO',
    note: 'For NRO accounts.',
    docs: [
      { key: 'nro_pan', label: 'Self-attested PAN Card' },
      { key: 'nro_foreign_address', label: 'Self-attested Foreign Address Proof (valid DL / latest utility bill / latest 3-month bank statements)' },
      { key: 'nro_indian_address', label: 'Self-attested Indian Address Proof (DL/Voter ID/Aadhaar, if any)' },
      { key: 'nro_passport', label: 'Valid self-attested Passport' },
      { key: 'nro_immigration', label: 'Latest Immigration Page (if visited India within 3 months)' },
      { key: 'nro_visa', label: 'Valid Visa / Work Permit (self-attested)' },
      { key: 'nro_residential', label: 'Residential Card (if any)' },
      { key: 'nro_oci', label: 'OCI/PIO card self-attested copy (if any)' },
      { key: 'nro_nominee', label: 'Self-attested Nominee ID Proof' },
      { key: 'nro_bank', label: 'Bank Proof (personalised cancelled cheque)' },
    ],
  },
];

/* ----------------------------- Distributor ----------------------------- */

const DISTRIBUTOR: OnboardingCategory[] = [
  {
    key: 'individual',
    label: 'Individual',
    docs: [
      { key: 'd_ind_pan', label: 'PAN Card' },
      { key: 'd_ind_address', label: 'Address Proof' },
      { key: 'd_ind_bank', label: 'Bank Proof' },
      { key: 'd_ind_nism', label: 'NISM-Series-XXI-A: Portfolio Management Services (PMS) Distributors Certificate' },
    ],
  },
  {
    key: 'corporate',
    label: 'Corporate',
    docs: [
      { key: 'd_corp_pan', label: 'Company PAN Card (with authorised-signatory stamp & signature)' },
      { key: 'd_corp_address', label: 'Company Address Proof (with authorised-signatory stamp & signature)' },
      { key: 'd_corp_bank', label: 'Company Bank Proof (personalised cancelled cheque)' },
      { key: 'd_corp_moa', label: 'MOA & AOA (with authorised-signatory stamp & signature)' },
      { key: 'd_corp_audited', label: 'Latest two financial years’ audited statements (with authorised-signatory stamp & signature)' },
      { key: 'd_corp_incorporation', label: 'Certificate of Incorporation (with authorised-signatory stamp & signature)' },
      { key: 'd_corp_signatories', label: 'All authorised signatories’ PAN & Address Proof (with authorised-signatory stamp & signature)' },
      { key: 'd_corp_directors', label: 'All Directors’ PAN & Address Proof with photos (with Directors’ stamp & signature)' },
      { key: 'd_corp_nism', label: 'NISM XXI-A Certificate (with authorised-signatory stamp & signature)' },
      { key: 'd_corp_gst', label: 'GST Certificate (with authorised-signatory stamp & signature)' },
    ],
    annexures: [
      { key: 'd_corp_board_res', label: 'Board resolution' },
      { key: 'd_corp_signatory_list', label: 'List of authorised signatories' },
      { key: 'd_corp_director_list', label: 'Director list' },
      { key: 'd_corp_shareholding', label: 'Shareholding pattern' },
    ],
  },
  {
    key: 'huf',
    label: 'HUF',
    docs: [
      { key: 'd_huf_pan', label: 'PAN of HUF' },
      { key: 'd_huf_coparceners', label: 'List of Co-parceners' },
      { key: 'd_huf_passbook', label: 'Bank Passbook / Bank Statement in the name of HUF' },
      { key: 'd_huf_cheque', label: 'Cancelled cheque of HUF account' },
      { key: 'd_huf_karta_pan', label: 'Karta — PAN' },
      { key: 'd_huf_karta_poi', label: 'Karta — Proof of Identification (POI)' },
      { key: 'd_huf_karta_poa', label: 'Karta — Proof of Address (POA)' },
      { key: 'd_huf_karta_photo', label: 'Karta — Photograph' },
      { key: 'd_huf_nism', label: 'NISM-Series-XXI-A: PMS Distributors Certificate (Karta)' },
    ],
  },
  {
    key: 'llp',
    label: 'LLP',
    docs: [
      { key: 'd_llp_pan', label: 'PAN of LLP' },
      { key: 'd_llp_address', label: 'Address Proof of LLP' },
      { key: 'd_llp_registration', label: 'LLP Registration Certificate' },
      { key: 'd_llp_moa', label: 'MOA & AOA' },
      { key: 'd_llp_audited', label: 'Audited statements for last two financial years (latest)' },
      { key: 'd_llp_agreement', label: 'LLP Partnership Agreement' },
      { key: 'd_llp_photos', label: 'Photograph of all partners of LLP' },
      { key: 'd_llp_cheque', label: 'Cancelled cheque of LLP' },
      { key: 'd_llp_partners', label: 'PAN & Address Proof of all partners' },
      { key: 'd_llp_gst', label: 'GST Certificate of LLP' },
      { key: 'd_llp_nism', label: 'NISM-Series-XXI-A: PMS Distributors Certificate' },
    ],
    annexures: [
      { key: 'd_llp_board_res', label: 'Resolution (wherever applicable)' },
      { key: 'd_llp_signatory_list', label: 'List of authorised signatories' },
      { key: 'd_llp_partner_list', label: 'List of partners' },
      { key: 'd_llp_shareholding', label: 'Shareholding pattern' },
    ],
  },
  {
    key: 'partnership',
    label: 'Partnership Firm',
    docs: [
      { key: 'd_pf_pan', label: 'PAN of Partnership Firm (attested by Authorised Signatory as per Authority Letter)' },
      { key: 'd_pf_address', label: 'Address Proof of Partnership Firm (attested by Authorised Signatory as per Authority Letter)' },
      { key: 'd_pf_partners', label: 'PAN & Address Proof of all Partners (with Partner’s stamp & signature)' },
      { key: 'd_pf_registration', label: 'Firm Registration Certificate (attested by Authorised Signatory as per Authority Letter)' },
      { key: 'd_pf_deed', label: 'Partnership Deed (attested by Authorised Signatory as per Authority Letter)' },
      { key: 'd_pf_photos', label: 'Photographs of all Partners' },
      { key: 'd_pf_cheque', label: 'Cancelled Cheque of Firm' },
      { key: 'd_pf_bank', label: 'Bank Statement of Firm (attested by Authorised Signatory as per Authority Letter)' },
      { key: 'd_pf_branches', label: 'List of Branches (with addresses)' },
      { key: 'd_pf_gst', label: 'GST Certificate of Firm (attested by Authorised Signatory as per Authority Letter)' },
      { key: 'd_pf_nism', label: 'NISM-Series-XXI-A: PMS Distributors Certificate' },
    ],
    annexures: [
      { key: 'd_pf_board_res', label: 'Authority letter (signed by all partners), wherever applicable' },
      { key: 'd_pf_signatory_list', label: 'List of authorised signatories' },
      { key: 'd_pf_partner_list', label: 'List of partners' },
      { key: 'd_pf_shareholding', label: 'Shareholding pattern' },
    ],
  },
];

export const ONBOARDING_FLOWS: OnboardingFlowDef[] = [
  { key: 'client', label: 'Client Account Opening', categories: CLIENT },
  { key: 'distributor', label: 'Distributor Account Opening', categories: DISTRIBUTOR },
];

/* ------------------------------ UPI (PMS) ------------------------------ */
// PMS strategy bank accounts for UPI collection. QR codes are generated on the
// page from each UPI ID.
export interface UpiAccount {
  name: string;
  upi: string;
}

export const UPI_PMS: UpiAccount[] = [
  { name: 'ACE Multicap', upi: 'ace.multicap.pms@validibl' },
  { name: 'ACE Ten Trillion', upi: 'ace.tentrillion.pms@validibl' },
  { name: 'ACE Multi-Asset', upi: 'ace.multiasset.pms@validibl' },
];
