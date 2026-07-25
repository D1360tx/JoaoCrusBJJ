# Joao Crus BJJ Campaign Brand Guide

**Status:** Working source of truth for the approved campaign-style website system  
**Reference build:** `site/toddlers-campaign-purposeful-play.html` at commit `9f3d28c2b2f4cf0e9e0cdb5777db82c8f5c96b3f`  
**Visual guide:** `site/campaign-brand-guide.html`  
**Starter CSS:** `site/assets/campaign-brand-tokens.css`  
**Scope:** Joao Crus BJJ website pages, landing pages, forms, schedule views, and campaign extensions

## 1. Brand foundation

### Core idea

Joao Crus BJJ is an experienced, human-centered academy where Jiu-Jitsu develops more than technique. The design should communicate:

- **Energy:** Athletic, active, and decisive
- **Warmth:** Welcoming to beginners, children, parents, and families
- **Authority:** 25+ years of practical teaching experience
- **Growth:** Confidence, regulation, boundaries, attention, resilience, and real skill
- **Local trust:** Real coaches, students, locations, schedules, and parent proof

### Desired feeling

The site should feel like a strong campaign poster brought to life: bold, direct, tactile, and easy to scan. It should not feel like a luxury lifestyle brand, a generic MMA template, or a children's daycare website.

### Audience hierarchy

1. Parents evaluating a safe, developmentally appropriate program
2. Adult beginners seeking confidence, fitness, and composure
3. Existing and prospective private students
4. Schools, teams, and corporate partners
5. Experienced practitioners evaluating Joao's authority

## 2. Brand principles

### Strong, not aggressive

Use athletic visual force without combat-first messaging. Show effort, teaching, connection, and earned progress. Avoid intimidation, cage-fight imagery, blood, distress, or macho posturing.

### Human, not generic

Use real academy photography whenever possible. Joao, students, families, class moments, and locations should carry the story. Do not substitute generic AI people for real community proof.

### Direct, not loud everywhere

Use one dominant visual move per section. A large headline, a bright color block, a framed photograph, or a hard-shadow card can lead. Do not make every element compete at once.

### Playful, not childish

Yellow, stickers, clipped labels, and angled notes can add energy. Keep typography disciplined, geometry strong, and copy respectful.

### Proof before promise

Use observable activities, verified facts, real schedules, testimonials, and careful research language. Do not publish unverified claims, prices, offers, review counts, or guarantees.

## 3. Logo and marks

### Primary identity

Use the official Joao Crus BJJ academy logo or approved wordmark when a clean production asset is available.

### Digital monogram

The circular `JC` mark used in the reference page is a compact digital identifier for navigation and small UI placements.

- Keep it circular
- Use a 3px black border
- Use yellow, blue, and green as the internal color fields
- Pair it with the full academy name in navigation
- Do not use it as a substitute for the official academy lockup in print, signage, uniforms, or formal sponsorship materials

### Clear space

Keep at least one-quarter of the mark's width free on all sides. Do not let stickers, photographs, borders, or navigation labels touch it.

### Minimum size

- Digital monogram: 42px preferred, 36px absolute minimum
- Wordmark text: never below 16px equivalent on screen

### Do not

- Stretch or skew the official logo
- Recolor it with unapproved gradients
- Place it over a busy photo without a solid field
- Add glow, blur, bevel, or soft drop shadows
- treat the `JC` browser monogram as a finalized print logo

## 4. Color system

### Core colors

| Token | Hex | Primary role |
|---|---:|---|
| Campaign Black | `#101010` | Navigation, dark sections, borders, type, hard shadows |
| Warm White | `#FFFDF8` | Primary page background and light sections |
| Champion Yellow | `#F5C400` | Primary CTA, key words, campaign sections, energetic accents |
| Academy Blue | `#194FC3` | Authority, secondary emphasis, section fields, focus states |
| Growth Green | `#2F9B58` | Positive secondary accents and occasional category cues |
| Action Red | `#DF493F` | Rare urgency or status accent only |

### Supporting neutrals

| Token | Hex | Role |
|---|---:|---|
| Body Text | `#202020` | Default copy |
| Muted Text | `#65645F` | Supporting copy on light backgrounds |
| Rule | `#D9D6CC` | Light dividers |
| Warm Cream | `#F4F0E6` | Alternate section field |
| Pale Yellow | `#FFF5C4` | Secondary card fill and form status |
| Pale Green | `#E8F5ED` | Supportive positive card fill |

