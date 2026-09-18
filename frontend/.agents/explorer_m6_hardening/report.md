# Milestone 6: Component Edge-Case Hardening — Investigation & Implementation Specification

**Author**: `explorer_m6_hardening`  
**Date**: 2026-09-18  
**Scope**: Formulation of exact code diffs and architectural fixes for Milestone 6 across 6 critical frontend modules.  
**Target Modules**:
1. `src/components/dashboard/DashboardCharts.jsx` (WATERFALL-02 runtime crash)
2. `src/components/upload/BatchDropzone.jsx` (SIZE-04, SIZE-05, MIME-06, TAG-08)
3. `src/components/analysis/AuditTimeline.jsx` (Invalid Date RangeError)
4. `src/components/analysis/AppealLetter.jsx` (Object URL memory leak & export robustness)
5. `src/components/dashboard/ClaimsTable.jsx` (CSV injection on numeric cells & Blob download)
6. `src/components/VerdictCard.jsx` vs `src/components/analysis/VerdictCard.jsx` (Redundancy retirement)

---

## 1. Executive Summary

During the Component Survey and QA Audit, several latent edge cases, boundary flaws, and redundant files were identified across the ClaimGuard AI React frontend. While existing automated test suites reported high baseline pass rates (72/72 tests passing), adversarial stress testing uncovered critical vulnerabilities—notably a crash in the dashboard's financial waterfall visualization when rendered with partial step data, upload bypasses allowing negative/NaN file sizes and executable extensions with spoofed MIME headers, date parsing errors crashing the cryptographic ledger timeline, unrevoked Blob URLs leaking memory, and CSV injection risks in tabular export.

This investigation delivers production-ready, exact line-by-line diffs to eliminate all identified defects without introducing regressions or breaking interface contracts.

---

## 2. Detailed Technical Analysis & Proposed Implementation Diffs

### Target 1: `src/components/dashboard/DashboardCharts.jsx`
#### Problem: WATERFALL-02 Crash on Custom or Truncated Steps
- **Observation**:
  In `FinancialWaterfallChart` (`src/components/dashboard/DashboardCharts.jsx`), the footer reconciliation bar accesses `dynamicSteps` indices directly:
  ```jsx
  // Lines 442, 446, 450:
  <span>Billed: {formatCompactInr(dynamicSteps[0].amount)}</span>
  <span>Deducted: {formatCompactInr(dynamicSteps[2].amount)}</span>
  <span>Recovered: +{formatCompactInr(dynamicSteps[3].amount)}</span>
  ```
  When the component receives a custom `steps` prop with fewer than 4 elements (e.g. `steps={[{ id: 'billed', amount: 0 }, { id: 'approved', amount: 0 }]}` as tested in `tests/challenger-m2-charts-stress.mjs`), `dynamicSteps[2]` and `dynamicSteps[3]` are `undefined`. Accessing `.amount` throws:
  `TypeError: Cannot read properties of undefined (reading 'amount')`, instantly crashing the React render tree.
  Additionally, line 334 calculates `rawMaxVal` across `dynamicSteps` without guarding against undefined amounts.

- **Proposed Solution**:
  1. Add optional chaining and nullish coalescing to footer indices: `dynamicSteps[0]?.amount ?? 0`, `dynamicSteps[2]?.amount ?? 0`, and `dynamicSteps[3]?.amount ?? 0`.
  2. Guard line 334 with `(s?.amount ?? 0) + (s?.base || 0)`.

