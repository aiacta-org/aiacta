from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import KeepInFrame, Paragraph
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = ROOT / "output" / "pdf" / "aiacta-app-summary.pdf"


def build_styles():
    styles = getSampleStyleSheet()
    return {
        "subtitle": ParagraphStyle(
            "Subtitle",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=8.4,
            leading=10.2,
            textColor=HexColor("#425466"),
        ),
        "heading": ParagraphStyle(
            "Heading",
            parent=styles["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=10.2,
            leading=12,
            textColor=HexColor("#0B1F33"),
            spaceAfter=3,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=10.6,
            textColor=HexColor("#1F2D3D"),
            spaceAfter=4,
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=8.25,
            leading=9.9,
            textColor=HexColor("#1F2D3D"),
            leftIndent=10,
            firstLineIndent=-8,
            spaceAfter=2,
        ),
        "footer": ParagraphStyle(
            "Footer",
            parent=styles["BodyText"],
            fontName="Helvetica-Oblique",
            fontSize=7.2,
            leading=8.4,
            textColor=HexColor("#5C6B7A"),
            alignment=1,
        ),
    }


def section(styles, title, body=None, bullets=None):
    items = [Paragraph(f"<b>{title}</b>", styles["heading"])]
    if body:
        items.append(Paragraph(body, styles["body"]))
    for bullet in bullets or []:
        items.append(Paragraph(f"- {bullet}", styles["bullet"]))
    return items


def main():
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    styles = build_styles()
    page_w, page_h = LETTER
    margin = 0.5 * inch
    gap = 0.2 * inch
    col_w = (page_w - (2 * margin) - gap) / 2
    footer_h = 0.35 * inch

    c = canvas.Canvas(str(OUTPUT_PATH), pagesize=LETTER)
    c.setTitle("AIACTA App Summary")
    c.setAuthor("OpenAI Codex")
    c.setSubject("One-page summary generated from repo evidence")

    c.setFillColor(HexColor("#F7F4EE"))
    c.rect(0, 0, page_w, page_h, stroke=0, fill=1)
    c.setFillColor(HexColor("#D05C34"))
    c.rect(margin, page_h - 0.65 * inch, 1.2 * inch, 0.08 * inch, stroke=0, fill=1)

    title = "AIACTA App Summary"
    c.setFillColor(HexColor("#102A43"))
    c.setFont("Helvetica-Bold", 21)
    c.drawString(margin, page_h - 0.95 * inch, title)

    subtitle = (
        "Repo-backed summary of the AIACTA monorepo: an open technical standard "
        "and reference implementation for AI content transparency, attribution, "
        "crawl auditing, and AAC reward flows."
    )
    subtitle_p = Paragraph(subtitle, styles["subtitle"])
    _, sub_h = subtitle_p.wrap(page_w - (2 * margin), 0.55 * inch)
    subtitle_y = page_h - 1.12 * inch - sub_h
    subtitle_p.drawOn(c, margin, subtitle_y)

    rule_y = subtitle_y - 0.18 * inch
    c.setStrokeColor(HexColor("#D9E2EC"))
    c.setLineWidth(1)
    c.line(margin, rule_y, page_w - margin, rule_y)

    left_x = margin
    right_x = margin + col_w + gap
    top_y = rule_y - 0.16 * inch
    bottom_y = margin + footer_h
    col_h = top_y - bottom_y

    left_flowables = []
    left_flowables += section(
        styles,
        "What it is",
        body=(
            "AIACTA is an open, decentralized technical standard plus reference "
            "implementation for making AI use of web content traceable, attributable, "
            "and economically accountable. This repo packages the spec's five proposals "
            "into runnable tools, services, SDKs, and test assets."
        ),
    )
    left_flowables += section(
        styles,
        "Who it's for",
        body=(
            "Primary persona: a publisher-side developer or technically inclined site "
            "owner who wants to publish AI usage rules, receive citation events, inspect "
            "crawl history, and measure attribution outcomes. The repo also supports AI "
            "provider implementers and contributors."
        ),
    )
    left_flowables += section(
        styles,
        "What it does",
        bullets=[
            "Validates `ai-attribution.txt` rules and webhook reachability with a CLI linter.",
            "Receives and verifies signed citation webhooks through SDKs for Node, Python, and Go.",
            "Queries AI provider crawl-manifest APIs with pagination, caching, and rate-limit handling.",
            "Sets `Referrer-Policy: origin` so AI-referred traffic is measurable without leaking full chat URLs.",
            "Routes citation events through a VWP gateway that validates, signs, and forwards deliveries.",
            "Runs an AAC reference server for enrollment, citation ledgering, distribution calculation, and provenance queries.",
            "Includes a self-hosted dashboard plus a Docker E2E test harness for publishers and implementers.",
        ],
    )

    right_flowables = []
    right_flowables += section(
        styles,
        "How it works",
        bullets=[
            "Workspace monorepo: root `package.json` runs tests and builds across nine packages.",
            "Shared contracts live in `shared/schemas/` and `shared/types/` for crawl manifests, citation webhooks, and `ai-attribution.txt`.",
            "Publisher-facing pieces include the linter, citation SDK, crawl-manifest client, referrer middleware, examples, and dashboard.",
            "Service layer includes `vwp-gateway` for verification/routing, `aac-server` for ledger and distribution APIs, and `honeypot-verifier` for audit canaries.",
            "Data flow in repo docs: provider crawlers declare purpose -> publishers expose `ai-attribution.txt` and crawl APIs -> inference sends citation events -> VWP gateway verifies/routes -> publisher webhook and AAC server ingest/store -> dashboard and pull APIs surface results.",
        ],
    )
    right_flowables += section(
        styles,
        "How to run",
        bullets=[
            "Clone the repo and run `npm install` at the root to install all workspace packages.",
            "Run `npm test` at the root to execute available package test suites.",
            "For the AAC server: `cd packages/aac-server`, copy `.env.example` to `.env`, then `npm start` to serve on port 3100.",
            "For the dashboard: `cd packages/aac-dashboard-lite`, `npm install`, then `npm run dev` to open the Vite app on port 5173.",
            "For full end-to-end simulation: `cd packages/attribution-test-harness` and use Docker via `docker compose up --build`.",
        ],
    )
    right_flowables += section(
        styles,
        "Evidence note",
        body=(
            "This page was summarized from repo evidence in `README.md`, `docs/getting-started.md`, "
            "workspace manifests, `shared/`, and package READMEs. No required summary field was "
            "marked Not found in repo."
        ),
    )

    left_box = KeepInFrame(col_w, col_h, left_flowables, mode="shrink")
    right_box = KeepInFrame(col_w, col_h, right_flowables, mode="shrink")

    _, left_h = left_box.wrapOn(c, col_w, col_h)
    _, right_h = right_box.wrapOn(c, col_w, col_h)

    left_box.drawOn(c, left_x, top_y - left_h)
    right_box.drawOn(c, right_x, top_y - right_h)

    footer = Paragraph(
        "Generated from repo evidence on a single page for quick review.",
        styles["footer"],
    )
    footer_w, footer_actual_h = footer.wrap(page_w - 2 * margin, footer_h)
    footer.drawOn(c, margin, margin - 0.02 * inch + (footer_h - footer_actual_h) / 2)

    c.showPage()
    c.save()

    print(OUTPUT_PATH)


if __name__ == "__main__":
    main()
