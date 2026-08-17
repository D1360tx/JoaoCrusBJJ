# Joao Crus BJJ Analytics Event Contract

## Destinations

- Google Tag Manager: `GTM-596MGPMD`
- Google Analytics 4: `G-EW2F2YKR3Y`
- Google Ads destination: `AW-18361192908` (campaigns currently deferred)

## Application-owned events

| dataLayer event | GA4 event | Trigger | Safe parameters | GA4 key event | Ads primary |
| --- | --- | --- | --- | --- | --- |
| `lead_submit_success` | `generate_lead` | Backend accepts a class, private, or team inquiry | `form_name`, `form_context`, `lead_type`, `lead_program`, `lead_location`, `submission_page` | Yes | Yes only when Google Ads is reopened |
| `guide_request_success` | `guide_request` | Backend accepts the homepage Parent Guide request | Same safe form context | No | No |
| `lead_submit_error` | `lead_submit_error` | Backend or transport rejects a submission | Safe form context plus controlled `error_type` | No | No |
| `booking_start` | `booking_start` | Visitor opens the first-class dialog or follows its fallback | Form and CTA context | No | No |
| `click_to_call` | `click_to_call` | Visitor activates a `tel:` link | Placement, normalized link text, page path | No | No; use a duration-qualified call conversion later |
| `click_to_email` | `click_to_email` | Visitor activates a `mailto:` link | Placement, normalized link text, page path | No | No |
| `get_directions` | `get_directions` | Visitor opens a Google Maps destination | Location, placement, page path | No | No |

## Data rules

- Never send names, email addresses, phone numbers, ages, messages, or other free text to GA4, GTM, Meta, or Google Ads.
- `generate_lead` fires only after `/api/lead.php` returns explicit contact and opportunity acceptance.
- The thank-you page is not a conversion trigger. Direct visits and refreshes must not create leads.
- The Parent Guide request remains separate from class inquiries so it does not inflate lead counts.
- Success events use GTM `eventCallback` with a bounded timeout before navigation.
- Application-owned analytics events are discarded while `analytics_storage` is not granted; they are never queued for replay after a later opt-in. Lead-success navigation callbacks still run immediately when analytics is blocked.
- First- and last-touch campaign parameters, landing paths, and referrer hosts use consent-gated local storage with a 90-day window plus a legacy session-storage migration path. They are delivered only to the lead endpoint for staff attribution.
- `click_to_call` records intent, not a connected or qualified call. If Google Ads is reopened, configure call reporting and use an agreed duration threshold for the primary call conversion.

## Publication gates

1. Source build and validator pass.
2. GTM Preview shows the matching custom event trigger and GA4 event tag exactly once.
3. Browser transport reaches `G-EW2F2YKR3Y` with no PII.
4. GA4 DebugView receives the expected event.
5. `generate_lead` is marked as a GA4 key event only after duplicate prevention is verified.
6. Publish a named GTM version and retain the prior version as rollback.