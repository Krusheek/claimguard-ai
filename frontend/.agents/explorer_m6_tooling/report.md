# Milestone 6: Tooling & Test Runner Alignment — Technical Investigation & Formulation Report

**Author**: `explorer_m6_tooling`  
**Working Directory**: `c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\.agents\explorer_m6_tooling`  
**Date**: 2026-09-18  
**Scope**: Milestone 6 (Tooling & Test Runner Alignment)  
**Target Files**:
- `tests/check-imports.mjs`
- `tests/run-stress-tests.mjs`
- `tests/challenger-m2-charts-stress.mjs`
- `tests/challenger-m2-table-stress.mjs`
- `tests/challenger-m3-upload-stress.mjs`

---

## 1. Executive Summary

As ClaimGuard AI elevates its frontend architecture with **Framer Motion** (hardware-accelerated page transitions, contextual drawer, upload stepper physics), **Sonner** (stacked toast notifications), **clsx**, and **tailwind-merge** (utility class composition), the test runner and build tooling must be updated to seamlessly support and validate these new dependencies.

This technical investigation analyzes the static import validation harness (`tests/check-imports.mjs`), the SSR stress test bundling pipeline (`tests/run-stress-tests.mjs` and the three challenger stress harnesses), and establishes the exact post-Milestone-6 verification test checklist.

### Core Discoveries:
1. **`tests/check-imports.mjs`**:
   - Parses package specifiers by taking the top-level segment (`spec.split('/')[0]`) or scoped segment (`@scope/pkg`).
   - Resolves against `installedDeps`, which aggregates `dependencies` and `devDependencies` from `package.json`.
   - **Gaps Identified**:
     - Passive resolution: It only checks if *existing imports* in `src/` are declared. It does not actively assert that the 4 mandatory Milestone 6 packages (`framer-motion`, `sonner`, `clsx`, `tailwind-merge`) are declared in `package.json` and physically present in `node_modules`.
     - Non-zero exit code missing: When `unresolvedImports.length > 0`, the script logs `console.error` but exits with status code `0`, allowing broken imports to pass through CI without failing the process.
2. **`tests/run-stress-tests.mjs` & Vite SSR Bundling**:
   - Uses `vite.build({ ssr: true, lib: ... rollupOptions: { external: [...] } })` to compile `tests/component-harness.jsx` into an ES module loaded directly into Node.js via dynamic `import()`.
   - Line 24 specifies the `external` array. Omitting `framer-motion`, `sonner`, `clsx`, and `tailwind-merge` forces Rollup to attempt inlining them, which causes React hook dispatcher mismatches, CSS asset resolution failures (e.g. Sonner styles), and severe SSR bundle bloat.
   - **Critical Cascading Discovery**: `node tests/run-stress-tests.mjs` directly invokes three child stress suites:
     - `tests/challenger-m2-charts-stress.mjs`
     - `tests/challenger-m2-table-stress.mjs`
     - `tests/challenger-m3-upload-stress.mjs`  
     Each of these three files has its **own independent `vite.build` call with duplicate `rollupOptions.external` arrays**! If any component tested in those suites imports `clsx`, `tailwind-merge`, `sonner`, or `framer-motion`, omitting them from these child external arrays will fail the child suite, thereby failing the entire stress test runner.
3. **Post-M6 Verification Suite**:
   - A structured 6-phase test checklist covers static integrity, circular dependency prevention, the 72-spec master E2E suite, 41-spec component SSR stress tests, 4 challenger suites, production Vite build, and Tailwind design token resolution.

---

## 2. In-Depth Analysis: `tests/check-imports.mjs`

### 2.1 Current Implementation Architecture
`tests/check-imports.mjs` performs AST-like regex scanning across all `.js`, `.jsx`, `.ts`, `.tsx`, and `.css` files in `src/`:

```javascript
// Current lines 6-11
const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
const installedDeps = new Set([
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.devDependencies || {}),
  'react', 'react/jsx-runtime', 'react-dom', 'react-dom/client'
]);
```

