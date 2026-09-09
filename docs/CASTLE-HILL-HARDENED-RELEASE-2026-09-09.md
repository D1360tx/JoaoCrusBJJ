# Castle Hill hardened release — 2026-09-09 UTC

## Status

**PASS for the authorized Windows-UA Castle Hill browser → GHL → GA4/Meta acceptance path.** One replacement synthetic lead was accepted with exact CRM readbacks, one GA4 `generate_lead` HTTP 204 plus Realtime receipt, and one browser Meta Lead sharing the accepted CAPI event ID. **Campaign, ad set and all 11 ads remain PAUSED / PAUSED.** Linux-desktop-only Bluehost rule 900401 is a user-accepted residual issue, not a launch blocker. Conversation/workflow scope and Meta provider-side deduplication reporting remain audit limitations, not fabricated passes. No second replacement submission, customer message action, security-rule change or activation was performed.

This supersedes the stopped engineering/deployment preflight in `CASTLE-HILL-READINESS-AUDIT-2026-09-08.md`, not that audit's unresolved launch/business gates.

## Follow-up diagnosis

See [the ModSecurity diagnosis](CASTLE-HILL-MODSEC-DIAGNOSIS-2026-09-09.md). Windows-UA valid browser submission now passes; macOS, iOS and Android UA invalid-only controls reach PHP; the original Linux desktop UA still receives 406. These are UA-path checks from WSL, not native-device certifications. The earlier scoped WAF trial remains rolled back. Bluehost remediation is a non-blocking compatibility follow-up under the user’s explicit decision.

## Exact release

- Source commit: `8480f5c497f75c4e95569e4b92c992a3d42b5f3f`, branch `feat/austin-youth-ay07-ay08-paused`, PR #117.
- Built from a fresh `git archive` of that commit. Production SEO/build ran only inside `/home/d1360/castle-repair-20260909/release`.
- Bluehost root: `/home1/joaocrus/public_html/website_6a4b95e5`.
- Deployment verified at **2026-09-09 04:35:53 UTC**.
- Complete artifact: **139 files**, manifest SHA-256 `6d454b3498289f3cfa9668703d6b5131531113ad16b72ea69d3fd53537f7ffcf`.
- Full-root rollback: `/home1/joaocrus/releases/castle-pre-8480f5c-20260909.tar.gz`, mode 0600, SHA-256 `e89ecb7e89c690d46e60c6d70b457a82f1d4a8f9ef221ce2c400bbefec341e69`; nonempty archive and tar integrity verified before promotion.
- Non-deleting, checksum-based complete overlay; assets first; full live manifest verification and zero-change residual rsync passed. Remote-only provider files preserved. No env/backend/GTM/Meta configuration change.
- Live baseline comparison found only the approved sanitizer changes, cache tokens, dedicated quiz changes, and one blank line left by the parent's banner removal. No unrelated runtime or schedule regression.

| Artifact | Live SHA-256 |
|---|---|
| `castle-hill-grand-opening/index.html` | `e4b7cf98013b7a149949f02ff9fb8adf206fe12518f9674f9129ad93cb1da6f9` |
| `austin-program-finder/quiz/index.html` | `042da18df80c33caae47e37b686218dc3aaf054d1f8d6ee9f032f9629b63a197` |
| `assets/austin-campaign.js` | `f175e633a11e830302fed9c7687147b4d9cecc31b29f34e316be9a2fc2d37462` |
| `assets/austin-program-fit-quiz.js` | `1cae9b756512bd718e177ed9b00aef0337869447f4b33616f1e99b8391a2490c` |
| `api/lead.php` (unchanged) | `888f2c7e148796c3677f97b2a0f46f2457964bac08736980afce1cbc869191ea` |

All four public HTML/JS artifacts returned HTTP 200 in real Chromium and matched the release bytes. PHP hash verified through origin SSH, not executed HTTP-body comparison.

## Repair and tests

