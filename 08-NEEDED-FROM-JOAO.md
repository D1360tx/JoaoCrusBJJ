# Needed From Joao — Intake & Discovery Checklist
### Everything required to finalize numbers and build the marketing automation stack (email + SMS)
> Created 2026-06-10. Companion to 07 (Phase 0). Update statuses inline as items come in.
> **End goal this unblocks:** automated lead capture → instant email/SMS response → nurture → booking → show-up → join → retention/win-back. (The 10th Planet Portland playbook: lead follow-up systems outperform ad spend.)

**Status legend:** ⬜ not requested · 📨 requested · ⏳ partial · ✅ received

---

## 1. PRICING & REVENUE (finalizes §4 of doc 07)

| # | Item | Why we need it | Status |
|---|------|----------------|--------|
| 1.1 | Current membership rates — kids (per tier/frequency), adults, any family pricing | Set the new pricing architecture against benchmarks; find under-pricing | ⬜ |
| 1.2 | Private lesson rates + any pack pricing | Privates = highest-margin line; structure packs | ⬜ |
| 1.3 | Drop-in rate (if offered) | Complete the price card | ⬜ |
| 1.4 | Current student counts: kids vs adults vs privates-only | Are we at the 60–70% kids revenue benchmark? Capacity math | ⬜ |
| 1.5 | Rough monthly revenue by line (memberships / privates / camps / programs / books / Skool) | Baseline to measure the plan against | ⬜ |
| 1.6 | Any legacy/grandfathered rates or handshake deals | Affects repricing rollout | ⬜ |
| 1.7 | Contract structure today: month-to-month? 6/12-mo agreements? Cancellation policy | Churn lever; informs new commitment structure | ⬜ |
| 1.8 | **Last 6–12 months of revenue records** (bank deposits, GoDaddy payment history, whatever exists) | Establishes the **baseline for the revenue-share agreement** (doc 10 §3) — must be set before the growth work moves the number | ⬜ |
| 1.9 | **Monthly budget comfort for software subscriptions + ad spend** | Gates the SaaS-vs-custom architecture decision (doc 10 §4) and Phase-1 ad tests | ⬜ |

## 2. BILLING & MEMBERSHIP BACKEND

| # | Item | Why we need it | Status |
|---|------|----------------|--------|
| 2.1 | **How are recurring memberships actually charged today?** (GoDaddy Pay Links are one-off — is there autopay? Manual invoices? Cash/check? Venmo?) | The #1 unknown. Determines whether we migrate or build from scratch | ⬜ |
| 2.2 | Any gym-management software in use, ever (Gymdesk, Kicksite, Zen Planner, Mindbody…)? Login if so | Phase 0 calls for standing one up; don't duplicate | ⬜ |
| 2.3 | How failed payments are handled today | 2–3% involuntary churn recoverable via automation | ⬜ |
| 2.4 | Attendance/check-in tracking — anything? (paper, app, memory) | Retention triggers need attendance data | ⬜ |
| 2.5 | Member records: where do names/emails/phones/belt ranks/start dates live? | Seed data for the member database + segmentation | ⬜ |
| 2.6 | Waivers — how signed/stored? | Onboarding automation should include e-waiver | ⬜ |
| 2.7 | GoDaddy **Pay Links** account access (✅ confirmed in use — paylinks.godaddy.com for camp/program/book checkout) | Audit current payment flows | ⬜ |
| 2.8 | **Hosting information: where is joaocrusbjj.com hosted, and where is the domain registered?** (UNCONFIRMED — do not assume GoDaddy; Pay Links only proves a GoDaddy *payments* account. Also: who built/maintains the site?) | Site access, DNS for email authentication | ⬜ |

## 3. LEAD TRACKING & CRM (current state)

