# Assumption Audit — repo-wide (2026-06-17)
> Ran a 4-way parallel review of every `.md` file against the **verify-don't-assume** rule. This is the flag list for your review.
> Calibration: data from a **real scrape, the 2026-06-17 call, the imginn IG pull, or a screenshot = verified** (cite the source). **First-party self-bio** (his own site/Skool copy) = a *claim*, fine internally but flag before reusing in marketing. **Pure inference stated as fact** or **uncited market stats** = fix.
> Suggested convention everywhere: tag claims `[OBSERVED]` / `[INFERRED]` / `[UNVERIFIED]` (doc 12 already does this), and in **client-facing** docs either cite or soften to "industry research suggests."

---

## 🔴 TIER 1 — WRONG / CONTRADICTED (fix first)
| Where | Claim | Problem | Fix |
|---|---|---|---|
| 02 §Issues, 03 §Lead-capture | "**No email capture / no ESP / no email list is being built**" | **False as of the 06-17 call** — he has **Beehiiv, ~8,060 contacts.** The site *form* isn't wired to it, but a list/ESP exists. | Add correction banner to 02 & 03: ESP = Beehiiv; only the website form is disconnected. |
| 01 vs 03 | "Founded **2003**" vs blackbeltparenting.net "own school **20 years**" (~2006) | Internal timeline conflict, both from self-bio. | Reconcile; pick the sourced one, note the other. |
| 07 §3 | "500+ **local** families" | Source (IG caption) says "500+ families" — **"local" was added**, unsupported. | Drop "local" or verify. |
| talking-points, onepager | "Every competitor starts at **4 or 5**" | Sweep shows competitors start at **4** (GB Tiny Champs 4–6, Stoic 4). "or 5" unsupported. | Change to "start at 4 (per our DS sweep)." |

## 🟠 TIER 2 — CLIENT-FACING, UNSOURCED (fix before anything else goes to Joao)
These appear in `stoic-breakdown`, `talking-points`, `onepager`, `09-outreach`:
| Claim | Status | Fix |
|---|---|---|
| "Kids/family = **60–70% of revenue** at academies" | uncited market stat (load-bearing thesis; also in 06/07) | Source it, or say "industry research suggests ~60–70%." |
| "automated follow-up **beats ad spend**; one academy grew **288%**" (10th Planet Portland) | uncited; causal claim | Cite the case study or drop the number; soften "beats." |
| "auto-responder lifts conversion **70–75%**" (said live on the call too) | uncited | Source or reframe "can significantly lift." |
| Stoic "the local school **growing fastest** / **explosive growth**" | no growth data exists | "appears to be actively marketing" — don't assert growth. |
| Stoic "**almost certainly runs ads**" / "instant SMS capture" / analytics "✅" | inferred from platform type, not observed (Ad Library pass still pending, 12 §7) | Relabel inferred; run the Ad Library check to confirm. |
| "the **only** kids-development specialist" / "**only** school accepting under-4" | age-3 gap is real (sweep), but "only specialist" is unverified **and his own age-3 policy is unconfirmed** (intake 6.9) | Reframe: "no other local school advertises under-4 (our sweep); your policy pending confirm." |
| "**500+ families**" used as authority fact | first-party IG caption, never confirmed on call | Confirm with Joao before using as a hard number. |
| Stoic amenities (sauna/cold plunge/Normatec) + ClassPass | from doc 12 research `[OBSERVED]` but not re-cited here | Fine — add "(per our competitor research)" so the basis shows. |

> Note: Gracie Barra "**4th-degree black belt**" and "261 Frog Pond Ln" **are verified** (live gbdrip.com scrape) — leave as-is.

## 🟡 TIER 3 — INTERNAL, STATED AS FACT → relabel or verify
**The big one — 07 §1 market-benchmark block.** Every figure below is stated as fact with **no per-claim source**; it underpins the whole positioning + pricing plan:
- "60–70% kids revenue," "median retention **66.4%**," "failed payments 2–3% churn / recovery cuts 40–60%," "national avg **$145/mo**," pricing bands ($75–150 privates, $80–120 kids, etc.), "founder margin 50–60%," "63% discover via social," "71% use Facebook," "IBJJF academies 314→8,928," "Gracie Barra ~275 US locations," "Danaher $20–25M," "Gordon Ryan $500K–1M+."
  → **Stamp 07 §1 with `[UNVERIFIED — external research, sources not captured]`** and source-or-soften before any number reaches Joao.
