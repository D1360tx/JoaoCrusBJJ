<!-- markdownlint-disable MD013 -->

# Joao Crus BJJ — Current Decisions

> **Authoritative status as of 2026-08-04**
> This file is the source of truth for current strategy, offers, launch scope, and implementation decisions. When an older document conflicts with this file, **this file wins** until it is updated by a newer dated decision.

## Castle Hill hardened production repair (2026-09-09 UTC)

- Deployed exact repair commit `8480f5c497f75c4e95569e4b92c992a3d42b5f3f` to Bluehost after full-root backup, 130/130 Node tests, 5323 production checks, PHP lint and non-transmitting Playwright QA. Austin quiz now uses the hardened consent/acceptance/Meta-ID adapter and `/api/lead.php`; full numeric/extended attribution handoff is repaired. Parent's banner removal and adult Tue/Thu 6–7 p.m. retained.
- **Traffic remains paused.** The one authorized synthetic lead POST was rejected by Bluehost Mod_Security HTTP 406 before PHP/GHL acceptance. Exact and unique-marker contact searches returned zero records. No downstream GA4/Meta conversion receipt or synthetic custom-field writes are claimed. Workflow-list HTTP 401 is a known audit limitation, not the engineering blocker.
- Fresh post-deploy Meta reads: all 11 ads, ad set and campaign configured/effective PAUSED. SMS release remains false; no environment, GTM or Meta mutation. See `docs/CASTLE-HILL-HARDENED-RELEASE-2026-09-09.md` for exact hashes and blocker evidence. Resolve the hosting POST rejection before any traffic activation or further synthetic acceptance attempt.

## Status legend

| Status              | Meaning                                                                      |
| ------------------- | ---------------------------------------------------------------------------- |
| ✅ Confirmed        | Explicitly confirmed by Joao or independently verified                       |
| 🟡 Working decision | Current direction; implementation may proceed, but details remain adjustable |
| 🔴 Open / blocking  | Must be resolved before dependent work is published or launched              |
| ⛔ Superseded       | Older direction that must not guide new work                                 |

---

## 1. Current objectives and priorities

1. ✅ **Generate new qualified leads and convert them into students.** New leads—not merely appointment show-up—is the primary growth problem.
2. ✅ **Increase private lessons from 5 to 10 per week.** Current private rate is $95/class; this is the fastest, highest-margin near-term lever.
3. ✅ **Relaunch adult group training around the Mon/Wed 6:40 p.m. class.** Treat it as a date-bound cohort rather than advertising a small existing class.
4. ✅ **Grow kids enrollment using the age-3 differentiator, referrals/buddy passes, local campaigns, and a stronger trial offer.**
5. 🟡 **Develop the schools/curriculum line after the immediate local-student launch.** Whether this targets regular schools or martial-arts schools still requires reconfirmation.
6. 🟡 Preserve the broader **one hub / three lines** concept as the working brand architecture, pending final sign-off and naming.

---

## Castle Hill dedicated URL parameters final state (2026-09-08, confirmed)

- All three AY09 ads now use a clean `https://joaocrusbjj.com/castle-hill-grand-opening/` Website URL and the exact top-level URL parameters `utm_source=meta&utm_medium=paid_social&utm_campaign=austin_castle_hill_launch_v1&utm_content={{ad.name}}&utm_term={{adset.name}}&utm_id={{campaign.id}}`; no UTM query remains embedded in Website URL.
- Final mappings: AY09B `120251263002380072` → static creative `1567708678432946`; AY09A `120251263139970072` and original AY09 `120251261045730072` → video creative `1571675311324124`. Meta cloned/reprocessed the approved feed and vertical uploads under new internal video IDs while preserving the approved source request, 26.866-second duration, 720×900 / 720×1280 dimensions, pixel-identical preferred thumbnails, copy, labels, routing, identity and enhancements.
- Authenticated Ads Manager editors visibly show the URL parameters under Tracking. Meta displays “Values previously set,” confirming recognition of the saved parameters. Publish is disabled because the API-backed changes are already saved, not pending as drafts.
- Campaign, ad set and all 11 ads independently read back `PAUSED / PAUSED`; budget remains `1000`, Austin radius remains 10 miles and ages remain 24–54. Configuration is ready for selective activation. At $10/day, launch AY09A and AY09B only; keep the duplicate original AY09 and the eight unrelated ads paused unless separately approved.
- Evidence: `url-parameters-final.json`, authenticated UI captures, and passing `scripts/validate_castle_url_parameters.py` in the reconciliation directory. The blocked sections below are superseded historical snapshots.

## Castle Hill cloned-video content-equivalence follow-up (2026-09-08, superseded historical block)

- User explicitly permits new internal video IDs **only when actual approved visual and temporal content is demonstrably equivalent**. This supersedes the earlier exact-ID-only restriction, not the content-preservation gate.
- Candidate `1571675311324124` remains unattached. Fresh Graph metadata confirms both approved/candidate pairs ready at **26.866 seconds**; native feed **720×900**, vertical **720×1280**. Each pair's full-resolution preferred JPEG and decoded RGB pixels match exactly. Visually inspected contact sheet shows the same coach framing, heading and footer. Copy, labels/routing, identity and enhancement settings match after accounting for documented video-ID remaps, video-array order and signed thumbnail URLs.
- **Missing proof:** Graph omits all four `source` URLs, including candidate source-only queries. Public reel/plugin HTML and creative preview HTML expose no playable stream. Browser automation refused because the real-profile default browser is unsupported. Therefore no full playback, intermediate/key-frame timeline, ending or audio comparison was obtained. One matching thumbnail plus duration is not full-video equivalence. Neither video ad was changed.
- Fresh API verifies all **11 ads and both parents PAUSED / PAUSED**. Validate-only PAUSED requests succeed for all three AY09 ads and the ad set; these validate the existing configuration, not the unattached candidate's full delivery/policy acceptance. AY09B retains its clean URL/exact tags; AY09A and original AY09 still have embedded website UTMs.
- Dedicated Chrome window `311759374` was captured on the correct ad-set Review screen. Element input failed with `snapshot_id_required`; background pixel and foreground navigation attempts did not reach the requested exact-ad editor. URL parameters fields remain visually unverified. No Publish, activation, draft discard or other configuration write was performed.
- Safest next step: restore an operable authenticated Ads Manager/media-preview browser, obtain both candidate playback streams and compare the full timeline/audio against the approved versions. Only then attach the candidate with explicit PAUSED and rerun every acceptance gate. Do not re-upload or substitute another creative merely to bypass missing proof.
- Evidence: `url-tag-video-equivalence.json`, four full-resolution `*-preferred.png` images, `url-tag-video-thumbnail-comparison.jpg`, and `url-tag-ui-blocked-review.png` in the reconciliation directory. Validator now checks fresh proof/statuses but intentionally remains nonzero for the two incomplete migrations. **Not publish-ready.**

## Castle Hill dedicated URL parameters migration (2026-09-08, partial; supersedes URL storage below)

