"""Citation retrieval from Crossref, OpenAlex, and Tavily."""

import logging
from typing import List, Optional

from app.utils.crossref_client import crossref_client
from app.utils.openalex_client import openalex_client
from app.utils.tavily_client import tavily_client
from app.schemas.citations import RetrievedCitation

logger = logging.getLogger(__name__)


class CitationRetriever:
    """Retrieve citation information from multiple sources."""

    def retrieve_citations(
        self,
        claim_text: str,
        citation_marker: Optional[str] = None,
    ) -> List[RetrievedCitation]:
        """
        Retrieve citations for a claim from multiple sources.
        
        Strategy:
        1. If citation_marker contains a DOI, search Crossref and OpenAlex by DOI
        2. Otherwise, search by the citation marker text or claim text
        3. Fall back to Tavily web search for non-academic sources
        """
        citations = []

        # Try DOI-based lookup first
        doi = None
        if citation_marker:
            doi = crossref_client.extract_doi(citation_marker)

        if doi:
            citations.extend(self._search_by_doi(doi))
        
        # If we have a citation marker that looks like a reference, search by it
        if citation_marker and not doi:
            search_text = citation_marker.strip("[]()").strip()
            if len(search_text) > 5:
                citations.extend(self._search_by_title(search_text))

        # If still no results, search by claim text
        if not citations:
            citations.extend(self._search_by_claim(claim_text))

        # Tavily fallback for web sources
        if not citations:
            citations.extend(self._search_tavily(claim_text))

        return citations

    def _search_by_doi(self, doi: str) -> List[RetrievedCitation]:
        """Search Crossref and OpenAlex by DOI."""
        citations = []

        # Crossref
        try:
            result = crossref_client.search_by_doi(doi)
            if result:
                citations.append(RetrievedCitation(
                    source_type="crossref",
                    title=result.get("title"),
                    authors=result.get("authors", []),
                    doi=result.get("doi"),
                    url=result.get("url"),
                    publication_year=result.get("publication_year"),
                    abstract=result.get("abstract", ""),
                    metadata={
                        "type": result.get("type"),
                        "container_title": result.get("container_title"),
                        "cited_by_count": result.get("is_referenced_by_count", 0),
                    },
                ))
        except Exception as e:
            logger.warning(f"Crossref DOI lookup failed for {doi}: {e}")

        # OpenAlex
        try:
            result = openalex_client.search_by_doi(doi)
            if result:
                citations.append(RetrievedCitation(
                    source_type="openalex",
                    title=result.get("title"),
                    authors=result.get("authors", []),
                    doi=result.get("doi"),
                    url=result.get("url"),
                    publication_year=result.get("publication_year"),
                    abstract=result.get("abstract", ""),
                    metadata={
                        "cited_by_count": result.get("cited_by_count", 0),
                        "type": result.get("type"),
                        "source": result.get("source"),
                    },
                ))
        except Exception as e:
            logger.warning(f"OpenAlex DOI lookup failed for {doi}: {e}")

        return citations

    def _search_by_title(self, title: str) -> List[RetrievedCitation]:
        """Search Crossref and OpenAlex by title."""
        citations = []

        # Crossref title search
        try:
            results = crossref_client.search_by_title(title, rows=2)
            for result in results:
                citations.append(RetrievedCitation(
                    source_type="crossref",
                    title=result.get("title"),
                    authors=result.get("authors", []),
                    doi=result.get("doi"),
                    url=result.get("url"),
                    publication_year=result.get("publication_year"),
                    abstract=result.get("abstract", ""),
                    metadata={
                        "type": result.get("type"),
                        "container_title": result.get("container_title"),
                    },
                ))
        except Exception as e:
            logger.warning(f"Crossref title search failed: {e}")

        # OpenAlex title search
        try:
            results = openalex_client.search_by_title(title, per_page=2)
            for result in results:
                citations.append(RetrievedCitation(
                    source_type="openalex",
                    title=result.get("title"),
                    authors=result.get("authors", []),
                    doi=result.get("doi"),
                    url=result.get("url"),
                    publication_year=result.get("publication_year"),
                    abstract=result.get("abstract", ""),
                    metadata={
                        "cited_by_count": result.get("cited_by_count", 0),
                        "source": result.get("source"),
                    },
                ))
        except Exception as e:
            logger.warning(f"OpenAlex title search failed: {e}")

        return citations

    def _search_by_claim(self, claim_text: str) -> List[RetrievedCitation]:
        """Search for the claim text directly in academic databases."""
        # Use a shortened version of the claim for search
        query = claim_text[:200]
        citations = []

        try:
            results = crossref_client.search_by_title(query, rows=2)
            for result in results:
                citations.append(RetrievedCitation(
                    source_type="crossref",
                    title=result.get("title"),
                    authors=result.get("authors", []),
                    doi=result.get("doi"),
                    url=result.get("url"),
                    publication_year=result.get("publication_year"),
                    abstract=result.get("abstract", ""),
                    metadata={"search_type": "claim_text"},
                ))
        except Exception as e:
            logger.warning(f"Crossref claim search failed: {e}")

        return citations

    def _search_tavily(self, claim_text: str) -> List[RetrievedCitation]:
        """Fall back to Tavily web search."""
        citations = []

        try:
            query = f"academic research: {claim_text[:200]}"
            result = tavily_client.search(
                query=query,
                max_results=3,
                search_depth="advanced",
            )

            for item in result.get("results", []):
                citations.append(RetrievedCitation(
                    source_type="tavily",
                    title=item.get("title"),
                    authors=[],
                    doi=None,
                    url=item.get("url"),
                    publication_year=None,
                    abstract=item.get("content", "")[:500],
                    metadata={
                        "score": item.get("score"),
                        "search_type": "web",
                    },
                ))
        except Exception as e:
            logger.warning(f"Tavily search failed: {e}")

        return citations


citation_retriever = CitationRetriever()
