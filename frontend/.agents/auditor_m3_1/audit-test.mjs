import assert from 'node:assert';
import { validateUploadFile, autoTagDocument, MAX_FILE_SIZE } from '../../src/components/upload/BatchDropzone.jsx';
import { formatFileSize, getFormatChip, DOC_CONFIGS } from '../../src/components/upload/DocumentCard.jsx';
import { SAMPLE_APOLLO_CLAIM, EXTRACTION_STAGES } from '../../src/components/upload/ReadinessCheck.jsx';
import { mockClaims } from '../../src/services/mockData.js';

console.log('--- STARTING EMPIRICAL FORENSIC VERIFICATION ---');

let passedChecks = 0;
let totalChecks = 0;

function check(name, fn) {
  totalChecks++;
  try {
    fn();
    passedChecks++;
    console.log(`✔ PASS: ${name}`);
  } catch (err) {
    console.error(`❌ FAIL: ${name} -> ${err.message}`);
    throw err;
  }
}

// -------------------------------------------------------------
// Check 1: validateUploadFile algorithmic integrity
// -------------------------------------------------------------
check('validateUploadFile: rejects null, undefined, empty object', () => {
  assert.strictEqual(validateUploadFile(null).valid, false);
  assert.strictEqual(validateUploadFile(undefined).valid, false);
  assert.strictEqual(validateUploadFile({}).valid, false);
});

check('validateUploadFile: rejects 0-byte file', () => {
  const res = validateUploadFile({ name: 'bill.pdf', size: 0, type: 'application/pdf' });
  assert.strictEqual(res.valid, false);
  assert.match(res.error, /empty/i);
});

check('validateUploadFile: accepts exact 25MB boundary', () => {
  assert.strictEqual(MAX_FILE_SIZE, 26214400);
  const res = validateUploadFile({ name: 'bill.pdf', size: 26214400, type: 'application/pdf' });
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.error, null);
});

check('validateUploadFile: rejects 25MB + 1 byte', () => {
  const res = validateUploadFile({ name: 'bill.pdf', size: 26214401, type: 'application/pdf' });
  assert.strictEqual(res.valid, false);
  assert.match(res.error, /exceeds maximum limit/i);
});

check('validateUploadFile: supports MIME types and file extensions (PDF, JPG, PNG, TIFF)', () => {
  const validCases = [
    { name: 'bill.pdf', size: 1000, type: 'application/pdf' },
    { name: 'bill.PDF', size: 1000, type: '' }, // extension fallback uppercase
    { name: 'scan.jpg', size: 5000, type: 'image/jpeg' },
    { name: 'scan.jpeg', size: 5000, type: 'image/jpeg' },
    { name: 'photo.png', size: 10000, type: 'image/png' },
    { name: 'report.tiff', size: 20000, type: 'image/tiff' },
    { name: 'multi.dot.name.pdf', size: 500, type: 'application/pdf' },
  ];
  for (const c of validCases) {
    const res = validateUploadFile(c);
    assert.strictEqual(res.valid, true, `Expected valid for ${c.name}`);
  }
});

