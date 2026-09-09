# Castle Hill landing page and Austin quiz readiness audit

Audited 2026-09-08 CDT / 2026-09-09 UTC. Verdict: **NOT ready for lead acquisition. The public page opens a deliberately disconnected preview quiz.**

## Authorized repair preflight: safely stopped, not deployed

The subsequent user authorization permits full repair, a backup-first production deployment, and one controlled synthetic lead with naturally triggered staff notifications, but no customer SMS or traffic activation. **The funnel is still not repaired or end-to-end verified.**

Fresh Meta MCP reads contradicted the earlier all-paused snapshot: AY09A `120251263139970072`, AY09B `120251263002380072`, AY07 `120251261010900072`, AY08 `120251261015960072`, and ad set `120251246144560072` were configured ACTIVE, although the campaign pause prevented delivery. Under the explicit keep-paused authorization, these five objects were set to PAUSED. Independent subsequent MCP reads confirmed all eleven campaign ads, the ad set, and campaign `120251246135250072` are **PAUSED / PAUSED**. Initial ad readback briefly showed IN_PROCESS; the final readback settled PAUSED. Do not restore the prior ACTIVE child states as a rollback.

The safety gate remains unverified: workflow MCP returned HTTP 401, `The token is not authorized for this scope`; the tags connector then entered its failure circuit breaker. The signed-in HighLevel browser fallback failed before navigation because the user's default browser is unsupported by real-profile Browser Use. Thus this pass could not establish workflow suppression or observable staff-notification evidence before exercising the authorized synthetic lead. No synthetic submission was consumed, no contact/opportunity created, and no staff/customer message intentionally triggered. Restore an operable authorized HighLevel read path before proceeding with the live acceptance test; do not infer safe workflow behavior from `automation_hold` being present in source.

Production was not written. The parent's removed banner, adult schedule and integrations were left untouched. Origin SSH readback before and after this preflight returned identical hashes:

| Exact target | SHA-256 |
|---|---|
| `castle-hill-grand-opening/index.html` | `3743c15197f31107aa80913ecfdc3840a0154f1b80fb370fbffae73fe87f09ca` |
| `austin-program-finder/quiz/index.html` | `2110c09bc75dbdb246b588aacee47aea82f35ac05ca04965a095cd46c04722ef` |
| `api/lead.php` | `888f2c7e148796c3677f97b2a0f46f2457964bac08736980afce1cbc869191ea` |

Secure directory/file modes read back 0700/0600. A later boolean-only runtime probe encountered an SSH disconnect and produced no result; a minimal SSH retry succeeded. The earlier audit's SMS-release-false observation is not promoted to a fresh configuration read. No env change occurred. No new production build, PHP lint, deterministic browser test suite, GA4 conversion receipt or Meta deduplication acceptance was performed in this stopped pass. The historical test results below are not new repair evidence. No website rollback is needed because no website deployment occurred; keep the corrected Meta pauses in force. An unrelated account campaign was observed ACTIVE and was not changed because this repair is scoped to Castle Hill.

## Scope and safety

Read-only origin SSH, public browser loads, harmless choice interactions through question 4, public endpoint GET, provider GET APIs, isolated local builds/unit tests, and a pure extracted payload-function harness. No contact details entered into the live browser; no live form submit, lead/conversion event, contact/opportunity mutation, owner alert, Meta campaign mutation, GTM publication, or production write performed by this auditor. Ordinary GA4/Ads/Meta page/diagnostic traffic was allowed only for the initial safe transport probe. A separate privacy/UTM probe blocked all third-party destinations and mocked country lookup explicitly. Browser isolation used a new Playwright context, not the user's desktop/profile.

Parent agent separately owns the explicitly authorized removal of the public landing-page draft banner. Its post-release evidence must supersede this audit's pre-change banner snapshot. This auditor did not deploy or race that write.

## Verdict matrix

