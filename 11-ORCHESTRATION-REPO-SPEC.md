# Orchestration Repo Spec — "Gym Growth Stack" v1
### The custom automation layer from doc 10 Option D: scope, schema, flows, sprint plan
> Created 2026-06-11. **Status: GO — sprint approved 2026-06-11.** Blocked only by intake dependencies (§8) and open decisions (§10).
> Principle (from doc 10): custom = orchestration ONLY. Billing/SMS/email/booking stay on Stripe/Twilio/Resend/Cal.com. Multi-tenant from day one (this is the productized asset for future clients).
> Scope update 2026-06-11: **custom landing page added as the front door** (§5.1); WordPress surgery de-scoped — we run parallel to Joao's existing site, we don't touch it.

---

## 1. GOALS & NON-GOALS

**v1 must do (definition of done):**
- A lead who submits the website form at 9pm gets an SMS + email back within 2 minutes, with a booking link.
- Booked leads get reminders (T-24h, T-2h). No-books and no-shows get recovery sequences.
- Every contact, message, and status change is recorded; the pipeline is visible in a simple admin UI.
- STOP/opt-out works correctly; nothing sends outside quiet hours.
- A revenue dashboard shows month-to-date gross (from Stripe) vs. the agreed baseline — the rev-share number.

**v1 explicitly does NOT do:**
- **Paid ads (DECIDED 2026-06-11):** we do NOT run ads or touch the agency's lane in v1. Lead sources for our flow: referrals (Buddy Week), GBP/local SEO, IG/content, win-back of historical leads, camp/program buyer nurture — all routed to our landing page. We run fully parallel to the agency with our own system and full flow control. Ads are a future option — and by then the landing page, tracking, and pipeline already exist and are Joao-owned, making it a switch-flip, not a build.
- Attendance/check-in (phase 2 — retention triggers depend on it)
- AI receptionist (phase 2 — manual replies first, AI drafts later)
- Content/social automation, Skool integration, GBP posting
- Replacing the WordPress site

## 2. STACK

| Concern | Choice | Notes |
|---|---|---|
| App + admin UI + API | **Next.js (App Router, TypeScript) on Vercel** | One deployable: webhook endpoints, cron handlers, admin pages |
| Database + auth | **Supabase (Postgres + Auth)** | Free tier fine at this scale; RLS by org_id |
| SMS | **Twilio** | Messaging Service + A2P 10DLC; Advanced Opt-Out (STOP/HELP) enabled |
| Email | **Resend** | Custom subdomain (e.g., mail.joaocrusbjj.com) w/ SPF/DKIM/DMARC; reply-to = monitored inbox |
| Booking | **Cal.com** (free tier) | Event type per intro-class slot; webhooks → bookings table |
| Billing | **Stripe Billing** | Subscriptions per membership tier; webhooks → memberships + revenue dashboard |
| Scheduler | **Vercel Cron** → tick endpoint every 5 min | Drives the sequence engine |
| Repo | New private GitHub repo (name TBD, e.g. `gym-growth-stack`) | NOT in this docs repo |

Run cost: ~$0–25/mo infra + Twilio usage (~$5–15/mo) + Resend ($0–20) = **within the $15–50/mo target** (doc 10).

## 3. DATA MODEL (Postgres)

