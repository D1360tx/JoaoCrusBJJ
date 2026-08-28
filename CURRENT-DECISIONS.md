<!-- markdownlint-disable MD013 -->

# Joao Crus BJJ — Current Decisions

> **Authoritative status as of 2026-08-04**
> This file is the source of truth for current strategy, offers, launch scope, and implementation decisions. When an older document conflicts with this file, **this file wins** until it is updated by a newer dated decision.

## Status legend

| Status              | Meaning                                                                      |
| ------------------- | ---------------------------------------------------------------------------- |
| ✅ Confirmed        | Explicitly confirmed by Joao or independently verified                       |
| 🟡 Working decision | Current direction; implementation may proceed, but details remain adjustable |
| 🔴 Open / blocking  | Must be resolved before dependent work is published or launched              |
| ⛔ Superseded       | Older direction that must not guide new work                                 |

---

## 1. Current objectives and priorities

1. ✅ **Generate new qualified leads and convert them into students.** New leads—not merely appointment show-up—is the primary growth problem.
2. ✅ **Increase private lessons from 5 to 10 per week.** Current private rate is $95/class; this is the fastest, highest-margin near-term lever.
3. ✅ **Relaunch adult group training around the Mon/Wed 6:40 p.m. class.** Treat it as a date-bound cohort rather than advertising a small existing class.
4. ✅ **Grow kids enrollment using the age-3 differentiator, referrals/buddy passes, local campaigns, and a stronger trial offer.**
5. 🟡 **Develop the schools/curriculum line after the immediate local-student launch.** Whether this targets regular schools or martial-arts schools still requires reconfirmation.
6. 🟡 Preserve the broader **one hub / three lines** concept as the working brand architecture, pending final sign-off and naming.

---

## Kids paid-social landing page (2026-08-24)

- ✅ Publish the kids paid-social destination at `/kids-first-class/` as a separate `noindex,nofollow` campaign route. Keep it out of the XML sitemap and preserve `/practice-under-pressure/` unchanged.
- ✅ Use one kids-only page for the first four static ads, with direct message match for tapping, practiced confidence, programs from age 3, and program fit. Do not create four separate pages at launch.
- ✅ All dominant CTAs enter the existing Program Finder with the child route preselected, contact capture last, unique placement values, and paid attribution parameters preserved. Nothing is booked or charged automatically.
- ✅ Diego approved the reviewed page for Bluehost deployment on 2026-08-25. Meta ad destination changes remain a separate launch action.

## Swimming + jiu-jitsu advertorial concept (2026-08-28)

- 🟡 Build a separate `noindex,nofollow` review framework around the parental belief that swimming and jiu-jitsu are core childhood life skills. The current working line is **“In our family, swimming and jiu-jitsu are mandatory.”** Treat “mandatory” as an editorial family philosophy, not a medical, legal, or universal safety claim.
- 🟡 The paid-social test uses three distinct hooks: protection when a parent is not present, composure under pressure, and the family life-skills belief. Route all variants to one matched advertorial before the existing child Program Finder preview.
- 🟡 Keep the work in preview. Do not change Meta destinations, publish to Bluehost, or attribute the first-person belief to Joao until the final byline and exact wording are approved.

## Parent-practice advertorial concept (2026-08-28)

- 🟡 Build a separate `noindex,nofollow` advertorial for parents whose children have trouble listening or following directions. The page may also personalize around the existing Program Finder goals: confidence in new situations, safe boundaries and body control, and a positive physical activity.
- 🟡 Lead with the non-shaming mechanism that a child can understand a rule and still need practice using one clear cue while moving, distracted, uncertain, or frustrated. Present Joao's method as structured practice, not a diagnosis, behavior cure, guaranteed discipline outcome, or substitute for professional support.
- 🟡 Preserve the four approved goal labels and supporting lines from the Program Finder. Keep contact capture in the existing child quiz flow and state that Joao personally calls to recommend a class and arrange a free studio visit where the child may watch or participate.
- 🟡 Keep the page in review. Do not publish to Bluehost or change paid-ad destinations without explicit approval.

---

## Practice Under Pressure offline QR campaign (updated 2026-08-13)

