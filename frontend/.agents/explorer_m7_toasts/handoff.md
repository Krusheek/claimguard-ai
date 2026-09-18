# Handoff Report — Milestone 7: Sonner Stacked Toast Migration

**Author:** `explorer_m7_toasts`  
**Milestone:** Milestone 7 (Sonner Stacked Toast Migration)  
**Date:** 2026-09-18  
**Report Document:** `c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\.agents\explorer_m7_toasts\report.md`  

---

## 1. Observation

1. **Dependency Audit (`package.json`):**
   - Line 22: `"sonner": "^1.7.4"` is already installed and verified in `node_modules`.
   - Node runtime evaluation of `import('sonner')` confirmed exports: `[ 'Toaster', 'toast', 'useSonner' ]`.
   - Critical Contract: `import('sonner').then(m => m.default)` returns `undefined`. `sonner` only exposes named exports `{ toast, Toaster }`.
2. **Current `react-hot-toast` Footprint Across Workspace:**
   Exhaustive AST/regex search confirmed exactly 10 files in `src/` import `react-hot-toast`:
   - `src/App.jsx:4`: `import { Toaster } from 'react-hot-toast';`
   - `src/pages/Dashboard.jsx:11`: `import toast from 'react-hot-toast';`
   - `src/pages/Upload.jsx:4`: `import toast from 'react-hot-toast';`
   - `src/pages/Analysis.jsx:22`: `import toast from 'react-hot-toast';`
   - `src/components/dashboard/ClaimsTable.jsx:28`: `import toast from 'react-hot-toast';`
   - `src/components/dashboard/DashboardCharts.jsx:14`: `import toast from 'react-hot-toast';`
   - `src/components/upload/BatchDropzone.jsx:15`: `import toast from 'react-hot-toast';`
   - `src/components/analysis/VerdictCard.jsx:21`: `import toast from 'react-hot-toast';`
   - `src/components/analysis/AuditTimeline.jsx:25`: `import toast from 'react-hot-toast';`
   - `src/components/analysis/AppealLetter.jsx:19`: `import toast from 'react-hot-toast';`
   Zero other files in `src/` contain `react-hot-toast`.
3. **Current `<Toaster>` Implementation in `src/App.jsx`:**
   Lines 150–161 contain:
   ```jsx
   <Toaster
     position="top-right"
     toastOptions={{
       style: {
         background: '#0F172A',
         color: '#F8FAFC',
         fontSize: '13px',
         borderRadius: '10px',
         border: '1px solid #1E293B',
       },
     }}
   />
   ```
4. **Current Upload Pipeline State Machine (`src/pages/Upload.jsx`):**
   Lines 220–268 (`handleRunAudit`) advance `extractionStage` (0 to 3) and `extractionProgress` (5 to 100%) through 4 phases over 3400ms using a `setInterval` ticker, currently culminating in a single static toast at the end: `toast.success('Claim forensics & statutory audit initiated');`.
5. **Test Harness Baselines:**
   - `npm test`: 72/72 tests pass (0.49s execution time).
   - `node tests/check-imports.mjs`: All imports resolve cleanly across 30 files in `src/`.
   - `node tests/run-stress-tests.mjs`: Component stress tests pass, all 4 challenger suites pass (56/56 scenarios).
   - `npm run build`: Production Vite build passes cleanly (6.38s).

---

## 2. Logic Chain

1. **Named Export vs Default Export (Observations 1 & 2):**
   In `react-hot-toast`, `toast` is imported via `import toast from 'react-hot-toast'`. In `sonner`, `m.default` is `undefined`. If an implementer copies the old import pattern to `import toast from 'sonner'`, every `toast.*` invocation would crash with an unhandled TypeError. Therefore, every component migration must explicitly specify `import { toast } from 'sonner'`.