```
orgs            id, name, timezone, quiet_hours, sms_from, review_link, booking_url
contacts        id, org_id, first/last, phone (E.164, unique per org), email,
                role (lead|parent|student|member), source (webform|chat|messenger|walkin|import),
                sms_consent {granted_at, source}, email_consent {...}, opted_out_at
students        id, org_id, contact_id (guardian), name, birthdate, program, belt  -- phase 2 depth
pipeline        id, org_id, contact_id, status (new|contacted|booked|showed|trial|member|lost),
                status_changed_at, lost_reason
messages        id, org_id, contact_id, channel (sms|email|call), direction (in|out),
                body, template_id?, provider_sid, status (queued|sent|delivered|failed), created_at
calls           id, org_id, contact_id?, tracking_number_id, from_e164, status (answered|missed|voicemail),
                duration_s, recording_url?, created_at
tracking_numbers id, org_id, e164, source_label (landing_page|gbp|ig_bio|print), forwards_to
templates       id, org_id, key, channel, subject?, body (vars: {{first_name}}, {{booking_url}}, ...)
sequences       id, org_id, key (speed_to_lead|no_book_recovery|no_show|trial_nurture|onboarding|winback)
sequence_steps  id, sequence_id, step_no, offset_minutes, channel, template_id, stop_if (booked|replied|joined)
enrollments     id, org_id, contact_id, sequence_id, current_step, next_run_at,
                state (active|paused_human_reply|completed|cancelled)
bookings        id, org_id, contact_id, calcom_uid, slot_at, status (booked|showed|no_show|cancelled)
memberships     id, org_id, contact_id, stripe_customer_id, stripe_sub_id, status, mrr_cents, started_at
events          id, org_id, contact_id?, type, payload jsonb, created_at   -- append-only audit/attribution
baseline        org_id, monthly_gross_cents, methodology_text, agreed_at    -- the rev-share anchor
```

## 4. THE ENGINE (how sequences run)

1. **Triggers create enrollments:** form webhook → `speed_to_lead`; Cal.com `booking.created` → reminders + cancel `no_book_recovery`; `no_show` marked → recovery; Stripe `checkout.completed` → `onboarding`; manual/segment → `winback`.
2. **Cron tick (5 min):** select active enrollments with `next_run_at <= now()` → render template → **guardrails** → send → log message → advance step or complete.
3. **Guardrails (every send):** opted_out? consent for channel? inside quiet hours (org timezone, default 8am–8:30pm)? stop-condition met (booked/replied/joined)? duplicate suppression (no identical template to same contact within 24h).
4. **Inbound SMS webhook:** match contact by phone → log message → **pause that contact's active enrollments** (`paused_human_reply`) → notify operator (SMS/email forward to Joao/us) → operator replies from admin UI. STOP/HELP handled by Twilio Advanced Opt-Out + we mirror `opted_out_at`.
5. **Speed-to-lead special case:** triggers send-immediately on the webhook itself (not the next tick) — the <2 min promise.

## 5. INTEGRATION SEAMS

### 5.1 The front door: custom landing page (scope addition, replaces WP form surgery)
**Decision (2026-06-11): we do NOT touch Joao's WordPress site.** Instead we build a custom landing page (same repo, Next.js route or separate marketing route group) that becomes the destination for everything WE drive — ads, GBP, IG bio, QR codes — and runs parallel to joaocrusbjj.com.

- **Why:** his current surfaces are incongruent (typos, buried pedigree, mixed audiences — docs 02–06); a clean page is faster to build than WP archaeology, fully measured, and carries zero risk to his live site or whatever his ads agency depends on. Competitive angle (doc 12): Stoic runs a templated 97-Display-style funnel and all three DS schools push the same commodity "free week" — a custom authority-driven page (book, lineage, 500+ families, named method) competes on a dimension templates can't reach.
- **Content = doc 07 positioning, executed properly:** pedigree line above the fold (Carlson Gracie & De La Riva lineage • 25+ yrs • 500+ families since 2003 • author), kids/family-specialist framing ("the other gyms teach kids jiu-jitsu; he wrote the book on it"), real social proof (video testimonials exist — file 02), the book as credibility artifact, clear single CTA (free intro class / Confidence Kickstart), FAQ for the intimidation barrier, mobile-first, fast.
- **Form lives here** → `/api/webhooks/form` directly (honeypot + rate-limit), with the REQUIRED SMS-consent checkbox (TCPA): "Yes, text me about my free class."
- **Tracking from day one:** GA4 + (his existing) Meta Pixel + UTM discipline — every channel measurable, which the old site never was.
- **Domain:** subdomain (start.joaocrusbjj.com — needs only a DNS record, not WP access) or standalone domain; open decision §10.
- WordPress site later gets a simple link/redirect to the landing page; that's the entire extent of WP changes.

