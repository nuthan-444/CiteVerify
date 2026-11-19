"""Sentence Transformers embedding wrapper with sklearn fallback."""

import numpy as np
from typing import List
import logging
import hashlib

logger = logging.getLogger(__name__)

_model = None
_use_fallback = False


def _get_model():
    """Lazily load the sentence-transformers model, falling back to sklearn vectorizer if unavailable."""
    global _model, _use_fallback
    if _model is not None or _use_fallback:
        return _model

    try:
        logger.info("Attempting to load sentence-transformers model (all-MiniLM-L6-v2)...")
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        logger.info("SentenceTransformer model loaded successfully.")
    except Exception as e:
        logger.warning(f"sentence-transformers not available ({e}). Using dense semantic hash fallback.")
        _use_fallback = True
        _model = None
    return _model


def _fallback_embedding(text: str, dim: int = 384) -> List[float]:
    """
    Produce a deterministic, normalized dense vector for text using token n-grams and hashing.
    Used when sentence-transformers or PyTorch is not available.
    """
    words = text.lower().split()
    vec = np.zeros(dim, dtype=np.float32)
    for i, word in enumerate(words):
        h = int(hashlib.md5(word.encode()).hexdigest(), 16)
        idx = h % dim
        weight = 1.0 / (1.0 + 0.1 * i)
        vec[idx] += weight

    norm = np.linalg.norm(vec)
    if norm > 0:
        vec /= norm
    return vec.tolist()


def generate_embedding(text: str) -> List[float]:
    """Generate an embedding vector for a single text (dim: 384)."""
    model = _get_model()
    if model is not None:
        try:
            embedding = model.encode(text, normalize_embeddings=True)
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Error generating embedding with model: {e}")

    return _fallback_embedding(text)


def generate_embeddings(texts: List[str], batch_size: int = 32) -> List[List[float]]:
    """Generate embedding vectors for multiple texts."""
    model = _get_model()
    if model is not None:
        try:
            embeddings = model.encode(texts, batch_size=batch_size, normalize_embeddings=True)
            return embeddings.tolist()
        except Exception as e:
            logger.error(f"Error generating batch embeddings: {e}")

    return [_fallback_embedding(t) for t in texts]


def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """Compute cosine similarity between two vectors."""
    a = np.array(vec_a, dtype=np.float32)
    b = np.array(vec_b, dtype=np.float32)
    dot = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(dot / (norm_a * norm_b))


def find_top_k_similar(
    query_embedding: List[float],
    embeddings: List[List[float]],
    k: int = 5,
) -> List[tuple]:
    """Find top-k most similar embeddings. Returns list of (index, similarity_score)."""
    if not embeddings:
        return []

    query = np.array(query_embedding, dtype=np.float32)
    matrix = np.array(embeddings, dtype=np.float32)

    similarities = np.dot(matrix, query)

    top_k = min(k, len(similarities))
    top_indices = np.argsort(similarities)[::-1][:top_k]

    return [(int(idx), float(similarities[idx])) for idx in top_indices]
