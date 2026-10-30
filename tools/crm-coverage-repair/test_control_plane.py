import json
import sqlite3
import tempfile
import unittest
from pathlib import Path

import control_plane as cp


class ControlPlaneTests(unittest.TestCase):
    def setUp(self):
        self.policy = cp.load_json(Path(__file__).with_name("policy.json"))
        self.policy["decision_policy"]["target_qualified_cac_usd"] = 30.0
        self.snapshot = {
            "date_ct": "2026-09-04",
            "generated_at": "2026-09-04T09:00:00-05:00",
            "status": "healthy",
            "meta": {
                "source_status": "verified",
                "yesterday": {"spend": 20, "landing_page_views": 12, "leads": 1, "cpl": 20, "link_ctr": 1.5},
                "launch_to_date": {"frequency": 2.0},
                "per_ad": [],
            },
            "ga4": {"source_status": "verified", "yesterday": {"sessions": 20, "engagement_rate": 0.5, "generate_lead": 1}},
            "gsc": {"source_status": "not_queried_not_due"},
            "ghl": {"source_status": "verified", "yesterday": {"accepted_website_submissions": 1, "scheduled_visits": 0}},
            "reconciliation": {"yesterday": {"meta_leads": 1, "ga4_all_source_generate_lead": 1, "ga4_exact_campaign_generate_lead": 1, "ghl_accepted_website_submissions": 1, "ghl_analytics_eligible_submissions": 1, "ghl_analytics_denied_submissions": 0, "ghl_exact_campaign_attributed_submissions": 1}},
            "recommendation": "No change; collecting data.",
        }

    def finalized(self, snapshot=None, previous=None):
        return cp.finalize(snapshot or self.snapshot, self.policy, previous)

    def test_valid_zero_is_not_unavailable(self):
        snap = json.loads(json.dumps(self.snapshot))
        snap["meta"]["yesterday"]["leads"] = 0
        snap["ghl"]["yesterday"]["accepted_website_submissions"] = 0
        final = self.finalized(snap)
        self.assertEqual([], cp.validate_snapshot(final, self.policy))
        self.assertIn("0 attributed leads", cp.render(final))

    def test_blocked_source_has_highest_priority(self):
        snap = json.loads(json.dumps(self.snapshot))
        snap["ghl"] = {"source_status": "blocked", "reason": "auth"}
        final = self.finalized(snap)
        self.assertEqual("blocked", final["status"])
        self.assertIn("Restore the read-only ghl connector", final["recommendation"])

    def test_receipt_discrepancy_requires_second_query(self):
        snap = json.loads(json.dumps(self.snapshot))
        snap["ghl"]["yesterday"]["accepted_website_submissions"] = 7
        snap["reconciliation"]["yesterday"] = {"meta_leads": 5, "ga4_all_source_generate_lead": 1, "ga4_exact_campaign_generate_lead": 1, "ghl_accepted_website_submissions": 7, "ghl_analytics_eligible_submissions": 7, "ghl_analytics_denied_submissions": 0, "ghl_exact_campaign_attributed_submissions": 5}
        self.assertEqual("No change; collecting data.", self.finalized(snap)["recommendation"])
        snap["reconciliation"]["verified_second_queries"] = ["bounded GA4 confirmation"]
        self.assertIn("conversion-receipt audit", self.finalized(snap)["recommendation"])

    def test_consent_aware_cohorts_reconcile_september_fifth(self):
        snap = json.loads(json.dumps(self.snapshot))
        snap["ghl"]["yesterday"]["accepted_website_submissions"] = 3
        snap["reconciliation"]["yesterday"] = {"meta_leads": 2, "ga4_all_source_generate_lead": 2, "ga4_exact_campaign_generate_lead": 1, "ghl_accepted_website_submissions": 3, "ghl_analytics_eligible_submissions": 2, "ghl_analytics_denied_submissions": 1, "ghl_exact_campaign_attributed_submissions": 1}
        final = self.finalized(snap)
        receipt = next(row for row in final["rule_evaluations"] if row["rule"] == "receipt_discrepancy")
        self.assertFalse(receipt["triggered"])
        self.assertIn("GA4 all-source=2", receipt["evidence"])
        self.assertIn("Meta attributed=2 (diagnostic only)", receipt["evidence"])
        rendered = cp.render(final)
        self.assertIn("eligible CRM 2 ↔ GA4 all-source 2", rendered)

    def test_meta_attribution_is_not_used_as_receipt_denominator(self):
        snap = json.loads(json.dumps(self.snapshot))
        snap["ghl"]["yesterday"]["accepted_website_submissions"] = 8
        snap["reconciliation"]["yesterday"].update({"meta_leads": 0, "ga4_all_source_generate_lead": 8, "ghl_analytics_eligible_submissions": 8})
        snap["reconciliation"]["verified_second_queries"] = ["bounded confirmation"]
        receipt = next(row for row in self.finalized(snap)["rule_evaluations"] if row["rule"] == "receipt_discrepancy")
        self.assertFalse(receipt["triggered"])

    def test_budget_leak(self):
        snap = json.loads(json.dumps(self.snapshot))
        snap["meta"]["yesterday"]["spend"] = 50
        snap["ghl"]["yesterday"]["accepted_website_submissions"] = 0
        snap["reconciliation"]["yesterday"] = {"meta_leads": 0, "ga4_exact_campaign_generate_lead": 0, "ghl_accepted_website_submissions": 0}
        self.assertIn("paid funnel leak", self.finalized(snap)["recommendation"])

    def test_fatigue(self):
        current = json.loads(json.dumps(self.snapshot))
        previous = json.loads(json.dumps(self.snapshot))
        current["meta"]["launch_to_date"]["frequency"] = 3.2
        current["meta"]["yesterday"]["link_ctr"] = 0.9
        previous["meta"]["yesterday"]["link_ctr"] = 1.5
        self.assertIn("creative refresh", self.finalized(current, previous)["recommendation"])

    def test_scoreboard_does_not_call_winner_without_comparator_spend(self):
        snap = json.loads(json.dumps(self.snapshot))
        snap["meta"]["per_ad"] = [
            {"ad": "A", "spend": 200, "leads": 8, "cpl": 25},
            {"ad": "B", "spend": 3, "leads": 0, "cpl": None},
        ]
        self.assertEqual("No change; collecting data.", self.finalized(snap)["recommendation"])

    def test_scoreboard_can_prepare_approval_plan(self):
        snap = json.loads(json.dumps(self.snapshot))
        snap["meta"]["per_ad"] = [
            {"ad": "A", "spend": 200, "leads": 8, "cpl": 25},
            {"ad": "B", "spend": 30, "leads": 0, "cpl": None},
        ]
        self.assertIn("approval-gated scale plan for A", self.finalized(snap)["recommendation"])

    def test_pii_rejected(self):
        snap = json.loads(json.dumps(self.snapshot))
        snap["ghl"]["email"] = "person@example.com"
        errors = cp.validate_snapshot(snap, self.policy)
        self.assertTrue(any("privacy" in error for error in errors))

    def test_only_one_triggered_recommendation_is_selected(self):
        snap = json.loads(json.dumps(self.snapshot))
        snap["meta"]["yesterday"]["spend"] = 100
        snap["ghl"]["yesterday"]["accepted_website_submissions"] = 0
        final = self.finalized(snap)
        self.assertEqual(1, sum(1 for row in final["rule_evaluations"] if row["triggered"] and row["recommendation"]))

    def test_economics_learning_keeps_target_disabled(self):
        self.policy["decision_policy"]["target_qualified_cac_usd"] = None
        snap = json.loads(json.dumps(self.snapshot))
        snap["meta"]["launch_to_date"]["spend"] = 265.29
        snap["ghl"]["launch_to_date"] = {"accepted_website_submissions": 12, "accepted_website_leads": 10, "scheduled_visits": 1}
        final = self.finalized(snap)
        self.assertIsNone(final["economics"]["target_qualified_cac_usd"])
        self.assertEqual(22.1075, final["economics"]["proxy_cost_per_accepted_submission_usd"])
        self.assertFalse(final["economics"]["target_learning_ready"])

    def test_sqlite_persistence(self):
        final = self.finalized()
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "test.sqlite3"
            cp.ingest(final, path)
            with sqlite3.connect(path) as connection:
                count = connection.execute("SELECT COUNT(*) FROM snapshots").fetchone()[0]
                rules = connection.execute("SELECT COUNT(*) FROM rule_evaluations").fetchone()[0]
            self.assertEqual(1, count)
            self.assertEqual(7, rules)


if __name__ == "__main__":
    unittest.main()
