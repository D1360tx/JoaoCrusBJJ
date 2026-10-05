# Parent landing attribution plan

Base: protected CALM `e82f0d1f0e82d4441642bea573914a401ccc7754`, isolated worktree and stacked PR targeting `feat/calm-landing-pages-safe-20261005`.

1. Inspect modal, both quiz adapters, attribution capture, PHP flattening and map contract.
2. Resolve embedded quiz landing context from the actual same-origin parent Window only, restricted to existing modal landing routes. Never trust query parent parameters or document.referrer as a landing URL. Store path only, without query/hash/credentials. Direct and inaccessible/cross-origin parent fall back to quiz path.
3. Keep existing first/latest touch selection, TTL, sanitization and consent rules. Do not replace submission page or historical touches. No new field/schema/env writes. Existing PHP maps `first_landing_page`/`latest_landing_page` and submission notes consume first/latest; tracked example omits these map entries, so exact protected runtime field persistence remains a separate read-only verification/release gate.
4. Run unit/adapter and offline browser tests against built routes: both modal families, direct quizzes, sanitizer, denied/granted consent, spoofed external parents, PII URL stripping and retry request identity. Block all outbound requests; stub lead acceptance.
5. Verify build/minimal generated diff, commit, push, open PR and read back exact head/body. No merge/deploy/live submission/account/env change.

Release remains pending exact-diff review and explicit user approval. Do not backfill historical records or infer a landing page from route_source.
