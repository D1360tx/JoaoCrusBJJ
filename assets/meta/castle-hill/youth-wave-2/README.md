# Austin Youth AY07 / AY08 / AY09: paused draft inventory

## Current attribution correction: partial / blocked

AY09B now uses replacement creative `1066872229294951` with dynamic `utm_content={{ad.name}}`; its ad ID is unchanged. AY09A remains on its previous creative because Meta remapped the exact supplied video IDs in both attempted replacements. No video ad swap occurred. Both ads remain PAUSED / PAUSED. See the comparison audit for the failed exact-media-ID gate; current native QA is 9 pass / 1 fail, not complete.

## Prior approved revision and comparisons

**Current evidence: [comparisons/README.md](comparisons/README.md).** AY07 was updated in place to beginner-belonging (creative `1687998043330822`); AY09A longer video and AY09B static were separately created and verified PAUSED. Original AY09 and every prior asset below remain intact. The original AY07 table/audit is historical, not its current creative. Do not run the historical `austin_youth_meta.py` to refresh current AY07 evidence; use `austin_youth_comparison_meta.py --verify`.

The original AY09's 39.00-second source boundary cut the sentence after “meet.” Earlier complete-cut wording is superseded by the source-word/encoded-audio evidence in comparisons. The replacement comparison uses a continuous completed 26.84-second thought, not a longer empty outro.


## AY09 video extension

[AY09 production assets and evidence](video/README.md) add a placement-aware SINGLE_VIDEO draft: creative `1107882611663240`, ad `120251261045730072`, final configured/effective **PAUSED / PAUSED**. Two H.264/AAC exports (720×1280 Stories/Reels and 720×900 feed, each 16.607 seconds), two ASS caption files and two reviewed contact sheets are retained. The separate `video/approved-copy.json`, `video/manifest.json` and `video/meta-audit.json` preserve the existing AY07/AY08 schemas and evidence unchanged. Joao only, no students; participant/video paid-media permission remains an activation gate.

## Recommended initial launch slate (not activation authorization)

At the proposed **$10/day total campaign budget**, activate **at most AY07 + AY09 + existing safe AY01 Tap Means Stop** after all applicable permission, tracking and explicit activation gates pass. Keep AY08 and all other ads PAUSED as rotation inventory. Do not run six simultaneously; this recommendation does not imply equal per-ad delivery.

The user said “probably around $10,” so budget mutation awaits exact final confirmation. Campaign budget remains **3500 minor units**. No budget, targeting or activation changes were made. All current drafts remain paused.

The sections below retain the original AY07/AY08 delivery and historical audit.

## Delivery

Four original PNGs: each ad has a 1080×1080 feed asset and 1080×1920 Stories/Reels asset. The two contact sheets are review artifacts, not ad uploads. Full source-photo aspect ratios are preserved without cropping, generated pixels, or face edits. The typography and contrasting accent follow the established Campaign Group system.

- AY07 structurally adapts Dripping Springs `AD03_START-AT-3_STATIC`: three-line age rationale, yellow age emphasis, real group photograph. The copy is specifically for Youth 8–12, not a toddler promise or duplicated Dripping Springs creative. Reference inspected: `scripts/build_meta_leadgen_image_variations.py` on existing variation branch, AD03 V2/V3 definitions.
- AY08 uses a different two-line practice/confidence hook, blue frame, and the supplied Youth group photograph. The image does not assert a class exercise or Castle Hill location.

## Meta objects

| Ad | Creative ID | Ad ID | Configured status | Effective status at audit |
|---|---|---|---|---|
| AY07_YOUTH-8-12-ON-PURPOSE_STATIC | 1532274342037820 | 120251261010900072 | PAUSED | PAUSED |
| AY08_REAL-PRACTICE_STATIC | 1094650096414688 | 120251261015960072 | PAUSED | PAUSED |

Campaign `120251246135250072` and ad set `120251246144560072` were read back PAUSED / PAUSED before and after creation. Campaign daily budget remains `3500` account minor units; no budget or targeting writes occurred. Account: `act_456685748412595`.

