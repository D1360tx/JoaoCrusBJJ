# Approved Castle Hill photo revisions

Approved 2026-09-07. Canonical source: `site/campaign/castle-hill-grand-opening.html`. Historical comparisons stay intact. No change to the disconnected Austin quiz, lead handler, consent, Meta, or GTM. All traffic remains held; September 14 is unconfirmed.

## Photography provenance

These are real photographs, not AI. Native dimensions are retained without upscaling, retouching, or changing identities. WebP quality 85, method 6; metadata stripped by RGB re-encode. Images are hosted locally, never hotlinked.

- Hero: `site/assets/castle-hill-multisport-room-20260907.webp`, 1200×800, 154618 bytes. Official Castle Hill Fitness Downtown gallery: https://www.castlehillfitness.com/wp-content/uploads/photo-gallery/imported_from_media_libray/Multisport-Room.jpg?bwg=1769443583 . Visible caption credits the facility. This is the Multisport Room, not a claim that this exact room is assigned to the BJJ class.
- Youth: `site/assets/castle-hill-youth-group-20260907.webp`, 867×672, 63716 bytes. https://www.castlehillfitness.com/wp-content/uploads/2026/08/Childrens-Jiu-Jitsu-Lesson-Austin-Tx.jpg from Castle Hill's explicit Joao co-marketing article: https://www.castlehillfitness.com/fitness-training/childrens-brazilian-jiu-jitsu-lessons-austin-tx . Four smiling children in gis on red mats. Do not claim this photograph was taken at Castle Hill.
- Adults: `site/assets/castle-hill-adults-coaching-20260907.webp`, 1280×960, 117840 bytes. Byte-identical, uniquely named copy of the existing optimized academy asset `site/assets/campaign-images/adults-joao-coaching-hero-2026-07.webp`, preserving its full 4:3 composition without further lossy encoding. Joao coaches two adults practicing a position. This replaces the initial posed black-belt group choice to match the beginner message; it is not represented as the new Castle Hill cohort.

Diego selected the official facility and partnership images for this approved partner-location page. Same-program co-marketing reuse is reasonably inferred from the established partnership and Castle Hill's public Joao feature, not an assertion of a blanket licence or separate written release. Retain source attribution and do not extend this inference to unrelated advertising or resale.

## Implementation and verification contract

- Headline explicitly names Castle Hill Fitness. OG, Twitter, schema and the manifest image agree.
- Program card DOM is label, image, heading. `object-fit: contain` preserves all people within equal 4:3 frames, with an 18px image-to-heading gap. Hero retains its native 3:2 frame.
- Shared calendar record order places Youth before Adults for both Tuesday and Thursday. No record, time or filter membership changes.
- Keep `noindex,nofollow` and sitemap exclusion. The official partner article currently advertises September 8 through December 17, conflicting with the provisional September 14 campaign copy. Preserve the explicitly approved campaign date pending owner confirmation; this discrepancy reinforces the traffic hold.
- Run preview and exact-SHA production builds, full Node suite, production validator, PHP lint, five-width browser QA and exact remote/live readback. Release records and screenshots remain outside the public root and git history.
