# Austin Landing Page Source Review

> Source reviewed: <https://joaocrusbjj.com/austin-brazilian-jiu-jitsu/>
> Reviewed: 2026-07-27
> Source-reported last modified time: 2026-07-26 14:55:40 UTC
> Status: first-party Joao Crus BJJ source. Use for planning, but reconfirm volatile operational details before production launch.

## Purpose

Joao shared a new WordPress landing page for the Austin location. This note records useful facts and content from that page without changing the campaign-site Austin page or shared calendar.

## Verified first-party information

### Location

- Street address: **1112 N Lamar Blvd, Austin, TX 78703**.
- Existing campaign context identifies the location as inside Castle Hill Fitness. The new source page does not mention Castle Hill Fitness by name, so that relationship and public naming permission should still be reconfirmed.
- Published directions URL: <https://www.google.com/maps/search/?api=1&query=1112+N+Lamar+Blvd+Austin+TX+78703>.

### Programs and timing

- **Kids Brazilian Jiu-Jitsu:** ages **8–12**.
- Kids group schedule: **Tuesday and Thursday, 5:00–6:00 p.m.**
- **Adult private instruction:** appointment based with flexible scheduling.
- Adult private instruction is described as one-on-one, adapted to the student's goals, experience, pace, and availability. Beginners are welcome.
- The source does **not** publish a recurring Austin adult group-class schedule. The adult group schedule therefore remains unconfirmed and should not be added to the shared calendar.

### Positioning and proof

- Hero message: “Brazilian Jiu-Jitsu that builds confidence beyond the mat.”
- Austin positioning: welcoming, relationship-centered instruction with people before performance.
- Published proof points: beginner friendly, 25+ years teaching, and relational first.
- Method statement: “Relational First, Physical Second.”
- Benefits emphasized: confidence, emotional control, focused coaching, and real connection.

### Contact and inquiry flow

- Phone: **512-644-4560**.
- Published Austin inquiry email: **joaocrusbjj@gmail.com**.
- The campaign footer currently uses **joaocrus@gmail.com**. Confirm the canonical inbox before changing any production contact details.
- Inquiry form fields: full name, email, phone, program of interest, and optional questions/message.
- Program choices: Kids classes ages 8–12 and Adult private classes.
- The WordPress form posts to a custom handler identified as `jca_austin_inquiry`.

### First-party visual asset

- Source image: <https://i0.wp.com/joaocrusbjj.com/wp-content/plugins/joao-crus-austin-landing/assets/austin-adult-class.jpg?w=1080&ssl=1>
- Published dimensions: **1080 × 810**.
- Source alt text: “Joao Crus Brazilian Jiu-Jitsu students in Austin.”
- Before reusing it, confirm that the photo is genuinely Austin-specific, identify the people shown, and copy an approved optimized version into the local repository rather than hot-linking WordPress.

## Comparison with the campaign Austin page

| Item | Current campaign page | New Joao source | Recommended treatment |
| --- | --- | --- | --- |
| Kids ages | Body says 8–12; metadata says 7–12 | 8–12 | Standardize all Austin copy and metadata to 8–12. |
| Kids times | Tue/Thu, 5:00–6:00 p.m. | Same | Keep in the shared schedule as the canonical recurring Austin class. |
| Adult offering | General adult interest list | Private adult instruction by appointment | Keep adult group classes as interest-list only, but add adult private instruction as a real second path. Do not place private appointments in the weekly calendar. |
| Address | Street and Castle Hill name; ZIP omitted | Full Austin address with ZIP | Add `Austin, TX 78703` and a direct directions CTA. |
| Page focus | Primarily youth | Kids group plus adult private | Reframe as an Austin location page with two clear program paths. |
| Method | Minimal on-page explanation | Relationship-centered, relational-first method | Add a concise Austin-specific method/proof section without duplicating the full About page. |
| Contact | Generic first-class CTA | Austin inquiry form with program selection | Route to one Austin inquiry flow with the program preselected where possible. Do not simulate success until the backend is connected. |
| Photography | Generic campaign kids image | First-party Austin-labeled class photo | Prefer the verified first-party Austin image if Joao confirms it. |

## Recommended Austin-page additions

1. **Create two clear program choices:** Kids group classes and adult private instruction.
2. **Preserve one canonical schedule:** show only the confirmed Tue/Thu kids classes in the shared calendar. Describe adult privates as appointment based, not as calendar slots.
3. **Add full visit details:** city, ZIP code, direct Google Maps directions, Castle Hill/check-in context if confirmed, and parking or entrance instructions once Joao supplies them.
4. **Use the stronger Austin-specific message:** relationship-centered coaching, beginner friendliness, and confidence beyond the mat.
5. **Use a location-aware inquiry path:** let visitors choose Kids 8–12 or Adult Private, then carry that selection into the form or booking flow.
6. **Replace generic imagery only after verification:** confirm the first-party photo, then optimize and store it locally.
7. **Keep factual restraint:** do not imply that Austin has recurring adult group classes or publish exact private availability.

## Questions to resolve with Joao

- Is the Austin location still publicly described as being inside Castle Hill Fitness, and may the new site use the Castle Hill name?
- What are the parking, entrance, front-desk, and check-in instructions?
- Is “new Austin location” still accurate for the production launch date?
- Is the published class photo from the Austin location, and is it approved for the new site?
- Should Austin inquiries go to `joaocrusbjj@gmail.com` or `joaocrus@gmail.com`?
- Who teaches the recurring kids classes and adult private lessons in Austin?
- Are adult private lessons available only at Austin, or at both locations?
- Is there an Austin adult group interest list, and if so, what information should be collected?
