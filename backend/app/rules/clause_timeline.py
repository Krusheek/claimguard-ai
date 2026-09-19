from datetime import datetime
from ..schemas.hospital_bill import HospitalBill
from ..schemas.insurance_policy import InsurancePolicy
from ..schemas.rejection_letter import RejectionLetter
from ..schemas.analysis_result import RuleVerdict
from .rule_registry import register_rule

@register_rule(
    name="Clause Timeline Rule",
    description="Validates if the rejection violates the moratorium period for pre-existing conditions.",
    tier=1,
    regulatory_citation="IRDAI Master Circular on Health Insurance, May 2024, Para 5.3 — Moratorium Period of 60 months"
)
def check_clause_timeline(bill: HospitalBill, policy: InsurancePolicy, rejection: RejectionLetter) -> RuleVerdict:
    try:
        reasons_list = getattr(rejection, 'rejection_reasons', None) or getattr(rejection, 'reasons', []) or []
        has_pre_existing = any(getattr(reason, 'category', '') == "PRE_EXISTING" for reason in reasons_list)
        if not has_pre_existing:
            return RuleVerdict(status="SKIPPED", rule_name="Clause Timeline Rule", rule_description="Validates if the rejection violates the moratorium period for pre-existing conditions.", confidence=1.0, finding="No PRE_EXISTING reason cited.")
            
        policy_start = getattr(policy, 'inception_date', None) or getattr(policy, 'original_inception_date', None) or getattr(policy, 'policy_start_date', None)
        claim_date = getattr(rejection, 'claim_date', None)
        
        if not policy_start or not claim_date:
            return RuleVerdict(status="SKIPPED", rule_name="Clause Timeline Rule", rule_description="Validates if the rejection violates the moratorium period for pre-existing conditions.", confidence=1.0, finding="Missing policy inception or claim date.")
            
        if isinstance(policy_start, str):
            policy_start = datetime.fromisoformat(policy_start).date()
        if isinstance(claim_date, str):
            claim_date = datetime.fromisoformat(claim_date).date()
            
        delta_days = (claim_date - policy_start).days
        elapsed_months = delta_days / 30.44
        
        moratorium_period = getattr(policy, 'moratorium_period_months', 60)
        if moratorium_period is None:
            moratorium_period = 60
            
        if elapsed_months >= moratorium_period:
            finding = (f"Policy inception: {policy_start}, Claim date: {claim_date}, "
                       f"Elapsed: {elapsed_months:.1f} months. The {moratorium_period}-month moratorium has expired. "
                       "Insurer cannot contest pre-existing conditions after this period.")
            return RuleVerdict(
                status="FAIL",
                rule_name="Clause Timeline Rule",
                rule_description="Validates if the rejection violates the moratorium period for pre-existing conditions.",
                confidence=1.0,
                finding=finding,
                regulatory_citation="IRDAI Master Circular on Health Insurance, May 2024, Para 5.3 — Moratorium Period of 60 months",
                appeal_recommendation="Cite the expiry of the moratorium period under the IRDAI master circular, which legally prevents the insurer from rejecting claims based on non-disclosure of pre-existing conditions."
            )
        
        if elapsed_months > 36:
            return RuleVerdict(
                status="NEEDS_REVIEW",
                rule_name="Clause Timeline Rule",
                rule_description="Validates if the rejection violates the moratorium period for pre-existing conditions.",
                confidence=1.0,
                finding=f"Elapsed time is {elapsed_months:.1f} months, which exceeds Section 45 (3 years) but is less than the {moratorium_period}-month moratorium. Conflict detected."
            )
            
        return RuleVerdict(status="PASS", rule_name="Clause Timeline Rule", rule_description="Validates if the rejection violates the moratorium period for pre-existing conditions.", confidence=1.0, finding="Rejection within valid pre-existing contestation period.")
        
    except Exception as e:
        return RuleVerdict(status="SKIPPED", rule_name="Clause Timeline Rule", rule_description="Validates if the rejection violates the moratorium period for pre-existing conditions.", confidence=1.0, finding=f"Error evaluating rule: {str(e)}")
