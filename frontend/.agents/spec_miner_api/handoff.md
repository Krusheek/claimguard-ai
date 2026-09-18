# Specification Mining Handoff: API Services, Data Models & Analytics Schemas

**Author:** `spec_miner_api`  
**Date:** 2026-09-17  
**Working Directory:** `c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\.agents\spec_miner_api`  
**Project Root:** `c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend`  
**Backend Root:** `c:\Users\krusheek\Desktop\SIH\claimguard-ai\backend`  

---

## 1. Observation

Direct code examination and runtime probing of the ClaimGuard AI repository yielded the following findings:

### 1.1 Backend Architecture & Database State
- **Framework:** FastAPI with SQLAlchemy 2.0 async (`AsyncSession`, `aiosqlite`), Pydantic v2 schemas (`BaseModel`, `model_validator`, `computed_field`).
- **Database:** SQLite database located at `backend/claimguard.db`.
  - Schema tables verified via SQLite inspection: `claims`, `documents`, `analysis_runs`, `rule_verdicts`, `audit_logs`.
  - Current row count: `claims`: 0, `analysis_runs`: 0, `documents`: 0.
- **Config (`backend/app/config.py:1-18`):**
  - Database URL: `sqlite+aiosqlite:///./claimguard.db`
  - Max upload size: 25 MB (`MAX_UPLOAD_SIZE_MB: 25`)
  - Allowed MIME types: `["application/pdf", "image/jpeg", "image/png", "image/tiff"]`
  - VLM Provider: Anthropic (`claude-3-5-sonnet-20240620`) or OpenAI (`gpt-4o`).

### 1.2 Endpoints in Backend Routers
- `POST /api/upload` (`backend/app/api/upload.py:17-80`):
  - Consumes `file: UploadFile`, `document_type: str = Form(...)`, `claim_id: Optional[str] = Form(None)`.
  - Validates `document_type in ['HOSPITAL_BILL', 'INSURANCE_POLICY', 'REJECTION_LETTER']`.
  - Validates MIME type in `['application/pdf', 'image/jpeg', 'image/png', 'image/tiff']`.
  - Validates file size `<= 25 * 1024 * 1024` bytes.
  - Returns `{"claim_id": str, "document_id": str, "filename": str, "status": "success"}`.
- `GET /api/claims/{claim_id}/documents` (`backend/app/api/upload.py:82-101`):
  - Returns list of document records with `id`, `document_type`, `filename`, `file_path`, `created_at`, `extracted_data`.
- `GET /api/claims` (`backend/app/api/upload.py:103-114`):
  - Queries `Claim` table and returns `[{"id": claim.id, "status": claim.status, "updated_at": claim.updated_at.isoformat()}]`.
- `GET /api/stats` (`backend/app/api/upload.py:116-138`):
  - Returns:
    ```json
    {
      "total_claims": int,
      "pending_analysis": int,
      "mismatches_found": int,
      "total_recovered_amount": float
    }
    ```
- `POST /api/analyze/{claim_id}` (`backend/app/api/analysis.py:118-152`):
  - Verifies claim exists and has `>= 1` uploaded document.
  - Inserts `AnalysisRun` with `status="RUNNING"`.
  - Dispatches `BackgroundTasks` executing `run_analysis_pipeline(claim_id, analysis_run_id)`.
  - Returns `{"analysis_run_id": str, "status": "RUNNING"}`.
- `GET /api/analyze/{claim_id}/status` (`backend/app/api/analysis.py:154-170`):
  - Returns `{"analysis_run_id": str, "status": str, "started_at": str, "completed_at": Optional[str]}`.
- `GET /api/analyze/{claim_id}/result` (`backend/app/api/analysis.py:172-187`):
  - Returns:
    ```json
    {
      "analysis_run_id": str,
      "status": str,
      "result": { ...AnalysisResult dict with nested "forensics"... }
    }
    ```
