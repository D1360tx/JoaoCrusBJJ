# Approved Castle Hill photo revisions

Approved 2026-09-07. Canonical source: `site/campaign/castle-hill-grand-opening.html`. Historical comparisons stay intact. No change to the disconnected Austin quiz, lead handler, consent, Meta, or GTM. All traffic remains held; September 14 is unconfirmed.

## Photography provenance

Correction 2026-09-07: the former adult coaching selection was AI-derived, not real photography. The earlier blanket provenance claim was incorrect. The current hero, Youth, and replacement adult group selections are real photographs, hosted locally. Hero and Youth retain their existing quality-85 RGB encodes; the adult group uses the existing quality-84 encode and restrained global corrections documented in its preparation script.

- Hero: `site/assets/castle-hill-multisport-room-20260907.webp`, 1200×800, 154618 bytes. Official Castle Hill Fitness Downtown gallery: https://www.castlehillfitness.com/wp-content/uploads/photo-gallery/imported_from_media_libray/Multisport-Room.jpg?bwg=1769443583 . Visible caption credits the facility. This is the Multisport Room, not a claim that this exact room is assigned to the BJJ class.
- Youth: `site/assets/castle-hill-youth-group-20260907.webp`, 867×672, 63716 bytes. https://www.castlehillfitness.com/wp-content/uploads/2026/08/Childrens-Jiu-Jitsu-Lesson-Austin-Tx.jpg from Castle Hill's explicit Joao co-marketing article: https://www.castlehillfitness.com/fitness-training/childrens-brazilian-jiu-jitsu-lessons-austin-tx . Four smiling children in gis on red mats. Do not claim this photograph was taken at Castle Hill.
- Adults (corrected): `site/assets/campaign-images/adults-black-belt-group-2026-07.webp`, 640×616. Source: supplied real photograph `assets/source-images/adults-black-belt-group-original-2026-07-31.jpg`, prepared by `scripts/prepare_adults_hero.py` with minor global contrast/color/sharpness corrections, no identity changes. Five adult black belts pose together; this is neither beginner coaching nor the new Castle Hill cohort. Use accurate group alt text and retain the full composition with `object-fit: contain`.
- Retired Castle Hill-only asset: `site/assets/castle-hill-adults-coaching-20260907.webp`. Its byte-identical upstream coaching hero traces through `scripts/prepare_adults_joao_ai_hero.py` to `assets/source-images/adults-joao-coaching-ai-original-2026-07-31.png`. Remove this unique derivative from source; remove its public copy only after a verified full backup and zero remaining production references. Shared historical AI concepts are outside this correction. PR #114 remains untouched.

Diego selected the official facility and partnership images for this approved partner-location page. Same-program co-marketing reuse is reasonably inferred from the established partnership and Castle Hill's public Joao feature, not an assertion of a blanket licence or separate written release. Retain source attribution and do not extend this inference to unrelated advertising or resale.

## Implementation and verification contract

- Headline explicitly names Castle Hill Fitness. OG, Twitter, schema and the manifest image agree.
- Program card DOM is label, image, heading. `object-fit: contain` preserves all people within equal 4:3 frames, with an 18px image-to-heading gap. Hero retains its native 3:2 frame.
- Shared calendar record order places Youth before Adults for both Tuesday and Thursday. No record, time or filter membership changes.
- Keep `noindex,nofollow` and sitemap exclusion. The official partner article currently advertises September 8 through December 17, conflicting with the provisional September 14 campaign copy. Preserve the explicitly approved campaign date pending owner confirmation; this discrepancy reinforces the traffic hold.
- Run preview and exact-SHA production builds, full Node suite, production validator, PHP lint, five-width browser QA and exact remote/live readback. Release records and screenshots remain outside the public root and git history.
