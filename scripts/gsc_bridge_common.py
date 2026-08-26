#!/usr/bin/env python3
"""Shared validation, encryption, redaction, and HTTP primitives for GSC bridges."""
from __future__ import annotations

import base64
import binascii
import datetime as dt
import hashlib
import hmac
import json
import math
import os
import re
import tempfile
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any, Mapping

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

PROPERTY = "sc-domain:joaocrusbjj.com"
CANONICAL_ORIGIN = "https://joaocrusbjj.com"
SITEMAP_URL = f"{CANONICAL_ORIGIN}/sitemap.xml"
MAX_ENCODED_PAYLOAD_BYTES = 32 * 1024
MAX_DECODED_PAYLOAD_BYTES = 24 * 1024
MAX_HTTP_RESPONSE_BYTES = 1024 * 1024
MAX_PLAINTEXT_RESULT_BYTES = 1024 * 1024
MAX_ENCRYPTED_ARTIFACT_BYTES = 2 * 1024 * 1024
MIN_RSA_KEY_BITS = 3072
MAX_RSA_KEY_BITS = 8192
BASE64URL_RE = re.compile(r"^[A-Za-z0-9_-]+={0,2}$")
SENSITIVE_KEY_RE = re.compile(
    r"(?:^|_)(?:access_token|id_token|refresh_token|token|authorization|bearer|credential|credentials|secret|api_key|private_key)(?:$|_)",
    re.IGNORECASE,
)
BEARER_RE = re.compile(r"(?i)\bbearer\s+[A-Za-z0-9._~+/=-]+")
URL_SECRET_RE = re.compile(
    r"(?i)([?&](?:access_token|id_token|refresh_token|token|authorization|auth|api_key|key)=)[^&#\s\"']+"
)


class DispatchError(ValueError):
    """A validation or bounded-output failure safe for an encrypted envelope."""


class ProviderError(RuntimeError):
    """A bounded Google API failure."""


