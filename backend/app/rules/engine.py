import importlib
from typing import List
from datetime import datetime

from ..schemas.hospital_bill import HospitalBill
from ..schemas.insurance_policy import InsurancePolicy
from ..schemas.rejection_letter import RejectionLetter
from ..schemas.analysis_result import AnalysisResult, RuleVerdict

from .rule_registry import get_all_rules, get_rule
import app.rules.proportionate_deduction
import app.rules.clause_timeline
import app.rules.mental_health_parity
import app.rules.waiting_period

class RuleEngine:
    def __init__(self):
        pass

    def run_all_rules(self, bill: HospitalBill, policy: InsurancePolicy, rejection: RejectionLetter) -> AnalysisResult:
        rules = get_all_rules()
        verdicts: List[RuleVerdict] = []
        
        for rule_info in rules:
            func = rule_info["function"]
            try:
                verdict = func(bill, policy, rejection)
                verdicts.append(verdict)
            except Exception as e:
                verdicts.append(
                    RuleVerdict(
                        status="SKIPPED",
                        rule_name=rule_info["name"],
                        rule_description=rule_info.get("description", "Rule execution failed"),
                        confidence=1.0,
                        finding=f"Error running rule: {str(e)}"
                    )
                )
                
        has_fail = any(v.status == "FAIL" for v in verdicts)
        has_review = any(v.status == "NEEDS_REVIEW" for v in verdicts)
        
        if has_fail:
            overall_status = "MISMATCH_DETECTED"
        elif has_review:
            overall_status = "REVIEW_RECOMMENDED"
        else:
            overall_status = "NO_MISMATCH_FOUND"
            
        fail_count = sum(1 for v in verdicts if v.status == "FAIL")
        review_count = sum(1 for v in verdicts if v.status == "NEEDS_REVIEW")
        summary = f"Rule engine completed. {fail_count} failures, {review_count} needs review."
        
        return AnalysisResult(
            claim_id=bill.bill_id if hasattr(bill, 'bill_id') and bill.bill_id else "unknown_claim",
            analysis_timestamp=datetime.utcnow(),
            documents_analyzed=[],
            overall_status=overall_status,
            summary=summary,
            rule_verdicts=verdicts
        )

    def run_single_rule(self, rule_name: str, bill: HospitalBill, policy: InsurancePolicy, rejection: RejectionLetter) -> RuleVerdict:
        func = get_rule(rule_name)
        if not func:
            return RuleVerdict(
                status="SKIPPED", 
                rule_name=rule_name, 
                rule_description="Rule not found",
                confidence=1.0,
                finding="Rule not found."
            )
        try:
            return func(bill, policy, rejection)
        except Exception as e:
            return RuleVerdict(
                status="SKIPPED", 
                rule_name=rule_name, 
                rule_description="Error running rule",
                confidence=1.0,
                finding=f"Error running rule: {str(e)}"
            )
