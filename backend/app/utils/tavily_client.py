"""Tavily search client for web search fallback."""

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from typing import List, Optional

from app.config import settings


class TavilyClient:
    """Tavily web search API client."""

    BASE_URL = "https://api.tavily.com"

    def __init__(self):
        self.api_key = settings.TAVILY_API_KEY

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=30),
        retry=retry_if_exception_type((httpx.HTTPError, httpx.TimeoutException)),
        reraise=True,
    )
    def search(
        self,
        query: str,
        max_results: int = 5,
        search_depth: str = "advanced",
        include_domains: Optional[List[str]] = None,
    ) -> dict:
        """Search the web using Tavily API."""
        payload = {
            "api_key": self.api_key,
            "query": query,
            "max_results": max_results,
            "search_depth": search_depth,
            "include_answer": True,
        }
        if include_domains:
            payload["include_domains"] = include_domains

        with httpx.Client(timeout=30.0) as client:
            response = client.post(
                f"{self.BASE_URL}/search",
                json=payload,
            )
            response.raise_for_status()
            return response.json()


tavily_client = TavilyClient()