| # | Item | Why we need it | Status |
|---|------|----------------|--------|
| 3.1 | **Are leads tracked anywhere — database, spreadsheet, notebook, or just an email inbox?** | Audit (file 03) found WPForms Lite → email-only, no storage. Confirm nothing else exists | ⬜ |
| 3.1b | **Confirm where form notifications actually deliver.** (Audit assumed joaocrus@gmail.com — UNVERIFIED. Could go to an old/unmonitored address) | If notifications go somewhere dead, leads are being lost silently right now | ⬜ |
| 3.2 | Export/forward of historical inquiries (Gmail search "WPForms"/form notifications) | Win-back campaign fuel — 40–60 reactivations per campaign is the benchmark | ⬜ |
| 3.3 | Any existing email list anywhere (ESP, Skool exports, book buyers, camp parents)? | Seed list + consent assessment | ⬜ |
| 3.4 | Free-class flow today: form → then what? Who replies, how fast, by what channel? | Map the human process before automating it | ⬜ |
| 3.5 | Texting: does he text leads from 512-644-4560 personally? What is 833-532-4152 (the second number on the site)? | SMS automation needs a clear number strategy | ⬜ |
| 3.6 | Chatway live-chat account access + where those chats go | Another lead source to pipe into the CRM | ⬜ |
| 3.7 | Messenger (m.me/joaocrusbjjatx2) — who answers it? | Same | ⬜ |
| 3.8 | Camp/program registrations (6 Weeks, Summer Camp) — where does that buyer data live? | Highest-intent local list we have; nurture to membership | ⬜ |
| 3.9 | **The ad agency: who runs his Facebook ads?** Monthly spend, what campaigns, how long, contract terms, what reporting he gets | NEW FACT (2026-06-11): FB Pixel + an agency running ads exists — never surfaced in the audits. Spend also matters to the baseline conversation. **⏳ PARTIAL (per Joao, secondhand): ~$25/day (~$750/mo); agency is JIU-JITSU-STUDIO-FOCUSED and also CALLS leads + sets appointments (done-for-you setting). Reported problem: many booked appointments NO-SHOW at the studio. Still needed: agency identity, contract terms, reporting, exact spend** | ⏳ |
| 3.10 | **Where do the ad leads go?** (FB lead forms → agency CRM? email? phone?) | A lead list almost certainly exists at the agency (they're calling leads, so they hold the data). Need: where it lives, export rights, and **who owns the leads contractually if they part ways** | ⬜ |
| 3.11 | 🆕 Is he on any marketing platform via the agency (GoHighLevel, etc.) without realizing it? | Agencies commonly run clients on white-labeled GHL — if so, there's an existing CRM/number/funnel to inherit or replace, and it changes the doc 10 architecture conversation | ⬜ |
| 3.12 | 🆕 **The custom Twilio SMS setup he once mentioned** (texting groups of people) — what exists? Account, number, A2P registration status, lists, who built it, still running? | If an A2P-registered Twilio account already exists, we inherit it and **save the 1–2 week registration wait**; existing lists also need consent review | ⬜ |

## 4. ACCESS & CREDENTIALS NEEDED

| # | Item | Needed for | Status |
|---|------|-----------|--------|
| 4.1 | WordPress admin — joaocrusbjj.com | Form replacement, ESP integration, copy fixes, opt-ins | ⬜ |
| 4.2 | **Google Business Profile** — first confirm one EXISTS and Joao controls it (UNVERIFIED — never audited), then manager access | Review engine, posts, map-pack audit — top local channel | ⬜ |
| 4.3 | Facebook page + Instagram access (FB page confirmed via m.me link; whether IG is a business account + Meta Business Suite setup UNVERIFIED) | Native IG insights (follower authenticity check), lead ads later, Messenger automation | ⬜ |
| 4.4 | Google Analytics / Search Console — do they exist? Access if so; create if absent | Baseline traffic; landing-page measurement; local SEO | ⬜ |
| 4.5 | YouTube (both channels) | Consolidation (Phase 1) | ⬜ |
| 4.6 | Skool admin (all 3 communities) | Member exports, consolidation, funnel wiring | ⬜ |
| 4.7 | Gmail (joaocrus@gmail.com) — or at least forwarding/delegate | Historical lead recovery (3.2); rerouting notifications | ⬜ |
| 4.8 | Domain registrar / DNS access (registrar UNCONFIRMED — see 2.8) | Email authentication: SPF/DKIM/DMARC for deliverability — required before any sending | ⬜ |
| 4.9 | Podcast hosting account | Phase 1 consolidation | ⬜ |
| 4.10 | 🆕 **Meta Ads Manager / ad account access — and critically: who OWNS the ad account, Joao or the agency?** | If the agency owns the account/pixel, Joao loses all ad history + pixel data if they part ways. He should own; agency gets partner access | ⬜ |
| 4.11 | 🆕 Twilio account access (if 3.12 confirms one exists) | Inherit number + A2P registration | ⬜ |

## 5. SMS/EMAIL AUTOMATION PREREQUISITES (compliance + setup)

| # | Item | Why we need it | Status |
|---|------|----------------|--------|
| 5.1 | Legal business name, EIN, business address | **A2P 10DLC registration** — required by US carriers before any business SMS can send | ⬜ |
| 5.2 | Decision: which number sends automated SMS (new dedicated number recommended; keep 512-644-4560 personal) | Number strategy + registration | ⬜ |
| 5.3 | Consent status of every existing contact list (did they opt in? to what?) | TCPA/CAN-SPAM compliance; SMS requires express consent — forms must add SMS opt-in checkbox | ⬜ |
| 5.4 | Automation platform decision + budget sign-off | **See doc 10 (automation stack options)** — architecture depends on answers to 2.1/2.2 and budget | ⬜ |
| 5.5 | Who is the "from" voice — Joao personally, or "Team JCBJJ"? Reply handling: who monitors responses? | Automation that nobody answers backfires | ⬜ |
| 5.6 | Sending domain choice (e.g., mail.joaocrusbjj.com) | Deliverability hygiene | ⬜ |

## 6. OPERATIONS CONTEXT (so automation matches reality)

| # | Item | Why we need it | Status |
|---|------|----------------|--------|
| 6.1 | Who (besides Joao) can handle leads/tours/intro classes? | Routing + escalation in the automation | ⬜ |
| 6.2 | Class capacity per slot; which classes have room | "Marketing amplifies weaknesses" — don't fill what can't absorb | ⬜ |
| 6.3 | Typical lead response time today | Baseline KPI; target <5 min automated | ⬜ |
| 6.4 | Trial → enrollment conversion (gut feel ok) | Baseline KPI | ⬜ |
| 6.5 | What is "Primal Flow Practice"? (seen on IG, not on site) | Offer-map completeness | ⬜ |
| 6.6 | Annual retention gut-check: of 10 kids who join, how many still train a year later? | Against 66.4% industry median | ⬜ |

---

## 7. WHAT THE ANSWERS UNBLOCK — THE AUTOMATION MAP (build order)

Once sections 1–5 land, this is the stack we build:

1. **Speed-to-lead (the big one):** form/chat/Messenger lead → CRM record → instant SMS + email ("Got your request — want Tuesday 5:15 or Saturday 10am?") → booking link → coach notified. Target <5 min, 24/7.
2. **Show-up sequence:** booking confirmation → reminder SMS 24h + 2h before free class/Kickstart → directions/what-to-bring email.
3. **No-show / no-book recovery:** didn't book in 48h → 3-touch nurture; booked-but-missed → reschedule SMS.
4. **Trial → join:** post-class same-day SMS from Joao's voice → 5-email value sequence (the "regulate not win" story, parent testimonials, pedigree) → enrollment offer (value-add, never discount).
5. **New-member onboarding:** welcome email, waiver, billing setup, "first 30 days" expectations, parent communication rhythm (Joao already wrote this framework in Skool).
6. **Retention triggers:** missed 2 weeks of classes → check-in SMS; stripe/belt promotion → review-request + referral ask (feeds GBP engine + Buddy Week).
7. **Win-back:** historical leads (3.2) + lapsed members → seasonal campaign (the "Jiu-Jitsu Santa" pattern: 40–60 reactivations/campaign benchmark).
8. **List nurture:** weekly email from the content flywheel; camp/program buyers nurtured toward membership.

## 8. PRIORITY ORDER (if Joao can only do a little at a time)
1. **§3.1–3.2 + §2.1** — where leads/billing live today (determines the whole architecture)
2. **§1.1–1.4 + 1.8–1.9** — pricing, counts, revenue records (baseline!), budget comfort (finalizes doc 07 §4 + locks doc 10 architecture + anchors the rev-share agreement)
3. **§4.1, 4.2, 4.8** — WordPress, GBP, DNS access (lets the build start)
4. **§5.1–5.3** — business info + consent (starts the ~1–2 week A2P/SMS registration clock early)
5. Everything else as we go.

---

## CHANGE LOG
- 2026-06-10 — Doc created; all items ⬜.
