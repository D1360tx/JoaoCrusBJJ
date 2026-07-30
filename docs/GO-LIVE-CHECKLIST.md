# Production Go-Live Checklist

**Site:** Joao Crus BJJ

**Canonical prelaunch URL:** <https://joao-crus-bjj.vercel.app>

**Status legend:** ✅ complete · 🟡 in progress/decision pending · ⬜ not started · ⛔ launch blocker

Update this document whenever a launch dependency is completed or a platform decision changes.

## 1. Hosting and release process

- [x] ✅ One canonical Vercel project connected to GitHub.
- [x] ✅ `main` automatically deploys to the stable Vercel URL.
- [x] ✅ Canonical route build and responsive regression tests run successfully.
- [x] ✅ Prelaunch site sends `noindex, nofollow` and blocks crawlers.
- [ ] ⬜ Document the final deploy approver and rollback owner.

## 2. Offer, schedule, and content

- [ ] ⛔ Confirm full rate card, registration fees, uniform rules, and trial/deposit terms.
- [ ] ⛔ Confirm the canonical schedule and Saturday/Austin details.
- [ ] ⬜ Replace any remaining concept labels or unapproved media.
- [ ] ⬜ Finalize the Teen page and replace `/teens-preview/` with its approved canonical route.
- [ ] ⬜ Final proofread of every page, CTA, phone number, address, map, and external link.
- [ ] ⬜ Confirm final Joao approval of coaches, program descriptions, guarantees, and testimonials.

## 3. CRM and lead operations

- [ ] 🟡 Approve or revise the recommended HighLevel + Beehiiv + Zen Planner architecture.
- [ ] ⛔ Review the existing Zen Planner account and compare Zen Planner Engage against HighLevel before purchasing either platform.
- [ ] ⬜ Test Zen Planner Engage custom-form/API ingestion, consent and attribution fields, workflows, two-way messaging, appointment/no-show handling, Beehiiv sync, prospect-to-member conversion, exports, A2P support, and total usage charges.
- [ ] ⬜ Confirm CRM account ownership, billing owner, administrators, and export rights.
- [ ] ⬜ Configure contact fields, tags, deduplication, locations, and program interests.
- [ ] ⬜ Configure the prospect pipeline and staff ownership rules.
- [ ] ⬜ Define staff speed-to-lead SLA, notifications, escalation, and daily task workflow.
- [ ] ⬜ Define enrolled-student handoff into Zen Planner.
- [ ] ⛔ Audit the current agency's lead forms, CRM/dialer, ownership terms, response SLA, call logs, consent records, and export/API access.
- [ ] ⬜ Define agency lead routing and deduplication so the same person is not contacted by two uncoordinated workflows.
- [ ] ⬜ Import historical leads only after mapping source and consent status; never assume old leads have current SMS permission.
- [ ] ⬜ Create backup/export and automation-error review procedures.

See `docs/LEAD-INFRASTRUCTURE-RECOMMENDATION.md`.

## 4. Forms and lead delivery

- [ ] ⛔ Build the server-side Vercel form endpoint; keep API credentials off the client.
- [ ] ⛔ Wire newsletter, lead magnet, free-class, and general inquiry forms.
- [ ] ⬜ Add server validation, honeypot, rate limiting, and bot protection.
- [ ] ⬜ Normalize and deduplicate email and phone values.
- [ ] ⬜ Preserve original source, landing page, referrer, UTMs, and ad click identifiers.
- [ ] ⬜ Record email/SMS consent timestamps, source pages, and disclosure versions.
- [ ] ⬜ Build useful success, validation-error, duplicate, and service-failure states.
- [ ] ⬜ Test every form end to end using controlled test contacts.
- [ ] ⬜ Verify staff alerts, tasks, pipeline changes, messages, and thank-you pages.
- [ ] ⬜ Verify no secrets or unnecessary PII appear in client bundles or logs.

## 5. Email and newsletter

