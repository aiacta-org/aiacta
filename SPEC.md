# AIACTA v1.0

## 1. Overview

The AIACTA v1.0 defines the minimal set of requirements for enabling:

- Content attribution
- Publisher identification
- Basic AI-readable metadata

---

## 2. Required Components

### 2.1 Publisher Declaration Endpoint

**Location:**
/.well-known/aiacta.json


**Required Fields:**

```json
{
  "aiacta_version": "1.0",
  "publisher": "string",
  "base_url": "string"
}
```

### 2.2 Content-Level Metadata

Each content page SHOULD include:
```
<meta name="aiacta:content_id" content="string">
<meta name="aiacta:owner" content="string">
<meta name="aiacta:canonical" content="url">
```

### 2.3 HTTP Headers (Optional but Recommended)
X-AIACTA-Content-ID: string
X-AIACTA-Owner: string

## 3. Content ID Requirements
- Must be unique per content item

- Must be stable over time

- Can be UUID, slug, or hash


## 4. Compatibility

AIACTA is designed to work alongside:

- HTML metadata

- Existing SEO standards

- JSON-based APIs


## 5. Extensibility

Additional fields MAY be added without breaking compatibility.

## 6. Versioning
Current version: 1.0
Future versions MUST remain backward compatible where possible
