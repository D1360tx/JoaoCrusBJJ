# Vercel Deployment

## Canonical project

- Vercel project: `joao-crus-bjj`
- Workspace: `d1360txs-projects`
- Git repository: `D1360tx/JoaoCrusBJJ`
- Production branch: `main`
- Prelaunch hostname: the project's stable `*.vercel.app` production URL

This is the single hosted review site. Pull-request branches receive Vercel previews, and merges to `main` update the stable prelaunch URL automatically.

## Build model

Source pages remain flat in `site/campaign/` for local and commit-pinned review. `scripts/build_vercel_site.py` creates `dist/` by:

1. mapping each source page to its canonical path from `site/campaign/seo-pages.json`;
2. rewriting internal `.html` links to canonical paths;
3. adding a root `<base>` element to preserve asset and JavaScript resolution at nested routes;
4. copying the shared assets unchanged;
5. excluding the superseded `about-ai-coaches.html` comparison page;
6. publishing the approved Teen page at the indexable canonical route `/teens/` without preview or AI-concept labels;
7. generating a staging `robots.txt` that blocks crawling.

Vercel runs the build and `scripts/validate_vercel_build.py` on every deployment.

## Prelaunch indexing policy

The Vercel production deployment is a live review environment, not the public search launch. It intentionally sends:

```text
X-Robots-Tag: noindex, nofollow
```

and serves:

```text
User-agent: *
Disallow: /
```

Do not remove these protections until the real-domain cutover is approved.

## Update workflow

1. Create a topic branch from `main`.
2. Open a pull request and review its Vercel preview.
3. Merge the approved pull request.
4. Verify the stable `joao-crus-bjj.vercel.app` production URL updated to the merge SHA.

RawGitHack is no longer needed for routine review after the Git integration is verified.

## Real-domain cutover gate

Track the complete launch gate in `docs/GO-LIVE-CHECKLIST.md`. The proposed CRM, form, email, SMS, and newsletter architecture is documented in `docs/LEAD-INFRASTRUCTURE-RECOMMENDATION.md`.

Before attaching `joaocrusbjj.com`:

- confirm registrar and DNS ownership;
- connect the real form/booking destination and test submissions;
- finalize Privacy and Terms content;
- install and validate GTM/GA4 and consent behavior;
- remove staging noindex headers and restore the production `robots.txt`;
- verify all canonical routes, sitemap URLs, structured data, redirects, TLS, apex and `www` behavior;
- keep the current site live until DNS, TLS, forms, tracking and critical browser paths pass on Vercel.
