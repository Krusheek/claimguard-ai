from pydantic import BaseModel, model_validator, computed_field
from typing import Optional, Literal
from datetime import datetime

class BillLineItem(BaseModel):
    item_code: Optional[str] = None
    description: str
    category: Literal["ROOM", "NURSING", "CONSULTATION", "LAB", "RADIOLOGY", "OT", "PHARMACY", "CONSUMABLES", "MISCELLANEOUS"]
    quantity: float
    unit_rate: float
    amount: float
    total: float = 0.0
    is_room_linked: bool = False

class HospitalBill(BaseModel):
    bill_id: Optional[str] = None
    total_amount: float = 0.0
    hospital_name: str
    hospital_address: Optional[str] = None
    gstin: Optional[str] = None
    uhid: Optional[str] = None
    patient_name: str
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = None
    admission_date: Optional[str] = None
    discharge_date: Optional[str] = None
    doctor_name: Optional[str] = None
    ward_type: Optional[str] = None
    bed_number: Optional[str] = None
    tpa_or_insurer: Optional[str] = None
    diagnosis: Optional[str] = None
    line_items: list[BillLineItem]
    subtotal: float
    tax_amount: float = 0.0
    discount: float = 0.0
    net_payable: float
    arithmetic_verified: bool = False
    extraction_confidence: float = 1.0

    @model_validator(mode='after')
    def verify_arithmetic(self) -> 'HospitalBill':
        total = sum(item.amount for item in self.line_items)
        self.arithmetic_verified = abs(total - self.subtotal) <= 1.0
        return self

    @computed_field
    @property
    def room_charges_per_day(self) -> Optional[float]:
        for item in self.line_items:
            if item.category == "ROOM":
                return item.unit_rate
        return None

    @computed_field
    @property
    def length_of_stay(self) -> Optional[int]:
        if self.admission_date and self.discharge_date:
            def parse_date(d_str: str) -> datetime:
                try:
                    return datetime.fromisoformat(d_str.replace('Z', '+00:00'))
                except ValueError:
                    try:
                        return datetime.strptime(d_str, '%d/%m/%Y')
                    except ValueError:
                        return datetime.strptime(d_str, '%d-%m-%Y')
            try:
                admit = parse_date(self.admission_date)
                discharge = parse_date(self.discharge_date)
                days = (discharge.date() - admit.date()).days
                return max(1, days)
            except ValueError:
                return None
        return None
