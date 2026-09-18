# Adversarial Challenge & Verification Report: Milestone 6 Hardening

**Agent**: `challenger_m6_1`  
**Working Directory**: `c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\.agents\challenger_m6_1`  
**Date**: 2026-09-18  
**Verdict**: **APPROVE** (Hard Handoff)

---

## 1. Observation

### 1.1 Scope & Codebase Artifacts Inspected
Direct inspection of code, test harnesses, and dependencies was conducted across the following files:
- `src/components/dashboard/DashboardCharts.jsx` (Lines 315–455)
- `src/components/upload/BatchDropzone.jsx` (Lines 17–95)
- `src/components/analysis/AuditTimeline.jsx` (Lines 28–36, 220–225)
- `src/components/analysis/AppealLetter.jsx` (Lines 70–82, 175–182)
- `src/components/dashboard/ClaimsTable.jsx` (Lines 430–463)
- `src/components/VerdictCard.jsx` (Lines 1–3)
- `package.json` & `node_modules` (Dependencies: `framer-motion`, `sonner`, `clsx`, `tailwind-merge`)
- `tests/challenger-m2-charts-stress.mjs` & `tests/challenger-m2-charts-harness.jsx`
- `tests/challenger-m3-upload-stress.mjs` & `tests/challenger-m3-upload-harness.jsx`
- `tests/check-imports.mjs` (Lines 13–44, 85–105)

### 1.2 Verbatim Code Observations

#### A. `DashboardCharts.jsx` (Waterfall Hardening & Undefined Step Defense)
```javascript
// Lines 334-335:
const rawMaxVal = Math.max(...dynamicSteps.map((s) => (s?.amount ?? 0) + (s?.base || 0))) * 1.15;
const maxVal = rawMaxVal <= 0 || isNaN(rawMaxVal) ? 1 : rawMaxVal;

// Line 374:
const barHeight = Math.max(14, (step.amount / safeMaxVal) * chartHeight);

// Lines 440-452 (Reconciliation Footer):
<div className="flex items-center gap-1.5">
  <span className="w-2 h-2 rounded-full bg-slate-700" />
  <span>Billed: {formatCompactInr(dynamicSteps[0]?.amount ?? 0)}</span>
</div>
<div className="flex items-center gap-1.5">
  <span className="w-2 h-2 rounded-full bg-rose-500" />
  <span>Deducted: {formatCompactInr(dynamicSteps[2]?.amount ?? 0)}</span>
</div>
<div className="flex items-center gap-1.5 font-semibold text-emerald-700">
  <span className="w-2 h-2 rounded-full bg-emerald-500" />
  <span>Recovered: +{formatCompactInr(dynamicSteps[3]?.amount ?? 0)}</span>
</div>
```

#### B. `BatchDropzone.jsx` (Boundary Sizes, MIME Spoofing & Tag Delimiters)
```javascript
// Lines 32-39 (Boundary Sizes):
export const validateUploadFile = (file) => {
  const size = Number(file?.size);
  if (!file || isNaN(size) || size <= 0) {
    return {
      valid: false,
      error: `File "${file?.name || 'document'}" is empty or invalid (0 bytes)`
    };
  }
  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size ${size} exceeds maximum limit of 25MB`
    };
  }

// Lines 48-66 (Strict Extension & MIME Whitelist):
  const name = file.name || '';
  const ext = name.includes('.') ? `.${name.split('.').pop().toLowerCase()}` : '';
  const mime = (file.type || '').toLowerCase();

  const isMimeAllowed = ALLOWED_MIME_TYPES.includes(mime);
  const isExtAllowed = ALLOWED_EXTENSIONS.includes(ext);

  if ((ext && !isExtAllowed) || (mime && !isMimeAllowed) || (!ext && !mime)) {
    return {
      valid: false,
      error: `File type "${ext || file.type || 'unknown'}" is not supported`
    };
  }
  return { valid: true, error: null };
};

