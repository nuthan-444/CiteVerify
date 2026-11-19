"""Documents router: upload, list, get, delete, process, status."""

import os
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, status
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.middleware.auth import get_current_user
from app.models import User, Document, Claim, Citation, VerificationResult, DocumentChunk
from app.schemas.documents import (
    DocumentResponse,
    DocumentListResponse,
    DocumentStatusResponse,
    DocumentUploadResponse,
    ProcessResponse,
)

logger = logging.getLogger(__name__)

from app.services.pdf_processor import SUPPORTED_EXTENSIONS, SUPPORTED_EXTENSIONS_LABEL

router = APIRouter(prefix="/api/documents", tags=["documents"])


# --- Background processing pipeline ---

def run_processing_pipeline(document_id: str, db_url: str = ""):
    """Run the full processing pipeline in the background."""
    from app.database import SessionLocal

    db = SessionLocal()

    try:
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            logger.error(f"Document {document_id} not found for processing")
            return

        document.status = "processing"
        document.updated_at = datetime.now(timezone.utc)
        db.commit()

        # Step 1: Extract text from PDF
        logger.info(f"Step 1: Extracting text from {document.filename}")
        from app.services.pdf_processor import pdf_processor
        pdf_res = pdf_processor.process_pdf(document.storage_path)
        if len(pdf_res) == 3:
            pages, chunks, page_count = pdf_res
        else:
            pages, chunks = pdf_res[0], pdf_res[1]
            page_count = len(pages)
        document.page_count = page_count
        db.commit()

        # Step 2: Generate embeddings and store chunks
        logger.info(f"Step 2: Embedding {len(chunks)} chunks")
        from app.services.rag_pipeline import rag_pipeline
        rag_pipeline.embed_and_store_chunks(db, document_id, chunks)

        # Step 3: Extract claims
        logger.info("Step 3: Extracting claims")
        from app.services.claim_extractor import claim_extractor
        extracted_claims = claim_extractor.extract_claims_from_pages(pages)

        # Save claims to DB
        db_claims = []
        for ec in extracted_claims:
            claim = Claim(
                document_id=document_id,
                claim_text=ec.claim_text,
                page_number=ec.page_number,
                section=ec.section,
                citation_marker=ec.citation_marker,
            )
            db.add(claim)
            db_claims.append(claim)
        db.commit()
        for c in db_claims:
            db.refresh(c)

        # Step 4: Retrieve citations for each claim
        logger.info(f"Step 4: Retrieving citations for {len(db_claims)} claims")
        from app.services.citation_retriever import citation_retriever

        for claim in db_claims:
            try:
                retrieved = citation_retriever.retrieve_citations(
                    claim_text=claim.claim_text,
                    citation_marker=claim.citation_marker,
                )
                for rc in retrieved:
                    citation = Citation(
                        claim_id=claim.id,
                        source_type=rc.source_type,
                        title=rc.title,
                        authors=rc.authors,
                        doi=rc.doi,
                        url=rc.url,
                        publication_year=rc.publication_year,
                        abstract=rc.abstract,
                        citation_metadata=rc.metadata,
                    )
                    db.add(citation)
            except Exception as e:
                logger.warning(f"Citation retrieval failed for claim {claim.id}: {e}")
        db.commit()

        # Step 5: Verify each claim
        logger.info("Step 5: Verifying claims")
        from app.services.verifier import verifier

        for claim in db_claims:
            try:
                # Get RAG evidence
                evidence = rag_pipeline.retrieve_evidence(db, document_id, claim.claim_text, top_k=3)

                # Get citation info
                claim_citations = db.query(Citation).filter(Citation.claim_id == claim.id).all()
                citation_dicts = [
                    {
                        "title": c.title,
                        "authors": c.authors or [],
                        "doi": c.doi,
                        "publication_year": c.publication_year,
                        "abstract": c.abstract,
                    }
                    for c in claim_citations
                ]
                citation_info = verifier.format_citation_for_verification(citation_dicts)

                # Run verification
                verdict = verifier.verify_claim(
                    claim_text=claim.claim_text,
                    citation_info=citation_info,
                    evidence_chunks=evidence,
                )

                # Store result
                result = VerificationResult(
                    claim_id=claim.id,
                    citation_id=claim_citations[0].id if claim_citations else None,
                    verdict=verdict.verdict,
                    confidence=verdict.confidence,
                    reasoning=verdict.reasoning,
                    evidence_text=verdict.evidence_text,
                    evidence_page=evidence[0]["page_number"] if evidence else None,
                )
                db.add(result)
            except Exception as e:
                logger.warning(f"Verification failed for claim {claim.id}: {e}")
                result = VerificationResult(
                    claim_id=claim.id,
                    verdict="insufficient_evidence",
                    confidence=0.0,
                    reasoning=f"Verification error: {str(e)}",
                )
                db.add(result)
        db.commit()

        # Step 6: Compute overall document trust score
        results = (
            db.query(VerificationResult)
            .join(Claim)
            .filter(Claim.document_id == document_id)
            .all()
        )
        if results:
            total_weight = 0.0
            weighted_score = 0.0
            for r in results:
                conf = r.confidence if r.confidence is not None else 0.5
                if r.verdict == "supported":
                    weighted_score += conf
                    total_weight += 1.0
                elif r.verdict == "contradicted":
                    weighted_score += (1.0 - conf) * 0.2
                    total_weight += 1.0
                else:
                    weighted_score += 0.5
                    total_weight += 0.5
            calculated_trust = round((weighted_score / total_weight) * 100, 1) if total_weight > 0 else 0.0
        else:
            calculated_trust = 0.0

        metadata = dict(document.doc_metadata or {})
        metadata["trust_score"] = calculated_trust
        document.doc_metadata = metadata

        # Mark as completed
        document.status = "completed"
        document.updated_at = datetime.now(timezone.utc)
        db.commit()
        logger.info(f"Processing completed for document {document_id} with trust score {calculated_trust}%")

    except Exception as e:
        logger.error(f"Processing pipeline failed for {document_id}: {e}")
        try:
            document = db.query(Document).filter(Document.id == document_id).first()
            if document:
                document.status = "error"
                document.error_message = str(e)[:1000]
                document.updated_at = datetime.now(timezone.utc)
                db.commit()
        except Exception:
            pass
    finally:
        db.close()


