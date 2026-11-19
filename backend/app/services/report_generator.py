"""Report generation for verification results."""

import json
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional

from sqlalchemy.orm import Session
from jinja2 import Template

from app.models import Document, Claim, Citation, VerificationResult

logger = logging.getLogger(__name__)

HTML_REPORT_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CiteVerify Report - {{ filename }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; background: #f8f9fa; padding: 2rem; }
        .container { max-width: 900px; margin: 0 auto; }
        h1 { font-size: 1.8rem; margin-bottom: 0.5rem; color: #16213e; }
        .summary { background: white; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .summary h2 { font-size: 1.2rem; margin-bottom: 1rem; color: #0f3460; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; }
        .stat { text-align: center; padding: 1rem; border-radius: 8px; background: #f0f4ff; }
        .stat .number { font-size: 2rem; font-weight: bold; }
        .stat .label { font-size: 0.85rem; color: #555; }
        .trust-score { font-size: 2.5rem; font-weight: bold; text-align: center; padding: 1rem; }
        .trust-high { color: #10b981; }
        .trust-medium { color: #f59e0b; }
        .trust-low { color: #ef4444; }
        .claim-card { background: white; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid #ccc; }
        .claim-card.supported { border-left-color: #10b981; }
        .claim-card.contradicted { border-left-color: #ef4444; }
        .claim-card.insufficient_evidence { border-left-color: #f59e0b; }
        .verdict-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; }
        .verdict-badge.supported { background: #d1fae5; color: #065f46; }
        .verdict-badge.contradicted { background: #fee2e2; color: #991b1b; }
        .verdict-badge.insufficient_evidence { background: #fef3c7; color: #92400e; }
        .claim-text { font-size: 1rem; margin: 0.75rem 0; }
        .meta { font-size: 0.85rem; color: #666; }
        .reasoning { margin-top: 0.75rem; padding: 0.75rem; background: #f8f9fa; border-radius: 8px; font-size: 0.9rem; }
        .citation-info { margin-top: 0.5rem; font-size: 0.85rem; color: #444; }
        .footer { text-align: center; margin-top: 2rem; color: #888; font-size: 0.85rem; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📄 CiteVerify Report</h1>
        <p class="meta">File: {{ filename }} | Generated: {{ generated_at }}</p>

        <div class="summary">
            <h2>Summary</h2>
            <div class="stats">
                <div class="stat">
                    <div class="number">{{ total_claims }}</div>
                    <div class="label">Total Claims</div>
                </div>
                <div class="stat">
                    <div class="number" style="color:#10b981">{{ supported }}</div>
                    <div class="label">Supported</div>
                </div>
                <div class="stat">
                    <div class="number" style="color:#ef4444">{{ contradicted }}</div>
                    <div class="label">Contradicted</div>
                </div>
                <div class="stat">
                    <div class="number" style="color:#f59e0b">{{ insufficient }}</div>
                    <div class="label">Insufficient Evidence</div>
                </div>
            </div>
            <div class="trust-score {{ trust_class }}">
                Trust Score: {{ "%.0f"|format(trust_score * 100) }}%
            </div>
        </div>

        <h2 style="margin: 1.5rem 0 0.5rem;">Claims Detail</h2>
        {% for claim in claims %}
        <div class="claim-card {{ claim.verdict }}">
            <span class="verdict-badge {{ claim.verdict }}">{{ claim.verdict | replace('_', ' ') }}</span>
            <span class="meta" style="float:right">Page {{ claim.page_number or '?' }} | Confidence: {{ "%.0f"|format((claim.confidence or 0) * 100) }}%</span>
            <p class="claim-text">{{ claim.claim_text }}</p>
            {% if claim.reasoning %}
            <div class="reasoning"><strong>Reasoning:</strong> {{ claim.reasoning }}</div>
            {% endif %}
            {% if claim.citations %}
            <div class="citation-info">
                <strong>Sources:</strong>
                {% for cit in claim.citations %}
                <span>{{ cit.title or 'Unknown' }}{% if cit.doi %} (DOI: {{ cit.doi }}){% endif %}</span>{% if not loop.last %}, {% endif %}
                {% endfor %}
            </div>
            {% endif %}
        </div>
        {% endfor %}

        <div class="footer">
            <p>Generated by CiteVerify | {{ generated_at }}</p>
        </div>
    </div>
</body>
</html>"""


class ReportGenerator:
    """Generate verification reports in JSON and HTML formats."""

    def generate_json_report(self, db: Session, document_id: str) -> Dict:
        """Generate a JSON report for a document."""
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise ValueError(f"Document {document_id} not found")

        claims = db.query(Claim).filter(Claim.document_id == document_id).all()

        claims_data = []
        supported_count = 0
        contradicted_count = 0
        insufficient_count = 0

        for claim in claims:
            # Get verification results
            verifications = (
                db.query(VerificationResult)
                .filter(VerificationResult.claim_id == claim.id)
                .all()
            )

            # Get citations
            citations = db.query(Citation).filter(Citation.claim_id == claim.id).all()

            # Use the first verification result
            verdict = None
            confidence = None
            reasoning = None
            evidence_text = None

            if verifications:
                v = verifications[0]
                verdict = v.verdict
                confidence = v.confidence
                reasoning = v.reasoning
                evidence_text = v.evidence_text

                if verdict == "supported":
                    supported_count += 1
                elif verdict == "contradicted":
                    contradicted_count += 1
                else:
                    insufficient_count += 1

            claims_data.append({
                "id": claim.id,
                "claim_text": claim.claim_text,
                "page_number": claim.page_number,
                "section": claim.section,
                "citation_marker": claim.citation_marker,
                "verdict": verdict,
                "confidence": confidence,
                "reasoning": reasoning,
                "evidence_text": evidence_text,
                "citations": [
                    {
                        "id": c.id,
                        "source_type": c.source_type,
                        "title": c.title,
                        "authors": c.authors,
                        "doi": c.doi,
                        "url": c.url,
                        "publication_year": c.publication_year,
                    }
                    for c in citations
                ],
            })

        total = len(claims)
        trust_score = 0.0
        if total > 0:
            trust_score = round(supported_count / total, 3)

        return {
            "document_id": document.id,
            "filename": document.filename,
            "status": document.status,
            "total_claims": total,
            "supported_claims": supported_count,
            "contradicted_claims": contradicted_count,
            "insufficient_evidence_claims": insufficient_count,
            "trust_score": trust_score,
            "claims": claims_data,
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    def generate_html_report(self, db: Session, document_id: str) -> str:
        """Generate an HTML report for a document."""
        json_report = self.generate_json_report(db, document_id)

        trust_score = json_report["trust_score"]
        if trust_score >= 0.7:
            trust_class = "trust-high"
        elif trust_score >= 0.4:
            trust_class = "trust-medium"
        else:
            trust_class = "trust-low"

        template = Template(HTML_REPORT_TEMPLATE)
        html = template.render(
            filename=json_report["filename"],
            generated_at=json_report["generated_at"],
            total_claims=json_report["total_claims"],
            supported=json_report["supported_claims"],
            contradicted=json_report["contradicted_claims"],
            insufficient=json_report["insufficient_evidence_claims"],
            trust_score=trust_score,
            trust_class=trust_class,
            claims=json_report["claims"],
        )

        return html


report_generator = ReportGenerator()
