# PR134 Bluehost deployment result: LIVE

Verified 2026-10-04T22:36:08.586582+00:00. Diego explicitly approved the backup-first exact 40-path first-tranche deployment. Production source is **`c849a48f2209090139bdc1ebc1ce74411e08cf7d`**, not the later documentation commit. PR134 remains open/draft; no merge.

## Backup, staging and ordered promotion

- Fresh origin preflight: all **155 regular files**, **53 directories**, **0 symlinks** match the expected post-logging baseline; no drift. Hidden configuration included.
- Full clean active-document-root backup, outside webroot: `/home1/joaocrus/releases/pr134-c849a48f2209090139bdc1ebc1ce74411e08cf7d-20261004T222950Z/live.tar`. Archive **26378240 bytes**, SHA256 **`bb3841105985f8a5e35119219c8e207583fd0395aa59b1a3e7fdb8480b75a738`**; mode 0600 under private release directory. Full extraction rehearsal matched all original file hashes and file/directory/symlink sets. This is the active website root, not unrelated Bluehost addon-domain trees.
- Restore handle: `/home1/joaocrus/releases/pr134-c849a48f2209090139bdc1ebc1ce74411e08cf7d-20261004T222950Z/rehearsal/`. Coordinated rollback is old `api/lead.php` first, then the original 35 HTML and three stable JS assets, using checked same-directory temp+rename. Retain both immutable companions, never restore removed public-log contamination or alter CRM state. Rollback was prepared but **not needed/executed**.
- Fresh `git archive` production build at the exact approved SHA; production validator passed **5,829 assertions**. Prior mandatory native release-job result is bound to that same SHA (310 Node tests in each mode, 45 Python tests, native PHP/Chromium, no network/provider transport).
- Stage: `/home1/joaocrus/releases/pr134-c849a48f2209090139bdc1ebc1ce74411e08cf7d-20261004T222950Z/stage`. Approved/staged/live manifests agree **40/40**: 4 assets → 35 HTML → 1 PHP endpoint. Exact manifest SHA256 **`ab8388724188589fd40719561fbfbdc792cff1fc8a598de8e59360ac1003ab87`**. Origin PHP lint passed before promotion.
- Promotion used only the reviewed allowlist, verified same-directory temporary files, then atomic per-file rename. No deletes, broad rsync, source upload, env/config overwrite or wholesale main release. Checkpoints persisted after backup, staging, assets, HTML, endpoint and final verification.
- Final origin inventory: **156 regular files**, same **53 directories**, **0 symlinks**. Exactly one new immutable asset added. **116 existing nonmanifest files remain byte-identical**. `.user.ini`, `.htaccess`, old `assets/campaign-site.0c3e7d6c41e9.js`, contact/lifecycle/retry endpoints, consent/attribution and all other protected files retained. Secure external env hash/mode unchanged; exact env pointer preserved. No private queue/provider operation invoked. Checksum-only residual allowlist dry-run returned **zero changes**.

## Public GET-only verification

Fresh unauthenticated Chromium, blocked service workers, ALL non-GET and third-party requests blocked before navigation. No submit buttons clicked; no POST, provider edits, lead fixtures, sends, GTM edits or Turnstile.

| Public route | HTTP | Exact approved HTML hash | Runtime |
|---|---:|---|---|
| `/` | 200 | PASS | 0 JS exceptions |
| `/contact/` | 200 | PASS | 0 JS exceptions |
| `/teens/` | 200 | PASS | 0 JS exceptions |
| `/parent-guide/` | 200 | PASS | 0 JS exceptions |
| `/program-finder/quiz/` | 200 | PASS | 0 JS exceptions |
| `/austin-program-finder/quiz/` | 200 | PASS | 0 JS exceptions |
| `/book/` | 200 | PASS | 0 JS exceptions |

All four deployed JS assets returned HTTP200 and matched exact approved bytes. Root/contact/teens static forms and opened booking dialogs expose the company trap and initialized timestamp; both quiz starts have timestamps and traps. Traps are aria-hidden, tabindex -1, autocomplete off, and offscreen or inside an unrendered quiz step. Popup timers intentionally begin on opening, not hidden dialog creation; Austin quiz starts directly while the general quiz has a visible intro. `/book/` has zero forms/dialogs and six calendar links with the new immutable companion. Its consent controls are not lead UI.

All seven routes have zero page JavaScript exceptions. Console resource-error lists equal the pre-release baseline exactly; intentionally blocked third-party resources account for ERR_FAILED messages. Each run blocked 15 third-party GETs, no non-GET request occurred. This is isolation-aware console proof, not acceptance of tracking-provider delivery.

`GET /api/lead.php` → **405**, body `{"accepted":false,"error":"Method not allowed."}`. No handler POST was attempted. Public quiz DOM includes hidden “Request processed.” neutral screens without a delivery promise. The three byte-verified public submit scripts retain trap/timer/protocol2 payload construction and strict six-key neutral envelope recognition; earlier exact-SHA native/local intercepted tests establish control-flow behavior, not a live neutral response.

Initial read-only verifier attempts assumed hidden popup timers were already initialized and attempted the hidden Austin intro button. These were harness assumptions, not production defects; source-derived opening/start checks corrected them. A zero-sized hidden quiz-step trap was subsequently classified as unrendered rather than requiring negative geometry. No failed live artifact/hash/runtime gate was observed; no source change or rollback occurred.

## Limits and remaining work

- **No live lead delivery proof.** No controlled legitimate/neutral/invalid POST, HighLevel persistence, customer email/SMS, conversion delivery or downstream receipt was exercised.
- First tranche covers the three known site transports to lead.php. It does not protect every externally callable handler: deprecated contact.php remains untouched, unknown direct callers remain unknown.
- Suspect-name/phone AND helper remains unreferenced by intake and detects only 1/4 existing fixtures. Staff-only routing/classifier/tag integration is not deployed or certified. Turnstile remains separately approval-gated.
- Cached old pages fail closed with HTTP409/reload/manual-contact policy; no grandfathering, auto-retry or fallback mail.
- Optional controlled legitimate canary requires separate explicit authorization and controlled destination; remaining staff-only heuristics and any alternate-handler retirement need separate review/scope. PR merge is not authorized.

## Exact path proof

All rows below: approved SHA256 = staged SHA256 = final origin SHA256. The manifest hash above binds the newline-delimited SHA256 manifest. Full private evidence: `/home/d1360/joao-form-spam-runtime/deployment-exact40/`; origin checkpoint JSON and hash maps remain in the private rollback directory.

| Path | Approved = staged = live SHA256 |
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
