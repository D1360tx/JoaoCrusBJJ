# Joao projects hub: local-only draft

## Review boundary

- Page: `site/campaign/joao-projects-draft.html`
- Branch: `feat/joao-projects-hub-draft-20260921`
- Base: `490b1ccf28bf604f94418614f7e8eac257664fa0` (the requested `origin/main` snapshot).
- This is a separate comparison artifact, not a promoted route. No production source, navigation, sitemap, route manifest, shared CSS, or shared JavaScript was edited.
- No push, PR, deployment, tracking, forms, provider writes, or lead submissions.
- The draft declares `noindex,nofollow` and visibly says Draft Preview. Robots directives are not access control. Keep the files local until publication is explicitly approved.
- The existing build copies all assets, including these new isolated draft assets, but does not create a route for the draft page. Do not deploy this branch as a way to share the draft.

## Framework and brand

Reference: https://webdesigncreationsstudio.com/portfolio, read and rendered September 23, 2026.

Adapted framework: short introduction, numbered image-and-copy portfolio rows, category, project name, concise description, topic tags, external CTA, then a concise closing section. The reference's studio sales pitch was not copied. The draft is a Joao project collection, not a claim of design authorship or performance.

Reviewed `CURRENT-DECISIONS.md`, `docs/CAMPAIGN-BRAND-GUIDE.md`, `site/campaign-brand-guide.html`, `site/assets/campaign-site.css`, and the existing About header/footer. This isolated page uses the approved warm-white/cream shell, black borders and hard shadows, Academy Blue `#194FC3`, Champion Yellow `#F5C400`, Anton and Space Grotesk. It reuses the official logo, not a substitute monogram. No campaign runtime is loaded, so the local draft makes no tracking or form requests.

## Source evidence and asset provenance

All source URLs below were checked in headless Chromium on September 23, 2026. Working-site screenshots were captured at 1440 x 1000 and resized to 1200 x 833 WebP at quality 85. They are honest website previews, not claims that every photograph or graphic on the source sites is original photography. No images are hotlinked. Screenshot captions disclose the date; embedded screenshot buttons are not interactive.

| Order | Exact supplied URL | Observed response | Supported description / treatment | Local screenshot asset |
| --- | --- | --- | --- | --- |
| 01 | https://grapplewithemotions.com/ | 200 | Books by Joao; emotional regulation, boundaries, personal growth | `grapple.webp` |
| 02 | https://jiu-jitsuclasses.online/courses/ | 200 | Rendered catalog includes foundational curricula, technique studies and teaching-children resources | `courses.webp` |
| 03 | https://blueprint.justjiuit.com/ | 404 | Body: `Site not found`. No live description, offerings or audience inferred. Intentionally unavailable, disabled button, no anchor or screenshot thumbnail | CSS-only unavailable artwork |
| 04 | https://boundaryguard.joaocrusbjj.com/ | 200 | Course by Joao using BJJ principles to discuss awareness, pressure and personal boundaries | `boundary.webp` |
| 05 | https://blackbeltparenting.net/ | 200 | Parenting conversations with Joao about communication, regulation and relationships | `parenting.webp` |

Assets live in `site/assets/joao-projects-draft/`. The plain text extractor did not see the dynamically rendered courses; the Chromium DOM did. No prices, numerical outcome claims, testimonials or delivery guarantees were imported.

Fonts are locally served open-source fonts with their OFL license texts:

- Anton: Google Fonts CSS endpoint `https://fonts.googleapis.com/css2?family=Anton&display=swap`, resolved TTF for Latin text. License: `https://raw.githubusercontent.com/google/fonts/main/ofl/anton/OFL.txt`.
- Space Grotesk variable: `https://raw.githubusercontent.com/google/fonts/main/ofl/spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf`. License: `https://raw.githubusercontent.com/google/fonts/main/ofl/spacegrotesk/OFL.txt`.

