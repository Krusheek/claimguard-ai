# Handoff Report: Milestone 6 Tooling & Test Runner Alignment

**Author**: `explorer_m6_tooling`  
**Working Directory**: `c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\.agents\explorer_m6_tooling`  
**Date**: 2026-09-18  
**Handoff Type**: Hard (Task Complete)

---

## 1. Observation

1. **`tests/check-imports.mjs`** (lines 6–11, 53–58, 63–67):
   - Lines 6–11 load `dependencies` and `devDependencies` from `package.json` into `installedDeps`:
     ```javascript
     const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
     const installedDeps = new Set([
       ...Object.keys(packageJson.dependencies || {}),
       ...Object.keys(packageJson.devDependencies || {}),
       'react', 'react/jsx-runtime', 'react-dom', 'react-dom/client'
     ]);
     ```
   - Lines 53–58 extract package names via `spec.split('/')[0]` (or scoped package `@scope/pkg`) and test `installedDeps.has(pkgName)`.
   - Lines 63–67 log errors via `console.error` if `unresolvedImports.length > 0`, but do **not** invoke `process.exit(1)`. The script exits with exit code `0` even if imports are broken.
   - The script does not actively check that the 4 new Milestone 6 packages (`framer-motion`, `sonner`, `clsx`, `tailwind-merge`) are declared in `package.json` or present in `node_modules`.

2. **`tests/run-stress-tests.mjs`** (lines 23–26, 56–63):
   - Line 24 defines the Rollup external array for the Vite SSR bundle:
     ```javascript
     rollupOptions: {
       external: ['react', 'react-dom', 'react-dom/server', 'react-router-dom', '@tanstack/react-query', 'lucide-react', 'react-hot-toast', 'axios', 'react-dropzone'],
     },
     ```
   - Lines 57–62 invoke four challenger suites via `spawnSync`:
     ```javascript
     const challengerSuites = [
       'tests/challenger-m1-stress.mjs',
       'tests/challenger-m2-charts-stress.mjs',
       'tests/challenger-m2-table-stress.mjs',
       'tests/challenger-m3-upload-stress.mjs',
     ];
     ```

3. **Challenger Stress Harnesses**:
   - `tests/challenger-m2-charts-stress.mjs` lines 53–64 defines its own `vite.build({ ssr: true, rollupOptions: { external: [...] } })` with the exact same 9 external packages.
   - `tests/challenger-m2-table-stress.mjs` lines 31–41 defines its own `vite.build` with the exact same 9 external packages.
   - `tests/challenger-m3-upload-stress.mjs` lines 53–64 defines its own `vite.build` with the exact same 9 external packages.

4. **`package.json`**:
   - Currently lists 7 production dependencies (`react`, `react-dom`, `react-router-dom`, `@tanstack/react-query`, `axios`, `react-dropzone`, `lucide-react`, `react-hot-toast`). `framer-motion`, `sonner`, `clsx`, and `tailwind-merge` are being installed in Milestone 6.

---

## 2. Logic Chain

1. **Import Checking Logic**:
   - From Observation 1, `check-imports.mjs` splits specifiers on `/`, so `clsx`, `framer-motion`, `sonner`, and `tailwind-merge` (and any subpaths like `framer-motion/dom` or `clsx/lite`) will resolve correctly once added to `package.json`.
   - However, because the script only evaluates imports that already exist in `src/`, if M6 dependencies are omitted from `package.json`, `check-imports.mjs` will not detect the omission until a component imports them. Adding a proactive `requiredM6Deps` assertion guarantees that the M6 dependency setup is enforced.
   - Because lines 63–67 lack `process.exit(1)`, unresolved imports currently fail silently from an exit-code perspective. Adding `process.exit(1)` turns `check-imports.mjs` into an enforced gate.

2. **Vite SSR Bundler Logic**:
   - From Observation 2, Vite compiles `component-harness.jsx` in SSR mode with `rollupOptions.external`.
   - Packages in `external` are retained as native ESM `import` statements and resolved at runtime by Node.js from `node_modules`.
   - Packages omitted from `external` are inlined by Rollup into the SSR bundle. Inlining `framer-motion` or `sonner` into an SSR bundle where `react` is externalized causes React context dispatcher conflicts, CSS resolution failures, and massive bundle bloat.
   - Node.js safely executes `clsx`, `tailwind-merge`, `framer-motion` (in SSR mode `motion.div` renders static markup), and `sonner` (`<Toaster />` emits minimal SSR container).
   - Therefore, adding `framer-motion`, `sonner`, `clsx`, and `tailwind-merge` to `rollupOptions.external` ensures clean, warning-free bundling and native ESM execution in Node.