- User requires the six UTMs in Ads Manager's dedicated URL parameters field, not in Website URL. Target website is `https://joaocrusbjj.com/castle-hill-grand-opening/`; top-level creative `url_tags` must be exactly `utm_source=meta&utm_medium=paid_social&utm_campaign=austin_castle_hill_launch_v1&utm_content={{ad.name}}&utm_term={{adset.name}}&utm_id={{campaign.id}}`. Never duplicate UTMs in both fields.
- **AY09B completed at API level:** ad `120251263002380072` now points to creative `1567708678432946`. Clean website_url and exact url_tags independently read back; image hashes, copy, labels, routing, identities and enhancement opt-outs are unchanged. Internal creative name and generated unpublished post ID changed. Ad settled PAUSED / PAUSED.
- **AY09A and original AY09 blocked by exact-media-ID preservation:** ads `120251263139970072` and `120251261045730072` remain on creative `1392143345711700`, with UTMs still in Website URL. Candidate creative `1571675311324124` has the requested clean URL/tags but Meta remapped feed `2093447011244219` to `1911621773147370` and vertical `1734165961000142` to `2175548869693779`. Candidate was rejected before any ad swap and remains unattached. Do not claim all three are fixed, or relax exact-ID preservation without authorization.
- In-place creative update was rejected with Graph 100 / 1815573. MCP creation schema does not expose url_tags, so the authorized existing scoped Graph credentials were used directly without configuration changes.
- Final API readback: all eleven campaign ads and both parents PAUSED / PAUSED; parent fields, budget `1000`, targeting and eight unrelated ads unchanged. Dedicated UI field visibility and complete draft/error acceptance remain unverified: native background navigation did not visibly take effect and no editor field or Publish action was used.
- Evidence: reconciliation directory `url-parameters-migration.json`. `scripts/validate_castle_url_parameters.py` deliberately exits nonzero for the two incomplete video ads; historical reconciliation validator remains a historical snapshot check, not current acceptance.

## Castle Hill live/draft reconciliation (2026-09-08, historical snapshot)

- Fresh investigation found AY09A/B attached to stale UI-generated creatives, original AY09 still on its short youth-only creative, and five campaign ads configured ACTIVE despite their paused parent. All eleven campaign ads now read back PAUSED / PAUSED; campaign `120251246135250072` and ad set `120251246144560072` also PAUSED / PAUSED.
- Restored AY09A `120251263139970072` → independently re-read creative `1392143345711700`, AY09B `120251263002380072` → `1548660843191930`. Updated original AY09 `120251261045730072` to the same completed Adults + Youth video creative as AY09A, preserving its exact name and ID. Original AY09 is no longer the protected stale short-cut baseline.
- All three have exact approved five-paragraph copy, **You Don’t Have to Feel Ready**, **Adults + Youth Ages 8–12 in Austin.**, placement-paired final artwork and canonical six dynamic UTMs in the website URL; absent URL tags, no duplicate query or manual fbclid. Both videos are ready, 26.866 seconds. AY09B uses selected IMG_6449 adult group photo; current Meta image hashes `a35ae481c4a5fc565115ed45b80f476f` / `1e0bbe2da0912a0c768aa97776824260`.
- Error #1870194 persisted in an **unpublished ad-set Audience / Ad set status draft**, not the corrected saved object. Posting `home,recent` again normalized to `frequently_in,home,recent`. Discarded only the identified stale ad-set draft from its editor, not account-wide drafts. Reopened Ads Manager Review has no location error and shows Off; campaign queue reached zero. Current API targeting equals the pre-reconciliation saved targeting exactly.
- Budget already read `1000` at start and remains unchanged ($10/day intent), not the historical `3500`. No budget mutation, activation, new ad set, merge or deployment. API validate-only PAUSED checks returned success for all three ads and the ad set; this is configuration validation, not a guarantee of future policy approval.
- Evidence: `assets/meta/castle-hill/youth-wave-2/comparisons/reconciliation-2026-09-08/`. Includes exact final readback, paused UI table/editor, video previews/current thumbnails and static media. Earlier error-owner and clean Review captures were inspected during this session but expired from the tool cache before archival. Current CDN static pixels differ from local PNG encoding, so no remote pixel-byte equivalence claim; hashes, dimensions, source mapping and visual review establish the intended assets. Local final video audio rechecked equal to completed-cut PCM for both ratios. Full decoded remote-video equivalence is not claimed.

## AY09 final Adults + Youth artwork revision (2026-09-08, historical)

- Final AY09A ad `120251263139970072` → creative `1392143345711700`; AY09B ad `120251263002380072` → creative `1548660843191930`. Both final configured/effective **PAUSED / PAUSED** after review processing settled. Same ad IDs/names; AY07 and original AY09 ads/creatives unchanged.
- AY09B uses the explicitly selected Drive adult academy group JPEG `IMG_6449-adults-group-source-2026-09-08.jpg` (1572×1179; SHA-256 `0e25957e88c7b59ed9a55fa3ef0811950293621db34319a41e0f1bf141f1ea59`). Full source and all faces retained in 1:1/9:16 framed statics. Do not describe pictured adults as youth or claim this is Castle Hill. Participant paid-media permission remains an activation gate.
- Both use **COMPLETE BEGINNERS / ARE WELCOME.**, exact footer **ADULTS + YOUTH AGES 8–12 · CASTLE HILL FITNESS**, approved five-paragraph combined primary text and **You Don’t Have to Feel Ready** headline. AY09A was freshly rendered in 4:5 and 9:16; audio is byte-identical decoded PCM to the prior completed cut. Description intentionally changed from youth-time-only **Castle Hill Fitness · Tue/Thu at 5 p.m.** to **Adults + Youth Ages 8–12 in Austin.** to avoid implying that adult private instruction shares the youth schedule.
- Final destination readbacks are exactly `https://joaocrusbjj.com/castle-hill-grand-opening/?utm_source=meta&utm_medium=paid_social&utm_campaign=austin_castle_hill_launch_v1&utm_content={{ad.name}}&utm_term={{adset.name}}&utm_id={{campaign.id}}`. Six unique raw UTMs; no stale/encoded macros, missing/duplicate/conflicting keys, URL tags or manual fbclid. Automatic fbclid behavior is untouched. Hard gate: `scripts/validate_austin_youth_final_utm.py`.
- Separate user-authorized parent-agent fix for error **1870194**: Meta normalized `location_types` from `['frequently_in','home']` to `['frequently_in','home','recent']`. Same Austin city key `2525495`, radius **10 miles**, ages **24–54**, Facebook/Instagram, website Lead optimization and budget `3500`. Meta changed disabled-expansion representation from `targeting_automation: {advantage_audience: 0}` to `targeting_relaxation_types: {lookalike: 0, custom_audience: 0}`. Exact exception comparison rejects other differences; no claim of byte-identical targeting. Campaign/ad set settled PAUSED / PAUSED; final ad-set readback returned no issues_info. No targeting writes by the artwork script.
- New uploaded videos → ready creative copies: vertical `951510241314059` → `1734165961000142`; feed `2511572895920770` → `2093447011244219`. Both 26.866 seconds, 720×1280 / 720×900, exact decoded preferred-thumbnail RGB hashes match the **fresh uploads**, not old artwork. Full remote-video byte equivalence is not claimed.
- Evidence: `comparisons/meta-audit.json` sections `artwork_revision`, `authorized_location_type_revision`, `final_utm_acceptance`; `manifest.json` maps current assets. Earlier copy-only/attribution evidence is historical, not final current creatives. No activation, merge or deployment.

## AY09 combined youth/adult copy revision (2026-09-08, historical)

- User approved the exact combined youth-and-adult primary text in `comparisons/approved-copy.json` and headline **You Don’t Have to Feel Ready** for existing PAUSED AY09A/B only. Preserve description, destination, dynamic UTMs, CTA, media/routing, identities, all enhancement opt-outs and all parent fields.
- Complete: AY09A ad `120251263139970072` now uses creative `28341354795499624`; AY09B ad `120251263002380072` now uses creative `1066596592851512`. Both read back PAUSED / PAUSED with exact approved primary text/headline. Original ads/creatives and parent settings are unchanged. Meta-generated internal creative-name suffixes and unpublished post IDs change with the replacement; ad names and all tracking event/pixel/page settings are preserved. Ready/equal-duration/equal-dimension/byte-identical decoded preferred-thumbnail proof is required for Meta video-ID remaps; full remote-video equivalence is not claimed.
- Original AY09 and AY07 are protected. No merge, activation, budget/targeting change or deployment authorized. The following attribution section is the historical pre-copy-revision baseline.