- Connected Austin's quiz to `/api/lead.php` and replaced preview submit/contact/result messages together.
- Ported canonical consent-aware Meta context, explicit GA4 destination, browser Lead event-ID deduplication, delayed Pixel readiness, and strict response request/event-ID checks. Austin additionally requires `note_accepted=true`.
- Kept strict Youth age/Austin eligibility and adult/private routing intact. Accepted event routing avoids the legacy GTM `lead_submit_success` trigger.
- Fixed generated pre-GTM sanitization to preserve identifier-grammar numeric campaign/ad/click IDs; descriptive values still receive PII rejection.
- Extended landing-to-quiz handoff across the shared attribution-key list. Advertising `placement=feed` remains advertising context; the CTA's `hero/header/...` context is separately `cta_placement`.
- Preserved the removed Castle Hill banner and confirmed adult Tue/Thu 6–7 p.m. schedule. Noindex/sitemap exclusions retained.
- Certification documentation pass reran `node --test tests/program-fit-integration.test.js tests/highlevel-endpoint-contract.test.js`: **33/33 pass**, zero failures. `git diff --check` passed; all 53 documented readback rows were counted and validated programmatically.
- Focused Node suite: **54/54 pass**. Full exact-release Node suite: **130/130 pass**. Production validator: **5323 checks / 40 routes pass**. Origin PHP lint: lead.php and contact.php pass.
- Playwright: **40 viewport/scenario checks**, zero real POST attempts, zero runtime errors. New hardened suite: **6 consent/outcome cases** with entirely mocked lead responses and blocked third parties. Verified invalid input produces zero POST, all forwarded IDs/UTMs reach first/latest payloads when consented, one consented accepted GA4/Meta event, and no events on denial, failed response or wrong event ID. Those mock responses are test fixtures, not production acceptance evidence.
- Live pre-submit browser check: real modal, connected endpoint, consent grants, contact-last routing, invalid-input rejection and zero runtime errors. Hero screenshot confirms retained schedule and no draft banner.

## Historical first Linux synthetic attempt — NOT accepted

- Attempt window: **2026-09-09 04:38:21–04:39:00 UTC**.
- Clearly labeled identity: `SYNTHETIC DO NOT CONTACT`, non-deliverable `example.invalid` email and reserved fictional 202-555-0147 phone. No SMS checkbox consent.
- Local marker: `castle_synthetic_1788928701083`.
- Request ID: `bfec87aa-616f-4bea-8a46-edfe269b2b48`.
- Expected event ID: `lead_bfec87aa-616f-4bea-8a46-edfe269b2b48` (**not accepted or emitted**).
- One real browser lead POST returned **HTTP 406**, non-JSON. No accepted flags, no success screen. It did not reach a logged PHP acceptance/delivery operation: exact request-ID search of the private lead log returned no matches.
- Independent GHL exact-email search: **0 contacts**, trace `4219fa75-5a7b-4f8f-8a3a-c488cff4d008`. Broader unique-marker search: **0 contacts**, trace `f475e2ac-61a4-439d-b10c-09b5275438b8`.
- **Contact ID, opportunity ID, note ID: none returned.** Therefore 53-field writes, synthetic tags/owner/stage, task/message absence and staff-alert delivery cannot be claimed. No fabricated readbacks or cleanup operations.
- A separate non-lead guard probe with body `{}` also returned HTTP 406 and the exact server message: `This error was generated by Mod_Security.` This confirms a hosting-layer POST block for the QA path, not a GHL workflow-scope error. WAF/security configuration was not weakened.
- The synthetic browser's hash-verification navigations populated first touch before the UTM navigation; its epoch-numeric descriptive campaign marker was removed by the intentional PII filter. This attempt is **not** first-touch/unique-GA4-marker acceptance evidence even apart from HTTP 406. Before any separately approved retry, use a separate hash-check browser context and an alphabetic opaque marker; do not weaken descriptive PII filters to accommodate a QA marker.

## Historical first-attempt CRM safety/config and destination evidence

- Fresh origin read: protected env outside webroot, file 0600/directory 0700; strict field mapping enabled; **53/53 logical mappings** match actual GHL IDs/keys; configured **Prospect Enrollment / New Quiz Lead** exists.
- `GHL_ENABLE_TAG_ADD=true`, `GHL_ENABLE_SMS_RELEASE=false`, `GHL_ALLOW_CORE_ONLY=false`, `META_CAPI_ENABLED=true`. Source emits `website_lead`, `quiz_lead`, `automation_hold`. No SMS-release tag can be produced under the verified runtime flag.
- Workflow/tag inventory continues to return insufficient-scope 401. This did not stop engineering or deployment, but neither source tags nor config prove workflow execution.
- GA4 property `547238162`, destination `G-EW2F2YKR3Y`: realtime `generate_lead` query returned **zero rows both before and after** the rejected attempt. Browser captured **zero generate_lead transports**. This is not an aggregation-lag receipt claim.
- Meta Pixel `592714768141415`: captured **zero browser Lead transports**; no CAPI result/log exists for the rejected request. Shared-event-ID behavior is locally verified only; downstream deduplication remains unverified.
- Scanned captured GA4/Meta request URLs/bodies for synthetic name/email/phone: **zero matches**. First-party lead payload correctly contains synthetic identity; it is excluded from the analytics PII scan.

