# PR #118: deployed integration reconciliation

## Provenance and scope

The release preflight for GSC head `8c4b959ee7b9ca881e0ac2bc5b83f8da13a9ac37` correctly stopped before merge: its build would overwrite newer live integration behavior. The read-only snapshot and original evidence are at `/home/d1360/releases/joao-pr118-preflight/`.

Traced the live Austin assets to commit `8480f5c497f75c4e95569e4b92c992a3d42b5f3f`, currently in open PR #117's branch. Both live Austin JS hashes match that commit. Reviewed and applied only its integration hunks, not #117's ads, media, or unrelated history. No live file was executed or blindly restored into source.

The build owns the pre-GTM sanitizer for every emitted route and versions Austin JS from content hashes. The canonical source is `site/campaign/austin-program-fit-quiz.html`, not generated clean-route HTML. The unchanged PHP gateway already requires contact, opportunity, and submission-note acceptance and returns the stable `lead_<request_id>` Meta deduplication ID.

## Reconciled contracts

- Retain `cta_placement` through pre-GTM sanitization. Keep CTA position separate from paid `placement`.
- Preserve numeric campaign/ad IDs and click IDs using the deployed bounded identifier allowlist, rather than applying the phone-number heuristic to IDs. Reject whitespace, control characters, email-like identifiers, and overlong values.
- Forward the extended Austin campaign context from the shared campaign-key list, with the same fallback when the helper is absent.
- Restore the connected Austin quiz source/copy, consent-gated GA4 `generate_lead`, separate Meta Lead routing, server event-ID deduplication, and consent-aware Meta context in the gateway payload. Do not reintroduce the legacy GTM-triggering `lead_submit_success` event.
- Require strict true contact/opportunity/note acceptance and exact request/event-ID echoes before showing a result or routing a conversion.
- Preserve Castle Hill's no-draft-banner production state, noindex and sitemap exclusion. This does not confirm September 14 or authorize traffic.
- One reviewed hardening addition beyond the live baseline: recheck advertising consent inside Austin's delayed Pixel callback so withdrawal during Pixel loading prevents the pending send.

All twelve files owned by the original GSC commit remain byte-identical to that head, including search-intent content, metadata, teen inquiry copy, and calendar changes.

## Verification

Evidence: `/home/d1360/releases/joao-pr118-reconciled/`.

- Preview build, all **143 Node tests**, and **5,185 validator checks / 40 routes** pass.
- Isolated production SEO generation/build and **5,347 validator checks / 40 routes** pass; full Node suite is rerun against generated production output.
- All **45 Python tests** pass with the repository's pinned analytics bridge requirements in an isolated venv. The first system-Python attempt lacked `analytics_mcp`; the pinned environment resolved it.
- All four emitted PHP endpoints lint clean using an isolated Ubuntu PHP CLI, without system installation. Six local endpoint probes reject method, foreign origin, non-JSON, malformed JSON, honeypot, and oversized body as expected. The server inherits no credentials and disables outbound provider/mail functions.
- New executable regression tests cover all emitted sanitizer routes, extended forwarding with/without the attribution helper, independent consent combinations, and withdrawal while Pixel loading is pending. Existing Meta delay/deduplication and GA4 fallback tests now include Austin.
- Browser: **45 page/viewport combinations**, nine routes at 390/768/1280/1440/1920px. No document overflow, broken images, duplicate IDs, or page errors. All six GSC owner pages retain clean heading geometry. One existing single-word line in the unchanged Austin Adults comparison schedule heading remains non-blocking.
- **12 invalid + mocked-accepted GSC form flows** at 390/1440px pass, including dialog/Escape/focus, contact fallback, teen anchor and repeated availability. **25 distinct internal link/fragment targets** resolve.
- **20 Castle Hill modal quiz flows** at 390/1440px cover consent granted/denied and accepted/rejected/wrong-event/missing-note/wrong-request responses. Each invalid pre-submit sends zero requests. Only accepted, consent-granted responses route one GA4 and one Meta mock event; no real leads or tracking requests are transmitted.
- `git diff --check` and changed-line secret/executable-payload scan pass.

## Live snapshot comparison and remaining gates

The full compared file set is **139 live / 139 artifact**, with no new or remote-only paths. **94 critical live runtime/config/assets** remain byte-identical, including all API files, `.htaccess`, shared attribution/consent/Meta/lifecycle dependencies, and Austin forwarding. Castle Hill HTML is byte-identical to live. Ten output files differ: the intended GSC HTML/llms/calendar outputs plus Austin's consent-withdrawal hardening and its versioned quiz script reference. No integration-removing drift remains in this snapshot comparison.

The source-only SEO validator still reports the same seven existing comparison/metadata failures documented on the original PR; generated preview and production validators pass. No claim of downstream CRM, GA4, or Meta delivery is made from mocks.

**New exact-SHA review and explicit approval are required before merge/deploy.** Re-snapshot production at that release preflight because live state can advance again. Preserve the unconfirmed opening-date/traffic holds. This reconciliation does not merge or deploy, change GSC/listings/CRM/GA4/GTM/Meta/DNS, or submit real leads. GitHub's existing Vercel preview integration may run after the authorized branch push.
