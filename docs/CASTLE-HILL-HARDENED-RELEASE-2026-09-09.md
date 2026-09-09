# Castle Hill hardened release — 2026-09-09 UTC

## Status

**Engineering repair deployed and hash-verified. Live synthetic acceptance BLOCKED by Bluehost Mod_Security HTTP 406. Traffic must remain paused.** Workflow/tag inventory HTTP 401 was treated as an audit limitation, not a deployment blocker. No security rule was disabled and no customer communication or second synthetic submission was sent.

This supersedes the stopped engineering/deployment preflight in `CASTLE-HILL-READINESS-AUDIT-2026-09-08.md`, not that audit's unresolved launch/business gates.

## Follow-up diagnosis

See [the ModSecurity diagnosis](CASTLE-HILL-MODSEC-DIAGNOSIS-2026-09-09.md): exact phase-1 rule 900401 identified; Windows UA rejection controls pass but the original Linux UA still fails. A backup-first exact-route exclusion trial was ineffective and rolled back. Bluehost administrative action is required; no second synthetic lead sent and traffic remains paused.

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
- Focused Node suite: **54/54 pass**. Full exact-release Node suite: **130/130 pass**. Production validator: **5323 checks / 40 routes pass**. Origin PHP lint: lead.php and contact.php pass.
- Playwright: **40 viewport/scenario checks**, zero real POST attempts, zero runtime errors. New hardened suite: **6 consent/outcome cases** with entirely mocked lead responses and blocked third parties. Verified invalid input produces zero POST, all forwarded IDs/UTMs reach first/latest payloads when consented, one consented accepted GA4/Meta event, and no events on denial, failed response or wrong event ID. Those mock responses are test fixtures, not production acceptance evidence.
- Live pre-submit browser check: real modal, connected endpoint, consent grants, contact-last routing, invalid-input rejection and zero runtime errors. Hero screenshot confirms retained schedule and no draft banner.

## Exactly one synthetic attempt — NOT accepted

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

## CRM safety/config and destination evidence

- Fresh origin read: protected env outside webroot, file 0600/directory 0700; strict field mapping enabled; **53/53 logical mappings** match actual GHL IDs/keys; configured **Prospect Enrollment / New Quiz Lead** exists.
- `GHL_ENABLE_TAG_ADD=true`, `GHL_ENABLE_SMS_RELEASE=false`, `GHL_ALLOW_CORE_ONLY=false`, `META_CAPI_ENABLED=true`. Source emits `website_lead`, `quiz_lead`, `automation_hold`. No SMS-release tag can be produced under the verified runtime flag.
- Workflow/tag inventory continues to return insufficient-scope 401. This did not stop engineering or deployment, but neither source tags nor config prove workflow execution.
- GA4 property `547238162`, destination `G-EW2F2YKR3Y`: realtime `generate_lead` query returned **zero rows both before and after** the rejected attempt. Browser captured **zero generate_lead transports**. This is not an aggregation-lag receipt claim.
- Meta Pixel `592714768141415`: captured **zero browser Lead transports**; no CAPI result/log exists for the rejected request. Shared-event-ID behavior is locally verified only; downstream deduplication remains unverified.
- Scanned captured GA4/Meta request URLs/bodies for synthetic name/email/phone: **zero matches**. First-party lead payload correctly contains synthetic identity; it is excluded from the analytics PII scan.

## Post-deploy paused proof

Independent Meta MCP reads after deployment and rejected submission returned configured/effective **PAUSED / PAUSED** for campaign `120251246135250072`, ad set `120251246144560072`, and all **11** unique ad IDs below. Campaign `daily_budget` remains `1000`. No Meta mutation was performed in this pass.

`120251261015960072`, `120251263002380072`, `120251261010900072`, `120251263139970072`, `120251260015140072`, `120251260015570072`, `120251260014790072`, `120251260015870072`, `120251261045730072`, `120251260015710072`, `120251260014400072`.

## Remaining blocker and evidence locations

Resolve the Bluehost Mod_Security POST rejection through a scoped hosting rule/egress diagnosis before traffic activation. Do not disable ModSecurity globally or silently consume another synthetic test. No CRM/CAPI/GA4 downstream acceptance can be claimed until that path succeeds.

Local evidence: `/home/d1360/castle-repair-20260909/` contains `runtime.json`, exact build/test/validator outputs, `hardened-qa.json`, `austin-qa.log`, full artifact manifest, preflight/deploy logs, `live-browser.json`, `synthetic.json`, `SYNTHETIC-CONSUMED`, `guard-probe.log`, screenshots and `paused-proof.json`. Raw local browser evidence is not committed because it includes synthetic identity and advertising identifiers. No provider secrets exported.
