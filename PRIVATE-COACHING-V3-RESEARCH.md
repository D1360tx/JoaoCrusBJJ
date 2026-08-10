# Private Coaching Conversion V3 — Research Notes

_Date: 2026-08-10_

## Research scope

- Ran the external `/last30days` skill (`last30days-skill` v3.18.4) against r/bjj and broader social/video sources for the July 11–August 10, 2026 window.
- Reviewed one directly relevant current r/bjj thread and three older high-signal r/bjj discussions for durable voice-of-customer patterns.
- Cross-checked current form and landing-page guidance from Typeform, Nielsen Norman Group, Unbounce, and Baymard.

## What current BJJ students are saying

The only directly relevant r/bjj thread found in the strict 30-day window was [“BJJ - My club has private class special sale”](https://www.reddit.com/r/bjj/comments/1v39m90/bjj_my_club_has_private_class_special_sale/) from July 22, 2026. Its discussion reinforces several recurring buying concerns:

1. **Value must be concrete.** Students ask whether private lessons will produce carryover, not simply whether the instructor is qualified.
2. **Specific weak points create perceived value.** Direct feedback on a recurring position or mistake is repeatedly described as the best use of a private.
3. **The coach still needs to diagnose.** Students may know the symptom but not the technical cause. A page should not require prospects to arrive with a complete technical brief.
4. **Carryover matters more than volume.** Too many private lessons can create a backlog of techniques without enough time to apply them in normal training.
5. **Coach fit matters.** Teaching ability, game/body-type relevance, and whether explanations “click” influence value.
6. **Schedule flexibility is a real use case.** Some students use privates to add focused mat time when fixed classes do not fit their calendar.

Supporting older discussions:

- [Are private lessons worth it?](https://www.reddit.com/r/bjj/comments/1c8qul7/are_private_lessons_worth_it/) — direct feedback, clear goals, spacing sessions so the student can apply the lesson, and instructor fit.
- [Is it worth getting private at white belt?](https://www.reddit.com/r/bjj/comments/1d22rrf/is_it_worth_getting_private_at_white_belt_jiu/) — specific problems outperform vague “teach me anything” requests; follow-up corrections in class increase value.
- [Are privates really worth it?](https://www.reddit.com/r/bjj/comments/10ez3zp/are_privates_really_worth_it/) — students expect the coach to ask diagnostic questions and want to leave with something concrete to practice.

## Conversion evidence applied

### Typeform, 2025 Lead Capture Form Report

Source: [The 2025 lead capture form report](https://www.typeform.com/blog/2025-lead-capture-form-report)

Typeform analyzed 10,000 customer forms and identified 1,576 lead-capture forms for its primary dataset.

Applied findings:

- A question on the welcome screen correlated with a **5% decrease** in completion, so V3 introduces a short welcome state before the first coaching question.
- Forms using recall saw a **10% increase** in completion, so V3 repeats the lead’s first name in the tailored result.
- Ten-question forms averaged **28% lower completion** than three-question forms, so V3 keeps the fit check to four coaching questions plus minimal contact fields.
- Positive form language correlated with higher completion, so the quiz frames answers as useful situations rather than deficiencies.
- Hidden fields correlated with a **4.8% increase** in completion. V3 retains UTM, gclid, and fbclid attribution without asking the user to enter that information.

### Nielsen Norman Group

Source: [Few Guesses, More Success: 4 Principles to Reduce Cognitive Load in Forms](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/)

Applied findings:

- One question or task per screen.
- Single-column form layout.
- Plain-language questions that ask about one thing at a time.
- Visible progress and clear time expectations.
- Branching/personalization through the recommendation engine.
- Persistent labels rather than placeholder-only instructions.

### Unbounce Conversion Benchmark Report

Source: [Conversion Benchmark Report](https://unbounce.com/conversion-benchmark-report/)

Applied findings:

- Median landing-page conversion across the report’s dataset is **6.6%**.
- Mobile drives nearly **5x more visitors**, while desktop converts about **8% better**, supporting aggressive mobile QA and a persistent mobile CTA.
- Simpler, shorter language typically performs better. Unbounce reports a **-24.3% correlation** between difficult-word count and conversion rate.
- V3 replaces abstract “coaching fit” language with concrete outcomes: identify the issue, test the correction, and take a priority into regular training.

### Baymard Institute

Source: [Required and Optional Form Fields](https://baymard.com/blog/required-optional-form-fields)

Applied findings:

- Explicitly label the phone field as optional.
- Explicitly label first name and email as required.
- Keep labels above inputs and outside the fields.
- Avoid adding optional fields that do not materially improve follow-up.

## V3 conversion decisions

- Changed “Fit Finder” to **Private Game Plan Finder** to make the output tangible.
- Changed the hero promise to **“Stop guessing. Know what to train next.”**
- Added a welcome screen with value, effort, and no-purchase expectations before the first question.
- Rewrote questions using student language: repeated dead ends, disconnected techniques, lack of personalized class feedback, limited mat time, and focused goals.
- Added the strongest objection directly to the page: **“What if I do not know what I need to work on?”**
- Reframed the process around carryover: bring the pattern, test under resistance, apply before adding more.
- Added lightweight authority near the first CTA without inventing testimonials.
- Preserved V2 as a comparison variant rather than overwriting it.

## Measurement plan for production

Track at minimum:

- `private_quiz_view`
- `private_quiz_start`
- `private_quiz_step_complete` with step and answer
- `private_quiz_contact_view`
- `private_quiz_submit`
- `private_quiz_result_view` with recommendation
- CTA click location: header, hero, coach, final, mobile sticky
- Lead-to-conversation and lead-to-booking rates by recommendation and traffic source

The production decision should come from lead quality and bookings, not quiz completion alone.
