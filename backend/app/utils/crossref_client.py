"""Crossref API client for academic citation lookup."""

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from typing import Optional, List
import re


class CrossrefClient:
    """Crossref API client (free, no key needed)."""

    BASE_URL = "https://api.crossref.org"
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
        # Clean the DOI
        doi = doi.strip()
        if doi.startswith("https://doi.org/"):
            doi = doi[len("https://doi.org/"):]
        elif doi.startswith("http://doi.org/"):
            doi = doi[len("http://doi.org/"):]

        with httpx.Client(timeout=30.0, headers=self.HEADERS) as client:
            response = client.get(f"{self.BASE_URL}/works/{doi}")
            if response.status_code == 404:
                return None
            response.raise_for_status()
            data = response.json()
            return self._parse_work(data.get("message", {}))

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=30),
        retry=retry_if_exception_type((httpx.HTTPError, httpx.TimeoutException)),
        reraise=True,
    )
    def search_by_title(self, title: str, rows: int = 3) -> List[dict]:
        """Search works by title query."""
        with httpx.Client(timeout=30.0, headers=self.HEADERS) as client:
            response = client.get(
                f"{self.BASE_URL}/works",
                params={"query.title": title, "rows": rows},
            )
            response.raise_for_status()
            data = response.json()
            items = data.get("message", {}).get("items", [])
            return [self._parse_work(item) for item in items]

    def _parse_work(self, work: dict) -> dict:
        """Parse a Crossref work into a structured dict."""
        authors = []
        for author in work.get("author", []):
            name_parts = []
            if author.get("given"):
                name_parts.append(author["given"])
            if author.get("family"):
                name_parts.append(author["family"])
            if name_parts:
                authors.append(" ".join(name_parts))

        title_list = work.get("title", [])
        title = title_list[0] if title_list else None

        # Get publication year
        pub_year = None
        date_parts = work.get("published-print", {}).get("date-parts", [[]])
        if not date_parts or not date_parts[0]:
            date_parts = work.get("published-online", {}).get("date-parts", [[]])
        if date_parts and date_parts[0]:
            pub_year = date_parts[0][0]

        return {
            "title": title,
            "authors": authors,
            "doi": work.get("DOI"),
            "url": work.get("URL"),
            "publication_year": pub_year,
            "abstract": work.get("abstract", ""),
            "type": work.get("type"),
            "container_title": work.get("container-title", [None])[0] if work.get("container-title") else None,
            "is_referenced_by_count": work.get("is-referenced-by-count", 0),
        }

    def extract_doi(self, text: str) -> Optional[str]:
        """Try to extract a DOI from text."""
        patterns = [
            r'(10\.\d{4,9}/[^\s,;}\]]+)',
            r'doi\.org/(10\.\d{4,9}/[^\s,;}\]]+)',
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                doi = match.group(1).rstrip(".")
                return doi
        return None


crossref_client = CrossrefClient()
