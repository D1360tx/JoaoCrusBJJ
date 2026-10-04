# PR134 release readiness: BLOCKED (pre-deploy only)

Updated 2026-10-04 after bounded owner approval. Tested code/artifact and pre-update documentation head: `9819ab6e52b5477bb46fa45903ed2275f5fe6d6d`; draft PR134. This follow-up changes documentation only. Exact pushed documentation SHA/ref/check readback is saved in the private restart checkpoint. **No merge, deployment, production code/config change, GHL/Meta mutation, live POST or customer send occurred. The only origin write was the approved private preservation of two exact files; neither public original was removed because logging safety remains blocked.**

## Green / blocked gates

- [x] Independent review of PHP dispatcher and all three submitters: early neutral/reload exits precede normalizers and GHL/contact/tag/opportunity/note, mail, Meta and outbox calls. Method/origin/body/type/JSON/rate-limit guards remain first. Rate-limit counters and privacy-safe logs still change locally on rejected attempts; “zero side effects” means zero provider/mail/conversion effects, not zero logging.
- [x] Exact code-head archives already passed 310/310 Node tests in both preview and production, 151 abuse cases (52 dispatcher, 53 intercepted browser, 46 contract), 45 Python tests, syntax/lint, 5,661 preview and 5,829 production validator assertions. Evidence: `../TEST-RESULTS.md` (same directory file `TEST-RESULTS.md`) and private `recovery-29d973.../results.json`. Source SEO's seven issues reproduce on untouched base. No skips/fake modules/live test transport.
- [x] Fresh read-only SSH snapshot: all **156** active-root files independently match an origin SHA256 readback. Main+exact PR133 endpoint overlay rebuilt in network-denied isolation: **154** generated files. Live PHP matches overlay hash `212e5960dbef0a2eefda8bf8933675950102c21d9cd8f97478bb542d2bd8d461`.
- [x] Baseline drift bounded and explained: **121** baseline files match exactly; **32** HTML differences are solely the campaign runtime query hash. Remaining runtime difference is the exact previously tested cached fixture (`1dd005817e226a6c97c282260614d53627edec016d0324f5cfd63bad8093183f`), traceable to `488ce23` before booking-only guard `43d3a1c`. `/book/` already uses the isolated guarded `0c3e7d6c41e9` asset. No newer lifecycle/consent/CAPI/notes behavior is lost. Both quizzes, contact.php, lifecycle.php, retry endpoint, navbar, consent, attribution, hosting config, sitemap and robots match the baseline.
- [x] Actual consumers inventoried below. Unknown external callers are explicitly outside first-tranche claims; no fallback rerouting.
- [x] Exact **40-path** non-deleting generated release manifest below: 35 HTML, 4 JS assets, 1 PHP gate. Existing immutable booking companion retained, not retired.
- [x] **Actual failed Vercel logs retrieved read-only** through a dedicated native Chrome window in the existing signed-in session. Exact project/team `d1360txs-projects/joao-crus-bjj`, deployment `2NyHdaM8RjsmpEKaFCLtQUgqU6sB`, source `9819ab6`, preview `https://joao-crus-q55pgzvcq-d1360txs-projects.vercel.app`. Dashboard lists 1,289 lines; captured relevant excerpts, not a complete export. Observed `Error: Cannot find module 'playwright'` from `tests/lead-abuse-browser.test.js`, and `AssertionError [ERR_ASSERTION]: Set JOAO_TEST_PHP to a local isolated PHP CLI; tests must not skip` at `tests/lead-abuse-behavior.test.js:11:10`. Command `python3 scripts/build_vercel_site.py && node --test tests/*.test.js && python3 scripts/validate_vercel_build.py` exits 1. **Remote check remains BLOCKED by real test-toolchain prerequisites**, not by proven application behavior. Existing API-token 403 is historical and was not retried; browser authorization works. No dependency/config edit, test skip, redeploy or speculative fix was attempted. Local success does not waive the failed remote check.
- [ ] **Public-log hygiene remains BLOCKED; preservation complete.** Owner approved the two exact files only. Both were preserved under `/home1/joaocrus/.joao-pr134-evidence-20261004T192833Z/` (0700), each file and manifest 0600; independent later readback verified archive and unchanged original SHA256. `api/error_log`: 2,486 bytes, `bf0682d807039046b06810006fdb686733a2b3137f6bd67efc8c27228f7bc032`; probe: 41 bytes, `3974e142fe2ca3b72c911c61475daa172fddafc94ba7012432684064a03b66bc`. No log content was printed or committed. Active `.htaccess` points `LEAD_LOG_FILE` outside public_html; lead.php overrides PHP logging, and the existing writable private directory is 0700 (its regular log is 0644 inside that protected directory). But deployed contact.php and lifecycle.php call error_log without that override, no local PHP logging directive was found, and `/opt/cpanel/ea-php83/root/etc/php.ini` has `log_errors = On`, `error_log = error_log`. CLI readback confirms the same relative default, **not effective Apache-SAPI proof**. The precise producer of this existing log remains unproven. Private logging for all relevant producers / prevention of recreation is not verified. Neither original was removed; absence/recreation test is therefore **NOT RUN**, not passed. Do not change php.ini/.htaccess/logger code, chmod other server paths, or repeatedly delete logs under this approval. Existing backups remain public-log evidence, not clean rollback.
- [x] **Public GET/browser path established:** isolated Playwright Chromium with a fresh context and service workers blocked returns `/` 200, `/contact/` 200, `/book/` 200, `/api/lead.php` 405. All non-GET and all hosts except exact `joaocrusbjj.com` were blocked before navigation; six third-party requests were blocked. The browser harness real-profile startup refusal was bypassed only by using an unrelated fresh unauthenticated browser, not attaching cookies or changing settings. `/book/` runtime confirms `data-booking-only`, zero forms/dialogs, six calendar links and the existing immutable `campaign-site.0c3e7d6c41e9.js`; its two anonymous checkbox inputs are consent UI, not lead capture. No links submitted/opened or provider calls allowed. Earlier command-line 406 does not mean the public site is inaccessible. Future rollout can reuse this GET-only context for route/asset hashes and DOM checks; this is baseline proof, not new-code deployment proof.
- [x] **Owner cached-client/neutral UX accepted** in “Ok let's do it”: fail-closed HTTP409 with explicit reload/manual contact, no grandfathered timers, auto-retry or fallback mail; neutral nonconversion status does not promise delivery. Durable decision recorded in CURRENT-DECISIONS.md.
- [ ] Remaining readiness blockers are **verified private PHP logging plus conditional public cleanup**, and **failed remote test-toolchain check**. A fresh full clean backup/extraction rehearsal remains a future deployment preflight requirement, not an action authorized now. Explicit Bluehost deployment permission is still absent.

