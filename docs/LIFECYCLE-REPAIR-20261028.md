# Lifecycle repair checkpoint — 2026-10-28

> Continuation supersedes the partial Google inventory and direct-offline candidate below: [complete all-status inventory, zero GA4 links, browser-linked GA4 implementation draft and current read-only Meta summary](GOOGLE-LIFECYCLE-DRAFT-20261028.md). No production release/provider test is claimed.

## Verified investigation, not a completed production repair

- Fresh origin lifecycle SHA256 `76434393cd81c49a682d44b44426b7809a32c2ef710affb6a32d08fb4efb6d71` matches main. Protected GA4 enable remains false; API secret absent.
- Trial Attended saved body binds `analytics_storage` to `{{contact.analytics_storage_status}}`, `ad_storage` to `{{contact.ad_storage_status}}`, and `ad_user_data` to `{{contact.ad_user_data_status}}`. Provider GET confirms these exact keys and mapped IDs exist as TEXT custom fields. Website producer emits canonical `granted` / `denied`. There is **no proven wrong current merge binding**.
- Oct 15 failure detail exposes `Invalid analytics consent.` but no request tab, serialized request value or numeric response code. Historical value remains unknown. Missing, invalid and unresolved values cannot be distinguished retrospectively from that error. No contact consent was changed, no fallback grant added, and no speculative native template repair saved.
- Independently reproduced malformed-type defect: array consent emits PHP coercion warnings; object consent throws Error (dispatcher would return 502). Draft code now rejects all non-string consent with the same controlled InvalidArgumentException. Canonical grants/denials unchanged. **This defensive fix is not established as the Oct 15 root cause.**

## Booked historical notice resolution

The reviewed audit PR #144 documents the Oct 1 old-version Unauthorized error and Oct 27 exact HTTP 200 / accepted / Meta accepted / GA4 disabled response. This is evidence that the historical authorization failure was superseded by working later delivery, not proof of current header-byte equality. Only Booked's historical review notice was marked read. A fresh list navigation/reload durably shows **Needs review (1)** with Trial Attended Webhook as the sole remaining row. No workflow save/publication or event replay occurred for this acknowledgment.

## Google discovery and release boundaries

Authenticated native account selection verified separate Joao client `719-415-4121` beneath ICDC `756-226-2368` (internal UI ocid `8444903753`, not customer ID). Google says all ads are paused/removed. Enabled-conversion table has exactly two rows: `Form` (Website, Needs attention, Primary, Every, 30 days, account-level Yes) and `Lead form - Submit` (Google hosted, No recent conversions, Primary, One, 1 day, account-level Yes). The table filter is **Status: All enabled**, so removed/disabled actions remain unverified. No enabled lifecycle action is shown. No campaign, budget, account default, conversion or import was modified.

Existing GA4 MP uses a request-HMAC-generated pseudonymous client_id, not the visitor's real GA4 client/session ID. It cannot honestly be advertised as original-session continuity or an Ads offline click upload. Do not import these lifecycle events into Ads as a shortcut or add a competing GHL Google sender. The proposed Ads owner is a single direct offline click-conversion route, secondary only, after an all-status action inventory and click-ID/consent/credential eligibility review. GA4's separate CRM reporting stream may retain the existing event map but stays disabled pending scoped secret, explicit release and controlled receipt validation. No provider debug POST, historical replay or backfill is authorized.

## Delivered artifact and verification

`tests/lifecycle-consent-runtime.php` exercises the actual PHP library in a no-curl CLI with mocked transport and socket/mail functions disabled. Booked, Attended and Enrolled fixtures cover canonical denial, malformed/empty/null/boolean/unresolved consent, no direct CRM identity in Google payloads, mapping, advertising denial, stable event ID and terminal destination behavior. Verified run: 69 assertions, three mocked Google requests, zero real provider requests under `unshare -Urn`; full Node suite 407 passed, zero failed/skipped under network isolation; Python suite 66 passed; preview build validator passed 5811 checks across 44 routes. The initial broad Node run before build/PHP/dependency setup failed for missing prerequisites; a later run timed out with no failures observed, and the final complete run passed. No production-mode full release is claimed.

Native workflows stayed Published and untouched; no native Draft is claimed. The source branch is an isolated review artifact, not a production release. Remaining gates: recover historical request if provider support can expose it; approve a specific future runtime test after root cause is proven; complete all-status Google/GA4 configuration inventory; review exact code/configuration and separately authorize production release and tests.
