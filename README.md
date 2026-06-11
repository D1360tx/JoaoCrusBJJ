# JaoCrusBJJ — Centralized Project Log

Working hub for the Joao Crus BJJ marketing & business-restructuring engagement.
Goal: grow private clients + group students, build the digital/info-product side, and
position Joao as a renowned BJJ authority with a cohesive brand and a real value ladder.

## Client snapshot
- **Joao Crus** — BJJ black belt (Carlson Gracie & Ricardo De La Riva lineage), 25+ yrs, founded academy 2003.
- **Academy:** Joao Crus Brazilian Jiu-Jitsu — Dripping Springs, TX (Austin metro). 500+ families.
- **Also:** 2 Amazon books, "Blackbelt Parenting Life" podcast, instructional DVD curriculum, 3 Skool communities.

## Index
| File | What's in it |
|------|--------------|
| [00-PROFILE.md](00-PROFILE.md) | Master profile — bio, contacts, offerings, books |
| [01-SKOOL-COMMUNITIES.md](01-SKOOL-COMMUNITIES.md) | The 3 Skool communities (audiences, pricing, offers) |
| [02-WEBSITE-AUDIT.md](02-WEBSITE-AUDIT.md) | Full joaocrusbjj.com content audit (12 pages) |
| [03-ECOSYSTEM-AND-LEADFLOW.md](03-ECOSYSTEM-AND-LEADFLOW.md) | Podcast, expanded bio, + lead-capture/ESP audit |
| [04-DVD-STORE-AND-YOUTUBE.md](04-DVD-STORE-AND-YOUTUBE.md) | justjiuit.com DVD store + YouTube |
| [05-INSTAGRAM.md](05-INSTAGRAM.md) | Instagram audit (8K followers, dead engagement) |
| [06-MASTER-AUDIT-AND-PLAN.md](06-MASTER-AUDIT-AND-PLAN.md) | **Flagship: full audit + restructuring/growth plan** |
| [07-MARKET-BASELINE-AND-POSITIONING.md](07-MARKET-BASELINE-AND-POSITIONING.md) | **US BJJ market research (2026) mapped to Joao → positioning, pricing, re-sequenced plan** |
| [08-NEEDED-FROM-JOAO.md](08-NEEDED-FROM-JOAO.md) | **Intake checklist: pricing, billing backend, lead tracking, access — unblocks email/SMS automation build** |
| [09-OUTREACH-DRAFT-JOAO.md](09-OUTREACH-DRAFT-JOAO.md) | Outreach drafts: intake email + text version + plain-language shared checklist for Joao |
| [10-AUTOMATION-STACK.md](10-AUTOMATION-STACK.md) | Automation architecture: SaaS options vs. lean custom stack (Option D, recommended) + comp-model factor + baseline mechanics + decision gates |
| [11-ORCHESTRATION-REPO-SPEC.md](11-ORCHESTRATION-REPO-SPEC.md) | **Build spec for the custom stack: schema, sequence engine, compliance, 4-week sprint plan** |
| [12-AD-INTEL-SWEEP-2026-06.md](12-AD-INTEL-SWEEP-2026-06.md) | First competitive ad-intel sweep: competitor offers/funnels, agency shortlist, ad-pattern playbook (Ad Library itself needs a 20-min browser pass — §7) |
| [assets/joao-shared-checklist.md](assets/joao-shared-checklist.md) | Clean client-facing checklist — paste into Google Doc and share with Joao |

## Core thesis
Elite raw material, fragmented presentation. Consolidate 8+ scattered surfaces into
**one authority brand (Joao Crus) → one email list → three clean product lines**
(Local Academy · Coaches/B2B · Boundary Guard adults+corporate).