## AY09 comparison attribution correction: complete, paused (2026-09-08, historical)

- Required comparison attribution is `utm_content={{ad.name}}`; identical hardcoded content UTMs do not distinguish variants in the backend/CRM. This supersedes the earlier deliberate-constant-UTM decision below. Landing page and all other query parameters remain unchanged.
- AY09B ad `120251263002380072` was updated in place to creative `1066872229294951`. Independently verified dynamic URL, exact unchanged image hashes/copy/routing/identities, all 83 OPT_OUT values, no form and PAUSED / PAUSED.
- AY09A ad `120251263139970072` was updated in place to creative `1742996493484338`. Meta-owned video copies `1093089543578148` and `933901216442281` were accepted only after both returned ready status, identical 26.866-second duration, unchanged 720×1280 and 720×900 dimensions, and byte-identical decoded preferred thumbnails versus the prior creative. Full remote-video byte equivalence is not claimed because Graph omitted downloadable source video.
- AY09A and AY09B now use exact `utm_content={{ad.name}}`. Both ads, AY07 and their parents read back PAUSED / PAUSED; original AY09 is unchanged. Budget remains `3500`, targeting unchanged. Strict regression tests pass. No merge, activation or deployment.

## Austin Youth approved beginner-belonging and format comparisons (2026-09-08, historical baseline)

- User explicitly approved replacing existing PAUSED AY07 with beginner-belonging copy and real group-photo visuals, plus two separate PAUSED AY09 comparisons. No activation, parent/budget/targeting/destination change, website deployment or PR merge is authorized.
- AY07 updated **in place**, preserving ad `120251261010900072`, now `AY07_BEGINNER-BELONGING_STATIC`, creative `1687998043330822`. The approved two-line hook is “THERE'S ROOM” / “TO BE A BEGINNER.” Full group photograph and all faces are retained. Historical AY07 files and old creative evidence are retained, not current live configuration.
- AY09A `AY09A_BEGINNERS-WELCOME_LONG-VIDEO`: ad `120251263139970072`, current creative `1742996493484338`. Continuous source 28.04–54.88 seconds completes the beginner/visit thought. Encoded 4:5 and 9:16 exports are 26.867 seconds, ending “…the right place for you or your child.” No freeze padding or empty outro. Original AY09 cut at source 39.00 after “meet,” interrupting the next sentence; prior claims of a complete cut are superseded by this source/audio audit.
- AY09B `AY09B_BEGINNERS-WELCOME_STATIC`: ad `120251263002380072`, current creative `1066872229294951`. Real Joao-only frame from the same source; 1:1 and 9:16 graphics. AY09A/AY09B hold original AY09 body, headline, description, CTA, destination and all non-content UTMs constant. Dynamic `utm_content={{ad.name}}` distinguishes the two comparison ads in backend/CRM attribution.
- All three updated/new ads and both parents read back configured/effective **PAUSED / PAUSED**. Original AY09 ad `120251261045730072` and creative `1107882611663240` remain unchanged and PAUSED. Daily budget remains `3500`; ad-set targeting unchanged. Website-only Lead, Pixel/identities, placement routing, no Instant Form and all returned enhancement opt-outs verified.
- Paid-media rights (including identifiable students in AY07), opening date, Lead-tracking acceptance, exact budget and explicit activation approval remain gates. Website photo publication is not a participant release. Comparison assets, source/ending transcript, deterministic scripts and redacted mutation/readback journal: `assets/meta/castle-hill/youth-wave-2/comparisons/`. PR #117 remains unmerged.

## Austin Youth AY09 video and proposed initial launch slate (2026-09-08)

- AY09 is a **PAUSED draft**, creative `1107882611663240`, ad `120251261045730072`, under the existing Castle Hill campaign/ad set. Final readback is configured/effective PAUSED. Placement-aware 4:5 feed and 9:16 Stories/Reels exports show Joao only, no students. Source-video and participant paid-media permission remain activation gates; no claim that the source depicts a Castle Hill class.
- Recommended initial slate at a proposed **$10/day total campaign budget**: activate **at most AY07 + AY09 + existing safe AY01 Tap Means Stop**, only after all applicable permission, tracking and explicit activation gates pass. Keep AY08 and every other ad paused as rotation inventory. This is not a recommendation to run six ads simultaneously or a guarantee of equal spend across three ads.
- The user said “probably around $10”; this is provisional, not an exact budget authorization. Campaign `120251246135250072` remains at **3500 minor units**. A budget mutation awaits exact final confirmation. No budget, targeting or activation changes were made for AY09 documentation.
- Production MP4s, ASS captions, reviewed contact sheets, source hashes, exact copy, redacted Meta readbacks and strict validator: `assets/meta/castle-hill/youth-wave-2/video/`. AY07/AY08 assets remain intact. No merge or deployment authorized.

## Austin Youth AY07 / AY08 paused-only variations (2026-09-08)

- User explicitly authorized two new real-photo static ads, AY07 and AY08, under campaign `120251246135250072` and ad set `120251246144560072`, with every ad PAUSED. This is a separate, narrow authorization from the people-free safe wave below.
- Use `castle-hill-youth-group-20260907.webp` for the age-matched AY07 rationale and `youth-junior-warriors-group.webp` for AY08 practice/confidence. No AI imagery; do not assert either photograph was taken at Castle Hill. Existing website/publication approval does not prove identifiable-student paid-media releases.
- Identifiable-student media approval for both photos remains a before-activation gate. Preserve website-only Lead, exact dynamic UTMs, square feed / vertical Stories-Reels routing, all enhancement opt-outs, parent targeting and budgets. Nothing may be activated; no merge or deployment is authorized by this build.
- Evidence: `assets/meta/castle-hill/youth-wave-2/`.

## Castle Hill permission-safe paused ads (2026-09-08)

- User expressly authorized “Use only Joao/facility-safe creative and keep every ad paused.” This authorizes the separate six-concept, twelve-image safe iteration, media uploads and placement-specific creative/ad creation under campaign `120251246135250072`, ad set `120251246144560072` only.
- Use only the verified existing empty facility photograph, official Joao portrait/logo, and brand typography. This iteration uses facility + logo only. No students, minors, groups, AI people, or blocked #114 imagery.
- Preserve #114 unchanged/open. Do not activate any entity or change budget/targeting. The unconfirmed date and traffic/tracking approval remain separate holds. See `assets/meta/castle-hill/safe-wave-1/README.md`.

## Approved Castle Hill page revisions (2026-09-07)

- ✅ Revise the approved live `/castle-hill-grand-opening/` route only after QA. Show Youth before Adults in each schedule day, matching 5:00 PM before 6:00 PM. Preserve the shared calendar and all class records.
- ✅ Hero headline: “A new place to start. Jiu-jitsu at Castle Hill Fitness.” Use the official Castle Hill Multisport Room photograph, not generic academy or AI imagery.
- ✅ Place real program photographs immediately after each Youth/Adults label and before its heading. Youth heading: “Confidence through practice.” Use Castle Hill’s published Joao partnership kids photo and the verified real adult black-belt group photograph (`campaign-images/adults-black-belt-group-2026-07.webp`, 640×616). The previously selected coaching derivative was misclassified: `scripts/prepare_adults_joao_ai_hero.py` traces it to an AI original. Remove the unique Castle Hill AI copy after backup and production-reference verification. Keep the adult image between label and heading, describe black belts rather than beginners/coaching, and leave hero/Youth and PR #114 untouched. Record source provenance in `docs/CASTLE-HILL-PHOTO-REVISIONS.md`.
- ✅ Keep the funnel `noindex,nofollow`, outside the sitemap, and all historical comparisons intact. No lead submissions or GHL, Meta, or GTM mutations. September 14 remains unconfirmed and traffic remains held.

