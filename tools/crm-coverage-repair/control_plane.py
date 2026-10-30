#!/usr/bin/env python3
"""Deterministic core for the ICDC marketing control plane.

Collectors remain outside this process because Hermes MCP tools own scoped provider
access. This module validates sanitized collector output, evaluates evidence-gated
rules, persists normalized history, and renders the mobile brief.
"""
from __future__ import annotations

import argparse
import copy
import datetime as dt
import json
import re
import sqlite3
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent
DEFAULT_POLICY = ROOT / "policy.json"
DEFAULT_DB = ROOT / "control-plane.sqlite3"
SOURCE_STATES = {"verified", "unavailable", "blocked", "not_queried_not_due"}
REQUIRED_SOURCES = ("meta", "ga4", "ghl")


def load_json(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as handle:
        value = json.load(handle)
    if not isinstance(value, dict):
        raise ValueError(f"{path}: top-level JSON must be an object")
    return value


def nested(data: dict[str, Any], *path: str, default: Any = None) -> Any:
    node: Any = data
    for key in path:
        if not isinstance(node, dict) or key not in node:
            return default
        node = node[key]
    return node


def number(value: Any) -> float | None:
    if value is None or isinstance(value, bool):
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def integer(value: Any) -> int | None:
    parsed = number(value)
    return None if parsed is None else int(parsed)


def validate_snapshot(snapshot: dict[str, Any], policy: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    required = {"date_ct", "generated_at", "status", "meta", "ga4", "gsc", "ghl", "reconciliation", "recommendation"}
    missing = sorted(required - snapshot.keys())
    if missing:
        errors.append("missing required keys: " + ", ".join(missing))

    try:
        dt.date.fromisoformat(str(snapshot.get("date_ct")))
    except ValueError:
        errors.append("date_ct must be ISO YYYY-MM-DD")
    try:
        dt.datetime.fromisoformat(str(snapshot.get("generated_at")).replace("Z", "+00:00"))
    except ValueError:
        errors.append("generated_at must be an ISO-8601 datetime")
    if snapshot.get("status") not in {"healthy", "warning", "blocked"}:
        errors.append("status must be healthy, warning, or blocked")

    for source in ("meta", "ga4", "gsc", "ghl"):
        body = snapshot.get(source)
        if not isinstance(body, dict):
            errors.append(f"{source} must be an object")
            continue
        if body.get("source_status") not in SOURCE_STATES:
            errors.append(f"{source}.source_status must be an allowed explicit state")

    recommendation = snapshot.get("recommendation")
    if not isinstance(recommendation, str) or not recommendation.strip():
        errors.append("recommendation must be a non-empty string")

    privacy = policy.get("privacy", {})
    forbidden_fragments = [str(x).lower() for x in privacy.get("forbidden_key_fragments", [])]
    forbidden_patterns = [re.compile(str(x)) for x in privacy.get("forbidden_value_patterns", [])]

    def scan(node: Any, path: str = "$") -> None:
        if isinstance(node, dict):
            for key, value in node.items():
                lowered = str(key).lower()
                if any(fragment in lowered for fragment in forbidden_fragments):
                    errors.append(f"privacy: forbidden key at {path}.{key}")
                scan(value, f"{path}.{key}")
        elif isinstance(node, list):
            for index, value in enumerate(node):
                scan(value, f"{path}[{index}]")
        elif isinstance(node, str):
            for pattern in forbidden_patterns:
                if pattern.search(node):
                    errors.append(f"privacy: forbidden value pattern at {path}")
                    break

    scan(snapshot)
    evaluations = snapshot.get("rule_evaluations")
    if evaluations is not None:
        if not isinstance(evaluations, list):
            errors.append("rule_evaluations must be an array")
        else:
            triggered_recommendations = [x for x in evaluations if isinstance(x, dict) and x.get("triggered") and x.get("recommendation")]
            maximum = int(nested(policy, "decision_policy", "max_daily_recommendations", default=1))
            if len(triggered_recommendations) > maximum:
                errors.append(f"rule_evaluations exceeds max recommendations ({maximum})")
    return errors


def prior_snapshot(current_path: Path) -> dict[str, Any] | None:
    candidates: list[tuple[str, Path]] = []
    for path in current_path.parent.glob("*.json"):
        if path == current_path:
            continue
        try:
            data = load_json(path)
            date = str(data.get("date_ct", ""))
            if date < str(load_json(current_path).get("date_ct", "")):
                candidates.append((date, path))
        except (OSError, ValueError, json.JSONDecodeError):
            continue
    if not candidates:
        return None
    return load_json(sorted(candidates)[-1][1])


def evaluate(snapshot: dict[str, Any], policy: dict[str, Any], previous: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    p = policy["decision_policy"]
    rules: list[dict[str, Any]] = []

    blocked = [s for s in REQUIRED_SOURCES if nested(snapshot, s, "source_status") != "verified"]
    if "ghl" not in blocked and not cumulative_crm_verified(snapshot):
        blocked.append("ghl")
    source_recommendation = None
    source_evidence = "Required sources not verified: " + ", ".join(blocked) if blocked else "Meta, GA4, and HighLevel are verified."
    if blocked:
        first = blocked[0]
        body = snapshot.get(first, {})
        reason = str(body.get("coverage_reason") or body.get("reason") or body.get("receipt_note") or "")
        auth_failure = bool(re.search(r"\b(?:auth|authentication|unauthorized)\b|HTTP (?:401|403)|expired token|missing credential", reason, re.I))
        if first == "ghl" and not auth_failure:
            source_evidence += ". " + (reason or "CRM coverage has not been certified; connector failure is not established.")
            coverage = nested(body, "launch_to_date", "coverage", default=body.get("coverage", {})) or {}
            source_recommendation = ("Reconcile the historical CRM snapshot against retained submission receipts before cumulative optimization decisions; keep healthy integrations connected."
                                     if coverage.get("collection_verified") is True else
                                     "Repair the CRM collector and reconcile historical coverage before cumulative optimization decisions; do not reconnect healthy integrations.")
        else:
            source_recommendation = f"Restore the read-only {first} connector before optimization decisions."
    rules.append({
        "rule": "source_health",
        "triggered": bool(blocked),
        "priority": 100,
        "evidence": source_evidence,
        "recommendation": source_recommendation,
    })

    ghl_submissions = integer(nested(snapshot, "ghl", "yesterday", "accepted_website_submissions", default=nested(snapshot, "ghl", "accepted_website_submissions")))
    reconciliation = nested(snapshot, "reconciliation", "yesterday", default=nested(snapshot, "reconciliation", default={})) or {}
    meta_leads = integer(reconciliation.get("meta_leads"))
    ga4_all_source_leads = integer(reconciliation.get("ga4_all_source_generate_lead"))
    ga4_exact_campaign_leads = integer(reconciliation.get("ga4_exact_campaign_generate_lead"))
    analytics_eligible_submissions = integer(reconciliation.get("ghl_analytics_eligible_submissions"))
    analytics_denied_submissions = integer(reconciliation.get("ghl_analytics_denied_submissions"))
    campaign_attributed_submissions = integer(reconciliation.get("ghl_exact_campaign_attributed_submissions"))
    discrepancies: list[str] = []
    minimum = int(p["minimum_discrepancy_submissions"])
    absolute = int(p["discrepancy_absolute_count"])
    relative = float(p["discrepancy_relative_fraction"])
    comparable_cohorts: list[tuple[str, int | None, int | None]] = []
    if ga4_all_source_leads is not None:
        expected = analytics_eligible_submissions if analytics_eligible_submissions is not None else ghl_submissions
        expected_label = "analytics-eligible CRM" if analytics_eligible_submissions is not None else "all CRM submissions"
        comparable_cohorts.append((f"GA4 all-source vs {expected_label}", expected, ga4_all_source_leads))
    if campaign_attributed_submissions is not None and ga4_exact_campaign_leads is not None:
        comparable_cohorts.append(("GA4 exact-campaign vs campaign-attributed CRM", campaign_attributed_submissions, ga4_exact_campaign_leads))
    for label, expected, observed in comparable_cohorts:
        if expected is not None and observed is not None and expected >= minimum:
            delta = abs(expected - observed)
            if delta >= absolute and delta / max(expected, 1) >= relative:
                discrepancies.append(f"{label}: GA4={observed}, CRM={expected}")
    second_query = nested(snapshot, "reconciliation", "verified_second_queries", default=[])
    discrepancy_triggered = bool(discrepancies) and (not p["require_second_query_for_discrepancy"] or bool(second_query))
    rules.append({
        "rule": "receipt_discrepancy",
        "triggered": discrepancy_triggered,
        "priority": 90,
        "evidence": "; ".join(discrepancies) if discrepancies else (
            "No material comparable-cohort receipt discrepancy cleared the evidence gate. "
            f"CRM total={ghl_submissions}; analytics-eligible CRM={analytics_eligible_submissions}; "
            f"consent-denied CRM={analytics_denied_submissions}; GA4 all-source={ga4_all_source_leads}; "
            f"campaign-attributed CRM={campaign_attributed_submissions}; GA4 exact-campaign={ga4_exact_campaign_leads}; "
            f"Meta attributed={meta_leads} (diagnostic only)."
        ),
        "recommendation": "Run a read-only conversion-receipt audit before any scaling decision." if discrepancy_triggered else None,
    })

    spend = number(nested(snapshot, "meta", "yesterday", "spend"))
    crm_outcomes = ghl_submissions
    target_cac = number(p.get("target_qualified_cac_usd"))
    leak_gate = None if target_cac is None else target_cac * float(p["leak_spend_multiple_of_target_cac"])
    leak = spend is not None and crm_outcomes == 0 and leak_gate is not None and spend >= leak_gate
    rules.append({
        "rule": "budget_leak",
        "triggered": leak,
        "priority": 80,
        "evidence": (f"Yesterday spend=${spend:.2f}; accepted CRM submissions={crm_outcomes}; gate=${leak_gate:.2f}." if spend is not None and leak_gate is not None else "Qualified CAC target is not configured; leak rule is held inactive."),
        "recommendation": "Investigate the paid funnel leak before allowing more budget." if leak else None,
    })

    anomaly_evidence: list[str] = []
    if previous:
        current_sessions = number(nested(snapshot, "ga4", "yesterday", "sessions"))
        old_sessions = number(nested(previous, "ga4", "yesterday", "sessions"))
        current_ctr = number(nested(snapshot, "meta", "yesterday", "link_ctr"))
        old_ctr = number(nested(previous, "meta", "yesterday", "link_ctr"))
        threshold = float(p["anomaly_relative_change_fraction"])
        if current_sessions is not None and old_sessions and max(current_sessions, old_sessions) >= float(p["anomaly_min_sessions"]):
            change = (current_sessions - old_sessions) / old_sessions
            if change <= -threshold:
                anomaly_evidence.append(f"sessions declined {abs(change):.0%}")
        if current_ctr is not None and old_ctr:
            change = (current_ctr - old_ctr) / old_ctr
            if change <= -threshold:
                anomaly_evidence.append(f"link CTR declined {abs(change):.0%}")
    rules.append({
        "rule": "anomaly",
        "triggered": bool(anomaly_evidence),
        "priority": 70,
        "evidence": "; ".join(anomaly_evidence) if anomaly_evidence else "No comparable metric cleared the anomaly gate.",
        "recommendation": "Review the traffic and delivery anomaly before changing spend." if anomaly_evidence else None,
    })

    frequency = number(nested(snapshot, "meta", "launch_to_date", "frequency"))
    current_ctr = number(nested(snapshot, "meta", "yesterday", "link_ctr"))
    baseline_ctr = number(nested(previous or {}, "meta", "yesterday", "link_ctr"))
    ctr_decline = None if current_ctr is None or not baseline_ctr else (baseline_ctr - current_ctr) / baseline_ctr
    fatigue = bool(frequency is not None and frequency >= float(p["fatigue_min_frequency"]) and ctr_decline is not None and ctr_decline >= float(p["fatigue_ctr_decline_fraction"]))
    rules.append({
        "rule": "creative_fatigue",
        "triggered": fatigue,
        "priority": 60,
        "evidence": f"Cumulative frequency={frequency}; comparable CTR decline={ctr_decline:.0%}." if frequency is not None and ctr_decline is not None else "Frequency/CTR comparison is below gate or unavailable.",
        "recommendation": "Prepare a creative refresh recommendation; do not pause or publish automatically." if fatigue else None,
    })

    ads = nested(snapshot, "meta", "per_ad", default=[])
    candidates: list[str] = []
    eligible_spenders = 0
    if isinstance(ads, list):
        for ad in ads:
            if not isinstance(ad, dict):
                continue
            ad_spend = number(ad.get("spend")) or 0
            leads = integer(ad.get("leads")) or 0
            cpl = number(ad.get("cpl"))
            if target_cac is not None and ad_spend >= target_cac * 0.5:
                eligible_spenders += 1
            if target_cac is not None and leads >= int(p["candidate_min_leads"]) and cpl is not None and cpl <= target_cac:
                candidates.append(str(ad.get("ad", ad.get("ad_name", "unknown ad"))))
    winners = []
    if eligible_spenders >= 2 and isinstance(ads, list):
        for ad in ads:
            if isinstance(ad, dict) and (integer(ad.get("leads")) or 0) >= int(p["winner_min_leads"]):
                cpl = number(ad.get("cpl"))
                if target_cac is not None and cpl is not None and cpl <= target_cac * float(p["winner_max_cac_multiple"]):
                    winners.append(str(ad.get("ad", ad.get("ad_name", "unknown ad"))))
    winner = winners[0] if len(winners) == 1 else None
    rules.append({
        "rule": "test_scoreboard",
        "triggered": bool(winner),
        "priority": 50,
        "evidence": f"Candidates={candidates or 'none'}; winner-eligible={winners or 'none'}; ads with meaningful spend={eligible_spenders}.",
        "recommendation": f"Prepare an approval-gated scale plan for {winner}; make no change yet." if winner else None,
    })

    rules.append({
        "rule": "collecting_data",
        "triggered": not any(r["triggered"] for r in rules),
        "priority": 0,
        "evidence": "No higher-priority rule cleared its evidence gate.",
        "recommendation": "No change; collecting data.",
    })
    return rules


def select_recommendation(rules: list[dict[str, Any]]) -> str:
    triggered = [r for r in rules if r.get("triggered") and r.get("recommendation")]
    if not triggered:
        return "No change; collecting data."
    return str(max(triggered, key=lambda row: int(row["priority"]))["recommendation"])


def cumulative_crm_verified(snapshot: dict[str, Any]) -> bool:
    if nested(snapshot, "ghl", "source_status") != "verified":
        return False
    coverage = nested(snapshot, "ghl", "launch_to_date", "coverage", default=nested(snapshot, "ghl", "coverage"))
    if coverage is not None:
        return isinstance(coverage, dict) and coverage.get("collection_verified") is True and coverage.get("history_reconciled") is True
    # Legacy stored snapshots retain their original interpretation; methodology
    # v2 collectors may not omit their coverage receipt to bypass this gate.
    return nested(snapshot, "ghl", "methodology_version", default=1) < 2


def compute_economics(snapshot: dict[str, Any], policy: dict[str, Any]) -> dict[str, Any]:
    spend = number(nested(snapshot, "meta", "launch_to_date", "spend"))
    submissions = integer(nested(snapshot, "ghl", "launch_to_date", "accepted_website_submissions"))
    accepted_leads = integer(nested(snapshot, "ghl", "launch_to_date", "accepted_website_leads"))
    visits = integer(nested(snapshot, "ghl", "launch_to_date", "scheduled_visits"))
    coverage_verified = cumulative_crm_verified(snapshot)
    if not coverage_verified or nested(snapshot, "meta", "source_status") != "verified":
        submissions = accepted_leads = visits = None

    def cost(count: int | None) -> float | None:
        return None if spend is None or count is None or count <= 0 else round(spend / count, 4)

    min_submissions = int(nested(policy, "decision_policy", "economics_learning_min_submissions", default=20))
    min_visits = int(nested(policy, "decision_policy", "economics_learning_min_scheduled_visits", default=5))
    return {
        "target_qualified_cac_usd": number(nested(policy, "decision_policy", "target_qualified_cac_usd")),
        "proxy_cost_per_accepted_submission_usd": cost(submissions),
        "proxy_cost_per_accepted_lead_usd": cost(accepted_leads),
        "cost_per_scheduled_visit_usd": cost(visits),
        "target_learning_ready": bool((submissions or 0) >= min_submissions and (visits or 0) >= min_visits),
        "learning_gate": {"accepted_submissions": min_submissions, "scheduled_visits": min_visits},
        "cumulative_crm_coverage_verified": coverage_verified,
        "note": "Cumulative CRM economics withheld until retained collection and historical reconciliation are verified." if not coverage_verified else "Targets remain disabled until sufficient CRM outcome data exists; proxy costs are monitoring metrics, not approved scale gates.",
    }


def finalize(snapshot: dict[str, Any], policy: dict[str, Any], previous: dict[str, Any] | None = None) -> dict[str, Any]:
    output = copy.deepcopy(snapshot)
    output["economics"] = compute_economics(output, policy)
    rules = evaluate(output, policy, previous)
    selected = select_recommendation(rules)
    selected_row = max(
        (row for row in rules if row.get("triggered") and row.get("recommendation")),
        key=lambda row: int(row["priority"]),
        default=None,
    )
    for row in rules:
        if row is not selected_row and row.get("recommendation"):
            row["recommendation"] = None
    output["rule_evaluations"] = rules
    output["recommendation"] = selected
    if any(r["triggered"] and r["priority"] >= 100 for r in rules):
        output["status"] = "blocked"
    elif any(r["triggered"] and r["priority"] > 0 for r in rules):
        output["status"] = "warning"
    else:
        output["status"] = "healthy"
    return output


def initialize_db(connection: sqlite3.Connection) -> None:
    connection.executescript("""
    PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS snapshots (
      date_ct TEXT PRIMARY KEY,
      generated_at TEXT NOT NULL,
      status TEXT NOT NULL,
      raw_json TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS source_windows (
      date_ct TEXT NOT NULL,
      source TEXT NOT NULL,
      window_name TEXT NOT NULL,
      metrics_json TEXT NOT NULL,
      PRIMARY KEY (date_ct, source, window_name)
    );
    CREATE TABLE IF NOT EXISTS ad_metrics (
      date_ct TEXT NOT NULL,
      ad_name TEXT NOT NULL,
      spend REAL,
      impressions INTEGER,
      landing_page_views INTEGER,
      leads INTEGER,
      cpl REAL,
      PRIMARY KEY (date_ct, ad_name)
    );
    CREATE TABLE IF NOT EXISTS rule_evaluations (
      date_ct TEXT NOT NULL,
      rule TEXT NOT NULL,
      triggered INTEGER NOT NULL,
      priority INTEGER NOT NULL,
      evidence TEXT NOT NULL,
      recommendation TEXT,
      PRIMARY KEY (date_ct, rule)
    );
    """)


def ingest(snapshot: dict[str, Any], db_path: Path) -> None:
    with sqlite3.connect(db_path) as connection:
        initialize_db(connection)
        date = str(snapshot["date_ct"])
        connection.execute(
            "INSERT OR REPLACE INTO snapshots VALUES (?, ?, ?, ?)",
            (date, snapshot["generated_at"], snapshot["status"], json.dumps(snapshot, sort_keys=True)),
        )
        connection.execute("DELETE FROM source_windows WHERE date_ct=?", (date,))
        connection.execute("DELETE FROM ad_metrics WHERE date_ct=?", (date,))
        connection.execute("DELETE FROM rule_evaluations WHERE date_ct=?", (date,))
        for source in ("meta", "ga4", "gsc", "ghl", "reconciliation"):
            body = snapshot.get(source, {})
            if not isinstance(body, dict):
                continue
            for window in ("yesterday", "launch_to_date", "window", "totals"):
                metrics = body.get(window)
                if isinstance(metrics, dict):
                    connection.execute(
                        "INSERT INTO source_windows VALUES (?, ?, ?, ?)",
                        (date, source, window, json.dumps(metrics, sort_keys=True)),
                    )
        for ad in nested(snapshot, "meta", "per_ad", default=[]):
            if isinstance(ad, dict):
                connection.execute(
                    "INSERT INTO ad_metrics VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (date, str(ad.get("ad", ad.get("ad_name", "unknown"))), number(ad.get("spend")), integer(ad.get("impressions")), integer(ad.get("landing_page_views")), integer(ad.get("leads")), number(ad.get("cpl"))),
                )
        for row in snapshot.get("rule_evaluations", []):
            connection.execute(
                "INSERT INTO rule_evaluations VALUES (?, ?, ?, ?, ?, ?)",
                (date, row["rule"], int(bool(row["triggered"])), int(row["priority"]), row["evidence"], row.get("recommendation")),
            )


def display(value: Any, *, money: bool = False, percent: bool = False) -> str:
    parsed = number(value)
    if parsed is None:
        return "unavailable"
    if money:
        return f"${parsed:,.2f}"
    if percent:
        return f"{parsed:.1f}%"
    return f"{int(parsed):,}" if parsed.is_integer() else f"{parsed:,.2f}"


def render(snapshot: dict[str, Any]) -> str:
    meta = nested(snapshot, "meta", "yesterday", default={})
    ga4 = nested(snapshot, "ga4", "yesterday", default={})
    ghl = nested(snapshot, "ghl", "yesterday", default={})
    recon = nested(snapshot, "reconciliation", "yesterday", default=snapshot.get("reconciliation", {}))
    sources = ", ".join(f"{s.upper()} {nested(snapshot, s, 'source_status', default='unavailable')}" for s in ("meta", "ga4", "ghl", "gsc"))
    return "\n".join([
        f"📊 **Joao Marketing Control Plane — {snapshot['date_ct']}**",
        f"• Status: **{str(snapshot['status']).upper()}**",
        f"• Sources: {sources}",
        "",
        "**Completed-day funnel**",
        f"• Meta: {display(meta.get('spend'), money=True)} spend | {display(meta.get('landing_page_views'))} LPVs | {display(meta.get('leads'))} attributed leads | {display(meta.get('cpl'), money=True)} CPL",
        f"• GA4: {display(ga4.get('sessions'))} sessions | {display(ga4.get('engagement_rate') * 100 if number(ga4.get('engagement_rate')) is not None else None, percent=True)} engaged | {display(recon.get('ga4_all_source_generate_lead'))} all-source leads | {display(recon.get('ga4_exact_campaign_generate_lead'))} exact-campaign",
        f"• GHL: {display(ghl.get('accepted_website_submissions'))} accepted submissions | {display(ghl.get('scheduled_visits'))} scheduled visits",
        f"• Comparable receipts: eligible CRM {display(recon.get('ghl_analytics_eligible_submissions'))} ↔ GA4 all-source {display(recon.get('ga4_all_source_generate_lead'))} | campaign CRM {display(recon.get('ghl_exact_campaign_attributed_submissions'))} ↔ GA4 exact {display(recon.get('ga4_exact_campaign_generate_lead'))}",
        f"• Attribution diagnostic: Meta {display(recon.get('meta_leads'))} | total CRM {display(recon.get('ghl_accepted_website_submissions'))} | consent-denied CRM {display(recon.get('ghl_analytics_denied_submissions'))}",
        f"• Learning metric: {display(nested(snapshot, 'economics', 'proxy_cost_per_accepted_submission_usd'), money=True)} per accepted submission | qualified-CAC target pending",
        "",
        f"🎯 **One action:** {snapshot['recommendation']}",
        "🔒 Read-only. No campaign, budget, creative, CRM, analytics, or website changes were made.",
    ])


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=("validate", "analyze", "finalize", "ingest", "render", "history"))
    parser.add_argument("snapshot", nargs="?", type=Path)
    parser.add_argument("--policy", type=Path, default=DEFAULT_POLICY)
    parser.add_argument("--previous", type=Path)
    parser.add_argument("--db", type=Path, default=DEFAULT_DB)
    args = parser.parse_args()
    policy = load_json(args.policy)

    if args.command == "history":
        with sqlite3.connect(args.db) as connection:
            initialize_db(connection)
            rows = connection.execute("SELECT date_ct, status, generated_at FROM snapshots ORDER BY date_ct").fetchall()
        print(json.dumps([{"date_ct": d, "status": s, "generated_at": g} for d, s, g in rows], indent=2))
        return 0
    if args.snapshot is None:
        parser.error("snapshot path is required")
    snapshot = load_json(args.snapshot)
    previous = load_json(args.previous) if args.previous else prior_snapshot(args.snapshot)

    if args.command == "validate":
        errors = validate_snapshot(snapshot, policy)
        if errors:
            print("INVALID\n- " + "\n- ".join(errors), file=sys.stderr)
            return 1
        print("VALID")
        return 0
    if args.command == "analyze":
        print(json.dumps(evaluate(snapshot, policy, previous), indent=2))
        return 0
    if args.command == "finalize":
        output = finalize(snapshot, policy, previous)
        errors = validate_snapshot(output, policy)
        if errors:
            print("INVALID\n- " + "\n- ".join(errors), file=sys.stderr)
            return 1
        args.snapshot.write_text(json.dumps(output, indent=2) + "\n", encoding="utf-8")
        print(output["recommendation"])
        return 0
    if args.command == "ingest":
        errors = validate_snapshot(snapshot, policy)
        if errors:
            print("INVALID\n- " + "\n- ".join(errors), file=sys.stderr)
            return 1
        ingest(snapshot, args.db)
        print(f"INGESTED {snapshot['date_ct']}")
        return 0
    if args.command == "render":
        errors = validate_snapshot(snapshot, policy)
        if errors:
            print("INVALID\n- " + "\n- ".join(errors), file=sys.stderr)
            return 1
        print(render(snapshot))
        return 0
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
