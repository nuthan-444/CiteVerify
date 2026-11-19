"""Pydantic schemas for verification."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class VerificationResultResponse(BaseModel):
    id: str
    claim_id: str
    citation_id: Optional[str] = None
    verdict: str
    confidence: Optional[float] = None
    reasoning: Optional[str] = None
    evidence_text: Optional[str] = None
    evidence_page: Optional[int] = None
    result_metadata: Optional[dict] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class VerificationListResponse(BaseModel):
    results: List[VerificationResultResponse]
    total: int
    document_trust_score: Optional[float] = None


# LLM verification output schema
class LLMVerdict(BaseModel):
    verdict: str = Field(
        ...,
        description="One of: supported, contradicted, insufficient_evidence",
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence score between 0 and 1",
    )
    reasoning: str = Field(
        ...,
        description="Explanation of the verdict",
    )
    evidence_text: Optional[str] = Field(
        None,
        description="Key evidence text supporting the verdict",
    )


class ReportResponse(BaseModel):
    document_id: str
    filename: str
    status: str
    total_claims: int
    supported_claims: int
    contradicted_claims: int
    insufficient_evidence_claims: int
    trust_score: float
    claims: List[dict]
    generated_at: datetime