- ✅ The approved canonical landing page is `/practice-under-pressure/` using the pressure-response Iteration 2 message: **“Pressure is part of life. Practice what to do next.”** Its primary CTA opens the Program Finder directly at Question 1, skipping the quiz intro while preserving flyer attribution. Standalone quiz visits retain the intro. The homepage booking popup remains unchanged.
- ✅ `/found-the-flyer/` is the former campaign URL and must remain a one-hop, query-preserving 301 redirect to `/practice-under-pressure/` so existing QR codes and attribution parameters continue to work.
- ✅ Preserve the flyer-curiosity version and prior pressure-response iterations as noindex comparison artifacts. The approved Iteration 2 becomes the locked control for future tests.
- 🟡 Shared native forms and the Program Finder are code-ready to use the Bluehost `/api/lead.php` HighLevel adapter. Production activation remains blocked on server-only configuration and controlled live acceptance. Success requires explicit contact and opportunity acceptance. Legacy internal email is best-effort only after CRM acceptance, and automated SMS remains held pending A2P.
- 🔴 **SMS carrier readiness checked 2026-08-20:** the HighLevel sub-account has no phone number and A2P Messaging shows **Start Registration**. The consent bridge may ship behind `GHL_ENABLE_SMS_RELEASE=false`, but automated SMS must remain disabled until a number is acquired, A2P 10DLC is approved, and a controlled STOP/DND test passes.
- 🟡 Until Joao's approved campaign video is recorded, use an honest coaching photograph without a play button or simulated playback. The video script remains a production asset for a later release.

---

## Parent Guide AI-search cluster (2026-07-29)

- ✅ The canonical Parent Guide is a public, indexable resource hub at `/parent-guide/`, supported by focused answer pages covering starting age, tapping, ages 3-7 class structure, choosing a program by age, first-class preparation, and how children practice life skills in BJJ.
- ✅ The life-skills article owns informational intent around listening, boundaries, persistence, partner awareness, resetting, and problem-solving. It must support, not replace or cannibalize, the commercial Kids BJJ page.
- ✅ Each resource uses a concise direct-answer block, visible publication context, internal links, claim-safe language, and Article schema. Visible FAQ content may also use FAQPage schema when the structured data exactly matches the page.
- ✅ Research claims must cite the underlying source and remain within the evidence tier. Preschool movement research may support cautious language about attention, motor development, and self-regulation, but must not be presented as proof of BJJ-specific outcomes at age 3.
- ✅ The cluster may explain tapping as a shared stop signal and training habit. It must not claim that tapping eliminates injury risk or guarantees behavior outside class.
- ✅ Review and staging HTML remains `noindex,nofollow`. The production build may index only manifest-approved canonical pages.
- ✅ Do not publish invented schedules, equipment rules, trial terms, first-person quotations, or claims that Joao personally reviewed editorial copy unless verified.

---

## Regional analytics and consent (2026-08-03)

- ✅ Use the least-friction regional model: known visitors outside the EEA, United Kingdom, and Switzerland receive GA4 analytics, Google Ads, and Meta advertising measurement by default without a first-visit banner and can adjust or turn them off from the footer.
- ✅ Visitors in the EEA, United Kingdom, and Switzerland must explicitly allow analytics and advertising categories. Unknown or failed country detection follows the same strict opt-in path.
- ✅ Keep analytics and advertising as separate durable choices. Google Consent Mode v2 controls `analytics_storage`, `ad_storage`, `ad_user_data`, and `ad_personalization`; Meta consent is revoked whenever advertising is off.
- ✅ Honor explicit saved category choices across regions. Global Privacy Control always keeps advertising storage, user data, and personalization off while allowing ordinary first-party analytics in standard regions unless the visitor also disables analytics.
- ✅ Preserve PII stripping, origin-only referrers, consent-aware attribution storage, a durable Privacy choices control, strict failure behavior, and safe migration of legacy analytics-only choices without expanding them into advertising consent.

---

## 2. Confirmed business facts

### Enrollment, pricing, and operations

- ✅ Current enrollment reported: **30 kids / 12 adults**.
- ✅ Private lessons: **$3,800 per 40 classes = $95/class**; currently about 5/week, desired 10/week.
- ✅ Drop-in rate: **$25**.
- ✅ Memberships use **12-month agreements with 60-day termination notice**.
- ✅ Reported business baseline: approximately **$100,000 trailing 12 months**; records/Zen Planner export are still required to document the baseline.
- ✅ Billing and member management use **Zen Planner**.
- ✅ Current website inquiries are emailed to **[joaocruzbjj@gmail.com](mailto:joaocruzbjj@gmail.com)** and **[diego@icdcventures.com](mailto:diego@icdcventures.com)** for owner delivery plus ICDC monitoring. They are not yet managed in a dedicated CRM.
- ✅ Beehiiv exists with approximately **800 subscribers**, correcting the earlier 8,060 figure. Access and consent/list-quality review remain pending.

