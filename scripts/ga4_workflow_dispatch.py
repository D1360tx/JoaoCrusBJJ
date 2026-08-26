#!/usr/bin/env python3
"""Bounded, encrypted dispatcher for the keyless GitHub Actions GA4 bridge."""
from __future__ import annotations

import argparse
import asyncio
import base64
import binascii
import inspect
import json
import math
import os
import re
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Awaitable, Callable, Mapping

from analytics_mcp.tools.admin.info import (
    get_account_summaries,
    get_property_details,
    list_google_ads_links,
)
from analytics_mcp.tools.reporting.core import run_report
from analytics_mcp.tools.reporting.funnel import run_funnel_report
from analytics_mcp.tools.reporting.metadata import get_custom_dimensions_and_metrics
from analytics_mcp.tools.reporting.realtime import run_realtime_report
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

ALLOWED_PROPERTY_ID = 547238162
MAX_ENCODED_PAYLOAD_BYTES = 32 * 1024
MAX_DECODED_PAYLOAD_BYTES = 24 * 1024
MAX_PLAINTEXT_RESULT_BYTES = 1024 * 1024
MAX_ENCRYPTED_ARTIFACT_BYTES = 2 * 1024 * 1024
MIN_RSA_KEY_BITS = 3072
MAX_RSA_KEY_BITS = 8192
ENCRYPTION_AAD = b"joao-ga4-readonly-bridge:v1"
BASE64URL_RE = re.compile(r"^[A-Za-z0-9_-]+={0,2}$")
SENSITIVE_KEY_RE = re.compile(
    r"(?:^|_)(?:access_token|id_token|refresh_token|token|authorization|bearer|credential|secret|api_key)(?:$|_)",
    re.IGNORECASE,
)
BEARER_RE = re.compile(r"(?i)\bbearer\s+[A-Za-z0-9._~+/=-]+")
URL_SECRET_RE = re.compile(
    r"(?i)([?&](?:access_token|id_token|refresh_token|token|authorization|auth|api_key|key)=)[^&#\s\"']+"
)


@dataclass
class ToolSpec:
    function: Callable[..., Awaitable[Any]]
    property_scoped: bool
    allowed_args: frozenset[str]
    required_args: frozenset[str]


def _tool_spec(function: Callable[..., Awaitable[Any]], *, property_scoped: bool) -> ToolSpec:
    signature = inspect.signature(function)
    return ToolSpec(
        function=function,
        property_scoped=property_scoped,
        allowed_args=frozenset(signature.parameters),
        required_args=frozenset(
            name
            for name, parameter in signature.parameters.items()
            if parameter.default is inspect.Parameter.empty
        ),
    )


# Deliberately narrower than the package: only these seven read-only tools.
TOOL_SPECS = {
    "get_account_summaries": _tool_spec(get_account_summaries, property_scoped=False),
    "get_property_details": _tool_spec(get_property_details, property_scoped=True),
    "get_custom_dimensions_and_metrics": _tool_spec(
        get_custom_dimensions_and_metrics, property_scoped=True
    ),
    "run_report": _tool_spec(run_report, property_scoped=True),
    "run_realtime_report": _tool_spec(run_realtime_report, property_scoped=True),
    "run_funnel_report": _tool_spec(run_funnel_report, property_scoped=True),
    "list_google_ads_links": _tool_spec(list_google_ads_links, property_scoped=True),
}


class DispatchError(ValueError):
    """A validation or bounded-output failure safe for an encrypted envelope."""