## Austin Castle Hill paid-social comparison (2026-09-06)

- ✅ Diego confirmed Youth ages 8–12 Tue/Thu 5:00–5:45 p.m.; adult group Tue/Thu 6:00–7:00 p.m.; adult private lessons by appointment. Location: inside Castle Hill Fitness, 1112 N Lamar Blvd, Austin TX 78703.
- 🟡 **Superseding working decision (2026-09-06):** build one combined Castle Hill grand-opening landing page at `/castle-hill-grand-opening/`, feeding the dedicated Austin branching quiz. First choose child or adult; contact capture comes last; Youth is restricted to ages 8–12.
- 🟡 One Meta Leads campaign, one broad local ad set, distinct Youth and Adult creative concepts, all to the same combined page. The previous separate-page launch and separate-ad-set recommendation is superseded. Preserve both separate Youth and Adult pages and all production pages as comparison artifacts.
- 🟡 September 14 remains a **provisional, unconfirmed** opening date. On 2026-09-07 Diego explicitly authorized deploying the reviewed PR #111 funnel despite Joao not yet confirming the date. Retain the reviewed “Opening September 14” copy until confirmation, then adjust it if needed. Deployment approval is not factual date confirmation.
- ✅ Production deployment of the reviewed funnel is authorized (2026-09-07), preserving `noindex,nofollow` and sitemap exclusion. Release status: live only after verification, with traffic held and date unconfirmed. No traffic, Meta activation/mutations, GTM publication, or real lead submissions are authorized. Budget, targeting radius, tracking acceptance and activation remain separate approval gates.
- ✅ Joao personally calls to recommend a class and schedule a free studio visit. Visitors or children may observe or participate. The quiz does not book automatically. No pricing.

## Manual A2P website opt-in (2026-09-05)

- Contact (`/contact/`, `contact_page`) and the shared first-class booking popup (`booking_popup`) use two separate, optional, unchecked SMS consent controls with `website_sms_v3` evidence: non-promotional customer care and promotional marketing. The Program Finder keeps its existing customer-care-only `program_fit_sms_v2` consent. Unchanged legacy forms remain email/call-only.
- Joao is not using the chat widget. Preserve `/sms-opt-in/` as a public guide linking to the actual native forms, with no widget loader. Manual campaign message flow must describe contact, popup, and quiz paths, not a widget-only flow.
- Promotional consent is independent from customer-care consent. Neither SMS checkbox is required or blocks form submission. Workflows must honor the selected category and may not treat either choice as consent to the other category.
- This source change captures evidence only. Do not activate SMS release or clear existing DND. Carrier approval and controlled HELP/STOP/DND acceptance remain separate gates. Contact/popup enrollment stays held even if the existing quiz-only release interlock is enabled.
- PR #107 merged to `launch/domain-form-books`, not `main`. Live legal pages and `/sms-opt-in/` reflect that divergent release. Preserve current main's analytics/privacy disclosures; do not deploy the old release branch wholesale or overwrite newer live lead integrations without reconciliation.


## Kids paid-social landing page (2026-08-24)

- ✅ Publish the kids paid-social destination at `/kids-first-class/` as a separate `noindex,nofollow` campaign route. Keep it out of the XML sitemap and preserve `/practice-under-pressure/` unchanged.
- ✅ Use one kids-only page for the first four static ads, with direct message match for tapping, practiced confidence, programs from age 3, and program fit. Do not create four separate pages at launch.
- ✅ All dominant CTAs enter the existing Program Finder with the child route preselected, contact capture last, unique placement values, and paid attribution parameters preserved. Nothing is booked or charged automatically.
- ✅ Every accepted website submission must append a readable internal HighLevel note. The note preserves that submission's quiz/form answers, request ID, and first/latest campaign, ad set, ad, placement, click-ID, landing-page, and referrer context. Contact custom fields continue to represent the latest values while notes retain the submission history.
- ✅ **Phase-one lifecycle feedback approved 2026-09-04:** Prospect Enrollment transitions at Qualified Conversation, Trial Booked, Trial Attended, and Enrolled may emit consent-gated, deduplicated CRM outcome events through a secured Bluehost webhook. Meta receives `QualifiedLead`, `Schedule`, `TrialAttended`, and `CompleteRegistration`; GA4 receives `qualify_lead`, `trial_booked`, `trial_attended`, and `close_convert_lead`. Do not emit `Purchase` without verified payment. Preserve explicit analytics/ad-consent state on each newly accepted website contact, keep all customer messaging disabled in these workflows, and treat GA4 Measurement Protocol HTTP success as transport evidence until downstream receipt is verified.
- ✅ Diego approved the reviewed page for Bluehost deployment on 2026-08-25. Meta ad destination changes remain a separate launch action.
- ✅ **Paid-ad entry behavior corrected 2026-09-03:** `/kids-first-class/` must remain at the hero on first load, including when the region lookup fails and privacy choices open. Every “Plan a class” CTA must open the child Program Finder directly at Question 1 with no intermediate quiz-intro click.

---

## Practice Under Pressure offline QR campaign (updated 2026-08-13)

- ✅ The approved canonical landing page is `/practice-under-pressure/` using the pressure-response Iteration 2 message: **“Pressure is part of life. Practice what to do next.”** Its primary CTA opens the Program Finder directly at Question 1, skipping the quiz intro while preserving flyer attribution. Standalone quiz visits retain the intro. The homepage booking popup remains unchanged.
- ✅ `/found-the-flyer/` is the former campaign URL and must remain a one-hop, query-preserving 301 redirect to `/practice-under-pressure/` so existing QR codes and attribution parameters continue to work.
- ✅ Preserve the flyer-curiosity version and prior pressure-response iterations as noindex comparison artifacts. The approved Iteration 2 becomes the locked control for future tests.
- 🟡 Shared native forms and the Program Finder are code-ready to use the Bluehost `/api/lead.php` HighLevel adapter. Production activation remains blocked on server-only configuration and controlled live acceptance. Success requires explicit contact and opportunity acceptance. Legacy internal email is best-effort only after CRM acceptance, and automated SMS remains held pending A2P.
- 🔴 **SMS carrier readiness checked 2026-08-20:** the HighLevel sub-account has no phone number and A2P Messaging shows **Start Registration**. The consent bridge may ship behind `GHL_ENABLE_SMS_RELEASE=false`, but automated SMS must remain disabled until a number is acquired, A2P 10DLC is approved, and a controlled STOP/DND test passes.
- 🟡 Until Joao's approved campaign video is recorded, use an honest coaching photograph without a play button or simulated playback. The video script remains a production asset for a later release.

---

## Parent Guide AI-search cluster (2026-07-29)

