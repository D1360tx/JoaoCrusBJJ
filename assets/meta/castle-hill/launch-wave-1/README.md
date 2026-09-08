# Castle Hill launch wave 1: static creative review pack

**Status: 12 rendered review assets. NOT upload-ready. DO NOT MERGE, UPLOAD OR ACTIVATE.**

All six requested static concepts have 1080×1080 and 1080×1920 PNG exports. Technical QA passes, but the required scene and paid-media permission gates are unresolved. These are genuine existing Joao/partner photos with deterministic typography, not AI people. Real portraits are explicitly provisional substitutes for missing adult instruction photographs, not an assertion that the approved production brief is fully satisfied.

## Review

- [Six square concepts](contact-sheets/contact-sheet-1x1.jpg)
- [Six story concepts](contact-sheets/contact-sheet-9x16.jpg)
- [Machine-readable manifest](manifest.json): exact filenames, dimensions, ad names, unchanged brief copy, full destination URLs, exact ad-specific `utm_content`, provenance, source/export SHA256, logo treatment, text bounds, safe zones and per-asset blockers.
- [Machine-readable technical QA](qa-report.json)
- Exports: `images/1x1/` and `images/9x16/`. Filename suffixes identify placement versions, not new ad hypotheses. Contact-sheet labels are review annotations and are not baked into export files.

## Provisional paused-only campaign structure

| Field | Build specification, not live state |
| --- | --- |
| Campaign | `PROSPECTING | AUSTIN | CASTLE HILL | PROGRAM FINDER | W1` |
| Objective / conversion | Leads / website / standard `Lead` event |
| Structure | One campaign, one broad local ad set, six distinct concepts with two placement assets each |
| Budget | **$35/day campaign budget, provisional, PAUSED only** |
| Geography | **10-mile Austin radius centered on Castle Hill Fitness, 1112 N Lamar Blvd, provisional** |
| Age | **24–54, provisional**; ad recipients are adults, Youth service age is 8–12 |
| Facebook Page | `977808342257807` |
| Instagram | `17841402345785819` |
| Pixel | `592714768141415` |
| Destination | `https://joaocrusbjj.com/castle-hill-grand-opening/` |
| Ad-specific attribution | `utm_source=meta`, `utm_medium=paid_social`, `utm_campaign=austin_castle_hill_launch_v1`, exact ad name as `utm_content`, `utm_term={{adset.name}}`, `utm_id={{campaign.id}}` |
| Required later state | Campaign **PAUSED**, ad set **PAUSED**, every ad **PAUSED**; explicit values, never provider defaults |

The brief's combined Youth/Adult category-discovery architecture is intentional. Meta allocation is not a controlled category experiment. Hold the shared destination constant, use the quiz branch and CRM to assess audience fit, and judge qualified leads rather than CTR alone. No performance-winner claims are made.

Diego approved a paused build only. This task **did not access or mutate Meta**, upload media, create campaign objects, change budgets, submit leads, edit GTM or change the live site. IDs above are supplied build inputs, not a claim of freshly verified account access or readiness. Later upload/build authorization must not be confused with activation approval.

September 14 remains provisional and is deliberately absent from all twelve exports. Budget, radius, age targeting, final creative approval, opening date, live destination acceptance, downstream Lead receipt/deduplication and explicit activation approval remain separate gates. No automated activation, scheduling or Meta API code is included. Retain website-only destination, no Instant Form extension, and disable automatic creative modifications in any later approved build.

## Source and permission audit

The authoritative copy source is [the campaign brief](../../../ads-podcast/03-austin-castle-hill-launch.md). Newer schedule/date governance is in [CURRENT-DECISIONS](../../../../CURRENT-DECISIONS.md).

| Concept | Current source and scene finding | Required before production |
| --- | --- | --- |
| AY01 Tap Means Stop | Existing `youth-junior-warriors-training.webp`: one child practicing with an adult whose head is outside the original. No claim that a tap is visibly occurring. | Permission-cleared photo of two Youth partners with a visible coach; current scene does not meet this requirement. |
| AY03 Confidence Is Practiced | Same existing practice photo, differentiated copy hypothesis. It shows practice rather than a guaranteed personal outcome. | Confirm subject age, guardian release and coaching context. A visible Joao coaching scene is preferable. |
| AY05 Castle Hill Youth | The exact Castle Hill partnership photo already documented in `docs/CASTLE-HILL-PHOTO-REVISIONS.md`. No claim it was captured at Castle Hill. | Participant/guardian paid-media releases and Castle Hill paid co-marketing permission. |
| AA01 Beginner Starts Here | Existing official real Joao portrait. No black-belt lineup and no sparring. | Replace portrait with a real, cleared beginner instruction still. |
| AA03 Calm Under Pressure | Existing official real Joao portrait. | Replace portrait with a real partner-drilling scene with Joao visibly coaching. |
| AA05 Group or Private | Genuine academy group plus official Joao portrait in separate frames. Group includes minors and is not the new Castle Hill cohort. | Adult group instruction and private-coaching photos; current split meets layout, not scene requirements. |

