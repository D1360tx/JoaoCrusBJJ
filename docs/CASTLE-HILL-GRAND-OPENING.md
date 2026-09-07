# Castle Hill grand-opening draft

Working decision: one Meta Leads campaign, one broad local ad set, distinct Youth and Adult creative concepts to `/castle-hill-grand-opening/`. See CURRENT-DECISIONS.md and assets/ads-podcast/03-austin-castle-hill-launch.md.

September 14 remains provisional and unconfirmed. On 2026-09-07 Diego explicitly authorized deploying the reviewed PR #111 funnel despite Joao not yet confirming the date. Retain the reviewed date copy and noindex/nofollow policy, hold all traffic, and adjust the date after confirmation if needed. Deployment approval does not confirm the date. No Meta changes, GTM publication, traffic activation, or real lead submissions are authorized. CURRENT-DECISIONS.md is authoritative.

Source: `site/campaign/castle-hill-grand-opening.html`. Manifest: `site/campaign/seo-pages.json` (noindex,nofollow). Youth and Adult landing pages remain comparison artifacts. Existing production pages are unchanged.

All five CTAs use the existing `austin-program-fit` source and the shared dedicated Austin quiz. No new backend allowlist entry is needed. The first decision is child versus adult; contact comes last. Youth is limited to ages 8–12. Adult group, private, hybrid, and help paths remain available. Quiz preview is explicitly disconnected, including valid local completion; it cannot send a request or imply that it did.

Run from repository root:

```sh
node --test tests/*.test.js
python3 scripts/apply_seo_foundation.py --mode preview
python3 scripts/validate_seo.py
python3 scripts/build_vercel_site.py
python3 scripts/validate_vercel_build.py
# Serve dist at http://127.0.0.1:8766, then with Playwright on NODE_PATH:
node scripts/qa_austin_campaign.cjs
node scripts/qa_castle_hill_grand_opening.cjs
```

Browser scripts block external requests and all non-GET requests. Generated screenshots and JSON stay under untracked `qa/`, not in the commit. Live endpoint acceptance, downstream analytics receipt and production publication are separate release gates.
