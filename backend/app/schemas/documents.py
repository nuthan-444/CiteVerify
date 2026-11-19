"""Pydantic schemas for documents."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class DocumentUploadResponse(BaseModel):
    id: str
    filename: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class DocumentResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    status: str
    page_count: Optional[int] = None
    error_message: Optional[str] = None
    trust_score: Optional[float] = None
    doc_metadata: Optional[dict] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int


class DocumentStatusResponse(BaseModel):
    id: str
    status: str
    page_count: Optional[int] = None
    error_message: Optional[str] = None
    claims_count: int = 0
    citations_count: int = 0
    verifications_count: int = 0


class ProcessResponse(BaseModel):
    message: str
    document_id: str
    status: str