### 5.2 Other seams
- **Chatway / Messenger:** v1 = leave as-is, log manually; phase 2 = pipe in or replace with our widget.
- **Meta lead ads (NEW):** his agency runs FB ads — if/when those use lead forms, subscribe a Meta Leadgen webhook → same pipeline as the form (speed-to-lead applies to ad leads too). Coordinate with the agency; requires Ads Manager access (intake 4.10).
- **Agency overlap — VERIFY BEFORE BUILDING ON IT (intake 3.13):** the agency does human calling + appointment setting, and Joao reports booked appointments frequently no-show. ⚠️ Do NOT assume the show-up layer is missing — an appointment-setting agency very likely already sends confirmation SMS, reminders, what-to-expect, and runs no-show recovery. Two scenarios, different plays:
  - **(a) They don't do reminders/recovery** → our flows 2–3 fill a real gap and monetize the existing ~$25/day spend; agency feeds booked appointments into our pipeline.
  - **(b) They DO — and no-shows are still high** → reminders aren't the bottleneck; diagnosis shifts to lead quality / offer strength / speed-to-contact / intent filtering. Our levers become the landing page + paid-intro qualification (doc 07's $49 Kickstart filters for seriousness) and measurement of the full funnel, not duplicate messaging. Duplicate SMS from two systems to the same lead is actively harmful — sequence ownership must be agreed with the agency either way.
  - Either way we need the funnel numbers: leads → contacted → booked → showed → joined, and **the full agency cost structure** (retainer? % of ad spend? per-appointment? per-show?) on top of the ~$750/mo spend — total acquisition cost feeds the baseline/ROI math.
- **Existing Twilio (NEW, intake 3.12):** if Joao's old custom SMS setup has a registered A2P account, inherit the account/number instead of registering fresh — saves 1–2 weeks. Audit any stored lists for consent before use.

### 5.3 Call tracking (Twilio Voice — same account as SMS) 🆕
Phone is Joao's primary conversion channel (FB offer = "call us"; site pushes call/text), and nothing tracks it today. Decision: **custom on Twilio**, not Ringba (pay-per-call affiliate tooling — wrong category) and not CallRail (fine zero-build fallback at ~$45/mo, unnecessary given Twilio is already in-stack).

- **v1 scope:** 2–3 local (512) tracking numbers — one each for landing page, GBP, IG bio — forwarding to the studio/Joao's cell. Twilio Voice webhooks log every call (`calls` table), match caller ID to contacts, optional recording (TX is one-party consent; still play a brief disclosure whisper if recording).
- **⭐ Missed-call text-back:** unanswered/voicemail during class hours → instant SMS ("Sorry we missed you! This is Joao Crus BJJ — want to grab a spot for a free class? Book here: …") → contact enters speed-to-lead. Joao teaches all day; missed calls are likely a major silent leak. Plausibly the highest-ROI voice feature.
- **GBP note:** tracking number goes in the GBP "primary phone" slot with the real number as "additional" (preserves NAP consistency for local SEO).
- **Phase 2:** dynamic number insertion (DNI) on the landing page for per-campaign attribution; per-source reporting in dashboard.
- **⚠ Intake tie-in (3.5):** the mystery 833-532-4152 on the website may ALREADY be a call-tracking number provisioned by his agency — if so, his call data flows into their system today (same owned-asset problem as the pixel/leads). Confirm who provisioned it before porting/replacing anything.
- **Stripe:** Payment Links per tier for migration ease → webhooks (`checkout.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.*`) update memberships + revenue dashboard. Smart Retries ON.
- **Cal.com:** webhooks `BOOKING_CREATED/CANCELLED/RESCHEDULED`; "showed/no-show" marked manually in admin v1.

## 6. ADMIN UI (minimal, 4 screens)

1. **Pipeline** — list grouped by status, age-of-lead highlighted, quick actions (mark showed/no-show, move stage).
2. **Contact detail** — full SMS/email thread, timeline of events, manual send box, enrollment controls.
3. **Broadcasts** — pick segment (e.g., "lost > 90 days") → template → schedule (win-back campaigns).
4. **Dashboard** — funnel counts (lead→booked→showed→joined), response-time stat, **MTD gross vs. baseline (the rev-share number)**.

Auth: Supabase magic-link, two users (us + Joao), org-scoped.

