"""Unit tests for the Python crawl manifest client."""
import unittest
from unittest.mock import patch, MagicMock
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../src/python'))
from crawl_manifest_client import CrawlManifestClient

FIXTURE = {
    'provider': 'mock', 'domain': 'example.com', 'schema_version': '1.0',
    'period': {'from': '2026-01-01T00:00:00Z', 'to': '2026-03-01T00:00:00Z'},
    'total_crawled_urls': 1, 'next_cursor': None,
    'urls': [{'url': 'https://example.com/article', 'last_crawled': '2026-02-01T00:00:00Z',
              'crawl_count_30d': 2, 'purpose': ['rag'], 'http_status_at_crawl': 200,
              'content_hash': 'sha256:abc123'}],
}

class TestCrawlManifestClient(unittest.TestCase):
    @patch('crawl_manifest_client.requests.get')
    def test_fetch_all_yields_urls(self, mock_get):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = FIXTURE
        mock_resp.raise_for_status = MagicMock()
        mock_get.return_value = mock_resp

        client = CrawlManifestClient(provider='mock', api_key='key')
        results = list(client.fetch_all('example.com', '2026-01-01T00:00:00Z', '2026-03-01T00:00:00Z'))
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['url'], 'https://example.com/article')

    @patch('crawl_manifest_client.requests.get')
    def test_caches_responses(self, mock_get):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = FIXTURE
        mock_resp.raise_for_status = MagicMock()
        mock_get.return_value = mock_resp

        client = CrawlManifestClient(provider='mock', api_key='key')
        list(client.fetch_all('example.com', '2026-01-01T00:00:00Z', '2026-03-01T00:00:00Z'))
        list(client.fetch_all('example.com', '2026-01-01T00:00:00Z', '2026-03-01T00:00:00Z'))
        # Should only call the API once due to caching
        self.assertEqual(mock_get.call_count, 1)

if __name__ == '__main__':
    unittest.main()
