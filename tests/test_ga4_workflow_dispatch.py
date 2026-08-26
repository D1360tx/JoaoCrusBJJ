#!/usr/bin/env python3
from __future__ import annotations

import asyncio
import base64
import importlib.util
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import AsyncMock, patch

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "ga4_workflow_dispatch", ROOT / "scripts" / "ga4_workflow_dispatch.py"
)
assert SPEC and SPEC.loader
mod = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = mod
SPEC.loader.exec_module(mod)

PRIVATE_KEY = rsa.generate_private_key(public_exponent=65537, key_size=3072)
PUBLIC_KEY_PEM = PRIVATE_KEY.public_key().public_bytes(
    serialization.Encoding.PEM,
    serialization.PublicFormat.SubjectPublicKeyInfo,
).decode("ascii")


def b64url_decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def encode_request(tool: str, args: dict, public_key: str = PUBLIC_KEY_PEM) -> str:
    request = {
        "tool": tool,
        "args": args,
        "recipient_public_key_pem": public_key,
    }
    raw = json.dumps(request, separators=(",", ":")).encode()
    return base64.urlsafe_b64encode(raw).decode().rstrip("=")


def decrypt_artifact(path: Path) -> dict:
    artifact = json.loads(path.read_text())
    data_key = PRIVATE_KEY.decrypt(
        b64url_decode(artifact["wrapped_key_b64url"]),
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None,
        ),
    )
    plaintext = AESGCM(data_key).decrypt(
        b64url_decode(artifact["nonce_b64url"]),
        b64url_decode(artifact["ciphertext_b64url"]),
        b64url_decode(artifact["aad_b64url"]),
    )
    return json.loads(plaintext)


MINIMUM_ARGS = {
    "get_account_summaries": {},
    "get_property_details": {},
    "get_custom_dimensions_and_metrics": {},
    "run_report": {
        "date_ranges": [{"start_date": "7daysAgo", "end_date": "today"}],
        "dimensions": ["date"],
        "metrics": ["activeUsers"],
    },
    "run_realtime_report": {
        "dimensions": ["country"],
        "metrics": ["activeUsers"],
    },
    "run_funnel_report": {"funnel_steps": [{"name": "Visit"}]},
    "list_google_ads_links": {},
}


