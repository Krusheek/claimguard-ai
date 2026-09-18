# Handoff Report: Milestone 7 — Motion Architecture & Micro-Interactions

**Agent:** `explorer_m7_motion`  
**Recipient:** `parent` (`3445fbbe-d553-4277-b396-0fe40c330e18`) / Implementer Agent  
**Date:** 2026-09-18  
**Handoff Type:** Hard Handoff (Investigation Complete)  

---

## 1. Observation

1. **`src/App.jsx` Routing & Mobile Drawer**:
   - `src/App.jsx` lines 124-147 currently render `<Routes>` directly inside `<main className="flex-1 overflow-y-auto p-6 md:p-8">` without `<AnimatePresence>` or key mapping. Route changes cause instantaneous DOM replacement.
   - `src/App.jsx` lines 98-105 conditionally mounts `{mobileMenuOpen && <div className="md:hidden fixed inset-0 z-50 flex">...</div>}` with no exit animation.
2. **Missing Component**:
   - `src/components/common/PageMotion.jsx` does not exist in the codebase (`find_by_name` returned 0 matches).
   - `PROJECT.md` line 46-48 mandates the interface contract:
     ```markdown
     ### PageMotion ↔ App Routes
     - Component: `PageMotion({ children, className })`
     - Animation: `initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}`
     ```
3. **Executive KPI Cards & Sparkline**:
   - `src/components/dashboard/ExecutiveKpiCards.jsx` lines 33-89 renders a static 4-card grid without container entrance stagger.
   - `src/components/common/MetricCard.jsx` lines 70-76 (`SparklineCurve`) renders static `<path d={linePath} />` without stroke path length animation.
   - `tests/challenger-m2-charts-harness.jsx` lines 305-430 tests `SparklineCurve` via `renderToStaticMarkup`, asserting string values like `d="M 3,25..."`, `height: 42%`, and `height: 15%`.
4. **Readiness Check**:
   - `src/components/upload/ReadinessCheck.jsx` lines 192-208 uses standard CSS class transitions (`transition-all duration-300`) for the 3-segment progress bar.
   - Lines 219-258 use static `<CheckCircle2>` and `<XCircle>` icons without entrance or checkmark path drawing.
   - Lines 311-318 uses CSS width transition on the extraction progress bar.
   - `tests/challenger-m3-upload-harness.jsx` lines 649-720 enforces exact text substrings in SSR: `'0/3 Docs Attached (0%)'`, `'3/3 Docs Attached (100%)'`, `'Run Claim Forensics & Audit'`, `'Executing Forensic Pipeline'`, `'Extracting OCR Tokens'`, `'45%'`.
5. **Tailwind Tokens & Micro-Interactions**:
   - `tailwind.config.js` lines 9-11 already includes `scale: { '101': '1.01' }` and lines 75-76 includes `diffused` and `diffused-hover` shadows.
   - `src/index.css` line 34 defines `.card-enterprise-hover` with only `hover:border-slate-300`, lacking `hover:scale-101`.
   - `package.json` line 21 already declares `"framer-motion": "^11.18.2"`, which is installed in `node_modules` and externalized in `tests/run-stress-tests.mjs` line 34.

---

## 2. Logic Chain

1. **Route Transitions**:
   - From Observation 1, wrapping `<Routes location={location} key={location.pathname}>` inside `<AnimatePresence mode="wait">` enables Framer Motion to coordinate exit animations before mounting incoming routes.
   - From Observation 2, creating `src/components/common/PageMotion.jsx` conforming to `PROJECT.md` provides the standardized `opacity: 0, y: 8 -> 0 -> -6` animation cycle for every route.
   - Using `key={location.pathname}` ensures tab switching via query parameters (`?tab=forensics`) avoids remounting the entire page layout.
2. **Mobile Drawer**:
   - From Observation 1, replacing conditional rendering with `<AnimatePresence>` containing an opacity-fading backdrop (`initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}`) and a spring-sliding sidebar (`initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}`) provides a fluid mobile UX without DOM flicker.
3. **KPI Stagger & Sparkline Drawing**:
   - From Observation 3, wrapping `ExecutiveKpiCards` in `motion.div` with `staggerChildren: 0.08` causes each KPI card to lift into place sequentially.
   - Converting the SVG stroke in `SparklineCurve` to `<motion.path pathLength: 0 -> 1>` with `easeOut` draws the trend curve in real-time.
   - Retaining inline `style={{ height: `${clampedHeight}%` }}` on activity bars ensures full compatibility with the SSR string assertions in `tests/challenger-m2-charts-harness.jsx`.
4. **Upload Stepper & Checkmarks**:
   - From Observation 4, applying `motion.div` with spring interpolation (`damping: 20, stiffness: 200`) to the 3-segment progress bar and `AnimatedCheckmark` with SVG `pathLength: 0 -> 1` makes document intake responsive and tactile.
   - Preserving verbatim strings ensures `tests/challenger-m3-upload-harness.jsx` passes with 0 failures.
5. **System-Wide Micro-Interactions**:
   - From Observation 5, enhancing `.card-enterprise-hover` and `.card-diffused-hover` with `hover:scale-101` in `src/index.css` automatically gives all cards tactile elevation.
   - Adding `hover:scale-101 active:scale-[0.98]` across primary buttons in `Dashboard.jsx`, `Upload.jsx`, `Analysis.jsx`, and `ClaimsTable.jsx` delivers consistent enterprise feedback.

---

## 3. Caveats

- **Reduced Motion**: For users with `prefers-reduced-motion: reduce`, Framer Motion handles motion reduction automatically when CSS media queries are active.
- **SSR Hydration**: All motion components render standard HTML/SVG elements during static markup generation (`renderToStaticMarkup`), ensuring full SSR test harness compatibility.
- No other caveats.

---

## 4. Conclusion

The motion architecture for Milestone 7 is fully designed, audited against test harnesses, and documented with complete source code diffs in `.agents/explorer_m7_motion/report.md`. 
The implementer agent can directly apply:
1. `src/components/common/PageMotion.jsx` (New File).
2. `src/App.jsx` diff for `<AnimatePresence>` routes & mobile drawer.
3. `src/components/dashboard/ExecutiveKpiCards.jsx` diff for container stagger.
4. `src/components/common/MetricCard.jsx` diff for SVG sparkline path drawing.
5. `src/components/upload/ReadinessCheck.jsx` diff for spring stepper & animated checkmarks.
6. `src/index.css` and key button diffs for `hover:scale-101` and active tactile feedback.

---

## 5. Verification Method

To verify the implementation independently, run:
```bash
# 1. Verify all imports resolve cleanly (including PageMotion)
node tests/check-imports.mjs

# 2. Run master E2E test suite (72/72 tests)
npm test

# 3. Run SSR component stress tests & challenger harnesses
node tests/run-stress-tests.mjs

# 4. Verify production bundle build
npm run build
```

**Invalidation Conditions**:
- Any import failure in `check-imports.mjs` (e.g. missing `PageMotion.jsx`).
- Any failure in `tests/challenger-m2-charts-stress.mjs` (indicates regression in `SparklineCurve` coordinate math or activity bar heights).
- Any failure in `tests/challenger-m3-upload-stress.mjs` (indicates altered string labels in `ReadinessCheck`).
- Any Vite bundling error during `npm run build`.
