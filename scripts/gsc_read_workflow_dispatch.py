#!/usr/bin/env python3
"""Bounded, encrypted, read-only Search Console workflow dispatcher."""
from __future__ import annotations

import argparse
import datetime as dt
import os
from pathlib import Path
from typing import Any, Mapping

from gsc_bridge_common import (
    DispatchError,
    GscHttpClient,
    PROPERTY,
    decode_request,
    encode_plaintext,
    encrypt_envelope,
    error_envelope,
    load_recipient_key,
    quote_path,
    utc_now,
    validate_canonical_url,
    validate_exact_keys,
    validate_property,
    write_result,
)

AAD = b"joao-gsc-readonly-bridge:v1"
BASE = "https://www.googleapis.com/webmasters/v3"
INSPECTION_ENDPOINT = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect"
ALLOWED_TOOLS = frozenset({
    "list_sites",
    "get_site",
    "search_analytics",
    "list_sitemaps",
    "get_sitemap",
    "inspect_indexed_url",
})
ALLOWED_DIMENSIONS = frozenset({"query", "page", "country", "device", "date", "searchAppearance", "hour"})
ALLOWED_SEARCH_TYPES = frozenset({"web", "image", "video", "news", "discover", "googleNews"})
MAX_DATE_RANGE_DAYS = 90
MAX_ROW_LIMIT = 5000
MAX_START_ROW = 25000


def _site_path() -> str:
    return quote_path(PROPERTY)


def _date(value: Any, name: str) -> dt.date:
    if not isinstance(value, str) or len(value) != 10:
        raise DispatchError(f"{name} must be an ISO date")
    try:
        parsed = dt.date.fromisoformat(value)
    except ValueError as exc:
        raise DispatchError(f"{name} must be an ISO date") from exc
    if str(parsed) != value:
        raise DispatchError(f"{name} must be an ISO date")
    return parsed


def validate_search_args(args: Mapping[str, Any], *, today: dt.date) -> dict[str, Any]:
    validate_exact_keys(
        args,
        {"site_url", "start_date", "end_date", "dimensions", "row_limit", "start_row", "data_state", "search_type"},
        {"start_date", "end_date"},
    )
    validate_property(args.get("site_url"))
    start = _date(args["start_date"], "start_date")
    end = _date(args["end_date"], "end_date")
    if start > end or (end - start).days + 1 > MAX_DATE_RANGE_DAYS or end > today:
        raise DispatchError("date range must be ordered, no more than 90 days, and not in the future")
    dimensions = args.get("dimensions", [])
    if (
        not isinstance(dimensions, list)
        or len(dimensions) > 3
        or len(set(dimensions)) != len(dimensions)
        or any(not isinstance(item, str) or item not in ALLOWED_DIMENSIONS for item in dimensions)
    ):
        raise DispatchError("dimensions must contain at most three unique allowed values")
    row_limit = args.get("row_limit", 1000)
    if isinstance(row_limit, bool) or not isinstance(row_limit, int) or not 1 <= row_limit <= MAX_ROW_LIMIT:
        raise DispatchError("row_limit must be an integer between 1 and 5000")
    start_row = args.get("start_row", 0)
    if isinstance(start_row, bool) or not isinstance(start_row, int) or not 0 <= start_row <= MAX_START_ROW:
        raise DispatchError("start_row must be an integer between 0 and 25000")
    data_state = args.get("data_state", "final")
    if data_state not in {"final", "all"}:
        raise DispatchError("data_state is not allowed")
    search_type = args.get("search_type", "web")
    if search_type not in ALLOWED_SEARCH_TYPES:
        raise DispatchError("search_type is not allowed")
    return {
        "startDate": str(start),
        "endDate": str(end),
        "dimensions": dimensions,
        "rowLimit": row_limit,
        "startRow": start_row,
        "dataState": data_state,
        "type": search_type,
    }


def dispatch_request(
    request: Mapping[str, Any], client: GscHttpClient, *, now: dt.datetime | None = None
) -> dict[str, Any]:
    tool = request["tool"]
    if tool not in ALLOWED_TOOLS:
        raise DispatchError("tool is not allowed")
    args = request["args"]
    if tool == "list_sites":
        validate_exact_keys(args, set())
        raw = client.request("GET", f"{BASE}/sites")
        # sites.list is filtered because the service identity may gain unrelated access later.
        entries = [entry for entry in raw.get("siteEntry", []) if isinstance(entry, dict) and entry.get("siteUrl") == PROPERTY]
        result: Any = {"siteEntry": entries}
    elif tool == "get_site":
        validate_exact_keys(args, {"site_url"})
        validate_property(args.get("site_url"))
        result = client.request("GET", f"{BASE}/sites/{_site_path()}")
        if result.get("siteUrl") not in {None, PROPERTY}:
            raise DispatchError("provider returned an unexpected property")
    elif tool == "search_analytics":
        body = validate_search_args(args, today=(now or utc_now()).date())
        result = client.request("POST", f"{BASE}/sites/{_site_path()}/searchAnalytics/query", body)
    elif tool == "list_sitemaps":
        validate_exact_keys(args, {"site_url"})
        validate_property(args.get("site_url"))
        result = client.request("GET", f"{BASE}/sites/{_site_path()}/sitemaps")
    elif tool == "get_sitemap":
        validate_exact_keys(args, {"site_url", "sitemap_url"}, {"sitemap_url"})
        validate_property(args.get("site_url"))
        sitemap = validate_canonical_url(args["sitemap_url"])
        result = client.request("GET", f"{BASE}/sites/{_site_path()}/sitemaps/{quote_path(sitemap)}")
    else:
        validate_exact_keys(args, {"site_url", "inspection_url"}, {"inspection_url"})
        validate_property(args.get("site_url"))
        inspected = validate_canonical_url(args["inspection_url"])
        result = client.request("POST", INSPECTION_ENDPOINT, {"inspectionUrl": inspected, "siteUrl": PROPERTY})
    return {"schema_version": 1, "ok": True, "tool": tool, "result": result}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--payload-env", default="GSC_READ_REQUEST_B64")
    parser.add_argument("--token-env", default="GSC_ACCESS_TOKEN")
    parser.add_argument("--output", type=Path, required=True)
    options = parser.parse_args()
    try:
        request = decode_request(os.environ.get(options.payload_env, ""))
        recipient = load_recipient_key(request["recipient_public_key_pem"])
    except Exception:
        return 2
    try:
        client = GscHttpClient(os.environ.get(options.token_env, ""))
        plaintext = encode_plaintext(dispatch_request(request, client))
    except Exception as exc:
        try:
            plaintext = encode_plaintext(error_envelope(exc))
        except Exception:
            plaintext = encode_plaintext(error_envelope(DispatchError("result could not be serialized safely")))
    write_result(options.output, encrypt_envelope(plaintext, recipient, AAD))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
