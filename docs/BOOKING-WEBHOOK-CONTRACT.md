# Signed booking conversion adapter (staged, not connected)

## Ownership and proof

`deploy/bluehost/api/booking-webhook.php` is a default-off adapter using the existing lifecycle library. It accepts only provider-signed `AppointmentCreate` / `AppointmentUpdate` notifications, exact location, one of the five approved calendar IDs, `source=booking_widget`, and `appointmentStatus=confirmed`. Official schema: https://marketplace.gohighlevel.com/docs/webhook/AppointmentCreate/ .

It fetches the associated contact server-side, verifies contact/location identity, and reads analytics/ad consent from the existing mapped contact fields. Missing consent is denied. Website GPC already persists advertising denial; the adapter cannot infer or grant consent from a widget visit. A new standalone widget contact without stored website consent produces no measurement. Existing contact consent is the CRM snapshot, not a fresh browser consent observation.

GA4 keeps the existing `trial_booked` contract. Meta uses `Schedule`, never `Purchase`. No browser confirmation page or redirect is created: a public page load, query marker, or CTA click cannot produce booking proof. Signed notification timestamp must be within three days. HMAC event IDs are stable per location/appointment; the private flock-backed ledger suppresses repeated notifications, updates, and reschedules. Transport is at-most-once per destination: an ambiguous failure stays failed/attempting and requires manual reconciliation, avoiding an automatic GA4 duplicate. This intentionally trades retry reliability for conservative counting.

## Required production gates (not completed)

1. Restore Bluehost access, inspect live baseline and protected runtime configuration, and create a verified full rollback before any deployment.
2. Register an authorized HighLevel signed appointment webhook subscription to `/api/booking-webhook.php`. Native calendar confirmation redirects are NOT equivalent to this subscription. No subscription was created in this pass. Verify actual signed payload shape and `source` against the official schema; unsupported payloads fail closed.
3. Reconcile the existing opportunity-stage `trial_booked` / `Schedule` owner before enabling appointment delivery. This adapter deduplicates appointment notifications, not the existing opportunity-based event ID. Do not enable both paths for the same appointment. Existing `lifecycle.php` is unchanged.
4. Protected configuration uses existing `GHL_LOCATION_ID`, `GHL_PRIVATE_INTEGRATION_TOKEN`, `GHL_CUSTOM_FIELD_MAP_JSON`, `LIFECYCLE_EVENT_SALT`, `LIFECYCLE_LEDGER_DIR`, and GA4/Meta destination configuration. New `GHL_BOOKING_WEBHOOK_ENABLED` defaults to `false`; set true only after ownership and signed-delivery acceptance. No secrets belong in Git or the browser. No configuration was changed here.
5. Execute one labeled noncustomer future booking after native notification and workflow safety read-back, confirm the same appointment/contact, verify downstream GA4 and Meta receipt, preserve evidence, and clean up with notifications off. No real booking was submitted in this pass because the server path cannot be deployed/connected yet. Do not count the local fixture as acceptance.
6. Preview any necessary GTM change before publishing. The staged adapter needs no browser conversion tag; existing v13 owns the base scripts. Do not add another `Schedule` owner.

## Local verification

Run `php -n tests/booking-webhook.test.php`. This uses local synthetic fixtures and an ephemeral Ed25519 signing key, never live credentials or provider writes. It tests all five calendar IDs, invalid location/contact/status/source/time, missing and independent consent, valid/tampered signatures, stable IDs, and ledger replay suppression. It proves code behavior, not subscription configuration, destination credentials, provider delivery, or downstream receipt.
