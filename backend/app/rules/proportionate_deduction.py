from ..schemas.hospital_bill import HospitalBill
from ..schemas.insurance_policy import InsurancePolicy
from ..schemas.rejection_letter import RejectionLetter
from ..schemas.analysis_result import RuleVerdict
from .rule_registry import register_rule

@register_rule(
    name="Proportionate Deduction Rule",
    description="Validates if proportionate deduction was correctly applied only to room-linked charges.",
    tier=1,
    regulatory_citation="IRDAI Master Circular on Health Insurance, May 2024 — Proportionate Deduction clause"
)
def check_proportionate_deduction(bill: HospitalBill, policy: InsurancePolicy, rejection: RejectionLetter) -> RuleVerdict:
    try:
        policy_room_limit = getattr(policy, 'room_rent_limit_per_day', None)
        if policy_room_limit is None:
            return RuleVerdict(
                status="PASS",
                rule_name="Proportionate Deduction Rule",
                rule_description="Validates if proportionate deduction was correctly applied only to room-linked charges.",
                confidence=1.0,
                finding="No room rent limit in policy. Proportionate deduction not applicable."
            )
        
        actual_room_rate = getattr(bill, 'room_charges_per_day', None)
        if not actual_room_rate or actual_room_rate <= policy_room_limit:
            return RuleVerdict(
                status="PASS",
                rule_name="Proportionate Deduction Rule",
                rule_description="Validates if proportionate deduction was correctly applied only to room-linked charges.",
                confidence=1.0,
                finding="Actual room rate is within policy limit. No deduction applicable."
            )

        deduction_factor = policy_room_limit / actual_room_rate
        
        room_linked_items = [item for item in getattr(bill, 'line_items', []) if getattr(item, 'is_room_linked', False)]
        fixed_items = [item for item in getattr(bill, 'line_items', []) if not getattr(item, 'is_room_linked', False)]
        
        room_linked_sum = sum(getattr(item, 'amount', 0.0) for item in room_linked_items)
        fixed_sum = sum(getattr(item, 'amount', 0.0) for item in fixed_items)
        
        room_linked_deducted = room_linked_sum * deduction_factor
        correct_payable = room_linked_deducted + fixed_sum
        
        copay = getattr(policy, 'copay_percentage', 0.0)
        if copay:
            correct_payable *= (1 - copay / 100.0)
            
        total_approved = getattr(rejection, 'total_approved', 0.0)
        
        if abs(correct_payable - total_approved) < 100:
            return RuleVerdict(
                status="PASS",
                rule_name="Proportionate Deduction Rule",
                rule_description="Validates if proportionate deduction was correctly applied only to room-linked charges.",
                confidence=1.0,
                finding="Insurer's approved amount matches correct proportionate deduction.",
                monetary_impact=0.0
            )
        
        if correct_payable > total_approved:
            monetary_impact = correct_payable - total_approved
            finding = (f"Room rate: ₹{actual_room_rate:.2f}/day, Policy limit: ₹{policy_room_limit:.2f}/day, "
                       f"Deduction factor: {policy_room_limit}/{actual_room_rate} = {deduction_factor:.4f}. "
                       f"Room-linked charges: ₹{room_linked_sum:.2f} (correctly deducted to ₹{room_linked_deducted:.2f}). "
                       f"Fixed charges: ₹{fixed_sum:.2f} (should NOT be deducted). "
                       f"Correct payable: ₹{correct_payable:.2f}, Insurer approved: ₹{total_approved:.2f}, "
                       f"Underpayment: ₹{monetary_impact:.2f}")
            appeal_recommendation = ("The insurer has incorrectly applied proportionate deduction to fixed charges. "
                                     "As per the IRDAI Master Circular on Health Insurance, May 2024, proportionate deduction "
                                     "can only be applied to associated medical expenses, not fixed charges. "
                                     f"This has resulted in an underpayment of ₹{monetary_impact:.2f}.")
            return RuleVerdict(
                status="FAIL",
                rule_name="Proportionate Deduction Rule",
                rule_description="Validates if proportionate deduction was correctly applied only to room-linked charges.",
                confidence=1.0,
                finding=finding,
                monetary_impact=monetary_impact,
                regulatory_citation="IRDAI Master Circular on Health Insurance, May 2024 — Proportionate Deduction clause",
                appeal_recommendation=appeal_recommendation
            )
            
        return RuleVerdict(
            status="NEEDS_REVIEW",
            rule_name="Proportionate Deduction Rule",
            rule_description="Validates if proportionate deduction was correctly applied only to room-linked charges.",
            confidence=1.0,
            finding="Insurer approved amount is higher than calculated correct payable. Manual review needed."
        )

    except Exception as e:
        return RuleVerdict(status="SKIPPED", rule_name="Proportionate Deduction Rule", rule_description="Validates if proportionate deduction was correctly applied only to room-linked charges.", confidence=1.0, finding=f"Error evaluating rule: {str(e)}")
