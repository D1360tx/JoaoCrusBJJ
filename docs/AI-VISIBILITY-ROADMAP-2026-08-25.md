# Joao Crus BJJ AI Visibility Roadmap

> **Approved planning backlog:** 2026-08-26
> **Scope:** Google Gemini and AI Overviews, ChatGPT Search, Claude web search, Perplexity, Bing/Copilot
> **Objective:** make Joao Crus BJJ accurately understood, cited, and recommended for relevant local and program-specific questions, while increasing qualified first-class and private-coaching inquiries.
> **Execution state:** planned, not yet authorized for production publication or third-party profile edits.

## 1. Strategic decision

AI visibility is not a separate publishing trick. The operating model is:

1. **Indexing:** search engines can crawl and refresh the correct canonical pages.
2. **Entity clarity:** Joao, the academy, both locations, and each program are represented consistently.
3. **Extractable expertise:** Joao's firsthand answers are easy to quote and tied to the right commercial page.
4. **Independent proof:** reputable local and BJJ sources corroborate the academy's facts and reputation.
5. **Measurement:** visibility is tracked against a fixed prompt set and connected to qualified leads.

`llms.txt` remains supplemental. Do not treat it as a substitute for indexing, structured entities, useful content, or external corroboration.

This roadmap follows the platforms' current public guidance:

- Google says eligibility for AI Overviews and AI Mode begins with normal search indexing and snippet eligibility.[1]
- OpenAI says `OAI-SearchBot` access helps content appear in ChatGPT Search summaries and citations.[2]
- Anthropic identifies `Claude-SearchBot` and `Claude-User` as the controls for search visibility and user-directed retrieval.[3]
- Bing Webmaster Tools now reports AI citations, cited pages, and grounding queries through AI Performance.[4]

## 2. Verified baseline

### Working now

- Public `robots.txt` allows crawling.
- Googlebot, Google-Extended, OAI-SearchBot, GPTBot, ChatGPT-User, Claude-SearchBot, Claude-User, ClaudeBot, and Bingbot all received the real homepage with HTTP 200 on 2026-08-25.
- The production sitemap contains 24 canonical URLs.
- The site has an `llms.txt` overview and program directory.
- Core pages already emit valid Organization, Person, SportsActivityLocation, WebSite, WebPage, BreadcrumbList, Article, and FAQPage schema where applicable.
- The Parent Guide hub and six focused answer resources are live.
- Joao currently surfaces strongly for branded searches, Jiu-Jitsu After 60 in Dripping Springs, and selected age-3/life-skills questions.

### Gaps found in the 2026-08-25 audit

- Search results still show stale prior-site snippets and obsolete schedule/offer language.
- `/member-reviews` is still surfaced by search engines but currently returns 404.
- Generic recommendation searches such as “best kids BJJ in Dripping Springs” favor competitors and third-party directories.
- Some third-party records contain obsolete addresses, schedules, or unconfirmed free-trial wording.
- The current entity graph is strong at the organization/location level but does not yet model every program consistently as a Service/OfferCatalog.
- There is no dedicated canonical Dripping Springs location owner page comparable to the Austin page.
- AI visibility is not yet measured against a fixed prompt set.

## 3. 90-day execution roadmap

## Phase 1 — Measurement and index repair

**Timing:** Days 1–7
**Outcome:** establish the baseline, remove stale dead ends, and force the major indexes toward current facts.

### Work

1. Create the 20-prompt benchmark in Section 6 and record results in Gemini, ChatGPT, Claude, Perplexity, and Copilot.
2. Record for each answer: mention, citation, cited URL, factual accuracy, competitors cited, and local/business relevance.
3. Inspect Home, Schedule, Locations, Parent Guide, After 60, Kids, Adults, Private Coaching, and About in Google Search Console.
4. Request fresh crawling only after confirming the live canonical, robots, schema, and visible copy.
5. Resubmit `https://joaocrusbjj.com/sitemap.xml`.
6. Set up or verify Bing Webmaster Tools, import from Search Console when appropriate, submit the sitemap, and enable IndexNow.
7. Resolve `/member-reviews`:
   - **Recommended:** build a verified reviews page using source-linked, permission-safe review excerpts, then one-hop 301 `/member-reviews` to the canonical reviews route.
   - **Interim only:** one-hop 301 `/member-reviews` to the homepage proof section until the reviews page is approved.