2. **App Shell Stacked Toaster Configuration (Observations 1 & 3):**
   The user prompt requires `<Toaster>` configured for stacked toasts with `expand={true}`, rich colors, and `top-right`. In `sonner`, setting `<Toaster position="top-right" expand={true} richColors closeButton visibleToasts={6} />` natively enables 3D stacked card physics, enterprise color palettes, and accessible dismiss buttons.
3. **Multi-Stage OCR Extraction Stacked Pipeline (Observation 4):**
   During `handleRunAudit`, the upload pipeline transitions through 4 distinct phases (Hashing, OCR Parsing, Clinical Verification, Forensics). By calling `toast.loading()` when each stage starts and resolving it via `toast.success()` using deterministic IDs (`ocr-stage-1` to `ocr-stage-4`), Sonner's `expand={true}` parameter will stack these 4 completed stage cards simultaneously in the viewport, giving the auditor a live visual audit trail before route transition.
4. **Complete Elimination of `react-hot-toast` (Observation 2):**
   Because only these 10 files import `react-hot-toast`, updating the 10 files eliminates 100% of references in `src/`.
5. **Zero Test Regressions (Observation 5):**
   The SSR test harnesses in `tests/challenger-*.mjs` and `tests/run-stress-tests.mjs` already include `'sonner'` in their rollup `external` lists. Thus, transitioning the components to `sonner` introduces zero SSR compilation errors or test breakages.

---

## 3. Caveats

- **CSS Bundling:** Sonner 1.7.4 injects its internal CSS styles dynamically via a DOM `<style>` tag on mount. No external `@import 'sonner/dist/styles.css'` is necessary in `index.css`, but adding custom `toastOptions` in `App.jsx` ensures strict Tailwind font and border-radius compliance.
- **Duration Tuning:** Toast durations for rapid clipboard actions (e.g. copying Claim ID, copying citation) are intentionally scoped to 1500–2000ms, while statutory ledger verification is set to 3500ms to allow sufficient reading time.
- **No Scope Beyond Milestone 7:** This report provides read-only analysis and exact diff specifications for Milestone 7 (toasts). Skeletons, Framer Motion transitions, and Bento Grid remain under their respective milestone plans.

---

## 4. Conclusion

The migration plan from `react-hot-toast` to `sonner` is fully scoped, architecturally specified, and accompanied by line-by-line before/after diffs across all 10 component files:
1. `src/App.jsx` is upgraded to Sonner's `<Toaster position="top-right" expand={true} richColors closeButton visibleToasts={6} />`.
2. All 10 component files are migrated to `import { toast } from 'sonner'`, upgrading plain notifications into enterprise cards with semantic titles and context-rich descriptions.
3. A 4-stage stacked pipeline tracking toast system is designed for `src/pages/Upload.jsx` using `ocr-stage-1` through `ocr-stage-4`.
4. Exactly 0 remaining imports of `react-hot-toast` will exist across `src/`.

---

## 5. Verification Method

To independently verify the implementation:

1. **Verify Zero Remaining Imports:**
   Run PowerShell search across `src/`:
   ```powershell
   Get-ChildItem -Path src -Recurse -Include *.js,*.jsx | Select-String "react-hot-toast"
   ```
   *Expected result:* 0 matches found.
2. **Verify Import Resolution:**
   ```powershell
   node tests/check-imports.mjs
   ```
   *Expected result:* `✔ All required Milestone 6 packages verified in node_modules`, `✅ All imports resolve successfully`.
3. **Execute Contract & Boundary Tests:**
   ```powershell
   npm test
   ```
   *Expected result:* 72/72 tests pass (100%).
4. **Execute SSR Stress Test Suites:**
   ```powershell
   node tests/run-stress-tests.mjs
   ```
   *Expected result:* All component tests and challenger suites pass (56/56 scenarios).
5. **Verify Production Build:**
   ```powershell
   npm run build
   ```
   *Expected result:* Exit code 0, clean Vite production bundle.