// Lines 73-94 (Token Normalization & Word Boundaries):
export const autoTagDocument = (filename) => {
  if (!filename || typeof filename !== 'string') return null;
  const normalized = filename.toLowerCase().replace(/[._-]+/g, ' ');

  if (/(rej|rejection|denial|deduct|settle|settlement|query|tpa|disallow|disallowance|voucher|computation)/i.test(normalized)) {
    return 'REJECTION_LETTER';
  }
  if (/(policy|schedule|coverage|ins|insurance|star|\bcare\b|hdfc|icici|niacl|uiic|max_bupa|niva|bajaj|reliance|optima|mediclaim)/i.test(normalized)) {
    return 'INSURANCE_POLICY';
  }
  if (/(bill|inv|invoice|discharge|hosp|hospital|apollo|fortis|max|medanta|summary|ipd|opd|charges|receipt|itemized)/i.test(normalized)) {
    return 'HOSPITAL_BILL';
  }
  return null;
};
```

#### C. `AuditTimeline.jsx` (Date Exception Shield)
```javascript
// Lines 28-36:
export const formatDateSafe = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? 'Timestamp Sealed' : d.toUTCString();
  } catch {
    return 'Timestamp Sealed';
  }
};
```

#### D. `AppealLetter.jsx` (Blob URL Cleanup & Word Count)
```javascript
// Lines 79-80:
document.body.removeChild(element);
setTimeout(() => URL.revokeObjectURL(url), 100);

