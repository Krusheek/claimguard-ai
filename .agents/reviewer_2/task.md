# Task: Independent Review 2 - System Integration & Backwards Compatibility

## Working Directory
`c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\reviewer_2`

## Authoritative References
- Original Request: `c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\ORIGINAL_REQUEST.md`
- Project Plan: `c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\orchestrator\PROJECT.md`
- Research Analysis: `c:\Users\krusheek\Desktop\SIH\claimguard-ai\RESEARCH_ANALYSIS.md`

## Review Scope:
1. Examine system integration and backwards compatibility:
   - `backend/app/forensics/engine.py` (ForensicsEngine integration of PDFInspector & FraudScorer, `run()` vs `run_all_checks()`)
   - `backend/app/rules/engine.py` & `rule_registry.py` (AppealEvaluator integration and rule registry)
   - `backend/app/api/analysis.py` and `backend/app/api/portal.py`
   - `backend/app/schemas/forensics_result.py` and `backend/app/schemas/analysis_result.py`
2. Inspect and execute tests:
   - Run `pytest backend/tests/` via `run_command` and inspect test logs.
3. Test backend startup:
   - Run `python -c "from app.main import app; print('App loaded successfully')"` via `run_command`.
4. Check edge cases, error handling, and type safety across the new modules.
5. Provide your explicit review verdict (`APPROVE` or `REQUEST_CHANGES`) in `c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\reviewer_2\handoff.md`.
6. Send a message to orchestrator with your findings and verdict.
