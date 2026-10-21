# Direct Lead CAPI hardening: review and controlled test runbook

Status: branch/PR only. No production deployment, environment edits, scheduler activation, live lead, provider POST or GTM publication is authorized by this patch.

## Existing path, preserved

Bluehost `api/lead.php` already sends the standard Meta `Lead` after HighLevel contact, opportunity and submission-note acceptance. Preserve dataset `592714768141415`, the working access token, Graph `v23.0`, `lead_<request_id>`, browser/server deduplication, advertising consent and the existing no-SMS release interlock. No parallel GHL Lead sender is added. A form/contact permission is not advertising permission.

The 2026-10-20 read-only audit established three accepted intake requests with three matching provider-accepted receipts in the preceding seven days, with zero queued/dead files observed. It did not establish the historic declined denominator, paired browser/server Test Events receipt or ad attribution. Do not convert this observation into a 100% tracking guarantee.

## Reviewed code changes

1. Relative and absolute source URLs share one sanitizer. Only trusted HTTPS Joao hosts and public ASCII route paths survive. Every query (including UTMs), fragment, credential, alternate port, encoded/contact-like path and protocol-relative input is removed or rejected to the canonical homepage fallback. CRM attribution remains unchanged.
2. All three deferred browser `Lead` callbacks check current `ad_storage`, `ad_user_data` and browser GPC immediately before Pixel execution. Withdrawal cancels the pending send rather than replaying it on a later grant. Existing shared event IDs and in-page duplicate suppression are unchanged.
3. `Sec-GPC: 1` independently overrides posted advertising grants on the server. The same sanitized consent enters CRM fields and CAPI; fbp/fbc are removed on denial. Analytics/regional defaults and saved granular choices are unchanged. Absence of GPC is not proof of consent. Posted flags still are not an authenticated consent receipt.
4. An optional two-key, request-bound Test Events hook exists at the CAPI transport boundary only. No frontend test switch and no client test-code field are trusted.
5. Denials now emit a controlled `meta_capi_consent_denied` private-log event. Optional bounded, PII-free daily status counters can be enabled separately; default is off.

## Configuration contract (server-only, outside webroot)

The example env uses blank defaults:

- `META_CAPI_TEST_EVENT_CODE=`
- `META_CAPI_TEST_REQUEST_ID=`
- `META_CAPI_METRICS_DIR=`

Both test keys must be nonblank and valid, the request ID must exactly match the operator-approved UUID, and the outgoing single event must be `Lead` with the exact `lead_<UUID>` ID. Our conservative local code validator permits 1–64 ASCII letters, digits, underscores or hyphens. Meta documents a string and examples such as `TEST123`; this is not a claim that Meta publishes this regex. A code alone never labels every real lead. Invalid/unset/mismatched values omit the code. No API token rotation or API-version upgrade is necessary.

The hook does not grant consent, enable CAPI, authenticate the visitor, bypass intake validation, skip CRM/alerts, or provide a sandbox. Codes are applied only at send time; they are not stored in newly queued records. Retry transport strips any stale queued test code and re-evaluates the current two-key activation. Request ID scoping is an operator allowlist, not a cryptographically signed consent/token system. Use a fresh unpredictable UUID and remove both settings after the controlled session; repeated sends of that UUID remain within scope until cleared.

### Counters, not a completeness guarantee

Pre-create a dedicated outside-webroot directory with mode `0700`, then set `META_CAPI_METRICS_DIR` only under separate approval. The file is `meta-capi-daily.json`, mode `0600`, with a nonblocking exclusive lock and a bounded read. It contains at most 31 UTC day buckets with only `accepted`, `consent_denied`, `disabled`, and `failed` counters. No request IDs, identities, cookies, IP, UA, token, code, path or provider body are retained. Old aggregate buckets are pruned; pending retry payloads are never purged by these counters.

Counters increment once per successfully CRM-accepted intake processing attempt after CAPI status returns. `accepted + failed` is the observed eligible-attempt denominator; adding denied and disabled gives observed CRM-accepted processing attempts. `failed` includes queued or unqueued delivery failure, not a promise of retryability. Counters do not count spam/invalid/CRM-rejected requests, unique people, retry receipts, historical leads or exactly-once submissions. They saturate at one billion per status/day. Lock contention/write failure logs `meta_capi_metrics_failed` and does not fail the lead response; therefore reconcile missing counters against private accepted/denied/provider logs rather than claiming lossless 100% internal accounting.

## Offline acceptance, no live effects

