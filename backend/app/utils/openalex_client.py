"""OpenAlex API client for academic metadata."""

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from typing import Optional, List


class OpenAlexClient:
    """OpenAlex API client (free, no key needed)."""

    BASE_URL = "https://api.openalex.org"
    HEADERS = {
        "User-Agent": "CiteVerify/1.0 (mailto:citeverify@example.com)",
    }

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=30),
        retry=retry_if_exception_type((httpx.HTTPError, httpx.TimeoutException)),
        reraise=True,
    )
    def search_by_doi(self, doi: str) -> Optional[dict]:
        """Look up a work by DOI."""
        doi = doi.strip()
        with httpx.Client(timeout=30.0, headers=self.HEADERS) as client:
            response = client.get(
                f"{self.BASE_URL}/works/doi:{doi}",
            )
            if response.status_code == 404:
                return None
            response.raise_for_status()
            return self._parse_work(response.json())

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=30),
        retry=retry_if_exception_type((httpx.HTTPError, httpx.TimeoutException)),
        reraise=True,
    )
    def search_by_title(self, title: str, per_page: int = 3) -> List[dict]:
        """Search works by title."""
        with httpx.Client(timeout=30.0, headers=self.HEADERS) as client:
            response = client.get(
                f"{self.BASE_URL}/works",
                params={
                    "search": title,
                    "per_page": per_page,
                },
            )
            response.raise_for_status()
            data = response.json()
            results = data.get("results", [])
            return [self._parse_work(w) for w in results]

    def _parse_work(self, work: dict) -> dict:
        """Parse an OpenAlex work into a structured dict."""
        # Extract authors
        authors = []
        for authorship in work.get("authorships", []):
            author_info = authorship.get("author", {})
            name = author_info.get("display_name")
            if name:
                authors.append(name)

        # Extract abstract from inverted index
        abstract = ""
        abstract_inverted = work.get("abstract_inverted_index")
        if abstract_inverted:
            try:
                # Reconstruct abstract from inverted index
                word_positions = []
                for word, positions in abstract_inverted.items():
                    for pos in positions:
                        word_positions.append((pos, word))
                word_positions.sort()
                abstract = " ".join(w for _, w in word_positions)
            except Exception:
                abstract = ""

        # Publication year
        pub_year = work.get("publication_year")

        # DOI
        doi = work.get("doi", "")
        if doi and doi.startswith("https://doi.org/"):
            doi = doi[len("https://doi.org/"):]

        return {
            "title": work.get("display_name") or work.get("title"),
            "authors": authors,
            "doi": doi,
            "url": work.get("id", ""),
            "publication_year": pub_year,
            "abstract": abstract,
            "cited_by_count": work.get("cited_by_count", 0),
            "type": work.get("type"),
            "source": work.get("primary_location", {}).get("source", {}).get("display_name") if work.get("primary_location") else None,
        }


openalex_client = OpenAlexClient()
