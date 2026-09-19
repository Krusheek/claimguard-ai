# Task: Adversarial Verification 2 - AppealEvaluator & Pipeline Stress Testing

## Working Directory
`c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\challenger_2`

## Authoritative References
- Original Request: `c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\ORIGINAL_REQUEST.md`
- Project Plan: `c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\orchestrator\PROJECT.md`
- Research Analysis: `c:\Users\krusheek\Desktop\SIH\claimguard-ai\RESEARCH_ANALYSIS.md`

## Challenge Scope:
1. Empirically challenge `AppealEvaluator` (`backend/app/rules/appeal_evaluator.py`):
   - Test empty rejection reasons, unrecognized denial reasons, conflicting dates (admission prior to inception, inception in future, negative LOS).
   - Test edge-case statutory rules: 59 months vs 61 months for Moratorium rule (IRDAI 60-month threshold).
   - Test Mental Health Parity with disguised psychiatric rejections.
   - Verify overturn probability is strictly bounded within $[0.0, 100.0\%]$ and viability tiers (`STRONG`, `MODERATE`, `LOW`) are consistent.
2. Empirically test end-to-end integration:
   - Verify `RuleEngine.run_all_rules` processes claims without rejection, with partial rejection, and with severe statutory violations.
3. Write and run a test harness script to verify these adversarial conditions.
4. Record your explicit verdict (`APPROVE` or `REJECT`) in `c:\Users\krusheek\Desktop\SIH\claimguard-ai\.agents\challenger_2\handoff.md`.
5. Send a message to orchestrator with your findings and verdict.
