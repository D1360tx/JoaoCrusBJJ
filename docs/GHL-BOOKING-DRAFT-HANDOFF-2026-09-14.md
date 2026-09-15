# Welcome booking follow-up: unapplied draft

> **Current execution status:** see [September 15 evidence](GHL-BOOKING-EXECUTION-2026-09-15.md). Execution/controlled testing are now authorized, but authenticated browser, messaging-safety and release gates are blocked. All five public widgets rendered 404; source route gates remain closed. GTM is live compiled version 13. This September 14 document is historical and its no-execution permission statement, selector description and no-tracking claim must not override the newer report.

Execution: **GPT-6 Astra**. Scope: review artifacts only. No GHL workflow edits, test sends, enrollment, publication, calendar activation or production deployment performed in this pass.

## Updated website review handoff

The follow-up task supplied verified standard Share URLs for all five calendars, including saved Austin Youth `wY51xc5N1INt6jsQByeC`, and confirmed that all five are intentionally inactive. This supersedes the earlier missing-Austin/active-duplicate finding below, which is retained as historical evidence only. No new HighLevel audit or mutation was performed in this website-only pass.

The thank-you draft now displays all five schedules and Book Your Class controls without a selection gate. Copy and hero CTA are centered. Each disabled booking link has a visible review explanation, while Email Joao remains a separate action. The exact standard URLs are stored in `site/assets/first-class-booking.js`; `releaseEnabled=false` and all route approvals remain false. Static schedule summaries are regression-checked against the shared calendar records. The no-JS page retains all five schedules and the personal-contact fallback. No sticky new-lead CTA covers the cards.

Activation approval, live calendar acceptance, workflow acceptance and deployment remain separate gates. The workflow specification below remains unapplied.

## Historical observed state and blockers

- Canonical main worktree: `/home/d1360/workspaces/JoaoCrusBJJ-review`, dirty and behind remote main. Left untouched.
- Implementation base: `origin/main` at `167dc66`; related decision PR: #121 (`9c6994a`). This PR incorporates the relevant direction independently and explicitly includes Homeschool from the repair request.
- Exact native browser discovery: Chrome PID 1924, window 6228958; native read-only capture showed Joao Crus Brazilian Jiu-Jitsu and the unsaved **Create - Youth First Class | Austin** editor on Staff & location, assigned Joao Crus.
- Saved config has `computer_use.grant_existing_profile: true`, but the running driver refused `get_browser_state` with `browser_consent_required` / `consumer_profile_endpoint_requires_grant`. No browser mutation was attempted after refusal. A fresh authorized runtime is required; do not bypass or downgrade the refusal.
- GHL `list_workflows` returned HTTP 401, `The token is not authorized for this scope.` No current Draft state, error count, enrollment totals, saved actions, sender values, SMS state or appointment-condition capabilities could be independently verified. Earlier context says Draft / zero errors after tag repair, but this is **historical context, not current verification**.
- Calendar inventory returns empty `openHours` and `availabilities` for these class-booking calendars. This does not establish that schedules were lost: class-booking availability may require a different read surface. Read the native calendar editor before declaring availability valid or invalid.

## Calendar read-back (2026-09-14, read-only API)

Location ID: `PnNnRDAjstycMWpOmUn7`. Shared First Class group ID from context/inventory: `yvqSkqWbsqW7n2nRiusX`. Shared assigned user ID: `vJgE7dMVAvCSPOxOv3n3`; native editor displays Joao Crus.

| Name returned | ID | Slug returned | Active | Duration |
|---|---|---|---|---|
| Little Champions First Class \| Dripping Springs | WqEFb31yftWo7HOIxyv1 | little-champions-first-ds | false | 45 min |
| Youth First Class \| Dripping Springs | lwI401IPhkVBM5TUAhYm | youth-first-ds | false | 45 min |
| Homeschool First Class \| Dripping Springs | TZDZNzvBn0gcHFyfjk2l | homeschool-first-ds | false | 45 min |
| Adults First Class \| Dripping Springs | GO56GPdtrVWfqhOmGK3w | adults-first-ds | false | 60 min |
| Copy of Little Champions First Class \| Dripping Springs | wY51xc5N1INt6jsQByeC | little-champions-first-dsvahy8o | **true** | 45 min |

All five rows share the group and owner IDs above and **120 Frog Pond Lane, Suite 200, Dripping Springs, TX 78620**. All return `appointmentPerSlot: 1`, `allowBookingAfter: 0`, `allowBookingAfterUnit: days`; no numeric booking horizon is returned. These are not the approved two-seat / 12-hour / 28-day defaults. All return auto-confirm, reschedule and cancellation enabled.

