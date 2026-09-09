"""Exact source, render, final live state and narrow parent exception gates."""
import copy, hashlib, json, subprocess, sys, unittest
from pathlib import Path
from PIL import Image
R=Path(__file__).resolve().parents[1]; P=R/'assets/meta/castle-hill/youth-wave-2/comparisons'
sys.path.insert(0,str(R/'scripts'))
import update_austin_youth_artwork as u
import austin_youth_comparison_meta as m
FOOTER='ADULTS + YOUTH AGES 8–12 · CASTLE HILL FITNESS'
class ArtworkTests(unittest.TestCase):
 def setUp(self):
  self.a=json.loads((P/'meta-audit.json').read_text()); self.rev=self.a['artwork_revision']; self.man=json.loads((P/'manifest.json').read_text())
 def test_exact_photo_and_full_frame(self):
  for a in self.man['assets']:
   if not a['ad_name'].startswith('AY09B'): continue
   self.assertEqual(a['source_sha256'],'0e25957e88c7b59ed9a55fa3ef0811950293621db34319a41e0f1bf141f1ea59')
   self.assertEqual(hashlib.sha256((R/a['source']).read_bytes()).hexdigest(),a['source_sha256'])
   self.assertEqual([t['text'] for t in a['text_boxes']],['COMPLETE BEGINNERS','ARE WELCOME.',FOOTER])
   image=Image.open(R/a['source']).convert('RGB'); self.assertEqual(image.size,(1572,1179))
   b=a['photo_frame']; size=(b[2]-b[0]-8,b[3]-b[1]-8); image.thumbnail(size,Image.Resampling.LANCZOS)
   result=Image.open(R/a['path']).convert('RGB').crop((b[0]+4,b[1]+4,b[2]-4,b[3]-4))
   self.assertEqual(image.tobytes(),result.tobytes())
 def test_video_footer_and_unchanged_audio(self):
  for v in self.man['videos']:
   self.assertIn(FOOTER,(R/v['caption_file']).read_text())
   old=P/f"AY09A_BEGINNERS-WELCOME_LONG-VIDEO_{v['ratio']}.mp4"
   def audio(p): return subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-map','0:a:0','-f','s16le','-'])
   self.assertEqual(hashlib.sha256(audio(old)).hexdigest(),hashlib.sha256(audio(R/v['path'])).hexdigest())
 def test_final_live_state_and_fresh_upload_proof(self):
  self.assertTrue(self.rev['verified']); self.assertEqual(self.rev['protected_before'],self.rev['protected_after'])
  m.assert_parent_preserved(self.rev['parents_before'],self.rev['parents_after'])
  for name,(ad_id,old_id) in u.TARGETS.items():
   r=self.rev['records'][name]; final=self.a['records'][name]
   self.assertTrue(r['verified']); self.assertEqual(r['before']['creative_id'],old_id)
   self.assertEqual(final['creative_id'],r['replacement_creative_id'])
   self.assertEqual(final['ad_readback']['id'],ad_id)
   self.assertEqual(final['ad_readback']['status'],'PAUSED'); self.assertEqual(final['ad_readback']['effective_status'],'PAUSED')
   u.invariant(r['creative_before'],r['creative_readback'])
   if 'LONG-VIDEO' in name:
    for label,p in r['video_copy_equivalence'].items():
     self.assertEqual(p['prior_video_id'],r['media'][label]); self.assertEqual(p['upload_id'],r['media'][label])
     self.assertTrue(p['ready'] and p['durations_identical'] and p['dimensions_identical'] and p['decoded_thumbnails_identical'])
     self.assertEqual(p['thumbnails'][0]['decoded_rgb_sha256'],p['thumbnails'][1]['decoded_rgb_sha256'])
     self.assertEqual(p['thumbnail_mean_absolute_difference_0_255'],0)
 def test_final_utm_exact_and_rejects_conflicts(self):
  from validate_austin_youth_final_utm import validate, DESTINATION
  for name in u.TARGETS:
   c=self.a['records'][name]['creative_readback']; validate(c)
   self.assertTrue(self.a['final_utm_acceptance'][name]['passed'])
   for url in [DESTINATION+'&utm_content=old',DESTINATION.replace('{{ad.name}}','%7B%7Bad.name%7D%7D'),DESTINATION.replace('{{ad.name}}','AY09'),DESTINATION.replace('utm_source=meta&',''),DESTINATION+'&fbclid=manual']:
    bad=copy.deepcopy(c); bad['asset_feed_spec']['link_urls'][0]['website_url']=url
    with self.assertRaises(AssertionError): validate(bad)
   bad=copy.deepcopy(c); bad['url_tags']='utm_source=other'
   with self.assertRaises(AssertionError): validate(bad)
 def test_parent_exception_rejects_geo_budget_or_expansion(self):
  before=self.rev['parents_before']; after=self.rev['parents_after']
  m.assert_parent_preserved(before,after)
  for edit in [lambda p:p['adset']['targeting']['geo_locations']['cities'][0].update(radius=11),lambda p:p['campaign'].update(daily_budget='1000'),lambda p:p['adset']['targeting']['targeting_relaxation_types'].update(custom_audience=1)]:
   bad=copy.deepcopy(after); edit(bad)
   with self.assertRaises(AssertionError): m.assert_parent_preserved(before,bad)
if __name__=='__main__': unittest.main()
