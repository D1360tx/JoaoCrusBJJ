# 12 — Competitive Ad Intelligence Sweep (June 2026)

> Prepared 2026-06-11. Companion to 07 §5 (competitor map) — this file covers the **Meta Ad Library sweep, competitor offer/funnel intel, and agency identification** tasks.

---

## 1. Methodology & Honest Access Limitations

**What was attempted:**
1. Direct fetch of Meta Ad Library URLs (keyword search + `view_all_page_id` variants, www and m.facebook.com forms).
2. Direct fetch of competitor websites (stoicjiujitsu.com, jjmachadoaustin.com) and Joao's Facebook page.
3. `curl` with browser user-agent from the shell.
4. Web search (the only channel that worked).

**What actually happened — read this before trusting anything below:**
- ❌ **All direct HTTP fetching is blocked in this research environment.** Every URL returned 403 — including `example.com` — meaning the block is at the environment/proxy level, not just Facebook's bot defenses. This is *in addition to* the Ad Library's own JS-heavy, login-nagging design, which routinely defeats non-browser access anyway.
- ❌ **Zero live ads were observed.** Nothing in this report describes actual ad creative from the Ad Library. No ad copy below is quoted from a running ad; **anything not explicitly cited to a source URL is inference and labeled as such.**
- ✅ **Web search worked.** All findings below come from search-engine results: page titles, indexed snippets, and summaries of competitor websites, Facebook page posts indexed by search, directories (Yelp, jiujitsunearme.org, wheree.com), and agency websites.
- Confidence labels used: **[OBSERVED]** = directly stated in an indexed source, URL cited. **[INFERRED]** = my conclusion from observed evidence. **[UNVERIFIED]** = plausible, needs the human-browser pass in §7.

**Implication:** the Ad Library portion of 07 §5's checklist is **not completable from this environment**. §7 gives the exact URLs for a 20-minute human pass with screenshots. Everything else in 07 §5 (offers, funnels, platforms) was substantially advanced.

---

## 2. Per-Target Findings

### 2.1 Joao Crus BJJ (the client — what is his agency actually running?)

**[OBSERVED] Facebook presence is fragmented across at least three pages/profiles:**
- `facebook.com/joaocrusbjjatx2` — "Joao Crus Brazilian Jiu-Jitsu **Dripping Springs**" — the active page (the m.me link target).
- `facebook.com/joaocrusbjjatx` — "Joao Crus Brazilian Jiu-Jitsu **Austin**" — a second, separate page.
- `facebook.com/115073271204566` — a "Joao Crus" page/profile of unclear status.
- This mirrors the website/YouTube fragmentation documented in file 03. Two academy pages split page authority, reviews, and — if ads ever ran from the wrong one — ad social proof. **[INFERRED]** Worth asking the agency which page the ad account is attached to.

