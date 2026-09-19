# Task: Independent Review 1 - Code Quality, Interfaces & Test Suite

## Working Directory
`c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\reviewer_1`

## Authoritative References
- Original Request: `c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\ORIGINAL_REQUEST.md`
- Project Plan: `c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\orchestrator\PROJECT.md`
- Research Analysis: `c:\Users\krusheek\Desktop\SIH\claimguard-ai\RESEARCH_ANALYSIS.md`

## Review Scope:
1. Examine code quality, correctness, and interface compliance of:
   - `backend/app/forensics/fraud_scorer.py`
   - `backend/app/forensics/pdf_inspector.py`
   - `backend/app/rules/appeal_evaluator.py`
2. Inspect the test suite in `backend/tests/`:
   - Run `pytest backend/tests/` via `run_command` and inspect the output.
   - Verify that all existing tests and new feature tests in `test_new_features.py` pass cleanly.
3. Test backend startup:
   - Run `python -c "from app.main import app; print('App loaded successfully')"` via `run_command`.
4. Verify `c:\Users\krusheek\Desktop\SIH\claimguard-ai\RESEARCH_ANALYSIS.md` exists and covers all 15 papers.
5. Provide your explicit review verdict (`APPROVE` or `REQUEST_CHANGES`) in `c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\reviewer_1\handoff.md`.
6. Send a message to orchestrator with your findings and verdict.