#### Exact Diff: `src/components/dashboard/DashboardCharts.jsx`
```diff
--- a/src/components/dashboard/DashboardCharts.jsx
+++ b/src/components/dashboard/DashboardCharts.jsx
@@ -331,7 +331,7 @@ export function FinancialWaterfallChart({
     ];
   }, [stats, steps]);
 
-  const rawMaxVal = Math.max(...dynamicSteps.map((s) => s.amount + (s.base || 0))) * 1.15;
+  const rawMaxVal = Math.max(...dynamicSteps.map((s) => (s?.amount ?? 0) + (s?.base || 0))) * 1.15;
   const maxVal = rawMaxVal <= 0 || isNaN(rawMaxVal) ? 1 : rawMaxVal;
   const chartHeight = 175; // px
 
@@ -439,15 +439,15 @@ export function FinancialWaterfallChart({
       {/* Summary Reconciliation Footer */}
       <div className="mt-2 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
         <div className="flex items-center gap-1.5">
           <span className="w-2 h-2 rounded-full bg-slate-700" />
-          <span>Billed: {formatCompactInr(dynamicSteps[0].amount)}</span>
+          <span>Billed: {formatCompactInr(dynamicSteps[0]?.amount ?? 0)}</span>
         </div>
         <div className="flex items-center gap-1.5">
           <span className="w-2 h-2 rounded-full bg-rose-500" />
-          <span>Deducted: {formatCompactInr(dynamicSteps[2].amount)}</span>
+          <span>Deducted: {formatCompactInr(dynamicSteps[2]?.amount ?? 0)}</span>
         </div>
         <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
           <span className="w-2 h-2 rounded-full bg-emerald-500" />
-          <span>Recovered: +{formatCompactInr(dynamicSteps[3].amount)}</span>
+          <span>Recovered: +{formatCompactInr(dynamicSteps[3]?.amount ?? 0)}</span>
         </div>
       </div>
     </div>
```

---

### Target 2: `src/components/upload/BatchDropzone.jsx`
#### Problems: SIZE-04, SIZE-05, MIME-06, TAG-08
- **Observation 1 (SIZE-04 & SIZE-05)**:
  `validateUploadFile` currently evaluates:
  ```js
  if (!file || file.size === 0) { ... }
  if (file.size > MAX_FILE_SIZE) { ... }
  ```
  If `file.size` is negative (e.g. `-1` byte) or `NaN`, both comparisons evaluate to `false`, allowing invalid and corrupt files to pass validation.
- **Observation 2 (MIME-06)**:
  `validateUploadFile` currently evaluates:
  ```js
  const isMimeAllowed = ALLOWED_MIME_TYPES.includes(mime);
  const isExtAllowed = ALLOWED_EXTENSIONS.includes(ext);
  if (!isMimeAllowed && !isExtAllowed) { ... }
  ```
  Because of the logical AND on inverted conditions (`!isMimeAllowed && !isExtAllowed`), if a file has an executable extension (`payload.exe`) but provides a spoofed MIME header (`type: 'application/pdf'`), `!isMimeAllowed` is `false`, causing the condition to be `false` and allowing `.exe` files into the system.
- **Observation 3 (TAG-08)**:
  In `autoTagDocument`, the policy pattern regex contains the substring `care`:
  ```js
  if (/(policy|schedule|coverage|ins|insurance|star|care|hdfc...)/i.test(name)) return 'INSURANCE_POLICY';
  ```
  When uploading `daycare_procedure_bill.pdf`, the substring `care` within `daycare` causes the document to be misclassified as `INSURANCE_POLICY` instead of matching rule 3 (`bill` -> `HOSPITAL_BILL`).

#### Proposed Solution:
1. Coerce `size = Number(file?.size)` and reject if `!file || isNaN(size) || size <= 0`.
2. Strictly check that if an extension is present, it must be in `ALLOWED_EXTENSIONS`. If MIME is present, it must be in `ALLOWED_MIME_TYPES`. Reject if either is disallowed, or if both are absent.
3. In `autoTagDocument`, normalize delimiters (replace `_`, `-`, `.` with spaces) and wrap `care` in word boundaries `\bcare\b`.