- ✅ The canonical Parent Guide is a public, indexable resource hub at `/parent-guide/`, supported by focused answer pages covering starting age, tapping, ages 3-7 class structure, choosing a program by age, first-class preparation, and how children practice life skills in BJJ.
- ✅ The life-skills article owns informational intent around listening, boundaries, persistence, partner awareness, resetting, and problem-solving. It must support, not replace or cannibalize, the commercial Kids BJJ page.
- ✅ Each resource uses a concise direct-answer block, visible publication context, internal links, claim-safe language, and Article schema. Visible FAQ content may also use FAQPage schema when the structured data exactly matches the page.
- ✅ Research claims must cite the underlying source and remain within the evidence tier. Preschool movement research may support cautious language about attention, motor development, and self-regulation, but must not be presented as proof of BJJ-specific outcomes at age 3.
- ✅ The cluster may explain tapping as a shared stop signal and training habit. It must not claim that tapping eliminates injury risk or guarantees behavior outside class.
- ✅ Review and staging HTML remains `noindex,nofollow`. The production build may index only manifest-approved canonical pages.
- ✅ Do not publish invented schedules, equipment rules, trial terms, first-person quotations, or claims that Joao personally reviewed editorial copy unless verified.

---

## Regional analytics and consent (2026-08-03)

- ✅ Use the least-friction regional model: known visitors outside the EEA, United Kingdom, and Switzerland receive GA4 analytics, Google Ads, and Meta advertising measurement by default without a first-visit banner and can adjust or turn them off from the footer.
- ✅ Visitors in the EEA, United Kingdom, and Switzerland must explicitly allow analytics and advertising categories. Unknown or failed country detection follows the same strict opt-in path.
- ✅ Keep analytics and advertising as separate durable choices. Google Consent Mode v2 controls `analytics_storage`, `ad_storage`, `ad_user_data`, and `ad_personalization`; Meta consent is revoked whenever advertising is off.
- ✅ Honor explicit saved category choices across regions. Global Privacy Control always keeps advertising storage, user data, and personalization off while allowing ordinary first-party analytics in standard regions unless the visitor also disables analytics.
- ✅ Preserve PII stripping, origin-only referrers, consent-aware attribution storage, a durable Privacy choices control, strict failure behavior, and safe migration of legacy analytics-only choices without expanding them into advertising consent.

---

## 2. Confirmed business facts

### Enrollment, pricing, and operations

- ✅ Current enrollment reported: **30 kids / 12 adults**.
- ✅ Private lessons: **$3,800 per 40 classes = $95/class**; currently about 5/week, desired 10/week.
- ✅ Drop-in rate: **$25**.
- ✅ Memberships use **12-month agreements with 60-day termination notice**.
- ✅ Reported business baseline: approximately **$100,000 trailing 12 months**; records/Zen Planner export are still required to document the baseline.
- ✅ Billing and member management use **Zen Planner**.
- ✅ Current website inquiries are emailed to **[joaocruzbjj@gmail.com](mailto:joaocruzbjj@gmail.com)** and **[diego@icdcventures.com](mailto:diego@icdcventures.com)** for owner delivery plus ICDC monitoring. They are not yet managed in a dedicated CRM.
- ✅ Beehiiv exists with approximately **800 subscribers**, correcting the earlier 8,060 figure. Access and consent/list-quality review remain pending.

### Locations and schedule

- ✅ Dripping Springs location: **120 Frog Pond Lane, Suite 200, Dripping Springs, TX 78620**.
- ✅ Austin location: **1112 N Lamar Blvd, inside Castle Hill Fitness**.
- ✅ Dripping Springs Little Champions, ages 3–7: Mon/Wed **5:00–5:45 p.m.**
- ✅ Dripping Springs Youth, ages 8–12: Mon/Wed **5:50–6:35 p.m.**
- ✅ Dripping Springs Homeschool Program, ages 5–8: Tue/Thu **10:30–11:15 a.m.**
- ✅ Dripping Springs adults: Mon/Wed **6:40–7:40 p.m.** and Sat **11:00 a.m.–12:00 p.m.**
- ✅ Dripping Springs Jiu-Jitsu After 60: Tue/Thu **11:20 a.m.–12:10 p.m.** This is a distinct program with its own schedule filter, not part of the Adults filter.
- ✅ Jiu-Jitsu After 60 is positioned as a **4-week introductory program for men and women 60+**, with beginner reassurance, cooperative partner work, no aggressive-sparring expectation, and **“Relational First. Physical Second.”** Keep the confirmed 50-minute schedule above and omit Joao's draft 60-minute breakdown unless he explicitly changes the class time.
- ✅ Austin Youth, ages 8–12: Tue/Thu **5:00–5:45 p.m.**
- ✅ Austin publishes **adult private instruction by appointment** with flexible scheduling and beginner-friendly positioning.
- ✅ Austin adult group classes: Tue/Thu **6:00–7:00 p.m.**, confirmed by Diego 2026-09-06. Adult private lessons remain by appointment. This supersedes the adult interest-list direction.

### Positioning and proof

- ✅ Joao officially accepts children from **age 3** and approved advertising this fact.
- ✅ Competitive research found no other local school advertising an under-4 starting age; phrase external copy carefully as **“no other local school we found advertises classes from age 3”** unless the stronger exclusivity claim is reverified at launch.
- ✅ Google Business Profile was verified at **4.8 stars / 98 reviews** as of 2026-06-17; refresh before publishing hard counts.
- 🟡 “500+ families” is a first-party cumulative claim. If Joao reconfirms it, use **“500+ families served since 2003,”** not language implying current enrollment or only Dripping Springs families.

---

## 3. Launch and campaign decisions

- ✅ **Launch anchor: August 17, 2026.** The new schedule and 6:40 adult cohort are tied to this date.
- ✅ Campaign theme: **Back to School**.
- ✅ Move away from a fully free-only trial toward a **paid/deposit trial** that filters for commitment.
- ✅ Preferred offer logic: a trial deposit becomes a **credit toward annual membership** when the student continues.
- ✅ Paid social is approved at approximately **$35/day** for the Back-to-School campaign.
- ✅ Paid social will use our own pages and tracking and run alongside the existing agency.
- ✅ **Google Ads is documented for future use and explicitly deferred from the current launch.** Do not allocate budget or build campaigns until Diego reopens the channel. When activated, start with transactional/commercial local intent, exact and phrase match, program-specific landing pages, and HighLevel quality feedback. Do not begin with broad match or Performance Max. See `docs/GOOGLE-ADS-KEYWORD-PLAYBOOK-2026-07-30.md`.
- ✅ Social cadence preference: approximately **one useful instructional post per week**; content should drive to offers rather than function as a free school.
- ✅ Joao's children's storybooks (shy/distracted-kid themes) are working lead-magnet and trial-gift assets.
- 🟡 Buddy passes and family/father-son structures are approved directions but need final mechanics.

### Superseded directions

- ⛔ **“Organic-first; no paid ads in v1” is superseded.** Paid social is now in scope.
- ⛔ **“No ESP / build an email list from zero” is superseded.** Beehiiv exists; the task is access, cleanup, segmentation, and integration.
- ⛔ **“Twilio already exists or may have reusable A2P registration” is superseded.** Twilio was stalled at signup and A2P has not started.
- ⛔ The agency's $500 fee was **one-time setup**, not an ongoing monthly retainer. Working ongoing cost is **$400/month ad spend + $100 per signup**.
- ⛔ “Age 3 pending confirmation” is superseded. The policy and advertising permission are confirmed.
- ⛔ “No gym-management software” is superseded. Zen Planner is in use.

---

## 4. Open decisions that block implementation

