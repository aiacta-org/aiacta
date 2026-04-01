"""
AIACTA Crawl Manifest Client — Python
Queries GET /crawl-manifest/v1 with pagination, rate-limit backoff, and caching (§2.2).
"""
import time
from typing import Iterator
import requests

class CrawlManifestClient:
    def __init__(self, provider: str, api_key: str, base_url: str = None):
        self.base_url = base_url or f"https://api.{provider}.com/crawl-manifest/v1"
        self.api_key  = api_key
        self._cache   = {}

    def fetch_all(self, domain: str, from_dt: str, to_dt: str, purpose: list[str] = None) -> Iterator[dict]:
        """Generator — yields individual URL records, handles all pagination."""
        cursor = None
        while True:
            page = self._fetch_page(domain, from_dt, to_dt, purpose or [], cursor)
            yield from page.get("urls", [])
            cursor = page.get("next_cursor")
            if not cursor:
                break

    def _fetch_page(self, domain, from_dt, to_dt, purpose, cursor):
        params = {"domain": domain, "from": from_dt, "to": to_dt, "format": "json"}
        if purpose: params["purpose"] = ",".join(purpose)
        if cursor:  params["cursor"] = cursor

        cache_key = str(sorted(params.items()))
        if cache_key in self._cache:
            return self._cache[cache_key]

        while True:
            resp = requests.get(self.base_url, params=params,
                                headers={"Authorization": f"Bearer {self.api_key}"}, timeout=15)
            if resp.status_code == 429:
                reset = int(resp.headers.get("X-RateLimit-Reset", 60))
                time.sleep(reset)
                continue
            resp.raise_for_status()
            data = resp.json()
            self._cache[cache_key] = data
            return data