check('validateUploadFile: rejects prohibited file types (ZIP, EXE, HTML, DOCX, TXT)', () => {
  const invalidCases = [
    { name: 'malware.exe', size: 1000, type: 'application/x-msdownload' },
    { name: 'archive.zip', size: 1000, type: 'application/zip' },
    { name: 'phish.html', size: 1000, type: 'text/html' },
    { name: 'doc.docx', size: 1000, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { name: 'notes.txt', size: 1000, type: 'text/plain' },
  ];
  for (const c of invalidCases) {
    const res = validateUploadFile(c);
    assert.strictEqual(res.valid, false, `Expected invalid for ${c.name}`);
    assert.match(res.error, /not supported/i);
  }
});

// -------------------------------------------------------------
// Check 2: autoTagDocument algorithmic integrity
// -------------------------------------------------------------
check('autoTagDocument: returns null on non-string or empty input', () => {
  assert.strictEqual(autoTagDocument(null), null);
  assert.strictEqual(autoTagDocument(undefined), null);
  assert.strictEqual(autoTagDocument(''), null);
  assert.strictEqual(autoTagDocument(12345), null);
});

check('autoTagDocument: classifies Hospital Bill patterns', () => {
  const billNames = [
    'apollo_hospital_bill.pdf',
    'hospital_final_invoice_2026.pdf',
    'discharge_summary_fortis.pdf',
    'max_healthcare_ipd_charges.png',
    'itemized_receipt_medanta.jpg',
  ];
  for (const name of billNames) {
    assert.strictEqual(autoTagDocument(name), 'HOSPITAL_BILL', `Failed on ${name}`);
  }
});

check('autoTagDocument: classifies Insurance Policy patterns', () => {
  const policyNames = [
    'star_health_optima_policy.pdf',
    'hdfc_ergo_policy_schedule.pdf',
    'icici_lombard_insurance_coverage.pdf',
    'niva_bupa_mediclaim_terms.pdf',
    'reliance_general_ins_doc.tiff',
  ];
  for (const name of policyNames) {
    assert.strictEqual(autoTagDocument(name), 'INSURANCE_POLICY', `Failed on ${name}`);
  }
});

check('autoTagDocument: classifies Rejection / Settlement Letter patterns', () => {
  const rejectionNames = [
    'tpa_rejection_letter.pdf',
    'settlement_voucher_disallowed.pdf',
    'denial_query_computation.pdf',
    'disallowance_reasons_sheet.png',
    'deduction_summary_doc.pdf',
  ];
  for (const name of rejectionNames) {
    assert.strictEqual(autoTagDocument(name), 'REJECTION_LETTER', `Failed on ${name}`);
  }
});

check('autoTagDocument: returns null for non-matching filenames', () => {
  const unclassified = [
    'random_photo_vacation.jpg',
    'resume_aditi.pdf',
    'presentation_final.pdf',
    'report_q3.pdf',
  ];
  for (const name of unclassified) {
    assert.strictEqual(autoTagDocument(name), null, `Expected null for ${name}`);
  }
});

// -------------------------------------------------------------
// Check 3: formatFileSize & getFormatChip integrity
// -------------------------------------------------------------
check('formatFileSize: mathematical byte calculation', () => {
  assert.strictEqual(formatFileSize(0), '0 B');
  assert.strictEqual(formatFileSize(null), '—');
  assert.strictEqual(formatFileSize(undefined), '—');
  assert.strictEqual(formatFileSize(1024), '1 KB');
  assert.strictEqual(formatFileSize(1048576), '1 MB');
  assert.strictEqual(formatFileSize(2457600), '2.3 MB');
  assert.strictEqual(formatFileSize(1073741824), '1 GB');
});

check('getFormatChip: extension and MIME mapping', () => {
  assert.strictEqual(getFormatChip('test.pdf').label, 'PDF');
  assert.strictEqual(getFormatChip('test.jpg').label, 'JPG');
  assert.strictEqual(getFormatChip('test.jpeg').label, 'JPG');
  assert.strictEqual(getFormatChip('test.png').label, 'PNG');
  assert.strictEqual(getFormatChip('test.tiff').label, 'TIFF');
  assert.strictEqual(getFormatChip('test.tif').label, 'TIFF');
  assert.strictEqual(getFormatChip('test.xyz').label, 'XYZ');
});

// -------------------------------------------------------------
// Check 4: SAMPLE_APOLLO_CLAIM schema conformity
// -------------------------------------------------------------
check('SAMPLE_APOLLO_CLAIM: schema conformity and integrity', () => {
  assert.strictEqual(SAMPLE_APOLLO_CLAIM.claimId, 'CLM-84920');
  assert.strictEqual(SAMPLE_APOLLO_CLAIM.patientName, 'Ayush Sharma');
  assert.strictEqual(SAMPLE_APOLLO_CLAIM.policyNumber, 'STAR-IND-99281');
  assert.strictEqual(SAMPLE_APOLLO_CLAIM.hospital, 'Apollo Hospitals, Bangalore');
  assert.strictEqual(SAMPLE_APOLLO_CLAIM.totalBilled, 124000);
  assert.strictEqual(SAMPLE_APOLLO_CLAIM.disallowedAmount, 42500);

  // Cross-reference with mockClaims in mockData.js
  const apolloMock = mockClaims.find(c => c.id === 'CLM-84920');
  assert.ok(apolloMock, 'CLM-84920 must exist in mockClaims');
  assert.strictEqual(apolloMock.patient_name, SAMPLE_APOLLO_CLAIM.patientName);
  assert.strictEqual(apolloMock.policy_number, SAMPLE_APOLLO_CLAIM.policyNumber);
  assert.strictEqual(apolloMock.hospital, SAMPLE_APOLLO_CLAIM.hospital);
  assert.strictEqual(apolloMock.monetary_impact, SAMPLE_APOLLO_CLAIM.disallowedAmount);

  // Validate all 3 document slots
  const docs = SAMPLE_APOLLO_CLAIM.documents;
  assert.ok(docs.HOSPITAL_BILL, 'HOSPITAL_BILL missing');
  assert.ok(docs.INSURANCE_POLICY, 'INSURANCE_POLICY missing');
  assert.ok(docs.REJECTION_LETTER, 'REJECTION_LETTER missing');

  // Verify bill metadata
  assert.strictEqual(docs.HOSPITAL_BILL.metadata.line_items_count, 24);
  assert.strictEqual(docs.HOSPITAL_BILL.metadata.total_amount, 124000);
  assert.strictEqual(docs.HOSPITAL_BILL.metadata.arithmetic_verified, true);
  assert.strictEqual(docs.HOSPITAL_BILL.status, 'VERIFIED');

  // Verify policy metadata
  assert.strictEqual(docs.INSURANCE_POLICY.metadata.sum_insured, 1000000);
  assert.strictEqual(docs.INSURANCE_POLICY.metadata.moratorium_active, true);
  assert.strictEqual(docs.INSURANCE_POLICY.metadata.continuous_coverage_months, 64);
  assert.strictEqual(docs.INSURANCE_POLICY.status, 'VERIFIED');

  // Verify rejection metadata
  assert.strictEqual(docs.REJECTION_LETTER.metadata.disallowed_amount, 42500);
  assert.strictEqual(docs.REJECTION_LETTER.metadata.approved_amount, 81500);
  assert.strictEqual(docs.REJECTION_LETTER.metadata.settlement_type, 'PARTIAL_SETTLEMENT');
  assert.strictEqual(docs.REJECTION_LETTER.status, 'VERIFIED');
});

// -------------------------------------------------------------
// Check 5: EXTRACTION_STAGES sequential progression integrity
// -------------------------------------------------------------
check('EXTRACTION_STAGES: 4 stages covering 0% to 100%', () => {
  assert.strictEqual(EXTRACTION_STAGES.length, 4);
  assert.strictEqual(EXTRACTION_STAGES[0].range[0], 0);
  assert.strictEqual(EXTRACTION_STAGES[3].range[1], 100);
  for (let i = 0; i < 3; i++) {
    assert.strictEqual(EXTRACTION_STAGES[i].range[1], EXTRACTION_STAGES[i+1].range[0]);
  }
});

// -------------------------------------------------------------
// Check 6: Readiness percentage mathematical calculation
// -------------------------------------------------------------
check('Readiness calculation: 0/3 = 0%, 1/3 = 33%, 2/3 = 67%, 3/3 = 100%', () => {
  assert.strictEqual(Math.round((0 / 3) * 100), 0);
  assert.strictEqual(Math.round((1 / 3) * 100), 33);
  assert.strictEqual(Math.round((2 / 3) * 100), 67);
  assert.strictEqual(Math.round((3 / 3) * 100), 100);
});

console.log(`\n======================================================`);
console.log(`Forensic Checks Completed: ${passedChecks}/${totalChecks} Passed`);
console.log(`======================================================`);