### Locations and schedule

- ✅ Dripping Springs location: **120 Frog Pond Lane, Suite 200, Dripping Springs, TX 78620**.
- ✅ Austin location: **1112 N Lamar Blvd, inside Castle Hill Fitness**.
- ✅ Dripping Springs Little Champions, ages 3–7: Mon/Wed **5:00–5:45 p.m.**
- ✅ Dripping Springs Youth, ages 8–12: Mon/Wed **5:50–6:35 p.m.**
- ✅ Dripping Springs Homeschool Program, ages 5–8: Tue/Thu **10:30–11:15 a.m.**
- ✅ Dripping Springs adults: Mon/Wed **6:40–7:40 p.m.** and Sat **11:00 a.m.–12:00 p.m.**
- ✅ Dripping Springs Jiu-Jitsu After 60: Tue/Thu **11:20 a.m.–12:10 p.m.** This is a distinct program with its own schedule filter, not part of the Adults filter.
- ✅ Jiu-Jitsu After 60 is positioned as a **4-week introductory program for men and women 60+**, with beginner reassurance, cooperative partner work, no aggressive-sparring expectation, and **“Relational First. Physical Second.”** Keep the confirmed 50-minute schedule above and omit Joao's draft 60-minute breakdown unless he explicitly changes the class time.
- ✅ Austin Youth, ages 8–12: Tue/Thu **5:00–5:45 p.m.**
- ✅ Austin publishes **adult private instruction by appointment** with flexible scheduling and beginner-friendly positioning.
- 🔴 Austin recurring **adult group** schedule remains undecided; use an interest list until confirmed and do not add private appointments to the weekly calendar.

### Positioning and proof

- ✅ Joao officially accepts children from **age 3** and approved advertising this fact.
- ✅ Competitive research found no other local school advertising an under-4 starting age; phrase external copy carefully as **“no other local school we found advertises classes from age 3”** unless the stronger exclusivity claim is reverified at launch.
- ✅ Google Business Profile was verified at **4.8 stars / 98 reviews** as of 2026-06-17; refresh before publishing hard counts.
- 🟡 “500+ families” is a first-party cumulative claim. If Joao reconfirms it, use **“500+ families served since 2003,”** not language implying current enrollment or only Dripping Springs families.

---

## 3. Launch and campaign decisions

- ✅ **Launch anchor: August 17, 2026.** The new schedule and 6:40 adult cohort are tied to this date.
- ✅ Campaign theme: **Back to School**.
- ✅ Move away from a fully free-only trial toward a **paid/deposit trial** that filters for commitment.
- ✅ Preferred offer logic: a trial deposit becomes a **credit toward annual membership** when the student continues.
- ✅ Paid social is approved at approximately **$35/day** for the Back-to-School campaign.
- ✅ Paid social will use our own pages and tracking and run alongside the existing agency.
- ✅ **Google Ads is documented for future use and explicitly deferred from the current launch.** Do not allocate budget or build campaigns until Diego reopens the channel. When activated, start with transactional/commercial local intent, exact and phrase match, program-specific landing pages, and HighLevel quality feedback. Do not begin with broad match or Performance Max. See `docs/GOOGLE-ADS-KEYWORD-PLAYBOOK-2026-07-30.md`.
- ✅ Social cadence preference: approximately **one useful instructional post per week**; content should drive to offers rather than function as a free school.
- ✅ Joao's children's storybooks (shy/distracted-kid themes) are working lead-magnet and trial-gift assets.
- 🟡 Buddy passes and family/father-son structures are approved directions but need final mechanics.

### Superseded directions

- ⛔ **“Organic-first; no paid ads in v1” is superseded.** Paid social is now in scope.
- ⛔ **“No ESP / build an email list from zero” is superseded.** Beehiiv exists; the task is access, cleanup, segmentation, and integration.
- ⛔ **“Twilio already exists or may have reusable A2P registration” is superseded.** Twilio was stalled at signup and A2P has not started.
- ⛔ The agency's $500 fee was **one-time setup**, not an ongoing monthly retainer. Working ongoing cost is **$400/month ad spend + $100 per signup**.
- ⛔ “Age 3 pending confirmation” is superseded. The policy and advertising permission are confirmed.
- ⛔ “No gym-management software” is superseded. Zen Planner is in use.

