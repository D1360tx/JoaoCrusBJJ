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
