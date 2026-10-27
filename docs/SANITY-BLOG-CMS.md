# Sanity blog CMS: setup and operating contract

## Verified live CMS (2026-10-27)

- Studio: https://joao-crus-bjj.sanity.studio/
- Management: https://www.sanity.io/organizations/ovst9k11u/project/9ma5tkiq
- Existing project reused: **Joao Crus BJJ**, `9ma5tkiq`; existing Diego Campos organization `ovst9k11u`, signed in as `diego@icdcventures.com` through ThinkPad Chrome. No duplicate project or organization.
- Dataset: existing public `production`. Content only, never contacts, leads, personal data, secrets or private business notes. Anonymous published queries are public; anonymous raw queries for the setup draft returned **zero documents**.
- Studio application: `rc67ih5333uynyzn29r8aalb`; deployed `_.schemas.default` with the `post` document model. Native signed-in Chrome loaded the actual article editor, title, slug, description, author and the saved draft.
- Pricing verified in the native project's Plan page: existing **Growth Trial, $0**, 30 days remaining, with explicit **automatic downgrade to Free** afterward. No upgrade, payment method, seat invitation, paid add-on, custom domain or purchase performed. Implementation uses no trial-only capabilities.
- Setup draft: `drafts.agent-cms-setup-check`. Clearly labeled an internal setup check, not an academy article. `humanApproved=false`; no publication date. Nothing published.
- Uploaded existing official logo: `image-07052f10f5a3ed3722065c2c45e0a9cfefee4420-512x512-png`, 245044 bytes. Remote document size and SHA-1 match the existing repository logo. Attached to the setup draft with alt text and ownership provenance.

## Editor workflow

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

The public GROQ query explicitly requires published perspective, non-draft IDs, human approval and a publication date no later than now. The renderer independently rejects draft/release IDs, future dates, missing approval, unsafe/duplicate/reserved slugs, unknown HTML/content blocks, nested lists and images lacking alt/permission metadata. It escapes text, attributes and JSON-LD; allows only HTTPS or root-relative links; supports paragraphs, H2/H3, strong/emphasis, single-level lists, quotes and owned images. Unsupported content fails the build rather than silently dropping it.

CMS fetch/validation happens before clearing `dist`. Failure aborts; no empty fallback on API errors. No Sanity credential is required or sent to Vercel/public builds. Draft HTML is never emitted to public previews. Normal `npm run build` stays offline-compatible. `--production --blog` explicitly refuses; the existing Bluehost build does not add or promote the blog. No public sitemap, robots, navigation discovery, DNS, production hosting or GHL changes are part of this PR.

The current preview is deliberately not an indexable production launch. Before blog promotion, approve design and content; add blog discovery and sitemap entries through the manifest/release review; implement a blog-only static overlay (not a full-site rebuild over live drift); verify production canonical/schema/robots and exact deployed hashes. CMS publish-to-preview rebuild automation is also not enabled.

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
- **17** blog/draft tests pass, covering escaping, URL filtering, slug traversal/collisions, dates, future/draft/release exclusion, approval, images, Portable Text, empty state, Article JSON-LD and no publish interface.
- Full existing Node suite with installed Playwright and native PHP 8.3.6: **407 passed, 0 failed, 0 skipped**. Initial run without the repository's PHP binary/dependencies failed; rerun with the correct prerequisites passed.
- Preview build validator: **5811 checks across 44 existing routes passed**, plus the blog output. The main validator does not count blog routes; blog tests cover those separately.
- Browser QA at 390, 768, 1280, 1440 and 1920: no overflow, broken images or page errors; yellow CTA text is black; noindex verified. Images/HTML tested with external network blocked.
- Standalone source SEO validator reports **7 existing issues** (duplicate metadata, manifest coverage and meta-kids-first-class metadata). The identical 7 issues reproduce against untouched fresh `origin/main` `12c0c5ca3031d93e41a858a6e34cd48a4e955f1b`. Not introduced or repaired by this CMS work.
- No full production release job, merge or Bluehost deployment is claimed by this setup.

Authoritative references: https://www.sanity.io/docs/studio/installation.md ; https://www.sanity.io/docs/content-lake/http-auth.md ; `npx sanity init --help`, `deploy --help`.
