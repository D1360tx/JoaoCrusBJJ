#!/usr/bin/env python3
from __future__ import annotations

import base64
import datetime as dt
import importlib
import json
import re
import sys
import unittest
from pathlib import Path
from typing import Any

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
common = importlib.import_module("gsc_bridge_common")
read = importlib.import_module("gsc_read_workflow_dispatch")
ops = importlib.import_module("gsc_sitemap_ops_workflow_dispatch")
NOW = dt.datetime(2026, 8, 26, 20, 0, 0, tzinfo=dt.timezone.utc)


class FakeClient:
    def __init__(self, responses: list[object] | None = None) -> None:
        self.responses = list(responses or [])
        self.calls: list[tuple[str, str, Any]] = []

    def request(self, method: str, url: str, body=None):
        self.calls.append((method, url, body))
        if not self.responses:
            return {}
        result = self.responses.pop(0)
        if isinstance(result, Exception):
            raise result
        return result


def request(tool: str, args: dict) -> dict:
    return {"tool": tool, "args": args, "recipient_public_key_pem": "unused in direct dispatch"}


def plan(action: str = "submit", ttl: Any = 600) -> dict:
    tool = f"plan_sitemap_{action}"
    return ops.dispatch_request(request(tool, {"ttl_seconds": ttl}), now=NOW)["result"]


