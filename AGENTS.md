<!-- markdownlint-disable MD013 -->

# AGENTS.md

Read this before touching anything. It applies to every agent working this repo or the
HighLevel account: Claude, GrokBot, Hermes, and anything added later.

`CLAUDE.md` is a pointer to this file. There is one set of rules, not one per agent.

## 1. Non-negotiables

These are not preferences. Breaking one costs real money or real trust.

- **Paused means paused.** Never activate a campaign, ad, ad set, or creative.
- **Never clear a DND.** HighLevel stays authoritative for STOP and DND suppression.
- **SMS sending from HighLevel is cleared** (Diego, 2026-09-18) and is in live use from
  `+1 571 604 5365`. That clearance covers sending. It does not authorise enabling an
  automated sequence, which still needs its own release gate.
- `GHL_ENABLE_SMS_RELEASE` is a **website-side tagging interlock**, not a send switch.
  It only adds `sms_nurture_ready` to consented quiz leads in `lead.php`. Leave it false
  until someone deliberately flips it; do not treat it as the thing that gates SMS.
- **Never merge a pull request marked "do not merge" or left as a draft on purpose.**
- **Never send to a real contact** from a workflow that has not passed its release gate.
- **Never skip, disable, or quarantine a test** to make a check pass.
- Money, messaging, and ad spend are human decisions. Propose, do not execute.

## 2. Decision hierarchy

When sources disagree, higher wins, and the conflict gets written down rather than
silently resolved.

```
1. A human's direct statement        Joao's email, Diego's instruction
2. A verifiable system event         a message exists, an appointment was created,
                                     a payment landed
3. An agent's inference              never overwrites 1 or 2
```

`CURRENT-DECISIONS.md` outranks every older document in the repo.

## 3. Write rules

**Agents write facts. Agents propose inferences.**

A change backed by a system event is a fact. Write it, and cite the event.
A change derived from reading an ambiguous sentence is an inference. It goes to the
human, not to the record.

Every one of the errors logged in §5 would have been prevented by that single rule.

Other rules:

- **Never move a contact backwards** through the pipeline. Compare stage position first.
  A lead at Trial Booked who asks a question does not drop to Contacted.
- **Provenance on every write.** Leave a note naming the agent, the timestamp, and the
  evidence. Nobody should have to diff two snapshots to reconstruct who did what.
- **Idempotency keys on every write**, formatted `joao-<purpose>-<date>-<subject>`.
- **Do not revert another agent's write without asking**, unless it violates §1.

## 4. Verify across every channel, not the one you queried

This is the failure that cost the most on 2026-09-18, so it gets its own section.

An agent exported location messages with `channel: "Email"`, found no reply from a lead,
and concluded "no inbound message exists." It then removed a `lead_replied` tag as
unsupported. The lead had in fact replied **by SMS** forty minutes earlier.

The query could not have returned the evidence it was being used to rule out.

Before asserting that something did not happen:

- `export-messages-by-location` with `channel` omitted returns **non-email types only**.
  With `channel: "Email"` it returns **email only**. Neither is "everything."
- To see one contact's full history, use `search-conversation` by `contactId`, then
  `get-messages` on the conversation id. That crosses channels.
- Live channels in this account include SMS, Email, Instagram, Facebook, calls, and
  no-show records. Instagram carries real inbound volume, mostly solicitation.
- **Absence of evidence in a filtered query is not evidence of absence.** If a query
  cannot see a thing, do not use it to rule the thing out.

## 5. Error log

Kept so the same mistakes are not repeated. Add to it.

| Date | Error | Root cause |
|---|---|---|
| 2026-09-18 | Removed a correct `lead_replied` tag from a lead who had replied by SMS | Queried one channel, asserted across all channels |
| 2026-09-18 | Attributed a stage change to another agent | Did not check `source` on the activity record, which read `app` |
| 2026-09-18 | Moved a confirmed solicitation into Contacted | Treated a form submission as a prospect without reading the message body |
| 2026-09-18 | Marked two leads Contacted against the owner's explicit "no response" | Inference written as fact, §3 |
| 2026-09-17 | Draft email copy promised a free first class | Wrote an offer that contradicts `CURRENT-DECISIONS.md` and is still an open blocker |

