"""Pydantic schemas for claims."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class ClaimBase(BaseModel):
    claim_text: str
    page_number: Optional[int] = None
    section: Optional[str] = None
    citation_marker: Optional[str] = None
    confidence: Optional[float] = None


class ClaimResponse(ClaimBase):
    id: str
    document_id: str
    claim_metadata: Optional[dict] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ClaimDetailResponse(ClaimResponse):
    citations: List["CitationBrief"] = []
    verification: Optional["VerificationBrief"] = None


class CitationBrief(BaseModel):
    id: str
    source_type: str
    title: Optional[str] = None
    doi: Optional[str] = None
    url: Optional[str] = None

    model_config = {"from_attributes": True}


class VerificationBrief(BaseModel):
    id: str
    verdict: str
    confidence: Optional[float] = None
    reasoning: Optional[str] = None

    model_config = {"from_attributes": True}


class ClaimListResponse(BaseModel):
    claims: List[ClaimResponse]
    total: int


# Extracted claim from LLM
class ExtractedClaim(BaseModel):
    claim_text: str
    page_number: Optional[int] = None
    section: Optional[str] = None
    citation_marker: Optional[str] = None


class ClaimExtractionResult(BaseModel):
    claims: List[ExtractedClaim]
