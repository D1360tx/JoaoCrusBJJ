# Books, Courses & Resources: review-only comparison

## Approved scope

- New page: `site/campaign/resources-draft.html`, alongside the unchanged `joao-projects-draft.html`.
- Branch: `feat/joao-projects-hub-draft-20260921`; preservation baseline: `b445fd03bd6b4897195a5f325a56115c41fa16e9`.
- Naming decision for this comparison: Resources; header/footer Books & Resources; eyebrow Beyond the Academy; H1 Books, Courses & Resources by Joao Crus; supporting idea Learning Beyond the Mat.
- September 24, 2026 approval permits a branch push and commit-pinned GitHack review only. No PR, merge, live deployment, production navigation, manifest, sitemap or integration edits.
- `noindex,nofollow`, Draft Preview ribbon, no forms, scripts, tracking or embeds. Public review URLs are not private access control.
- The existing builder copies draft assets, but creates no route for either draft. Do not deploy this branch wholesale.

## Sources and screenshots

All five exact destinations returned HTTP 200 in Chromium on September 24, 2026 with no URL redirects. Evidence lives outside the repository at `/home/d1360/qa-artifacts/joao-resources-hub/sources.json`, `*-source.txt`, and `*-source.png`.

| Resource | Exact website | Audience/category |
| --- | --- | --- |
| Grapple with Emotions | https://grapplewithemotions.com/ | Families and coaches; books & emotional development |
| Jiu-Jitsu Classes Online | https://jiu-jitsuclasses.online/courses/ | Students and instructors; online Jiu-Jitsu instruction |
| The Children BJJ Blueprint | https://blueprint.justjiuit.com/ | Martial arts instructors; coach education |
| Boundary Guard | https://boundaryguard.joaocrusbjj.com/ | Adults; boundaries & personal growth |
| Black Belt Parenting | https://blackbeltparenting.net/ | Parents and caregivers; parenting resources |

Blueprint's rendered title is `The Children BJJ Blueprint | Teach Better. Change Lives.` Its current page offers a free community and a 12-week, 24-class teaching program. The hub links to the supplied website, not directly to Skool. No paid price claims are repeated. The previous unavailable Projects card remains untouched as historical comparison evidence, not a current availability statement.

All five thumbnails were freshly captured at 1440×1000 and resized to 1200×833 WebP (quality 85). They are honest website screenshots, not claims about the provenance of photographs embedded by those sites. The new isolated image directory avoids changing old screenshot content or old test expectations. Snapshot captions disclose the date. Shared official logo and existing licensed local fonts are reused without modification. New scoped CSS preserves the numbered portfolio structure and campaign colors.

## Verification

- Full Node suite: 163 passed, zero failed/skipped, including seven new Resources tests and the unchanged Projects tests.
- `html-validate site/campaign/resources-draft.html`: clean.
- Canonical build: 41 pages, 107 assets; validator: 5,311 checks passed.
- Exported baseline build: all 145 existing output files byte-identical; only six additive Resources assets. No Resources HTML route in the build.
- Chromium: 390, 768, 1280, 1440, 1920px. Forty local screenshots, zero horizontal overflow, clipped headings/buttons, heading orphans, image/font load failures, axe WCAG A/AA violations, console errors, failed requests or HTTP errors.
- Zero third-party requests during hub rendering. All five outbound CTAs tested by keyboard with navigation intercepted; exact destinations and null `window.opener` verified. Skip/hero/return anchors and no-JavaScript fallback passed.
- Deterministic tests assert five exact URLs, categories/naming, restored Blueprint screenshot/link, no paid prices/placeholders, safe new tabs, one H1, noindex, no integrations, discovery isolation, and SHA-256 preservation of the old draft/assets/tests/browser script without requiring Git history.
- `git diff --check`: clean.

## Reproduce

Tooling was reused outside the repository; no dependency lockfile or system-package changes:

```sh
PHP_BINARY=/home/d1360/qa-artifacts/joao-projects-hub/tooling/php-local/usr/bin/php8.3 node --test tests/*.test.js
/home/d1360/qa-artifacts/joao-projects-hub/tooling/node_modules/.bin/html-validate site/campaign/resources-draft.html
python3 scripts/build_vercel_site.py
python3 scripts/validate_vercel_build.py
python3 -m http.server 8771 --bind 127.0.0.1 --directory site
# In another terminal:
NODE_PATH=/home/d1360/qa-artifacts/joao-projects-hub/tooling/node_modules QA_URL=http://127.0.0.1:8771/campaign/resources-draft.html QA_OUTPUT=/home/d1360/qa-artifacts/joao-resources-hub/browser node scripts/qa_resources_draft.cjs
```

Local QA artifacts: `node-tests.tap`, `production-preservation.json`, `browser/browser-results.json`, and `browser/draft-{width}-{top,full,bottom}.png` / `browser/draft-{width}-project-{1..5}.png` under `/home/d1360/qa-artifacts/joao-resources-hub/`.

After pushing, use `https://rawcdn.githack.com/D1360tx/JoaoCrusBJJ/<exact-commit>/site/campaign/resources-draft.html`. Require remote branch SHA read-back plus HTTP 200 and matching local hashes for HTML, CSS, logo, all five thumbnails and both CSS-referenced fonts. Record remote evidence outside the repository to avoid changing the pinned commit after verification.

## Limitations

The broader SEO validator reports the same seven pre-existing issue categories on the exported baseline: duplicate title/description, historical unmanifested draft coverage, and four meta-kids-first-class social metadata issues. This deliberately unmanifested Resources draft adds its name to that existing coverage warning. Production discovery was not altered to silence it.

Chromium only, not Safari/Firefox or hardware-device QA. Third-party checkouts, accounts and forms were not exercised. Screenshots are static snapshots; website availability and offers can change. GitHack may show an external-content notice before the review page. No production release is authorized.