## Neutral and legitimate semantics (independently reviewed)

The gate checks both `website` and `company_website`, malformed/null/array/infinite/future timestamps and <3,000ms against one receipt clock. Exactly 3,000ms passes; >24h remains allowed with controlled logging. Protocol 2 missing timing is neutral; missing timing from cached protocol is HTTP409. The neutral response has exactly six keys: handled=true, outcome=neutral, accepted=false, contact_accepted=false, opportunity_accepted=false, tracking_allowed=false. No request/event/provider IDs. Each client recognizes only this strict envelope and exits before accepted-result/thank-you/GA4/Pixel routes; quizzes show neutral, static/popup show “Request processed.” No conversion-error diagnostic for new neutral/reload clients. Existing start/step/PageView diagnostics are not conversions and can precede submit.

Normal responses require HTTP success, contact + opportunity + durable note accepted, exact request UUID equality and `meta_event_id = lead_<request_id>`; missing note, mismatched IDs, malformed mixed neutral/accepted envelopes are errors, never conversions. Legitimate enums, required phone/name/email/consent, repeated availability values, first/latest attribution adapter, quiz fields/readable emission, consent/disclosure fields, SMS release interlock and booking-link mapping remain unchanged. Guide remains its own phone exception and CompleteRegistration semantics, not a replacement acquisition test. GHL durable intake and note precede response; matching browser/CAPI IDs and consent routing remain intact. Existing PR133 all-status opportunity lookup/name-only update is preserved: no stage/status/value reset on repeat; new opportunities use reviewed configured defaults.

