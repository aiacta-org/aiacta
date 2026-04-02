/** AIACTA shared TypeScript types. */

export type CrawlPurpose = 'training' | 'rag' | 'index' | 'quality-eval';

export interface CrawlManifestUrl {
  url: string; last_crawled: string; crawl_count_30d: number;
  purpose: CrawlPurpose[]; http_status_at_crawl: number; content_hash: string;
}
export interface CrawlManifestResponse {
  provider: string; domain: string; schema_version: '1.0';
  period: { from: string; to: string }; total_crawled_urls: number;
  next_cursor?: string; urls: CrawlManifestUrl[];
}
export type CitationType = 'factual_source' | 'recommendation' | 'tool-result';
export interface CitationEvent {
  schema_version: '1.0'; provider: string; event_type: 'citation.generated';
  event_id: string; idempotency_key: string; timestamp: string;
  citation: { url: string; citation_type: CitationType; context_summary?: string;
    query_category_l1?: string; query_category_l2?: string; model?: string;
    response_locale?: string; user_country?: string; };
  attribution: { display_type: string; user_interface: string; };
}
export interface CitationBatch { batch_id: string; schema_version: '1.0'; events: CitationEvent[]; }
export type RewardTier = 'standard' | 'premium' | 'licensing-only' | 'none';
export interface AttributionTxtConfig {
  schemaVersion: string; contact: string[]; preferredAttribution?: string;
  canonicalAuthor?: string; allowPurpose: CrawlPurpose[]; disallowPurpose: CrawlPurpose[];
  requireCitation: boolean; requireSourceLink: boolean; citationFormat: string;
  allowUtmAppend: boolean; preferredUtmSource?: string; citationWebhook?: string;
  recrawlAfter?: string; licensingContact?: string; licensingUrl?: string;
  rewardTier: RewardTier; contentLicense?: string;
}
