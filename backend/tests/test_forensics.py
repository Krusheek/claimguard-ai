import pytest
from app.schemas.hospital_bill import HospitalBill, BillLineItem
from app.schemas.forensics_result import BillAnomalyFlag, ConsistencyFlag
from app.forensics.bill_anomaly import BillAnomalyDetector
from app.forensics.consistency_checker import ConsistencyChecker

def test_bill_anomaly_detector_normal_bill():
    # Creating a mock bill that conforms to what the rules actually access.
    class MockItem:
        def __init__(self, category, description, quantity, total):
            self.category = category
            self.description = description
            self.quantity = quantity
            self.total = total
            self.amount = total
            
    class MockBill:
        def __init__(self, diagnosis, length_of_stay, line_items, total_amount):
            self.diagnosis = diagnosis
            self.length_of_stay = length_of_stay
            self.line_items = line_items
            self.total_amount = total_amount
            
    bill = MockBill(
        diagnosis="appendectomy",
        length_of_stay=3,
        line_items=[
            MockItem(category="ROOM", description="Room", quantity=3, total=4000),
            MockItem(category="OT", description="Surgery", quantity=1, total=20000)
        ],
        total_amount=24000
    )
    detector = BillAnomalyDetector()
    flags = detector.analyze(bill)
    assert len(flags) == 0

def test_bill_anomaly_detector_inflated_charges():
    class MockItem:
        def __init__(self, category, description, quantity, total):
            self.category = category
            self.description = description
            self.quantity = quantity
            self.total = total
            self.amount = total
            
    class MockBill:
        def __init__(self, diagnosis, length_of_stay, line_items, total_amount):
            self.diagnosis = diagnosis
            self.length_of_stay = length_of_stay
            self.line_items = line_items
            self.total_amount = total_amount
            
    bill = MockBill(
        diagnosis="appendectomy",
        length_of_stay=3,
        line_items=[
            MockItem(category="ROOM", description="Room", quantity=3, total=20000),  # > 3x max (5000)
            MockItem(category="OT", description="Surgery", quantity=1, total=20000)
        ],
        total_amount=40000
    )
    detector = BillAnomalyDetector()
    flags = detector.analyze(bill)
    assert any(f.anomaly_type == "TARIFF_DEVIATION" for f in flags)

def test_consistency_checker_matching():
    bill = HospitalBill(
        hospital_name="Test",
        patient_name="Patient",
        diagnosis="appendectomy",
        line_items=[
            BillLineItem(category="PHARMACY", description="antibiotic", quantity=1, unit_rate=100, amount=100, is_room_linked=False),
            BillLineItem(category="LAB", description="cbc", quantity=1, unit_rate=100, amount=100, is_room_linked=False)
        ],
        subtotal=200,
        net_payable=200
    )
    checker = ConsistencyChecker()
    flags = checker.analyze(bill)
    assert len(flags) == 0

def test_consistency_checker_mismatch():
    bill = HospitalBill(
        hospital_name="Test",
        patient_name="Patient",
        diagnosis="appendectomy",
        line_items=[
            BillLineItem(category="PHARMACY", description="insulin", quantity=1, unit_rate=100, amount=100, is_room_linked=False),
            BillLineItem(category="LAB", description="cbc", quantity=1, unit_rate=100, amount=100, is_room_linked=False)
        ],
        subtotal=200,
        net_payable=200
    )
    checker = ConsistencyChecker()
    flags = checker.analyze(bill)
    assert any(f.mismatch_type == "DIAGNOSIS_MEDICINE" for f in flags)
