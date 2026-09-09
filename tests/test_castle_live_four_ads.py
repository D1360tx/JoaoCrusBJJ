import copy, importlib.util, json, unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('live',ROOT/'scripts/validate_castle_live_four_ads.py')
assert spec is not None and spec.loader is not None
v=importlib.util.module_from_spec(spec);spec.loader.exec_module(v)
class LiveFourAds(unittest.TestCase):
 def setUp(self):self.e=json.loads((v.E/'live-four-ad-normalization.json').read_text())
 def test_exact_snapshot(self):self.assertTrue(v.validate(self.e))
 def test_rejects_duplicate_utm(self):
  self.e['final']['creatives']['1387970049521888']['asset_feed_spec']['link_urls'][0]['website_url']+='?'+v.TAGS
  with self.assertRaises(AssertionError):v.validate(self.e)
 def test_rejects_unapproved_activation(self):
  a=next(a for a in self.e['final']['ads'] if a['id']=='120251261045730072');a.update(status='ACTIVE',effective_status='ACTIVE')
  with self.assertRaises(AssertionError):v.validate(self.e)
 def test_rejects_media_change(self):
  self.e['final']['creatives']['1571675311324124']['asset_feed_spec']['videos'][0]['video_id']='1'
  with self.assertRaises(AssertionError):v.validate(self.e)
 def test_rejects_budget_change(self):
  self.e['final']['campaign']['daily_budget']='2000'
  with self.assertRaises(AssertionError):v.validate(self.e)
 def test_rejects_form_extension(self):
  self.e['final']['creatives']['1387970049521888']['lead_gen_form_id']='1'
  with self.assertRaises(AssertionError):v.validate(self.e)
if __name__=='__main__':unittest.main()