- `GET /api/reports/{claim_id}` (`backend/app/api/reports.py:12-30`):
  - Returns `{"claim_id": str, "analysis_run_id": str, "report_data": dict, "overall_status": str, "total_monetary_impact": float}`.
- `GET /api/reports/{claim_id}/appeal` (`backend/app/api/reports.py:32-74`):
  - Renders Jinja2 appeal letter template using extracted documents and `AnalysisResult`.
  - Returns `{"appeal_text": str, "regulatory_citations": list[str], "monetary_impact": float}`.
- `GET /api/reports/{claim_id}/audit-trail` (`backend/app/api/reports.py:76-86`):
  - Verifies SHA-256 hash chain and returns `{"claim_id": str, "verified": bool, "audit_logs": list[dict]}`.
- `GET /api/health` (`backend/app/main.py:31-33`):
  - Returns `{"status": "ok"}`.

### 1.3 Discrepancies Between Backend Responses and Frontend Consumers
1. **Stats Response Keys (`Dashboard.jsx:33-36` vs `backend/app/api/upload.py:133-138`):**
   - Backend returns: `total_recovered_amount`, `pending_analysis`.
   - Frontend expects: `statsData.total_amount_recovered`, `statsData.pending_claims`.
   - Result: Frontend displays `₹0.00` and `0` unless aliased or normalized.
2. **Claims List Keys (`Dashboard.jsx:116-135` vs `backend/app/api/upload.py:107-113`):**
   - Frontend table expects: `claim.patient_name` / `claim.patient`, `claim.docs` / `claim.documents_count`, `claim.impact`, `claim.created_at`.
   - Backend returns only: `{"id": claim.id, "status": claim.status, "updated_at": claim.updated_at}`.
3. **Analysis Result Nesting (`Analysis.jsx:37-38, 163-178` vs `backend/app/api/analysis.py:183-187`):**
   - Backend `/api/analyze/{claim_id}/result` returns: `{ "analysis_run_id": "...", "status": "COMPLETED", "result": { "overall_status": "...", "rule_verdicts": [...] } }`.
   - Frontend sets `setResult(resultData)` and accesses `result.overall_status`, `result.total_monetary_impact`, `result.rule_verdicts`.
   - Result: Directly accessing `result.overall_status` evaluates to `undefined` because the payload is wrapped in `result.result`.
4. **Appeal Draft Response Keys (`Analysis.jsx:62-63` vs `backend/app/api/reports.py:70-74`):**
   - Backend returns: `{"appeal_text": "...", "regulatory_citations": [...], "monetary_impact": ...}`.
   - Frontend checks: `draft.content || draft.appeal_letter || draft.draft || 'Draft generated successfully.'`.
   - Result: Frontend fails to show the real letter text and falls back to the static string `'Draft generated successfully.'`.
5. **Forensics Engine Method Name Call (`backend/app/api/analysis.py:60` vs `backend/app/forensics/engine.py:17`):**
   - In `analysis.py:60`: `forensics_result = forensics_engine.run(documents)`.
   - In `engine.py:17`: The method is defined as `def run_all_checks(self, file_path: str, bill: Optional[HospitalBill] = None) -> ForensicsResult`.
   - Note: Frontend mock data layer must handle this seamlessly so UI rendering is resilient.

---

## 2. Logic Chain

1. The frontend overhaul requires an enterprise-grade UI displaying claims, detailed rule verdicts, forensics flags, and monetary breakdowns.
2. The authoritative backend models in `app/schemas/` (`hospital_bill.py`, `insurance_policy.py`, `rejection_letter.py`, `analysis_result.py`, `forensics_result.py`) define the exact mathematical properties and taxonomies used in audits.
3. The frontend's existing components (`Dashboard.jsx`, `Upload.jsx`, `Analysis.jsx`, `VerdictCard.jsx`) represent an initial prototype that only displays a fraction of available metrics. Crucially, forensic scores (ELA tamper score, suspicious regions, EXIF modifications, CGHS tariff deviations, length-of-stay padding, treatment contradictions) are currently computed by the backend but NOT displayed anywhere on the frontend.
4. Furthermore, because the local SQLite database currently contains 0 records, without an adapter/mock fallback layer that reconciles property discrepancies, frontend developers or preview users will encounter empty states or broken references.
5. Reconciling field mappings into a unified TypeScript / contract specification enables building advanced visualizations (charts, progress bars, interactive cards, audit trails) that remain strictly compatible with the backend API.