Booking popup/quiz submits request an academy follow-up, not a confirmed calendar appointment. `booking_start` remains diagnostic/custom StartFirstClassBooking, not Schedule. `/book/` stays calendar-only with no lead UI. Endpoint success does not mean booking confirmed or downstream GA4/Meta receipt independently observed.

Suspect AND helper remains **unreferenced by intake** and catches only 1/4 fixtures. No suspect CRM storage, staff-only path, tag, phone-validation exception or additional live gate is integrated. Unknown staff-only GHL safety is **not a blocker to the isolated early-drop code tranche** and cannot be represented as certified protection.

## Actual bounded consumers / alternate handlers

Fresh active-root HTML has 42 routes, 33 campaign-runtime consumers: 32 popup-capable plus `/book/` opted out. The two quizzes explicitly use `/api/lead.php`. Exactly three JS transports own submit: campaign-site.js (11 static forms + popup), program-fit-quiz.js, austin-program-fit-quiz.js. Static form routes:

- `adults-program/index.html`
- `contact/index.html`
- `found-the-flyer-active/index.html`
- `found-the-flyer-control/index.html`
- `found-the-flyer-v2/index.html`
- `index.html`
- `jiu-jitsu-after-60/index.html`
- `little-champions/index.html`
- `practice-under-pressure/index.html`
- `team-building/index.html`
- `teens/index.html`

Quiz routes: `program-finder/quiz/index.html`, `austin-program-finder/quiz/index.html`. Shared popup runtime consumers:

- `about/index.html`
- `adults-program/index.html`
- `austin-brazilian-jiu-jitsu/index.html`
- `classes-schedule/index.html`
- `coaches/index.html`
- `contact/index.html`
- `found-the-flyer-active/index.html`
- `found-the-flyer-control/index.html`
- `found-the-flyer-copy-lab/index.html`
- `found-the-flyer-v2/index.html`
- `index.html`
- `jiu-jitsu-after-60/index.html`
- `kids-program/index.html`
- `little-champions/index.html`
- `locations/index.html`
- `parent-guide/first-bjj-class-checklist/index.html`
- `parent-guide/how-bjj-builds-life-skills-kids/index.html`
- `parent-guide/how-to-choose-kids-bjj-program/index.html`
- `parent-guide/index.html`
- `parent-guide/what-age-start-bjj/index.html`
- `parent-guide/what-happens-bjj-class-ages-3-7/index.html`
- `parent-guide/what-tapping-teaches-children/index.html`
- `practice-under-pressure/index.html`
- `privacy-policy/index.html`
- `private-bjj-lessons/index.html`
- `summer-camp/index.html`
- `team-building/index.html`
- `teens/index.html`
- `terms/index.html`
- `thank-you/index.html`
- `training-programs/index.html`
- `youth-bjj/index.html`

