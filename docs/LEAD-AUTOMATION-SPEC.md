<!-- markdownlint-disable MD013 -->

# Lead Automation Spec

> **Status:** proposed, 2026-09-17. Not built, not published.
> Supersedes the ad-hoc workflow set currently in the location. Build order is in §9.
> This document is the target state. Diff it against the HighLevel UI before changing anything.

## 1. Why this exists

Evidence gathered 2026-09-17 from the live location `PnNnRDAjstycMWpOmUn7`:

| Finding | Evidence |
|---|---|
| No real lead has ever received an automated email | 48 workflow emails since 2026-08-15; 41 are staff alerts, 7 are lead-facing and all went to QA addresses |
| Pipeline stages are stale, not the outreach | 30 hand-typed emails to leads whose stage never advanced |
| Two live deals invisible in the pipeline | Karen Sarkis (booked + waiver signed, stage `Attempting Contact`), Marcie Clark (enrolling, stage `Trial Showed`) |
| Click-ID capture was broken | 0 of 20 paid leads carried `fbclid`; fixed in commit `985ccf9` |
| Solicitation reaches Joao | 4 of 11 non-quiz submissions were B2B pitches; he replied to at least two |

The root cause is not Joao's follow-up. It is that **every stage transition requires a human to remember**.
This spec removes that requirement wherever an observable event can stand in.

## 2. Design principles

1. **Derive stage from events.** A stage that depends on memory will be wrong. See §3.
2. **Channel-agnostic, per-channel gated.** Every send step checks channel availability and consent at
   run time, and falls back. SMS being unavailable must never block a flow from shipping.
3. **One workflow per job, not one per calendar.** Variation belongs in merge fields and branches.
4. **Exit conditions on every sequence.** A reply, a booking, or an unsubscribe stops everything.
5. **Nothing customer-facing turns on without an explicit release gate.** See §8.

## 3. Stage derivation

Pipeline `Prospect Enrollment` (`7A8TP4P8ySpolodQ49y1`).

| Stage | Stage ID | Set by | Human? |
|---|---|---|---|
| New Lead | `c463c80e-…b46b31` | form submission accepted | no |
| Attempting Contact | `adc9182b-…610eac3b` | first outbound of any channel logged | no |
| Contacted | `4fe1a8fe-…1888fa343` | any inbound reply (email, SMS, call answered) | no |
| Qualified | `8c0dd411-…191e405b9` | Joao marks it, or call disposition = qualified | **yes** |
| Trial Booked | `ee84a808-…068b4ffc2` | appointment created on any class calendar | no |
| Trial Confirmed | `fee502a5-…11fd57d9ab` | `autoConfirm` already true on all class calendars | no |
| Trial Showed | `d6c8f5a9-…c9fbc82f27` | appointment status = showed | one tap |
| No Show | `0f39bf24-…c448355face` | appointment status = no-show | one tap |
| Enrollment Opportunity | `57d6be6a-…7c925c3ba8` | post-trial, no enrollment within 48h | no |
| Enrolled | `4aa3dadc-…9d5286e2a0` | payment or membership event | **yes** |
| Follow-Up / Undecided | `8b37cb38-…baf8e0b671e` | manual | yes |
| Long-Term Nurture | `0aa5c4d9-…a78a44539049` | nurture exhausted without reply | no |

Two human decisions remain: **Qualified** and **Enrolled**. Everything else is automatic.

### 3.1 Stage-setter workflow

```
NAME     Stage Sync - Derived Transitions
TRIGGER  Contact Replied (any channel)
         OR Outbound Message Sent (any channel)
         OR Appointment status changed
         OR Payment received

IF   inbound reply           AND stage < Contacted        -> set stage Contacted
IF   outbound sent           AND stage < Attempting       -> set stage Attempting Contact
IF   appointment created                                  -> set stage Trial Booked
IF   appointment = showed                                 -> set stage Trial Showed
IF   appointment = no-show                                -> set stage No Show
IF   payment received                                     -> set stage Enrolled

NEVER moves a contact backwards. Compare stage position before writing.
```

The never-backwards rule matters: a lead at Trial Booked who sends a question must not drop to Contacted.

## 4. Workflow A: New Lead Intake

Replaces the lead-facing half of `Website Lead - Email First Release`.

```
NAME     Lead Intake - Acknowledge and Route
TRIGGER  Contact Created  WHERE tag contains "website_lead"

STEP 1   IF tag contains "suspected_solicitation"  -> assign to review, EXIT
STEP 2   Set stage = New Lead
STEP 3   Internal alert to Joao (keep the existing staff-alert content, it works)
STEP 4   WAIT 2 minutes
STEP 5   SEND acknowledgement
           IF sms_consent = granted AND SMS release enabled  -> SMS, then email 10 min later
           ELSE                                              -> email only
STEP 6   Set stage = Attempting Contact
STEP 7   Enter "Booking Nurture" (Workflow B)

EXIT     contact replies, books, or unsubscribes
```