---

## 3. Caveats

- **Database Zero Records:** The current database `backend/claimguard.db` has initialized tables but no persisted claims or analysis runs. Frontend testing requires realistic mock payloads conforming to the authoritative schema.
- **Backend Forensics Invocation:** `backend/app/api/analysis.py` calls `forensics_engine.run(documents)` which differs from `ForensicsEngine.run_all_checks`. The frontend mock and schema definitions should anticipate the complete `ForensicsResult` structure defined in `schemas/forensics_result.py`.
- **Image vs PDF ELA Processing:** Error Level Analysis (ELA) produces heatmaps for image files (`.jpg`, `.jpeg`, `.png`), whereas `.pdf` documents are checked for editing software tags in their metadata stream (Photoshop, iLovePDF, GIMP).

---

## 4. Conclusion & Authoritative Specification

### 4.1 Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Document Intake | Multi-Document Upload | Uploads Hospital Bill, Policy, or Rejection Letter | `file` (binary), `document_type` (enum), optional `claim_id` | `claim_id`, `document_id`, `filename`, `status` | 400 for invalid type/mime or size >25MB; 404 if claim not found | `backend/app/api/upload.py:17` |
| 2 | Document Intake | Claim Document List | Lists all uploaded documents for a claim | `claim_id` (path) | List of documents with `extracted_data` | 404 if claim not found | `backend/app/api/upload.py:82` |
| 3 | Claim Pipeline | Analysis Trigger | Initiates extraction, rule audit, and forensics | `claim_id` (path) | `analysis_run_id`, `status: "RUNNING"` | 400 if no documents; 404 if claim not found | `backend/app/api/analysis.py:118` |
| 4 | Claim Pipeline | Analysis Polling | Returns current execution status | `claim_id` (path) | `analysis_run_id`, `status`, `started_at`, `completed_at` | 404 if run not found | `backend/app/api/analysis.py:154` |
| 5 | Claim Pipeline | Analysis Result | Returns complete rule verdicts & forensics results | `claim_id` (path) | `analysis_run_id`, `status`, `result` (`AnalysisResult`) | 404 if run not found | `backend/app/api/analysis.py:172` |
| 6 | Rule Engine | Proportionate Deduction | Enforces IRDAI May 2024 rule: only room-linked items deducted | Bill room rate, Policy limit, line items | `RuleVerdict` (`PASS`/`FAIL`/`NEEDS_REVIEW`), `monetary_impact` | Returns `SKIPPED` on missing data | `backend/app/rules/proportionate_deduction.py:13` |
| 7 | Rule Engine | Clause Timeline (Moratorium) | Enforces IRDAI 60-month moratorium against pre-existing denials | Inception date, claim date, rejection reasons | `RuleVerdict` (`PASS`/`FAIL`/`NEEDS_REVIEW`), citation | Returns `SKIPPED` if not pre-existing | `backend/app/rules/clause_timeline.py:14` |
| 8 | Rule Engine | Mental Health Parity | Enforces Mental Healthcare Act 2017 Sec 21(4) | Bill diagnosis, rejection category | `RuleVerdict` (`PASS`/`FAIL`/`SKIPPED`), `monetary_impact` | Returns `SKIPPED` if non-MH | `backend/app/rules/mental_health_parity.py:13` |
| 9 | Rule Engine | Waiting Period Audit | Audits Initial (30d), Specific (24m), or PED (48m) waiting periods | Policy dates, claim date, rejection details | `RuleVerdict` (`PASS`/`FAIL`/`SKIPPED`) | Returns `SKIPPED` if missing dates | `backend/app/rules/waiting_period.py:14` |
| 10 | Forensics | ELA Tampering Detection | Pixel-level recompression analysis, contours & heatmap | Document image (JPG, PNG) | `tamper_score`, `assessment`, `heatmap_url`, `suspicious_regions` | Returns default clean score on non-image | `backend/app/forensics/ela_detector.py:13` |
| 11 | Forensics | Metadata Scrutiny | Detects editing software (Photoshop, iLovePDF) or stripped EXIF | PDF or Image binary | `MetadataFlag[]` (tool, severity, expected vs actual) | Handled safely via try/catch | `backend/app/forensics/metadata_checker.py:6` |
| 12 | Forensics | CGHS Tariff & LOS Anomaly | Flags billing >2x or >3x CGHS benchmark and LOS padding | Bill diagnosis, length of stay, line item totals | `BillAnomalyFlag[]` (`LOS_PADDING`, `TARIFF_DEVIATION`, etc.) | Returns empty if line items absent | `backend/app/forensics/bill_anomaly.py:29` |
| 13 | Forensics | Medical Consistency | Cross-references diagnosis with expected vs contradictory drugs | Diagnosis, pharmacy and lab line item descriptions | `ConsistencyFlag[]` (mismatch type, severity, details) | Returns empty if diagnosis unknown | `backend/app/forensics/consistency_checker.py:33` |
| 14 | Reporting | Appeal Letter Generation | Generates formal legal grievance letter citing IRDAI clauses | `AnalysisResult`, Bill, Policy, Rejection letter | `appeal_text`, `regulatory_citations`, `monetary_impact` | 404 if analysis not completed | `backend/app/api/reports.py:32` |
| 15 | Audit Trail | Cryptographic SHA-256 Ledger | Block-chained audit log with previous hash verification | `claim_id` | `verified: boolean`, `audit_logs: AuditLog[]` | Returns `verified: false` if tampered | `backend/app/utils/audit_trail.py:40` |
| 16 | Dashboard | Aggregate System Metrics | Returns claim counts, mismatches, and recovered funds | None | `total_claims`, `pending_analysis`, `mismatches_found`, `total_recovered_amount` | Returns 0 on empty database | `backend/app/api/upload.py:116` |

