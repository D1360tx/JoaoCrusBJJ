#!/usr/bin/env python3
"""Validate the campaign SEO foundation without external dependencies."""

from __future__ import annotations

import html
import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urljoin, urlsplit

ROOT = Path(__file__).resolve().parents[1]
CAMPAIGN = ROOT / "site" / "campaign"
DATA = json.loads((CAMPAIGN / "seo-pages.json").read_text(encoding="utf-8"))
BASE = DATA["site"]["base_url"].rstrip("/")
ERRORS: list[str] = []
CHECKS = 0
PARENT_GUIDE_FILES = {
    "guide.html",
    "life-skills-kids-bjj.html",
    "age-start-bjj.html",
    "tapping-children.html",
    "bjj-class-ages-3-7.html",
    "choose-kids-bjj-program.html",
    "first-class-checklist.html",
}


def check(ok: bool, message: str) -> None:
    global CHECKS
    CHECKS += 1
    if not ok:
        ERRORS.append(message)


def attr(source: str, pattern: str) -> str | None:
    match = re.search(pattern, source, re.S | re.I)
    return html.unescape(match.group(1).strip()) if match else None


def canonical(page: dict) -> str:
    path = page.get("canonical_path", page["path"])
    return urljoin(BASE + "/", path.lstrip("/"))


def visible_text(source: str) -> str:
    """Return whitespace-normalized visible-ish text for copy/schema checks."""
    source = re.sub(r"<(script|style)\b.*?</\1>", " ", source, flags=re.S | re.I)
    source = re.sub(r"<sup\b.*?</sup>", "", source, flags=re.S | re.I)
    source = re.sub(r"<[^>]+>", " ", source)
    return " ".join(html.unescape(source).split())