Website-only destination, `OFFSITE_CONVERSIONS`, Pixel `592714768141415`, `custom_event_type=LEAD`. Identity: Page `977808342257807`, Instagram `17841402345785819`. Exact body/headline/description and dynamic UTMs are in `approved-copy.json` and verified against Meta. No Instant Form. Single-image PLACEMENT creative with vertical priority 1 for Facebook story/facebook_reels and Instagram story/reels; square default priority 2 for feeds. All 83 returned enhancement features are OPT_OUT and match the existing safe-wave baseline exactly.

**Configured and effective PAUSED are both verified for both ads. Strict effective-state acceptance passed.** Processing progressed from IN_PROCESS through PENDING_REVIEW to PAUSED using read-only polling, without activation or recreation.

## Files and reproduction

- `approved-copy.json`: requested naming, copy, destination and CTA.
- `manifest.json`: hashed source allowlist, output hashes, text/photo geometry and activation gates.
- `images/1x1/*.png`, `images/9x16/*.png`: four final uploaded assets.
- `contact-sheet-1x1.jpg`, `contact-sheet-9x16.jpg`: both visually reviewed.
- `meta-audit.json`: exact persistent readbacks, uploaded hashes, IDs, identities, rules, copy, enhancements, parent before/after snapshots.
- `scripts/build_austin_youth_variations.py`: deterministic Pillow build (requires Impact at `/mnt/c/Windows/Fonts/impact.ttf`, DejaVu Sans Bold and Pillow).
- `scripts/austin_youth_meta.py`: read-only by default; `--create` is the explicit mutation gate, always PAUSED, with resumable per-object persistence. Do not use concurrently. Raw upload responses with expiring URLs are private in `/home/d1360/.cache/joao-ay07-ay08`, excluded from the repository.
- `tests/test_austin_youth_pack.py`: artifact and strict configured/effective-paused contract tests. Processing and pending-review states fail final acceptance.

## QA

Executed:

```sh
python scripts/build_austin_youth_variations.py
python -m unittest discover -s tests -p test_austin_youth_pack.py -v
python scripts/validate_castle_safe.py
python scripts/austin_youth_meta.py --strict
git diff --check
```

- Four unique PNGs built; dimensions, hashes, two-photo allowlist, full-photo preservation, exact copy, text safe zones and text/photo non-overlap checked.
- Two unit tests pass. Original safe-wave validator also passes unchanged.
- Both contact sheets visually inspected. AY07 square photo spacing corrected before upload; all source faces and full photos remain visible.
- Both creative readbacks match all placement hashes/rules, text, dynamic UTMs and 83 opt-outs. Parent budget/targeting snapshots match.
- Strict audit passes: both ads and both parents are configured/effective PAUSED. Initial asynchronous processing/review resolved via read-only polling.
- Protected PR #114 remains OPEN at `4b3059495579ac2796ec4308b05a860224557b54`; its files and existing safe-wave assets remain untouched.
- Meta's additional `smart_pse_enabled=false` field is explicitly checked; initial overly narrow promoted-object equality assertion was corrected without relaxing pixel/event checks.

## Before activation

1. Obtain documented identifiable-student paid-media approval for **both** images. Public co-marketing/website use is not a participant release.
2. Get explicit traffic/activation authorization. This task authorizes only paused creation, no budget change, no merge and no deployment.
3. Resolve the provisional opening-date and website Lead tracking acceptance gates. Neither creative advertises an opening date.
4. Re-run strict effective-state readback. Preserve all opt-outs and website-only conversion settings.

Neither photo is claimed to have been taken at Castle Hill. AY07's source is from Castle Hill's public Joao partnership article (see `docs/CASTLE-HILL-PHOTO-REVISIONS.md`); AY08 is the owned/supplied academy asset previously approved on the Youth page. The source manifest distinguishes provenance from paid-media approval.
