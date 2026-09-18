## 2026-09-17T18:52:58Z
You are explorer_m3_upload (teamwork_preview_explorer).
Your working directory is: c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\.agents\explorer_m3_upload
Your task: Investigate and design the architectural specification for Milestone 3: Upload Studio & UX Polish.

MANDATORY INPUTS TO READ:
1. c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\.agents\ORIGINAL_REQUEST.md (Authoritative user requirements)
2. c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\.agents\orchestrator_2\PROJECT.md (Project specifications)
3. Existing code in:
   - `src/pages/Upload.jsx`
   - `src/services/api.js` (see uploadDocument, createClaim, etc.)
   - `src/types/index.ts`
   - `src/components/common/`

SCOPE & RESPONSIBILITIES:
- Investigate current implementation of `src/pages/Upload.jsx` and identify all limitations.
- Design `src/components/upload/BatchDropzone.jsx`:
  * Dual-mode architecture:
    Mode A: Batch multi-drop (drag 1-3 files simultaneously, auto-tagging doc type based on name pattern: bill, policy, rejection).
    Mode B: Guided stepper (3 distinct slotted drop targets: 1. Hospital Bill, 2. Insurance Policy, 3. Rejection Letter).
  * Mode toggle pill ("Batch Upload" vs "Guided 3-Step").
- Design `src/components/upload/DocumentCard.jsx`:
  * Clean enterprise card displaying document type badge, filename, formatted file size (KB/MB), format chip (PDF/PNG/JPG), extraction status, replace button, and remove button.
- Design `src/components/upload/ReadinessCheck.jsx`:
  * Pre-analysis health check panel displaying:
    * 3 Document completeness indicators (Bill, Policy, Rejection).
    * Preliminary extraction checklist (e.g., Line items identified, Sum insured detected, Disallowance reasons found).
    * Clear CTA button: "Run Claim Forensics & Audit" (disabled until required docs uploaded).
- Design integration into `src/pages/Upload.jsx`:
  * Full state management for documents, upload status, progress, and navigation to `/analysis/:newClaimId`.
- Provide ready-to-implement JSX templates and component prop contracts.

OUTPUT REQUIREMENTS:
- Write comprehensive blueprint to: c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\.agents\explorer_m3_upload\handoff.md
- Send message back to parent with summary and path.