#### Exact Diff: `src/components/upload/BatchDropzone.jsx`
```diff
--- a/src/components/upload/BatchDropzone.jsx
+++ b/src/components/upload/BatchDropzone.jsx
@@ -30,17 +30,18 @@ export const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.
  * Conforms strictly to Tier 2.1 boundary contracts.
  */
 export const validateUploadFile = (file) => {
-  if (!file || file.size === 0) {
+  const size = Number(file?.size);
+  if (!file || isNaN(size) || size <= 0) {
     return {
       valid: false,
-      error: `File "${file?.name || 'document'}" is empty (0 bytes)`
+      error: `File "${file?.name || 'document'}" is empty or invalid (0 bytes)`
     };
   }
 
-  if (file.size > MAX_FILE_SIZE) {
+  if (size > MAX_FILE_SIZE) {
     return {
       valid: false,
-      error: `File size ${file.size} exceeds maximum limit of 25MB`
+      error: `File size ${size} exceeds maximum limit of 25MB`
     };
   }
 
@@ -51,10 +52,14 @@ export const validateUploadFile = (file) => {
   const isMimeAllowed = ALLOWED_MIME_TYPES.includes(mime);
   const isExtAllowed = ALLOWED_EXTENSIONS.includes(ext);
 
-  if (!isMimeAllowed && !isExtAllowed) {
+  // Strict validation:
+  // - If extension is present, it MUST be whitelisted (rejects payload.exe with spoofed application/pdf MIME)
+  // - If MIME is present, it MUST be whitelisted
+  // - At least one of extension or MIME must be present
+  if ((ext && !isExtAllowed) || (mime && !isMimeAllowed) || (!ext && !mime)) {
     return {
       valid: false,
-      error: `MIME type "${file.type || ext}" is not supported`
+      error: `File type "${ext || file.type || 'unknown'}" is not supported`
     };
   }
 
@@ -67,16 +72,17 @@ export const validateUploadFile = (file) => {
  */
 export const autoTagDocument = (filename) => {
   if (!filename || typeof filename !== 'string') return null;
-  const name = filename.toLowerCase();
+  // Replace underscores, hyphens, and periods with whitespace for accurate token matching
+  const normalized = filename.toLowerCase().replace(/[._-]+/g, ' ');
 
-  // 1. Rejection / Settlement Letter patterns
-  if (/(rej|rejection|denial|deduct|settle|settlement|query|tpa|disallow|disallowance|voucher|computation)/i.test(name)) {
+  // 1. Rejection / Settlement Letter patterns (evaluated first for precedence)
+  if (/(rej|rejection|denial|deduct|settle|settlement|query|tpa|disallow|disallowance|voucher|computation)/i.test(normalized)) {
     return 'REJECTION_LETTER';
   }
 
-  // 2. Insurance Policy patterns
-  if (/(policy|schedule|coverage|ins|insurance|star|care|hdfc|icici|niacl|uiic|max_bupa|niva|bajaj|reliance|optima|mediclaim)/i.test(name)) {
+  // 2. Insurance Policy patterns (use \bcare\b to prevent daycare procedure bills matching care insurance)
+  if (/(policy|schedule|coverage|ins|insurance|star|\bcare\b|hdfc|icici|niacl|uiic|max_bupa|niva|bajaj|reliance|optima|mediclaim)/i.test(normalized)) {
     return 'INSURANCE_POLICY';
   }
 
-  // 3. Hospital Bill patterns
-  if (/(bill|inv|invoice|discharge|hosp|hospital|apollo|fortis|max|medanta|summary|ipd|opd|charges|receipt|itemized)/i.test(name)) {
+  // 3. Hospital Bill patterns
+  if (/(bill|inv|invoice|discharge|hosp|hospital|apollo|fortis|max|medanta|summary|ipd|opd|charges|receipt|itemized)/i.test(normalized)) {
     return 'HOSPITAL_BILL';
   }
```

---

