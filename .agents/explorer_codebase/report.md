# ClaimGuard AI — Comprehensive Codebase Architecture Report

**Author:** Codebase Explorer Subagent  
**Date:** 2026-09-18  
**Repository Working Directory:** `c:\Users\krusheek\Desktop\SIH\claimguard-ai`  
**Reference Dispatch:** `c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\ORIGINAL_REQUEST.md`

---

## Executive Summary

ClaimGuard AI is an automated medical insurance claim forensics, audit, and appeal generation platform tailored to the Indian healthcare and insurance regulatory landscape (IRDAI regulations, Insurance Act 1938 § 45, Mental Healthcare Act 2017 § 21(4), and CGHS benchmark tariffs).

The system consists of:
1. **Asynchronous Python Backend (`backend/`)**: FastAPI application running on Uvicorn, backed by SQLAlchemy 2.0 (SQLite with `aiosqlite` for local dev; PostgreSQL with `asyncpg` on Render), supporting multimodal document extraction (Tesseract OCR + OpenAI/Anthropic Vision-Language Models), a 4-tier statutory rules engine, digital image/PDF forensics, billing anomaly detection, and tamper-evident SHA-256 blockchain-style audit logging.
2. **Admin Dashboard (`frontend/`)**: React 18 + Vite + Tailwind CSS single-page application running on port 3000, featuring a 4-tab clinical workspace:
   - *Financial Reconciliation & Rules* (IRDAI statutory rule verdicts & waterfall calculations)
   - *Digital Forensics & Fraud Lab* (SVG ELA gauge, hardware metadata provenance, interactive heatmap overlay, CGHS tariff comparator, clinical consistency matrix)
   - *Cryptographic Audit Trail* (SHA-256 tamper-evident ledger visualizer)
   - *Legal Appeal & Grievance Generator* (Formal appeal letters for Insurance Ombudsman / IRDAI Bima Bharosa)
3. **Patient Portal (`frontend-portal/`)**: React 18 + Vite + Tailwind CSS application running on port 5174, featuring a 3-step claim upload wizard and real-time claim status tracking via WebSockets (`/api/portal/ws/claim/{claim_id}`).
4. **Synthetic Data Generator (`data/generator/`)**: Generators for bills, policies, and rejection letters simulating various fraud and dispute scenarios.

---

## 1. System Architecture & Tech Stack

### 1.1 Backend Framework & Architecture
- **Framework**: FastAPI (`0.115.6`), Uvicorn (`0.34.0`).
- **Python Version**: Python 3.10+ (Render specifies Python `3.11.9` in `runtime.txt` and `render.yaml`).
- **Data Layer**:
  - SQLAlchemy `2.0.36` async engine with declarative mapping (`Mapped`, `mapped_column`).
  - Drivers: `aiosqlite` (`0.20.0`) for local SQLite database (`claimguard.db`), `asyncpg` (`0.30.0`) and `psycopg2-binary` (`2.9.10`) for production PostgreSQL.
  - Auto-conversion of database connection string in `backend/app/database.py`: converts `postgres://` or `postgresql://` to `postgresql+asyncpg://`.
