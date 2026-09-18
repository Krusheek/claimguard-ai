import os
from typing import Optional
from .ela_detector import ELADetector
from .metadata_checker import MetadataChecker
from .bill_anomaly import BillAnomalyDetector
from .consistency_checker import ConsistencyChecker
from ..schemas.hospital_bill import HospitalBill
from ..schemas.forensics_result import ForensicsResult, ELAResult

class ForensicsEngine:
    def __init__(self):
        self.ela_detector = ELADetector()
        self.metadata_checker = MetadataChecker()
        self.bill_anomaly_detector = BillAnomalyDetector()
        self.consistency_checker = ConsistencyChecker()
    
    def run_all_checks(self, file_path: str, bill: Optional[HospitalBill] = None) -> ForensicsResult:
        """
        Run all forensic checks on a document.
        """
        ela_result = ELAResult(
            tamper_score=0.0, 
            assessment="CLEAN", 
            heatmap_url=None, 
            suspicious_regions=[],
            details="Not analyzed"
        )
        ext = os.path.splitext(file_path)[1].lower()
        if ext in ['.jpg', '.jpeg', '.png']:
            ela_result = self.ela_detector.analyze(file_path)
            
        metadata_flags = self.metadata_checker.analyze(file_path)
        
        bill_flags = []
        consistency_flags = []
        if bill:
            bill_flags = self.bill_anomaly_detector.analyze(bill)
            consistency_flags = self.consistency_checker.analyze(bill)
            
        high_risk_count = sum(1 for f in metadata_flags if f.severity == "HIGH") + \
                          sum(1 for f in bill_flags if f.severity == "HIGH") + \
                          sum(1 for f in consistency_flags if f.severity == "HIGH")
                          
        if ela_result.assessment == "HIGHLY_SUSPICIOUS":
            high_risk_count += 2
            
        med_risk_count = sum(1 for f in metadata_flags if f.severity == "MEDIUM") + \
                         sum(1 for f in bill_flags if f.severity == "MEDIUM") + \
                         sum(1 for f in consistency_flags if f.severity == "MEDIUM")
                         
        if ela_result.assessment == "SUSPICIOUS":
            med_risk_count += 1
            
        overall_risk = "LOW"
        if high_risk_count > 0:
            overall_risk = "HIGH"
        elif med_risk_count > 1 or (med_risk_count == 1 and high_risk_count == 0):
            overall_risk = "MEDIUM"
            
        if overall_risk == "HIGH":
            recommendation = "Reject or escalate for manual review immediately. Strong forensic indicators of manipulation or fraud."
        elif overall_risk == "MEDIUM":
            recommendation = "Review carefully. Some anomalies detected."
        else:
            recommendation = "Appears standard. No major forensic anomalies detected."
            
        return ForensicsResult(
            claim_id=bill.bill_id if bill and hasattr(bill, 'bill_id') and bill.bill_id else "unknown_claim",
            overall_risk=overall_risk,
            recommendation=recommendation,
            ela_result=ela_result,
            metadata_flags=metadata_flags,
            bill_anomalies=bill_flags,
            consistency_flags=consistency_flags,
            disclaimer="This is an automated analysis. Final decisions should always involve human review."
        )