| Layer | Verdict | Evidence / limitation |
|---|---|---|
| Deployment provenance | Verified pre-banner-change | Bluehost `deploy-source` clean at `5c34d717a30b153f3b83c990d27153bf09ac4a0c`; origin release provenance names same SHA. Fresh exact-SHA production build matches origin landing HTML, quiz HTML, lead.php and four critical JS assets byte-for-byte. |
| Public availability | Verified | Real isolated Chromium: landing 200, same-origin modal quiz loads. Raw curl/Python got Bluehost 406; browser succeeded. |
| Landing-to-quiz | Verified, wrong readiness state | Five CTAs target `/austin-program-finder/quiz/`, `source=austin-program-fit`, `embed=1`, `start=quiz`, unique CTA placement. Actual iframe root has `data-endpoint=""`. |
| Lead delivery from this quiz | **Blocked** | Public HTML says `Austin comparison preview. No request is sent`, `Preview my Austin class plan`, and `Preview only. No request was sent`. Empty-endpoint branch returns before fetch. Cannot create GHL leads. |
| Base measurement | Transport verified | Published GTM resource version **13**, container `GTM-596MGPMD`; GA4 `G-EW2F2YKR3Y`; Ads `AW-18361192908`; Meta Pixel `592714768141415`. GA4 collection, Ads page/config requests and Meta PageView transport captured. |
| Quiz measurement | Application + transport verified | Actual `quiz_start` and question 1–4 `quiz_step_complete`, `quiz_name=program_fit_preview`, source `austin-program-fit`. Stage answer is `not_collected`, not age/free text. GA4 POST batch contains all four step events. |
| GA4 downstream receipt | Limited verified | Read-only Data API, property 547238162, Sept 6–8, exact Austin quiz path: quiz_start 3, quiz_step_complete 4, page_view 3, scroll 2, form_start 1, user_engagement 1. No generate_lead row. This is aggregate path receipt, not unique audit-session matching or conversion acceptance. |
| Consent | Core behaviors verified; identifier caveat | Real US resolved standard/granted. User denial persisted across reload; attribution removed. Controlled DE and failed lookup stayed denied with no GTM attempt and no storage. Controlled US+GPC retained analytics but denied ads. **fbclid nevertheless persisted in generic attribution with ads denied**; review against advertising-identifier policy. |
| Basic UTMs | Partially verified | source/medium/campaign/content `AY09B`/term and safe fbclid survived five CTA URLs and iframe. First touch remains landing, latest becomes quiz. 90-day durable attribution is consent-controlled. |
| Numeric attribution IDs | **Blocked** | Pre-GTM HTML sanitizer applies phone-pattern rejection to all values: numeric `utm_id`, `campaign_id`, `adset_id`, `ad_id` removed before attribution executes. Live controlled probe proved loss. `attribution.js` already has identifier-aware validation, but inline bootstrap does not. |
| Extended handoff | **Incomplete** | `austin-campaign.js:2` forwards only 8 fields; campaign/ad IDs/names, site_source_name, wbraid/gbraid/msclkid absent. Incoming `placement=feed` becomes CTA `placement=hero`; site_source_name=ig survives first storage touch but disappears from latest touch. Separate ad placement from CTA placement. |
| GHL runtime prerequisites | Verified config/read scope | Protected env outside root, file 0600, directory 0700; token/location/pipeline/stage/owner/map present, valid rate-limit salt. Strict map enabled, tag addition enabled, SMS release false. Origin token GET confirms configured `Prospect Enrollment` / `New Quiz Lead`. |
| GHL custom-field IDs | Verified existence, not writes | **53/53** runtime logical mappings match actual provider IDs+keys. Includes route, recommendation, audience, location, email/SMS consent, disclosure/timestamp, first/latest 14-field attribution groups and analytics/ad consent fields. No lead was written. |
| GHL extended fields | Gap | Runtime map has no first/latest campaign_id/name, adset_id/name, ad_id/name, placement, site_source_name definitions. Backend flattener and submission notes support them, but custom-field persistence needs actual definitions/map additions if required for CRM reporting. |
| Tags / workflows | **Unverified; access blocked** | Both read-only MCP and direct origin-token GET return 401 insufficient scope for tags/workflows. Code emits `website_lead`, `quiz_lead`, `automation_hold`; optional `sms_nurture_ready` is disabled. No Austin/program/recommendation-specific tag logic exists. Availability, published state, triggers, recipients, suppression and execution not proven. |
| Server guards | Verified at respective layers | Live GET `/api/lead.php` => 405 `{accepted:false}`. Source and tests: same-origin, JSON-only, bounded body, honeypot, salted rate limit, identity/consent/enums, Austin age/location/recommendation constraints. Real origin PHP lint passed. No live POST attempted. |
| Meta CAPI / lifecycle | **Not connected to Austin quiz** | CAPI enabled and required config present server-side. Austin payload has **no `meta` context**, unlike canonical quiz. Merely adding endpoint would make backend default analytics/ad-consent fields denied and skip CAPI. Austin success path also lacks canonical shared Meta event-ID validation/direct deduplicated routing. |
| Other destinations | Partial inventory | GTM has active Microsoft Clarity project `y0svef1l5i`; source initiates consent-aware LeadConnector number-pool/user-session scripts. No call made. Clarity/LC receipt not verified. Beehiiv/Zen Planner are not called by this quiz/lead handler; quiz does not offer newsletter opt-in or member enrollment. Google Ads lifecycle conversion receipt unverified. |
| Content readiness | **Opening date held** | September 14 remains provisional. Landing draft/not-live-ad warning existed at snapshot; parent owns removal. Separate quiz preview notices must not simply be hidden while it remains disconnected. |
| Adult schedule | **Confirmed, not a blocker** | Diego's authoritative in-session correction confirms Tue/Thu 6–7 p.m.; current decisions also records confirmation Sept 6. Private lessons remain appointment-only. Old skill/context claiming unconfirmed is superseded. |

## Payload and acceptance contract

Pure `leadPayload()` extraction was executed locally without submit handler, fetch or analytics. It emits:

