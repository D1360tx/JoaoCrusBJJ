# Joao Lead Stack Conversation

**Meeting date:** Thursday, July 30, 2026
**Purpose:** Confirm the owned email and lead-management setup for the new website.

## Short email draft

**Subject:** Quick setup for the new website and lead follow-up

Hi Joao,

We are ready to set up the lead system behind the new website so inquiries are stored, organized, and followed up instead of only landing in Gmail.

The plan is:

- HighLevel for new leads, class bookings, and email/text follow-up
- Beehiiv for your newsletter
- Zen Planner for enrolled students, memberships, and billing

Nothing needs to move out of Beehiiv or Zen Planner.

The main setup item we need from you is a Google Workspace account for `joaocrusbjj.com`. I recommend `joao@joaocrusbjj.com` as your primary inbox, with `info@joaocrusbjj.com` as an alias. Your existing Gmail can continue receiving internal lead alerts during the transition.

When we talk, I would like to confirm the email address, who should receive lead alerts, account ownership, DNS access, and the phone number we will use for automated texts. We can handle the technical setup and will not ask you to email any passwords.

Thanks,

Diego

## In-person talking points

### 1. What changes

- The current website form sends each accepted lead to `joaocrusbjj@gmail.com` and `diego@icdcventures.com` for owner delivery plus ICDC monitoring.
- The new form will create a real lead record in HighLevel and can still email Joao an alert.
- Every inquiry will retain its source, page, campaign information, consent, and follow-up status.

### 2. What stays the same

- Beehiiv remains the newsletter platform.
- Zen Planner remains the enrolled-student, membership, attendance, and billing platform.
- The current advertising agency is separate and does not control this infrastructure.

### 3. Why Google Workspace

- HighLevel can use Gmail for login and internal notifications.
- Customer-facing emails should come from the academy domain for credibility and deliverability.
- Recommended primary inbox: `joao@joaocrusbjj.com`.
- Recommended alias: `info@joaocrusbjj.com`, delivered to the same inbox initially.
- The sending domain will be authenticated with SPF, DKIM, and DMARC.

### 4. Decisions to get from Joao

- [ ] Approve Google Workspace for `joaocrusbjj.com`.
- [ ] Confirm `joao@joaocrusbjj.com` as the primary mailbox.
- [ ] Confirm whether `info@joaocrusbjj.com` should be an alias or separate inbox.
- [ ] Confirm which people should receive immediate lead alerts.
- [ ] Confirm who should own and pay for Google Workspace and HighLevel.
- [ ] Identify who controls the domain registrar and DNS; request a secure administrator invite.
- [ ] Choose whether replies should appear personally from “Joao” or from “Team Joao Crus BJJ.”
- [ ] Approve a dedicated local number for automated texts and two-way lead conversations.
- [ ] Confirm the business details required for A2P registration, shared securely later.

## After Joao approves

1. Create the Google Workspace tenant and primary mailbox.
2. Add aliases and recovery administrators.
3. Create the dedicated HighLevel account.
4. Configure the sending subdomain, SPF, DKIM, DMARC, and Reply-To address.
5. Configure contact fields, pipelines, calendars, staff alerts, and workflows.
6. Connect the Vercel forms to HighLevel and explicit newsletter opt-ins to Beehiiv.
7. Register the business and texting use case for A2P 10DLC.
8. Test form submission, email delivery, replies, consent records, UTMs, pipeline movement, and staff notifications end to end.