## Status log
- **2026-06-09** — Intelligence gathering complete (files 00–05). Master audit & plan drafted (06).
- **2026-06-10** — Repo created; centralized log established.
- **2026-06-10** — Market baseline research merged; positioning + pricing architecture + re-sequenced roadmap drafted (07). New Phase-0 items: gym-management software, GBP/review engine, competitor map (Stoic, JJ Machado DS), no-discount rule, $49 paid-intro rung.
- **2026-06-10** — Intake checklist created (08): 40+ tracked items across pricing, billing backend, lead tracking, access/credentials, SMS compliance, ops — with the 8-flow automation map they unblock. Next: send priority items (08 §8) to Joao.
- **2026-06-10** — Outreach drafted (09): intake email, text nudge, and 5-bucket shared checklist in client-friendly language. Next: paste checklist into a shared Google Doc, fill [LINK]/[YOUR NAME], send.
- **2026-06-10** — Assumption pass on 08/09: GoDaddy = Pay Links only (hosting/registrar UNCONFIRMED → now asked as "hosting information"); form-notification inbox, GBP existence, and Meta setup flagged unverified and added as intake questions. Automation stack options doc created (10) — default rec: gym software + GHL-class platform; final pick gated on intake 2.1/2.2, budget, and our agency-license decision.
- **2026-06-11** — Engagement context added: comp = trade now → % of revenue above baseline. Doc 10 revised: **Option D (lean AI-built custom on Stripe/Twilio/Resend rails, ~$15–50/mo) is the new default**, with a hard speed gate (custom never blocks launch; GHL bridge if sprint can't start now) and Stripe Billing first (it's the baseline's source of truth). Intake adds 1.8 (revenue records → baseline) + 1.9 (budget comfort); outreach checklist updated.
- **2026-06-11** — **Sprint = GO, custom stack confirmed** (10 §4; GHL reserved for our trybookedout.com venture — keeping Joao's infra independent). 🆕 NEW FACTS from user: **Joao has an agency running FB ads** (pixel confirmed; agency identity/spend/lead-routing/possible white-label GHL unknown — intake 3.9–3.11) and **once built a custom Twilio SMS setup** (3.12 — possible A2P inheritance, saves 1–2 wks). Strategy shift: **don't touch his WordPress — build a custom landing page** as the new front door with doc 07 positioning (spec 11 §5.1; WP no longer build-blocking). Added: Meta Ad Library monthly sweep (07 §5, public, no access needed), ad-account ownership check (4.10), GA/GSC intake (4.4). Checklists synced.
- **2026-06-11** — Agency intel (secondhand from Joao, via user): **~$25/day spend; JJ-studio-focused agency that also calls leads + sets appointments; heavy NO-SHOW problem on booked appointments.** Intake 3.9 → partial. ⚠️ Correction (user): agency likely ALREADY runs confirmation/reminder/no-show messaging — 11 §5.2 reframed as two scenarios (gap-fill vs. lead-quality diagnosis); intake adds 3.13 (their follow-up scope), 3.14 (fee structure beyond spend), 3.15 (reporting). First ad-intel sweep completed (doc 12): no indexed landing page for Joao's ads → agency likely runs Lead Forms/Messenger funnels his owned assets never capture; all DS competitors run identical "free week" offers, nobody publishes pricing; agency shortlist built (Grow Pro, MAMA, Academy Blast top fits); Ad Library itself needs a 20-min human browser pass (12 §7).
- **2026-06-11** — Baseline mechanics locked (10 §3): **historical** trailing-12-month average from existing records, agreed in writing before launch; new billing system measures forward side only. Outreach finalized: send procedure in 09, paste-ready client checklist in assets/. Orchestration repo spec drafted (11): Next.js/Supabase/Twilio/Resend/Cal.com/Stripe, sequence engine, compliance checklist, 4-week sprint plan. Next: sprint go-decision → scaffold the build repo; send outreach.

## Next decisions (from Joao)
1. Priority goal first: privates, group students, or digital/coach products?
2. Sign off on the 1-hub / 3-lines brand architecture.
3. Naming for the consolidated Coaches line.
4. Budget/tools (ESP, ads, designer) + who publishes content weekly.
