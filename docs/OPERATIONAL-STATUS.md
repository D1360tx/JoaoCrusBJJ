# Operational status and source-of-truth map

Verified 2026-10-28. This is a documentation reconciliation, not a production release or a new provider audit. Strategy and authorization remain in [CURRENT-DECISIONS.md](../CURRENT-DECISIONS.md). Historical approvals describe their original scope; later verified outcomes below supersede their stale implementation-status labels, not unrelated safety gates.

## Authority by layer

| Layer | Verified state | Authority and limit |
|---|---|---|
| Git application baseline | `e1e094ab36e60ea5d5669c579d64280d798f9d53`, freshly fetched origin/main before this docs change | Latest blog route correction, PR #142; subsequent docs commits do not become deployed application SHAs |
| Bluehost source checkout | `12c0c5ca3031d93e41a858a6e34cd48a4e955f1b`, clean on fresh SSH read | This checkout is behind the bounded blog overlay; do not equate checkout HEAD with the complete live artifact |
| Live website | Bluehost, composite reviewed releases | Latest blog overlay from #141/#142; [release register](RELEASE-REGISTER.md) records exact paths/hashes. No claim of full-tree parity with a fresh main build |
| Lead endpoint | Fresh origin SHA256 `1e2233b38067f0101f3abe0b56a2dcade17ab3efdcf65dabb66761aed067190a` | Same endpoint hash as the Oct 26 real acceptance; no new lead submitted here |
| Article source | Sanity project `9ma5tkiq`, public `production` dataset | Sanity owns article text, revisions and media. Git owns schema, renderer, release procedures and sanitized evidence, not a second article master |
| Editor vs website | Studio works; first article is public on the website | Studio Publish alone does not deploy Bluehost. Owner-run static release required; no automatic webhook or Muse/Grokbot integration enabled |
| CRM / messaging / lifecycle | Latest bounded acceptance Oct 26, not a fresh full automation audit | Targeted GHL webhook/workflow review is pending, sequenced after this reconciliation |

The registered canonical main worktree has unrelated local modifications and is behind origin/main. It was preserved, as was the untracked publication report in the blog worktree. Use a clean topic worktree from freshly fetched origin/main, not reset/stash of somebody else's work. Local shared-brain notes and old call notes are context, not proof of current production state. The July strategy call's pricing discrepancy remains unresolved; no new offer or pricing decision is introduced here.

## Accepted real journey, 2026-10-26

One authorized native contact-page form returned HTTP 200 with contact, opportunity and chronological note accepted. Independent HighLevel readback confirmed one fresh contact, one open opportunity, owner/program/location/consent/request fields and booking link. The normal thank-you rendered six booking destinations; no appointment was booked.

Meta Test Events explicitly showed **Browser / Lead / Processed** and **Server / Lead / Deduplicated** with the same full event ID. This supersedes the earlier Oct 21 missing-server-Test-Events evidence for the fresh-contact journey, not every earlier test or ad-attribution gap. Email consent was granted; both SMS categories were not granted. One ordinary welcome email appeared in the exact native contact timeline; no SMS bubble was observed there. This is not provider-wide zero-SMS certification. Staff Alert enrollment increased; staff inbox delivery was not verified.

The disposable fresh fixture was deleted with exact-record authorization. Exact email and phone searches each returned zero, and its opportunity no longer resolved. Temporary Test Events settings were removed and private environment bytes restored exactly. All 30 visible workflow statuses/update timestamps were unchanged; ordinary enrollment counters changed as expected. Existing Booking Nurture active enrollment returned to its prior baseline of one, not global zero. No global hold/pause was imposed. Final active cron and outbox job counts were zero **at that acceptance checkpoint**, not freshly re-audited today. Backend SMS release stayed false; this is not a global email/nurture hold.

Private acceptance evidence remains outside Git. No test identity, private contact IDs, raw payload, conversation, token or private environment checksum is copied here.

## Known issues and remaining gates

