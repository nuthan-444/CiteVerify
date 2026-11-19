"""Claim verification using LLM with citation and RAG evidence."""

import json
import logging
from typing import List, Dict, Optional

from app.utils.groq_client import groq_client
from app.schemas.verification import LLMVerdict

logger = logging.getLogger(__name__)

VERIFICATION_SYSTEM_PROMPT = """You are an expert academic fact-checker. Your job is to verify whether a factual claim from an academic paper is supported by the provided evidence.

You will be given:
1. A CLAIM from an academic paper
2. CITATION INFORMATION (if available) - metadata about the referenced source
3. EVIDENCE from the paper itself (retrieved by similarity search)

Your task is to determine whether the claim is:
- "supported": The evidence supports the claim
- "contradicted": The evidence contradicts the claim
- "insufficient_evidence": There is not enough evidence to verify the claim

Provide your response as a JSON object with:
- verdict: One of "supported", "contradicted", "insufficient_evidence"
- confidence: A float between 0 and 1 indicating your confidence
- reasoning: A clear explanation of your verdict
- evidence_text: The key piece of evidence that supports your verdict (quote from the evidence if possible)

Be rigorous and objective. If the evidence is ambiguous, lean towards "insufficient_evidence"."""

VERIFICATION_USER_TEMPLATE = """CLAIM: {claim_text}

CITATION INFORMATION:
{citation_info}

EVIDENCE FROM DOCUMENT:
{evidence_text}

Analyze the evidence and provide your verdict as JSON."""


class Verifier:
    """Verify claims against citation and RAG evidence."""

    def verify_claim(
        self,
        claim_text: str,
        citation_info: Optional[str] = None,
        evidence_chunks: Optional[List[Dict]] = None,
    ) -> LLMVerdict:
        """
        Verify a single claim against available evidence.
        
        Args:
            claim_text: The claim to verify
            citation_info: Formatted citation information
            evidence_chunks: List of evidence chunks from RAG
            
        Returns:
            LLMVerdict with verdict, confidence, reasoning, evidence_text
        """
        # Format citation info
        if not citation_info:
            citation_info = "No citation information available."

        # Format evidence
        if evidence_chunks:
            evidence_parts = []
            for i, chunk in enumerate(evidence_chunks, 1):
                score = chunk.get("similarity_score", 0)
                page = chunk.get("page_number", "?")
                text = chunk.get("chunk_text", "")[:500]
                evidence_parts.append(
                    f"[Evidence {i}] (Page {page}, Relevance: {score:.2f})\n{text}"
                )
            evidence_text = "\n\n".join(evidence_parts)
        else:
            evidence_text = "No document evidence available."

        user_prompt = VERIFICATION_USER_TEMPLATE.format(
            claim_text=claim_text,
            citation_info=citation_info,
            evidence_text=evidence_text,
        )

        try:
            response = groq_client.chat_json(
                messages=[
                    {"role": "system", "content": VERIFICATION_SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.1,
                max_tokens=2048,
            )

            data = json.loads(response)
            verdict = LLMVerdict(**data)
            return verdict

        except Exception as e:
            logger.error(f"Verification failed: {e}")
            return LLMVerdict(
                verdict="insufficient_evidence",
                confidence=0.0,
                reasoning=f"Verification failed due to error: {str(e)}",
                evidence_text=None,
            )

    def format_citation_for_verification(
        self,
        citations: List[Dict],
    ) -> str:
        """Format citation data for the verification prompt."""
        if not citations:
            return "No citation information available."

        parts = []
        for i, cit in enumerate(citations, 1):
            info = f"[Source {i}]"
            if cit.get("title"):
                info += f"\nTitle: {cit['title']}"
            if cit.get("authors"):
                info += f"\nAuthors: {', '.join(cit['authors'][:5])}"
            if cit.get("publication_year"):
                info += f"\nYear: {cit['publication_year']}"
            if cit.get("doi"):
                info += f"\nDOI: {cit['doi']}"
            if cit.get("abstract"):
                info += f"\nAbstract: {cit['abstract'][:300]}"
            parts.append(info)

        return "\n\n".join(parts)

    def calculate_trust_score(
        self,
        verdicts: List[LLMVerdict],
    ) -> float:
        """
        Calculate an overall trust score for a document based on all verdicts.
        
        Score is weighted average:
        - supported claims contribute positively
        - contradicted claims contribute negatively
        - insufficient_evidence claims are neutral
        """
        if not verdicts:
            return 0.0

        total_weight = 0.0
        weighted_score = 0.0

        for v in verdicts:
            confidence = v.confidence or 0.5
            if v.verdict == "supported":
                weighted_score += confidence
                total_weight += 1.0
            elif v.verdict == "contradicted":
                weighted_score += (1.0 - confidence) * 0.2  # Heavy penalty
                total_weight += 1.0
            else:  # insufficient_evidence
                weighted_score += 0.5
                total_weight += 0.5  # Lower weight for uncertain

        if total_weight == 0:
            return 0.0

        return round(weighted_score / total_weight, 3)


verifier = Verifier()