| Priority | Decision required                                                                                                                 | Owner        | Blocks                                            |
| -------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------- |
| 🔴 1     | Confirm full rate card: when $69/week applies versus $49–59/week; family rates; $99 registration; kids/adults differences         | Joao         | Offer math, pricing copy, checkout                |
| 🔴 2     | Select launch offer: paid Kickstart versus 4-week deposit-credit intro; deposit amount, duration, capacity, refund/credit rules   | Joao + Diego | Landing pages, ads, scripts, payment flow         |
| 🔴 3     | Confirm trial-uniform cost and whether the offer includes a low-cost trial uniform, enrollment gi, or no uniform bonus            | Joao         | Offer profitability and copy                      |
| 🔴 4     | Confirm booking system: existing WP Booking Calendar, Zen Planner booking, or Cal.com                                             | Joao + Diego | CTA and automation wiring                         |
| ✅ 5     | **Resolved 2026-07-23:** Joao approved the `toddlers-campaign-group.html` black/yellow/blue direction and requested the full site in this style | Joao + Diego | Unblocked—full-site buildout in progress           |
| 🔴 6     | Confirm hosting/registrar/DNS access and create a school-domain email                                                             | Joao + Diego | Email authentication, Twilio signup               |
| 🔴 7     | Obtain Beehiiv access and verify list size, consent, segments, and deliverability                                                 | Joao         | Broadcasts, lead magnet, nurture                  |
| 🔴 8     | Confirm Castle Hill terms and permission to market to members via site listing, signage, front desk, and newsletter               | Joao         | Austin launch                                     |
| 🔴 9     | Confirm Meta ad-account ownership and agency campaign/follow-up boundaries                                                        | Joao + Diego | Pixel ownership, attribution, duplicate messaging |
| 🟡 10    | Decide whether the 6-week guarantee/refund concept will be used                                                                   | Joao         | Secondary offer copy                              |
| 🟡 11    | Confirm buddy-pass mechanics and limits                                                                                           | Joao         | Referral campaign                                 |
| 🟡 12    | Reconfirm whether the schools/curriculum line targets regular schools or martial-arts academies                                   | Joao         | Line-B product strategy                           |

### Pricing rule

Until item 1 is resolved, **do not publish membership prices, LTV claims, savings claims, or a paid-trial price.** Use a clearly marked placeholder or omit pricing entirely.

---

## 5. Website and funnel scope

### Working production direction

- ✅ Use the approved **`toddlers-campaign-group.html` black/yellow/blue campaign design** as the shared production visual system.
- ✅ Keep the strongest toddler copy, FAQ, schedule, and age-3 positioning inside that shared system rather than launching unrelated visual systems.
- ✅ Preserve prior concepts for comparison; build the cohesive full-site version in a new `site/campaign/` directory with shared components.
- ✅ The shared site header will use a **Programs dropdown** that links directly to the age-specific Little Champions 3–7, Youth 8–12, and Teen 13–17 pages. Age-group landing pages retain the same global header and add a smaller contextual anchor bar below it for in-page navigation.
- ✅ **Approved coach portraits (2026-07-29):** use the approved AI coach portraits in the About team grid and throughout the canonical Coaches hub. Keep Joao's real academy portrait in the About hero. Remove comparison-preview labeling because the coach portraits are approved for production.
- ✅ **Canonical hosted review site (2026-07-29):** use one Git-connected Vercel project, `joao-crus-bjj`, with `main` as the stable production branch and pull-request preview deployments for review. Keep the `*.vercel.app` deployment blocked from indexing until forms, legal, tracking, DNS, and real-domain cutover checks are complete.
- ✅ **Homepage hero photography (2026-07-31):** use Joao's approved real academy group photo in the homepage hero. Preserve the original source, use the optimized 4:3 derivatives, keep every person visible, and remove the former AI-concept label.
- ✅ **Campaign hero image scale (2026-07-31):** use larger 4:3 desktop hero image panels so they visually span more of the left-side story instead of sitting as short centered 16:9 cards. Preserve each source image's safe focal treatment and retain the established mobile ratios.
- ✅ **Canonical Teen page (2026-08-06, Diego):** publish the Teen 13–17 program at `/teens/`, remove preview and AI-concept labels, keep the interest-list positioning until a schedule is confirmed, and permanently redirect `/teens-preview/` to the canonical route.
- 🟡 Programs, Schedule, and Locations use distinct page-specific AI hero concepts pending final photography. Per Diego's 2026-08-02 direction, the visible “AI concept” hero banners are removed from the Schedule and Locations production pages while replacement imagery is reviewed.
- ✅ Maintain one shared schedule data source/component so every page displays the same confirmed times.
- 🟡 Maintain a single primary conversion goal per campaign page, plus text/call as the fallback.

### Required launch pages

1. Homepage hub
2. Kids program
3. Toddlers / age 3
4. Adults / 6:40 cohort
5. Private coaching
6. Teams / corporate offering
7. Austin location or Austin-specific campaign page
8. Lead-magnet landing page
9. Booking/offer confirmation and thank-you states
10. Privacy policy and terms/communications consent pages

### Required production wiring

- Real booking destination—no `href="#"` conversion buttons.
- Real form backend and lead storage.
- Beehiiv lead-magnet delivery and welcome/nurture automation.
- GA4 plus Meta Pixel event tracking for page views, CTA clicks, form starts, form submissions, bookings, and payments where applicable.
- UTMs and source attribution preserved through lead capture.
- 🟡 **Attribution standard approved (2026-08-03):** after analytics consent, retain first touch and last non-direct touch for 90 days, preserve supported ad click IDs with accepted leads, use GA4-recognized UTM mediums, and mark explicit `qa=1` sessions as internal/debug traffic. Consent Mode storage defaults remain denied before choice, ad-related consent remains denied, withdrawal clears durable attribution, and Global Privacy Control keeps optional analytics storage off. Keep the GA4 Internal Traffic filter in Testing mode until live transport is verified.
- Mobile click-to-call/text and real map links.
- Email/SMS consent language, privacy policy, unsubscribe handling, and suppression records.
- Canonicals, Open Graph/social images, LocalBusiness/location schema, FAQ schema where appropriate, sitemap, robots rules, and noindex for drafts/variants.
- Owned, optimized local images rather than production hot-links to WordPress media.
- ✅ Treat traditional SEO and AI-search discoverability as launch foundations, not post-launch add-ons. Preserve valuable WordPress URLs and content, maintain a redirect inventory, assign one search intent per canonical page, publish accurate entity/schema data, keep staging noindex, and make Joao's firsthand expertise and source-backed teaching content easy for answer engines to extract and cite.
- ✅ **Private coaching legacy consolidation (2026-08-29, Diego):** keep `/private-bjj-lessons/` as the canonical private-coaching page and permanently redirect the retired `/private-classes/` route to it in one hop.

### Content priorities

- Lead the kids/toddler journey with the verified age-3 differentiator.
- ✅ **Seasonal Summer Camp treatment (2026-08-03, Diego):** the 2026 camp is over. Keep `/summer-camp/` as a short `noindex,follow` seasonal holding page, remove it from navigation and the XML sitemap, and point visitors to the year-round Kids BJJ, Little Champions, and Youth pages. Reuse the URL and restore indexation only if a future camp is confirmed.
- Promote private coaching as a primary offer, not a minor peer card.
- Develop a dedicated private-coaching acquisition lane for mature professionals, executives, returning practitioners, and other adults whose schedule or body no longer fits one-size-fits-all group training. Lead with flexible appointments, individualized game planning, pressure/position/timing/efficiency, and Carlson Gracie lineage as a living teaching influence. Treat “old man jiu-jitsu” as a creative phrase to test, not an automatically approved premium offer name. See `assets/ads-podcast/02-private-coaching-grown-men.md`.
- ✅ **Story-led acquisition direction (2026-08-07, Diego):** ads and landing pages should use real Joao, parent, and student moments to reveal a recognizable tension, Joao's coaching belief, and an observable teaching mechanism before the CTA. Start with the Chris/private-coaching schedule story, the Kaiden/tap story, purposeful play at age three, and verified Carlson/De La Riva teaching moments. Keep each story tied to one audience and offer, obtain permission for identifiable details, and do not publish the reported older Dallas judge story until age, rank, wording, and permission are confirmed. See `assets/ads-swipe/009-jun-yuh-storytelling-framework.md`.
- Show both locations clearly. Austin offers Youth ages 8–12 Tue/Thu 5:00–5:45 p.m., adult group Tue/Thu 6:00–7:00 p.m., and adult private lessons by appointment.
- Add schedule, coaches, linked Google reviews, FAQs, directions, books/podcast links, and a secondary lead-magnet path.
- Do not publish the preview ribbon, draft variant hub, or duplicate toddler versions.

