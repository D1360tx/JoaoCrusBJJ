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
import hashlib
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
CONSENT_STORAGE_KEY = "joao_consent_v2"
LEGACY_CONSENT_STORAGE_KEY = "joao_consent_v1"


def versioned_asset_url(filename: str) -> str:
    """Return a content-versioned URL so deployed privacy controls cannot remain stale."""
    digest = hashlib.sha256((ASSETS / filename).read_bytes()).hexdigest()[:12]
    return f"/assets/{filename}?v={digest}"


CONSENT_POLICY_URL = versioned_asset_url("consent-policy.js")
CONSENT_STYLE_URL = versioned_asset_url("consent-controls.css")
ATTRIBUTION_URL = versioned_asset_url("attribution.js")
CONSENT_CONTROLS_URL = versioned_asset_url("consent-controls.js")
CAMPAIGN_SITE_URL = versioned_asset_url("campaign-site.js")
PROGRAM_FIT_QUIZ_URL = versioned_asset_url("program-fit-quiz.js")
CALL_TRACKING_URL = versioned_asset_url("call-tracking.js")


def version_lead_behavior_scripts(html: str) -> str:
    """Prevent browsers and CDNs from retaining stale lead behavior across releases."""
    replacements = {
        "campaign-site.js": CAMPAIGN_SITE_URL,
        "program-fit-quiz.js": PROGRAM_FIT_QUIZ_URL,
    }
    for filename, versioned in replacements.items():
        pattern = re.compile(
            rf'(?P<prefix><script\b[^>]*\bsrc=["\'])'
            rf'(?:(?:\.\./)|/+)?assets/{re.escape(filename)}(?:\?[^"\']*)?'
            rf'(?P<quote>["\'])',
            re.IGNORECASE,
        )
        html = pattern.sub(
            lambda match: f"{match.group('prefix')}{versioned}{match.group('quote')}",
            html,
        )
    return html

GTM_HEAD_SNIPPET = rf"""<!-- Google Tag Manager -->
    <script src="{CONSENT_POLICY_URL}"></script>
    <script>(function(w,d,s,l,i){{w[l]=w[l]||[];
    var policy=w.JoaoConsentPolicy,choice=policy&&policy.readChoice?policy.readChoice(w,'{CONSENT_STORAGE_KEY}','{LEGACY_CONSENT_STORAGE_KEY}'):'';
    var hasGpc=!!(w.navigator&&w.navigator.globalPrivacyControl===true);
    w.joaoConsentState={{'analytics_storage':'denied','ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied'}};
    w.gtag=w.gtag||function(){{w[l].push(arguments);}};
    w.gtag('consent','default',{{'analytics_storage':'denied','ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','wait_for_update':2000}});
    function safeCampaignValue(v){{v=String(v||'').trim();if(!v||v.length>160||/[\u0000-\u001f\u007f]/.test(v)||/[a-z0-9.!#$%&'*+\/?=^_`{{|}}~-]+@[a-z0-9.-]+\.[a-z]{{2,}}/i.test(v)||/(?:\+?\d[\s().-]*){{7,}}/.test(v))return '';return v;}}
    var safe=null;try{{var u=new URL(w.location.href);safe=new URL(u.origin+u.pathname);
    {json.dumps(['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id', 'campaign_id', 'campaign_name', 'adset_id', 'adset_name', 'ad_id', 'ad_name', 'placement', 'site_source_name', 'gclid', 'fbclid', 'wbraid', 'gbraid', 'msclkid', 'qa', 'gtm_debug', 'gtm_auth', 'gtm_preview', 'gtm_cookies_win'])}.forEach(function(k){{
    if(u.searchParams.has(k)){{var v=safeCampaignValue(u.searchParams.get(k));if(v)safe.searchParams.set(k,v);}}}});
    var routeEnums={{source:{json.dumps(['landing-header', 'landing-hero', 'landing-method', 'landing-programs', 'landing-final', 'landing-mobile', 'practice-under-pressure', 'meta-kids-paid', 'after60-page'])},path:{json.dumps(['child', 'adult', 'after60', 'help', 'undecided'])},embed:{json.dumps(['1'])},start:{json.dumps(['quiz'])}}};
    Object.keys(routeEnums).forEach(function(k){{var v=u.searchParams.get(k);if(routeEnums[k].indexOf(v)!==-1)safe.searchParams.set(k,v);}});
    if(u.pathname+u.search!==safe.pathname+safe.search)w.history.replaceState(w.history.state,'',safe.pathname+safe.search);
    }}catch(e){{}}
    var r='';try{{if(d.referrer){{var ru=new URL(d.referrer);r=ru.origin+'/';}}}}catch(e){{}}
    if(safe){{w.gtag('set',{{'page_location':safe.href,'page_referrer':r}});
    w[l].push({{'page_location':safe.href,'page_referrer':r}});
    if(safe.searchParams.get('qa')==='1'){{w[l].push({{'traffic_type':'internal','debug_mode':true}});}}}}
    function startGtm(){{if(w.joaoGtmStarted)return;w.joaoGtmStarted=true;
    w[l].push({{'gtm.start':new Date().getTime(),event:'gtm.js'}});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);}}
    w.joaoStartGtm=startGtm;
    var lookup=policy&&policy.detectRegion?policy.detectRegion(w.fetch&&w.fetch.bind(w),1500):Promise.resolve({{country:'',policy:'unknown'}});
    w.joaoRegionReady=lookup.then(function(region){{
    region=region||{{country:'',policy:'unknown'}};w.joaoConsentRegion=region;
    var state=policy&&policy.consentState?policy.consentState(choice,region.policy,hasGpc):w.joaoConsentState;
    w.joaoConsentState=state;
    w.gtag('consent','update',state);
    try{{w.dispatchEvent(new CustomEvent('joao:regionready',{{detail:region}}));}}catch(e){{}}
    if(state.analytics_storage==='granted'||state.ad_storage==='granted')startGtm();return region;
    }}).catch(function(){{w.joaoConsentRegion={{country:'',policy:'unknown'}};return w.joaoConsentRegion;}});
    }})(window,document,'script','dataLayer','{GTM_CONTAINER_ID}');</script>
    <!-- End Google Tag Manager -->"""

