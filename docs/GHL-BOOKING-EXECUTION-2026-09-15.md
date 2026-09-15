# Booking execution evidence: 2026-09-15

## Latest website wiring checkpoint — supersedes earlier closed-source-gate notes

Five booking routes are enabled in the PR source, with exact ID-to-URL validation and idempotent handler mounting. **Three supplied/handoff slugs were wrong:** `little-champions-first-class`, `homeschool-first`, and `adults-first` returned 404 in anonymous Chromium. Fresh GHL inventory trace `20ca142a-0bc0-4985-aa86-e8961a85bab4` identifies the actual slugs as `little-champions-first-ds`, `homeschool-first-ds`, and `adults-first-ds`; Youth retains `youth-first-ds` and `youth-first-austin`. Native Adults address-bar verification agreed, although its document title retained the old URL. All five corrected URLs were then independently re-opened anonymously: HTTP 200, correct program, America/Chicago, matching available times and two seats. Supplied URLs are preserved here as rejected evidence, not silently treated as verified.

The thank-you source no longer falsely says active calendars are paused. Schedules and separate human follow-up remain. `booking_start` routes directly once per click to consented GA4; Meta custom `StartFirstClassBooking` uses the existing Pixel and separate ad/user-data/GPC checks. No legacy custom-event push duplicates this routing. Local tests stub transports; no downstream receipt is claimed.

A **staged, default-off** signed provider webhook adapter reuses existing lifecycle destination functions for GA4 `trial_booked` and Meta `Schedule`. It verifies provider signatures, source/status/calendar/location/contact, fails missing consent closed, and uses a stable appointment ID plus private ledger. No public confirmation-load conversion exists. See `BOOKING-WEBHOOK-CONTRACT.md`: subscription registration, existing opportunity-Schedule ownership reconciliation, live deployment and destination acceptance remain unfinished. No GHL redirect/subscription or server configuration was changed.

**Release blocked, PR stays Draft:** fresh SSH attempt reset before authentication at `162.241.225.99:22`; native Bluehost tab shows Portal Login. No origin backup or deployment was possible. Source SEO validator still reports the same seven baseline issues. No controlled booking was submitted because the intended confirmation adapter cannot yet be deployed/connected; contact/appointment/opportunity read-back, cleanup, GA4 receipt and Meta Test Events remain unperformed. Welcome, DNS, mail and all workflows remain unchanged.

Verification: 154 Node tests passed (zero failed/skipped); staging validator 5,197 checks passed; PHP lint and executable signature/consent/dedup test passed using isolated PHP 8.3 CLI; 390/768/1280/1440 browser runs checked all five links (20 card checks), no overflow/page errors, one stubbed GA4 and Meta start per click. Fresh public GTM resource remains v13, tag 26 sole active base with ad_storage; router 21 lacks an explicit compiled additional-consent array. No GTM changes/publication or Preview acceptance. Local evidence: `/home/d1360/joao-booking-audit-20260915/release-phase/`.

## Native activation checkpoint — latest, supersedes inactive/404 checkpoints

Controlled only the already-authenticated native Chrome window `pid=10232`, `window_id=526090` using `computer_use`. No browser_exec or workflow API was used in this continuation.

**Five of five calendars activated and read back ACTIVE after a native browser reload.** Unrelated Dripping Springs Trial Visits and Diego calendars were not changed. Five public Share URLs were copied from their exact calendar rows, opened in native Chrome, and rendered available slots rather than Page Not Found. No booking was submitted.

| Calendar ID | Public Share path under https://api.leadconnectorhq.com/widget/bookings/ | Observed available slot (America/Chicago) |
| --- | --- | --- |
| WqEFb31yftWo7HOIxyv1 | little-champions-first-class | Wed Sep 16, 2026, 5:00 PM; 45 min |
| lwI401IPhkVBM5TUAhYm | youth-first-ds | Wed Sep 16, 2026, 5:50 PM; 45 min |
| TZDZNzvBn0gcHFyfjk2l | homeschool-first | Thu Sep 17, 2026, 10:30 AM; 45 min |
| GO56GPdtrVWfqhOmGK3w | adults-first | Wed Sep 16, 2026, 6:40 PM, and selected Sat Sep 19, 11:00 AM; 60 min |
| wY51xc5N1INt6jsQByeC | youth-first-austin | Thu Sep 17, 2026, 5:00 PM; 45 min |

The working Share/slugs above were the browser targets. This continuation did not independently retest the older singular `/widget/booking/{ID}` paths or submit contact details. Calendar selection and visible available times prove passive widget readiness, not successful reservation or downstream delivery.

### Native workflow trigger audit

