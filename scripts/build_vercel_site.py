#!/usr/bin/env python3
"""Build the canonical Joao Crus BJJ static site.

Source pages stay flat for commit-pinned RawGitHack review. The Vercel artifact
uses the canonical paths declared in seo-pages.json and rewrites internal HTML
links to those paths without changing the source review files. Pass
``--production`` to add the Bluehost PHP form endpoint and indexable robots file.
"""

from __future__ import annotations

import json
import argparse
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "site" / "campaign"
ASSETS = ROOT / "site" / "assets"
DIST = ROOT / "dist"
MANIFEST = SOURCE / "seo-pages.json"
BLUEHOST_DEPLOY = ROOT / "deploy" / "bluehost"
GTM_CONTAINER_ID = "GTM-596MGPMD"

GTM_HEAD_SNIPPET = f"""<!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){{w[l]=w[l]||[];
    try{{if(new URLSearchParams(w.location.search).get('qa')==='1'){{
    w[l].push({{'traffic_type':'internal','debug_mode':true}});
    }}}}catch(e){{}}
    w[l].push({{'gtm.start':new Date().getTime(),event:'gtm.js'}});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    }})(window,document,'script','dataLayer','{GTM_CONTAINER_ID}');</script>
    <!-- End Google Tag Manager -->"""

GTM_BODY_SNIPPET = f"""<!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id={GTM_CONTAINER_ID}"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->"""

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


def add_attribution_script(html: str) -> str:
    """Load attribution capture before the shared campaign behavior."""
    if "assets/attribution.js" in html:
        return html
    return re.sub(
        r'(<script\s+src=["\']\.\./assets/campaign-site\.js["\']\s+defer></script>)',
        r'<script src="../assets/attribution.js" defer></script>\n    \1',
        html,
        count=1,
        flags=re.IGNORECASE,
    )


def add_google_tag_manager(html: str) -> str:
    """Install the owned GTM container once per generated HTML document."""
    if GTM_CONTAINER_ID in html:
        return html
    html = re.sub(
        r"(<head(?:\s[^>]*)?>)",
        rf"\1\n    {GTM_HEAD_SNIPPET}",
        html,
        count=1,
        flags=re.IGNORECASE,
    )
    return re.sub(
        r"(<body(?:\s[^>]*)?>)",
        rf"\1\n    {GTM_BODY_SNIPPET}",
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
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--production",
        action="store_true",
        help="Build the indexable Bluehost artifact with the PHP contact endpoint.",
    )
    args = parser.parse_args()
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
        html = add_attribution_script(html)
        html = add_google_tag_manager(html)
        html = rewrite_internal_html_links(html, routes)
        target = output_path(page["path"])
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(html, encoding="utf-8")

    for page in EXTRA_PAGES:
        html = page["source"].read_text(encoding="utf-8")
        html = add_base_element(html)
        html = add_attribution_script(html)
        html = add_google_tag_manager(html)
        html = rewrite_internal_html_links(html, routes)
        target = output_path(page["path"])
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(html, encoding="utf-8")

    for support_file in ("llms.txt", "sitemap.xml"):
        shutil.copy2(SOURCE / support_file, DIST / support_file)

    if args.production:
        shutil.copytree(BLUEHOST_DEPLOY, DIST, dirs_exist_ok=True)
        robots = "User-agent: *\nAllow: /\n\nSitemap: https://joaocrusbjj.com/sitemap.xml\n"
    else:
        # Preview builds must stay out of search indexes.
        robots = "User-agent: *\nDisallow: /\n"
    (DIST / "robots.txt").write_text(robots, encoding="utf-8")

    print(
        f"Built {len(pages)} canonical pages, {len(EXTRA_PAGES)} noindex preview page, and {sum(1 for p in (DIST / 'assets').rglob('*') if p.is_file())} assets into {DIST}"
    )


if __name__ == "__main__":
    main()
