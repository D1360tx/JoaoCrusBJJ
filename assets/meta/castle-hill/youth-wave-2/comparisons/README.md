# AY07 beginner-belonging + AY09 format comparisons

## Attribution correction status: COMPLETE / PAUSED

AY09A and AY09B now have dynamic `utm_content={{ad.name}}` and are verified PAUSED. AY09A uses replacement creative `1742996493484338`; Meta-owned video copies were accepted only after ready status, identical 26.866-second duration, unchanged placement dimensions, and byte-identical decoded preferred thumbnails were verified against the prior creative. Unattached creative `1635025141591684` remains evidence, not active inventory.

## Verified current Meta objects

| Concept | Ad ID | Creative ID | Configured / effective |
|---|---|---|---|
| AY07_BEGINNER-BELONGING_STATIC | 120251261010900072 | 1687998043330822 | PAUSED / PAUSED |
| AY09A_BEGINNERS-WELCOME_LONG-VIDEO | 120251263139970072 | 1742996493484338 | PAUSED / PAUSED |
| AY09B_BEGINNERS-WELCOME_STATIC | 120251263002380072 | 1066872229294951 | PAUSED / PAUSED |

AY07 was updated in place, including its name, using Meta's supported creative swap. No replacement ad or deletion was necessary. The previous creative `1532274342037820` and historical local artifacts are retained.

Original AY09 ad `120251261045730072`, creative `1107882611663240`, remains unchanged and PAUSED. AY08 and other inventory were not mutated.

Campaign `120251246135250072` and ad set `120251246144560072` were read back before and after. Both remain configured/effective PAUSED. Campaign daily budget is unchanged at `3500` account minor units; ad-set targeting matches exactly. Website-only Leads, `OFFSITE_CONVERSIONS`, Pixel `592714768141415`, Page `977808342257807`, Instagram `17841402345785819`, LEARN_MORE, no Instant Form and all **83 individual creative-feature OPT_OUT values** were verified. Neither parent was written.

## Assets and exact copy

All paths below are relative to this directory:

- `AY07_BEGINNER-BELONGING_STATIC_1x1.png` and `_9x16.png`: 1080×1080 / 1080×1920. Approved hook, support and footer, with the full real group photograph. No face cropping or text/photo overlap.
- `AY09B_BEGINNERS-WELCOME_STATIC_1x1.png` and `_9x16.png`: same static dimensions. Joao-only frame extracted at source 29 seconds, with “COMPLETE BEGINNERS / ARE WELCOME.” No AI imagery, generated likeness or claimed Castle Hill training scene.
- `AY09A_BEGINNERS-WELCOME_LONG-VIDEO_4x5.mp4`: 720×900, H.264/AAC, **26.866667 seconds**.
- `AY09A_BEGINNERS-WELCOME_LONG-VIDEO_9x16.mp4`: 720×1280, H.264/AAC, **26.866667 seconds**.
- `approved-copy.json`: exact approved AY07 copy, and unchanged original AY09 copy for both comparison formats.
- `manifest.json`: local source/output SHA-256, ffprobe metadata, geometry and source provenance.
- `caption-timing.json`, `AY09A-captions-*.ass`: accurate spoken captions and source/output timings.
- `audio-visual-qa.json`: fresh local source transcription, independent transcription of the encoded longer video, and actual contact-sheet review notes.
- `contact-sheet-*.jpg`, `AY09A-contact-sheet-*.jpg`, `AY09A-*-frame-*.jpg`: reviewed static pairs and five beginning/middle/ending frames per video placement.
- `meta-audit.json`: exact response journal with only signed media URLs redacted, upload IDs, creative/ad IDs, readbacks, parent before/after snapshots and verification timestamps. Raw signed responses remain private outside git.

Required AY09A/B tracking is `utm_content={{ad.name}}`, retaining the same landing page and every other query parameter. Both comparison ads now meet this contract. Original AY09 and AY07 remain untouched. The earlier decision to retain identical literal content UTMs is superseded: backend/CRM variant differentiation requires dynamic ad-name attribution.

## Why the video no longer cuts off