Opened each named workflow and its existing trigger cards without saving changes:

- **Website Lead - Email First Release (Published):** Contact tag; Tag removed = `automation_hold`. Visible Email consent gate branches on Email Consent Status = `granted`; Do not message branch ends. Email follow-up and wait actions are visible downstream.
- **Website Lead - Reply Routing (Published):** Customer replied; Has Tag = `website_lead`. Visible branches include Reply contains STOP, unsubscribe, or cancel, plus None, with routing actions downstream. A booking alone is not a customer reply.
- **Website Lead - SMS Consent Nurture (Published):** two Contact tag triggers. First shows Tag added with unresolved Select a tag; second shows Tag removed with unresolved Select a tag. Both cards have validation warnings. Visible actions are Send Initial SMS, Wait for Reply, Follow-up SMS. Do not infer from unresolved selectors either operational readiness or a safe no-send guarantee for arbitrary tag changes. No Appointment Status or Customer Booked Appointment trigger is present in these two cards.
- **Website Lead - Staff Alert (Published):** Contact tag; Tag added = `website_lead`; Send internal email alert action visible. It is not an appointment trigger.
- **Website Lead - Welcome Email + Trial Next Step (Draft):** Contact tag; Tag removed = `automation_hold`; Email Consent Status = `granted` branch leads to Welcome email - expectations and next step and Wait; None ends. List read-back shows zero total/active enrolled. Remains Draft.
- Additional visible Published **Internal Email Deliverability Seed QA - 14 Day** was inspected: Contact tag; Tag added = `deliverability_seed_start`; seed email/wait actions. No appointment trigger found there either.

**Conclusion:** none of the inspected trigger cards references Appointment Status, Customer Booked Appointment, a new calendar ID, or another appointment event. Passive calendar activation/widget viewing does not create a contact/tag/reply and no message-producing test was run. No workflow was paused, edited, published or given an exclusion. This is trigger-level evidence, not a complete inspection of every downstream action configuration, external tag producer, calendar form behavior, or successful no-send booking execution. Before synthetic booking, use a fresh noncustomer identity, avoid website/release/seed tag changes, retain raw consent denied, and finish any needed producer/action checks. Do not release SMS based on this audit.

Durable local evidence: `/home/d1360/joao-booking-audit-20260915/native-activation/`, including `activation-results.json` (five unique IDs), `all-active-after-reload.png`, five widget screenshots, `workflow-statuses.png`, and exact email/reply/SMS/staff/welcome/seed trigger screenshots. Earlier trigger captures were evicted from the short-lived cache, so the trigger panels were reopened and replacement captures copied immediately.

No website/GTM edits, analytics conversion tests, production deployment, synthetic appointment or outbound communication occurred. Existing uncommitted documentation changes were preserved. Calendar/widget activation is complete; full booking acceptance and website/analytics release remain separate unfinished gates.

## Native authenticated resume (supersedes browser-access blocker below)

The existing Chrome window `pid=10232`, `window_id=526090` was successfully controlled with `computer_use`. No browser_exec session was launched. The Welcome workflow was inspected in Draft with Errors (0); it was not edited, tested or published.

**Partial progress, not release complete:** Little Champions `WqEFb31yftWo7HOIxyv1` was repaired and saved. API read-back trace `6be72602-08a5-42a1-8edb-c7027c4cd96f` confirms two seats, 45 minutes, 12 hours notice, 28 days horizon, auto-confirm, Joao ownership/address, reschedule/cancel enabled, Google invitation emails false, and truthful on-screen confirmation copy. Native Availability read-back shows a calendar-specific Custom schedule, America/Chicago, Monday/Wednesday 5:00–5:45 PM, all other days unavailable; no date-specific overrides. The broad calendar consent checkbox was disabled (the API still retains its unused label). Notifications & policies shows email/SMS disabled on all listed notification types; in-app notifications remain. External calendar invitation and assignment-email settings were turned off and saved. Do not claim end-to-end messaging suppression from this single-calendar configuration: other workflows and the test source still need review.

All five calendars remain **inactive**, verified in the native list and API inventory. The other four retain the previously documented defaults and were not changed. No synthetic contact, opportunity, appointment, analytics event, GTM publication or website deployment was performed. The browser remains authenticated on Settings > Calendars list, with no unsaved editor. PR #122 remains Draft at `3a534bb6544e9baae863d4d89dd436c8b825a03a` before this documentation edit.

