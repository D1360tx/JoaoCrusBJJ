# Lead Infrastructure Recommendation

**Status:** HighLevel + Beehiiv + Zen Planner selected by Diego on 2026-07-29; account ownership and implementation remain pending

**Reviewed:** 2026-07-29

## Recommendation

Use a deliberately small hybrid stack:

1. **HighLevel Starter as the prospect CRM and automation system of record.**
2. **Beehiiv as the newsletter publishing channel.**
3. **Zen Planner as the existing member and billing system.** Do not replace it without a separate migration decision.
4. **Native Vercel forms through a server-side endpoint** that upserts HighLevel and records consent and attribution.
5. **No Make or n8n in the critical path at launch.** Use a direct Beehiiv API subscription step or a HighLevel workflow webhook. Add an integration platform only when a real cross-system workflow cannot be handled reliably inside this stack.

The new stack is intentionally independent of the current advertising agency. Agency CRM access is not a launch prerequisite. Keep any agency-managed paid-lead flow separate until Diego deliberately redirects or retires it. Import historical agency leads only if useful and only after source and consent status are mapped.

This gives the academy one lead record, one prospect pipeline, email and SMS workflows, booking, and a scalable newsletter without building a custom CRM.

## Decision: HighLevel selected over Zen Planner Engage

Zen Planner Engage was evaluated because Joao already uses Zen Planner. Its current official pages list lead forms, appointment scheduling, lead tracking, automated workflows, more than 100 fitness campaigns, and two-way text and email. The pricing page currently lists Engage at **$249/month for Zen Planner customers**, with additional usage charges potentially applying.

Diego selected HighLevel because it provides the required custom-form/API path, CRM pipeline, workflows, booking, email/SMS, consent fields, attribution fields, and staff operations at a lower platform price with a better-documented API. Zen Planner remains the enrolled-member and billing system, so there is no membership migration.

Selection does not mean those requirements work automatically. Implementation must prove that the Vercel endpoint and HighLevel configuration:

1. ingest the custom Vercel forms without replacing the approved website experience;
2. preserve consent evidence, original attribution, UTMs, click IDs, and disclosure versions;
3. support the required lead stages, staff tasks, appointment reminders, no-show recovery, and two-way conversations;
4. synchronize explicit newsletter subscriptions and suppressions with Beehiiv;
5. hand enrolled prospects to Zen Planner without duplicate prospect records;
6. provide reliable API/webhook, export, error logging, and account-ownership controls;
7. complete A2P registration and disclose all message, phone, email, and campaign usage charges.

Zen Planner Engage remains a documented alternative, not an active procurement gate.

## Why HighLevel

HighLevel is the best operational fit for a local academy because its core platform combines:

- CRM and opportunity pipelines;
- email and SMS marketing;
- unified conversations;
- workflow automation;
- forms, surveys, and quizzes;
- booking calendars;
- dashboards and reporting;
- API access.

The official Starter plan is currently listed at **$97/month** with three subaccounts, unlimited contacts, unlimited users, and usage-based charges for email, SMS, and phone activity. Verify pricing again before purchase.

HighLevel should own operational facts such as lead status, program interest, location, free-class booking, staff follow-up, consent, and source attribution.

## Why Beehiiv stays

Beehiiv is well suited to publishing and growing Joao's newsletter. Its official pricing currently lists unlimited sends and up to 100,000 subscribers on Scale and Max, with email automations and webhooks on Scale. Beehiiv also provides an API to create subscriptions with UTM fields and custom fields.

Beehiiv should **not** be the academy CRM. It has no equivalent opportunity pipeline, staff tasking, free-class follow-up, or two-way SMS operations.

Only contacts who explicitly choose the newsletter should be synchronized to Beehiiv. HighLevel remains the canonical prospect record and consent ledger.

Newsletter unsubscribe and suppression changes must synchronize back to HighLevel. HighLevel do-not-contact changes must also prevent future Beehiiv sends. This can be event-driven with a scheduled reconciliation as a safety net.

## Why not the other primary options

