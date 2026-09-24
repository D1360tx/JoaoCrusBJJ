<!-- markdownlint-disable MD013 -->

# Joao Meta Ads Creative Workroom

**As of:** 2026-09-24 (static-only scope update)
**Markets:** Dripping Springs and Austin / Castle Hill  
**Status:** Internal working brief. Copy and production recommendations require approval. No authorization to upload, change an existing ad, activate spend, deploy a page, or call video-generation APIs.  
**Outcome:** Finalize the first four ad packages, then separately authorize loading them as paused ads.

## 1. Start here

Build **two static controls plus two static challengers**. Video is deferred by the user's latest direction, not a first-wave dependency.

1. `DS_YOUTH_CONTROL_Y02`: exact existing single-image control, ad `120251283184710072`, creative `1614797546902344`. No new crop, copy or CTA.
2. `DS_YOUTH_CH01_TAP-STOP-RESET_STATIC`: new real Youth partner-practice photo with curriculum-led copy. Local 1:1 + 9:16 review exports now exist.
3. `AUS_CONTROL_AY09B_STATIC`: exact existing mixed Adults + Youth static, ad `120251263002380072`, creative `1567708678432946`.
4. `AUS_ADULT_CH01_AA01_STATIC`: existing adult beginner static, ad `120251260015570072`, creative `2077252959817026`.

This is a local production/review package, not upload or activation authorization. The historical campaign-shell read below is dated September 23, not a fresh status census. No Meta objects were changed. Keep Age-3 separate. AY09A, both filmed coaching concepts, all AI-guide video and all capture/edit work are deferred.

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

### Historical incumbent performance context, not the new static selection

| Slot | Existing source ad | Current source creative supplied | Through Sep 20 | Destination |
|---|---|---|---|---|
| DS Youth | `120251283184710072`, `Y02_CALM-PROBLEM-SOLVING_STATIC` | `1614797546902344` | $25.44 spend, 1 website lead | `/kids-first-class/` |
| Austin mixed | `120251263139970072`, `AY09A_BEGINNERS-WELCOME_LONG-VIDEO` | `1571675311324124` | $146.25 spend, 2 website leads, source reports $73.13 CPL | `/castle-hill-grand-opening/` |

The preceding Y02/AY09A table preserves the prior plan's historical context. AY09A is deferred and its results must not be attributed to AY09B. Selected static identities are in section 5. These are **incumbents, not statistically established winners**. The Austin ad is not a pure adult ad. Neither supplied result establishes qualified conversations, attended visits, enrollment or CAC. Do not compare the two locations' CPLs as a controlled experiment.

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

**Approved next-step model in the worktree's dated decisions:** complete the finder, Joao personally calls to discuss fit and arrange a free studio visit. The visitor or child may observe or participate. The finder does not instantly book a place. Use `LEARN_MORE` for new static creatives and the existing Austin pair; preserve Y02's exact `SEE_DETAILS` control CTA. Do not add a price, deposit, uniform bonus, unlimited trial, guarantee, urgency or scarcity without new confirmation.

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

## 5. Exact four-static matrix and creation readiness

| Slot | Source ad / creative | Exact media | Creation readiness |
|---|---|---|---|
| `DS_YOUTH_CONTROL_Y02` | `120251283184710072` / `1614797546902344` | Single-image hash `a1ed68821a64c8bd65985d4e7a9ab33e`; preserve incumbent, do not invent a placement pair | Existing source; faithful clone requires current full payload/opt-out read and separate approval |
| `DS_YOUTH_CH01_TAP-STOP-RESET_STATIC` | New local concept; no Meta IDs | [Square](../assets/meta/dripping-springs/static-wave-1/DS_YOUTH_CH01_TAP-STOP-RESET_STATIC_1x1.png) + [vertical](../assets/meta/dripping-springs/static-wave-1/DS_YOUTH_CH01_TAP-STOP-RESET_STATIC_9x16.png) | Produced and locally QAed; exact copy/curriculum approval and paid-media guardian releases remain gates |
| `AUS_CONTROL_AY09B_STATIC` | `120251263002380072` / `1567708678432946` | Feed `a35ae481c4a5fc565115ed45b80f476f`; vertical `1e0bbe2da0912a0c768aa97776824260` | Existing placement-paired source; adult participant rights and native previews still gated |
| `AUS_ADULT_CH01_AA01_STATIC` | `120251260015570072` / `2077252959817026` | Square `256015d83ed27def18afda5ce5396d94`; vertical `7a7a3626c696701abff058e55df660c5` | Existing paired exports/payload; venue use, current schedule, attribution and paused-clone approval still gated |