def validate_page(page: dict) -> None:
    if page.get("source_file"):
        path = ROOT / "site" / page["source_file"]
        check(path.exists(), f"{page['file']}: source file missing")
        return
    path = CAMPAIGN / page["file"]
    check(path.exists(), f"{page['file']}: file missing")
    if not path.exists():
        return
    source = path.read_text(encoding="utf-8")
    title = attr(source, r"<title>(.*?)</title>")
    description = attr(source, r'<meta\s+name="description"\s+content="(.*?)">')
    robots = attr(source, r'<meta\s+name="robots"\s+content="(.*?)">')
    canon = attr(source, r'<link\s+rel="canonical"\s+href="(.*?)">')
    og_url = attr(source, r'<meta\s+property="og:url"\s+content="(.*?)">')
    og_image = attr(source, r'<meta\s+property="og:image"\s+content="(.*?)">')
    check(title == page["title"], f"{page['file']}: title mismatch")
    check(description == page["description"], f"{page['file']}: description mismatch")
    check(canon == canonical(page), f"{page['file']}: canonical mismatch")
    check(og_url == canonical(page), f"{page['file']}: og:url mismatch")
    check(bool(og_image and og_image.startswith(BASE + "/")), f"{page['file']}: absolute og:image missing")
    expected_robots = page.get("robots", "noindex,nofollow")
    check(robots == expected_robots, f"{page['file']}: review source robots mismatch")
    check(len(re.findall(r"<h1\b", source, re.I)) == 1, f"{page['file']}: expected exactly one H1")
    check(source.count('name="twitter:card"') == 1, f"{page['file']}: Twitter Card missing or duplicated")
    check(source.count('property="og:title"') == 1, f"{page['file']}: og:title missing or duplicated")
    check(source.count('rel="canonical"') == 1, f"{page['file']}: canonical missing or duplicated")
    if page["indexable"]:
        check(25 <= len(page["title"]) <= 65, f"{page['file']}: title length {len(page['title'])}")
        check(80 <= len(page["description"]) <= 170, f"{page['file']}: description length {len(page['description'])}")
    scripts = re.findall(r'<script\s+type="application/ld\+json">\s*(.*?)\s*</script>', source, re.S | re.I)
    if page["schema"]:
        check(len(scripts) == 1, f"{page['file']}: expected one JSON-LD graph")
        if scripts:
            try:
                data = json.loads(scripts[0])
                graph = data.get("@graph", [])
                page_entities = [x for x in graph if x.get("@type") == "WebPage"]
                check(len(page_entities) == 1, f"{page['file']}: expected one WebPage entity")
                if page_entities:
                    check(page_entities[0].get("url") == canonical(page), f"{page['file']}: WebPage URL mismatch")
                breadcrumbs = [x for x in graph if x.get("@type") == "BreadcrumbList"]
                if canonical(page) == f"{BASE}/":
                    check(not breadcrumbs, f"{page['file']}: home page should not emit BreadcrumbList")
                else:
                    check(len(breadcrumbs) == 1, f"{page['file']}: expected one BreadcrumbList")
                    if breadcrumbs:
                        breadcrumb = breadcrumbs[0]
                        items = breadcrumb.get("itemListElement", [])
                        check(len(items) == 2, f"{page['file']}: breadcrumb must have Home and current page")
                        check([item.get("position") for item in items] == [1, 2], f"{page['file']}: breadcrumb positions invalid")
                        check(all(item.get("name") for item in items), f"{page['file']}: breadcrumb name missing")
                        check(all(item.get("item", "").startswith("https://") for item in items), f"{page['file']}: breadcrumb item URL missing")
                        if len(items) == 2:
                            check(items[0].get("item") == f"{BASE}/", f"{page['file']}: breadcrumb Home URL mismatch")
                            check(items[1].get("item") == canonical(page), f"{page['file']}: breadcrumb current-page URL mismatch")
                        if page_entities:
                            check(page_entities[0].get("breadcrumb", {}).get("@id") == breadcrumb.get("@id"), f"{page['file']}: WebPage breadcrumb reference mismatch")
                forbidden = {"Review", "AggregateRating"}
                check(not any(x.get("@type") in forbidden for x in graph), f"{page['file']}: self-serving review schema found")
                if "article" in page["schema"]:
                    articles = [x for x in graph if x.get("@type") == "Article"]
                    check(len(articles) == 1, f"{page['file']}: expected one Article entity")
                    if articles:
                        article = articles[0]
                        check(article.get("url") == canonical(page), f"{page['file']}: Article URL mismatch")
                        check(article.get("headline") == page["article"]["headline"], f"{page['file']}: Article headline mismatch")
                        check(article.get("datePublished") == page["article"]["datePublished"], f"{page['file']}: Article datePublished mismatch")
                        check(article.get("dateModified") == page["article"]["dateModified"], f"{page['file']}: Article dateModified mismatch")
                        check(article.get("author", {}).get("name") == page["article"]["author"], f"{page['file']}: Article author mismatch")
                        check(article.get("author", {}).get("@type") == page["article"].get("authorType", "Organization"), f"{page['file']}: Article author type mismatch")
                if "faqpage" in page["schema"]:
                    faqpages = [x for x in graph if x.get("@type") == "FAQPage"]
                    check(len(faqpages) == 1, f"{page['file']}: expected one FAQPage entity")
                    if faqpages:
                        actual_faqs = [
                            {
                                "question": item.get("name"),
                                "answer": item.get("acceptedAnswer", {}).get("text"),
                            }
                            for item in faqpages[0].get("mainEntity", [])
                        ]
                        check(actual_faqs == page.get("faqs", []), f"{page['file']}: FAQPage content differs from manifest")
                        text = visible_text(source)
                        for faq in page.get("faqs", []):
                            check(faq["question"] in text, f"{page['file']}: FAQ question not visible: {faq['question']}")
                            check(faq["answer"] in text, f"{page['file']}: FAQ answer not visible: {faq['question']}")
            except json.JSONDecodeError as exc:
                ERRORS.append(f"{page['file']}: invalid JSON-LD: {exc}")
    else:
        check(not scripts, f"{page['file']}: noindex utility/variant page should not contain schema")
    if page["file"] in PARENT_GUIDE_FILES:
        check("—" not in source, f"{page['file']}: body-copy em dash found")
        answer_match = re.search(r'<div class="pg-answer">\s*<p>(.*?)</p>', source, re.S | re.I)
        check(bool(answer_match), f"{page['file']}: direct answer block missing")
        if answer_match:
            words = re.findall(r"\b[\w’'-]+\b", visible_text(answer_match.group(1)))
            check(40 <= len(words) <= 80, f"{page['file']}: direct answer has {len(words)} words, expected 40-80")