- `schema_version=program_fit_v1`, retry-stable `request_id`, `form_id=program_fit_quiz`, `lead_type=quiz`, `route_source=austin-program-fit`.
- first_name/email/phone; audience, child_count, age_bands, stage, goal, experience; preferred_location=austin; recommended_program.
- email_consent and sms_consent booleans; `consent_disclosure_version=program_fit_sms_v2`; page; honeypot website.
- `attribution.first` and `.latest` correctly adapted from browser first_touch/last_touch.
- **Missing `meta`** (analytics_storage/ad_storage/ad_user_data, consent-gated identifiers). See `payload-schema.json`.

Server normalizes enums and matches recommendation; upserts contact, adds tags, upserts open opportunity (configured value 2832), appends readable submission note, performs consent-gated CAPI, then sends legacy alert and returns acceptance. Tags are added **before** opportunity/note acceptance, so an enabled website_lead workflow could alert on a later partial failure; workflow inspection is an explicit launch gate. Owner is supplied if configured (present), but the runtime configuration gate does not require it. No end-to-end mutation proof is claimed.

## Analytics event ownership and privacy findings

- GTM version 13 regex is `^quiz_(start|step_complete|back|complete|result_view|restart)$`; Austin emits matching names (not stale `quiz_result_viewed`). Current container maps controlled quiz dimensions including route_source and recommendation.
- Canonical source bypasses legacy success routing with direct GA4 `send_to`, returned `lead_<request_id>` checks and deduplicated Meta routing. Austin copied an older simpler adapter. Reuse the hardened contract rather than enabling the endpoint alone.
- Active GTM Meta router 21 maps lead_submit_success to Lead without an eventID. Base tag 26 initializes the one Pixel with ad_storage; old tags 20/38 paused. Router 21 has no explicit additional-consent field in compiled resource; verify advertising revocation and enforce equivalent gating before release.
- Captured **automatic `SubscribedButtonClick`** requests from harmless Privacy choices, Save choices, radio and navigation interactions. No business Lead/Schedule was emitted, but automatic event collection is active and sends button/form-feature metadata. Review disabling this automatic collection and verify no contact values can enter Meta before testing contact input. This was an observed vendor side effect, not a synthesized conversion.
- Advertising-only consent can still push quiz objects into dataLayer; GA destination tag must honor analytics denial. Basic matrix verified at app/loading level; every third-party cookie/receipt permutation is not claimed tested.

## Exact remediation order (no production authorization implied)

1. Finish parent-owned banner-only removal; retain noindex and sitemap exclusion. Keep ads paused. Do not mislabel disconnected quiz as connected.
2. Resolve September 14 date. Adult time is already confirmed; do not rewrite it.
3. Port canonical quiz acceptance/Meta context/deduplication behavior to Austin, preserve strict Austin eligibility and contact-last routing, add guarded production endpoint and honest success/error copy together. Require note/accepted IDs and stable request/event IDs.
4. Fix pre-GTM identifier sanitation in the generating source, preserving numeric platform IDs with strict identifier grammar while keeping PII filters for descriptive UTMs. Add generated-HTML browser regression (utility tests alone missed it).
5. Expand allowed handoff fields and split CTA context from advertising placement. Add missing first/latest GHL schema only if it is required for reporting, synchronizing runtime map, placeholder example, backend and tests. Keep readable submission notes as history.
6. Obtain tags/workflows read scopes or authorized read-only UI evidence. Verify staff recipients, website_lead trigger, automation_hold and channel consent; do not enable SMS (runtime false).
7. Review Meta automatic collection, all consent permutations, Clarity/LC privacy behavior, and missing Austin CAPI/lifecycle consent. No Beehiiv/Zen Planner integration should be fabricated or added without purpose/opt-in.
8. Build exact reviewed SHA, run isolated non-transmitting tests, then obtain explicit deployment approval. Backup-first production release with live hash and guard proof. Do not deploy broader old branches over current runtime.
9. Only after explicit authorization: one labeled synthetic browser submission, exact contact/opportunity/note readback, first/latest fields/tags/owner/stage, alert receipt, GA4 generate_lead downstream, Meta browser+CAPI shared-event-ID and receipt/deduplication. No synthetic submission was authorized or performed here.

## Tests and evidence

- Initial current-PR focused tests: 96 pass / 1 missing-dist prerequisite failure; not an application regression.
- Fresh archive of exact live SHA: production SEO/build, **130/130 Node tests pass**, production validator **5323 checks across 40 routes pass**, origin PHP lint passes.
- Browser runtime: no page errors; no first-party POST attempts; no live contact entry or final submit. The browser report was saved successfully before a nonessential console-summary typo; corrected harness retained. No lost evidence or invented output.
- Machine evidence under `/home/d1360/castle-audit-20260908/`: `runtime.json` (sanitized booleans/maps), `provenance.json`, `browser.json` (network/state capture), `network-summary.json`, `consent-utm.json`, `payload-schema.json`, `gtm-resource.json`, `exact-tests.tap`, exact-source build, origin snapshots and harnesses.
- Raw provider secrets never exported. Raw synthetic browser identifiers and origin snapshots stay local, not in PR. This Markdown is safe for documentation-only publication.