- [ ] ⛔ Configure and verify school-domain sending identities.
- [ ] ⛔ Publish SPF, DKIM, and DMARC records for each sending platform.
- [ ] ⬜ Confirm monitored From and Reply-To addresses.
- [ ] ⬜ Configure shared unsubscribe, bounce, complaint, and suppression policy.
- [ ] ⬜ Synchronize Beehiiv and CRM unsubscribes/do-not-contact status in both directions and run a reconciliation test.
- [ ] ⬜ Connect explicit newsletter opt-ins to Beehiiv with source and UTM fields.
- [ ] ⬜ Build newsletter welcome automation.
- [ ] ⬜ Build lead-magnet delivery and nurture sequence.
- [ ] ⬜ Build free-class confirmation, reminder, no-show, and follow-up sequence.
- [ ] ⬜ Define journey priority, exit conditions, and frequency caps to prevent overlapping automations.
- [ ] ⬜ Seed-test Gmail, Outlook, Yahoo, Apple Mail, mobile, and desktop rendering.
- [ ] ⬜ Warm sending gradually and monitor deliverability.

## 6. SMS

- [ ] ⛔ Confirm SMS sender/number ownership and agency overlap.
- [ ] ⬜ Register business, brand, campaign, and use case for A2P 10DLC.
- [ ] ⬜ Approve separate, unchecked SMS-consent language.
- [ ] ⬜ Configure STOP, HELP, suppression, quiet hours, and staff escalation.
- [ ] ⬜ Test confirmation, reminder, no-show, and manual-reply handling.
- [ ] ⬜ Launch email-first if A2P approval remains pending.

## 7. Privacy, consent, and legal

- [ ] ⛔ Finalize Privacy Policy and Terms with real service providers and data uses.
- [ ] ⛔ Approve email, newsletter, and SMS disclosure language.
- [ ] ⬜ Verify every commercial email has accurate sender identity, a working unsubscribe path, and the required physical postal address.
- [ ] ⬜ Document retention, deletion, export, and do-not-contact procedures.
- [ ] ⬜ Minimize child data; collect guardian details and age bands rather than unnecessary sensitive information.
- [ ] ⬜ Verify consent records can be retrieved for any contact.
- [ ] ⬜ Confirm cookie/analytics consent requirements with counsel as appropriate.

## 8. Analytics and attribution

- [ ] ⛔ Confirm or create the canonical GA4 property and GTM container.
- [ ] ⬜ Install GA4, Meta Pixel, and approved consent behavior without duplicates.
- [ ] ⬜ Define and test events for CTA clicks, form starts, form submissions, class bookings, calls, texts, and enrollments.
- [ ] ⬜ Preserve UTMs and click IDs into the CRM.
- [ ] ⬜ Exclude internal/test traffic and document test contacts.
- [ ] ⬜ Build a basic source → lead → booked class → attended → enrolled report.

## 9. SEO and real-domain cutover

- [ ] ⛔ Confirm registrar, DNS, WordPress hosting, and rollback access.
- [ ] ⛔ Create the old-URL to new-URL redirect inventory.
- [ ] ⬜ Reverify titles, descriptions, canonicals, sitemap, schema, and social images.
- [ ] ⬜ Connect apex and `www` domains to Vercel without taking the current site down first.
- [ ] ⬜ Verify TLS, redirects, apex/`www`, every critical route, forms, and analytics on the real hostname.
- [ ] ⬜ Remove Vercel staging `X-Robots-Tag` and restore production `robots.txt` only after final approval.
- [ ] ⬜ Submit sitemap and inspect Search Console after cutover.
- [ ] ⬜ Monitor 404s, redirects, forms, deliverability, and analytics for at least seven days.

## 10. Final launch authorization

- [ ] ⛔ Diego approves technical readiness and tracking.
- [ ] ⛔ Joao approves content, offers, schedule, contact handling, and legal language.
- [ ] ⛔ A tested rollback path is documented.
- [ ] ⛔ Final production smoke test passes before DNS cutover.