## Post-deploy paused proof

Independent Meta MCP reads after deployment and rejected submission returned configured/effective **PAUSED / PAUSED** for campaign `120251246135250072`, ad set `120251246144560072`, and all **11** unique ad IDs below. Campaign `daily_budget` remains `1000`. No Meta mutation was performed in this pass.

`120251261015960072`, `120251263002380072`, `120251261010900072`, `120251263139970072`, `120251260015140072`, `120251260015570072`, `120251260014790072`, `120251260015870072`, `120251261045730072`, `120251260015710072`, `120251260014400072`.

## Authorized replacement certification (2026-09-09 05:05 UTC)

The user authorized exactly one replacement with Windows Chromium UA after the Linux attempt created nothing. A fresh Playwright Chromium context on WSL used `Windows NT 10.0; Win64; x64`, with no hash-probe navigation contaminating first touch. This is Windows-UA browser evidence, not a claim that native Windows was used. The actual live Castle Hill landing → hero CTA → embedded Austin quiz → contact-last submit UI was exercised. Invalid form caused zero POST; the valid attempt caused exactly one. A persistent exclusive-create `WINDOWS-SYNTHETIC-CONSUMED` file and request guard prevent another replacement POST even if assertions fail.

- Window: **2026-09-09T05:05:10.865Z–05:05:49.291Z**; accepted at approximately **05:05:31 UTC**.
- Synthetic label `SYNTHETIC DO NOT CONTACT`, unique non-deliverable `example.invalid` identity, reserved fictional 202-555-0147; email consent granted, SMS unchecked. No real-person contact information used.
- Request ID: `d4a28f30-ce91-482c-991c-d195f461cece`.
- Shared Meta event ID: `lead_d4a28f30-ce91-482c-991c-d195f461cece`.
- HTTP **200**, JSON `accepted=true`, `contact_accepted=true`, `opportunity_accepted=true`, `note_accepted=true`, `meta_capi_status=accepted`; matching request/event IDs.
- Rendered result: **Youth BJJ**, “Your request has been received,” explicitly not a booking; Austin Tue/Thu 5:00–5:45 p.m. No preview/error wording and zero runtime errors.

### Exact GHL readbacks

- Contact **`zFGHIX1kLASZg2nLvEFH`**, created **2026-09-09T05:05:29.747Z**, location `PnNnRDAjstycMWpOmUn7`; assigned owner `vJgE7dMVAvCSPOxOv3n3`.
- Exact tags: **`website_lead`, `quiz_lead`, `automation_hold`**. The browser does not supply an arbitrary tag override: the gateway applies the hold. No `sms_nurture_ready`; origin flag **`GHL_ENABLE_SMS_RELEASE=false`**, tag addition true, strict map true (`GHL_ALLOW_CORE_ONLY=false`).
- Exactly one open opportunity **`OxJ4tQ9AizMt78PfzIZK`**, value **2832**, pipeline **Prospect Enrollment** `7A8TP4P8ySpolodQ49y1` → **New Quiz Lead** `c463c80e-4dbd-4ea5-8f38-1dc789b46b31`. Complete pipeline search enumerated **24/24**, one matching contact; exact opportunity GET independently confirms it. Contact is assigned; opportunity search reports `assignedTo=null`, with the owner as follower, not a claimed opportunity assignment.
- Exactly one note **`Q3GrI69eKarEIkOLKZwZ`**, title **Website Quiz Submitted**, timestamp **2026-09-09T05:05:31.530Z**, matching request ID, readable quiz fields, consent, both touch histories and extended advertising metadata.
- Tasks API: **0 tasks**, trace `8851051e-5c67-44e4-8958-1f9d97cf52fa`. Conversations API: **HTTP 401 insufficient scope**. Customer-message absence and internal-alert delivery are **not independently readable/proven**. No outbound message tool/action used; hold retained. Synthetic records retained for audit, not released or deleted.
- Initial exact-email/marker/phone searches unexpectedly returned empty despite accepted persistence. Recovery used the bounded pipeline inventory and exact-ID contact GET, not another submission. Contact MCP trace `228a3cb9-510a-4fb0-9f3b-19855228413f`; note `33a920ed-f10c-487e-befc-5bb78cdd0bd5`; opportunity `059975ba-5dd7-4d5c-bf97-d42896c0045d`. Do not interpret these empty search responses as missing delivery.