| Platform | Decision | Reason |
|---|---|---|
| **Klaviyo** | Do not choose as the core system | Strong B2C email/SMS platform, but still optimized around commerce profiles and customer events. It is weaker for a local academy's sales pipeline, staff follow-up, and class-booking workflow. |
| **Sendlane** | Do not start a new implementation | Ecommerce-oriented, and its site states that Sendlane has been acquired by Privy. This introduces unnecessary product-transition risk. |
| **ActiveCampaign** | Strong runner-up | Excellent email automation and a capable CRM, but the academy would still assemble more separate pieces for scheduling, conversations, and local-business SMS operations. |
| **HubSpot** | Not efficient for this use case | Powerful CRM, but advanced marketing automation and scaling marketing-contact costs are more than the academy currently needs. |
| **Zen Planner Engage** | Not selected | The strongest no-migration alternative because Joao already uses Zen Planner, but it has a higher monthly platform price and its public documentation does not establish a better custom-form/API path for this build. Reconsider only if native Zen Planner integration later becomes materially more valuable. |
| **Gymdesk or Kicksite** | Only if replacing Zen Planner | Both advertise member management, billing, attendance, lead management, email/SMS, and automations. They could provide a lower-cost consolidated operating platform, but their public feature sets do not establish workflow/funnel parity with HighLevel or Engage. Either choice requires a member, payment, attendance, waiver, and historical-data migration. Do not migrate only to avoid one CRM connection. |
| **Spark Membership** | Demo only if considering a Zen Planner replacement | The strongest martial-arts-specific all-in-one migration candidate reviewed: CRM, trials, booking, billing, funnels, and email/SMS automation. Public pricing is unavailable, so total cost, API/custom-form support, exports, payment migration, and contractual terms require a vendor demo before comparison. |
| **PushPress Core + Grow** | Not for the current launch | Can combine gym operations with lead pipelines and email/SMS automation, but it requires migrating Zen Planner and Grow is currently listed starting at $329/month before messaging and other possible costs. |
| **Custom Supabase/Postgres CRM** | Defer | Maximum control but unnecessary engineering, maintenance, security, consent, messaging, and admin-interface work. Add a reporting mirror later only if proven necessary. |

## Role of Make or n8n

Do not use either as the database or system of record.

Use an integration layer later only for workflows such as:

- HighLevel-to-Beehiiv synchronization that cannot be handled directly;
- enrollment handoff to Zen Planner if a reliable API path exists;
- cross-platform error queues and reconciliation;
- data warehouse or reporting exports.

If needed, **n8n Cloud** is the preferred long-term technical option because it supports more control and complex branching. Its official Starter plan is currently listed at €20/month billed annually for 2,500 workflow executions. **Make** is easier for nontechnical staff, but adding either on day one creates another failure point before it creates meaningful value.

## Data model

HighLevel should store one contact per parent or adult lead, deduplicated by normalized email and E.164 phone number.

Required fields:

- first and last name;
- email and normalized phone;
- guardian/adult lead type;
- student first name only when required;
- age band, not unnecessary child birth dates;
- program interest;
- preferred location;
- lead type: newsletter, lead magnet, free class, general inquiry, event, referral;
- original source, landing page, referrer, UTM parameters, click IDs where available;
- email consent status, timestamp, source, and disclosure version;
- SMS consent status, timestamp, source, and disclosure version;
- lifecycle stage, pipeline stage, owner, and next action;
- Beehiiv subscription ID/status when applicable;
- Zen Planner member ID only after enrollment;
- current-agency lead ID/status when an agency is still working the contact.

Do not store unnecessary medical or sensitive child information in the marketing CRM.

## Prospect pipeline

1. New lead
2. Contact attempted
3. Free class scheduled
4. Free class attended
5. Trial or enrollment offer
6. Enrolled — handoff to Zen Planner
7. Long-term nurture
8. Closed/lost or do-not-contact

Every free-class lead should generate an immediate staff notification and a follow-up task. No lead should depend only on an automated sequence.

Contacts may qualify for more than one journey. Define priority, exit, and frequency-cap rules so a parent does not receive overlapping newsletter, lead-magnet, and free-class messages on the same day.

## Launch workflows

### Newsletter signup

- Upsert the HighLevel contact and newsletter consent.
- Subscribe to Beehiiv with source and UTM data.
- Send Beehiiv welcome email.
- Do not enroll in SMS without separate SMS consent.

