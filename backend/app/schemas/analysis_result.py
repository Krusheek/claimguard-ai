from pydantic import BaseModel, model_validator, ConfigDict
from typing import Optional, Literal, Union
from datetime import datetime

from .appeal_evaluation import AppealEvaluationResult

class RuleVerdict(BaseModel):
    model_config = ConfigDict(extra='ignore')
    rule_name: str
    rule_description: str = ""
    status: Literal["PASS", "FAIL", "SKIPPED", "NEEDS_REVIEW", "WARNING"]
    confidence: float = 1.0
    finding: str
    insurer_calculation: Optional[float] = None
    correct_calculation: Optional[float] = None
    monetary_impact: Optional[float] = None
    regulatory_citation: Optional[str] = None
    appeal_recommendation: Optional[str] = None

class AnalysisResult(BaseModel):
    model_config = ConfigDict(extra='ignore')
    claim_id: str = ""
    analysis_timestamp: Union[str, datetime] = ""
    documents_analyzed: list[str] = []
    overall_status: Literal["NO_MISMATCH_FOUND", "MISMATCH_DETECTED", "REVIEW_RECOMMENDED", "EXTRACTION_FAILED"]
    rule_verdicts: list[RuleVerdict]
    appeal_evaluation: Optional[AppealEvaluationResult] = None
    total_monetary_impact: float = 0.0
    tier1_issues: int = 0
    tier2_flags: int = 0
    summary: str

    @model_validator(mode='after')
    def compute_aggregates(self) -> 'AnalysisResult':
        impact = 0.0
        t1 = 0
        t2 = 0
        for rv in self.rule_verdicts:
            if rv.status == "FAIL":
                impact += (rv.monetary_impact or 0.0)
                t1 += 1
            elif rv.status == "NEEDS_REVIEW":
                t2 += 1
                
        self.total_monetary_impact = impact
        self.tier1_issues = t1
        self.tier2_flags = t2
        return self
