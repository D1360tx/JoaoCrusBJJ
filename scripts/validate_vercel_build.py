#!/usr/bin/env python3
"""Validate the generated Vercel static artifact."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "site" / "campaign"
DIST = ROOT / "dist"
DATA = json.loads((SOURCE / "seo-pages.json").read_text(encoding="utf-8"))
EXCLUDED = {"about-ai-coaches.html"}
EXTRA_ROUTES = {"/teens-preview/"}
ERRORS: list[str] = []
CHECKS = 0


def check(condition: bool, message: str) -> None:
    global CHECKS
    CHECKS += 1
    if not condition:
        ERRORS.append(message)


def route_file(path: str) -> Path:
    return DIST / "index.html" if path == "/" else DIST / path.strip("/") / "index.html"


def main() -> None:
    pages = [page for page in DATA["pages"] if page["file"] not in EXCLUDED]
    routes = {page["path"] for page in pages} | EXTRA_ROUTES

    check(DIST.is_dir(), "dist directory is missing")
    check((DIST / "assets").is_dir(), "dist/assets is missing")
    check((DIST / "robots.txt").read_text(encoding="utf-8") == "User-agent: *\nDisallow: /\n", "staging robots.txt must disallow all crawling")
    check(not (DIST / "about-ai-coaches").exists(), "superseded AI comparison route was deployed")

    for page in pages:
        target = route_file(page["path"])
        check(target.is_file(), f"missing route artifact: {page['path']}")
        if not target.is_file():
            continue
        html = target.read_text(encoding="utf-8")
        check('<base href="/">' in html, f"{page['path']}: missing root base element")
        check(f'<link rel="canonical" href="https://joaocrusbjj.com{page["path"]}">' in html, f"{page['path']}: canonical does not match manifest")

        for match in re.finditer(r'\b(?:href|src|action)=["\']([^"\']+)["\']', html, re.IGNORECASE):
            value = match.group(1)
            parsed = urlsplit(value)
            if parsed.scheme or value.startswith(("//", "#", "mailto:", "tel:", "data:")):
                continue
            check(not parsed.path.endswith(".html"), f"{page['path']}: legacy HTML link remains: {value}")
            if parsed.path.startswith("/assets/"):
                check((DIST / parsed.path.lstrip("/")).is_file(), f"{page['path']}: missing asset {parsed.path}")
            elif parsed.path.startswith("/") and parsed.path != "/":
                normalized = parsed.path if parsed.path.endswith("/") else parsed.path + "/"
                check(normalized in routes, f"{page['path']}: unknown internal route {parsed.path}")

    for route in EXTRA_ROUTES:
        target = route_file(route)
        check(target.is_file(), f"missing extra preview route artifact: {route}")
        if target.is_file():
            html = target.read_text(encoding="utf-8")
            check('<base href="/">' in html, f"{route}: missing root base element")
            check('name="robots" content="noindex,nofollow"' in html, f"{route}: preview page must remain noindex")
            for match in re.finditer(r'\b(?:href|action)=["\']([^"\']+)["\']', html, re.IGNORECASE):
                check(not urlsplit(match.group(1)).path.endswith(".html"), f"{route}: legacy HTML link remains: {match.group(1)}")

    source_assets = {path.relative_to(ROOT / "site" / "assets") for path in (ROOT / "site" / "assets").rglob("*") if path.is_file()}
    built_assets = {path.relative_to(DIST / "assets") for path in (DIST / "assets").rglob("*") if path.is_file()}
    check(source_assets == built_assets, "built assets do not exactly match source assets")

    if ERRORS:
        print("Vercel build validation FAILED:")
        for error in ERRORS:
            print(f"- {error}")
        print(f"{len(ERRORS)} errors across {CHECKS} checks")
        sys.exit(1)
    print(f"Vercel build validation PASSED: {CHECKS} checks across {len(routes)} routes")


if __name__ == "__main__":
    main()