## 7. COMPLIANCE CHECKLIST (build-blocking)

- [ ] A2P 10DLC: register brand + campaign (sole-prop or EIN path — intake §5) BEFORE any SMS
- [ ] Twilio Advanced Opt-Out enabled; STOP confirmed working end-to-end
- [ ] SMS consent checkbox on every form; consent timestamp+source stored
- [ ] Quiet hours enforced in code (not convention)
- [ ] Email: SPF/DKIM/DMARC on sending subdomain; CAN-SPAM footer + unsubscribe in nurture/broadcast emails
- [ ] Data: phone/email PII stays in Supabase; no PII in logs

## 8. SPRINT PLAN (4 weeks, exit criteria per week)

| Week | Build | Exit criteria |
|---|---|---|
| **1 — Capture** | Repo scaffold, schema + RLS, form endpoint, contact/pipeline records, instant email autoresponder, admin auth + contact list. **Landing page v1 (§5.1) with consented form + GA4/Pixel.** **Submit A2P registration day 1** (or inherit Joao's Twilio, intake 3.12). Stripe account + first Payment Links. | Landing page live; form submission → stored + email reply in <2 min. Leads visible in admin. A2P pending/inherited. |
| **2 — SMS + booking** | Twilio send/receive + guardrails, speed-to-lead SMS (once A2P clears), Cal.com events + reminder sequences, inbound-reply pause + operator notify. **Call tracking v1 (§5.3): tracking numbers live, call logging, missed-call text-back.** | Test lead gets SMS+email, books, gets reminders; reply pauses sequence; STOP works. Missed test call → text-back in <1 min, call visible in admin. |
| **3 — Pipeline + recovery** | No-book/no-show/trial-nurture sequences, pipeline UI complete, broadcasts (win-back to historical leads from intake 3.2), templates editable. | Full lead lifecycle runs hands-off; first win-back campaign sent. |
| **4 — Revenue + hardening** | Stripe webhooks → memberships, onboarding sequence, dashboard w/ baseline comparison, runbook docs (the bus-factor mitigation), error alerting. | Dashboard shows MTD vs baseline from live Stripe data. Runbook lets a stranger operate it. |

**Dependencies from intake (can't start week 2+ without):** §5 business details (A2P — or 3.12 Twilio inheritance), §1 pricing (Stripe products), 3.2 historical leads (win-back), DNS record for the landing-page subdomain (2.8) — note: WordPress access is NO LONGER build-blocking (§5.1).

## 9. PHASE 2 BACKLOG (post-v1, prioritized)
1. AI receptionist: Claude API drafts replies to inbound SMS (FAQ + booking), operator-approved → later auto-send within rules
2. Check-in kiosk (tablet at front desk) → attendance → "missed 2 weeks" retention trigger + review-request on promotions
3. Review-request automation (post-promotion, post-positive-interaction) → GBP link
4. Chat widget replacing Chatway, piped into pipeline
5. Multi-tenant onboarding flow (client #2)
6. Call tracking phase 2: DNI on landing page, per-source call reporting, voicemail transcription (Claude API) → lead notes

## 10. OPEN DECISIONS
- [ ] Repo name + GitHub org/location (new private repo — confirm and I scaffold it)
- [ ] Landing-page domain: start.joaocrusbjj.com subdomain (1 DNS record) vs. standalone domain (zero dependence on his DNS, weaker local-SEO tie) — leaning subdomain
- [ ] Subdomains: mail.joaocrusbjj.com (email), book.* (Cal.com) — needs DNS access (intake 2.8/4.8)
- [ ] Operator notification channel for inbound replies (SMS to whom? email? both?)
- [ ] ~~WPForms+webhook vs. replace form~~ RESOLVED: custom landing page is the capture surface; WP untouched (§5.1)
- [ ] Joao's admin access in v1, or operate it fully ourselves initially?
- [ ] Agency coordination: how our landing page + flows coexist with the agency's current ad funnel (where do THEIR leads route — into our pipeline ideally; intake 3.9/3.10 first)

## CHANGE LOG
- 2026-06-11 — Spec drafted; pending sprint go-decision + intake dependencies.
