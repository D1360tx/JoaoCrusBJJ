# Change report: already-live direct Lead CAPI hardening

2026-10-20. **Review-only; production unchanged.**

## Outcome and exact baseline

- Freshly fetched `origin/main`: `fc6ab359062b5342a830a045b82d720289cf9936`. The dirty canonical main worktree was left untouched.
- Isolated worktree: `/home/d1360/joao-capi-hardening-current`; topic branch: `fix/capi-hardening-current`.
- Implementation commit: `1cbdd9c56573b1f52ef9f391efdcafcc982db5f1` (the report is a subsequent docs-only commit).
- Existing direct CAPI, dataset `592714768141415`, working token, supported Graph `v23.0`, `Lead` and stable `lead_<request_id>` are retained. No second GHL sender, token rotation, analytics owner, SMS permission or policy change.

## Implemented diff

| Area | Exact change |
|---|---|
| `deploy/bluehost/api/lead.php` | Unified trusted pathname-only source URLs; strip all queries/fragments including relative/nested encoded PII; reject credentials/alternate ports/protocol-relative/contact-like paths. |
| Same handler | Independent `Sec-GPC: 1` advertising denial applied before CRM mapping and again before CAPI; omit fbp/fbc when denied. Private controlled denial log. |
| Three `site/assets/*` lead runtimes | Recheck latest advertising storage/user-data grants and browser GPC inside every deferred Pixel callback; retain exact dedup ID and duplicate suppression. |
| Same handler + example env | Blank-default two-key `META_CAPI_TEST_EVENT_CODE` plus exact `META_CAPI_TEST_REQUEST_ID` allowlist; single Lead only; no client activation or stale queued code. |
| Same handler + example env | Optional blank-default PII-free daily outcome counters, outside webroot, private 0700 directory/0600 file, nonblocking lock, bounded read and at most 31 UTC days. Best-effort processing-attempt counters, not guaranteed unique-lead accounting. |
| `scripts/prepare_meta_retry_cron.py` | Deterministic disabled/commented `flock` cron proposal only. No install mode, scheduler writes or worker invocation. |
| Fixtures/tests | Native PHP transport mocks, real Chromium native UI/JSON POST/handler pairing, URL/consent/GPC/test-scope/hashed fields/retry duplicate/counter safety coverage. |
| Decisions/README/runbook | Synchronized scope/configuration, official Meta testing caveat and exact approval/owner-contact/receipt gates. |

## Real verification

Evidence: `/home/d1360/joao-capi-hardening-evidence-current/release-code/results.json` and per-step logs, bound to implementation SHA above.

- Network proof: loopback-only namespace, no outbound routes, external connect returns `ENETUNREACH`. All release tests/builds ran in sanitized `unshare -Urn`; no live provider/CRM/mail sends.
- Native PHP **8.3.6**, locked Playwright **1.63.0** with actual Chromium.
- Preview build: **44 routes, 105 assets; 5,811 validator checks passed**.
- Preview full Node suite: **407/407 passed, zero skips**.
- Isolated production-mode build: **44 routes, 105 assets; 5,985 validator checks passed**.
- Production full Node suite: **407/407 passed, zero skips**.
- Python suite: **47 tests passed**, including two disabled-cron safety tests.
- Emitted four PHP API files lint clean; three changed JS assets pass syntax checks; `git diff --check` clean.
- Targeted combined Node run: **99/99 passed**, including **59 new hardening cases**. Existing regional consent and attribution suites also passed in both full runs.
- Native browser pairing is **mock-provider evidence only**. It verifies the real accepted PHP CAPI payload and browser Lead share the ID, not live Meta receipt/dedup or ad credit.

Initial full run exposed missing `PHP_BINARY` in the manual test invocation and minimal VM fixtures without `window.navigator`. The callback now handles absent navigator safely, both PHP variables are set by the established release job, and complete reruns pass. An initial Python environment lacked the bridge module; the existing pinned bridge venv used by the release job passed all tests. Failed initial evidence is retained rather than relabeled as successful.

## Deliberately not done / owner gates

- **No merge/deploy, production env/config/log/cron change, queue retry/flush, live lead, Meta/GHL/GA4 POST, alert/email/SMS send, workflow change or GTM publication.**
- Retry scheduling remains pending approval. No automatic pending/dead-file retention purge, event-time rewrite, stale-event replay, historical backfill, nonretryable queue redesign or late-withdrawal architecture was added. Existing private outbox payloads retain their current sensitive fields and require separate approved age/retention/withdrawal policy before cron activation.
- Counters are optional and default off. They do not establish historical denied counts, exact-once receipt, unique people or complete internal accounting under failure/lock contention. The prior audit's observed three intake/three receipt pairs are not a 100% advertising guarantee.
- Read-only Meta Test Events access was attempted with the dedicated real-profile browser session. Startup refused because the detected default browser is not a supported Chromium profile. No credentials, browser settings or permission grants were changed; no code or screenshot was obtained.
- Owner handoff: screenshot of dataset **592714768141415 → Test Events**, current test code and browser-test panel (never an access token); one approved contact/email/phone and owner; alert/workflow/no-SMS safety agreement; exact diff/release approval. Then perform one real native submission with the two-key UUID scope, inspect matched browser/server Lead IDs plus dedup status, clear/read back both test keys and complete agreed CRM cleanup. This patch does not claim those downstream gates passed.

Full operating contract: [docs/DIRECT-LEAD-CAPI-HARDENING.md](docs/DIRECT-LEAD-CAPI-HARDENING.md).