def validate_manifest() -> None:
    pages = DATA["pages"]
    files = [p["file"] for p in pages]
    paths = [p["path"] for p in pages]
    titles = [p["title"] for p in pages]
    descriptions = [p["description"] for p in pages]
    check(len(files) == len(set(files)), "manifest: duplicate file")
    check(len(paths) == len(set(paths)), "manifest: duplicate canonical path")
    check(len(titles) == len(set(titles)), "manifest: duplicate title")
    check(len(descriptions) == len(set(descriptions)), "manifest: duplicate description")
    for page in pages:
        canonical_override = page.get("canonical_path")
        if canonical_override is not None:
            check(not page["indexable"], f"{page['file']}: canonical override is only allowed on noindex pages")
            check(canonical_override.startswith("/"), f"{page['file']}: canonical override must be root-relative")
        custom_robots = page.get("robots")
        if custom_robots is not None:
            check(not page["indexable"], f"{page['file']}: custom robots is only allowed on noindex pages")
            check(custom_robots in {"noindex,follow", "noindex,nofollow"}, f"{page['file']}: unsupported custom robots value")
    html_files = {p.name for p in CAMPAIGN.glob("*.html")}
    expected_campaign_files = {p["file"] for p in pages if not p.get("source_file")}
    check(expected_campaign_files == html_files, f"manifest: coverage differs, missing={sorted(html_files-expected_campaign_files)}, extra={sorted(expected_campaign_files-html_files)}")


def validate_sitemap() -> None:
    root = ET.parse(CAMPAIGN / "sitemap.xml").getroot()
    namespace = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    actual = {loc.text for loc in root.findall("s:url/s:loc", namespace) if loc.text}
    expected = {canonical(p) for p in DATA["pages"] if p["indexable"]}
    check(actual == expected, f"sitemap: URL set mismatch, missing={sorted(expected-actual)}, extra={sorted(actual-expected)}")
    check(len(actual) == len(expected), "sitemap: duplicate URLs")


def validate_support_files() -> None:
    robots = (CAMPAIGN / "robots.txt").read_text(encoding="utf-8")
    llms = (CAMPAIGN / "llms.txt").read_text(encoding="utf-8")
    check(f"Sitemap: {BASE}/sitemap.xml" in robots, "robots.txt: sitemap declaration missing")
    for bot in ("ChatGPT-User", "GPTBot", "OAI-SearchBot", "PerplexityBot", "ClaudeBot", "Bingbot"):
        check(f"User-agent: {bot}" in robots, f"robots.txt: {bot} policy missing")
    for path in (
        "/",
        "/training-programs/",
        "/classes-schedule/",
        "/locations/",
        "/coaches/",
        "/about/",
        "/parent-guide/",
        "/parent-guide/how-bjj-builds-life-skills-kids/",
        "/parent-guide/what-age-start-bjj/",
        "/parent-guide/what-tapping-teaches-children/",
        "/parent-guide/what-happens-bjj-class-ages-3-7/",
        "/parent-guide/how-to-choose-kids-bjj-program/",
        "/parent-guide/first-bjj-class-checklist/",
    ):
        check(canonical({"path": path}) in llms, f"llms.txt: priority URL missing: {path}")


def validate_internal_links() -> None:
    for source_path in CAMPAIGN.glob("*.html"):
        source = source_path.read_text(encoding="utf-8")
        for href in re.findall(r'href="([^"]+)"', source, re.I):
            parts = urlsplit(html.unescape(href))
            if parts.scheme or parts.netloc or not parts.path or parts.path.startswith("/"):
                continue
            destination = (source_path.parent / parts.path).resolve()
            check(destination.exists(), f"{source_path.name}: broken internal link {href}")


def main() -> int:
    validate_manifest()
    for page in DATA["pages"]:
        validate_page(page)
    validate_sitemap()
    validate_support_files()
    validate_internal_links()
    if ERRORS:
        print(f"SEO validation FAILED: {len(ERRORS)} issue(s) across {CHECKS} checks")
        for error in ERRORS:
            print(f"- {error}")
        return 1
    print(f"SEO validation PASSED: {CHECKS} checks across {len(DATA['pages'])} pages")
    return 0


if __name__ == "__main__":
    sys.exit(main())
