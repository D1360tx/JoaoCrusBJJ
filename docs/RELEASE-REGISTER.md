# Release and acceptance register

Reconciled 2026-10-28. Git merges, origin deployment, public proof and provider acceptance are different evidence layers. This document records sanitized receipts, not credentials or private archives. No production release is performed by the documentation reconciliation.

## Second blog article: published and deployed 2026-11-03

- Public article: [Is My Child Ready for Martial Arts? A Simple Readiness Guide for Ages 3 to 5](https://joaocrusbjj.com/blog/is-my-child-ready-for-martial-arts-ages-3-to-5/). The [blog index](https://joaocrusbjj.com/blog/) now lists both approved articles.
- Existing matching draft reused without a duplicate: published ID `agent-readiness-guide-ages-3-5`, final revision `XHzO36wxj5qHnGMRIEf9YZ`; actual publication time `2026-11-03T16:43:09.478629Z`. Author **Joao Crus**. All 11 supplied body blocks (9 paragraphs, 2 H2 headings) and visible phone CTA match the approved text exactly. No hero image, invented source, rewrite or disclaimer was added.
- Build source: exact fresh-main archive `3991df3f2d87116a429849964597958d632d6e99` plus the verified CMS snapshot. This source SHA is distinct from the subsequent documentation commit. The persistent Bluehost checkout remains the earlier source listed below; this was a bounded composite overlay, not a full-site rebuild deployment.
- Deployment time `2026-11-03T16:46:40.621836+00:00`. Private release `blog-readiness-20261103`; full rollback retained outside webroot. Archive SHA256 `87cf6d0bbd193bb382ce639e76e04d8ccf97c6394497016a6235c3bd8ebd7cf3`; complete archive file/entry sets, hashes, modes and ownership checked against the live baseline before promotion.
- Limited manifest SHA256 `b55212a4d13252c1038ac4c7e196b2ca5a09145595be5ea5c93c84a90af6047d`. Exactly three paths promoted:

| Approved path | Origin and public binary SHA256 |
|---|---|
| `blog/index.html` | `702a931e0cbd38860b3eba69edfa194256e440a0cbbbce3371918a167a86bd79` |
| `blog/is-my-child-ready-for-martial-arts-ages-3-to-5/index.html` | `2f9480f0d0916fdd4fe8f9acfbe7b5f0f1e69a9af4a12a67eb763558736bb3b7` |
| `sitemap.xml` | `40559087b5b65738e21d404f4a01d7de4222bc2507742dee299b54300c459581` |

- Baseline 164 files, final 165: one addition and two modifications. All 162 protected pre-existing files, existing modes and private environment preserved. First article and shared blog CSS are byte-identical. No API, lifecycle, analytics, hosting, provider, calendar or DNS change; no lead/message submission. Zero residual rsync changes.
- Fresh genuine Windows Chrome, blocking all non-GET and third-party writes, verified HTTP 200 and exact release hashes for all three paths; both articles are self-canonical, `index,follow`, with no noindex response header. New Article/Breadcrumb JSON-LD, Joao byline, exact title/body and `tel:+15126444560` verified. The existing first article's public hash is unchanged.
- Public responsive checks at 390/768/1280/1440/1920: no horizontal overflow, broken images or page errors; black-on-yellow article CTA. At 390 and 1440, an actual click on “Ask about classes” reaches the existing contact page/form without submission; phone href inspected without initiating a call or text. Contact and Little Champions routes return HTTP 200. The sitemap preserves all 27 prior URLs and adds only the new canonical URL, for 28. Temporary probe removed and public HTTP 404 verified; no public archive or manifest was created.
- Exact-source production blog build passed **5998 validator checks across 47 generated routes** and **19 CMS tests**. No runtime source changed, and the full Node/backend suite was not rerun for this content-only release. Initial build exposed the existing renderer's handling of an omitted optional `sources` array; the published article now explicitly stores `sources: []`, with exact revision/readback verified and no added citations or body edits.
- Setup draft remains unpublished; anonymous eligible query returns exactly two approved articles. Future Studio publications still need a manual owner-run website release; automatic publishing, Google indexing and distribution were not claimed or triggered.

## Blog: published 2026-10-27, rechecked 2026-10-28

- PR [#141](https://github.com/D1360tx/JoaoCrusBJJ/pull/141): merge `f744839b2696a5295d8cfe751bef0ab8c37aff8a`.
- Follow-up [#142](https://github.com/D1360tx/JoaoCrusBJJ/pull/142): final source `e1e094ab36e60ea5d5669c579d64280d798f9d53`, removed only the obsolete blog-to-Parent-Guide redirect.
- CMS published document `agent-jiu-jitsu-safety-age-5`, revision `ysW3QQPzEg5AJcd5g3ldU6`, publication time `2026-10-27T22:12:01.537568Z`.
- Private release ID `blog-f744839`; full rollback archive retained outside webroot. Archive SHA256 `4c6065b40a08e97ac5e6ccb78572969767287c161348f995ad4c9d329384ca55`.
- Final six-file manifest SHA256 `2aa408fb4ceba86e319724eee702e6e0d078b43ccd4999e649c233dd7ea82a5a`. The original five-file-stage manifest hash in provenance is historical, not the final manifest.

| Final approved path | Origin SHA256 |
|---|---|
| `assets/blog.css` | `1e1d9ceb1df9d34954456d747132a99eff7011f829c687fb209f705479d5f9b6` |
| `blog/index.html` | `72c20b3f194eca3bb8eb25c2f61a4c06d65ced1f63b02b050d9d40c4311ec6b7` |
| `blog/is-jiu-jitsu-safe-for-a-5-year-old/index.html` | `10e7b94772259dcaf06f94b95344c21cfcb77a40f26d09fd76dcfdf33670205b` |
| `resources/index.html` | `936a8510cc8326aa4ea7d5389be8ff806d131adff21997f01664a20d45c65710` |
| `sitemap.xml` | `740b6ebf491c7ecddf8260cb50badf014ec5fdaad8770acf0a632f92edb0c788` |
| `.htaccess` | `61d9fdcf4453d4c92f62fdd20798444f63db2e49712bfd8d8e10738141f73a34` |

The final origin provenance was freshly read via SSH on Oct 28. Fresh genuine Windows Chrome, with all non-GET and third-party requests blocked, independently returned HTTP 200, self-canonical and `index,follow` for both [blog index](https://joaocrusbjj.com/blog/) and [article](https://joaocrusbjj.com/blog/is-jiu-jitsu-safe-for-a-5-year-old/). Binary same-origin browser fetch hashes matched the two HTML hashes above and fresh SSH origin hashes. Other allowlist hashes are from the retained final origin record, not a new full-tree rehash today.

Release-time proof: all 40 original article text blocks preserved; original Joao byline, citations/caption/CTA retained; supplied AI illustration credited; only approved article publicly queried, setup draft unpublished. Sitemap preserved 25 prior URLs and added two for 27 total. Five-width browser checks passed; article CTA reached contact form without submission. All 158 protected pre-existing file hashes, existing modes and private environment were preserved. Final archive tests: 407 Node passed, zero failed/skipped; 19 CMS tests passed; production validator passed 5994 checks across 46 generated routes. These are release-time results, not a claim that the documentation task reran the full application release job.

Resources, sitemap and hosting candidates were reversibly derived from origin rather than wholesale replacement from a drifting fresh build. Three additions and three modifications; no full-source-checkout advancement, host migration, DNS change, lead, email or SMS send. Probe cleanup returned public 404; no public archive/manifest left behind. Private evidence includes source/build logs, CMS revision snapshot, final provenance, limited manifest, backup verification and public browser receipts. Article text and embedded-image source stay in Sanity/private evidence, not a duplicate repository master.

## Direct CAPI: code release and later real acceptance

- [#140](https://github.com/D1360tx/JoaoCrusBJJ/pull/140) merged `12c0c5ca3031d93e41a858a6e34cd48a4e955f1b` at `2026-10-21T01:02:11Z`.
- Current origin handler SHA256 rechecked Oct 28: `1e2233b38067f0101f3abe0b56a2dcade17ab3efdcf65dabb66761aed067190a`.
- Oct 26 `16:53:36.626Z`: one actual form accepted into HighLevel contact/opportunity/note, then explicit Meta Browser Processed / Server Deduplicated with matching full event IDs. Fixture deletion, temporary-config restoration and bounded messaging evidence are detailed in [operational status](OPERATIONAL-STATUS.md). This does not establish ad attribution, provider-wide zero SMS or repeat-contact first-touch preservation.
- Earlier Oct 21 repeat-intake acceptance exposed first-touch overwrite. Original attribution fields were restored; SMS permission was deliberately not manufactured by restoring historical granted values. Preserve this unresolved issue rather than treating the later fresh fixture as its repair.

## Prior live-to-Git reconciliation

[#137](https://github.com/D1360tx/JoaoCrusBJJ/pull/137) merged `c638260f2c22daa966d2e7fe357d08b04f2e9d01` on 2026-10-06. It reconciled already-live spam first tranche, readable opportunity naming, CALM and parent attribution into main. The [original provenance/runbook](LIVE-GIT-RECONCILIATION-20261006.md) remains historical evidence. Open predecessor PRs are not permission to remerge their full stacks; see the [dated inventory](OPEN-PR-INVENTORY-2026-10-28.md).

## Future register entries

Record release time, exact reviewed/merged source, CMS revision if applicable, final path/hash manifest, private rollback descriptor/hash, protected-parity result, fresh origin/public verification, cleanup and explicit remaining gates. Do not put private archive download links, tokens, raw lead identities, logs or payloads in Git. A docs-only merge is not a new website deployment.