### 4.1 Acknowledgement copy

> **BLOCKED on the offer decision.** `CURRENT-DECISIONS.md` §161 records a move away from a
> free-only trial toward a paid or deposit trial, and the launch offer itself is open blocker #2.
> The copy below deliberately says "your first class" rather than "your free first class".
> Do not publish any of this copy until the offer is confirmed. See §10.

**SMS** (when A2P is live, 1 segment):

```
Hi {{contact.first_name}}, this is Joao Crus BJJ. We got your request about
{{contact.recommended_program}}. Pick a time for your first class here:
{{booking_link}} Reply STOP to opt out.
```

**Email**, subject: `Your first class at Joao Crus BJJ`

```
Hi {{contact.first_name}},

Thanks for reaching out about {{contact.recommended_program}}.

You mentioned you are hoping for {{contact.primary_goal}}. That is exactly what
we work on, and the best way to see it is to come try a class.

Pick a time that works for you:
{{booking_link}}

Classes are at {{contact.preferred_location}}. Parents are welcome to stay and watch.

If you would rather talk first, just reply to this email and I will call you.

Joao Crus
Joao Crus Brazilian Jiu-Jitsu
```

`{{contact.primary_goal}}` is already populated by the quiz for 20 of 27 recent leads.
Branch to a generic line when it is empty.

## 5. Workflow B: Booking Nurture

Your steps 6 and 7. Runs only while the contact has not booked.

```
NAME     Booking Nurture
TRIGGER  entered from Workflow A

DAY 1    booking reminder
DAY 2    what a first class is actually like + invitation to ask questions
DAY 4    answer to the most common hesitation, branched by audience
DAY 7    last touch, low pressure
DAY 8    set stage = Long-Term Nurture, EXIT

EXIT ON  appointment created (any class calendar)
         any inbound reply
         unsubscribe
         stage advanced past Attempting Contact by any other source
```

### 5.1 Day 2, subject: `What the first class looks like`

```
Hi {{contact.first_name}},

A first class is 45 minutes. Wear comfortable clothes.

Nobody gets thrown in. New students start with the basics: how to move, how to
fall safely, and the one rule everything else is built on, which is that tapping
means stop. Every student learns it on day one.

You are welcome to stay and watch the whole thing.

{{booking_link}}

Questions? Just reply. I read every one.

Joao
```

### 5.2 Day 4, branch on `contact.audience`

**Child**, subject: `"My kid is shy" is the most common thing I hear`

```
Hi {{contact.first_name}},

The question I get most from parents is whether their child is too shy, too
young, or too distracted for this.

Shy kids often do well here, because Jiu-Jitsu is not a room full of children
shouting. It is structured, it is repetitive in a way kids find reassuring, and
progress is visible week to week.

We start as young as three. Ages three to seven train together in Little Champions.

{{booking_link}}

Joao
```

**Adult**, subject: `You do not need to be in shape first`

```
Hi {{contact.first_name}},

Most adults who walk in tell me some version of "I want to get in shape first."

You do not need to. The beginner class assumes you have never trained. You will
be tired, and you will be fine. People who have never done a martial art before
are the majority of who starts with us.

{{booking_link}}

Joao
```

### 5.3 Day 7, subject: `Should I close this out?`

```
Hi {{contact.first_name}},

I do not want to keep emailing if the timing is not right.

If you are still interested, here is the link one more time:
{{booking_link}}

If not, no hard feelings. Reply "not now" and I will stop.

Joao
```

## 6. Workflow C: Post-Booking

```
NAME     Trial Booked - Confirm and Prepare
TRIGGER  Appointment Created  WHERE calendar IN group yvqSkqWbsqW7n2nRiusX

STEP 1   Set stage = Trial Booked
STEP 2   Confirmation with waiver link
           form "Trial Class Registration & Waiver" (gsTkwhfAHlvKmaG8xjOG)
STEP 3   IF waiver not signed after 24h  -> one reminder only
STEP 4   Enter "Trial Reminders" (Workflow D)
```

### 6.1 Confirmation copy, subject: `You are booked for {{appointment.start_time}}`

```
Hi {{contact.first_name}},

You are confirmed for {{appointment.calendar_name}} on {{appointment.start_time}}.

Where: {{appointment.address}}

One thing before you come: please sign the waiver so we are not doing paperwork
at the door.

{{waiver_link}}

Wear comfortable clothes. Arrive about 10 minutes early.

See you there,
Joao
```

**Known gap:** Austin (Castle Hill) may require a second facility waiver. Karen Sarkis asked for
the Castle Hill waiver link on 2026-09-11 and it is not clear she received one. Confirm whether a
separate Castle Hill waiver exists and branch step 2 on `{{appointment.address}}` if so.