No saved calendar named Youth First Class | Austin appears in the inventory. The active duplicate must not be called a verified Austin calendar. Resolve its relationship to the unsaved editor before saving, renaming or deactivating, to avoid another duplicate. Do not touch the unrelated active Dripping Springs Trial Visits or Diego personal calendar.

### URLs

Calendar IDs and slugs above are observed. Stable booking URLs are **not verified**. A read-only request to the candidate standard widget path for Little Champions returned HTTP 403; no appointment or form was submitted. Do not fabricate successful URL verification or populate public links from that result. The staged router deliberately has empty URLs, per-route approval false and global release false. Retrieve each exact Share Calendar link after authorized access is restored.

### Required repair read-back

- Little Champions DS: Mon/Wed 17:00–17:45; Youth DS: Mon/Wed 17:50–18:35; Homeschool DS: Tue/Thu 10:30–11:15; Adults DS: Mon/Wed 18:40–19:40 and Sat 11:00–12:00.
- Austin Youth: Tue/Thu 17:00–17:45, 45 min, **1112 N Lamar Blvd, Austin, TX 78703**. Save only after correcting inherited DS location and availability, then verify inactive in the saved inventory.
- Austin Adults is confirmed Tue/Thu 18:00–19:00 in current decisions, but no matching new calendar was returned. Keep its website route on personal follow-up until a separate matching calendar exists and is verified.
- Read back America/Chicago, exact schedules, two-seat capacity, 12-hour minimum notice, 28-day horizon, Joao assignment, group, notification/consent content and inactive status. Review native confirmation/reminder sending separately from workflow sending.

## Website artifact

`site/campaign/thank-you.html` now offers a primary in-page next-step CTA, program and location selectors, an explicit no-reservation statement and Joao's personal-call fallback. The schedule remains secondary. It never silently routes Austin, Teen, After 60, private or unknown interests to a DS calendar.

`site/assets/first-class-booking.js` is a default-off routing module. All paths currently resolve to the existing Joao email link. It submits nothing, stores no contact data, emits no conversion event and never automatically navigates. Selectors are a deliberate fallback to uncertain/missing form context, not guessed program mapping. No quiz or submission payload changed. No new lead form is introduced. No-JS visitors retain the same honest email fallback.

A future reviewed release must fill exact verified URLs and enable **both** the per-calendar and global approval gates after GHL readiness. The URL validator accepts only a clean HTTPS LeadConnector widget URL matching the calendar ID. If Share Calendar returns another legitimate provider host/path, explicitly review and update the allowlist rather than silently accepting arbitrary destinations.

The welcome CTA destination after deployment is `https://joaocrusbjj.com/thank-you/#first-class-options`. This selector accepts no contact identifiers. It must not be used in live email until the page and calendars are ready. Opening that page is not a booking or lead conversion. Existing quiz inline success UI is unchanged and remains a follow-up integration item.

## Proposed saved workflow structure (NOT applied)

Target: **Website Lead - Welcome Email + Trial Next Step**. Preserve any valid existing repair, especially Add Long Term Nurture Tag; do not rebuild blindly.

1. Trigger: `automation_hold` removed. Re-entry OFF, Stop on Response ON, America/Chicago. Do not auto-release website leads or historical cohorts.
2. Eligibility gate: website_lead; raw Email Consent Status `granted`; no automation_hold; no email DND/unsubscribe/bounce/complaint; not enrolled or closed/lost; no human reply/phone-connected exit state.
3. Wait 15 minutes to give the thank-you scheduler time to complete. This is relative to authorized workflow release, not a claim that release equals initial submission.
4. Recheck eligibility and contact-level appointment state **immediately before each email**. If there is a confirmed appointment, END booking nurture. Also suppress for pending/new, showed, no-show or other existing booking states requiring staff/appointment-specific handling; do not automatically restart generic nurture after cancellation.
5. Eligible and definitively unbooked → Email 1. Wait 2 days → recheck → Email 2. Wait 3 days → recheck → Email 3. Wait 5 days → recheck → Email 4 → END. Do not enroll into perpetual newsletter nurture without separate permission.
6. None/unknown/unsupported appointment-state lookup → END without sending. The safe fallback is not “assume no appointment.”

**Builder capability gate:** this workflow begins from a contact tag, not an appointment trigger. Do not mistake the current trigger's empty appointment context for “contact has no confirmed appointment.” Inspect whether HighLevel offers a genuine contact-level appointment condition. If not, use a separately drafted Customer Booked Appointment / Appointment Status controller to remove the contact from this exact nurture workflow, plus a verified contact-level booking-state field/tag and reconciliation for existing appointments. Unknown/unreconciled contacts must remain held. Do not create a custom field/tag unless its producer and initialization are implemented and verified. A controller alone does not cover appointments predating publication.