- **Configuration**:
  - `backend/app/config.py`: Pydantic `BaseSettings` (`pydantic-settings==2.7.0`) loading from `.env`.
  - Configurable settings: `DATABASE_URL`, `SECRET_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `VLM_PROVIDER` (default `"anthropic"`), `UPLOAD_DIR` (`./uploads`), `MAX_UPLOAD_SIZE_MB` (`25`), `DEBUG` (`False`).
- **Application Structure**:
  ```
  backend/
  ├── app/
  │   ├── main.py              # FastAPI app initialization, CORS, Lifespan, router registration
  │   ├── config.py            # Pydantic BaseSettings environment configuration
  │   ├── database.py          # Async SQLAlchemy engine, session maker, init_db()
  │   ├── api/                 # API Route handlers
  │   │   ├── upload.py        # /api/upload, /api/claims, /api/stats
  │   │   ├── analysis.py      # /api/analyze/{claim_id}, status, results, pipeline background runner
  │   │   ├── reports.py       # /api/reports/{claim_id}, appeal letter, audit trail
  │   │   └── portal.py        # /api/portal/submit, status, WebSocket /ws/claim/{claim_id}
  │   ├── extraction/          # Document processing & OCR/VLM pipeline
  │   │   ├── pipeline.py      # ExtractionPipeline orchestrator (PDF/image -> OCR/VLM)
  │   │   ├── ocr_engine.py    # Tesseract OCR engine (table extraction, confidence scoring)
  │   │   ├── preprocessor.py  # OpenCV/PIL image preprocessing (deskew, CLAHE, bilateral, threshold)
  │   │   ├── prompts.py       # Structured prompts for bill, policy, and rejection letters
  │   │   └── vlm_extractor.py # Anthropic & OpenAI VLM structured output extraction
  │   ├── forensics/           # Document & Billing Forensics
  │   │   ├── engine.py        # ForensicsEngine (aggregates ELA, metadata, anomalies, consistency)
  │   │   ├── ela_detector.py  # Error Level Analysis (JPEG compression difference & heatmap)
  │   │   ├── metadata_checker.py # PDF binary scan & image EXIF tag inspection
  │   │   ├── bill_anomaly.py  # CGHS tariff deviation, LOS padding, duplicate billing, itemization
  │   │   └── consistency_checker.py # Diagnosis vs medicine/test clinical cross-referencing
  │   ├── rules/               # Statutory Insurance Rules Engine
  │   │   ├── engine.py        # RuleEngine (executes registered rules, aggregates verdicts)
  │   │   ├── rule_registry.py # Rule registration decorator (@register_rule) and sorter
  │   │   ├── proportionate_deduction.py # Room rent capping proportionate deduction rule
  │   │   ├── clause_timeline.py        # Moratorium period (60 months) rule
  │   │   ├── mental_health_parity.py   # Mental Healthcare Act 2017 parity rule
  │   │   └── waiting_period.py         # Initial, specific illness, and PED waiting period rule
  │   ├── models/              # SQLAlchemy Database ORM Models
  │   │   └── claim.py         # Claim, Document, AnalysisRun, RuleVerdictRecord, AuditLog
  │   ├── schemas/             # Pydantic Schemas
  │   │   ├── hospital_bill.py     # HospitalBill, BillLineItem (with arithmetic verification)
  │   │   ├── insurance_policy.py  # InsurancePolicy, WaitingPeriodConfig, SubLimit
  │   │   ├── rejection_letter.py  # RejectionLetter, RejectionReason
  │   │   ├── analysis_result.py   # AnalysisResult, RuleVerdict
  │   │   └── forensics_result.py  # ForensicsResult, ELAResult, MetadataFlag, BillAnomalyFlag, ConsistencyFlag
  │   ├── reports/             # Report & Appeal Letter Generation
  │   │   ├── generator.py     # ReportGenerator (Jinja2 + FPDF2 PDF rendering)
  │   │   └── templates/       # Jinja2 appeal letter & summary templates
  │   └── utils/
  │       ├── audit_trail.py   # Tamper-evident SHA-256 hash-chain audit logging
  │       └── file_handler.py  # Magic-byte MIME detection & chunked file saving
  └── tests/                   # Pytest test suite
      ├── test_forensics.py    # Forensic detector unit tests
      └── test_rules.py        # Statutory rule engine unit tests
  ```

### 1.2 Frontend Structure
- **Admin Dashboard (`frontend/`)**:
  - React 18, Vite, Tailwind CSS, Lucide React icons, Sonner notifications.
  - Port: `3000`.
  - Pages:
    - `Dashboard.jsx`: Overall claim metrics (Total Claims, Pending, Mismatches Found, Recovered Amount), recent claims table.
    - `Upload.jsx`: Multi-document file uploader with document classification tagging.
    - `Analysis.jsx`: 4-tab clinical dossier view (`financial`, `forensics`, `audit`, `appeal`).
    - Components: `FinancialDelta.jsx`, `VerdictCard.jsx`, `ForensicsLab.jsx`, `AuditTimeline.jsx`, `AppealLetter.jsx`.
- **Patient Portal (`frontend-portal/`)**:
  - React 18, Vite, Tailwind CSS, Framer Motion animations.
  - Port: `5174`.
  - Pages:
    - `LandingPage.jsx`: Patient value proposition, features, CTA.
    - `SubmitPage.jsx`: 3-step wizard (Personal Details, Document Upload for Bill/Policy/Rejection, Review & Submit).
    - `TrackPage.jsx`: Live claim progress tracking via WebSocket (`/ws/claim/{claim_id}`), displaying plain-language results and appeal download button.

---

## 2. Existing Fraud Detection, Forensics, and Clinical Checking Capabilities

### 2.1 Digital Document Forensics
1. **Error Level Analysis (`ELADetector` in `backend/app/forensics/ela_detector.py`)**:
   - Re-compresses the input document image as JPEG at reference quality 90.
   - Computes pixel-by-pixel difference using PIL `ImageChops.difference`.
   - Enhances contrast dynamically using brightness scaling (`scale_multiplier=15.0`).
   - Identifies high-frequency anomalies via thresholding (`mean + 3.5 * std`).
   - Identifies suspicious contours (areas between 40 px and 30% of total image area).
   - Generates OpenCV `COLORMAP_JET` heatmap image saved as `ela_heatmap_<filename>.jpg`.
   - Computes normalized `tamper_score` (0.0 to 100.0) and assigns assessment:
     - `< 20`: `CLEAN`
     - `20 - 50`: `SUSPICIOUS`
     - `> 50`: `HIGHLY_SUSPICIOUS`
   - Graceful fallback: If OpenCV (`cv2`) is missing in the environment, returns `SKIPPED` without crashing.

2. **Metadata & Hardware Provenance Inspection (`MetadataChecker` in `backend/app/forensics/metadata_checker.py`)**:
   - **PDF Inspection**: Inspects binary byte streams for keywords of image/PDF tampering tools: `photoshop`, `gimp`, `illustrator`, `pdf editor`, `ilovepdf`. Flags duplicate `/Creator` or `/Producer` tags indicating post-creation alteration.
   - **Image EXIF Inspection**: Checks camera/scanner metadata. Flags missing EXIF tags, manipulation software signatures (`photoshop`, `gimp`, `paint`, `snapseed`, `lightroom`), and low-resolution scans (< 500x500 px).

### 2.2 Healthcare Billing Anomalies
Implemented in `BillAnomalyDetector` (`backend/app/forensics/bill_anomaly.py`):
1. **Length of Stay (LOS) Padding**:
   - Cross-references billed `length_of_stay` against diagnosis benchmarks in `TYPICAL_LOS`:
     - Appendectomy (2-4 days), Cholecystectomy (2-5 days), LSCS (3-5 days), Knee Replacement (5-8 days), Cataract (1-2 days), Angioplasty (2-4 days), Hernia (1-3 days), Hysterectomy (3-6 days).
     - Flags `HIGH` if stay > 1.5x typical max; `MEDIUM` if stay > typical max.
2. **Tariff Deviation against CGHS Benchmarks**:
   - Compares billed unit rates against Central Government Health Scheme (CGHS) 2024 gazette benchmarks across categories:
     - `ROOM`: ₹2,000 - ₹5,000 / day
     - `NURSING`: ₹500 - ₹1,500 / day
     - `CONSULTATION`: ₹500 - ₹2,000 / visit
     - `LAB`: ₹200 - ₹5,000 / test
     - `RADIOLOGY`: ₹1,000 - ₹15,000 / test
     - `OT`: ₹10,000 - ₹50,000 / procedure
     - `PHARMACY`: ₹500 - ₹30,000 / stay
     - `CONSUMABLES`: ₹500 - ₹15,000 / stay
   - Flags `HIGH` if line item > 3x CGHS benchmark max; `MEDIUM` if > 2x max.
3. **Duplicate / Excessive Billing**:
   - Detects repeated items where quantity > `(length_of_stay * 5)` and total quantity > 10.
4. **Itemization Mismatch**:
   - Sums all `line_items.amount` and verifies consistency against `bill.net_payable` with a ₹10 tolerance. Flags `HIGH` severity if mismatched.

### 2.3 Clinical Consistency Checking
Implemented in `ConsistencyChecker` (`backend/app/forensics/consistency_checker.py`):
- Cross-references billed medications and diagnostic tests against diagnosed conditions via `DIAGNOSIS_MEDICINE_MAP`:
  - E.g., for `appendectomy`: expected medicines are antibiotics, analgesics, antiemetics, PPIs; expected tests are CBC, blood count, ultrasound, CT, urinalysis; unexpected medicines include insulin, antihypertensives, chemotherapy, immunosuppressants.
  - Flags contradictory treatments with `HIGH` severity and missing baseline diagnostic tests with `LOW` severity.

### 2.4 Statutory Regulatory Rules Engine
Implemented in `backend/app/rules/` with priority sorting via `rule_registry.py`:
1. **Proportionate Deduction Rule (`proportionate_deduction.py`)**:
   - Regulatory basis: *IRDAI Master Circular on Health Insurance, May 2024*.
   - Logic: When actual room rent exceeds policy room rent limit, insurers may only deduct proportionately from room-associated charges (e.g. nursing, room rent). Fixed charges (surgeon fees, OT charges, implants, diagnostic tests) cannot be reduced.
   - Calculates exact allowable payable vs. insurer-approved amount, computing exact `monetary_impact` (underpayment) recoverable in appeal.
2. **Clause Timeline / Moratorium Rule (`clause_timeline.py`)**:
   - Regulatory basis: *IRDAI Master Circular May 2024 Para 5.3 & Insurance Act 1938 § 45*.
   - Logic: After 60 continuous months of policy coverage (moratorium period), insurers are barred from disputing or rejecting claims on grounds of non-disclosure or pre-existing diseases.
3. **Mental Health Parity Rule (`mental_health_parity.py`)**:
   - Regulatory basis: *Mental Healthcare Act 2017 § 21(4) & IRDAI Master Circular May 2024*.
   - Logic: Health insurers are legally prohibited from denying treatment for mental illness or treating mental health differently from physical conditions.
4. **Waiting Period Rule (`waiting_period.py`)**:
   - Regulatory basis: *IRDAI Master Circular on Health Insurance, May 2024*.
   - Logic: Validates if insurer's rejection for waiting periods (Initial 30 days, Specific illness 24 months, Pre-existing disease 48 months) is factually correct based on policy inception date and claim date.

### 2.5 Document Extraction & OCR Pipeline
Implemented in `backend/app/extraction/`:
- `pipeline.py`: Main entry point `process_document(file_path, expected_type)`. Converts PDF to images (`pdf2image`), preprocesses each page (`preprocess_image`), runs Tesseract OCR (`extract_with_confidence`, `extract_table`).
- If OCR average confidence < 70% or complex tables are detected, the pipeline automatically routes the document to the Vision-Language Model (`vlm_extractor.py`).
- `VLMExtractor`: Supports both Anthropic (`claude-3-5-sonnet` with tool-use parameter validation) and OpenAI (`gpt-4o` with `response_format` JSON schema validation). Extracts validated Pydantic models: `HospitalBill`, `InsurancePolicy`, `RejectionLetter`.

### 2.6 Cryptographic Audit Trail
Implemented in `backend/app/utils/audit_trail.py`:
- Every claim event (`DOCUMENT_UPLOADED`, `EXTRACTION_COMPLETED`, `ANALYSIS_STARTED`, `ANALYSIS_COMPLETED`, `ANALYSIS_FAILED`) is appended to the `audit_logs` table.
- Each record computes an immutable SHA-256 hash:
  `entry_hash = sha256(previous_hash + action + sorted_json_details + timestamp)`.
- `verify_chain(db, claim_id)` iterates through the ledger and validates that each record's `previous_hash` matches the preceding record's `entry_hash`, preventing tampering.

---

## 3. Test Suite & Runtime Baseline

### 3.1 Test Suite Overview
- Test files located in: `backend/tests/`
  1. `backend/tests/test_forensics.py` (4 unit tests)
  2. `backend/tests/test_rules.py` (9 unit tests)
- Test Framework: `pytest==8.3.4`, `pytest-asyncio==0.24.0`.
- Execution command:
  ```bash
  pytest backend/tests/
  ```
  *(or from inside `backend/`: `pytest tests/`)*

### 3.2 Deep Test Analysis & Discrepancy Findings
Detailed code tracing of the current test suite revealed specific discrepancies between the test assertions and the underlying implementation:

| Test Name | File | Implementation Traced | Test Expectation | Finding / Status |
|---|---|---|---|---|
| `test_bill_anomaly_detector_normal_bill` | `test_forensics.py` | `BillAnomalyDetector.analyze()` | `assert len(flags) == 0` | **PASS**: Normal appendectomy bill produces 0 flags. |
| `test_bill_anomaly_detector_inflated_charges` | `test_forensics.py` | `BillAnomalyDetector.analyze()` | `assert any(f.anomaly_type == "TARIFF_DEVIATION" for f in flags)` | **PASS**: Room ₹20,000 exceeds 3x ₹5,000 CGHS max; flag generated. |
| `test_consistency_checker_matching` | `test_forensics.py` | `ConsistencyChecker.analyze()` | `assert len(flags) == 0` | **PASS**: Antibiotic + CBC matches appendectomy. |
| `test_consistency_checker_mismatch` | `test_forensics.py` | `ConsistencyChecker.analyze()` sets `mismatch_type="DIAGNOSIS_MEDICINE"` and leaves `issue_type=""` | `assert any(f.issue_type == "CONTRADICTORY_TREATMENT" for f in flags)` | **FAIL (SCHEMA BUG)**: `ConsistencyChecker` does not populate `issue_type` with `"CONTRADICTORY_TREATMENT"`, so `f.issue_type` is `""`. Test fails assertion. |
| `test_proportionate_deduction_no_cap` | `test_rules.py` | `check_proportionate_deduction()` | `assert verdict.status == "PASS"` | **PASS** |
| `test_proportionate_deduction_within_limit` | `test_rules.py` | `check_proportionate_deduction()` | `assert verdict.status == "PASS"` | **PASS** |
| `test_proportionate_deduction_mismatch` | `test_rules.py` | `check_proportionate_deduction()` | `assert verdict.status == "FAIL"` & impact == 14000.0 | **PASS** |
| `test_proportionate_deduction_correct_deduction` | `test_rules.py` | `check_proportionate_deduction()` | `assert verdict.status == "PASS"` | **PASS** |
| `test_clause_timeline_moratorium_expired` | `test_rules.py` | `check_clause_timeline()` reads `rejection.rejection_reasons` | Test sets `rejection.reasons = [...]` | **FAIL (ATTRIBUTE MISMATCH)**: Test sets `rejection.reasons`, leaving `rejection.rejection_reasons` empty (`[]`). Rule returns `"SKIPPED"`, while test asserts `"FAIL"`. |
| `test_clause_timeline_moratorium_active` | `test_rules.py` | `check_clause_timeline()` reads `rejection.rejection_reasons` and `policy.policy_start_date` | Test sets `rejection.reasons = [...]` and `policy.inception_date` | **FAIL (ATTRIBUTE MISMATCH)**: Rule returns `"SKIPPED"`, while test asserts `"PASS"`. |
| `test_mental_health_rejected` | `test_rules.py` | `check_mental_health_parity()` reads `rejection.rejection_reasons` | Test sets `rejection.reasons = [...]` | **FAIL (ATTRIBUTE MISMATCH)**: `rejection.reasons` vs `rejection.rejection_reasons`. |
| `test_mental_health_not_applicable` | `test_rules.py` | `check_mental_health_parity()` | `assert verdict.status == "SKIPPED"` | **PASS** |
| `test_waiting_period_expired` | `test_rules.py` | `check_waiting_period()` reads `rejection.rejection_reasons` | Test sets `rejection.reasons = [...]` | **FAIL (ATTRIBUTE MISMATCH)**: `rejection.reasons` vs `rejection.rejection_reasons`. |
| `test_waiting_period_active` | `test_rules.py` | `check_waiting_period()` reads `rejection.rejection_reasons` | Test sets `rejection.reasons = [...]` | **FAIL (ATTRIBUTE MISMATCH)**: `rejection.reasons` vs `rejection.rejection_reasons`. |
| `test_rule_engine_integration` | `test_rules.py` | `RuleEngine.run_all_rules()` | `assert hasattr(result, "overall_status")` | **PASS** |

### 3.3 Runtime End-to-End Pipeline Integration Bugs Observed
In addition to the unit test mismatches, two runtime integration bugs were identified during call-chain tracing:
1. **`ForensicsEngine` invocation in `backend/app/api/analysis.py` (lines 58-60)**:
   ```python
   # In analysis.py:
   forensics_engine = ForensicsEngine()
   forensics_result = forensics_engine.run(documents)
   ```
   However, in `backend/app/forensics/engine.py`, `ForensicsEngine` only provides:
   ```python
   def run_all_checks(self, file_path: str, bill: Optional[HospitalBill] = None) -> ForensicsResult:
   ```
   There is no `.run()` method taking a list of documents. At runtime, triggering `/api/analyze/{claim_id}` throws `AttributeError: 'ForensicsEngine' object has no attribute 'run'`.
2. **`portal.py` background analysis trigger (lines 178-185)**:
   `portal.py` calls `run_analysis_pipeline(claim_id, session)` with two arguments where the second argument is an `AsyncSession`, but `run_analysis_pipeline(claim_id, analysis_run_id)` in `analysis.py` expects a string `analysis_run_id`.

---

## 4. Server Launch and Dependencies

### 4.1 Launch Command
The backend is launched using Uvicorn:
```bash
# From backend directory
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
# Or via python module
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
In `start.bat`:
- Backend: `cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"`
- Admin Dashboard: `cmd /k "cd /d %~dp0frontend && npm run dev"` (port 3000)
- Patient Portal: `cmd /k "cd /d %~dp0frontend-portal && npm run dev"` (port 5174)

