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

---

## 3. RECOMMENDATION & DECISION LOGIC

**Default recommendation: Option B** — Gymdesk-or-Kicksite for ops + GoHighLevel-class platform for the automation, with us operating the marketing side.

Decision gates (in order):
1. **Intake 2.2:** if Joao already pays for gym software with usable billing/attendance → keep it, bolt the marketing platform on (Option B with his incumbent), migrate later only if it fights us.
2. **Intake 2.1:** if billing is fully manual (Venmo/cash/invoices) → gym software is non-negotiable Phase 0 regardless of option.
3. **Agency question (ours):** GHL agency license yes/no. Yes → Option B is near-automatic. No → re-compare Option A's native automations (Kicksite/Spark) against a single standalone GHL sub-account.
4. **Budget (intake 5.4):** if total tooling must stay under ~$150/mo all-in → Option A, accepting weaker automation.

**What we can decide now without Joao:** the marketing-platform class (GHL-class) and that Chatway gets replaced by the platform's widget. **What waits for intake:** gym-software pick (his current billing reality decides it) and final budget sign-off.

---

## 4. NEXT ACTIONS
- [ ] Us: confirm whether we have / will get a GoHighLevel agency license (or pick the equivalent we standardize on)
- [ ] Verify current pricing + A2P support for: Gymdesk, Kicksite, Spark Membership, GHL
- [ ] On intake answers 2.1/2.2/5.4 → lock the architecture, document the pick + monthly cost here
- [ ] Map the integration seam (gym software → marketing platform events) once both are chosen

## CHANGE LOG
- 2026-06-10 — Doc created; architecture open pending intake + agency-license decision.