---

## 6. Automation and platform decisions

### Confirmed current state

- ✅ Zen Planner is the existing billing/member system; do not replace it blindly.
- ✅ A 2026-07-31 comparison of Zen Planner, Wodify, and Kmura is documented in [`16-GYM-MANAGEMENT-SOFTWARE-COMPARISON.md`](16-GYM-MANAGEMENT-SOFTWARE-COMPARISON.md); keep Zen through the launch and require a reversible pilot before any migration.
- ✅ Beehiiv is the existing ESP; evaluate and integrate before introducing another ESP.
- ✅ Meta Pixel was present on the prior WordPress site via PixelYourSite. The replacement site now sends GA4 page views and lead-funnel events through owned container `GTM-596MGPMD`; Meta Pixel ownership and replacement-site implementation remain a separate launch gate.
- ✅ Jetpack Stats exists and may provide historical traffic baseline data.
- ✅ A WordPress Booking Calendar plugin is installed; its actual booking flow is still unknown.
- ✅ Twilio is not operational; A2P registration has not started.
- ✅ **Lead infrastructure selected (2026-07-29):** use HighLevel as the prospect CRM, pipeline, booking, email/SMS automation, consent/attribution ledger, and staff follow-up system; retain Beehiiv for explicitly opted-in newsletter subscribers and Zen Planner Studio for enrolled members/billing. Native Vercel forms will post through a server-side endpoint to HighLevel and Beehiiv as appropriate. Avoid Make/n8n in the launch-critical path unless direct API/workflow integration proves insufficient.
- ✅ **HighLevel call tracking approved (2026-09-01):** keep the active four-number Visitor Activity pool for all production-site visitors, swap the canonical `512-644-4560` display and `tel:` destinations, and forward calls to `512-644-4560` with recording disabled. Load the pool only on the canonical production build and only after the shared regional measurement-consent gate allows it. Keep previews out of the pool.
- 🟡 **A2P sender pending agency permission (2026-09-01):** the intended HighLevel sender is the verified default number `571-604-5365`. Registration remains incomplete and the current sub-account login cannot start it. Joao must grant agency-level permission, provide agency-admin access, or complete registration. Keep automated SMS release fail-closed until carrier approval and controlled STOP/DND testing pass.
- ✅ The new HighLevel implementation is intentionally independent of the advertising agency. Agency CRM access, ownership, and historical-lead export are not launch prerequisites. Any later paid-campaign cutover or historical import is a separate transition with explicit source/consent mapping.
- 🟡 **HighLevel acceptance update (2026-08-20):** the website lead-intake path has a conditional pass. Controlled Program Finder and booking-popup submissions reached the production gateway and created the intended HighLevel contact/opportunity with owner, tags, consent, program, and source mapping. Published safeguards provide an internal staff alert and an email-only release path gated by removal of `automation_hold` plus `Email Consent Status = granted`; no SMS action is active. The shared-form attribution adapter normalizes browser `first_touch`/`last_touch` into gateway `first`/`latest`; a post-deployment controlled submission verified matching first/latest UTM source, medium, content, and term in HighLevel. Google Ads conversion feedback, Beehiiv suppression, Zen Planner handoff, failure recovery beyond the private Meta retry outbox, and export testing remain open. See [`docs/HIGHLEVEL-GA4-ACCEPTANCE-2026-08-20.md`](docs/HIGHLEVEL-GA4-ACCEPTANCE-2026-08-20.md).
- ✅ **Working opportunity value (2026-08-27):** new website opportunities use a configuration-driven `$2,832` annual value, calculated as `$59 × 4 weeks × 12 months`. This is the temporary kids-program baseline and must be replaced with program-specific values when additional paid-acquisition programs launch.
- ✅ **Readable quiz fields (2026-08-28):** keep compact enums inside the website's routing and validation logic, but write the exact parent-facing answer labels into HighLevel custom fields so Joao can understand audience, age band, goal, experience, location, and recommendation at a glance.
- ✅ **Meta lead reliability contract (2026-08-28):** after durable HighLevel contact and opportunity acceptance, the browser and server send one consent-gated Meta `Lead` with the shared ID `lead_<request_id>`. The application routes accepted browser events directly to GA4 and Meta and emits only a non-routing `_routed` dataLayer diagnostic, so the older GTM `lead_submit_success` router cannot create an undeduplicated copy. Failed server events use the private Bluehost outbox and retry worker; no PII enters analytics.

### Implementation sequence

1. Resolve offer, rate card, booking, and design decisions.
2. Obtain Joao's approval and create Google Workspace for `joaocrusbjj.com`; use `joao@joaocrusbjj.com` as the proposed primary mailbox and decide whether `info@joaocrusbjj.com` is an alias or separate inbox. Authenticate the HighLevel sending domain.
3. Connect real forms, booking, Beehiiv, GA4, Meta events, and source attribution.
4. Start HighLevel phone/A2P setup only after account ownership, number strategy, consent, and use cases are documented.
5. Launch email-first if A2P approval is not complete; do not delay the entire campaign solely for SMS.
6. Keep Zen Planner for existing billing/membership until migration requirements are proven.
7. Run the HighLevel acceptance test and record evidence before paid-campaign optimization or automated SMS launch.

### Phase 2—not required for the first conversion launch

- Full custom CRM/admin pipeline
- Stripe subscription migration
- Revenue-versus-baseline dashboard
- Historical-lead win-back automation
- Voice AI / AI receptionist
- Advanced multi-location or multi-tenant platform work

---

## 7. Ownership and immediate action list

### AI visibility execution backlog (approved for planning 2026-08-26)

Canonical plan: [`docs/AI-VISIBILITY-ROADMAP-2026-08-25.md`](docs/AI-VISIBILITY-ROADMAP-2026-08-25.md)

- [ ] Capture the fixed 20-prompt baseline across Gemini, ChatGPT, Claude, Perplexity, and Copilot.
- [ ] Repair stale index signals and decide whether `/member-reviews` becomes a verified reviews page or an interim one-hop redirect.
- [ ] Verify Bing Webmaster Tools, submit the sitemap, and configure IndexNow.
- [ ] Build the approved citation source-of-truth record and audit the seven Tier 1 local profiles before editing any listing.
- [ ] Draft stable entity IDs plus `Service` and `OfferCatalog` relationships for confirmed programs and locations.
- [ ] Build a separate review version of the Dripping Springs location page. Preserve production until approval.
- [ ] Outline the first Joao-led authority answer, beginning with the After 60 topic, for Joao review before publication.
- [ ] Re-run the benchmark after indexing changes settle and report citations, accuracy, cited URLs, competitors, and qualified-lead relevance.

This backlog does not authorize production publication, Search Console mutations, directory/profile edits, outreach, or paid AI-visibility software. Execute each gated action only after its required access, fact, permission, and release checks.

### Diego

