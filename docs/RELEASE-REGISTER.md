# Release and acceptance register

Reconciled 2026-10-28. Git merges, origin deployment, public proof and provider acceptance are different evidence layers. This document records sanitized receipts, not credentials or private archives. No production release is performed by the documentation reconciliation.

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