Generated/source HTML+JS and Apache rewrite config contain **zero contact.php consumer references** and no fallback proxy to it. `/contact/` is the honest browser fallback and itself submits to lead.php, never contact.php. Deprecated `api/contact.php` nevertheless remains deployed and callable: separate older website-only honeypot/rate-limit/mail handler (`ok:true`, not durable CRM acceptance), no new timer gate, and possible PII logging on mail failure. No claim it is globally unused or protected by PR134; unknown external/direct callers cannot be disproved without traffic evidence. Do not retire/modify it or route old clients there without separate approval. Production builder copies `deploy/bluehost/`; Vercel staging does **not** ship PHP, root `api/` has no functions, and vercel.json has no lead/contact proxy/rewrite. The Vercel review URL is not an alternate functional production intake. `lifecycle.php` and `meta-capi-retry.php` are separate reviewed signed/provider utilities, not frontend intake fallbacks, and remain byte-preserved. Historical excluded comparison forms (`action="#"`) are not shipped. Coverage is the three identified site transports to lead.php, not every publicly addressable handler or all forged spam.

## Exact generated release manifest (candidate, NOT deployment permission)

Paths relative to `$HOME/public_html/website_6a4b95e5`. SHA256 comes from the tested production archive, compared against fresh live root. Docs/tests/source HTML are not uploaded. Keep `.htaccess`, secure env, other APIs, consent/attribution/CAPI/lifecycle, navbar, sitemap/robots and every nonmanifest file unchanged. No delete. Preserve `assets/campaign-site.0c3e7d6c41e9.js` for cached `/book/` clients. The 32 version-only live HTML deviations were normalized only for **comparison**, never edited live.

