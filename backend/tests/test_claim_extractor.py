"""Test claim extractor Pydantic schema validation."""

import pytest
from app.schemas.claims import ExtractedClaim, ClaimExtractionResult


def test_extracted_claim_schema():
    claim = ExtractedClaim(
        claim_text="Global temperature rose by 1.1 degrees Celsius.",
        page_number=3,
        section="Results",
        citation_marker="[12]",
    )
    assert claim.claim_text.startswith("Global temperature")
    assert claim.page_number == 3
    assert claim.citation_marker == "[12]"


def test_claim_extraction_result_validation():
    data = {
        "claims": [
            {
                "claim_text": "Model accuracy increased by 14% on benchmark dataset.",
                "page_number": 4,
                "section=" : "Discussion",
                "citation_marker": "(Vaswani et al., 2017)",
            }
        ]
    }
    result = ClaimExtractionResult(**data)
    assert len(result.claims) == 1
    assert result.claims[0].page_number == 4