The three source creatives' copy, image hashes and placement structures were re-read on September 24 via read-only Meta calls. This does not verify ad status, permissions or downstream lead receipt. There are exactly four selected concepts, not four newly created Meta ads. [DS contact sheet](../assets/meta/dripping-springs/static-wave-1/contact-sheet.jpg), [manifest](../assets/meta/dripping-springs/static-wave-1/manifest.json), [render/validation script](../assets/meta/dripping-springs/static-wave-1/render.py).

All video concepts and the remaining four ABO library slots are later inventory. AA01 is now the selected adult static challenger, not a silent substitute for a filmed coaching sequence. AY09B replaces AY09A only in this production queue; do not mutate or pause AY09A based on this document.

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
| AA01 | Beginner Starts Here, static | Adult beginner reassurance | Facility-safe exports and historical ad; selected static challenger, not proof of real coaching |
| AA02 | First Class Without Ego, video | Austin Adult Beginner Coaching | Deferred script/shot plan; AA01 static selected instead |
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
| AY09A | Longer beginner-welcome video, later Adults + Youth artwork | Source ad `120251263139970072`. Local comparisons preserve 26.866-second 4:5 and 9:16 exports. Handoff current creative is `1571675311324124`; older local IDs are not current proof. Deferred video control; not selected for static wave. |
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
- **Media:** exact single-image hash `a1ed68821a64c8bd65985d4e7a9ab33e`, not a placement pair. Preserve source identity and opt-outs. Verify actual dimensions and native placement previews.
- **Exact source link and CTA value.link:** `https://joaocrusbjj.com/kids-first-class/?utm_source=meta&utm_medium=paid_social&utm_campaign=youth_8_12_wave1&utm_content=y02_calm_problem_solving&utm_term={{adset.name}}&utm_creative={{ad.name}}`. Preserve the incumbent; any new-campaign tracking migration is a separately approved change.
- **Destination:** `https://joaocrusbjj.com/kids-first-class/`.
- **Required work:** retrieve source payload and asset references, verify releases/facts, approve campaign-specific tracking, then later create one paused clone. New ad/creative IDs remain blank until actual creation/readback.

### 02. DS challenger: `DS_YOUTH_CH01_TAP-STOP-RESET_STATIC`

**PROPOSED copy, not approved:**

- **Primary text:** Dripping Springs Youth BJJ, ages 8-12. Practice tapping, stopping and resetting with a partner. Explore a free visit.
- **Headline:** Tap. Stop. Reset.
- **Description:** Youth BJJ in Dripping Springs
- **CTA:** `LEARN_MORE`.
- **Destination:** `https://joaocrusbjj.com/kids-first-class/`.
- **Artwork:** `DRIPPING SPRINGS | YOUTH 8-12`, `TAP. STOP. RESET.`, `WHAT STUDENTS PRACTICE`, `Practice the stop signal.`, `Respond to a partner. Try again.`, `EXPLORE YOUTH BJJ`.
- **Produced:** 1080×1080 and 1080×1920 PNGs in [static-wave-1](../assets/meta/dripping-springs/static-wave-1/README.md). Source `site/assets/campaign-images/kids-training.webp` and official `site/assets/joao-crus-bjj-logo.png`; no generated people, no alteration to the source scene, full photo aspect ratio retained.
- **Evidence boundary:** the frame shows Youth partner practice only, not a visible tap, immediate release or reset. The heading explicitly describes what students practice. Joao must approve the curriculum wording. It is not a sequence or proof of a guaranteed safety outcome.
- **Activation gate:** obtain a specific paid-media guardian release for each identifiable minor, with source and derivative scope. Website publication is provenance, not release proof. No upload is authorized here.
- **Technical QA:** manifest records source/output SHA-256, dimensions, measured text/photo/logo rectangles, conservative safe zones, zero element overlap, and character counts. Native placement previews are a later gate.

### 03. Austin control: `AUS_CONTROL_AY09B_STATIC`