---

### 4.2 Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Proportionate Deduction | Policy has no room rent limit (`room_rent_limit_per_day = None`) | Rule returns `PASS` with finding `"No room rent limit in policy. Proportionate deduction not applicable."` |
| 2 | Proportionate Deduction | Actual room rate `<= policy_room_limit` | Rule returns `PASS` with finding `"Actual room rate is within policy limit. No deduction applicable."` |
| 3 | Proportionate Deduction | Insurer approved more than calculated correct payable | Rule returns `NEEDS_REVIEW` with finding `"Insurer approved amount is higher than calculated correct payable. Manual review needed."` |
| 4 | Moratorium Timeline | Claim date between 36 and 60 months | Rule returns `NEEDS_REVIEW` citing conflict between Insurance Act Sec 45 (3 years) and 60-month moratorium rule. |
| 5 | Moratorium Timeline | Missing policy inception date or claim date | Rule returns `SKIPPED` with finding `"Missing policy inception or claim date."` |
| 6 | Mental Health Parity | Diagnosis contains mental health keyword (e.g. "depression") but insurer approved full amount | Rule returns `PASS` with finding `"Mental health coverage present and not rejected on mental health grounds."` |
| 7 | Bill Line Item Check | Sum of line items differs from bill `net_payable` by > ₹10 | Forensics produces `BillAnomalyFlag` with `anomaly_type: "ITEMIZATION_MISMATCH"` and severity `HIGH`. |
| 8 | EXIF Metadata Check | Image uploaded with EXIF tags completely stripped | Forensics produces `MetadataFlag` with `flag_type: "MISSING_EXIF"` and severity `LOW`. |
| 9 | PDF Metadata Check | PDF contains creator tags from `ilovepdf` or `photoshop` | Forensics produces `MetadataFlag` with `flag_type: "SUSPICIOUS_CREATION_TOOL"` and severity `HIGH`. |
| 10 | Analysis Results Polling | Frontend requests result before analysis background task completes | Returns HTTP 404 `"No analysis run found"` or status `"RUNNING"`, requiring client polling. |

