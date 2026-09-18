# Handoff Report: Milestone 6 Dependencies & Token Architecture

## 1. Observation

1. **Workspace Architecture**:
   - `c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\package.json` specifies:
     - React `^18.3.1`, React DOM `^18.3.1`, Vite `^6.0.3`, Tailwind CSS `^3.4.16`.
     - Lines 12–21 currently lack `framer-motion`, `sonner`, `clsx`, and `tailwind-merge`.
     - Root has `package-lock.json` confirming `npm` as the package manager.
2. **Tailwind Configuration**:
   - `c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\tailwind.config.js`:
     - Lines 8–86 define `theme.extend` with `colors`, `fontFamily`, `boxShadow`, `keyframes`, and `animation`.
     - `theme.extend.scale` is absent.
     - `theme.extend.boxShadow` (lines 66–72) currently contains `'xs'`, `'card'`, `'card-hover'`, `'elevation'`, `'inner-subtle'`. It lacks `'diffused'` and `'diffused-hover'`.
3. **CSS Layer Components**:
   - `c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\src\index.css`:
     - Lines 28–55 contain `@layer components` with `.card-enterprise`, `.card-enterprise-hover`, `.font-financial`, `.glass-header`, and `.skeleton-shimmer`.
     - Does not contain `.card-diffused`, `.card-diffused-hover`, or `.border-crisp`.
4. **Utility Functions**:
   - No `src/lib/utils.js` or `cn` helper exists currently in the repository.
5. **Test Runners & External Dependency Handling**:
   - `c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\tests\check-imports.mjs`:
     - Lines 6–11 inspect `package.json` dependencies dynamically. Adding dependencies to `package.json` automatically registers them in `installedDeps`.
   - `c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\tests\run-stress-tests.mjs`:
     - Lines 23–26 bundle SSR tests via Vite/Rollup with hardcoded `rollupOptions.external`:
       ```javascript
       external: ['react', 'react-dom', 'react-dom/server', 'react-router-dom', '@tanstack/react-query', 'lucide-react', 'react-hot-toast', 'axios', 'react-dropzone'],
       ```
       Without adding `framer-motion`, `sonner`, `clsx`, and `tailwind-merge`, any SSR build involving these imports would attempt bundling them into the server runtime and fail.

---

## 2. Logic Chain

1. **Step 1 (Dependency Compatibility)**:
   - Based on Observation 1, the frontend runs on React 18.3.1.
   - `framer-motion` version `^11.18.2` is fully stable with React 18 and Vite 6.
   - `sonner` `^1.7.4`, `clsx` `^2.1.1`, and `tailwind-merge` `^2.6.0` are standard peer-compatible dependencies.
   - Running `npm install framer-motion@^11.18.2 sonner@^1.7.4 clsx@^2.1.1 tailwind-merge@^2.6.0` (or updating `package.json` dependencies directly) resolves all required modules.

2. **Step 2 (Tailwind Token Integration)**:
   - Based on Observation 2, extending `theme.extend` with `scale: { '101': '1.01' }` exposes `scale-101` and `hover:scale-101` throughout the project.
   - Adding `'diffused': '0 4px 20px 0 rgba(0, 0, 0, 0.03)'` and `'diffused-hover': '0 8px 30px 0 rgba(0, 0, 0, 0.06)'` exposes `shadow-diffused` and `shadow-diffused-hover`.

3. **Step 3 (Global Stylesheet Standard)**:
   - Based on Observation 3, adding `.card-diffused`, `.card-diffused-hover`, and `.border-crisp` under `@layer components` in `src/index.css` provides reusable, token-backed CSS utilities that conform to enterprise healthtech UI specs.

4. **Step 4 (Component Helper & SSR Shielding)**:
   - Based on Observation 4 and 5, adding `src/lib/utils.js` provides `cn(...)` for safe class merging.
   - Adding `framer-motion`, `sonner`, `clsx`, and `tailwind-merge` to `rollupOptions.external` in `tests/run-stress-tests.mjs` shields SSR stress execution from unbundled node module errors.

---

## 3. Caveats

- **Network Dependency**: `npm install` requires network access or local npm cache. If offline, the dependencies must exist in the cache or local node_modules directory.
- **Sonner Toast Replacement Timing**: Installing `sonner` in Milestone 6 is purely foundational. Actual migration of the 10 files using `react-hot-toast` is explicitly assigned to Milestone 7 (Feature 5) in `PROJECT.md`.
- **Framer Motion React 19 vs 18**: Framer Motion 12 has changes targeting React 19; therefore, pinning `framer-motion` to `^11.18.2` guarantees zero peer dependency friction with React 18.3.1.

---

## 4. Conclusion

Milestone 6 implementation plan is completely specified with exact file locations, line ranges, and drop-in code blocks:
1. Install `framer-motion@^11.18.2`, `sonner@^1.7.4`, `clsx@^2.1.1`, and `tailwind-merge@^2.6.0` via npm.
2. Extend `theme.extend.scale` and `theme.extend.boxShadow` in `tailwind.config.js`.
3. Add `.card-diffused`, `.card-diffused-hover`, and `.border-crisp` to `src/index.css`.
4. Create `src/lib/utils.js` for class merging.
5. Update `tests/run-stress-tests.mjs` external list.
Detailed technical plan is documented in `c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\.agents\explorer_m6_deps\report.md`.

---

## 5. Verification Method

An independent worker or reviewer can verify the implementation using the following sequential steps:

1. **Verify Package Installation**:
   - Inspect `package.json` dependencies:
     ```bash
     node -e "const p = require('./package.json'); console.log(p.dependencies['framer-motion'], p.dependencies['sonner'], p.dependencies['clsx'], p.dependencies['tailwind-merge']);"
     ```
   - Must output non-undefined version strings for all 4 packages.

2. **Verify Static Imports**:
   - Run: `node tests/check-imports.mjs`
   - Must output: `✅ All imports resolve successfully to existing files or installed packages!`

3. **Verify Build & CSS Token Resolution**:
   - Run: `npm run build`
   - Run: `node tests/token-resolver.test.mjs`
   - Must output: `All tokens resolved successfully!`

4. **Verify Test Suites**:
   - Run: `npm test` (`node tests/runner.mjs`)
   - Must report all 4 tiers passing.
   - Run: `node tests/run-stress-tests.mjs`
   - Must successfully build the SSR test bundle and report 0 failures.
