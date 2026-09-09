# AY09 Adults + Youth artwork: verified PAUSED

## AY09 final Adults + Youth artwork revision (2026-09-08)

- Final AY09A ad `120251263139970072` → creative `1392143345711700`; AY09B ad `120251263002380072` → creative `1548660843191930`. Both final configured/effective **PAUSED / PAUSED** after review processing settled. Same ad IDs/names; AY07 and original AY09 ads/creatives unchanged.
- AY09B uses the explicitly selected Drive adult academy group JPEG `IMG_6449-adults-group-source-2026-09-08.jpg` (1572×1179; SHA-256 `0e25957e88c7b59ed9a55fa3ef0811950293621db34319a41e0f1bf141f1ea59`). Full source and all faces retained in 1:1/9:16 framed statics. Do not describe pictured adults as youth or claim this is Castle Hill. Participant paid-media permission remains an activation gate.
- Both use **COMPLETE BEGINNERS / ARE WELCOME.**, exact footer **ADULTS + YOUTH AGES 8–12 · CASTLE HILL FITNESS**, approved five-paragraph combined primary text and **You Don’t Have to Feel Ready** headline. AY09A was freshly rendered in 4:5 and 9:16; audio is byte-identical decoded PCM to the prior completed cut. Description intentionally changed from youth-time-only **Castle Hill Fitness · Tue/Thu at 5 p.m.** to **Adults + Youth Ages 8–12 in Austin.** to avoid implying that adult private instruction shares the youth schedule.
- Final destination readbacks are exactly `https://joaocrusbjj.com/castle-hill-grand-opening/?utm_source=meta&utm_medium=paid_social&utm_campaign=austin_castle_hill_launch_v1&utm_content={{ad.name}}&utm_term={{adset.name}}&utm_id={{campaign.id}}`. Six unique raw UTMs; no stale/encoded macros, missing/duplicate/conflicting keys, URL tags or manual fbclid. Automatic fbclid behavior is untouched. Hard gate: `scripts/validate_austin_youth_final_utm.py`.
- Separate user-authorized parent-agent fix for error **1870194**: Meta normalized `location_types` from `['frequently_in','home']` to `['frequently_in','home','recent']`. Same Austin city key `2525495`, radius **10 miles**, ages **24–54**, Facebook/Instagram, website Lead optimization and budget `3500`. Meta changed disabled-expansion representation from `targeting_automation: {advantage_audience: 0}` to `targeting_relaxation_types: {lookalike: 0, custom_audience: 0}`. Exact exception comparison rejects other differences; no claim of byte-identical targeting. Campaign/ad set settled PAUSED / PAUSED; final ad-set readback returned no issues_info. No targeting writes by the artwork script.
- New uploaded videos → ready creative copies: vertical `951510241314059` → `1734165961000142`; feed `2511572895920770` → `2093447011244219`. Both 26.866 seconds, 720×1280 / 720×900, exact decoded preferred-thumbnail RGB hashes match the **fresh uploads**, not old artwork. Full remote-video byte equivalence is not claimed.
- Evidence: `comparisons/meta-audit.json` sections `artwork_revision`, `authorized_location_type_revision`, `final_utm_acceptance`; `manifest.json` maps current assets. Earlier copy-only/attribution evidence is historical, not final current creatives. No activation, merge or deployment.

## Current assets and provenance

Current assets have the `-adults-youth` suffix; historical Joao-only AY09B statics and prior video exports remain intact.

- `AY09B_BEGINNERS-WELCOME_STATIC_1x1-adults-youth.png`: 1080×1080.
- `AY09B_BEGINNERS-WELCOME_STATIC_9x16-adults-youth.png`: 1080×1920.
- `AY09A_BEGINNERS-WELCOME_LONG-VIDEO_4x5-adults-youth.mp4`: 720×900 H.264/AAC.
- `AY09A_BEGINNERS-WELCOME_LONG-VIDEO_9x16-adults-youth.mp4`: 720×1280 H.264/AAC.
- `source/IMG_6449-adults-group-source-2026-09-08.jpg`: exact user-selected original. Full image is contained, never cropped, generated or relabeled as a youth/Castle Hill scene.
- `contact-sheet-1x1.jpg`, `contact-sheet-9x16.jpg`: current AY07 / AY09B comparison; both visually inspected.
- `AY09A-contact-sheet-{4x5,9x16}-adults-youth.jpg`: five inspected beginning/middle/ending frames per placement. These are local safe-zone checks, not native Ads Manager overlay previews.
- `approved-copy.json`: exact paid text; `manifest.json`: source/output hashes, text geometry, ffprobe and current creative IDs.
- `caption-timing.json`: continuous source interval 28.04–54.88. Final thought ends “the right place for you or your child.” No freeze padding, synthetic speech or empty outro. Re-rendered decoded audio matches the previously transcribed complete cut exactly.

## Final preserved controls

AY07 ad `120251261010900072` / creative `1687998043330822` and original AY09 ad `120251261045730072` / creative `1107882611663240` are unchanged and PAUSED / PAUSED. Campaign `120251246135250072`, ad set `120251246144560072` remain PAUSED / PAUSED. The only authorized parent exception is documented above.

LEARN_MORE, website-only Lead, OFFSITE_CONVERSIONS, Pixel `592714768141415`, Page `977808342257807`, Instagram `17841402345785819`, and all 83 enhancement OPT_OUT settings remain exact. Priority 1 vertical routes Facebook story/facebook_reels and Instagram story/reels; priority 2 feed is square static / 4:5 video. No Instant Form. Generated creative names/unpublished post IDs differ; ad names and tracking event/pixel/page fields are preserved, allowing array reordering.

## Reproduction and acceptance

```sh
python scripts/build_austin_youth_comparisons.py
python scripts/render_austin_youth_long_video.py
python scripts/update_austin_youth_artwork.py
python scripts/validate_austin_youth_final_utm.py
python -m unittest discover -s tests -p 'test_austin_youth*.py' -v
python scripts/validate_castle_safe.py
python scripts/validate_austin_youth_video.py
python scripts/austin_youth_comparison_meta.py --verify
git diff --check
```

`update_austin_youth_artwork.py` only mutates with `--apply`. Do not run concurrently. Historical mutation scripts are not the current workflow. Candidate creatives are read back and validated before same-ID PAUSED ad swaps; uploads and remaps must meet strict decoded-thumbnail proof. Signed media URLs and credentials stay outside git; public evidence is redacted.

Acceptance: **19/19 AY tests PASS**, including exact full-source photo pixels, bounds/overlap/hash checks, footer, decoded audio preservation, fresh-upload remap evidence, final PAUSED state, narrow parent exception and negative UTM mutations. Safe-wave validator **6 concepts / 12 images PASS**. Original AY09 strict validator PASS. Hard final UTM readback PASS on both final creatives: six unique exact values in one canonical website_url, `url_tags` absent, no conflicting link representation or manually appended fbclid. Campaign/ad set and both final ads are PAUSED / PAUSED; final ad-set issues_info absent.

## History and holds

The prior copy-only revision used creatives `28341354795499624` / `1066596592851512`; attribution-only revision used `1742996493484338` / `1066872229294951`. Their evidence is retained under historical audit sections, not current inventory. Prior Joao-only AY09B assets are historical.

**Do not activate, merge or deploy.** All identifiable AY09B adult-group participants and AY07 students require paid-media permission; public/Drive availability is not a release. Joao/source-video rights, opening date, website Lead acceptance, exact budget authorization and explicit traffic approval remain activation gates. No spend was authorized.
