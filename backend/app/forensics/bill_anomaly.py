from ..schemas.hospital_bill import HospitalBill
from ..schemas.forensics_result import BillAnomalyFlag

# CGHS benchmark rates (2024)
CGHS_BENCHMARKS = {
    'ROOM': {'min': 2000, 'max': 5000, 'unit': 'per_day'},
    'NURSING': {'min': 500, 'max': 1500, 'unit': 'per_day'},
    'CONSULTATION': {'min': 500, 'max': 2000, 'unit': 'per_visit'},
    'LAB': {'min': 200, 'max': 5000, 'unit': 'per_test'},
    'RADIOLOGY': {'min': 1000, 'max': 15000, 'unit': 'per_test'},
    'OT': {'min': 10000, 'max': 50000, 'unit': 'per_procedure'},
    'PHARMACY': {'min': 500, 'max': 30000, 'unit': 'per_stay'},
    'CONSUMABLES': {'min': 500, 'max': 15000, 'unit': 'per_stay'},
}

# Average length of stay by diagnosis
TYPICAL_LOS = {
    'appendectomy': {'min': 2, 'max': 4},
    'cholecystectomy': {'min': 2, 'max': 5},
    'lscs': {'min': 3, 'max': 5},
    'caesarean': {'min': 3, 'max': 5},
    'knee replacement': {'min': 5, 'max': 8},
    'cataract': {'min': 1, 'max': 2},
    'angioplasty': {'min': 2, 'max': 4},
    'hernia': {'min': 1, 'max': 3},
    'hysterectomy': {'min': 3, 'max': 6},
}

class BillAnomalyDetector:
    def analyze(self, bill: HospitalBill) -> list[BillAnomalyFlag]:
        """
        Detect billing anomalies by comparing against CGHS benchmarks.
        """
        flags = []
        flags.extend(self._check_los_padding(bill))
        flags.extend(self._check_tariff_deviation(bill))
        flags.extend(self._check_duplicate_billing(bill))
        flags.extend(self._check_itemization(bill))
        return flags
    
    def _check_los_padding(self, bill: HospitalBill) -> list[BillAnomalyFlag]:
        flags = []
        if not bill.diagnosis or not getattr(bill, 'length_of_stay', None):
            return flags
            
        diag_lower = bill.diagnosis.lower()
        matched_diag = None
        for key in TYPICAL_LOS:
            if key in diag_lower:
                matched_diag = key
                break
                
        if matched_diag:
            typical_max = TYPICAL_LOS[matched_diag]['max']
            if bill.length_of_stay > typical_max * 1.5:
                flags.append(BillAnomalyFlag(
                    anomaly_type="LOS_PADDING",
                    description=f"Length of stay ({bill.length_of_stay} days) is significantly higher than typical max ({typical_max} days) for {matched_diag}",
                    severity="HIGH",
                    affected_items=[]
                ))
            elif bill.length_of_stay > typical_max:
                flags.append(BillAnomalyFlag(
                    anomaly_type="LOS_PADDING",
                    description=f"Length of stay ({bill.length_of_stay} days) is higher than typical max ({typical_max} days) for {matched_diag}",
                    severity="MEDIUM",
                    affected_items=[]
                ))
        return flags
    
    def _check_tariff_deviation(self, bill: HospitalBill) -> list[BillAnomalyFlag]:
        flags = []
        if not bill.line_items:
            return flags
            
        for item in bill.line_items:
            cat = item.category.upper() if item.category else ''
            if cat in CGHS_BENCHMARKS:
                bench_max = CGHS_BENCHMARKS[cat]['max']
                if item.amount > bench_max * 3:
                    flags.append(BillAnomalyFlag(
                        anomaly_type="TARIFF_DEVIATION",
                        description=f"Item '{item.description}' amount (₹{item.amount:.2f}) is >3x CGHS benchmark max (₹{bench_max:.2f})",
                        severity="HIGH",
                        affected_items=[item.description]
                    ))
                elif item.amount > bench_max * 2:
                    flags.append(BillAnomalyFlag(
                        anomaly_type="TARIFF_DEVIATION",
                        description=f"Item '{item.description}' amount (₹{item.amount:.2f}) is >2x CGHS benchmark max (₹{bench_max:.2f})",
                        severity="MEDIUM",
                        affected_items=[item.description]
                    ))
        return flags
    
    def _check_duplicate_billing(self, bill: HospitalBill) -> list[BillAnomalyFlag]:
        flags = []
        if not bill.line_items:
            return flags
            
        los = getattr(bill, 'length_of_stay', 1)
        if not los or los < 1:
            los = 1
            
        desc_counts = {}
        for item in bill.line_items:
            desc = item.description.lower().strip()
            if desc in desc_counts:
                desc_counts[desc] += item.quantity
            else:
                desc_counts[desc] = item.quantity
                
        for desc, total_qty in desc_counts.items():
            if total_qty > (los * 5) and total_qty > 10:  # Adjust threshold based on LOS
                flags.append(BillAnomalyFlag(
                    anomaly_type="DUPLICATE_BILLING",
                    description=f"Excessive quantity ({total_qty}) for item: '{desc}' relative to length of stay ({los} days)",
                    severity="MEDIUM",
                    affected_items=[desc]
                ))
        return flags
    
    def _check_itemization(self, bill: HospitalBill) -> list[BillAnomalyFlag]:
        flags = []
        if not bill.line_items or not getattr(bill, 'net_payable', None) or bill.net_payable <= 0:
            return flags
            
        calculated_total = sum(item.amount for item in bill.line_items)
        if abs(calculated_total - bill.net_payable) > 10.0:  # 10 INR tolerance
            flags.append(BillAnomalyFlag(
                anomaly_type="ITEMIZATION_MISMATCH",
                description=f"Sum of line items (₹{calculated_total:.2f}) does not match billed net payable (₹{bill.net_payable:.2f})",
                severity="HIGH",
                affected_items=[]
            ))
        return flags
