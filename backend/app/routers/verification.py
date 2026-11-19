"""Verification router: get verification results for a document."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models import User, Document, Claim, VerificationResult
from app.schemas.verification import VerificationResultResponse, VerificationListResponse

router = APIRouter(prefix="/api", tags=["verification"])


@router.get("/documents/{document_id}/verification", response_model=VerificationListResponse)
def list_verification_results(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all verification results for a document."""
    doc = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == current_user.id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    results = (
        db.query(VerificationResult)
        .join(Claim)
        .filter(Claim.document_id == document_id)
        .order_by(VerificationResult.created_at)
        .all()
    )

    # Calculate trust score
    total = len(results)
    supported = sum(1 for r in results if r.verdict == "supported")
    trust_score = round(supported / total, 3) if total > 0 else None

    return VerificationListResponse(
        results=[VerificationResultResponse.model_validate(r) for r in results],
        total=total,
        document_trust_score=trust_score,
    )
