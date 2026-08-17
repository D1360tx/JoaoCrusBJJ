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
  "age_bands": ["little|youth|teen"],
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
7. Upsert one open opportunity in Prospect Enrollment → New Lead.
8. Create staff task/notification through the approved account workflow or API.
9. Store provider trace IDs and return an honest JSON result.
10. Redirect to `/thank-you/` only after accepted CRM delivery.

## Required server configuration

- `GHL_PRIVATE_INTEGRATION_TOKEN`
- `GHL_LOCATION_ID`
- `GHL_PIPELINE_ID`
- `GHL_NEW_LEAD_STAGE_ID`
- `GHL_OWNER_USER_ID`
- GHL custom-field IDs/keys from the live account

## QA gate

Use synthetic contacts only. Verify contact upsert, duplicate behavior, complete quiz fields, attribution, consent, opportunity, owner, task, error response, and thank-you routing. Keep all automations disabled during QA.
