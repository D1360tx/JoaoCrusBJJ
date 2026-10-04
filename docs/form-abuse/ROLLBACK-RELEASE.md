# Rollback and release hold — NO DEPLOY / NO MERGE

This branch is build/local-test only, **not authorization to deploy**. No production fixture, credential, workflow, contact, consent, GTM, Meta, Beehiiv, lifecycle or server-env mutation is included.

## Exact first-tranche behavior

- Each of the 11 static forms, popup and two quizzes sends a text `company_website` trap (max 200, offscreen, aria-hidden, excluded from tab/autofill) plus existing `website` wherever present, integer millisecond `form_started_at`, and numeric protocol version 2.
- Static timers start on DOMContentLoaded mount. Popup timer starts once on first actual open; closing/reopening the same form preserves values/timer/request ID. Quiz starts at intro/direct/embedded start, not final contact; back/next/validation/retry preserve timer/ID. Explicit restart is a new session.
- PHP captures receipt clock once, retains origin/type/body/JSON/rate-limit guards and rejects traps, malformed timing, future time, and <3000ms before normalization and any provider/mail/Meta/outbox side effect. Exactly 3000ms is allowed; >24h is allowed and safely logged.
- Protocol-2 missing timing and all malformed/speed/trap cases return HTTP 200 with the **exact six-field neutral envelope**. No lead/event/provider identifiers or rule disclosure. Clients render “Request processed.” only, with no conversion, conversion error diagnostic, success/result routing or conversion redirect. Strict durable acceptance still requires matching request/event IDs, contact/opportunity/note booleans.
- A missing timestamp without protocol 2 returns HTTP 409, `accepted:false`, `reload_required:true`, and “Please reload this page before sending your request.” New code keeps entries in memory and offers copy-before-reload/manual call, never auto-retries. Cached deployed code displays its existing error UI/diagnostic with this message; it cannot learn the new protocol. This policy needs explicit release sign-off.
- Logs retain only validated UUID or `unavailable`, fixed event/reason, controlled protocol/form values, numeric provider status/error and exception class. Provider payloads/messages/traces, operation URL/query/contact IDs, IP/UA/UTM/PII are excluded; fallback request IDs are deliberately uncorrelatable in logs but accepted event-ID grammar is unchanged.

## Preserved baseline

Main d7b0132 lacked the already-deployed PR133 overlay. This branch applies only its PHP diff from e4965d9; its exact source matched saved deployed SHA256 `212e5960dbef0a2eefda8bf8933675950102c21d9cd8f97478bb542d2bd8d461`. PR133 remains open, not merged. Existing opportunities are queried with status=all and updated name-only (no stage/status/value), GET has no JSON body, new opportunities retain configured fields. Legitimate validators, booking/consent/tag/SMS interlock, notes and browser/CAPI event pairing remain intact. No normal-path tag reorder or CRM safety redesign is included.

The existing script version generator is unchanged: every referring generated HTML must use new content versions. `/book/` emits its own new content-hashed campaign companion and **zero lead UI**; do not overwrite/delete historical immutable assets used by cached HTML. Source changes are not a production artifact manifest.

## Second tranche NOT integrated / release prerequisites

The pure tested AND classifier requires ASCII first name >=12 letters, >=3 adjacent case changes, empty last name, and phone failing today's shape normalizer. No no-vowels rule, OR broadening, name-only rejection, phone-validation exception, suspect tag, staff-only persistence or suspect provider path is connected. Synthetic shape-equivalent cohort fixtures show only **1/4** catches; three shape-valid phones including 881-style pass. This helper does not establish bot identity or prevention; gates remain forgeable.

Staff-only intake depends on independently certified canonical GHL tag binding, exact published staff-only graph and all bypass/active senders, additive tag/phone/DND preservation and safety-before-release guarantees. Previous tag/workflow catalog reads were 401, not evidence of safety. No audit/repair of live workflows is performed here. Do not integrate suspect storage until those proofs and separate approval exist.

Independent deployed fallback inventory (Vercel/external proxies) remains a **release prerequisite**, not an excuse for a broad live audit in this build. `contact.php` is an independent inactive frontend sibling and is unchanged; do not route stale clients to it. Only the three actual repository frontend submitters are claimed protected. No Turnstile/key setup.

## Future controlled release (separate approval)

1. Require independent exact-head review, compatibility/neutral UX sign-off, fresh main/live hash reconciliation including every stacked overlay, and permitted fallback inventory. Current saved snapshot is provenance, not a fresh cutoff proof.
2. Build a clean exact-approved-SHA archive, run production SEO/build/validators and local tests, and compute a complete generated delta against fresh production. Never upload source `site/` or wholesale main.
3. Approve an explicit file allowlist covering new versioned assets, changed HTML references, immutable `/book/` companion and endpoint. Back up every target outside web root with sizes/hashes and prove restoration; do not touch server-env, htaccess, other endpoints or existing legitimate queues.
4. Promote assets, then referencing HTML, then endpoint at a controlled cutoff. Account for the brief transitional interval and old running tabs. This is not an atomic filesystem swap. No `--delete` or WAF weakening.
5. Read back every exact target against release manifest, residual dry-run zero, protected hashes unchanged, GET-only browser inspection. No live POST fixture/customer send without separate authorization.
6. Rollback is one coordinated endpoint + corresponding HTML/runtime-reference set from the approved backup. Retain new/old immutable files until cached HTML expires; preserve legitimate CRM records, notes and queued Meta events. Do not revert status/value or remove tags/workflows as rollback. If backup or manifest proof is absent, stop before release.

## Reproduce local tests

Extracted PHP runtime is `/home/d1360/joao-form-spam-runtime/root/usr/bin/php8.3`; it uses `-n`, no production ini/env, fake IDs/map and CLI-only callable hooks. Harness children run in `unshare -Urn`, no outward interface, `allow_url_fopen=0`, and mail/process execution disabled. Browser contexts block service workers and intercept **all** requests, serve only local artifact files, stub all tracking and external assets, and pass form POSTs to that PHP harness; no fixture reaches a public host.

```sh
export JOAO_TEST_PHP=/home/d1360/joao-form-spam-runtime/root/usr/bin/php8.3
export PHP_BINARY="$JOAO_TEST_PHP"
export JOAO_PLAYWRIGHT=/home/d1360/joao-a2p-audit-evidence/tools/node_modules/playwright
python3 scripts/apply_seo_foundation.py --mode production   # isolated archive only
python3 scripts/build_vercel_site.py --production
python3 scripts/validate_vercel_build.py --production
node --test tests/*.test.js
python3 -m unittest discover -s tests -p 'test_*.py'
"$JOAO_TEST_PHP" -n -l deploy/bluehost/api/lead.php
git diff --check
```

No live deployment/sender/customer receipt is verified by these local results. Independent review and release remain held.