- **Target ad set:** `120251542146660072`.
- **Source:** ad `120251263002380072`, creative `1567708678432946`.
- **Exact current primary text:** “You or your child do not have to feel ready before starting.\n\nIn Youth BJJ at Castle Hill Fitness, ages 8–12 build confidence through coached practice, respectful partner work, and real progress.\n\nFor adults, private BJJ instruction at Castle Hill Fitness offers focused coaching, practical problem-solving, and progress at your own pace.\n\nComplete beginners are welcome.\n\nFind the right starting point in Austin.”
- **Exact headline:** `You Don’t Have to Feel Ready`.
- **Exact description:** `Adults + Youth Ages 8–12 in Austin.`
- **CTA:** `LEARN_MORE`.
- **Destination:** `https://joaocrusbjj.com/castle-hill-grand-opening/`.
- **Identity:** Page `977808342257807`, Instagram `17841402345785819`.
- **Mapping:** `PLACEMENT`, `SINGLE_IMAGE`; `vertical` priority 1 for Facebook story/facebook_reels and Instagram story/reels; `feed` priority 2 default. Preserve both exact hashes in the matrix.
- **Current dedicated URL parameters:** `utm_source=meta&utm_medium=paid_social&utm_campaign=austin_castle_hill_launch_v1&utm_content={{ad.name}}&utm_term={{adset.name}}&utm_id={{campaign.id}}`.
- **Local recovery assets:** `/home/d1360/joao-austin-youth-ay07-ay08/assets/meta/castle-hill/youth-wave-2/comparisons/AY09B_BEGINNERS-WELCOME_STATIC_{1x1,9x16}-adults-youth.png`. Preserve originals; use exact Meta hashes as source identity, not an assumed equivalence from filename.
- **Boundary:** posed adult group is not Youth, beginner coaching or Castle Hill class evidence. Paid participant permission remains an activation gate. AY09A's historical spend/leads do not transfer to AY09B.

### 04. Austin challenger: `AUS_ADULT_CH01_AA01_STATIC`

- **Source:** ad `120251260015570072`, creative `2077252959817026`.
- **Exact current primary text:** You do not need to get in shape before starting jiu-jitsu. You need a place where beginner questions are expected and the first step is clear. Adult group classes meet Tue/Thu from 6:00–7:00 p.m. inside Castle Hill Fitness.
- **Exact headline:** `New to Jiu-Jitsu? Start Here.`
- **Exact description:** `Beginner-friendly adult BJJ in Austin`.
- **CTA:** `LEARN_MORE`.
- **Identity:** Page `977808342257807`, Instagram `17841402345785819`.
- **Existing square:** [AA01 1x1](../assets/meta/castle-hill/safe-wave-1/images/1x1/AA01_BEGINNER-STARTS-HERE_STATIC_1x1.png).
- **Existing vertical:** [AA01 9x16](../assets/meta/castle-hill/safe-wave-1/images/9x16/AA01_BEGINNER-STARTS-HERE_STATIC_9x16.png).
- **Mapping:** `PLACEMENT`, `SINGLE_IMAGE`; `vertical` priority 1 for Facebook story/facebook_reels and Instagram story/reels; `square` priority 2 default. Preserve matrix hashes.
- **Exact current website URL:** `https://joaocrusbjj.com/castle-hill-grand-opening/?utm_source=meta&utm_medium=paid_social&utm_campaign=austin_castle_hill_launch_v1&utm_content=AA01_BEGINNER-STARTS-HERE_STATIC&utm_term={{adset.name}}&utm_id={{campaign.id}}`. No dedicated `url_tags` returned in this read.
- **Boundary:** facility plus official logo, not real coaching evidence or proof of an assigned class room. Reconfirm schedule and venue permission. New-campaign tracking normalization requires explicit approval, not edits to this incumbent.

### Copy-limit review

The new DS copy is 117 primary-text, 17 headline and 29 description characters, within the 125/40/30 review recommendations. Exact incumbent text remains unchanged even when exceeding those recommendations: long bodies may truncate; AY09B and AA01 descriptions exceed 30. These are recommendation exceptions, not evidence of API rejection. All four public copy cards must remain free of em dashes. Do not shorten a control and label it unchanged.

### Deferred video inventory

AY09A long video, DS Partner Reset filmed tap/release sequence, AA02-based adult coaching walkthrough, and synthetic-guide concepts are **deferred, not first-wave deliverables**. Preserve source scripts and existing media. Any later filmed mechanism requires a real clear tap, immediate release and reset; a still photograph cannot substitute as sequence proof. No filming, editing, generated video, voice API or video upload is required for this static package.

## 8. Asset reuse and production checklist