class Ga4WorkflowDispatchTests(unittest.TestCase):
    def test_allowlist_is_exactly_the_approved_seven_tools(self) -> None:
        self.assertEqual(set(mod.TOOL_SPECS), set(MINIMUM_ARGS))

    def test_every_official_tool_is_mocked_without_live_credentials(self) -> None:
        for tool, supplied_args in MINIMUM_ARGS.items():
            with self.subTest(tool=tool):
                spec = mod.TOOL_SPECS[tool]
                mocked = AsyncMock(return_value={"tool": tool})
                with patch.object(spec, "function", mocked):
                    envelope = asyncio.run(
                        mod.dispatch(encode_request(tool, supplied_args))
                    )
                self.assertTrue(envelope["ok"])
                self.assertIsNotNone(mocked.await_args)
                called_args = mocked.await_args.kwargs
                if spec.property_scoped:
                    self.assertEqual(called_args["property_id"], 547238162)
                else:
                    self.assertNotIn("property_id", called_args)

    def test_allowed_property_formats_are_validated_then_forced(self) -> None:
        spec = mod.TOOL_SPECS["get_property_details"]
        for value in (547238162, "547238162", "properties/547238162"):
            with self.subTest(value=value):
                mocked = AsyncMock(return_value={})
                with patch.object(spec, "function", mocked):
                    asyncio.run(
                        mod.dispatch(
                            encode_request(
                                "get_property_details", {"property_id": value}
                            )
                        )
                    )
                self.assertIsNotNone(mocked.await_args)
                self.assertEqual(mocked.await_args.kwargs, {"property_id": 547238162})

    def test_other_property_is_rejected_before_official_call(self) -> None:
        spec = mod.TOOL_SPECS["run_report"]
        args = dict(MINIMUM_ARGS["run_report"], property_id=123)
        mocked = AsyncMock(return_value={})
        with patch.object(spec, "function", mocked):
            with self.assertRaisesRegex(mod.DispatchError, "property_id"):
                asyncio.run(mod.dispatch(encode_request("run_report", args)))
        mocked.assert_not_awaited()

    def test_unknown_tool_and_unexpected_args_are_rejected(self) -> None:
        with self.assertRaisesRegex(mod.DispatchError, "not allowed"):
            asyncio.run(mod.dispatch(encode_request("delete_property", {})))
        with self.assertRaisesRegex(mod.DispatchError, "does not accept args"):
            asyncio.run(
                mod.dispatch(encode_request("get_account_summaries", {"x": 1}))
            )
        args = dict(MINIMUM_ARGS["run_report"], credential="do-not-use")
        with self.assertRaisesRegex(mod.DispatchError, "unsupported"):
            asyncio.run(mod.dispatch(encode_request("run_report", args)))

    def test_report_pagination_is_bounded(self) -> None:
        for tool in ("run_report", "run_realtime_report"):
            base_args = dict(MINIMUM_ARGS[tool])
            for invalid_limit in (0, 10_001, True, "100"):
                with self.subTest(tool=tool, limit=invalid_limit):
                    with self.assertRaisesRegex(mod.DispatchError, "limit"):
                        asyncio.run(
                            mod.dispatch(
                                encode_request(tool, dict(base_args, limit=invalid_limit))
                            )
                        )
            for invalid_offset in (-1, True, "0"):
                with self.subTest(tool=tool, offset=invalid_offset):
                    with self.assertRaisesRegex(mod.DispatchError, "offset"):
                        asyncio.run(
                            mod.dispatch(
                                encode_request(tool, dict(base_args, offset=invalid_offset))
                            )
                        )

    def test_payload_shape_and_size_are_bounded(self) -> None:
        raw = base64.urlsafe_b64encode(b"[]").decode().rstrip("=")
        with self.assertRaisesRegex(mod.DispatchError, "contain"):
            mod.decode_request(raw)
        with self.assertRaisesRegex(mod.DispatchError, "32768"):
            mod.decode_request("A" * (mod.MAX_ENCODED_PAYLOAD_BYTES + 1))
        with self.assertRaisesRegex(mod.DispatchError, "base64url"):
            mod.decode_request("not+base64")

    def test_recipient_key_must_be_valid_rsa_3072_or_stronger(self) -> None:
        with self.assertRaisesRegex(mod.DispatchError, "valid PEM"):
            mod.load_recipient_key("not a key")
        weak = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        weak_pem = weak.public_key().public_bytes(
            serialization.Encoding.PEM,
            serialization.PublicFormat.SubjectPublicKeyInfo,
        ).decode()
        with self.assertRaisesRegex(mod.DispatchError, "3072"):
            mod.load_recipient_key(weak_pem)

    def test_recursive_redaction_covers_keys_bearers_and_url_queries(self) -> None:
        plaintext = mod.encode_plaintext(
            {
                "access_token": "abc",
                "nested": [
                    {"authorization": "Bearer secret"},
                    "request failed: Bearer xyz at https://x.test/a?token=foo&ok=1",
                ],
            }
        )
        decoded = json.loads(plaintext)
        self.assertEqual(decoded["access_token"], "[REDACTED]")
        self.assertEqual(decoded["nested"][0]["authorization"], "[REDACTED]")
        self.assertNotIn("xyz", decoded["nested"][1])
        self.assertNotIn("token=foo", decoded["nested"][1])

    def test_artifact_is_hybrid_encrypted_and_contains_no_analytics_values(self) -> None:
        sample_value = "Austin analytics sample: 987654321 users"
        spec = mod.TOOL_SPECS["get_account_summaries"]
        mocked = AsyncMock(return_value={"sample": sample_value})
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "result.encrypted.json"
            with (
                patch.object(spec, "function", mocked),
                patch.dict(
                    os.environ,
                    {"GA4_REQUEST_B64": encode_request("get_account_summaries", {})},
                ),
                patch.object(sys, "argv", ["dispatcher", "--output", str(output)]),
            ):
                self.assertEqual(mod.main(), 0)
            artifact_text = output.read_text()
            decrypted = decrypt_artifact(output)
        self.assertNotIn(sample_value, artifact_text)
        self.assertNotIn("sample", artifact_text)
        self.assertEqual(decrypted["result"]["sample"], sample_value)
        self.assertEqual(
            json.loads(artifact_text)["encryption"], "RSA-OAEP-SHA256+A256GCM"
        )

    def test_oversized_result_becomes_encrypted_bounded_error(self) -> None:
        spec = mod.TOOL_SPECS["get_account_summaries"]
        mocked = AsyncMock(return_value={"rows": "x" * mod.MAX_PLAINTEXT_RESULT_BYTES})
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "result.encrypted.json"
            with (
                patch.object(spec, "function", mocked),
                patch.dict(
                    os.environ,
                    {"GA4_REQUEST_B64": encode_request("get_account_summaries", {})},
                ),
                patch.object(sys, "argv", ["dispatcher", "--output", str(output)]),
            ):
                self.assertEqual(mod.main(), 0)
            result = decrypt_artifact(output)
            artifact_size = output.stat().st_size
        self.assertFalse(result["ok"])
        self.assertEqual(result["error"]["type"], "DispatchError")
        self.assertLess(artifact_size, mod.MAX_ENCRYPTED_ARTIFACT_BYTES)

    def test_provider_error_is_redacted_inside_encrypted_envelope(self) -> None:
        spec = mod.TOOL_SPECS["get_account_summaries"]
        mocked = AsyncMock(
            side_effect=RuntimeError(
                "failed with Bearer abc at https://x.test/?access_token=secret"
            )
        )
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "result.encrypted.json"
            with (
                patch.object(spec, "function", mocked),
                patch.dict(
                    os.environ,
                    {"GA4_REQUEST_B64": encode_request("get_account_summaries", {})},
                ),
                patch.object(sys, "argv", ["dispatcher", "--output", str(output)]),
            ):
                self.assertEqual(mod.main(), 0)
            artifact_text = output.read_text()
            result = decrypt_artifact(output)
        self.assertFalse(result["ok"])
        self.assertNotIn("abc", artifact_text)
        self.assertNotIn("secret", artifact_text)
        self.assertNotIn("abc", result["error"]["message"])
        self.assertNotIn("access_token=secret", result["error"]["message"])

    def test_invalid_public_key_produces_no_artifact(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "result.encrypted.json"
            with (
                patch.dict(
                    os.environ,
                    {
                        "GA4_REQUEST_B64": encode_request(
                            "get_account_summaries", {}, "not a key"
                        )
                    },
                ),
                patch.object(sys, "argv", ["dispatcher", "--output", str(output)]),
            ):
                self.assertEqual(mod.main(), 2)
            self.assertFalse(output.exists())

    def test_workflow_uploads_only_encrypted_one_day_artifact(self) -> None:
        source = (
            ROOT / ".github" / "workflows" / "ga4-readonly-bridge.yml"
        ).read_text()
        self.assertIn("id-token: write", source)
        self.assertIn("analytics.readonly", source)
        self.assertIn("requirements/ga4-bridge.lock.txt", source)
        lock = (ROOT / "requirements" / "ga4-bridge.lock.txt").read_text()
        self.assertIn("analytics-mcp==0.7.0", lock)
        self.assertIn("cryptography==50.0.1", lock)
        self.assertIn("retention-days: 1", source)
        self.assertIn("joao-ga4-reader@woven-nimbus-489418-c3.iam.gserviceaccount.com", source)
        self.assertIn(
            "projects/186285028720/locations/global/workloadIdentityPools/github-actions/providers/joao-repo",
            source,
        )
        self.assertIn("result.encrypted.json", source)
        self.assertLess(
            source.index("Run deterministic bridge tests"),
            source.index("Authenticate to Google without a static key"),
        )
        self.assertNotIn("joao-ga4-result.json", source)
        self.assertNotIn("access_token }}", source)
        self.assertNotIn("schedule:", source)
        self.assertNotIn("PRIVATE KEY", source)


if __name__ == "__main__":
    unittest.main()
