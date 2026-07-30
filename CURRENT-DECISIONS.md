<!-- markdownlint-disable MD013 -->

# Joao Crus BJJ — Current Decisions

> **Authoritative status as of 2026-07-29**
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

## Parent Guide AI-search cluster (2026-07-29)

- ✅ The canonical Parent Guide is a public, indexable resource hub at `/parent-guide/`, supported by five focused answer pages covering starting age, tapping, ages 3-7 class structure, choosing a program by age, and first-class preparation.
- ✅ Each resource uses a concise direct-answer block, visible publication context, internal links, claim-safe language, and Article schema. Visible FAQ content may also use FAQPage schema when the structured data exactly matches the page.
- ✅ Research claims must cite the underlying source and remain within the evidence tier. Preschool movement research may support cautious language about attention, motor development, and self-regulation, but must not be presented as proof of BJJ-specific outcomes at age 3.
- ✅ The cluster may explain tapping as a shared stop signal and training habit. It must not claim that tapping eliminates injury risk or guarantees behavior outside class.
- ✅ Review and staging HTML remains `noindex,nofollow`. The production build may index only manifest-approved canonical pages.
- ✅ Do not publish invented schedules, equipment rules, trial terms, first-person quotations, or claims that Joao personally reviewed editorial copy unless verified.

---

## 2. Confirmed business facts

### Enrollment, pricing, and operations

- ✅ Current enrollment reported: **30 kids / 12 adults**.
- ✅ Private lessons: **$3,800 per 40 classes = $95/class**; currently about 5/week, desired 10/week.
- ✅ Drop-in rate: **$25**.
- ✅ Memberships use **12-month agreements with 60-day termination notice**.
- ✅ Reported business baseline: approximately **$100,000 trailing 12 months**; records/Zen Planner export are still required to document the baseline.
- ✅ Billing and member management use **Zen Planner**.
- ✅ Current website inquiries go to **[joaocrus@gmail.com](mailto:joaocrus@gmail.com)** and are not managed in a dedicated CRM.
- ✅ Beehiiv exists with approximately **800 subscribers**, correcting the earlier 8,060 figure. Access and consent/list-quality review remain pending.

### Locations and schedule

- ✅ Dripping Springs location: **120 Frog Pond Lane, Suite 200, Dripping Springs, TX 78620**.
- ✅ Austin location: **1112 N Lamar Blvd, inside Castle Hill Fitness**.
- ✅ Dripping Springs published schedule includes Mon/Wed kids classes and adults at **6:40–7:40 p.m.**
- ✅ Austin published kids schedule: ages 8–12, Tue/Thu **5:00–6:00 p.m.**
- ✅ Austin publishes **adult private instruction by appointment** with flexible scheduling and beginner-friendly positioning.
- 🔴 Austin recurring **adult group** schedule remains undecided; use an interest list until confirmed and do not add private appointments to the weekly calendar.
- 🔴 Confirm whether the former Saturday kids class has been discontinued before publishing the shared full-site schedule.

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
- 🟡 Home, Programs, Schedule, and Locations will test distinct page-specific AI hero concepts in the review build. These remain labeled concepts until final photography is approved.
- 🟡 Build one shared schedule data source/component so every page displays the same current times.
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
- Mobile click-to-call/text and real map links.
- Email/SMS consent language, privacy policy, unsubscribe handling, and suppression records.
- Canonicals, Open Graph/social images, LocalBusiness/location schema, FAQ schema where appropriate, sitemap, robots rules, and noindex for drafts/variants.
- Owned, optimized local images rather than production hot-links to WordPress media.
- ✅ Treat traditional SEO and AI-search discoverability as launch foundations, not post-launch add-ons. Preserve valuable WordPress URLs and content, maintain a redirect inventory, assign one search intent per canonical page, publish accurate entity/schema data, keep staging noindex, and make Joao's firsthand expertise and source-backed teaching content easy for answer engines to extract and cite.

### Content priorities

- Lead the kids/toddler journey with the verified age-3 differentiator.
- Promote private coaching as a primary offer, not a minor peer card.
- Show both locations clearly. Austin may promote confirmed adult private instruction by appointment, but must not imply a recurring adult group schedule that does not yet exist.
- Add schedule, coaches, linked Google reviews, FAQs, directions, books/podcast links, and a secondary lead-magnet path.
- Do not publish the preview ribbon, draft variant hub, or duplicate toddler versions.

---

## 6. Automation and platform decisions

### Confirmed current state

- ✅ Zen Planner is the existing billing/member system; do not replace it blindly.
- ✅ Beehiiv is the existing ESP; evaluate and integrate before introducing another ESP.
- ✅ Meta Pixel is present via PixelYourSite; GA4 was not yet verified as live in the July 22 audit.
- ✅ Jetpack Stats exists and may provide historical traffic baseline data.
- ✅ A WordPress Booking Calendar plugin is installed; its actual booking flow is still unknown.
- ✅ Twilio is not operational; A2P registration has not started.
- 🟡 **Lead infrastructure recommendation (updated 2026-07-29):** compare HighLevel against Zen Planner Engage before procurement. Retain Beehiiv for explicitly opted-in newsletter subscribers and Zen Planner Studio for existing members/billing. Choose Engage if it passes the custom-form, consent, attribution, workflow, two-way messaging, member-conversion, API/export, A2P, and total-cost tests and its native member integration justifies the premium; otherwise use HighLevel as the prospect CRM and automation system. Avoid Make/n8n in the launch-critical path unless direct API/workflow integration proves insufficient. Final platform approval and account ownership are pending.

### Implementation sequence

1. Resolve offer, rate card, booking, and design decisions.
2. Create school-domain email and establish authenticated sending.
3. Connect real forms, booking, Beehiiv, GA4, Meta events, and source attribution.
4. Start Twilio/A2P only after ownership, number strategy, consent, and agency-overlap decisions are documented.
5. Launch email-first if A2P approval is not complete; do not delay the entire campaign solely for SMS.
6. Keep Zen Planner for existing billing/membership until migration requirements are proven.

### Phase 2—not required for the first conversion launch

- Full custom CRM/admin pipeline
- Stripe subscription migration
- Revenue-versus-baseline dashboard
- Historical-lead win-back automation
- Voice AI / AI receptionist
- Advanced multi-location or multi-tenant platform work

---

## 7. Ownership and immediate action list

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
