# Automation Stack — Options & Decision Framework
### What software runs the email/SMS automation (and the membership backend it feeds off)
> Created 2026-06-10. Companion to 08 (intake) — final pick depends on intake answers 2.1 (how billing works today), 2.2 (any existing gym software), and budget sign-off (5.4).
> ⚠️ Pricing below is ballpark from general knowledge — **verify current pricing on vendor sites before presenting numbers to Joao.**

---

## 1. WHAT THE STACK MUST DO (requirements, from the 8-flow map in 08 §7)

**Marketing/automation side:**
- Capture leads from web forms, chat widget, and Messenger into one pipeline (no more inbox-only)
- Instant 2-way **SMS + email**, triggered sequences, segmentation/tags
- Booking calendar with automated confirmations + reminders
- Pipeline view (lead → booked → showed → trial → member)
- Review-request automation (Google)
- Win-back / broadcast campaigns
- **A2P 10DLC registration support** built in (US business SMS requirement)

**Membership/ops side:**
- Recurring billing with **failed-payment auto-recovery**
- Attendance/check-in tracking (feeds retention triggers: "missed 2 weeks → check-in text")
- Member database (belt rank, family links, start dates), digital waivers

No single tool is best-in-class at both sides — hence the architecture question.

---

## 2. THE THREE ARCHITECTURE OPTIONS

### Option A — All-in-one martial-arts gym software (one system does everything)
Candidates: **Kicksite** (martial-arts-specific, built-in SMS/email automations), **Gymdesk** (clean UX, martial-arts friendly, automations + waivers), **Spark Membership** (martial-arts-focused, marketing-heavy), Zen Planner, PushPress.

- ✅ One login, one bill, one place for Joao's staff. Billing + attendance + basic automations together. Retention triggers are native (attendance data lives in the same system).
- ❌ Marketing automation is the weak side: shallower sequence logic, weaker pipelines, limited review/booking-funnel tooling. SMS capability and A2P handling vary by vendor — must verify per candidate.
- 💰 Ballpark $75–200/mo.
- **Best if:** budget is tight, Joao's team will operate it themselves, and we accept "good enough" automation.

### Option B — Two-piece stack: gym software (ops) + marketing platform (funnels)  ⭐ recommended default
**Gym side:** Gymdesk or Kicksite (billing, attendance, waivers, member DB).
**Marketing side:** a GoHighLevel-class platform (forms/funnels, 2-way SMS+email, pipelines, booking calendar, review-request automation, web-chat widget, Messenger/IG DM integration, built-in A2P 10DLC registration). Alternatives in class: Keap, ActiveCampaign+SMS add-on (weaker fit).

- ✅ Best-in-class on BOTH sides. GoHighLevel-class tools are purpose-built for exactly the 8-flow map (speed-to-lead, no-show recovery, review engine, win-back). The web-chat widget can replace Chatway and pipe chats into the same pipeline.
- ✅ If we (the agency) run a GoHighLevel agency account, Joao becomes a sub-account — we operate it, white-label it, and the marginal cost is low. **Open question for us, not Joao: do we already have/want an agency GHL license?**
- ❌ Two systems = an integration seam (webhook/Zapier sync of "new member" / attendance events for retention triggers) and two bills (unless agency-absorbed).
- 💰 Ballpark: gym software $75–150/mo + GHL $97/mo standalone (or ~$297/mo agency unlimited across all our clients) + SMS usage (~1¢/msg) + A2P registration fees (one-time + small monthly).
- **Best if:** we're operating the marketing side as the agency (which is the plan) and Joao's team only touches the gym software.

### Option C — ESP-only interim (MailerLite/ConvertKit, as doc 06 originally suggested)
- ✅ Cheapest, fastest to stand up; fixes "no email list" this week.
- ❌ No SMS, no pipeline, no booking, no review engine — it covers 1 of the 8 flows. Doc 06 predates the SMS requirement; treat this as a stopgap only.
- **Use only as:** a week-1 bridge (capture + autoresponder) while A/B decision and A2P registration are in flight — and only if the chosen platform can import the list cleanly.

### Option D — Lean custom stack (AI-built orchestration on proven rails)  🆕
Custom code (Claude/Codex-assisted) handles ONLY the orchestration layer; all risky infrastructure stays on boring, proven services:

| Layer | Service | ~Cost/mo |
|---|---|---|
| Recurring billing + failed-payment recovery | **Stripe Billing** (smart retries/dunning + customer portal built in) | $0 + processing fees |
| SMS (2-way) | **Twilio direct** (incl. A2P 10DLC registration) | ~$5–15 at his volume |
| Email delivery | Resend / Postmark | $0–20 |
| Booking + reminders | Cal.com (free tier) or custom | $0 |
| Lead/member DB + pipeline | Supabase (or similar) + simple admin UI | $0–25 |
| Glue/sequences | Custom code, cron + webhooks (Cloudflare Workers/Vercel) | $0–20 |
| 🆕 AI receptionist (later) | Claude API answering lead SMS FAQs + booking | pennies/conversation |
| **Total** | | **~$15–50/mo** vs $170–450/mo for A/B |