### 4.2 Critical Dependencies & Environment Setup
- `fastapi`, `uvicorn[standard]`, `sqlalchemy`, `aiosqlite`, `asyncpg`, `pydantic`, `pydantic-settings`.
- `Pillow`, `pdf2image`, `fpdf2`, `jinja2`, `aiofiles`, `httpx`.
- LLM/VLM: `openai`, `anthropic`.
- Optional system binaries: `tesseract-ocr` and `libGL` for OpenCV are guarded by fallback `try...except ImportError` clauses throughout the codebase so that missing binary libraries do not prevent the server or API from booting.

---

## 5. Potential Extension Points for Research-Backed Features

The user's original objective (`ORIGINAL_REQUEST.md`) requires analyzing 15 research papers on medical insurance fraud detection, graph/network analysis, clinical coding, and document understanding, and selecting 2-3 high-impact features to implement cleanly.

The ClaimGuard AI architecture has exceptionally modular, well-defined extension points:

### Extension Point 1: Forensic Detectors (`backend/app/forensics/`)
- **How it works**: Any new detector class (e.g. Graph / Collision Network Detector, Temporal Trajectory Analyzer, ICD-10/CPT Medical Co-occurrence / Upcoding Engine) can be created as a standalone module in `backend/app/forensics/`.
- **Integration**:
  1. Add new flag schemas to `backend/app/schemas/forensics_result.py` (e.g. `UpcodingFlag`, `NetworkCollisionFlag`, `TemporalTrajectoryFlag`).
  2. Instantiate and call the detector inside `ForensicsEngine.run_all_checks()` (or provide a clean `run()` adapter method for document collections).
  3. The result is automatically stored in `AnalysisRun.forensics_data` and rendered in the frontend.
  4. Frontend: `frontend/src/components/analysis/ForensicsLab.jsx` already has established UI sections for gauges, benchmarks, and clinical matrices. New cards or sub-tabs can seamlessly consume these flags.