### Target 3: `src/components/analysis/AuditTimeline.jsx`
#### Problem: Invalid Date RangeError in SHA-256 Ledger
- **Observation**:
  In `src/components/analysis/AuditTimeline.jsx` line 213:
  ```jsx
  {block.created_at ? new Date(block.created_at).toUTCString() : 'N/A'}
  ```
  If `block.created_at` contains a corrupted or invalid timestamp (e.g. malformed backend response or user tamper test), `new Date(block.created_at)` results in an `Invalid Date` object. Invoking `.toUTCString()` immediately throws:
  `RangeError: Invalid time value`, crashing the entire audit timeline view.

- **Proposed Solution**:
  Introduce a resilient helper `formatDateSafe(dateString)` that validates `isNaN(date.getTime())` and wraps execution in a `try...catch` block, safely defaulting to `'Timestamp Sealed'` or `'N/A'`. Also protect clipboard operations with `.catch(() => {})`.

#### Exact Diff: `src/components/analysis/AuditTimeline.jsx`
```diff
--- a/src/components/analysis/AuditTimeline.jsx
+++ b/src/components/analysis/AuditTimeline.jsx
@@ -27,6 +27,16 @@ import { mockAuditTrail } from '../../services/mockData';
+export const formatDateSafe = (dateString) => {
+  if (!dateString) return 'N/A';
+  try {
+    const d = new Date(dateString);
+    return isNaN(d.getTime()) ? 'Timestamp Sealed' : d.toUTCString();
+  } catch {
+    return 'Timestamp Sealed';
+  }
+};
+
 export default function AuditTimeline({
   auditTrail = null,
   claimId = 'CLM-84920',
@@ -42,7 +52,7 @@ export default function AuditTimeline({
   const handleCopyHash = (hash, label) => {
     if (!hash) return;
     if (navigator?.clipboard?.writeText) {
-      navigator.clipboard.writeText(hash);
+      navigator.clipboard.writeText(hash).catch(() => {});
     }
     setCopiedHash(hash);
     toast.success(`${label} copied to clipboard!`, { duration: 2000 });
@@ -210,7 +220,7 @@ export default function AuditTimeline({
                         <span>Actor: <strong className="text-slate-700">{block.actor}</strong></span>
                         <span className="flex items-center gap-1">
                           <Calendar className="w-3 h-3 text-slate-400" />
-                          {block.created_at ? new Date(block.created_at).toUTCString() : 'N/A'}
+                          {formatDateSafe(block.created_at)}
                         </span>
                       </div>
                     </div>
```

---

### Target 4: `src/components/analysis/AppealLetter.jsx`
#### Problem: Memory Leak from Unrevoked Blob Object URL & Word Count Glitch
- **Observation**:
  In `handleDownload` (`src/components/analysis/AppealLetter.jsx`, line 74):
  ```js
  const file = new Blob([draftContent], { type: 'text/plain;charset=utf-8' });
  element.href = URL.createObjectURL(file);
  ```
  `URL.revokeObjectURL()` is never called. Every download creates a new retained Blob in the browser's memory.
  Additionally, line 177 computes `draftContent.trim().split(/\s+/).length`. If `draftContent` is an empty string `""`, `"".split(/\s+/)` evaluates to `[""]` with length `1`, displaying an incorrect word count of 1 for empty text.

- **Proposed Solution**:
  1. Capture the URL in a local variable `const url = URL.createObjectURL(file)` and schedule `setTimeout(() => URL.revokeObjectURL(url), 100)` immediately after triggering `element.click()`.
  2. Protect clipboard write with `.catch(() => {})`.
  3. Calculate words safely: `draftContent.trim() ? draftContent.trim().split(/\s+/).length : 0`.

