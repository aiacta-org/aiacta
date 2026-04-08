# Contributing to AIACTA

> **Welcome!** This is Eric Michel, the founder of AIACTA. You are looking at one of the most consequential open-source
> projects in the AI era. A technical standard that will determine whether
> content creators are fairly compensated as AI reshapes the web. Every
> contribution, no matter how small, moves that goal forward.

> Be kind. This project exists to benefit everyone in the content ecosystem.

> Thank you for helping build a fair AI attribution ecosystem!



---

## Table of Contents

1. [What Is AIACTA and Why Does It Matter?](#1-what-is-aiacta-and-why-does-it-matter)
2. [How Open Source Contribution Works](#2-how-open-source-contribution-works)
3. [Setting Up Your Development Environment](#3-setting-up-your-development-environment)
4. [Understanding the Codebase](#4-understanding-the-codebase)
5. [Finding Your First Issue](#5-finding-your-first-issue)
6. [The Contribution Workflow](#6-the-contribution-workflow)
7. [Writing Good Code](#7-writing-good-code)
8. [Writing Tests](#8-writing-tests)
9. [Writing Documentation](#9-writing-documentation)
10. [Submitting a Pull Request](#10-submitting-a-pull-request)
11. [The Code Review Process](#11-the-code-review-process)
12. [Types of Contributions We Need Most](#12-types-of-contributions-we-need-most)
13. [Community Standards and Code of Conduct](#13-community-standards-and-code-of-conduct)
14. [Getting Help](#14-getting-help)
15. [Recognition and the AAC Developer Program](#15-recognition-and-the-aac-developer-program)

---

## 1. What Is AIACTA and Why Does It Matter?

AIACTA stands for **AI Architecture for Content Transparency and Attribution**.

Here is the problem it solves in one sentence: when you write an article and an
AI like ChatGPT or Claude uses it to answer someone's question, you — the writer
— currently receive nothing. No notification. No credit. No compensation. The AI
company knows exactly what it used. You do not.

AIACTA is a set of five open technical standards that fix this structural
imbalance. These are not political demands — they are engineering specifications
for mechanisms that can be built on standard web infrastructure that already
exists today.

**The Five Proposals:**

| # | Name | What It Does |
|---|------|-------------|
| 1 | Crawl Manifests | AI providers publish an API so publishers can see exactly which pages were crawled, when, and for what purpose (training vs. RAG vs. indexing) |
| 2 | Citation Webhooks | Every time an AI cites a piece of content, the publisher gets an instant, signed notification |
| 3 | Referrer Headers | When users click links in AI responses, the destination website can see the traffic came from an AI platform |
| 4 | ai-attribution.txt | A simple text file publishers put on their website to declare their preferences — like robots.txt but for attribution |
| 5 | Fair Reward Framework | A neutral body called the AI Attribution Collective (AAC) collects fees from AI companies and distributes them to content creators proportionally |

By contributing code to this project, you are building the technical foundation
that makes this possible. Every new CMS plugin, SDK port, test, or documentation
improvement makes it easier for the world to adopt the standard.

---

## 2. How Open Source Contribution Works

### The Repository

A "repository" (or "repo") is where all the code lives, hosted on GitHub at
`https://github.com/aiacta-org/aiacta`. You can read every file in it right
now without an account.

### Forks

You cannot directly edit the main repository — that would be chaos. Instead,
you make your own personal copy called a **fork**. This lives under your GitHub
username and you can edit it freely.

### Branches

Inside your fork, you create a **branch** — a parallel version of the code
where you can make changes safely without affecting anything else. Think of it
as a draft document.

### Pull Requests

If you have a valuable contribution to add, when your changes are ready, you open a **Pull Request** (PR) — a formal
proposal asking the project maintainers to merge your changes into the main
codebase. Maintainers review the code, may request changes, and eventually
merge it.

### Issues (TODO Work)

Every bug, feature request, or task is tracked as a GitHub **Issue** — a
numbered discussion thread. Before writing code, always look for an existing
Issue and comment on it to say you are working on it. This prevents two people
doing the same work.

### Maintainers

Maintainers are experienced, significant contributors who review PRs and guide the project.
They are not gatekeepers — their job is to help your contribution succeed, not
block it. If you follow the guidance in this document, the review process will
be smooth.

---

## 3. Setting Up Your Development Environment

#### TL;DR: How to Contribute?
  1. Fork the repository and create a feature branch.
  2. Follow the coding style in the package you are modifying.
  3. Add or update tests — all PRs require passing CI.
  4. Open a PR with a clear description of the change.


If you are new, follow these steps in order. Do not skip steps.

### Step 1 — Install Git

Git is the version control tool all open-source projects use to track changes.

**macOS:**
```bash
git --version
# If not installed, this command will prompt you to install it:
xcode-select --install
```

**Windows:**
Download from https://git-scm.com/download/win and install with all defaults.
During installation, when asked about line endings, choose
"Checkout Windows-style, commit Unix-style line endings".

**Linux (Ubuntu/Debian):**
```bash
sudo apt update && sudo apt install git
```

After installing, tell Git who you are. These details appear in your commits:
```bash
git config --global user.name "Your Full Name"
git config --global user.email "your@email.com"
```

### Step 2 — Create a GitHub Account

Go to https://github.com and sign up for a free account. Use the same email
address you set in the Git configuration above.

Enable two-factor authentication on your account — it is good practice and
some maintainers require it for write access.

### Step 3 — Install Node.js

The majority of AIACTA packages are written in JavaScript and require Node.js.

Go to https://nodejs.org and download the **LTS** version (labelled
"Recommended For Most Users"). Install it with all defaults.

Verify:
```bash
node --version   # Must be v18.0.0 or higher
npm --version    # Should print 9.x.x or higher
```

If you see an older version, uninstall it and reinstall the LTS from nodejs.org.

### Step 4 — Install Python (only if working on Python packages)

Required only if you plan to work on:
- `packages/ai-citation-sdk/src/python/`
- `packages/crawl-manifest-client/src/python/`

**macOS/Linux:** Python is usually pre-installed. Check:
```bash
python3 --version   # Must be 3.9 or higher
```

**Windows:** Download from https://www.python.org/downloads/
During installation, **check the "Add Python to PATH" checkbox** — this is
critical. Without it, Python commands will not work.

Install pytest (the test framework we use):
```bash
pip3 install pytest requests
```

### Step 5 — Install Go (only if working on Go SDK)

Required only if you plan to work on `packages/ai-citation-sdk/src/go/`.

Download the latest stable Go installer from https://go.dev/dl/ and install it.

Verify:
```bash
go version   # Must be 1.21 or higher
```

### Step 6 — Install Docker (only if working on the test harness)

Required for `packages/attribution-test-harness/` and end-to-end tests.

Download Docker Desktop from https://www.docker.com/products/docker-desktop/
Start Docker Desktop after installation and wait for it to show "Docker is
running" in the menu bar/taskbar.

Verify:
```bash
docker --version        # Should print Docker version 24.x or higher
docker compose version  # Should print Docker Compose version 2.x or higher
```

### Step 7 — Fork the Repository on GitHub

1. Make sure you are signed into GitHub
2. Go to https://github.com/aiacta-org/aiacta
3. Click the **Fork** button in the top-right corner of the page
4. Under "Owner", select your username
5. Leave "Repository name" as `aiacta`
6. Click **Create fork**

GitHub creates a copy at `https://github.com/YOUR-USERNAME/aiacta`.

### Step 8 — Clone Your Fork to Your Computer

"Cloning" downloads a copy of the repository to your machine so you can
edit files.

```bash
# Open your terminal (Terminal on macOS, Git Bash or CMD on Windows, terminal on Linux)
# Navigate to the folder where you want to store the project, e.g.:
cd ~/Documents   # macOS/Linux
cd %USERPROFILE%\Documents   # Windows CMD

# Clone your fork (replace YOUR-USERNAME with your actual GitHub username):
git clone https://github.com/YOUR-USERNAME/aiacta.git

# Enter the project directory:
cd aiacta
```

You should now see all the project files on your computer.

### Step 9 — Connect to the Upstream Repository

This links your local copy to the official AIACTA repository so you can
pull in changes when the main project is updated:

```bash
git remote add upstream https://github.com/aiacta-org/aiacta.git
```

Verify it worked:
```bash
git remote -v
# Should show four lines:
# origin    https://github.com/YOUR-USERNAME/aiacta.git (fetch)
# origin    https://github.com/YOUR-USERNAME/aiacta.git (push)
# upstream  https://github.com/aiacta-org/aiacta.git (fetch)
# upstream  https://github.com/aiacta-org/aiacta.git (push)
```

### Step 10 — Install All Dependencies

From the root of the project:
```bash
npm install
```

This installs JavaScript dependencies for all packages in one command.
It may take 1-2 minutes. You will see a progress indicator.

### Step 11 — Run the Test Suite to Verify Your Setup

Before changing anything, confirm everything works:
```bash
npm test --workspaces --if-present
```

You should see output like:
```
PASS tests/parser.test.js
PASS tests/rules.test.js
...
Test Suites: X passed, X total
Tests: XX passed, XX total
```

If tests fail before you have changed anything, please open a GitHub Issue
— it likely means a documentation gap we need to address.

### Optional: Install a Code Editor

If you do not have a code editor, we recommend **Visual Studio Code** (free):
https://code.visualstudio.com

After installing, open the project:
```bash
code .   # Opens VS Code in the current directory
```

Recommended VS Code extensions:
- ESLint
- Prettier
- GitLens
- Python (by Microsoft) — if working on Python code

---

## 4. Understanding the Codebase

### Repository Structure

```
aiacta/
├── CONTRIBUTING.md            ← This file
├── CREATOR_GUIDE.md           ← Instructions for creators 
├── IMPLEMENTATION_GUIDE.md    ← Instructions for developers 
├── README.md                  ← Project overview
├── SECURITY.md                ← Security policy
├── CHANGELOG.md               ← Release history
├── LICENSE                    ← Apache 2.0
├── package.json               ← Root package (monorepo config)
│
├── packages/                  ← All code packages
│   ├── ai-attribution-lint/   ← CLI validator for ai-attribution.txt
│   │   ├── src/
│   │   │   ├── cli.js         ← Command-line entry point
│   │   │   ├── index.js       ← Public API
│   │   │   ├── fetcher.js     ← Fetches the file (URL or local path)
│   │   │   ├── parser.js      ← Parses field: value format
│   │   │   ├── runner.js      ← Runs all rules
│   │   │   └── rules/         ← One file per validation rule
│   │   └── tests/
│   │
│   ├── ai-citation-sdk/       ← Webhook receiver SDK
│   │   ├── src/node/          ← Node.js implementation
│   │   ├── src/python/        ← Python implementation
│   │   └── src/go/            ← Go implementation
│   │
│   ├── crawl-manifest-client/ ← API client for querying crawl history
│   │   ├── src/node/
│   │   └── src/python/
│   │
│   ├── aac-dashboard-lite/    ← React web dashboard for publishers
│   │   ├── src/components/    ← React components
│   │   ├── src/api/           ← API calls to provider pull APIs
│   │   └── src/utils/         ← Distribution weight formula
│   │
│   ├── attribution-test-harness/  ← Docker E2E test sandbox
│   │   ├── docker/            ← Dockerfiles and mock provider server
│   │   ├── fixtures/          ← Sample data (valid/invalid ai-attribution.txt, events)
│   │   └── scenarios/         ← E2E test scenarios for each proposal
│   │
│   ├── aac-server/            ← AAC Reference Server
│   │   ├── src/db/            ← Database schema and migration
│   │   ├── src/routes/        ← API endpoint handlers
│   │   └── src/services/      ← Business logic (distribution, fraud detection)
│   │
│   ├── vwp-gateway/           ← Verifiable Webhook Protocol gateway
│   │   └── src/               ← Signature verification, PoI, velocity throttle
│   │
│   ├── referrer-middleware/   ← HTTP middleware for referrer headers
│   │   ├── src/node/          ← Express middleware
│   │   └── src/python/        ← WSGI middleware
│   │
│   └── honeypot-verifier/     ← Crawl-purpose audit verification nodes
│       └── src/
│
├── shared/
│   ├── schemas/               ← JSON Schema definitions (the wire formats)
│   └── types/                 ← TypeScript types shared across packages
│
├── docs/
│   ├── proposals/             ← Deep-dive docs for each of the 5 proposals
│   ├── for-ai-providers/      ← Implementation guide for AI companies
│   ├── for-publishers/        ← Guide for content creators
│   ├── for-admins/            ← AAC admin operations guide
│   ├── governance/            ← Governance structure
│   └── integration/           ← C2PA, schema.org, SPDX integration guides
│
└── examples/
    ├── ai-attribution.txt.example   ← Annotated example file
    ├── wordpress-plugin/            ← PHP webhook receiver plugin
    ├── ghost-integration/           ← Ghost CMS integration
    ├── nginx-config/                ← nginx logging configuration
    └── substack-integration/        ← Cloudflare Worker for Substack authors
```

### How to Read the Code

Every source file has comments that reference a section (§) from the
whitepaper. For example:

```js
// Implements the 6-attempt retry schedule (§3.5)
const RETRY_DELAYS_SECONDS = [0, 30, 300, 1800, 7200, 43200];
```

When you see `§3.5`, look at `docs/proposals/proposal-2-citation-webhooks.md`
or the original whitepaper to understand the requirement. This makes it
possible to verify that the code correctly implements the spec.

### How the Packages Relate to Each Other

```
Publisher writes ai-attribution.txt (Proposal 4)
        │
        ▼ read by
AI provider crawler ──sends──► X-AI-Crawl-Purpose header (Proposal 1)
        │                              │
        │ logs                         ▼ logged by publisher's
        ▼                        nginx/Apache (ai-crawl-logging.conf)
Crawl Manifest API
        │
        │ queried by publisher
        ▼ using crawl-manifest-client
Publisher sees crawl history (Proposal 1)

Later: AI response cites the publisher's content
        │
        ▼
Citation event created ──► VWP Gateway (vwp-gateway)
        │                         │
        │ verified+signed          │
        ▼                         ▼
Publisher webhook endpoint    AAC Server
(ai-citation-sdk)             (aac-server)
        │                         │
        │ stores event             │ aggregates
        ▼                         ▼
Publisher's analytics DB    Distribution engine
                                  │
                                  ▼
                            Payouts to publishers
```

---

## 5. Finding Your First Issue

### Searching for Issues

Go to https://github.com/aiacta-org/aiacta/issues

Use the label filter to find issues matching your skills:

| Label | Meaning |
|-------|---------|
| `good first issue` | Well-scoped, beginner-friendly tasks |
| `help wanted` | Community help specifically requested |
| `bug` | Something is broken |
| `enhancement` | New feature or improvement |
| `documentation` | Writing/improving docs — no code needed |
| `python` | Python SDK work |
| `go` | Go SDK work |
| `cms-plugin` | CMS integrations |
| `testing` | Adding test coverage |

### How to Claim an Issue

Before starting work, comment on the Issue:

> "I'd like to work on this. My approach: [brief description]. Estimated
> time: [your estimate]. Does this approach look right to you?"

Wait for a maintainer to confirm before writing significant code. This
prevents duplicate work and ensures your approach fits the project.

If no response comes within 3 business days, proceed — but note in your
PR that confirmation was not received.

### Beginner-Friendly Starting Points

If you are completely new and do not know where to start, here are three
specific, achievable first contributions:

**Option A — Fix a test (15–30 minutes):**
Look at any package's test file. Do any tests have `todo()` instead of
actual assertions? Fill them in.

**Option B — Improve an error message (30 minutes):**
Run `npx ai-attribution-lint` on an invalid file and read the error messages.
Are any of them confusing? Find the rule file that generates them in
`packages/ai-attribution-lint/src/rules/` and make the message clearer.

**Option C — Add a documentation example (1–2 hours):**
Pick any function in the codebase that has a JSDoc comment but no `@example`.
Add a working code example to the JSDoc.

---

## 6. The Contribution Workflow

This is the exact sequence of steps for every contribution.

### Step 1 — Sync Your Fork with Upstream

Do this every time before starting a new piece of work:
```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

### Step 2 — Create a Branch

Never work directly on `main`. Always create a feature branch:

```bash
# Naming format: type/short-description
git checkout -b fix/webhook-timestamp-validation
git checkout -b feat/wordpress-plugin-admin-page
git checkout -b docs/translate-creator-guide-spanish
git checkout -b test/query-classifier-edge-cases
```

**Type prefixes:**
- `fix/` — fixing a bug
- `feat/` — new functionality
- `docs/` — documentation only
- `test/` — tests only
- `refactor/` — restructuring code without changing behaviour
- `chore/` — maintenance (dependency updates, config)

### Step 3 — Make Your Changes

Keep your change focused on exactly what the Issue describes. If you notice
other problems while working, create separate Issues for them.

Smaller, focused PRs get reviewed and merged much faster than large
multi-purpose ones.

### Step 4 — Test Continuously

Run tests frequently while developing, not just at the end:

```bash
# From the package directory
npm test

# Watch mode (re-runs tests on every file save):
npm test -- --watch

# For Python:
python -m pytest -v --tb=short

# For Go:
go test ./... -v
```

### Step 5 — Commit Your Changes

### 5.1 Commit Format 
Stage and commit frequently. Small, logical commits are easier to review
and easier to revert if something goes wrong.
```bash
# Stage specific files (never use 'git add .' on the first commit)
git add packages/ai-attribution-lint/src/rules/new-rule.js
git add packages/ai-attribution-lint/tests/new-rule.test.js


# Write a commit message in this format:
git commit -m "feat(lint): add UTM opt-in field validation rule

Validates that Preferred-UTM-Source is only present when
Allow-UTM-Append: true is also set, and warns if a custom
UTM source contains characters invalid in URL query strings.

Implements the opt-in requirement from §4.3.
Closes #73"
```

### 5.2 Commit format REALLY matters!
```
type(scope): brief summary (max 72 characters, present tense)

Optional body: explain WHY (not what — the code shows what).
Reference Issues with 'Closes #N' or 'Refs #N'.
```

#### Write your commits like this and the CHANGELOG.md writes itself:

```bash
git commit -m "fix(aac-server): handle empty citation batches correctly"
# Bug Fix → goes under "### Fixed" in CHANGELOG, bumps patch version (1.0.0 → 1.0.1)

git commit -m "feat(sdk): add Ed25519 signature verification"
# New Feature → goes under "### Added" in CHANGELOG, bumps minor version (1.0.0 → 1.1.0)

git commit -m "feat!: rename provider field in crawl manifest schema"
# Breaking Change→ goes under "### Added" with breaking change note, bumps MAJOR version (1.0.0 → 2.0.0)

git commit -m "docs: update publisher deployment guide"
# Docs Only → goes under "### Documentation" in CHANGELOG, no version bump

git commit -m "chore: update release flow"
# CI/Tooling → goes under "### CI/Tooling" in CHANGELOG, no version bump

```

**The ! after the type means "breaking change." The format is type(scope): description — scope is optional but helpful.**

---

### Step 6 — Push Your Branch

```bash
git push origin your-branch-name
```

### Step 7 — Open a Pull Request

1. Go to `https://github.com/YOUR-USERNAME/aiacta`
2. Click the yellow "Compare & pull request" banner
3. Ensure the base is `aiacta-org/aiacta` → `main` and the head is your branch
4. Fill in the PR description (template below)
5. Click "Create pull request"

**PR description:**
```markdown
## Summary
[What does this PR change and why?]

## Linked Issue
Closes #[number]

## Spec Reference
Implements / fixes §[section] — [description]

## Testing
- [ ] Unit tests added
- [ ] All existing tests pass (`npm test --workspaces`)
- [ ] Manually tested: [describe what you did]

## Checklist
- [ ] Code follows project style
- [ ] No console.log() left in production code
- [ ] No secrets committed
- [ ] Documentation updated if needed
```

---

## 7. Writing Good Code

### JavaScript Conventions

```js
'use strict';  // Always at the top of Node.js files

// Use JSDoc for every exported function
/**
 * Brief description of what this function does.
 *
 * @param {string}   domain     The publisher domain to check
 * @param {string[]} purposes   Array of crawl purpose values
 * @returns {boolean}           True if the domain allows all listed purposes
 *
 * @example
 * const allowed = checkPurposeAllowed('example.com', ['rag']);
 * // Returns: true
 */
function checkPurposeAllowed(domain, purposes) {
  // Implementation
}

// Always reference the spec section your code implements
const MAX_RANGE_DAYS = 90; // §2.2: max date range per request

// Prefer const; use let only when reassignment is necessary
const result = computeHash(content);  // Good
var result = computeHash(content);    // Never use var

// Use async/await instead of .then() chains
async function fetchManifest(domain) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (err) {
    // Always handle errors explicitly
    throw new Error(`Manifest fetch failed for ${domain}: ${err.message}`);
  }
}
```

### Security Rules — Non-Negotiable

These rules apply to every line of code in AIACTA. Violating them will
block your PR.

**1. Use constant-time comparison for all cryptographic checks.**
```js
// CORRECT — constant-time, prevents timing attacks
crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received))

// WRONG — leaks information through timing
expected === received
```

**2. Never commit secrets.**
```js
// WRONG — secret in code
const SECRET = 'my-hmac-secret-key-12345';

// CORRECT — from environment variable
const SECRET = process.env.AIACTA_WEBHOOK_SECRET;
if (!SECRET) throw new Error('AIACTA_WEBHOOK_SECRET environment variable is required');
```

**3. Always use parameterised database queries.**
```js
// WRONG — SQL injection vulnerability
db.exec(`SELECT * FROM publishers WHERE domain = '${userInput}'`);

// CORRECT — parameterised query
db.prepare('SELECT * FROM publishers WHERE domain = ?').get(userInput);
```

**4. Validate all inputs before processing.**
```js
function processEvent(event) {
  if (!event)               throw new Error('event is required');
  if (!event.idempotency_key) throw new Error('idempotency_key is required');
  if (!event.citation?.url)   throw new Error('citation.url is required');
  // Now safe to process
}
```

**5. Never log sensitive data.**
```js
// WRONG
console.log('Processing event:', JSON.stringify(event)); // may contain user data

// CORRECT
console.log(`Processing event ${event.event_id} from ${event.provider}`);
```

---

## 8. Writing Tests

Tests are mandatory. Every functional change must include tests.

### The Basic Pattern

```js
// Structure: describe → test → expect
describe('computeContentHash', () => {

  test('returns sha256: prefix followed by 64 hex chars', () => {
    const hash = computeContentHash('<p>Hello</p>');
    expect(hash).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  test('same input always produces same output', () => {
    const html = '<article>Consistent content</article>';
    expect(computeContentHash(html)).toBe(computeContentHash(html));
  });

  test('different inputs produce different outputs', () => {
    expect(computeContentHash('<p>A</p>')).not.toBe(computeContentHash('<p>B</p>'));
  });

  test('throws for null input', () => {
    expect(() => computeContentHash(null)).toThrow();
  });
});
```

### What to Always Test

For every function you write:
- ✅ Happy path (valid input, expected output)
- ✅ Invalid input (null, empty string, wrong type)
- ✅ Edge cases (empty arrays, boundary values)
- ✅ Error messages (do they say something useful?)

For security-critical functions additionally:
- ✅ Tampered signatures are rejected
- ✅ Stale timestamps are rejected
- ✅ Wrong secret fails verification

### Running Tests

```bash
# All tests in the entire monorepo
npm test --workspaces --if-present

# One specific package
cd packages/ai-attribution-lint && npm test

# With coverage report
npm test -- --coverage

# Watch mode (auto-reruns when files change)
npm test -- --watch
```

---

## 9. Writing Documentation

Documentation contributions are just as important as code.

### Documentation Principles

1. **Write for the reader, not the writer.** The AIACTA docs are read by
   journalists, lawyers, bloggers, and executives — not just developers.
   Start every explanation with plain English before showing code.

2. **Be specific.** Never write "configure the webhook". Write exactly which
   file to edit, which field to add, and what value to put in it.

3. **Show real examples.** Every concept needs a working code or config
   example that readers can copy.

4. **Use consistent terminology.** "Publisher", not "content creator" or
   "author" (unless referring to spec terminology). "AI provider", not
   "AI company" or "LLM vendor". Follow the whitepaper's language.

### Where to Add Documentation

- A new function → add JSDoc in the source file
- A new package → update the package's `README.md`
- A new concept → add to the appropriate `docs/proposals/` file
- A new integration → add to `examples/`

### Translating Documents

AIACTA needs documentation in every major language. If you translate a
document, save it as `FILENAME-[LANG].md` in the same directory. For
example: `docs/for-publishers/CREATOR-GUIDE-es.md` for Spanish.

---

## 10. Submitting a Pull Request

### Pre-submission Checklist

```
[ ] git fetch upstream && git merge upstream/main  (synced with latest)
[ ] npm test --workspaces --if-present             (all tests pass)
[ ] No new console.log() in production code
[ ] No secrets or API keys in any committed file
[ ] Code comments reference spec section (§X.X)
[ ] PR description explains the WHY
[ ] PR is linked to a GitHub Issue
[ ] .env.example updated if new environment variables added
```

### After Submitting

- A maintainer will review within a few days
- They may request changes — this is normal and does not mean rejection
- When requested changes are made, push new commits to the same branch
- Mark the review as "re-requested" when you believe all issues are addressed

---

## 11. The Code Review Process

Reviewing others' PRs is one of the most valuable contributions you can make.
You do not need to be an expert — even pointing out unclear variable names or
missing test cases helps.

### Review Comment Etiquette

Use these prefixes to set clear expectations:

```
nit: The variable name `d` could be more descriptive — maybe `domain`?
question: Why does this function return null instead of throwing here?
suggestion: This could also be done with Array.filter() which might be clearer.
blocking: This uses string equality to compare HMAC signatures, which is
  vulnerable to timing attacks. Must use crypto.timingSafeEqual() instead.
```

Be specific. Instead of "this is wrong", write "this will fail when the
array is empty because X. Consider adding a guard clause at line 15."

Every review comment should leave the author knowing exactly what to do
next.

---

## 12. Types of Contributions We Need Most

### 🔴 Critical Priority

**CMS Plugins**
WordPress, Ghost, Squarespace, Substack, Webflow, and Medium integrations. These are
the highest-leverage contributions because they unlock participation for
millions of non-technical publishers without any developer involvement.

Each plugin should:
- Serve `ai-attribution.txt` from `/.well-known/ai-attribution.txt`
- Receive and cryptographically verify citation webhook events (§3.4)
- Store events in the CMS database
- Display basic citation analytics in the admin panel
- Provide a no-code setup wizard for configuring preferences

See `examples/wordpress-plugin/` for a starting point.

**PostgreSQL Adapter for aac-server**
The reference server uses SQLite which is fine for development but not
production. This involves:
- Adding a `pg` driver option alongside `better-sqlite3`
- Converting synchronous `better-sqlite3` calls to async `pg` calls
- Adding connection pooling
- Writing a migration runner for PostgreSQL

### 🟠 Important

**Rate Limiting with Redis**
Both `aac-server` and `vwp-gateway` need distributed rate limiting
(so limits work correctly across multiple server instances). This requires
a Redis-based implementation of the velocity throttle.

**OAuth 2.0 Authentication for aac-server**
All current endpoints are unauthenticated (suitable for demos, not production).
A proper OAuth 2.0 authorization server with scopes for providers, publishers,
and admins is needed.

**ML-Based Query Classifier**
The query classifier in `aac-server/src/services/query-classifier.js`
currently uses heuristic regex rules. A small fine-tuned classifier model
(DistilBERT or similar) would be significantly more accurate.

**AAC Server Dashboard (Admin UI)**
A web interface for AAC administrators to view citation volumes, distribution
runs, fraud alerts, and provider enrollment. React + the existing API endpoints.

### 🟡 Valuable

**SDK for Ruby, PHP, and Rust**
AI providers and publishers using these languages have no SDK. Each SDK needs:
signature verification, idempotency handling, and the retry schedule.

**Browser Extension**
A Chrome/Firefox extension showing publishers their real-time AIACTA citation
stats when they visit their own website admin page.

**Validator Error Message Translations**
The `ai-attribution-lint` CLI error messages need translation into Spanish,
French, German, Japanese, Portuguese, and other major languages.

### 🟢 Great for Beginners

- Fix typos and grammar in documentation
- Add code examples to JSDoc comments
- Write tests for uncovered functions
- Add more entries to the `fixtures/` folder (edge cases in ai-attribution.txt)
- Comment on old Issues to confirm whether they are still relevant
- Answer questions in GitHub Discussions

---

## 13. Community Standards and Code of Conduct

AIACTA is building infrastructure for a fairer internet. The community
must reflect those same values.

### Expected Behaviour

- Welcome everyone regardless of experience level, background, or identity
- Be patient with beginners — your first PR was probably rough too
- Give specific, constructive feedback — not vague criticism
- Assume good faith in ambiguous situations
- Credit others for their ideas and prior work

### Unacceptable Behaviour

- Harassment, insults, or personal attacks of any kind
- Discriminatory language or "jokes"
- Deliberate intimidation or threats
- Publishing someone's private information without consent
- Sustained disruption of discussions

### Reporting

Report violations to conduct@aiacta.org. All reports are handled
confidentially by the maintainer team. Repeated or severe violations
result in removal from the community.

---

## 14. Getting Help

**GitHub Discussions** — https://github.com/aiacta-org/aiacta/discussions
Best for questions about how things work, architecture ideas, and
clarifications on spec requirements. Indexed and searchable.

**GitHub Issues** — https://github.com/aiacta-org/aiacta/issues
For specific bugs or concrete feature requests. Search before opening a new one.

**Email** — contact@aiacta.org
For sensitive matters, partnership inquiries, or anything not suited for
public discussion.

**Security** — security@aiacta.org
Never report security vulnerabilities in public Issues. See SECURITY.md.

When asking for help, always include:
1. What you were trying to do
2. What you expected to happen
3. What actually happened (paste the exact error message)
4. Your OS and version of Node/Python/Go
5. The exact commands you ran

---

## 15. Recognition and the AAC Developer Program

### Recognition

Significant contributors are listed in `CONTRIBUTORS.md` (auto-maintained) and highlighted in release notes and CHANGELOG.

### AAC Developer Program Benefits

Once the AI Attribution Collective is formally incorporated:

- **AAC Membership Credits** — Recognised contributors receive verified
  developer partner status in the compliance ecosystem.

- **Integration Partner Certification** — Contributors who build platform
  integrations receive an official "AIACTA Integration Partner" badge.

- **Commercial Opportunity** — Platinum-tier compliance auditing is a
  professional services market. Being a known AIACTA contributor is a
  relevant credential.

- **Working Group Participation** — Core contributors with significant contribution are invited to
  participate in the governance body that controls the specification's
  evolution. This is a chance to shape the future of AI attribution standards.

### What Counts as a Significant Contribution

Any of the following qualifies:
- A merged, production-ready CMS plugin
- A new language SDK (Ruby, PHP, Rust, etc.)
- Sustained code review participation over 3+ months
- A core security fix
- Substantial documentation work (e.g., a fully translated guide)

---

*Thank you for contributing. — AIACTA Team*
