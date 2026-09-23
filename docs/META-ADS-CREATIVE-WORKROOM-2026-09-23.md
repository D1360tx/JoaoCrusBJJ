<!-- markdownlint-disable MD013 -->

# Joao Meta Ads Creative Workroom

**As of:** 2026-09-23  
**Markets:** Dripping Springs and Austin / Castle Hill  
**Status:** Internal working brief. Copy and production recommendations require approval. No authorization to upload, change an existing ad, activate spend, deploy a page, or call video-generation APIs.  
**Outcome:** Finalize the first four ad packages, then separately authorize loading them as paused ads.

## 1. Start here

Build **two controls plus two challengers**, not the whole library:

1. `DS_YOUTH_CONTROL_Y02`: migrate the existing calm/problem-solving static without editorial changes.
2. `DS_YOUTH_CH01_PARTNER-RESET`: real Youth partner drill, clear tap, release and reset.
3. `AUS_CONTROL_AY09A_LONG-VIDEO`: migrate the existing mixed Adults + Youth beginner-welcome video without editorial changes.
4. `AUS_ADULT_CH01_BEGINNER-COACHING`: a dedicated adult first-class coaching sequence.

The first work is creative approval and an asset/release audit. The combined campaign is a paused shell with no ads. Nothing in this document marks a challenger produced or an incumbent cloned. Keep the Age-3 incumbent separate. Keep later Youth, Adult and AI-guide ideas in rotation inventory rather than adding them all to delivery.

