"""Retry proposal generation has no scheduler or provider side effects."""
import importlib.util
import io
from pathlib import Path
import sys
import unittest
from unittest.mock import patch
from contextlib import redirect_stdout

spec = importlib.util.spec_from_file_location('cron_proposal', Path(__file__).parents[1] / 'scripts/prepare_meta_retry_cron.py')
assert spec is not None and spec.loader is not None
proposal = importlib.util.module_from_spec(spec)
spec.loader.exec_module(proposal)


class RetryProposalTest(unittest.TestCase):
    def test_disabled_deterministic_output(self):
        argv = ['proposal', '--php', '/usr/bin/php', '--env-file', '/home/owner/.joao-secure/lead.env', '--worker', '/home/owner/site/api/meta-capi-retry.php', '--lock-file', '/home/owner/.joao-secure/retry.lock']
        results = []
        for _ in range(2):
            output = io.StringIO()
            with patch.object(sys, 'argv', argv), redirect_stdout(output):
                proposal.main()
            results.append(output.getvalue())
        self.assertEqual(*results)
        self.assertTrue(all(line.startswith('#') for line in results[0].splitlines()))
        self.assertIn('flock -n', results[0])
        self.assertIn('GHL_ENV_FILE=', results[0])

    def test_invalid_cron_paths_fail(self):
        for value in ['relative', '/home/../private', '/path%date', '/path\ncommand']:
            with self.assertRaises(Exception):
                proposal.absolute(value)
