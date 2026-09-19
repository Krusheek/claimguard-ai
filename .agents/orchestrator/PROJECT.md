# Project: ClaimGuard AI - Research-Backed Advanced Feature Implementation

## Architecture
- **Backend**: FastAPI (`backend/app/main.py`), Pydantic v2 schemas (`backend/app/schemas/`), SQLAlchemy 2.0 async DB models (`backend/app/models/`), routers (`backend/app/api/`).
- **Forensics Engine**: `backend/app/forensics/` (`engine.py`, `ela_detector.py`, `metadata_checker.py`, `bill_anomaly.py`, `consistency_checker.py`, `pdf_inspector.py`, `fraud_scorer.py`).
- **Statutory Rules Engine**: `backend/app/rules/` (`engine.py`, `rule_registry.py`, existing rules + `appeal_evaluator.py`).
- **Analysis Pipeline**: `backend/app/services/analysis_service.py`, `backend/app/api/analysis.py`, `backend/app/api/portal.py`.
- **Frontend**: React/Vite admin dashboard (`frontend/`) and patient portal (`frontend-portal/`).

## Feature Inventory
| # | Feature Concept | Source Paper | Assigned Milestone | Status |
|---|-----------------|--------------|--------------------|--------|
| 1 | Denial Appeal Overturn Scorer & Triage Engine | Paper 1 (JAMIA Open 2025, Owolabi) | M3 | DONE |
| 2 | Dialogue & MRC Span Extraction System | Paper 2 (Findings of ACL 2021, Peng et al.) | Deferred | Evaluated |
| 3 | Morphological Table Grid Parser | Paper 3 (IEEE UBMK 2018, Çavuşoğlu et al.) | Deferred | Evaluated |
| 4 | Graph Learning Information Extraction (PICK) | Paper 4 (ICPR 2020, Yu et al.) | Deferred | Evaluated |
| 5 | Cross-Modal Word-Patch Document Alignment | Paper 5 (ACM MM 2022, LayoutLMv3) | Deferred | Evaluated |
| 6 | Pairwise Statutory Compliance Verification | Paper 6 (IEEE BigData 2023, Berger et al.) | Deferred | Evaluated |
| 7 | Compliance-to-Code Rule Synthesizer | Paper 7 (arXiv:2505.19804, Li et al.) | Deferred | Evaluated |
| 8 | Markov State-Transition Claim Surprisal | Paper 8 (arXiv:2102.10978, Gupta et al.) | Deferred | Evaluated |
| 9 | Explainable Composite Fraud Risk Scorer with Factor Attribution | Paper 9 (Nature Sci Rep 2025, Wang et al.) | M1 | DONE |
| 10 | Unfair / Void Boilerplate Clause Detector | Paper 10 (ACL 2024, Braun & Matthes) | Deferred | Evaluated |
| 11 | Legal Provision BERT Taxonomy Classifier | Paper 11 (arXiv:2404.10097, Tewari) | Deferred | Evaluated |
| 12 | Insurance Ombudsman Framework & Rejection Defect Auditor | Paper 12 (SSRN:3965192, Goda) | M3 | DONE |
| 13 | IRDAI Grievance & Arbitrary Deduction Risk Model | Paper 13 (JISEM 2025, Mathew) | M3 | DONE |
| 14 | PDF Multi-Revision & Incremental Update Forensic Inspector | Paper 14 (arXiv:2507.00827, Grobler et al.) | M2 | DONE |
| 15 | Clinical Length of Stay (LOS) Anomaly & Bed Padding Engine | Paper 15 (PMC9943622, Mansoori et al.) | M1/M2 extension | Evaluated |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M0 | Research Synthesis & Baseline Health | Compile 15-paper analysis report, repair existing test/api inconsistencies | None | DONE |
| M1 | Explainable Fraud Risk Scorer (Paper 9) | Implement `backend/app/forensics/fraud_scorer.py` with calibrated risk weights & additive factor attribution | M0 | DONE |
| M2 | PDF Incremental Update Forensic Inspector (Paper 14) | Implement `backend/app/forensics/pdf_inspector.py` for multi-revision `%%EOF` & structural stream inspection | M0 | DONE |
| M3 | Denial Appeal Overturn & Ombudsman Risk Engine (Papers 1, 12, 13) | Implement `backend/app/rules/appeal_evaluator.py` for contestability scoring & statutory grievance risk | M0 | DONE |
| M4 | System Integration, Full Test Suite & Server Verification | Integrate features into `ForensicsEngine`, `RuleEngine`, `analysis.py`, write comprehensive pytests, verify `pytest backend/tests/` passes (63/63) and `uvicorn app.main:app` starts | M1, M2, M3 | DONE |

## Code Layout
- `backend/app/forensics/fraud_scorer.py`: Explainable composite fraud scoring module
- `backend/app/forensics/pdf_inspector.py`: Digital PDF structural forensic inspector
- `backend/app/rules/appeal_evaluator.py`: Denial contestability & Ombudsman dispute risk engine
- `backend/app/schemas/appeal_evaluation.py`: Dedicated Pydantic schema for appeal evaluation results
- `backend/app/schemas/forensics_result.py`: Updated Pydantic schemas with PDFInspectionResult and CompositeFraudScore
- `backend/app/schemas/analysis_result.py`: Updated Pydantic schemas with AppealEvaluationResult
- `backend/app/forensics/engine.py`: Integrated PDFInspector and ExplainableFraudScorer
- `backend/app/rules/engine.py`: Registered and integrated AppealEvaluator
- `backend/app/api/analysis.py` & `portal.py`: Clean API endpoints and pipeline integration
- `RESEARCH_ANALYSIS.md`: Exhaustive 15-paper analysis deliverable at project root
- `backend/tests/`:
  - `test_forensics.py`: 4 tests passed
  - `test_rules.py`: 12 tests passed
  - `test_new_features.py`: 14 tests passed
  - `test_adversarial_challenger_1.py`: 18 tests passed
  - `test_appeal_adversarial.py`: 15 tests passed
  - Total: 63 tests passed (100% pass rate, 0 failures, 0 errors)
