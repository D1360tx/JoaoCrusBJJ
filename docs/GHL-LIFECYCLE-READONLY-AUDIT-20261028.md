# Joao GHL lifecycle: bounded read-only audit

Audit date: 2026-10-28, America/Chicago. Origin read 19:13:49 UTC. Fresh native workflow-list reload, three exact builders and execution-log pages inspected. **Follow-up resolved the native Needs review explanation and exact Attended error; see the superseding targeted follow-up section below. Remaining parity/auth/Google Ads gaps are explicit.** No repair or publication is authorized by this report.

## Outcomes

- All three exact native names are **Published**, not Draft: **Trial Booked Webhook**, **Trial Attended Webhook**, **Enrolled Webhook**. Their list update times remain Oct 1. The refreshed list does not append “need review” to these names. No matching “need review” explanation was exposed by the collected native accessibility evidence. It is **not established** whether the user’s flag is manual, a different view, or a provider warning. Do not infer an HTTP error or deprecated-action migration from that phrase.
- **Trial Attended has a genuine recent Failed execution**, despite the subsequent workflow Finished row. Latest webhook status Failed, Oct 15, 10:55:41 am; workflow Finished 10:55:42 am. Earlier Executed webhook Oct 1, 8:50:17 pm. Exact HTTP status/body and failure cause were not extracted. “Finished” therefore does not mean successful delivery.
- **Trial Booked** latest webhook Executed Oct 27, 5:06:26 pm; Finished 5:06:27 pm. Previous Executed Oct 26, 10:24:39 pm and Oct 21, 3:27:04 pm. **Enrolled** latest Executed Oct 16, 4:31:01 pm; Finished 4:31:02 pm. Previous Executed Oct 13, 4:40:13 pm and Oct 6, 10:00:20 am. These are native displayed dates/times; underlying response HTTP codes, durations and real-versus-synthetic contact provenance were not independently certified.
- **Enrolled sends to Meta but not GA4 through this endpoint.** Current private config: Meta enabled, correct dataset, token present; GA4 Measurement Protocol disabled, GA4 API secret absent. Google Ads delivery/import is independently **unverified**, not proven by a GA4 property link or Meta receipt.

## Exact targets and current list state

| Workflow | ID | Published | Total / active enrolled | Last updated, native display |
|---|---|---|---|---|
| Trial Booked Webhook | `492fbd01-7af0-411d-b703-9907ade47516` | Yes | 13 / 0 | Oct 01 2026, 8:47 PM |
| Trial Attended Webhook | `78a16208-1c7b-47c9-8e23-f4a11628358f` | Yes | 2 / 0 | Oct 01 2026, 8:50 PM |
| Enrolled Webhook | `e385c052-e7e6-4a09-965d-f4ca4a4ebca6` | Yes | 5 / 0 | Oct 01 2026, 8:50 PM |

Account name Joao Crus Brazilian Jiu-Jitsu and location `PnNnRDAjstycMWpOmUn7` verified natively before builder interaction. Exact URLs reconcile IDs with current names. The initial pre-reload cached Booked count was 11; freshly reloaded/final count is 13. Do not attribute that difference to this audit or use the cached count as fresh evidence.

All three visible graphs contain a pipeline-stage trigger and one POST Opportunity Lifecycle Webhook action leading to END. Trigger summaries show Prospect Enrollment and website_lead with one additional collapsed predicate. Booked and Attended action panels show Custom webhook, POST, application/json, `opportunity_lifecycle_v1`, correct fixed pipeline/stage/lifecycle keys and `{{opportunity.id}}`. Enrolled action panel was inspected similarly but its full panel capture was not retained. No native Google Ads action was visible in these graphs. Full trigger admission predicates, settings, saved-versus-unpublished revision parity, current bearer-value equality, retry configuration and complete merge-field validity are **not certified**. Only read-only panels were opened and cancelled; no fields were edited or saved.

## Origin and Meta evidence

Fresh live lifecycle.php SHA256: `76434393cd81c49a682d44b44426b7809a32c2ef710affb6a32d08fb4efb6d71`.

