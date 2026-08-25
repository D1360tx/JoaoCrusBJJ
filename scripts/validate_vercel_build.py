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
    routes = {page["path"] for page in pages}
    vercel_config = json.loads((ROOT / "vercel.json").read_text(encoding="utf-8"))

    check(
        "node --test tests/attribution.test.js" in vercel_config.get("buildCommand", ""),
        "Vercel build must execute attribution behavior tests",
    )
    check(
        "tests/program-fit-integration.test.js" in vercel_config.get("buildCommand", ""),
        "Vercel build must execute Program Fit integration tests",
    )
    quiz_source = (ASSETS / "program-fit-quiz.js").read_text(encoding="utf-8")
    check(
        "window.joaoConsentState.analytics_storage !== 'granted'" in quiz_source
        and "window.joaoConsentState.ad_storage !== 'granted'" in quiz_source,
        "Program Fit analytics must discard events until measurement consent is granted",
    )
    check(
        "if (trackedStepCompletions.has(stepNumber)) return false" in quiz_source
        and "if (nextCompletionSignature === completionSignature) return false" in quiz_source,
        "Program Fit analytics must dedupe backtracking and identical submission retries",
    )
    check(
        "if (stepNumber === 1) return answers.audience" in quiz_source
        and "if (stepNumber === 2) return 'not_collected'" in quiz_source
        and "child:${answers.child_count}" not in quiz_source
        and "answers.stage.join" not in quiz_source,
        "Program Fit analytics must exclude child count and age/program-band answers",
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
        lead_endpoint = DIST / "api" / "lead.php"
        check(lead_endpoint.is_file(), "production HighLevel lead endpoint is missing")
        lead_source = lead_endpoint.read_text(encoding="utf-8") if lead_endpoint.is_file() else ""
        check("/contacts/upsert" in lead_source, "production lead endpoint is missing contact upsert")
        check("/opportunities/upsert" in lead_source, "production lead endpoint is missing opportunity upsert")
        check("['Parent or guardian', 'Teen student']" in lead_source and "'role' => $role" in lead_source, "production endpoint must validate and retain Teen form role")
        check("['13', '14', '15', '16', '17']" in lead_source and "'age' => $age" in lead_source, "production endpoint must validate and retain Teen age")
        check("['after-school', 'evening', 'saturday']" in lead_source and "'availability' => implode(', ', $availabilityValues)" in lead_source, "production endpoint must validate and retain Teen schedule availability")
        check("'route_source' => $routeSource" in lead_source and "'route_source' => clean_text($lead['route_source']" in lead_source, "production endpoint must validate and retain quiz route source")
        check("'message' => clean_text($data['message']" in lead_source, "production endpoint must retain inquiry messages")
        contact_builder = lead_source[lead_source.find("function build_contact_payload"):lead_source.find("function build_opportunity_payload")]
        check("'source'" not in contact_builder, "production contact upsert must not overwrite the native acquisition source")
        check("env_value('LEAD_RATE_LIMIT_SALT')" in lead_source and "env_value('LEAD_RATE_LIMIT_SALT'," not in lead_source, "production endpoint must require a deployment-specific rate-limit salt")
        htaccess = (DIST / ".htaccess").read_text(encoding="utf-8")
        redirect_targets = {
            "found-the-flyer": "https://joaocrusbjj.com/practice-under-pressure/",
            "teens-preview": "https://joaocrusbjj.com/teens/",
            "1381-2": "https://joaocrusbjj.com/",
            "free-class": "https://joaocrusbjj.com/contact/",
            "contact-form": "https://joaocrusbjj.com/contact/",
            "wp-booking-calendar": "https://joaocrusbjj.com/contact/",
            "wp-booking-calendar-contact": "https://joaocrusbjj.com/contact/",
            "wp-booking-calendar-time-appointments": "https://joaocrusbjj.com/contact/",
            "wp-booking-calendar-time-slots": "https://joaocrusbjj.com/contact/",
            "wp-booking-calendar-full-day": "https://joaocrusbjj.com/contact/",
            "wpbc-booking-received": "https://joaocrusbjj.com/contact/",
            "blog": "https://joaocrusbjj.com/parent-guide/",
            "category/uncategorized": "https://joaocrusbjj.com/parent-guide/",
        }
        for source, target in redirect_targets.items():
            check(
                f"RewriteRule ^{source}/?$ {target} [R=301,L,NC]" in htaccess,
                f"production redirect missing or incorrect: /{source}/ -> {target}",
            )
        gone_routes = (
            "wpbc-bfb-preview",
            "product/ceremonial-grade-matcha",
            "product/fair-trade-matcha-powder",
            "product/organic-matcha-green-tea",
            "product-category/tea",
            "product-category/organic",
            "product-category/powder",
        )
        for route in gone_routes:
            check(f"RewriteRule ^{route}/?$ - [G,L,NC]" in htaccess, f"production 410 rule missing: /{route}/")
    else:
        check(not (DIST / "api" / "contact.php").exists(), "PHP contact endpoint must not ship in the staging artifact")
        check(not (DIST / "api" / "lead.php").exists(), "PHP HighLevel lead endpoint must not ship in the staging artifact")

    sitemap = (DIST / "sitemap.xml").read_text(encoding="utf-8")
    check("https://joaocrusbjj.com/teens/" in sitemap, "sitemap is missing the canonical Teen page")
    check("teens-preview" not in sitemap, "sitemap still contains the superseded Teen preview route")

    priority_sitelinks = {
        "/classes-schedule/": ("Class Schedule | Joao Crus BJJ", "CLASS SCHEDULE."),
        "/coaches/": ("BJJ Instructors &amp; Coaches | Joao Crus BJJ", "INSTRUCTORS &amp; COACHES."),
        "/contact/": ("Plan a First Class | Joao Crus BJJ", "FIRST&nbsp;CLASS."),
        "/training-programs/": ("Brazilian Jiu-Jitsu Programs | Joao Crus BJJ", "Programs"),
        "/locations/": ("Joao Crus BJJ Locations | Dripping Springs &amp; Austin", "Locations"),
    }
    for path, (title_prefix, visible_signal) in priority_sitelinks.items():
        page_html = route_file(path).read_text(encoding="utf-8")
        check(f"<title>{title_prefix}" in page_html, f"{path}: priority sitelink title signal is missing")
        check(visible_signal in page_html, f"{path}: priority sitelink visible signal is missing")

    global_label_contract = {
        "/classes-schedule/": "Class Schedule",
        "/coaches/": "Instructors & Coaches",
        "/contact/": "Plan a First Class",
    }
    for page in pages:
        if not page["indexable"]:
            continue
        page_html = route_file(page["path"]).read_text(encoding="utf-8")
        global_regions = " ".join(
            re.findall(
                r"<(?:header|footer)\b[^>]*>.*?</(?:header|footer)>",
                page_html,
                re.IGNORECASE | re.DOTALL,
            )
        )
        for href, label in global_label_contract.items():
            if f'href="{href}"' not in global_regions:
                continue
            encoded_label = label.replace("&", "&amp;")
            check(
                re.search(
                    rf'<(?:header|footer)\b.*?<a\b[^>]*href="{re.escape(href)}"[^>]*>{re.escape(encoded_label)}</a>',
                    page_html,
                    re.IGNORECASE | re.DOTALL,
                ) is not None,
                f"{page['path']}: global navigation is missing consistent {label!r} wording",
            )

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
        ("1", "10:30–11:15 AM", "Homeschool Program (Ages 5–8)", "ds"),
        ("1", "11:20 AM–12:10 PM", "Jiu-Jitsu After 60", "ds"),
        ("1", "5:00–5:45 PM", "Kids (Ages 8–12)", "austin"),
        ("2", "5:00–5:45 PM", "Little Champions (Ages 3–7)", "ds"),
        ("2", "5:50–6:35 PM", "Junior Warriors (Ages 8–12)", "ds"),
        ("2", "6:40–7:40 PM", "Adults", "ds"),
        ("3", "10:30–11:15 AM", "Homeschool Program (Ages 5–8)", "ds"),
        ("3", "11:20 AM–12:10 PM", "Jiu-Jitsu After 60", "ds"),
        ("3", "5:00–5:45 PM", "Kids (Ages 8–12)", "austin"),
        ("5", "11:00 AM–12:00 PM", "Adults", "ds"),
    ]
    check(
        calendar_records == expected_calendar_records,
        "shared calendar data does not match Joao's confirmed 2026-08-10 schedule",
    )
    check(
        calendar_source.count('groups: ["homeschool", "kids"]') == 2,
        "homeschool classes must appear in both Homeschool and Kids filters",
    )
    check(
        '{ id: "homeschool", label: "Homeschool Kids 5–8" }' in calendar_source,
        "homeschool program filter label is missing or has the wrong age range",
    )
    check(
        calendar_source.count('groups: ["after60"]') == 2,
        "Jiu-Jitsu After 60 must have exactly two standalone calendar records",
    )
    check(
        '{ id: "after60", label: "Jiu-Jitsu After 60" }' in calendar_source,
        "Jiu-Jitsu After 60 standalone program filter is missing",
    )
    check(
        'groups: ["adults", "after60"]' not in calendar_source,
        "Jiu-Jitsu After 60 must not be silently included in the Adults filter",
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
    quiz_versioned_url = (
        f"/assets/program-fit-quiz.js?v="
        f"{hashlib.sha256((ASSETS / 'program-fit-quiz.js').read_bytes()).hexdigest()[:12]}"
    )
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
    check('window.joaoConsentState.analytics_storage !== "granted" &&' in analytics_source and 'window.joaoConsentState.ad_storage !== "granted"' in analytics_source, "application events must not queue while both analytics and advertising storage are denied")
    check('window.setTimeout(parameters.eventCallback, 0)' in analytics_source, "blocked lead analytics must preserve immediate navigation callbacks")
    check('function clearCookies(pattern)' in consent_source and '/^_fb[pc]$|^_gcl_/' in consent_source, "category withdrawal must clear accessible Google and Meta cookies")
    check("parameters.eventCallback = redirectAfterSuccess" in analytics_source, "lead success event must use a GTM eventCallback before navigation")
    check("parameters.eventTimeout = 1500" in analytics_source, "lead success event must use a bounded eventTimeout")
    check("data.attribution = currentAttribution()" in analytics_source, "lead payload must use current consent-aware non-PII attribution")
    check('formData.getAll("availability").join(", ")' in analytics_source, "Teen schedule availability must retain every selected time window")
    check("data.page = window.location.pathname" in analytics_source, "lead payload must not copy query parameters into the submission page")
    check("window.joaoAttribution || {}" in analytics_source, "lead forms must use the durable attribution module")
    check('var CONSENT_KEY = "joao_consent_v2"' in consent_source and 'var LEGACY_CONSENT_KEY = "joao_consent_v1"' in consent_source, "consent UI must use versioned preferences with safe legacy migration")
    check('window.gtag("consent", "update"' in consent_source, "consent UI must update Google Consent Mode")
    check('window.fbq("consent"' in consent_source and '"grant" : "revoke"' in consent_source, "consent UI must grant or revoke Meta consent")
    check("navigator.globalPrivacyControl === true" in consent_source, "consent UI must honor Global Privacy Control")
    check('class="consent-analytics"' in consent_source and 'class="consent-advertising"' in consent_source, "privacy choices must expose separate analytics and advertising categories")
    check('class="consent-allow"' in consent_source and "advertisingToggle.disabled = true" in consent_source, "GPC must disable advertising while leaving analytics available")
    check('aria-label="Close privacy choices"' in consent_source, "consent dialog needs a labeled close control")
    check("sessionStorage.setItem(DISMISS_KEY, \"1\")" in consent_source and "!consentWasDismissed()" in consent_source, "closing must dismiss the strict-region prompt without granting optional tracking")
    check(".consent-close" in consent_style_source and ".consent-actions .consent-save" in consent_style_source, "consent controls need dedicated scoped styles")
    check('var REGION_ENDPOINT = "https://api.country.is/"' in consent_policy_source, "country-level region lookup endpoint is missing")
    check('"GB", "CH"' in consent_policy_source, "strict-region policy must include the UK and Switzerland")
    check('"IS", "IT", "LI"' in consent_policy_source and '"NO"' in consent_policy_source, "strict-region policy must include the non-EU EEA states")
    check('policy === "standard" ? "all_granted" : "all_denied"' in consent_policy_source, "unknown regions must fail strict while known non-strict regions default analytics and advertising on")
    check("hasGpc === true" in consent_policy_source and "categories.advertising = false" in consent_policy_source, "GPC must override advertising grants")
    check("record.version !== 2" in consent_policy_source and "record.revision" in consent_policy_source, "consent preferences must use validated revisioned v2 records")
    check("highestRevision" in consent_policy_source and "newest.every" in consent_policy_source, "consent stores must reconcile by revision with denial winning equal-revision conflicts")
    check("KNOWN_COUNTRIES.indexOf(normalized) >= 0" in consent_policy_source, "two-letter country responses must be validated against the ISO country allowlist")
    check('payload.ip' not in consent_policy_source, "region policy must not retain the returned IP address")
    check("JoaoAttribution.clear(window)" in consent_source, "full consent withdrawal must clear durable attribution")
    check("policy.saveChoice(window, CONSENT_KEY, consentChoice, LEGACY_CONSENT_KEY)" in consent_source, "consent changes must use a revisioned bootstrap-readable preference with legacy cleanup")
    check("shouldReload && changed && consentPersisted" in consent_source and "window.location.reload()" in consent_source, "category changes must reload only after the preference persists")
    check("policy&&policy.readChoice?policy.readChoice(w" in build_source, "the GTM bootstrap must read the shared fallback-aware consent preference")
    check("consentInvoker.focus()" in consent_source, "consent UI must restore focus to the invoking preference control")
    check('var WINDOW_DAYS = 90' in attribution_source, "attribution must retain a 90-day first-party window")
    check("measurementStorageGranted(context)" in attribution_source, "attribution persistence must be gated by analytics or advertising consent")
    check("sanitizeCampaignValue" in attribution_source and "raw.length > 160" in attribution_source, "campaign attribution must reject PII-bearing and oversized values")
    check('first_touch' in attribution_source and 'last_touch' in attribution_source, "attribution must preserve first and last touch")
    for click_id in ("gclid", "fbclid", "wbraid", "gbraid", "msclkid"):
        check(f'"{click_id}"' in attribution_source, f"attribution must capture {click_id}")
    check("link_text" not in analytics_source, "click analytics must not capture telephone or email link text")
    check("safeCampaignValue" in build_source, "pre-GTM URL sanitization must reject PII-bearing campaign values")
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
    check("Google Ads" in privacy_source and "Meta Pixel" in privacy_source, "privacy policy must disclose advertising providers")
    check("your browser for up to 90 days" in privacy_source, "privacy policy must disclose attribution retention")
    check("EEA), the United Kingdom, and Switzerland" in privacy_source, "privacy policy must disclose strict-region opt-in behavior")
    check("Global Privacy Control" in privacy_source, "privacy policy must disclose GPC handling")
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
        check("w.joaoStartGtm=startGtm" in html and "if(state.analytics_storage==='granted'||state.ad_storage==='granted')startGtm()" in html, f"{page['path']}: GTM must load only while analytics or advertising storage is granted")
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
        if "program-fit-quiz.js" in html:
            check(quiz_versioned_url in html, f"{page['path']}: Program Fit behavior must use its current content-versioned URL")
        lead_behavior_positions = [
            html.find(asset)
            for asset in ("assets/campaign-site.js", "assets/program-fit-landing.js", "assets/program-fit-quiz.js", "assets/meta-kids-landing.js")
            if html.find(asset) >= 0
        ]
        check(
            bool(lead_behavior_positions)
            and html.find("assets/attribution.js") < html.find("assets/consent-controls.js") < min(lead_behavior_positions),
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
        expected_page_robots = page.get("robots")
        if expected_page_robots is None:
            expected_page_robots = (
                "index,follow,max-image-preview:large"
                if args.production and page["indexable"]
                else "noindex,nofollow"
            )
        check(
            f'name="robots" content="{expected_page_robots}"' in html,
            f"{page['path']}: {build_label} robots directive does not match manifest policy",
        )
        if page["path"] == "/teens/":
            visible_preview_terms = ("launch preview", "campaign preview", "preview form", "preview complete")
            check(not any(term in html.lower() for term in visible_preview_terms), "/teens/: visible preview wording remains")
            check("preview-ribbon" not in html, "/teens/: preview ribbon remains")
            check("ai concept" not in html.lower(), "/teens/: AI concept wording remains")
            check("teen-cohort-ai-hero" not in html, "/teens/: legacy AI-labeled asset remains")
            check('data-form-id="teens_interest"' in html, "/teens/: interest form needs a stable analytics ID")
            check('data-lead-type="teen_interest"' in html, "/teens/: interest form needs a teen-specific lead type")
            check('name="consent"' in html, "/teens/: interest form needs contact consent")
        if page["path"] == "/practice-under-pressure/":
            check(
                "PRESSURE IS PART OF LIFE." in html and "PRACTICE WHAT TO DO NEXT." in html,
                "/practice-under-pressure/: approved pressure-response hero is missing",
            )
            check("review-ribbon" not in html, "/practice-under-pressure/: review ribbon remains")
            check("data-video-placeholder" not in html, "/practice-under-pressure/: unrecorded video control remains")
            check("ff-play" not in html, "/practice-under-pressure/: simulated video play control remains")
            check("<dialog" not in html, "/practice-under-pressure/: review video dialog remains")
            check(
                'data-form-id="found_the_flyer_pressure_v2"' in html,
                "/practice-under-pressure/: canonical form needs the stable campaign analytics ID",
            )
            check('data-lead-type="offline_flyer"' in html, "/practice-under-pressure/: offline flyer lead type is missing")
            check('name="consent"' in html, "/practice-under-pressure/: contact consent is missing")
            check('data-success-url="/thank-you/"' in html, "/practice-under-pressure/: success route is missing")
            check(
                'href="/program-finder/quiz/?source=practice-under-pressure&amp;embed=1&amp;start=quiz" data-quiz-route data-quiz-modal' in html,
                "/practice-under-pressure/: primary CTA must open the embedded Program Finder at Question 1",
            )
            check(
                "/assets/program-fit-modal.css" in html and "/assets/program-fit-modal.js" in html,
                "/practice-under-pressure/: quiz modal assets are missing",
            )
            check(
                'href="/practice-under-pressure/#how-it-works"' in html,
                "/practice-under-pressure/: student-practice CTA must target the relevant same-page section",
            )
            check(
                html.count('href="/program-finder/quiz/?source=practice-under-pressure&amp;path=') >= 3,
                "/practice-under-pressure/: program-choice CTAs must route to the Program Finder quiz",
            )
            check(
                'href="#' not in html,
                "/practice-under-pressure/: bare fragment links break under the production base URL",
            )

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
