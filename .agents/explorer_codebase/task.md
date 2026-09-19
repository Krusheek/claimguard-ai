# Task: ClaimGuard AI Codebase Architecture Exploration

## Objective
Thoroughly explore and document the ClaimGuard AI codebase to establish an authoritative baseline of existing features, architecture, modules, models, APIs, and tests.

## Assigned Directory
`c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\explorer_codebase`

## Original Request Reference
`c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\ORIGINAL_REQUEST.md`

## Scope & Key Questions
1. System Architecture:
   - What backend framework is used (FastAPI/Uvicorn)? How is the app structured (`backend/app/main.py`, routers, services, core, models)?
   - What is the frontend structure (if any) and how does it interact with the backend?
2. Existing Fraud Detection & Assessment Capabilities:
   - What fraud rules, anomaly detection, ML/DL models, risk scoring algorithms, and heuristics currently exist?
   - What document extraction (OCR, PDF, image processing) currently exists?
   - What medical coding (ICD-10, CPT, billing checks) or clinical assessment currently exists?
   - What graph/network or temporal analysis currently exists?
3. Test Suite & Runtime Baseline:
   - Where are tests located (`backend/tests/`)? What tests currently exist and how are they run?
   - How is the server launched (`uvicorn app.main:app`)? What environment variables or dependencies are needed?
4. Integration Points for New Features:
   - Where and how can new fraud detection or medical assessment modules be cleanly plugged into the pipeline?

## Deliverable
Write your detailed findings in `c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\explorer_codebase\report.md` and complete your `handoff.md`.
Send a completion message back to the orchestrator with key findings.