Draft controller requirements: exact calendar IDs; confirmed/customer-booked events remove from the target welcome workflow; no email/SMS; save/reopen to verify target. Appointment reminders must remain a separate Draft workflow with exact calendar, confirmed status and raw email consent gates. Controller publication, historical state reconciliation and trigger/runtime acceptance require separate approval. No tests are authorized in this task.

## Email copy for review (NOT saved or sent)

Sender: Joao Crus, using the previously approved authenticated sending identity and monitored reply route. Read existing values before saving; do not guess From/Reply-To. Keep click and UTM tracking on after review, preserve the account's valid physical postal address and native unsubscribe link. Final rendered footer verification remains a release gate. Each email's primary link below uses the selector destination specified above; hide URLs behind the CTA text.

### Email 1 — welcome and optional booking

Subject: Your first visit with us

Preview: Choose a time, or let me help you find the right class.

Hi {{contact.first_name}},

Thanks for reaching out. I'll personally call to help you choose the right program and location.

If you'd rather choose a time now, you can arrange a free studio visit or first-class experience below. Your form submission did not reserve a spot.

**Choose your first-class time**

For a child's visit, they can watch a class or join in at no charge. If you're unsure where to start, just reply with your question.

Joao Crus

[Preserve verified postal address and native unsubscribe footer.]

### Email 2 — reassure before the visit

Subject: Not sure which class to choose?

Preview: You don't need to have everything figured out before your first visit.

Hi {{contact.first_name}},

If you're still deciding, I can help you choose a starting point. Let me know whether the visit is for you or your child, and whether Dripping Springs or Austin is easier.

You can also choose your program and location here:

**Find a first-class time**

If the matching calendar isn't available, reply and I'll help arrange the visit personally.

Joao Crus

[Preserve verified postal address and native unsubscribe footer.]

### Email 3 — remove uncertainty

Subject: A first visit is a chance to see the class

Preview: Come meet us and see whether the program feels right.

Hi {{contact.first_name}},

Your first visit gives you a chance to meet us and see the class before deciding what comes next. For children, watching first is fine, and they may participate at no charge.

**Choose your first-class time**

Have a question about age, experience or location? Reply here and I'll help you work out the next step.

Joao Crus

[Preserve verified postal address and native unsubscribe footer.]

### Email 4 — close the short sequence

Subject: Would you still like to visit?

Preview: Choose a time when you're ready, or reply if you'd like help.

Hi {{contact.first_name}},

Would you still like to come in? If now works, you can choose a first-class time below.

**Choose your first-class time**

If the timing isn't right, that's okay. This is my last booking reminder in this short sequence. You can reply whenever you're ready to talk.

Joao Crus

[Preserve verified postal address and native unsubscribe footer.]

## Local verification

- `python3 scripts/build_vercel_site.py`: 40 canonical pages, 92 assets.
- `python3 scripts/validate_vercel_build.py`: passed 5,189 checks across 40 routes.
- `node --test tests/*.test.js`: 148 passed, zero failures or skips, including the built-route anchor and versioned-asset check.
- `tests/first_class_booking_browser.py`, using isolated Python Playwright/Chromium: 72 program/location selections across 390, 768 and 1280 px; no overflow or page errors; no-JS email fallback passed. All external network and non-GET requests were blocked. No email link, calendar or lead form was submitted.
- `python3 scripts/validate_seo.py`: seven existing failures, independently reproduced on the unchanged decision worktree: duplicate manifest title/description, three missing preview-file coverage entries, and four metadata assertions on meta-kids-first-class.html. This PR does not claim the repository-wide SEO validator is green.
- `git diff --check`: clean.
- Local screenshots/results: `/home/d1360/joao-booking-qa-evidence/`. Local test log: `/home/d1360/joao-booking-tests.tap`. These are not live GHL acceptance evidence.

## Approval gates

1. Restore exact authorized browser binding in a fresh runtime. Workflow read scope is an additional read-only option, not permission to change unrelated integration scopes.
2. Finish and independently read back the calendars, including active-duplicate resolution and the Austin location correction.
3. Retrieve stable URLs. Implement and save actual appointment-aware branch/controller behavior, not merely this specification.
4. Reopen every saved workflow action/settings panel; verify Draft, error count, no unintended enrollment, no SMS and no live release.
5. Separately authorize controlled runtime tests, then separately approve calendar activation, workflow publication and website deployment. This task authorizes none of them.