---

### 4.3 Full TypeScript Type Definitions for Frontend

The following definitions should be used in `frontend/src/types/index.ts`:

```typescript
// ==========================================
// 1. Core Claim & Document Models
// ==========================================

export type ClaimStatus = 
  | 'PENDING' 
  | 'EXTRACTING' 
  | 'ANALYZING' 
  | 'COMPLETED' 
  | 'FAILED';

export type DocumentType = 
  | 'HOSPITAL_BILL' 
  | 'INSURANCE_POLICY' 
  | 'REJECTION_LETTER';

export interface DocumentRecord {
  id: string;
  claim_id?: string;
  document_type: DocumentType;
  filename: string;
  file_path: string;
  content_type?: string;
  file_size_bytes?: number;
  created_at: string;
  extracted_data?: HospitalBill | InsurancePolicy | RejectionLetter | null;
  extraction_confidence?: number;
  extraction_method?: 'vlm' | 'ocr';
}

export interface Claim {
  id: string;
  patient_name: string;
  policy_number?: string | null;
  claim_number?: string | null;
  status: ClaimStatus;
  created_at: string;
  updated_at: string;
  documents_count?: number;
  monetary_impact?: number;
}

// ==========================================
// 2. Extracted Hospital Bill
// ==========================================

export type BillCategory = 
  | 'ROOM' 
  | 'NURSING' 
  | 'CONSULTATION' 
  | 'LAB' 
  | 'RADIOLOGY' 
  | 'OT' 
  | 'PHARMACY' 
  | 'CONSUMABLES' 
  | 'MISCELLANEOUS';

export interface BillLineItem {
  item_code?: string | null;
  description: string;
  category: BillCategory;
  quantity: number;
  unit_rate: number;
  amount: number;
  total?: number;
  is_room_linked: boolean; // Vital for Proportionate Deduction calculations
}

export interface HospitalBill {
  bill_id?: string | null;
  total_amount: number;
  hospital_name: string;
  hospital_address?: string | null;
  gstin?: string | null;
  uhid?: string | null;
  patient_name: string;
  patient_age?: number | null;
  patient_gender?: string | null;
  admission_date?: string | null;
  discharge_date?: string | null;
  doctor_name?: string | null;
  ward_type?: string | null;
  bed_number?: string | null;
  tpa_or_insurer?: string | null;
  diagnosis?: string | null;
  line_items: BillLineItem[];
  subtotal: number;
  tax_amount: number;
  discount: number;
  net_payable: number;
  arithmetic_verified: boolean;
  extraction_confidence: number;
  room_charges_per_day?: number | null;
  length_of_stay?: number | null;
}

// ==========================================
// 3. Extracted Insurance Policy
// ==========================================

export interface WaitingPeriodConfig {
  category: 'INITIAL' | 'SPECIFIC_DISEASE' | 'PED';
  duration_days: number;
  applicable_conditions: string[];
}

export interface SubLimit {
  category: string;
  max_amount?: number | null;
  max_percentage?: number | null;
  description: string;
}

export interface InsurancePolicy {
  policy_number: string;
  insurer_name: string;
  policyholder_name: string;
  policy_holder_name?: string | null;
  inception_date?: string | null;
  original_inception_date?: string | null;
  policy_start_date: string;
  policy_end_date: string;
  sum_insured: number;
  room_rent_limit_per_day?: number | null;
  room_category_entitled?: string | null;
  copay_percentage: number;
  deductible: number;
  waiting_periods: WaitingPeriodConfig[];
  sub_limits: SubLimit[];
  covers_mental_health: boolean;
  covers_maternity: boolean;
  moratorium_period_months: number; // default 60
  exclusions: string[];
}

// ==========================================
// 4. Extracted Rejection / Settlement Letter
// ==========================================

export type RejectionCategory = 
  | 'PROPORTIONATE_DEDUCTION' 
  | 'WAITING_PERIOD' 
  | 'PRE_EXISTING' 
  | 'EXCLUSION' 
  | 'DOCUMENT_INCOMPLETE' 
  | 'MENTAL_HEALTH' 
  | 'OTHER'
  | 'Non-Medical'
  | 'Sub-limit Exhausted'
  | 'Waiting Period';

export interface RejectionReason {
  code: string;
  description: string;
  details?: string | null;
  clause_cited?: string | null;
  category: RejectionCategory;
}

export interface RejectionLetter {
  rejection_id?: string | null;
  reference_number: string;
  insurer_name: string;
  tpa_name?: string | null;
  policyholder_name: string;
  policy_number: string;
  claim_number: string;
  claim_date: string;
  total_claimed: number;
  total_approved: number;
  approved_amount?: number;
  total_deducted: number;
  rejection_reasons: RejectionReason[];
  reasons?: RejectionReason[];
  settlement_type: 'FULL_REJECTION' | 'PARTIAL_SETTLEMENT' | 'FULL_SETTLEMENT';
  remarks?: string | null;
  extraction_confidence: number;
  deduction_percentage?: number;
}

// ==========================================
// 5. Rule Engine & Verdicts
// ==========================================

export type VerdictStatus = 
  | 'PASS' 
  | 'FAIL' 
  | 'SKIPPED' 
  | 'NEEDS_REVIEW' 
  | 'WARNING';

export interface RuleVerdict {
  rule_name: string;
  rule_description: string;
  status: VerdictStatus;
  confidence: number; // 0.0 - 1.0
  finding: string;
  insurer_calculation?: number | null;
  correct_calculation?: number | null;
  monetary_impact?: number | null; // Underpayment amount
  regulatory_citation?: string | null;
  appeal_recommendation?: string | null;
}

export type OverallStatus = 
  | 'NO_MISMATCH_FOUND' 
  | 'MISMATCH_DETECTED' 
  | 'REVIEW_RECOMMENDED' 
  | 'EXTRACTION_FAILED';

export interface AnalysisResult {
  claim_id: string;
  analysis_timestamp: string;
  documents_analyzed: string[];
  overall_status: OverallStatus;
  rule_verdicts: RuleVerdict[];
  total_monetary_impact: number;
  tier1_issues: number;
  tier2_flags: number;
  summary: string;
  forensics?: ForensicsResult;
  // Optional enriched fields for frontend UI
  confidence_score?: number;
  total_insurer_calculation?: number;
  total_correct_calculation?: number;
}

// ==========================================
// 6. Forensics Models
// ==========================================

export type ELAAssessment = 'CLEAN' | 'SUSPICIOUS' | 'HIGHLY_SUSPICIOUS';

export interface ELAResult {
  tamper_score: number; // 0 to 100
  suspicious_regions: Array<{ x?: number; y?: number; width?: number; height?: number; area?: number }>;
  heatmap_path?: string | null;
  heatmap_url?: string | null;
  details: string;
  assessment: ELAAssessment;
}

export interface MetadataFlag {
  flag_type: string; // e.g. 'SUSPICIOUS_CREATION_TOOL', 'MULTIPLE_CREATION_TOOLS', 'MISSING_EXIF', 'SUSPICIOUS_SOFTWARE', 'LOW_RESOLUTION'
  field_name: string;
  expected_value?: string | null;
  actual_value: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
}

export interface BillAnomalyFlag {
  anomaly_type: 'LOS_PADDING' | 'TARIFF_DEVIATION' | 'DUPLICATE_BILLING' | 'ITEMIZATION_MISMATCH';
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  affected_items: string[];
  benchmark_value?: number | null;
  actual_value?: number | null;
}

export interface ConsistencyFlag {
  issue_type: string;
  mismatch_type?: 'DIAGNOSIS_MEDICINE' | 'DIAGNOSIS_TEST' | 'PROCEDURE_BILLING' | null;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  details: string;
}

export interface ForensicsResult {
  claim_id: string;
  ela_result?: ELAResult | null;
  metadata_flags: MetadataFlag[];
  bill_anomalies: BillAnomalyFlag[];
  bill_anomaly_flags?: BillAnomalyFlag[];
  consistency_flags: ConsistencyFlag[];
  overall_risk: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendation: string;
  disclaimer: string;
}

// ==========================================
// 7. Audit Trail & Reports
// ==========================================

export interface AuditLogEntry {
  id: number;
  claim_id?: string;
  action: string;
  actor: string;
  details: Record<string, any>;
  previous_hash?: string | null;
  entry_hash: string;
  created_at?: string;
}

export interface AuditTrailResponse {
  claim_id: string;
  verified: boolean;
  audit_logs: AuditLogEntry[];
}

export interface AppealDraftResponse {
  appeal_text: string;
  regulatory_citations: string[];
  monetary_impact: number;
}

export interface DashboardStats {
  total_claims: number;
  pending_analysis: number;
  mismatches_found: number;
  total_recovered_amount: number;
}
```

