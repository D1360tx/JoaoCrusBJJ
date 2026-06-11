# Orchestration Repo Spec — "Gym Growth Stack" v1
### The custom automation layer from doc 10 Option D: scope, schema, flows, sprint plan
> Created 2026-06-11. Status: SPEC — build starts on the sprint go-decision.
> Principle (from doc 10): custom = orchestration ONLY. Billing/SMS/email/booking stay on Stripe/Twilio/Resend/Cal.com. Multi-tenant from day one (this is the productized asset for future clients).

---

## 1. GOALS & NON-GOALS

**v1 must do (definition of done):**
- A lead who submits the website form at 9pm gets an SMS + email back within 2 minutes, with a booking link.
- Booked leads get reminders (T-24h, T-2h). No-books and no-shows get recovery sequences.
- Every contact, message, and status change is recorded; the pipeline is visible in a simple admin UI.
- STOP/opt-out works correctly; nothing sends outside quiet hours.
- A revenue dashboard shows month-to-date gross (from Stripe) vs. the agreed baseline — the rev-share number.

**v1 explicitly does NOT do:**
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
messages        id, org_id, contact_id, channel (sms|email), direction (in|out),
                body, template_id?, provider_sid, status (queued|sent|delivered|failed), created_at
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

- **Website form:** replace WPForms with a plain HTML form (or keep WPForms + webhook add-on) POSTing to `/api/webhooks/form`. Honeypot + rate-limit. SMS-consent checkbox REQUIRED on the form (TCPA) — copy: "Yes, text me about my free class."
- **Chatway / Messenger:** v1 = leave as-is, log manually; phase 2 = pipe in or replace with our widget.
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
| **1 — Capture** | Repo scaffold, schema + RLS, form endpoint, contact/pipeline records, instant email autoresponder, admin auth + contact list. **Submit A2P registration day 1.** Stripe account + first Payment Links. | Form submission → stored + email reply in <2 min. Leads visible in admin. A2P pending. |
| **2 — SMS + booking** | Twilio send/receive + guardrails, speed-to-lead SMS (once A2P clears), Cal.com events + reminder sequences, inbound-reply pause + operator notify. | Test lead gets SMS+email, books, gets reminders; reply pauses sequence; STOP works. |
| **3 — Pipeline + recovery** | No-book/no-show/trial-nurture sequences, pipeline UI complete, broadcasts (win-back to historical leads from intake 3.2), templates editable. | Full lead lifecycle runs hands-off; first win-back campaign sent. |
| **4 — Revenue + hardening** | Stripe webhooks → memberships, onboarding sequence, dashboard w/ baseline comparison, runbook docs (the bus-factor mitigation), error alerting. | Dashboard shows MTD vs baseline from live Stripe data. Runbook lets a stranger operate it. |

**Dependencies from intake (can't start week 2+ without):** §5 business details (A2P), §1 pricing (Stripe products), 3.2 historical leads (win-back), form access (WordPress or hosting).

## 9. PHASE 2 BACKLOG (post-v1, prioritized)
1. AI receptionist: Claude API drafts replies to inbound SMS (FAQ + booking), operator-approved → later auto-send within rules
2. Check-in kiosk (tablet at front desk) → attendance → "missed 2 weeks" retention trigger + review-request on promotions
3. Review-request automation (post-promotion, post-positive-interaction) → GBP link
4. Chat widget replacing Chatway, piped into pipeline
5. Multi-tenant onboarding flow (client #2)

## 10. OPEN DECISIONS
- [ ] Repo name + GitHub org/location (new private repo — confirm and I scaffold it)
- [ ] Subdomains: mail.joaocrusbjj.com (email), book.* (Cal.com) — needs DNS access (intake 2.8/4.8)
- [ ] Operator notification channel for inbound replies (SMS to whom? email? both?)
- [ ] WPForms+webhook vs. replace form outright (depends on WP access)
- [ ] Joao's admin access in v1, or operate it fully ourselves initially?

## CHANGE LOG
- 2026-06-11 — Spec drafted; pending sprint go-decision + intake dependencies.
