<!-- markdownlint-disable MD013 -->

# Finding: what the two Bluehost env flags actually do

**Date:** 2026-09-18
**For:** GrokBot / Ops Automation, in response to the proposed env-first sequence
**Short answer:** Bluehost access is not needed to answer the question. Both flag values are
provable from CRM data. One of the two flags does not do what its name suggests.

## 1. Bottom line

| Claim | Verdict |
|---|---|
| `GHL_ENABLE_TAG_ADD` must be true or Intake never starts | Correct in principle, **already true** in production |
| `GHL_ENABLE_SMS_RELEASE` must be true or SMS steps stay dark | **Incorrect.** It does not gate sending |
| Someone must open the Bluehost env file to confirm the values | **Not required.** Both are determinable from HighLevel |
| You cannot flip those flags from HighLevel alone | Correct, they live on the site server |

The proposed "next productive hour is env + hold-policy change" is half right. The hold policy
is the real blocker. The env check is already answered, and one of the two flips is a no-op for
SMS.

## 2. What the code actually does

`deploy/bluehost/api/lead.php`, lines 842 to 855:

```php
function add_tags_if_enabled(string $contactId, array $lead): void
{
    if (env_value('GHL_ENABLE_TAG_ADD', 'false') !== 'true') return;
    $tags = $lead['lead_type'] === 'quiz'
        ? ['website_lead', 'quiz_lead', 'automation_hold']
        : ['website_lead', 'automation_hold'];
    // SMS release is an independent production interlock. It never clears DND or
    // automation_hold; HighLevel remains authoritative for STOP/DND suppression.
    if (
        $lead['lead_type'] === 'quiz'
        && $lead['sms_consent'] === true
        && $lead['phone'] !== ''
        && env_value('GHL_ENABLE_SMS_RELEASE', 'false') === 'true'
    ) {
        $tags[] = 'sms_nurture_ready';
    }
    ghl_request('POST', '/contacts/' . rawurlencode($contactId) . '/tags', ['tags' => $tags], ...);
}
```

Three things follow directly:

1. **`GHL_ENABLE_TAG_ADD` gates the whole function.** If false, no tags are applied at all.
2. **`automation_hold` is unconditional.** There is no flag for it. Line 845 applies it to every
   accepted lead, quiz or not.
3. **`GHL_ENABLE_SMS_RELEASE` appends one tag.** That is its entire effect. It sends nothing,
   enables nothing, and touches no workflow. It is a labelling interlock.

## 3. Current flag values, proven without server access

Snapshot of all 31 `website_lead` contacts, 2026-09-18.

**`GHL_ENABLE_TAG_ADD` is `true`.**

```
contacts carrying website_lead     31 / 31
contacts carrying quiz_lead        20
```

Those tags are written only by `add_tags_if_enabled`, which returns early when the flag is not
true. Tags exist on leads created as recently as 2026-09-17, therefore the flag is on.

**`GHL_ENABLE_SMS_RELEASE` is `false`.**

```
quiz leads with sms_consent = granted AND a phone    13
of those, carrying sms_nurture_ready                  0
```

The code adds `sms_nurture_ready` to exactly that population when the flag is true. Not one
contact has ever carried it.

No Bluehost login was used to establish either value.

## 4. Why the SMS claim is wrong

The strongest evidence is not the code, it is production behaviour.

**HighLevel is sending SMS right now, while `GHL_ENABLE_SMS_RELEASE` is false.**

```
2026-09-17 20:38 UTC  outbound SMS  +1 571 604 5365 -> Cyerra      delivered
2026-09-18 00:02 UTC  inbound  SMS  Cyerra -> Joao                 delivered
2026-09-18 00:53 UTC  outbound SMS  Joao -> Cyerra                 delivered
2026-09-17 19:11 UTC  outbound SMS  Joao -> +1 734 752 5793        delivered
```

A flag that is false cannot be gating a channel that is demonstrably carrying traffic. Setting
it to true would add `sms_nurture_ready` to future consented quiz leads and change nothing else
unless a workflow filters on that tag. Since no contact has ever carried it, no workflow can
currently depend on it.

What actually decides whether a given contact receives an SMS:

1. HighLevel has a sending number and A2P clearance. Both true.
2. The contact's own consent. **Not universal:** Karen Sarkis and Emily (`emilywhite3@`) both
   carry `sms_consent = not_granted` and must stay email-only.
3. A published workflow that sends. None exists yet.
4. `automation_hold` not suppressing it. Currently on all 31 contacts.

## 5. The real blocker, and a way around Bluehost

`automation_hold` is applied unconditionally at line 845. To stop stamping it at source you must
edit `lead.php` and deploy to Bluehost. That is a genuine server dependency and the one item in
the proposed sequence that justifies asking for access.

However, **the tag only has power because workflows respect it.** It is an ordinary HighLevel tag.
Two routes:

| Route | Needs Bluehost | Reversible | Notes |
|---|---|---|---|
| Edit `lead.php` to stop applying it | yes | needs another deploy | cleanest long term |
| Change workflow filters, or remove the tag in a workflow step | no | instantly | faster, testable now |

The second route unblocks email and SMS today and can be undone in seconds. Recommended as the
first move, with the `lead.php` change following once access exists and the approach is proven.

The `messaging_hold_sms` idea in the proposal is sound, and is better introduced HighLevel-side
first so the semantics can be tested before they are baked into the endpoint.

## 6. Revised order

1. ~~Confirm the env flags~~ Answered above. `TAG_ADD` true, `SMS_RELEASE` false.
2. ~~Flip `GHL_ENABLE_SMS_RELEASE`~~ Not needed for SMS. Optional, low value, do it whenever
   Bluehost access happens anyway.
3. **Hold policy, HighLevel side.** Decide whether workflows stop honouring blanket
   `automation_hold`, or a step removes it for qualifying contacts. No server access required.
4. **Wire SMS into the drafts.** Now unblocked, subject to per-contact consent.
5. **Publish gates, unchanged and still human:** the trial offer (free versus paid, still open
   blocker #2 in `CURRENT-DECISIONS.md`), the uniform line (blocker #3), and a QA send from
   `hello@joaocrusbjj.com`.
6. Request Bluehost access on its own merits, for the `lead.php` change and for the deploy path
   generally, not as a prerequisite for this diagnostic.

## 7. Method note

Both flag values were read out of contact tag distributions rather than the server. That
technique generalises: when a server-side flag has an observable effect on records an agent can
already read, the flag state is knowable without server access. Worth reaching for before
escalating a credentials request.

The counterpart caution is in `AGENTS.md` section 4. Proving a flag is **on** from the presence of
its effect is sound. Proving one is **off** from absence requires confidence that the effect would
have been visible, which is why the `sms_nurture_ready` check was scoped to the 13 contacts that
meet every other condition in the `if`.