| Priority | Issue / limit | Next acceptance gate; no implementation authorized by this document |
|---|---|---|
| High | Repeat-contact first-touch fields were overwritten by incoming browser attribution during Oct 21 upsert; original fields were restored | Separate fix/review, then controlled repeat-intake readback proving original first touch remains while latest touch and chronological notes advance |
| High | GHL webhook/lifecycle routing, automation eligibility and duplicate conversion ownership need a targeted audit | Read actual configured triggers/actions, consent/holds, signatures and route ownership; distinguish source implementation from provider-enabled behavior. No new findings are claimed before that audit |
| High | Automatic CAPI retry scheduling is not established; Oct 26 had zero active cron entries | Approve retention, event-age handling, late withdrawal/suppression and monitoring before scheduling or queue processing |
| Medium | Fresh-contact test retained earlier browser first-touch context and did not prove requested campaign attribution | New-browser attribution and campaign persistence remain unverified. Do not call the fresh-contact run a pristine first-touch or campaign pass |
| Medium | No broad SMS delivery/STOP/HELP/DND, welcome journey across all programs, qualified-call or booked-class acceptance | Separate owner-approved identity, channel scope, safety and exact-record cleanup; no extra submissions merely for this documentation |
| Medium | Remaining anti-abuse tranche is not certified | Suspect-name/staff-only routing and deprecated direct contact-handler callers remain outside shipped honeypot/timing scope; Turnstile remains optional and unapproved |
| Medium | Google lifecycle/GA4 Measurement Protocol provider enablement not freshly inspected | Preserve historical disabled/pending labels as dated evidence only; provider state must be read during the targeted audit before claiming current enablement |
| Maintenance | Sanity credential expiry tracked for 2027-01-25 | Owner rotates in Sanity before expiry; never distribute native Editor credentials to independent bots. Editor token is not draft-only RBAC |

The Meta event-source query/fragment sanitizer is an intentional privacy boundary. Removing query strings from CAPI URLs is **not** the repeat-contact CRM first-touch overwrite defect. The current endpoint still constructs incoming custom fields for contact upsert without a read/merge preservation step; no first-touch fix is claimed by this docs change. Ad credit, Google indexing and 100% delivery are not established by successful API receipt or one deduplication test.

## Safe operating runbook

1. Fetch origin, inventory worktrees/status and all open PR pages, then read current decisions and this status. Preserve dirty/untracked work.
2. Reconcile source, origin hashes and public bytes separately. Vercel preview success is not Bluehost release proof; live checkout HEAD is not overlay provenance.
3. For an approved release, export the exact reviewed commit into a clean isolated directory; keep CMS snapshot/revisions with private release evidence. Follow [CMS workflow](SANITY-BLOG-CMS.md), and the mandatory [local release job](LIVE-GIT-RECONCILIATION-20261006.md).
4. Inventory host-owned `.htaccess`, `.user.ini`, private env, immutable companions, modes and remote-only paths. Do not replace them from tracked examples. Stop on unexplained drift or executable files; do not probe suspicious code by execution.
5. Verify a full private rollback backup and extracted hash/mode parity, derive an exact approved path/hash allowlist, review dry-run, promote without blanket deletion and require zero residual changes. Public GET/hash/runtime proof and temporary-probe cleanup finish the release.
6. If rollback is needed, verify the private backup and current approved path delta first. Restore modified paths from backup and remove only reviewed new additions absent from that baseline. Never overwrite newer unrelated changes or restore contaminated incident evidence. Reverify origin/public hashes and runtime, retaining failed evidence privately.
7. Any real intake/Meta test requires separate approved identity, alert/nurture/consent handling, exact request correlation, downstream readback and authorized cleanup. Never clear real STOP/DND or globally pause customer workflows to make QA convenient. [CAPI runbook](DIRECT-LEAD-CAPI-HARDENING.md).

## Open PRs are not deployment state

[Complete dated inventory](OPEN-PR-INVENTORY-2026-10-28.md) preserves every open PR and mechanical ancestry results. No old PR is merged, closed, rebased, retargeted or approved by this reconciliation. #137 already reconciled reviewed spam/CALM/parent-attribution application content without merging the complete old #134/#135/#136 stack. Non-ancestor does not mean absent content; ancestor does not certify provider enablement. Review any remaining actual delta independently before a later PR decision.