Resume mechanics: element clicks are refused because the wrapper does not forward snapshot tokens; screenshot-coordinate background clicks work and scale internally (do not multiply screenshot coordinates). Keyboard/text input require foreground delivery after the explicit background-unavailable response. Capture after Ctrl+A and verify selection before typing; otherwise time fields can concatenate. For Availability, click Joao's row, choose Custom schedule rather than modifying shared Working hours, disable unneeded weekdays, set the first day's exact start/end, and use Copy times only to the desired weekdays. Save the side panel, then global Save. Global Save keeps the editor open; return to the calendar list and reopen for durable read-back. Scroll coordinates were ignored by the wrapper in one attempt; prefer the actual visible scrollbar or freshly captured controls.

Durable local evidence: `/home/d1360/joao-booking-audit-20260915/native-resume/calendar-progress.json`, `little-weekly-hours.png`, `little-notifications.png`, `calendar-inventory.png`. The older workflow-error screenshot was evicted from the short-lived cache before copying; its observation remains in this run's tool history.

## Earlier outcome

**Incomplete; production release blocked.** Five saved calendars were read, five exact public widgets were opened, live thank-you runtime and GTM were audited, and consent-gated booking-intent instrumentation was added behind the existing closed release gates. No calendar, workflow, GTM, production files, DNS or mail settings were changed. No synthetic lead or appointment was submitted.

The user approved execution and controlled acceptance. Lack of approval is no longer the blocker; authenticated control, calendar readiness, messaging safety, confirmed-booking implementation and destination evidence are.

## Calendar read-back

Source: `joao-ghl-read.list_calendars`, trace `445d25ec-19b0-4785-9003-fa22be6413dc`. Location `PnNnRDAjstycMWpOmUn7`, group `yvqSkqWbsqW7n2nRiusX`, assigned user `vJgE7dMVAvCSPOxOv3n3`.

| Calendar | ID | Duration | Active | Widget browser response |
|---|---|---:|---|---|
| Little Champions First Class / Dripping Springs | WqEFb31yftWo7HOIxyv1 | 45 min | false | 404 Page Not Found |
| Youth First Class / Dripping Springs | lwI401IPhkVBM5TUAhYm | 45 min | false | 404 Page Not Found |
| Homeschool First Class / Dripping Springs | TZDZNzvBn0gcHFyfjk2l | 45 min | false | 404 Page Not Found |
| Adults First Class / Dripping Springs | GO56GPdtrVWfqhOmGK3w | 60 min | false | 404 Page Not Found |
| Youth First Class / Austin | wY51xc5N1INt6jsQByeC | 45 min | false | 404 Page Not Found |

Exact widget URL for each row: `https://api.leadconnectorhq.com/widget/booking/{ID}`. Browser probes at 2026-09-15 14:03 UTC used real isolated Chromium, without a signed-in profile, and blocked non-GET/HEAD requests. They did not submit forms. Five unique IDs were counted from the saved probe results.

All intended calendars return:
- Correct DS address `120 Frog Pond Lane, Suite 200, Dripping Springs, TX 78620`, or Austin `1112 N Lamar Blvd, Austin, TX 78703`.
- `appointmentPerSlot=1`, `slotInterval=30 mins`, `allowBookingAfter=0 days`; no numeric booking horizon.
- `autoConfirm=true`, `allowReschedule=true`, `allowCancellation=true`, `googleInvitationEmails=true`.
- Default confirmation copy still says someone will contact the visitor to confirm the request, despite auto-confirm being enabled. This needs reconciliation.
- Broad default contact/content consent copy, requiring a native review before any acceptance test.
- Empty `openHours`/`availabilities` in this class-booking inventory. Do **not** infer missing weekly schedule or timezone from this read surface.

Required native verification/repair: exact confirmed weekly schedule, America/Chicago, two trial seats per class, 12-hour notice, 28-day horizon, truthful confirmation copy, native notifications and workflow suppression. Activate only after those values are saved and read back, then re-open all widgets and verify actual available slots.

No duplicate-named copy remains in the returned inventory. The former copied ID now correctly names Austin Youth and has its Austin address. Unrelated active calendars `t3BhPBY47hZZ6a7pIUan` (Dripping Springs Trial Visits) and `ywdxKQrU74LgiaN6loGy` (Diego personal) were left untouched.

## Analytics evidence