#### Exact Diff: `src/components/analysis/AppealLetter.jsx`
```diff
--- a/src/components/analysis/AppealLetter.jsx
+++ b/src/components/analysis/AppealLetter.jsx
@@ -56,7 +56,7 @@ export default function AppealLetter({
   const handleCopy = () => {
     if (navigator?.clipboard?.writeText) {
-      navigator.clipboard.writeText(draftContent);
+      navigator.clipboard.writeText(draftContent).catch(() => {});
     }
     setCopied(true);
     toast.success('Grievance letter copied to clipboard!', { icon: '📋' });
@@ -72,11 +72,13 @@ export default function AppealLetter({
   const handleDownload = () => {
     const element = document.createElement('a');
     const file = new Blob([draftContent], { type: 'text/plain;charset=utf-8' });
-    element.href = URL.createObjectURL(file);
+    const url = URL.createObjectURL(file);
+    element.href = url;
     element.download = `IRDAI_Grievance_Letter_${claimId}.txt`;
     document.body.appendChild(element);
     element.click();
     document.body.removeChild(element);
+    setTimeout(() => URL.revokeObjectURL(url), 100);
     toast.success('Letter downloaded as text file');
   };
 
@@ -174,7 +176,7 @@ export default function AppealLetter({
             <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
               <span>
                 Characters: <strong>{draftContent.length}</strong> | Words:{' '}
-                <strong>{draftContent.trim().split(/\s+/).length}</strong>
+                <strong>{draftContent.trim() ? draftContent.trim().split(/\s+/).length : 0}</strong>
               </span>
               <span className="text-[11px] text-slate-400 italic">
                 Edit mode enabled — updates will be included in exported text and print dossier
```

---

### Target 5: `src/components/dashboard/ClaimsTable.jsx`
#### Problem: CSV Injection Risk on Numeric Columns & URI Size Limit
- **Observation**:
  In `ClaimsTable.jsx` lines 442-454:
  ```js
  const rows = sortedClaims.map((c) => [
    sanitizeCsvCell(c?.id || ''),
    sanitizeCsvCell(c?.patient_name || c?.patient || 'Unknown'),
    sanitizeCsvCell(c?.policy_number || ''),
    sanitizeCsvCell(c?.status || ''),
    sanitizeCsvCell(c?.hospital || ''),
    c?.total_amount ?? c?.billed_amount ?? (c?.impact ? Math.round(c.impact * 2.8) : 85000),
    c?.monetary_impact ?? c?.impact ?? 0,
    sanitizeCsvCell(c?.date || c?.created_at || ''),
  ]);
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  ```
  1. `Total Billed` and `Disallowed Impact` are inserted raw without `sanitizeCsvCell()`. If monetary impact is negative (e.g. `-5000`) or if corrupted input contains formula characters (`=`, `+`, `-`, `@`), Microsoft Excel will execute it as a DDE formula.
  2. Building a `data:text/csv` data URI fails on large datasets (>2MB) because modern browsers truncate oversized data URLs.

- **Proposed Solution**:
  1. Pass both numeric cells through `sanitizeCsvCell(...)`.
  2. Use a UTF-8 `Blob` with `URL.createObjectURL` and revoke it via `setTimeout(() => URL.revokeObjectURL(url), 100)`.

#### Exact Diff: `src/components/dashboard/ClaimsTable.jsx`
```diff
--- a/src/components/dashboard/ClaimsTable.jsx
+++ b/src/components/dashboard/ClaimsTable.jsx
@@ -445,16 +445,18 @@ export default function ClaimsTable({
       sanitizeCsvCell(c?.policy_number || ''),
       sanitizeCsvCell(c?.status || ''),
       sanitizeCsvCell(c?.hospital || ''),
-      c?.total_amount ?? c?.billed_amount ?? (c?.impact ? Math.round(c.impact * 2.8) : 85000),
-      c?.monetary_impact ?? c?.impact ?? 0,
+      sanitizeCsvCell(c?.total_amount ?? c?.billed_amount ?? (c?.impact ? Math.round(c.impact * 2.8) : 85000)),
+      sanitizeCsvCell(c?.monetary_impact ?? c?.impact ?? 0),
       sanitizeCsvCell(c?.date || c?.created_at || ''),
     ]);
-    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
-    const encodedUri = encodeURI(csvContent);
+    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
+    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
+    const url = URL.createObjectURL(blob);
     const link = document.createElement('a');
-    link.setAttribute('href', encodedUri);
+    link.setAttribute('href', url);
     link.setAttribute('download', `claimguard_claims_${new Date().toISOString().split('T')[0]}.csv`);
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
+    setTimeout(() => URL.revokeObjectURL(url), 100);
     toast.success(`Exported ${sortedClaims.length} claims to CSV`);
```