# This superseded comparison page remains available in Git history and
# RawGitHack previews but is intentionally excluded from production hosting.
EXCLUDED_PAGES = {"about-ai-coaches.html"}
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
    """Install consent UI and attribution capture on every generated route."""
    if "assets/consent-controls.css" not in html:
        html = re.sub(
            r"(</head>)",
            f'    <link rel="stylesheet" href="{CONSENT_STYLE_URL}">\n\\1',
            html,
            count=1,
            flags=re.IGNORECASE,
        )

    scripts = []
    if "assets/attribution.js" not in html:
        scripts.append(f'<script src="{ATTRIBUTION_URL}" defer></script>')
    if "assets/consent-controls.js" not in html:
        scripts.append(f'<script src="{CONSENT_CONTROLS_URL}" defer></script>')
    if not scripts:
        return html

    insertion = "\n    ".join(scripts)
    shared_script = re.compile(
        r'(<script\s+src=["\'](?:(?:\.\./)?assets/campaign-site\.js)["\']\s+defer></script>)',
        re.IGNORECASE,
    )
    if shared_script.search(html):
        return shared_script.sub(f"{insertion}\n    \\1", html, count=1)
    first_deferred_script = re.compile(r'(<script\s+src=["\'][^"\']+["\']\s+defer></script>)', re.IGNORECASE)
    if first_deferred_script.search(html):
        return first_deferred_script.sub(f"{insertion}\n    \\1", html, count=1)
    return re.sub(
        r"(</body>)",
        f"    {insertion}\n  \\1",
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
        lambda match: f"{match.group(1)}\n    {GTM_HEAD_SNIPPET}",
        html,
        count=1,
        flags=re.IGNORECASE,
    )
    return html