- ✅ ~$150–400/mo recurring overhead eliminated — easier budget sign-off from Joao, and overhead doesn't eat the above-baseline revenue pool.
- ✅ We own it: client-agnostic build = a productized "gym growth stack" deployable to future clients at ~$30/mo marginal cost. This engagement doubles as paid R&D.
- ✅ AI features (SMS receptionist, lead scoring, content repurposing) are native API calls, not SaaS upsells.
- ❌ Build cost: realistically a 2–4 week AI-assisted sprint before flows are live. **The leak stays open while we build.**
- ❌ Bus factor: we are the maintainer. Mitigated by (a) all infra on standard services that keep running without us, (b) everything in a documented repo, (c) exportable data, (d) SaaS migration always possible as an exit.
- 🚫 **Never custom:** payment processing itself (Stripe), email delivery infra, SMS carrier plumbing. Custom = orchestration only.

---

## 3. THE COMPENSATION-MODEL FACTOR (changes the decision logic)

Context: our compensation is currently trade (group classes) with a planned move to **% of revenue above an established baseline.** Three consequences:

1. **Speed beats overhead.** Our upside comes from converted leads, not saved subscriptions. Every week without speed-to-lead is above-baseline revenue that never existed. → **The custom build is never allowed to block the launch.**
2. **The billing system is our pay stub.** "Revenue above baseline" can't be computed from GoDaddy pay links + cash. Migrating memberships to **Stripe Billing (or gym software) is step one regardless of architecture** — it's the auditable source of truth for both Joao's ops and our compensation.
3. **Baseline mechanics (agree in writing BEFORE the work moves the number):**
   - **The baseline is HISTORICAL** — a trailing average of monthly gross revenue looking *backward* from the agreement date, reconstructed from existing records (GoDaddy payment history, bank deposits, documented cash). It is NOT measured on the new billing system after the fact — waiting would let our own growth work inflate the baseline and donate our impact to it.
   - **Window: prefer trailing 12 months** (a BJJ school is seasonal — summer camps, fall enrollment surges — and a 6-month window is biased by whichever half it covers). Use 6 months only if records don't go back further, and note the season it covers.
   - **The new billing system measures the FORWARD side only:** each month's actual gross (from Stripe) minus the agreed baseline = the pool our % applies to.
   - **Fairness note, both directions:** cleaner capture (autopay, recovered failed payments, recorded cash) will make revenue *look* higher on day one. Failed-payment recovery genuinely IS our work and should count; previously-unrecorded cash is not growth. Fix: build the baseline from ALL documentable revenue including cash estimates, write down the methodology, and have both parties sign off on one number. Simple and documented beats precise and contested.
4. **Low overhead helps sign-off** and protects the above-baseline pool — a genuine (secondary) argument for Option D.

## 4. RECOMMENDATION & DECISION LOGIC (revised)

**DECIDED 2026-06-11: Option D (lean custom), sprint is a GO.** Stripe Billing first, hard speed gate retained.

Context on the GHL question: we're separately launching trybookedout.com (likely GHL-based), so a GHL symbiosis exists on our side — but that would be OUR sub-account economics, and Joao-on-our-GHL entangles client infrastructure with our other venture. Custom keeps Joao's stack independently owned and exportable. One discovery item still open before final lock: **Joao's agency may already have him on GHL or similar without him realizing it (intake 3.11), and he has mentioned a custom Twilio texting setup (intake 3.12)** — understanding his existing backend comes first; we inherit anything useful (especially an A2P-registered Twilio account).

Decision gates (in order):
1. **Always, week 1, regardless of option:** stop the lead leak — form submissions stored + instant autoresponder (even Option C-style). Begin Stripe Billing migration + A2P registration (longest lead-time item — unless intake 3.12 reveals an existing registered Twilio account to inherit).
2. ~~The speed gate~~ **RESOLVED: custom from day one** (sprint committed; build spec = doc 11).
3. **Intake 2.2:** if Joao already pays for working gym software → keep it for ops/attendance; custom layer handles marketing flows only.
4. **Attendance/check-in:** decide after intake — simple custom check-in kiosk is very buildable, but Gymdesk-class (~$75/mo) is an acceptable interim if the sprint needs to stay focused on lead flows.
5. **Budget (intake 1.9/5.4):** Joao's monthly comfort number determines how much SaaS we can bridge with vs. how aggressive the custom timeline must be.

**What we can decide now without Joao:** Stripe Billing as the membership rail; Twilio as the SMS rail; custom-orchestration-as-default. **What waits:** our sprint-availability call, his current billing reality (2.1/2.2), budget number, baseline records.

---

## 5. NEXT ACTIONS
- [ ] **Us: make the speed-gate call — can the 2–4 week build sprint start now?** (This is the fork.)
- [ ] Draft the baseline/rev-share agreement structure (trailing 6-mo avg, billing-system-measured) for the conversation with Joao
- [ ] Week-1 leak fix: form storage + autoresponder (independent of architecture)
- [ ] Start A2P 10DLC registration via Twilio as soon as intake §5 business details arrive
- [ ] Verify current pricing: Stripe/Twilio/Resend fees; Gymdesk/Kicksite/GHL (if bridging)
- [ ] If Option D proceeds: spec the orchestration repo (schema, flows from 08 §7, deploy target) — buildable in this workspace
- [ ] On intake answers → lock architecture + document monthly cost here

## CHANGE LOG
- 2026-06-10 — Doc created; architecture open pending intake + agency-license decision.