- Public compiled container: `GTM-596MGPMD`, resource version **13**. Saved parsed resource: `/home/d1360/joao-booking-audit-20260915/gtm-resource.json`.
- Fetched `gtm.js` SHA-256: `2dcfc157a08b1231793932029ee29964bc4c8b2d41a72542870e255087ed7ef5`. This identifies that response, not a permanent container hash.
- Tag 26 is the sole executable `fbq("init",...)` owner, Pixel `592714768141415`, with `ad_storage` consent. Tags 20 and 38 are paused. Router 21 retains custom `StartFirstClassBooking`, not `Schedule`, for `booking_start`.
- Router 21 has no explicit additional-consent array in the compiled resource. Its runtime consent behavior was not certified; do not claim all existing Meta routes are consent-audited. The new card intent checks category consent directly and does not push the legacy custom-event router name.
- No `booking_confirmed` or `trial_booked` string in the fetched container. This is not proof that no separate server lifecycle integration exists; deployment/workflow ownership still needs audit.
- GA4 property `547238162`, measurement `G-EW2F2YKR3Y`. Realtime read returned page_view 3, session_start 2, first_visit 1, scroll 1. These are aggregate baseline events, **not receipt for this task's lead/booking test**.
- No Tag Assistant session, GA4 synthetic lead/booking receipt, Meta Test Events receipt, or browser/server dedup receipt was obtained. No GTM publication occurred.

## Website evidence and implementation

Canonical `https://joaocrusbjj.com/thank-you/` returned HTTP 200 in Chromium, the old confirmation page, and **zero booking cards**. Direct Python HTTP returned 406; the real-browser retry obtained the actual page. Runtime dataLayer contained only GTM lifecycle events, not a manufactured lead. The audit blocked GA4 and Meta collection; it is not destination-delivery proof.

New staged card-click logic:
- Both release gates stay closed, preserving disabled cards and visible schedules.
- On a genuinely released card click, GA4 receives `booking_start` with explicit `send_to=G-EW2F2YKR3Y`; Meta receives custom `StartFirstClassBooking` through the existing GTM-loaded Pixel.
- No legacy `booking_start` dataLayer custom event is also emitted, avoiding double routing.
- Only controlled program/location/form/context fields. Analytics and advertising consent evaluated separately at click time; advertising also requires user-data consent and no GPC.
- No contact data, storage, new Pixel/container, network fetch, delayed replay, or blocked navigation. Missing Pixel means no claimed delivery.
- Thank-you loads/refreshes do not create `generate_lead`, `Lead`, `Schedule` or `Purchase`. Existing source forms retain accepted-lead ownership.
- **Confirmed-booking implementation remains unfinished.** Do not add a conversion to a redirect or arbitrary postMessage. Reconcile the existing lifecycle path first and require provider-confirmed appointment identity and idempotent consent-aware delivery.

## Access blockers

1. The historical Chrome PID/window no longer exists. Native discovery found only the Chrome profile picker, then opening the ICDC profile produced a new-tab window. No GHL page was edited.
2. Supported authenticated path `browser_exec(local=True, session="joao-booking-20260915")` refused: `browser.use_real_profile is on, but your default browser is not a supported Chromium browser`. User/browser setup is required before authenticated web work can resume.
3. Current Hermes docs remove the former typed browser route and ignore `computer_use.grant_existing_profile`; do not repeat the obsolete restart/grant workaround from the historical handoff.
4. `list_workflows` returned HTTP 401: token not authorized for this scope. Current sending safety cannot be established. Native calendar invitations also need checking. A controlled test is authorized but unsafe until those gates pass.
5. `ssh -o BatchMode=yes -o ConnectTimeout=10 joao-bluehost ...` reset before authentication at port 22. No backup or deployment was attempted.

## Verification

- `python3 scripts/build_vercel_site.py`: 40 canonical pages, 92 assets.
- `python3 scripts/validate_vercel_build.py`: **5,197 checks passed** across 40 routes.
- `node --test tests/*.test.js`: **154 passed, 0 failed, 0 skipped**.
- New intent tests cover every card, closed gates, direct/repeated page visits, analytics-only/ads-only consent, GPC, denied user-data, withdrawal, absent Pixel, canceled click, explicit GA4 destination, no PII and no false confirmed/lead events.
- Local Playwright: 390/768/1280/1440 widths, **20 card checks**, no overflow/page errors, black-on-yellow controls, disabled keyboard/mouse actions, static schedules, no-JS fallback.
- `python3 scripts/validate_seo.py`: **7 failures** across 2,509 checks, matching the previously recorded unrelated baseline: duplicate manifest title/description, coverage mismatch, four Meta kids metadata errors. Not release-green.
- `git diff --check`: passed before commit.

Local evidence: `/home/d1360/joao-booking-audit-20260915/` (`public-probes.json`, `gtm-resource.json`, `tests.tap`, `browser/results.json`, screenshots). These paths are local evidence, not public previews.

## Resume acceptance gate