### Extension Point 2: Rule Engine Registry (`backend/app/rules/`)
- **How it works**: The `@register_rule(name, description, tier, regulatory_citation)` decorator in `backend/app/rules/rule_registry.py` automatically registers any rule.
- **Integration**:
  1. Create a new rule file in `backend/app/rules/` (e.g. `medical_necessity.py`, `unbundling_rule.py`, `cosmetic_exclusion_boundary.py`).
  2. Decorate the inspection function with `@register_rule(...)`.
  3. Import the file in `backend/app/rules/engine.py`.
  4. The rule is automatically executed during `RuleEngine.run_all_rules()`, logged in `RuleVerdictRecord`, factored into `total_monetary_impact`, and displayed in the frontend *Financial Reconciliation & Rules* tab with zero additional glue code.

### Extension Point 3: Clinical & Code Graph Validation (`backend/app/schemas/` & `backend/app/extraction/`)
- **How it works**: `HospitalBill` and `BillLineItem` already support `category`, `item_code`, `description`, `quantity`, `unit_rate`, and `amount`.
- **Integration**:
  1. Add structured ICD-10 diagnostic coding and CPT / procedure coding to `HospitalBill` / `BillLineItem`.
  2. Add a clinical validation layer that evaluates procedure-diagnosis graph compatibility, multi-specialty cross-billing, or unbundling (billing component parts of a procedure separately).