---

### Target 6: Retirement of Legacy `src/components/VerdictCard.jsx`
#### Investigation & Architectural Verification:
- **Existing File Locations**:
  1. `src/components/VerdictCard.jsx` (117 lines): A legacy prototype lacking dual-tier classification, statutory IRDAI citation copies, and delta bars.
  2. `src/components/analysis/VerdictCard.jsx` (385 lines): The enterprise production implementation, actively imported by `src/pages/Analysis.jsx` and rendering statutory citations, calculation delta bars, and filter tabs.
- **Import Dependency Audit**:
  - `src/pages/Analysis.jsx` imports from `../components/analysis/VerdictCard`.
  - Zero application files import from `src/components/VerdictCard.jsx`.
  - Test suite `tests/tier1-feature-coverage.test.mjs` (Tier 1.6) tests an internal pure function `getStatusConfig` and does not import `src/components/VerdictCard.jsx`.
  - Architectural convention: Both `src/components/StatusBadge.jsx` (which re-exports `./common/StatusBadge`) and `src/components/StatsCard.jsx` (which forwards to `./common/MetricCard`) serve as backward-compatible shims.
- **Decision**:
  Safely retire the 117-line legacy code by converting `src/components/VerdictCard.jsx` into a 2-line re-export shim:
  ```javascript
  export { default } from './analysis/VerdictCard';
  export * from './analysis/VerdictCard';
  ```
  This guarantees:
  - Immediate elimination of duplicated, stale logic.
  - Zero risk of broken legacy imports or test runner regressions.
  - Zero circular dependencies (verified against `tests/check-circular-deps.mjs`).

---

## 3. Verification & Regression Analysis Matrix

| Test Suite / Probe | File | Target Component | Expected Result After Fix |
| :--- | :--- | :--- | :--- |
| **WATERFALL-02** | `tests/challenger-m2-charts-stress.mjs` | `DashboardCharts.jsx` | Passes without `TypeError: Cannot read properties of undefined` on 0, 1, or 2-step custom arrays. |
| **SIZE-04** | `tests/challenger-m3-upload-stress.mjs` | `BatchDropzone.jsx` | Rejects negative file size (`-1` byte) with valid: false. |
| **SIZE-05** | `tests/challenger-m3-upload-stress.mjs` | `BatchDropzone.jsx` | Rejects `NaN` file size with valid: false. |
| **MIME-06** | `tests/challenger-m3-upload-stress.mjs` | `BatchDropzone.jsx` | Rejects `payload.exe` with spoofed `application/pdf` MIME header. |
| **TAG-08** | `tests/challenger-m3-upload-stress.mjs` | `BatchDropzone.jsx` | `daycare_procedure_bill.pdf` maps to `HOSPITAL_BILL`. |
| **DATE-SAFE** | `src/components/analysis/AuditTimeline.jsx` | `AuditTimeline.jsx` | Corrupt date strings (`'invalid'`, `null`, `undefined`) return fallback string without throwing `RangeError`. |
| **REVOKE-BLOB** | `src/components/analysis/AppealLetter.jsx` | `AppealLetter.jsx` | Blob URL is revoked after download click, preventing memory leaks. |
| **CSV-FORMULA** | `src/components/dashboard/ClaimsTable.jsx` | `ClaimsTable.jsx` | Numeric amounts starting with `-` are escaped with leading `'` to neutralize Excel DDE injection; Blob URL used. |
| **VERDICT-SHIM** | `src/components/VerdictCard.jsx` | `VerdictCard.jsx` | Duplication eliminated; forwards cleanly to `analysis/VerdictCard`. |