For each non-relative import (e.g., `import { motion } from 'framer-motion'`):
```javascript
// Current lines 53-58
} else {
  // Package import (e.g. 'lucide-react', 'react-router-dom')
  const pkgName = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];
  if (!installedDeps.has(pkgName)) {
    unresolvedImports.push({ file: path.relative(projectRoot, file), spec, type: 'package' });
  }
}
```

### 2.2 Validation Behavior for New Dependencies
- **`framer-motion`**: Specifier `'framer-motion'` or subpath `'framer-motion/dom'` extracts `pkgName = 'framer-motion'`. Matches `installedDeps.has('framer-motion')`.
- **`sonner`**: Specifier `'sonner'` or `'sonner/dist/styles.css'` extracts `pkgName = 'sonner'`. Matches `installedDeps.has('sonner')`.
- **`clsx`**: Specifier `'clsx'` or `'clsx/lite'` extracts `pkgName = 'clsx'`. Matches `installedDeps.has('clsx')`.
- **`tailwind-merge`**: Specifier `'tailwind-merge'` extracts `pkgName = 'tailwind-merge'`. Matches `installedDeps.has('tailwind-merge')`.

### 2.3 Identified Weaknesses & Formulated Fixes
1. **Passive Validation Only**:
   If a developer has not yet added an import statement for a new package in `src/`, `check-imports.mjs` does not verify whether `package.json` actually declared `framer-motion`, `sonner`, `clsx`, and `tailwind-merge`.
   *Fix*: Add an explicit declaration check asserting all required Milestone 6 dependencies are present in `package.json`.
2. **Missing Disk Verification (`node_modules`)**:
   Declaring a dependency in `package.json` does not guarantee it was installed via `npm install`.
   *Fix*: Check `fs.existsSync(path.join(projectRoot, 'node_modules', pkgName))` to verify physical installation.
3. **Process Exit Code Defect**:
   Lines 63–67 log errors to `console.error` but never call `process.exit(1)`.
   *Fix*: Explicitly invoke `process.exit(1)` when any unresolved imports or missing dependencies are discovered.

### 2.4 Formulated Update for `tests/check-imports.mjs`

```javascript
import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve('.');
const srcDir = path.join(projectRoot, 'src');
const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
const installedDeps = new Set([
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.devDependencies || {}),
  'react', 'react/jsx-runtime', 'react-dom', 'react-dom/client'
]);

// Mandatory Milestone 6 dependencies that must be declared in package.json
const requiredM6Deps = [
  'framer-motion',
  'sonner',
  'clsx',
  'tailwind-merge'
];

let hasErrors = false;

// 1. Proactive check: Verify Milestone 6 dependencies in package.json
console.log('Validating required Milestone 6 dependencies...');
const missingM6Deps = requiredM6Deps.filter(dep => !installedDeps.has(dep));
if (missingM6Deps.length > 0) {
  console.error(`❌ Missing required Milestone 6 dependencies in package.json:`, missingM6Deps);
  hasErrors = true;
} else {
  console.log(`✔ All required Milestone 6 dependencies declared: ${requiredM6Deps.join(', ')}`);
}

// 2. Physical check: Verify presence in node_modules
const missingNodeModules = requiredM6Deps.filter(dep => {
  const depPath = path.join(projectRoot, 'node_modules', dep);
  return !fs.existsSync(depPath);
});
if (missingNodeModules.length > 0) {
  console.error(`❌ Milestone 6 dependencies missing from node_modules (run npm install):`, missingNodeModules);
  hasErrors = true;
} else {
  console.log('✔ All required Milestone 6 packages verified in node_modules');
}

function getAllFiles(dir, exts = ['.js', '.jsx', '.ts', '.tsx', '.css']) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAllFiles(full, exts));
    } else if (exts.some(ext => entry.name.endsWith(ext))) {
      files.push(full);
    }
  }
  return files;
}

const allFiles = getAllFiles(srcDir);
const unresolvedImports = [];

// 3. Scan all import and export statements in src/
for (const file of allFiles) {
  if (file.endsWith('.css')) continue;
  const code = fs.readFileSync(file, 'utf8');
  const dir = path.dirname(file);
  const importMatches = code.matchAll(/(?:import\s+(?:.*?\s+from\s+)?|export\s+(?:.*?\s+from\s+)?|import\()(['"])([^'"]+)\1/g);

  for (const m of importMatches) {
    const spec = m[2];
    if (spec.startsWith('.')) {
      // Relative import resolution
      let resolved = path.resolve(dir, spec);
      let exists = false;
      if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
        const candidates = ['.js', '.jsx', '.ts', '.tsx', '.css'].map(ext => path.join(resolved, `index${ext}`));
        exists = candidates.some(c => fs.existsSync(c));
      } else {
        const candidates = ['', '.js', '.jsx', '.ts', '.tsx', '.css'].map(ext => resolved + ext);
        exists = candidates.some(c => fs.existsSync(c) && !fs.statSync(c).isDirectory());
      }
      if (!exists) {
        unresolvedImports.push({ file: path.relative(projectRoot, file), spec, type: 'relative' });
      }
    } else {
      // Package import resolution
      const pkgName = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];
      if (!installedDeps.has(pkgName)) {
        unresolvedImports.push({ file: path.relative(projectRoot, file), spec, type: 'package' });
      }
    }
  }
}

console.log(`Checked all import specs across ${allFiles.length} files in src/`);
if (unresolvedImports.length === 0) {
  console.log('✅ All imports resolve successfully to existing files or installed packages!');
} else {
  console.error(`❌ Found ${unresolvedImports.length} unresolved imports:`, unresolvedImports);
  hasErrors = true;
}

if (hasErrors) {
  process.exit(1);
}
```