8. Inventory stale Joao URLs appearing in search and classify each as canonical, 301, 410, or restore.
9. Add GA4 channel reporting for referrals from ChatGPT, Perplexity, Gemini, Claude, and Copilot where referrer/UTM data is available.

### Acceptance criteria

- Fixed 20-prompt baseline recorded across five surfaces.
- No valuable indexed Joao URL returns an unexplained 404.
- Sitemap accepted by Google and Bing.
- Priority canonical pages pass live URL/indexability checks.
- AI referral traffic has an identifiable GA4 reporting rule.

## Phase 2 — Entity and structured-service upgrade

**Timing:** Days 4–14
**Outcome:** make Joao, both locations, and every confirmed program machine-readable as one coherent graph.

### Work

1. Define stable entity IDs for:
   - Joao Crus
   - Joao Crus Brazilian Jiu-Jitsu
   - Dripping Springs academy
   - Austin instruction at Castle Hill Fitness
   - each confirmed program
2. Add `Service` and `OfferCatalog` modeling for:
   - Little Champions 3–7
   - Youth 8–12
   - Teens 13–17
   - Homeschool ages 5–8
   - Adults
   - Jiu-Jitsu After 60
   - Private Coaching
   - Teams/Corporate
3. Connect founder, provider, area served, audience, available location, program URL, and current schedule references without representing class times as opening hours.
4. Expand `sameAs` only with verified official profiles.
5. Build a dedicated Dripping Springs location page with:
   - exact NAP and directions
   - confirmed programs and schedule links
   - real location/class photography
   - coach/authority context
   - local FAQ
   - first-class CTA
6. Validate schema against visible page content and the production build.

### Acceptance criteria

- No invalid JSON-LD or contradictory visible/schema facts.
- Every confirmed program maps to one canonical URL and provider/location relationship.
- Dripping Springs and Austin are distinguishable entities with accurate offerings.
- Search Console enhancement reports show no new critical structured-data errors.

## Phase 3 — Local citation and profile cleanup

**Timing:** Days 8–30
**Outcome:** external sources repeat the same facts as the website.

### Tier 1

- Google Business Profile
- Bing Places
- Apple Business Connect
- Facebook Business Page
- Yelp
- Nextdoor Business
- OpenStreetMap

### Tier 2

- Castle Hill Fitness listing, subject to Joao's permission and the facility relationship
- Dripping Springs and Austin chambers/directories
- reputable parent/family resources
- legitimate BJJ directories and association pages
- local publications, podcasts, schools, and community partners

### Work

1. Create one citation source-of-truth record with approved names, addresses, phones, categories, descriptions, programs, hours, photos, and profile URLs.
2. Audit each profile as unclaimed, claimed, verified, corrected, duplicate, suppressed, or not applicable.
3. Correct obsolete Austin/Dripping Springs addresses, old schedules, and unconfirmed offer language.
4. Resolve duplicates before creating new records.
5. Refresh review counts only from the live source. Do not freeze the June 2026 count into evergreen copy.
6. Do not buy backlink packages or submit to low-quality directory bundles.

### Acceptance criteria

- Top seven local profiles match the approved NAP and program facts.
- No known high-visibility profile advertises an obsolete address or schedule.
- Duplicate profile decisions are documented.
- Each live listing has an owner and last-verified date.

## Phase 4 — Joao authority publishing loop

**Timing:** Days 15–60, then weekly
**Outcome:** produce first-person, citable answers that support commercial pages instead of competing with them.

### First four anchors

