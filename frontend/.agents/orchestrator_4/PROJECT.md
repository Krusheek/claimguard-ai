# Project: ClaimGuard AI React Frontend — Production Elevation & Hardening

## Architecture
- **Framework**: React 18.3.1 + Vite 6 + Tailwind CSS 3.4
- **Animation & Motion**: Framer Motion (page routing transitions, contextual slide-over drawer, modal dialogs, metric card staggering, upload stepper spring physics)
- **Notification System**: Sonner stacked toasts with pipeline stage tracking
- **Design Tokens**: Inter font family, JetBrains Mono tabular-nums, Tailwind slate-* palette, ultra-soft diffused shadows (`0 4px 20px rgba(0,0,0,0.03)`), `scale-101` micro-interactions
- **Layout Architecture**: 12-column asymmetric Bento Grid for Dashboard, Contextual `ClaimInspectionDrawer` for table triage, 4-tab clinical Forensics hub
- **Code Layout Boundaries**:
  - `src/App.jsx` & `src/components/common/`: Shell, Topbar, StatusBadge, PageMotion, Toaster
  - `src/pages/Dashboard.jsx` & `src/components/dashboard/`: Bento Grid layout, ExecutiveKpiCards, DashboardCharts, ClaimsTable, ClaimInspectionDrawer
  - `src/pages/Upload.jsx` & `src/components/upload/`: BatchDropzone, ReadinessCheck, DocumentCard
  - `src/pages/Analysis.jsx` & `src/components/analysis/`: FinancialDelta, VerdictCard, ForensicsLab, AuditTimeline, AppealLetter
  - `tailwind.config.js` & `src/index.css`: Tokens, diffused shadows, scale-101

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Dependencies & Token Setup | Install framer-motion, sonner, clsx, tailwind-merge; add scale-101, diffused shadows | M6 (DONE) | Survey E1, E2 |
| 2 | Component Edge-Case Hardening | Fix WATERFALL-02 in DashboardCharts; fix SIZE/MIME/TAG in BatchDropzone; safe dates in AuditTimeline; revokeObjectURL in AppealLetter; sanitize CSV in ClaimsTable; prune redundant VerdictCard | M6 (DONE) | Survey E3 |
| 3 | Test Runner Tooling Updates | Update check-imports.mjs and run-stress-tests.mjs for sonner and framer-motion | M6 (DONE) | Survey E2, E3 |
| 4 | Page Routing & Shell Transitions | AnimatePresence and PageMotion in App.jsx for smooth 0-jank navigation | M7 (DONE) | Survey E1 |
| 5 | Sonner Stacked Toast Migration | Replace react-hot-toast across 10 files with Sonner stacked card physics and pipeline tracking | M7 (DONE) | Survey E1, E2 |
| 6 | Skeleton Shimmer Screen Migration | Replace 6 legacy spinning loaders (animate-spin) with pulsing skeleton screens and clinical beacons | M7 (DONE) | Survey E1 |
| 7 | Micro-Interactions & Stepper Physics | scale-101 on hover, soft diffused shadows, spring-damped stepper progress | M7 (DONE) | Survey E1 |
| 8 | Dashboard Bento Grid Architecture | Asymmetric 12-column Bento Grid layout with 5-column hero recovery card & trajectory sparkline | M8 | Survey E2 |
| 9 | Contextual Claim Inspection Drawer | Slide-over drawer with query-param sync (?inspect=CLM-XXXXX) for in-context audit triage | M8 | Survey E1, E2 |
| 10 | Typography & Shadow Polish | Strict Inter hierarchy, muted slate secondary data, 1px crisp borders, diffused elevation | M8 | Survey E2 |
| 11 | Master E2E & Adversarial Hardening | Verify 72/72 tests pass, 41/41 SSR pass, challenger stress suites pass, build pass, auditor CLEAN | M9 | Survey E3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M6 | Core Hardening, Tokens & Dependencies | Install framer-motion/sonner/clsx; update tailwind tokens; fix WATERFALL-02, BatchDropzone edge cases, AuditTimeline date, prune duplicate VerdictCard; update test runners | none | DONE |
| M7 | Motion Architecture, Skeletons & Toasts | Framer-motion page transitions, Sonner stacked toasts across 10 files, eliminate 6 legacy spinning loaders with pulsing skeleton screens, micro-interactions | M6 | DONE |
| M8 | Bento Grid & Contextual Slide-Over Drawer | 12-column asymmetric Bento Grid in Dashboard; ClaimInspectionDrawer with slide-in motion and URL sync; ClaimsTable row click wiring; mobile responsive support | M6, M7 | IN_PROGRESS |
| M9 | Final E2E Verification & Adversarial Hardening | Run all 72 tests, SSR stress suites, static analysis, production build; Reviewer, Challenger, and Forensic Auditor verification | M6, M7, M8 | PLANNED |

## Interface Contracts
### Dashboard ↔ ClaimInspectionDrawer
- Component: `src/components/dashboard/ClaimInspectionDrawer.jsx`
- Props: `claimId` (string | null), `isOpen` (boolean), `onClose` (function), `onNavigateToDossier` (function(claimId)), `claims` (array)
- Query parameter sync: `?inspect=CLM-XXXXX`
- Fallback: Graceful lookup in claims list; skeleton placeholder if claim loading.

### PageMotion ↔ App Routes
- Component: `PageMotion({ children, className })`
- Animation: `initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}`

### BatchDropzone ↔ Validation
- `validateUploadFile(file)` returns `{ valid: boolean, error?: string }`
- Rejects `file.size <= 0`, `file.size > MAX_SIZE`, `isNaN(file.size)`, disallowed extensions, and extension spoofing against MIME type.