The required release job exports the exact commit, uses native PHP and real Chromium, and runs all tests/builds in `unshare -Urn` network namespaces. CLI-only transport hooks mock HighLevel, Meta and mail. The browser submits the native lead UI through its actual JSON POST, invokes the real PHP handler, and checks that the constructed CAPI event and browser Pixel call share `Lead` plus the exact event ID. This is paired fixture evidence, never a live receipt or real Meta dedup proof.

```sh
python3 scripts/test_release.py --sha HEAD \
  --evidence /absolute/private/evidence-directory \
  --php /absolute/native/php8-cli \
  --python /absolute/pinned-bridge-venv/bin/python
```

Install locked QA dependencies/browser before network denial. Targeted tests: `tests/capi-hardening.test.js`; native paired browser coverage: `tests/calm-browser.test.js`; disabled scheduler proposal: `tests/test_meta_retry_proposal.py`. Existing regional/attribution tests remain part of both full suites. No test must POST to live Meta, HighLevel, GA4 or CRM.

## Retry cron: proposal only, activation blocked

The audit found a commented cron and no active entries. This patch does not install, uncomment or invoke it. Generate a deterministic **commented** proposal:

```sh
python3 scripts/prepare_meta_retry_cron.py \
  --php /usr/bin/php \
  --env-file /home/cpanel-user/.joao-secure/joao-highlevel.env \
  --worker /home/cpanel-user/public_html/website/api/meta-capi-retry.php \
  --lock-file /home/cpanel-user/.joao-secure/meta-capi-retry.lock
```

These are placeholders, not verified production paths. The script has no install mode and writes no crontab. The proposed command uses `flock -n` to prevent overlapping scheduled workers. Review actual PHP CLI extensions/env access, cron owner, permissions, any existing scheduler and one bounded dry-run plan before installation. Manual and request-side writes are not made globally exactly-once by this proposal.

Activation is blocked until the owner approves: age/expiry handling under Meta's event-time acceptance window, operational monitoring, nonretryable error handling, and a late consent-withdrawal/suppression source. Existing stored consent cannot establish that a visitor has not withdrawn since enqueueing. Do not force old `event_time`, change IDs, flush historical pending jobs, or silently purge pending/dead files. Existing retry/dead retention remains unchanged; hashed identities plus raw IP/UA/fbp/fbc in retry payloads still require a separately approved retention/deletion policy. Current mode0700 directory/mode0600 payload protections are preserved and fixture-tested.

## After diff approval: separate controlled live proof

1. Obtain explicit release approval for the exact reviewed diff, backup/rollback and limited production artifact. Do not overwrite host-owned logging/env configuration. Build and reverify the authoritative release SHA and live baseline before promotion. No cron/config/test-event activation is implied by merge/deploy approval.
2. In the correct dataset's **Events Manager → Test Events** page, obtain the current code. If access is unavailable, request a screenshot showing dataset ID/name, Test Events code and the browser-event test panel (no access token or credential). Leave the working CAPI token unchanged.
3. Agree on one owner-approved synthetic email/phone and contact owner, alert/email handling, workflow safety and no-SMS gates before a real submission. The native handler still writes CRM and can alert; a test code does not disable those effects. Do not use a fabricated working phone or a stranger's contact.
4. In a dedicated controlled browser session prepare the native UI, preserve a fresh unpredictable request UUID for exactly that approved submission, and have the authorized operator set both server keys to that UUID/code. If the UUID cannot be bound safely before submit, stop; do not enable code-only or all-lead testing. Do not replace the real POST with a stub when claiming live pairing.
5. Verify granted ads consent, no GPC, one accepted native submission and its exact returned request/event ID. Verify one browser `Lead` and the server `Lead` in Test Events with identical IDs, receipt times and browser/server source indicators. Capture the dedup status/details; do not infer dedup from a payload alone.
6. Clear both server test settings, read back their blank/absent state without exposing secrets, verify later ordinary requests omit test code, and handle only the approved test CRM record/alerts under the agreed cleanup plan. No queue flush.
7. Separately report Meta receipt/dedup, internal accounting and Ads Manager attribution. Match quality, reporting delays, platform blocking and legal opt-outs mean CAPI cannot guarantee ad credit for every lead.

## Official references

- [Meta Using the API / Test Events](https://developers.facebook.com/docs/marketing-api/conversions-api/using-the-api)
- [Meta main-body parameters](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/main-body/)

Official documentation says `test_event_code` is testing-only, must be removed from production payloads, and events carrying it are **not dropped**: they still flow into Events Manager and can be used for targeting/ads measurement. It is not a safe way to broadcast all production leads into a test session.
