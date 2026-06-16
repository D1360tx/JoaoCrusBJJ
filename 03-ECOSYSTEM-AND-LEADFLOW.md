# Joao Crus BJJ — Ecosystem, Podcast & Lead-Flow Audit

> Scraped 2026-06-09. Covers blackbeltparenting.net, the podcast, and the contact-form/lead-capture technical audit.

---

## 🔴 LEAD CAPTURE AUDIT (contact form) — KEY FINDING

**The website is NOT capturing leads to any database or ESP. Submissions are email-only.**

- **Form plugin:** WPForms **Lite** (free) — form ID 177 on /contact-form/ (and the homepage)
- **Fields:** Name (first/last), Phone, Email, Comment/Message
- **Submit method:** AJAX → WordPress `admin-ajax.php` on own domain (no external endpoint)
- **Entry storage:** ❌ NONE. WPForms Lite does not store entries in the DB (that's a Pro feature). No record of any submission exists in WordPress.
- **ESP / CRM integration:** ❌ NONE. Checked for Mailchimp, ActiveCampaign, ConvertKit, Klaviyo, HubSpot, MailerLite, Drip, Constant Contact, GetResponse, AWeber, FluentCRM, Zapier/webhooks — **none present.**
  - (Note: "drip" strings in HTML = "Dripping Springs"; "marketing" strings = Cookiebot consent categories. Neither is an ESP.)
- **Only delivery path:** a single email notification, almost certainly to **joaocrus@gmail.com**.

### Why this matters
- Every inquiry = one email to a Gmail inbox. Spam/buried/missed = **lead lost, no record.**
- **No email list is being built.** No nurture sequence, no re-marketing, no automation.
- Books + podcast drive attention but there's **no mechanism to capture/own that audience.**

### Recommended fix (highest-ROI on the site)
1. Connect a real ESP (MailerLite/ConvertKit/Klaviyo — free tiers fine at this size) OR upgrade WPForms + add provider.
2. At minimum, enable entry storage so submissions are recorded.
3. Add a **lead magnet** (free chapter of *Grapple with Emotions*, "5 phrases to calm a frustrated kid," etc.) to convert podcast/book/social traffic into owned email subscribers.
4. Auto-responder + simple nurture sequence → free class.

---

## EXPANDED BIO (from blackbeltparenting.net — richest source yet)
- Born in **Brasília, Brazil**; moved to **Rio de Janeiro at 17**
- Competitive **swimmer** in youth
- Started martial arts in **Karate at 22**, reached **brown belt**; won **5 state tournaments** + **2nd at a national tournament** in Rio. Quit just before karate black-belt test after discovering BJJ.
- Began **BJJ full-time in 1998**; earned **blue belt under Leonardo Castello Branco** in Rio
- Also a champion **windsurfer/sailor** — won the amateur Caribbean circuit **3×**
- Was a **top sales rep for Optimum Nutrition**, opened his own supplement store in **1999**
- **Befriended Carlson Gracie** (legend) — Carlson visited his store regularly; Joao later became an **instructor under Carlson Gracie**
- Teaching BJJ in Austin area **2 decades**; own school in Dripping Springs **20 years**
- **Recognized expert in teaching kids BJJ** — top coaches/school owners seek his advice; created **instructional DVDs/video resources**; has **affiliated schools across the US and overseas**
- **Speaks 4 languages**; taught seminars across Europe
- Parent of **2 children**; resides in Austin, TX
- Hobbies: rock climbing, hiking, windsurfing, surfing
- Method influenced by **Montessori** principles (coaches collaborate w/ Montessori teachers)

> 🔑 Marketing gold: the Carlson Gracie friendship→instructor story, "coaches nationwide seek his advice," affiliated schools, and DVD/curriculum legacy are STRONG authority/credibility hooks barely used in current marketing. This positions the B2B coaching products (Skool) far better than the current copy does.

---

## PODCAST — "Blackbelt Parenting Life"
- **Spotify:** open.spotify.com/show/2rFL3nSTL8pd8pQnztDxA6 — rated 5.0 (4 ratings)
- **Also on:** YouTube @blackbeltparenting2522 · site blackbeltparenting.net · FB group (572218967307006)
- **Format:** short solo episodes (mostly 3–11 min), occasional guests; Joao narrating parenting/BJJ lessons
- **Cadence:** irregular / sporadic (gaps from Aug 2024 → Oct 2024 cluster → Dec 2025 → May 2026)
- **Episodes visible (recent first):**
  1. Beyond Obedience: Teaching Kids to Own Their Boundaries (May 14, 2026 · 3:40)
  2. When Parents Walk Away: Missed Opportunity in Parenting Through Discomfort (Dec 19, 2025 · 10:59)
  3. Is BJJ Suitable for Children with Anxiety or ADHD? (Oct 28, 2024 · 7:02) — cites ResearchGate study, 88 6th-graders, 12 weeks
  4. Yes, It's Okay to Tell Your Kids NO (Oct 23, 2024 · 4:41)
  5. What Leads to Sibling Rivalry? (Oct 14, 2024 · 3:41)
  6. Do You Read With Your Child? (Aug 22, 2024 · 4:36)
  + "Load more" — older episodes exist beyond these 6
- **Tagline used:** "Prepare your child for the road, not the road for your child."

### Podcast observations
- **Inconsistent publishing** is the #1 weakness — 14-month gap kills momentum/algorithm.
- Content overlaps heavily w/ blog + Skool posts → strong **repurposing flywheel** opportunity (one idea → podcast + blog + IG + email).
- blackbeltparenting.net is **dated** (head shot from 2019, "page_id" URLs, broken social links e.g. `http://joaocrubjj/`), set to **noindex** (invisible to Google). Another fragmented surface.

---

## BRAND SURFACE MAP (fragmentation problem)
| Surface | Purpose | State |
|---|---|---|
| joaocrusbjj.com | Academy / local lead gen | Active, typo-ridden, no lead capture |
| blackbeltparenting.net | Podcast home | Dated (2019), noindex, broken links |
| Skool: Boundary Guard | Adult course (B2C) | 6 members |
| Skool: Children BJJ Blueprint | Coach funnel (free→paid) | 9 members |
| Skool: BJJ Coach Blueprint | Coach course ($99) | 3 members |
| Spotify/YouTube podcast | Authority/audience | Sporadic |
| Instagram @joaocrusbjj | Social | ~8K followers (vanity — dead engagement); see `05` |
| YouTube @Joaocrusbjjatx | Social/video | ~2.28K subs |
| Amazon (2 books) | Digital product/authority | Live |

> Funnels don't connect. No central email list ties them together. Biggest structural opportunity = unify into one audience-owning funnel.

---

## SOCIAL CHANNELS — confirmed IDs (analytics need screenshots)
- **YouTube #1 — "Joaocrusbjjatx"** — channel ID `UCLBZ8MYNkWf5_EJTuIYLCdQ` · ~2.28K subs · bio "Brazilian Jiu-Jitsu for the whole family" · SEO tags incl. "say no to bully," "stop bullying"
- **YouTube #2 — "Black Belt Parenting"** — channel ID `UCslbnQju6x9vY5MlQUX_oOw` · the podcast's video home · heavy local-SEO tags (Dripping Springs, Montessori, kids martial arts)
- **Instagram @joaocrusbjj** — exists; cannot scrape (login wall + Firecrawl blocks IG)
> ⚠️ Two separate YouTube channels = same fragmentation pattern as the websites. Splits audience and SEO authority.

## DATA-GATHERING STATUS (updated 2026-06-16)
Most of the original "still to pull" list was since captured via the imginn mirror + a slip-through YouTube scrape. Public data (style/cadence/engagement) never needed screenshots — only **native Insights** do. Reframed below by what's actually still open:

**✅ DONE (no screenshots needed):**
- Instagram public data — follower count (8K), following (4,041), posts (1,604), content style, cadence, and engagement (0–8 likes/post — the "vanity 8K" finding). See `05-INSTAGRAM.md`. Re-pullable anytime via imginn.
- YouTube main channel (@jcbjj25 / Joaocrusbjjatx) — video list + view counts. See `04-DVD-STORE-AND-YOUTUBE.md`.

**🟡 OPTIONAL — only one screenshot job has real value:**
- [ ] **Instagram native Insights (last 90 days)** — the only thing scrapers/mirrors CAN'T show: real **reach/impressions, follower authenticity (real vs ghost), audience demographics, top posts.** Confirms whether the 8K is worth rebuilding or just maintaining. *How:* IG app → Professional Dashboard → see all Insights → 90 days → screenshot overview. **Not blocking** the organic-first build.

**🟡 NICE-TO-HAVE (defer):**
- [ ] Older podcast back-catalog (behind Spotify "Load more") — only matters for the repurposing flywheel; we have recent episodes + cadence.
- [ ] 2nd YouTube channel (Black Belt Parenting) exact subs/total views — low priority; known to be small.

**🟢 PHASE 2 ONLY (not needed now):**
- [ ] Skool Classroom curriculum depth (3 communities) — only when we productize Line B (coach/schools line). Login-gated; screenshots when that phase starts.
