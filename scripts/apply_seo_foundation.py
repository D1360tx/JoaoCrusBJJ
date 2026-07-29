#!/usr/bin/env python3
"""Apply declarative SEO metadata and JSON-LD to campaign HTML pages.

Preview mode preserves noindex on every page. Production mode changes only
approved indexable pages to index,follow and must be run in a deployment copy,
not directly on a review branch.
"""

from __future__ import annotations

import argparse
import html
import json
import re
from datetime import date
from pathlib import Path
from urllib.parse import urljoin

ROOT = Path(__file__).resolve().parents[1]
CAMPAIGN = ROOT / "site" / "campaign"
MANIFEST = CAMPAIGN / "seo-pages.json"
START = "    <!-- SEO FOUNDATION START -->"
END = "    <!-- SEO FOUNDATION END -->"


def absolute(base: str, path: str) -> str:
    return urljoin(base.rstrip("/") + "/", path.lstrip("/"))


def canonical_path(page: dict) -> str:
    """Return an optional canonical override for private comparison pages."""
    return page.get("canonical_path", page["path"])


def organization(site: dict) -> dict:
    base = site["base_url"].rstrip("/")
    return {
        "@type": "Organization",
        "@id": f"{base}/#organization",
        "name": site["organization_name"],
        "alternateName": site["name"],
        "url": f"{base}/",
        "telephone": site["phone"],
        "foundingDate": site["founded"],
        "logo": {
            "@type": "ImageObject",
            "@id": f"{base}/#logo",
            "url": f"{base}/assets/joao-crus-bjj-logo.png",
        },
        "founder": {"@id": f"{base}/coaches/#joao-crus"},
        "location": [
            {"@id": f"{base}/locations/#dripping-springs"},
            {"@id": f"{base}/austin-brazilian-jiu-jitsu/#location"},
        ],
    }


def website(site: dict) -> dict:
    base = site["base_url"].rstrip("/")
    return {
        "@type": "WebSite",
        "@id": f"{base}/#website",
        "url": f"{base}/",
        "name": site["name"],
        "publisher": {"@id": f"{base}/#organization"},
        "inLanguage": "en-US",
    }


def location_entities(site: dict) -> dict[str, dict]:
    base = site["base_url"].rstrip("/")
    common = {
        "@type": "SportsActivityLocation",
        "parentOrganization": {"@id": f"{base}/#organization"},
        "telephone": site["phone"],
    }
    dripping = {
        **common,
        "@id": f"{base}/locations/#dripping-springs",
        "name": "Joao Crus BJJ - Dripping Springs",
        "url": f"{base}/locations/",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "120 Frog Pond Lane, Suite 200",
            "addressLocality": "Dripping Springs",
            "addressRegion": "TX",
            "postalCode": "78620",
            "addressCountry": "US",
        },
    }
    austin = {
        **common,
        "@id": f"{base}/austin-brazilian-jiu-jitsu/#location",
        "name": "Joao Crus BJJ - Austin",
        "url": f"{base}/austin-brazilian-jiu-jitsu/",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "1112 N Lamar Blvd",
            "addressLocality": "Austin",
            "addressRegion": "TX",
            "postalCode": "78703",
            "addressCountry": "US",
        },
    }
    return {"dripping-springs": dripping, "austin": austin}


def people(site: dict) -> dict[str, dict]:
    base = site["base_url"].rstrip("/")
    rows = {
        "joao-crus": ("Joao Crus", "Founder and head instructor"),
        "justin-nielsen": ("Justin Nielsen", "Brazilian Jiu-Jitsu coach"),
        "kevin-la-barre": ("Kevin La Barre", "Brazilian Jiu-Jitsu coach"),
        "christian-ramirez": ("Christian Ramirez", "Brazilian Jiu-Jitsu coach"),
        "harrison-owens": ("Harrison Owens", "Brazilian Jiu-Jitsu coach"),
    }
    return {
        slug: {
            "@type": "Person",
            "@id": f"{base}/coaches/#{slug}",
            "name": name,
            "jobTitle": role,
            "url": f"{base}/coaches/#{slug}",
            "worksFor": {"@id": f"{base}/#organization"},
        }
        for slug, (name, role) in rows.items()
    }


def article_entity(site: dict, page: dict) -> dict | None:
    """Build an Article entity from page['article'] metadata if present."""
    art = page.get("article")
    if not art:
        return None
    base = site["base_url"].rstrip("/")
    canonical = absolute(base, canonical_path(page))
    image = absolute(base, page["image"])
    author_name = art.get("author", site["organization_name"])
    author_type = art.get("authorType", "Organization")
    if author_type == "Person":
        author = {
            "@type": "Person",
            "@id": f"{base}/coaches/#joao-crus",
            "name": author_name,
        }
    else:
        author = {
            "@type": "Organization",
            "@id": f"{base}/#organization",
            "name": author_name,
        }
    entity: dict = {
        "@type": "Article",
        "@id": f"{canonical}#article",
        "headline": art.get("headline", page["title"]),
        "url": canonical,
        "isPartOf": {"@id": f"{base}/#website"},
        "publisher": {"@id": f"{base}/#organization"},
        "author": author,
        "image": {"@type": "ImageObject", "url": image},
        "inLanguage": "en-US",
    }
    if art.get("datePublished"):
        entity["datePublished"] = art["datePublished"]
    if art.get("dateModified"):
        entity["dateModified"] = art["dateModified"]
    return entity