def add_call_tracking(html: str) -> str:
    """Install the consent-aware HighLevel number-pool loader on production."""
    if CALL_TRACKING_URL in html:
        return html
    # HighLevel's dynamic-number-insertion matcher recognizes the canonical
    # plain-hyphen display, not the non-breaking hyphen used by some source pages.
    for unswappable in (
        "512\u2011644\u20114560",
        "512&#8209;644&#8209;4560",
        "512&#x2011;644&#x2011;4560",
    ):
        html = html.replace(unswappable, "512-644-4560")
    return re.sub(
        r"(</body>)",
        f'    <script src="{CALL_TRACKING_URL}" defer></script>\n  \\1',
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


SITELINK_LABELS = {
    "/classes-schedule/": "Class Schedule",
    "/coaches/": "Instructors &amp; Coaches",
    "/contact/": "Plan a First Class",
}


def normalize_sitelink_labels(html: str) -> str:
    """Keep priority sitelink wording consistent in global headers and footers."""

    def normalize_region(region_match: re.Match[str]) -> str:
        region = region_match.group(0)
        for href, label in SITELINK_LABELS.items():
            pattern = re.compile(
                rf'(?P<open><a\b[^>]*\bhref=["\']{re.escape(href)}["\'][^>]*>)'
                rf'(?P<label>[^<]*)</a\s*>',
                re.IGNORECASE,
            )
            region = pattern.sub(
                lambda match: f"{match.group('open')}{label}</a>",
                region,
            )
        return region

    return re.sub(
        r"<(?:header|footer)\b[^>]*>.*?</(?:header|footer)>",
        normalize_region,
        html,
        flags=re.IGNORECASE | re.DOTALL,
    )


def qualify_fragment_links(html: str, public_path: str) -> str:
    """Keep same-page anchors on the current route after the root base is injected."""
    route = public_path if public_path.endswith("/") else public_path + "/"
    return re.sub(
        r'(?P<prefix>\bhref\s*=\s*["\'])(?P<fragment>#[^"\']+)(?P<closing>["\'])',
        lambda match: f"{match.group('prefix')}{route}{match.group('fragment')}{match.group('closing')}",
        html,
        flags=re.IGNORECASE,
    )


def apply_robots_directive(html: str, page: dict, production: bool) -> str:
    """Keep review artifacts noindex while making approved production routes indexable."""
    directive = page.get("robots")
    if directive is None:
        directive = (
            "index,follow,max-image-preview:large"
            if production and page["indexable"]
            else "noindex,nofollow"
        )
    replacement = f'<meta name="robots" content="{directive}">'
    if re.search(r'<meta\s+name=["\']robots["\'][^>]*>', html, re.IGNORECASE):
        return re.sub(
            r'<meta\s+name=["\']robots["\'][^>]*>',
            replacement,
            html,
            count=1,
            flags=re.IGNORECASE,
        )
    return re.sub(
        r"(<head(?:\s[^>]*)?>)",
        rf"\1\n    {replacement}",
        html,
        count=1,
        flags=re.IGNORECASE,
    )


def output_path(public_path: str) -> Path:
    if public_path == "/":
        return DIST / "index.html"
    return DIST / public_path.strip("/") / "index.html"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--production",
        action="store_true",
        help="Build the indexable Bluehost artifact with the PHP HighLevel lead endpoint.",
    )
    args = parser.parse_args()
    if args.production and not (BLUEHOST_DEPLOY / "api" / "lead.php").is_file():
        raise SystemExit(
            "Production build blocked: deploy/bluehost/api/lead.php is required before publishing the Program Finder quiz."
        )
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    pages = [page for page in data["pages"] if page["file"] not in EXCLUDED_PAGES]
    routes = {page["file"]: page["path"] for page in pages}
    routes.update(ROUTE_ALIASES)

    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True)
    shutil.copytree(ASSETS, DIST / "assets")

    for page in pages:
        source_path = ROOT / "site" / page["source_file"] if page.get("source_file") else SOURCE / page["file"]
        html = source_path.read_text(encoding="utf-8")
        html = add_base_element(html)
        html = version_lead_behavior_scripts(html)
        html = add_attribution_script(html)
        html = add_google_tag_manager(html)
        html = rewrite_internal_html_links(html, routes)
        html = normalize_sitelink_labels(html)
        html = qualify_fragment_links(html, page["path"])
        html = apply_robots_directive(html, page, args.production)
        if args.production:
            html = add_call_tracking(html)
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
        f"Built {len(pages)} canonical pages and {sum(1 for p in (DIST / 'assets').rglob('*') if p.is_file())} assets into {DIST}"
    )


if __name__ == "__main__":
    main()