| Path | Candidate SHA256 |
|---|---|
| `about/index.html` | `b1bc8a3e825c7c942cd0684a4eecc26be10c926ef58eb7eb219297359ac8e85d` |
| `adults-program/index.html` | `e6d180d0446ebc6ea6523afa2fc5d9224b1bc5987068e36ca25e925306b5dede` |
| `api/lead.php` | `1d34aaf2219de9220244d5967148febd369a33dc07916512f8e7af5d14ae93a4` |
| `assets/austin-program-fit-quiz.js` | `2b691696e484f08a4176247831a32a67979799fe9da74cf2dafe1a9c84669991` |
| `assets/campaign-site.18e1d4129bdd.js` | `18e1d4129bdd1ac8f4800c84fc583d6120ef239cc71c25e1bdeb945896cf1ebd` |
| `assets/campaign-site.js` | `18e1d4129bdd1ac8f4800c84fc583d6120ef239cc71c25e1bdeb945896cf1ebd` |
| `assets/program-fit-quiz.js` | `55858f7a0e399110c6bda8a121f0ca88b64a89db7138ce66ed251f23396ee5fe` |
| `austin-brazilian-jiu-jitsu/index.html` | `f7f3c7fff3f45f360baabd6200d8aecd2c31ca158854d97b6c6da82659c09550` |
| `austin-program-finder/quiz/index.html` | `bdeca7a397497fcacaab21ef39084a3ba9159ae9f5eceb0155405419729ce8e3` |
| `book/index.html` | `e209e01ef4d9089b3200a67b9816e91ec3dad0a217d2f7052ad7b7653083cb78` |
| `classes-schedule/index.html` | `0479189d028238de9e19fa3846c481a5eeac554e795da230094db9d28ca76371` |
| `coaches/index.html` | `a72dc4e9574ed595dfc1d79e86fcec0a6cf4de4b688e981f61910d97366f6852` |
| `contact/index.html` | `7ecc15bcc8842dfb40c1fe925a6de0e16b280d819be11d70cfa914754e46b662` |
| `found-the-flyer-active/index.html` | `75b27c91f294caa3fcf5d0bbde23acd598fbbf99bd71549efafeaf9bdc950be6` |
| `found-the-flyer-control/index.html` | `8d3e63c503c47883fa72e9d80128c883305dfd76e414cfbb829c3496d4eef261` |
| `found-the-flyer-copy-lab/index.html` | `f0e1a8c22c85f5741fd7a77c37432bfa15a5eb345af060b48c3975a8191e1dfc` |
| `found-the-flyer-v2/index.html` | `3d47a36bb1d85f62e67b685db3c4f772dfe9db21d755009deae5a6cdd02f19d7` |
| `index.html` | `db83907f784f03fd95243288801ab542a3c21d99d06416aabb6f05a9884b03f3` |
| `jiu-jitsu-after-60/index.html` | `101dc4a2da72f64d384e2c79907fb37655c9655329ff839748651779d737db7b` |
| `kids-program/index.html` | `908ba17b68ae2646f6dc5ec6fd72cebfe67d59b19c5669cea4c4994918d107a4` |
| `little-champions/index.html` | `69e989429b4d709d8cd60ce1f66d95b7cc9a96c87736ef0a423690bb8713fe57` |
| `locations/index.html` | `eb7f2bcbca12e6c9e76ab59fc9b3684005f15bc9ff01d50132131e5242479630` |
| `parent-guide/first-bjj-class-checklist/index.html` | `1f30ef52243aee76fd09eb1242f15c50d2b148191afc2d21a0c1c2ebe4a074e0` |
| `parent-guide/how-bjj-builds-life-skills-kids/index.html` | `f7d038abaa575eb14f54c526ab6939f5128407b6c8b8516f964ec914efb8dff0` |
| `parent-guide/how-to-choose-kids-bjj-program/index.html` | `1d867f24613c7f8a733a5c6414a206a115f57147c14a2d225930fdb6910342d7` |
| `parent-guide/index.html` | `c113e45cffd6df97e43141da2928fe973821b1f2ad52fd4294c4fd65e7537cd3` |
| `parent-guide/what-age-start-bjj/index.html` | `6fdd3d78793c5923b0294888a602fb2cbea9fe5bf4adf7f17daa72bf0fa58236` |
| `parent-guide/what-happens-bjj-class-ages-3-7/index.html` | `027e4da7e5cf7aa8edf8ff98b00e4f72877c3f8055d822825640acc693fce572` |
| `parent-guide/what-tapping-teaches-children/index.html` | `60684f3847ae1d95af6a24b5db52601da3fa1a62af0a80b16993e170a54434a1` |
| `practice-under-pressure/index.html` | `00d81ed712faaee91c394342defc677ab015892b57c811928db3d98e4be4e45d` |
| `privacy-policy/index.html` | `810f4930298b77e3a8bec785a566521d9d3bc58a7ce5d89a98d7e7d7af30952e` |
| `private-bjj-lessons/index.html` | `1c7de31c8641e4da99d8fba4f29ea2c08a473ff15b57680d3c6c317c201c71c9` |
| `program-finder/quiz/index.html` | `35bc9c0ad3c8fc55960023eaec10ca198cf26e76c8bffa9cfd0000015eed0f85` |
| `summer-camp/index.html` | `30ab131f60eef6f38a9e2ed6f461846bb173ddbe4737434fafd650c64437f343` |
| `team-building/index.html` | `79d45949474a53a685cfa16ac2385745426586d2e59990ac5659b6ce02775e8e` |
| `teens/index.html` | `f3a78e009c538a856693a9bb7e210bf64293ec1564becaa402f1f3ce96646bb2` |
| `terms/index.html` | `b5f585fa8d9f1358771d56bc0ea2248a08b3d5df2851971bbc718703fd6ac4d7` |
| `thank-you/index.html` | `6d9018682b74d84243767cc465c112ddf46f7a1fa2bdae16b6059e3406d7a717` |
| `training-programs/index.html` | `01387d59d56fc2d08ee416ce9a51b68fb8fa3d94a52422452fa4ba7de63fca18` |
| `youth-bjj/index.html` | `bbbb2961c202ea8b48f1e4806ad07fd89906e6b234bf4b89b7dee9299da15683` |

## Ordered future promotion and compatibility decision

