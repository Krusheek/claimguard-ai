import os
from PIL import Image, ExifTags
from ..schemas.forensics_result import MetadataFlag

class MetadataChecker:
    def analyze(self, file_path: str) -> list[MetadataFlag]:
        """
        Extract and analyze document metadata for forensic indicators.
        """
        if not os.path.exists(file_path):
            return []
            
        flags = []
        ext = os.path.splitext(file_path)[1].lower()
        
        if ext == '.pdf':
            flags.extend(self._analyze_pdf_metadata(file_path))
        elif ext in ['.jpg', '.jpeg', '.png', '.tiff']:
            flags.extend(self._analyze_image_metadata(file_path))
            
        return flags
    
    def _analyze_pdf_metadata(self, file_path: str) -> list[MetadataFlag]:
        """PDF-specific metadata checks."""
        flags = []
        try:
            with open(file_path, 'rb') as f:
                content = f.read()
                
            lower_content = content.lower()
            suspicious_tools = [b'photoshop', b'gimp', b'illustrator', b'pdf editor', b'ilovepdf']
            
            for tool in suspicious_tools:
                if tool in lower_content:
                    flags.append(MetadataFlag(
                        flag_type="SUSPICIOUS_CREATION_TOOL",
                        description=f"PDF created or modified using image/PDF editing software: {tool.decode()}",
                        severity="HIGH",
                        field_name="Creator/Producer",
                        actual_value=tool.decode()
                    ))
                    
            if content.count(b'/Creator') > 1 or content.count(b'/Producer') > 1:
                flags.append(MetadataFlag(
                    flag_type="MULTIPLE_CREATION_TOOLS",
                    description="Multiple Creator/Producer tags found, suggesting document was modified after creation",
                    severity="MEDIUM",
                    field_name="Creator/Producer",
                    actual_value="Multiple Tags Found"
                ))
                
        except Exception:
            pass
            
        return flags
    
    def _analyze_image_metadata(self, file_path: str) -> list[MetadataFlag]:
        """Image-specific EXIF checks."""
        flags = []
        try:
            img = Image.open(file_path)
            exif_data = None
            if hasattr(img, '_getexif'):
                exif_data = img._getexif()
            
            if not exif_data:
                flags.append(MetadataFlag(
                    flag_type="MISSING_EXIF",
                    description="EXIF data has been stripped, which is common in manipulated or internet-downloaded images",
                    severity="LOW",
                    field_name="EXIF",
                    actual_value="Missing"
                ))
                return flags
                
            exif = {
                ExifTags.TAGS.get(k, k): v
                for k, v in exif_data.items()
            }
            
            software = str(exif.get('Software', '')).lower()
            suspicious_software = ['photoshop', 'gimp', 'paint', 'snapseed', 'lightroom']
            for sw in suspicious_software:
                if sw in software:
                    flags.append(MetadataFlag(
                        flag_type="SUSPICIOUS_SOFTWARE",
                        description=f"Image edited with manipulation software: {software}",
                        severity="HIGH",
                        field_name="Software",
                        actual_value=software
                    ))
                    
            width, height = img.size
            if width < 500 or height < 500:
                flags.append(MetadataFlag(
                    flag_type="LOW_RESOLUTION",
                    description="Image resolution is very low for a scanned document",
                    severity="LOW",
                    field_name="Resolution",
                    actual_value=f"{width}x{height}"
                ))
                
        except Exception:
            pass
            
        return flags
