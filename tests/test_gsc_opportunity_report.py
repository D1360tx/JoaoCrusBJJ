#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import io
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("gsc_report", ROOT / "scripts" / "gsc_opportunity_report.py")
assert SPEC and SPEC.loader
mod = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(mod)


class GscOpportunityReportTests(unittest.TestCase):
    def test_variant_normalization(self) -> None:
        self.assertEqual(mod.normalize_query("João Cruz Jiu-Jitsu"), "joao crus bjj")
        self.assertEqual(mod.normalize_query("Joao Crus BJJ"), "joao crus bjj")

    def test_position_window_and_weighted_aggregation(self) -> None:
        rows = [
            {"query": "jiu jitsu near me", "page": "/", "clicks": 1, "impressions": 8, "ctr": 0, "position": 5},
            {"query": "jiu-jitsu near me", "page": "/", "clicks": 0, "impressions": 2, "ctr": 0, "position": 10},
            {"query": "outside", "page": "/", "clicks": 0, "impressions": 99, "ctr": 0, "position": 21},
        ]
        result = mod.aggregate(rows)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["group"], "bjj near me")
        self.assertEqual(result[0]["impressions"], 10)
        self.assertEqual(result[0]["position"], 6)

    def test_script_never_has_publish_side_effects(self) -> None:
        source = (ROOT / "scripts" / "gsc_opportunity_report.py").read_text()
        for forbidden in ("git push", "gh pr merge", "searchconsole.sites.add", "indexing.googleapis.com"):
            self.assertNotIn(forbidden, source)

    def test_quota_project_header_is_explicit_only(self) -> None:
        with mock.patch.object(mod.urllib.request, "urlopen") as urlopen:
            urlopen.return_value.__enter__.return_value = io.StringIO('{"rows": []}')
            with mock.patch.dict(os.environ, {}, clear=True):
                mod.fetch_api("sc-domain:example.com", "2026-08-01", "2026-08-02", "token")
            request = urlopen.call_args.args[0]
            self.assertNotIn("X-goog-user-project", request.headers)

            with mock.patch.dict(os.environ, {"GSC_QUOTA_PROJECT": "quota-project"}, clear=True):
                urlopen.return_value.__enter__.return_value = io.StringIO('{"rows": []}')
                mod.fetch_api("sc-domain:example.com", "2026-08-01", "2026-08-02", "token")
            request = urlopen.call_args.args[0]
            self.assertEqual(request.headers["X-goog-user-project"], "quota-project")

    def test_fixture_report_decisions(self) -> None:
        rows = [
            {"query": "learn life skills 78620", "page": "https://joaocrusbjj.com/", "clicks": 0, "impressions": 2, "ctr": 0, "position": 11},
            {"query": "mma near me", "page": "https://joaocrusbjj.com/", "clicks": 0, "impressions": 4, "ctr": 0, "position": 13},
        ]
        text = mod.report(rows, "2026-08-01", "2026-08-09", "fixture")
        self.assertIn("**OPTIMIZE** | learn life skills 78620", text)
        self.assertIn("**IGNORE** | mma near me", text)
        self.assertIn("This script never publishes automatically", text)


if __name__ == "__main__":
    unittest.main()
