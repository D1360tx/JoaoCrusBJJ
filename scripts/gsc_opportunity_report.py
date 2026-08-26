#!/usr/bin/env python3
"""Create a biweekly Google Search Console query-opportunity report.

Inputs are deliberately simple and auditable:
- a Search Console CSV export, or
- the Search Analytics API when a bearer token is supplied through the environment.

The script groups spelling and naming variants, focuses positions 4-20, maps the
ranking page, checks local campaign headings for possible intent overlap, and
recommends optimize/create/review/ignore. It never publishes or edits pages.
"""
from __future__ import annotations

import argparse
import csv
import datetime as dt
import json
import os
import re
import sys
import urllib.parse
import urllib.request
from collections import defaultdict
from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parents[1]
CAMPAIGN = ROOT / "site" / "campaign"
DEFAULT_PROPERTY = "sc-domain:joaocrusbjj.com"

ALIASES = {
    "joão": "joao",
    "cruz": "crus",
    "jiu-jitsu": "bjj",
    "jiu jitsu": "bjj",
    "jiujitsu": "bjj",
    "brazilian jiu-jitsu": "bjj",
    "brazilian jiu jitsu": "bjj",
}
BRAND_TERMS = {"joao", "crus"}
IRRELEVANT_TERMS = {"mma", "ufc", "karate", "taekwondo"}


def normalize_query(value: str) -> str:
    text = value.casefold().strip()
    for old, new in sorted(ALIASES.items(), key=lambda item: -len(item[0])):
        text = text.replace(old, new)
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return " ".join(text.split())


def number(value: str | float | int | None) -> float:
    if value in (None, ""):
        return 0.0
    return float(str(value).replace(",", "").replace("%", ""))