---

### 4.4 Exact Mathematical & Business Logic Formulations

#### 1. Proportionate Deduction Calculation (IRDAI Master Circular May 2024)
- **Condition:** Patient opted for room rate `R_actual > R_policy_limit`.
- **Deduction Factor:**
  $$\text{Factor} = \frac{R_{\text{policy\_limit}}}{R_{\text{actual}}}$$
- **Allowed Medical Expense Application:**
  - The deduction factor applies **ONLY** to associated room-linked charges: `ROOM`, `NURSING`, and hospital charges pegged directly to room category.
  - Fixed, independent medical charges (`OT`, `CONSULTATION`, `PHARMACY`, `LAB`, `IMPLANTS`) **MUST NOT** be deducted proportionately.
  $$\text{Correct Payable} = (\sum \text{Room Linked Items} \times \text{Factor}) + \sum \text{Fixed Items}$$
  $$\text{If Copay } > 0: \text{Correct Payable} = \text{Correct Payable} \times (1 - \frac{\text{Copay}}{100})$$
  $$\text{Monetary Underpayment} = \text{Correct Payable} - \text{Insurer Total Approved}$$

#### 2. Clause Timeline / Moratorium Calculation (IRDAI 60-Month Moratorium)
- **Elapsed Months:**
  $$\text{Months Elapsed} = \frac{\text{Claim Date} - \text{Policy Inception Date}}{30.44}$$
