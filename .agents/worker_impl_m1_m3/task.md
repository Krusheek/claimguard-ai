# Task: Implementation of 3 Research-Backed Features & System Stability

## Working Directory
`c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\worker_impl_m1_m3`

## Authoritative References
- Original Request: `c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\ORIGINAL_REQUEST.md`
- Project Plan & Contracts: `c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\orchestrator\PROJECT.md`
- Research Analysis: `c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\orchestrator\RESEARCH_ANALYSIS.md`

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Detailed Objectives

### 1. Implement Feature 1: Explainable Composite Fraud Risk Scorer (`backend/app/forensics/fraud_scorer.py`)
- Implement `FactorAttribution`, `CompositeFraudScore`, and `ExplainableFraudScorer`.
- Formulate calibrated additive factor attributions across forensics (ELA tamper score, PDF anomalies), billing (CGHS tariff deviations, LOS overstay, duplicate charges), clinical consistency (diagnosis/test/medicine mismatches), and metadata flags.
- Normalize score to 0.0–100.0% with transparent risk tiers (LOW, MEDIUM, HIGH, CRITICAL), top risk drivers, and human-interpretable audit narrative.

### 2. Implement Feature 2: Digital PDF Multi-Revision & Forensic Stream Inspector (`backend/app/forensics/pdf_inspector.py`)
- Implement pure-Python PDF structural parser inspecting the binary stream:
  - Count `%%EOF` markers and byte offsets (incremental update chaining).
  - Detect trailer dictionary changes, `/Prev` pointer chains, and multiple `/XRef` tables.
  - Detect overwritten object IDs and suspicious stream dictionary alterations.
  - Flag visual-stream manipulation (e.g. Photoshop/Acrobat/iLovePDF revision splices).
  - Return `PDFInspectionResult` with `is_tampered`, `pdf_tamper_score`, `revisions`, `anomalies`, `risk_level`.
- Integrate into `ForensicsEngine` in `backend/app/forensics/engine.py` so `.pdf` files are actively inspected rather than bypassed!

### 3. Implement Feature 3: Denial Appeal Overturn Predictor & Statutory Ombudsman Risk Engine (`backend/app/rules/appeal_evaluator.py`)
- Implement `AppealEvaluationResult` and `AppealEvaluator`:
  - Evaluate denial reasons against clinical necessity, waiting period compliance (IRDAI 30-day / 24-month / 48-month rules), emergency admission exceptions, and prohibited exclusions.
  - Calculate `overturn_probability` (0.0 to 100.0%) and `ombudsman_dispute_risk` (0.0 to 100.0%).
  - Detect statutory violations (e.g. IRDAI Master Circular 2024 turnaround time breach, lack of itemized reasoning under Ombudsman Rules 2017).
  - Produce actionable legal/clinical appeal grounds and step-by-step contestation action plan.
- Integrate into rules engine (`backend/app/rules/`).

### 4. Wire into API & Analysis Pipeline
- Expose new results in `backend/app/schemas/forensics_result.py` and `backend/app/schemas/analysis_result.py` (or relevant schemas).
- Fix integration bugs in `backend/app/api/analysis.py` (change `forensics_engine.run` to `run_all_checks`) and `backend/app/api/portal.py` (pass valid analysis run ID).
- Ensure existing frontend and API contracts remain backwards-compatible.

### 5. Repair Existing Test Inconsistencies & Add Comprehensive Test Suite
- In `backend/tests/test_rules.py`: fix `rejection.reasons` -> `rejection.rejection_reasons` so existing tests pass cleanly.
- In `backend/tests/test_forensics.py`: fix `issue_type` -> `mismatch_type` in consistency checker assertions.
- Create `backend/tests/test_new_features.py`: write thorough, programmatic unit and integration tests for `ExplainableFraudScorer`, `PDFInspector`, and `AppealEvaluator` covering:
  - Clean vs. tampered PDF structures (synthetic single vs. multi-EOF revisions).
  - Low vs. high fraud score scenarios with factor attribution verification.
  - Various denial scenarios (valid vs. statutory violation rejections with overturn probability).
- Also ensure `RESEARCH_ANALYSIS.md` is present at `c:\Users\krusheek\Desktop\SIH\claimguard-ai\RESEARCH_ANALYSIS.md`.

### 6. Verify System Stability
- Run `pytest backend/tests/` and ensure 100% tests pass with 0 failures.
- Verify that the FastAPI backend server starts without errors (`python -c "from app.main import app; print('App loaded successfully')"` and/or `uvicorn app.main:app`).

## Deliverable
Document your implementation, test commands, and verification logs in `c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\worker_impl_m1_m3\handoff.md`.
Send a completion message back to the orchestrator.
