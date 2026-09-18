def indian_currency_filter(value: float) -> str:
    """Format float into Indian currency string, e.g., 1,50,000.00"""
    s = f"{value:.2f}"
    parts = s.split('.')
    int_part = parts[0]
    dec_part = parts[1]
    
    if len(int_part) <= 3:
        return s
        
    last_three = int_part[-3:]
    other_nums = int_part[:-3]
    
    res = []
    while len(other_nums) > 0:
        res.append(other_nums[-2:])
        other_nums = other_nums[:-2]
        
    res.reverse()
    formatted_int = ",".join(res) + "," + last_three
    return f"{formatted_int}.{dec_part}"


APPEAL_LETTER_TEMPLATE = """
Date: {{ date }}

To,
The Grievance Redressal Officer,
{{ insurer_name }}
{{ insurer_address }}

Subject: Appeal against {{ settlement_type }} of Health Insurance Claim
         Claim No: {{ claim_number }} | Policy No: {{ policy_number }}

Respected Sir/Madam,

I, {{ patient_name }}, holder of health insurance policy number {{ policy_number }}, am writing to formally appeal the {{ settlement_type | lower }} of my claim dated {{ claim_date }}.

**FACTS OF THE CASE:**
{{ facts_section }}

**GROUNDS OF APPEAL:**
{% for finding in findings %}
{{ loop.index }}. {{ finding.rule_description }}
   - Insurer's Position: {{ finding.finding }}
   - Correct Position: {{ finding.appeal_recommendation }}
   - Regulatory Basis: {{ finding.regulatory_citation }}
   - Monetary Impact: ₹{{ finding.monetary_impact | indian_currency }}
{% endfor %}

**TOTAL UNDERPAYMENT: ₹{{ total_impact | indian_currency }}**

**LEGAL BASIS:**
{{ legal_basis }}

**PRAYER:**
{{ prayer_section }}

I reserve my right to approach the Insurance Ombudsman under Rule 13 of the Insurance Ombudsman Rules, 2017, and/or the IRDAI Grievance Redressal Cell (Bima Bharosa / IGMS portal) should this appeal not be resolved satisfactorily within 30 days.

Thanking you,

{{ patient_name }}
Policy No: {{ policy_number }}
Contact: {{ contact_info }}
"""

REPORT_SUMMARY_TEMPLATE = """
Analysis Report Summary

Report ID: {{ report_id }}
Generated At: {{ generated_at }}
Overall Assessment: {{ overall_assessment }}

Claim Summary:
{{ claim_summary }}

Monetary Impact Summary:
- Total Claimed: ₹{{ monetary_impact_summary.total_claimed | indian_currency }}
- Insurer Approved: ₹{{ monetary_impact_summary.insurer_approved | indian_currency }}
- Correct Payable: ₹{{ monetary_impact_summary.correct_payable | indian_currency }}
- Underpayment: ₹{{ monetary_impact_summary.underpayment | indian_currency }}

Tier 1 Findings:
{% for finding in tier1_findings %}
- {{ finding.rule_description }}: {{ finding.finding }}
{% endfor %}

Tier 2 Flags:
{% for flag in tier2_flags %}
- {{ flag.rule_description }}: {{ flag.finding }}
{% endfor %}

Recommendations:
{% for rec in recommendations %}
- {{ rec }}
{% endfor %}
"""