# --- Endpoints ---

@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload a document (PDF, DOCX, ODT, ODP, PPTX, TXT, MD, RST, TEX, RTF, HTML, etc.)."""
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in SUPPORTED_EXTENSIONS and ext not in {"", ".readme", ".bib", ".csv"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Accepted: {SUPPORTED_EXTENSIONS_LABEL}",
        )

    # Create uploads directory if needed
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Save file
    file_id = str(uuid.uuid4())
    safe_filename = f"{file_id}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    # Create document record
    document = Document(
        id=file_id,
        user_id=current_user.id,
        filename=file.filename,
        storage_path=file_path,
        status="uploaded",
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    return DocumentUploadResponse(
        id=document.id,
        filename=document.filename,
        status=document.status,
        created_at=document.created_at,
    )


def _calculate_doc_trust_score(doc: Document, db: Session) -> Optional[float]:
    """Retrieve or dynamically compute document trust score."""
    if doc.doc_metadata and "trust_score" in doc.doc_metadata:
        try:
            return float(doc.doc_metadata["trust_score"])
        except (ValueError, TypeError):
            pass

    # If completed, compute dynamically from verification results
    if doc.status != "completed":
        return None

    results = (
        db.query(VerificationResult)
        .join(Claim)
        .filter(Claim.document_id == doc.id)
        .all()
    )
    if not results:
        return 0.0

    total_weight = 0.0
    weighted_score = 0.0
    for r in results:
        conf = r.confidence if r.confidence is not None else 0.5
        if r.verdict == "supported":
            weighted_score += conf
            total_weight += 1.0
        elif r.verdict == "contradicted":
            weighted_score += (1.0 - conf) * 0.2
            total_weight += 1.0
        else:
            weighted_score += 0.5
            total_weight += 0.5

    if total_weight == 0:
        return 0.0

    score = round((weighted_score / total_weight) * 100, 1)

    # Cache back into metadata
    try:
        meta = dict(doc.doc_metadata or {})
        meta["trust_score"] = score
        doc.doc_metadata = meta
        db.commit()
    except Exception:
        pass

    return score


def _to_document_response(doc: Document, db: Session) -> DocumentResponse:
    """Build DocumentResponse with trust_score populated."""
    trust = _calculate_doc_trust_score(doc, db)
    return DocumentResponse(
        id=doc.id,
        user_id=doc.user_id,
        filename=doc.filename,
        status=doc.status,
        page_count=doc.page_count,
        error_message=doc.error_message,
        trust_score=trust,
        doc_metadata=doc.doc_metadata,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
    )


@router.get("", response_model=DocumentListResponse)
def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all documents for the current user."""
    docs = (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.created_at.desc())
        .all()
    )
    return DocumentListResponse(
        documents=[_to_document_response(d, db) for d in docs],
        total=len(docs),
    )


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get document detail."""
    doc = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == current_user.id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return _to_document_response(doc, db)


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a document and its associated data."""
    doc = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == current_user.id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Remove file from disk
    if os.path.exists(doc.storage_path):
        os.remove(doc.storage_path)

    db.delete(doc)
    db.commit()


@router.post("/{document_id}/process", response_model=ProcessResponse)
def process_document(
    document_id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Trigger the full processing pipeline for a document."""
    doc = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == current_user.id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.status == "processing":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Document is already being processed",
        )

    # Clear previous results if re-processing
    db.query(VerificationResult).filter(
        VerificationResult.claim_id.in_(
            db.query(Claim.id).filter(Claim.document_id == document_id)
        )
    ).delete(synchronize_session=False)
    db.query(Citation).filter(
        Citation.claim_id.in_(
            db.query(Claim.id).filter(Claim.document_id == document_id)
        )
    ).delete(synchronize_session=False)
    db.query(Claim).filter(Claim.document_id == document_id).delete()
    db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).delete()
    db.commit()

    # Start background processing
    background_tasks.add_task(run_processing_pipeline, document_id, settings.DATABASE_URL)

    return ProcessResponse(
        message="Processing started",
        document_id=document_id,
        status="processing",
    )


@router.get("/{document_id}/status", response_model=DocumentStatusResponse)
def get_document_status(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get processing status for a document."""
    doc = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == current_user.id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    claims_count = db.query(Claim).filter(Claim.document_id == document_id).count()
    citations_count = (
        db.query(Citation)
        .join(Claim)
        .filter(Claim.document_id == document_id)
        .count()
    )
    verifications_count = (
        db.query(VerificationResult)
        .join(Claim)
        .filter(Claim.document_id == document_id)
        .count()
    )

    return DocumentStatusResponse(
        id=doc.id,
        status=doc.status,
        page_count=doc.page_count,
        error_message=doc.error_message,
        claims_count=claims_count,
        citations_count=citations_count,
        verifications_count=verifications_count,
    )
