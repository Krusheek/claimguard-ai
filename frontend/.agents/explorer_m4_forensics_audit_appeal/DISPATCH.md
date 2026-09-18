## 2026-09-17T19:10:23Z
You are explorer_m4_forensics_audit_appeal (teamwork_preview_explorer).
Your working directory is: c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\.agents\explorer_m4_forensics_audit_appeal
Your task: Investigate and design the technical specifications for Feature 14 (Forensics Lab), Feature 15 (Audit Trail), and Feature 16 (Grievance Appeal Generator).

MANDATORY INPUTS TO READ:
1. c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\.agents\ORIGINAL_REQUEST.md
2. c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\.agents\orchestrator_2\PROJECT.md
3. Existing code in `src/pages/Analysis.jsx`, `src/services/api.js`, `src/services/mockData.js`, `src/types/index.ts`

SCOPE & RESPONSIBILITIES:
- Design `src/components/analysis/ForensicsLab.jsx` (Feature 14):
  * ELA (Error Level Analysis) tamper meter: Pure SVG circular gauge (0-100) with dynamic needle/arc, risk level pill, and metadata inspection (EXIF, compression anomalies).
  * Heatmap viewer: Interactive toggle between original document view and forensic noise heatmap overlay.
  * CGHS Tariff Benchmark Comparator: Procedure charges vs CGHS official rate bar chart with variance percentage.
  * Clinical Consistency Matrix: Diagnostic code (ICD-10) vs procedure/medication consistency check.
- Design `src/components/analysis/AuditTimeline.jsx` (Feature 15):
  * Cryptographic SHA-256 block ledger timeline.
  * Event blocks: Document Ingestion -> OCR -> NER -> Rule Engine -> Forensics Scan -> Ledger Commit.
  * SHA-256 hash chain verification badge, block hash display, previous hash, timestamp, and copy hash button.
- Design `src/components/analysis/AppealLetter.jsx` (Feature 16):
  * Formal legal grievance letterhead format addressed to Insurer / TPA Grievance Redressal Officer.
  * Embedded IRDAI circular citations, claim specifics, and monetary dispute breakdown.
  * Action controls: Copy to Clipboard, Print / PDF format view, Editable textarea draft.
- Design 4-tab workspace scaffolding in `src/pages/Analysis.jsx`:
  * Tab 1: Financial Reconciliation & Rule Verdicts
  * Tab 2: Digital Forensics & Fraud Lab
  * Tab 3: Cryptographic Audit Trail
  * Tab 4: Legal Appeal & Grievance Generator
- Provide ready-to-implement JSX templates and prop contracts.

OUTPUT REQUIREMENTS:
- Write comprehensive blueprint to: c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\.agents\explorer_m4_forensics_audit_appeal\handoff.md
- Send message back to parent when done.