def decode_request(encoded: str) -> dict[str, Any]:
    if not isinstance(encoded, str) or not encoded:
        raise DispatchError("payload is required")
    try:
        encoded_size = len(encoded.encode("ascii"))
    except UnicodeEncodeError as exc:
        raise DispatchError("payload is not valid base64url") from exc
    if encoded_size > MAX_ENCODED_PAYLOAD_BYTES:
        raise DispatchError("encoded payload exceeds the 32768-byte limit")
    if not BASE64URL_RE.fullmatch(encoded):
        raise DispatchError("payload is not valid base64url")

    unpadded = encoded.rstrip("=")
    try:
        raw = base64.urlsafe_b64decode(unpadded + "=" * (-len(unpadded) % 4))
    except (ValueError, binascii.Error) as exc:
        raise DispatchError("payload is not valid base64url") from exc
    if len(raw) > MAX_DECODED_PAYLOAD_BYTES:
        raise DispatchError("decoded payload exceeds the 24576-byte limit")

    try:
        request = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise DispatchError("payload must decode to UTF-8 JSON") from exc
    expected = {"tool", "args", "recipient_public_key_pem"}
    if not isinstance(request, dict) or set(request) != expected:
        raise DispatchError(
            "payload must contain only tool, args, and recipient_public_key_pem"
        )
    if not isinstance(request["tool"], str):
        raise DispatchError("tool must be a string")
    if not isinstance(request["args"], dict):
        raise DispatchError("args must be an object")
    if not isinstance(request["recipient_public_key_pem"], str):
        raise DispatchError("recipient_public_key_pem must be a string")
    return request


def load_recipient_key(pem: str) -> rsa.RSAPublicKey:
    if len(pem.encode("utf-8")) > 16 * 1024:
        raise DispatchError("recipient public key is too large")
    try:
        key = serialization.load_pem_public_key(pem.encode("ascii"))
    except (ValueError, TypeError, UnicodeEncodeError) as exc:
        raise DispatchError("recipient public key must be valid PEM") from exc
    if not isinstance(key, rsa.RSAPublicKey):
        raise DispatchError("recipient public key must be RSA")
    if not MIN_RSA_KEY_BITS <= key.key_size <= MAX_RSA_KEY_BITS:
        raise DispatchError("recipient RSA key must be between 3072 and 8192 bits")
    if key.public_numbers().e < 65537:
        raise DispatchError("recipient RSA public exponent is not allowed")
    return key


def _canonical_property_id(value: Any) -> int:
    if isinstance(value, bool):
        raise DispatchError("property_id is not allowed")
    if isinstance(value, int):
        candidate = value
    elif isinstance(value, str):
        candidate_text = value.removeprefix("properties/")
        if not candidate_text.isdigit():
            raise DispatchError("property_id is not allowed")
        candidate = int(candidate_text)
    else:
        raise DispatchError("property_id is not allowed")
    if candidate != ALLOWED_PROPERTY_ID:
        raise DispatchError("property_id is not allowed")
    return ALLOWED_PROPERTY_ID


def validate_call(request: Mapping[str, Any]) -> tuple[str, ToolSpec, dict[str, Any]]:
    tool = request["tool"]
    spec = TOOL_SPECS.get(tool)
    if spec is None:
        raise DispatchError("tool is not allowed")
    args = dict(request["args"])
    if not spec.property_scoped and args:
        raise DispatchError("this tool does not accept args")
    if set(args) - spec.allowed_args:
        raise DispatchError("args contain unsupported fields")
    if spec.property_scoped:
        if "property_id" in args:
            _canonical_property_id(args["property_id"])
        args["property_id"] = ALLOWED_PROPERTY_ID
    if tool in {"run_report", "run_realtime_report"}:
        limit = args.get("limit")
        if limit is not None and (
            isinstance(limit, bool) or not isinstance(limit, int) or not 1 <= limit <= 10_000
        ):
            raise DispatchError("limit must be an integer between 1 and 10000")
        offset = args.get("offset")
        if offset is not None and (
            isinstance(offset, bool) or not isinstance(offset, int) or offset < 0
        ):
            raise DispatchError("offset must be a non-negative integer")
    if spec.required_args - set(args):
        raise DispatchError("required args are missing")
    return tool, spec, args


