# AIACTA™ Repository Maintenance Guide

*Eric Michel, March 31st, 2026*

> **Who this guide is for:** Experienced contributors who have been granted
> maintainer or significant-contributor status on the AIACTA repository.
> This covers everything about keeping the repository healthy over time:
> branch strategy, PR management, merging discipline, release mechanics,
> handling conflict, managing technical debt, and scaling the contributor
> ecosystem.
>
> If you are new to contributing to AIACTA™, read `CONTRIBUTING.md` first. This guide
> assumes you are experienced in open-source contributions in GitHub
> and are taking on ongoing stewardship responsibilities.

---

## Table of Contents

1. [The Maintainer Mindset](#1-the-maintainer-mindset)
2. [Repository Branch Strategy](#2-repository-branch-strategy)
3. [Which Branches to Keep and Which to Delete](#3-which-branches-to-keep-and-which-to-delete)
4. [Pull Request Lifecycle Management](#4-pull-request-lifecycle-management)
5. [Merging Strategy and When to Use Each Method](#5-merging-strategy-and-when-to-use-each-method)
6. [Code Review Standards](#6-code-review-standards)
7. [Handling Difficult PRs](#7-handling-difficult-prs)
8. [Release Process — Step by Step](#8-release-process--step-by-step)
9. [Hotfix Releases](#9-hotfix-releases)
10. [Managing Forks and Divergence](#10-managing-forks-and-divergence)
11. [Dependency Management](#11-dependency-management)
12. [Technical Debt Management](#12-technical-debt-management)
13. [Scaling the Contributor Pipeline](#13-scaling-the-contributor-pipeline)
14. [Maintaining CI/CD Health](#14-maintaining-cicd-health)
15. [Security Maintenance](#15-security-maintenance)
16. [Documentation Maintenance](#16-documentation-maintenance)
17. [Handling Community Conflict](#17-handling-community-conflict)
18. [Maintaining Spec Alignment](#18-maintaining-spec-alignment)
19. [Maintainer Onboarding and Offboarding](#19-maintainer-onboarding-and-offboarding)
20. [The Monthly Maintenance Checklist](#20-the-monthly-maintenance-checklist)

---

## 1. The Maintainer Mindset

Maintaining an open-source project is fundamentally different from building
one. When you are building, you optimise for speed and personal vision. When
you are maintaining, you optimise for sustainability, fairness, and long-term
health. The two modes require very different habits.

### What Maintainers Actually Do

A maintainer's primary job is **not** to write code. It is to make it
possible for others to write good code efficiently. Concretely, that means:

- Reviewing PRs thoroughly and promptly so contributors are not left waiting
- Triaging issues so the community knows what matters and what does not
- Enforcing the project's standards consistently and without favouritism
- Making architectural decisions when the community is at an impasse
- Saying no to things that are not right for the project — and explaining why
- Protecting the long-term health of the codebase against short-term pressure

### The Things That Kill Open Source Projects

The failure modes are predictable:

**Maintainer burnout.** One person does 80% of the review work, gets
exhausted, stops responding, and the project slowly dies. Solution: distribute
review load deliberately, recruit new maintainers actively, and protect each
other from overload.

**Review latency.** PRs sit unreviewed for weeks. Contributors stop submitting.
The community stops caring. Solution: commit to a maximum review time (5
business days for anything not trivial) and hold the team to it.

**Inconsistent standards.** Some PRs get merged without tests, others get
blocked for minor style issues. Contributors cannot predict what is expected.
Solution: written standards applied uniformly.

**Accumulating technical debt.** Every shortcut becomes a permanent feature.
The codebase becomes harder to change, contributors give up. Solution:
scheduled debt reduction sprints and refusing shortcuts even under pressure.

**Specification drift.** Code diverges from the spec. Implementations
disagree. The standard fragments. Solution: spec review is part of every
substantive PR, not an afterthought.

Understanding these failure modes is the first step to preventing them.

---

## 2. Repository Branch Strategy

AIACTA™ uses a **simplified trunk-based development** model with a small number
of long-lived branches and short-lived feature branches.

### Long-Lived Branches

Only two long-lived branches exist in the repository:

```
main          ← production-ready code; always deployable
develop       ← integration branch; used only during release preparation
```

**`main` is sacred.** Every commit on `main` should be deployable to
production at any time. Never merge broken code to `main`. Never commit
directly to `main` — always go through a PR. Branch protection rules
enforce this: 2 approvals required, CI must be green.

**`develop` is optional and temporary.** For most work, contributors submit
PRs directly to `main`. The `develop` branch is only used during the 2–3
weeks before a significant release, when multiple large features need to be
integrated and tested together before going to production. Delete `develop`
after the release.

### Short-Lived Feature Branches

All work happens in short-lived branches created by contributors and deleted
after the PR is merged. These follow the naming convention:

```
type/brief-description
```

| Branch Name Pattern | Use Case |
|--------------------|----------|
| `fix/webhook-timestamp-validation` | Bug fix |
| `feat/wordpress-plugin` | New feature |
| `docs/creator-guide-spanish` | Documentation |
| `test/query-classifier-coverage` | Tests only |
| `refactor/aac-server-routes` | Code restructuring |
| `chore/update-axios-dependency` | Dependency update |
| `security/constant-time-comparison` | Security fix |
| `release/v1.1.0` | Release preparation |
| `hotfix/v1.0.1` | Emergency fix |

### The Flow

```
Feature branches: contributor/fix-something
                                 ↓
                            Code review
                                 ↓
                   Squash merge into main
                                 ↓
                        main (always shippable)
                                 ↓
                    Tagged releases (v1.x.x)
```

For releases:
```
main ───────────────────────────────────────────────► main
         ↓ (fork release branch)
    release/v1.1.0
         │ (minor fixes only)
         ↓ (merge back + tag)
    v1.1.0 tag ◄────────────────────────────────────
```

---

## 3. Which Branches to Keep and Which to Delete

Branch hygiene is an often-neglected maintenance task that has real costs
when ignored: confusing branch lists, stale code that diverges significantly
from `main`, and PRs opened against the wrong base branch.

### Branches to Keep

| Branch | Why Keep It | Who Can Delete It |
|--------|-------------|-----------------|
| `main` | Always keep; protected branch | Never delete |
| `develop` | Only during active release cycle | Delete after release merges to main |
| `release/vX.Y.Z` | Active release candidate only | Delete 7 days after release ships |
| `hotfix/vX.Y.Z` | Active emergency fix only | Delete after hotfix merges to main + next-version develop |

**Rule of thumb:** If a branch has been merged and the PR is closed, the branch
should be deleted within 24 hours of the merge.

### Branches to Delete

**Immediately after merge:**
Any feature, fix, docs, test, refactor, or chore branch whose PR has been
merged. Configure GitHub to automatically delete branches after merging:
Repository Settings → General → "Automatically delete head branches" → Enable.

**After 90 days of inactivity:**
Branches on which no commits have been made in 90 days should be reviewed.
If the associated PR is still open, comment asking if the work is still
in progress. If there is no PR, delete the branch. These are abandoned
experiments.

### Identifying Stale Branches

Run this audit monthly:

```bash
# List all remote branches sorted by last commit date
git for-each-ref --sort='-committerdate' \
  --format='%(committerdate:short) %(refname:short)' \
  refs/remotes/origin | grep -v -E 'main|develop|HEAD'
```

Branches older than 90 days with no associated open PR should be deleted.
Comment on any associated open PR first: *"This branch has been inactive for
90 days. Is this work still in progress? If not, we will close the PR and
delete the branch."*

### The Branch Cleanup Workflow

Every two weeks, the on-duty maintainer runs this check:

```bash
# 1. See how many stale branches exist
git fetch --prune origin
git branch -r | grep -v -E 'main|develop|release|hotfix|HEAD'

# 2. For each stale branch, check its associated PR status on GitHub

# 3. Delete branches for merged or abandoned PRs
git push origin --delete branch-name

# 4. Log cleanup in the team Slack or weekly notes
```

---

## 4. Pull Request Lifecycle Management

A PR has a defined lifecycle. Your job as a maintainer is to move every
PR forward through that lifecycle without letting it stall.

### PR States and What They Mean

```
Open → Ready for Review → In Review → Changes Requested → Re-Reviewed → Approved → Merged
       (or Abandoned → Closed)
       (or Blocked → Waiting)
```

**Open (just submitted):**
A PR has been opened. Within 48 hours, a maintainer must:
- Check that the PR description is adequate
- Add appropriate labels
- Assign at least one reviewer
- Comment if there is an obvious problem with the approach before spending time reviewing

**Ready for Review:**
The contributor has indicated their work is complete. A substantive review
must begin within 5 business days. Assign a specific maintainer.

**In Review:**
A review is in progress. The reviewer should complete it within 3 business days
of starting. If it is taking longer, comment why: "I need to understand X
before I can finish this review. Testing by Thursday."

**Changes Requested:**
The reviewer has requested changes. The contributor has 14 days to respond.
If they do not respond in 14 days, comment: "Is this PR still in progress?
If we do not hear back in 7 days, we will close it and you can reopen when
you are ready to continue."

**Re-Reviewed:**
After the contributor pushes changes, the same reviewer should re-review
within 3 business days.

**Approved:**
The PR has the required 2 approvals and a green CI. It can be merged.
Merge it within 24 hours of the second approval to avoid the branch diverging.

### The Labels to Use

Apply labels to every PR as soon as it is opened:

| Label | When to Apply |
|-------|-------------|
| `needs-review` | PR is ready for review; no reviewer assigned yet |
| `in-review` | A reviewer is actively working through it |
| `changes-requested` | Reviewer has asked for changes |
| `approved` | 2 approvals; ready to merge |
| `blocked` | Waiting on external dependency or decision |
| `on-hold` | Valid PR but waiting for a coordinated release |
| `abandoned` | No contributor response after 21 days |
| `do-not-merge` | Approved but blocked for a specific reason |
| `good first issue` | The linked issue was good for beginners |
| `spec-change` | PR modifies spec documents or JSON schemas |
| `security` | PR touches cryptographic or security-critical code |
| `breaking-change` | PR contains a breaking API or behaviour change |

### PR Size Policy

Large PRs are the most common cause of slow reviews. Enforce this policy:

| PR Size | Lines Changed | Action |
|---------|--------------|--------|
| Small | < 150 lines | Accept; review immediately |
| Medium | 150–500 lines | Accept; request clear structure |
| Large | 500–1000 lines | Accept with warning; suggest splitting |
| Extra Large | > 1000 lines | Request splitting before review begins |

When requesting a split: "This PR is large enough that reviewing it as one
unit risks missing issues. Can you split it into: [specific suggestion]?
For example, the tests could be a separate PR merged first."

### Checking PR CI Status

Before merging, always check that CI is green on the latest commit:
- All test suites pass (Node, Python, Go)
- The lint fixture validation passes
- The npm audit passes (no high-severity vulnerabilities)
- The PR is not outdated (no conflicts with main)

If CI is red and the PR author has not noticed:
*"The CI is failing on [test name]. This needs to be fixed before we can merge."*

---

## 5. Merging Strategy and When to Use Each Method

There are three ways to merge a PR on GitHub. Each has a specific use case.
Understanding which to use is one of the most important maintainer skills.

### Method 1: Squash Merge (Default for Feature PRs)

**What it does:** Takes all the commits in the PR and collapses them into a
single commit on `main`. The PR commit messages become bullet points in the
squash commit message.

**When to use:** Almost always. Specifically:
- Feature branches with multiple "work in progress" commits
- Bug fixes
- Documentation updates
- Any PR where the individual commit history within the PR is not meaningful

**Why:** Keeps `main`'s history clean and linear. Each feature, fix, or
improvement becomes exactly one commit on `main`. `git log` on `main` tells
you a clear story of what changed and why.

**Before squashing:** Edit the commit message. The default is auto-generated
from PR title and description — always clean it up to match the commit
message format:

```
fix(sdk): use constant-time comparison for HMAC verification

Previously, the Node.js SDK was using string equality (===) to compare
HMAC signatures, which is vulnerable to timing oracle attacks. Replaced
with crypto.timingSafeEqual() throughout.

Security impact: Low (no known exploits, but the vulnerability class
is well-documented and should be addressed proactively).

Closes #89
```

### Method 2: Rebase and Merge (For Clean Linear Histories)

**What it does:** Takes each commit from the PR and replays them individually
on top of `main`, preserving each commit as a separate entry but without
a merge commit.

**When to use:**
- Small PRs with only 1–3 commits, where each commit is already well-formed
  and tells a meaningful story
- When the contributor has written excellent commit messages that you want
  to preserve exactly

**Do not use:**
- For PRs with more than 5 commits (the history gets cluttered)
- When commits have messages like "wip" or "fix typo" or "addressed review"
- When you want a single point in history to revert if needed

### Method 3: Merge Commit (For Releases Only)

**What it does:** Creates a merge commit that explicitly records the joining
of two branches. The `main` history has a non-linear "V" shape.

**When to use:**
- Merging a `release/vX.Y.Z` branch into `main`
- Merging `main` back into `develop` at the start of a new development cycle
- **Never** use for regular feature branches or bug fixes

**Why limited to releases:** Merge commits make `main`'s history non-linear,
which makes it harder to read with `git log` and harder to bisect when
debugging. For the structured case of a release, the merge commit is useful
because it provides a clear historical record of when the release happened.

### A Practical Decision Tree

```
Is this a release branch being merged into main?
    YES → Merge commit
    NO  ↓

Does the PR have 1–3 commits, each well-formed with excellent messages?
    YES → Rebase and merge
    NO  ↓

DEFAULT: Squash merge
```

When in doubt: squash merge.

---

## 6. Code Review Standards

Consistent code review is the mechanism through which the project maintains
quality. Every reviewer should apply the same standards.

### The Review Hierarchy (What to Check First)

Review in this order. Stop and comment at the first level where you find
an issue — do not write a full style review on code with a design flaw.

**Level 1 — Correctness (blocking)**
Does the code do what it claims? Does it handle error cases? Are there
logic bugs? Does it implement the spec section it references? This is
always blocking — incorrect code must not merge.

**Level 2 — Security (blocking)**
Does the code introduce any security vulnerabilities? Especially:
- Timing attacks in cryptographic comparisons
- SQL injection in database queries
- Secrets in code or logs
- Missing input validation
- Incorrect permission checks

Security issues are always blocking, regardless of how minor they appear.
A small timing vulnerability in a signature verification function is a
critical security issue.

**Level 3 — Testability (blocking)**
Are there adequate tests? Do the tests actually test the claimed behaviour,
or do they test the implementation details? Are edge cases covered?

Missing tests on new code are blocking. If the change is trivial enough
that tests are not needed, it should be trivial enough to write them —
if someone argues a test is not needed, that is usually a sign the code
is unclear.

**Level 4 — Design (soft-blocking)**
Is the code structured well? Could it be simpler? Is the interface clean?
Does it fit the patterns of the surrounding codebase?

Design issues can be blocking if they would make the code significantly
harder to change in the future. Use judgment: if the design is workable
but suboptimal, request improvements but do not block if the author disagrees
and the code is otherwise correct.

**Level 5 — Style and naming (non-blocking, prefix with "nit:")**
Variable names, comment quality, code formatting. Always use `nit:` prefix
so the author knows this is not blocking. Limit nit comments to things that
meaningfully aid readability — do not nitpick for its own sake.

### Mandatory Review Checks

For **every** PR in the security-critical packages (vwp-gateway, ai-citation-sdk),
explicitly verify:

```
[ ] Signature comparison uses constant-time method (timingSafeEqual / compare_digest)
[ ] Timestamp tolerance is exactly 300 seconds — not more, not less
[ ] No user IDs, no full query text, no sub-country geodata in event schemas
[ ] Secrets are read from environment variables, never hardcoded
[ ] Database queries use parameterised statements
[ ] Error messages do not leak implementation details or secrets
[ ] New environment variables are added to .env.example
```

Add this checklist as a comment in reviews of security-sensitive code:
*"Security checklist verified: [paste checklist with checkmarks]"*

### How to Write Good Review Comments

**Specific, actionable, kind.** Every review comment should leave the
contributor knowing exactly what to do next.

**Bad:**
> "This is wrong."

**Good:**
> "This uses string equality to compare HMAC signatures, which is vulnerable
> to timing attacks. Replace with `crypto.timingSafeEqual()`:
> ```js
> // Instead of:
> return expected === received;
> // Use:
> return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
> ```
> See: https://codahale.com/a-lesson-in-timing-attacks/"

**Bad:**
> "Can you add tests?"

**Good:**
> "This function has no tests. Please add tests covering at least: (1) the
> happy path with valid input, (2) what happens with null input, and (3) what
> happens when the SPDX identifier is 'All-Rights-Reserved' (special case)."

**When to use "blocking" versus "suggestion":**

Use "blocking" (or GitHub's "Request changes") when:
- The code has bugs or security issues
- Tests are missing for non-trivial new code
- The implementation does not match the spec
- The PR would make the codebase significantly harder to maintain

Use "suggestion" (or "nit:") when:
- You prefer a different style but acknowledge the current approach works
- You have an idea for a better variable name
- You would structure the code differently but both approaches are valid

Do not abuse "Request changes" for non-blocking issues — it blocks the merge
unnecessarily and frustrates contributors. If you have only nit-level comments,
use "Approve" with comments rather than "Request changes."

### Reviewing Your Own PRs

Before requesting review, do a full self-review. Use the GitHub "Files changed"
tab as if you were reviewing someone else's code. This alone catches 30–40%
of issues before anyone else sees them.

Specifically check:
```
[ ] Ran the tests locally and they pass
[ ] No console.log() or debug output left in production code
[ ] No accidentally committed .env files or secrets
[ ] Commit messages are clean and descriptive
[ ] PR description accurately describes what and why
[ ] Referenced spec section is correct
[ ] Added to .env.example if new environment variables
```

---

## 7. Handling Difficult PRs

Some PR situations come up repeatedly. Here is how to handle them.

### The PR That Is Almost Right

**Situation:** A PR is 90% correct but has issues that need addressing.
The contributor is responsive and engaged.

**Action:** Request specific changes. Be precise about what is needed.
After the contributor pushes fixes, re-review only the changed sections.
Do not re-review everything from scratch each time.

**When to approve despite minor issues:** If a PR is correct, tested, secure,
and the only remaining issues are style preferences, approve it. You can
open a follow-up issue for the style improvements. Perfect is the enemy
of shipped.

### The PR That Does Too Much

**Situation:** A PR fixes a bug, adds a feature, refactors three files, and
updates documentation, all in one 1,200-line PR.

**Action:** Comment immediately (before doing a full review):
> "This PR combines several independent changes that would each benefit from
> their own focused review. Can you split it into:
> - PR 1: The bug fix only
> - PR 2: The feature addition
> - PR 3: The refactoring
>
> This will let each part be reviewed and merged quickly without blocking
> on the whole. Happy to review PR 1 immediately when it is ready."

Most contributors will appreciate this because smaller PRs get merged faster.

### The PR With Good Intent but Wrong Approach

**Situation:** A contributor has put significant effort into a PR but the
approach is architecturally wrong or contradicts a spec requirement. The
code works but cannot be merged as is.

**Action:** Acknowledge the effort first, then explain the issue clearly:
> "Thank you for the significant work here. The implementation is technically
> correct, but it conflicts with §3.4 of the spec, which requires that
> [specific requirement]. The approach we need instead is [describe the
> right approach], because [reason].
>
> I know this is a significant change from what you have built. I want to
> help you get this across the finish line — would it be useful to discuss
> the right approach in a GitHub Discussion first before you rework it?"

Never simply close a PR like this without this kind of explanation. The
contributor has put in effort and deserves a clear explanation.

### The Abandoned PR

**Situation:** A PR was opened, reviewed, changes were requested, and the
contributor has not responded in more than 21 days.

**Action:**
1. First comment (Day 14): "Just checking in — is this PR still in progress?
   We would love to get this merged. Let us know if you need any help."
2. Second comment (Day 21): "We have not heard back in a while. We will close
   this PR after 7 more days. You are welcome to reopen it whenever you are
   ready to continue."
3. Close the PR (Day 28). Add label `abandoned`. Do not delete the branch
   immediately — wait 7 days in case they want to reopen.

Do not feel bad about closing abandoned PRs. A clean PR queue is important
for the project's health and for new contributors who need to find where
their work fits.

### The PR That Solves a Problem Nobody Asked For

**Situation:** A contributor submits a well-executed PR for a feature that
was never requested and does not align with the project's current priorities.

**Action:** Acknowledge the quality of the work, explain honestly why it
cannot be merged, and suggest what to do next:
> "This is well-executed work. However, this feature is not currently on
> our roadmap and we are not confident it fits the project's direction.
> Before investing more in this direction, we recommend opening a Discussion
> to propose the feature and get community feedback. If there is consensus
> that this is valuable, we will add it to the roadmap and your PR would
> be a great starting point."

Close the PR with the `needs-discussion` label. If the contributor is upset,
that is understandable — they worked hard. Be empathetic but clear.

### The PR From Someone Famous or Important

A PR comes in from a well-known engineer, a major AI company, or someone
senior in the open-source world. They are not immune to review standards.

Apply the exact same standards as any other PR. Famous contributors do not
get to skip security review or merge without tests. Treating famous
contributors differently is inconsistent and unfair to everyone else.

If anything, be more thorough: high-profile contributors bring more attention
to both good and bad patterns, and security issues in their PRs are equally
exploitable.

---

## 8. Release Process — Step by Step

A release is a specific version of the software published to npm, PyPI, and
GitHub Releases. The release process must be done carefully because npm
publishes are permanent — you cannot take back a published version.

### Release Types

| Type | Version Change | Example | When |
|------|---------------|---------|------|
| Patch | `X.Y.Z → X.Y.Z+1` | `1.0.0 → 1.0.1` | Bug fixes, minor documentation |
| Minor | `X.Y.Z → X.Y+1.0` | `1.0.1 → 1.1.0` | New features, backwards-compatible |
| Major | `X.Y.Z → X+1.0.0` | `1.0.1 → 2.0.0` | Breaking changes (requires Working Group vote) |

### The Full Release Process (Annotated)

#### Phase 1: Preparation (1–2 weeks before release)

**Step 1 — Create the release branch**
```bash
git checkout main
git pull origin main
git checkout -b release/v1.1.0
git push origin release/v1.1.0
```

From this point, only small bug fixes go into the release branch.
New features targeting the next release continue going to `main` directly
(or to `develop` if you are running that branch).

**Step 2 — Freeze new features**
Announce in the team Slack or GitHub Discussion:
> "Release/v1.1.0 branch is open. Only bug fixes for this release now.
> All new features go to main for v1.2.0."

**Step 3 — Write the CHANGELOG entry**

Open `CHANGELOG.md` and add a new section above the previous entry:

```markdown
## [1.1.0] — YYYY-MM-DD

### Added
- `ai-attribution-lint`: robots.txt conflict checker rule (§5.5) — #89
- `aac-server`: query type classifier distinguishing content-dependent from
  logical/utility queries (§7.4) — #103
- Go SDK: `TruncateToMinute()` function for minute-precision timestamps (§3.2) — #118

### Fixed
- `vwp-gateway`: broken crypto require in webhook-forwarder.js — #95
- `aac-server`: initDb() now synchronous (better-sqlite3 is synchronous) — #96
- `ai-attribution-lint`: Canonical-Author field added to parser (§5.3) — #102

### Security
- `vwp-gateway`: Ed25519 signature verification now fully implemented (§3.4A) — #121

### Changed
- `crawl-manifest-client`: 90-day range validation now enforced client-side (§2.2) — #109

### Deprecated
(None)

### Removed
(None)
```

**Step 4 — Update all version numbers**
```bash
# Update package.json in each package
# Update the root package.json
# Use a script to do this consistently:

cd /path/to/aiacta
node -e "
const fs = require('fs');
const packages = [
  'package.json',
  'packages/ai-attribution-lint/package.json',
  'packages/ai-citation-sdk/package.json',
  'packages/crawl-manifest-client/package.json',
  'packages/aac-dashboard-lite/package.json',
  'packages/attribution-test-harness/package.json',
  'packages/aac-server/package.json',
  'packages/vwp-gateway/package.json',
  'packages/referrer-middleware/package.json',
  'packages/honeypot-verifier/package.json',
];
packages.forEach(p => {
  const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
  pkg.version = '1.1.0';
  fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + '\n');
  console.log('Updated', p);
});
"
```

Commit the version updates:
```bash
git add -A
git commit -m "chore: bump versions to 1.1.0"
```

**Step 5 — Run the full test suite one final time**
```bash
npm test --workspaces --if-present
cd packages/ai-citation-sdk/src/go && go test ./...
python -m pytest packages/ai-citation-sdk/src/python/ -v
```

All must pass. If any fail, fix them before proceeding.

**Step 6 — Pre-release checklist**
```
[ ] CHANGELOG.md updated with correct date
[ ] All package.json files updated to new version
[ ] All tests passing (Node, Go, Python)
[ ] npm audit shows no high-severity vulnerabilities
[ ] No uncommitted changes in the release branch
[ ] Someone other than the release manager has reviewed the CHANGELOG
[ ] Communications team notified of upcoming release
```

---

#### Phase 2: Tagging and Publishing

**Step 7 — Merge release branch to main**
```bash
git checkout main
git merge --no-ff release/v1.1.0 -m "release: v1.1.0"
git push origin main
```

Use `--no-ff` here (no fast-forward) — this creates a merge commit that
marks the release boundary in the history.

**Step 8 — Tag the release**
```bash
git tag -a v1.1.0 -m "Release v1.1.0

[paste the CHANGELOG entry for this version here]"

git push origin v1.1.0
```

Pushing the tag triggers the CI/CD pipeline which will run the release jobs.

**Step 9 — Create the GitHub Release**
1. Go to https://github.com/aiacta-org/aiacta/releases/new
2. Select the `v1.1.0` tag you just pushed
3. Title: `v1.1.0 — [2–4 word summary of major change]`
4. Body: paste the CHANGELOG section for this version
5. Mark as "Pre-release" only if this is a beta/RC that should not be the
   default release
6. Click "Publish release"

**Step 10 — Publish npm packages**

Each Node.js package is published separately to npm:
```bash
# Authenticate first (only needed once per machine):
npm login --registry https://registry.npmjs.org

# Publish each package:
cd packages/ai-attribution-lint && npm publish --access public
cd ../ai-citation-sdk && npm publish --access public
cd ../crawl-manifest-client && npm publish --access public
cd ../aac-dashboard-lite && npm publish --access public
# Do not publish: attribution-test-harness, aac-server, vwp-gateway,
# referrer-middleware, honeypot-verifier
# (These are for deployment, not npm distribution)
```

**Step 11 — Publish Python package to PyPI**
```bash
cd packages/ai-citation-sdk/src/python
python -m build
python -m twine upload dist/*
```

**Step 12 — Push Go module tag**
```bash
git tag ai-citation-sdk/v1.1.0
git push origin ai-citation-sdk/v1.1.0
```

---

#### Phase 3: Post-Release

**Step 13 — Verify publications**
```bash
# Verify npm:
npm view ai-attribution-lint version   # should show 1.1.0
npm view ai-citation-sdk version       # should show 1.1.0

# Verify install works:
npm install ai-attribution-lint@1.1.0
npx @aiacta-org/ai-attribution-lint --version     # should print 1.1.0
```

**Step 14 — Delete the release branch**
```bash
git push origin --delete release/v1.1.0
git branch -d release/v1.1.0
```

**Step 15 — Announce the release**
- Post in GitHub Discussions: "v1.1.0 Released"
- Write a brief blog post on aiacta.org
- Tweet from @aiacta_org
- Post in any community Slack or Discord
- Email registered implementors who may need to update

**Step 16 — Bump main to the next development version**
```bash
git checkout main
# Update all package.json files to 1.2.0-dev
# Commit: "chore: begin development of v1.2.0"
```

This prevents any accidental publishing of `main` as a stable release.

---

## 9. Hotfix Releases

A hotfix is an emergency release for a critical bug or security vulnerability
that cannot wait for the normal release cycle.

### When to Do a Hotfix

- A security vulnerability with real exploitability is discovered
- A bug causes data loss or financial errors in the AAC Server
- A bug causes citation events to be dropped or delivered to wrong endpoints

Do not do a hotfix for:
- Performance issues that do not cause functional failures
- Missing features
- Non-critical bugs with a straightforward workaround

### Hotfix Process

```bash
# Step 1: Branch from the latest production tag (not main)
git checkout v1.1.0
git checkout -b hotfix/v1.1.1

# Step 2: Apply the minimal fix
# Only fix the specific issue — no other changes

# Step 3: Write the test that reproduces the bug first
# Then fix the code
# Then verify the test passes

# Step 4: Update CHANGELOG.md
## [1.1.1] — YYYY-MM-DD (Hotfix)
### Security
- Fixed timing attack vulnerability in HMAC verification — #132

# Step 5: Bump patch version
# Update package.json: 1.1.0 → 1.1.1

# Step 6: Get fast-track review (1 reviewer, not 2)
# The reviewer must be a senior maintainer familiar with the affected code

# Step 7: Merge to main
git checkout main
git merge --no-ff hotfix/v1.1.1 -m "hotfix: v1.1.1 — [brief description]"

# Step 8: Tag and release (same as normal release — Steps 8–15)
git tag -a v1.1.1 -m "Hotfix: v1.1.1 — [description]"
git push origin v1.1.1

# Step 9: Also merge back into develop if it exists
git checkout develop
git merge --no-ff hotfix/v1.1.1

# Step 10: Delete hotfix branch
git push origin --delete hotfix/v1.1.1
```

### Coordinating Security Hotfixes

For security vulnerabilities discovered through responsible disclosure:
1. Fix in a **private** fork or branch (not public until fixed)
2. Coordinate disclosure date with the reporter (standard: 90-day maximum)
3. Prepare the fix, tests, and release notes in private
4. On disclosure day: deploy the fix, tag the release, and publish the
   security advisory simultaneously — all within a 30-minute window

Never hint publicly that a security fix is coming — this tips off potential
attackers.

---

## 10. Managing Forks and Divergence

When a major company or organisation forks AIACTA and makes significant
changes, this creates potential fragmentation of the standard. Handle it
proactively.

### When to Accept Contributions from Forks

The best outcome is always to get the fork's improvements back into the
main repository. Contact the fork maintainer and ask:

> "We noticed you have been making improvements in your fork. We would love
> to get these changes into the main AIACTA repository so all implementations
> benefit. Would you be open to submitting them as PRs?"

Accept reasonable contributions even if they come from potentially self-interested
parties (like an AI company adding features beneficial to themselves) — as long
as the changes are spec-compliant and technically sound.

### When to Push Back on Fork Divergence

If a fork is implementing spec extensions that contradict the standard, or
is claiming to be "AIACTA-compatible" when it is not, this is a trademark and
standards problem:

1. Contact the fork maintainer privately first
2. Explain the compatibility concern
3. Offer to run the standard test harness against their implementation to
   document compatibility issues
4. If they claim AIACTA certification incorrectly, the Foundation's legal
   counsel sends a trademark notice

### Monitoring for Forks

Check monthly:
```bash
# GitHub shows forks on the repository page
# Look for forks with significant activity
# Use GitHub's fork network view

# Also search for:
# - npm packages claiming AIACTA compatibility
# - GitHub repositories with 'aiacta' in the name not under aiacta-org
```

---

## 11. Dependency Management

External dependencies are a major source of security vulnerabilities and
unexpected breaking changes. Manage them actively.

### Dependency Policy

- **Direct dependencies:** Each package's `package.json` pins major versions
  (e.g., `"express": "^4.18.0"`) — `^` allows minor and patch updates but
  blocks major version upgrades.
- **No pinning to exact versions** for normal dependencies (this makes
  security patching harder). Exception: CI/CD tooling can be pinned.
- **Deviate from this policy only for known-unstable packages.**

### Dependabot Configuration

Enable Dependabot in the repository settings:
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
      timezone: "UTC"
    open-pull-requests-limit: 10
    assignees:
      - "aiacta-org/maintainers"
    labels:
      - "chore"
      - "dependencies"
    commit-message:
      prefix: "chore"
      include: "scope"

  - package-ecosystem: "gomod"
    directory: "/packages/ai-citation-sdk/src/go"
    schedule:
      interval: "weekly"
    labels:
      - "chore"
      - "go"

  - package-ecosystem: "pip"
    directory: "/packages/ai-citation-sdk/src/python"
    schedule:
      interval: "weekly"
    labels:
      - "chore"
      - "python"
```

### Handling Dependabot PRs

**Security updates (high/critical severity):** Merge immediately after
confirming tests pass. Do not wait for the normal PR review cycle.

**Minor and patch updates:** Review weekly. Merge if tests pass and the
changelog shows no breaking changes. Group multiple small updates into one
merge to keep `main`'s history clean.

**Major version updates:** Do not auto-merge. Review the migration guide,
assess the breaking changes, update any affected code, and include in a
planned release.

### The `npm audit` Requirement

Every CI run must pass `npm audit --audit-level=high`. If a new vulnerability
is discovered in a dependency:

1. Check immediately: is this in a production dependency or dev-only?
2. For production dependencies: patch within 48 hours if high/critical
3. For dev-only dependencies: patch within 14 days
4. If no patch is available: file an issue, consider replacing the dependency

---

## 12. Technical Debt Management

Technical debt is the accumulated cost of shortcuts taken in the past.
Every open-source project accumulates it. The key is managing it consciously
rather than letting it accumulate silently.

### Tracking Technical Debt

Use a dedicated GitHub label: `technical-debt`. When you notice a code smell,
an architectural issue, or a known limitation while reviewing or developing:

1. Open an Issue labelled `technical-debt`
2. Describe: what is the problem, why it is a problem, and what the correct
   solution looks like
3. Estimate: small (< 1 day), medium (1–3 days), large (3+ days)

Review the `technical-debt` backlog monthly. Do not let it grow without bound.

### Known Technical Debt in the Current Codebase

These are the items that exist in v1.0 that should be addressed in v1.1/1.2:

**High Priority:**
- `aac-server` uses SQLite (synchronous `better-sqlite3`). Production
  deployments need PostgreSQL with async driver. This is a significant
  refactoring task. Track in Issue #[number].

- Rate limiting in `aac-server` and `vwp-gateway` is in-memory. Distributed
  deployments need Redis-backed rate limiting. Track as Issue #[number].

- The AAC server has no authentication on most endpoints. OAuth 2.0 or
  API key authentication needs to be added before production. Track as Issue #[number].

**Medium Priority:**
- The query classifier in `query-classifier.js` uses heuristic regex rules.
  A trained ML model would be more accurate. Track as Issue #[number].

- The honeypot verifier uses in-memory storage — canary records are lost
  on server restart. Needs a persistent store.

**Low Priority:**
- Error messages in the linter are English-only.
- The Go SDK has no real retry implementation (placeholder in `WithRetry`).

### Debt Reduction Strategy

Schedule a "debt sprint" every quarter:
- Pick 2–3 items from the technical debt backlog
- Allocate 2–3 days of developer time specifically to debt reduction
- Do not mix new features into a debt sprint
- Announce in the community so contributors can participate

---

## 13. Scaling the Contributor Pipeline

At some point, you will have more contributors than you can review individually.
This is a good problem to have. Manage it proactively.

### The Contributor Funnel

```
New visitors → First-time contributors → Returning contributors → Trusted contributors → Maintainers
```

Your goal is to move people through this funnel:

**New → First-time:**
- Good first issue labels on suitable issues
- Welcoming response to first PR within 24 hours
- Patient, thorough reviews that teach rather than gatekeep

**First-time → Returning:**
- Thank contributors publicly (in merge commit, in community announcements)
- Follow up after their first merged PR: "Any other areas you would like to
  contribute to?"
- When they open a second PR, fast-track it slightly

**Returning → Trusted:**
- After 3+ merged PRs with no major issues: grant triage access (`contributors` team)
- They can label, close, and comment authoritatively on issues
- Invite them to weigh in on architectural discussions

**Trusted → Maintainer:**
- After 6+ months of consistent, high-quality contribution: consider inviting
  them to the `maintainers` team
- Discuss with existing maintainers first
- The invitation should feel earned, not perfunctory

### Reviewer Workload Distribution

Track who is reviewing what:
```bash
# GitHub's built-in insights show PR review activity
# Also use this query to see who has recently merged things:
git log main --since="30 days ago" --merges --format="%ae %s" | sort | uniq -c
```

If one or two people are doing 80% of the reviews, redistribute actively.
Assign new PRs explicitly. Ask under-loaded maintainers if something is blocking
them from reviewing.

### When the Review Queue Gets Too Long

If there are more than 10 open PRs awaiting review, the queue is too long.
Consequences: contributors give up, the codebase diverges, context is lost.

Triage actions:
1. Identify which PRs are near-ready (1 approval, minor changes) — merge these first
2. Identify which PRs have been abandoned — close these
3. Identify which PRs are blocked on a decision — make the decision
4. Dedicate a "review sprint" day where the whole team focuses only on clearing the queue

---

## 14. Maintaining CI/CD Health

CI (the automated tests) and CD (the deployment pipeline) are the quality gate
for everything that goes to production. They are only valuable if they are fast,
reliable, and comprehensive.

### CI Health Metrics

Monitor these monthly:
- **Average CI run time.** If tests take more than 10 minutes, developers
  stop running them locally. Investigate and optimise.
- **Flaky test rate.** If > 2% of CI runs fail due to flaky tests
  (non-deterministic failures), fix or delete the flaky tests.
- **Test coverage.** Track coverage per package over time. If it is
  decreasing, it means new code is being merged without tests.

### Managing Flaky Tests

A flaky test is one that sometimes passes and sometimes fails without any code
change. It is worse than having no test because it trains developers to ignore
CI failures.

When a flaky test is identified:
1. Label the Issue `flaky-test`
2. Immediately mark the test with `.skip` or equivalent to stop it blocking PRs
3. Fix it properly within 2 weeks
4. Never merge a PR that makes an existing test flakier

Common causes of flaky tests in AIACTA:
- Network timeouts (tests that make real HTTP calls)
- Race conditions in async code
- Test pollution (one test modifying global state that affects another)
- Time-dependent tests (using current date/time without mocking)

### Keeping CI Fast

Target: CI should complete in under 5 minutes for the full suite.

Strategies:
- Run tests for each package in parallel (already configured in CI)
- Cache node_modules between CI runs (`actions/cache`)
- Run the slowest tests last (so fast feedback on common errors)
- Delete or skip integration tests that require external services in the
  standard CI run — move them to a separate, less frequent workflow

### Deployment Pipeline Health

Check monthly:
- Is the staging deployment working?
- Was the last production deployment successful?
- Are any deployment environments "dirty" (manually modified from the automated state)?

If anyone has made manual changes to production servers without going through
the pipeline, document what was changed and add it to the deployment configuration.
"Snowflake servers" (manually modified servers that cannot be recreated from
code) are a serious operational risk.

---

## 15. Security Maintenance

Security maintenance is ongoing, not a one-time setup.

### Weekly Security Tasks

```bash
# Check for newly discovered vulnerabilities in dependencies
npm audit --workspaces

# Check Go vulnerability database
cd packages/ai-citation-sdk/src/go
go list -m all | govulncheck ./...

# Review any newly filed security issues on GitHub
# Filter: label:security
```

### Monthly Security Tasks

**Dependency audit review:**
Are any packages flagged by Dependabot remaining unpatched? Escalate
anything high/critical that is more than 48 hours old.

**Access audit:**
Who has admin access to GitHub, the cloud provider, and the secrets manager?
Is everyone on that list still actively involved and does everyone still
need that access level?

**Secret rotation check:**
Review the rotation schedule. Are any secrets past their rotation date?

### The Security-Critical Code Inventory

Maintain an explicit list of code that requires extra scrutiny. Any PR
touching these files must be reviewed by at least one security-focused
maintainer:

| File | Why It's Security-Critical |
|------|--------------------------|
| `packages/vwp-gateway/src/verify-provider-signature.js` | Ed25519 and HMAC signature verification |
| `packages/vwp-gateway/src/velocity-throttle.js` | Anti-DDoS; bypass could crash the system |
| `packages/ai-citation-sdk/src/node/signature.js` | Publisher-side HMAC verification |
| `packages/ai-citation-sdk/src/python/aiacta/signature.py` | Python HMAC verification |
| `packages/ai-citation-sdk/src/go/aiacta.go` | Go HMAC verification |
| `packages/aac-server/src/routes/provenance.js` | Law enforcement API — access controls critical |
| `packages/aac-server/src/services/distribution-engine.js` | Financial calculations — bugs cost real money |
| `packages/aac-server/src/db/database.js` | SQL queries — injection surface |

For these files, require 2 security-aware reviewers regardless of PR size.

---

## 16. Documentation Maintenance

Documentation rots. Code changes but documentation does not get updated.
Outdated documentation is worse than none because it actively misleads
contributors and implementors.

### The Documentation Debt Principle

When you review a PR that changes behaviour, always check: does any
documentation need to be updated? If so, make it part of the PR, not a
separate future task.

Code review question to ask on every PR:
> "Does this change affect any documentation? If yes, is that documentation
> updated in this PR?"

If documentation needs updating but is out of scope for the PR, open a
specific Issue before merging: *"PR #X changed [behaviour] but the documentation
at docs/proposals/[file] still describes the old behaviour. This needs updating."*

### The Monthly Documentation Audit

Once a month, each maintainer takes one package or documentation section and
reads through it end to end. Ask:
- Is this accurate given the current code?
- Are there code examples that no longer work?
- Are there references to spec sections that have changed?
- Is there anything described as "coming soon" that is actually already implemented?

### Managing the Spec-Code Alignment

Every spec section reference in the codebase (`§2.3`, `§3.4A`, etc.) should
be checked when the spec evolves. Create a grep command to find all references:

```bash
grep -r "§" packages/ --include="*.js" --include="*.py" --include="*.go" \
  | grep -o "§[0-9][0-9.]*[A-D]*" | sort | uniq
```

When a spec section changes (e.g., §3.4A is updated to clarify Ed25519
handling), search for all code referencing `§3.4A` and verify it is still
correct.

---

## 17. Handling Community Conflict

Conflict in open-source communities is normal and not inherently bad. How you
handle it determines whether the community grows stronger or fractures.

### Types of Conflict and How to Handle Them

**Technical disagreement (two valid approaches):**
This is healthy. Let it play out in comments, then:
1. If consensus emerges: merge the preferred approach
2. If no consensus after 5+ substantive comments: a senior maintainer
   makes the decision, explains the reasoning, and marks the discussion closed

Never let technical disagreements drag on indefinitely. Make a decision.

**Disagreement about spec compliance:**
Refer to the spec documents and the whitepaper. The spec is the authority,
not any individual's preference. If the spec is ambiguous, open a Working
Group discussion to clarify it.

**A contributor feeling their work was rejected unfairly:**
Take this seriously. Review the rejection reasoning. Was it consistent with
how similar PRs have been treated? If not, acknowledge the inconsistency and
make it right. If the rejection was correct, explain more thoroughly.

**A contributor being rude or disrespectful:**
Address it immediately and directly. Do not ignore it hoping it will pass.
Comment: "Please keep the discussion technical and respectful. Our Code of
Conduct applies to all interactions in this repository."

If the behaviour continues after one warning: temporarily block the user
from the repository (GitHub allows this). If it escalates: permanent ban,
following the Code of Conduct enforcement process.

**A major corporate contributor attempting to steer the project:**
This is a real risk for a standards project. A major AI company contributing
heavily might attempt to push the spec in directions that benefit them.
Handle it by:
- Ensuring all proposals go through the formal Working Group process
- Maintaining the Working Group's multi-stakeholder balance
- Being transparent about contributions and their origins
- Accepting their technical contributions when technically sound while
  pushing back on spec changes that favour one party

### The Principle of Charitable Interpretation

In written communication, tone is ambiguous. Before assuming someone is being
hostile, consider whether they might simply be expressing genuine frustration.
Respond to the best interpretation of what they wrote, not the worst.

If something clearly crosses a line, address it — but start from charitable
interpretation and only escalate if the behaviour continues.

---

## 18. Maintaining Spec Alignment

The codebase is a reference implementation of the spec. Over time, these can
drift apart. Preventing drift is an ongoing maintenance task.

### The Spec-Code Cross-Reference Matrix

Maintain a document that maps every spec requirement to the code that
implements it and the test that verifies it:

```markdown
## §2.2 Crawl Manifest API Endpoint

**Requirement:** Date range must not exceed 90 days per request.
**Implementation:** `packages/crawl-manifest-client/src/node/index.js:_validateRange()`
**Test:** `packages/crawl-manifest-client/tests/client.test.js:"rejects ranges > 90 days"`
**Status:** ✅ Implemented and tested

## §3.2 Webhook Event Timestamp Precision

**Requirement:** Timestamps must be minute precision only.
**Implementation:** `packages/ai-citation-sdk/src/node/timestamp.js:truncateToMinute()`
**Test:** (Go) `packages/ai-citation-sdk/src/go/aiacta_test.go:TestTruncateToMinute`
**Status:** ✅ Implemented and tested

## §3.7 Pull API Event Retention

**Requirement:** Events retained 90 days (standard), 365 days (enterprise).
**Implementation:** `packages/attribution-test-harness/docker/provider-server.js`
                   `packages/aac-server/src/routes/citations.js:RETENTION_*`
**Test:** Not yet tested end-to-end.
**Status:** ⚠️ Partially implemented, needs E2E test
```

Update this matrix whenever:
- A new spec requirement is implemented
- A spec section is changed by the Working Group
- A test is added or removed for a spec requirement

### Red-Flag Review Question

For any PR that is not trivially cosmetic, ask: "Does this change the
behaviour of any feature that maps to a spec requirement?" If yes:
1. Identify which spec section
2. Verify the new behaviour still complies
3. Verify the tests for that spec section still pass
4. If the PR improves over the spec, open a Working Group discussion about
   updating the spec to match

---

## 19. Maintainer Onboarding and Offboarding

### Onboarding a New Maintainer

When a trusted contributor is invited to become a maintainer:

**Step 1 — Invitation (async)**
Open a private GitHub Discussion in the maintainers team:
> "[Name] has made [N] quality contributions over [time period], including
> [notable contributions]. I'd like to invite them to the maintainers team.
> Any objections? (Silence = consent after 72 hours.)"

**Step 2 — Invite to GitHub team**
Add them to `aiacta-org/maintainers` on GitHub.

**Step 3 — Briefing call (30 minutes)**
Cover:
- Branch protection settings and why they exist
- Merging strategy (squash vs rebase vs merge commit)
- PR review standards and the blocking/non-blocking distinction
- The release process
- Who to escalate to for spec questions, security concerns, and conduct issues
- How to ask for help without feeling like they should already know something

**Step 4 — Written documentation**
Share this guide and the CONTRIBUTING.md. Give them a week to read both.

**Step 5 — Supervised first reviews**
For the first month, new maintainers leave their review comments but do not
click "Merge" — they ask a senior maintainer to confirm the merge is appropriate.
After one month, they merge independently.

### Offboarding a Maintainer

When a maintainer leaves (by choice, or due to long-term inactivity):

**Voluntary departure:**
1. Acknowledge their contributions publicly (blog post, GitHub post)
2. Remove from GitHub `maintainers` team
3. Rotate any secrets they had access to
4. Update CODEOWNERS if they owned specific files

**Inactivity:**
After 6 months of no review activity, send a private message:
> "We have noticed you have not been active as a maintainer recently. We
> completely understand life gets busy. Would you like to remain on the
> maintainers team, or would you prefer to step back to contributor status?
> Either is completely fine."

If no response in 2 weeks: move to `contributors` team, remove from `maintainers`.

**For cause:**
Document the reason. Remove access immediately. Handle privately.
If public conduct was involved, a brief public statement may be needed:
"[Name] is no longer a maintainer of AIACTA."

---

## 20. The Monthly Maintenance Checklist

Run through this checklist at the start of each month. Assign each item to
a specific maintainer. Document completion.

### Code Health

```
[ ] Open PR count: _____
    Target: < 15 open PRs. If above: triage sprint needed.

[ ] Oldest open PR age: _____ days
    Target: No PR older than 30 days without a comment in the last 7 days.

[ ] PRs awaiting review with no assigned reviewer: _____
    Target: 0. Assign all unassigned PRs today.

[ ] Stale branches (no commits in 90+ days): _____
    Action: Comment on any associated open PRs; delete branches for closed PRs.

[ ] Flaky test incidents this month: _____
    Action: File issue for each flaky test. Fix within 14 days.

[ ] Average CI run time: _____ minutes
    Target: < 7 minutes. If above, investigate.
```

### Security

```
[ ] npm audit results: _____ high/critical vulnerabilities
    Action: Any high/critical unpatched > 48 hours needs escalation.

[ ] Security issues opened this month: _____
    Action: All security issues acknowledged within 72 hours.

[ ] Access audit: Does everyone with maintainer access still need it?
    [ ] Reviewed GitHub maintainers team
    [ ] Reviewed cloud hosting access
    [ ] Reviewed secrets manager access
```

### Dependencies

```
[ ] Dependabot PRs open: _____
    Action: Merge security updates. Schedule minor updates. Plan major updates.

[ ] Any dependency EOL (End of Life) approaching?
    Check: https://endoflife.date for Node.js, Python, Go versions in use.
```

### Documentation

```
[ ] Did any merged PR change behaviour without updating documentation?
    Action: Create issues for any documentation gaps found.

[ ] Is the README accurate for the current state of the project?

[ ] Are any spec cross-references stale?
    Run: grep -r "§" packages/ --include="*.js" | head -20
    Verify 5 random references are still accurate.
```

### Community

```
[ ] GitHub Discussions with unanswered questions: _____
    Target: 0. Answer or close all discussions > 7 days old.

[ ] Contributors thanked this month: _____
    Action: At least one public contributor recognition post per month.

[ ] New contributors this month: _____
    Action: Personally welcome each one.

[ ] Maintainer workload balance: Is any maintainer doing > 50% of reviews?
    Action: Redistribute if so.
```

### Releases

```
[ ] Are there 10+ merged changes since the last release?
    Consider: Is it time for a patch or minor release?

[ ] Are there any open bugs that have been fixed but not released?
    Action: Group into a patch release.

[ ] Is the CHANGELOG up to date for unreleased changes?
    Action: Maintain it continuously, not just at release time.
```

---

*This guide is written for experienced contributors who understand that
maintaining an open-source project is a long-term commitment. The reward for
doing it well is a thriving ecosystem that outlasts any individual contributor.*

*Questions about this guide? Open a maintainer Discussion at
github.com/aiacta-org/aiacta/discussions/discussions.md or email maintainers@aiacta.org*
