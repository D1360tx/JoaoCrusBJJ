# Already-live source reconciliation, 2026-10-06

This PR reconciles already-reviewed, surgically deployed application changes onto fresh main. It is not permission to merge, deploy, change hosting configuration, activate ads, or send test leads. Existing stacked PRs remain open for provenance; do not merge them again after this reconciliation is accepted.

## Source authority

- Base main: `d7b0132bb605edae81a021835d707e393c88660f`.
- Spam first-tranche production source: `c849a48f2209090139bdc1ebc1ce74411e08cf7d`; PR134 documentation head is later `f77fc873f6c7319c7ee9344b847874bae4245718`.
- PR133 readable-name / repeat-submission behavior is already preserved by `f9cab848f87f43c20f39ef0cc236bef7465c5947`, not original-PR ancestry. No repeated cherry-pick.
- CALM application source: `e82f0d1f0e82d4441642bea573914a401ccc7754`.
- Parent attribution source: `82e6d8722d778fe008974a2bd1dcbd81328a247a`.
- Application, build and test files are exact copies from that stack head. Historical deployment evidence remains outside this PR; unsafe hosting-specific values and stale preview-only claims are not imported.

CALM adult and youth pages are already deployed and remain noindex. Youth remains test-only; the existing kids landing page remains the ad control. Austin adult group routing is distinct from private/hybrid routes. Same-origin embedded quiz attribution preserves the verified parent pathname plus consent-permitted sanitized campaign fields. Submission page remains the quiz URL; denied analytics attribution is empty.

## Host-owned configuration, preserve rather than overwrite

The live host has a `.user.ini` logging override. It enables PHP error logging and routes logs outside the document root. The private destination, external environment pointer, credentials, provider configuration and retry/outbox state are host-owned. Do not track their values, copy them into application artifacts, or regenerate them blindly from this PR.

A future separately approved release must inventory and preserve the existing `.user.ini`, `.htaccess`, private environment and their permissions, including PHP web-SAPI logging inheritance. Tracked example configuration is not a replacement for live configuration. No hosting configuration file is added or overwritten here.

## Acceptance and limitations

Required exact-SHA native release job:

`python3 scripts/test_release.py --sha HEAD --evidence <outside-repository-directory> --php <verified-native-PHP-CLI> --python <pinned-bridge-venv-python>`

Install declared Playwright/dependencies before testing, not inside the network-denied job. The job exports the exact SHA, runs preview and production artifact checks and all Node tests, Python tests, emitted PHP lint and JS syntax with no network routes. Static Vercel build success does not substitute for this job or constitute Bluehost deployment.

Mocked browser submissions prove local payload/control flow only, not live CRM persistence, SMS/email, browser/server Meta receipt or deduplication. Four authentic-phone journeys and Meta Test Events evidence remain unrun. Domain TXT verification requires the owner's exact Meta-issued value. Honeypot and timing gates are deployed; this is not Turnstile and does not certify every alternate legacy endpoint or a repaired host WAF rule.
