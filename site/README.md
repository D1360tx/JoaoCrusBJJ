# Joao Crus BJJ — Website Preview (rough draft)

A consolidated, authority-first website **preview** to show Joao — the "one hub" concept from
`06-MASTER-AUDIT-AND-PLAN.md` and `07-MARKET-BASELINE-AND-POSITIONING.md`, made visual.

> **Status:** design rough draft for client review. Not the production build.
> The production build (Next.js/Supabase/Twilio per `11-ORCHESTRATION-REPO-SPEC.md`)
> will live in its own repo and would deploy to a **subdomain** (e.g. `new.joaocrusbjj.com`)
> so the current WordPress site is never touched.

## How to view
Open `index.html` in any browser (double-click it). No server or build needed.

## Pages
| File | Purpose |
|------|---------|
| `index.html` | **Homepage hub** — hero, method, programs (the 3 lines), pedigree story, books & podcast, reviews, lead-magnet teaser, free-class CTA |
| `kids.html` | **Program deep-dive** — Little Champions (3–7) & Junior Warriors (8–12), age-3 differentiator, schedule, outcomes |
| `free-guide.html` | **Lead-magnet landing page** — "5 Phrases That Calm a Frustrated Kid," email capture (demonstrates the funnel) |
| `toddlers.html` | **Toddler page, VERSION A** — matches the current joaocrusbjj.com look (light, blue headings, Divi-style) for Joao to rebuild in Divi |
| `toddlers-brand.html` | **Toddler page, VERSION B** — the new flyer branding (stamped condensed caps, gold-yellow, royal blue, brush strokes, "Strong starts here. Skills for life.") |
| `assets/styles.css` | Shared design system |
| `assets/app.js` | Scroll reveals, mobile nav, form preview |

## Design direction
Premium · dark · cinematic · authority-first. Display: **Fraunces**; body: **Hanken Grotesk**;
accent: bronze-gold (prestige) + a deep-crimson belt-bar nod.

## Content notes (for the real build)
- Copy is drawn from real research (sites, reviews, positioning docs). All testimonials are real quotes from the current site.
- **"From age 3" / "only school in the area"** is used as a headline claim — pending Joao's confirmation (intake 6.9).
- Images are hot-linked from the current site for the preview; the production build uses owned, optimized assets.
- The free-class CTAs and lead form are placeholders — they wire into the real ESP/booking/automation stack at build time.
