"""Claim extraction from academic text using Groq LLM."""

import json
import logging
from typing import List

from app.utils.groq_client import groq_client
from app.schemas.claims import ExtractedClaim, ClaimExtractionResult

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an expert academic claim extractor. Your job is to identify specific, verifiable factual claims from academic text.

For each claim you extract, provide:
1. claim_text: The exact factual claim, stated clearly and concisely
2. page_number: The page number where the claim appears (if provided in the input)
3. section: The section of the paper where the claim appears (e.g., "Introduction", "Methods", "Results", "Discussion")
4. citation_marker: Any citation marker associated with the claim (e.g., "[1]", "(Smith et al., 2020)", "[Smith2020]")

Focus on:
- Specific statistical claims (e.g., "X increased by Y%")
- Causal claims (e.g., "X causes Y")
- Comparative claims (e.g., "X is better than Y")
- Factual assertions that cite sources
- Claims about experimental results
- Claims referencing specific studies or findings

Do NOT extract:
- Opinions or subjective statements
- General background knowledge (e.g., "Water is H2O")
- Methodology descriptions (unless they make a verifiable claim)
- Future work suggestions

Return your response as a JSON object with a "claims" array."""

USER_PROMPT_TEMPLATE = """Extract all verifiable factual claims from the following academic text. The text is from page {page_number}.

TEXT:
{text}

Return a JSON object with a "claims" array. Each claim should have: claim_text, page_number, section, citation_marker (null if none)."""


class ClaimExtractor:
    """Extract verifiable claims from academic text using LLM."""

    def extract_claims_from_text(
        self,
        text: str,
        page_number: int = 1,
    ) -> List[ExtractedClaim]:
        """Extract claims from a single text chunk."""
        user_prompt = USER_PROMPT_TEMPLATE.format(
            page_number=page_number,
            text=text[:6000],  # Limit text length to stay within context window
        )

        try:
            response = groq_client.chat_json(
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.1,
                max_tokens=4096,
            )

            # Parse and validate with Pydantic
            data = json.loads(response)
            result = ClaimExtractionResult(**data)
            return result.claims

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM JSON response: {e}")
            return []
        except Exception as e:
            logger.error(f"Claim extraction failed: {e}")
            return []

    def extract_claims_from_pages(
        self,
        pages: list[dict],
    ) -> List[ExtractedClaim]:
        """Extract claims from all pages of a document."""
        all_claims = []

        for page_data in pages:
            page_number = page_data["page_number"]
            text = page_data["text"]

            if len(text.strip()) < 50:
                continue

            claims = self.extract_claims_from_text(text, page_number)
            all_claims.extend(claims)
            logger.info(f"Extracted {len(claims)} claims from page {page_number}")

        logger.info(f"Total claims extracted: {len(all_claims)}")
        return all_claims


claim_extractor = ClaimExtractor()