def read_csv(path: Path) -> list[dict]:
    with path.open(encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    normalized = []
    for raw in rows:
        keys = {re.sub(r"[^a-z]", "", key.casefold()): value for key, value in raw.items() if key}
        query = keys.get("query") or keys.get("topqueries") or ""
        page = keys.get("page") or keys.get("toppages") or ""
        if not query:
            continue
        normalized.append({
            "query": query.strip(),
            "page": page.strip(),
            "clicks": number(keys.get("clicks")),
            "impressions": number(keys.get("impressions")),
            "ctr": number(keys.get("ctr")),
            "position": number(keys.get("position") or keys.get("averageposition")),
        })
    return normalized


def fetch_api(property_name: str, start: str, end: str, token: str) -> list[dict]:
    endpoint = "https://www.googleapis.com/webmasters/v3/sites/" + urllib.parse.quote(property_name, safe="") + "/searchAnalytics/query"
    payload = json.dumps({
        "startDate": start,
        "endDate": end,
        "dimensions": ["query", "page"],
        "rowLimit": 25000,
        "dataState": "final",
    }).encode()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    # User ADC may require an explicit quota project. Service-account tokens
    # normally derive quota from their owning project, and sending this header
    # would require an unnecessary serviceusage.services.use IAM grant.
    quota_project = os.environ.get("GSC_QUOTA_PROJECT", "").strip()
    if quota_project:
        headers["x-goog-user-project"] = quota_project
    request = urllib.request.Request(endpoint, data=payload, method="POST", headers=headers)
    with urllib.request.urlopen(request, timeout=45) as response:
        data = json.load(response)
    return [{
        "query": row["keys"][0], "page": row["keys"][1],
        "clicks": row.get("clicks", 0), "impressions": row.get("impressions", 0),
        "ctr": row.get("ctr", 0) * 100, "position": row.get("position", 0),
    } for row in data.get("rows", [])]


def local_intents() -> list[dict]:
    intents = []
    for path in CAMPAIGN.glob("*.html"):
        source = path.read_text(encoding="utf-8")
        title = re.search(r"<title>(.*?)</title>", source, re.I | re.S)
        h1 = re.search(r"<h1\b[^>]*>(.*?)</h1>", source, re.I | re.S)
        visible_h1 = re.sub(r"<[^>]+>", " ", h1.group(1) if h1 else "")
        intents.append({"file": path.name, "text": normalize_query((title.group(1) if title else "") + " " + visible_h1)})
    return intents


def overlap_files(query: str, intents: list[dict]) -> list[str]:
    tokens = {x for x in normalize_query(query).split() if len(x) > 2 and x not in {"the", "for", "near", "and", "texas"}}
    scored = []
    for item in intents:
        score = len(tokens & set(item["text"].split()))
        if score >= 2:
            scored.append((score, item["file"]))
    return [name for _, name in sorted(scored, reverse=True)[:3]]


def recommendation(row: dict, overlaps: list[str]) -> tuple[str, str]:
    words = set(normalize_query(row["query"]).split())
    if words & IRRELEVANT_TERMS:
        return "IGNORE", "Intent does not match a confirmed Joao Crus BJJ offer."
    if BRAND_TERMS <= words:
        return "OPTIMIZE", "Branded query: improve the ranking page and search presentation."
    if row["page"]:
        return "OPTIMIZE", "A page already ranks. Strengthen answer, title, internal links, and CTA before adding a URL."
    if overlaps:
        return "REVIEW", "Possible existing intent owner. Inspect cannibalization before creating a URL."
    return "CREATE", "No ranking page or close local intent owner was found. Validate business relevance before creating."


def aggregate(rows: Iterable[dict]) -> list[dict]:
    groups: dict[str, list[dict]] = defaultdict(list)
    for row in rows:
        if 4 <= row["position"] <= 20 and row["impressions"] > 0:
            groups[normalize_query(row["query"])].append(row)
    results = []
    for key, variants in groups.items():
        impressions = sum(x["impressions"] for x in variants)
        clicks = sum(x["clicks"] for x in variants)
        weighted_position = sum(x["position"] * x["impressions"] for x in variants) / impressions
        pages = sorted({x["page"] for x in variants if x["page"]})
        results.append({
            "group": key,
            "query": max(variants, key=lambda x: x["impressions"])["query"],
            "variants": sorted({x["query"] for x in variants}),
            "clicks": clicks,
            "impressions": impressions,
            "ctr": clicks / impressions * 100,
            "position": weighted_position,
            "page": pages[0] if len(pages) == 1 else "; ".join(pages),
        })
    return sorted(results, key=lambda x: (-x["impressions"], x["position"]))


def report(rows: list[dict], start: str, end: str, source: str) -> str:
    intents = local_intents()
    opportunities = aggregate(rows)
    lines = [
        "# Biweekly GSC Query Opportunity Report", "",
        f"- Window: **{start} to {end}**", f"- Source: `{source}`",
        "- Filter: final Search data, average position **4-20**, impressions > 0", "",
        "## Decision queue", "",
        "| Decision | Query group | Variants | Clicks | Impressions | CTR | Position | Ranking page | Cannibalization check |",
        "|---|---|---|---:|---:|---:|---:|---|---|",
    ]
    if not opportunities:
        lines.append("| REVIEW | No qualifying rows |  | 0 | 0 | 0% |  |  | Confirm export format and date window |")
    for row in opportunities:
        overlaps = overlap_files(row["query"], intents)
        decision, reason = recommendation(row, overlaps)
        overlap = ", ".join(overlaps) if overlaps else "No close local title/H1 match"
        page = row["page"] or "None in input"
        variants = ", ".join(row["variants"])
        lines.append(f"| **{decision}** | {row['group']} | {variants} | {row['clicks']:.0f} | {row['impressions']:.0f} | {row['ctr']:.1f}% | {row['position']:.1f} | {page} | {overlap}. {reason} |")
    lines += ["", "## Required human review", "",
        "1. Confirm the query matches a real program, parent question, or local intent.",
        "2. Open the ranking page and check whether it already satisfies the query.",
        "3. Check GSC page rows for multiple ranking URLs before creating anything.",
        "4. Choose **optimize**, **create**, or **ignore**. This script never publishes automatically.",
        "5. Record the chosen URL and compare clicks, impressions, CTR, and position after indexing.", ""]
    return "\n".join(lines)


def main() -> int:
    today = dt.date.today()
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", type=Path, help="GSC CSV containing Query, Page, Clicks, Impressions, CTR, Position")
    parser.add_argument("--property", default=DEFAULT_PROPERTY)
    parser.add_argument("--start", default=str(today - dt.timedelta(days=30)))
    parser.add_argument("--end", default=str(today - dt.timedelta(days=3)))
    parser.add_argument("--output", type=Path, default=ROOT / "reports" / "gsc" / f"opportunities-{today}.md")
    args = parser.parse_args()
    if args.csv:
        rows, source = read_csv(args.csv), str(args.csv)
    else:
        token = os.environ.get("GSC_ACCESS_TOKEN", "").strip()
        if not token:
            print("ERROR: provide --csv or set GSC_ACCESS_TOKEN for the Search Analytics API.", file=sys.stderr)
            return 2
        rows, source = fetch_api(args.property, args.start, args.end, token), f"Search Analytics API ({args.property})"
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(report(rows, args.start, args.end, source), encoding="utf-8")
    print(f"Wrote {args.output} from {len(rows)} input rows")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
