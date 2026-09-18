from datetime import datetime
from ..schemas.hospital_bill import HospitalBill
from ..schemas.insurance_policy import InsurancePolicy
from ..schemas.rejection_letter import RejectionLetter
from ..schemas.analysis_result import RuleVerdict
from .rule_registry import register_rule

@register_rule(
    name="Waiting Period Rule",
    description="Validates if the rejection based on waiting period is actually correct based on policy inception.",
    tier=1,
    regulatory_citation="IRDAI Master Circular on Health Insurance, May 2024 — Waiting Period provisions"
)
def check_waiting_period(bill: HospitalBill, policy: InsurancePolicy, rejection: RejectionLetter) -> RuleVerdict:
    try:
        wp_reasons = [r for r in getattr(rejection, 'rejection_reasons', []) if getattr(r, 'category', '') == "WAITING_PERIOD"]
        if not wp_reasons:
            return RuleVerdict(status="SKIPPED", rule_name="Waiting Period Rule", rule_description="Validates if the rejection based on waiting period is actually correct based on policy inception.", confidence=1.0, finding="No WAITING_PERIOD reason cited.")
            
        policy_start = getattr(policy, 'original_inception_date', getattr(policy, 'policy_start_date', None))
        claim_date = getattr(rejection, 'claim_date', None)
        
        if not policy_start or not claim_date:
            return RuleVerdict(status="SKIPPED", rule_name="Waiting Period Rule", rule_description="Validates if the rejection based on waiting period is actually correct based on policy inception.", confidence=1.0, finding="Missing policy inception or claim date.")
            
        if isinstance(policy_start, str):
            policy_start = datetime.fromisoformat(policy_start).date()
        if isinstance(claim_date, str):
            claim_date = datetime.fromisoformat(claim_date).date()
            
        delta_days = (claim_date - policy_start).days
        
        wp_required_days = getattr(policy, 'ped_waiting_period_months', 48) * 30.44
        category_name = "PED"
        
        wp_details = getattr(wp_reasons[0], 'details', '') or ""
        
        if "initial" in wp_details.lower() or "30 day" in wp_details.lower():
            wp_required_days = getattr(policy, 'initial_waiting_period_days', 30)
            category_name = "INITIAL"
        elif "specific" in wp_details.lower() or "2 year" in wp_details.lower():
            wp_required_days = getattr(policy, 'specific_illness_waiting_period_months', 24) * 30.44
            category_name = "SPECIFIC_DISEASE"
            
        if delta_days > wp_required_days:
            return RuleVerdict(
                status="FAIL",
                rule_name="Waiting Period Rule",
                rule_description="Validates if the rejection based on waiting period is actually correct based on policy inception.",
                confidence=1.0,
                finding=f"The {category_name} waiting period of {wp_required_days:.0f} days has expired. Days elapsed: {delta_days}. The insurer's rejection is incorrect.",
                regulatory_citation="IRDAI Master Circular on Health Insurance, May 2024 — Waiting Period provisions",
                appeal_recommendation=f"The insurer has wrongfully rejected the claim citing a {category_name} waiting period, which has already expired."
            )
            
        return RuleVerdict(
            status="PASS", 
            rule_name="Waiting Period Rule", 
            rule_description="Validates if the rejection based on waiting period is actually correct based on policy inception.",
            confidence=1.0,
            finding=f"Rejection is valid, {category_name} waiting period has not expired. Days elapsed: {delta_days}."
        )
        
    except Exception as e:
        return RuleVerdict(status="SKIPPED", rule_name="Waiting Period Rule", rule_description="Validates if the rejection based on waiting period is actually correct based on policy inception.", confidence=1.0, finding=f"Error evaluating rule: {str(e)}")
