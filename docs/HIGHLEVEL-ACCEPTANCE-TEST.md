# HighLevel Acceptance Test

**Owner:** Diego / ICDC Ventures

**Trigger:** Run this checklist immediately after the Joao-owned HighLevel account and sub-account are created, before paid campaigns or automated SMS are activated.

**Status:** Conditional pass for the website lead-intake path as of 2026-08-20. Meta CAPI, Google Ads conversion feedback, Beehiiv suppression, Zen Planner handoff, and export testing remain open.

**Evidence:** [`HIGHLEVEL-GA4-ACCEPTANCE-2026-08-20.md`](HIGHLEVEL-GA4-ACCEPTANCE-2026-08-20.md)

## Purpose

Prove that HighLevel and LeadConnector can preserve Joao's attribution, send reliable conversion feedback to Meta and Google, enforce consent, expose failures, and provide usable exports without adding a custom lead gateway.

## Pass criteria

HighLevel is accepted for launch only when every launch-critical test below is marked **Pass** with evidence. Record screenshots, event IDs, contact IDs, timestamps, and exported files in a private QA folder. Do not place secrets or real lead PII in this document or the repository.

## 1. Account, plan, and ownership

- [ ] Confirm the academy-owned HighLevel account, billing owner, administrators, and recovery contacts.
- [ ] Confirm the selected plan includes the private integration/API access, workflows, Meta CAPI action, Google Ads action, execution logs, exports, and webhooks required by this checklist.
- [ ] Document usage-based email, phone, SMS, AI, and campaign charges.
- [ ] Confirm HighLevel and Joao/ICDC each have the necessary data-export and account-handoff rights.

## 2. Controlled test contacts

- [ ] Use dedicated test contacts only; do not use a real child's information.
- [ ] Use unique timestamps or tags so each run can be isolated.
- [ ] Exclude controlled tests from production reporting where the destination supports it.
- [ ] Keep API credentials, Meta tokens, and Google credentials server-side.

## 3. Website attribution capture

Submit Joao's external website form from a controlled staging URL and verify the HighLevel contact stores both first and latest attribution.

- [ ] UTM source, medium, campaign, content, and term/keyword.
- [ ] Landing URL and referrer.
- [ ] Campaign ID, ad group ID, and ad/creative ID where supplied.
- [ ] `gclid`, `gbraid`, or `wbraid` from a real controlled Google Ads click.
- [ ] `fbclid`, `_fbc`, and `_fbp` from a real controlled Meta Ads click.
- [ ] Original attribution remains unchanged after a second visit from a different source.
- [ ] Latest attribution updates after that later visit.
- [ ] Email/SMS consent timestamp, source page, and disclosure version are stored separately from attribution.

**Evidence:** contact record, form request/response, first/latest attribution fields, and browser/network capture with secrets and PII redacted.

## 4. Meta Pixel and Conversions API

Use Meta Events Manager Test Events and Diagnostics.

- [ ] Browser Pixel and server CAPI both receive the lead event.
- [ ] The browser and server copies use the same `event_id` and Meta reports one deduplicated conversion.
- [ ] CAPI includes the permitted matching fields available for the test contact, including `fbp`/`fbc` when present.
- [ ] No raw contact PII is sent to GA4 or placed in browser logs/dataLayer events.
- [ ] Domain, dataset/pixel ownership, event source URL, action source, and consent behavior are correct.

Move the test contact through the Joao pipeline and verify the intended Meta feedback:

- [ ] Lead.
- [ ] Qualified lead.
- [ ] Trial booked / scheduled.
- [ ] Enrolled.
- [ ] Purchase with the correct value and currency when a real payment source is connected.

For every stage, capture the HighLevel workflow execution, Meta event receipt, matching/diagnostics result, and event timestamp.

## 5. Google Ads conversion feedback

Use a contact created from a real controlled ad click containing `gclid`, `gbraid`, or `wbraid`.

