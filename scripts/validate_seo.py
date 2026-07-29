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


def check(ok: bool, message: str) -> None:
    global CHECKS
    CHECKS += 1
    if not ok:
        ERRORS.append(message)


def attr(source: str, pattern: str) -> str | None:
    match = re.search(pattern, source, re.S | re.I)
    return html.unescape(match.group(1).strip()) if match else None


def canonical(page: dict) -> str:
    return urljoin(BASE + "/", page["path"].lstrip("/"))


def validate_page(page: dict) -> None:
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
    check(robots == "noindex,nofollow", f"{page['file']}: review source must remain noindex")
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
                forbidden = {"Review", "AggregateRating"}
                check(not any(x.get("@type") in forbidden for x in graph), f"{page['file']}: self-serving review schema found")
            except json.JSONDecodeError as exc:
                ERRORS.append(f"{page['file']}: invalid JSON-LD: {exc}")
    else:
        check(not scripts, f"{page['file']}: noindex utility/variant page should not contain schema")


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
    html_files = {p.name for p in CAMPAIGN.glob("*.html")}
    check(set(files) == html_files, f"manifest: coverage differs, missing={sorted(html_files-set(files))}, extra={sorted(set(files)-html_files)}")


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
    for path in ("/", "/training-programs/", "/classes-schedule/", "/locations/", "/coaches/", "/about/"):
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