**Repository status:** PR [#123](https://github.com/D1360tx/JoaoCrusBJJ/pull/123) is merged. This consolidated workroom is the successor document on branch `docs/meta-ads-creative-workroom-20260923`, based on current `origin/main`.

### Evidence labels

- **META LIVE READBACK:** exact Meta facts fetched from the account on 2026-09-23 through the read-only Meta tools.
- **SOURCE:** inspected repository evidence, including dated historical API audits. Not a claim about current configured/effective status.
- **PROPOSED:** recommendations, new copy and new names. Not approved or already built.
- **GATE:** unresolved verification or permission required before the dependent action.

Newest specific verified state wins over an old creative ID or README. A concept, a finished export, an uploaded creative and a live ad are different things.

## 2. Campaign control panel

### Combined campaign: META LIVE READBACK

| Field | Exact value |
|---|---|
| Campaign | `PROSPECTING | YOUTH+ADULTS | DS+AUSTIN | ABO | W1 | 202609` |
| Campaign ID | `120251542102110072` |
| Objective | `OUTCOME_LEADS` |
| State | `PAUSED` |
| Budget mode | ABO, no campaign-level budget |
| Conversion | Website Lead, Pixel `592714768141415` |
| Ads in this campaign | None |

| Ad set | Exact ID | Daily budget | Audience and delivery | State |
|---|---|---:|---|---|
| `DS_15MI_BROAD_24-54_YOUTH+ADULTS_ABO_W1` | `120251542146170072` | $12 | Dripping Springs, 15-mile radius, ages 24–54, Facebook + Instagram | PAUSED |
| `AUSTIN_10MI_BROAD_24-54_YOUTH+ADULTS_ABO_W1` | `120251542146660072` | $18 | Austin, 10-mile radius, ages 24–54, Facebook + Instagram | PAUSED |

The September 21 execution plan records 7-day-click attribution. Re-read the actual attribution specification before upload/cutover. Combined planned budget is $30/day. The separate Age-3 DS lane is $5/day in that plan, giving a $35/day intended steady-state portfolio, not permission to add $30/day on top of every older campaign still delivering.

### Controls: META LIVE READBACK creative identity, historical performance window

| Slot | Existing source ad | Current source creative supplied | Through Sep 20 | Destination |
|---|---|---|---|---|
| DS Youth | `120251283184710072`, `Y02_CALM-PROBLEM-SOLVING_STATIC` | `1614797546902344` | $25.44 spend, 1 website lead | `/kids-first-class/` |
| Austin mixed | `120251263139970072`, `AY09A_BEGINNERS-WELCOME_LONG-VIDEO` | `1571675311324124` | $146.25 spend, 2 website leads, source reports $73.13 CPL | `/castle-hill-grand-opening/` |

These are **incumbent controls, not statistically established winners**. The Austin ad is not a pure adult ad. Neither supplied result establishes qualified conversations, attended visits, enrollment or CAC. Do not compare the two locations' CPLs as a controlled experiment.

The September 21 plan calls for pausing `Y03_FIND-YOUTH-CLASS_STATIC`, ad `120251283184900072`, leaving Y02 and AY09A running while replacements are built, and leaving Age-3 untouched. Those are future authorized-execution instructions, not actions performed here. Re-read all existing statuses before acting. Snapshot performance first. Do not infer that Y03 is currently paused or the controls currently active from this document.

## 3. Offer, eligibility and destination truth

| Cell | Source-confirmed program | Destination direction | Copy boundary |
|---|---|---|---|
| DS Little Champions | Ages 3–7, Mon/Wed 5:00–5:45 p.m. | Existing kids first-class / child finder | Separate incumbent/rotation lane, not this Youth + Adults first wave |
| DS Youth | Ages 8–12, Mon/Wed 5:50–6:35 p.m. | `https://joaocrusbjj.com/kids-first-class/` | Parents are buyers; do not target children |
| DS Adults | Mon/Wed 6:40–7:40 p.m.; Sat 11:00 a.m.–noon | Adult program or adult-capable finder, final exact route and CTA require verification | Never send adult prospects into a child-preselected finder |
| Austin Youth | Ages 8–12, Tue/Thu 5:00–5:45 p.m. | `https://joaocrusbjj.com/castle-hill-grand-opening/` | No ages 3–7 offer in Austin |
| Austin Adults | Group Tue/Thu 6:00–7:00 p.m.; private lessons by appointment | Same combined Castle Hill destination | Do not imply group and private share one schedule |

Austin address: **1112 N Lamar Blvd, Austin, TX 78703, inside Castle Hill Fitness**. DS address in the decision file: **120 Frog Pond Lane, Suite 200, Dripping Springs, TX 78620**. Reconfirm schedules, capacity and any public address details at approval/upload, not by inheriting an old end card.

**Approved next-step model in the worktree's dated decisions:** complete the finder, Joao personally calls to discuss fit and arrange a free studio visit. The visitor or child may observe or participate. The finder does not instantly book a place. Use `LEARN_MORE` for the first wave. Do not add a price, deposit, uniform bonus, unlimited trial, guarantee, urgency or scarcity without new confirmation.

Austin retains the combined child/adult choice at quiz entry, with no preselected branch and contact capture last. Preserve the existing `austin-program-fit` routing contract. `/austin-youth-first-class/` and `/austin-adults-first-class/` are retained comparisons, not default launch destinations. A noindex paid landing page can be intentional; noindex alone does not prove the lead path is disconnected or ready.

**Opening-date gate:** the older Castle Hill page/launch materials contain provisional September 14 language. That date was never confirmed by deployment approval. Inspect the current public page, media, metadata and quiz before traffic. Do not repeat “coming,” “grand opening on September 14,” or imply a newly verified opening. The existing URL slug may remain while visible facts are separately corrected with approval.

## 4. One status system for the entire library

### Readiness ladder

| State | Meaning and required proof |
|---|---|
| `SOURCE` | Idea/source story exists, no approved production package |
| `BRIEF` | Audience, hypothesis, source, script, shots, destination and owner specified |
| `APPROVED-COPY` | Diego/Joao approve exact wording and factual program fit |
| `ASSET-QA` | Final exports, media provenance, release references, safe-zone previews and caption/audio checks recorded |
| `UPLOAD-READY` | Copy + asset + permission + destination + tracking package complete; upload separately authorized |
| `PAUSED-VERIFIED` | New ad and creative read back exactly; configured/effective status paused; parents paused; all mappings and opt-outs match |
| `LIVE-APPROVED` | Explicit activation authorization plus completed cutover preflight |
| `REVIEW` | Evidence window collected and reconciled with CRM |
| `KEEP / ROTATE / RETIRE` | Decision with dated reason, retained prior version and evidence |

Use independent gates: `FACTS`, `RELEASES`, `VENUE`, `MEDIA`, `COPY`, `DESTINATION`, `ATTRIBUTION`, `LEAD-DEDUP`, `LIFECYCLE`, `TEST-ALLOCATION`, `ACTIVATION`. Each is `UNKNOWN`, `BLOCKED` or `PASS`, with date and evidence. A historical paused ad can still have `RELEASES=BLOCKED`. An asset marked “safe” is not a blanket license for a new campaign.

### Required record for every candidate

`concept_id | source_aliases | market | program | angle | hook | version | format | status | owner | source_path | media_provenance | release_reference | final_asset_paths | headline | description | primary_text | CTA | destination | URL_parameters | source_ad_id | source_creative_id | new_ad_id | new_creative_id | gates | approved_by/date | evidence_path | next_action | result_window | decision`

Use `AUS` for new matrix names; retain older `ATX`, `AY`, `AA`, `P1/P2` names as aliases. Do not rename live incumbents simply to make the taxonomy tidy. Formats and location derivatives are executions of a concept, not automatically new hypotheses. New campaign ad names become the exact `utm_content` values.

## 5. Priority matrix: the eight ABO slots

These are the September 21 execution-plan slots. New packages remain proposed.

| Priority | Exact slot | Angle / visible proof | Reuse versus production | Current workroom state / next step |
|---|---|---|---|---|
| First four | `DS_YOUTH_CONTROL_Y02` | Calm problem-solving, partner responsibility | Reuse live approved media/copy/placement structure | Source control exists; export current creative and audit permissions before paused clone |
| First four | `DS_YOUTH_CH01_PARTNER-RESET` | Tap, release, reset, coached partner practice | Script mechanisms from Kaiden, AY02, P2-B1/B2; real Youth footage required | BRIEF; select or film permissioned sequence |
| Later | `DS_ADULT_CH01_BEGINNER-COACHING` | First-class greeting and clear correction | Reuse adult shoot grammar, not an Austin-labelled export | SOURCE; localize DS, verify adult destination |
| Later | `DS_ADULT_CH02_USEFUL-WORKOUT` | Useful technical skill + shared practice | National-sweep motivation only; new Joao footage/copy | SOURCE; avoid fitness guarantees or invented community outcomes |
| First four | `AUS_CONTROL_AY09A_LONG-VIDEO` | Complete beginners welcome, Adults + Youth | Current live placement-paired video/copy, not an older local creative ID | Source control exists; read back current creative and native placement previews |
| First four | `AUS_ADULT_CH01_BEGINNER-COACHING` | Adult-only first-class walkthrough | AA02 script architecture; new or audited real adult teaching sequence | BRIEF; permissioned footage and adult-specific edit needed |
| Later | `AUS_YOUTH_CH01_BELONGING` | Clear way into a group for beginners | AY07 revised artwork is a reusable candidate, not release-cleared by default | Existing historical package; verify rights/current copy and create localized paired asset if needed |
| Later | `AUS_YOUTH_CH02_CALM-PROBLEM-SOLVING` | Coach cue, correction, second attempt | Y02 mechanism + AY04/P2-A2 | SOURCE; use Austin-labelled copy, no false claim that DS footage is Castle Hill footage |

## 6. Existing concept registry and alias map

This consolidates the requested source bank and related local execution packages. It is not a live census of every ad in the account. Repeated ideas below are mapped together rather than treated as unrelated launches.

### A. Austin original Youth and Adult concepts

Source: `assets/ads-podcast/03-austin-castle-hill-launch.md` in the Austin campaign worktree. All exact copy remains there; do not blindly upload old future-tense/date/schedule text.

| Source ID | Concept / format | Workroom mapping | Actual reusable status |
|---|---|---|---|
| AY01 | Tap Means Stop, static | Boundary mechanism, later Youth rotation | Facility-safe square/vertical exports and historical ad exist; not a real partner-practice photo |
| AY02 | Tap Reset Try Again, video | DS Partner Reset after age/location adaptation | Script/shot plan exists; finished permissioned mechanism video not established here |
| AY03 | Confidence Is Practiced, static | Confidence-through-practice rotation | Facility-safe exports and historical ad exist |
| AY04 | Miss Reset Solve, video | Austin Calm Problem-Solving / P2-A2 | Script/shot plan; sequence must show real correction and retry |
| AY05 | Castle Hill Youth, static | Location and after-school fit / P2-C2 | Facility-safe exports and historical ad; remove stale “coming” language in a separately approved version |
| AY06 | After-School Start, video | Location/fit / P2-C2 | Script/shot plan; venue footage and exact schedule gated |
| AA01 | Beginner Starts Here, static | Adult beginner reassurance | Facility-safe exports and historical ad; possible fallback, not proof of real coaching |
| AA02 | First Class Without Ego, video | Austin Adult Beginner Coaching | Script/shot plan reused for first challenger |
| AA03 | Calm Under Pressure, static | Adult technical practice rotation | Facility-safe exports and historical ad; no off-mat calm guarantee |
| AA04 | Slow Down Reset, video | Adult coach-cue iteration | Script/shot plan; observable single technical correction |
| AA05 | Group or Private, static | Adult practical-fit rotation | Facility-safe exports and historical ad; do not inherit injury-related personalization |
| AA06 | Austin Schedule Fit, video | Adult group/private route | Script/shot plan; no instant-booking claim |

### B. Later Austin executions

Source worktree: `/home/d1360/joao-austin-youth-ay07-ay08/`, primarily `assets/meta/castle-hill/youth-wave-2/` and `comparisons/`.

| Source ID | Concept | Evidence / reuse rule |
|---|---|---|
| AY07 | Original “Youth 8–12 on purpose,” revised to beginner belonging | Source ad `120251261010900072`; historical revised creative `1687998043330822`. Prefer revised concept: “THERE'S ROOM / TO BE A BEGINNER.” Real four-girl group photo is evidence of warmth, not proof of instant friendship or a Castle Hill class. Paid-media releases still required. |
| AY08 | Real Practice static | Source ad `120251261015960072`; historical creative `1094650096414688`. Square/vertical assets exist. Supplied Youth group photo does not demonstrate a technical correction. Match copy to what it shows. |
| AY09 | Original short Joao video | Source ad `120251261045730072`; historical creative `1107882611663240`. Source-boundary evidence says its cut ended mid-thought after “meet.” Preserve history, do not select it as the replacement control. |
| AY09A | Longer beginner-welcome video, later Adults + Youth artwork | Source ad `120251263139970072`. Local comparisons preserve 26.866-second 4:5 and 9:16 exports. Handoff current creative is `1571675311324124`; older local IDs are not current proof. First-wave control. |
| AY09B | Beginner-welcome static, Adults + Youth | Source ad `120251263002380072`. Local selected adult group source and square/vertical exports exist. Historical creative IDs vary by revision; re-fetch before reuse. Adult group is not Youth, beginner teaching or Castle Hill location evidence. |

AY07 research adds four single-angle variants: **earned progress**, **belonging/connection**, **reset after frustration**, **boundaries under pressure**. Keep these in rotation. Use a coaching sequence for progress/reset, partner introductions for connection, and tap/release for boundaries. Do not publish the fear-leaning “hard moments when you are not there” line without a fresh claim review. Prefer direct observable practice.

### C. AI-guide framework: all twelve master concepts

Source: [Kids AI-Spokesperson Framework](KIDS-AI-SPOKESPERSON-AD-FRAMEWORK-2026-09-15.md). All are concepts, not generated assets. Six younger-child masters are DS-only; six Youth masters can be localized separately for DS and Austin. AI is an optional narrator treatment, not a distinct learning claim.

| ID | Master hook | Market / program | Consolidation |
|---|---|---|---|
| P1-A1 | Confidence Does Not Come First | DS ages 5–7 | Younger-child rotation, small first win |
| P1-A2 | The First Class Is Not a Test | DS ages 5–7 | Younger-child beginner reassurance |
| P1-B1 | The First Lesson Is Not Winning | DS ages 5–7 | Kaiden/Tap mechanism, not Youth+Adults ABO |
| P1-B2 | Two Sides of a Boundary | DS ages 5–7 | Communicate stop and respond to stop |
| P1-C1 | A 45-Minute Class Should Not Feel Like a Lecture | DS ages 5–7 | Short cues and purposeful practice |
| P1-C2 | Every Game Has a Job | DS ages 5–7 | Game-to-observable-practice explanation |
| P2-A1 | Confidence Is Not a Pep Talk | DS/Austin ages 8–12 | AY03, real coaching proof |
| P2-A2 | Miss, Reset, Solve | DS/Austin ages 8–12 | AY04 and Austin Calm Problem-Solving |
| P2-B1 | Body Control Starts With a Stop Signal | DS/Austin ages 8–12 | Partner Reset mechanism |
| P2-B2 | The Partner Matters Too | DS/Austin ages 8–12 | Partner responsibility and reset |
| P2-C1 | More Than Burning Energy | DS/Austin ages 8–12 | Technical problem-solving, not guaranteed behavior change |
| P2-C2 | A Clear After-School Starting Point | DS/Austin ages 8–12 | AY05/AY06 local fit and callback |

Reuse scripts and hook architecture without committing to synthetic production. Adults only as synthetic guides. No AI children, fabricated parents/testimonials or first-person enrollment stories. No Joao/parent/student voice cloning without specific permission. Real permissioned footage must carry the teaching proof. Model costs, likeness/voice rights, disclosure and current platform policy all need separate approval before any generation.

The old framework's sequential markets and 3–5 concepts per market are superseded for this first wave by the later two-ad-set ABO plan. Its ages 5–7 content remains valid inventory for a separately approved DS lane. Do not insert it into the Youth+Adults shell merely because its scripts are ready.

### D. Kaiden and related source-story bank

Source: `assets/ads-podcast/01-kaiden-tap-story.md` in the review worktree.

| Source angle | Reusable mechanism | Placement in this system |
|---|---|---|
| A: The sentence that changed the conversation | Diego's account of learning why Kaiden wanted to stop, then explaining tapping | DS Little Champions parent-story/podcast lane; not an invented spokesperson testimonial |
| B: Tap means stop | Tap, immediate release, reset | Mechanism can inform Youth Partner Reset without appropriating Kaiden's age/story |
| C: Start early, teach safely | Family early-skills philosophy | DS age-3 lane only; omit unverified “most schools start at 4” comparison |
| D: No perfect kid required | Participation need not start with confidence | Beginner reassurance, careful language rather than guaranteed transformation |

Existing written derivatives: 60-second podcast cut, 30-second parent-story ad and 15-second hook cut. These are scripts, not evidence that a recording exists. Preserve Diego's firsthand attribution. Confirm family permission for Kaiden's name, image, voice and identifiable story. Never recreate distress, painful partner practice or a fake before/after. The story's old trial-offer hold is superseded by the later callback/free-visit decision, not by a new paid offer.

Adjacent backlog, not first-wave ads: private-coaching calendar-fit/individualized-feedback story (`02-private-coaching-grown-men.md`), story-led landing-page comparisons, parent-practice and swimming/BJJ advertorials, six-week challenge and physical postcard work. These are different offers/funnels. Do not import their prices, guarantees, identities or destinations into this campaign. Private-story name/age/occupation and lineage anecdotes remain permission/fact gated.

### E. DS historical controls and broad kids lane

- Y02 is the exact Youth control above. Y03 is the specified future pause candidate, not an approved replacement.
- The established kids source bank includes Tap Means Stop, practiced confidence, Start at 3 and Program Fit. They route to the kids-first-class child finder, not the Austin adult path.
- The separate Age-3 incumbent remains outside the combined campaign. Its historical dominance of DS spend is not evidence that the same angle transfers to Youth 8–12 or Austin.
- Do not invent IDs for DS concepts not present in the supplied/live handoff. Capture exact ad/creative IDs in the later account inventory if they become selected.

## 7. Exact first-four production cards

### 01. DS control: `DS_YOUTH_CONTROL_Y02`

- **Target ad set:** `120251542146170072`.
- **Source:** ad `120251283184710072`, creative `1614797546902344` from direct Meta readback.
- **Hypothesis role:** preserve the incumbent baseline, not a new hypothesis.
- **Exact current primary text:** “What happens when a child gets stuck?\n\nIn Youth BJJ, ages 8–12 practice staying present, listening to instruction, and working through physical problems one step at a time.\n\nAt Joao Crus BJJ, tapping, resetting, partner responsibility, and controlled practice are part of learning from the beginning.\n\nFind the right starting point for your child. Joao will personally call to recommend the appropriate class and arrange a free studio visit.”
- **Exact current headline:** `Practice Staying Calm Under Pressure`.
- **Exact current description:** `Safe, coached practice`.
- **Exact current CTA:** `SEE_DETAILS`.
- **Control rule:** preserve the exact current body, headline, description, CTA and media for the faithful control. Do not substitute newly written copy and call it unchanged.
- **Media:** preserve current approved source assets, identity, placement rules and opt-outs. Verify actual dimensions and all placement previews.
- **Destination:** `https://joaocrusbjj.com/kids-first-class/`.
- **Required work:** retrieve source payload and asset references, verify releases/facts, approve campaign-specific tracking, then later create one paused clone. New ad/creative IDs remain blank until actual creation/readback.

### 02. DS challenger: `DS_YOUTH_CH01_PARTNER-RESET`

**PROPOSED exact copy, subject to Joao/Diego approval:**

- **Primary text:** Dripping Springs Youth BJJ, ages 8–12. Tap. Stop. Reset. Practice responding to a partner and trying again with a coach. Complete the class finder and Joao will personally call to help plan a free studio visit. Your child can watch or participate.
- **Headline:** Tap. Stop. Reset.
- **Description:** Youth BJJ in Dripping Springs
- **CTA:** `LEARN_MORE`.
- **Destination:** `https://joaocrusbjj.com/kids-first-class/`.
- **Opening frame:** `DRIPPING SPRINGS · YOUTH AGES 8–12` plus `TAP. STOP. RESET.`

**Proposed 18–22-second edit:**

| Time | Picture | Voice / captions |
|---|---|---|
| 0–3s | Real controlled tap and immediate release, coach in context | “Tap means stop.” |
| 3–9s | Show both partners resetting, no painful submission | “Youth students practice responding to a partner's signal and resetting with a coach.” |
| 9–14s | One coach cue and another slow repetition | “Then they try the next step together.” |
| 14–22s | Clear local end card, calm scene | “Explore Youth BJJ for ages 8–12 in Dripping Springs. Complete the finder. Joao personally calls.” |

Deliver 1080×1080 feed and 1080×1920 vertical exports, captioned and sound-off legible. Adjust pacing after a real read rather than speeding through the callback. If existing footage cannot show an immediate stop and coached reset clearly, film it with releases or hold the concept. A group photograph does not prove this sequence. Keep the offer, destination and audience aligned with Y02; acknowledge video versus static is a creative-package difference, not a pure isolated hook test.

### 03. Austin control: `AUS_CONTROL_AY09A_LONG-VIDEO`

- **Target ad set:** `120251542146660072`.
- **Source:** ad `120251263139970072`, current creative `1571675311324124` from direct Meta readback.
- **Role:** mixed Adults + Youth incumbent. Do not relabel its historical leads as adult leads without CRM evidence.
- **Exact current primary text:** “You or your child do not have to feel ready before starting.\n\nIn Youth BJJ at Castle Hill Fitness, ages 8–12 build confidence through coached practice, respectful partner work, and real progress.\n\nFor adults, private BJJ instruction at Castle Hill Fitness offers focused coaching, practical problem-solving, and progress at your own pace.\n\nComplete beginners are welcome.\n\nFind the right starting point in Austin.”
- **Exact current headline:** `You Don’t Have to Feel Ready`.
- **Exact current description:** `Adults + Youth Ages 8–12 in Austin.`
- **Exact current CTA:** `LEARN_MORE`.
- **Copy/media:** clone the current exact body/headline/description, complete spoken thought, audience footer, identity and placement assignment. Local comparison copy is recovery evidence, not permission to replace the current version.
- **Destination:** `https://joaocrusbjj.com/castle-hill-grand-opening/`.
- **Format conflict:** local historical control uses 4:5 feed + 9:16 video. The ABO plan asks for 1:1 + 9:16. Preserve the incumbent's actual live feed mapping for a faithful control, or approve a separately named square derivative. Do not silently crop the control and claim no creative change.
- **Required work:** current API payload/export, source-media and transcript comparison, venue/video rights, opening-date page audit and paused-clone tracking approval.

### 04. Austin challenger: `AUS_ADULT_CH01_BEGINNER-COACHING`

**PROPOSED exact copy, subject to Joao/Diego approval:**

- **Primary text:** Adult BJJ inside Castle Hill Fitness. A first class is a starting point, not an audition. Learn a position, ask a question, and practice the next step with a coach. Use the finder and Joao will personally call to discuss a group or private starting point.
- **Headline:** A Clear First Step in Adult BJJ
- **Description:** Inside Castle Hill Fitness
- **CTA:** `LEARN_MORE`.
- **Destination:** `https://joaocrusbjj.com/castle-hill-grand-opening/`.
- **Opening frame:** `CENTRAL AUSTIN · ADULT BJJ` plus `A FIRST CLASS IS A STARTING POINT.`

**Proposed 18–22-second edit:**

| Time | Picture | Voice / captions |
|---|---|---|
| 0–3s | Joao greeting an adult or real beginner instruction | “A first class is a starting point, not an audition.” |
| 3–10s | One position explained, slow drill, clear feedback | “Learn a position. Ask a question. Practice the next step with a coach.” |
| 10–15s | Respectful partner reset or approved private correction | “Explore adult BJJ inside Castle Hill Fitness.” |
| 15–22s | Adult-only location/CTA end card | “Use the finder. Joao personally calls to discuss your starting point.” |

Deliver 1080×1080 and 1080×1920 versions. Show real adult coaching, not an AI-derived scene or a posed black-belt group relabeled as beginners. If filming at DS, do not imply the room is Castle Hill; label academy teaching footage when needed and use only an approved venue identifier. Use current schedule on an end card only after reconfirmation. Keep the combined destination and offer fixed against AY09A. This is a dedicated-adult package comparison against a mixed incumbent, not a clean causal test of one sentence.

**Fallback if filming/rights are blocked:** prepare AA01's existing facility-safe static for a separate approval. It can test adult beginner messaging but cannot be labeled the real-coaching challenger. Do not auto-substitute it into the selected four.

## 8. Asset reuse and production checklist

| Evidence location | What can be reused | What it does not establish |
|---|---|---|
| Current control creatives in Meta | Existing media, copy, IDs, identity, placement rules and comparison baseline | New-campaign rights, current landing-page truth or qualified outcomes |
| `assets/meta/castle-hill/safe-wave-1/` in this worktree | Six concept pairs, 12 exported images, approved-copy JSON, manifests and saved audit | Real class proof, assigned-room truth, current effective status, blanket venue permission |
| `/home/d1360/joao-austin-youth-ay07-ay08/assets/meta/castle-hill/youth-wave-2/` | AY07/AY08 paired PNGs, source/manifest/audit trail | Student release clearance or current live creative identity |
| Same folder, `comparisons/` | Revised AY07; AY09B `*-adults-youth.png`; AY09A `*_4x5-adults-youth.mp4` and `*_9x16-adults-youth.mp4`; caption timing and approved-copy records | Current control byte-equivalence, new 1:1 video or paid rights merely from public/Drive availability |
| Podcast/source concepts and AI framework | Hooks, scripts, interview questions, shot requirements, message-match logic | Finished footage, an approved synthetic narrator or testimonial permission |

The original #114 Castle Hill image pack remains a blocked comparison, not an automatic asset source. Keep it and all prior versions intact.

### One capture session, separate outputs

1. **DS Youth:** coach cue, clear tap/release, reset, another repetition, optional partner introduction. Obtain guardian releases and record actual program/venue.
2. **Adults:** greeting, question, slow technical explanation, partner drill, correction, optional private coaching. Obtain participant and coach paid-media permission.
3. **Joao:** short location-specific invitation and honest callback explanation. Film separate DS and Austin lines; do not assume one audio ending works for both.
4. **Editor:** produce captioned masters and placement-specific exports; do not depend on Meta automatic cropping. Check first/middle/last frames and the complete final spoken sentence.
5. **Reviewer:** no painful/aggressive footage, body diagnosis, shame, invented improvement, misleading scene labels or text over faces. Native Feed/Stories/Reels previews must remain readable with UI overlays.

Use the Campaign Group brand palette and typography consistently. Real media carries the evidence. For each export, save source filename, hash, dimensions, duration if video, caption transcript, version and release reference. A contact sheet is a review artifact, not an upload asset. Technical checks should be followed by visual/audio review.

## 9. Tracking and later paused-upload workflow

### Proposed common tracking contract

Base URL is the audience-matched destination above. Proposed dedicated URL-parameters field:

```text
utm_source=meta&utm_medium=paid_social&utm_campaign=prospecting_youth_adults_ds_austin_abo_w1_202609&utm_content={{ad.name}}&utm_term={{adset.name}}&utm_id={{campaign.id}}
```

This campaign slug is proposed, not a current live value. Preserve macros exactly. Use one canonical parameter representation with no duplicate/conflicting keys, no unsupported `utm_creative` and no manually appended `fbclid`. Legacy AY09 audits stored the parameters in `website_url` with `url_tags` absent. Moving to the dedicated field is a deliberate migration change: remove stale query keys from the new clone's base link, then verify the assembled landing URL. Do not edit the old control merely to normalize tracking.

### Step-by-step handoff, not executed here

| Step | Owner | Acceptance evidence |
|---|---|---|
| Select the four and approve wording/format exception | Diego + Joao | Dated approval, current capacity, source-control copy frozen |
| Clear media/venue/participant rights | Joao + Diego | Specific paid-media scope for each selected source and derivative |
| Produce two challengers and audit two controls | Editor | Final paired exports, transcript, manifests and reviewed placement previews |
| Audit actual destinations and callback flow | Web/CRM operator | Mobile CTA routing, correct child/adult branch, form acceptance and no stale date promises |
| Authorize paused upload separately | Diego | Exact four names, two ad-set IDs, budgets unchanged, no activation |
| Read source and parent objects before changes | Ads operator | Dated snapshot of budgets, targeting, attribution, source copy, media and identity |
| Create/reuse creatives safely and create new paused ads | Ads operator | Resume-safe creation log, exact new IDs, explicit `PAUSED`, no duplicate creations |
| Read back each exact target | Ads operator | Copy, source assets, identity, placement rules, URL parameters and opt-outs match |
| Wait for asynchronous processing via reads | Ads operator | Configured/effective `PAUSED/PAUSED`; processing/review is not final paused acceptance |
| Deliver final preflight | Diego review | Four verified ads, destination proof, permission evidence, tracking receipts, approved cutover list |

Historical Page `977808342257807` and Instagram `17841402345785819` appear in the saved Austin audit. Reverify live source identities before copying. Do not assume permissions or billing from those IDs.

Explicitly disable automatic creative enhancements, generated media, translations, automatic cropping and site/Instant Form extensions. Historical audits returned 83 opt-outs; compare the current available feature set and current source controls, not only a magic count. Do not send deprecated umbrella fields or fall back to uncontrolled defaults if the API rejects a setting.

Before later cutover: capture Y03/Y02/AY09A and old parent performance; execute only the specifically approved pause actions; verify clones first; then execute an approved old/new transition with no unintended overlap. Keep rollback IDs and snapshots. No existing ad or parent should be mutated merely because this working brief exists.

## 10. Testing and business-outcome review

The September 21 plan reserves 20% for testing: DS $2.40/day and Austin $3.60/day, leaving $9.60 and $14.40 for the respective control/optimization lanes. Total test reserve is $6/day, at most $84 across a 14-day window.

**Critical implementation gate:** putting two ads into one ABO ad set does not enforce an 80/20 per-ad split. Confirm Meta Creative Test availability and its actual budget treatment before launch. If unavailable or unable to honor the approved cap, obtain approval for a controlled alternative. Do not invent ad-level budgets, add four simultaneous competitors, or silently increase spend.

Recommended sequence:

1. DS Y02 versus Partner Reset, and Austin AY09A versus dedicated adult beginner package, subject to enforceable allocation.
2. DS adult concepts after adult routing and local media are ready.
3. Austin Youth belonging versus calm/problem-solving after releases and sufficient budget/evidence.
4. Within a promising concept, test a single hook while holding spokesperson, body, offer, destination, format and geography fixed.

The first-wave pairs differ in more than one element. Treat them as operational creative-package comparisons, not clean isolated-variable causal A/B tests. Keep location results separate and segment Austin mixed-control leads by actual child/adult quiz branch. Unequal delivery is not proof that an underdelivered concept failed.

### Review gates

- Check technical breakage immediately. Pause/reject broken ads only under the operator's authorized scope; do not wait for an impression quota to address wrong destinations or unsafe claims.
- Otherwise use the plan's minimum 1,000 impressions per tested creative for diagnostic review. Examine outbound CTR, landing-page-view rate/cost, frequency and video retention.
- A low-budget test may not produce enough leads in 7–14 days. No winner from one lead. Expected-CPL spend benchmarks and an agreed stop-loss must be written before testing; the two incumbent results are sparse, not universal thresholds.
- Graduate by qualified conversations, trial bookings, attendance, enrollment and qualified/enrolled CAC. Agree acceptable acquisition economics before scale; do not import temporary CRM opportunity value as verified revenue.

### Report template

`window | market | ad ID/name | program branch | spend | impressions | outbound clicks | landing-page views | accepted leads | qualified conversations | booked | attended | enrolled | cost/qualified | cost/enrolled | consent exclusions | attribution caveat | decision`

Deduplicate CRM people/opportunities, exclude synthetic records and record the actual denominator. Do not label every submit or contact attempt a qualified lead.

### Lifecycle acceptance

| Actual stage | Meta feedback | GA4 feedback |
|---|---|---|
| Qualified Conversation | `QualifiedLead` | `qualify_lead` |
| Trial Booked | `Schedule` | `trial_booked` |
| Trial Attended | `TrialAttended` | `trial_attended` |
| Enrolled | `CompleteRegistration` | `close_convert_lead` |

`Contacted` is a CRM reporting stage, not a required optimization event. No `Purchase` without verified payment/value. A click is not `Schedule`. Endpoint existence, HTTP 405 on GET, an open/merged PR or outbound event transport does not establish downstream receipt. The September 21 plan requires a separately authorized synthetic lifecycle test, stable IDs/replay deduplication, Meta and GA4 destination receipt, consent-denied non-transmission and reporting exclusion before its final launch checklist is complete. Do not activate SMS or customer-message workflows as part of creative loading.

## 11. Conflict register and stop-ship decisions

| Conflict or risk | Resolution in this brief | Owner / gate |
|---|---|---|
| PR #123 described as open | Live GitHub says MERGED; local document only, no push | Repo owner chooses new delivery branch/PR later |
| Different decision-file versions across worktrees | Use specific dated entries, not the old global header. This worktree has Sep 6–9 Austin confirmations absent from some older branches | Diego confirms any subsequent change |
| Older skill says Austin adults interest-list only | Superseded by dated adult group confirmation: Tue/Thu 6–7 p.m.; private by appointment | Reconfirm capacity/schedule at launch |
| AI framework says sequential markets / 3–5 ads | Later combined ABO plan governs first-wave allocation; AI matrix is inventory | Diego |
| Younger-child AI concepts mixed into Youth+Adults | P1 stays DS Little Champions outside this first wave; no under-8 Austin ads | Creative reviewer |
| Historical AY09A creative IDs disagree | Current handoff ID `1571675311324124` is source of truth pending upload-time live readback | Ads operator |
| 1:1 requirement versus current 4:5 control | Preserve the actual control or approve a new square derivative explicitly | Diego + editor |
| Historical AY09 clipped sentence | Do not reuse the original short cut as control; audit full current audio ending | Editor |
| Public/Drive group images treated as permission | Provenance is not a paid release; children and adults each require clearance | Joao |
| AI adult coaching image previously mistaken for real | Reject `adults-joao-coaching-hero-2026-07.webp` as documentary proof; real black-belt group is only posed group evidence | Editor |
| Venue room photo implies assigned teaching space | Preserve facility-safe disclosure; no claim it is the actual class/assigned room without proof | Venue permission owner |
| Date-passed opening copy | Recheck all visible page and media claims; no traffic while unresolved | Joao + web operator |
| Legacy UTMs in URL versus new dedicated field | One canonical representation, new campaign attribution, exact readback and CRM proof | Ads/CRM operator |
| 20% allocation treated as ad-level setting | Confirm actual experiment controls or seek separate approved structure | Ads operator |
| Control label implies proven winner | Sparse historical leads only; reconcile qualified outcomes before graduation | Analyst + Joao |
| Older paid-trial/price/free-offer conflicts | Callback/free studio visit follows newer explicit decision; no added price/bonus/guarantee | Joao |

## 12. Approvals worksheet

- [ ] Diego selects the exact first four names above.
- [ ] Joao approves the two challenger copy cards and observable coaching claims.
- [ ] Joao confirms current program capacity and published schedules.
- [ ] Diego approves preservation of AY09A's actual live feed format, or orders a separately named derivative.
- [ ] Source-control copy/payload exports are attached; no invented control text.
- [ ] Each selected image/clip has provenance and a specific paid-media release reference.
- [ ] Castle Hill name/logo/facility use is covered for this proposed use.
- [ ] Two challenger asset pairs are produced and reviewed; no AI API use assumed.
- [ ] Destination, quiz branch, callback promise and opening-date truth pass current mobile QA.
- [ ] New campaign UTMs survive into HighLevel latest-touch fields and submission notes.
- [ ] Accepted website Lead browser/server deduplication and consent are verified.
- [ ] Lifecycle workflow/provider acceptance meets the execution plan's gate.
- [ ] Test allocation, stop-loss, review window and business-outcome criteria are approved.
- [ ] Separate permission to create paused ads is obtained.
- [ ] Exact new ads and both parents read back paused with correct creative/placement/opt-out state.
- [ ] Final activation and old-campaign cutover are separately approved. Until then, no spend.

## 13. Source index and provenance

Repository-local links resolve from this worktree where present. External worktree paths are intentional evidence locations, not files silently copied into this branch.

1. **Campaign framework and exact controls:** `/home/d1360/workspaces/JoaoCrusBJJ-review/research/meta-abo-execution-plan-2026-09-21.md`, plus direct Meta campaign, ad-set, ad and creative readbacks captured on 2026-09-23.
2. **Dated program/offer/permission decisions:** [CURRENT-DECISIONS.md](../CURRENT-DECISIONS.md), especially Sep 6–9 and kids paid-social sections. Compared with the review worktree's older decision file.
3. **AI guide inventory:** [KIDS-AI-SPOKESPERSON-AD-FRAMEWORK-2026-09-15.md](KIDS-AI-SPOKESPERSON-AD-FRAMEWORK-2026-09-15.md).
4. **Kaiden source:** `/home/d1360/workspaces/JoaoCrusBJJ-review/assets/ads-podcast/01-kaiden-tap-story.md`.
5. **Austin 12-concept source:** `/home/d1360/workspaces/JoaoCrusBJJ-austin-youth-campaign/assets/ads-podcast/03-austin-castle-hill-launch.md`.
6. **AY07 research and claim boundaries:** `/home/d1360/workspaces/JoaoCrusBJJ-review/docs/AY07-YOUTH-8-12-COPY-RESEARCH-2026-09-08.md`. Its CDC/AAP and martial-arts research motivates restrained practice language, not a BJJ outcome guarantee.
7. **Existing later Austin assets:** `/home/d1360/joao-austin-youth-ay07-ay08/assets/meta/castle-hill/youth-wave-2/README.md` and `comparisons/README.md`.
8. **Facility-safe assets:** [safe-wave-1](../assets/meta/castle-hill/safe-wave-1/README.md), manifests, approved-copy JSON and historical Meta audit. Saved pending-review states are historical, not current acceptance.
9. **National sweep:** `/home/d1360/workspaces/JoaoCrusBJJ-review/research/meta-ad-library-national-sweep-2026-09-21.md`. Borrow local identity, real class/group proof, beginner reassurance and a clear next step. Do not infer profit, continuous spend or Joao economics from ad longevity. Do not copy competitor free uniforms, unlimited passes, price points or urgency.
10. **Adjacent private-story backlog:** `/home/d1360/workspaces/JoaoCrusBJJ-meta-leadgen-wave1/assets/ads-podcast/02-private-coaching-grown-men.md`.

**Completion boundary:** this file consolidates strategy, source concepts, production instructions and release gates. It does not certify current media rights, production assets, full website behavior or lifecycle receipt. The campaign/ad-set state and two control payloads were read directly from Meta on 2026-09-23. No Meta changes, video-generation calls, production deployment or lead submission were performed while preparing it.
