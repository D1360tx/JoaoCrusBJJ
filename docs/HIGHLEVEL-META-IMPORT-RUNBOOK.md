# Historical Meta Lead Import Runbook

## Private source package

The raw and normalized lead files contain PII and stay outside Git at:

`/home/d1360/private/joao-ghl-import-2026-08-16/`

Verified aggregate:

- 104 raw Meta lead records
- 103 deduplicated contacts
- one cross-campaign duplicate removed
- 103 contacts have email
- 101 contacts have valid normalized E.164 phone numbers
- two contacts require phone review
- all records are held from automation
- historical consent is unverified until original Meta form disclosures are reviewed

## Package files

- `ghl-contacts-import-deduplicated.csv`: one contact row per normalized email/phone identity
- `normalized-source-records.csv`: lossless normalized 104-record archive
- `duplicate-record-review.csv`: two source records in the duplicate group
- `phone-review-required.csv`: two contacts requiring manual phone correction
- `ghl-field-mapping.csv`: import mapping
- `audit-summary.json`: aggregate verification

## Pre-import gates

1. Confirm the correct Joao sub-account and account owner.
2. Set duplicate checking to email first, then phone; disallow duplicates.
3. Create every mapped custom field before import.
4. Create the Prospect Enrollment pipeline and New Lead stage.
5. Keep workflows disabled.
6. Create tags `historical_import`, `consent_unverified`, `automation_hold`, and `call_review_required`.
7. Review original Meta instant-form disclosure text; do not infer SMS permission from the CSV.
8. Correct or intentionally omit the two invalid phone values.

## Controlled import

1. Copy five non-exception rows to a private test file.
2. Import contacts only; do not add them to an active workflow.
3. Map native fields exactly; map the remaining columns to contact custom fields.
4. Apply the provided tags.
5. Read back all five contacts and export them.
6. Verify identity, source metadata, created dates, consent hold, tags, and no duplicate contacts.
7. Create opportunities for the five test contacts in New Lead only after contact verification.
8. Verify assignment and task behavior without sending email or SMS.
9. Import the remaining clean rows.
10. Reconcile HighLevel contact count to 103 minus any intentional exception holds.

## Call queue

Create a Smart List filtered by:

- tag contains `historical_import`
- tag contains `call_review_required`
- tag contains `automation_hold`
- phone is present
- opportunity stage is New Lead or Contact Attempted

Manual calling can begin only after campaign ownership, disclosure, and suppression review. Do not launch automated SMS/email from the historical import.

## Rollback and reconciliation

Record the HighLevel import ID and timestamp. Export imported contacts immediately after acceptance. If the import is wrong, pause and correct the mapping before any workflow enrollment; never delete production CRM records without explicit approval.