**Important provenance correction:** `castle-hill-adults-coaching-20260907.webp` is byte-identical to `campaign-images/adults-joao-coaching-hero-2026-07.webp`. Despite the prior documentation's real-photo wording, `scripts/prepare_adults_joao_ai_hero.py` proves the latter derives from `assets/source-images/adults-joao-coaching-ai-original-2026-07-31.png`. Neither is used in this pack. The documentation error is corrected without modifying any website image.

Existing website publication is not a paid-media release. No named participant release records were found in the inspected repository. All manifest entries therefore fail closed with `paid_media_release_not_documented`. Do not infer clearance from an image being public, from a partnership article, or from this PR. Request the specific missing scenes and written paid-media usage scope from Joao/Diego before the next production iteration. No unrelated stock, scraped social photos, AI retouching, generated people or synthetic testimonials were substituted.

## Design and mobile QA

- Exact graphic palette: Campaign Black `#101010`, Warm White `#FFFDF8`, Champion Yellow `#F5C400`, Academy Blue `#194FC3`. Source photo and official logo colors remain unaltered.
- Anton display typography; Space Grotesk body/labels. Vendored from the Google Fonts `ofl/anton` and `ofl/spacegrotesk` directories with their OFL licences in `tools/fonts/`.
- Hook first, real image second, one yellow finder CTA with black type. Official logo is never redrawn, masked or recolored.
- Safe rectangle: square `x=56..1024, y=56..1024`; story `x=64..940, y=270..1536`. These deliberately reserve top/bottom UI and a wider right-side rail. Verify actual Meta placement previews again before any later upload is accepted; local safe-zone tests are not platform-preview proof.
- Photos use full-frame contain with no added crop or retouching, preserving original framing. This produces intentional black letterboxing, particularly around portrait sources. Source framing itself can already omit a coach's face.
- Both contact sheets were inspected visually. All twelve exports have legible hook hierarchy, consistent logo/palette, visible faces where present in source, uncut type and no overlay across faces. The adult portraits and AY01 scene shortfall remain unresolved visual acceptance issues. This is not a blanket visual approval.
- No em dashes or added prices, opening-date assertions, guarantees, fitness promises or invented claims. On-image text is minimal brief-derived messaging plus brand/location, audience lockup and `FIND YOUR FIT`.

## Copy length QA

Primary text, headline and description are retained verbatim from the approved static brief. All six headlines meet the 40-character recommendation and every primary text is below 2,200 characters. All six primary texts exceed the 125-character initial-visibility recommendation; front-loaded hooks remain intact. Descriptions over the 30-character recommendation: AY01 31, AA01 37, AA03 33. These are placement truncation warnings, not hard-limit failures. Exact counts are in the manifest and QA report. Do not silently rewrite approved copy; request approval for shorter variants if previews truncate important information.

## Reproduce and verify

Requires Python with Pillow 12.3.0. Font files are vendored so no network or Meta connection is needed.

```sh
python assets/meta/castle-hill/launch-wave-1/tools/render.py
python assets/meta/castle-hill/launch-wave-1/tools/verify.py
python scripts/build_vercel_site.py
python scripts/validate_vercel_build.py
node --test tests/*.test.js
# In an isolated test environment with requirements/ga4-bridge.lock.txt installed:
python -m unittest discover -s tests -p 'test_*.py'
```

### Executed regression results

- Creative verifier: **12/12 files**, six concepts, six files per size. Every source/output SHA256, filename, pixel size, RGB PNG format, exact UTM, text/photo/logo safe rectangle, official logo pixel composition and black-on-yellow CTA passed.
- Site build: **40 canonical pages, 92 assets**. This pack remains outside the public site build.
- Build validator: **5,161 checks passed across 40 routes**.
- Node: **129/129 passed**, after building `dist` as required by the tests.
- Python: **45/45 passed**, after installing the repository's locked analytics dependencies into an isolated `/tmp/castle-launch-test-venv`.
- Preview SEO validator: **seven existing issues across 2,502 checks**, reproduced identically on a clean archive of base `78ae3731e11b7545130f33729c4df4b76acb31a8`. Existing issues: duplicate title/description, three missing comparison-route entries, and four kids-page OG/Twitter metadata issues. No site source was changed by this pack.

**Acceptance verdict:** technical export and regression QA complete; production creative acceptance blocked by source-scene gaps and missing documented paid-media releases. Open as a draft PR for review. Do not merge until those blockers are resolved and replacement exports pass the same checks plus visual review.