---

## 4. Open decisions that block implementation

| Priority | Decision required                                                                                                                 | Owner        | Blocks                                            |
| -------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------- |
| 🔴 1     | Confirm full rate card: when $69/week applies versus $49–59/week; family rates; $99 registration; kids/adults differences         | Joao         | Offer math, pricing copy, checkout                |
| 🔴 2     | Select launch offer: paid Kickstart versus 4-week deposit-credit intro; deposit amount, duration, capacity, refund/credit rules   | Joao + Diego | Landing pages, ads, scripts, payment flow         |
| 🔴 3     | Confirm trial-uniform cost and whether the offer includes a low-cost trial uniform, enrollment gi, or no uniform bonus            | Joao         | Offer profitability and copy                      |
| 🔴 4     | Confirm booking system: existing WP Booking Calendar, Zen Planner booking, or Cal.com                                             | Joao + Diego | CTA and automation wiring                         |
| ✅ 5     | **Resolved 2026-07-23:** Joao approved the `toddlers-campaign-group.html` black/yellow/blue direction and requested the full site in this style | Joao + Diego | Unblocked—full-site buildout in progress           |
| 🔴 6     | Confirm hosting/registrar/DNS access and create a school-domain email                                                             | Joao + Diego | Email authentication, Twilio signup               |
| 🔴 7     | Obtain Beehiiv access and verify list size, consent, segments, and deliverability                                                 | Joao         | Broadcasts, lead magnet, nurture                  |
| 🔴 8     | Confirm Castle Hill terms and permission to market to members via site listing, signage, front desk, and newsletter               | Joao         | Austin launch                                     |
| 🔴 9     | Confirm Meta ad-account ownership and agency campaign/follow-up boundaries                                                        | Joao + Diego | Pixel ownership, attribution, duplicate messaging |
| 🟡 10    | Decide whether the 6-week guarantee/refund concept will be used                                                                   | Joao         | Secondary offer copy                              |
| 🟡 11    | Confirm buddy-pass mechanics and limits                                                                                           | Joao         | Referral campaign                                 |
| 🟡 12    | Reconfirm whether the schools/curriculum line targets regular schools or martial-arts academies                                   | Joao         | Line-B product strategy                           |

### Pricing rule

Until item 1 is resolved, **do not publish membership prices, LTV claims, savings claims, or a paid-trial price.** Use a clearly marked placeholder or omit pricing entirely.

---

## 5. Website and funnel scope

### Working production direction

- ✅ Use the approved **`toddlers-campaign-group.html` black/yellow/blue campaign design** as the shared production visual system.
- ✅ Keep the strongest toddler copy, FAQ, schedule, and age-3 positioning inside that shared system rather than launching unrelated visual systems.
- ✅ Preserve prior concepts for comparison; build the cohesive full-site version in a new `site/campaign/` directory with shared components.
- ✅ The shared site header will use a **Programs dropdown** that links directly to the age-specific Little Champions 3–7, Youth 8–12, and Teen 13–17 pages. Age-group landing pages retain the same global header and add a smaller contextual anchor bar below it for in-page navigation.
- ✅ **Approved coach portraits (2026-07-29):** use the approved AI coach portraits in the About team grid and throughout the canonical Coaches hub. Keep Joao's real academy portrait in the About hero. Remove comparison-preview labeling because the coach portraits are approved for production.
- ✅ **Canonical hosted review site (2026-07-29):** use one Git-connected Vercel project, `joao-crus-bjj`, with `main` as the stable production branch and pull-request preview deployments for review. Keep the `*.vercel.app` deployment blocked from indexing until forms, legal, tracking, DNS, and real-domain cutover checks are complete.
- ✅ **Homepage hero photography (2026-07-31):** use Joao's approved real academy group photo in the homepage hero. Preserve the original source, use the optimized 4:3 derivatives, keep every person visible, and remove the former AI-concept label.
- ✅ **Campaign hero image scale (2026-07-31):** use larger 4:3 desktop hero image panels so they visually span more of the left-side story instead of sitting as short centered 16:9 cards. Preserve each source image's safe focal treatment and retain the established mobile ratios.
- ✅ **Canonical Teen page (2026-08-06, Diego):** publish the Teen 13–17 program at `/teens/`, remove preview and AI-concept labels, keep the interest-list positioning until a schedule is confirmed, and permanently redirect `/teens-preview/` to the canonical route.
- 🟡 Programs, Schedule, and Locations use distinct page-specific AI hero concepts pending final photography. Per Diego's 2026-08-02 direction, the visible “AI concept” hero banners are removed from the Schedule and Locations production pages while replacement imagery is reviewed.
- ✅ Maintain one shared schedule data source/component so every page displays the same confirmed times.
- 🟡 Maintain a single primary conversion goal per campaign page, plus text/call as the fallback.