## 6. Domain ownership

One writer per surface. This removes the need for locking.

| Surface | Who writes | How |
|---|---|---|
| Repo and code | any agent | branches and pull requests, git arbitrates |
| HighLevel pipeline and contacts | **one nominated agent** | everyone else reads and proposes |
| HighLevel workflows, calendars, forms | human only | no write API exists anyway |
| Meta, ads, budgets | human only | real money |
| Production hosting | human only | deploy is a gated step |

If you are not the nominated CRM writer, produce a proposal list and stop.

## 7. Verification standard

This repo's norm is real execution evidence, not assertion. Match it.

- Run the checks and paste the actual numbers. `node --test tests/*.test.js` is
  148 passing as of commit `4bd9496`.
- For a fix, reproduce the failure first, then show it passing.
- Cite exact commit SHAs, record counts, and timestamps.
- State what you did not verify, and why.
- Never claim a deployment, a send, or a downstream receipt you did not observe.

## 8. Repo conventions

- **No em dashes.** Anywhere. Checked in review.
- Commit messages carry the evidence, not just the intent.
- Documentation-only changes say so explicitly.
- Do not create a pull request unless asked.

## 9. Key identifiers

```
GHL location          PnNnRDAjstycMWpOmUn7
Pipeline              7A8TP4P8ySpolodQ49y1   "Prospect Enrollment"
Calendar group        yvqSkqWbsqW7n2nRiusX   five of six class calendars
Orphan calendar       t3BhPBY47hZZ6a7pIUan   no groupId, skipped by group triggers
GA4 property          547238162              measurement id G-EW2F2YKR3Y
Waiver form           gsTkwhfAHlvKmaG8xjOG   "Trial Class Registration & Waiver"
```

Stage ids are in `docs/LEAD-AUTOMATION-SPEC.md` §3.

## 10. Where things are

| Need | Look at |
|---|---|
| Current strategy and offers | `CURRENT-DECISIONS.md` |
| Automation target state | `docs/LEAD-AUTOMATION-SPEC.md` |
| Open asks for Joao | `08-NEEDED-FROM-JOAO.md` |
| GA4 and GSC access | `docs/GA4-KEYLESS-WORKFLOW-BRIDGE.md`, `docs/GSC-OPERATIONAL-GITHUB-BRIDGES.md` |
| Meta ads access | local `meta-ads-mcp` via Hermes, not reachable from CI |
| Drift detection | `scripts/ghl_reconcile.py` |

## 11. Known gaps

- Emails Joao sends from personal Gmail never reach HighLevel, so outreach looks absent
  when it is not. Do not infer "never contacted" from an empty conversation.
- Phone calls made from his cell are not logged at all.
- Leads can exist as a conversation with **no opportunity attached**, so they are invisible
  in the pipeline. Confirmed case: contact `S7Yej6ixIkbXDdphttMT`, `+1 734 752 5793`, no
  name, no email, three unread messages, asking about Little Champions for a son turning
  three in October. Two missed calls two weeks apart, question never answered.
- **Missed Call Text Back can fail silently.** On 2026-09-03 it errored with
  `"Missed Call Text Back was not sent because no eligible SMS sender was available."`
  That lead went unanswered for fourteen days.
- **At least three inbound numbers are in play**: `+1 737 302 5253`, `+1 737 384 8448`,
  and outbound `+1 571 604 5365`. Plus `833-532-4152` on the website, origin unknown.
  Do not assume a single number owns a conversation.
- The trial offer is unresolved. Do not write customer copy that names a price or
  promises a free class.
