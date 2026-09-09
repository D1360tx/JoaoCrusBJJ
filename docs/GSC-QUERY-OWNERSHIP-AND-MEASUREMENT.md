# GSC query ownership and measurement

Approved implementation: 2026-09-09, Diego. Business facts and constraints: `CURRENT-DECISIONS.md`, including the September 6 Austin group confirmation and September 9 clarifications.

## Evidence boundary

The delegated opportunity window is **2026-08-10 through 2026-09-06**. Its exact query/page export was not supplied with this worktree, so this implementation does not invent clicks, impressions, CTR, positions, or ranking URLs for that window. Preserve the original read-only export with the review record before measuring uplift.

The supporting `SEO-DEEP-DIVE-OUTRANK-PLAN-2026-09-08.md` was absent from this branch. It was read from the existing review worktree without modifying it. That historical report uses **August 9–September 5**, not the delegated window, and its Austin authorization uncertainty is superseded by current decisions. Do not silently substitute its metrics for August 10–September 6. This PR implements the explicitly approved ownership and opportunity scope, not every action in the broader report.

## One canonical owner per cluster

| Cluster and variants | Canonical owner | Decision and distinct job |
|---|---|---|
| Dripping Springs BJJ, Brazilian jiu jitsu Dripping Springs, broad local/near-me discovery | `/` | OPTIMIZE: local academy, address, age/program routing, personal callback. No separate Dripping Springs or near-me doorway. |
| Austin BJJ, jiu jitsu Austin, Brazilian jiu jitsu Austin, Castle Hill/North Lamar | `/austin-brazilian-jiu-jitsu/` | OPTIMIZE: real location, available youth/adult groups, appointments, links to program detail. Spelling variants stay here. |
| Adult BJJ, beginner adult jiu jitsu | `/adults-program/` | OPTIMIZE: beginner starting point and technical practice; Dripping Springs schedule and contextual Austin/private routes. Conservative pressure language only. |
| Martial arts for kids, kids BJJ/program overview | `/kids-program/` | OPTIMIZE: help parents compare age programs and locations, not duplicate age-specific content. |
| Preschool BJJ, toddler martial arts, BJJ ages 3–7 | `/little-champions/` | OPTIMIZE: Dripping Springs, short activities, class structure, parent resources. Age 3 availability, never exclusivity. |
| Teen BJJ, teen martial arts, ages 13–17 | `/teens/` | OPTIMIZE: program available; discussion/interest path for details, schedule, and capacity with Joao. No invented times or placement promise. |
| Carlson Gracie / De La Riva lineage | `/about/` | SUPPORT: preserve existing accurate lineage and source footage. Contextual link from Adults. Not generic Gracie-branded classes or affiliation with an unrelated academy. |
| Self-defense interest | `/adults-program/` | SUPPORT only where existing boundary/pressure language helps explain BJJ. Dedicated curriculum unconfirmed. No dedicated SEO page, course offer, or safety guarantee. |
| No-gi / nogi / no gi | None | **IGNORE**: not offered now. Do not target, add metadata, or publish as an offer. |

Youth remains the age-8–12 detail page; Private owns one-on-one service intent. Existing Parent Guide answers support commercial owners. No new canonical pages, redirects, paid variants, or sitemap expansion are part of this change.

## Fact synchronization

- Austin Youth ages 8–12: Tue/Thu 5:00–5:45 p.m.
- Austin adult group: Tue/Thu 6:00–7:00 p.m.; adult private lessons by appointment.
- Castle Hill Fitness: 1112 N Lamar Blvd, Austin TX 78703.
- Shared calendar and location schema already agree with approved facts on this branch. Preserve them rather than create another schedule source or treat class times as business opening hours.
- Repair stale `llms.txt` youth end time and absent-adult-group statement. Supplemental machine-readable copy must not outrank visible HTML.
- No new opening date, prices, health claims, teen schedule, or age-3 exclusivity.

## Conversion definitions and ownership

1. **Submission / accepted inquiry:** a form request accepted by the real backend. Not an appointment, qualified lead, or enrollment.
2. **Qualified lead:** someone who submits a form and then has a qualified conversation with Joao. Joao confirms suitability, needs, and a realistic next step in that conversation; do not automatically qualify from quiz answers or clicks.
3. **Trial booked:** Joao has actually arranged the visit/class. The form itself does not book instantly.
4. **Trial attended:** the preferred next milestone, confirmed by Joao from actual attendance.
5. **Enrolled:** verified membership outcome, separate from a visit or lead event.

**Joao owns follow-up**, the personal call to discuss fit and arrange a free studio visit/trial class, qualification, and attendance confirmation. Diego owns the SEO review and coordinates measurement. Preserve accepted-inquiry attribution and distinguish first/latest touch; do not infer that an organic landing caused every later outcome. Keep PII in the authorized CRM, never GSC exports, public reports, or analytics event parameters. Exclude internal/test records and deduplicate people versus submissions. Existing CRM lifecycle work is not activated by this PR.

## Release-anchored checks