### Required launch pages

1. Homepage hub
2. Kids program
3. Toddlers / age 3
4. Adults / 6:40 cohort
5. Private coaching
6. Teams / corporate offering
7. Austin location or Austin-specific campaign page
8. Lead-magnet landing page
9. Booking/offer confirmation and thank-you states
10. Privacy policy and terms/communications consent pages

### Required production wiring

- Real booking destination—no `href="#"` conversion buttons.
- Real form backend and lead storage.
- Beehiiv lead-magnet delivery and welcome/nurture automation.
- GA4 plus Meta Pixel event tracking for page views, CTA clicks, form starts, form submissions, bookings, and payments where applicable.
- UTMs and source attribution preserved through lead capture.
- 🟡 **Attribution standard approved (2026-08-03):** after analytics consent, retain first touch and last non-direct touch for 90 days, preserve supported ad click IDs with accepted leads, use GA4-recognized UTM mediums, and mark explicit `qa=1` sessions as internal/debug traffic. Consent Mode storage defaults remain denied before choice, ad-related consent remains denied, withdrawal clears durable attribution, and Global Privacy Control keeps optional analytics storage off. Keep the GA4 Internal Traffic filter in Testing mode until live transport is verified.
- Mobile click-to-call/text and real map links.
- Email/SMS consent language, privacy policy, unsubscribe handling, and suppression records.
- Canonicals, Open Graph/social images, LocalBusiness/location schema, FAQ schema where appropriate, sitemap, robots rules, and noindex for drafts/variants.
- Owned, optimized local images rather than production hot-links to WordPress media.
- ✅ Treat traditional SEO and AI-search discoverability as launch foundations, not post-launch add-ons. Preserve valuable WordPress URLs and content, maintain a redirect inventory, assign one search intent per canonical page, publish accurate entity/schema data, keep staging noindex, and make Joao's firsthand expertise and source-backed teaching content easy for answer engines to extract and cite.

### Content priorities

- Lead the kids/toddler journey with the verified age-3 differentiator.
- ✅ **Seasonal Summer Camp treatment (2026-08-03, Diego):** the 2026 camp is over. Keep `/summer-camp/` as a short `noindex,follow` seasonal holding page, remove it from navigation and the XML sitemap, and point visitors to the year-round Kids BJJ, Little Champions, and Youth pages. Reuse the URL and restore indexation only if a future camp is confirmed.
- Promote private coaching as a primary offer, not a minor peer card.
- Develop a dedicated private-coaching acquisition lane for mature professionals, executives, returning practitioners, and other adults whose schedule or body no longer fits one-size-fits-all group training. Lead with flexible appointments, individualized game planning, pressure/position/timing/efficiency, and Carlson Gracie lineage as a living teaching influence. Treat “old man jiu-jitsu” as a creative phrase to test, not an automatically approved premium offer name. See `assets/ads-podcast/02-private-coaching-grown-men.md`.
- ✅ **Story-led acquisition direction (2026-08-07, Diego):** ads and landing pages should use real Joao, parent, and student moments to reveal a recognizable tension, Joao's coaching belief, and an observable teaching mechanism before the CTA. Start with the Chris/private-coaching schedule story, the Kaiden/tap story, purposeful play at age three, and verified Carlson/De La Riva teaching moments. Keep each story tied to one audience and offer, obtain permission for identifiable details, and do not publish the reported older Dallas judge story until age, rank, wording, and permission are confirmed. See `assets/ads-swipe/009-jun-yuh-storytelling-framework.md`.
- Show both locations clearly. Austin may promote confirmed adult private instruction by appointment, but must not imply a recurring adult group schedule that does not yet exist.
- Add schedule, coaches, linked Google reviews, FAQs, directions, books/podcast links, and a secondary lead-magnet path.
- Do not publish the preview ribbon, draft variant hub, or duplicate toddler versions.

