"""Recorded live acceptance and fail-closed mutation regression for AY09 copy revision."""
import copy
import json
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import update_austin_youth_combined_copy as update
from austin_youth_combined_copy import PRIMARY_TEXT, HEADLINE
PACK = ROOT / 'assets/meta/castle-hill/youth-wave-2/comparisons'


class CombinedCopyTests(unittest.TestCase):
    def setUp(self):
        self.audit = json.loads((PACK / 'meta-audit.json').read_text())
        self.revision = self.audit['combined_copy_revision']

    def test_exact_approved_source_and_build_contract(self):
        copies = json.loads((PACK / 'approved-copy.json').read_text())
        self.assertEqual(HEADLINE, 'You Don’t Have to Feel Ready')
        self.assertEqual(len(PRIMARY_TEXT.split('\n\n')), 5)
        for c in copies[1:]:
            self.assertEqual(c['primary_text'], PRIMARY_TEXT)
            self.assertEqual(c['headline'], HEADLINE)
        manifest = json.loads((PACK / 'manifest.json').read_text())['combined_copy_revision']
        self.assertEqual(manifest['primary_text'], PRIMARY_TEXT)
        self.assertEqual(manifest['headline'], HEADLINE)
        build = (ROOT / 'scripts/build_austin_youth_comparisons.py').read_text()
        self.assertIn("old['primary_text']=PRIMARY_TEXT", build)
        self.assertIn("old['headline']=HEADLINE", build)

    def test_complete_live_revision_and_protected_objects(self):
        c = self.revision
        self.assertTrue(c['verified'])
        self.assertEqual(set(c['records']), set(update.TARGETS))
        self.assertEqual(c['parents_before'], c['parents_after'])
        self.assertEqual(c['protected_before'], c['protected_after'])
        self.assertEqual(c['protected_creatives_before'], c['protected_creatives_after'])
        self.assertEqual(c['parents_after']['campaign']['daily_budget'], '3500')
        for name, ids in update.TARGETS.items():
            r = c['records'][name]
            self.assertTrue(r['verified'])
            self.assertEqual(r['superseded_creative_id'], ids[1])
            self.assertEqual(r['ad_after']['id'], ids[0])
            self.assertEqual(r['ad_after']['creative']['id'], r['replacement_creative_id'])
            self.assertEqual(r['ad_after']['status'], 'PAUSED')
            self.assertEqual(r['ad_after']['effective_status'], 'PAUSED')
            update.assert_copy_only(r['creative_before'], r['creative_readback'], r.get('video_copy_equivalence', {}))
            self.assertEqual(update.assert_ad_preserved(r['ad_before'], r['ad_after']), r['generated_post_mapping'])
            # Copy-only revision is historical after the approved artwork revision.
            self.assertEqual(self.audit.get('artwork_revision', {}).get('records', {}).get(name, {}).get('before', self.audit['records'][name])['creative_id'], r['replacement_creative_id'])

    def test_video_remap_proof_is_strict(self):
        r = self.revision['records']['AY09A_BEGINNERS-WELCOME_LONG-VIDEO']
        self.assertEqual(set(r['video_copy_equivalence']), {'vertical', 'feed'})
        for label, p in r['video_copy_equivalence'].items():
            self.assertTrue(p['ready'])
            self.assertTrue(p['durations_identical'])
            self.assertEqual(p['duration_seconds'], 26.866)
            a, b = p['thumbnails']
            self.assertEqual((a['width'], a['height']), (720, 1280 if label == 'vertical' else 900))
            self.assertEqual((a['width'], a['height']), (b['width'], b['height']))
            self.assertEqual(a['decoded_rgb_sha256'], b['decoded_rgb_sha256'])
            self.assertEqual(p['thumbnail_mean_absolute_difference_0_255'], 0)
            self.assertIn('Full remote-video byte equivalence is not claimed', p['proof'])
            bad = copy.deepcopy(r['video_copy_equivalence'])
            bad[label]['decoded_thumbnails_identical'] = False
            with self.assertRaises(AssertionError):
                update.assert_copy_only(r['creative_before'], r['creative_readback'], bad)

    def test_non_copy_changes_fail_closed(self):
        r = self.revision['records']['AY09B_BEGINNERS-WELCOME_STATIC']
        edits = [
            lambda c: c['asset_feed_spec']['descriptions'][0].update(text='changed'),
            lambda c: c['asset_feed_spec']['link_urls'][0].update(website_url='https://example.com'),
            lambda c: c['asset_feed_spec'].update(call_to_action_types=['SIGN_UP']),
            lambda c: c['asset_feed_spec']['images'][0].update(hash='changed'),
            lambda c: c['asset_feed_spec']['asset_customization_rules'][0].update(priority=3),
            lambda c: c['object_story_spec'].update(page_id='123'),
            lambda c: next(iter(c['degrees_of_freedom_spec']['creative_features_spec'].values())).update(enroll_status='OPT_IN'),
            lambda c: c['asset_feed_spec']['titles'][0].update(text="You Don't Have to Feel Ready"),
        ]
        for edit in edits:
            after = copy.deepcopy(r['creative_readback']); edit(after)
            with self.assertRaises(AssertionError):
                update.assert_copy_only(r['creative_before'], after, {})
        for field in ['name', 'adset_id', 'campaign_id', 'status']:
            after = copy.deepcopy(r['ad_after']); after[field] = 'changed'
            with self.assertRaises(AssertionError):
                update.assert_ad_preserved(r['ad_before'], after)
        after = copy.deepcopy(r['ad_after'])
        after['tracking_specs'][0]['action.type'] = ['changed']
        with self.assertRaises(AssertionError):
            update.assert_ad_preserved(r['ad_before'], after)


if __name__ == '__main__':
    unittest.main()
