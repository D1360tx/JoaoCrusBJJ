# Shared main navbar release contract

## Scope

All 25 manifest-indexable routes render `components/main-navbar.html` at build time. The 18 noindex manifest entries remain excluded (17 emitted; `about-ai-coaches.html` is intentionally not emitted). Comparison pages outside the manifest remain untouched. `main_navbar.py` derives the set from `seo-pages.json`, rather than maintaining a second route allowlist.

One dedicated, scoped CSS/JS pair controls navigation, loaded with SHA-256 query versions. Its selectors never match the old `.menu`, `.nav`, `.program-menu-button`, `.program-global-links`, or `[data-programs-menu]` handlers. Existing campaign/lead runtime remains unchanged. Resources never loads it and never acquires a form or lead dialog. Program contextual rows remain intact; Teens' extracted contextual row gains its own named region landmark.

Exact destination anchors alone receive `aria-current="page"`; no false active state is assigned to Parent Guide or Practice Under Pressure. Global order is Programs, Schedule, Locations, About, Resources, Coaches, Plan a first class. The Programs disclosure preserves all nine current program destinations. Existing footer and contextual Resources links are unchanged.

## Deterministic gates

- Staging build + validator: 5,661 checks / 42 emitted routes.
- Production build + validator: 5,829 checks / 42 emitted routes.
- Full Node suite: 159 tests, PHP_BINARY=/home/d1360/releases/php-cli-8.3/root/usr/bin/php8.3.
- Generated PHP lint passes for lead/contact; all release PHP is linted again before promotion.
- Navbar mutation tests reject missing/duplicate navbar, changed labels/destinations, bad active state and surviving divergent navigation. The component independently asserts link order and Resources membership.
- `scripts/qa_main_navbar.py` checks 25 routes at 390/768/1280/1440/1920, mobile toggle, Programs disclosure, Enter/Escape, outside click, focus return/wrap, exact active state/link order, visibility/collisions, same-origin HTTP errors, page exceptions, and axe.
- Candidate versus exact-live-baseline browser comparison: 125 cases each; no new axe findings, no navbar axe findings, no overflow, no page exceptions, no same-origin HTTP failures. Known Teens contrast/region and Schedule calendar ARIA/contrast/region findings remain; this is not an accessibility-clean claim. Synthetic navigation QA blocks provider/lead/tracking writes and permits read-only font assets.
- Visually reviewed Home, Resources, Practice Under Pressure, About and Coaches at desktop/mobile representative widths.

## Production boundary

Baseline: `8924757a5510dffbae2d8ee4674a5c8b274ae96e`. Live shared campaign JS SHA-256: `1dd005817e226a6c97c282260614d53627edec016d0324f5cfd63bad8093183f`.

Build the exact authoritative merged SHA. For each indexable HTML target, restore only its exact existing live campaign-script URL. First prove the identically normalized parent build equals the immutable live snapshot. Then independently reconstruct the candidate from live by replacing only the reviewed header, preserving the Teens contextual content (with its named region), and adding the dedicated stylesheet/script references. Require byte equality with the generated candidate; stop on any residual unrelated change.

The full parent-to-candidate artifact delta must contain exactly 25 indexable HTML files plus `assets/main-navbar.css` and `assets/main-navbar.js`. Deploy only this 27-path manifest after full-root rollback archive/hash, origin snapshot recheck, public probe, checksum staging and reviewed allowlisted rsync dry run. No delete, no shared runtime/backend/config/consent/lead overwrite. Require residual zero, all public hashes, live runtime hash, provenance, exact merge pin, and probe/stage cleanup.

No GHL mutations, lead submissions, CAPI, GTM publication or sitemap resubmission. Resources live GA4 page_view and one Meta PageView are verified separately from the non-transmitting regression runner.
