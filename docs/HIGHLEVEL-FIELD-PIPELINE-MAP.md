# Joao Crus BJJ — HighLevel Field and Pipeline Map

**Status:** implementation contract; live account IDs pending read-only inventory

## System ownership

- HighLevel: prospect contact, opportunity, owner, tasks, source, consent, suppression, and follow-up.
- Zen Planner: enrolled member, attendance, and billing.
- Beehiiv: explicit newsletter subscription only.
- Website: native UX; server-side API forwards validated leads to HighLevel.

## Duplicate rule

Set the Joao sub-account to disallow duplicates and check **email first, then phone**. The official v3 Contact Upsert endpoint follows this location-level setting. Website requests must use `createNewIfDuplicateAllowed=false`.

## Contact fields

### Native

| Field | Use |
|---|---|
| First Name / Last Name / Name | Parent or adult prospect |
| Email / Phone | Normalized identity and contact channels |
| Source | `Joao website`, `Facebook Lead Ads`, or other explicit source |
| Assigned To | Staff owner ID |
| Tags | Routing and operational controls; do not use as the consent ledger |

### Custom field folder: Lead Profile

- Lead Type
- Audience: child / adult
- Child Count
- Age Bands: 3–7 / 8–12 / 13–17
- Primary Goal
- Experience Level
- Preferred Format
- Preferred Location
- Recommended Program
- Recommendation Detail
- Website Form ID
- Website Schema Version

### Custom field folder: Attribution

- Original Landing Page / Latest Landing Page
- Original Referrer / Latest Referrer
- Original and Latest UTM Source, Medium, Campaign, Content, Term
- `fbclid`, `_fbc`, `_fbp`
- `gclid`, `gbraid`, `wbraid`
- Meta Lead IDs, Campaign IDs/Names, Ad Set IDs/Names, Ad IDs/Names, Form IDs/Names, Platforms
- Meta First Lead Created / Meta Latest Lead Created
- Import Batch

### Custom field folder: Consent and Operations

- Email Consent Status / Timestamp / Source / Disclosure Version
- SMS Consent Status / Timestamp / Source / Disclosure Version
- Historical Consent Status
- Automation Eligibility
- Current Agency Lead ID/Status
- Beehiiv Subscription ID/Status
- Zen Planner Member ID
- Next Action

## Pipeline: Prospect Enrollment

1. New Lead
2. Contact Attempted
3. Free Class Scheduled
4. Free Class Attended
5. Trial / Enrollment Offer
6. Enrolled — Zen Planner Handoff
7. Long-Term Nurture
8. Closed / Lost
9. Do Not Contact

No monetary value is assigned until a real approved value model exists. `Purchase` is never inferred from an opportunity stage.

## Tags

### Source
- `website_lead`
- `quiz_lead`
- `meta_lead_ads`
- `historical_import`

### Offer / campaign
- `offer_kids_free_pass_tshirt`
- `offer_ascend_free_trial`
- `platform_fb`
- `platform_ig`

### Safety
- `consent_unverified`
- `automation_hold`
- `call_review_required`
- `qa_test`

## Initial workflow state

All workflows remain draft or disabled until controlled tests pass. Historical imports are excluded by `automation_hold`. Every approved new live lead creates one opportunity, one staff alert, and one owner task. Automated SMS remains disabled until A2P and explicit SMS consent are verified.

## API v3 contract

- Contact: `POST https://services.leadconnectorhq.com/contacts/upsert`
- Scope: `contacts.write`
- Opportunity: `POST https://services.leadconnectorhq.com/opportunities/upsert`
- Scope: `opportunities.write`
- Authentication: Joao sub-account Private Integration Token
- Headers: `Authorization: Bearer …`, `Version: v3`, JSON content/accept
- Required account IDs: location, pipeline, new-lead stage, owner

Never commit or display the token. Store it outside the Bluehost document root and load it server-side.