### Color hierarchy

- Black, warm white, yellow, and blue form the primary system.
- Green is supporting, not a co-equal page background.
- Red is rare and functional. Do not use it simply to make a section louder.
- Prefer solid fields. Avoid glossy gradients and soft atmospheric overlays.

### Accessible text combinations

| Foreground / background | Contrast | Rule |
|---|---:|---|
| Black on warm white | 18.72:1 | AAA, approved |
| Black on yellow | 11.58:1 | AAA, approved |
| White on blue | 7.01:1 | AAA, approved |
| Blue on warm white | 7.01:1 | AAA, approved |
| Muted text on warm white | 5.83:1 | AA, approved for body copy |
| Yellow on blue | 4.33:1 | Large display text only |
| Green on warm white | 3.47:1 | Large text or non-text accents only |
| Red on warm white | 4.00:1 | Large text or non-text accents only |

Never use yellow body copy on white. Never use green or red for small body copy on white.

## 5. Typography

### Display type

**Anton** with `Impact, sans-serif` as fallback.

Use for:

- H1 and H2 headlines
- Large numerals and statistics
- Card titles
- Stickers and short campaign statements
- Compact brand labels

Rules:

- Uppercase by default
- Weight 400
- Line height between `0.90` and `0.96`
- Letter spacing around `0.012em`
- Use short lines with intentional breaks
- Do not use Anton for paragraphs, labels longer than one line, or dense UI

### Body type

**Space Grotesk** with `Arial, sans-serif` as fallback.

Use for:

- Paragraphs
- Navigation
- Buttons
- Forms
- FAQs
- Schedule information
- Captions and citations

Body line height should be approximately `1.5` to `1.6`.

### Type scale

| Role | Recommended size |
|---|---|
| Hero H1 | `clamp(4rem, 10vw, 9rem)` |
| Section H2 | `clamp(2.8rem, 6vw, 5.5rem)` |
| Feature H3 | `1.6rem` to `2rem` |
| Lead paragraph | `1.05rem` to `1.25rem` |
| Body | `1rem` |
| Kicker / eyebrow | `0.76rem` |
| Microcopy / citations | `0.72rem` to `0.8rem` |

### Headline behavior

- Highlight one key phrase in yellow or blue.
- Use broad horizontal space on desktop.
- Stack supporting copy below oversized headlines when a narrow split would make the headline cramped.
- Avoid more than two accent colors in one headline.

## 6. Layout and spacing

### Page container

- Maximum content width: `1160px`
- Desktop side gutters: `20px` minimum per side
- Mobile side gutters: `14px` minimum per side
- Main page overflow must remain hidden horizontally

### Breakpoints

- `920px`: collapse major split layouts and simplify navigation
- `620px`: mobile layout, single-column cards, stacked forms, sticky mobile CTA

### Section rhythm

- Desktop section padding: `88px 0`
- Mobile section padding: `68px 0`
- Use 3px or 4px black borders to create section boundaries
- Alternate calm and energetic fields to keep the page readable

Recommended rhythm:

1. Warm white or black hero
2. Cream explanation
3. Yellow campaign statement
4. Warm white proof or detail
5. Blue or black process section
6. Warm white or cream proof
7. Yellow FAQ or action section
8. Black final CTA

### Spacing scale

Use the following values before inventing new ones:

`4, 8, 12, 18, 24, 28, 34, 42, 54, 68, 88, 110px`

## 7. Shape and depth

### Borders

- Standard component border: `3px solid #101010`
- Major frame or section border: `4px solid #101010`
- Avoid thin gray borders around primary campaign components

### Shadows

Use hard, zero-blur shadows:

- Button: `5px 5px 0 #101010`
- Card: `6px 6px 0 #101010`
- Major frame: `8px 8px 0 #101010`
- Accent shadow may use yellow or blue when the base component is dark

Hover states may translate the element by 2px to 3px while reducing the shadow by the same amount.

### Corners

- Square corners are the default
- Circles are reserved for badges, stickers, and compact marks
- Avoid soft rounded cards and pill-heavy SaaS styling

### Angles and texture

Use clipped labels, rotated notes, brush bars, or torn-edge separators sparingly. One or two tactile gestures per viewport is enough.

## 8. Core components

### Utility bar

- Black field with white text
- Yellow link or action
- Uppercase microcopy
- One operational fact plus one action