1. **Can You Start Brazilian Jiu-Jitsu After 60?**
   - support the After 60 commercial page
   - explain pacing, cooperative work, floor confidence, and the no-aggressive-sparring expectation
2. **What Should an Adult Beginner Expect in a First BJJ Class?**
   - support the Adults and Dripping Springs pages
3. **Private BJJ Lessons vs. Group Classes: Which Starting Point Fits?**
   - support Private Coaching without promising belt speed or outcomes
4. **How to Evaluate a Kids BJJ Program in Dripping Springs**
   - balanced criteria: age fit, coach communication, boundaries, class structure, parent visibility, and next steps

### Format standard

- one natural-language question per page
- direct 40–80 word answer near the top
- Joao attribution and visible reviewed date
- firsthand teaching explanation
- cautious source links for research claims
- original image, demonstration, audio, or video when available
- matching Article/FAQ schema only when visible content supports it
- internal links to one commercial owner page and the relevant schedule/location
- no invented quotations, testimonials, outcomes, pricing, or trial terms

### Weekly distribution

One Joao-led anchor may become:

- canonical website answer
- YouTube video/transcript
- Instagram/Facebook clip
- Google Business Profile post
- Beehiiv excerpt when consent and access permit

The website remains canonical when the question has durable search value.

### Acceptance criteria

- Four approved anchors published by Day 60.
- Each has a visible author/review date, direct answer, correct CTA, and one canonical commercial owner page.
- No thin duplicate pages or cannibalized intent.
- One useful instructional anchor per week remains the operating cadence.

## Phase 5 — Independent authority and recommendations

**Timing:** Days 30–90
**Outcome:** earn corroboration that can support “recommended” and “best fit” answers.

### Work

- Publish verified, source-linked customer proof on the canonical reviews page.
- Seek accurate inclusion in local parent/family resources.
- Secure Castle Hill Fitness and community-partner references only with permission.
- Pitch Joao's age-3 teaching method, After 60 program, and living Carlson/De La Riva influence to relevant local or BJJ podcasts/publications.
- Publish real YouTube explanations with descriptive titles, transcripts, chapters, and links to the matching page.
- Use books, podcast appearances, and archive footage as authority evidence, not decorative links.

### Acceptance criteria

- At least five high-quality third-party sources accurately identify the academy, location, and relevant program.
- At least two sources provide genuine audience reach, not merely a directory backlink.
- All earned mentions point to the most relevant canonical page.
- No paid-link, fake-review, spun-profile, or mass-submission tactics.

## 4. Ownership and dependencies

| Workstream | ICDC/Hermes | Diego | Joao | Dependency |
|---|---|---|---|---|
| Index and redirect repair | Build, test, deploy, verify | Approve route choice | None | Search Console access |
| Bing/IndexNow | Configure and verify | Account owner decision | None | Bing Webmaster access |
| Entity/schema | Audit, implement, validate | Review | Verify facts | Confirmed program/location data |
| Citation audit | Research and tracker | Coordinate access | Claim/verify profiles | Platform logins |
| Dripping Springs page | Build separate review version | Review/approve | Fact/photo approval | Owned imagery |
| Joao answer content | Research, outline, repurpose | Editorial review | Record/approve answer | Joao availability |
| Reviews page | Source audit and build | Review/approve | Permission/fact check | Verified review sources |
| Partner mentions | Prepare outreach assets | Coordinate | Relationship/permission | Partner approval |

## 5. Guardrails

- No membership pricing until the rate card is resolved.
- No free-trial claim unless Joao explicitly approves a current offer.
- No Austin adult group schedule until confirmed.
- No self-serving Review/AggregateRating schema that violates platform eligibility.
- No doorway pages for “near me” or neighboring cities.
- No mass AI articles, fake Reddit participation, paid backlink packages, or empty social profiles.
- No claim that AI visibility guarantees leads, rankings, or recommendations.
- Preserve one canonical schedule and one source of business facts.

