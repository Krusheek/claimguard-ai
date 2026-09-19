"""
Digital PDF Multi-Revision & Incremental Update Forensic Inspector.
Derived from Grobler et al., SAICSIT 2025 / arXiv:2507.00827:
"A Technique for the Detection of PDF Tampering or Forgery"
(Deconstructs PDF Document Object Model into revision chains, %%EOF offsets,
cross-reference table modifications, and overwritten indirect objects).
"""

import os
import re
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


from ..schemas.forensics_result import PDFRevisionInfo, PDFInspectionResult


class PDFInspector:
    """
    Pure Python forensic parser that inspects raw PDF byte streams to detect:
    - Incremental revision chaining (multiple %%EOF markers and byte offsets).
    - Multi-generational cross-reference tables (xref and /XRef streams).
    - Trailer dictionary mutations and /Prev pointer chains.
    - Overwritten indirect object IDs across successive revisions.
    - Suspicious modification tool traces (Photoshop, iLovePDF, Canva, PDFescape, Sejda).
    """

    SUSPICIOUS_TOOLS = [
        b"ilovepdf",
        b"canva",
        b"sejda",
        b"pdfescape",
        b"photoshop",
        b"nitro pdf",
        b"foxit phantom",
        b"smallpdf",
        b"pdf2go",
        b"soda pdf",
    ]

    def inspect_file(self, file_path: str) -> PDFInspectionResult:
        """Inspect a local PDF file on disk."""
        if not os.path.exists(file_path):
            return PDFInspectionResult(
                is_tampered=False,
                pdf_tamper_score=0.0,
                revisions=PDFRevisionInfo(
                    revision_count=0,
                    eof_offsets=[],
                    has_incremental_updates=False,
                    suspicious_modifications=["File not found on disk"],
                    overwritten_objects=[],
                ),
                anomalies=["File does not exist"],
                risk_level="CLEAN",
                details={"error": "FileNotFound", "file_path": file_path},
            )

        try:
            with open(file_path, "rb") as f:
                data = f.read()
            return self.inspect_bytes(data)
        except Exception as e:
            return PDFInspectionResult(
                is_tampered=False,
                pdf_tamper_score=0.5,
                revisions=PDFRevisionInfo(
                    revision_count=0,
                    eof_offsets=[],
                    has_incremental_updates=False,
                    suspicious_modifications=[f"Read error: {str(e)}"],
                    overwritten_objects=[],
                ),
                anomalies=[f"Failed to read file: {str(e)}"],
                risk_level="SUSPICIOUS",
                details={"error": str(e)},
            )

    def inspect_bytes(self, data: bytes) -> PDFInspectionResult:
        """Inspect PDF binary data directly."""
        anomalies: List[str] = []
        suspicious_mods: List[str] = []

        if not data:
            return PDFInspectionResult(
                is_tampered=False,
                pdf_tamper_score=0.0,
                revisions=PDFRevisionInfo(
                    revision_count=0,
                    eof_offsets=[],
                    has_incremental_updates=False,
                    suspicious_modifications=[],
                    overwritten_objects=[],
                ),
                anomalies=["Empty PDF byte stream"],
                risk_level="CLEAN",
                details={},
            )

        # 1. Header Validation
        header_match = re.search(rb"%PDF-(\d+\.\d+)", data[:1024])
        pdf_version = header_match.group(1).decode("ascii", errors="ignore") if header_match else None
        if not pdf_version:
            anomalies.append("Missing standard %PDF header within first 1024 bytes")

        # 2. EOF Marker Chaining (Incremental Updates)
        # Scan for %%EOF pattern and collect byte offsets
        eof_regex = re.compile(rb"%%EOF")
        eof_matches = [m.start() for m in eof_regex.finditer(data)]
        revision_count = max(1, len(eof_matches))
        has_incremental_updates = len(eof_matches) > 1

        if len(eof_matches) > 1:
            suspicious_mods.append(
                f"Multi-revision incremental update chaining detected: {len(eof_matches)} %%EOF markers found at offsets {eof_matches}"
            )

        # 3. Trailer /Prev Chains and XRef Sections
        prev_ptrs = re.findall(rb"/Prev\s+(\d+)", data)
        xref_sections = list(re.finditer(rb"\bxref\b|/Type\s*/XRef", data))

        if len(prev_ptrs) > 0:
            suspicious_mods.append(
                f"Trailer /Prev pointer chain detected with {len(prev_ptrs)} backward revision references"
            )

        if len(xref_sections) > 1:
            suspicious_mods.append(
                f"Multiple cross-reference tables detected ({len(xref_sections)} xref/XRef sections)"
            )

        # 4. Indirect Object Overwrite Detection
        # Match indirect object definitions: '<id> <generation> obj'
        obj_regex = re.compile(rb"(\d+)\s+(\d+)\s+obj")
        obj_positions: Dict[int, List[int]] = {}
        for m in obj_regex.finditer(data):
            obj_id = int(m.group(1))
            offset = m.start()
            if obj_id not in obj_positions:
                obj_positions[obj_id] = []
            obj_positions[obj_id].append(offset)

        overwritten_objects = sorted([
            oid for oid, offsets in obj_positions.items() if len(offsets) > 1
        ])

        if overwritten_objects:
            suspicious_mods.append(
                f"{len(overwritten_objects)} indirect objects overwritten across revisions (IDs: {overwritten_objects[:10]})"
            )

        # 5. Check for Known Tampering / Editing Software Traces
        lower_data = data.lower()
        found_tools = []
        for tool_sig in self.SUSPICIOUS_TOOLS:
            if tool_sig in lower_data:
                tool_name = tool_sig.decode("ascii")
                found_tools.append(tool_name)
                suspicious_mods.append(f"Web/consumer PDF editing software footprint detected: '{tool_name}'")

        # 6. Stream and Annotation Anomalies
        # Check for detached annotations or suspicious visual masking overlays
        annot_matches = len(re.findall(rb"/Subtype\s*/Highlight|/Subtype\s*/Square|/Subtype\s*/FreeText", data))
        if annot_matches > 0 and has_incremental_updates:
            suspicious_mods.append(
                f"Suspicious visual overlay annotations ({annot_matches}) present in appended revision"
            )

        # Form field manipulation (/AcroForm altered after signature)
        if rb"/AcroForm" in data and has_incremental_updates:
            suspicious_mods.append("Form field (/AcroForm) modifications present in secondary revision")

        # Calculate calibrated PDF tamper score (0.0 to 1.0)
        score = 0.0

        if not pdf_version:
            score += 0.35

        if has_incremental_updates:
            score += 0.30
            # Higher revision count increases suspicion
            if len(eof_matches) > 2:
                score += 0.15

        if overwritten_objects:
            score += min(0.35, 0.15 + (len(overwritten_objects) * 0.04))

        if len(xref_sections) > 1:
            score += 0.10

        if found_tools:
            score += min(0.30, len(found_tools) * 0.20)

        if annot_matches > 0 and has_incremental_updates:
            score += 0.15

        score = min(1.0, round(score, 2))
        is_tampered = score >= 0.45 or len(overwritten_objects) > 0 or len(found_tools) > 0

        if score >= 0.65:
            risk_level = "TAMPERED"
        elif score >= 0.30:
            risk_level = "SUSPICIOUS"
        else:
            risk_level = "CLEAN"

        anomalies.extend(suspicious_mods)

        details = {
            "pdf_version": pdf_version or "Unknown",
            "eof_count": len(eof_matches),
            "xref_sections_count": len(xref_sections),
            "overwritten_objects_count": len(overwritten_objects),
            "detected_tools": found_tools,
            "stream_size_bytes": len(data),
        }

        revisions = PDFRevisionInfo(
            revision_count=revision_count,
            eof_offsets=eof_matches,
            has_incremental_updates=has_incremental_updates,
            suspicious_modifications=suspicious_mods,
            overwritten_objects=overwritten_objects,
        )

        return PDFInspectionResult(
            is_tampered=is_tampered,
            pdf_tamper_score=score,
            revisions=revisions,
            anomalies=anomalies,
            risk_level=risk_level,
            details=details,
        )
