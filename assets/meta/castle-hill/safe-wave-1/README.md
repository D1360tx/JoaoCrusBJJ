# Castle Hill permission-safe paused iteration

Separate iteration from `origin/main` at `5c34d71`. PR #114 and its blocked media remain untouched. User explicitly approved only Joao/facility-safe media and PAUSED ads.

## Contents and provenance

Six concepts, each square 1080×1080 and vertical 1080×1920. Only the existing verified empty Castle Hill Multisport Room photo and official academy logo are composited. No new scraped images, generative media, people, students, minors, group photos or implied training-scene photographs. The existing first-party facility-photo URL is provenance evidence, not a new download. Permission is limited to this user's expressly authorized safe iteration, not a blanket third-party licence.

`manifest.json` records source hashes, output hashes, safe zones, exact copy, destinations and UTMs. `approved-copy.json` preserves the exact six copy tuples from #114 commit `4b3059495579ac2796ec4308b05a860224557b54`. No copy changes. No opening date in any ad.

Every image visibly explains: “Castle Hill facility photo. Program described in copy. Illustrative space, not a class or assigned-room photo.” Layouts vary cream/blue/yellow/black, frame widths/position and photo crops. Typography uses local DejaVu Sans bold/regular for deterministic output in this environment. Vertical content is kept within y=280–1570, leaving placement interface clearance.

## QA

- `python scripts/build_castle_safe.py`: built twelve unique files and two contact sheets.
- `python scripts/validate_castle_safe.py`: PASS count=6 concepts/12 PNGs, dimensions, source allowlist, hashes, exact copy, no date, safe-zone containment and zero text overlaps.
- Visual inspection of the full source photo including mirrors: empty room, no people/portraits.
- Both six-tile contact sheets inspected. Initial vertical address/caption overlap was fixed; final vertical sheet has clear separation. Square and vertical headings, CTA and disclosures are complete and readable; no people.
- `python scripts/build_vercel_site.py` then `node --test tests/*.test.js`: PASS. Initial run before building dist had two missing-build-fixture failures; rerun after required build passed.
- `git diff --check`: clean.

## Meta contract

Existing campaign `120251246135250072` and ad set `120251246144560072` only. Both read PAUSED before any write; ad set contained zero ads. Never activate, change budget, targeting, dates or parent settings. Website-only `LEARN_MORE`, Page `977808342257807`, Instagram `17841402345785819`. Each creative must pair its own labeled square default and vertical Stories/Reels override, preserve exact ad-specific URL/copy, omit Instant Form extensions and translations, and explicitly opt out of Advantage+ creative enhancements. Do not fall back to single-image or automatic enhancement behavior on rejection. Persist creation receipts and exact-target readbacks in `meta-audit.json` once available.

Traffic remains held, independently of creative completeness, including the landing page's unconfirmed opening date and separate activation/tracking approval.

## Actual Meta result

All twelve images uploaded; six placement-customized creatives and exactly six ads created under the approved ad set, each explicitly PAUSED. All exact-target readbacks are in `meta-audit.json`; `scripts/verify_castle_meta.py` is read-only and reproducible. Every creative returns **83 OPT_OUT feature controls**, including image/text translation and site extensions. Exact copy, URLs/UTMs, identities, CTA, square/vertical hash mapping and Stories/Reels rule priority passed mechanical comparison. Campaign and ad set remain PAUSED with original $35/day campaign budget and original targeting. Website destination and pixel verified. No issues_info or recommendations returned.

| Concept | Creative ID | Ad ID | Effective status at saved readback |
|---|---|---|---|
| AY01 | 2103156577742211 | 120251260014400072 | PENDING_REVIEW |
| AY03 | 2564936567304589 | 120251260014790072 | PAUSED |
| AY05 | 1541320053989486 | 120251260015140072 | PENDING_REVIEW |
| AA01 | 2077252959817026 | 120251260015570072 | PENDING_REVIEW |
| AA03 | 28521308404223057 | 120251260015710072 | PENDING_REVIEW |
| AA05 | 2003106970488268 | 120251260015870072 | PENDING_REVIEW |

**Async acceptance still pending:** configured status is PAUSED for all six, but Meta review temporarily reports PENDING_REVIEW for five. The strict effective-PAUSED gate is recorded false; the verifier exits 2 until every ad resolves to a paused effective status. PR #116 is intentionally left open and unmerged while this final acceptance gate remains pending. This is not activation or permission to spend. Do not recreate ads or change parent settings to clear review.

**Meta API correction:** the initial creative call rejected deprecated `standard_enhancements` (code 100/subcode 3858504). Only that deprecated umbrella field was removed; all individual opt-outs remained and were verified. No malformed ads or duplicate creatives were created by the rejected request.

PR #114 readback remains OPEN at `4b3059495579ac2796ec4308b05a860224557b54`. Its exact copy was independently compared across all twelve original manifest entries. The local full Node suite passes 130/130 after the required build.
