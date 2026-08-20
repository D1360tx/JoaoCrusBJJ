# HighLevel and GA4 Acceptance Evidence, 2026-08-20

## Decision

**Conditional pass for the website lead-intake path.** The controlled Program Finder and booking-popup paths reached the production Bluehost gateway, created or updated one HighLevel contact, created one open opportunity in the intended pipeline stage, preserved approved tags and owner assignment, and emitted the approved non-PII GA4 lead event. Automated SMS remains disabled.

This is not a full acceptance of Meta CAPI, Google Ads offline conversion feedback, Beehiiv suppression reconciliation, Zen Planner handoff, or recurring exports. Those remain separate launch gates in `HIGHLEVEL-ACCEPTANCE-TEST.md`.

## Production controls verified

- HighLevel location, pipeline, stage, owner, tags, and strict custom-field map were read back from the production account without exposing credentials.
- `GHL_ALLOW_CORE_ONLY` is disabled. The production gateway requires the complete field map.
- The Program Finder and shared booking-popup forms require explicit provider acceptance for both the contact and opportunity before showing success.
- Stable request IDs and duplicate-safe upserts prevent ordinary retries from creating a second contact or open opportunity.
- GTM container `GTM-596MGPMD`, version 10, uses the production quiz lifecycle event `quiz_result_view` and emits `generate_lead` only after an accepted lead response.
- GA4 and dataLayer payloads exclude contact PII.

## Controlled website submissions

### Program Finder

The controlled production submission verified:

- one HighLevel contact;
- one open opportunity in the intended pipeline and stage;
- Joao owner assignment;
- approved website/quiz tags;
- recommendation, consent, source, program, location, and first/latest attribution custom fields;
- the complete quiz dataLayer lifecycle; and
- outbound GA4 `generate_lead` transport after provider acceptance.

### Shared booking popup

The initial controlled submission correctly created the contact and opportunity but exposed an attribution-shape mismatch before release:

- browser storage publishes `first_touch` and `last_touch`;
- the gateway accepts `attribution.first` and `attribution.latest`.

The frontend adapter now normalizes those values explicitly before submission. A regression test protects the contract.

After deployment, a fresh controlled booking-popup submission verified the production result:

- first-touch and latest-touch source: `hermes_release`;
- first-touch and latest-touch medium: `qa`;
- first-touch and latest-touch content: `booking_popup`;
- first-touch and latest-touch term: `release_302d106`;
- landing page and submission page: `/`;
- program: `Adults`;
- location: `Dripping Springs`;
- email consent: `granted`;
- SMS consent: `not_granted`;
- tags: `automation_hold` and `website_lead`;
- Joao owner assignment; and
- exactly one open opportunity in the intended pipeline stage.

## Workflow safeguards

### Website Lead - Staff Alert

- Status: **Published**
- Trigger: contact tag `website_lead` added
- Action: internal email notification to the assigned owner
- Controlled test result: internal notification **Executed** and workflow **Finished**

### Website Lead - Email First Release

- Status: **Published**
- Trigger: contact tag `automation_hold` removed
- Branch condition: `Email Consent Status` is `granted`
- Granted branch: one consent-approved welcome email
- Otherwise branch: **Do not message**
- SMS actions: **none**
- Controlled test result: consent branch **Executed**, welcome email **Executed**, workflow **Finished**
- A separate test email was accepted by HighLevel before publication.

The default `automation_hold` tag prevents the public website submission itself from starting follow-up. Staff must intentionally remove the hold, and the workflow independently requires granted email consent.

## Automated verification

The production build was generated in an isolated archive-derived directory before release:

```text
Applied SEO foundation to 34 pages in production mode
Built 33 canonical pages and 76 assets
56 tests passed, 0 failed
Production validator passed 4,306 checks across 33 routes
```

Local PHP lint was unavailable in WSL. Bluehost PHP 8.3 lint passed against both the staged and deployed `api/lead.php` before and after promotion.

## Production release evidence

- Pull request: [#68](https://github.com/D1360tx/JoaoCrusBJJ/pull/68)
- Authoritative merge commit: `302d106c0f995a59dc6c5e1427e9550370e7c543`
- Deployment source: fresh archive of that merge commit
- Backup: created and checksummed before promotion outside the public web root
- Staged artifact: 115 files verified against a SHA-256 manifest
- Deployed artifact: all 115 files reverified against the same manifest
- Public `campaign-site.js` SHA-256: `40ad37ff71eb64ce02d0aa454406801ba3ba1bdee568c0665f61fd9795e44f5a`
- Public routes: homepage, Program Finder, quiz, Practice Under Pressure, and sitemap returned HTTP 200
- Public lead endpoint: GET returned HTTP 405 as designed
- Production form: accepted the fresh controlled popup submission and displayed the thank-you state

## Remaining launch gates

- Resolve the duplicate Meta Pixel initialization warning observed during the live browser check, then complete Meta Pixel/CAPI ownership and deduplication testing before using Meta conversion optimization.
- Complete Google Ads click-ID and offline-conversion testing before using qualified-lead bidding.
- Keep automated SMS disabled until A2P registration, SMS consent, DND, STOP, and replay safety pass.
- Complete Beehiiv suppression, Zen Planner handoff, failure recovery, and export/portability tests.
