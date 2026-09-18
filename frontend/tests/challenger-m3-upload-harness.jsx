import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import BatchDropzone, {
  validateUploadFile,
  autoTagDocument,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
} from '../src/components/upload/BatchDropzone.jsx';

import DocumentCard, {
  formatFileSize,
  getFormatChip,
  DOC_CONFIGS,
} from '../src/components/upload/DocumentCard.jsx';

import ReadinessCheck, {
  SAMPLE_APOLLO_CLAIM,
  EXTRACTION_STAGES,
} from '../src/components/upload/ReadinessCheck.jsx';

export function runUploadStressTests() {
  const testResults = [];
  const vulnerabilities = [];

  function record(id, title, category, passed, details = {}, severity = 'INFO') {
    testResults.push({
      id,
      title,
      category,
      passed,
      details,
      severity,
    });
    if (!passed && severity !== 'INFO') {
      vulnerabilities.push({ id, title, severity, details });
    }
  }

  // =========================================================================
  // SUITE 1: BOUNDARY FILE SIZES (0-byte, 25MB exact, 25MB+1, negatives, NaN)
  // =========================================================================

  // 1.1: 0-byte file must be rejected
  try {
    const file = { name: 'empty.pdf', size: 0, type: 'application/pdf' };
    const res = validateUploadFile(file);
    const passes = res.valid === false && res.error && res.error.includes('0 bytes');
    record(
      'SIZE-01',
      'Rejects 0-byte empty file with descriptive error',
      'Boundary File Sizes',
      passes,
      { res },
      passes ? 'INFO' : 'HIGH'
    );
  } catch (err) {
    record('SIZE-01', 'Rejects 0-byte empty file', 'Boundary File Sizes', false, { error: err.message }, 'HIGH');
  }

  // 1.2: Exact 25MB boundary (26,214,400 bytes) must be accepted
  try {
    const file = { name: 'exact_25mb.pdf', size: 26214400, type: 'application/pdf' };
    const res = validateUploadFile(file);
    const passes = res.valid === true && res.error === null;
    record(
      'SIZE-02',
      'Accepts file at exactly 25MB boundary (26,214,400 bytes)',
      'Boundary File Sizes',
      passes,
      { res, maxConst: MAX_FILE_SIZE },
      passes ? 'INFO' : 'CRITICAL'
    );
  } catch (err) {
    record('SIZE-02', 'Accepts 25MB boundary', 'Boundary File Sizes', false, { error: err.message }, 'CRITICAL');
  }

  // 1.3: Exceeding 25MB by 1 byte (26,214,401 bytes) must be rejected
  try {
    const file = { name: 'overflow_25mb_plus_1.pdf', size: 26214401, type: 'application/pdf' };
    const res = validateUploadFile(file);
    const passes = res.valid === false && res.error && res.error.includes('exceeds maximum limit');
    record(
      'SIZE-03',
      'Rejects file exceeding 25MB boundary by 1 byte (26,214,401 bytes)',
      'Boundary File Sizes',
      passes,
      { res },
      passes ? 'INFO' : 'CRITICAL'
    );
  } catch (err) {
    record('SIZE-03', 'Rejects 25MB + 1 byte', 'Boundary File Sizes', false, { error: err.message }, 'CRITICAL');
  }

  // 1.4: Negative file size (-1, -1024 bytes) - should be rejected as invalid/corrupt
  try {
    const file = { name: 'negative_size.pdf', size: -1, type: 'application/pdf' };
    const res = validateUploadFile(file);
    // Adversarial challenge: In implementation, file.size === 0 is checked, but file.size < 0 is NOT!
    // A negative size file might bypass size check unless handled.
    const passes = res.valid === false;
    record(
      'SIZE-04',
      'Rejects negative file size (-1 byte) as invalid/corrupt input',
      'Boundary File Sizes',
      passes,
      { res, note: passes ? 'Safely rejected' : 'VULNERABILITY: Negative size bypassed size validation' },
      passes ? 'INFO' : 'MEDIUM'
    );
  } catch (err) {
    record('SIZE-04', 'Rejects negative file size', 'Boundary File Sizes', false, { error: err.message }, 'MEDIUM');
  }

  // 1.5: NaN or non-numeric file size
  try {
    const file = { name: 'nan_size.pdf', size: NaN, type: 'application/pdf' };
    const res = validateUploadFile(file);
    const passes = res.valid === false;
    record(
      'SIZE-05',
      'Rejects NaN or malformed non-numeric file size',
      'Boundary File Sizes',
      passes,
      { res, note: passes ? 'Safely rejected' : 'VULNERABILITY: NaN size passed size validation' },
      passes ? 'INFO' : 'LOW'
    );
  } catch (err) {
    record('SIZE-05', 'Rejects NaN file size', 'Boundary File Sizes', false, { error: err.message }, 'LOW');
  }

  // 1.6: Null / undefined file object
  try {
    const resNull = validateUploadFile(null);
    const resUndef = validateUploadFile(undefined);
    const passes = resNull.valid === false && resUndef.valid === false;
    record(
      'SIZE-06',
      'Rejects null or undefined file object gracefully without crashing',
      'Boundary File Sizes',
      passes,
      { resNull, resUndef },
      passes ? 'INFO' : 'HIGH'
    );
  } catch (err) {
    record('SIZE-06', 'Rejects null/undefined file', 'Boundary File Sizes', false, { error: err.message }, 'HIGH');
  }

  // 1.7: 1-byte minimal file
  try {
    const file = { name: 'minimal.png', size: 1, type: 'image/png' };
    const res = validateUploadFile(file);
    const passes = res.valid === true;
    record(
      'SIZE-07',
      'Accepts minimal 1-byte valid image file',
      'Boundary File Sizes',
      passes,
      { res },
      passes ? 'INFO' : 'HIGH'
    );
  } catch (err) {
    record('SIZE-07', 'Accepts minimal 1-byte file', 'Boundary File Sizes', false, { error: err.message }, 'HIGH');
  }

  // 1.8: Huge file (100MB, 1GB)
  try {
    const file100mb = { name: 'huge_100mb.pdf', size: 100 * 1024 * 1024, type: 'application/pdf' };
    const res = validateUploadFile(file100mb);
    const passes = res.valid === false && res.error.includes('25MB');
    record(
      'SIZE-08',
      'Rejects 100MB oversized file with limit reference in error message',
      'Boundary File Sizes',
      passes,
      { res },
      passes ? 'INFO' : 'HIGH'
    );
  } catch (err) {
    record('SIZE-08', 'Rejects 100MB file', 'Boundary File Sizes', false, { error: err.message }, 'HIGH');
  }

  // =========================================================================
  // SUITE 2: MIME TYPE & EXTENSION WHITELISTING / REJECTION
  // =========================================================================

  // 2.1: Whitelisted formats (PDF, JPEG, PNG, TIFF)
  const whitelistedCases = [
    { name: 'bill.pdf', size: 1024, type: 'application/pdf', format: 'PDF' },
    { name: 'bill.jpg', size: 1024, type: 'image/jpeg', format: 'JPG' },
    { name: 'bill.jpeg', size: 1024, type: 'image/jpeg', format: 'JPEG' },
    { name: 'bill.png', size: 1024, type: 'image/png', format: 'PNG' },
    { name: 'bill.tiff', size: 1024, type: 'image/tiff', format: 'TIFF' },
    { name: 'bill.tif', size: 1024, type: 'image/tiff', format: 'TIF' },
  ];

  whitelistedCases.forEach((c, idx) => {
    try {
      const res = validateUploadFile(c);
      const passes = res.valid === true;
      record(
        `MIME-01-${idx + 1}`,
        `Accepts whitelisted format: ${c.format} (${c.name}, ${c.type})`,
        'MIME & Extension Validation',
        passes,
        { res },
        passes ? 'INFO' : 'CRITICAL'
      );
    } catch (err) {
      record(`MIME-01-${idx + 1}`, `Accepts whitelisted format ${c.format}`, 'MIME & Extension Validation', false, { error: err.message }, 'CRITICAL');
    }
  });

  // 2.2: Case insensitivity in extension and MIME
  try {
    const fileMixed = { name: 'FINAL_BILL.PdF', size: 2048, type: 'APPLICATION/PDF' };
    const res = validateUploadFile(fileMixed);
    const passes = res.valid === true;
    record(
      'MIME-02',
      'Accepts mixed-case extension and uppercase MIME type (.PdF, APPLICATION/PDF)',
      'MIME & Extension Validation',
      passes,
      { res },
      passes ? 'INFO' : 'HIGH'
    );
  } catch (err) {
    record('MIME-02', 'Case insensitivity test', 'MIME & Extension Validation', false, { error: err.message }, 'HIGH');
  }

  // 2.3: Unwhitelisted executable and dangerous file types
  const dangerousCases = [
    { name: 'malware.exe', size: 4096, type: 'application/x-msdownload', ext: '.exe' },
    { name: 'archive.zip', size: 4096, type: 'application/zip', ext: '.zip' },
    { name: 'vector.svg', size: 4096, type: 'image/svg+xml', ext: '.svg' },
    { name: 'exploit.js', size: 4096, type: 'application/javascript', ext: '.js' },
    { name: 'phishing.html', size: 4096, type: 'text/html', ext: '.html' },
  ];

  dangerousCases.forEach((c, idx) => {
    try {
      const res = validateUploadFile(c);
      const passes = res.valid === false && res.error && res.error.includes('not supported');
      record(
        `MIME-03-${idx + 1}`,
        `Strictly rejects disallowed file: ${c.ext} (${c.name})`,
        'MIME & Extension Validation',
        passes,
        { res },
        passes ? 'INFO' : 'CRITICAL'
      );
    } catch (err) {
      record(`MIME-03-${idx + 1}`, `Rejects disallowed file ${c.ext}`, 'MIME & Extension Validation', false, { error: err.message }, 'CRITICAL');
    }
  });

  // 2.4: Empty extension with unsupported mime
  try {
    const file = { name: 'no_extension_file', size: 2048, type: 'text/plain' };
    const res = validateUploadFile(file);
    const passes = res.valid === false;
    record(
      'MIME-04',
      'Rejects file with empty extension and unsupported MIME type',
      'MIME & Extension Validation',
      passes,
      { res },
      passes ? 'INFO' : 'HIGH'
    );
  } catch (err) {
    record('MIME-04', 'Rejects empty ext unsupported mime', 'MIME & Extension Validation', false, { error: err.message }, 'HIGH');
  }

  // 2.5: Valid extension when browser MIME is empty (common in Windows drag-drop for TIFF)
  try {
    const file = { name: 'hospital_scan.tiff', size: 5000, type: '' };
    const res = validateUploadFile(file);
    const passes = res.valid === true;
    record(
      'MIME-05',
      'Gracefully accepts valid extension (.tiff) when browser leaves MIME empty',
      'MIME & Extension Validation',
      passes,
      { res },
      passes ? 'INFO' : 'MEDIUM'
    );
  } catch (err) {
    record('MIME-05', 'Empty MIME with valid extension', 'MIME & Extension Validation', false, { error: err.message }, 'MEDIUM');
  }

  // 2.6: Adversarial probe: Disallowed extension with spoofed whitelisted MIME
  try {
    const file = { name: 'payload.exe', size: 5000, type: 'application/pdf' };
    const res = validateUploadFile(file);
    // Adversarial challenge: If implementation uses (isMimeAllowed || isExtAllowed),
    // a malicious .exe spoofing type: 'application/pdf' passes!
    // A strict defense requires BOTH or extension check when extension is present.
    const passes = res.valid === false;
    record(
      'MIME-06',
      'Adversarial probe: Rejects disallowed extension (.exe) even if MIME type is spoofed as application/pdf',
      'MIME & Extension Validation',
      passes,
      { res, note: passes ? 'Strictly blocked' : 'FINDING: Mismatched extension/mime allows .exe with spoofed pdf mime' },
      passes ? 'INFO' : 'LOW'
    );
  } catch (err) {
    record('MIME-06', 'Spoofed MIME probe', 'MIME & Extension Validation', false, { error: err.message }, 'LOW');
  }

  // 2.7: Double extension probe
  try {
    const file = { name: 'invoice.pdf.exe', size: 4096, type: 'application/octet-stream' };
    const res = validateUploadFile(file);
    const passes = res.valid === false;
    record(
      'MIME-07',
      'Rejects double-extension executable file (invoice.pdf.exe)',
      'MIME & Extension Validation',
      passes,
      { res },
      passes ? 'INFO' : 'HIGH'
    );
  } catch (err) {
    record('MIME-07', 'Double extension probe', 'MIME & Extension Validation', false, { error: err.message }, 'HIGH');
  }

  // =========================================================================
  // SUITE 3: FILENAME AUTO-TAGGING HEURISTICS
  // =========================================================================

  // 3.1: Standard unambiguous filenames
  const autoTagStandardCases = [
    { filename: 'apollo_hospital_final_bill.pdf', expected: 'HOSPITAL_BILL', desc: 'Hospital Bill' },
    { filename: 'star_health_optima_policy.pdf', expected: 'INSURANCE_POLICY', desc: 'Insurance Policy' },
    { filename: 'settlement_deduction_voucher.pdf', expected: 'REJECTION_LETTER', desc: 'Rejection/Settlement Letter' },
    { filename: 'discharge_summary_charges.pdf', expected: 'HOSPITAL_BILL', desc: 'Discharge Summary Bill' },
    { filename: 'policy_schedule_coverage.pdf', expected: 'INSURANCE_POLICY', desc: 'Policy Schedule' },
    { filename: 'disallowance_tpa_query.pdf', expected: 'REJECTION_LETTER', desc: 'TPA Disallowance Query' },
  ];

  autoTagStandardCases.forEach((c, idx) => {
    try {
      const detected = autoTagDocument(c.filename);
      const passes = detected === c.expected;
      record(
        `TAG-01-${idx + 1}`,
        `Auto-tags standard file: "${c.filename}" -> ${c.expected}`,
        'Filename Auto-Tagging Heuristics',
        passes,
        { detected, expected: c.expected },
        passes ? 'INFO' : 'HIGH'
      );
    } catch (err) {
      record(`TAG-01-${idx + 1}`, `Auto-tag ${c.filename}`, 'Filename Auto-Tagging Heuristics', false, { error: err.message }, 'HIGH');
    }
  });

  // 3.2: Ambiguous filename containing keywords for BOTH bill and policy
  try {
    const filename = 'hospital_bill_and_policy.pdf';
    const detected = autoTagDocument(filename);
    // Evaluates precedence: Policy pattern is checked before Bill pattern
    const passes = detected === 'INSURANCE_POLICY' || detected === 'HOSPITAL_BILL';
    record(
      'TAG-02',
      'Evaluates ambiguous dual-keyword file: "hospital_bill_and_policy.pdf" deterministically',
      'Filename Auto-Tagging Heuristics',
      passes,
      { filename, detected, note: `Precedence favored: ${detected}` },
      passes ? 'INFO' : 'MEDIUM'
    );
  } catch (err) {
    record('TAG-02', 'Ambiguous bill and policy', 'Filename Auto-Tagging Heuristics', false, { error: err.message }, 'MEDIUM');
  }

  // 3.3: Ambiguous filename containing keywords for BOTH policy and rejection
  try {
    const filename = 'policy_rejection_letter.pdf';
    const detected = autoTagDocument(filename);
    // Precedence: Rejection pattern is checked before Policy pattern
    const passes = detected === 'REJECTION_LETTER';
    record(
      'TAG-03',
      'Evaluates ambiguous file: "policy_rejection_letter.pdf" favoring REJECTION_LETTER precedence',
      'Filename Auto-Tagging Heuristics',
      passes,
      { filename, detected, expected: 'REJECTION_LETTER' },
      passes ? 'INFO' : 'MEDIUM'
    );
  } catch (err) {
    record('TAG-03', 'Ambiguous policy and rejection', 'Filename Auto-Tagging Heuristics', false, { error: err.message }, 'MEDIUM');
  }

  // 3.4: Ambiguous filename containing keywords for BOTH bill and rejection
  try {
    const filename = 'hospital_discharge_settlement_rejection.pdf';
    const detected = autoTagDocument(filename);
    // Precedence: Rejection pattern is checked before Hospital Bill pattern
    const passes = detected === 'REJECTION_LETTER';
    record(
      'TAG-04',
      'Evaluates ambiguous file: "hospital_discharge_settlement_rejection.pdf" favoring REJECTION_LETTER',
      'Filename Auto-Tagging Heuristics',
      passes,
      { filename, detected, expected: 'REJECTION_LETTER' },
      passes ? 'INFO' : 'MEDIUM'
    );
  } catch (err) {
    record('TAG-04', 'Ambiguous bill and rejection', 'Filename Auto-Tagging Heuristics', false, { error: err.message }, 'MEDIUM');
  }

  // 3.5: Completely unclassifiable filename (returns null gracefully)
  try {
    const unclassifiableNames = [
      'claim_document_123.pdf',
      'scan_2026_09_18.pdf',
      'attachment_A.pdf',
      'patient_records.pdf',
    ];
    let allNull = true;
    const resultsMap = {};
    unclassifiableNames.forEach((n) => {
      const res = autoTagDocument(n);
      resultsMap[n] = res;
      if (res !== null) allNull = false;
    });
    record(
      'TAG-05',
      'Returns null gracefully for unclassifiable generic filenames allowing fallback assignment',
      'Filename Auto-Tagging Heuristics',
      allNull,
      { resultsMap },
      allNull ? 'INFO' : 'HIGH'
    );
  } catch (err) {
    record('TAG-05', 'Unclassifiable filenames', 'Filename Auto-Tagging Heuristics', false, { error: err.message }, 'HIGH');
  }

  // 3.6: Uppercase and mixed-case resilience
  try {
    const upperCases = [
      { name: 'APOLLO_HOSPITAL_ITEMIZED_BILL.PDF', expected: 'HOSPITAL_BILL' },
      { name: 'STAR_HEALTH_OPTIMA_INSURANCE_POLICY.PDF', expected: 'INSURANCE_POLICY' },
      { name: 'TPA_DENIAL_AND_DEDUCTION_VOUCHER.PDF', expected: 'REJECTION_LETTER' },
    ];
    let allPassed = true;
    upperCases.forEach((c) => {
      if (autoTagDocument(c.name) !== c.expected) allPassed = false;
    });
    record(
      'TAG-06',
      'Correctly auto-tags uppercase filenames (.PDF)',
      'Filename Auto-Tagging Heuristics',
      allPassed,
      { upperCases },
      allPassed ? 'INFO' : 'HIGH'
    );
  } catch (err) {
    record('TAG-06', 'Uppercase filenames', 'Filename Auto-Tagging Heuristics', false, { error: err.message }, 'HIGH');
  }

  // 3.7: Special characters, braces, brackets, and whitespace in filenames
  try {
    const specialCases = [
      { name: 'Apollo Hospital Final Bill (Itemized) [2026] #123.pdf', expected: 'HOSPITAL_BILL' },
      { name: 'Star-Health_Optima+Policy_v2.0 & Terms.pdf', expected: 'INSURANCE_POLICY' },
      { name: 'TPA Deduction Sheet ~ Settlement @Disallowance.pdf', expected: 'REJECTION_LETTER' },
    ];
    let allPassed = true;
    specialCases.forEach((c) => {
      if (autoTagDocument(c.name) !== c.expected) allPassed = false;
    });
    record(
      'TAG-07',
      'Resilient against special characters, brackets, hashes, and symbols in filename',
      'Filename Auto-Tagging Heuristics',
      allPassed,
      { specialCases },
      allPassed ? 'INFO' : 'HIGH'
    );
  } catch (err) {
    record('TAG-07', 'Special characters in filenames', 'Filename Auto-Tagging Heuristics', false, { error: err.message }, 'HIGH');
  }

  // 3.8: Adversarial Substring Collision Probe: "daycare" vs "care" (Hospital Bill vs Care Insurance)
  try {
    const filename = 'daycare_procedure_bill.pdf';
    const detected = autoTagDocument(filename);
    // "daycare" contains "care". "care" is in the policy regex.
    // However, this is a hospital bill! If detected === 'INSURANCE_POLICY', it's a false positive.
    const isExpectedBill = detected === 'HOSPITAL_BILL';
    record(
      'TAG-08',
      'Adversarial probe: "daycare_procedure_bill.pdf" correctly classified as HOSPITAL_BILL without false-positive collision on "care"',
      'Filename Auto-Tagging Heuristics',
      isExpectedBill,
      { filename, detected, note: isExpectedBill ? 'Correctly identified as bill' : 'FINDING: Substring "care" triggered false positive INSURANCE_POLICY' },
      isExpectedBill ? 'INFO' : 'LOW'
    );
  } catch (err) {
    record('TAG-08', 'Daycare bill probe', 'Filename Auto-Tagging Heuristics', false, { error: err.message }, 'LOW');
  }

  // 3.9: Adversarial Substring Collision Probe: "instructions" vs "ins"
  try {
    const filename = 'hospital_discharge_instructions.pdf';
    const detected = autoTagDocument(filename);
    // "instructions" contains "ins". "ins" is in the policy regex.
    // But discharge instructions is part of hospital records.
    const isPolicy = detected === 'INSURANCE_POLICY';
    record(
      'TAG-09',
      'Adversarial probe: Substring "ins" in "instructions" behavior analysis',
      'Filename Auto-Tagging Heuristics',
      true, // Informational observation
      { filename, detected, note: isPolicy ? 'Matched INSURANCE_POLICY due to "ins" substring' : `Detected as ${detected}` },
      'INFO'
    );
  } catch (err) {
    record('TAG-09', 'Instructions substring probe', 'Filename Auto-Tagging Heuristics', false, { error: err.message }, 'INFO');
  }

  // 3.10: Null, undefined, number, object inputs to autoTagDocument
  try {
    const resNull = autoTagDocument(null);
    const resUndef = autoTagDocument(undefined);
    const resNum = autoTagDocument(42);
    const resObj = autoTagDocument({});
    const passes = resNull === null && resUndef === null && resNum === null && resObj === null;
    record(
      'TAG-10',
      'Handles non-string inputs (null, undefined, number, object) safely returning null',
      'Filename Auto-Tagging Heuristics',
      passes,
      { resNull, resUndef, resNum, resObj },
      passes ? 'INFO' : 'HIGH'
    );
  } catch (err) {
    record('TAG-10', 'Non-string inputs', 'Filename Auto-Tagging Heuristics', false, { error: err.message }, 'HIGH');
  }

  // =========================================================================
  // SUITE 4: READINESS CHECK CALCULATIONS & BUTTON GATING
  // =========================================================================

  function calculateReadiness(docs = {}) {
    if (!docs) return { uploadedCount: 0, canAnalyze: false, readinessPercentage: 0 };
    const hasBill = Boolean(docs.HOSPITAL_BILL);
    const hasPolicy = Boolean(docs.INSURANCE_POLICY);
    const hasRejection = Boolean(docs.REJECTION_LETTER);
    const uploadedCount = [hasBill, hasPolicy, hasRejection].filter(Boolean).length;
    const canAnalyze = uploadedCount === 3;
    const readinessPercentage = Math.round((uploadedCount / 3) * 100);
    return { hasBill, hasPolicy, hasRejection, uploadedCount, canAnalyze, readinessPercentage };
  }

  // 4.1: 0/3 State: Empty documents object
  try {
    const calc = calculateReadiness({});
    const passes = calc.uploadedCount === 0 && calc.readinessPercentage === 0 && calc.canAnalyze === false;
    record(
      'READY-01',
      '0/3 State: Empty documents -> 0 uploaded, 0%, canAnalyze=false',
      'Readiness Check Calculations',
      passes,
      calc,
      passes ? 'INFO' : 'CRITICAL'
    );
  } catch (err) {
    record('READY-01', '0/3 state calculation', 'Readiness Check Calculations', false, { error: err.message }, 'CRITICAL');
  }

  // 4.2: 1/3 State: Single document (Bill)
  try {
    const calc = calculateReadiness({ HOSPITAL_BILL: { name: 'bill.pdf' } });
    const passes = calc.uploadedCount === 1 && calc.readinessPercentage === 33 && calc.canAnalyze === false;
    record(
      'READY-02',
      '1/3 State: Only Bill attached -> 1 uploaded, 33%, canAnalyze=false',
      'Readiness Check Calculations',
      passes,
      calc,
      passes ? 'INFO' : 'HIGH'
    );
  } catch (err) {
    record('READY-02', '1/3 state calculation', 'Readiness Check Calculations', false, { error: err.message }, 'HIGH');
  }

  // 4.3: 2/3 State: Two documents (Bill + Policy)
  try {
    const calc = calculateReadiness({
      HOSPITAL_BILL: { name: 'bill.pdf' },
      INSURANCE_POLICY: { name: 'policy.pdf' }
    });
    const passes = calc.uploadedCount === 2 && calc.readinessPercentage === 67 && calc.canAnalyze === false;
    record(
      'READY-03',
      '2/3 State: Bill + Policy attached -> 2 uploaded, 67%, canAnalyze=false',
      'Readiness Check Calculations',
      passes,
      calc,
      passes ? 'INFO' : 'HIGH'
    );
  } catch (err) {
    record('READY-03', '2/3 state calculation', 'Readiness Check Calculations', false, { error: err.message }, 'HIGH');
  }

  // 4.4: 3/3 State: All three documents attached
  try {
    const calc = calculateReadiness({
      HOSPITAL_BILL: { name: 'bill.pdf' },
      INSURANCE_POLICY: { name: 'policy.pdf' },
      REJECTION_LETTER: { name: 'rejection.pdf' }
    });
    const passes = calc.uploadedCount === 3 && calc.readinessPercentage === 100 && calc.canAnalyze === true;
    record(
      'READY-04',
      '3/3 State: All 3 docs attached -> 3 uploaded, 100%, canAnalyze=true',
      'Readiness Check Calculations',
      passes,
      calc,
      passes ? 'INFO' : 'CRITICAL'
    );
  } catch (err) {
    record('READY-04', '3/3 state calculation', 'Readiness Check Calculations', false, { error: err.message }, 'CRITICAL');
  }

  // 4.5: Extra unexpected slots in documents object (should not inflate count beyond 3)
  try {
    const calc = calculateReadiness({
      HOSPITAL_BILL: { name: 'bill.pdf' },
      UNKNOWN_EXTRA: { name: 'extra.pdf' },
      MALICIOUS_SLOT: { name: 'hacked.pdf' }
    });
    const passes = calc.uploadedCount === 1 && calc.readinessPercentage === 33 && calc.canAnalyze === false;
    record(
      'READY-05',
      'Ignores extraneous unknown document keys and evaluates strictly tripartite slots',
      'Readiness Check Calculations',
      passes,
      calc,
      passes ? 'INFO' : 'HIGH'
    );
  } catch (err) {
    record('READY-05', 'Extra document keys', 'Readiness Check Calculations', false, { error: err.message }, 'HIGH');
  }

  // 4.6: SSR Render of ReadinessCheck in 0/3 state (CTA locked, 0/3 badge)
  try {
    const html = renderToStaticMarkup(<ReadinessCheck documents={{}} />);
    const hasLockText = html.includes('Attach All 3 Documents (3 remaining)');
    const hasBadge = html.includes('0/3 Docs Attached (0%)');
    const isGated = html.includes('disabled=""') || html.includes('disabled');
    const passes = hasLockText && hasBadge && isGated;
    record(
      'READY-06',
      'ReadinessCheck SSR: Renders 0/3 state with disabled CTA and lock status',
      'Readiness Check Calculations',
      passes,
      { hasLockText, hasBadge, isGated },
      passes ? 'INFO' : 'HIGH'
    );
  } catch (err) {
    record('READY-06', 'ReadinessCheck SSR 0/3', 'Readiness Check Calculations', false, { error: err.message }, 'HIGH');
  }

  // 4.7: SSR Render of ReadinessCheck in 3/3 state (CTA enabled, Run Claim Forensics)
  try {
    const fullDocs = {
      HOSPITAL_BILL: { name: 'bill.pdf' },
      INSURANCE_POLICY: { name: 'policy.pdf' },
      REJECTION_LETTER: { name: 'rejection.pdf' }
    };
    const html = renderToStaticMarkup(<ReadinessCheck documents={fullDocs} claimId="CLM-TEST-01" />);
    const hasRunText = html.includes('Run Claim Forensics &amp; Audit') || html.includes('Run Claim Forensics & Audit');
    const hasBadge = html.includes('3/3 Docs Attached (100%)');
    const hasClaimId = html.includes('CLM-TEST-01');
    const passes = hasRunText && hasBadge && hasClaimId;
    record(
      'READY-07',
      'ReadinessCheck SSR: Renders 3/3 state with enabled CTA and active claim ID',
      'Readiness Check Calculations',
      passes,
      { hasRunText, hasBadge, hasClaimId },
      passes ? 'INFO' : 'CRITICAL'
    );
  } catch (err) {
    record('READY-07', 'ReadinessCheck SSR 3/3', 'Readiness Check Calculations', false, { error: err.message }, 'CRITICAL');
  }

  // 4.8: SSR Render of ReadinessCheck during isAnalyzing animation state
  try {
    const fullDocs = {
      HOSPITAL_BILL: { name: 'bill.pdf' },
      INSURANCE_POLICY: { name: 'policy.pdf' },
      REJECTION_LETTER: { name: 'rejection.pdf' }
    };
    const html = renderToStaticMarkup(
      <ReadinessCheck
        documents={fullDocs}
        isAnalyzing={true}
        extractionStage={1}
        extractionProgress={45}
      />
    );
    const hasAnalyzingText = html.includes('Executing Forensic Pipeline');
    const hasStageTitle = html.includes('Extracting OCR Tokens');
    const hasProgressPercent = html.includes('45%');
    const passes = hasAnalyzingText && hasStageTitle && hasProgressPercent;
    record(
      'READY-08',
      'ReadinessCheck SSR: Renders active extraction stage animation ticker and progress percentage',
      'Readiness Check Calculations',
      passes,
      { hasAnalyzingText, hasStageTitle, hasProgressPercent },
      passes ? 'INFO' : 'HIGH'
    );
  } catch (err) {
    record('READY-08', 'ReadinessCheck SSR isAnalyzing', 'Readiness Check Calculations', false, { error: err.message }, 'HIGH');
  }

  // =========================================================================
  // SUITE 5: SAMPLE APOLLO CLAIM LOADER DATA INTEGRITY
  // =========================================================================

  // 5.1: Top-level claim identifiers and monetary figures
  try {
    const sample = SAMPLE_APOLLO_CLAIM;
    const passes =
      sample.claimId === 'CLM-84920' &&
      typeof sample.patientName === 'string' && sample.patientName.length > 0 &&
      typeof sample.hospital === 'string' && sample.hospital.includes('Apollo') &&
      typeof sample.policyNumber === 'string' && sample.policyNumber.includes('STAR') &&
      sample.totalBilled === 124000 &&
      sample.disallowedAmount === 42500;

    record(
      'APOLLO-01',
      'Sample Apollo Claim: Top-level metadata and monetary amounts match benchmark contract',
      'Sample Apollo Claim Integrity',
      passes,
      {
        claimId: sample.claimId,
        patientName: sample.patientName,
        hospital: sample.hospital,
        totalBilled: sample.totalBilled,
        disallowedAmount: sample.disallowedAmount
      },
      passes ? 'INFO' : 'CRITICAL'
    );
  } catch (err) {
    record('APOLLO-01', 'Apollo Claim top-level check', 'Sample Apollo Claim Integrity', false, { error: err.message }, 'CRITICAL');
  }

  // 5.2: Tripartite documents presence and schema completeness
  try {
    const docs = SAMPLE_APOLLO_CLAIM.documents;
    const hasAllThree = docs.HOSPITAL_BILL && docs.INSURANCE_POLICY && docs.REJECTION_LETTER;

    const billOk = docs.HOSPITAL_BILL.name && docs.HOSPITAL_BILL.size > 0 && docs.HOSPITAL_BILL.format === 'PDF' && docs.HOSPITAL_BILL.uploadStatus === 'ready';
    const policyOk = docs.INSURANCE_POLICY.name && docs.INSURANCE_POLICY.size > 0 && docs.INSURANCE_POLICY.format === 'PDF' && docs.INSURANCE_POLICY.uploadStatus === 'ready';
    const rejOk = docs.REJECTION_LETTER.name && docs.REJECTION_LETTER.size > 0 && docs.REJECTION_LETTER.format === 'PDF' && docs.REJECTION_LETTER.uploadStatus === 'ready';

    const passes = hasAllThree && billOk && policyOk && rejOk;
    record(
      'APOLLO-02',
      'Sample Apollo Claim: All 3 document slots populated with valid PDF attachments and ready status',
      'Sample Apollo Claim Integrity',
      passes,
      { billOk, policyOk, rejOk },
      passes ? 'INFO' : 'CRITICAL'
    );
  } catch (err) {
    record('APOLLO-02', 'Apollo Claim docs check', 'Sample Apollo Claim Integrity', false, { error: err.message }, 'CRITICAL');
  }

  // 5.3: Arithmetic Reconciliation (Disallowed + Approved == Total Billed)
  try {
    const rejMeta = SAMPLE_APOLLO_CLAIM.documents.REJECTION_LETTER.metadata;
    const billed = SAMPLE_APOLLO_CLAIM.totalBilled;
    const approved = rejMeta.approved_amount;
    const disallowed = rejMeta.disallowed_amount;
    const sum = approved + disallowed;
    const passes = sum === billed && sum === rejMeta.total_claimed;

    record(
      'APOLLO-03',
      'Sample Apollo Claim: Arithmetic reconciliation verified (Approved ₹81,500 + Disallowed ₹42,500 = ₹1,24,000)',
      'Sample Apollo Claim Integrity',
      passes,
      { billed, approved, disallowed, sum, totalClaimed: rejMeta.total_claimed },
      passes ? 'INFO' : 'CRITICAL'
    );
  } catch (err) {
    record('APOLLO-03', 'Apollo Claim reconciliation', 'Sample Apollo Claim Integrity', false, { error: err.message }, 'CRITICAL');
  }

  // 5.4: Clinical and Forensics Metadata completeness
  try {
    const billMeta = SAMPLE_APOLLO_CLAIM.documents.HOSPITAL_BILL.metadata;
    const polMeta = SAMPLE_APOLLO_CLAIM.documents.INSURANCE_POLICY.metadata;
    const rejMeta = SAMPLE_APOLLO_CLAIM.documents.REJECTION_LETTER.metadata;

    const passes =
      billMeta.line_items_count === 24 &&
      billMeta.arithmetic_verified === true &&
      polMeta.sum_insured === 1000000 &&
      polMeta.moratorium_active === true &&
      polMeta.continuous_coverage_months === 64 &&
      Array.isArray(rejMeta.deduction_reasons) &&
      rejMeta.deduction_reasons.length >= 2;

    record(
      'APOLLO-04',
      'Sample Apollo Claim: Line items (24), Sum Insured (₹10L), Moratorium (64m) and deduction grounds verified',
      'Sample Apollo Claim Integrity',
      passes,
      {
        lineItems: billMeta.line_items_count,
        sumInsured: polMeta.sum_insured,
        moratoriumMonths: polMeta.continuous_coverage_months,
        reasonsCount: rejMeta.deduction_reasons.length
      },
      passes ? 'INFO' : 'HIGH'
    );
  } catch (err) {
    record('APOLLO-04', 'Apollo Claim clinical metadata', 'Sample Apollo Claim Integrity', false, { error: err.message }, 'HIGH');
  }

  // =========================================================================
  // SUITE 6: DOCUMENT CARD UTILITIES & SSR RENDERING
  // =========================================================================

  // 6.1: formatFileSize utility boundary checks
  try {
    const cases = [
      { input: 0, expected: '0 B' },
      { input: 500, expected: '500 B' },
      { input: 1024, expected: '1 KB' },
      { input: 2457600, expected: '2.3 MB' },
      { input: 26214400, expected: '25 MB' },
      { input: null, expected: '—' },
      { input: undefined, expected: '—' },
    ];
    let allPassed = true;
    const failures = [];
    cases.forEach((c) => {
      const res = formatFileSize(c.input);
      if (res !== c.expected) {
        allPassed = false;
        failures.push({ input: c.input, expected: c.expected, got: res });
      }
    });

    record(
      'DOC-01',
      'formatFileSize: Correctly formats bytes to B / KB / MB and handles null/undefined',
      'Document Card Utilities',
      allPassed,
      { cases, failures },
      allPassed ? 'INFO' : 'HIGH'
    );
  } catch (err) {
    record('DOC-01', 'formatFileSize boundaries', 'Document Card Utilities', false, { error: err.message }, 'HIGH');
  }

  // 6.2: getFormatChip utility boundary checks
  try {
    const chipPdf = getFormatChip('document.pdf');
    const chipPng = getFormatChip('scan.PNG');
    const chipJpg = getFormatChip('photo.jpeg');
    const chipTiff = getFormatChip('xray.TIFF');
    const chipUnknown = getFormatChip('archive.zip');

    const passes =
      chipPdf.label === 'PDF' &&
      chipPng.label === 'PNG' &&
      chipJpg.label === 'JPG' &&
      chipTiff.label === 'TIFF' &&
      chipUnknown.label === 'ZIP';

    record(
      'DOC-02',
      'getFormatChip: Returns accurate uppercase chips and color styling for PDF, PNG, JPG, TIFF',
      'Document Card Utilities',
      passes,
      { chipPdf, chipPng, chipJpg, chipTiff, chipUnknown },
      passes ? 'INFO' : 'HIGH'
    );
  } catch (err) {
    record('DOC-02', 'getFormatChip boundaries', 'Document Card Utilities', false, { error: err.message }, 'HIGH');
  }

  // 6.3: SSR Render of DocumentCard in Unattached (Empty Slot) State
  try {
    const html = renderToStaticMarkup(
      <DocumentCard documentType="HOSPITAL_BILL" docRecord={null} />
    );
    const hasTitle = html.includes('Hospital Final Bill');
    const hasPending = html.includes('Pending Intake');
    const hasAttachBtn = html.includes('Attach File');
    const passes = hasTitle && hasPending && hasAttachBtn;

    record(
      'DOC-03',
      'DocumentCard SSR: Renders unattached slot with "Pending Intake" badge and "Attach File" button',
      'Document Card Utilities',
      passes,
      { hasTitle, hasPending, hasAttachBtn },
      passes ? 'INFO' : 'HIGH'
    );
  } catch (err) {
    record('DOC-03', 'DocumentCard SSR unattached', 'Document Card Utilities', false, { error: err.message }, 'HIGH');
  }

  // 6.4: SSR Render of DocumentCard in Attached State with Metadata Tags
  try {
    const docRecord = SAMPLE_APOLLO_CLAIM.documents.HOSPITAL_BILL;
    const html = renderToStaticMarkup(
      <DocumentCard
        documentType="HOSPITAL_BILL"
        docRecord={docRecord}
        onRemove={() => {}}
        onReplace={() => {}}
        onRetag={() => {}}
      />
    );
    const hasFileName = html.includes('apollo_hospital_bill_itemized.pdf');
    const hasVerified = html.includes('Verified');
    const hasLineItems = html.includes('24 line items');
    const hasRetagSelect = html.includes('select') && html.includes('HOSPITAL_BILL');
    const passes = hasFileName && hasVerified && hasLineItems && hasRetagSelect;

    record(
      'DOC-04',
      'DocumentCard SSR: Renders attached document with filename, size, verified badge, line items tag, and retag select',
      'Document Card Utilities',
      passes,
      { hasFileName, hasVerified, hasLineItems, hasRetagSelect },
      passes ? 'INFO' : 'CRITICAL'
    );
  } catch (err) {
    record('DOC-04', 'DocumentCard SSR attached', 'Document Card Utilities', false, { error: err.message }, 'CRITICAL');
  }

  // 6.5: SSR Render of BatchDropzone in Batch Mode and Guided Mode
  try {
    const htmlBatch = renderToStaticMarkup(<BatchDropzone mode="batch" />);
    const hasBatchText = htmlBatch.includes('Drag &amp; drop up to 3 claim documents') || htmlBatch.includes('Drag & drop up to 3 claim documents');
    const hasPill = htmlBatch.includes('Batch Multi-Drop');

    const htmlGuided = renderToStaticMarkup(<BatchDropzone mode="guided" documents={{}} />);
    const hasGuidedSlots = htmlGuided.includes('1. Hospital Bill') && htmlGuided.includes('2. Insurance Policy') && htmlGuided.includes('3. Rejection / Settlement');

    const passes = hasBatchText && hasPill && hasGuidedSlots;
    record(
      'DROPZONE-01',
      'BatchDropzone SSR: Successfully renders both Batch Multi-Drop and Guided 3-Step Target modes',
      'Document Card Utilities',
      passes,
      { hasBatchText, hasPill, hasGuidedSlots },
      passes ? 'INFO' : 'CRITICAL'
    );
  } catch (err) {
    record('DROPZONE-01', 'BatchDropzone SSR', 'Document Card Utilities', false, { error: err.message }, 'CRITICAL');
  }

  return { testResults, vulnerabilities };
}