---

## 3. In-Depth Analysis: `tests/run-stress-tests.mjs` & Vite SSR Bundling

### 3.1 Vite SSR Bundling Mechanism
`tests/run-stress-tests.mjs` executes Vite in library SSR mode:
```javascript
await build({
  root: projectRoot,
  build: {
    ssr: true,
    lib: {
      entry: path.join(projectRoot, 'tests', 'component-harness.jsx'),
      formats: ['es'],
      fileName: 'component-harness',
    },
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      external: [ ... ],
    },
  },
});
```

The output file `node_modules/.stress-test-bundle/component-harness.js` is subsequently loaded in the Node.js runtime:
```javascript
const bundlePath = path.join(outDir, 'component-harness.js');
const { runComponentTests } = await import(`file://${bundlePath}`);
const results = runComponentTests();
```

### 3.2 Consequences of External vs Inlined Packages
| Handling Mode | Vite/Rollup Behavior | Node.js Runtime Behavior | Risk / Failure Mode |
|---|---|---|---|
| **Omitted from `external`** | Rollup attempts to bundle module and all its internal sub-dependencies into `component-harness.js`. | Inlines duplicate React dispatcher bindings or attempts to evaluate browser globals. | **Critical Failure**: React hook mismatch (`Cannot read properties of null (reading 'useContext')`), CSS import failures (`sonner/dist/styles.css`), Rollup build timeout/memory bloat. |
| **Included in `external`** | Rollup preserves `import { ... } from 'pkg'` statements verbatim in the output bundle. | Node's native ESM module loader resolves the package directly from `node_modules`. | **Clean Execution**: Node runs the package's native ESM entry point. `clsx` and `tailwind-merge` run as pure string functions. `framer-motion` renders standard markup in SSR. `sonner` returns inert SSR containers. |

### 3.3 Node SSR Runtime Compatibility
1. **`clsx` & `tailwind-merge`**:
   Pure JavaScript classname concatenation and deduplication functions. Zero browser DOM dependencies. Execute synchronously in Node with near-zero overhead.
2. **`framer-motion`**:
   Framer Motion is engineered for isomorphic SSR (Next.js, Remix). During `renderToStaticMarkup`, `<motion.div>` strips animation physics props and renders standard HTML `<div>` tags with static inline styles and classes. It does not touch `window`, `document`, or `requestAnimationFrame` during server markup generation.
3. **`sonner`**:
   The `<Toaster />` component in Sonner emits a minimal semantic container in SSR without throwing `window is undefined` exceptions. `toast.success()` and `toast.error()` dispatch to internal event buses safely.

### 3.4 Critical Finding: Child Challenger Stress Suites
`tests/run-stress-tests.mjs` executes four challenger suites via `spawnSync` at lines 57–62:
```javascript
const challengerSuites = [
  'tests/challenger-m1-stress.mjs',
  'tests/challenger-m2-charts-stress.mjs',
  'tests/challenger-m2-table-stress.mjs',
  'tests/challenger-m3-upload-stress.mjs',
];
```

Three of these suites compile their own Vite SSR bundles:
1. `tests/challenger-m2-charts-stress.mjs` (compiles `challenger-m2-charts-harness.jsx`, importing `DashboardCharts.jsx` and `MetricCard.jsx`)
2. `tests/challenger-m2-table-stress.mjs` (compiles `ClaimsTable.jsx`)
3. `tests/challenger-m3-upload-stress.mjs` (compiles `challenger-m3-upload-harness.jsx`, importing `BatchDropzone.jsx`, `DocumentCard.jsx`, and `ReadinessCheck.jsx`)

**Every one of these three files contains a hardcoded `rollupOptions.external` array on line 53, line 31, and line 53 respectively!**  
If `ClaimsTable.jsx` or `BatchDropzone.jsx` uses `clsx` or `sonner`, and those packages are only added to `run-stress-tests.mjs` but **not** to the child challenger test files, the child suites will throw Vite bundler errors when invoked by `run-stress-tests.mjs`, failing the entire stress pipeline.

### 3.5 Formulated Code Updates

#### A. `tests/run-stress-tests.mjs` (Lines 23–26)
```diff
       rollupOptions: {
-        external: ['react', 'react-dom', 'react-dom/server', 'react-router-dom', '@tanstack/react-query', 'lucide-react', 'react-hot-toast', 'axios', 'react-dropzone'],
+        external: [
+          'react',
+          'react-dom',
+          'react-dom/server',
+          'react-router-dom',
+          '@tanstack/react-query',
+          'lucide-react',
+          'react-dropzone',
+          'react-hot-toast',
+          'axios',
+          'framer-motion',
+          'sonner',
+          'clsx',
+          'tailwind-merge',
+        ],
       },