---

## 6. Automation and platform decisions

### Confirmed current state

- ✅ Zen Planner is the existing billing/member system; do not replace it blindly.
- ✅ A 2026-07-31 comparison of Zen Planner, Wodify, and Kmura is documented in [`16-GYM-MANAGEMENT-SOFTWARE-COMPARISON.md`](16-GYM-MANAGEMENT-SOFTWARE-COMPARISON.md); keep Zen through the launch and require a reversible pilot before any migration.
- ✅ Beehiiv is the existing ESP; evaluate and integrate before introducing another ESP.
- ✅ Meta Pixel was present on the prior WordPress site via PixelYourSite. The replacement site now sends GA4 page views and lead-funnel events through owned container `GTM-596MGPMD`; Meta Pixel ownership and replacement-site implementation remain a separate launch gate.
- ✅ Jetpack Stats exists and may provide historical traffic baseline data.
- ✅ A WordPress Booking Calendar plugin is installed; its actual booking flow is still unknown.
- ✅ Twilio is not operational; A2P registration has not started.
- ✅ **Lead infrastructure selected (2026-07-29):** use HighLevel as the prospect CRM, pipeline, booking, email/SMS automation, consent/attribution ledger, and staff follow-up system; retain Beehiiv for explicitly opted-in newsletter subscribers and Zen Planner Studio for enrolled members/billing. Native Vercel forms will post through a server-side endpoint to HighLevel and Beehiiv as appropriate. Avoid Make/n8n in the launch-critical path unless direct API/workflow integration proves insufficient.
- ✅ The new HighLevel implementation is intentionally independent of the advertising agency. Agency CRM access, ownership, and historical-lead export are not launch prerequisites. Any later paid-campaign cutover or historical import is a separate transition with explicit source/consent mapping.
- 🟡 **HighLevel acceptance update (2026-08-20):** the website lead-intake path has a conditional pass. Controlled Program Finder and booking-popup submissions reached the production gateway and created the intended HighLevel contact/opportunity with owner, tags, consent, program, and source mapping. Published safeguards provide an internal staff alert and an email-only release path gated by removal of `automation_hold` plus `Email Consent Status = granted`; no SMS action is active. The shared-form attribution adapter normalizes browser `first_touch`/`last_touch` into gateway `first`/`latest`; a post-deployment controlled submission verified matching first/latest UTM source, medium, content, and term in HighLevel. Meta CAPI, Google Ads conversion feedback, Beehiiv suppression, Zen Planner handoff, failure recovery, and export testing remain open. See [`docs/HIGHLEVEL-GA4-ACCEPTANCE-2026-08-20.md`](docs/HIGHLEVEL-GA4-ACCEPTANCE-2026-08-20.md).

### Implementation sequence

1. Resolve offer, rate card, booking, and design decisions.
2. Obtain Joao's approval and create Google Workspace for `joaocrusbjj.com`; use `joao@joaocrusbjj.com` as the proposed primary mailbox and decide whether `info@joaocrusbjj.com` is an alias or separate inbox. Authenticate the HighLevel sending domain.
3. Connect real forms, booking, Beehiiv, GA4, Meta events, and source attribution.
4. Start HighLevel phone/A2P setup only after account ownership, number strategy, consent, and use cases are documented.
5. Launch email-first if A2P approval is not complete; do not delay the entire campaign solely for SMS.
6. Keep Zen Planner for existing billing/membership until migration requirements are proven.
7. Run the HighLevel acceptance test and record evidence before paid-campaign optimization or automated SMS launch.

### Phase 2—not required for the first conversion launch

- Full custom CRM/admin pipeline
- Stripe subscription migration
- Revenue-versus-baseline dashboard
- Historical-lead win-back automation
- Voice AI / AI receptionist
- Advanced multi-location or multi-tenant platform work

---

## 7. Ownership and immediate action list

### AI visibility execution backlog (approved for planning 2026-08-26)

Canonical plan: [`docs/AI-VISIBILITY-ROADMAP-2026-08-25.md`](docs/AI-VISIBILITY-ROADMAP-2026-08-25.md)