### Attribution and 53-field contract

All **53/53 configured logical field IDs/keys** match the live field schema; all expected values/absences were asserted against the captured payload and exact contact. **37 populated, 16 intentionally empty**, not 53 populated fields. The empty fields were not collected on this route: message/role/teen age/availability, and each touch’s five click IDs plus referrer host. No fabricated click identifier was introduced.

Both first/latest preserve these exact values: `utm_source=meta`, `utm_medium=paid_social`, `utm_campaign=castle_synthetic_jgggeewqbtyc`, `utm_content=SYNTHETIC_QA`, `utm_term=controlled_hold`, numeric `utm_id=120251246135250072`. Extended metadata survives in **both payload histories and the GHL note**, not dedicated custom fields absent from the configured 53-key map: `campaign_id=120251246135250072`, `campaign_name=castle_synthetic`, `adset_id=120251246144560072`, `adset_name=synthetic_hold`, `ad_id=120251263002380072`, `ad_name=SYNTHETIC_QA`, `placement=feed`, `site_source_name=ig`. CTA context remains separate `cta_placement=hero` in quiz URL. These are explicit synthetic metadata, not an attributed paid customer lead.

| Logical mapping | Exact persisted value (`—` = intentionally absent) |
|---|---|
| `schema_version` | `program_fit_v1` |
| `request_id` | `d4a28f30-ce91-482c-991c-d195f461cece` |
| `form_id` | `program_fit_quiz` |
| `lead_type` | `quiz` |
| `route_source` | `austin-program-fit` |
| `recommended_program` | `Youth · Ages 8–12` |
| `email_consent` | `granted` |
| `sms_consent` | `not_granted` |
| `consent_disclosure_version` | `program_fit_sms_v2` |
| `consent_timestamp` | `2026-09-09T05:05:29+00:00` |
| `audience` | `Child` |
| `child_count` | `1 child` |
| `age_bands` | `Youth · Ages 8–12` |
| `stage` | `Youth · Ages 8–12` |
| `goal` | `Safe boundaries and body control` |
| `experience` | `Completely new` |
| `preferred_location` | `Austin` |
| `submission_page` | `https://joaocrusbjj.com/austin-program-finder/quiz/` |
| `message` | — |
| `role` | — |
| `age` | — |
| `availability` | — |
| `first_utm_source` | `meta` |
| `first_utm_medium` | `paid_social` |
| `first_utm_campaign` | `castle_synthetic_jgggeewqbtyc` |
| `first_utm_content` | `SYNTHETIC_QA` |
| `first_utm_term` | `controlled_hold` |
| `first_utm_id` | `120251246135250072` |
| `first_gclid` | — |
| `first_fbclid` | — |
| `first_wbraid` | — |
| `first_gbraid` | — |
| `first_msclkid` | — |
| `first_landing_page` | `/castle-hill-grand-opening/` |
| `first_referrer_host` | — |
| `first_captured_at` | `2026-09-09T05:05:11.630Z` |
| `latest_utm_source` | `meta` |
| `latest_utm_medium` | `paid_social` |
| `latest_utm_campaign` | `castle_synthetic_jgggeewqbtyc` |
| `latest_utm_content` | `SYNTHETIC_QA` |
| `latest_utm_term` | `controlled_hold` |
| `latest_utm_id` | `120251246135250072` |
| `latest_gclid` | — |
| `latest_fbclid` | — |
| `latest_wbraid` | — |
| `latest_gbraid` | — |
| `latest_msclkid` | — |
| `latest_landing_page` | `/austin-program-finder/quiz/` |
| `latest_referrer_host` | — |
| `latest_captured_at` | `2026-09-09T05:05:22.134Z` |
| `analytics_storage` | `granted` |
| `ad_storage` | `granted` |
| `ad_user_data` | `granted` |

