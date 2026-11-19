"""Citations router: list citations for a document."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models import User, Document, Claim, Citation
from app.schemas.citations import CitationResponse, CitationListResponse

router = APIRouter(prefix="/api", tags=["citations"])


@router.get("/documents/{document_id}/citations", response_model=CitationListResponse)
def list_citations_for_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all citations for all claims in a document."""
    doc = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == current_user.id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    citations = (
        db.query(Citation)
        .join(Claim)
        .filter(Claim.document_id == document_id)
        .order_by(Citation.created_at)
        .all()
    )

    return CitationListResponse(
        citations=[CitationResponse.model_validate(c) for c in citations],
        total=len(citations),
    )
