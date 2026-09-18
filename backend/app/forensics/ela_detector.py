import io
import os
try:
    import cv2
    import numpy as np
    CV2_AVAILABLE = True
except ImportError:
    cv2 = None
    np = None
    CV2_AVAILABLE = False

from PIL import Image, ImageChops, ImageEnhance
from ..schemas.forensics_result import ELAResult, MetadataFlag
from typing import Any

class ELADetector:
    def __init__(self, resave_quality: int = 90, scale_multiplier: float = 15.0):
        self.resave_quality = resave_quality
        self.scale_multiplier = scale_multiplier
    
    def analyze(self, image_path: str) -> ELAResult:
        """
        Perform Error Level Analysis on a document image.
        """
        if not CV2_AVAILABLE:
            return ELAResult(
                tamper_score=0.0,
                assessment="SKIPPED",
                flags=[MetadataFlag(
                    flag_type="SYSTEM",
                    description="OpenCV not available. ELA skipped.",
                    severity="LOW"
                )]
            )

        if not os.path.exists(image_path):
            return ELAResult(
                tamper_score=0.0,
                assessment="CLEAN",
                heatmap_url=None,
                suspicious_regions=[],
                details="File not found or not accessible."
            )
        try:
            # 1. Open original image
            original = Image.open(image_path).convert('RGB')
            
            # 2. Re-save as JPEG at reference quality
            buffer = io.BytesIO()
            original.save(buffer, 'JPEG', quality=self.resave_quality)
            buffer.seek(0)
            recompressed = Image.open(buffer)
            
            # 3. Compute absolute pixel-level difference
            diff = ImageChops.difference(original, recompressed)
            
            # 4. Dynamic scaling for visibility
            extrema = diff.getextrema()
            max_diff = max([ex[1] for ex in extrema])
            if max_diff == 0:
                max_diff = 1
            scale = 255.0 / max_diff
            
            # Use ImageEnhance to scale
            enhancer = ImageEnhance.Brightness(diff)
            diff_scaled = enhancer.enhance(self.scale_multiplier)
            
            # Convert to numpy for cv2
            diff_cv = np.array(diff_scaled.convert('L'))
            
            # 5. Statistical anomaly detection
            mean = np.mean(diff_cv)
            std = np.std(diff_cv)
            threshold = mean + 3.5 * std
            
            # 6. Find contours
            _, thresh = cv2.threshold(diff_cv, threshold, 255, cv2.THRESH_BINARY)
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            suspicious_count = 0
            img_area = diff_cv.shape[0] * diff_cv.shape[1]
            
            for cnt in contours:
                area = cv2.contourArea(cnt)
                if 40 < area < (0.3 * img_area):
                    suspicious_count += 1
                    
            # 7. Generate colored heatmap
            heatmap = cv2.applyColorMap(diff_cv, cv2.COLORMAP_JET)
            
            # 8. Compute tamper_score
            high_error_ratio = np.sum(diff_cv > threshold) / img_area
            tamper_score = min(100.0, (high_error_ratio * 1000) + (suspicious_count * 2))
            
            # 9. Save heatmap overlay image
            base_dir = os.path.dirname(image_path)
            base_name = os.path.basename(image_path)
            heatmap_path = os.path.join(base_dir, f"ela_heatmap_{base_name}.jpg")
            self._save_heatmap(heatmap, heatmap_path)
            
            # 10. Assessment
            if tamper_score < 20:
                assessment = "CLEAN"
            elif tamper_score < 50:
                assessment = "SUSPICIOUS"
            else:
                assessment = "HIGHLY_SUSPICIOUS"
                
            return ELAResult(
                tamper_score=tamper_score,
                assessment=assessment,
                heatmap_url=heatmap_path,
                suspicious_regions=[],
                details=f"Found {suspicious_count} suspicious regions."
            )
            
        except Exception as e:
            return ELAResult(
                tamper_score=0.0,
                assessment="CLEAN",
                heatmap_url=None,
                suspicious_regions=[],
                details=f"Error during ELA analysis: {str(e)}"
            )
    
    def _save_heatmap(self, heatmap: Any, output_path: str) -> str:
        """Save the ELA heatmap to disk and return path."""
        cv2.imwrite(output_path, heatmap)
        return output_path
