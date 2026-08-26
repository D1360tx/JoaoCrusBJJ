#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "gsc_github_runner", ROOT / "scripts" / "run_gsc_report_via_github.py"
)
assert SPEC and SPEC.loader
mod = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(mod)


class GscGithubRunnerTests(unittest.TestCase):
    def test_find_run_requires_exact_correlation_title(self) -> None:
        rows = [
            {"databaseId": 1, "displayTitle": "Joao GSC report old"},
            {"databaseId": 2, "displayTitle": "Joao GSC report abc123"},
        ]
        self.assertEqual(mod.find_run(rows, "abc123")["databaseId"], 2)
        self.assertIsNone(mod.find_run(rows, "abc"))

    def test_runner_contains_no_google_credentials(self) -> None:
        source = (ROOT / "scripts" / "run_gsc_report_via_github.py").read_text()
        self.assertNotIn("GSC_ACCESS_TOKEN", source)
        self.assertNotIn("application-default", source)
        self.assertNotIn("PRIVATE KEY", source)

    def test_workflow_is_dispatch_only_and_read_only(self) -> None:
        source = (ROOT / ".github" / "workflows" / "gsc-opportunity-report.yml").read_text()
        self.assertIn("workflow_dispatch:", source)
        self.assertIn("id-token: write", source)
        self.assertIn("contents: read", source)
        self.assertIn("webmasters.readonly", source)
        for forbidden in ("schedule:", "git push", "deploy", "webmasters,", "webmasters\n"):
            self.assertNotIn(forbidden, source)


if __name__ == "__main__":
    unittest.main()
