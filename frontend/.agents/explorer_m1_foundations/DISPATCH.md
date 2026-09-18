# DISPATCH for explorer_m1_foundations

You are explorer_m1_foundations (teamwork_preview_explorer).
Your working directory: c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\.agents\explorer_m1_foundations
Project root: c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend
Project Plan: c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\.agents\orchestrator_1\PROJECT.md
Original Request: c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\.agents\ORIGINAL_REQUEST.md
Survey Reports:
- c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\.agents\explorer_survey_ux\handoff.md
- c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\.agents\spec_miner_api\handoff.md

Milestone 1 Scope: Foundations, Design System, Shared Components & App Shell
Features:
1. Enterprise Design Tokens & Theme in `tailwind.config.js` and `src/index.css`
2. Unified TypeScript Data Contracts in `src/types/index.ts`
3. Shared Component Library & Skeletons in `src/components/common/` (Topbar, StatusBadge, MetricCard, Skeletons, ErrorState)
4. Enterprise App Shell in `src/App.jsx` with Topbar (breadcrumbs, global claim search, auditor profile, API online status)
5. Resilient API Client & Schema Normalizer in `src/services/api.js` and `src/services/mockData.js`

Task:
Analyze existing code and provide the exact, detailed implementation blueprint for the Worker:
- Exact file paths to create/modify
- Complete Tailwind config extensions
- Complete CSS additions (custom classes, scrollbar, fonts)
- Complete TypeScript type exports in `src/types/index.ts`
- API client normalization functions and mock data fallback
- Layout and JSX structure for `App.jsx`, `Topbar.jsx`, `StatusBadge.jsx`, `MetricCard.jsx`, `Skeletons.jsx`
- Ensure zero breaking changes for existing pages (`Dashboard.jsx`, `Upload.jsx`, `Analysis.jsx`)
Output handoff.md in your working directory and notify the parent orchestrator.

## 2026-09-17T14:51:39Z
<USER_REQUEST>
You are explorer_m1_foundations. Your working directory is c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\.agents\explorer_m1_foundations. Project root is c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend.
Read c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\.agents\ORIGINAL_REQUEST.md, c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\.agents\orchestrator_1\PROJECT.md, and your DISPATCH.md.
Also read handoffs from c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\.agents\explorer_survey_ux\handoff.md and c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\.agents\spec_miner_api\handoff.md.
Investigate and design the exact implementation strategy for Milestone 1:
- Tailwind config enterprise theme extension
- index.css styling and design tokens
- src/types/index.ts contracts
- src/services/api.js resilient normalizer and mockData.js
- src/components/common/ (Topbar, StatusBadge, MetricCard, Skeletons, ErrorState)
- src/App.jsx enterprise shell integration
Write handoff.md with verified blueprint for the worker, and notify the parent orchestrator.
</USER_REQUEST>
