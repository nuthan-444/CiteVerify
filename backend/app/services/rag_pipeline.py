"""RAG pipeline: embed document chunks and retrieve relevant evidence."""

import logging
from typing import List, Dict, Optional

from sqlalchemy.orm import Session

from app.models import DocumentChunk
from app.utils.embedding import generate_embedding, generate_embeddings, find_top_k_similar

logger = logging.getLogger(__name__)


class RAGPipeline:
    """Retrieval-Augmented Generation pipeline for evidence retrieval."""

    def embed_and_store_chunks(
        self,
        db: Session,
        document_id: str,
        chunks: List[Dict],
    ) -> int:
        """
        Generate embeddings for document chunks and store them in the database.
        
        Args:
            db: Database session
            document_id: Document ID
            chunks: List of chunk dicts with chunk_text, page_number, chunk_index
            
        Returns:
            Number of chunks stored
        """
        if not chunks:
            return 0

        # Generate embeddings in batch
        texts = [chunk["chunk_text"] for chunk in chunks]
        logger.info(f"Generating embeddings for {len(texts)} chunks...")
        embeddings = generate_embeddings(texts)

        # Store chunks with embeddings
        db_chunks = []
        for chunk, embedding in zip(chunks, embeddings):
            db_chunk = DocumentChunk(
                document_id=document_id,
                chunk_text=chunk["chunk_text"],
                page_number=chunk["page_number"],
                chunk_index=chunk["chunk_index"],
                embedding=embedding,
            )
            db_chunks.append(db_chunk)

        db.add_all(db_chunks)
        db.commit()

        logger.info(f"Stored {len(db_chunks)} chunks with embeddings")
        return len(db_chunks)

    def retrieve_evidence(
        self,
        db: Session,
        document_id: str,
        claim_text: str,
        top_k: int = 5,
    ) -> List[Dict]:
        """
        Find the most relevant document chunks for a given claim.
        
        Args:
            db: Database session
            document_id: Document ID
            claim_text: The claim text to find evidence for
            top_k: Number of top results to return
            
        Returns:
            List of dicts with chunk_text, page_number, similarity_score
        """
        # Get all chunks for this document
        db_chunks = (
            db.query(DocumentChunk)
            .filter(DocumentChunk.document_id == document_id)
            .order_by(DocumentChunk.chunk_index)
            .all()
        )

        if not db_chunks:
            logger.warning(f"No chunks found for document {document_id}")
            return []

        # Filter chunks that have embeddings
        valid_chunks = [c for c in db_chunks if c.embedding is not None]
        if not valid_chunks:
            logger.warning("No chunks with embeddings found")
            return []

        # Generate embedding for the claim
        claim_embedding = generate_embedding(claim_text)

        # Find top-k similar chunks
        embeddings = [c.embedding for c in valid_chunks]
        top_results = find_top_k_similar(claim_embedding, embeddings, k=top_k)

        # Build results
        evidence = []
        for idx, similarity in top_results:
            chunk = valid_chunks[idx]
            evidence.append({
                "chunk_text": chunk.chunk_text,
                "page_number": chunk.page_number,
                "chunk_index": chunk.chunk_index,
                "similarity_score": similarity,
            })

        logger.info(f"Found {len(evidence)} relevant chunks for claim")
        return evidence


rag_pipeline = RAGPipeline()