Original AY09 ended at source **39.00**, immediately after “meet” in “I would love to meet you at the academy…” Its old burned captions paraphrased the preceding audio and omitted this partial next sentence. The historical claim of a complete cut is superseded.

The new edit is one continuous **28.04–54.88** source interval, 26.84 seconds before frame-rate rounding. It begins “We welcome complete beginners,” then completes the readiness reassurance, the academy-visit invitation and the no-pressure reassurance. The final sentence is:

> Just come in, meet us, and see whether it feels like the right place for you or your child.

The final spoken word ends around source **54.62**. The cut retains natural room through **54.88**, before the next sentence starts around **55.18**. There is no freeze-frame extension, synthetic speech, changed speaking speed, empty outro or clipped next sentence. Only the final 80 ms receives an audio fade, after the final spoken word. The independently retranscribed encoded output includes the complete final sentence, with its final word ending around output 26.56 seconds.

## Placement routing and Meta video-copy behavior

Static creative routing uses `vertical` priority 1 for Facebook story/facebook_reels and Instagram story/reels, with `feed` priority 2 as the square default. Video uses the same vertical rule and a 4:5 feed default. Asset counts and both label mappings are verified, not inferred from successful creation.

Meta creates creative-owned video copies with different IDs from the uploads:

| Placement | Upload ID | Creative video ID |
|---|---|---|
| 9:16 | 911807341648497 | 1085431400759011 |
| 4:5 | 1571933488047190 | 951277087315201 |

Creation stopped before making the video ad when these IDs differed. The copies were then read back ready, with equal 26.866-second durations, matching expected aspect ratios and **pixel-identical preferred thumbnails** (mean absolute difference 0.0). The exact create request also preserves each original upload/label association. Only then was the video ad created and read back PAUSED. Graph omitted the copy's `source` field; no claim of remote decoded-video equivalence is made. The full local exports were decoded and transcribed.

## Reproduction and QA

From the PR worktree:

```sh
python scripts/build_austin_youth_comparisons.py
python scripts/render_austin_youth_long_video.py
python -m unittest discover -s tests -p 'test_austin_youth*.py' -v
python scripts/validate_castle_safe.py
python scripts/validate_austin_youth_video.py
python scripts/austin_youth_comparison_meta.py --verify
git diff --check
```

Render dependencies: Pillow, FFmpeg with libx264/libass, Impact at `/mnt/c/Windows/Fonts/impact.ttf`, DejaVu Sans / DejaVu Sans Bold. Local Whisper small.en supplies audio verification, not generated audio. Run both build commands in order: the static build starts the manifest and the video build extends it. Existing source media is referenced from this repository, not a stale external worktree.

`fix_austin_youth_comparison_attribution.py` defaults to read-only and has an exact URL-only equality gate before swapping. AY09B was corrected directly. AY09A required a Meta-copy equivalence gate because Meta remapped its video IDs; the replacement was attached only after status, duration, dimensions, and decoded-thumbnail checks passed.

`austin_youth_comparison_meta.py` defaults to read-only preflight. Its explicit `--apply-static` and `--apply-video` flags are narrowly scoped and resumable; never run concurrent instances. If Meta remaps new video IDs, `verify_austin_youth_video_copies.py` proves the mapping before resuming. Do not treat transient processing as authorization to activate or duplicate an ad.

Current correction QA passes with no skips. Existing safe-wave validator passes **6 concepts / 12 images** unchanged; original AY09 validator passes; current paused-state, dynamic URL and protected-parent readbacks pass. Static bounds/overlap/hash/copy checks pass. Both static contact sheets and both five-frame video sheets were visually reviewed. These are safe-zone/contact-sheet checks, not native Ads Manager placement-overlay previews.

## Remaining gates

**Do not activate, merge or deploy.** Student paid-media releases remain required for AY07; website/co-marketing publication is provenance, not a participant release. Joao/source-video paid-media rights remain a gate for AY09A/B. Opening-date confirmation, website Lead-tracking acceptance, exact budget approval and explicit traffic authorization remain separate holds. The user authorized this paused-only build, not spend.
