# Task: Adversarial Verification 1 - PDFInspector & FraudScorer Stress Testing

## Working Directory
`c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\challenger_1`

## Authoritative References
- Original Request: `c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\ORIGINAL_REQUEST.md`
- Project Plan: `c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\orchestrator\PROJECT.md`
- Research Analysis: `c:\Users\krusheek\Desktop\SIH\claimguard-ai\RESEARCH_ANALYSIS.md`

## Challenge Scope:
1. Empirically challenge `PDFInspector` (`backend/app/forensics/pdf_inspector.py`):
   - Test corrupted files, 0-byte files, non-PDF files, PDFs with 10+ fake incremental EOFs, malformed xref tables, missing /Prev pointers, huge binary payloads.
   - Verify that it never crashes with unhandled exceptions and always returns a valid `PDFInspectionResult`.
2. Empirically challenge `ExplainableFraudScorer` (`backend/app/forensics/fraud_scorer.py`):
   - Test extreme numerical values (negative bills, multi-crore amounts, NaN/None values, empty dictionaries).
   - Verify that overall score strictly satisfies `0.0 <= overall_fraud_score <= 100.0`.
   - Verify that factor attributions sum logically and risk tiers (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) align with score boundaries.
3. Write and run a test harness script to verify these adversarial conditions.
4. Record your explicit verdict (`APPROVE` or `REJECT`) in `c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\challenger_1\handoff.md`.
5. Send a message to orchestrator with your findings and verdict.