**[OBSERVED] Organic post pattern on joaocrusbjjatx2** (from search-indexed video posts):
- *"Call us today and schedule your free week trial 512-644-4560 #joaocrusbjjatx #kidsmartialarts #adultsmartialarts #jiujitsuprivatelessons"* — [video post](https://www.facebook.com/joaocrusbjjatx2/videos/call-us-today-and-schedule-your-free-week-trial512-644-4560joaocrusbjjatxkidsmar/1792300190808614/)
- Parenting-content videos: *"Kids thrive with routine…"*, *"Kids class. Life is about the person you have the potential to be. Come and visit us!"* — consistent with Joao's emotional-regulation brand voice.
- **The offer being pushed is a FREE WEEK TRIAL with a phone-call CTA** (call/text 512-644-4560). Note: the website (file 02) leads with a free *class*; Facebook leads with a free *week*. **[INFERRED]** Offer inconsistency across surfaces — pick one.

**[OBSERVED] No dedicated ad landing page or funnel surfaced in search.** No ClickFunnels/GoHighLevel/97-Display-style "web special" page indexed for Joao — only joaocrusbjj.com itself (WPForms-Lite, no capture — file 03) and the m.me Messenger link. **[INFERRED]** The agency's funnel is most likely (a) Facebook Lead Forms or (b) Messenger (m.me) conversations, both of which never touch his website and are invisible to search. This matches the "agency calls the leads" model — lead forms feed a dialer. **It also means Joao's owned assets capture nothing from his own ad spend.**
- BBB profile exists: [bbb.org listing](https://www.bbb.org/us/tx/dripping-springs/profile/martial-arts/joao-crus-brazilian-jiu-jitsu-0825-90031134); Nextdoor page exists: [nextdoor.com/pages/joao-crus-brazilian-jiu-jitsu-2](https://nextdoor.com/pages/joao-crus-brazilian-jiu-jitsu-2/).

**[UNVERIFIED — needs browser]** What the ads themselves say, how many are active, when they launched, whether they run from the DS page or the Austin page. See §7.

### 2.2 Stoic Jiu Jitsu (Dripping Springs) — the most marketing-armed local competitor

- Website: [stoicjiujitsu.com](https://stoicjiujitsu.com/) · 391 Sportsplex Suite A, Dripping Springs · [Facebook page](https://www.facebook.com/p/Stoic-Jiu-Jitsu-100091514243695/) (page ID **100091514243695**).
- **[OBSERVED] Offer:** "Free Trial Class — $0 — with a Certified Instructor… no contract… limited time" on a dedicated **[/Home/Offer/](https://stoicjiujitsu.com/Home/Offer/) "Web Offers" page**. Directory listings also describe a **free week trial** ([jiujitsunearme.org](https://jiujitsunearme.org/gyms/texas/dripping-springs/stoic-jiu-jitsu)).
- **[OBSERVED] Programs:** kids split "Little" (4–7) and "Big" (8–12), teens 13–16, adults; **summer camps**; facility amenities marketed hard — recovery room, sauna, cold plunge, Normatec boots. Also listed on **ClassPass** ([classpass.com](https://classpass.com/studios/stoic-brazilian-jiu-jitsu-dripping-springs-okeu)).
- **[INFERRED — high confidence] Stoic is on a 97 Display-style martial-arts marketing platform.** Evidence: URL architecture `/Home/Offer/`, `/Home/Schedule`, `/services`, `/classes/Teen-Martial-Arts`, and the programmatic local-SEO page `/martial-arts-classes/Texas/Dripping-Springs/7457` — this is the signature structure of managed martial-arts marketing site vendors (97 Display / similar), whose standard playbook is: SEO-templated site + "exclusive web offer" landing page + paid traffic pointed at it. **[INFERRED]** A standing `/Home/Offer/` page strongly suggests they run (or are built to run) paid acquisition; this is the local competitor most likely to be in the Ad Library. **[UNVERIFIED]** Actual ad activity — §7.
- Pricing: **not published anywhere indexed.** [OBSERVED gap]

### 2.3 Jean Jacques Machado / JJ Machado Austin (Dripping Springs)

- Website: [jjmachadoaustin.com](https://www.jjmachadoaustin.com/) · 4955 Bell Springs Rd #5 · (512) 956-0898 · [Facebook: jjmachadoaustin](https://www.facebook.com/jjmachadoaustin/).
- **[OBSERVED] Offer: "FREE WEEK TRIAL."** Led by **Todd White, 4th-degree black belt under Jean Jacques Machado**, with black-belt professors Joseph Lara and Marcus Douthitt. Kids and adult programs; schedule Mon–Sat incl. 6am and noon classes ([Yelp](https://www.yelp.com/biz/jean-jacques-machado-austin-dripping-springs-2), [jiujitsublog.com](https://jiujitsublog.com/academy-details/jj-machado-austin-jiujitsu)).
- Listed on **Mindbody** and **Wellhub** ([mindbodyonline.com](https://www.mindbodyonline.com/explore/locations/jj-machado-austin-brazilian-jiu-jitsu), [wellhub.com](https://wellhub.com/en-us/search/partners/jj-machado-austin-jiujitsu/)) — **[INFERRED]** Mindbody-class operations, corporate-benefit channel for adults; more operationally mature than marketing-aggressive. No funnel/landing-page footprint found; site is a standard Wix-era site (a Square site exists for "Todd White Jiujitsu LLC"). **[INFERRED]** Lower paid-ads likelihood than Stoic.
- Pricing: **not published.** Lineage prestige is their lead asset, not offers.

**Local takeaway [INFERRED]:** all three Dripping Springs schools converge on the same offer — *free week trial* — with no published pricing. Nobody locally owns a *named, structured* intro program. That is exactly the gap 07 §4's "$49 Confidence Kickstart" fills.

### 2.4 Austin-metro gyms with visible paid-acquisition machinery

(Visible = funnel infrastructure indexed by search; actual ad spend [UNVERIFIED] without the Ad Library pass.)

| Gym | Funnel evidence | Offer |
|---|---|---|
| **Gracie Barra North Austin** ([gbnorthaustin.com](https://gbnorthaustin.com/)) | "exclusive online offer" language + free-trial booking form | Free intro class |
| **Gracie Barra South Austin** ([gbsouthaustin.com](https://gbsouthaustin.com/)) | Trial form → "staff will contact you" (lead-capture-first design) | Free trial class |
| **Gracie Barra Cedar Park** ([gbcedarpark.com](https://gbcedarpark.com/)) | Free intro + PerfectMind booking backend | Free intro class |
| **Six Blades HQ/Austin** ([sixbladesjiujitsuhq.com](https://sixbladesjiujitsuhq.com/)) | Multi-location site with `/location/` + `/program/` pages and "exclusive online offer — secure your spot" CTAs — classic Market-Muscles-style ad-ready architecture **[INFERRED]** | Free intro lesson; celebrity anchor (Xande Ribeiro, 7x world champion) |
| **Gracie Jiu-Jitsu Southwest Austin** ([graciejiujitsuaustin.com](https://graciejiujitsuaustin.com/)) | "exclusive BJJ online offer" | Free/web offer |
| **Gracie Humaita Austin** ([ghaustin.com](https://www.ghaustin.com/)) | Free trial class, standard site, less funnel-y | Free trial class |

**[OBSERVED] Pattern:** the phrase **"exclusive online offer"** recurs across Austin GB locations and Six Blades — that's templated ad-landing-page copy from martial-arts marketing vendors, i.e., these gyms are built for (and very likely running) paid traffic. Every single one leads with a **free** offer (class or week); none publish pricing.

### 2.5 National kids-martial-arts advertisers & documented ad patterns

- **Gracie Barra (corporate/franchise):** runs a genuine in-house ad machine for franchisees — the **"Accelerator Program… powered by Lionheart"** with an **in-house digital marketing and advertising agency** doing paid social, content, and SEM for schools ([institute.graciebarra.com/accelerator-program](https://institute.graciebarra.com/accelerator-program)); franchisor provides national brand campaigns + localized marketing ([franchisesbiz.com](https://franchisesbiz.com/blogs/franchise-works/gracie-barra)). **[INFERRED]** GB locations near Austin are professionally-run ad competitors, not mom-and-pop boosted posts.
- **Gracie Bullyproof (Gracie University):** the category-defining kids program ([gracieuniversity.com/GracieKids](https://www.gracieuniversity.com/GracieKids)). Marketing formula **[OBSERVED]** from their own and affiliates' pages: (1) anti-bullying as the entry emotion, (2) **"confidence without violence"** — defend without becoming a bully, (3) third-party authority stacking (featured by CNN/ABC/NBC/Oprah; school districts host it on campus), (4) parent-facing language throughout ("Prepare Your Child for Life" — [YouTube](https://www.youtube.com/watch?v=chsD7gZdZw0)). Affiliates nationwide rent this credibility ([gracietulsa.com/bullyproof](https://www.gracietulsa.com/bullyproof), [graciejiujitsuphoenix.com](https://graciejiujitsuphoenix.com/programs/gracie-bullyproof/)).
- **Documented kids-martial-arts ad formulas** (from agencies/platforms that publish real campaign structures — the closest verifiable proxy for "what's in the Ad Library"):
  - **Member Solutions** ad-example library ([membersolutions.com/martial-arts-ads-examples](https://membersolutions.com/martial-arts-ads-examples/)): *"Try Out 3 Classes & Get a FREE Uniform for just $19.99"*, *"Try 6 Weeks of Kids Martial Arts for Just $69 & Get a FREE Uniform (a $35 value!)"* — open ads with a situation the parent recognizes, then urgency.
  - **Pack the Mats** ([packthemats.com/winning-facebook-ads-for-martial-arts-schools](https://packthemats.com/winning-facebook-ads-for-martial-arts-schools/)): Facebook **Lead Forms** (not website clicks); trial ladders of **2 wks/$29, 4 wks/$49, 6 wks/$69**; enrollment special = enroll fee + free uniform/equipment bonus "for signing up today"; **video outperforms stills on cost**; turn OFF Advantage+ audience to keep geo tight; call/text/email leads many times.
  - **Zen Planner / Gymdesk guides** ([zenplanner.com kids-program ads guide](https://zenplanner.com/martial-arts/how-to-create-facebook-ads-for-a-martial-arts-kids-program/), [gymdesk.com advertising guide](https://gymdesk.com/blog/martial-arts-advertising-ideas-grow-dojo)): separate campaigns per program (kids vs adults), parent-targeted copy, free class beats free week beats paid trial **on volume** (paid trial wins on quality) — consistent with 07 §1's "paid intro filters and converts higher."

---

## 3. Agency Identification Shortlist ("is it one of these?")

Context: Joao's agency is **jiu-jitsu/martial-arts-focused, runs his FB ads (~$25/day ≈ $750/mo media), AND calls leads / sets appointments.** The done-for-you-appointment-setting feature narrows it a lot. Candidates, strongest fit first:

| # | Agency | Why it fits | Source |
|---|---|---|---|
| 1 | **Grow Pro Agency** | Done-for-you ads + automation + **human appointment setters doing live lead follow-up**; exclusively martial arts/dance/fitness; programs $299–$1,200/mo — the $25/day-media + call-center bundle matches their model exactly; 1,500+ studios | [growproagency.com](https://growproagency.com/), [pricing page](https://growproagency.com/martial-arts-marketing-price/) |
| 2 | **Martial Arts Marketing Agency (MAMA / martialartsagency.com)** | Ads → leads → **they "pre-frame" and confirm all appointments** for highest show rate; follows up non-booked leads; martial-arts-only; "100K Strong" movement branding | [martialartsagency.com/services](https://www.martialartsagency.com/services), [FB: MAMASystems](https://www.facebook.com/MAMASystems/) |
| 3 | **Academy Blast** | Martial-arts-only "growth ecosystem": FB/Google ads + **AI + human follow-up that books trials 24/7**; founders Bryce Bonilla (school owner), Jason Fayling, Chris Slaydon | [academyblast.com](https://academyblast.com/), [team](https://academyblast.com/our-team/) |
| 4 | **Martial Arts Media (George Fourie)** | 400+ schools, "25,000+ paid trials generated"; trial-booking funnels; AU-based but serves US | [martialartsmedia.com](https://martialartsmedia.com/) |
| 5 | **Pack the Mats** | Martial-arts ads agency (FB/IG/Google), lead-form funnels, 90-day results guarantee; publishes its ad playbook openly | [packthemats.com](https://packthemats.com/) |
| 6 | **Tactical Marketer (TAC/MRK)** | **Jiu-jitsu-specific** (staff are grapplers, 10+ yrs marketing BJJ brands) — matches "jiu-jitsu-focused" descriptor if Joao meant literally BJJ-only | [tacticalmarketer.com](https://www.tacticalmarketer.com/) |
| 7 | **Equipe ADS Agency** | BJJ-academy-focused: ads, SEO, automation, "we handle the tech so you teach" | [equipeads.com](https://equipeads.com/how-to-do-marketing-for-jiu-jitsu/) |
| 8 | **PsychVertising (Talyah Regusters)** | Jiu-jitsu/muay-thai/MMA-only boutique; founder-built sites + local ads; smaller shop — plausible for a $25/day account | [psychvertising.com/jiu-jitsu-marketing](https://psychvertising.com/jiu-jitsu-marketing/) |
| 9 | Others in the niche (lower fit / completeness) | **Kali Serve** (martial-arts-only client acquisition), **FitClub Agency**, **Brave Gym Marketing** (ads + automated nurture→booking), **Ground Standard**, **BJJ Marketing** (bjjmarketing.com), **Members Today**, **97 Display** & **Market Muscles** (platform+ads vendors — note Stoic appears to use one of these) | [kaliserve.com](https://kaliserve.com/), [fitclubagency.com](https://fitclubagency.com/martial-arts-marketing/), [bravegymmarketing.com](https://bravegymmarketing.com/), [groundstandard.com](https://www.groundstandard.com/), [bjjmarketing.com](https://bjjmarketing.com/), [marketmuscles.com](https://marketmuscles.com/) |

**How to confirm in 60 seconds with Joao:** ask for (a) the agency name on his monthly invoice/Stripe charge, or (b) who has Business Manager partner access to his page (Page settings → Page transparency / business integrations), or (c) read him rows 1–3 above — *human callers* (Grow Pro, MAMA) vs *AI-first follow-up* (Academy Blast) is the distinguishing question: "do real people call your leads, or is it AI texting?"

---

## 4. Offer / Hook / Creative Patterns (what the evidence shows)

**Offers (observed across all targets):**
- **Free week trial** = the default commodity offer — Joao, Stoic, JJ Machado, IJJ Austin, Paragon all run it. Zero differentiation locally.
- **Free single class / intro lesson** = the GB-franchise and funnel-vendor standard (lower friction, higher volume, lower quality).
- **Paid trial ladders** ($19.99/3 classes, $29/2wk, $49/4wk, $69/6wk — usually **+ free uniform**) = what the national agencies actually push for kids programs because they filter tire-kickers and pre-sell the enrollment.
- **Enrollment special** at trial-end: join-today bonus (uniform/gear), never a % discount in the better playbooks.
- **Nobody local publishes pricing.** (Consistent with 07: opacity is the norm; premium positioning is won on proof, not price.)

**Hooks (kids/parent market):**
1. **Bullying/safety** — the strongest documented emotional entry (Gracie Bullyproof built a national brand on it; Joao's own YouTube tags already include "say no to bully").
2. **Confidence / discipline / focus** — the universal triad in every kids-program page observed (GB, Humaita, Six Blades, Stoic).
3. **Emotional regulation / big emotions** — *only Joao* uses this language locally [OBSERVED on his site/posts]. It's his ownable hook; no competitor page surfaced it.
4. **Problem-situation openers** — best-practice ads open with a moment the parent recognizes (meltdowns, screen time, getting picked on), then the program as solution (Member Solutions examples).
5. Authority stacking — media mentions, lineage, champion instructors (Six Blades/Xande; JJM/Machado lineage; Joao's counter = Carlson Gracie lineage + author + 20 yrs + 500 families).

**Creative & funnel mechanics (documented best practice in the niche):**
- Video > static for cost and trust; real classes, real kids, beginner-visible.
- **Facebook Lead Forms** are the niche default (not website clicks) → feeds the agency dialer; keep ad→form look/copy identical.
- Tight geo (5-mile radius / zip targeting; Advantage+ audience OFF), separate campaigns for kids vs adults.
- Speed-to-lead dogma: contact in <5 min; interest decays ~80% after 15 min; then many-touch call/text/email.
- Standing "Web Offer" landing pages (Stoic's `/Home/Offer/`) so ads always have somewhere evergreen to land.

---

## 5. Recommendations for Our Funnel (evidence → action)

1. **Don't fight "free week" with "free week."** All three DS schools run the identical offer. Run the dual-rung ladder from 07: free intro class (volume rung) + **named paid trial** — "$49 Confidence Kickstart, 2 weeks + free uniform" (quality rung). The $29–69+uniform paid-kids-trial pattern is the documented national norm precisely because it filters and pre-frames enrollment. A *named* program is also un-comparable — nobody can price-match "Confidence Kickstart."
2. **Own the emotional-regulation hook; use bullying as the door.** Bullying/confidence is proven to open parent wallets (Bullyproof), but every gym says "confidence." Joao's differentiation is the layer *behind* it: book, podcast, Montessori-informed method. Ad architecture: problem-opener (recognizable parent moment) → "confidence without violence" promise → Joao's authority stack (author • 25 yrs • 500+ families • Carlson Gracie lineage) as the *only-we* proof.
3. **Build one evergreen offer landing page on joaocrusbjj.com** (the Stoic `/Home/Offer/` pattern): single offer, social proof, booking calendar + form that writes to the ESP/CRM (per files 03/07 Phase 0). Today, his ad spend almost certainly terminates in lead forms/Messenger owned by the agency — **if he ever fires the agency, the entire funnel evaporates.** Require ad→CRM lead sync (or at minimum CC on lead notifications) as a condition of continuing with them.
4. **Adopt the documented mechanics:** video creative from real kids classes; lead form ≙ ad copy match; ≤5-min speed-to-lead (agency already calls — verify their SLA and ask for call logs); kids and adults in separate campaigns; tight Dripping Springs/Belterra/Driftwood geo. At $25/day, run ONE kids campaign — don't split the budget.
5. **Enrollment special, never discounts:** trial→join bonus = uniform/private-lesson value-add (kills the 50%-off habit flagged in 07 §2.2).
6. **Audit the agency against the shortlist (§3)** and against what GB's Lionheart-style in-house agency does for the Austin franchises: if his agency can't show the actual ads, lead counts, cost-per-booked-appointment, and show rate monthly, the $750/mo media + fee is unaccountable.
7. **Consolidate the two Facebook pages** (joaocrusbjjatx vs joaocrusbjjatx2) before scaling spend — split pages split ad history, social proof, and retargeting audiences.

---

## 6. Needs a Real Browser (exact URLs — open, screenshot, drop in /assets)

Direct programmatic access failed (403 at the environment level). A human with a normal browser (logged into Facebook helps but isn't required for the Ad Library) should open these and screenshot all active ads:

**Meta Ad Library — keyword searches:**
1. `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&q=Joao%20Crus&search_type=keyword_unordered`
2. `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&q=Stoic%20Jiu%20Jitsu&search_type=keyword_unordered`
3. `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&q=JJ%20Machado%20Austin&search_type=keyword_unordered`
4. `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&q=jiu%20jitsu%20Austin&search_type=keyword_unordered`
5. `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&q=Gracie%20Barra&search_type=keyword_unordered`
6. `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&q=Gracie%20Bullyproof&search_type=keyword_unordered`
7. `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&q=kids%20martial%20arts&search_type=keyword_unordered` (scan first 30 for offer/creative patterns)

**Page-specific (most reliable method):** open the page → **About → Page transparency → "Go to Ad Library"**:
- Joao DS page: `https://www.facebook.com/joaocrusbjjatx2` ← **the critical one: what is his agency actually running?**
- Joao Austin page: `https://www.facebook.com/joaocrusbjjatx` (check if ads run from here instead)
- Stoic (page ID known): `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&view_all_page_id=100091514243695`
- JJ Machado: `https://www.facebook.com/jjmachadoaustin` → Page transparency → Ad Library
- Gracie Barra North Austin / South Austin / Cedar Park pages → same path.

**Capture for each active ad:** screenshot, start date, platforms, creative format (video/static), hook, offer, destination (lead form vs URL — if URL, copy it; that's the funnel). Also grab: Joao's Page transparency panel (shows **which Business Manager/partner runs the page** — likely names the agency outright), and Stoic's `/Home/Offer/` page + footer (vendor credit will confirm the 97 Display inference).

**Also browser-only:** Instagram @joaocrusbjj promo history; Google Ads Transparency Center (`https://adstransparency.google.com/?region=US`) search for the same names.

---

## 7. Source Index (key URLs)

Local: [stoicjiujitsu.com](https://stoicjiujitsu.com/) · [stoicjiujitsu.com/Home/Offer/](https://stoicjiujitsu.com/Home/Offer/) · [jjmachadoaustin.com](https://www.jjmachadoaustin.com/) · [Yelp JJM](https://www.yelp.com/biz/jean-jacques-machado-austin-dripping-springs-2) · [jiujitsunearme.org Stoic profile](https://jiujitsunearme.org/gyms/texas/dripping-springs/stoic-jiu-jitsu) · [Joao FB free-week post](https://www.facebook.com/joaocrusbjjatx2/videos/call-us-today-and-schedule-your-free-week-trial512-644-4560joaocrusbjjatxkidsmar/1792300190808614/)
Austin: [gbnorthaustin.com](https://gbnorthaustin.com/) · [gbsouthaustin.com](https://gbsouthaustin.com/) · [gbcedarpark.com](https://gbcedarpark.com/) · [sixbladesjiujitsuhq.com](https://sixbladesjiujitsuhq.com/) · [ghaustin.com](https://www.ghaustin.com/) · [graciejiujitsuaustin.com](https://graciejiujitsuaustin.com/)
National: [gracieuniversity.com/GracieKids](https://www.gracieuniversity.com/GracieKids) · [GB Accelerator](https://institute.graciebarra.com/accelerator-program) · [Member Solutions ad examples](https://membersolutions.com/martial-arts-ads-examples/) · [Pack the Mats winning ads](https://packthemats.com/winning-facebook-ads-for-martial-arts-schools/) · [Zen Planner kids-ads guide](https://zenplanner.com/martial-arts/how-to-create-facebook-ads-for-a-martial-arts-kids-program/)
Agencies: see table in §3.