3. **Challenger Suite Alignment Logic**:
   - From Observation 3, `run-stress-tests.mjs` spawns `challenger-m2-charts-stress.mjs`, `challenger-m2-table-stress.mjs`, and `challenger-m3-upload-stress.mjs`.
   - If any component tested by those suites (e.g. `ClaimsTable.jsx` using `clsx` or `DashboardCharts.jsx` using `clsx`/`framer-motion`) imports new dependencies, omitting those packages from the child suites' `external` arrays will cause those child suites to fail with exit code 1, which in turn causes `run-stress-tests.mjs` to fail.
   - Therefore, all 4 test scripts must have their `external` arrays updated identically.

---

## 3. Caveats

- Node.js version must support ES Modules (Node 18+ or 20+; current workspace is running Node 20+).
- In `framer-motion`, complex layout animations or gestures only execute client-side; during `renderToStaticMarkup` in SSR stress tests, static HTML is emitted, which satisfies all SSR assertions without requiring a browser DOM.
- If `sonner` styles (`import 'sonner/dist/styles.css'` or similar) are imported directly in JS files, Vite in SSR mode might require Rollup to ignore CSS imports or treat CSS as external. However, in ClaimGuard AI, styles are imported in `src/index.css` or `src/App.jsx`.

---

## 4. Conclusion

1. **`tests/check-imports.mjs`**: Update to:
   - Proactively validate the declaration of `framer-motion`, `sonner`, `clsx`, and `tailwind-merge` in `package.json`.
   - Check physical existence in `node_modules`.
   - Add `process.exit(1)` when errors or unresolved imports exist.
2. **`tests/run-stress-tests.mjs`**: Add `'framer-motion'`, `'sonner'`, `'clsx'`, and `'tailwind-merge'` to line 24 `rollupOptions.external`.
3. **Child Challenger Suites**: Synchronously add `'framer-motion'`, `'sonner'`, `'clsx'`, and `'tailwind-merge'` to the `rollupOptions.external` arrays of:
   - `tests/challenger-m2-charts-stress.mjs` (line 53)
   - `tests/challenger-m2-table-stress.mjs` (line 31)
   - `tests/challenger-m3-upload-stress.mjs` (line 53)
4. **Verification Test Checklist**: A comprehensive 6-phase checklist has been formalized in `report.md`.

---

## 5. Verification Method

To independently verify the tooling and test runner updates:

1. **Check Import Validation**:
   ```bash
   node tests/check-imports.mjs
   ```
   *Expected*: Passes with exit code 0, confirms all 4 M6 dependencies are declared and installed, and reports 0 unresolved imports.

2. **Check Circular Dependencies**:
   ```bash
   node tests/check-circular-deps.mjs
   ```
   *Expected*: Zero circular dependencies found.

3. **Run Master Automated E2E Suite**:
   ```bash
   npm test
   # or
   node tests/runner.mjs
   ```
   *Expected*: 72/72 tests passing (Tier 1: 28/28, Tier 2: 22/22, Tier 3: 12/12, Tier 4: 10/10), 0 failures.

4. **Run Stress & Challenger Test Suites**:
   ```bash
   node tests/run-stress-tests.mjs
   ```
   *Expected*:
   - Component Stress Tests: 41 Passed, 0 Failed.
   - Challenger M1: Exit code 0, 0 defects.
   - Challenger M2 Charts: Exit code 0, 0 defects.
   - Challenger M2 Table: Exit code 0, 0 defects.
   - Challenger M3 Upload: Exit code 0, 0 defects.

5. **Run Production Build & Design Token Verification**:
   ```bash
   npm run build
   node tests/token-resolver.test.mjs
   ```
   *Expected*: Clean Vite build in `dist/` and 100% token resolution in generated CSS.

*Invalidation Conditions*:
- Any unresolved package error from `check-imports.mjs`.
- Vite Rollup bundler warning or failure regarding `framer-motion`, `sonner`, `clsx`, or `tailwind-merge` during SSR compilation.
- Any failure in the 72 master tests or 41 SSR stress tests.