- "**Atos mass exodus 2026 after Galvao allegations**" (07 §1) → reputational claim about a named third party; **verify before any external use** (defamation risk if wrong).

**First-party self-bio claims** (his own site / dead 2019 site / Skool) — fine internally, **flag before marketing use:**
- "Carlson Gracie student **(lineage confirmed)**" (02) — it's a first-party self-claim, not independently confirmed. Drop "confirmed."
- 03 expanded bio: "**5 state titles**," "2nd national," "blue belt under Leonardo Castello Branco," "Caribbean windsurf circuit 3×," "**speaks 4 languages**," "**affiliated schools US & overseas**," "**top coaches/owners seek his advice**" — all self-bio.
- 06: "instructional DVDs coaches **worldwide** buy," "coaches turn to him for advice" — "worldwide/overseas" scope unproven (file 04 evidence is named US coaches only).
- 00/01: "students from early years now bring their own kids," "Most Trusted BJJ Academy" — marketing copy as fact.

**Inference hardened into fact:**
- 04: "selling the curriculum for **~8 years**" + "**most battle-tested** asset" — inferred from a 2017 site date.
- 11 §5.3: "**Phone is Joao's primary conversion channel**" — inferred from a "call us" CTA; no conversion data (08 §6.3/6.4 blank).
- 11 §9: missed-call text-back "**~80% of the value**" — invented precision; reword qualitatively.
- 12 §4 / 09 / 11: "interest decays **~80% after 15 min**" — real study exists (Lead Response Mgmt) but cite it.

**Tech / pricing / legal stated as fact** (verify or label estimate):
- 11 §5.3: "**TX is one-party consent**" for call recording — **legal claim, cite the statute** before recording.
- 10/11 tool pricing: GHL "$97/$297," CallRail "$45/mo," VAPI "$0.10–0.20/min," Option D "$15–50/mo," Stripe "smart retries/dunning built in," ESP "free tiers handle this scale." 10 has a blanket "ballpark" header (OK-ish); 11 has none → add one.
- 03: "WPForms **Lite** … doesn't store entries (Pro feature)" — plugin-tier + behavior assumption; verify.
- 03: blackbeltparenting.net "**noindex**" — cite the scraped tag.
- 03: podcast "ResearchGate study, 88 6th-graders" — study unverified; don't reuse as fact.

## 🔵 TIER 4 — ADD SOURCE / DATE STAMPS (numbers without provenance)
- `url-inventory`: IG "~8K," YouTube "~2.28K," Skool "3/6/9 members, $99/free/$27-97" → add **"as of 2026-06-09 scrape; Skool live re-fetch blocked."**
- IG 8K/4,041/1,604 + "0–8 likes" → cite **imginn pull**; label "vanity/dead engagement" as **interpretation pending native Insights.**
- `url-inventory`: FB "(primary page) runs ads via agency" → pixel-confirmed ≠ page-confirmed; verify page↔ad-account.

## ✅ ALREADY FLAGGED CORRECTLY (no action — good hygiene)
- Doc 12 throughout (`[OBSERVED]/[INFERRED]/[UNVERIFIED]`, access-limitation disclosure, agency shortlist framed as hypotheses).
- 08 intake: GoDaddy "UNCONFIRMED," 833 "hypothesis," agency "secondhand/partial," GBP/IG/notification-inbox "UNVERIFIED," counts "first-party observation."
- 00: "no-ESP" explicitly marked overturned; age-3 has "confirm with Joao" note; Skool "still gated."
- 03: IG Insights / podcast back-catalog / 2nd YT / Skool curriculum all listed as open data-gathering.
- 11 §5.1/5.2: agency overlap "VERIFY BEFORE BUILDING."
- intake-email (06-17): clean — all facts trace to the call, hedges "you said ~1 — just confirming."

---

## Recommended next actions (your call)
1. **Fix Tier 1 now** (factual errors — the no-ESP contradiction especially).
2. **Fix Tier 2 before sending the Stoic breakdown / using the call scripts** (they're client-facing).
3. **Stamp 07 §1** with an unverified-sources banner; decide which market stats to source vs. soften.
4. Tier 3/4 = relabel pass when convenient.
