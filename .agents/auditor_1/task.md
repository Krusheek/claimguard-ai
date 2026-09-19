# Task: Forensic Integrity Audit

## Working Directory
`c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\auditor_1`

## Authoritative References
- Original Request: `c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\ORIGINAL_REQUEST.md`
- Project Plan: `c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\orchestrator\PROJECT.md`
- Research Analysis: `c:\Users\krusheek\Desktop\SIH\claimguard-ai\RESEARCH_ANALYSIS.md`

## Audit Objectives:
1. Forensic Code Integrity Analysis:
   - Check `backend/app/forensics/fraud_scorer.py`, `backend/app/forensics/pdf_inspector.py`, and `backend/app/rules/appeal_evaluator.py`.
   - Verify NO hardcoded test results, facade implementations, mock overrides in production logic, or trivial short-circuits.
   - Verify that `pdf_inspector.py` actually parses binary PDF structures (bytes, `%PDF`, `%%EOF`, `xref`).
   - Verify that `fraud_scorer.py` actually computes mathematical factor attributions and calibrations.
   - Verify that `appeal_evaluator.py` actually implements statutory rules and legal precedents.
2. Test Suite Authenticity Analysis:
   - Check `backend/tests/test_new_features.py`, `backend/tests/test_rules.py`, and `backend/tests/test_forensics.py`.
   - Verify that tests run genuine assertions and do not trivially assert `True == True` or bypass actual logic.
3. Deliverable Verification:
   - Verify `c:\Users\krusheek\Desktop\SIH\claimguard-ai\RESEARCH_ANALYSIS.md` exists at project root and genuinely covers all 15 papers.
4. Issue explicit audit verdict in `c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\auditor_1\handoff.md`:
   - `CLEAN` (No integrity violations detected) OR
   - `INTEGRITY VIOLATION` (with detailed evidence).
5. Send a message to orchestrator with your verdict.