### Navigation

- Warm-white or black field depending on page context
- Compact brand lockup on the left
- No more than four primary links plus one CTA on desktop
- Hide secondary links behind a menu below the tablet breakpoint

### Buttons

**Primary:** yellow fill, black text, black border, hard black shadow  
**Dark:** black fill, white text, yellow shadow  
**Blue:** blue fill, white text, yellow shadow

Buttons must:

- Use uppercase Space Grotesk, 700 or 800
- Be at least 48px tall on mobile and 54px preferred on desktop
- Use verb-led labels
- Show visible focus and hover states
- Never rely on color alone to communicate state

### Kicker

A short uppercase label above a headline.

- `0.76rem`
- Weight 700 or 800
- `0.16em` letter spacing
- Blue on light fields, yellow on dark or blue fields

### Hero

Use a two-part poster composition:

- Direct, oversized headline and one clear promise
- Real academy image in a thick frame
- One small sticker or angled reassurance note
- One primary CTA and one secondary path

The image crop must preserve faces, academy identity, and the emotional focal point at desktop and 390px mobile.

### Cards

- White, pale yellow, pale green, or black fields
- 3px black border
- Hard 6px shadow
- One short title, one supporting paragraph, and optional number or tag
- Equal heights within a row when practical
- Do not place long essays inside cards

### Section introduction

Use a large headline with a short explanatory paragraph. When the headline is oversized, stack the paragraph underneath rather than forcing it into a narrow side column.

### Timeline or process

- Four steps maximum per row on desktop
- Use Anton for time or sequence numerals
- Alternate white and pale-yellow panels
- Collapse to two columns, then one column

### Comparison

- Two strongly separated fields inside one heavy frame
- Neutral side for concern or current state
- Yellow side for the desired state or what the academy helps grow
- Keep labels parallel and lists comparable

### Testimonial

- Pair a real image with a dark quote field
- Use yellow stars or attribution, not decorative quote marks alone
- Keep the quote specific and human
- Verify permission and attribution

### FAQ

- White panels on a yellow section field
- Heavy borders and hard shadows
- Use native `details/summary` when possible
- Preserve keyboard and screen-reader behavior

### Forms

- White form card on a high-contrast section
- 3px field borders and square corners
- Visible labels, not placeholder-only inputs
- 52px minimum field height
- Clear focus outline
- One full-width submit button
- Honest preview states until a real backend is connected

### Research note

- Black card with yellow heading
- Plain-language claim first
- Linked superscript references plus visible author/year links
- Citations should remain compact and readable on mobile
- Verify author, title, year, DOI, and claim fit before publishing

## 9. Photography direction

### Use

- Real Joao Crus BJJ students and coaches
- Visible teaching, listening, partnering, movement, and smiles
- Group images that communicate belonging
- Detail images showing hands, posture, balance, and interaction
- Environmental cues such as academy logos, mats, and real locations

### Composition

- Keep faces inside the safe center crop
- Leave room for labels only when the label will not obscure a face
- Preserve natural skin tone and gi color
- Use documentary warmth rather than dramatic fight-poster grading
- Optimize to WebP and size images for their actual display area

### Avoid

- Generic AI-generated children or fighters
- Stock-photo handshakes and corporate teams
- Heavy desaturation, neon glows, smoke, flames, cages, or blood
- Images where a child looks distressed or physically overpowered
- Crops that remove academy identity or cut through faces

### Technical rules

- Set explicit width and height attributes
- Use accurate alt text that describes the image's purpose
- Use `fetchpriority="high"` only for the primary hero image
- Lazy-load below-the-fold imagery
- Verify `object-fit` crops at desktop and 390px mobile

## 10. Voice and messaging

### Voice traits

- Direct
- Experienced
- Reassuring
- Specific
- Parent-aware
- Confident without exaggeration

### Copy structure

1. State who the program is for
2. Name the real concern or desired outcome
3. Explain how the class or method works
4. Add specific proof
5. Ask for one clear next step

### Preferred language

- Practice
- Earned confidence
- Safe boundaries
- Body control
- Stay present
- Try again
- Beginner-friendly
- Movement, games, and repetition
- Skills for life

### Avoid

- Empty superlatives such as "best ever"
- Unverified exclusivity claims
- Combat-first promises
- Medical claims unsupported by the cited research
- Generic phrases such as "unlock your potential" without specifics
- Em dashes. Use periods, commas, colons, or separate sentences
- Pricing or offer details that have not been confirmed

