"""SQLAlchemy ORM models for CiteVerify."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Column, String, Integer, Float, Text, DateTime, ForeignKey, JSON, Enum as SAEnum
)
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    filename = Column(String, nullable=False)
    storage_path = Column(String, nullable=False)
    status = Column(
        SAEnum("uploaded", "processing", "completed", "error", name="document_status"),
        default="uploaded",
        nullable=False,
    )
    page_count = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)
    doc_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="documents")
    claims = relationship("Claim", back_populates="document", cascade="all, delete-orphan")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")


class Claim(Base):
    __tablename__ = "claims"

    id = Column(String, primary_key=True, default=generate_uuid)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False, index=True)
    claim_text = Column(Text, nullable=False)
    page_number = Column(Integer, nullable=True)
    section = Column(String, nullable=True)
    citation_marker = Column(String, nullable=True)
    confidence = Column(Float, nullable=True)
    claim_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    document = relationship("Document", back_populates="claims")
    citations = relationship("Citation", back_populates="claim", cascade="all, delete-orphan")
    verification_results = relationship("VerificationResult", back_populates="claim", cascade="all, delete-orphan")


class Citation(Base):
    __tablename__ = "citations"

    id = Column(String, primary_key=True, default=generate_uuid)
    claim_id = Column(String, ForeignKey("claims.id"), nullable=False, index=True)
    source_type = Column(
        SAEnum("crossref", "openalex", "tavily", name="source_type"),
        nullable=False,
    )
    title = Column(String, nullable=True)
    authors = Column(JSON, nullable=True)  # JSON array of strings
    doi = Column(String, nullable=True)
    url = Column(String, nullable=True)
    publication_year = Column(Integer, nullable=True)
    abstract = Column(Text, nullable=True)
    citation_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    claim = relationship("Claim", back_populates="citations")
    verification_results = relationship("VerificationResult", back_populates="citation", cascade="all, delete-orphan")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String, primary_key=True, default=generate_uuid)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False, index=True)
    chunk_text = Column(Text, nullable=False)
    page_number = Column(Integer, nullable=True)
    chunk_index = Column(Integer, nullable=False)
    embedding = Column(JSON, nullable=True)  # JSON array of floats for SQLite; vector for Postgres
    chunk_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    document = relationship("Document", back_populates="chunks")


class VerificationResult(Base):
    __tablename__ = "verification_results"

    id = Column(String, primary_key=True, default=generate_uuid)
    claim_id = Column(String, ForeignKey("claims.id"), nullable=False, index=True)
    citation_id = Column(String, ForeignKey("citations.id"), nullable=True)
    verdict = Column(
        SAEnum("supported", "contradicted", "insufficient_evidence", name="verdict_type"),
        nullable=False,
    )
    confidence = Column(Float, nullable=True)
    reasoning = Column(Text, nullable=True)
    evidence_text = Column(Text, nullable=True)
    evidence_page = Column(Integer, nullable=True)
    result_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    claim = relationship("Claim", back_populates="verification_results")
    citation = relationship("Citation", back_populates="verification_results")
