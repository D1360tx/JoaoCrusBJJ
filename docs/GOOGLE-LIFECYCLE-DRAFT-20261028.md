# Google lifecycle route: disabled implementation draft

## Later authorized continuation and current blocker

Diego subsequently authorized the complete bounded lifecycle repair, deployment, configuration and owned-fixture test. Earlier no-write/no-test statements in this dated draft describe the earlier authorization only.

**Completed external configuration:** GA4 property `547238162` is now linked to the distinct Joao Ads client `7194154121`, not the ICDC manager. The native Completed (1) table shows Joao, the exact client ID, account type Account, Personalized Advertising Disabled, and the October 28 link date after closing the creation sheet and reloading. Embedded Analytics edit access was explicitly disabled. No conversion action, Primary goal, budget or campaign was changed.

**Major owner-action gate:** the verified web stream `15334887785`, measurement ID `G-EW2F2YKR3Y`, has zero MP secrets. Create is disabled until **User Data Collection Acknowledgement** is accepted. The text certifies necessary privacy disclosures and end-user rights for processing and association with GA visitation information. The agent reviewed but cancelled this attestation without accepting it. The owner must review/complete that policy acknowledgment before secret creation. No credential was generated, no protected env was changed and production GA4 remains disabled. Do not ask for a secret in chat.

