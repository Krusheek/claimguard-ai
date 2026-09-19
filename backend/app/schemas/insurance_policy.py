from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime

def _parse_date(d_str: str) -> datetime:
    try:
        return datetime.fromisoformat(d_str.replace('Z', '+00:00'))
    except ValueError:
        try:
            return datetime.strptime(d_str, '%d/%m/%Y')
        except ValueError:
            return datetime.strptime(d_str, '%d-%m-%Y')

class WaitingPeriodConfig(BaseModel):
    category: Literal["INITIAL", "SPECIFIC_DISEASE", "PED"]
    duration_days: int
    applicable_conditions: list[str]

class SubLimit(BaseModel):
    category: str
    max_amount: Optional[float] = None
    max_percentage: Optional[float] = None
    description: str

SubLimitConfig = SubLimit

class InsurancePolicy(BaseModel):
    policy_number: str
    insurer_name: str
    policyholder_name: str
    policy_holder_name: Optional[str] = None
    inception_date: Optional[str] = None
    original_inception_date: Optional[str] = None
    policy_start_date: str
    policy_end_date: str
    sum_insured: float
    room_rent_limit_per_day: Optional[float] = None
    room_category_entitled: Optional[str] = None
    copay_percentage: float = 0.0
    deductible: float = 0.0
    waiting_periods: list[WaitingPeriodConfig] = []
    sub_limits: list[SubLimit] = []
    covers_mental_health: bool = True
    covers_maternity: bool = False
    moratorium_period_months: int = 60
    exclusions: list[str] = []

    def is_moratorium_expired(self, claim_date: str) -> bool:
        try:
            start = _parse_date(self.policy_start_date)
            claim = _parse_date(claim_date)
            days = (claim - start).days
            return (days / 30.44) >= self.moratorium_period_months
        except ValueError:
            return False

    def get_waiting_period_status(self, category: str, claim_date: str) -> dict:
        try:
            start = _parse_date(self.policy_start_date)
            claim = _parse_date(claim_date)
            days_elapsed = (claim - start).days
            
            for wp in self.waiting_periods:
                if wp.category == category:
                    remaining = max(0, wp.duration_days - days_elapsed)
                    return {"expired": remaining == 0, "remaining_days": remaining}
            return {"expired": True, "remaining_days": 0}
        except ValueError:
            return {"expired": False, "remaining_days": -1}
