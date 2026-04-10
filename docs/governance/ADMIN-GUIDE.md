# AIACTA™ & AAC™ Administration Guide

*Eric Michel, March 29th, 2026*

## Operations Manual for the Governance and Administration Team

> **Who this guide is for:** The founding team of the AIACTA™ Foundation,
> the AI Attribution Collective (AAC™) staff, and Working Group members
> responsible for operating the framework, managing the open-source project,
> governing the specification, and running the economic distribution system.
>
> This guide is written to be a complete operational reference.

---

## Table of Contents

1. [Organisational Structure](#1-organisational-structure)
2. [Setting Up the GitHub Repository](#2-setting-up-the-github-repository)
3. [Managing the Open-Source Project](#3-managing-the-open-source-project)
4. [Running the Working Group](#4-running-the-working-group)
5. [Specification Change Process](#5-specification-change-process)
6. [Operating the AAC Server](#6-operating-the-aac-server)
7. [Publisher and Provider Enrollment Operations](#7-publisher-and-provider-enrollment-operations)
8. [Running Distribution Calculations](#8-running-distribution-calculations)
9. [Fraud Detection and Compliance Operations](#9-fraud-detection-and-compliance-operations)
10. [Certification and Compliance Tiers](#10-certification-and-compliance-tiers)
11. [Communications and Community Management](#11-communications-and-community-management)
12. [Legal and Regulatory Operations](#12-legal-and-regulatory-operations)
13. [Financial Operations](#13-financial-operations)
14. [Security Incident Response](#14-security-incident-response)
15. [Release Management](#15-release-management)
16. [Year-One Operational Roadmap](#16-year-one-operational-roadmap)

---

## 1. Organisational Structure

AIACTA™ has two distinct but related organisations. Understanding the distinction
is critical to running them correctly.

### The AIACTA Foundation™ (Governing Body)

**Purpose:** Governs the technical specification, certifies compliance, and
stewards the brand.

**Legal form:** Non-profit foundation (recommended jurisdiction: Delaware, USA
or a European equivalent like a Dutch Stichting or Swiss Verein for international
neutrality).

**Key responsibilities:**
- Maintaining and evolving the AIACTA specification
- Operating the certification programme (Bronze/Silver/Gold/Platinum tiers)
- Managing the open-source GitHub repository and developer community
- Convening the Working Group
- Trademark licensing ("AIACTA-certified", "AIACTA-compliant")
- Publishing the whitepaper and technical documentation
- Public communications about the standard

**Revenue sources:**
- Working Group membership fees (from AI providers and enterprise publishers)
- Certification fees (for Platinum tier audit facilitation)
- Grant funding (foundations, government digital economy programmes)
- Sponsorships (associate membership tier)

### The AI Attribution Collective™ (AAC™)

**Purpose:** Economic body that manages contributions from AI providers and
distributes them to registered publishers and creators.

**Legal form:** This should be structured like a Performing Rights Organisation
(PRO) — potentially a non-profit collecting society, similar to ASCAP, BMI,
or PRS for Music. Some jurisdictions have specific legal frameworks for
collecting societies (e.g., in the EU under the Collective Rights Management Directive).

**Key responsibilities:**
- Enrolling AI providers and publishers
- Receiving contribution payments from AI providers
- Running the distribution formula (§7.5)
- Maintaining the attribution ledger
- Operating the citation event pipeline from AI providers
- Making payout distributions to registered publishers
- Auditing compliance (spot checks, Honeypot Verification monitoring)
- Operating the Provenance Query API for law enforcement (§9.5.1)

**Revenue sources:**
- Administrative fee percentage retained from the pool (typically 15–20%,
  similar to PRO industry norms)
- Certification audit facilitation fees (Platinum tier)

### Separation of Powers

The Foundation governs the standard. The AAC manages the money. These should
have separate boards with overlapping representation but distinct governance.

The AIACTA™ author and founding team sit on both boards in the early phase,
but the goal is to transition both to multi-stakeholder governance within 24
months (see Section 4).

---

## 2. The GitHub Repository

The GitHub repository is the central coordination point for the entire
project. 

### Team Structure

Teams:
- `maintainers` — Full write access; can approve and merge PRs
- `spec-team` — Must approve changes to /docs/proposals/ and /shared/schemas/
- `security-team` — Must approve changes to signature/crypto code
- `contributors` — Triage access (can label and close issues)

---

## 3. Managing the Open-Source Project

### Daily Operations (takes ~30 minutes per day)

**Issue triage (10 minutes):**
- Review new issues opened in the last 24 hours
- Label each issue appropriately (bug, enhancement, documentation, good first issue, etc.)
- Respond to questions with a helpful answer or "we are looking into this"
- Close issues that are duplicates (link to the original)
- Close issues that are feature requests outside current scope (with explanation)

**PR review (15 minutes):**
- Check CI status on open PRs
- For PRs awaiting review: assign to the appropriate reviewer
- For PRs with requested changes: follow up if the author has not responded
  in 5+ business days
- Merge PRs that have 2 approvals and a green CI

**Community engagement (5 minutes):**
- Check GitHub Discussions for new questions
- Upvote and answer community responses that are correct
- Respond to any unanswered questions

### Weekly Operations

**Release check:** Are there accumulated fixes or features ready to group
into a patch release? (See Section 15 — Release Management)

**Contributor recognition:** Merge the weekly automated update to
CONTRIBUTORS.md if your tooling generates one, or update manually.

**Dependency updates:** Review Dependabot or Renovate bot PRs and merge
security updates promptly. Schedule minor/major updates for review.

**Metrics review:** Check the project's GitHub Insights:
- Stars (community interest)
- Forks (developer engagement)
- Contributors (ecosystem growth)
- Issues opened vs. closed ratio (backlog health)
- PR merge time (review velocity)

### Monthly Operations

**Maintainer sync:** A 1-hour video call with all maintainers to discuss:
- Project health and direction
- Outstanding large issues or controversial PRs
- Community concerns
- Upcoming priorities
- Volunteer contributor recognition

**Blog post / newsletter:** Publish a brief update at https://aiacta.org/blog
summarising new releases, notable contributions, and adoption news.

### Handling Difficult Situations

**Spam or low-quality PRs:**
Close immediately with a polite note: "Thank you for the contribution, but
this does not meet the project's standards because [reason]. Please review
CONTRIBUTING.md for guidance."

**Contentious technical disagreements:**
If two contributors disagree on an implementation approach, do not let the
discussion drag on in a PR. After 3 rounds of back-and-forth, one of the
maintainers must make a decision, explain the reasoning, and move on.

**Burnout:**
Maintainer burnout is the most common cause of open-source project decline.
Watch for signs: increasing latency in responses, short or dismissive replies,
declining commit activity. Reach out privately. Make sure no one person is
doing more than 40% of the review work.

**Fork/fragmentation risk:**
If a major contributor or AI provider wants to fork the project and create a
competing standard, the best response is to understand their concerns and
offer a more formal governance path (Working Group seat, spec authorship
credit). Fragmentation harms everyone — including them.

---

## 4. Running the Working Group

The Working Group is the multi-stakeholder body that governs the specification.
It is the most important governance mechanism AIACTA has.

### Composition (from the AIACTA™ whitepaper §8.2)

| Stakeholder Class | Seats | Selection |
|------------------|-------|-----------|
| AI providers (Tier 1: OpenAI, Google, Anthropic, Meta, xAI — rotating) | 2 | Annual election by enrolled Tier 1 providers |
| AI providers (Tier 2: others) | 1 | Annual election by enrolled Tier 2 providers |
| Enterprise publishers | 2 | Annual election by verified enterprise publishers |
| Independent creators | 1 | Annual election by verified AAC registrants |
| Developer community | 1 | Annual election by GitHub contributors with 5+ merged PRs |
| Regulators/observers | Non-voting | Invitation (EU AI Office, FTC, UK Ofcom) |
| Civil society | 1 | Appointed by Foundation board |
| Independent chair | 1 | Appointed by Foundation board for 2-year term |

Total voting members: 8

### Establishing the Working Group (Year 1)

In Year 1 before elections are possible, the founding team operates as a
provisional Working Group. To establish the permanent Working Group:

**Months 1–6:**
- Identify and contact candidates for each stakeholder class
- Draft Working Group Charter (governance document)
- Recruit regulatory observers
- Run the first Working Group election

**Month 6:**
- Announce election
- 30-day nomination period
- 14-day voting period (public ballot for transparency, authenticated for integrity)
- Working Group is formally constituted

### Working Group Meeting Operations

**Frequency:** Monthly (1.5 hours)

**Format:**
- First 15 minutes: administrative (previous minutes, action items)
- 60 minutes: substantive discussion (1–2 agenda items)
- 15 minutes: upcoming decisions, next meeting agenda

**Decision Process:**
- Agenda published 14 days before meeting
- Discussion documents circulated 7 days before meeting
- Voting at meeting or by email within 5 days of meeting
- MAJOR changes: 6/8 supermajority
- MINOR changes: 5/8 simple majority
- Procedural decisions: chair's discretion

**Meeting notes:**
All meeting notes are public. Publish on GitHub within 5 days. Follow this format:
`/docs/governance/working-group/meetings/YYYY-MM-DD.md`


---

## 5. Specification Change Process

Maintaining the integrity of the spec is the Foundation's most important function.
Every change to the spec must be traceable, documented, and backwards-compatible
where possible.

### Versioning Rules

The spec uses semantic versioning: `MAJOR.MINOR`

**MINOR changes** (additive, backwards-compatible):
- New optional fields in existing schemas
- New allowed enum values
- New optional endpoints
- Clarifications that do not change behaviour
- Deprecation notices

**MAJOR changes** (breaking, not backwards-compatible):
- Removing required fields
- Changing field meanings
- Adding new mandatory requirements
- Changing authentication mechanisms
- Any change that requires existing implementations to be updated

**Who can propose changes:** Any Working Group member, or anyone in the
public via a GitHub Issue (Working Group members then decide whether to
champion it for formal consideration).

### The Change Process (Step by Step)

**Step 1 — Proposal Submission**
```
1. Anyone opens a GitHub Issue using the spec_change_proposal template
2. Issue gets labelled: 'spec-change', 'needs-champion'
3. A Working Group member comments to champion the proposal (or explains why not)
```

**Step 2 — Technical Review (2 weeks)**
```
1. Champion writes a technical specification document
2. Document covers: motivation, spec change, backwards compatibility assessment,
   implementation complexity estimate, failure mode analysis
3. Document published in /docs/proposals/rfcs/[number]-[title].md
```

**Step 3 — Public Comment Period (60 days)**
```
1. Issue labelled: 'public-comment-open'
2. Comment period announced on GitHub, website, mailing list
3. Anyone in the world can comment — not just Working Group members
4. All comments must be addressed in the champion's written response
```

**Step 4 — Working Group Discussion and Vote**
```
1. Champion presents at Working Group meeting
2. Discussion
3. Vote: MAJOR changes require 6/8 supermajority; MINOR require 5/8 majority
4. Result documented in meeting notes
```

**Step 5 — 90-Day Implementation Notice**
```
1. If approved: announcement published
2. 90-day window before change is effective
3. This gives AI providers and tool authors time to update their implementations
```

**Step 6 — Publication**
```
1. Spec documents updated in /docs/proposals/
2. JSON Schemas updated in /shared/schemas/
3. TypeScript types updated in /shared/types/
4. Reference implementations updated in /packages/
5. Version number incremented
6. Release published (see Section 15)
7. CHANGELOG.md updated
```

### Deprecation Policy

When a field or behaviour is being removed in a future MAJOR version:
1. Announce deprecation 12 months in advance
2. Add deprecation notice to relevant spec documentation
3. Add deprecation warning to the validator (the lint tool warns on deprecated fields)
4. Include in all CHANGELOG entries until removal

---

## 6. Operating the AAC™ Server

The AAC™ server is the technical backbone of the economic framework. It runs
24/7 and handles real money. 

### Infrastructure Requirements

**Minimum for beta/pilot phase:**
- 2 web server instances (for redundancy): 4 CPU / 8GB RAM each
- 1 PostgreSQL database (replace SQLite before production):
  Managed service (AWS RDS, GCP Cloud SQL, or similar)
- Redis for rate limiting and session management
- HTTPS with a valid TLS certificate (use Let's Encrypt via Certbot)
- Regular automated backups (daily minimum, hourly for production)
- Monitoring (uptime, response time, error rate)

**Recommended production setup:**
- Container deployment (Kubernetes or Docker Swarm)
- Load balancer with SSL termination
- Managed PostgreSQL with read replica
- Redis Cluster for session/rate data
- CDN for static assets
- Log aggregation (Datadog, Grafana Cloud, or similar)
- PagerDuty or similar on-call alerting for P1 incidents

### Switching from SQLite to PostgreSQL

Before any production traffic, replace SQLite with PostgreSQL:

1. Install the `pg` package:
   ```bash
   cd packages/aac-server && npm install pg
   ```

2. Update `src/db/database.js` to use `pg` instead of `better-sqlite3`.
   A community PR for this is tracked in the repository under the label
   `postgresql-adapter`.

3. Run migrations against your PostgreSQL instance:
   ```bash
   AAC_DB_URL=postgresql://user:pass@host:5432/aac npm run migrate
   ```

### Backup and Recovery

**Daily backup procedure:**
```bash
# PostgreSQL backup
pg_dump -U aac_user aac_db | gzip > backup/aac_$(date +%Y%m%d).sql.gz

# Upload to offsite storage (S3, GCS, etc.)
aws s3 cp backup/aac_$(date +%Y%m%d).sql.gz s3://aac-backups/
```

**Retention:** Keep 90 days of daily backups, 1 year of monthly backups.

**Recovery test:** Run a recovery drill quarterly. Restore a backup to a
staging environment and verify it works before you ever need to do it in
an emergency.

### Monitoring

Set up alerts for:
- Server response time > 500ms (warning) / > 2000ms (critical)
- Error rate > 1% (warning) / > 5% (critical)
- Database disk usage > 70% (warning) / > 90% (critical)
- Failed distribution runs (immediate alert)
- Any 500 errors in the provenance API (log and alert — this is law enforcement access)

### API Key Management

Each enrolled provider and publisher has API keys. Store them in:
- A dedicated secrets manager (AWS Secrets Manager, HashiCorp Vault)
- Never in the database in plaintext
- Hash them with bcrypt before storage if you must store them in the DB
  (so even a database breach does not expose keys)

Key rotation policy:
- Allow providers to rotate keys without service interruption
  (support a 24-hour window where both old and new key work)
- Force rotation annually for all keys
- Immediate rotation required after any suspected compromise

---

## 7. Publisher and Provider Enrollment Operations

### Provider Enrollment Flow

When an AI provider applies to enrol in the AAC:

**Step 1 — Application review (1 week)**
- Receive application via the AAC server's enrollment API or the web form
- Verify the company's identity and legal standing
- Confirm they have (or are working toward) a technical implementation
- Counter-sign the AAC Participation Agreement

**Step 2 — Technical onboarding (2 weeks)**
- Issue HMAC signing keys for webhook delivery
- Confirm their citation event feed format matches the spec
- Run integration testing against the test harness
- Enable their production citation event pipeline

**Step 3 — Contribution mode selection**
- Provider chooses RPA (Revenue-Proportional) or PCF (Per-Citation Fee)
- Rate agreed (within the published baseline ranges)
- Payment terms agreed (quarterly in arrears)
- First payment due date established

**Step 4 — Go live**
- Enable provider in the citation ledger
- Public announcement (with provider's consent) on the AIACTA website
- Welcome blog post on the AIACTA blog

### Publisher Enrollment Flow

Publishers register through self-service. Your operational responsibility is:

**Domain verification monitoring:**
Check daily for publishers stuck in `pending` status for > 48 hours.
Common issues:
- DNS TXT record not propagated yet (normal — up to 48h)
- Publisher entered their domain incorrectly (contact them)
- Publisher's DNS provider does not support TXT records (rare — help them find an alternative)

**Support queue:**
Set up a support email address (support@aac.aiacta.org) and respond to
publisher enquiries within 48 hours.

**Fraud monitoring:**
Run the domain verification check even after `verified` status — some publishers
remove the TXT record after verification. Monthly re-verification is recommended
for all registered publishers.

---

## 8. Running Distribution Calculations

Distributions are the most financially consequential operation the AAC performs.
Errors here mean real money going to the wrong places.

### Distribution Schedule

- **Quarterly distributions:** March 31, June 30, September 30, December 31
- **Preview distribution** (non-binding): 14 days before each distribution date
  — allows publishers to dispute calculations before money moves

### Pre-Distribution Checklist

Run through this checklist before every distribution:

```
Data Quality
[ ] Citation event pipeline has been running without gaps for the period
[ ] All provider submissions for the period received and confirmed
[ ] Spot-check: manually verify 10 random citation events by hand
[ ] Check for anomalous spikes (velocity throttle log review)
[ ] FPA fraud detection run completed (see Section 9)
[ ] All hold-queue items resolved or explicitly extended

Calculation
[ ] Run preview distribution: POST /v1/distribution/calculate
[ ] Review top 20 recipients — do amounts look reasonable?
[ ] Check distribution total equals available pool balance
[ ] Verify All-Rights-Reserved multiplier is applied correctly
[ ] Verify query type exclusion (logical_utility = 0 weight) is working

Legal and Financial
[ ] Payment details confirmed for top 50 recipients
[ ] Distribution report generated for Working Group review
[ ] Finance team sign-off obtained
[ ] Two-person authorisation process for payment execution

Payment Execution
[ ] Commit distribution: POST /v1/distribution/commit
[ ] Initiate payments via payment processor
[ ] Confirm payments processed within 5 business days
[ ] Send distribution receipts to recipients
[ ] Archive distribution report
```

### Dispute Resolution

If a publisher disputes their distribution amount:

1. Publisher opens a dispute within 30 days of distribution
2. AAC operations team pulls the citation event log for their domain for the period
3. Compare with the distribution calculation
4. Common issues:
   - Publisher's domain was in `pending` status for part of the period
     (not yet verified — distributions only go to verified publishers)
   - Publisher's domain was in hold-queue (fraud investigation)
   - Events were classified as `logical_utility` and excluded
5. If the dispute is valid: issue a correction in the next quarterly distribution
6. Document the dispute and resolution

---

## 9. Fraud Detection and Compliance Operations

The integrity of the AAC's economic system depends on detecting and acting
on fraud. These processes run continuously.

### The Three-Layer Fraud Defence

**Layer 1 — Velocity Throttle (automatic, real-time)**
The VWP Gateway and AAC server automatically flag domains exceeding citation
velocity thresholds. These are placed in Hold/Escrow automatically.

**Operator action:** Review the hold-queue daily.
```
GET /v1/citations/summary?domain=&include_logical=true
# Then check the hold_queue table in the AAC database
```
For each held domain:
- Investigate the citation pattern
- Check external traffic data (Similarweb, Ahrefs) for consistency
- If legitimate: release from hold, restore normal distribution
- If fraudulent: mark `non-compliant`, return accrued fees to AI provider pool

**Layer 2 — Fraud Pattern Attribution (weekly)**
Run the FPA engine to detect Citation Rings:

```bash
cd packages/aac-server
node -e "const { detectCitationRings } = require('./src/services/fraud-pattern-engine'); \
  const rings = detectCitationRings(); \
  console.log(JSON.stringify(rings, null, 2));"
```

Review any flagged clusters. A legitimate cluster might look like a news
outlet's several domains all being cited heavily — this is normal. A
suspicious cluster looks like dozens of low-traffic domains with no organic
traffic all being cited exclusively by one provider.

**Layer 3 — Honeypot Verification (continuous)**
The Honeypot Verifier (packages/honeypot-verifier) operates Verification
Nodes — canary URLs with unique tokens. When an AI provider claims
`X-AI-Crawl-Purpose: rag` but the canary token appears in their model's
completions (indicating training use), this is a compliance violation.

**Operator action:** Monitor the audit log:
```
GET /canary/audit-log
Authorization: {AUDIT_LOG_API_KEY}
```

When a violation is detected:
1. Document: provider ID, canary ID, claimed purpose, detected use, timestamp
2. Notify the provider formally with 14 days to respond
3. Escalate to Working Group if no satisfactory response
4. Potential outcomes: warning, tier reclassification, suspension from AAC

### Provider Compliance Audits (Platinum Tier)

Platinum providers must submit to annual third-party audits. The AAC
facilitates this process:

**Audit scope:**
- Are citation events complete and accurate?
- Do delivery timestamps match stated claims?
- Is the query type classification (content_dependent vs logical_utility) accurate?
- Are HMAC keys properly managed?
- Is the Crawl Manifest API returning accurate data?

**Audit process:**
1. AAC contracts with an independent auditing firm (analogous to MRC in ad tech)
2. Auditor receives a random sample of citation events from the provider
3. Auditor independently verifies a sample against publisher server logs
4. Auditor runs their own queries to the Crawl Manifest API and compares
5. Audit report published (with provider's confidential data redacted)

**Audit results:**
- Pass: Platinum status maintained for another year
- Minor issues: 90-day remediation plan
- Major violations: Tier reclassification, held distributions, possible suspension

---

## 10. Certification and Compliance Tiers

The Foundation issues compliance certifications. This is a separate function from
the AAC's economic operations.

### Issuing Certifications

When a provider applies for a compliance certification:

**Bronze self-certification:**
No audit required. Provider submits a self-assessment checklist (available at
https://aiacta.org/certify). Foundation reviews the checklist and issues a badge.

**Silver self-certification with spot-check:**
Provider submits self-assessment. Foundation staff run automated tests:
```bash
# Run against provider's endpoints
PROVIDER_URL=https://api.provider.com npm run test:e2e
```
If tests pass: issue certificate. If tests fail: provide detailed report.

**Gold third-party verification:**
An independent technical reviewer verifies the implementation against the spec.
Foundation maintains a list of approved verifiers.

**Platinum annual audit:**
As described in Section 9. Audit firm contracted and report published.

### The Certification Badge System

Each tier has a badge that certified providers can display:

```html
<!-- Bronze badge -->
<a href="https://aiacta.org/certify/verify?id=[cert-id]">
  <img src="https://aiacta.org/badges/bronze.svg" alt="AIACTA Bronze Certified">
</a>
```

Badges link to a verification page that confirms the current certification status.
Badges are dynamic — if a certification expires or is revoked, the badge
automatically changes to indicate this.

**Certification validity:**
- Bronze, Silver: 2 years (then re-self-certification)
- Gold: 1 year (then re-verification)
- Platinum: 1 year (annual audit cycle)

---

## 11. Communications and Community Management

### Website (https://aiacta.org)

**Pages to maintain:**
- Homepage: value proposition, adoption counter, latest news
- Spec Documentation: links to /docs/ in the GitHub repo
- Providers: certified providers directory
- Publishers: creator guide, AAC registration link
- Blog: monthly updates, adoption announcements
- About: Foundation and AAC information, team, governance

**Update frequency:**
- Blog: monthly minimum
- Certified providers list: within 5 days of certification
- Spec documentation: in sync with GitHub (auto-generated or manually synced)

### Social and Press

**Channels to maintain:**
- Twitter/X: @aiacta_org
- LinkedIn: AIACTA Foundation page
- GitHub Discussions: primary technical community

**Announcement cadence:**
- New provider certifications: individual posts (tag the company)
- Spec releases: blog post + social
- Distribution milestones: press release
- Working Group decisions: GitHub announcement + brief social post

**Press inquiries:**
Route to press@aiacta.org. Respond within 24 hours. Do not speculate about
providers' implementation timelines — only report verified facts.

### Community Moderation

GitHub Discussions and Issues are the primary community forums.

**Response time targets:**
- Security reports (security@aiacta.org): 72-hour acknowledgement
- Bug reports with active discussion: 2 business days
- Feature requests / discussions: 5 business days
- Spam / CoC violations: immediate closure, same-day response to reporter

**Elevating community contributors:**
When you notice a contributor who is consistently helpful, technically sound,
and in good standing for 3+ months, invite them to join the `contributors` team.
After 6+ months and 5+ merged PRs, discuss with the maintainer team whether
to invite them to the `maintainers` team.

---

## 12. Legal and Regulatory Operations

### Trademark Management

The Foundation holds the following trademarks:
- "AIACTA" (word mark)
- "AI Attribution Collective" (word mark)
- "AAC" in the context of AI attribution (word mark)
- AIACTA certification badges (logo marks)

**Trademark monitoring:**
Use a trademark monitoring service (e.g., Corsearch, Clarivate) to flag
potential infringement. Common situations to watch for:
- Other companies using "AIACTA" or "AI Attribution Collective" without licence
- Fake "AIACTA certification" claims
- Confusingly similar standard names

**Trademark licensing:**
The Apache 2.0 licence on the code does not extend to the trademarks.
Companies wanting to say "AIACTA-compliant" or "AIACTA-certified" need
explicit authorisation from the Foundation. The certification programme
(Section 10) is the mechanism for this.

### Regulatory Engagement

The Foundation should maintain active engagement with regulatory bodies:

**EU:**
- EU AI Office (oversees AI Act implementation): invite as Working Group observer
- European Data Protection Board: inform about the privacy-preserving design

**UK:**
- Ofcom: proactively engage about AI content attribution
- Competition and Markets Authority (CMA): keep informed about AAC™ structure

**USA:**
- FTC: proactively share AIACTA™ as a self-regulatory framework
- US Copyright Office: participate in their ongoing AI study process

**How to engage:**
- Submit comments to regulatory consultations that involve AI and content
- Offer to brief staff — regulators appreciate technical briefings on complex topics
- Invite relevant officials as Working Group observers (non-voting)

### Legal Documents to Maintain

| Document | Description | Review Cycle |
|----------|-------------|-------------|
| AAC Participation Agreement | Provider's contractual commitment to AAC | Annual |
| Publisher Registration Terms | Publisher's terms for AAC registration | Annual |
| Working Group Charter | Governance of the Working Group | Every 2 years |
| Trademark Licence Agreement | For integration partner designations | Annual |
| Privacy Policy (AAC) | GDPR-compliant privacy policy for AAC operations | Annual |
| Data Processing Agreement | For GDPR controllers/processors | Annual |

---

## 13. Financial Operations

### AAC™ Pool Management

The AAC™ pool receives contributions from AI providers and distributes to publishers.
This requires proper financial controls.

**Bank accounts:**
- Operating account: day-to-day administrative expenses
- Pool account: holds provider contributions awaiting distribution
- Reserve account: 6-month operating expense reserve

These must be separate accounts. Pool money must never be mixed with
operating money. This is a legal requirement for collecting societies.

**Accounting:**
- Hire a bookkeeper or accountant with non-profit / collecting society experience
- Use non-profit accounting software (QuickBooks Nonprofit, or Xero for Nonprofits)
- Monthly bank reconciliation
- Quarterly financial statements to the Foundation board
- Annual audit by an external auditor

**Pool accounting:**
```
Pool Balance = Total Provider Contributions
             - Administrative Fee Retained (typically 15-20%)
             - Distributions Paid
             - Held / Escrow amounts
             = Net Available for Next Distribution
```

Document every movement in and out of the pool with:
- Source/destination
- Amount
- Date
- Authorising staff member
- Transaction reference

### Provider Invoicing

For PCF (Per-Citation Fee) providers:
- Generate monthly invoices based on citation count from the AAC server
- Invoice: citation count × agreed rate = amount due
- Payment terms: net 30 (due 30 days after invoice date)

For RPA (Revenue-Proportional) providers:
- Provider self-reports their quarterly content-dependent query revenue
- Invoice: reported revenue × agreed rate = amount due
- Support this with audit rights (right to request verification documentation)

### Publisher Payouts

**Payment processors to support:**
- Bank transfer (ACH for USA, SEPA for Europe, SWIFT for international)
- PayPal (ubiquitous for small creators)
- Stripe (for publishers with existing Stripe accounts)

**Minimum payout:** $10 USD (below this threshold, earnings accumulate)

**Process:**
1. Distribution calculation completed and committed (Section 8)
2. Payment files generated per payment processor
3. Two-person authorisation required to initiate payments
4. Payments initiated within 5 business days of distribution date
5. Confirmation emails sent to recipients
6. Failed payments logged and recipient notified within 48 hours

**Tax documentation:**
For USA payouts > $600/year: collect W-9 (US persons) or W-8BEN (foreign persons)
For EU payouts: comply with DAC7 digital platform reporting requirements
Maintain tax documents for 7 years minimum.

---

## 14. Security Incident Response

### Incident Classification

| Severity | Examples | Response Time |
|----------|---------|--------------|
| P1 — Critical | AAC server breach, distribution fraud, private key compromise | Immediate (24/7) |
| P2 — High | API endpoint vulnerability, authentication bypass | 4 hours (business hours) |
| P3 — Medium | Information disclosure, non-critical vulnerability | 48 hours |
| P4 — Low | Minor bugs, informational findings | 2 weeks |

### P1 Response Procedure

**Within 15 minutes:**
1. Alert the on-call maintainer (PagerDuty or equivalent)
2. Assess scope: what data, what systems, what time period?
3. Isolate affected systems if possible
4. Brief the executive leadership

**Within 1 hour:**
1. Identify the root cause
2. Implement emergency mitigations (take server offline if necessary)
3. Notify affected parties if required (affected publishers, providers)
4. Brief the Foundation board

**Within 24 hours:**
1. Publish a public incident notice at https://status.aiacta.org
2. Notify regulators if the incident involves personal data (GDPR: 72-hour requirement)
3. Engage forensic support if needed

**Within 1 week:**
1. Post-mortem conducted
2. Root cause analysis documented
3. Remediation plan published
4. Security improvements implemented

### Vulnerability Disclosure

When a security researcher reports a vulnerability via security@aiacta.org:

1. Acknowledge receipt within 72 hours
2. Assess severity and validate the report
3. Assign a CVE identifier if applicable
4. Develop and test a fix
5. Coordinate disclosure with the researcher (90-day disclosure deadline standard)
6. Publish security advisory and deploy fix simultaneously

**Recognition:** With the researcher's permission, acknowledge their
contribution in the security advisory and in CHANGELOG.md.

---

## 15. Release Management

### Versioning

The repository uses semantic versioning for the overall project. This is
separate from the spec version.

```
vMAJOR.MINOR.PATCH

v1.0.0 — Initial release
v1.0.1 — Bug fix release
v1.1.0 — New features, backwards-compatible
v2.0.0 — Breaking changes (rare — requires Working Group vote)
```

### Release Checklist

```
Preparation
[ ] All planned changes merged to main
[ ] Full test suite passes on main
[ ] CHANGELOG.md updated with this release's changes
[ ] Version numbers updated in all package.json files
[ ] Documentation updated

Testing
[ ] Run full test suite
[ ] Run end-to-end test harness
[ ] Test validator CLI: npx @aiacta-org/ai-attribution-lint [test URL]
[ ] Verify Go tests: go test ./...
[ ] Verify Python tests

Release
[ ] Create a git tag: git tag v1.x.x
[ ] Push the tag: git push upstream v1.x.x
[ ] GitHub Actions CI runs on the tag
[ ] GitHub Release created with:
    - Release notes (from CHANGELOG)
    - Binary assets if applicable
    - Link to the relevant CHANGELOG section

Publication
[ ] npm publish for each Node.js package
[ ] PyPI publish for Python package
[ ] Go module tag pushed
[ ] Announcement in GitHub Discussions
[ ] Blog post on aiacta.org
[ ] Social media announcement
```

### Hotfix Releases

For critical security fixes or severe bugs:

1. Create a `hotfix/v1.x.y` branch from the latest tag
2. Apply the minimal fix
3. All tests must pass
4. Fast-track review (1 maintainer approval required, not 2)
5. Tag and release immediately
6. Document in CHANGELOG as a security/hotfix release
7. Notify all known implementors by email

---

## 16. Year-One Operational Roadmap

This is a concrete monthly plan for the first year of operations.

### Month 1–2: Foundation

```
[ ] Incorporate the AIACTA Foundation (legal entity)
[ ] Open bank accounts (operating + pool)
[ ] GitHub repository made public
[ ] Launch website (aiacta.org)
[ ] Announce publicly: whitepaper + repository
[ ] Begin outreach to first AI providers and publishers
[ ] Hire/appoint: project manager, part-time legal counsel
```

### Month 3–4: First Adoptions

```
[ ] First Bronze-certified AI provider onboarded
[ ] First 100 publishers registered with AAC
[ ] Validator tool promoted widely (Product Hunt, Hacker News)
[ ] First Working Group convening (provisional — founding team)
[ ] WordPress plugin published to WordPress.org
[ ] Ghost integration guide published
```

### Month 5–6: Working Group Formation

```
[ ] Working Group elections announced
[ ] Candidate nominations period (30 days)
[ ] First formal Working Group vote
[ ] Working Group constituted with all 8 stakeholder classes
[ ] First formal Working Group meeting held
[ ] Regulatory observer invitations sent to EU AI Office, FTC
```

### Month 7–9: Economic Framework Launch

```
[ ] First Silver-certified provider onboarded
[ ] AAC pool receives first provider contribution
[ ] First distribution calculation run (preview, non-binding)
[ ] First actual distribution paid to publishers
[ ] Press release: "AIACTA makes first payment to content creators"
[ ] 500 publishers registered
```

### Month 10–12: Ecosystem Growth

```
[ ] First Gold-certified provider
[ ] v1.1 spec release (based on early adoption feedback)
[ ] 1,000 publishers registered
[ ] Community developer programme launched
[ ] Annual report published
[ ] Year-two roadmap approved by Working Group
```

### Key Success Metrics for Year One

| Metric | Target |
|--------|--------|
| GitHub stars | 1,000+ |
| Registered publishers (AAC) | 500+ |
| AI providers with Bronze+ certification | 2+ |
| npm downloads (ai-attribution-lint) | 5,000+ |
| Working Group constituted | Yes |
| First distribution paid | Yes |
| Press mentions in major tech outlets | 10+ |

---

*This guide is a living document. Update it whenever processes change,
lessons are learned, or the project evolves. The most dangerous words in
operations are "we will remember how to do this" — write it down.*

*Questions about this guide? Contact [foundation@aiacta.org]*