Day 0 is the separately verified production release, not PR creation. Record release timestamp/SHA and exact deployed URLs. Do not claim these follow-ups were performed by this implementation.

| Milestone | Read-only checks | Decision gate |
|---|---|---|
| Day 7 | Exact live metadata/canonical/index directives; rendered content, schema, links and CTA fallback; GSC historical inspection for each owner, especially Kids and Adults; current Google-selected canonical and last crawl; annotate first impressions after crawl. | Separate technically indexable, submitted, crawled, and indexed. Investigate discrepancies; do not promise indexing or repeatedly submit without diagnosis. |
| Day 30 | Final complete 28-day GSC window ending at least three days before capture versus a comparable pre-release window; query + page rows for every cluster; clicks, impressions, CTR and impression-weighted position; organic accepted inquiries, qualified conversations and trial attendance. | Evaluate query mix and sample size before changing titles. Report zero, unknown and unobserved distinctly. No ranking uplift claim from aggregate averages alone. |
| Day 60 | Repeat same cluster/page pairs; inspect owner versus competing URLs and legacy variants; reconcile qualified leads, booked/attended trials and enrollments with Joao. | If another URL gains the same intent, improve contextual routing before proposing consolidation. If Kids/Adults remain unindexed, investigate exact inspection evidence rather than create duplicates. |
| Day 90 | Repeat comparable 28-day comparison plus release-period trend; report outcome funnel by program/location and available organic attribution. | Continue pages earning qualified conversations and attendance. If clicks rise without quality, investigate fit and follow-up, not page volume. Expansion requires a real distinct offer and evidence. |

Store each capture with property `sc-domain:joaocrusbjj.com`, exact start/end/capture dates, search type, filters, query, ranking URL, clicks, impressions, CTR, position, source, row count/pagination completeness, and owner. Query privacy filtering and multiple page appearances mean row sums need not equal property totals. Normalize spelling variants only for grouping, retaining original rows. Keep property totals separate and compare equal windows.

## Implementation boundary

Code/content/docs, local preview and isolated production artifacts, commit/push/PR only. No deployment, merge, GSC mutation, listing changes, analytics activation, or real form submissions. Later external operations require exact-target verification and their own release record.

## Independent recovery QA (2026-09-09)

The interrupted worker's patch was reviewed against base `fd9bd02`. Recovery corrected leftover teen-launch claims in the page and the shared calendar empty state, removed an unsupported external-authorization assertion from the decision log, and fixed responsive heading orphans/clipping with page-scoped typography. The teen sticky CTA now stays hidden over its hero as well as its schedule and join section. Original H1 wording, all existing form markup, schedules, handler code, and canonical ownership were preserved.

- Targeted content/form/backend contract suite: **42/42 passed** after building the preview artifact. An initial source-only run hit the expected missing `dist` prerequisite; the built-artifact rerun passed.
- Exact `vercel.json` build command in a fresh archive plus reviewed patch: **139/139 Node tests**, then **5,185 validator checks across 40 routes** passed.
- Isolated production sequence: `apply_seo_foundation.py --mode production`, `build_vercel_site.py --production`, `validate_vercel_build.py --production`: **5,347 checks across 40 routes** passed. Generated SEO rewrites were never copied back into unrelated source files.
- GSC opportunity reporter: **5 Python tests passed**.
- Chromium production-artifact QA: **30 page/viewport combinations**, covering all six changed owner pages at **390, 768, 1280, 1440, and 1920px**. Final captures showed no document overflow, H1/H2 single-word lines or clipping, broken images, duplicate IDs, or JavaScript page errors. Local third-party tracking requests were blocked; this is not a live analytics test.
- **12 invalid + mocked-valid form flows** passed at 390/1440px. Checked booking dialog open/Escape/focus restoration, contact fallback, first-invalid-field focus, consent and form IDs, accepted-response redirects, and the teen canonical join anchor. Both selected teen availability values survived in the handler's comma-separated field. No real lead was sent.
- **21 distinct internal main-content targets** resolved, including fragment IDs. The six owner titles/descriptions are unique across the manifest. Source comparison preserved all existing form markup and H1 wording. Secret-pattern scan and `git diff --check` passed.
- Evidence retained locally in `/tmp/gsc-recovery-qa/`: `build-results.json`, `browser-results.json`, `interaction-results.json`, `link-results.json`, `source-proof.json`, logs, and width-labeled screenshots. These are local QA artifacts, not deployed assets.

**Known baseline limitation:** `scripts/validate_seo.py` reports the same seven issues on untouched `fd9bd02` and the patched source: duplicate metadata on historical pressure comparison entries, three unlisted comparison HTML files, and four stale metadata assertions for `meta-kids-first-class.html`. This PR adds no source-validator failures; the manifest-aware built preview and production validators both pass. Do not describe the legacy source validator as green.

Teen details/schedule/capacity still require Joao's discussion. The existing teen parent testimonial references the parent's self-defense goal; it is not a newly asserted dedicated curriculum or guarantee. Existing approved imagery was left unchanged. Search uplift, production behavior, provider delivery, and indexing remain unverified until separately authorized release and follow-up.
