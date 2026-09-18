import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import ForeignKey, func, String, Text
from sqlalchemy.types import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base

class Claim(Base):
    __tablename__ = "claims"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_name: Mapped[str] = mapped_column(String)
    policy_number: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    claim_number: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String)  # Enum: PENDING, EXTRACTING, ANALYZING, COMPLETED, FAILED
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())
    
    documents: Mapped[List["Document"]] = relationship(back_populates="claim", cascade="all, delete-orphan")
    analysis_runs: Mapped[List["AnalysisRun"]] = relationship(back_populates="claim", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    claim_id: Mapped[str] = mapped_column(ForeignKey("claims.id"))
    document_type: Mapped[str] = mapped_column(String)  # Enum: HOSPITAL_BILL, INSURANCE_POLICY, REJECTION_LETTER
    filename: Mapped[str] = mapped_column(String)
    file_path: Mapped[str] = mapped_column(String)
    content_type: Mapped[str] = mapped_column(String)
    file_size_bytes: Mapped[int] = mapped_column()
    extracted_data: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    extraction_confidence: Mapped[Optional[float]] = mapped_column(nullable=True)
    extraction_method: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    claim: Mapped["Claim"] = relationship(back_populates="documents")

class AnalysisRun(Base):
    __tablename__ = "analysis_runs"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    claim_id: Mapped[str] = mapped_column(ForeignKey("claims.id"))
    status: Mapped[str] = mapped_column(String)  # RUNNING, COMPLETED, FAILED
    result_data: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    forensics_data: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    overall_status: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    total_monetary_impact: Mapped[float] = mapped_column(default=0.0)
    started_at: Mapped[datetime] = mapped_column(server_default=func.now())
    completed_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)

    claim: Mapped["Claim"] = relationship(back_populates="analysis_runs")
    rule_verdicts: Mapped[List["RuleVerdictRecord"]] = relationship(back_populates="analysis_run", cascade="all, delete-orphan")

class RuleVerdictRecord(Base):
    __tablename__ = "rule_verdicts"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_run_id: Mapped[str] = mapped_column(ForeignKey("analysis_runs.id"))
    rule_name: Mapped[str] = mapped_column(String)
    rule_description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String)  # PASS, FAIL, SKIPPED, NEEDS_REVIEW
    confidence: Mapped[float] = mapped_column()
    finding: Mapped[str] = mapped_column(Text)
    insurer_calculation: Mapped[Optional[float]] = mapped_column(nullable=True)
    correct_calculation: Mapped[Optional[float]] = mapped_column(nullable=True)
    monetary_impact: Mapped[Optional[float]] = mapped_column(nullable=True)
    regulatory_citation: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    appeal_recommendation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    analysis_run: Mapped["AnalysisRun"] = relationship(back_populates="rule_verdicts")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    claim_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    action: Mapped[str] = mapped_column(String)
    actor: Mapped[str] = mapped_column(String, default="system")
    details: Mapped[Dict[str, Any]] = mapped_column(JSON)
    previous_hash: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    entry_hash: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
