#!/usr/bin/env python3
"""Detect drift in the HighLevel pipeline between two point-in-time snapshots.

Multiple agents write to the same HighLevel location. On 2026-09-18 four stage
changes appeared overnight from an unidentified writer, three of which were wrong.
Finding that took a manual diff of two raw API dumps. This script does that job.

Deliberately credential-free. It reads snapshot files rather than calling the API,
so any agent can produce a snapshot with whatever access it already has (MCP, REST,
a local token) and every agent can run the same comparison. Nothing here needs a
secret, which means it is safe in CI and safe to hand to another agent.

Usage
-----
Normalise a raw API response into a snapshot:

    ghl_reconcile.py snapshot --contacts raw_contacts.json \\
        [--conversations raw_conversations.json] --out snapshots/2026-09-18.json

Compare two snapshots:

    ghl_reconcile.py diff --old snapshots/2026-09-17.json \\
        --new snapshots/2026-09-18.json

Exit codes: 0 no drift, 1 drift found, 2 bad input. The non-zero drift code makes
this usable as a scheduled check.

Raw inputs
----------
contacts:      response of POST /contacts/search  (needs customFields + opportunities)
conversations: response of GET  /conversations/search (optional, adds reply evidence)

The conversations file matters. A stage claiming a lead replied is only supported if
a conversation shows an inbound message, and inbound replies arrive on SMS, email,
Instagram and Facebook. A single-channel export cannot support or refute such a
claim. See AGENTS.md section 4.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

# Prospect Enrollment, location PnNnRDAjstycMWpOmUn7. Order is pipeline order; the
# index is what makes "never move a contact backwards" checkable.
STAGES: list[tuple[str, str]] = [
    ("c463c80e-4dbd-4ea5-8f38-1dc789b46b31", "New Lead"),
    ("adc9182b-cf0d-427d-a147-b401610eac3b", "Attempting Contact"),
    ("4fe1a8fe-626e-4710-b369-23f1888fa343", "Contacted"),
    ("8c0dd411-db08-409a-a21b-c59191e405b9", "Qualified"),
    ("ee84a808-f150-49fd-8dbf-a6e068b4ffc2", "Trial Booked"),
    ("fee502a5-2179-4bba-951c-c611fd57d9ab", "Trial Confirmed"),
    ("d6c8f5a9-67ee-4d11-8649-e2c9fbc82f27", "Trial Showed"),
    ("0f39bf24-6ff3-4a3c-979e-bc448355face", "No Show"),
    ("57d6be6a-a6f3-4709-ae77-a27c925c3ba8", "Enrollment Opportunity"),
    ("4aa3dadc-a698-4549-93c2-8d9b5286e2a0", "Enrolled"),
    ("8b37cb38-47d8-4b4c-816f-5baf8e0b671e", "Follow-Up / Undecided"),
    ("0aa5c4d9-7c35-48cd-850e-a78a44539049", "Long-Term Nurture"),
]
STAGE_NAME = {sid: name for sid, name in STAGES}
STAGE_RANK = {name: i for i, (_sid, name) in enumerate(STAGES)}

# Stages that assert a two-way exchange happened. Claiming one without an inbound
# message on some channel is the exact error logged in AGENTS.md section 5.
STAGES_IMPLYING_REPLY = {"Contacted", "Qualified", "Trial Showed", "Enrolled"}
TAGS_IMPLYING_REPLY = {"lead_replied", "trial-invite-responded"}

SOLICITATION_DOMAINS = ("vasdirect.com", "trustedvirtualteam.com", "toptalentvas.com")
SOLICITATION_PHRASES = (
    "seo", "our agency", "rankings", "portfolio and pricing",
    "boost traffic", "i noticed your website", "web design",
)
WEBSITE_MESSAGE_FIELD = "E3E30TlnuldMmh1wFj59"


def _find_list(obj: Any, key: str) -> list[dict]:
    """Pull a named list out of an API response without caring how it is wrapped."""
    if isinstance(obj, dict):
        value = obj.get(key)
        if isinstance(value, list) and (not value or isinstance(value[0], dict)):
            return value
        for nested in obj.values():
            found = _find_list(nested, key)
            if found:
                return found
    return []


def looks_like_solicitation(email: str, message: str) -> bool:
    if email.endswith(SOLICITATION_DOMAINS):
        return True
    return any(phrase in message.lower() for phrase in SOLICITATION_PHRASES)


def build_snapshot(contacts_path: Path, conversations_path: Path | None) -> dict:
    contacts = _find_list(json.loads(contacts_path.read_text()), "contacts")
    if not contacts:
        sys.exit(f"no contacts found in {contacts_path}")

    replied: set[str] = set()
    channels: dict[str, list[str]] = {}
    if conversations_path:
        for convo in _find_list(json.loads(conversations_path.read_text()), "conversations"):
            cid = convo.get("contactId")
            if not cid:
                continue
            channels.setdefault(cid, [])
            kind = convo.get("lastMessageType")
            if kind and kind not in channels[cid]:
                channels[cid].append(kind)
            # A conversation record exposes only the LAST message direction. Inbound
            # there proves a reply. Outbound there proves nothing, because the owner
            # may simply have answered last. This asymmetry is the whole point: the
            # source can confirm a reply and can never refute one, so absence stays
            # "unknown" rather than becoming "did not reply". See AGENTS.md section 4.
            if convo.get("lastMessageDirection") == "inbound":
                replied.add(cid)

    records = {}
    for contact in contacts:
        fields = {f.get("id"): f.get("value") for f in contact.get("customFields") or []}
        opportunities = contact.get("opportunities") or []
        opportunity = opportunities[0] if opportunities else {}
        email = (contact.get("email") or "").lower()
        name = " ".join(x for x in (contact.get("firstName"), contact.get("lastName")) if x)
        records[contact["id"]] = {
            "name": name or email or contact["id"],
            "email": email,
            "opportunity_id": opportunity.get("id"),
            "stage": STAGE_NAME.get(opportunity.get("pipelineStageId"), "(none)"),
            "status": opportunity.get("status"),
            "value": opportunity.get("monetaryValue"),
            "tags": sorted(contact.get("tags") or []),
            # confirmed | unknown. Never "none": see build_snapshot.
            "reply": "confirmed" if contact["id"] in replied else "unknown",
            "channels": sorted(channels.get(contact["id"], [])),
            "solicitation": looks_like_solicitation(
                email, str(fields.get(WEBSITE_MESSAGE_FIELD) or "")
            ),
        }
    return {
        "contacts_source": contacts_path.name,
        "conversations_source": conversations_path.name if conversations_path else None,
        "reply_evidence_available": conversations_path is not None,
        "count": len(records),
        "records": records,
    }


def diff(old: dict, new: dict) -> list[tuple[str, str]]:
    """Return (severity, message) pairs. Severity is REVIEW, WARN or INFO."""
    findings: list[tuple[str, str]] = []
    old_records, new_records = old["records"], new["records"]

    for cid in sorted(set(new_records) - set(old_records)):
        findings.append(("INFO", f"new contact: {new_records[cid]['name']}"))
    for cid in sorted(set(old_records) - set(new_records)):
        findings.append(("WARN", f"contact disappeared: {old_records[cid]['name']}"))

    for cid in sorted(set(old_records) & set(new_records), key=lambda c: new_records[c]["name"]):
        before, after = old_records[cid], new_records[cid]
        who = after["name"]

        if before["stage"] != after["stage"]:
            rank_before = STAGE_RANK.get(before["stage"], -1)
            rank_after = STAGE_RANK.get(after["stage"], -1)
            line = f"{who}: stage {before['stage']} -> {after['stage']}"

            # Backwards movement is almost always a bug, per AGENTS.md section 3.
            if rank_after < rank_before and rank_after >= 0 and rank_before >= 0:
                findings.append(("REVIEW", f"{line}  MOVED BACKWARDS"))
            elif after["stage"] in STAGES_IMPLYING_REPLY and after["reply"] != "confirmed":
                # Unverified, not wrong. The snapshot cannot see inbound messages
                # that are not the most recent one in a thread.
                seen = ", ".join(after["channels"]) or "no conversation"
                findings.append((
                    "WARN",
                    f"{line}  asserts a reply, unconfirmed from this snapshot ({seen})",
                ))
            else:
                findings.append(("INFO", line))

            if after["solicitation"] and rank_after > rank_before:
                findings.append((
                    "REVIEW",
                    f"{who}: advanced but looks like solicitation ({after['email']})",
                ))

        if before["status"] != after["status"]:
            findings.append(("INFO", f"{who}: status {before['status']} -> {after['status']}"))
        if before["value"] != after["value"]:
            findings.append(("INFO", f"{who}: value {before['value']} -> {after['value']}"))

        added = set(after["tags"]) - set(before["tags"])
        removed = set(before["tags"]) - set(after["tags"])
        for tag in sorted(added & TAGS_IMPLYING_REPLY):
            if after["reply"] == "confirmed":
                findings.append(("INFO", f"{who}: +{tag}  (inbound message confirms it)"))
            else:
                findings.append(("WARN", f"{who}: +{tag}  unconfirmed from this snapshot"))
        for tag in sorted(removed & TAGS_IMPLYING_REPLY):
            # Removing a reply tag from someone who demonstrably replied is the
            # error logged in AGENTS.md section 5. That one is always REVIEW.
            if after["reply"] == "confirmed":
                findings.append(("REVIEW", f"{who}: -{tag}  but an inbound message exists"))
            else:
                findings.append(("INFO", f"{who}: -{tag}"))
        for tag in sorted((added | removed) - TAGS_IMPLYING_REPLY):
            sign = "+" if tag in added else "-"
            findings.append(("INFO", f"{who}: {sign}{tag}"))

    return findings


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    sub = parser.add_subparsers(dest="command", required=True)

    snap = sub.add_parser("snapshot", help="normalise raw API output into a snapshot")
    snap.add_argument("--contacts", type=Path, required=True)
    snap.add_argument("--conversations", type=Path)
    snap.add_argument("--out", type=Path, required=True)

    cmp_ = sub.add_parser("diff", help="compare two snapshots")
    cmp_.add_argument("--old", type=Path, required=True)
    cmp_.add_argument("--new", type=Path, required=True)
    cmp_.add_argument("--quiet", action="store_true", help="only show REVIEW and WARN")

    args = parser.parse_args()

    if args.command == "snapshot":
        snapshot = build_snapshot(args.contacts, args.conversations)
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(json.dumps(snapshot, indent=2, sort_keys=True) + "\n")
        if not snapshot["reply_evidence_available"]:
            print("warning: no conversations file, reply claims cannot be checked")
        print(f"wrote {args.out} with {snapshot['count']} contacts")
        return 0

    old, new = json.loads(args.old.read_text()), json.loads(args.new.read_text())
    findings = diff(old, new)
    if not new.get("reply_evidence_available"):
        print("warning: new snapshot has no reply evidence, some checks are skipped\n")

    order = {"REVIEW": 0, "WARN": 1, "INFO": 2}
    shown = [f for f in findings if not (args.quiet and f[0] == "INFO")]
    for severity, message in sorted(shown, key=lambda f: order[f[0]]):
        print(f"  [{severity:<6}] {message}")

    needs_attention = sum(1 for severity, _ in findings if severity in ("REVIEW", "WARN"))
    print(
        f"\n{len(findings)} change(s), {needs_attention} needing attention"
        f"  ({old['count']} -> {new['count']} contacts)"
    )
    return 1 if needs_attention else 0


if __name__ == "__main__":
    raise SystemExit(main())