- [ ] Capture the fixed 20-prompt baseline across Gemini, ChatGPT, Claude, Perplexity, and Copilot.
- [ ] Repair stale index signals and decide whether `/member-reviews` becomes a verified reviews page or an interim one-hop redirect.
- [ ] Verify Bing Webmaster Tools, submit the sitemap, and configure IndexNow.
- [ ] Build the approved citation source-of-truth record and audit the seven Tier 1 local profiles before editing any listing.
- [ ] Draft stable entity IDs plus `Service` and `OfferCatalog` relationships for confirmed programs and locations.
- [ ] Build a separate review version of the Dripping Springs location page. Preserve production until approval.
- [ ] Outline the first Joao-led authority answer, beginning with the After 60 topic, for Joao review before publication.
- [ ] Re-run the benchmark after indexing changes settle and report citations, accuracy, cited URLs, competitors, and qualified-lead relevance.

This backlog does not authorize production publication, Search Console mutations, directory/profile edits, outreach, or paid AI-visibility software. Execute each gated action only after its required access, fact, permission, and release checks.

### Diego

- [ ] Present 2–3 finalized offer options after rate-card clarification.
- [ ] Produce the toddler, adults, teams, privates, and location pages in the selected design.
- [ ] Wire GA4, Meta events, form/booking attribution, and email nurture.
- [ ] Draft the VSL and Back-to-School paid-social plan.
- [ ] Send Joao the written recap and Stoic/platform breakdown.
- [ ] Create an implementation checklist once booking/hosting access is confirmed.

### Joao

- [ ] Confirm the full rate card and registration/uniform rules.
- [ ] Select the paid/deposit trial structure.
- [ ] Confirm low-cost trial-uniform economics.
- [ ] Confirm the shared schedule, including Saturday and any future Austin adult group class. Adult private instruction remains appointment based.
- [ ] Provide Beehiiv, Zen Planner export/read-only, WordPress/hosting/DNS, Jetpack, booking, and Meta access as appropriate.
- [ ] Confirm Castle Hill marketing terms and request a Castle Hill website/classes listing.
- [ ] Approve the visual direction, buddy-pass mechanics, and guarantee position.

---

## 8. Decision hygiene

1. Update this file **first** whenever Joao or Diego makes a new decision.
2. Add the decision date, owner, and affected sections.
3. Update or add correction banners to older documents in the same commit when practical.
4. Do not silently convert assumptions into facts. Use the status legend.
5. Reverify volatile public claims—review counts, competitor offers, schedules, pricing, and platform behavior—before publishing.
6. Maintain one canonical schedule and one canonical rate card.

---

## 9. Source trail

Current conclusions were reconciled from:

- `README.md` — chronological project log, especially 2026-06-17 and 2026-07-22/23 entries
- `calls/2026-07-22-joao-strategy-call.md`
- `13-STUDENT-GROWTH-PLAN.md` §§7–8
- `08-NEEDED-FROM-JOAO.md` — July 22 intake and email corrections
- `assets/assumption-audit.md`
- `02-WEBSITE-AUDIT.md`
- `site/README.md`
- Live website and repository review performed 2026-07-23

When a statement in those sources conflicts with this file, follow this file's current status and then correct the stale source.

---

## Change log

- **2026-08-26** — Diego approved adding the 90-day AI visibility program to the project backlog. Use the canonical roadmap for phased execution across index repair, entity/service modeling, local citation consistency, Joao-led answer content, independent corroboration, and fixed-prompt measurement. Planning approval does not authorize production or third-party listing changes.

- **2026-08-25** — Diego approved Joao's expanded Jiu-Jitsu After 60 copy for the canonical page. Lead with the 4-week introductory format for men and women 60+, beginner reassurance, cooperative practice, no aggressive-sparring expectation, and “Relational First. Physical Second.” Preserve the confirmed Tue/Thu 11:20 a.m.–12:10 p.m. schedule and do not publish the conflicting 60-minute draft breakdown.

- **2026-08-20** — Diego approved a public Jiu-Jitsu After 60 program page for Dripping Springs. Position it as beginner-friendly training with a steady pace, practical technique, and confidence. Publish the exact Tue/Thu 11:20 a.m.–12:10 p.m. schedule under a standalone `after60` calendar filter. Do not silently include these classes under Adults.

