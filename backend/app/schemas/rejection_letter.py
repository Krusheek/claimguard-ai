from pydantic import BaseModel, computed_field
from typing import Optional, Literal

class RejectionReason(BaseModel):
    code: str
    description: str
    details: Optional[str] = None
    clause_cited: Optional[str] = None
    category: Literal["PROPORTIONATE_DEDUCTION", "WAITING_PERIOD", "PRE_EXISTING", "EXCLUSION", "DOCUMENT_INCOMPLETE", "MENTAL_HEALTH", "OTHER", "Non-Medical", "Sub-limit Exhausted", "Waiting Period"]

class RejectionLetter(BaseModel):
    rejection_id: Optional[str] = None
    reference_number: str
    insurer_name: str
    tpa_name: Optional[str] = None
    policyholder_name: str
    policy_number: str
    claim_number: str
    claim_date: str
    total_claimed: float
    total_approved: float
    approved_amount: float = 0.0
    total_deducted: float
    rejection_reasons: list[RejectionReason]
    reasons: list[RejectionReason] = []
    settlement_type: Literal["FULL_REJECTION", "PARTIAL_SETTLEMENT", "FULL_SETTLEMENT"]
    remarks: Optional[str] = None
    extraction_confidence: float = 1.0

    @computed_field
    @property
    def deduction_percentage(self) -> float:
        if self.total_claimed > 0:
            return (self.total_deducted / self.total_claimed) * 100.0
        return 0.0
