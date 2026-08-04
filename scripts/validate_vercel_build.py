#!/usr/bin/env python3
"""Validate the generated Vercel static artifact."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "site" / "campaign"
ASSETS = ROOT / "site" / "assets"
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
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--production",
        action="store_true",
        help="Validate the indexable Bluehost production artifact.",
    )
    args = parser.parse_args()
    pages = [page for page in DATA["pages"] if page["file"] not in EXCLUDED]
    routes = {page["path"] for page in pages} | EXTRA_ROUTES
    vercel_config = json.loads((ROOT / "vercel.json").read_text(encoding="utf-8"))

    check(
        "node --test tests/attribution.test.js" in vercel_config.get("buildCommand", ""),
        "Vercel build must execute attribution behavior tests",
    )
    check(DIST.is_dir(), "dist directory is missing")
    check((DIST / "assets").is_dir(), "dist/assets is missing")
    expected_robots = (
        "User-agent: *\nAllow: /\n\nSitemap: https://joaocrusbjj.com/sitemap.xml\n"
        if args.production
        else "User-agent: *\nDisallow: /\n"
    )
    build_label = "production" if args.production else "staging"
    check(
        (DIST / "robots.txt").read_text(encoding="utf-8") == expected_robots,
        f"{build_label} robots.txt does not match the required policy",
    )
    check(not (DIST / "about-ai-coaches").exists(), "superseded AI comparison route was deployed")
    if args.production:
        check((DIST / "api" / "contact.php").is_file(), "production contact endpoint is missing")
    else:
        check(not (DIST / "api" / "contact.php").exists(), "PHP contact endpoint must not ship in the staging artifact")

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
    build_source = (ROOT / "scripts" / "build_vercel_site.py").read_text(encoding="utf-8")
    consent_source = (ROOT / "site" / "assets" / "consent-controls.js").read_text(encoding="utf-8")
    consent_style_source = (ROOT / "site" / "assets" / "consent-controls.css").read_text(encoding="utf-8")
    consent_policy_source = (ROOT / "site" / "assets" / "consent-policy.js").read_text(encoding="utf-8")
    attribution_source = (ROOT / "site" / "assets" / "attribution.js").read_text(encoding="utf-8")
    versioned_assets = {
        filename: f"/assets/{filename}?v={hashlib.sha256((ASSETS / filename).read_bytes()).hexdigest()[:12]}"
        for filename in ("consent-policy.js", "consent-controls.css", "attribution.js", "consent-controls.js")
    }
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
    check('window.joaoConsentState.analytics_storage !== "granted"' in analytics_source, "application analytics must not queue while analytics storage is denied")
    check('window.setTimeout(parameters.eventCallback, 0)' in analytics_source, "blocked lead analytics must preserve immediate navigation callbacks")
    check('function clearAnalyticsCookies()' in consent_source, "analytics withdrawal must clear first-party Google Analytics cookies")
    check("parameters.eventCallback = redirectAfterSuccess" in analytics_source, "lead success event must use a GTM eventCallback before navigation")
    check("parameters.eventTimeout = 1500" in analytics_source, "lead success event must use a bounded eventTimeout")
    check("data.attribution = currentAttribution()" in analytics_source, "lead payload must use current consent-aware non-PII attribution")
    check("data.page = window.location.pathname" in analytics_source, "lead payload must not copy query parameters into the submission page")
    check("window.joaoAttribution || {}" in analytics_source, "lead forms must use the durable attribution module")
    check('var CONSENT_KEY = "joao_consent_v1"' in consent_source, "consent UI must use the shared consent preference key")
    check('window.gtag("consent", "update"' in consent_source, "consent UI must update Google Consent Mode")
    check("navigator.globalPrivacyControl === true" in consent_source, "consent UI must honor Global Privacy Control")
    check('class="consent-allow"' in consent_source and "consentAllow.hidden" not in consent_source, "Allow analytics must remain visible when GPC is present")
    check('aria-label="Close privacy choices"' in consent_source, "consent dialog needs a labeled close control")
    check("sessionStorage.setItem(DISMISS_KEY, \"1\")" in consent_source and "!consentWasDismissed()" in consent_source, "closing must dismiss the strict-region prompt for the current session without granting analytics")
    check(".consent-close" in consent_style_source and ".consent-actions .consent-allow" in consent_style_source, "consent allow and close controls need dedicated scoped styles")
    check('var REGION_ENDPOINT = "https://api.country.is/"' in consent_policy_source, "country-level region lookup endpoint is missing")
    check('"GB", "CH"' in consent_policy_source, "strict-region policy must include the UK and Switzerland")
    check('"IS", "IT", "LI"' in consent_policy_source and '"NO"' in consent_policy_source, "strict-region policy must include the non-EU EEA states")
    check('return policy === "standard" ? "granted" : "denied"' in consent_policy_source, "unknown regions must fail strict while known non-strict regions default analytics on")
    check("KNOWN_COUNTRIES.indexOf(normalized) >= 0" in consent_policy_source, "two-letter country responses must be validated against the ISO country allowlist")
    check('payload.ip' not in consent_policy_source, "region policy must not retain the returned IP address")
    check("JoaoAttribution.clear(window)" in consent_source, "consent withdrawal must clear durable attribution")
    check("policy.saveChoice(window, CONSENT_KEY, consentChoice)" in consent_source, "consent changes must use a bootstrap-readable preference fallback")
    check("shouldReloadWithoutTags && consentPersisted" in consent_source and "window.location.reload()" in consent_source, "withdrawal must reload into a tag-free document only after the denial persists")
    check("policy&&policy.readChoice?policy.readChoice(w" in build_source, "the GTM bootstrap must read the shared fallback-aware consent preference")
    check("consentInvoker.focus()" in consent_source, "consent UI must restore focus to the invoking preference control")
    check('var WINDOW_DAYS = 90' in attribution_source, "attribution must retain a 90-day first-party window")
    check("analyticsStorageGranted(context)" in attribution_source, "attribution persistence must be gated by analytics consent")
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
    check("EEA, the United Kingdom, and Switzerland" in privacy_source, "privacy policy must disclose strict-region opt-in behavior")
    check("country-level region lookup" in privacy_source, "privacy policy must disclose region detection")

    for page in pages:
        target = route_file(page["path"])
        check(target.is_file(), f"missing route artifact: {page['path']}")
        if not target.is_file():
            continue
        html = target.read_text(encoding="utf-8")
        check('<base href="/">' in html, f"{page['path']}: missing root base element")
        check(html.count(GTM_CONTAINER_ID) == 1, f"{page['path']}: GTM must appear only in the consent-gated head loader")
        check("googletagmanager.com/gtm.js?id='+i+dl" in html, f"{page['path']}: missing GTM head loader")
        check("googletagmanager.com/ns.html" not in html, f"{page['path']}: ungated GTM noscript fallback must be absent")
        check("w.gtag('consent','default'" in html, f"{page['path']}: Consent Mode default is missing")
        check(html.find("w.gtag('consent','default'") < html.find("'gtm.start'"), f"{page['path']}: consent default must execute before GTM")
        check("'analytics_storage':'denied'" in html, f"{page['path']}: analytics must fail strict until the region policy resolves")
        for denied_type in ("ad_storage", "ad_user_data", "ad_personalization"):
            check(f"'{denied_type}':'denied'" in html, f"{page['path']}: {denied_type} must default to denied")
        check(f'<script src="{versioned_assets["consent-policy.js"]}"></script>' in html, f"{page['path']}: content-versioned regional consent policy must load before GTM")
        check(html.find("assets/consent-policy.js") < html.find("w.gtag('consent','default'"), f"{page['path']}: regional policy must load before the Consent Mode bootstrap")
        check("policy.detectRegion" in html and "w.joaoRegionReady=lookup.then" in html, f"{page['path']}: GTM must wait for region resolution")
        check("w.joaoStartGtm=startGtm" in html and "if(analytics==='granted')startGtm()" in html, f"{page['path']}: GTM must load only while analytics is granted")
        check("get('qa')==='1'" in html, f"{page['path']}: missing explicit QA traffic marker")
        check("'traffic_type':'internal'" in html, f"{page['path']}: QA traffic must be marked internal")
        check("'page_location':safe.href" in html, f"{page['path']}: GA4 page location must use the allowlisted URL")
        check("'page_referrer':r" in html, f"{page['path']}: GA4 page referrer must use the origin-only value")
        check("w.gtag('set',{'page_location':safe.href,'page_referrer':r})" in html, f"{page['path']}: sanitized GA4 page fields must be applied through gtag set")
        check(html.find("w.gtag('set',{'page_location':safe.href") < html.find("'gtm.start'"), f"{page['path']}: sanitized GA4 page fields must be set before GTM")
        check("history.replaceState" in html, f"{page['path']}: unsafe query parameters must be removed before GTM loads")
        check('"gtm_debug"' in html, f"{page['path']}: Tag Assistant preview parameters must survive URL sanitization")
        check("assets/attribution.js" in html, f"{page['path']}: durable attribution script is missing")
        check("assets/consent-controls.js" in html, f"{page['path']}: consent control script is missing")
        check("assets/consent-controls.css" in html, f"{page['path']}: consent control styles are missing")
        for filename, url in versioned_assets.items():
            check(url in html, f"{page['path']}: {filename} must use its current content-versioned URL")
        check(
            html.find("assets/attribution.js") < html.find("assets/consent-controls.js") < html.find("assets/campaign-site.js"),
            f"{page['path']}: attribution and consent controls must load before lead-form behavior",
        )
        canonical_url = f'https://joaocrusbjj.com{page["path"]}'
        check(f'<link rel="canonical" href="{canonical_url}">' in html, f"{page['path']}: canonical does not match manifest")
        schema_scripts = re.findall(r'<script\s+type="application/ld\+json">\s*(.*?)\s*</script>', html, re.DOTALL | re.IGNORECASE)
        if page["schema"]:
            check(len(schema_scripts) == 1, f"{page['path']}: expected one JSON-LD graph")
            if schema_scripts:
                try:
                    graph = json.loads(schema_scripts[0]).get("@graph", [])
                    breadcrumbs = [entity for entity in graph if entity.get("@type") == "BreadcrumbList"]
                    if page["path"] == "/":
                        check(not breadcrumbs, f"{page['path']}: home page should not emit BreadcrumbList")
                    else:
                        check(len(breadcrumbs) == 1, f"{page['path']}: expected one BreadcrumbList")
                        if breadcrumbs:
                            items = breadcrumbs[0].get("itemListElement", [])
                            check([item.get("position") for item in items] == [1, 2], f"{page['path']}: breadcrumb positions invalid")
                            check(all(item.get("name") and item.get("item") for item in items), f"{page['path']}: breadcrumb ListItem is missing name or item")
                            if len(items) == 2:
                                check(items[0].get("item") == "https://joaocrusbjj.com/", f"{page['path']}: breadcrumb Home URL mismatch")
                                check(items[1].get("item") == canonical_url, f"{page['path']}: breadcrumb current-page URL mismatch")
                except json.JSONDecodeError as exc:
                    check(False, f"{page['path']}: invalid JSON-LD: {exc}")
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
            check(html.count(GTM_CONTAINER_ID) == 1, f"{route}: GTM must appear only in the consent-gated head loader")
            check("w.gtag('consent','default'" in html, f"{route}: Consent Mode default is missing")
            check(html.find("w.gtag('consent','default'") < html.find("'gtm.start'"), f"{route}: consent default must execute before GTM")
            check("w.gtag('set',{'page_location':safe.href,'page_referrer':r})" in html, f"{route}: sanitized GA4 page fields must be applied through gtag set")
            check("assets/attribution.js" in html, f"{route}: durable attribution script is missing")
            check("assets/consent-controls.js" in html, f"{route}: consent control script is missing")
            check("assets/consent-controls.css" in html, f"{route}: consent control styles are missing")
            for filename, url in versioned_assets.items():
                check(url in html, f"{route}: {filename} must use its current content-versioned URL")
            check(html.find("assets/attribution.js") < html.find("assets/consent-controls.js"), f"{route}: attribution must load before consent controls")
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
