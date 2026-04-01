"""
Content hash utility — §2.3.

Spec: SHA-256 of UTF-8 normalized body text (HTML stripped, whitespace collapsed).
Used by AI providers when building crawl manifest entries.
"""
import hashlib
import re


def strip_html(html: str) -> str:
    """Remove all HTML tags, scripts, and style blocks."""
    html = re.sub(r'<script[\s\S]*?<\/script>', ' ', html, flags=re.IGNORECASE)
    html = re.sub(r'<style[\s\S]*?<\/style>', ' ', html, flags=re.IGNORECASE)
    html = re.sub(r'<[^>]+>', ' ', html)
    return html


def collapse_whitespace(text: str) -> str:
    """Collapse all whitespace sequences to a single space and trim."""
    return re.sub(r'[\s\u00A0\u200B]+', ' ', text).strip()


def compute_content_hash(raw_html: str) -> str:
    """
    Compute the AIACTA content hash for a crawled page.

    Returns a string of the form "sha256:<hex>" as defined in §2.3.
    """
    text   = collapse_whitespace(strip_html(raw_html))
    digest = hashlib.sha256(text.encode('utf-8')).hexdigest()
    return f'sha256:{digest}'


def verify_content_hash(raw_html: str, stored_hash: str) -> bool:
    """Return True if the current page content matches the stored hash."""
    return compute_content_hash(raw_html) == stored_hash
