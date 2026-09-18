from pydantic import BaseModel
from typing import Optional, Literal

class ELAResult(BaseModel):
    tamper_score: float
    suspicious_regions: list[dict] = []
    heatmap_path: Optional[str] = None
    heatmap_url: Optional[str] = None
    details: str = ""
    assessment: Literal["CLEAN", "SUSPICIOUS", "HIGHLY_SUSPICIOUS"]

class MetadataFlag(BaseModel):
    flag_type: str = ""
    field_name: str = ""
    expected_value: Optional[str] = None
    actual_value: str = ""
    severity: Literal["LOW", "MEDIUM", "HIGH"]
    description: str

class BillAnomalyFlag(BaseModel):
    anomaly_type: Literal["LOS_PADDING", "TARIFF_DEVIATION", "DUPLICATE_BILLING", "ITEMIZATION_MISMATCH"]
    description: str
    severity: Literal["LOW", "MEDIUM", "HIGH"]
    affected_items: list[str] = []
    benchmark_value: Optional[float] = None
    actual_value: Optional[float] = None

class ConsistencyFlag(BaseModel):
    issue_type: str = ""
    mismatch_type: Optional[Literal["DIAGNOSIS_MEDICINE", "DIAGNOSIS_TEST", "PROCEDURE_BILLING"]] = None
    description: str
    severity: Literal["LOW", "MEDIUM", "HIGH"]
    details: str = ""

class ForensicsResult(BaseModel):
    claim_id: str = ""
    ela_result: Optional[ELAResult] = None
    metadata_flags: list[MetadataFlag] = []
    bill_anomalies: list[BillAnomalyFlag] = []
    bill_anomaly_flags: list[BillAnomalyFlag] = []
    consistency_flags: list[ConsistencyFlag] = []
    overall_risk: Literal["LOW", "MEDIUM", "HIGH"]
    recommendation: str = "No issues detected"
    disclaimer: str = "These are automated flags for human review only. This system does not make fraud determinations."
