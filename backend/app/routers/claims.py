"""Claims router: list claims for a document, get claim detail."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models import User, Document, Claim, Citation, VerificationResult
from app.schemas.claims import (
    ClaimResponse,
    ClaimListResponse,
    ClaimDetailResponse,
    CitationBrief,
    VerificationBrief,
)

router = APIRouter(prefix="/api", tags=["claims"])


@router.get("/documents/{document_id}/claims", response_model=ClaimListResponse)
def list_claims(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all claims for a document."""
    doc = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == current_user.id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    claims = (
        db.query(Claim)
        .filter(Claim.document_id == document_id)
        .order_by(Claim.page_number, Claim.created_at)
        .all()
    )

    return ClaimListResponse(
        claims=[ClaimResponse.model_validate(c) for c in claims],
        total=len(claims),
    )


@router.get("/claims/{claim_id}", response_model=ClaimDetailResponse)
def get_claim_detail(
    claim_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get claim detail with citations and verification."""
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    # Verify ownership
    doc = db.query(Document).filter(
        Document.id == claim.document_id,
        Document.user_id == current_user.id,
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Claim not found")

    # Get citations
    citations = db.query(Citation).filter(Citation.claim_id == claim_id).all()
    citation_briefs = [
        CitationBrief(
            id=c.id,
            source_type=c.source_type,
            title=c.title,
            doi=c.doi,
            url=c.url,
        )
        for c in citations
    ]

    # Get verification result
    verification = (
        db.query(VerificationResult)
        .filter(VerificationResult.claim_id == claim_id)
        .first()
    )
    verification_brief = None
    if verification:
        verification_brief = VerificationBrief(
            id=verification.id,
            verdict=verification.verdict,
            confidence=verification.confidence,
            reasoning=verification.reasoning,
        )

    return ClaimDetailResponse(
        id=claim.id,
        document_id=claim.document_id,
        claim_text=claim.claim_text,
        page_number=claim.page_number,
        section=claim.section,
        citation_marker=claim.citation_marker,
        confidence=claim.confidence,
        claim_metadata=claim.claim_metadata,
        created_at=claim.created_at,
        citations=citation_briefs,
        verification=verification_brief,
    )
