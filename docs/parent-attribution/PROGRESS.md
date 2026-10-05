# Parent attribution progress / review handoff

## Implemented

- Isolated `fix/quiz-parent-attribution-20261005` worktree from CALM `e82f0d1`; dirty CALM/main worktrees left untouched.
- Sole deployable source edit: `site/assets/attribution.js`. Both existing quiz adapters still send actual origin + quiz pathname as `page` → `submission_page`.
- Embedded production quiz capture now reads the actual same-origin parent Window and requires `embed=1`, one of the two exact quiz routes and one of seven existing modal landing routes. Captures only the parent pathname. No query parent hints, source inference or unrestricted referrer capture.
- Existing first/latest contract, TTL/history, campaign sanitizer, consent and spam/retry behavior retained. All-denied optional measurement retains empty first/latest touches; no new necessary-purpose landing storage has been invented.
- No backend, map, env, form schema, modal source, consent policy or customer-record writes. No retrospective correction of request `79775b3e-f36f-4300-865c-1e21fce429a1`.

## Mapping finding / release gate

PHP already supports `attribution.first/latest.landing_page` as `first_landing_page` / `latest_landing_page` and includes both in retry-safe chronological notes. The tracked example env does not enumerate the complete first/latest map; this is not proof that the protected runtime map lacks it. Project acceptance documentation records a deployed strict first/latest map. No new GHL field is required by this implementation, and none was chosen/created. Exact existing runtime mapping must be confirmed by the independent read-only verification worker before claiming CRM field persistence/release readiness. If either landing map field is actually absent, STOP for separate user review; do not create fields or edit env automatically.

## Executed local validation

- Builder: 44 routes / 105 assets; preview validator: 5,813 checks passed.
- Targeted attribution, both adapter, endpoint and new browser suites: 71/71 passed, zero skips.
- Full network-denied Node suite using native PHP 8.3 and Chromium: 344/344 passed, zero skips.
- New tests cover four real general/Austin adult/youth modal pages, both direct quizzes, denied/granted optional measurement, real cross-origin parent, spoofed parent parameters, existing query/PII sanitizer, unchanged request UUID/payload across a failed request/manual retry, and first/non-direct history preservation. All browser resources are fulfilled locally; lead responses are stubbed. Actual consent policy and generated sanitizer run in browser tests.
- Initial test-fixture failures were corrected: the actual consent bootstrap must read a valid saved choice, Austin youth is a child flow, and Austin CTA placement must be supplied when testing placement retention. No production code was broadened to accommodate fixtures.

## Minimal release scope, NOT approved

`/assets/attribution.js` plus only the two quiz HTML cache-version references (`/program-finder/quiz/index.html`, `/austin-program-finder/quiz/index.html`) is the intended surgical overlay, reconstructed from fresh protected production bytes. A full rebuild updates attribution hash references on all 44 HTML routes; do not deploy that broad rebuild without separate review. Parent/modal landing HTML, both quiz behavior scripts, PHP and secure env must remain byte-identical to the current protected release. Keep anti-spam gates, neutral cached-client contract, PR133 and CALM PHP hunks intact.

Final committed SHA must pass the exact-SHA `scripts/test_release.py` job. Evidence is stored outside the repository under `/home/d1360/joao-parent-attribution-evidence/`; PR body will bind the final result/head. PR only; no merge or Bluehost deployment. Ready for exact-change review, not release until independent map verification and explicit user approval.