1. Obtain exact final reviewed SHA and green remote diagnostics; production archive/test it, require identical generated manifest or regenerate/reapprove. Fresh preflight rehash **all 156 current files** and abort on unexplained drift; do not deploy wholesale main or site/.
2. Secure housekeeping is approved only for the two exact files; preservation is complete, but removal/absence proof is held pending verified private PHP logging. Create full outside-webroot backup, hash and test extraction. Stage only manifest files outside root; verify artifact hashes, PHP lint and dry-run path allowlist. No server env/WAF/CRM/GTM edits.
3. Promote 4 assets first (three stable-name scripts plus new immutable booking companion), then all 35 HTML references/traps/neutral screen, finally `api/lead.php` gate. Same-directory temp+rename each changed target after checksum verification. Stable filenames with query versions are not immutable; old open tabs retain old in-memory code. The old server accepts new signals during transition, so protection begins **only** at endpoint cutoff. This is not atomic and must be a short operator-controlled window with rollback ready.
4. Rehash 40 targets and every protected nonmanifest target; residual identical-options dry run zero. GET-only public route/asset/browser proof, no submit. Retain both immutable booking assets. Deployment approval never implicitly authorizes a POST or CRM send.
5. Owner decision **accepted on 2026-10-04**: stale cached pages fail-closed HTTP409 and explicit reload/manual contact, rather than grandfather missing timers or send fallback mail. Values remain only in the current new-client form until reload; copy before reloading, never auto-retry. Cached runtime shows historical error diagnostic, not conversion, and cannot preserve values across reload. Rejecting this decision means release blocked, not weakening gate. Neutral “Request processed.” explicitly does not promise delivered lead.

## Backup / rollback commands (templates, NOT EXECUTED)

Only after the above blockers and approvals. Substitute exact reviewed SHA/staged paths from operator evidence. Fail closed on missing values. Full backup includes hidden files, remains outside webroot, and never follows symlinks into secure env. Before public-log cleanup, archive it separately as evidence; do not restore that contamination as a clean release. The below full rollback archive must be made **after approved hygiene**.

```sh
set -eu
LIVE="$HOME/public_html/website_6a4b95e5"
: "${APPROVED_SHA:?exact reviewed SHA required}"
: "${STAGE:?outside-webroot staged manifest artifact required}"
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
BACKUP="$HOME/releases/pr134-$APPROVED_SHA-$STAMP"
umask 077
mkdir -p "$BACKUP"
tar -cpf "$BACKUP/live.tar" -C "$LIVE" .
test -s "$BACKUP/live.tar"
tar -tf "$BACKUP/live.tar" > "$BACKUP/archive-paths.txt"
sha256sum "$BACKUP/live.tar" > "$BACKUP/live.tar.sha256"
# Capture origin manifest before promotion. Do not dereference symlinks.
(cd "$LIVE" && find . -type f -exec sha256sum {} +) > "$BACKUP/live.sha256"
mkdir "$BACKUP/rehearsal"
tar -xpf "$BACKUP/live.tar" -C "$BACKUP/rehearsal"
(cd "$BACKUP/rehearsal" && sha256sum -c "$BACKUP/live.sha256")
(cd "$STAGE" && sha256sum -c "$STAGE/RELEASE.sha256")
php -l "$STAGE/api/lead.php"
# Approved RELEASE.paths is exactly the 40 paths above, not the full dist.
rsync -rnic --files-from="$STAGE/RELEASE.paths" "$STAGE/" "$LIVE/"
# STOP: independently review all itemized paths; ordered temp+rename promotion
# uses separate assets.paths / html.paths / gate.paths, never --delete.
```

Coordinated rollback: pause cutoff work, restore **old endpoint first**, then original HTML and three stable JS assets from the same backup. During the short window the old endpoint accepts both client protocols; old clients are not pointed at the new gate. Preserve new immutable asset (harmless/unreferenced) and old immutable booking asset. Do not restore every backup file blindly or change CRM state/notes/tags/queued Meta events. Create `ROLLBACK.paths` as `RELEASE.paths` minus the newly absent immutable filename, assert every path existed in the preflight manifest. Exact restore templates:

