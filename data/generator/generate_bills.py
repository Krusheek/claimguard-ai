import os
import json
import random
from datetime import datetime, timedelta
from fpdf import FPDF

HOSPITALS = [
    {"name": "Apex Multispeciality Hospital", "location": "Bengaluru", "gst": "29AAAAA0000A1Z5", "nabh": "NABH-1234"},
    {"name": "Fortis Memorial Research Institute", "location": "Gurugram", "gst": "06AAAAA0000A1Z5", "nabh": "NABH-1235"},
    {"name": "Apollo Hospitals", "location": "Hyderabad", "gst": "36AAAAA0000A1Z5", "nabh": "NABH-1236"},
    {"name": "Max Super Speciality Hospital", "location": "Delhi", "gst": "07AAAAA0000A1Z5", "nabh": "NABH-1237"},
    {"name": "Manipal Hospitals", "location": "Bengaluru", "gst": "29AAAAA0000A1Z6", "nabh": "NABH-1238"}
]

PATIENTS = [
    "Rahul Sharma", "Priya Patel", "Arun Kumar", "Deepika Reddy", "Suresh Menon",
    "Anita Desai", "Vikram Singh", "Meera Nair", "Rajesh Gupta", "Kavitha Iyer"
]

DIAGNOSES = [
    {"name": "Appendectomy (lap)", "ot_base": 30000, "room_base": 4000, "los_base": 3},
    {"name": "Cholecystectomy", "ot_base": 35000, "room_base": 4500, "los_base": 3},
    {"name": "LSCS", "ot_base": 28000, "room_base": 5000, "los_base": 4},
    {"name": "Knee Replacement", "ot_base": 150000, "room_base": 5000, "los_base": 7},
    {"name": "Cataract", "ot_base": 20000, "room_base": 3000, "los_base": 1}
]

class BillPDF(FPDF):
    def header(self):
        self.set_font("Arial", "B", 15)
        self.cell(0, 10, self.hospital['name'], 0, 1, "C")
        self.set_font("Arial", "", 10)
        self.cell(0, 5, f"{self.hospital['location']} | GSTIN: {self.hospital['gst']} | NABH: {self.hospital['nabh']}", 0, 1, "C")
        self.line(10, 27, 200, 27)
        self.ln(10)

def generate_bill(bill_idx, category):
    hospital = random.choice(HOSPITALS)
    patient = random.choice(PATIENTS)
    diagnosis = random.choice(DIAGNOSES)
    
    ot_charge = diagnosis['ot_base']
    room_charge = diagnosis['room_base']
    los = diagnosis['los_base']
    
    anomaly_desc = []
    
    if category == "room_rent_error":
        room_charge = random.choice([6000, 7000, 8000])
        anomaly_desc.append("High room rent")
    elif category == "inflated":
        ot_charge = ot_charge * random.uniform(3, 5)
        room_charge = room_charge * random.uniform(2, 3)
        anomaly_desc.append("Inflated charges")
    elif category == "mixed":
        room_charge = 8000
        los += 3
        ot_charge = ot_charge * 2
        anomaly_desc.append("Mixed anomalies (room rent, LOS, inflated)")
        
    items = [
        {"desc": "Room Rent", "cat": "Room", "qty": los, "rate": room_charge},
        {"desc": "OT Charges", "cat": "Surgery", "qty": 1, "rate": ot_charge},
        {"desc": "Doctor Visit", "cat": "Consultation", "qty": los, "rate": 1500},
        {"desc": "Medicines", "cat": "Pharmacy", "qty": 1, "rate": random.randint(5000, 15000)}
    ]
    
    if category == "mixed":
        items.append({"desc": "Room Rent", "cat": "Room", "qty": 1, "rate": room_charge})
    
    total = sum(i['qty'] * i['rate'] for i in items)
    
    pdf = BillPDF()
    pdf.hospital = hospital
    pdf.add_page()
    
    # Patient info
    pdf.set_font("Arial", "B", 10)
    pdf.cell(50, 6, f"Patient Name: {patient}", 0, 0)
    pdf.cell(50, 6, f"Diagnosis: {diagnosis['name']}", 0, 1)
    pdf.cell(50, 6, f"UHID: UHID{random.randint(10000,99999)}", 0, 1)
    pdf.ln(5)
    
    # Table header
    pdf.set_fill_color(200, 200, 200)
    cols = [("S.No", 15), ("Particulars", 70), ("Category", 30), ("Qty", 15), ("Rate", 25), ("Amount", 30)]
    for name, w in cols:
        pdf.cell(w, 8, name, 1, 0, "C", fill=True)
    pdf.ln()
    
    pdf.set_font("Arial", "", 10)
    for i, item in enumerate(items, 1):
        amt = item['qty'] * item['rate']
        pdf.cell(15, 8, str(i), 1, 0, "C")
        pdf.cell(70, 8, item['desc'], 1, 0, "L")
        pdf.cell(30, 8, item['cat'], 1, 0, "C")
        pdf.cell(15, 8, str(item['qty']), 1, 0, "C")
        pdf.cell(25, 8, f"{item['rate']:.2f}", 1, 0, "R")
        pdf.cell(30, 8, f"{amt:.2f}", 1, 1, "R")
        
    pdf.ln(5)
    pdf.set_font("Arial", "B", 10)
    pdf.cell(155, 8, "Total Amount:", 0, 0, "R")
    pdf.cell(30, 8, f"{total:.2f}", 1, 1, "R")
    
    filename = f"bill_{bill_idx:03d}_{category}.pdf"
    
    return pdf, filename, {
        "filename": filename,
        "patient": patient,
        "hospital": hospital['name'],
        "total_amount": float(total),
        "category": category,
        "anomalies": anomaly_desc
    }

def main():
    out_dir = os.path.join(os.path.dirname(__file__), '..', 'synthetic_bills')
    os.makedirs(out_dir, exist_ok=True)
    
    categories = (
        ["correct"] * 10 + 
        ["room_rent_error"] * 10 + 
        ["inflated"] * 10 + 
        ["mixed"] * 10
    )
    
    manifest = []
    
    for i, cat in enumerate(categories, 1):
        pdf, filename, meta = generate_bill(i, cat)
        pdf.output(os.path.join(out_dir, filename))
        manifest.append(meta)
        
    with open(os.path.join(out_dir, 'manifest.json'), 'w') as f:
        json.dump(manifest, f, indent=2)

if __name__ == '__main__':
    main()
