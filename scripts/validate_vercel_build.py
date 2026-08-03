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
GTM_CONTAINER_ID = "GTM-596MGPMD"
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
    vercel_config = json.loads((ROOT / "vercel.json").read_text(encoding="utf-8"))

    check(
        "node --test tests/attribution.test.js" in vercel_config.get("buildCommand", ""),
        "Vercel build must execute attribution behavior tests",
    )
    check(DIST.is_dir(), "dist directory is missing")
    check((DIST / "assets").is_dir(), "dist/assets is missing")
    check((DIST / "robots.txt").read_text(encoding="utf-8") == "User-agent: *\nDisallow: /\n", "staging robots.txt must disallow all crawling")
    check(not (DIST / "about-ai-coaches").exists(), "superseded AI comparison route was deployed")

    calendar_source = (ROOT / "site" / "assets" / "class-calendar.js").read_text(encoding="utf-8")
    calendar_records = re.findall(
        r'\{\s*day:\s*(\d+),\s*time:\s*"([^"]+)",\s*name:\s*"([^"]+)".*?location:\s*"([^"]+)",\s*\}',
        calendar_source,
        re.DOTALL,
    )
    expected_calendar_records = [
        ("0", "5:00–5:45 PM", "Little Champions (Ages 3–7)", "ds"),
        ("0", "5:50–6:35 PM", "Junior Warriors (Ages 8–12)", "ds"),
        ("0", "6:40–7:40 PM", "Adults", "ds"),
        ("1", "5:00–5:45 PM", "Kids (Ages 8–12)", "austin"),
        ("2", "5:00–5:45 PM", "Little Champions (Ages 3–7)", "ds"),
        ("2", "5:50–6:35 PM", "Junior Warriors (Ages 8–12)", "ds"),
        ("2", "6:40–7:40 PM", "Adults", "ds"),
        ("3", "5:00–5:45 PM", "Kids (Ages 8–12)", "austin"),
        ("5", "11:00 AM–12:00 PM", "Adults", "ds"),
    ]
    check(
        calendar_records == expected_calendar_records,
        "shared calendar data does not match Joao's confirmed 2026-07-31 schedule",
    )

    analytics_source = (ROOT / "site" / "assets" / "campaign-site.js").read_text(encoding="utf-8")
    attribution_source = (ROOT / "site" / "assets" / "attribution.js").read_text(encoding="utf-8")
    for event_name in (
        "lead_submit_success",
        "guide_request_success",
        "lead_submit_error",
        "booking_start",
        "click_to_call",
        "click_to_email",
        "get_directions",
    ):
        check(f'pushAnalytics("{event_name}"' in analytics_source, f"missing analytics event contract: {event_name}")
    check("parameters.eventCallback = redirectAfterSuccess" in analytics_source, "lead success event must use a GTM eventCallback before navigation")
    check("parameters.eventTimeout = 1500" in analytics_source, "lead success event must use a bounded eventTimeout")
    check("data.attribution = attribution" in analytics_source, "lead payload must preserve non-PII attribution")
    check("data.page = window.location.pathname" in analytics_source, "lead payload must not copy query parameters into the submission page")
    check("window.joaoAttribution || {}" in analytics_source, "lead forms must use the durable attribution module")
    check('var WINDOW_DAYS = 90' in attribution_source, "attribution must retain a 90-day first-party window")
    check('first_touch' in attribution_source and 'last_touch' in attribution_source, "attribution must preserve first and last touch")
    for click_id in ("gclid", "fbclid", "wbraid", "gbraid", "msclkid"):
        check(f'"{click_id}"' in attribution_source, f"attribution must capture {click_id}")
    analytics_parameters = re.search(
        r"function leadAnalyticsParameters\(form, data\) \{(?P<body>.*?)\n    \}",
        analytics_source,
        re.DOTALL,
    )
    check(analytics_parameters is not None, "lead analytics parameter builder is missing")
    if analytics_parameters is not None:
        unsafe = re.search(r"data\.(?:name|email|phone|age|message)\b", analytics_parameters.group("body"))
        check(unsafe is None, "PII field referenced by lead analytics parameter builder")

    home_source = (SOURCE / "index.html").read_text(encoding="utf-8")
    check('data-form-id="home_guide"' in home_source, "homepage guide form needs a stable analytics ID")
    check('data-lead-type="guide"' in home_source, "homepage guide form must not count as a class lead")
    check('data-success-url="/parent-guide/"' in home_source, "homepage guide request must deliver the public guide")
    privacy_source = (SOURCE / "privacy.html").read_text(encoding="utf-8")
    check("Google Analytics 4" in privacy_source, "privacy policy must disclose GA4")
    check("your browser for up to 90 days" in privacy_source, "privacy policy must disclose attribution retention")

    for page in pages:
        target = route_file(page["path"])
        check(target.is_file(), f"missing route artifact: {page['path']}")
        if not target.is_file():
            continue
        html = target.read_text(encoding="utf-8")
        check('<base href="/">' in html, f"{page['path']}: missing root base element")
        check(html.count(GTM_CONTAINER_ID) == 2, f"{page['path']}: GTM must appear once in the head and once in the noscript fallback")
        check("googletagmanager.com/gtm.js?id='+i+dl" in html, f"{page['path']}: missing GTM head loader")
        check(f"googletagmanager.com/ns.html?id={GTM_CONTAINER_ID}" in html, f"{page['path']}: missing GTM noscript fallback")
        check("get('qa')==='1'" in html, f"{page['path']}: missing explicit QA traffic marker")
        check("'traffic_type':'internal'" in html, f"{page['path']}: QA traffic must be marked internal")
        check("'page_location':safe.href" in html, f"{page['path']}: GA4 page location must use the allowlisted URL")
        check("'page_referrer':r" in html, f"{page['path']}: GA4 page referrer must use the origin-only value")
        check("history.replaceState" in html, f"{page['path']}: unsafe query parameters must be removed before GTM loads")
        check('"gtm_debug"' in html, f"{page['path']}: Tag Assistant preview parameters must survive URL sanitization")
        check("assets/attribution.js" in html, f"{page['path']}: durable attribution script is missing")
        check(
            html.find("assets/attribution.js") < html.find("assets/campaign-site.js"),
            f"{page['path']}: attribution must load before lead-form behavior",
        )
        check(f'<link rel="canonical" href="https://joaocrusbjj.com{page["path"]}">' in html, f"{page['path']}: canonical does not match manifest")
        if page.get("robots"):
            check(f'name="robots" content="{page["robots"]}"' in html, f"{page['path']}: custom robots directive does not match manifest")

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
            check(html.count(GTM_CONTAINER_ID) == 2, f"{route}: GTM must appear once in the head and once in the noscript fallback")
            check("'traffic_type':'internal'" in html, f"{route}: QA traffic must be marked internal")
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
