"""AY09 positive validation and fail-closed mutation regressions."""
import copy
import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from validate_austin_youth_video import PACK, load, validate_assets, validate_meta


class YouthVideoPack(unittest.TestCase):
    def test_assets(self):
        validate_assets()

    def test_exact_meta(self):
        validate_meta(load(PACK / 'meta-audit.json'), load(PACK / 'approved-copy.json'))

    def test_contract_rejects_mutations(self):
        original = load(PACK / 'meta-audit.json')
        approved = load(PACK / 'approved-copy.json')
        cases = [
            ('processing', ['ad_readback', 'effective_status'], 'IN_PROCESS'),
            ('review', ['ad_readback', 'effective_status'], 'PENDING_REVIEW'),
            ('active', ['ad_readback', 'status'], 'ACTIVE'),
            ('wrong_account', ['ad_readback', 'account_id'], '1'),
            ('wrong_parent', ['ad_readback', 'adset_id'], '1'),
            ('wrong_identity', ['creative_readback', 'object_story_spec', 'page_id'], '1'),
            ('wrong_video', ['creative_readback', 'asset_feed_spec', 'videos', 0, 'video_id'], '1'),
            ('swapped_route', ['creative_readback', 'asset_feed_spec', 'asset_customization_rules', 0, 'video_label', 'name'], 'feed'),
            ('wrong_copy', ['creative_readback', 'asset_feed_spec', 'bodies', 0, 'text'], 'Changed'),
            ('instant_form', ['creative_readback', 'lead_gen_form_id'], '1'),
            ('enhancement', ['creative_readback', 'degrees_of_freedom_spec', 'creative_features_spec', 'video_auto_crop', 'enroll_status'], 'OPT_IN'),
            ('missing_optouts', ['creative_readback', 'degrees_of_freedom_spec', 'creative_features_spec'], {}),
            ('budget_changed', ['parents_readback', 'campaign', 'daily_budget'], '1000'),
            ('pixel_missing', ['ad_readback', 'tracking_specs'], []),
            ('wrong_cta', ['creative_readback', 'asset_feed_spec', 'call_to_action_types'], ['SIGN_UP']),
        ]
        for label, keys, value in cases:
            with self.subTest(label=label):
                changed = copy.deepcopy(original)
                target = changed
                for key in keys[:-1]:
                    target = target[key]
                target[keys[-1]] = value
                with self.assertRaises(AssertionError):
                    validate_meta(changed, approved)


if __name__ == '__main__':
    unittest.main()