### Lead magnet

- Upsert contact and lead-magnet tag.
- Deliver the requested asset immediately by email.
- Start a short educational sequence leading to a first-class CTA.
- Add to Beehiiv only if the form separately includes newsletter consent.

### Free-class request

- Upsert contact and create/update an opportunity.
- Send immediate email confirmation.
- Send SMS confirmation only with express SMS consent.
- Notify assigned staff immediately.
- Send appointment reminders, no-show recovery, and post-class follow-up.
- Move enrolled students to Zen Planner and stop prospect reminders.

### General inquiry

- Create a staff task and response-time alert.
- Send a simple acknowledgement.
- Route by location and program interest.

## Forms and API architecture

The polished Vercel forms should remain native to the site. Submit them to a server-side Vercel endpoint that:

1. validates required fields and consent;
2. blocks obvious spam with a honeypot, rate limits, and Cloudflare Turnstile or equivalent;
3. normalizes email and phone values;
4. captures UTMs, referrer, landing page, timestamp, and disclosure version;
5. upserts the HighLevel contact;
6. creates the correct opportunity, tags, and workflow trigger;
7. subscribes an explicitly opted-in newsletter contact to Beehiiv;
8. records success/failure without logging unnecessary PII;
9. sends the visitor to the correct thank-you state.

API credentials must remain server-side in Vercel environment variables.

## Email and SMS foundations

### Email

- Authenticate a dedicated sending domain or subdomain with SPF, DKIM, and DMARC.
- Separate lifecycle/operational sending from Beehiiv newsletter sending where practical.
- Use a monitored reply-to address.
- Preserve unsubscribe and suppression status across systems.
- Warm sending volume gradually and monitor bounces, complaints, and domain reputation.
- Google requires SPF or DKIM for all Gmail senders; bulk senders over 5,000 Gmail messages/day must use SPF, DKIM, DMARC, and one-click unsubscribe.

### SMS

- Register Joao's business, use case, campaign, and sending number for US A2P 10DLC before automated SMS launch.
- Use a separate, unchecked SMS-consent checkbox. Email consent is not SMS consent.
- Do not treat delivery of a requested guide or class confirmation as blanket permission for unrelated marketing. Capture purpose-specific consent where required.
- Store the exact disclosure version, timestamp, page, and IP/context needed for proof of consent.
- Support STOP, HELP, quiet hours, and do-not-contact suppression.
- Launch email first if A2P approval is delayed.

## Ownership and operating policy

- Joao should own or have guaranteed administrator access and export rights to the CRM account.
- ICDC may administer the system but should document credentials, billing ownership, data export, and handoff procedures.
- Export or back up contacts and opportunity data on a documented schedule.
- Maintain one consent ledger and one suppression policy.
- Review failed form submissions and automation errors daily during launch, then weekly.

## Official sources

- HighLevel pricing and feature list: <https://www.gohighlevel.com/pricing>
- HighLevel contact upsert API: <https://marketplace.gohighlevel.com/docs/ghl/contacts/upsert-contact>
- Beehiiv pricing: <https://www.beehiiv.com/pricing>
- Beehiiv create-subscription API: <https://developers.beehiiv.com/api-reference/subscriptions/create>
- ActiveCampaign pricing/features: <https://www.activecampaign.com/pricing>
- Klaviyo pricing: <https://www.klaviyo.com/pricing>
- Sendlane pricing/product notice: <https://www.sendlane.com/pricing>
- n8n pricing: <https://n8n.io/pricing/>
- Zen Planner pricing and Engage extension: <https://zenplanner.com/pricing/>
- Zen Planner Engage: <https://zenplanner.com/engage/>
- Gymdesk pricing: <https://gymdesk.com/pricing>
- Kicksite pricing: <https://kicksite.com/pricing/>
- Spark Membership pricing: <https://sparkmembership.com/pricing/>
- PushPress pricing: <https://www.pushpress.com/pricing>
- Twilio A2P 10DLC overview: <https://www.twilio.com/docs/messaging/compliance/a2p-10dlc>
- Gmail sender requirements: <https://support.google.com/a/answer/81126>