- **Rule Verdict:**
  - If $\text{Months Elapsed} \ge 60$: Rejection for non-disclosure or pre-existing disease is **ILLEGAL** $\rightarrow$ `FAIL`.
  - If $36 < \text{Months Elapsed} < 60$: Exceeds Insurance Act Sec 45 (3-year contestability window) but within 60 months $\rightarrow$ `NEEDS_REVIEW`.
  - If $\text{Months Elapsed} \le 36$: Contestation legally permitted $\rightarrow$ `PASS`.

#### 3. Mental Health Parity (Mental Healthcare Act 2017, Sec 21(4))
- Insurers cannot exclude, cap, or treat mental illness differently from somatic physical illness.
- If rejection reason category is `MENTAL_HEALTH`:
  $$\text{Monetary Impact} = \text{Total Claimed} - \text{Total Approved}$$

#### 4. Forensics Error Level Analysis (ELA) Scoring
- Computes pixel-level difference between original image and 90% recompressed JPEG:
  $$\text{Tamper Score} = \min(100.0, (\text{High Error Ratio} \times 1000) + (\text{Suspicious Contours} \times 2))$$
  - $< 20$: `CLEAN`
  - $20 - 50$: `SUSPICIOUS`
  - $> 50$: `HIGHLY_SUSPICIOUS`