class GscOperationalBridgeTests(unittest.TestCase):
    def test_read_allowlist_is_exact_and_excludes_mutations(self) -> None:
        self.assertEqual(
            read.ALLOWED_TOOLS,
            {"list_sites", "get_site", "search_analytics", "list_sitemaps", "get_sitemap", "inspect_indexed_url"},
        )
        for forbidden in ("add_site", "delete_site", "request_indexing", "sites.add", "sites.delete"):
            with self.assertRaisesRegex(common.DispatchError, "not allowed"):
                read.dispatch_request(request(forbidden, {}), FakeClient(), now=NOW)

    def test_list_sites_filters_every_property_except_the_domain_property(self) -> None:
        client = FakeClient([{"siteEntry": [
            {"siteUrl": common.PROPERTY, "permissionLevel": "siteRestrictedUser"},
            {"siteUrl": "sc-domain:other.example", "permissionLevel": "siteOwner"},
        ]}])
        result = read.dispatch_request(request("list_sites", {}), client, now=NOW)
        self.assertEqual(result["result"]["siteEntry"], [{"siteUrl": common.PROPERTY, "permissionLevel": "siteRestrictedUser"}])

    def test_property_is_forced_and_path_is_fully_escaped(self) -> None:
        client = FakeClient([{"siteUrl": common.PROPERTY}])
        read.dispatch_request(request("get_site", {}), client, now=NOW)
        self.assertEqual(client.calls[0][1], "https://www.googleapis.com/webmasters/v3/sites/sc-domain%3Ajoaocrusbjj.com")
        with self.assertRaisesRegex(common.DispatchError, "site_url"):
            read.dispatch_request(request("get_site", {"site_url": "https://joaocrusbjj.com/"}), FakeClient(), now=NOW)

    def test_sitemap_feed_path_escapes_spaces_query_delimiters_and_dot_segments(self) -> None:
        value = "https://joaocrusbjj.com/a b.xml?next=../private&x=1"
        client = FakeClient([{}])
        read.dispatch_request(request("get_sitemap", {"sitemap_url": value}), client, now=NOW)
        endpoint = client.calls[0][1]
        self.assertTrue(endpoint.endswith(common.quote_path(value)))
        self.assertNotIn("a b", endpoint)
        self.assertNotIn("../private", endpoint)

    def test_url_validation_rejects_origin_confusion_paths_ports_and_fragments(self) -> None:
        invalid = [
            "http://joaocrusbjj.com/a",
            "https://www.joaocrusbjj.com/a",
            "https://joaocrusbjj.com.evil.test/a",
            "https://joaocrusbjj.com@evil.test/a",
            "https://joaocrusbjj.com:443/a",
            "https://joaocrusbjj.com/a#fragment",
            "https://joaocrusbjj.com\\@evil.test/a",
        ]
        for value in invalid:
            with self.subTest(value=value), self.assertRaisesRegex(common.DispatchError, "not allowed"):
                common.validate_canonical_url(value)
        self.assertEqual(common.validate_canonical_url("https://joaocrusbjj.com/a?x=1"), "https://joaocrusbjj.com/a?x=1")

    def test_index_inspection_is_exact_https_host_and_property(self) -> None:
        client = FakeClient([{"inspectionResult": {"indexStatusResult": {"verdict": "PASS"}}}])
        read.dispatch_request(request("inspect_indexed_url", {"inspection_url": "https://joaocrusbjj.com/kids/?x=1"}), client, now=NOW)
        self.assertEqual(client.calls[0], (
            "POST",
            read.INSPECTION_ENDPOINT,
            {"inspectionUrl": "https://joaocrusbjj.com/kids/?x=1", "siteUrl": common.PROPERTY},
        ))

    def test_search_analytics_has_bounded_dates_dimensions_and_rows(self) -> None:
        args = {"start_date": "2026-08-01", "end_date": "2026-08-26", "dimensions": ["query", "page"], "row_limit": 5000}
        client = FakeClient([{"rows": []}])
        read.dispatch_request(request("search_analytics", args), client, now=NOW)
        self.assertEqual(client.calls[0][2]["rowLimit"], 5000)
        invalid = [
            dict(args, start_date="2026-01-01"),
            dict(args, end_date="2026-08-27"),
            dict(args, row_limit=5001),
            dict(args, dimensions=["query", "page", "date", "country"]),
            dict(args, dimensions=["query", "unknown"]),
            dict(args, start_row=-1),
        ]
        for item in invalid:
            with self.subTest(item=item), self.assertRaises(common.DispatchError):
                read.dispatch_request(request("search_analytics", item), FakeClient(), now=NOW)

    def test_redirect_handler_fails_closed_without_forwarding(self) -> None:
        handler = common.NoRedirectHandler()
        with self.assertRaisesRegex(common.ProviderError, "redirect refused"):
            handler.redirect_request(None, None, 302, "Found", {}, "https://evil.test/token")

    def test_http_client_rejects_non_google_endpoint_before_open(self) -> None:
        class NeverOpen:
            def open(self, *args, **kwargs):
                raise AssertionError("network should not be reached")
        client = common.GscHttpClient("secret", opener=NeverOpen())
        with self.assertRaisesRegex(common.DispatchError, "endpoint"):
            client.request("GET", "https://evil.test/")

    def test_ops_allowlist_is_exact_and_target_is_single_sitemap(self) -> None:
        self.assertEqual(ops.ALLOWED_TOOLS, {
            "plan_sitemap_submit", "execute_sitemap_submit", "plan_sitemap_delete", "execute_sitemap_delete"
        })
        for value in ("https://joaocrusbjj.com/other.xml", "https://www.joaocrusbjj.com/sitemap.xml"):
            with self.assertRaisesRegex(common.DispatchError, "(?:sitemap )?URL is not allowed"):
                ops.dispatch_request(request("plan_sitemap_submit", {"sitemap_url": value}), now=NOW)

    def test_plan_is_pure_deterministic_and_has_expiring_digest(self) -> None:
        first = plan()
        second = plan()
        self.assertEqual(first, second)
        self.assertEqual(first["plan_hash"], common.plan_digest(first["plan"]))
        self.assertEqual(first["plan"]["expires_at"], "2026-08-26T20:10:00Z")
        self.assertEqual(len(first["plan_hash"]), 64)

    def test_plan_ttl_is_bounded(self) -> None:
        for ttl in (0, 59, 901, True, "600"):
            with self.subTest(ttl=ttl), self.assertRaisesRegex(common.DispatchError, "ttl_seconds"):
                plan(ttl=ttl)

    def test_execute_requires_exact_digest_and_rejects_tampering(self) -> None:
        generated = plan()
        bad = dict(generated["plan"])
        bad["sitemap_url"] = "https://joaocrusbjj.com/other.xml"
        with self.assertRaisesRegex(common.DispatchError, "plan_hash"):
            ops.dispatch_request(request("execute_sitemap_submit", {"plan": bad, "plan_hash": generated["plan_hash"]}), FakeClient(), now=NOW)
        with self.assertRaisesRegex(common.DispatchError, "plan_hash"):
            ops.dispatch_request(request("execute_sitemap_submit", {"plan": generated["plan"], "plan_hash": generated["plan_hash"].upper()}), FakeClient(), now=NOW)

    def test_execute_rejects_expired_future_and_overlong_plans(self) -> None:
        generated = plan()
        args = {"plan": generated["plan"], "plan_hash": generated["plan_hash"]}
        with self.assertRaisesRegex(common.DispatchError, "expired"):
            ops.dispatch_request(request("execute_sitemap_submit", args), FakeClient(), now=NOW + dt.timedelta(minutes=10))
        with self.assertRaisesRegex(common.DispatchError, "future"):
            ops.dispatch_request(request("execute_sitemap_submit", args), FakeClient(), now=NOW - dt.timedelta(minutes=1))
        altered = dict(generated["plan"], expires_at="2026-08-26T20:20:00Z")
        with self.assertRaisesRegex(common.DispatchError, "window"):
            ops.dispatch_request(request("execute_sitemap_submit", {"plan": altered, "plan_hash": common.plan_digest(altered)}), FakeClient(), now=NOW)

    def test_submit_rechecks_mutates_once_and_reads_back(self) -> None:
        generated = plan("submit")
        missing = common.ProviderError("Google API HTTP 404: not found")
        after = {"path": common.SITEMAP_URL, "isPending": True}
        client = FakeClient([missing, {}, after])
        result = ops.dispatch_request(request("execute_sitemap_submit", {"plan": generated["plan"], "plan_hash": generated["plan_hash"]}), client, now=NOW)
        self.assertTrue(result["result"]["changed"])
        self.assertEqual([call[0] for call in client.calls], ["GET", "PUT", "GET"])
        self.assertEqual(client.calls[1][1], ops._endpoint())

    def test_submit_replay_is_idempotent_and_never_writes(self) -> None:
        generated = plan("submit")
        existing = {"path": common.SITEMAP_URL}
        client = FakeClient([existing])
        result = ops.dispatch_request(request("execute_sitemap_submit", {"plan": generated["plan"], "plan_hash": generated["plan_hash"]}), client, now=NOW)
        self.assertFalse(result["result"]["changed"])
        self.assertTrue(result["result"]["idempotent_replay"])
        self.assertEqual([call[0] for call in client.calls], ["GET"])

    def test_delete_rechecks_mutates_once_and_confirms_absence(self) -> None:
        generated = plan("delete")
        missing = common.ProviderError("Google API HTTP 404: not found")
        client = FakeClient([{"path": common.SITEMAP_URL}, {}, missing])
        result = ops.dispatch_request(request("execute_sitemap_delete", {"plan": generated["plan"], "plan_hash": generated["plan_hash"]}), client, now=NOW)
        self.assertTrue(result["result"]["changed"])
        self.assertEqual([call[0] for call in client.calls], ["GET", "DELETE", "GET"])

    def test_delete_replay_is_idempotent_when_already_absent(self) -> None:
        generated = plan("delete")
        client = FakeClient([common.ProviderError("Google API HTTP 404: not found")])
        result = ops.dispatch_request(request("execute_sitemap_delete", {"plan": generated["plan"], "plan_hash": generated["plan_hash"]}), client, now=NOW)
        self.assertTrue(result["result"]["idempotent_replay"])
        self.assertEqual([call[0] for call in client.calls], ["GET"])

    def test_failed_readback_is_a_hard_error(self) -> None:
        generated = plan("submit")
        missing = common.ProviderError("Google API HTTP 404: not found")
        client = FakeClient([missing, {}, missing])
        with self.assertRaisesRegex(common.ProviderError, "read-back"):
            ops.dispatch_request(request("execute_sitemap_submit", {"plan": generated["plan"], "plan_hash": generated["plan_hash"]}), client, now=NOW)

    def test_workflow_phase_and_concurrency_key_bind_execution_hash(self) -> None:
        generated = plan()
        execute_request = request("execute_sitemap_submit", {"plan": generated["plan"], "plan_hash": generated["plan_hash"]})
        ops.validate_workflow_binding(execute_request, "execute", generated["plan_hash"])
        with self.assertRaisesRegex(common.DispatchError, "phase"):
            ops.validate_workflow_binding(execute_request, "plan", generated["plan_hash"])
        with self.assertRaisesRegex(common.DispatchError, "idempotency"):
            ops.validate_workflow_binding(execute_request, "execute", "different")

    def test_recursive_redaction_and_encrypted_artifact_hide_errors(self) -> None:
        secret = "Bearer abc.def at https://x.test/?access_token=private"
        plaintext = common.encode_plaintext(common.error_envelope(RuntimeError(secret)))
        decoded = json.loads(plaintext)
        self.assertNotIn("abc.def", decoded["error"]["message"])
        self.assertNotIn("access_token=private", decoded["error"]["message"])
        key = rsa.generate_private_key(public_exponent=65537, key_size=3072)
        artifact = common.encrypt_envelope(plaintext, key.public_key(), read.AAD)
        self.assertNotIn(b"RuntimeError", artifact)
        parsed = json.loads(artifact)
        data_key = key.decrypt(
            base64.urlsafe_b64decode(parsed["wrapped_key_b64url"] + "=" * (-len(parsed["wrapped_key_b64url"]) % 4)),
            padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()), algorithm=hashes.SHA256(), label=None),
        )
        clear = AESGCM(data_key).decrypt(
            base64.urlsafe_b64decode(parsed["nonce_b64url"] + "=" * (-len(parsed["nonce_b64url"]) % 4)),
            base64.urlsafe_b64decode(parsed["ciphertext_b64url"] + "=" * (-len(parsed["ciphertext_b64url"]) % 4)),
            read.AAD,
        )
        self.assertEqual(json.loads(clear), decoded)

    def test_workflows_are_sha_pinned_scoped_and_one_day_encrypted(self) -> None:
        read_source = (ROOT / ".github/workflows/gsc-readonly-bridge.yml").read_text()
        ops_source = (ROOT / ".github/workflows/gsc-sitemap-ops-bridge.yml").read_text()
        for source in (read_source, ops_source):
            self.assertIn("retention-days: 1", source)
            self.assertIn("contents: read", source)
            self.assertIn("id-token: write", source)
            self.assertNotRegex(source, r"uses:\s+[^\s]+@v\d")
            self.assertNotIn("schedule:", source)
            self.assertNotIn("PRIVATE KEY", source)
        self.assertIn("webmasters.readonly", read_source)
        self.assertIn("joao-gsc-reader@woven-nimbus-489418-c3.iam.gserviceaccount.com", read_source)
        self.assertIn("environment: gsc-production-write", ops_source)
        self.assertIn("GSC_OPERATOR_WORKLOAD_IDENTITY_PROVIDER", ops_source)
        self.assertIn("joao-gsc-operator@woven-nimbus-489418-c3.iam.gserviceaccount.com", ops_source)
        self.assertIn("https://www.googleapis.com/auth/webmasters\n", ops_source)
        self.assertIn("cancel-in-progress: false", ops_source)
        self.assertLess(ops_source.index("Run deterministic GSC bridge tests"), ops_source.index("Authenticate as the isolated GSC operator"))

    def test_source_contains_no_forbidden_site_or_indexing_mutation(self) -> None:
        sources = "\n".join((ROOT / "scripts" / name).read_text() for name in (
            "gsc_bridge_common.py", "gsc_read_workflow_dispatch.py", "gsc_sitemap_ops_workflow_dispatch.py"
        ))
        for forbidden in ("sites.add", "sites.delete", "indexing.googleapis.com", "urlNotifications:publish"):
            self.assertNotIn(forbidden, sources)
        self.assertNotRegex(sources, re.compile(r"/sites/[^\n]+(?:add|delete)", re.I))


if __name__ == "__main__":
    unittest.main()