- [ ] Present 2–3 finalized offer options after rate-card clarification.
- [ ] Produce the toddler, adults, teams, privates, and location pages in the selected design.
- [ ] Wire GA4, Meta events, form/booking attribution, and email nurture.
- [ ] Draft the VSL and Back-to-School paid-social plan.
- [ ] Send Joao the written recap and Stoic/platform breakdown.
- [ ] Create an implementation checklist once booking/hosting access is confirmed.

### Joao

- [ ] Confirm the full rate card and registration/uniform rules.
- [ ] Select the paid/deposit trial structure.
- [ ] Confirm low-cost trial-uniform economics.
- [ ] Confirm any future schedule changes beyond the currently approved classes. Austin adult group is confirmed Tue/Thu 6:00–7:00 p.m.; adult private instruction remains appointment based.
- [ ] Provide Beehiiv, Zen Planner export/read-only, WordPress/hosting/DNS, Jetpack, booking, and Meta access as appropriate.
- [ ] Confirm Castle Hill marketing terms and request a Castle Hill website/classes listing.
- [ ] Approve the visual direction, buddy-pass mechanics, and guarantee position.

---

## 8. Decision hygiene

1. Update this file **first** whenever Joao or Diego makes a new decision.
2. Add the decision date, owner, and affected sections.
3. Update or add correction banners to older documents in the same commit when practical.
4. Do not silently convert assumptions into facts. Use the status legend.
5. Reverify volatile public claims—review counts, competitor offers, schedules, pricing, and platform behavior—before publishing.
6. Maintain one canonical schedule and one canonical rate card.

---

## 9. Source trail

Current conclusions were reconciled from:

- `README.md` — chronological project log, especially 2026-06-17 and 2026-07-22/23 entries
- `calls/2026-07-22-joao-strategy-call.md`
- `13-STUDENT-GROWTH-PLAN.md` §§7–8
- `08-NEEDED-FROM-JOAO.md` — July 22 intake and email corrections
- `assets/assumption-audit.md`
- `02-WEBSITE-AUDIT.md`
- `site/README.md`
- Live website and repository review performed 2026-07-23

When a statement in those sources conflicts with this file, follow this file's current status and then correct the stale source.

---

## Change log

- **2026-08-26** — Diego approved adding the 90-day AI visibility program to the project backlog. Use the canonical roadmap for phased execution across index repair, entity/service modeling, local citation consistency, Joao-led answer content, independent corroboration, and fixed-prompt measurement. Planning approval does not authorize production or third-party listing changes.

- **2026-08-25** — Diego approved Joao's expanded Jiu-Jitsu After 60 copy for the canonical page. Lead with the 4-week introductory format for men and women 60+, beginner reassurance, cooperative practice, no aggressive-sparring expectation, and “Relational First. Physical Second.” Preserve the confirmed Tue/Thu 11:20 a.m.–12:10 p.m. schedule and do not publish the conflicting 60-minute draft breakdown.

- **2026-08-20** — Diego approved a public Jiu-Jitsu After 60 program page for Dripping Springs. Position it as beginner-friendly training with a steady pace, practical technique, and confidence. Publish the exact Tue/Thu 11:20 a.m.–12:10 p.m. schedule under a standalone `after60` calendar filter. Do not silently include these classes under Adults.

- **2026-07-28** — Diego prioritized SEO and AI-search visibility for the custom-site launch. Build metadata, canonicals, structured entities, sitemap/robots rules, migration redirects, local-search signals, answer-ready content, and AI crawler access from the start. `llms.txt` may supplement discovery but must not replace indexable HTML, internal links, citations, or traditional SEO.

- **2026-07-27** — Joao's first-party Austin landing page confirms two Austin paths: Kids BJJ ages 8–12 on Tue/Thu from 5:00–6:00 p.m., plus adult private instruction by appointment with flexible scheduling. This does not confirm a recurring Austin adult group class. Keep the shared calendar unchanged until group times exist; document full address, directions, inquiry details, and remaining operational questions in `docs/AUSTIN-LANDING-PAGE-SOURCE-2026-07-27.md`.
- **2026-07-27** — Graduate the coaching team into one dedicated extended-bio hub rather than five thin profile pages. Keep the compact team cards on About, add explicit `Meet [first name]` links to stable profile anchors, and route every global `Coaches` link to the new hub. Each profile should combine role, verified credentials, teaching focus, personal path, and a next-step CTA while preserving one shared academy story.
- **2026-07-27** — Keep the About lineage deck visually attached beneath “A Lineage You Can See in the Teaching” instead of floating as a detached right-column statement. In every archival-video disclosure on Home and About, link all five verified original Joao-channel YouTube clips so visitors can inspect the source footage directly.
- **2026-07-27** — Make the coaching team a first-class trust destination without creating a redundant page: move the image-led team section directly below the About hero, add a global `Coaches` navigation link that deep-links to it, and add the same destination to every campaign footer. About remains the compact people-and-philosophy hub. Preserve Joao’s full source portrait in the hero with a portrait-aware frame rather than cropping it into a landscape box.
- **2026-07-27** — Treat “Plan a First Class” as a high-intent action: open a click-triggered, focused request layer instead of sending ready visitors to program exploration. Use a full-viewport sheet on mobile and a centered modal on desktop, while preserving the full contact page as the no-JavaScript fallback. Keep “Explore Programs” as the separate secondary path for visitors still researching. Mobile navigation must use the live header/viewport height, remain scrollable, respect safe areas, and suppress the sticky CTA while open.
- **2026-07-27** — Diego set two site-wide copy and typography rules: avoid single-word orphan lines in display headings at supported widths, and remove em dashes from body copy. Dash-like accents remain acceptable in small eyebrow labels.
- **2026-07-27** — Diego requested a denser, more intentional Home “Method” section: remove the detached paragraph above Joao’s portrait and replace the undersized checklist with substantial teaching-principle blocks that visibly fill the composition. Anchor Joao’s identity to the portrait rather than leaving surrounding text floating.
- **2026-07-27** — Diego approved exploring a Carlson Gracie lineage story on Home and About using Joao’s December 2005 seminar archive. The framing should add credibility through direct historical proof and translate pressure-tested tradition into Joao’s responsible “warrior in a garden” teaching approach. Keep “final seminar,” exact belt chronology, source ownership, and personal recollections pending Joao’s confirmation before production.
- **2026-07-27** — Diego supplied the official circular Joao Crus Brazilian Jiu-Jitsu logo for production use. Use the transparent processed logo in current-site navigation and branded footers, and derive the favicon set from the same artwork; retire placeholder “JC” marks on current pages.
- **2026-07-27** — Diego chose the lighter Toddler-page shell as the closer model for the full site. Global navigation and hero sections should use warm white/cream surfaces with black typography, yellow/blue accents, framed imagery, and hard borders/shadows rather than dominant black hero fields. Black remains appropriate for the slim utility strip, buttons, and intentional contrast sections.
- **2026-07-25** — Diego set the Teen interest-section hierarchy: “Help choose the time that can actually work.” and its intro span the full section above the two-column content; the three-step availability/review block sits left of the form, and the form sits on the right at desktop widths.
- **2026-07-25** — Diego approved integrating the Toddler, Youth, and Teen landing pages into the campaign-site navigation. The clean header pattern is one global site header plus a contextual anchor bar on long program pages. Distinct AI hero concepts are approved for Home, Programs, Schedule, and Locations as review ideas.
- **2026-07-23** — Joao approved the campaign-group visual direction after an in-person review and requested the rest of the site be built in that style. Production visual direction is no longer blocking.
- **2026-07-23** — Initial authoritative decision record created from the repository-wide strategy, documentation, website, and implementation review.