#### 5. CGHS Tariff Benchmarks for Indian Healthcare
- Room: ₹2,000 - ₹5,000 / day
- Nursing: ₹500 - ₹1,500 / day
- Consultation: ₹500 - ₹2,000 / visit
- Lab: ₹200 - ₹5,000 / test
- Radiology: ₹1,000 - ₹15,000 / test
- OT: ₹10,000 - ₹50,000 / procedure
- Pharmacy: ₹500 - ₹30,000 / stay
- Consumables: ₹500 - ₹15,000 / stay
- Flag thresholds: $>2\times$ benchmark max $\rightarrow$ `MEDIUM` severity; $>3\times$ benchmark max $\rightarrow$ `HIGH` severity.

---

### 4.5 Recommended Normalized API Client Wrapper

To resolve all observed contract discrepancies cleanly without breaking backend changes, the frontend API service or adapter layer should normalize responses:

```javascript
// Example normalization helper for frontend/src/services/api.js or mock adapter:

export const normalizeStats = (backendStats) => ({
  total_claims: backendStats.total_claims ?? 0,
  pending_analysis: backendStats.pending_analysis ?? backendStats.pending_claims ?? 0,
  mismatches_found: backendStats.mismatches_found ?? 0,
  total_recovered_amount: backendStats.total_recovered_amount ?? backendStats.total_amount_recovered ?? 0,
});

export const normalizeAnalysisResult = (data) => {
  // If wrapped in { analysis_run_id, status, result: { ... } }, unwrap it
  const core = data.result || data;
  return {
    ...core,
    analysis_run_id: data.analysis_run_id || core.analysis_run_id,
    status: data.status || core.status || 'COMPLETED',
    overall_status: core.overall_status || 'MISMATCH_DETECTED',
    total_monetary_impact: core.total_monetary_impact ?? 0,
    rule_verdicts: core.rule_verdicts || [],
    forensics: core.forensics || null,
  };
};

export const normalizeAppealDraft = (data) => ({
  appeal_text: data.appeal_text || data.appeal_letter || data.content || data.draft || '',
  regulatory_citations: data.regulatory_citations || [],
  monetary_impact: data.monetary_impact ?? 0,
});
```

---

## 5. Verification Method

To independently verify all observations and extracted specifications:

1. **Verify Backend Models & Enums:**
   ```powershell
   python -c "from app.schemas.hospital_bill import HospitalBill; from app.schemas.insurance_policy import InsurancePolicy; from app.schemas.rejection_letter import RejectionLetter; from app.schemas.analysis_result import AnalysisResult; from app.schemas.forensics_result import ForensicsResult; print('Schemas imported successfully')"
   ```
2. **Verify Rules Engine Execution:**
   ```powershell
   pytest tests/test_rules.py -v
   ```
3. **Verify Forensics Engine Tests:**
   ```powershell
   pytest tests/test_forensics.py -v
   ```
4. **Verify Database Integrity & Row Counts:**
   ```powershell
   python -c "import sqlite3; conn = sqlite3.connect('claimguard.db'); cur = conn.cursor(); print(cur.execute('SELECT name FROM sqlite_master WHERE type=\'table\'').fetchall())"
   ```
5. **Verify Frontend Dependencies & Build:**
   ```powershell
   cd frontend
   npm run build
   ```
