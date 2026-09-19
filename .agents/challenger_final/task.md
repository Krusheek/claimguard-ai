# Task: Final Adversarial Verification - Full Stress Suite Execution

## Working Directory
`c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\challenger_final`

## Authoritative References
- Original Request: `c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\ORIGINAL_REQUEST.md`
- Project Plan: `c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\orchestrator\PROJECT.md`
- Remediation Report: `c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\worker_remediation\handoff.md`

## Objectives:
1. Run both adversarial stress test suites:
   `pytest backend/tests/test_adversarial_challenger_1.py -v`
   `pytest backend/tests/test_appeal_adversarial.py -v`
2. Verify that:
   - NaN / Inf values are sanitized to 0.0 without crashes.
   - Scale normalization operates correctly (tamper scores > 1.0 normalized).
   - Multi-revision and corrupted PDFs pass without unhandled exceptions.
   - Moratorium thresholds (59 vs 61 months) and mental health parity evaluate accurately.
   - All scores and probabilities stay strictly within $[0.0, 100.0\%]$.
3. Provide your explicit verdict (`APPROVE` or `REJECT`) in `handoff.md` and send a message to orchestrator.
