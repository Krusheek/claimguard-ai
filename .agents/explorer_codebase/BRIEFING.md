# BRIEFING — 2026-09-18T15:35:00Z

## Mission
Investigate ClaimGuard AI codebase to establish an authoritative baseline of existing features, architecture, fraud detection models, clinical checks, document processing, test suite, and extension points.

## 🔒 My Identity
- Archetype: explorer
- Roles: codebase investigation, synthesis, architecture baseline
- Working directory: c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\explorer_codebase
- Original parent: 7a18a45e-74d9-4f2e-ae95-9ebe2496569a
- Milestone: Codebase Architecture Baseline

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Deliver findings to report.md and handoff.md in working directory
- Provide exact paths, line numbers, and verify test suite status

## Current Parent
- Conversation ID: 7a18a45e-74d9-4f2e-ae95-9ebe2496569a
- Updated: 2026-09-18T15:28:00Z

## Investigation State
- **Explored paths**:
  - `backend/app/main.py`, `backend/app/config.py`, `backend/app/database.py`
  - `backend/app/models/claim.py`
  - `backend/app/api/`: `upload.py`, `analysis.py`, `reports.py`, `portal.py`
  - `backend/app/extraction/`: `pipeline.py`, `ocr_engine.py`, `preprocessor.py`, `prompts.py`, `vlm_extractor.py`
  - `backend/app/forensics/`: `engine.py`, `bill_anomaly.py`, `consistency_checker.py`, `ela_detector.py`, `metadata_checker.py`
  - `backend/app/rules/`: `engine.py`, `rule_registry.py`, `proportionate_deduction.py`, `clause_timeline.py`, `mental_health_parity.py`, `waiting_period.py`
  - `backend/app/schemas/`: `hospital_bill.py`, `insurance_policy.py`, `rejection_letter.py`, `analysis_result.py`, `forensics_result.py`
  - `backend/app/reports/`: `generator.py`, `templates/appeal_template.py`
  - `backend/app/utils/`: `audit_trail.py`, `file_handler.py`
  - `backend/tests/`: `test_forensics.py`, `test_rules.py`
  - `frontend/`: `src/pages/Analysis.jsx`, `src/components/analysis/ForensicsLab.jsx`, `start.bat`, `render.yaml`
  - `frontend-portal/`: `src/pages/SubmitPage.jsx`, `src/pages/TrackPage.jsx`
  - `data/generator/`: `generate_bills.py`, `generate_policies.py`, `generate_rejections.py`
- **Key findings**:
  - Full tech stack cataloged (FastAPI, SQLite/PG, VLM/OCR/ELA, React 18 / Vite / Tailwind).
  - Existing fraud engines: ELA detector, EXIF/PDF metadata checker, LOS padding detector, CGHS benchmark tariff comparator, itemization mismatch checker, diagnostic-medicine consistency checker, 4 statutory IRDAI rules.
  - Test suite status: Inconsistencies identified between schemas and test expectations (`rejection.reasons` vs `rejection.rejection_reasons`; `issue_type` vs `mismatch_type`), plus missing `ForensicsEngine.run()` method in `backend/app/api/analysis.py`.
  - Extension points clearly mapped: `app/forensics/`, `app/rules/`, `app/schemas/`, and React `ForensicsLab.jsx`.
- **Unexplored areas**: None, full exploration completed.

## Key Decisions Made
- Completed deep inspection of all backend, frontend, schema, model, and test code.
- Preparing full report.md and handoff.md.

## Artifact Index
- DISPATCH.md — incoming dispatch records
- progress.md — liveness heartbeat and step tracking
- report.md — comprehensive findings
- handoff.md — 5-component handoff report
