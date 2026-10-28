# Sanity blog CMS: setup and operating contract

## Current publication status (reconciled 2026-10-28)

The first approved article and blog index are live on Bluehost after #141/#142. Fresh native Windows Chrome and SSH hashes match the published HTML; see the [release register](RELEASE-REGISTER.md). Sanity remains the article-content master; do not commit uploaded HTML, embedded base64 images or duplicate full article text. Future Studio publication still requires an owner-run static release; no automatic webhook or independent bot connection is enabled.

## Verified live CMS (2026-10-27)

- Studio: https://joao-crus-bjj.sanity.studio/
- Management: https://www.sanity.io/organizations/ovst9k11u/project/9ma5tkiq
- Existing project reused: **Joao Crus BJJ**, `9ma5tkiq`; existing Diego Campos organization `ovst9k11u`, signed in as `diego@icdcventures.com` through ThinkPad Chrome. No duplicate project or organization.
- Dataset: existing public `production`. Content only, never contacts, leads, personal data, secrets or private business notes. Anonymous published queries are public; anonymous raw queries for the setup draft returned **zero documents**.
- Studio application: `rc67ih5333uynyzn29r8aalb`; deployed `_.schemas.default` with the `post` document model. Native signed-in Chrome loaded the actual article editor, title, slug, description, author and the saved draft.
- Pricing verified in the native project's Plan page: existing **Growth Trial, $0**, 30 days remaining, with explicit **automatic downgrade to Free** afterward. No upgrade, payment method, seat invitation, paid add-on, custom domain or purchase performed. Implementation uses no trial-only capabilities.
- Setup draft: `drafts.agent-cms-setup-check`. Clearly labeled an internal setup check, not an academy article. `humanApproved=false`; no publication date. This setup document remains unpublished; the separate approved article is now published.
- Uploaded existing official logo: `image-07052f10f5a3ed3722065c2c45e0a9cfefee4420-512x512-png`, 245044 bytes. Remote document size and SHA-1 match the existing repository logo. Attached to the setup draft with alt text and ownership provenance.

## Editor workflow

### First-publication approval (2026-10-27)

Diego approved publishing the supplied Joao article and a bounded live Bluehost blog release. This supersedes the historical preview-only interlock documented below. `python3 scripts/build_vercel_site.py --production --blog` now emits indexable approved published articles and additive sitemap entries; the ordinary offline build is unchanged. Resources links visibly to `/blog/`. Safe international `tel:+...` links are now supported without allowing arbitrary protocols, extensions or query strings. Original article text remains unchanged and the supplied AI illustration is credited publicly.

Future Studio publication still requires an owner-run static release. No automatic Bluehost webhook or bot publishing gateway is enabled. The draft-only owner command remains draft-only. For releases, export the exact reviewed Git SHA, apply production SEO in that isolated directory, run the production blog build and tests, then deploy only the approved output allowlist after full live-root backup and protected-file parity checks. Never blindly overlay a full new build across existing live drift.

1. Open Studio, choose **Blog articles**, create a draft.
2. Fill title, lowercase hyphenated slug, SEO summary, actual author, publication date, body and sources. Images require alt text and permission provenance. Use no prospect information.
3. A human checks claims, source quality, schedules/offers, author attribution and media permission. Never imply Joao reviewed something he did not review. First-person quotes require verified source material.
4. Only that human should select **Human approved for website publication** and Publish. Studio validation blocks normal Publish while approval is false or required fields are missing. This is an editorial safeguard, not API-level RBAC.
5. Publishing in Sanity does **not** deploy Bluehost. Run the preview build and review it first. A future surgical Bluehost release needs separate approval, an exact artifact allowlist and rollback proof. There is no automatic webhook, production deployment or mass migration.

## Isolated static website integration

```sh
npm run build:blog
npm run test:blog
```

`/blog/` and `/blog/<slug>/` are generated as crawlable static HTML during the network-enabled preview build. Existing routes, shared navbar, assets and Parent Guide remain intact. Vercel PR builds use `build:blog`; all blog outputs remain `noindex,nofollow` with visible preview labeling. An empty CMS produces an honest empty state linking to the existing Parent Guide, not invented article cards.

The public GROQ query explicitly requires published perspective, non-draft IDs, human approval and a publication date no later than now. The renderer independently rejects draft/release IDs, future dates, missing approval, unsafe/duplicate/reserved slugs, unknown HTML/content blocks, nested lists and images lacking alt/permission metadata. It escapes text, attributes and JSON-LD; allows HTTPS, root-relative links and strictly validated international `tel:+...` links; supports paragraphs, H2/H3, strong/emphasis, single-level lists, quotes and owned images. Unsupported content fails the build rather than silently dropping it.

