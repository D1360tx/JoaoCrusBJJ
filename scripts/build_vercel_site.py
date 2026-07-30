#!/usr/bin/env python3
"""Build the canonical Joao Crus BJJ static site for Vercel.

Source pages stay flat for commit-pinned RawGitHack review. The Vercel artifact
uses the canonical paths declared in seo-pages.json and rewrites internal HTML
links to those paths without changing the source review files.
"""

from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "site" / "campaign"
ASSETS = ROOT / "site" / "assets"
DIST = ROOT / "dist"
MANIFEST = SOURCE / "seo-pages.json"

# This superseded comparison page remains available in Git history and
# RawGitHack previews but is intentionally excluded from production hosting.
EXCLUDED_PAGES = {"about-ai-coaches.html"}
EXTRA_PAGES = [
    {
        "file": "teens-campaign-ages-13-17.html",
        "path": "/teens-preview/",
        "source": ROOT / "site" / "teens-campaign-ages-13-17.html",
    }
]
ROUTE_ALIASES = {
    "toddlers-campaign-purposeful-play.html": "/little-champions/",
    "youth-campaign-ages-8-12.html": "/youth-bjj/",
}


def add_base_element(html: str) -> str:
    if re.search(r"<base\b", html, re.IGNORECASE):
        return html
    return re.sub(
        r"(<head(?:\s[^>]*)?>)",
        r'\1\n    <base href="/">',
        html,
        count=1,
        flags=re.IGNORECASE,
    )


def rewrite_internal_html_links(html: str, routes: dict[str, str]) -> str:
    for filename, public_path in sorted(routes.items(), key=lambda item: -len(item[0])):
        pattern = re.compile(
            rf'(?P<prefix>\b(?:href|action)\s*=\s*["\'])(?:(?:\.\./)|(?:\./)|(?:campaign/))*{re.escape(filename)}'
            rf'(?P<suffix>[?#][^"\']*)?(?P<closing>["\'])',
            re.IGNORECASE,
        )
        html = pattern.sub(
            lambda match: (
                f"{match.group('prefix')}{public_path}"
                f"{match.group('suffix') or ''}{match.group('closing')}"
            ),
            html,
        )
    return html


def output_path(public_path: str) -> Path:
    if public_path == "/":
        return DIST / "index.html"
    return DIST / public_path.strip("/") / "index.html"


def main() -> None:
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    pages = [page for page in data["pages"] if page["file"] not in EXCLUDED_PAGES]
    routes = {page["file"]: page["path"] for page in pages}
    routes.update({page["file"]: page["path"] for page in EXTRA_PAGES})
    routes.update(ROUTE_ALIASES)

    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True)
    shutil.copytree(ASSETS, DIST / "assets")

    for page in pages:
        source_path = SOURCE / page["file"]
        html = source_path.read_text(encoding="utf-8")
        html = add_base_element(html)
        html = rewrite_internal_html_links(html, routes)
        target = output_path(page["path"])
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(html, encoding="utf-8")

    for page in EXTRA_PAGES:
        html = page["source"].read_text(encoding="utf-8")
        html = add_base_element(html)
        html = rewrite_internal_html_links(html, routes)
        target = output_path(page["path"])
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(html, encoding="utf-8")

    for support_file in ("llms.txt", "sitemap.xml"):
        shutil.copy2(SOURCE / support_file, DIST / support_file)

    # Until the real domain cutover, both the robots file and Vercel's
    # X-Robots-Tag header keep the vercel.app site out of search indexes.
    (DIST / "robots.txt").write_text(
        "User-agent: *\nDisallow: /\n",
        encoding="utf-8",
    )

    print(
        f"Built {len(pages)} canonical pages, {len(EXTRA_PAGES)} noindex preview page, and {sum(1 for p in (DIST / 'assets').rglob('*') if p.is_file())} assets into {DIST}"
    )


if __name__ == "__main__":
    main()