**Offline timing correction:** [Google's official MP use cases](https://developers.google.com/analytics/devguides/collection/protocol/ga4/use-cases), retrieved October 28 (page updated October 26), explicitly supports offline-event export to advertising platforms **without session_id**, no later than 63 days after the latest online event for that client, within the configured key-event attribution window, with event timestamps within 72 hours. Original-session attribution instead requires session context and submission within 24 hours, with event time inside that session. Therefore the candidate requires a genuine browser client ID, treats the session ID as optional intake context, and omits it and synthetic engagement time from offline stage payloads. A late enrollment is not falsely attached to an old browser session. Actual processed receipt/ad attribution remains unverified; never invent a click or backdate the outcome.

Current candidate verification: actual PHP fixture **92 assertions**, three mocked Google requests, zero real requests; targeted browser linkage **7 passed**; rebuilt preview validator **5811 checks across 44 routes**; complete network-isolated Node suite, run sequentially to avoid competing Chromium-fixture timeouts, **414 passed, 0 failed/cancelled/skipped**. This clean run supersedes the earlier mixed 412/1 run below, without erasing that historical result. Production build/deployment and destination receipt remain unrun at the owner policy gate. First-touch preservation, live field IDs, workflow mappings, scoped secret, key event/import and real controlled receipt are still release work; the GA4/Ads link alone does not complete the repair.

## Verified inventory

Native Google Ads, customer `719-415-4121` beneath ICDC `756-226-2368`, was checked with **Status: All**, not All enabled. Pagination reads **1 - 2 of 2**. Both rows are enabled; there are no additional disabled/removed rows in this inventory:

| Action | Goal category | Source | Tracking | Optimization | Counting | Click window | Account default |
|---|---|---|---|---|---|---|---|
| Form | Submit lead forms | Website | Needs attention | Primary | Every | 30 days | Yes |
| Lead form - Submit | Submit lead forms | Google hosted | No recent conversions | Primary | One | 1 day | Yes |

Both show 0.00 all conversions and value for the displayed all-time July 30–October 28 interval. No lifecycle action/import exists in this complete action list. None of the account's ads are running. Only the table-view filter changed; no conversion/bidding/default-goal setting changed. Private evidence: `google-ads-all-status-inventory.json` and its screenshot in `/home/d1360/joao-lifecycle-repair-current/`.

The read-only GA4 property response confirms `properties/547238162`, Joao Crus BJJ, America/Chicago, USD. The last-28-days-through-yesterday event report contains 16 event names, including `generate_lead` (38), but none of `qualify_lead`, `trial_booked`, `trial_attended`, `close_convert_lead`. This is report-window evidence, not a lifetime claim. The installed links tool returned an empty string twice, not a structured link list; native verification then resolved the ambiguity: exact Joao property `547238162` has **Completed (0), Approval needed (0), Request sent (0), Cancelled (0)** and says **No links yet**, pagination 0 of 0. Customer `7194154121` is therefore not linked. No Link action was taken. Local ADC refresh failed; no credentials were printed or changed. No Google Ads conversion connector/developer-token environment was available in this worker.

## One implementation, never two competing senders

This draft supersedes the previous *direct offline click conversion candidate*. The implemented candidate is website browser GA identity → HighLevel contact fields → existing lifecycle endpoint → GA4 Measurement Protocol. An eventual **single GA4 enrollment import** is secondary-only and blocked on exact property/client linking and native key-event/import review. There is no direct Google Ads uploader and no native GHL Google sender. Do not run a second sender for the same business outcome.

- Shared frontend reads the public `gtag('get', 'G-EW2F2YKR3Y', ...)` client/session API with a 350 ms bound. No GA cookie-format parsing, invented ID, identity from email/phone/CRM IDs, new storage, or lead-blocking wait. Analytics consent is required independently of advertising consent and is rechecked on callback completion and before intake.
- Campaign forms and both quiz submission paths attach the optional IDs to the existing `meta` context, which already carries the three granular measurement-consent states. Backend only flattens strictly formatted IDs while analytics consent is granted.
- Configuration template adds logical `ga_client_id` / `ga_session_id` mapped to proposed TEXT keys `contact.ga_client_id` / `contact.ga_session_id`. **These are proposed schema keys, not verified live fields.** Their IDs remain placeholders. Do not deploy this template or assume live fields exist.
- After schema creation/read-back is separately approved, all four existing stage webhook bodies must add `ga_client_id: {{contact.ga_client_id}}` and `ga_session_id: {{contact.ga_session_id}}`. This document does not save or publish those workflows.
- Lifecycle normalization validates optional browser IDs. GA4 now refuses delivery without both IDs (`missing_browser_identity`) rather than manufacturing request-HMAC client identities. Missing browser identity is terminal for GA4 only; existing accepted/disabled/denied ledger states remain terminal. No old event is reopened or backfilled; Meta logic is untouched.
- Existing event mapping remains `qualify_lead`, `trial_booked`, `trial_attended`, `close_convert_lead`. Enrollment is not Purchase. Only enrollment is proposed for one eventual Ads secondary import; diagnostic stages are not additional Ads conversions.

Browser ID continuity is not a guarantee that a delayed CRM outcome is attributed to its original session or ad click. Google's session-association/time-window constraints still apply. An offline outcome days later must not be reported as proven ad attribution simply because identifiers were retained. Live provider validation, destination receipt and actual Ads attribution remain untested and unauthorized here. Do not fake session engagement or shift a stage timestamp to make it appear within an attribution window.

## Release gates (all remain off)

1. Verify GA4 link to customer `7194154121`, stream `G-EW2F2YKR3Y`, key-event state and no existing competing import.
2. Approve/read back the two TEXT fields, protect original acquisition identity on repeat leads, install exact field IDs, and approve/save the four webhook body additions. Historical consent failure remains unproven and is not repaired by adding Google IDs.
3. Generate/store a property-stream-scoped GA4 MP API secret through the owner-approved route, outside webroot; production enable remains false until separate release approval. Do not include secrets in repository, logs or URLs in reports.
4. Review consent withdrawal between intake and stage change, timestamp/session eligibility, original identifier preservation and per-destination retry behavior. Missing IDs are a safe skip, not successful conversion delivery.
5. Separate approval for deployment, a single controlled contact/stage test, provider validation/receipt and deduplication. No historical replay. Only after verified receipt may one enrollment key event / secondary Ads import be approved. No Primary action, bidding/default-goal change or spend activation.

## Offline verification

- Actual PHP intake flattening/custom-field emission and lifecycle sender: **89 assertions**, three mocked Google requests, zero real requests in an isolated network namespace with curl absent and socket/mail functions disabled.
- Targeted Google/browser-consent + lifecycle contract run: **15 passed**. Includes callback timeout, revocation, ad-only consent, malformed/unresolved identity, no synthetic fallback and preserved browser client/session IDs.
- Broad Node run after rebuilding and configuring the actual PHP fixture binary: **412 passed, 1 failed, zero skipped**. The sole failure was a 5-second click timeout before the static accepted-form submission; that exact test passed on isolated rerun. This is not described as a single clean 413-test suite. Earlier broad attempts lacked required PHP fixture environment and were interrupted; they are not acceptance evidence.
- Python suite: **66 passed** using the configured GA4 bridge virtualenv. Preview build validator: **5811 checks passed across 44 routes**. No production build/deployment or destination receipt is claimed.

## Independent current Meta check (read-only worker)

The parallel audit's sanitized status verifies dataset `592714768141415` Lead active. September 30–October 27 source counts are Browser 37, direct CAPI 41, CAPI with Meta 37; matching quality 9.3. The current deduplication/coverage panel says Still Parsing Your Data, so no current rate is certified. Diagnostics shows no errors in the last three days. October 26's explicit Browser Processed / Server Deduplicated evidence remains valid historical proof. The existing Meta-hosted connection is Active alongside the direct sender: audit separately before any change, never disable it speculatively. No new submission or production mutation occurred in that audit.
