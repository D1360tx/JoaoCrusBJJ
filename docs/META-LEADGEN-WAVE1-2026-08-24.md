# Meta Lead Generation Wave 1

<!-- markdownlint-disable MD013 MD034 -->

**Status:** Build-ready draft  
**Date:** 2026-08-24  
**Budget:** $35/day  
**Primary outcome:** Qualified kids-program leads in HighLevel  
**Destination:** `https://joaocrusbjj.com/practice-under-pressure/`

## Decision

Launch **kids first**, not four categories at once.

At $35/day, separate Adults, Private Coaching, Kids, and Jiu-Jitsu After 60 ad sets would fragment spend and slow learning. Kids has the strongest current differentiator, the most developed proof and creative assets, and a clear program ladder from age 3 through teens. Adults, Private Coaching, and After 60 remain sequential test waves after Wave 1 establishes a lead-cost and lead-quality baseline.

## Why this structure fits Andromeda

Meta describes Andromeda as the first-stage personalized ads retrieval engine. It reduces tens of millions of eligible ads to a few thousand candidates before later ranking stages. Meta also states that Advantage+ expands eligible ads through automated audience creation, budget allocation, placements, and creative generation. Its official August 2026 performance spotlight says that when Advantage+ and AI handle delivery, targeting, and placements, the advertiser's biggest input is a continuing supply of creative, while tests need enough time to breathe.

Applied here:

1. **Consolidate the $35/day budget** into one campaign and one Dripping Springs ad set.
2. Use **four genuinely different concepts**, not many cosmetic variations.
3. Keep audience controls broad enough for Meta to learn inside the service area.
4. Use Advantage+ placements with placement-specific 1:1 and 9:16 assets.
5. Optimize for the actual website `Lead` event, not clicks or landing-page views.
6. Do not split Adults, Private Coaching, Kids, and After 60 until the budget can support a clean sequential test.
7. Let the first wave run long enough to collect meaningful lead and quality data unless a hard failure appears.

### Sources

- Meta Engineering, **“Meta Andromeda: Supercharging Advantage+ automation with the next-gen personalized ads retrieval engine,”** 2024-12-02: https://engineering.fb.com/2024/12/02/production-engineering/meta-andromeda-advantage-automation-next-gen-personalized-ads-retrieval-engine/
- Meta for Business, **“Performance Spotlight: How Laura Geller Turned Creative Volume and AI Into a Competitive Edge,”** 2026-08-13: https://www.facebook.com/business/news/laura-geller-creative-volume
- Current industry discussion was reviewed as directional evidence only. It consistently favors creative diversity, broad targeting, and consolidated structures, but unverified rules of thumb were not treated as Meta policy.

## Campaign architecture

### Campaign

- **Name:** `META_LEADS_KIDS_PROGRAM-FINDER_2026-08_W1`
- **Objective:** Leads
- **Conversion location:** Website
- **Budget:** Advantage campaign budget, `$35.00/day`
- **Bid strategy:** Highest volume / lowest cost
- **Buying type:** Auction
- **Special Ad Category:** None
- **Status:** Draft / paused until final review

### Ad set

- **Name:** `DRIPPING-SPRINGS_BROAD_24-54_KIDS_W1`
- **Dataset / Pixel:** `592714768141415`
- **Conversion event:** `Lead`
- **Performance goal:** Maximize number of conversions
- **Location:** People living in Dripping Springs, Texas, with the smallest practical local radius available in Ads Manager, target approximately 15 miles
- **Age:** 24–54
- **Gender:** All
- **Audience:** Advantage+ audience; parenting and youth-activity interests may be suggestions, not hard constraints
- **Placements:** Advantage+ placements
- **Attribution:** 7-day click / 1-day view unless the account requires a newer default
- **Optimization:** Website conversion, no cost cap until a qualified-CPL baseline exists
- **Exclusions:** Existing recent leads if a reliable website-Lead/custom-list audience is available; do not delay launch solely to manufacture a weak exclusion audience

### Ads

| Ad | Concept | Why it is distinct | Main signal |
| --- | --- | --- | --- |
| `KIDS_TAP-MEANS-STOP_STATIC_V1` | Safety and boundaries | Specific coaching mechanism | Parent reassurance |
| `KIDS_CONFIDENCE-PRACTICE_STATIC_V1` | Earned confidence | Outcome without fear-based targeting | Emotional benefit |
| `KIDS_START-AT-3_STATIC_V1` | Age-3 differentiator | Program specificity | Unique local fit |
| `KIDS_PROGRAM-FIT_STATIC_V1` | Program finder | Choice reduction | Low-friction action |

Each ad uses a 1080×1080 feed asset and 1080×1920 Stories/Reels asset. Do not combine the four concepts into one flexible ad for the first read. Keep concept-level reporting visible.

## Copy and destination rules

- CTA: `Learn More`
- Destination: `https://joaocrusbjj.com/practice-under-pressure/`
- Do not promise a free trial, paid trial, price, uniform, guarantee, or booked class.
- The form is a request for a recommended starting point and does not book or charge anything.
- Do not imply that a specific child lacks confidence, is unsafe, or has behavioral problems.
- Do not use unverified review counts or exclusivity claims.
- Use real academy images already approved for the site. No stock photography or new AI children.

## UTM contract

Use ad-level dynamic parameters:

`utm_source={{site_source_name}}&utm_medium=paid_social&utm_campaign=meta_kids_program_finder_2026_08_w1&utm_content={{ad.name}}&utm_term={{adset.name}}`

Final URL:

`https://joaocrusbjj.com/practice-under-pressure/?utm_source={{site_source_name}}&utm_medium=paid_social&utm_campaign=meta_kids_program_finder_2026_08_w1&utm_content={{ad.name}}&utm_term={{adset.name}}`

## Evaluation plan

### Primary

- Qualified HighLevel leads
- Qualified cost per lead
- Program requested
- Location requested
- Contactability and Joao follow-up disposition

### Diagnostic

- Landing-page views
- Outbound CTR
- Landing-page conversion rate
- CPM
- Frequency and net-new reach
- Lead event agreement across Meta, GA4, and HighLevel

### Decision cadence

- Do not judge a creative from a handful of clicks.
- Check transport and disapprovals daily during launch.
- Make the first creative decision after each concept has had a reasonable opportunity to serve or after seven days, whichever gives the more credible read.
- A low-spend ad is not automatically a loser. Meta may have found a stronger retrieval pocket for another concept.
- Advance Adults, Private Coaching, or After 60 only after Wave 1 establishes a real CPL and lead-quality baseline.

## Next-wave order

1. Kids Wave 1
2. Private Coaching, because the economics and appointment flexibility are strong
3. Adults / beginner cohort
4. Jiu-Jitsu After 60 as a focused niche test

The order may change if inbound leads or organic behavior reveal stronger demand elsewhere.
