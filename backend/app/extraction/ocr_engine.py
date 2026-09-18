try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    pytesseract = None
    TESSERACT_AVAILABLE = False
try:
    import numpy as np
except ImportError:
    np = None

from typing import Any

class OCREngine:
    def __init__(self):
        pass

    def extract_text(self, image: Any) -> str:
        """Full page OCR."""
        if not TESSERACT_AVAILABLE:
            return ""
        return pytesseract.image_to_string(image, config='--oem 3 --psm 6')
        
    def extract_with_confidence(self, image: Any) -> tuple[str, float]:
        """OCR with average confidence score."""
        if not TESSERACT_AVAILABLE:
            return "", 0.0
        data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
        text_parts = []
        confidences = []
        
        for i, conf in enumerate(data['conf']):
            if conf != '-1' and str(conf).isdigit():
                text_parts.append(data['text'][i])
                confidences.append(float(conf))
                
        text = ' '.join(text_parts).strip()
        avg_conf = sum(confidences) / len(confidences) if confidences else 0.0
        # Tesseract confidence is 0-100, normalize to 0.0-1.0
        return text, avg_conf / 100.0

    def extract_table(self, image: Any) -> list[list[str]]:
        """Table-aware OCR using image_to_data."""
        if not TESSERACT_AVAILABLE:
            return []
        data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
        
        words = []
        for i in range(len(data['text'])):
            text = data['text'][i].strip()
            if text:
                words.append({
                    'text': text,
                    'x': data['left'][i],
                    'y': data['top'][i],
                    'w': data['width'][i],
                    'h': data['height'][i]
                })
                
        # Group into rows by y-coordinate (allow small tolerance)
        rows = []
        if words:
            words.sort(key=lambda w: w['y'])
            current_row = [words[0]]
            
            for word in words[1:]:
                # If y-coordinate is within 10 pixels, consider it same row
                if abs(word['y'] - current_row[0]['y']) < 10:
                    current_row.append(word)
                else:
                    rows.append(current_row)
                    current_row = [word]
            if current_row:
                rows.append(current_row)
                
        # Sort each row by x-coordinate
        table = []
        for row in rows:
            row.sort(key=lambda w: w['x'])
            table.append([w['text'] for w in row])
            
        return table

    def extract_numbers(self, image: Any) -> str:
        """Numeric-only OCR."""
        if not TESSERACT_AVAILABLE:
            return ""
        custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist="0123456789.,₹Rs/- "'
        return pytesseract.image_to_string(image, config=custom_config).strip()

