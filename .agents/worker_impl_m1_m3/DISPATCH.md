## 2026-09-18T15:35:20Z

You are the Core Feature Implementation Worker for ClaimGuard AI.
Your assigned working directory is: c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\worker_impl_m1_m3
Your task description is at: c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\worker_impl_m1_m3\task.md
The authoritative original user request is at: c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\ORIGINAL_REQUEST.md
The project plan and interface contracts are at: c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\orchestrator\PROJECT.md
The research analysis is at: c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\orchestrator\RESEARCH_ANALYSIS.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Instructions:
1. Read ORIGINAL_REQUEST.md, PROJECT.md, and your task.md.
2. Implement the 3 research-backed features:
   - Feature 1: Explainable Composite Fraud Risk Scorer (backend/app/forensics/fraud_scorer.py)
   - Feature 2: PDF Multi-Revision & Incremental Update Forensic Inspector (backend/app/forensics/pdf_inspector.py)
   - Feature 3: Denial Appeal Overturn Predictor & Statutory Ombudsman Risk Engine (backend/app/rules/appeal_evaluator.py)
3. Integrate them cleanly into:
   - backend/app/forensics/engine.py
   - backend/app/rules/engine.py & rule_registry.py
   - backend/app/schemas/ and backend/app/api/analysis.py (and fix the analysis.py / portal.py runtime method call bugs noted in task.md)
4. Copy or ensure c:\Users\krusheek\Desktop\SIH\claimguard-ai\RESEARCH_ANALYSIS.md exists at project root.
5. Fix the existing test assertion discrepancies in backend/tests/test_rules.py (rejection.rejection_reasons) and test_forensics.py (mismatch_type).
6. Create backend/tests/test_new_features.py covering all 3 new features thoroughly.
7. Run tests using `pytest backend/tests/` and verify that all tests pass without failures.
8. Verify that the FastAPI backend server starts cleanly without errors (e.g. `python -c "from app.main import app; print('App loaded successfully')"` and/or `uvicorn app.main:app`).
9. Write your detailed handoff report in c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\worker_impl_m1_m3\handoff.md.
10. Send a completion message back to the orchestrator with your results and test outputs.