def _safe_value(value: Any) -> Any:
    if value is None or isinstance(value, (str, bool, int)):
        return value
    if isinstance(value, float):
        if not math.isfinite(value):
            raise TypeError("non-finite floats cannot be serialized")
        return value
    if isinstance(value, Mapping):
        return {str(key): _safe_value(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [_safe_value(item) for item in value]
    raise TypeError(f"unsupported result type: {type(value).__name__}")


def redact(value: Any, *, sensitive: bool = False) -> Any:
    if sensitive:
        return "[REDACTED]"
    if isinstance(value, dict):
        return {
            key: redact(item, sensitive=bool(SENSITIVE_KEY_RE.search(str(key))))
            for key, item in value.items()
        }
    if isinstance(value, list):
        return [redact(item) for item in value]
    if isinstance(value, str):
        value = BEARER_RE.sub("Bearer [REDACTED]", value)
        return URL_SECRET_RE.sub(r"\1[REDACTED]", value)
    return value


def encode_plaintext(envelope: Mapping[str, Any]) -> bytes:
    encoded = json.dumps(
        redact(_safe_value(envelope)),
        ensure_ascii=False,
        separators=(",", ":"),
        allow_nan=False,
    ).encode("utf-8")
    if len(encoded) > MAX_PLAINTEXT_RESULT_BYTES:
        raise DispatchError("result exceeds the 1048576-byte plaintext limit")
    return encoded


def _b64url(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode("ascii").rstrip("=")


def encrypt_envelope(plaintext: bytes, recipient_key: rsa.RSAPublicKey) -> bytes:
    data_key = AESGCM.generate_key(bit_length=256)
    nonce = os.urandom(12)
    ciphertext = AESGCM(data_key).encrypt(nonce, plaintext, ENCRYPTION_AAD)
    wrapped_key = recipient_key.encrypt(
        data_key,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None,
        ),
    )
    artifact = {
        "schema_version": 1,
        "encryption": "RSA-OAEP-SHA256+A256GCM",
        "wrapped_key_b64url": _b64url(wrapped_key),
        "nonce_b64url": _b64url(nonce),
        "aad_b64url": _b64url(ENCRYPTION_AAD),
        "ciphertext_b64url": _b64url(ciphertext),
    }
    encoded = json.dumps(artifact, separators=(",", ":")).encode("ascii") + b"\n"
    if len(encoded) > MAX_ENCRYPTED_ARTIFACT_BYTES:
        raise DispatchError("encrypted artifact exceeds the 2097152-byte limit")
    return encoded


async def dispatch_request(request: Mapping[str, Any]) -> dict[str, Any]:
    tool, spec, args = validate_call(request)
    result = await spec.function(**args)
    return {"schema_version": 1, "ok": True, "tool": tool, "result": result}


async def dispatch(encoded: str) -> dict[str, Any]:
    """Testable plaintext dispatch path; callers must encrypt before persistence."""
    return await dispatch_request(decode_request(encoded))


def error_envelope(exc: Exception) -> dict[str, Any]:
    return {
        "schema_version": 1,
        "ok": False,
        "error": {"type": type(exc).__name__, "message": str(exc)},
    }


def write_result(path: Path, content: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as handle:
        temporary = Path(handle.name)
        os.chmod(temporary, 0o600)
        handle.write(content)
        handle.flush()
        os.fsync(handle.fileno())
    os.replace(temporary, path)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--payload-env", default="GA4_REQUEST_B64")
    parser.add_argument("--output", type=Path, required=True)
    options = parser.parse_args()

    # Without a valid recipient key, no result artifact can be safely produced.
    try:
        request = decode_request(os.environ.get(options.payload_env, ""))
        recipient_key = load_recipient_key(request["recipient_public_key_pem"])
    except Exception:
        return 2

    try:
        envelope = asyncio.run(dispatch_request(request))
        plaintext = encode_plaintext(envelope)
    except Exception as exc:
        try:
            plaintext = encode_plaintext(error_envelope(exc))
        except Exception:
            plaintext = encode_plaintext(
                error_envelope(DispatchError("result could not be serialized safely"))
            )
    artifact = encrypt_envelope(plaintext, recipient_key)
    write_result(options.output, artifact)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