## 7. Workflow D: Trial Reminders

Replaces `Dripping Springs Trial Reminders` (draft, to be deleted). One workflow, all calendars.

```
NAME     Trial Reminders
TRIGGER  Appointment Created  WHERE calendar IN group yvqSkqWbsqW7n2nRiusX

WAIT     until 2 days before {{appointment.start_time}}   -> reminder 1
WAIT     until 2 hours before {{appointment.start_time}}  -> reminder 2
WAIT     until 2 hours after  {{appointment.start_time}}  -> internal one-tap:
                                                             showed / no-show

EXIT ON  appointment cancelled
```

**Prerequisite:** calendar `t3BhPBY47hZZ6a7pIUan` ("Dripping Springs Trial Visits") has an empty
`groupId` and will be silently skipped by a group-scoped trigger. It also appears to be a legacy
duplicate: its confirmation text says "we will contact you shortly to confirm" while the other five
say "your first class is confirmed", it has `googleInvitationEmails: true` where the others are
false, and it allows instant booking where the others require 12 hours notice. It was not among the
five booking URLs verified in PR #122. Retire it, or assign it to `yvqSkqWbsqW7n2nRiusX`.

### 7.1 Reminder copy

**2 days before**, subject: `Your first class is in 2 days`

```
Hi {{contact.first_name}},

Quick reminder: {{appointment.calendar_name}} on {{appointment.start_time}}.
{{appointment.address}}

Comfortable clothes, arrive 10 minutes early. {{waiver_status_line}}

Need to change it? {{reschedule_link}}

Joao
```

**2 hours before**, SMS when available, otherwise email. Subject: `See you in a couple of hours`

```
Hi {{contact.first_name}}, your class is at {{appointment.start_time}} today at
{{appointment.address}}. See you soon. Need to reschedule? {{reschedule_link}}
```

## 8. Release gates

Nothing here goes live without the matching gate cleared.

| Gate | Blocks | Status |
|---|---|---|
| SMS sending from HighLevel | all SMS steps | **cleared** (Diego, 2026-09-18), live from `+1 571 604 5365` |
| Automated SMS sequence enablement | Workflows A, B, D SMS branches | still a deliberate human go |
| `GHL_ENABLE_SMS_RELEASE` | website `sms_nurture_ready` tagging only, not sending | false, leave it |
| `automation_hold` tag policy | all customer-facing sends | currently blanket; needs an email-only carve-out |
| GA4 Measurement Protocol secret | lifecycle webhook workflows | not created |
| Gmail capture (§ below) | accurate stage derivation | not solved |

**SMS is now cleared and already in manual use** (Diego, 2026-09-18), sending from
`+1 571 604 5365`. The original assumption that SMS had to wait on A2P no longer holds, so
Workflows A, B and D can treat SMS as a first-class channel rather than a deferred one.

Consent is not universal, so the per-contact check in every send step still matters. Karen
Sarkis and Emily (`emilywhite3@`) both carry `sms_consent = not_granted` and are email-only.

The remaining blanket `automation_hold` is a policy choice, not a regulatory one, and is still
what keeps every customer-facing workflow from firing.

## 9. Build order

1. Fix or retire calendar `t3BhPBY47hZZ6a7pIUan`. Delete the `Dripping Springs Trial Reminders` draft.
2. Close the Gmail capture gap so stage derivation is not reading partial data.
3. Workflow D (Trial Reminders). Smallest, clearest, already in progress.
4. Workflow C (Post-Booking).
5. Workflow A + B (Intake and Nurture), email-only.
6. Stage Sync (§3.1).
7. Publish the four lifecycle webhooks once the GA4 secret exists.
8. SMS layer and missed-call-text-back once A2P clears.

## 10. Open questions

- Does a separate Castle Hill facility waiver exist? Karen Sarkis asked on 2026-09-11.
- Which of the five from-addresses should be canonical? Currently `hello@joaocrusbjj.com` (56 sends),
  `joaocrusbjj@gmail.com` (14), bare gmail (4), and two `msgsndrdeliver.com` relay addresses.
  A third address, `joaocrus@gmail.com`, is treated as inbound, meaning HighLevel does not recognise
  it as Joao.
- Should `automation_hold` gain an email-only carve-out, or should a separate `messaging_hold_sms`
  tag be introduced so the two channels gate independently?
- Who marks Qualified, and from what surface? A one-tap internal link after a logged call is the
  lowest-friction option.
- **What is the trial offer?** All six calendars are named "First Class" and their confirmation text
  reads "your first class is confirmed", which implies a simple free visit. `CURRENT-DECISIONS.md`
  §161 says move to a paid or deposit trial. Those two are in conflict today. Every acknowledgement,
  nurture and confirmation message depends on the answer.
- Is a trial uniform included, required, or neither? Open blocker #3. Affects the "what to wear" line
  in three separate messages.