```sh
set -eu
: "${BACKUP:?verified recorded backup directory}"
: "${LIVE:?verified active root}"
(cd "$BACKUP" && sha256sum -c live.tar.sha256)
# rehearsal is already hash-verified; origin PHP lint before restoring gate.
php -l "$BACKUP/rehearsal/api/lead.php"
# For each path, same-directory temp-copy then atomic rename; restore endpoint first.
command cp -p "$BACKUP/rehearsal/api/lead.php" "$LIVE/api/.lead.php.rollback"
mv -f "$LIVE/api/.lead.php.rollback" "$LIVE/api/lead.php"
rsync -rnic --files-from="$BACKUP/ROLLBACK.paths" "$BACKUP/rehearsal/" "$LIVE/"
# Review allowed paths, then restore original HTML and stable assets (no --delete).
rsync -rc --files-from="$BACKUP/ROLLBACK.paths" "$BACKUP/rehearsal/" "$LIVE/"
rsync -rnic --files-from="$BACKUP/ROLLBACK.paths" "$BACKUP/rehearsal/" "$LIVE/"
(cd "$LIVE" && sha256sum -c "$BACKUP/live.sha256")
```

Last manifest check proves all original regular-file bytes restored, not absence of the deliberately retained new immutable asset. Require protected file-set/symlink comparison too. Then GET-only public old route/asset proof; if transport remains 406, do not claim verified rollback. Never roll back CRM by resetting stages/values or replaying provider writes.

## Smallest approval requests (NOT YET ASKING TO DEPLOY)

**Now, to unblock readiness:** separately approve a minimal reviewed logging-safety repair (private PHP logger coverage/effective Apache verification), then finish the already-authorized two-file cleanup with absence/recreation readback; separately scope a real Vercel test-toolchain repair for the observed missing Playwright and isolated PHP prerequisites, retaining all tests. Neither repair is authorized by the bounded readiness approval. Logs access, public GET transport and cached-client acceptance no longer need owner action. No deploy/merge or broad audit is requested now.

**After those gates:** “Approve a backup-first Bluehost-only PR134 first-tranche release of the exact reviewed 40-path manifest, in asset → HTML → PHP order, retaining old immutable assets and all nonmanifest/CRM/lifecycle state, with read-only acceptance and coordinated rollback. No merge, GHL/GTM change or live POST included.” Any future merge must be explicitly approved and rebuild the actual authoritative merged SHA first.

**Separate optional acceptance:** “Approve exactly one controlled legitimate acquisition browser submission after verified deployment, using an explicitly controlled identity/destination and disclosed channel consent, with exact contact/opportunity/note, request/event-ID and downstream transport/readback evidence. Existing live automation may send according to consent; no invalid/neutral POST, second fixture, forced enrollment, tag/stage reset or cleanup deletion is included.” Name the form and controlled recipient before execution; no phone invention or guide substitution. Synthetic cleanup needs its own complete-backup approval. This valid canary does not independently test neutral-drop behavior (already locally proven) or authorize staff-only heuristics.

## Private evidence checkpoint

`/home/d1360/joao-form-spam-runtime/readiness/`: independently reconciled `live-manifest.json` / `origin-manifest.sha256`, `comparison.json`, `consumer-inventory.json`, baseline build log and actual Vercel 403 metadata/events responses. New read-only browser evidence: `public-get-browser.json`, `book-runtime.json`, and three `vercel-native-capture-*.json` excerpts. Remote preservation manifest is in the private evidence directory above. Restart state is `bounded-approval-checkpoint.json` in this local readiness directory; it includes final Git/PR refs and exact remaining gates. Raw snapshot/log bytes stay 0700 directories/0600 files outside repository, not published. No secrets or customer payloads appear in this report. BLOCKED is the honest release verdict; code tranche remains locally tested, helper-only limitations unchanged.