| Evidence location | What can be reused | What it does not establish |
|---|---|---|
| Current control creatives in Meta | Existing media, copy, IDs, identity, placement rules and comparison baseline | New-campaign rights, current landing-page truth or qualified outcomes |
| `assets/meta/castle-hill/safe-wave-1/` in this worktree | Six concept pairs, 12 exported images, approved-copy JSON, manifests and saved audit | Real class proof, assigned-room truth, current effective status, blanket venue permission |
| `/home/d1360/joao-austin-youth-ay07-ay08/assets/meta/castle-hill/youth-wave-2/` | AY07/AY08 paired PNGs, source/manifest/audit trail | Student release clearance or current live creative identity |
| Same folder, `comparisons/` | Revised AY07; AY09B `*-adults-youth.png`; AY09A `*_4x5-adults-youth.mp4` and `*_9x16-adults-youth.mp4`; caption timing and approved-copy records | Current control byte-equivalence, new 1:1 video or paid rights merely from public/Drive availability |
| Podcast/source concepts and AI framework | Hooks, scripts, interview questions, shot requirements, message-match logic | Finished footage, an approved synthetic narrator or testimonial permission |

The original #114 Castle Hill image pack remains a blocked comparison, not an automatic asset source. Keep it and all prior versions intact.

### Deferred video capture session, not first-wave work

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

This campaign slug is proposed, not a current live value. Preserve macros exactly. Use one canonical parameter representation with no duplicate/conflicting keys, no unsupported `utm_creative` and no manually appended `fbclid`. Historical AY09 audits stored parameters in `website_url`; current AY09B has dedicated `url_tags`, while current AA01 still has query parameters in `website_url`. Moving to the dedicated field is a deliberate migration change: remove stale query keys from the new clone's base link, then verify the assembled landing URL. Do not edit the old control merely to normalize tracking.

### Step-by-step handoff, not executed here

| Step | Owner | Acceptance evidence |
|---|---|---|
| Approve the four-static matrix and proposed DS wording | Diego + Joao | Dated approval, current capacity, source-control copy frozen |
| Clear media/venue/participant rights | Joao + Diego | Specific paid-media scope for each selected source and derivative |
| Review new DS pair and audit three existing statics | Editor | Exact media hashes, manifests and reviewed placement previews |
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

1. DS Y02 versus Tap/Stop/Reset static, and Austin AY09B versus AA01 adult static, subject to enforceable allocation.
2. DS adult concepts after adult routing and local media are ready.
3. Austin Youth belonging versus calm/problem-solving after releases and sufficient budget/evidence.
4. Within a promising concept, test a single hook while holding spokesperson, body, offer, destination, format and geography fixed.

The first-wave pairs differ in more than one element. Treat them as operational creative-package comparisons, not clean isolated-variable causal A/B tests. Keep location results separate and segment Austin mixed-control leads by actual child/adult quiz branch. Unequal delivery is not proof that an underdelivered concept failed.

### Review gates

- Check technical breakage immediately. Pause/reject broken ads only under the operator's authorized scope; do not wait for an impression quota to address wrong destinations or unsafe claims.
- Otherwise use the plan's minimum 1,000 impressions per tested creative for diagnostic review. Examine outbound CTR, landing-page-view rate/cost, frequency; video retention is deferred.
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
| Deferred AY09A 4:5 video format conflict | Not a static-wave dependency; preserve historical video untouched | Diego + editor |
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
- [ ] Joao approves DS curriculum copy and AA01 reuse; no still is described as coaching-sequence proof.
- [ ] Joao confirms current program capacity and published schedules.
- [ ] Preserve Y02 single-image and AY09B/AA01 exact paired mappings. No video format exception is needed.
- [ ] Source-control copy/payload exports are attached; no invented control text.
- [ ] Each selected image/clip has provenance and a specific paid-media release reference.
- [ ] Castle Hill name/logo/facility use is covered for this proposed use.
- [x] New DS static pair and contact sheet produced with deterministic local QA.
- [ ] Diego/Joao visually approve DS pair and review the three existing static sources; no AI API use assumed.
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

**Completion boundary:** the static-only local package includes a produced DS pair, contact sheet, deterministic renderer and manifest. Existing static copy/media identities were read on September 24; campaign/ad-set state and performance above remain September 23/historical evidence. Media releases, copy approval, native previews, destination/tracking acceptance, upload and activation remain separate gates. No Meta mutation, video generation, deployment or lead submission occurred.
