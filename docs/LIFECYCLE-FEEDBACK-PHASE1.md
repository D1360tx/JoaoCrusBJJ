# Phase-One CRM Lifecycle Feedback

## Scope

This phase converts manual opportunity moves in HighLevel's **Prospect Enrollment** pipeline into consent-gated optimization and measurement events. It sends no email or SMS and does not alter opportunity state.

| HighLevel stage | Internal stage key | Meta event | GA4 event |
|---|---|---|---|
| Qualified Conversation | `qualified` | `QualifiedLead` | `qualify_lead` |
| Trial Booked | `trial_booked` | `Schedule` | `trial_booked` |
| Trial Attended | `trial_attended` | `TrialAttended` | `trial_attended` |
| Enrolled | `enrolled` | `CompleteRegistration` | `close_convert_lead` |

`Purchase` is intentionally excluded until a payment is verified.

## Data and privacy contract

- The website stores the lead's current `analytics_storage`, `ad_storage`, and `ad_user_data` consent states as exact `granted` or `denied` HighLevel custom fields.
- Meta receives normalized, SHA-256-hashed email/phone only when both advertising consent fields are `granted`.
- GA4 receives no email, phone, name, contact ID, opportunity ID, or raw request ID. Its `client_id` and `lead_receipt_id` are deterministic HMAC-derived pseudonymous values.
- GA4 lifecycle events use a server-side pseudonymous CRM stream. Campaign fields are event parameters. They do not claim continuity with the original browser session.
- Logs contain only event ID, lifecycle stage, destination status, HTTP/curl status, and provider trace. They never contain PII or secrets.

## HighLevel workflow contract

Create four separate workflows. Each workflow:

1. Triggers when an opportunity in pipeline **Prospect Enrollment** moves into exactly one target stage.
2. Filters to contacts tagged `website_lead` whose Website Request ID and all three measurement-consent fields are non-empty. Historical/imported records are not backfilled or enrolled.
3. Contains one outbound webhook action and no customer-message action.
4. Uses `POST https://joaocrusbjj.com/api/lifecycle.php`.
5. Is accepted only when HighLevel supplies a valid `X-GHL-Signature` Ed25519 signature over the exact raw request body. If controlled testing proves the Custom Webhook action does not emit that signature, use HighLevel's masked API-key credential feature to supply the fallback `X-Joao-Lifecycle-Secret` header.
6. Sends JSON using the stage-specific key and live stage ID.
7. Remains Draft until the endpoint, secret, field values, and controlled test pass.

Template body. Replace `<stage-key>` and `<stage-id>` with the fixed values for that workflow. The pipeline ID is deliberately fixed so the endpoint and workflow cannot drift to another pipeline:

```json
{
  "schema_version": "opportunity_lifecycle_v1",
  "pipeline_id": "7A8TP4P8ySpolodQ49y1",
  "pipeline_stage_id": "<stage-id>",
  "lifecycle_stage": "<stage-key>",
  "opportunity_id": "{{opportunity.id}}",
  "contact_id": "{{contact.id}}",
  "request_id": "{{contact.website_request_id}}",
  "email": "{{contact.email}}",
  "phone": "{{contact.phone}}",
  "analytics_storage": "{{contact.analytics_storage_status}}",
  "ad_storage": "{{contact.ad_storage_status}}",
  "ad_user_data": "{{contact.ad_user_data_status}}",
  "recommended_program": "{{contact.recommended_program}}",
  "submission_page": "{{contact.submission_page}}",
  "latest_utm_source": "{{contact.latest_touch_utm_source}}",
  "latest_utm_medium": "{{contact.latest_touch_utm_medium}}",
  "latest_utm_campaign": "{{contact.latest_touch_utm_campaign}}",
  "latest_fbclid": "{{contact.latest_touch_fbclid}}",
  "latest_captured_at": "{{contact.latest_touch_captured_at}}"
}
```

If HighLevel exposes different canonical merge-field tokens, select them from the workflow picker rather than typing guessed tokens, then read back the saved action.

## Live Prospect Enrollment stage map

The IDs below were read from the HighLevel pipeline API on 2026-09-04. Reverify before deployment.

```json
{
  "qualified": "8c0dd411-db08-409a-a21b-c59191e405b9",
  "trial_booked": "ee84a808-f150-49fd-8dbf-a6e068b4ffc2",
  "trial_attended": "d6c8f5a9-67ee-4d11-8649-e2c9fbc82f27",
  "enrolled": "4aa3dadc-a698-4549-93c2-8d9b5286e2a0"
}
```

## Server configuration

Set all secrets outside the web root in the existing file referenced by `GHL_ENV_FILE`. Create `LIFECYCLE_LEDGER_DIR` outside `public_html` with mode `700`. The endpoint creates per-event files with mode `600`.

- `LIFECYCLE_WEBHOOK_SECRET`: optional fallback, random and at least 32 characters; keep empty when signed HighLevel webhooks are verified
- `LIFECYCLE_EVENT_SALT`: independent random value, at least 32 characters
- `LIFECYCLE_LEDGER_DIR`
- `GHL_LIFECYCLE_STAGE_MAP_JSON`
- `GHL_WEBHOOK_ED25519_PUBLIC_KEY`: optional override; the endpoint defaults to HighLevel's published Ed25519 public key
- Existing `META_*` variables
- `GA4_MEASUREMENT_PROTOCOL_ENABLED`
- `GA4_MEASUREMENT_ID`
- `GA4_API_SECRET`
- `GA4_MEASUREMENT_PROTOCOL_DEBUG`: enable only for validation; debug requests are not collected and a validated ledger entry remains eligible for one later production collection

## Idempotency and failure behavior

The event ID is stable for `(opportunity_id, lifecycle_stage)`. A private ledger checkpoints each destination immediately after its result. Workflow retries skip any terminal destination and retry only a failed one. Disabled or consent-denied destinations are terminal by design. The endpoint returns `502` while either enabled, consented destination fails.

## Acceptance gates

- PHP lint passes on Bluehost.
- Missing/invalid signatures and secrets, wrong-pipeline, wrong-stage-ID, invalid-consent, oversized, and stale-timestamp requests fail closed.
- A debug-mode GA4 request returns zero validation messages.
- One synthetic consented test produces one Meta provider acceptance and one GA4 production transport.
- Replaying the same request produces the same event ID without a second provider transmission.
- GA4 Realtime/Data API shows the exact event name before GA4 is called verified.
- Meta event receipt is checked in Events Manager; Graph API `events_received: 1` is provider acceptance, not final reporting proof.
- The synthetic HighLevel contact/opportunity is removed only after evidence capture, with absence read-back.
