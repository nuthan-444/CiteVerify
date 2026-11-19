"""Reports router: generate and download verification reports."""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models import User, Document
from app.services.report_generator import report_generator

router = APIRouter(prefix="/api", tags=["reports"])


@router.get("/documents/{document_id}/report")
def get_report(
    document_id: str,
    format: str = "json",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generate a verification report for a document.
    
    Query params:
        format: "json" (default) or "html"
    """
    doc = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == current_user.id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.status != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Document processing not completed. Current status: {doc.status}",
        )

    if format == "html":
        html = report_generator.generate_html_report(db, document_id)
        return HTMLResponse(content=html)
    else:
        report = report_generator.generate_json_report(db, document_id)
        return JSONResponse(content=report)