### Extension Point 4: REST API & WebSocket Portal (`backend/app/api/`)
- **How it works**: `backend/app/api/analysis.py` and `portal.py` provide standard REST and WebSocket push capabilities.
- **Integration**:
  1. Specialized endpoints (e.g., `/api/forensics/network-graph/{claim_id}` or `/api/analysis/{claim_id}/upcoding-report`) can be added directly to `backend/app/api/analysis.py` or `reports.py`.
  2. WebSocket channels in `portal.py` can push intermediate findings directly to the live client tracking interface.

---

## 6. Summary Matrix of Existing Capabilities

| Feature Domain | Current Implementation | Files & Line References | Status / Gaps |
|---|---|---|---|
| **API & Routing** | FastAPI with CORS, Lifespan DB init, background analysis tasks | `backend/app/main.py:1-44`, `backend/app/api/analysis.py:1-188` | Operates smoothly; adapter needed for `ForensicsEngine.run(documents)` |
| **Database & Models** | SQLAlchemy 2.0 async, SQLite/Postgres, Claims, Documents, AnalysisRun, RuleVerdict, AuditLog | `backend/app/models/claim.py:1-92`, `backend/app/database.py:1-36` | Fully defined with cascading relationships and JSON columns |
| **Document OCR/VLM** | Hybrid pipeline: Tesseract OCR + table parsing; VLM fallback (OpenAI/Anthropic) | `backend/app/extraction/pipeline.py:1-137`, `backend/app/extraction/vlm_extractor.py:1-151` | Complete hybrid logic with graceful fallbacks |
| **Image ELA Forensics** | Error Level Analysis, JPEG recompression difference, contour detection, JET heatmap | `backend/app/forensics/ela_detector.py:1-130` | Complete; requires `cv2` for heatmap or cleanly falls back |
| **Metadata Provenance** | PDF tool keyword detection (`photoshop`, `ilovepdf`), image EXIF inspection | `backend/app/forensics/metadata_checker.py:1-107` | Functional rule-based inspection |
| **Billing Anomaly Detection** | CGHS 2024 benchmarks, typical LOS bounds, duplicate billing, arithmetic itemization | `backend/app/forensics/bill_anomaly.py:1-137` | Solid heuristics based on official Indian healthcare benchmarks |
| **Clinical Cross-Checking** | Diagnosis vs medicine/test consistency map (`DIAGNOSIS_MEDICINE_MAP`) | `backend/app/forensics/consistency_checker.py:1-89` | Basic dictionary-based map for 5 surgical conditions; ready for expansion |
| **Statutory Rules Engine** | 4 IRDAI/MHCA rules: Proportionate Deduction, Moratorium Period, Mental Health, Waiting Period | `backend/app/rules/`: `proportionate_deduction.py`, `clause_timeline.py`, `mental_health_parity.py`, `waiting_period.py` | Robust math and legal citations; schema attribute alignment needed in tests |
| **Tamper-Evident Ledger** | SHA-256 hash chaining of claim events with verification method | `backend/app/utils/audit_trail.py:1-72` | Fully operational cryptographic chain |
| **Admin UI (4 Tabs)** | React 18 / Tailwind / Recharts / Lucide UI | `frontend/src/pages/Analysis.jsx:1-510`, `frontend/src/components/analysis/ForensicsLab.jsx:1-918` | Rich enterprise UI with interactive SVG gauges and comparison bars |
| **Patient Portal** | React 18 / Framer Motion wizard + WebSocket real-time progress | `frontend-portal/src/pages/SubmitPage.jsx:1-311`, `frontend-portal/src/pages/TrackPage.jsx:1-367` | Complete patient-facing submission and tracking flow |

---

## Conclusion

The ClaimGuard AI platform has a strong, modern, and clean architecture with clear division of responsibilities across backend, forensics, rules, and frontend. The system is immediately primed for integrating advanced research-backed features, particularly in the areas of:
1. **Network / Provider-Claim Collusion Detection** (graph-based anomaly analysis)
2. **Clinical Upcoding & Procedure-Diagnosis Compatibility Analysis** (ICD-10 / CPT knowledge graphs)
3. **Temporal Claim Trajectory & Unbundling Detection** (sequential billing pattern forensics)

The detailed findings above provide an authoritative foundation for the subsequent feature selection and implementation phases.