```

#### B. `tests/challenger-m2-charts-stress.mjs` (Lines 52–64)
```diff
       rollupOptions: {
         external: [
           'react',
           'react-dom',
           'react-dom/server',
           'react-router-dom',
           '@tanstack/react-query',
           'lucide-react',
           'react-hot-toast',
           'axios',
           'react-dropzone',
+          'framer-motion',
+          'sonner',
+          'clsx',
+          'tailwind-merge',
         ],
       },
```

#### C. `tests/challenger-m2-table-stress.mjs` (Lines 30–42)
```diff
     rollupOptions: {
       external: [
         'react',
         'react-dom',
         'react-dom/server',
         'react-router-dom',
         '@tanstack/react-query',
         'lucide-react',
         'react-hot-toast',
         'axios',
         'react-dropzone',
+        'framer-motion',
+        'sonner',
+        'clsx',
+        'tailwind-merge',
       ],
     },
```

#### D. `tests/challenger-m3-upload-stress.mjs` (Lines 52–64)
```diff
       rollupOptions: {
         external: [
           'react',
           'react-dom',
           'react-dom/server',
           'react-router-dom',
           '@tanstack/react-query',
           'lucide-react',
           'react-hot-toast',
           'axios',
           'react-dropzone',
+          'framer-motion',
+          'sonner',
+          'clsx',
+          'tailwind-merge',
         ],
       },