CMS fetch/validation happens before clearing `dist`. Failure aborts; no empty fallback on API errors. No Sanity credential is required or sent to Vercel/public builds. Draft HTML is never emitted to public previews. Normal `npm run build` stays offline-compatible. The ordinary production build without `--blog` does not fetch/promote CMS content; explicit `--production --blog` now emits approved published blog routes and additive sitemap entries. The first bounded release added Resources discovery and blog outputs without GHL/DNS changes. This supersedes the initial setup-only production interlock.

Vercel previews remain nonindexable; the approved Bluehost blog release is indexable and live. For future promotion, approve content and scope, review discovery/sitemap deltas, use a bounded static overlay rather than a full-site rebuild over live drift, and verify canonical/schema/robots and deployed hashes. CMS publish-to-preview rebuild automation remains unenabled.

## Owner-controlled draft API commands

```sh
python3 scripts/sanity_drafts.py draft stable-external-key /path/to/article.json
python3 scripts/sanity_drafts.py upload /path/to/owned-image.webp
```

Draft input allows `title`, `slug`, `description`, `authorName`, `body`, `sources`, `heroImage` only. Slug is `{"_type":"slug","current":"hyphenated-slug"}`; body is standard Portable Text. Use a stable idempotency key: updates replace only `drafts.agent-<key>`, never a published ID. The tool always forces `humanApproved=false` and does not accept publication dates, approval flags, arbitrary IDs/types, delete, unpublish or publish. Upload accepts PNG/JPEG/WebP up to 10 MB, returns asset ID/size/hash, and verifies exact readback. The owner must supply ownership/permission evidence when attaching an image.

A dedicated project-only native **Editor robot token** is stored outside Git/webroot in `/home/d1360/.joao-secure/sanity-blog-token.json` (0600); parent directory is owner-only. It expires **2027-01-25T21:28:59.727Z**. Readback verified the project membership and expiration. Rotate through Sanity management before expiry. The CLI's separate personal OAuth session is under `~/.config/sanity/config.json` (0600); it was used for deployment, not distributed to bots.

**Important security limit:** the underlying Editor token itself is not draft-only and can publish via native Sanity API. The command allowlist is not a security boundary against processes running as the same OS user. Do not copy the robot or personal token into Muse, Grokbot, browser code, CI, chat or another profile. Hermes can use these owner-controlled commands now. Remote/independent bot runtimes are **not connected**: they require a separately reviewed authenticated draft gateway or narrower provider permissions before credentials can be issued. No Hermes/Muse/Grokbot configurations were modified.

## Verification and known baseline issues

- Studio `tsc --noEmit`, build, schema deployment and hosted app succeeded.
- Studio npm audit initially exposed upstream transitive findings. Compatibility-scoped patched overrides for js-yaml 3, smol-toml, undici 7 and typeid-js's uuid resolved them. Final `npm audit`: **0 vulnerabilities**; rebuilt and redeployed successfully. Lockfile committed.
- Setup originally passed **17** blog/draft tests; final publication passed **19** CMS tests. Coverage includes escaping, URL filtering, slug traversal/collisions, dates, future/draft/release exclusion, approval, images, Portable Text, empty state, Article JSON-LD and no publish interface.
- Full existing Node suite with installed Playwright and native PHP 8.3.6: **407 passed, 0 failed, 0 skipped**. Initial run without the repository's PHP binary/dependencies failed; rerun with the correct prerequisites passed.
- Historical setup preview validator passed **5811 checks across 44 existing routes**, with blog tests separate. The final publication validator is blog-route-aware and passed **5994 checks across 46 generated routes**.
- Browser QA at 390, 768, 1280, 1440 and 1920: no overflow, broken images or page errors; yellow CTA text is black; noindex verified. Images/HTML tested with external network blocked.
- Standalone source SEO validator reports **7 existing issues** (duplicate metadata, manifest coverage and meta-kids-first-class metadata). The identical 7 issues reproduce against untouched fresh `origin/main` `12c0c5ca3031d93e41a858a6e34cd48a4e955f1b`. Not introduced or repaired by this CMS work.
- The initial setup alone did not claim production release. The later approved #141/#142 publication was merged and deployed; see the release register for exact source, private rollback receipt, public verification and bounded test results.

Authoritative references: https://www.sanity.io/docs/studio/installation.md ; https://www.sanity.io/docs/content-lake/http-auth.md ; `npx sanity init --help`, `deploy --help`.
