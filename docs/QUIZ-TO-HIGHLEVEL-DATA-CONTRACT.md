# Program Finder Quiz → HighLevel Data Contract

## Proposed production routes

- `/program-finder/`: message-matched landing page
- `/program-finder/quiz/`: six-question quiz
- `/thank-you/`: accepted-lead confirmation
- `/api/lead.php`: server-side lead endpoint

The existing review pages remain separate until approval. Existing program result pages remain the recommendation destinations.

## Browser payload

```json
{
  "schema_version": "program_fit_v1",
  "request_id": "UUID generated per submit attempt",
  "form_id": "program_fit_quiz",
  "lead_type": "quiz",
  "first_name": "…",
  "email": "…",
  "phone": "…",
  "audience": "child|adult",
  "child_count": "1|2|3|4+|blank",
  "age_bands": ["little|youth|teen (child only)"],
  "stage": "new|returning|current|competition (adult only)",
  "goal": "…",
  "experience": "…",
  "preferred_location": "dripping|austin|either|help",
  "recommended_program": "…",
  "email_consent": true,
  "sms_consent": false,
  "consent_disclosure_version": "program_fit_v1",
  "page": "canonical URL without PII",
  "attribution": {"first": {}, "latest": {}},
  "website": "honeypot"
}
```

## Rules

- Validate and normalize again on the server.
- Never trust the browser recommendation without recomputing or validating its allowed value.
- Do not write name, email, or phone to browser storage.
- Preserve first/latest attribution only when the site consent state allows it.
- Never send raw PII to GA4 or `dataLayer`; analytics receives only generic event, form ID, audience, and recommendation.
- Email and SMS permissions are separate. Newsletter consent is separate from both.
- A successful browser response requires successful HighLevel contact upsert and opportunity upsert. Internal email may be an alert but is not CRM-delivery proof.
- Generate one stable request ID for idempotency and save it in HighLevel.

## Server sequence

1. Require POST, same-site origin, JSON size cap, honeypot, and rate limit.
2. Validate fields and allowed enum values.
3. Normalize email and E.164 phone.
4. Load token and account IDs from server-only configuration outside the document root.
5. Upsert contact with `createNewIfDuplicateAllowed=false`.
6. Add/update tags without unintentionally overwriting existing contact tags.
7. Upsert one open opportunity in Prospect Enrollment → New Lead. The isolated v3 payload builder must pass the live acceptance test because generated HighLevel opportunity documentation has not been consistent enough to treat a static build as proof.
8. Add tags only through the dedicated add-tags endpoint after that endpoint is live-tested. It is disabled by default. Never include `tags` in contact upsert because that can replace existing tags.
9. Send the legacy internal email alert only after CRM acceptance. Mail failure is best-effort and cannot turn an accepted CRM lead into fake failure or fake success.
10. Return `{accepted:true, contact_accepted:true, opportunity_accepted:true, request_id}` only after both provider responses contain durable IDs.
11. Redirect to `/thank-you/` only after that exact accepted response body.

## Required server configuration

- `GHL_PRIVATE_INTEGRATION_TOKEN`
- `GHL_LOCATION_ID`
- `GHL_PIPELINE_ID`
- `GHL_NEW_LEAD_STAGE_ID`
- `GHL_OWNER_USER_ID`
- GHL custom-field IDs/keys from the live account
- `GHL_CUSTOM_FIELD_MAP_JSON` using the logical-name → `{id,key}` contract in `docs/HIGHLEVEL-BLUEHOST-CONFIG.example.env`
- `GHL_ENV_FILE` pointing to a populated file outside Bluehost `public_html`

## QA gate

Use synthetic contacts only. Verify contact upsert, duplicate behavior, complete quiz fields, attribution, consent, opportunity v3 payload acceptance, owner, task/workflow, malformed-success rejection, retry behavior, and thank-you routing. Keep all automations disabled during QA. No real API calls are part of repository tests.
