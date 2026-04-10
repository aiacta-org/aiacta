# AIACTA Creator Guide
## How to Protect Your Content and Get Credit in the Age of AI

> **Who this guide is for:** Bloggers, journalists, newsletter writers,
> independent researchers, YouTubers with transcripts, Substack authors,
> podcast creators, and anyone who publishes original content on the web.
>
> **No technical experience required.** This guide starts from zero.
> If you can copy and paste text into a file, you can participate in AIACTA.

---

## Table of Contents

1. [What Is Happening to Your Content Right Now?](#1-what-is-happening-to-your-content-right-now)
2. [What AIACTA Does for You](#2-what-aiacta-does-for-you)
3. [Understanding the Four Tiers](#3-understanding-the-four-tiers)
4. [Tier 1 (Lite): Your First Step in 10 Minutes](#4-tier-1-lite-your-first-step-in-10-minutes)
5. [Tier 2 (Standard): See Where Your Content Is Being Cited](#5-tier-2-standard-see-where-your-content-is-being-cited)
6. [Tier 3 (Advanced): Real-Time Citation Alerts](#6-tier-3-advanced-real-time-citation-alerts)
7. [Tier 4 (Enterprise): Direct Licensing and Maximum Revenue](#7-tier-4-enterprise-direct-licensing-and-maximum-revenue)
8. [Registering for AAC Distributions](#8-registering-for-aac-distributions)
9. [Understanding Your Rights](#9-understanding-your-rights)
10. [Platform-Specific Guides](#10-platform-specific-guides)
11. [Frequently Asked Questions](#11-frequently-asked-questions)
12. [Glossary of Terms](#12-glossary-of-terms)

---

## 1. What Is Happening to Your Content Right Now?

Every day, millions of people ask AI assistants like ChatGPT, Claude, Gemini,
and Perplexity questions. Those AI systems answer by drawing on content from
across the web — including your articles, blog posts, research, and writing.

Right now, when an AI uses your content to answer someone's question:

**You receive nothing.** No notification. No credit. No traffic. No payment.

This is not because AI companies are evil. It is because the technical
infrastructure to make attribution and compensation possible simply does not
exist yet. No one has built the plumbing.

AIACTA is that plumbing.

The contrast with traditional search is stark. When Google uses your content,
you can see in Google Search Console exactly which queries your pages appeared
in, how many times they were shown, how many people clicked through, and how
often your site was crawled. You get data you can use to make decisions.

When Claude or ChatGPT uses your content in a response? You get nothing.

AIACTA proposes to change this by establishing the same kind of transparency
infrastructure for AI that Search Console provides for traditional search.

---

## 2. What AIACTA Does for You

AIACTA is a set of open technical standards that, when implemented by AI
companies, give you:

**Visibility** — You will be able to see which AI companies are crawling
your site, how often, and whether they are using your content for training
their models or for answering user queries in real time.

**Notification** — Every time an AI cites one of your articles in a response,
you can receive an instant notification telling you: which article, which AI
platform, what category of question it answered, and where in the world the
user was (country-level only, never more specific).

**Attribution** — AI platforms will be required to credit your publication
when they cite your work. Your preferred attribution name will appear in responses.

**Traffic** — When users click on links in AI responses, the traffic will be
properly tagged as coming from AI platforms, so your analytics will finally
show you how much of your traffic originates from AI referrals.

**Compensation** — Through the AI Attribution Collective (AAC), a neutral
body modelled on music royalty organisations like ASCAP and BMI, you can
receive a share of the revenue AI companies earn from using your content.

You do not need to do all of this at once. AIACTA has four tiers, and
even the simplest tier — a single text file on your website — puts you
on record as a participant in the emerging fair AI ecosystem.

---

## 3. Understanding the Four Tiers

AIACTA offers a tiered participation model so that a solo blogger with no
technical skills and a major media company with a full engineering team can
both participate at their appropriate level.

| Tier | Who It's For | Technical Skill Needed | Time Investment | What You Get |
|------|-------------|----------------------|----------------|-------------|
| **Lite** | Individuals, small blogs, no developer | None — copy and paste | 10–30 minutes | AAC registration, citation analytics via no-code dashboard |
| **Standard** | Mid-size publishers with basic web access | Minimal (FTP or CMS access) | 1–3 hours | Crawl manifest queries (90-day history), improved analytics |
| **Advanced** | Larger publishers with a developer available | Developer needed | 1–2 days | Real-time citation webhooks, 365-day data history |
| **Enterprise** | Major media companies | Developer team | Ongoing | Direct licensing, AAC premium distributions, audit reports |

This guide is primarily written for the Lite and Standard tiers —
the vast majority of independent content creators.

---

## 4. Tier 1 (Lite): Your First Step in 10 Minutes

The Lite Tier requires one thing: creating a text file called
`ai-attribution.txt` on your website and registering with the AAC.

This file is to AI what `robots.txt` is to search engine crawlers — a
machine-readable declaration of your preferences. Any AIACTA-compliant
AI system will read this file before crawling your site.

### Step 1: Understand What the File Does

The `ai-attribution.txt` file tells AI companies:
- How you want to be credited when your content is cited
- Which types of AI use you allow or disallow
- Whether you want citation notifications
- How to contact you for licensing
- What licence your content is published under

### Step 2: Create Your ai-attribution.txt File

Open any text editor (Notepad on Windows, TextEdit on Mac, or any
word processor in plain text mode) and create a new file.

Copy the template below and fill in your own information:

```
# ai-attribution.txt for [your website]
# See: https://aiacta.org/spec/v1.0

Schema-Version: 1.0

# Your contact information for AI companies wanting to discuss licensing
Contact: your@email.com

# How you want to be credited in AI responses
Preferred-Attribution: Your Name or Publication Name (yourwebsite.com)

# What types of AI use you allow
# Options: training, rag, index, quality-eval
# "rag" means your content can be used to answer real-time queries
# "index" means your site can be indexed for general reference
# "training" means your content can be used to train new AI models
Allow-Purpose: rag
Allow-Purpose: index
Disallow-Purpose: training

# Do you want AI systems to cite your source when using your content?
Require-Citation: true

# Do you want citations to include a clickable link back to your article?
Require-Source-Link: true

# How citations should appear: title-only, url-only, title-and-url, author-title-url
Citation-Format: title-and-url

# Contact for data licensing agreements
Licensing-Contact: your@email.com

# Opt into the AAC reward distribution system
# Options: standard, premium, licensing-only, none
Reward-Tier: standard

# The licence your content is published under (SPDX identifier)
# Examples: CC-BY-SA-4.0, CC-BY-4.0, CC-BY-ND-4.0, All-Rights-Reserved
Content-License: All-Rights-Reserved
```

**Deciding what to allow:**

Most independent creators choose to allow `rag` and `index` (allowing AI
to answer questions using their content) while disallowing `training`
(preventing AI companies from using content to train new models, which has
different legal and commercial implications).

If you want to participate fully in the emerging AI economy:
- Set `Allow-Purpose: rag` — lets AI answer queries using your content
- Set `Allow-Purpose: index` — lets AI index your content generally
- Set `Disallow-Purpose: training` — blocks training use without a separate licence
- Set `Reward-Tier: standard` — opts you into AAC distributions

If you want maximum restriction:
- Set `Disallow-Purpose: training`
- Set `Disallow-Purpose: rag`
- Set `Disallow-Purpose: index`
- (Note: this is essentially equivalent to setting `Disallow: /` in robots.txt
  for AI bots — nothing will be blocked at the HTTP level, but compliant AI
  systems will respect these preferences)

**Choosing your content licence:**

| Licence | What It Means |
|---------|--------------|
| `All-Rights-Reserved` | You retain all rights; any use requires explicit permission |
| `CC-BY-4.0` | Anyone can use your content with attribution |
| `CC-BY-SA-4.0` | Use with attribution; derivatives must use same licence |
| `CC-BY-ND-4.0` | Use with attribution; no derivative works allowed |
| `CC-BY-NC-4.0` | Attribution required; no commercial use |
| `CC0` | Public domain; you waive all rights |

Most independent creators should use `All-Rights-Reserved` or
`CC-BY-SA-4.0`. If you are unsure, use `All-Rights-Reserved`.

### Step 3: Validate Your File

Before uploading, check your file for errors using the free validator:

Go to: https://aiacta.org/validator

Or if you have Node.js installed:
```bash
npx @aiacta-org/ai-attribution-lint /path/to/your/ai-attribution.txt
```

The validator will tell you if any fields are incorrect and explain how to fix them.

### Step 4: Upload the File to Your Website

The file must be accessible at this URL:
```
https://yourwebsite.com/.well-known/ai-attribution.txt
```

**How to upload depends on your platform:**

**WordPress:**
1. Download the AIACTA WordPress plugin from the WordPress Plugin Directory
   (search "AIACTA Attribution")
2. Install and activate the plugin
3. Go to Settings → AIACTA Attribution
4. Paste your `ai-attribution.txt` content into the text box
5. Click Save — the plugin handles serving it at the correct URL

**Squarespace:**
1. Go to Settings → Advanced → Code Injection
2. Add this in the Header section (this method serves the file via a
   workaround — see the Squarespace-specific guide at docs/for-publishers/
   for full instructions)

**Ghost:**
1. Go to your Ghost admin panel
2. Settings → Code Injection → Site Header
3. Follow the Ghost-specific instructions below in Section 10

**Substack:**
If you use a custom domain with Substack, use the Cloudflare Worker
approach in `examples/substack-integration/`. If you do not have a
custom domain, see the "No Custom Domain" section below.

**Generic (FTP or cPanel hosting):**
1. Create a folder called `.well-known` in your website's root directory
   (the same folder that contains your `index.html` or `index.php`)
2. Upload your `ai-attribution.txt` file into that folder

   Note: Some FTP clients hide folders beginning with `.` — enable "Show
   hidden files" in your FTP client settings.

3. Test that the file is accessible:
   Open your browser and go to `https://yourwebsite.com/.well-known/ai-attribution.txt`
   You should see the plain text content you created.

**No Website (email newsletter only):**
If you only have an email newsletter (Substack, Beehiiv, ConvertKit, etc.)
without a custom domain, you can still register with the AAC. See
[Section 8 — Registering for AAC Distributions](#8-registering-for-aac-distributions).

### Step 5: Verify Your File is Working

After uploading, validate that AI systems can find it:

```bash
# Online validator:
# https://aiacta.org/validator?url=https://yourwebsite.com

# Command line:
npx @aiacta-org/ai-attribution-lint https://yourwebsite.com
```

If you see "1 warning, 0 errors" or "0 warnings, 0 errors", you are done.

---

## 5. Tier 2 (Standard): See Where Your Content Is Being Cited

The Standard Tier connects you to AI providers' Crawl Manifest APIs — the
equivalent of Google Search Console but for AI. You will be able to see
exactly which of your pages were crawled by AI bots, when, and for what purpose.

### What You Will Be Able to See

Once you are registered with each AI provider's Publisher Portal:
- Which pages on your site were crawled in the last 90 days
- Whether the crawl purpose was training, real-time querying (RAG), or indexing
- How many times each page was crawled
- What HTTP status was returned (useful for catching broken pages)
- A content hash to verify your content was not altered before use

### Registering with AI Provider Portals

Each major AI provider will have a Publisher Portal (similar to Google
Search Console) where you verify your domain and access crawl data.

**For each provider you want to monitor:**
1. Go to their Publisher Portal (links listed at https://aiacta.org/providers)
2. Create an account using your email address
3. Add your website domain
4. Verify ownership using one of these methods:
   - **DNS TXT record** — add a text record to your domain's DNS settings
     (your domain registrar's help section explains how)
   - **HTML file** — upload a verification file the portal generates
   - **Meta tag** — add a meta tag to your homepage's HTML

Once verified, you will have access to the crawl manifest API for your domain.

### Using the AIACTA Dashboard Lite

If you prefer a no-code interface that aggregates data from all AI providers
in one place, use the open-source AIACTA Dashboard Lite:

**Hosted version:** https://dashboard.aiacta.org (free for Lite and Standard tiers)

**Self-hosted version:**
If you have basic server access (even a $5/month DigitalOcean droplet works):
```bash
git clone https://github.com/aiacta-org/aiacta.git
cd aiacta/packages/aac-dashboard-lite
npm install
npm run build
npm run preview  # starts on port 4173
```

The dashboard pulls citation and crawl data from each provider's pull API
and displays it in a unified view. You just enter your domain and API keys
from each provider's portal.

---

## 6. Tier 3 (Advanced): Real-Time Citation Alerts

The Advanced Tier sets up citation webhooks — real-time notifications sent
directly to your server every time an AI cites one of your articles.

This requires a developer or a developer-friendly platform, but the benefit
is significant: instead of periodically pulling data, you receive events
instantly, building a comprehensive historical record.

### What You Will Receive

For each citation, you will receive:
- The exact URL of your article that was cited
- Which AI platform cited it
- What type of question it was used to answer (technology, science, etc.)
- Which AI model was used
- The country the user was in (country-level only — never more specific)

### How to Set Up a Webhook Endpoint

A webhook endpoint is a URL on your server that receives citation event
notifications. The simplest way to set this up:

**Option A: Use a webhook service (no code required)**

Services like Zapier, Make (formerly Integromat), or Pipedream can receive
webhook events without any custom code:

1. Create a free account at https://zapier.com (or your preferred service)
2. Create a new "Zap" with trigger: Webhooks by Zapier → Catch Hook
3. Zapier gives you a unique URL like `https://hooks.zapier.com/hooks/catch/...`
4. Add this URL to your `ai-attribution.txt`:
   ```
   Citation-Webhook: https://hooks.zapier.com/hooks/catch/YOUR-URL-HERE
   ```
5. Configure Zapier to email you, add to a spreadsheet, or send a Slack
   message every time a citation arrives

**Important note about webhook verification:** Zapier-style services do not
support HMAC signature verification, which means anyone could send fake
citation events to your Zapier URL. For the Lite/Standard tier this is
acceptable (fake events just create false analytics). For Advanced/Enterprise,
use Option B.

**Option B: Self-hosted with the ai-citation-sdk (developer required)**

```javascript
// app.js
const express = require('express');
const { createExpressMiddleware } = require('ai-citation-sdk');

const app = express();
app.use(express.raw({ type: 'application/json' }));

app.post('/webhooks/ai-citations',
  createExpressMiddleware({
    secret:  process.env.AIACTA_WEBHOOK_SECRET,  // from provider portal
    store:   myDatabase,  // needs { exists(key), set(key) }
    onEvent: async (event) => {
      const { provider, citation, timestamp } = event;
      console.log(`${provider} cited: ${citation.url} at ${timestamp}`);
      // Save to your database, send email, post to Slack, etc.
    },
  })
);

app.listen(3000);
```

**Option C: WordPress plugin**

Install the AIACTA Citation Receiver plugin from the WordPress Plugin Directory.
Configure it with your webhook secret from each provider's portal.
Citation events are stored in your WordPress database and displayed in a
dashboard inside your admin panel.

### What to Do With Citation Data

Once you are receiving citation events, you can:

1. **Track which articles are most cited** — This is your AI Search Console.
   High-citation articles are the ones AI platforms find most authoritative.
   Write more content like these.

2. **Monitor citation types** — Are you being cited as a `factual_source`
   (AI treats your content as a primary reference) or as a `recommendation`
   (AI suggests your site for further reading)? Both have different SEO and
   marketing implications.

3. **Analyse by AI platform** — Which AI platform cites your content most?
   This helps you understand your reach across different AI ecosystems.

4. **Track citation trends** — Is your AI citation rate growing or shrinking?
   This is a new and important content performance metric.

5. **Licensing leverage** — Citation data is direct evidence of how much
   value AI companies derive from your content. This is exactly what you
   need if you ever want to negotiate a direct licensing agreement with
   an AI company or join a collective licensing arrangement.

---

## 7. Tier 4 (Enterprise): Direct Licensing and Maximum Revenue

The Enterprise Tier is designed for major publishers, news organisations,
academic publishers, and anyone with a significant content catalogue who
wants to pursue direct licensing arrangements with AI companies.

### What Enterprise Adds

- **Direct licensing facilitation** — Your `ai-attribution.txt` declares
  a `Licensing-URL` where AI companies can request access to your content
  for specific purposes under specific terms.

- **AAC Premium tier** — Higher distribution multipliers, priority in the
  distribution calculation, and dedicated account management from the AAC.

- **365-day data retention** — Citation and crawl data stored for a full
  year, providing comprehensive historical evidence for licensing negotiations.

- **Audit reports** — Annual compliance reports from the AAC documenting
  your citation volume, revenue, and the providers citing your content.

### Setting Up Enterprise

Add to your `ai-attribution.txt`:
```
Reward-Tier: premium
Licensing-Contact: data-licensing@yourcompany.com
Licensing-URL: https://yourcompany.com/ai-licensing-terms
```

Create a licensing terms page at your `Licensing-URL` that describes:
- What types of use you will licence (training, RAG, or both)
- What you expect in return (per-query fees, flat licensing, revenue share)
- Contact process for initiating negotiations

### Working with the AAC for Enterprise

Contact the AAC at licensing@aiacta.org to discuss the Enterprise participation
model and what direct licensing facilitation looks like for your specific
situation.

---

## 8. Registering for AAC Distributions

The AI Attribution Collective (AAC) is the neutral body that collects
contributions from AI companies and distributes them to publishers and
creators based on how much their content is cited.

It works like music royalties: music streaming platforms pay royalties to
ASCAP and BMI, which distribute to songwriters. The AAC does the same for
written content and AI.

### How the Distribution Formula Works

Your share of each distribution is calculated by a weighted formula:

```
Your Weight = Citation Count
            × Content Licence Multiplier
            × Query Value Weight
            × Freshness Bonus
```

**Content Licence Multiplier:**
| Your Licence | Multiplier |
|-------------|-----------|
| All-Rights-Reserved | 1.0 (standard) |
| CC-BY-ND | 0.8 |
| CC-BY-SA | 0.7 |
| CC-BY | 0.5 |
| CC0 (Public Domain) | 0.0 |

All-Rights-Reserved content earns the highest multiplier because it
represents the highest commercial value.

**Query Value Weight:**
| Type of Query | Multiplier |
|--------------|-----------|
| Commercial queries (product search, business research) | 2.0× |
| Informational queries (general knowledge questions) | 1.0× |
| Navigation queries (brand name searches) | 0.5× |

**Freshness Bonus:**
Content published within the last 30 days at the time it was cited receives
a 20% bonus, rewarding timely, current journalism and writing.

**Logical/utility queries excluded:** AI responses to purely logical or
computational questions (code generation, math, translation) are not counted
toward distributions, because these responses do not rely on specific
publisher content.

### How to Register

1. Go to https://aac.aiacta.org/register
2. Enter your domain (or email newsletter URL)
3. Choose your verification method (DNS TXT record is simplest)
4. Complete the TXT record verification within 48 hours
5. Set `Reward-Tier: standard` in your `ai-attribution.txt`
6. Provide payment details via the AAC self-service portal

The entire process takes 15–30 minutes and requires no technical expertise
beyond the ability to add a DNS TXT record (your domain registrar provides
step-by-step instructions for this in their help documentation).

### When Are Distributions Paid?

The AAC distributes quarterly. Payment methods include:
- Bank transfer (ACH, SEPA, SWIFT)
- PayPal
- Stripe

Minimum payout threshold: $10 (distributions below this accumulate to the
next quarter).

---

## 9. Understanding Your Rights

### What AIACTA Does Not Do

AIACTA does not automatically stop AI companies from using your content.
It does not encrypt your content or make it technically unreadable.

What it does is establish a **technical and legal framework** through which:
1. AI companies can demonstrate they have acted in good faith
2. Publishers can demonstrate the commercial value of their content
3. Compensation can flow transparently through a verifiable mechanism

### Can I Still Block AI Crawlers Completely?

Yes. `robots.txt` is still the mechanism for blocking crawlers entirely.
Setting `Disallow: /` for specific AI bots in your robots.txt will block
those crawlers at the HTTP level, regardless of what your `ai-attribution.txt` says.

AIACTA's `Disallow-Purpose` directive is for more nuanced preferences —
allowing some uses while blocking others. If you want to block completely,
use robots.txt.

### What If AI Companies Ignore My Preferences?

Currently, AIACTA is a voluntary standard. AI companies are not legally
obligated to implement it. However:

- The EU AI Act creates regulatory pressure that is increasing rapidly
- Publishers who document their preferences have stronger legal standing
  in copyright disputes
- The public record created by `ai-attribution.txt` files establishes
  clear notice of your preferences — relevant in any legal proceeding

Think of it like a copyright notice on your website. Legally, copyright
exists whether or not you display a notice, but displaying one strengthens
your position.

### The Difference Between Training and RAG

These are two fundamentally different uses of your content:

**Training** — Your content is used to teach an AI model during its
development. The content becomes embedded in the model's "knowledge".
This is a one-time use that has lasting effects and significant commercial
value to the AI company.

**RAG (Retrieval-Augmented Generation)** — Your content is retrieved and
used in real time to answer a specific user query. Your article is fetched,
read, and incorporated into a response. This is more like being cited in a
news article — it happens at query time, not at training time.

Most publishers are comfortable allowing RAG because it is analogous to
how search engines work today. The training question is more complex and
has significant ongoing legal activity around it.

---

## 10. Platform-Specific Guides

### WordPress

**Automated (recommended):**
1. Log into your WordPress admin panel
2. Go to Plugins → Add New Plugin
3. Search "AIACTA Attribution"
4. Install and activate
5. Go to Settings → AIACTA Attribution
6. Fill in your details in the form — no file editing needed
7. The plugin automatically serves `ai-attribution.txt` at the correct URL
8. The plugin also sets up a webhook receiver endpoint for citation notifications

**Manual:**
Upload your `ai-attribution.txt` to your WordPress root directory
(the same folder containing `wp-config.php`) and configure your web server
to serve it at `/.well-known/ai-attribution.txt`.

---

### Ghost CMS

1. Create your `ai-attribution.txt` content using the template above
2. In your Ghost admin: Settings → Code Injection → Site Header
3. Add this snippet (replace the content with your actual file text):

```html
<script>
// AIACTA: This serves ai-attribution.txt via a route
// For full Ghost integration, use the aiacta-ghost npm package
</script>
```

For a production Ghost setup, use the Ghost integration file in
`examples/ghost-integration/ghost-aiacta-webhook.js`.

Contact your Ghost hosting provider and ask them to serve a static file
at `/.well-known/ai-attribution.txt` — most managed Ghost hosts support this.

---

### Substack (with custom domain)

Use the Cloudflare Worker approach:

1. Create a free Cloudflare account at https://cloudflare.com
2. Add your custom domain to Cloudflare (follow their setup wizard)
3. Go to Workers → Create Application → Create Worker
4. Paste the code from `examples/substack-integration/substack-aiacta.js`
5. Replace `AUTHOR_CONFIG` at the top with your details
6. Deploy the worker
7. Add a route in Cloudflare: `yoursubstackdomain.com/.well-known/*`

This serves your `ai-attribution.txt` and handles citation webhooks entirely
in the cloud with no server required.

---

### Substack (no custom domain)

Without a custom domain, you cannot serve `ai-attribution.txt` at your
own URL. However, you can still:

1. Register with the AAC using your Substack URL (e.g., `yourname.substack.com`)
2. Substack itself may implement AIACTA at the platform level — check
   https://aiacta.org/platforms for current platform support status
3. Join the waitlist for Substack integration at https://aiacta.org/waitlist

---

### Medium

Medium is a platform-hosted service. You cannot serve files at
`/.well-known/`. Check https://aiacta.org/platforms for Medium integration
status. Register with the AAC using your Medium profile URL in the meantime.

---

### Beehiiv, ConvertKit, Mailchimp (email newsletters)

For email-only creators without a custom domain:
1. Register with the AAC directly at https://aac.aiacta.org/register
2. Provide your newsletter URL or email as your identifier
3. The AAC maintains a directory of newsletter creators and advocates for
   platform-level integration with newsletter providers

---

### Self-hosted (any CMS or static site)

**nginx:**
```nginx
# Serve ai-attribution.txt from the .well-known location
location /.well-known/ai-attribution.txt {
    alias /path/to/your/ai-attribution.txt;
    add_header Content-Type text/plain;
    add_header Cache-Control "max-age=86400";
}
```

**Apache:**
```apache
# In your .htaccess or VirtualHost config
Alias /.well-known/ai-attribution.txt /path/to/your/ai-attribution.txt
<Files "ai-attribution.txt">
    ForceType text/plain
    Header set Cache-Control "max-age=86400"
</Files>
```

**Static site (GitHub Pages, Netlify, Vercel):**
Create a file at `public/.well-known/ai-attribution.txt` and it will be
served automatically at the correct URL when you deploy.

---

## 11. Frequently Asked Questions

**Q: Do I need to be a technical person to participate in AIACTA?**

No. The Lite Tier — which covers the majority of independent creators —
requires only that you create a text file and upload it to your website.
If you can upload an image to your website, you can do this.

**Q: Will this actually work? What if AI companies just ignore my preferences?**

AIACTA is a voluntary standard today. But three things make adoption
increasingly inevitable: regulatory pressure (particularly the EU AI Act),
litigation risk for AI companies that cannot demonstrate good-faith behaviour,
and the reputational and business value of publisher partnerships.

The goal of registering your preferences now is to establish a clear
public record. Every publisher who publishes an `ai-attribution.txt`
adds to the collective evidence that the industry takes this seriously.

**Q: How much money will I actually make from AAC distributions?**

We cannot promise specific amounts because the AAC pool depends on AI
company contributions, which are voluntary in Phase 1 of adoption. What
we can say is: zero contribution is the current default, and any amount
above zero represents progress toward a fair AI economy.

The framework is designed so that as AI companies adopt it — motivated by
regulatory compliance and publisher relations — the pool grows. Publishers
who register early will benefit from the full history of their citation data.

**Q: Will setting Disallow-Purpose: training actually stop AI companies
from training on my content?**

AIACTA creates a clear, machine-readable record of your preferences.
Compliant AI systems will respect this directive. Non-compliant systems
will not. However, publishing your preferences clearly establishes "notice"
— a legally relevant concept in copyright law. It strengthens your position
considerably compared to having no recorded preferences at all.

**Q: My site gets very little traffic. Is it worth doing this?**

Yes. AIACTA is not just about individual sites — it is about the collective
voice of the publishing ecosystem. A niche expert blog on historical
linguistics might be cited far more often in AI responses than its traffic
suggests, because AI values authority and specificity.

Also: registering for AAC is free, and the potential upside is real.
There is no cost to participation.

**Q: I have already blocked AI bots with robots.txt. Do I still need this?**

These serve different purposes. `robots.txt` blocks crawlers at the HTTP
level — AI systems that comply will not fetch your content. `ai-attribution.txt`
communicates your preferences for content that has already been crawled and
indexed. Even if you block new crawls, AI systems may have your content from
before your robots.txt change. The `ai-attribution.txt` file addresses that
historical content too.

**Q: What is the difference between the AAC and the AIACTA Foundation?**

AIACTA is the technical standard (the specifications for crawl manifests,
webhooks, etc.). The AIACTA Foundation is the non-profit governance body
being formed to steward the standard.

The AI Attribution Collective (AAC) is the separate economic body that
manages the pool of contributions from AI companies and distributes them
to publishers. Think of AIACTA as the sheet music standard and the AAC
as the organisation that collects royalties for musicians.

**Q: I write for someone else's publication. Can I still participate?**

You need to have control over the publication's domain to serve
`ai-attribution.txt`. If you are a freelance writer with your own website
and byline page, you can register that. If you write exclusively for a
large publication, encourage them to register — and point them to the
Enterprise tier documentation.

---

## 12. Glossary of Terms

**AAC (AI Attribution Collective):** The neutral body that manages the pool
of contributions from AI companies and distributes them to registered publishers.

**ai-attribution.txt:** A text file you publish on your website declaring
your preferences for AI use of your content. AIACTA-compliant AI systems
read this before crawling your site.

**Citation Webhook:** An automated notification sent to your server whenever
an AI system cites one of your articles in a response.

**Crawl Manifest:** A log that AI companies maintain of which pages they have
crawled, when, and for what purpose. Publishers can query this log via the
Crawl Manifest API.

**GDPR:** The EU's General Data Protection Regulation. Citation events are
designed to comply with GDPR's data minimisation requirements — they contain
no user IDs, no full query text, and no geographic data more specific than country.

**Idempotency Key:** A unique identifier in each citation event that allows
your system to safely process events multiple times without counting the same
citation twice.

**RAG (Retrieval-Augmented Generation):** A technique where an AI retrieves
content from the web in real time to help answer a user's query. If an AI
fetches your article to answer a question, that is RAG use.

**robots.txt:** A file on your website that tells web crawlers which pages
they may or may not visit. AIACTA's `ai-attribution.txt` complements (not
replaces) robots.txt by adding purpose-specific preferences.

**SPDX Licence Identifier:** A standardised code for identifying content
licences. Examples: `CC-BY-SA-4.0`, `CC0-1.0`, `All-Rights-Reserved`.

**Training (AI):** Using content to teach an AI model during development.
Distinct from RAG — training is a one-time process that embeds content into
the model's permanent knowledge.

**VWP (Verifiable Webhook Protocol):** The security layer in AIACTA that
ensures citation events are cryptographically signed and verifiable. This
prevents fake citation events from being sent to your endpoint.

**Webhook:** A system where one server automatically sends a notification
to another server when a specific event occurs. Citation webhooks notify
your server whenever an AI cites your content.

---

*Ready to start? Create your `ai-attribution.txt` file and upload it to
your website. Then register with the AAC at https://aac.aiacta.org/register*

*Questions? Open a Discussion at github.com/aiacta-org/aiacta/discussions
or email contact@aiacta.org*
