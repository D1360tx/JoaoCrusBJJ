# Hardened GSC GitHub Bridges

Two manual GitHub Actions bridges expose a deliberately narrow Search Console surface for `sc-domain:joaocrusbjj.com`. They do not create external resources, use static Google keys, add/delete Search Console properties, call the Google Indexing API, publish site code, or request indexing.

## Read-only bridge

Workflow: `.github/workflows/gsc-readonly-bridge.yml`

Identity and scope:

- existing repository-scoped WIF provider;
- `joao-gsc-reader@woven-nimbus-489418-c3.iam.gserviceaccount.com`;
- `https://www.googleapis.com/auth/webmasters.readonly` only.

Exact tool allowlist:

- `list_sites`: calls `sites.list`, then returns only `sc-domain:joaocrusbjj.com` even if the identity later receives other property access;
- `get_site`: forces the domain property;
- `search_analytics`: requires ISO dates, rejects future or over-90-day windows, permits at most three approved dimensions, caps `row_limit` at 5,000 and `start_row` at 25,000;
- `list_sitemaps`: forces the domain property;
- `get_sitemap`: accepts only a URL on the exact `https://joaocrusbjj.com` origin and fully escapes it as one API path segment;
- `inspect_indexed_url`: URL Inspection read only, limited to the exact HTTPS origin. It never requests indexing.

## Sitemap operations bridge

Workflow: `.github/workflows/gsc-sitemap-ops-bridge.yml`

The job always declares `environment: gsc-production-write`. Only the execute phase authenticates. It uses:

- repository environment variable `GSC_OPERATOR_WORKLOAD_IDENTITY_PROVIDER` for the separate operator-pool provider resource name;
- `joao-gsc-operator@woven-nimbus-489418-c3.iam.gserviceaccount.com`;
- `https://www.googleapis.com/auth/webmasters`.

The external provider is intentionally not created by this repository. Its attribute condition must require all of:

- `assertion.repository == 'D1360tx/JoaoCrusBJJ'`;
- `assertion.ref == 'refs/heads/main'`;
- `assertion.job_workflow_ref == 'D1360tx/JoaoCrusBJJ/.github/workflows/gsc-sitemap-ops-bridge.yml@refs/heads/main'`;
- `assertion.environment == 'gsc-production-write'`.

The service account should have only the necessary Search Console property permission and no unrelated Cloud IAM roles. Configure required reviewers/branch protection on the GitHub environment separately.

Exact tool allowlist:

- `plan_sitemap_submit`;
- `execute_sitemap_submit`;
- `plan_sitemap_delete`;
- `execute_sitemap_delete`.

Every operation is hard-coded to `https://joaocrusbjj.com/sitemap.xml` under the domain property. There is no generic write primitive.

### Plan then execute

Plan is pure. It never constructs a Google client or reads/mutates Search Console. It returns an encrypted plan containing the exact action, property, sitemap, creation time, expiration time, and a SHA-256 `plan_hash`. Default validity is 10 minutes; callers may request 60-900 seconds.

Execute requires the complete plan and exact lowercase hash. It recomputes the canonical digest with constant-time comparison, rejects altered/action-mismatched/future/expired/overlong plans, and requires the workflow `idempotency_key` to exactly equal the hash. GitHub concurrency serializes identical hashes without cancelling an in-progress execution.

Immediately before mutation, execute reads the exact sitemap:

- submit returns an idempotent no-change result when the sitemap already exists; otherwise it performs one PUT and reads the sitemap back;
- delete returns an idempotent no-change result when the sitemap is already absent; otherwise it performs one DELETE and reads back a 404.

A missing or contradictory read-back is a hard failure. This makes delayed/repeated execution safe without relying on mutable runner-local state.

## Request and encrypted response

Both workflows accept a base64url UTF-8 JSON payload, capped at 32 KiB encoded and 24 KiB decoded:

```json
{
  "tool": "search_analytics",
  "args": {
    "start_date": "2026-08-01",
    "end_date": "2026-08-26",
    "dimensions": ["query", "page"],
    "row_limit": 1000
  },
  "recipient_public_key_pem": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----\n"
}
```

Generate a fresh RSA 3072-8192-bit keypair for every dispatch and retain the private key only on the caller. The only uploaded output is an encrypted JSON artifact retained for one day. The dispatcher creates a random AES-256-GCM key and 96-bit nonce, encrypts the bounded envelope with bridge-specific authenticated associated data, and wraps the key with RSA-OAEP-SHA256.

Plaintext envelopes are capped at 1 MiB, provider response reads at 1 MiB, and encrypted artifacts at 2 MiB. Credentials, token-like fields, bearer strings, and token-bearing URL query values are recursively redacted before encryption. Redirects are refused so an authorization header cannot be forwarded to another origin. Invalid recipient keys create no artifact.

Dependencies are fully version-pinned in `requirements/gsc-bridge.lock.txt`. Every action in both new workflows is pinned to a full commit SHA. Deterministic mocked tests run before authentication.

## Verification

```bash
python -m unittest tests/test_gsc_operational_bridge.py
```

The suite covers exact allowlists, property/origin enforcement, path escaping, redirect refusal, bounded Search Analytics requests, pure/deterministic plans, digest tampering, expiration, future plans, submit/delete read-back, replay idempotency, workflow phase/concurrency binding, recursive error redaction, hybrid encryption, scopes, environment isolation, dependency/action pins, and forbidden APIs.