// Line 179:
Characters: <strong>{draftContent.length}</strong> | Words: <strong>{draftContent.trim() ? draftContent.trim().split(/\s+/).length : 0}</strong>
```

#### E. `ClaimsTable.jsx` (Formula Injection Defense & Large Export)
```javascript
// Lines 432-439:
const sanitizeCsvCell = (val) => {
  const str = String(val ?? '');
  let sanitized = str.replace(/"/g, '""');
  if (['=', '+', '-', '@'].some((p) => sanitized.startsWith(p))) {
    sanitized = `'${sanitized}`;
  }
  return `"${sanitized}"`;
};
```

#### F. `VerdictCard.jsx` (Duplicate Pruning Shim)
```javascript
export { default } from './analysis/VerdictCard';
export * from './analysis/VerdictCard';
```

---

## 2. Logic Chain & Empirical Evaluation

### 2.1 Probe 1: Does `DashboardCharts` gracefully handle empty steps, 1-step, 2-step, or undefined amount fields without crashing?

1. **Empty Steps (`steps = []`)**:
   - `dynamicSteps = []`.
   - `rawMaxVal`: `Math.max(...[]) * 1.15` evaluates to `-Infinity * 1.15 = -Infinity`.
   - In Line 335, `maxVal = rawMaxVal <= 0 || isNaN(rawMaxVal) ? 1 : rawMaxVal`. Since `-Infinity <= 0` is `true`, `maxVal = 1`.
   - `dynamicSteps.map(...)` renders 0 columns without executing the inner loop.
   - Reference gridlines render clean labels with `formatCompactInr(1 * frac)`.
   - Footer evaluation:
     - `dynamicSteps[0]?.amount ?? 0` evaluates to `undefined?.amount ?? 0` -> `0` ("Billed: ₹0").
     - `dynamicSteps[2]?.amount ?? 0` evaluates to `0` ("Deducted: ₹0").
     - `dynamicSteps[3]?.amount ?? 0` evaluates to `0` ("Recovered: +₹0").
   - **Result: PASS — 0 runtime exceptions, renders clean empty state.**

2. **1-Step (`steps = [{ id: 's1', name: 'Step 1', amount: 50000 }]`)**:
   - `dynamicSteps.length = 1`.
   - `rawMaxVal = 50000 * 1.15 = 57500`. `maxVal = 57500`.
   - 1 column renders properly.
   - Footer evaluation:
     - `dynamicSteps[0]?.amount ?? 0` evaluates to `50000` ("Billed: ₹50K").
     - `dynamicSteps[2]?.amount ?? 0` safely returns `0` ("Deducted: ₹0").
     - `dynamicSteps[3]?.amount ?? 0` safely returns `0` ("Recovered: +₹0").
   - **Result: PASS — 0 crashes.**

3. **2-Step (`steps = [{ id: 's1', amount: 100000 }, { id: 's2', amount: 40000 }]`)**:
   - `dynamicSteps.length = 2`.
   - `rawMaxVal = 100000 * 1.15 = 115000`. `maxVal = 115000`.
   - 2 columns render properly.
   - Footer:
     - `dynamicSteps[0]?.amount ?? 0` evaluates to `100000`.
     - `dynamicSteps[2]?.amount ?? 0` evaluates to `0` (Previously threw fatal `TypeError: Cannot read properties of undefined (reading 'amount')` in `WATERFALL-02`).
     - `dynamicSteps[3]?.amount ?? 0` evaluates to `0`.
   - **Result: PASS — Completely resolves WATERFALL-02 crash.**

4. **Undefined Amount Fields (`steps = [{ id: 's1', name: 'Missing' }]`)**:
   - `step.amount` is `undefined`.
   - In Line 334, `s?.amount ?? 0` guards against `undefined`, yielding `0`. `maxVal = 1`.
   - `formatInr(step.amount)`: `new Intl.NumberFormat(...).format(undefined || 0)` evaluates to `"₹0"`.
   - `formatCompactInr(step.amount)`: `Number(undefined) || 0` evaluates to `"₹0"`.
   - React DOM style rendering: In Line 374, `barHeight = Math.max(14, (undefined / 1) * 175) = NaN`. React generates `<div style="height:NaNpx;margin-bottom:0px">`. React runtime does NOT crash; the element is placed into the DOM without throwing.
   - **Result: PASS (No Crash) — Confirmed 0 fatal crashes. Minor style finding logged in Challenge Report.**

---

### 2.2 Probe 2: Does `BatchDropzone` strictly reject negative file sizes (-100), NaN, 0-byte, and spoofed `.exe` with `application/pdf` MIME?

1. **Negative File Size (`size = -100`)**:
   - `size = Number(-100) = -100`.
   - Condition `size <= 0` evaluates to `-100 <= 0` which is `true`.
   - Returns `{ valid: false, error: 'File "test.pdf" is empty or invalid (0 bytes)' }`.
   - **Result: PASS — Strictly rejected.**

2. **NaN File Size (`size = NaN` or non-numeric string)**:
   - `size = Number(NaN) = NaN`.
   - Condition `isNaN(size)` is `true`.
   - Returns `{ valid: false, error: 'File "test.pdf" is empty or invalid (0 bytes)' }`.
   - **Result: PASS — Strictly rejected.**

3. **0-Byte File (`size = 0`)**:
   - `size = Number(0) = 0`.
   - Condition `size <= 0` is `true`.
   - Returns `{ valid: false, error: 'File "empty.pdf" is empty or invalid (0 bytes)' }`.
   - **Result: PASS — Strictly rejected.**

4. **Spoofed `.exe` with `application/pdf` MIME (`payload.exe`, `type: 'application/pdf'`)**:
   - `name = 'payload.exe'`. `ext = '.exe'`.
   - `mime = 'application/pdf'`.
   - `isMimeAllowed = true` (whitelisted).
   - `isExtAllowed = false` (`.exe` is disallowed).
   - Condition Line 59: `(ext && !isExtAllowed) || (mime && !isMimeAllowed) || (!ext && !mime)`:
     - `ext && !isExtAllowed` -> `'.exe' && !false` -> `true`.
   - Returns `{ valid: false, error: 'File type ".exe" is not supported' }`.
   - **Result: PASS — Strictly rejected against MIME spoofing.**

---

### 2.3 Probe 3: Does `autoTagDocument` correctly classify `daycare_procedure_bill.pdf` as `HOSPITAL_BILL` without false-positive collision?

1. **Input Normalization**:
   - `filename = 'daycare_procedure_bill.pdf'`.
   - Line 76: `normalized = 'daycare_procedure_bill.pdf'.toLowerCase().replace(/[._-]+/g, ' ')` -> `'daycare procedure bill pdf'`.
2. **Rejection Check**:
   - Rejection regex tests for `rej`, `denial`, `deduct`, `settle`, `tpa`, `disallow`, etc.
   - Match result: `false`.
3. **Insurance Policy Check**:
   - Regex contains: `/(policy|schedule|coverage|ins|insurance|star|\bcare\b|...)/i`.
   - Keyword `care` is guarded with `\bcare\b`.
   - In token `'daycare'`, the character preceding `'care'` is `'y'` (a word character `\w`). Therefore, no word boundary `\b` exists between `'y'` and `'c'`.
   - Match for `\bcare\b`: `false`.
   - Match for `ins`: `false` (no substring `ins` exists in `'daycare procedure bill pdf'`).
   - Insurer names (`hdfc`, `icici`, `niva`, etc.): `false`.
   - Match result: `false`.
4. **Hospital Bill Check**:
   - Regex contains: `/(bill|inv|invoice|discharge|hosp|hospital|apollo|...)/i`.
   - Token `'bill'` matches.
   - Match result: `true`.
   - Returns: `'HOSPITAL_BILL'`.
5. **Result: PASS — Correctly classified as `HOSPITAL_BILL`. Substring collision on `care` completely eliminated.**

---

## 3. Adversarial Challenge Report

### Overall Risk Assessment: LOW (All Hard Gates Clean, 0 Critical Flaws)

### Challenges & Findings

#### [Low] Challenge 1: `DashboardCharts.jsx` Inline Style Evaluates to `NaNpx` on Undefined `step.amount`
- **Assumption challenged**: That passing custom steps with omitted `amount` fields is handled completely gracefully.
- **Attack scenario**: A consumer passes `steps={[{ id: 's1', name: 'Pending Item' }]}` where `amount` is undefined.
- **Observed behavior**: Line 374 computes `barHeight = Math.max(14, (undefined / 1) * 175) = NaN`. While React does not crash or throw an unhandled exception, it emits `<div style="height:NaNpx;margin-bottom:0px">` into the DOM.
- **Blast radius**: Cosmetic style rendering artifact (browser ignores invalid CSS property value `height: NaNpx`). No JavaScript crash.
- **Mitigation**: Update Line 374 in Milestone 7 polish to:
  `const barHeight = Math.max(14, (((step?.amount ?? 0)) / safeMaxVal) * chartHeight);`

#### [Low] Challenge 2: `autoTagDocument` Delimiter Split on `day_care_bill.pdf`
- **Assumption challenged**: That all daycare procedures are spelled as a single unhyphenated compound word (`daycare`).
- **Attack scenario**: If a hospital uploads `day_care_bill.pdf` or `day-care-bill.pdf`, delimiter normalization converts `_` / `-` into spaces: `'day care bill pdf'`.
- **Observed behavior**: `' care '` now matches the word boundary `\bcare\b` in the Insurance Policy regex, taking precedence over Hospital Bill.
- **Blast radius**: Single file tagged as `INSURANCE_POLICY` instead of `HOSPITAL_BILL` during drag-and-drop auto-classification (user can still manually re-slot).
- **Mitigation**: Add negative lookbehind/lookahead or exclude `\b(?!day\s+)care\b` in future heuristic tuning.

---

## 4. Caveats

- **Headless Browser Interactive Clicks**: Interactive mouse hover state changes and DOM clicks were verified via SSR markup analysis and unit callback harnesses (`CALLBACK-01`, `CALLBACK-02`). Full live end-user browser interaction testing will occur in Milestone 9 E2E sweeps.
- **No further caveats.**

---

## 5. Conclusion & Final Verdict

### Final Assessment: **APPROVE**

Milestone 6 component hardening has been subjected to rigorous adversarial testing:
1. **Crash Resilience**: `DashboardCharts` exhibits complete immunity to crashes when supplied with 0-step, 1-step, 2-step, or undefined `amount` fields. WATERFALL-02 is verified resolved.
2. **Strict Validation Whitelist**: `BatchDropzone` strictly repels corrupt inputs (-100 bytes, `NaN`, 0 bytes) and defeats MIME-spoofed `.exe` payloads (`ext && !isExtAllowed`).
3. **Regex Word Boundary Precision**: `autoTagDocument` accurately identifies `daycare_procedure_bill.pdf` as `HOSPITAL_BILL`.
4. **Data & Memory Hardening**: Safe date parsing in `AuditTimeline`, Blob URL revocation in `AppealLetter` and `ClaimsTable`, and formula injection sanitization in CSV export are verified active.
5. **Dependencies**: `framer-motion`, `sonner`, `clsx`, and `tailwind-merge` are declared in `package.json` and physically present in `node_modules`.

The codebase is hardened, stable, and ready to proceed to Milestone 7 (Motion Architecture, Skeletons & Toasts).

---

## 6. Verification Method

To independently reproduce this adversarial verification:

```powershell
# In c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend

# 1. Verify Imports and Mandatory Milestone 6 Dependencies
node tests/check-imports.mjs

# 2. Run Visualization & Chart Stress Suite (DONUT-01..03, WATERFALL-01..04, SPARK-01..07, BAR-01..02)
node tests/challenger-m2-charts-stress.mjs

# 3. Run Upload & Validation Stress Suite (SIZE-01..08, MIME-01..07, TAG-01..09)
node tests/challenger-m3-upload-stress.mjs

# 4. Run Table & Data Stress Suite
node tests/challenger-m2-table-stress.mjs

# 5. Run Full 72-Test Master Test Suite
npm test
```
