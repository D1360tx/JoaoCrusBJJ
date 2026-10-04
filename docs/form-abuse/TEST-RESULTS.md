# Independent recovery proof — NO DEPLOY / NO MERGE

Execution baseline: `45e7e392aeecc93b9d71a25c754026ce0b07db12`, exported with `git archive`, not the dirty/stale main worktree. Recovery reviewed the committed patch as foreign code; no implementation was repeated. One scoped defect corrected: the general quiz omitted `note_accepted === true` in its durable acceptance check. Commit `45e7e39` restores parity and adds three real-browser missing-note rejection cases across all submitters.

## Real results

| Check | Actual result |
|---|---|
| Preview configured order: build → full Node suite → artifact validator | PASS; 42 routes / 104 assets, 310/310 Node tests, zero skips, 5,661 validator checks |
| Isolated production SEO → production build → artifact validator → full Node suite | PASS; SEO applied to 43 source pages, 42 emitted routes / 104 assets, 5,829 validator checks, 310/310 Node tests, zero skips |
| Targeted abuse suites on production artifact | PASS 151/151: PHP dispatcher behavior 52, intercepted browser 53, client contract 46 |
| Python unittest discovery with existing pinned analytics bridge venv | PASS 45/45 |
| Native PHP 8.3 lint and all three changed JS syntax checks | PASS |
| Git whitespace check | PASS |
| Source SEO validator | FAIL: 7 issues / 2,253 checks; byte-identical report reproduced on untouched base `d7b0132` archive, not introduced here |
| Initial system-Python discovery | FAIL: missing `analytics_mcp` (31 tests plus one import error); reproduced on base. Existing `/home/d1360/releases/joao-pr118-reconciled/python-env/bin/python` resolves dependency and passes all 45; no fake modules or test skips |

Evidence directory: `/home/d1360/joao-form-spam-runtime/recovery-45e7e392aeecc93b9d71a25c754026ce0b07db12/`. Includes per-command logs, machine-readable `results.json`, targeted logs and both base comparison failure reports. Final PR head is separately rerun from its own exact-SHA archive; the PR body records that final tested head and evidence directory. This document does not purport to embed its own future commit SHA.

Every test/build command runs inside `unshare -Urn`, with only loopback present and no route; outbound socket connect returned errno 101 (`ENETUNREACH`). Full-suite execution inherits only PATH/HOME and isolated test-tool variables, not production credentials. Browser service workers are blocked and **every** request intercepted, with only local artifact bytes and fake tracking/provider responses. PHP children additionally disable URL fopen and mail/process transports; injected fake GHL/Meta/mail hooks exercise the actual dispatcher. No public fixture POST, GHL/Meta/Beehiiv write, customer message, workflow mutation or deployment is performed.

## Reviewed proof boundaries

- New and legacy traps; malformed/null/array timing; future/<3s versus exactly 3s; numeric-string boundaries; exactly 24h versus stale allowed tabs; strict neutral six-field envelopes; reload/manual-contact preservation; retries/double submits; paired browser/server IDs; consent denied; provider failure; missing notes and mismatched accepted IDs.
- All 11 static forms; both full adult/child quiz routes; embedded/direct start; popup opening/reopening and BFCache timer retention. All 33 generated campaign-runtime consumers are checked: 32 popup-capable pages and `/book/` excluded. `/book/` verified at 390/768/1280/1440/1920px with immutable content-hashed runtime and zero lead UI.
- PR133 overlay: local preservation patch exactly equals `d7b0132..e4965d9` PHP patch; overlay-only source SHA256 is `212e5960dbef0a2eefda8bf8933675950102c21d9cd8f97478bb542d2bd8d461`, matching saved deployment provenance. Existing opportunities retain name-only PUT and status=all lookup; no unrelated PR merged. This is not a fresh live hash proof.
- Cached fixture SHA256 is `1dd005817e226a6c97c282260614d53627edec016d0324f5cfd63bad8093183f`, matching saved deployed runtime, intentionally not main runtime. Cached code displays HTTP409 reload error and its historical error diagnostic; it never converts or writes providers. New clients preserve entered values and suppress conversion/error diagnostics for neutral/reload outcomes.
- Pure suspect AND classifier is **not wired into intake**; shape-equivalent cohort catches only 1/4. No suspect storage/tags/phone exception/staff-only provider flow and no Turnstile. Forgeable timing/trap signals are not bot identity proof.

## Held release gates

No deploy/merge approval. Require independent final-head review, owner acceptance of cached-client HTTP409 policy and neutral UX, fresh main/live overlay reconciliation, exact approved artifact allowlist/versioned HTML plus `/book/` companion, backup/restore manifest, independent fallback/consumer inventory, coordinated asset→HTML→endpoint cutoff and rollback. No live POST canary/customer send without separate approval. Staff-only second tranche additionally requires certified canonical GHL tag binding, published staff-only graph and all bypass/active senders, additive tag/phone/DND preservation and safety-before-release guarantees; prior 401 reads are not certification. `contact.php` stays an unchanged independent endpoint with no current frontend consumers; no protection claim is made for unknown external fallback paths. See `ROLLBACK-RELEASE.md`.