Restore supported signed-in browser access and inspect only Joao's exact location/container/dataset. Complete and read back calendar settings and notification suppression, verify public slots, then install a genuine confirmed-appointment signal with one destination owner and stable dedup IDs. Run one labeled synthetic lead + opportunity + appointment, read all three back and prove GA4/Meta destination receipt. Preserve evidence before cleanup. Only then open route gates, finish source/production validators, update the Draft PR, and run the exact-SHA backup-first Bluehost release plus live HTML/asset/CTA verification. No DNS/mail change is required.

## Final calendar repair checkpoint — 2026-09-15

All five intended calendars now have saved native UI and read-API verification. Remaining-four schedule and notification screenshots are archived under `/home/d1360/joao-booking-audit-20260915/native-resume/`; `calendar-progress.json` now enumerates five unique repaired records.

| Calendar ID | America/Chicago weekly availability | Minutes |
| --- | --- | --- |
| WqEFb31yftWo7HOIxyv1 | Mon/Wed 17:00–17:45 | 45 |
| lwI401IPhkVBM5TUAhYm | Mon/Wed 17:50–18:35 | 45 |
| TZDZNzvBn0gcHFyfjk2l | Tue/Thu 10:30–11:15 | 45 |
| GO56GPdtrVWfqhOmGK3w | Mon/Wed 18:40–19:40; Sat 11:00–12:00 | 60 |
| wY51xc5N1INt6jsQByeC | Tue/Thu 17:00–17:45 | 45 |

Final `list_calendars` trace `a4c8ddb5-4eb0-41d9-8cfa-4f1db513992f` confirms all five inactive, two seats, 12-hour notice, 28-day horizon, invitations false, auto-confirm/reschedule/cancellation true, correct Joao assignee, exact DS/Austin addresses, and class-confirmed copy without promising an email. Schedule/timezone evidence is native UI, not the API's empty class-calendar openHours. Native email/SMS/WhatsApp notification chips are disabled on all six event rows; existing confirmed/unconfirmed booking in-app alerts are retained.

**Safety gate remains blocked/unproven; calendars NOT activated.** Workflow read API remains scope-limited. Native workflow list confirms Welcome Draft, zero total/active enrolled. Email First Release, Reply Routing, SMS Consent Nurture and Staff Alert remain Published. SMS Consent Nurture has two trigger cards with warning icons and a Send Initial SMS action; opening a trigger displayed an unresolved tag selector. This does not prove that a calendar booking enrolls there, nor that suppression is safe. Do not silently publish/fix/disable these unrelated workflows or submit a synthetic booking until the full trigger/producer/suppression chain is established. Screenshots: `workflow-release-gates.png`, `sms-trigger-warning.png`.

No synthetic contact, appointment, outbound message, workflow change, calendar activation, analytics release or website deployment was performed in this continuation. Public available-slot proof remains outstanding, not successful. Browser is left on the filtered workflow list with no unsaved editor. Existing unrelated calendars were preserved.

## Workflow safety continuation: access gate reconfirmed

- Rediscovered exact Chrome `pid=10232`, `window_id=526090`; passive native AX capture confirms Joao Crus Brazilian Jiu-Jitsu, Dripping Springs and the workflow list. Current `computer_use` schema exposes native actions only, not the former exact typed-browser route.
- Supported authenticated `browser_exec(local=True, session="joao-booking-safety")` failed with the unsupported Chromium-default-browser error. The loaded live-operations runbook explicitly requires stopping authenticated writes at this refusal, not using native input as a workaround. No browser configuration/profile/permission changes were made. Supported Chromium real-profile setup is needed to resume.
- Fresh `list_workflows` retry returned HTTP 401, token not authorized for this scope. Exact trigger calendar IDs/statuses/tags/pipeline/source/form filters and outbound actions therefore remain unproven. No exclusion was added and no workflow was disabled. Prior SMS warning-card observations do not establish suppression. Welcome was not published.
- Fresh `list_calendars` trace `9c3266cd-c101-47c3-b709-92124f281752` reconfirms every exact target inactive, two seats, 12-hour notice, 28-day horizon, Google invitation emails false, correct durations/addresses and automatic confirmation. Prior native schedule and other notification evidence is retained; this inventory does not independently expose all notification settings.
- Anonymous extraction failed for all five widgets; independent direct HTTP GETs then returned **404** with **Page Not Found** for all five exact IDs. Five unique records were programmatically counted and saved in `/home/d1360/joao-booking-audit-20260915/workflow-safety-public-recheck.json`. These are HTTP checks, not fresh browser renders or slot proof.
- Activation and synthetic booking were withheld because the required no-send proof did not pass. No external mutations, website/GTM publication, or changes to unrelated calendars occurred. Existing uncommitted document edits were preserved.
