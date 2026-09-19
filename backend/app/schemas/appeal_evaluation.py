from pydantic import BaseModel, Field
from typing import List

class AppealEvaluationResult(BaseModel):
    overturn_probability: float  # 0.0 to 100.0%
    appeal_viability: str  # "STRONG" | "MODERATE" | "LOW"
    ombudsman_dispute_risk: float  # 0.0 to 100.0%
    statutory_violations_detected: List[str] = Field(default_factory=list)
    key_legal_precedents: List[str] = Field(default_factory=list)
    recommended_appeal_grounds: List[str] = Field(default_factory=list)
    suggested_action_plan: List[str] = Field(default_factory=list)
