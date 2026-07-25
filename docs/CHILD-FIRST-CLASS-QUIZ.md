# Child First-Class Match Quiz

## Purpose

A mobile-first quiz for paid social, landing pages, and parent-guide CTAs. It adapts the strongest patterns from the supplied Athlete to Athlete reference while keeping the Joao Crus BJJ campaign visual system and program facts.

**Preview page:** `site/campaign/first-class-match.html`

## Conversion promise

> Find your child's best first-class match in about two minutes.

The result never labels a child as ready or not ready. Every path recommends a supportive starting approach, the age-appropriate program, and the best available location fit.

## Flow

1. Child's age, 3 through 12
2. Parent's top goals, choose up to two
3. Behavior in a new activity
4. Comfort with close-contact play
5. Preferred coaching style, choose up to two
6. Prior activity and martial arts experience
7. Preferred academy location
8. Child and parent first names, email, optional phone, and contact permission
9. Personalized result with program, location, first-class priorities, and CTA

## Result paths

| Path | Primary signals | First-class emphasis |
| --- | --- | --- |
| Supported Start | Watches first, stays close, avoids contact, or needs patient coaching | Trust, choice, gradual partner contact, visible small wins |
| Confidence Builder | Mixed comfort and experience signals | Clear structure, encouragement, one-step progress |
| Ready-to-Roll Start | Jumps in, enjoys contact, or has martial arts experience | Technique, direct coaching, purposeful challenge |

Program routing is separate from temperament scoring:

- Ages 3 to 7: Little Champions
- Ages 8 to 12: Youth BJJ
- Austin is available only for ages 8 to 12 because the confirmed Austin schedule is a youth program
- Ages 3 to 7 selecting “Help me choose” are routed to Dripping Springs

## Tracking contract

The component pushes these events to `window.dataLayer` for future GTM mapping:

- `quiz_view`
- `quiz_started`
- `quiz_step_completed`
- `quiz_back`
- `quiz_lead_attempted`
- `quiz_preview_completed`
- `quiz_lead_submitted`
- `quiz_lead_failed`
- `quiz_result_viewed`
- `quiz_restarted`

No GA4 or Meta tags are embedded directly. GTM remains the single tag-management layer.

## Lead connection

The preview intentionally has no production lead endpoint. It shows the personalized result but clearly states that contact information was not sent or stored.

To connect a secure JSON endpoint, set the quiz application's `data-endpoint` attribute:

```html
<article id="quiz-app" data-endpoint="https://secure.example.com/leads">
```

Expected request shape:

```json
{
  "quiz": "child_first_class_match",
  "answers": {
    "age": "7",
    "goals": ["confidence", "boundaries"],
    "environment": "watches-first",
    "contact": "warms-up",
    "coaching": ["patient", "clear"],
    "experience": "new",
    "location": "dripping-springs"
  },
  "contact": {
    "child_first_name": "Kai",
    "parent_first_name": "Diego",
    "email": "parent@example.com",
    "phone": ""
  },
  "page": "https://example.com/first-class-match.html",
  "submitted_at": "ISO-8601 timestamp"
}
```

Only nonpersonal quiz answers are saved in `sessionStorage` to preserve progress in the current tab. Names, email, and phone are never saved there.

## Publication checklist

- [ ] Connect and verify a secure lead endpoint
- [ ] Link final privacy and terms language
- [ ] Add explicit SMS consent only if automated text follow-up will be used
- [ ] Map dataLayer events in GTM to GA4 and Meta
- [ ] Preserve UTM parameters through the lead endpoint
- [ ] Confirm the booking destination after the booking-platform decision
- [ ] Remove the preview ribbon and preview disclosure before publication
- [ ] Replace `noindex` only when the production page is ready to index

## Suggested ad hooks

- “Is your child ready for Jiu-Jitsu? The better question is how should their first class begin?”
- “Shy, fearless, focused, or full of energy. Find the first-class approach that fits your child.”
- “Take the two-minute First-Class Match Quiz.”

## Suggested site CTA

**Headline:** Not sure where your child should start?

**Body:** Answer a few simple questions and get a personalized first-class recommendation based on age, goals, comfort, and experience.

**Button:** Find Their First-Class Match