```

---

## 4. Exact Post-Milestone 6 Verification Test Checklist

This checklist must be executed sequentially after Milestone 6 changes are applied to confirm zero regressions, exact token resolution, and 100% test pass rates across all tiers and stress suites.

```
================================================================================
CLAIMGUARD AI — POST-MILESTONE 6 VERIFICATION TEST CHECKLIST
================================================================================
```

### Phase 1: Dependency Integrity & Node Modules Validation
- [ ] **Check 1.1: `package.json` Dependencies Check**
  - **Command**: Inspect `package.json` `dependencies` block
  - **Assertion**:
    - `"framer-motion"` is declared (e.g. `^11.15.0` or `^11.x`)
    - `"sonner"` is declared (e.g. `^1.7.1` or `^1.x`)
    - `"clsx"` is declared (e.g. `^2.1.1` or `^2.x`)
    - `"tailwind-merge"` is declared (e.g. `^2.5.5` or `^2.x`)
  - **Expected Outcome**: All 4 dependencies exist with valid semver ranges.

- [ ] **Check 1.2: Physical Installation Verification**
  - **Command**: `ls node_modules/framer-motion node_modules/sonner node_modules/clsx node_modules/tailwind-merge`
  - **Expected Outcome**: All 4 directories exist with their corresponding `package.json` files.

---

### Phase 2: Static Analysis & Import Resolution
- [ ] **Check 2.1: Static Import Resolution Check**
  - **Command**: `node tests/check-imports.mjs`
  - **Expected Output**:
    ```
    Validating required Milestone 6 dependencies...
    ✔ All required Milestone 6 dependencies declared: framer-motion, sonner, clsx, tailwind-merge
    ✔ All required Milestone 6 packages verified in node_modules
    Checked all import specs across X files in src/
    ✅ All imports resolve successfully to existing files or installed packages!
    ```
  - **Exit Code**: `0`

- [ ] **Check 2.2: Circular Dependency Detection**
  - **Command**: `node tests/check-circular-deps.mjs`
  - **Expected Output**:
    ```
    Scanned X modules in src/
    ✅ ZERO circular dependencies found in src/!
    ```
  - **Exit Code**: `0`

---

### Phase 3: Master E2E Automated Test Suite (Tiers 1–4)
- [ ] **Check 3.1: Run Full Master Test Runner**
  - **Command**: `npm test` (or `node tests/runner.mjs`)
  - **Coverage Verification**:
    - **Tier 1 (Feature Coverage & Contracts)**: 28 tests passing (FEAT-01 through FEAT-16, API contracts, status badge tokens, currency formatters)
    - **Tier 2 (Boundary Cases & Adversarial)**: 22 tests passing (BOUND-01 through BOUND-12, zero-byte uploads, extreme monetary values, deep object corruption)
    - **Tier 3 (Combinations & Cross-Module)**: 12 tests passing (COMB-01 through COMB-06, tripartite document reconciliation, multi-claim filtering)
    - **Tier 4 (Real-World Scenarios)**: 10 tests passing (SCEN-01 through SCEN-04, end-to-end audit lifecycle, high-load triage)
  - **Target Metric**: **72 Passed, 0 Failed (100%)**
  - **Exit Code**: `0`

---

### Phase 4: Component SSR Stress Tests
- [ ] **Check 4.1: Vite SSR Bundle & Component Stress Execution**
  - **Command**: `node tests/run-stress-tests.mjs` (First half: `component-harness.jsx`)
  - **Vite Bundler Assertions**:
    - Build output directory `node_modules/.stress-test-bundle` created cleanly.
    - Zero `(!) Unresolved dependencies` Rollup warnings for `framer-motion`, `sonner`, `clsx`, `tailwind-merge`.
    - No inlined CSS or React duplicate dispatcher warnings.
  - **Component Tests Verified (41 tests)**:
    - StatusBadge stress tests (12 tests)
    - MetricCard stress tests (8 tests)
    - Skeletons stress tests (4 tests)
    - ErrorState stress tests (3 tests)
    - Topbar stress tests (2 tests)
    - App component shell stress tests (3 tests: `/`, `/upload`, `/analysis`)
    - DashboardCharts stress tests (5 tests)
    - ClaimsTable stress tests (4 tests)
  - **Target Metric**: **41 Passed, 0 Failed**

---

### Phase 5: Adversarial Challenger Stress Suites
Executed automatically as part of `tests/run-stress-tests.mjs` or run individually:

- [ ] **Check 5.1: Challenger M1 Stress Suite**
  - **Command**: `node tests/challenger-m1-stress.mjs`
  - **Assertions**:
    - Normalizer robustness under degenerate payloads (null, undefined, malformed objects)
    - In-memory mutation safety (shared reference defenses)
    - Offline mock fallback behavior for all 11 API endpoints
    - TypeScript schema conformance against `src/types/index.ts`
  - **Exit Code**: `0`

- [ ] **Check 5.2: Challenger M2 Charts & Visualizations Stress Suite**
  - **Command**: `node tests/challenger-m2-charts-stress.mjs`
  - **Assertions**:
    - SVG Donut chart when total count = 0 (divide-by-zero checks pass, 0 NaN)
    - 100% single category donut gap artifacts
    - `WATERFALL-02` boundary test: Disallowed exceeding billed amount and negative recoverable amounts handled without NaN or inverted bar crashes.
    - `SparklineCurve` boundary handling: `[]`, `[42]`, `[10, 10, 10]`, negatives, null/undefined.
  - **Exit Code**: `0`

- [ ] **Check 5.3: Challenger M2 Table & Dashboard Stress Suite**
  - **Command**: `node tests/challenger-m2-table-stress.mjs`
  - **Assertions**:
    - Empty and null/undefined claims prop resilience
    - Large dataset performance & pagination stability (1,500+ claims)
    - Search edge cases (regex characters, HTML/XSS, SQLi strings)
    - Multi-column sorting stability
    - CSV export formula sanitization (formula prefix protection: `=`, `+`, `-`, `@`)
  - **Exit Code**: `0`

- [ ] **Check 5.4: Challenger M3 Upload Studio Stress Suite**
  - **Command**: `node tests/challenger-m3-upload-stress.mjs`
  - **Assertions**:
    - File size boundaries: 0-byte reject, 25MB exact pass, 25MB + 1 byte reject, NaN/negative reject.
    - MIME type & extension whitelist (PDF, JPEG, PNG, TIFF allowed; `.exe`, `.svg`, `.zip`, `.js` rejected).
    - MIME spoofing prevention.
    - Filename auto-tagging heuristics.
    - Apollo claim tripartite document reconciliation.
  - **Exit Code**: `0`

---

### Phase 6: Production Build & Tailwind Token Resolution
- [ ] **Check 6.1: Vite Production Build**
  - **Command**: `npm run build`
  - **Assertions**:
    - Output written to `dist/`
    - Zero Rollup syntax or unresolved import errors
    - Bundled CSS and JS assets created in `dist/assets/`
  - **Exit Code**: `0`

- [ ] **Check 6.2: Tailwind Design Token Verification**
  - **Command**: `node tests/token-resolver.test.mjs`
  - **Assertions**:
    - Diffused shadow tokens (`shadow-diffused`, `0 4px 20px rgba(0,0,0,0.03)`) resolve in `dist/assets/*.css`
    - `scale-101` hover transform class resolves in `dist/assets/*.css`
    - All extracted class tokens across components match generated CSS
  - **Exit Code**: `0`

---

## 5. Summary of Recommended Implementation Actions

| File | Action | Details |
|---|---|---|
| `package.json` | Verify/Add Dependencies | Ensure `"framer-motion"`, `"sonner"`, `"clsx"`, `"tailwind-merge"` are declared under `dependencies`. |
| `tests/check-imports.mjs` | Enhance Validation & Exit Code | Add explicit check for `requiredM6Deps`, verify presence in `node_modules`, and add `process.exit(1)` on error. |
| `tests/run-stress-tests.mjs` | Align Rollup `external` Array | Add `'framer-motion'`, `'sonner'`, `'clsx'`, `'tailwind-merge'` to line 24. |
| `tests/challenger-m2-charts-stress.mjs` | Align Rollup `external` Array | Add `'framer-motion'`, `'sonner'`, `'clsx'`, `'tailwind-merge'` to line 53. |
| `tests/challenger-m2-table-stress.mjs` | Align Rollup `external` Array | Add `'framer-motion'`, `'sonner'`, `'clsx'`, `'tailwind-merge'` to line 31. |
| `tests/challenger-m3-upload-stress.mjs` | Align Rollup `external` Array | Add `'framer-motion'`, `'sonner'`, `'clsx'`, `'tailwind-merge'` to line 53. |
| `Verification Run` | Execute Checklist | Run all 6 phases and verify 100% pass across all test suites. |