class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    """Fail closed instead of forwarding bearer credentials to redirects."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):  # noqa: ANN001
        raise ProviderError(f"Google API redirect refused (HTTP {code})")


def utc_now() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0)


def b64url(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode("ascii").rstrip("=")


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
    try:
        raw = base64.urlsafe_b64decode(encoded.rstrip("=") + "=" * (-len(encoded.rstrip("=")) % 4))
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
        raise DispatchError("payload must contain only tool, args, and recipient_public_key_pem")
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


def validate_exact_keys(value: Mapping[str, Any], allowed: set[str], required: set[str] | None = None) -> None:
    if set(value) - allowed:
        raise DispatchError("args contain unsupported fields")
    if (required or set()) - set(value):
        raise DispatchError("required args are missing")


def validate_property(value: Any | None) -> str:
    if value is not None and value != PROPERTY:
        raise DispatchError("site_url is not allowed")
    return PROPERTY


def validate_canonical_url(value: Any, *, sitemap_only: bool = False) -> str:
    if not isinstance(value, str) or not value or len(value.encode("utf-8")) > 4096:
        raise DispatchError("URL is not allowed")
    if "\\" in value or any(ord(character) < 0x20 for character in value):
        raise DispatchError("URL is not allowed")
    try:
        parsed = urllib.parse.urlsplit(value)
        port = parsed.port
    except ValueError as exc:
        raise DispatchError("URL is not allowed") from exc
    if (
        parsed.scheme != "https"
        or parsed.netloc != "joaocrusbjj.com"
        or parsed.hostname != "joaocrusbjj.com"
        or port is not None
        or parsed.username is not None
        or parsed.password is not None
        or parsed.fragment
        or not parsed.path.startswith("/")
    ):
        raise DispatchError("URL is not allowed")
    if sitemap_only and value != SITEMAP_URL:
        raise DispatchError("sitemap URL is not allowed")
    return value


def quote_path(value: str) -> str:
    return urllib.parse.quote(value, safe="")


class GscHttpClient:
    def __init__(self, token: str, *, opener: Any | None = None, timeout: int = 45) -> None:
        if not token:
            raise DispatchError("GSC access token is unavailable")
        self._token = token
        self._opener = opener or urllib.request.build_opener(NoRedirectHandler())
        self._timeout = timeout

    def request(self, method: str, url: str, body: Mapping[str, Any] | None = None) -> dict[str, Any]:
        if not url.startswith(("https://www.googleapis.com/webmasters/v3/", "https://searchconsole.googleapis.com/v1/")):
            raise DispatchError("Google API endpoint is not allowed")
        data = None
        headers = {"Authorization": f"Bearer {self._token}", "Accept": "application/json"}
        if body is not None:
            data = json.dumps(body, separators=(",", ":"), allow_nan=False).encode("utf-8")
            headers["Content-Type"] = "application/json"
        request = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with self._opener.open(request, timeout=self._timeout) as response:
                declared = response.headers.get("Content-Length")
                if declared and int(declared) > MAX_HTTP_RESPONSE_BYTES:
                    raise ProviderError("Google API response exceeds the 1048576-byte limit")
                raw = response.read(MAX_HTTP_RESPONSE_BYTES + 1)
                if len(raw) > MAX_HTTP_RESPONSE_BYTES:
                    raise ProviderError("Google API response exceeds the 1048576-byte limit")
        except ProviderError:
            raise
        except urllib.error.HTTPError as exc:
            detail = exc.read(16 * 1024).decode("utf-8", "replace")
            raise ProviderError(f"Google API HTTP {exc.code}: {detail}") from exc
        except urllib.error.URLError as exc:
            raise ProviderError(f"Google API request failed: {exc.reason}") from exc
        if not raw:
            return {}
        try:
            result = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise ProviderError("Google API returned invalid JSON") from exc
        if not isinstance(result, dict):
            raise ProviderError("Google API returned an unexpected JSON shape")
        return result


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
        redact(_safe_value(envelope)), ensure_ascii=False, separators=(",", ":"), allow_nan=False
    ).encode("utf-8")
    if len(encoded) > MAX_PLAINTEXT_RESULT_BYTES:
        raise DispatchError("result exceeds the 1048576-byte plaintext limit")
    return encoded


def encrypt_envelope(plaintext: bytes, recipient_key: rsa.RSAPublicKey, aad: bytes) -> bytes:
    data_key = AESGCM.generate_key(bit_length=256)
    nonce = os.urandom(12)
    ciphertext = AESGCM(data_key).encrypt(nonce, plaintext, aad)
    wrapped_key = recipient_key.encrypt(
        data_key,
        padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()), algorithm=hashes.SHA256(), label=None),
    )
    artifact = {
        "schema_version": 1,
        "encryption": "RSA-OAEP-SHA256+A256GCM",
        "wrapped_key_b64url": b64url(wrapped_key),
        "nonce_b64url": b64url(nonce),
        "aad_b64url": b64url(aad),
        "ciphertext_b64url": b64url(ciphertext),
    }
    encoded = json.dumps(artifact, separators=(",", ":")).encode("ascii") + b"\n"
    if len(encoded) > MAX_ENCRYPTED_ARTIFACT_BYTES:
        raise DispatchError("encrypted artifact exceeds the 2097152-byte limit")
    return encoded


def error_envelope(exc: Exception) -> dict[str, Any]:
    return {"schema_version": 1, "ok": False, "error": {"type": type(exc).__name__, "message": str(exc)}}


def write_result(path: Path, content: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as handle:
        temporary = Path(handle.name)
        os.chmod(temporary, 0o600)
        handle.write(content)
        handle.flush()
        os.fsync(handle.fileno())
    os.replace(temporary, path)


def canonical_json(value: Mapping[str, Any]) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("ascii")


def plan_digest(plan: Mapping[str, Any]) -> str:
    return hashlib.sha256(b"joao-gsc-sitemap-plan:v1\0" + canonical_json(plan)).hexdigest()


def digest_matches(plan: Mapping[str, Any], supplied: Any) -> bool:
    return isinstance(supplied, str) and len(supplied) == 64 and hmac.compare_digest(plan_digest(plan), supplied)