### GA4, Meta and privacy evidence

- GA4 property **547238162**, stream **G-EW2F2YKR3Y**: exactly **one** captured `generate_lead` request, **HTTP 204**, `form_name=program_fit_quiz`, `lead_type=quiz`, `program=youth_bjj`, `location=austin`, granted consent and the opaque campaign marker in `dl`.
- Independent GA4 Realtime Data API: pre-submit `generate_lead` **0 rows**; post-submit **1 event**, `minutesAgo=01`. This is downstream event receipt, not just a dataLayer push. Core processed report filtered to the exact campaign returns zero rows in two bounded reads (America/Chicago); processed campaign aggregation is not yet confirmed. Realtime does not join by CRM request ID; attribution linkage comes from the captured request and isolated timing.
- Meta dataset **592714768141415**: exactly **one browser `Lead`** in multipart `facebook.com/tr/` POST, **HTTP 200**, `eid=lead_d4a28f30-ce91-482c-991c-d195f461cece`. Parse multipart bodies: URL-only or URL-encoded parsing misses this event.
- Origin private log for the same request: **`meta_capi_accepted`**, provider trace **`Aq3saLhnG6s67C1byuYsV62`**. Live unchanged endpoint SHA `888f2c7e148796c3677f97b2a0f46f2457964bac08736980afce1cbc869191ea` logs this only on 2xx plus **`events_received=1`**. Raw Meta response was not separately retained; the accepted flag/log and exact deployed acceptance gate are the CAPI receipt evidence. The event ID is deterministically `lead_<request_id>` on the same server path. Matching outbox file absent; total pending JSON outbox **0**.
- **Deduplication contract PASS**: same dataset, event name and event ID across browser/CAPI. Meta’s internal post-processing/deduplicated-event UI result was **not independently inspected**; do not claim a provider-side dedup report or Ads Manager attributed lead.
- Plaintext synthetic name/email/phone scan of GA4 and Meta URL/body traffic: **0 hits**. Meta automatic advanced matching does include consented hashed/masked identity. Do not describe the Meta transport as containing no identity-derived data. No plaintext identity in analytics or private lead logs.

### Pause and residual issue verdict

Fresh post-submission Meta MCP readbacks: campaign **120251246135250072**, ad set **120251246144560072** and **11/11** unique ads listed above are **PAUSED / PAUSED**; daily budget remains **1000**. No Meta write, activation, GTM/env change, endpoint change or WAF exception was made.

**Strict verdict: PASS for the tested Castle Hill Windows-UA lead path, CRM contract, GA4 transport + Realtime receipt, and paired Meta browser/CAPI acceptance with matching deduplication IDs.** Not an unrestricted all-device or all-observability certification. macOS/iOS/Android UA invalid-only probes return PHP 400 JSON; Linux desktop UA still returns ModSecurity 406. Per explicit user decision, Linux-only rule 900401 is a documented non-launch-blocking compatibility residual. Conversations/workflow scope, processed campaign aggregation and Meta internal dedup UI remain explicitly unverified. Ads remain paused pending separate activation authorization.

Replacement evidence under `/home/d1360/castle-repair-20260909/`: `windows-e2e.cjs`, `windows-synthetic.json`, `WINDOWS-SYNTHETIC-CONSUMED`, `windows-synthetic-success.png`, `windows-crm-readback.json`, `windows-opportunities.json`, `windows-certification.json`, `windows-transport-summary.json`, `os-rejection-probes.json`. Raw synthetic/contact/browser evidence stays local, not in Git. No secrets exported.

## Historical evidence locations

The initial Linux-only acceptance blocker is superseded by the authorized replacement evidence. Keep Linux compatibility as a scoped Bluehost follow-up, not a launch blocker. Do not disable ModSecurity globally, activate ads, remove automation_hold, or submit another synthetic lead.

Local evidence: `/home/d1360/castle-repair-20260909/` contains `runtime.json`, exact build/test/validator outputs, `hardened-qa.json`, `austin-qa.log`, full artifact manifest, preflight/deploy logs, `live-browser.json`, `synthetic.json`, `SYNTHETIC-CONSUMED`, `guard-probe.log`, screenshots and `paused-proof.json`. Raw local browser evidence is not committed because it includes synthetic identity and advertising identifiers. No provider secrets exported.