def faqpage_entity(site: dict, page: dict) -> dict | None:
    """Build a FAQPage entity from page['faqs'] if present and non-empty."""
    faqs = page.get("faqs")
    if not faqs:
        return None
    base = site["base_url"].rstrip("/")
    canonical = absolute(base, canonical_path(page))
    return {
        "@type": "FAQPage",
        "@id": f"{canonical}#faqpage",
        "url": canonical,
        "mainEntity": [
            {
                "@type": "Question",
                "name": faq["question"],
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq["answer"],
                },
            }
            for faq in faqs
        ],
    }


def schema_graph(site: dict, page: dict) -> list[dict]:
    if not page["schema"]:
        return []
    base = site["base_url"].rstrip("/")
    canonical = absolute(base, canonical_path(page))
    image = absolute(base, page["image"])
    flags = set(page["schema"])

    graph: list[dict] = [organization(site), website(site)]

    # Determine WebPage @type: use Article as @type when article flag present
    # but still include a WebPage entity for full-graph completeness
    webpage_type = "WebPage"
    graph.append(
        {
            "@type": webpage_type,
            "@id": f"{canonical}#webpage",
            "url": canonical,
            "name": page["title"],
            "description": page["description"],
            "isPartOf": {"@id": f"{base}/#website"},
            "about": {"@id": f"{base}/#organization"},
            "primaryImageOfPage": {"@type": "ImageObject", "url": image},
            "inLanguage": "en-US",
        }
    )

    # Article entity
    if "article" in flags:
        art = article_entity(site, page)
        if art:
            graph.append(art)

    # FAQPage entity
    if "faqpage" in flags:
        faq = faqpage_entity(site, page)
        if faq:
            graph.append(faq)

    locations = location_entities(site)
    if "locations" in flags:
        graph.extend([locations["dripping-springs"], locations["austin"]])
    if "dripping-springs" in flags:
        graph.append(locations["dripping-springs"])
    if "austin" in flags:
        graph.append(locations["austin"])
    persons = people(site)
    if "joao" in flags:
        graph.append(persons["joao-crus"])
    if "coaches" in flags:
        graph.extend(persons.values())
    return graph


def remove_old_head_tags(source: str) -> str:
    if START in source:
        source = re.sub(
            rf"\n?\s*{re.escape(START.strip())}.*?{re.escape(END.strip())}\n?",
            "\n",
            source,
            flags=re.S,
        )
    patterns = [
        r"\n\s*<link\s+rel=\"canonical\"[^>]*>",
        r"\n\s*<meta\s+property=\"og:[^\"]+\"[^>]*>",
        r"\n\s*<meta\s+name=\"twitter:[^\"]+\"[^>]*>",
    ]
    for pattern in patterns:
        source = re.sub(pattern, "", source, flags=re.S | re.I)
    return source


def apply_page(site: dict, page: dict, mode: str) -> None:
    path = CAMPAIGN / page["file"]
    source = path.read_text(encoding="utf-8")
    source = remove_old_head_tags(source)
    title = html.escape(page["title"], quote=False)
    description = html.escape(page["description"], quote=True)
    source = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", source, count=1, flags=re.S)
    source = re.sub(
        r"<meta\s+name=\"description\"\s+content=\".*?\">",
        f'<meta name="description" content="{description}">',
        source,
        count=1,
        flags=re.S,
    )
    robots = "index,follow,max-image-preview:large" if mode == "production" and page["indexable"] else "noindex,nofollow"
    source = re.sub(
        r"<meta\s+name=\"robots\"\s+content=\".*?\">",
        f'<meta name="robots" content="{robots}">',
        source,
        count=1,
        flags=re.S,
    )
    canonical = absolute(site["base_url"], canonical_path(page))
    image = absolute(site["base_url"], page["image"])
    lines = [
        START,
        f'    <link rel="canonical" href="{canonical}">',
        f'    <meta property="og:title" content="{html.escape(page["title"], quote=True)}">',
        f'    <meta property="og:description" content="{description}">',
        '    <meta property="og:type" content="website">',
        '    <meta property="og:locale" content="en_US">',
        f'    <meta property="og:site_name" content="{html.escape(site["name"], quote=True)}">',
        f'    <meta property="og:url" content="{canonical}">',
        f'    <meta property="og:image" content="{image}">',
        f'    <meta property="og:image:alt" content="{html.escape(page["title"], quote=True)}">',
        '    <meta name="twitter:card" content="summary_large_image">',
        f'    <meta name="twitter:title" content="{html.escape(page["title"], quote=True)}">',
        f'    <meta name="twitter:description" content="{description}">',
        f'    <meta name="twitter:image" content="{image}">',
    ]
    graph = schema_graph(site, page)
    if graph:
        data = json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, separators=(",", ":"))
        lines.extend([
            '    <script type="application/ld+json">',
            f"      {data}",
            "    </script>",
        ])
    lines.append(END)
    block = "\n".join(lines) + "\n"
    source = source.replace('    <link rel="stylesheet"', block + '    <link rel="stylesheet"', 1)
    path.write_text(source, encoding="utf-8")


def write_sitemap(site: dict, pages: list[dict]) -> None:
    base = site["base_url"]
    urls = [absolute(base, p["path"]) for p in pages if p["indexable"]]
    body = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    body.extend(f"  <url><loc>{html.escape(url)}</loc></url>" for url in urls)
    body.append("</urlset>")
    (CAMPAIGN / "sitemap.xml").write_text("\n".join(body) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=("preview", "production"), default="preview")
    args = parser.parse_args()
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    for page in data["pages"]:
        apply_page(data["site"], page, args.mode)
    write_sitemap(data["site"], data["pages"])
    print(f"Applied SEO foundation to {len(data['pages'])} pages in {args.mode} mode")


if __name__ == "__main__":
    main()