## 6. Fixed 20-prompt benchmark

### Branded/entity

1. Can you summarize Joao Crus Brazilian Jiu-Jitsu?
2. Who is Joao Crus?
3. Where are Joao Crus BJJ classes offered?
4. What programs does Joao Crus BJJ offer?
5. What is Joao Crus's connection to Carlson Gracie and Ricardo De La Riva?

### Local commercial

6. What are the best kids BJJ options in Dripping Springs, Texas?
7. Where can a three-year-old start BJJ in Dripping Springs?
8. Where can an adult beginner train BJJ in Dripping Springs?
9. Where can I take private BJJ lessons in Dripping Springs?
10. Are private BJJ lessons available near downtown Austin?
11. What BJJ classes are available near Castle Hill Fitness?
12. Are there homeschool BJJ classes in Dripping Springs?
13. Is there a Jiu-Jitsu program for people over 60 in Dripping Springs?

### Parent and beginner questions

14. What age can a child start Brazilian Jiu-Jitsu?
15. What happens in a child's first BJJ class?
16. What does tapping teach children in BJJ?
17. How can I evaluate whether a kids BJJ class is age appropriate?
18. What should a child wear to a first BJJ class?
19. How do I choose between kids BJJ programs by age?
20. What should an adult beginner expect in a first BJJ class?

## 7. Scorecard

For every prompt and platform, record:

| Field | Values |
|---|---|
| Brand mentioned | Yes / No |
| Joao site cited | Yes / No |
| Cited URL | Exact URL |
| Facts accurate | Accurate / Partial / Wrong |
| Location/program fit | Relevant / Weak / Irrelevant |
| Competitors cited | Names + URLs |
| Action recommended | Visit / call / compare / none |
| Capture date | YYYY-MM-DD |

### Day-90 directional targets, not guarantees

- 100% factual accuracy for branded prompts in the manual sample.
- No sampled answer repeats a known obsolete address, schedule, or offer from Joao-owned profiles.
- Joao or a Joao-owned page appears in at least 50% of high-fit niche/local prompts across the five-surface sample.
- Citation growth is reported with the triggering prompt and cited URL, not as a context-free total.
- AI visibility activity is connected to qualified leads, first visits, enrollments, or private inquiries whenever attribution is available.

## 8. First two-week action queue

| Priority | Action | Owner | Gate |
|---:|---|---|---|
| 1 | Capture the 20-prompt baseline | ICDC/Hermes | None |
| 2 | Decide `/member-reviews` rebuild vs interim redirect | Diego | Reviews-page recommendation |
| 3 | Inspect/request priority URLs in Search Console | ICDC/Hermes | Property access |
| 4 | Verify Bing Webmaster Tools and IndexNow | ICDC/Hermes | Account access |
| 5 | Build citation source-of-truth record | ICDC/Hermes | Joao fact check |
| 6 | Audit Tier 1 local profiles | ICDC/Hermes | Platform access for edits |
| 7 | Draft entity IDs + Service/OfferCatalog graph | ICDC/Hermes | Current canonical URLs |
| 8 | Build Dripping Springs page as a separate review version | ICDC/Hermes | Photos and review approval |
| 9 | Outline the first After 60 authority answer | ICDC/Hermes | Joao answer/approval |
| 10 | Re-run the benchmark after index changes settle | ICDC/Hermes | Phase 1 deployed |

## 9. Free-first measurement stack

Use the free stack first:

- Google Search Console
- Bing Webmaster Tools and AI Performance
- GA4
- Google Business Profile performance
- a manual prompt scorecard
- site/server logs when useful

Do not buy an AI visibility platform until the fixed prompt set and manual workflow prove that paid automation will save meaningful time or uncover data the free stack cannot provide.

## Sources

[1] https://developers.google.com/search/docs/appearance/ai-features
[2] https://help.openai.com/en/articles/12627856-publishers-and-developers-faq
[3] https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
[4] https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview
