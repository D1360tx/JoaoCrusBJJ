#!/usr/bin/env python3
"""Plan/execute dispatcher for the single approved Search Console sitemap."""
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
    ProviderError,
    SITEMAP_URL,
    decode_request,
    digest_matches,
    encode_plaintext,
    encrypt_envelope,
    error_envelope,
    load_recipient_key,
    plan_digest,
    quote_path,
    utc_now,
    validate_canonical_url,
    validate_exact_keys,
    validate_property,
    write_result,
)

AAD = b"joao-gsc-sitemap-ops-bridge:v1"
BASE = "https://www.googleapis.com/webmasters/v3"
PLAN_TTL_SECONDS = 600
MAX_PLAN_TTL_SECONDS = 900
ALLOWED_TOOLS = frozenset({
    "plan_sitemap_submit",
    "execute_sitemap_submit",
    "plan_sitemap_delete",
    "execute_sitemap_delete",
})


def _endpoint() -> str:
    return f"{BASE}/sites/{quote_path(PROPERTY)}/sitemaps/{quote_path(SITEMAP_URL)}"


def _iso(value: dt.datetime) -> str:
    return value.astimezone(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _parse_iso(value: Any) -> dt.datetime:
    if not isinstance(value, str) or not value.endswith("Z"):
        raise DispatchError("plan expiration is invalid")
    try:
        parsed = dt.datetime.fromisoformat(value[:-1] + "+00:00")
    except ValueError as exc:
        raise DispatchError("plan expiration is invalid") from exc
    if parsed.microsecond or _iso(parsed) != value:
        raise DispatchError("plan expiration is invalid")
    return parsed


def make_plan(action: str, args: Mapping[str, Any], *, now: dt.datetime) -> dict[str, Any]:
    validate_exact_keys(args, {"site_url", "sitemap_url", "ttl_seconds"})
    validate_property(args.get("site_url"))
    validate_canonical_url(args.get("sitemap_url", SITEMAP_URL), sitemap_only=True)
    ttl = args.get("ttl_seconds", PLAN_TTL_SECONDS)
    if isinstance(ttl, bool) or not isinstance(ttl, int) or not 60 <= ttl <= MAX_PLAN_TTL_SECONDS:
        raise DispatchError("ttl_seconds must be an integer between 60 and 900")
    plan = {
        "schema_version": 1,
        "action": action,
        "site_url": PROPERTY,
        "sitemap_url": SITEMAP_URL,
        "created_at": _iso(now),
        "expires_at": _iso(now + dt.timedelta(seconds=ttl)),
    }
    return {"plan": plan, "plan_hash": plan_digest(plan)}


def validate_plan(action: str, args: Mapping[str, Any], *, now: dt.datetime) -> dict[str, Any]:
    validate_exact_keys(args, {"plan", "plan_hash"}, {"plan", "plan_hash"})
    plan = args["plan"]
    if not isinstance(plan, dict):
        raise DispatchError("plan must be an object")
    validate_exact_keys(
        plan,
        {"schema_version", "action", "site_url", "sitemap_url", "created_at", "expires_at"},
        {"schema_version", "action", "site_url", "sitemap_url", "created_at", "expires_at"},
    )
    if not digest_matches(plan, args["plan_hash"]):
        raise DispatchError("plan_hash does not exactly match the plan")
    if plan["schema_version"] != 1 or plan["action"] != action:
        raise DispatchError("plan action is not allowed")
    validate_property(plan["site_url"])
    validate_canonical_url(plan["sitemap_url"], sitemap_only=True)
    created = _parse_iso(plan["created_at"])
    expires = _parse_iso(plan["expires_at"])
    if expires <= created or (expires - created).total_seconds() > MAX_PLAN_TTL_SECONDS:
        raise DispatchError("plan validity window is not allowed")
    if now < created - dt.timedelta(seconds=30):
        raise DispatchError("plan was created in the future")
    if now >= expires:
        raise DispatchError("plan has expired")
    return plan


def _read_sitemap(client: GscHttpClient) -> dict[str, Any] | None:
    try:
        result = client.request("GET", _endpoint())
    except ProviderError as exc:
        # The bounded provider error deliberately carries the status code.
        if "HTTP 404:" in str(exc):
            return None
        raise
    return result


def execute(action: str, args: Mapping[str, Any], client: GscHttpClient, *, now: dt.datetime) -> dict[str, Any]:
    plan = validate_plan(action, args, now=now)
    before = _read_sitemap(client)
    if action == "submit":
        if before is not None:
            return {"plan_hash": args["plan_hash"], "changed": False, "idempotent_replay": True, "readback": before}
        client.request("PUT", _endpoint())
        after = _read_sitemap(client)
        if after is None:
            raise ProviderError("sitemap submit read-back did not find the approved sitemap")
    else:
        if before is None:
            return {"plan_hash": args["plan_hash"], "changed": False, "idempotent_replay": True, "readback": None}
        client.request("DELETE", _endpoint())
        after = _read_sitemap(client)
        if after is not None:
            raise ProviderError("sitemap delete read-back still found the approved sitemap")
    return {"plan_hash": args["plan_hash"], "changed": True, "idempotent_replay": False, "readback": after, "plan": plan}


def dispatch_request(
    request: Mapping[str, Any], client: GscHttpClient | None = None, *, now: dt.datetime | None = None
) -> dict[str, Any]:
    tool = request["tool"]
    if tool not in ALLOWED_TOOLS:
        raise DispatchError("tool is not allowed")
    current = (now or utc_now()).astimezone(dt.timezone.utc).replace(microsecond=0)
    if tool == "plan_sitemap_submit":
        result = make_plan("submit", request["args"], now=current)
    elif tool == "plan_sitemap_delete":
        result = make_plan("delete", request["args"], now=current)
    else:
        if client is None:
            raise DispatchError("GSC client is required for execute")
        action = "submit" if tool == "execute_sitemap_submit" else "delete"
        result = execute(action, request["args"], client, now=current)
    return {"schema_version": 1, "ok": True, "tool": tool, "result": result}


def validate_workflow_binding(request: Mapping[str, Any], phase: str, idempotency_key: str) -> None:
    expected_phase = "execute" if request["tool"].startswith("execute_") else "plan"
    if phase != expected_phase:
        raise DispatchError("workflow phase does not match the requested tool")
    if expected_phase == "execute":
        supplied_hash = request["args"].get("plan_hash")
        if not isinstance(supplied_hash, str) or idempotency_key != supplied_hash:
            raise DispatchError("workflow idempotency key must exactly match plan_hash")
    elif not idempotency_key or len(idempotency_key.encode("utf-8")) > 128:
        raise DispatchError("plan idempotency key is invalid")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--payload-env", default="GSC_OPS_REQUEST_B64")
    parser.add_argument("--token-env", default="GSC_ACCESS_TOKEN")
    parser.add_argument("--output", type=Path, required=True)
    options = parser.parse_args()
    try:
        request = decode_request(os.environ.get(options.payload_env, ""))
        recipient = load_recipient_key(request["recipient_public_key_pem"])
        validate_workflow_binding(
            request,
            os.environ.get("GSC_EXPECTED_PHASE", ""),
            os.environ.get("GSC_EXPECTED_IDEMPOTENCY_KEY", ""),
        )
    except Exception:
        return 2
    try:
        client = None
        if request["tool"].startswith("execute_"):
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
