# Booking execution evidence: 2026-09-15

## Outcome

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