### CTA pattern

Use direct labels that reduce uncertainty:

- Plan a first class
- See the class schedule
- Find the right program
- Ask about private coaching
- Join the Austin interest list

Avoid vague labels such as "Learn more" when a specific action is available.

## 11. Accessibility and behavior

- Maintain WCAG AA contrast for normal text
- Use 4px visible focus outlines with adequate contrast against the local field
- Use yellow focus on black or blue sections, blue focus on warm-white or yellow sections
- Keep tap targets at least 44px by 44px
- Preserve semantic heading order
- Include a skip link
- Use native controls where possible
- Do not hide information only behind hover
- Respect reduced-motion preferences when adding animation
- Do not let sticky mobile CTAs cover forms, schedule controls, legal copy, or the footer

## 12. Responsive rules

### Desktop

- Use large headlines across broad space
- Keep hero image and headline in a balanced split
- Use 3-column or 4-column grids only when card copy remains readable
- Let proof and photography breathe

### Tablet

- Collapse major splits to one column
- Reduce 4-column grids to 2 columns
- Hide secondary navigation links behind a menu

### Mobile

- Use single-column cards
- Make CTA buttons full width when they form a set
- Reduce page gutters to 14px per side
- Keep headlines large but prevent one-word orphan lines when possible
- Test at 390px by 844px
- Hide preview ribbons
- Show the sticky CTA only when it does not compete with a form or schedule interaction

## 13. Page assembly patterns

### Program page

1. Program-specific hero
2. Who it is for and why it exists
3. Observable activities or outcomes
4. Class format
5. Parent or student reassurance
6. Schedule and location
7. Coach authority
8. Testimonial
9. FAQ
10. Single primary CTA

### Location page

1. Location-specific hero and address
2. Available programs
3. Current verified schedule
4. Directions and local context
5. Coach and community proof
6. FAQ
7. Visit or contact CTA

### Authority page

1. Joao's positioning and experience
2. Teaching philosophy
3. Lineage and credentials
4. Books, podcast, and educational assets
5. Student or partner proof
6. Clear next paths for academy, private, or organizational visitors

### Conversion page

1. One audience
2. One problem
3. One offer or next step
4. One primary CTA
5. Supporting proof and FAQ
6. Minimal navigation

## 14. Do and do not

### Do

- Build with real academy content
- Use thick borders and hard shadows consistently
- Alternate calm and high-energy sections
- Keep one clear visual leader per section
- Match message, image, and CTA to the page audience
- Reuse one schedule source and one set of navigation patterns
- Validate every page at desktop and 390px mobile

### Do not

- Mix the campaign system with bronze, crimson, luxury, glassmorphism, or soft SaaS styling
- Add random new colors
- use five different card treatments on one page
- Put every section on yellow or black
- Use tiny uppercase copy for long paragraphs
- Publish hot-linked production images when an owned optimized asset can be used
- Duplicate schedules, prices, or volatile facts across templates

## 15. Implementation checklist

Before a new page is considered aligned:

- [ ] Anton and Space Grotesk are loaded with fallbacks
- [ ] Core color tokens match this guide
- [ ] Container and breakpoints match the shared system
- [ ] Headlines use the correct display hierarchy
- [ ] Borders are 3px or 4px and shadows are hard, not blurred
- [ ] CTA hierarchy is clear
- [ ] Real photography is optimized and cropped correctly
- [ ] Body copy and CTA labels follow the voice rules
- [ ] Claims, schedules, locations, prices, and offers are verified
- [ ] Forms have visible labels and honest states
- [ ] Contrast and focus states pass
- [ ] Desktop and 390px mobile are visually reviewed
- [ ] No horizontal overflow exists
- [ ] No console errors or broken internal links exist
- [ ] Drafts remain `noindex, nofollow`

## 16. Governance

- This guide is the design source of truth for new campaign-style pages.
- Use the namespaced starter primitives in `site/assets/campaign-brand-tokens.css` when introducing the system to a legacy page. Promote approved components into the shared production stylesheet rather than creating page-local copies.
- Existing comparison variants remain preserved.
- When a component is approved, update the shared site stylesheet rather than copying it into additional pages.
- Record intentional exceptions in the pull request or page documentation.
- If the official logo package, typography license, or brand photography library changes, update this guide before rolling changes across the site.
