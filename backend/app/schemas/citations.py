"""Pydantic schemas for citations."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class CitationResponse(BaseModel):
    id: str
    claim_id: str
    source_type: str
    title: Optional[str] = None
    authors: Optional[List[str]] = None
    doi: Optional[str] = None
    url: Optional[str] = None
    publication_year: Optional[int] = None
    abstract: Optional[str] = None
    citation_metadata: Optional[dict] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class CitationListResponse(BaseModel):
    citations: List[CitationResponse]
    total: int


# Used internally for citation retrieval
class RetrievedCitation(BaseModel):
    source_type: str  # crossref, openalex, tavily
    title: Optional[str] = None
    authors: Optional[List[str]] = None
    doi: Optional[str] = None
    url: Optional[str] = None
    publication_year: Optional[int] = None
    abstract: Optional[str] = None
    metadata: Optional[dict] = None
