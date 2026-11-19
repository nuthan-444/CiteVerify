-- CiteVerify Neon PostgreSQL Schema Migration (001_initial_schema.sql)
-- Enables pgvector, creates tables, and sets up indexes for Neon Serverless PostgreSQL

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    full_name VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Documents table
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR NOT NULL,
    storage_path VARCHAR NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'uploaded', -- uploaded, processing, completed, error
    page_count INTEGER,
    error_message TEXT,
    doc_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Extracted Claims table
CREATE TABLE IF NOT EXISTS claims (
    id VARCHAR PRIMARY KEY,
    document_id VARCHAR REFERENCES documents(id) ON DELETE CASCADE,
    claim_text TEXT NOT NULL,
    page_number INTEGER,
    section VARCHAR,
    citation_marker VARCHAR,
    confidence FLOAT,
    claim_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Citations table
CREATE TABLE IF NOT EXISTS citations (
    id VARCHAR PRIMARY KEY,
    claim_id VARCHAR REFERENCES claims(id) ON DELETE CASCADE,
    source_type VARCHAR NOT NULL, -- crossref, openalex, tavily
    title VARCHAR,
    authors JSONB DEFAULT '[]',
    doi VARCHAR,
    url VARCHAR,
    publication_year INTEGER,
    abstract TEXT,
    citation_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Document Chunks table (with pgvector embedding)
CREATE TABLE IF NOT EXISTS document_chunks (
    id VARCHAR PRIMARY KEY,
    document_id VARCHAR REFERENCES documents(id) ON DELETE CASCADE,
    chunk_text TEXT NOT NULL,
    page_number INTEGER,
    chunk_index INTEGER NOT NULL,
    embedding JSONB, -- JSON array of floats for cross-dialect compatibility or vector(384)
    chunk_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Verification Results table
CREATE TABLE IF NOT EXISTS verification_results (
    id VARCHAR PRIMARY KEY,
    claim_id VARCHAR REFERENCES claims(id) ON DELETE CASCADE,
    citation_id VARCHAR REFERENCES citations(id) ON DELETE SET NULL,
    verdict VARCHAR NOT NULL, -- supported, contradicted, insufficient_evidence
    confidence FLOAT,
    reasoning TEXT,
    evidence_text TEXT,
    evidence_page INTEGER,
    result_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_document ON claims(document_id);
CREATE INDEX IF NOT EXISTS idx_citations_claim ON citations(claim_id);
CREATE INDEX IF NOT EXISTS idx_chunks_document ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_verification_claim ON verification_results(claim_id);