- **2026-07-28** — Diego prioritized SEO and AI-search visibility for the custom-site launch. Build metadata, canonicals, structured entities, sitemap/robots rules, migration redirects, local-search signals, answer-ready content, and AI crawler access from the start. `llms.txt` may supplement discovery but must not replace indexable HTML, internal links, citations, or traditional SEO.

- **2026-07-27** — Joao's first-party Austin landing page confirms two Austin paths: Kids BJJ ages 8–12 on Tue/Thu from 5:00–6:00 p.m., plus adult private instruction by appointment with flexible scheduling. This does not confirm a recurring Austin adult group class. Keep the shared calendar unchanged until group times exist; document full address, directions, inquiry details, and remaining operational questions in `docs/AUSTIN-LANDING-PAGE-SOURCE-2026-07-27.md`.
- **2026-07-27** — Graduate the coaching team into one dedicated extended-bio hub rather than five thin profile pages. Keep the compact team cards on About, add explicit `Meet [first name]` links to stable profile anchors, and route every global `Coaches` link to the new hub. Each profile should combine role, verified credentials, teaching focus, personal path, and a next-step CTA while preserving one shared academy story.
- **2026-07-27** — Keep the About lineage deck visually attached beneath “A Lineage You Can See in the Teaching” instead of floating as a detached right-column statement. In every archival-video disclosure on Home and About, link all five verified original Joao-channel YouTube clips so visitors can inspect the source footage directly.
- **2026-07-27** — Make the coaching team a first-class trust destination without creating a redundant page: move the image-led team section directly below the About hero, add a global `Coaches` navigation link that deep-links to it, and add the same destination to every campaign footer. About remains the compact people-and-philosophy hub. Preserve Joao’s full source portrait in the hero with a portrait-aware frame rather than cropping it into a landscape box.
- **2026-07-27** — Treat “Plan a First Class” as a high-intent action: open a click-triggered, focused request layer instead of sending ready visitors to program exploration. Use a full-viewport sheet on mobile and a centered modal on desktop, while preserving the full contact page as the no-JavaScript fallback. Keep “Explore Programs” as the separate secondary path for visitors still researching. Mobile navigation must use the live header/viewport height, remain scrollable, respect safe areas, and suppress the sticky CTA while open.
- **2026-07-27** — Diego set two site-wide copy and typography rules: avoid single-word orphan lines in display headings at supported widths, and remove em dashes from body copy. Dash-like accents remain acceptable in small eyebrow labels.
- **2026-07-27** — Diego requested a denser, more intentional Home “Method” section: remove the detached paragraph above Joao’s portrait and replace the undersized checklist with substantial teaching-principle blocks that visibly fill the composition. Anchor Joao’s identity to the portrait rather than leaving surrounding text floating.
- **2026-07-27** — Diego approved exploring a Carlson Gracie lineage story on Home and About using Joao’s December 2005 seminar archive. The framing should add credibility through direct historical proof and translate pressure-tested tradition into Joao’s responsible “warrior in a garden” teaching approach. Keep “final seminar,” exact belt chronology, source ownership, and personal recollections pending Joao’s confirmation before production.
- **2026-07-27** — Diego supplied the official circular Joao Crus Brazilian Jiu-Jitsu logo for production use. Use the transparent processed logo in current-site navigation and branded footers, and derive the favicon set from the same artwork; retire placeholder “JC” marks on current pages.
- **2026-07-27** — Diego chose the lighter Toddler-page shell as the closer model for the full site. Global navigation and hero sections should use warm white/cream surfaces with black typography, yellow/blue accents, framed imagery, and hard borders/shadows rather than dominant black hero fields. Black remains appropriate for the slim utility strip, buttons, and intentional contrast sections.
- **2026-07-25** — Diego set the Teen interest-section hierarchy: “Help choose the time that can actually work.” and its intro span the full section above the two-column content; the three-step availability/review block sits left of the form, and the form sits on the right at desktop widths.
- **2026-07-25** — Diego approved integrating the Toddler, Youth, and Teen landing pages into the campaign-site navigation. The clean header pattern is one global site header plus a contextual anchor bar on long program pages. Distinct AI hero concepts are approved for Home, Programs, Schedule, and Locations as review ideas.
- **2026-07-23** — Joao approved the campaign-group visual direction after an in-person review and requested the rest of the site be built in that style. Production visual direction is no longer blocking.
- **2026-07-23** — Initial authoritative decision record created from the repository-wide strategy, documentation, website, and implementation review.