## Run locally

From the repository root:

```sh
python3 -m http.server 8769 --bind 127.0.0.1 --directory site
```

Open `http://127.0.0.1:8769/campaign/joao-projects-draft.html`.

Deterministic source tests require only Node:

```sh
node --test tests/joao-projects-draft.test.js
```

Browser QA dependencies were installed outside the repo under `/home/d1360/qa-artifacts/joao-projects-hub/tooling`. Reproduce with:

```sh
NODE_PATH=/home/d1360/qa-artifacts/joao-projects-hub/tooling/node_modules \
QA_OUTPUT=/home/d1360/qa-artifacts/joao-projects-hub/browser \
node scripts/qa_joao_projects_draft.cjs
```

The browser script supports `QA_URL` (localhost only) and `QA_OUTPUT`. It uses Playwright Chromium and `@axe-core/playwright`. External navigation is intercepted during CTA tests; four live destinations were separately checked during source research. Checkout, course access and third-party forms were not exercised.

## Verified results

- New source regression tests: **6 passed**.
- Full repository Node suite: **156 passed, 0 failed, 0 skipped**. Unmodified baseline: **150 passed**.
- PHP was absent from PATH and sudo unavailable. The official Ubuntu `php8.3-cli` package was downloaded and extracted only under the QA tooling directory. No system install was performed. Full suite ran with `PHP_BINARY=/home/d1360/qa-artifacts/joao-projects-hub/tooling/php-local/usr/bin/php8.3` and its offline PHP contract restrictions intact.
- `html-validate site/campaign/joao-projects-draft.html`: exit 0, no findings.
- `python3 scripts/build_vercel_site.py`: 41 canonical pages, 101 assets. The new draft page is not a built route.
- `python3 scripts/validate_vercel_build.py`: **5,311 checks passed across 41 routes**.
- Baseline build: 41 canonical pages, 92 assets. All **136 existing built files** are byte-identical between baseline and draft builds. Nine additive assets only.
- Chromium QA: **390, 768, 1280, 1440, 1920px**, 40 saved screenshots (top, full page, each of five projects, bottom at each width).
- All widths: no horizontal overflow or clipped headings/CTAs; no heading orphans (the intentional one-word name Blueprint is exempt); all images and local fonts loaded; black-on-yellow buttons; zero axe WCAG A/AA violations; no console, failed-request or HTTP errors.
- Skip link, hero anchor, return anchor, all four keyboard new-tab CTAs (`window.opener === null`), disabled Blueprint, and no-JavaScript content fallback passed.
- Render-time external requests: zero. No scripts, forms or embeds in the page.
- `git diff --check`: passed.

### Known repository SEO-validator limitation

`python3 scripts/validate_seo.py` reports seven issues on the unmodified base: duplicate manifest title and description, unmanifested historical previews, and four `meta-kids-first-class.html` social metadata findings. The draft run reports the same seven issue categories, with this intentionally unmanifested draft added to the existing coverage warning. No manifest or production metadata was changed to silence this checker. Dedicated draft noindex/isolation tests and the canonical build validator pass.

## Local evidence

Artifacts are outside production and outside git:

- `/home/d1360/qa-artifacts/joao-projects-hub/sources.json`: exact URLs, HTTP statuses, rendered text and capture paths.
- `*-source.png` and `*-source.txt` in that directory: reference and five project observations.
- `browser/browser-results.json`: all five width results, heading line groups, computed colors, images and intercepted destinations.
- `browser/draft-{width}-{top,full,bottom}.png` and `browser/draft-{width}-project-{1..5}.png`: review images.
- `node-tests.tap`, `baseline-node-tests.tap`, `production-preservation.json`: test and preservation evidence.

Review-time limitations: Blueprint remains unavailable; site availability may change; screenshots are static snapshots; no Safari/Firefox/device-hardware testing or public preview was performed. Publication requires separate approval.