Current stage map preserves **all four required keys**, including qualified. Trial Booked → Schedule, Trial Attended → TrialAttended, Enrolled → CompleteRegistration; each Meta payload includes custom_data.lifecycle_stage. No Purchase/payment claim. The code uses a stable HMAC of actual opportunity ID plus stage, destination checkpointing and a private ledger. Meta acceptance requires curl success, HTTP 2xx and events_received exactly 1. Endpoint accepted/HTTP 200 can also accompany a disabled or consent-denied destination, so it is not proof both providers received an event.

Fresh ledger census: 18 entries overall. In the rolling 30-day updated_at window: **11 trial_booked Meta accepted / GA4 disabled; 1 trial_attended Meta accepted / GA4 disabled; 5 enrolled Meta accepted / GA4 disabled**. One older qualified entry is Meta consent_denied / GA4 disabled. No failed-state ledger entries were observed. The Attended Oct 15 Failed execution has no corresponding new accepted receipt in this census; failure before ledger creation remains possible, not proven.

Latest ledger receipt times UTC:
- Booked: Oct 27 22:06:26, Oct 27 03:24:38, Oct 21 20:27:04.
- Attended: Oct 2 01:50:16.
- Enrolled: Oct 16 21:31:01, Oct 13 21:40:12, Oct 6 15:00:20.

These are transport/checkpoint update times, **not necessarily stage-transition times or original receipt times**; retries can refresh updated_at. Receipt provenance was not joined to private opportunity IDs, so these counts are not independently certified genuine-customer counts or complete historical funnel totals. Native execution times and ledger times align at the aggregate/date layer; no exact event-level identity correlation is claimed. Meta Events Manager/custom-conversion definitions were not independently inspected. Ledger acceptance proves the endpoint recorded Meta API acceptance under this source contract, not ad credit, matching quality, a specific custom-conversion rule firing or current Events Manager counts. Browser/Server Lead acceptance from Oct 26 is separate from these lifecycle events.

Config secret values were never printed. Only presence/length booleans inspected. Secret and salt present and at least 32 characters; env mode 0600, secure/ledger directories 0700, ledger outside webroot. Stored current GHL auth-header equality remains unproven; past success does not establish current saved credential parity.

## Google: GA4 versus Ads

Current server GA4 MP enable flag is false; API secret is absent. Implemented mapping is qualify_lead / trial_booked / trial_attended / close_convert_lead. This is a pseudonymous CRM stream, not original browser-session continuity. Source has no direct Google Ads offline conversion upload; it does not implement a gclid/wbraid/gbraid conversion-upload path.

Fresh GA4 Data API report for property 547238162, Sep 28–Oct 28 inclusive (today partial; America/Chicago), returned 17 event-name rows, no sampling metadata and no other-row loss. generate_lead=40, page_view=1205, booking_start=45. None of qualify_lead, trial_booked, trial_attended or close_convert_lead appeared. That supports no observed lifecycle receipt in the requested reporting window, not universal absence across every property/path. Browser lead measurement continues; this does not mean all Google measurement is broken.

list_google_ads_links returned an empty result string, not an explicit parsed zero-link inventory. Treat Ads linkage and conversion-action import/primary status as unverified. No Google Ads account/goals UI was inspected. A future separately approved plan must choose and verify one conversion owner/path, identifiers and consent, rather than simply turning on MP or uploading historical records. No enablement, secret creation, upload or backfill was attempted.

## Access and evidence limitations

MCP context confirmed read-only/pinned capabilities; list_workflows returned HTTP 401. Native fallback was used, not abandoned at 401. Hermes computer_use wrapper twice timed out on manifest startup, while the existing driver CLI returned fresh Windows discovery. Native Windows UI Automation selected the exact discovered workflow tab in HWND 985686 and verified the location; no browser-profile attachment, auth export or settings workaround was used. No login prompt was encountered.

