import os
try:
    import cv2
    import numpy as np
    CV2_AVAILABLE = True
except ImportError:
    cv2 = None
    np = None
    CV2_AVAILABLE = False

from typing import Dict, Any

from .preprocessor import prepare_document
from .ocr_engine import OCREngine
from .vlm_extractor import VLMExtractor

class ExtractionPipeline:
    def __init__(self, config: Dict[str, Any]):
        self.ocr_engine = OCREngine()
        
        vlm_provider = config.get("vlm_provider", "openai")
        vlm_api_key = config.get("vlm_api_key", "")
        self.use_vlm = bool(vlm_api_key)
        
        if self.use_vlm:
            self.vlm_extractor = VLMExtractor(provider=vlm_provider, api_key=vlm_api_key)
        else:
            self.vlm_extractor = None

    def _convert_image_to_bytes(self, image: Any) -> bytes:
        if not CV2_AVAILABLE:
            import io
            # Fallback to PIL
            buf = io.BytesIO()
            image.save(buf, format='PNG')
            return buf.getvalue()
            
        success, buffer = cv2.imencode('.png', image)
        if not success:
            raise ValueError("Could not encode image to PNG format")
        return buffer.tobytes()

    def process_document(self, file_path: str, expected_type: str = None) -> Dict[str, Any]:
        """Main entry point to process a document."""
        # 1. Prepare document
        pages = prepare_document(file_path)
        if not pages:
            raise ValueError("No pages extracted from document")
            
        full_text = []
        min_conf = 1.0
        has_complex_tables = False
        
        for page in pages:
            text, conf = self.ocr_engine.extract_with_confidence(page)
            full_text.append(text)
            min_conf = min(min_conf, conf)
            
            table = self.ocr_engine.extract_table(page)
            if len(table) > 1:
                has_complex_tables = True

        combined_text = "\n\n".join(full_text)
        
        # Determine strategy
        needs_vlm = False
        
        # 3. If OCR confidence < 70%, fall back to VLM
        if min_conf < 0.7:
            needs_vlm = True
            
        # 4. If VLM available and document is complex (has tables), use VLM
        if has_complex_tables:
            needs_vlm = True
            
        if needs_vlm and self.use_vlm:
            try:
                # 5. Classify document type using the first page
                first_page = pages[0]
                image_bytes = self._convert_image_to_bytes(first_page)
                mime_type = "image/png"
                
                doc_type = self.vlm_extractor.classify_document(image_bytes, mime_type)
                
                # 6. Return structured data as Pydantic model
                if doc_type == 'bill':
                    result = self.vlm_extractor.extract_hospital_bill(image_bytes, mime_type)
                elif doc_type == 'policy':
                    result = self.vlm_extractor.extract_insurance_policy(image_bytes, mime_type)
                elif doc_type == 'rejection':
                    result = self.vlm_extractor.extract_rejection_letter(image_bytes, mime_type)
                else:
                    raise ValueError(f"Unknown document classification: {doc_type}")
                    
                return {
                    "source": "vlm",
                    "type": doc_type,
                    "data": result,
                    "ocr_fallback_text": combined_text
                }
            except Exception as e:
                print(f"VLM extraction failed: {str(e)}. Falling back to OCR...")
                # Fall through to OCR block below

        # OCR Fallback Block (executed if VLM is disabled or if VLM threw an exception)
        from ..schemas.hospital_bill import HospitalBill
            from ..schemas.insurance_policy import InsurancePolicy
            from ..schemas.rejection_letter import RejectionLetter
            
            dummy_data = None
            doc_type = expected_type or "unknown"
            
            if expected_type == 'HOSPITAL_BILL':
                dummy_data = HospitalBill(bill_id="OCR_FALLBACK", total_amount=0.0, hospital_name="Unknown", patient_name="Unknown", line_items=[], subtotal=0.0, net_payable=0.0)
            elif expected_type == 'INSURANCE_POLICY':
                dummy_data = InsurancePolicy(policy_number="OCR_FALLBACK", policy_holder_name="Unknown", policy_start_date="2023-01-01", policy_end_date="2024-01-01", total_sum_insured=0.0)
            elif expected_type == 'REJECTION_LETTER':
                dummy_data = RejectionLetter(rejection_id="OCR_FALLBACK", claim_number="Unknown", claim_date="2023-01-01", patient_name="Unknown", total_claimed=0.0, total_approved=0.0, total_deducted=0.0)
                
            return {
                "source": "ocr",
                "type": doc_type,
                "text": combined_text,
                "confidence": min_conf,
                "data": dummy_data
            }

    def process_claim_documents(self, bill_path: str, policy_path: str, rejection_path: str) -> Dict[str, Any]:
        """Process a complete claim set."""
        results = {}
        
        if bill_path and os.path.exists(bill_path):
            results['bill'] = self.process_document(bill_path)
            
        if policy_path and os.path.exists(policy_path):
            results['policy'] = self.process_document(policy_path)
            
        if rejection_path and os.path.exists(rejection_path):
            results['rejection'] = self.process_document(rejection_path)
            
        return results
