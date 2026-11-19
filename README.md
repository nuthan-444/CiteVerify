# CiteVerify — AI-Powered Academic Citation & Claim Verification Platform

CiteVerify is a production-grade full-stack platform designed to audit academic research papers. It ingests academic PDFs, extracts factual testable claims with exact page numbers, retrieves real-world verified academic sources via Crossref, OpenAlex, and Tavily, performs deep RAG semantic similarity matching, and provides rigorous LLM-backed verification with reasoning and trust scores.

---

## Architecture Overview

```
┌────────────────────────────────┐            ┌────────────────────────────────┐
│      React 18 + Vite SPA       │            │        FastAPI Backend         │
│  - Tailwind CSS + shadcn/ui    │◄──────────►│  - Pydantic v2 validation      │
│  - TypeScript & React Router   │  REST API  │  - SQLAlchemy ORM              │
│  - Port 5173                   │            │  - Port 8000                   │
└────────────────────────────────┘            └──────┬──────────────┬──────────┘
                                                     │              │
                    ┌────────────────────────────────┘              └────────────────────────────────┐
                    ▼                                                                                ▼
     Academic & Web Integrations                                                        Database & RAG Pipeline
  - Groq LLM (llama-3.3-70b-versatile)                                            - Neon Serverless PostgreSQL
  - Crossref API (DOIs, metadata)                                                 - pgvector 384-dimensional embeddings
  - OpenAlex API (citations, abstracts)                                           - Sentence Transformers / MiniLM
  - Tavily Search API (web sources)                                               - PyMuPDF / pypdf text extraction
```

---

## Key Features

1. **Strict Zero-Mock Policy**: No hardcoded verification results, mock stats, or fake AI responses in production flows.
2. **Real Multi-Source Academic Retrieval**:
   - **Crossref**: DOI resolution, titles, authors, publication years.
   - **OpenAlex**: Global citation graph, abstract inverted index parsing, journal metadata.
   - **Tavily Web Search**: High-quality search for online resources and technical reports.
3. **Pydantic Validation**: All Groq LLM outputs are strictly parsed and validated using Pydantic models.
4. **Traceable RAG Evidence**: Dense embeddings match extracted claims against exact source passages with page-level attribution.
5. **Interactive Research Dashboard**: Complete UI for uploading PDFs, monitoring processing pipelines in real time, inspecting claim evidence panels, and downloading HTML/JSON audit reports.

---

## Quick Start Guide

### Prerequisites
- Node.js v18+ and npm
- Python 3.10+ and pip

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Verify environment configuration (.env already pre-configured with keys)
# Starts FastAPI server on http://localhost:8000
python -m uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies (if not already installed)
npm install

# Start Vite dev server on http://localhost:5173
npm run dev
```

Visit **http://localhost:5173** to access the CiteVerify web application.

---

## Running Automated Tests

CiteVerify comes with a comprehensive pytest test suite covering:
- Health check endpoints
- PDF chunking and page number preservation
- Pydantic schema validation for extracted claims
- End-to-end authentication, user registration, and PDF document upload

```bash
cd backend
python -m pytest tests/
```

Expected output:
```
tests\test_claim_extractor.py ..                                         [ 40%]
tests\test_e2e.py .                                                      [ 60%]
tests\test_health.py .                                                   [ 80%]
tests\test_pdf_processor.py .                                            [100%]
======================== 5 passed in ~2s =========================
```

---

## Production Neon PostgreSQL & pgvector Deployment

CiteVerify uses **Neon Serverless PostgreSQL** with `pgvector` enabled out of the box.

1. Ensure your Neon connection string is set in `backend/.env`:
   ```env
   DATABASE_URL=postgresql://neondb_owner:[PASSWORD]@[HOST]-pooler.[REGION].aws.neon.tech/neondb?sslmode=require
   ```
2. The initial schema migration with `pgvector` is located at:
   `neon/migrations/001_initial_schema.sql`
3. Tables and extensions are automatically verified and created on startup by SQLAlchemy!