Sanitized local evidence is in `/home/d1360/joao-ghl-lifecycle-audit-current/`: origin-sanitized.json, refreshed/final native list, exact builders/action panels, and log status/date allowlists. No screenshots, credentials, raw contacts, payload identities or provider headers retained. HTTP bodies, exact need-review provenance and exact real-contact receipt correlation are **remaining acceptance gaps**, not fabricated passes. Bounded audit ended without retrying/sending any event.

## Change boundary

No workflow save/publish/test/enroll/retry, contact/stage/consent/message change, CAPI send/resend, Google upload, env/origin write, deployment, or old-PR action. Only local sanitized evidence and a new docs-only review branch/PR were created. Existing automatic business activity was not paused. No claim of provider-wide collateral-state census or global zero customer sends is made from this bounded inspection.


## Targeted native follow-up: exact Needs review and delivery bodies

Follow-up observed 2026-10-28, completed by 19:44 UTC, same verified Joao location and native HWND 985686. **This section supersedes the earlier unknown need-review/body findings above.** No Mark as read, save, publish, retry or test was clicked.

- **Needs review (2) is a native GHL list tab, not a manual workflow-name prefix.** Its literal explanation is: “Workflows with errors in the past 30 days which are not resolved are listed below.” It contains exactly Trial Attended Webhook and Trial Booked Webhook; Enrolled is absent. The rows expose Mark as read controls, left untouched. Native review-list Last occurred displays Oct 15 2026, 3:55 PM and Oct 02 2026, 1:38 AM respectively. These differ from the execution log's explicit account CDT (-05:00) display; preserve both displayed clocks rather than misdate an execution.
- **Attended failure, Oct 15 2026 10:55:41 am CDT:** actual View details → Event Details → Message reads exactly `Custom Webhook Action error: Custom Webhook Action error: {"accepted":false,"error":"Invalid analytics consent."}`. This is an explicit consent-validation rejection, not an inferred credential error. The next Finished row at 10:55:42 is End Of Workflow, not delivery success. The native detail panel exposes the error body but **no numeric HTTP status** for this failed event. Exact submitted consent value and historical contact consent were not read; blank/invalid merge or encoding cause is not yet established, and consent must not be changed to bypass it.
- **Booked review error, Oct 1 2026 8:38:36 pm CDT:** detail panel states “This execution is from an older version of the workflow.” Message: `Custom Webhook Action error: Custom Webhook Action error: {"accepted":false,"error":"Unauthorized."}`. Another failed row at 8:30:29 pm was visible but its body was not opened. The old-version error must not be presented as proof the current header is wrong. Needs review can retain historical unresolved/unread errors despite newer successful deliveries.
- **Booked latest success, Oct 27 2026 5:06:26 pm CDT:** Event Status Success; native message JSON has `status:200`, `data.accepted:true`, `data.lifecycle_stage:"trial_booked"`, `data.meta_status:"accepted"`, `data.ga4_status:"disabled"`, plus a stable pseudonymous event_id (omitted here). This is execution-specific endpoint-recorded Meta acceptance, not merely an Executed label and not Google delivery.
- **Enrolled latest success, Oct 16 2026 4:31:01 pm CDT:** Event Status Success; native message JSON has `status:200`, `data.accepted:true`, `data.lifecycle_stage:"enrolled"`, `data.meta_status:"accepted"`, `data.ga4_status:"disabled"`, plus a stable pseudonymous event_id (omitted). Enrolled therefore has direct execution-specific Meta accepted / GA4 disabled evidence. Google Ads import/goals remain unverified independently.
- All inspected headers visually read **Saved**, and the refreshed list remains Published. This is no visible unsaved-change indicator, **not** serialized saved-versus-published revision equality. No auth header was opened/exported, so current secret equality remains unknown. No exact opportunity-ID/HMAC-to-ledger join or customer-provenance certification is claimed.

Sanitized image crops and `targeted-followup.json` are in the local evidence directory; crops remove all contact details, address-bar query identities and unrelated tabs. The actual failed-event body was opened, not abandoned at the list/status layer. Remaining bounded gaps are failure numeric status, exact historical consent input/provenance, current credential equality, serialized published parity, ledger identity join and Google Ads goals/import.
