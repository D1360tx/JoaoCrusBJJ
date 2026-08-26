# Keyless GA4 Workflow Bridge

`.github/workflows/ga4-readonly-bridge.yml` is a manually dispatched, read-only bridge for GA4 property `547238162` (measurement ID `G-EW2F2YKR3Y`). It does not contain a Google key and does not write to GA4.

## Dispatch contract

The workflow accepts `request_id` for run correlation and `payload`, a base64url-encoded UTF-8 JSON object:

```json
{
  "tool": "run_report",
  "args": {
    "property_id": "properties/547238162",
    "date_ranges": [{"start_date": "7daysAgo", "end_date": "today"}],
    "dimensions": ["date"],
    "metrics": ["activeUsers"]
  },
  "recipient_public_key_pem": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----\n"
}
```

The caller must generate a one-time RSA keypair of 3072-8192 bits for each dispatch, retain the private key only locally, and put the PEM public key in the payload. The payload is limited to 32 KiB encoded and 24 KiB decoded.

The exact tool allowlist is:

- `get_account_summaries`
- `get_property_details`
- `get_custom_dimensions_and_metrics`
- `run_report`
- `run_realtime_report`
- `run_funnel_report`
- `list_google_ads_links`

`get_account_summaries` takes an empty `args` object. Every other tool is property-scoped: the dispatcher rejects a property other than `547238162`, then forces the canonical integer ID before invoking the corresponding async function from `analytics_mcp.tools.*`. Core and realtime report limits are capped at 10,000 rows per call, and offsets must be non-negative integers. Unknown tools and arguments are rejected. Account summaries remain available because the dedicated service account is restricted to Joao's property access.

## Encrypted response

The only uploaded file is `joao-ga4-result.encrypted.json`, retained for one day. No plaintext result file is created. The JSON artifact contains:

```json
{
  "schema_version": 1,
  "encryption": "RSA-OAEP-SHA256+A256GCM",
  "wrapped_key_b64url": "...",
  "nonce_b64url": "...",
  "aad_b64url": "...",
  "ciphertext_b64url": "..."
}
```

The dispatcher creates a random AES-256-GCM key and 96-bit nonce, encrypts the bounded result envelope with authenticated associated data `joao-ga4-readonly-bridge:v1`, and wraps the data key with the request's RSA public key using RSA-OAEP SHA-256. The local caller downloads the artifact, unwraps the data key with its one-time private key, verifies/decrypts AES-GCM, and then parses the plaintext JSON envelope. Provider and validation errors are encrypted in the same way when a valid recipient key is available. An invalid recipient key fails the job without creating an artifact.

Plaintext result envelopes are capped at 1 MiB and encrypted artifacts at 2 MiB. Before encryption, nested token/credential fields, bearer values, and token-like URL query values are recursively redacted.

## Security model

- GitHub Actions obtains short-lived credentials through `google-github-actions/auth@v2`, the repository-scoped WIF provider, and `joao-ga4-reader@woven-nimbus-489418-c3.iam.gserviceaccount.com`.
- The job has only `contents: read` and `id-token: write`, and requests only `analytics.readonly`.
- The official implementation and every resolved Python dependency are pinned in `requirements/ga4-bridge.lock.txt`, including `analytics-mcp==0.7.0` and `cryptography==50.0.1`.
- Every GitHub Action is pinned to an observed full commit SHA rather than a floating major tag.
- Deterministic mocked tests run before Google authentication and live dispatch.
- Untrusted payload values are passed through an environment variable as data, never evaluated as shell or Python code.
- Neither bearer tokens, generated credentials, plaintext results, nor private decryption keys are printed or uploaded.
