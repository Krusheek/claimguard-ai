# Task: Remediation of Schema Imports, Runtime Errors & Scale Normalization

## Working Directory
`c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\worker_remediation`

## Authoritative References
- Original Request: `c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\ORIGINAL_REQUEST.md`
- Project Plan: `c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\orchestrator\PROJECT.md`
- Reviewer 1 Report: `c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\reviewer_1\handoff.md`
- Reviewer 2 Report: `c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\reviewer_2\handoff.md`
- Challenger 1 Report: `c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\challenger_1\handoff.md`

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Action Items:

### 1. Fix Schema Import Typo & Circular Import Deadlock
- In `backend/app/schemas/__init__.py`:
  Change `SubLimitConfig` to `SubLimit` (and alias `SubLimitConfig = SubLimit` in `backend/app/schemas/insurance_policy.py` for backwards compatibility).
- Break the circular import between `schemas/analysis_result.py` and `rules/appeal_evaluator.py`:
  Define `AppealEvaluationResult` in `backend/app/schemas/appeal_evaluation.py` (or inside `backend/app/schemas/analysis_result.py`), and have `backend/app/rules/appeal_evaluator.py` import `AppealEvaluationResult` from `backend.app.schemas`.

### 2. Fix ForensicsEngine Runtime Crashes (`backend/app/forensics/engine.py`)
- Unbound variable crash:
  At lines 52-57, initialize `med_risk_count_init = 0` unconditionally before `if ela_result.assessment == "HIGHLY_SUSPICIOUS":`.
- Pydantic model serialization:
  When passing `forensics_result` to `compute_score()`, ensure dictionary or model values can be accessed safely.

### 3. Fix ExplainableFraudScorer Robustness & Scale Normalization (`backend/app/forensics/fraud_scorer.py`)
- Pydantic vs Dict object access:
  Support both Pydantic model instances and dicts when reading `ela_data` and `pdf_data`:
  ```python
  ela_score = float(getattr(ela_data, 'tamper_score', None) or (ela_data.get('tamper_score', 0.0) if isinstance(ela_data, dict) else 0.0) or 0.0)
  ela_assessment = getattr(ela_data, 'assessment', None) or (ela_data.get('assessment', 'CLEAN') if isinstance(ela_data, dict) else 'CLEAN')
  pdf_score = float(getattr(pdf_data, 'pdf_tamper_score', None) or (pdf_data.get('pdf_tamper_score', 0.0) if isinstance(pdf_data, dict) else 0.0) or 0.0)
  pdf_tampered = bool(getattr(pdf_data, 'is_tampered', None) or (pdf_data.get('is_tampered', False) if isinstance(pdf_data, dict) else False))
  ```
- Scale mismatch:
  `ELADetector` outputs `[0.0, 100.0]`. If `ela_score > 1.0`, normalize: `ela_score = ela_score / 100.0`.
- NaN / ValueError sanitization:
  If `math.isnan(ela_score)` or conversion fails, default to `0.0`.

### 4. Fix Backwards-Compatibility in Patient Portal API (`backend/app/api/portal.py`)
- At line 233, support both keys:
  `verdicts = result_data.get("verdicts") or result_data.get("rule_verdicts", [])`.

### 5. Fix NoneType Handling in `AppealEvaluator` (`backend/app/rules/appeal_evaluator.py`)
- In `_normalize_reasons`, sanitize description safely:
  `description = str(r.get("description") or "")`.

### 6. Verify Full Test Suite & Server Startup
- Run `pytest backend/tests/ -v` and capture the real command output in `handoff.md`.
- Run `python -c "from app.main import app; print('ClaimGuard AI FastAPI App loaded successfully!')"` and capture output in `handoff.md`.

## Deliverable
Write your complete handoff in `c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\worker_remediation\handoff.md`.
Send a completion message back to orchestrator.