- [ ] HighLevel preserves the click identifier on the contact.
- [ ] `Add to Google Ads` sends the configured qualified-lead conversion.
- [ ] Trial-booked and enrolled conversions use separate conversion actions where approved.
- [ ] Google Ads Diagnostics accepts the conversion without identifier, timestamp, consent, duplicate, or currency errors.
- [ ] Lead-generation actions count **One** conversion per ad interaction; purchase/revenue counting follows the approved revenue rule.
- [ ] Confirm whether the selected HighLevel plan also supports Enhanced Conversions for Leads using privacy-safe user-provided data; document the result instead of assuming it.

## 6. Pipeline and automation behavior

- [ ] Verified Joao stages remain intact: New Quiz Lead, Contact Attempted, Qualified Conversation, Trial Booked, Trial Attended, Enrolled, and Long-Term Nurture / Not Now.
- [ ] A new lead creates or updates one contact and one opportunity without duplicates.
- [ ] Re-submit the same stable request ID and confirm the v3 `/opportunities/upsert` payload updates the same open opportunity. Record the accepted request/response shape because the endpoint's isolated opportunity builder cannot be certified from static documentation alone.
- [ ] Confirm contact upsert preserves every pre-existing tag. If dedicated tag addition is enabled, prove it only adds the approved tags.
- [ ] Staff notification and follow-up task are created immediately.
- [ ] Trial reminders, no-show recovery, and post-trial follow-up enter and exit at the correct stages.
- [ ] An enrolled contact exits prospect reminders and is handed off to Zen Planner without a duplicate prospect record.

## 7. Consent, unsubscribe, and DND

- [ ] Email-only consent does not authorize SMS.
- [ ] SMS automation does not run when the SMS checkbox is unchecked.
- [ ] The Program Finder submits successfully with SMS unchecked and stores `SMS Consent Status = not_granted`.
- [ ] SMS `STOP` sets channel-specific DND and prevents future automated sends.
- [ ] Email unsubscribe, hard bounce, and spam complaint suppress future email.
- [ ] Global DND and channel-level DND behave as documented.
- [ ] Consent source, timestamp, disclosure version, and later opt-out are visible and exportable.
- [ ] Beehiiv unsubscribe/suppression reconciliation is tested in both directions before newsletter automation launches.

## 8. Failures, logs, and recovery

Use a disposable QA workflow or test destination to create a controlled failure. Do not invalidate a production token or interrupt a live workflow.

- [ ] Execution Logs show the contact, action, timestamp, status, and error details.
- [ ] Meta and Google destination diagnostics are accessible.
- [ ] Document whether the failed action retries automatically, can be replayed manually, or requires contact re-enrollment.
- [ ] Confirm retries/replays cannot create duplicate conversion events.
- [ ] Define the launch review cadence and owner for failed forms, messages, and conversion uploads.

## 9. Zen Planner handoff

No native HighLevel/LeadConnector to Zen Planner connector was verified during pre-purchase research.

- [ ] Ask Zen Planner and HighLevel whether a supported private API, webhook, marketplace, or partner connector is available.
- [ ] Until proven otherwise, document the staff-owned manual handoff for enrollment and payment outcomes.
- [ ] Confirm the HighLevel contact stores the Zen Planner member ID after enrollment.
- [ ] Verify how enrollment, payment, cancellation, and failed-payment outcomes return to HighLevel.
- [ ] Do not introduce Make, Zapier, n8n, or custom middleware until the direct/native path is proven insufficient.

## 10. Export and portability

- [ ] Export all test contacts with the selected contact and custom fields.
- [ ] Verify the export includes the attribution and consent fields required for migration.
- [ ] Export or otherwise retrieve opportunity/pipeline data.
- [ ] Document exclusions such as automation history, message history, note truncation, retention windows, or administrator-only permissions.
- [ ] Verify API retrieval of required contact and attribution fields if CSV is incomplete.
- [ ] Store the test export in the private QA folder and document the recurring backup owner/cadence.

## Launch decision

- [ ] **Pass:** HighLevel can be used directly with Joao's website, Meta, Google, Beehiiv, and the documented Zen Planner handoff.
- [ ] **Conditional pass:** Record every workaround, owner, failure mode, and reconciliation step.
- [ ] **Fail:** Add an integration layer only for the specific capability that failed; do not automatically build a general-purpose ICDC lead gateway.
